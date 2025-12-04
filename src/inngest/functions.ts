import { openai, createAgent, createTool, createNetwork, type Tool, Message, createState } from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandBox, lastAssistantTextMessageContent } from "./utils";
import z from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { prisma } from "@/lib/db";

interface AgentState {
  summary: string,
  files: { [path: string]: string }
};


export const codeAgent = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const { sandBoxId, files } = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("silver-nextjs");

      // Find the latest fragment to hydrate the sandbox
      const lastFragment = await prisma.fragment.findFirst({
        where: {
          message: {
            projectId: event.data.projectId
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      let files: { [key: string]: string } = {};
      if (lastFragment && lastFragment.files) {
        files = lastFragment.files as { [key: string]: string };
        for (const [path, content] of Object.entries(files)) {
          await sandbox.files.write(path, content);
        }
      }

      return { sandBoxId: sandbox.sandboxId, files };
    });

    const previousMessages = await step.run("get-previous-messages", async () => {
      const formattedMessages: Message[] = [];

      const messages = await prisma.message.findMany({
        where: {
          projectId: event.data.projectId,

        },
        orderBy: {
          createdAt: "desc"
        }
      })
      for (const message of messages) {
        formattedMessages.push({
          type: "text",
          role: message.role === "ASSISTANT" ? "assistant" : "user",
          content: message.content,
        })
      }
      return formattedMessages;
    });

    const state = createState<AgentState>({
      summary: "",
      files: files,
    },
      { messages: previousMessages }
    )

    const silverCoder = createAgent<AgentState>({
      name: "silverCoder",
      description: "An expert coding agent",
      system: PROMPT,
      model: openai({
        model: "gpt-4.1",
        defaultParameters: {
          temperature: 0.1,
        }

      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run cammands",
          parameters: z.object({
            command: z.string(),

          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };

              try {
                const sandbox = await getSandBox(sandBoxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  }
                });
                return result.stdout;
              } catch (e) {
                console.error(
                  `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`
                );
                return `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`
              }
            })
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            )
          }),
          handler: async ({ files }, { step, network }: Tool.Options<AgentState>) => {
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try {
                const updatedFiles = network.state.data.files || {};
                const sandbox = await getSandBox(sandBoxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }

                return updatedFiles;
              } catch (e) {
                return "Error: " + e;
              }
            });


            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          }
        }),

        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandBox(sandBoxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }

                return JSON.stringify(contents);
              } catch (e) {
                return 'Error:' + e;
              }
            })
          }
        })
      ],

      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText = lastAssistantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }

          return result;
        },
      }
    });

    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [silverCoder],
      maxIter: 15,
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        if (summary) {
          return;
        }

        return silverCoder;
      }
    })

    const result = await network.run(event.data.value, { state })

    const fragmentTitleGenerator = createAgent({
      name: "fragment-generator",
      description: "A fragment title generator",
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: "gpt-4o",
      }),
    })

    const responseGenerator = createAgent({
      name: "response-generator",
      description: "A response generator",
      system: RESPONSE_PROMPT,
      model: openai({
        model: "gpt-4o",
      }),
    })

    const { output: fragmentTitle } = await fragmentTitleGenerator.run(result.state.data.summary);
    const { output: response } = await responseGenerator.run(result.state.data.summary);

    const generateFragmentTitle = () => {
      if (fragmentTitle[0].type !== "text") {
        return "Your Result";

      }

      if (Array.isArray(fragmentTitle[0].content)) {
        return fragmentTitle[0].content.map((txt) => txt).join("")
      } else {
        return fragmentTitle[0].content
      }


    }
    const generateResponse = () => {
      if (response[0].type !== "text") {
        return "your wish is my cammand...";

      }

      if (Array.isArray(response[0].content)) {
        return response[0].content.map((txt) => txt).join("")
      } else {
        return response[0].content
      }


    }

    const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandBox(sandBoxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    })

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again.",
            role: "ASSISTANT",
            type: "ERROR"
          }
        })
      }
      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: generateResponse(),
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: generateFragmentTitle(),
              files: result.state.data.files,
            }
          }

        }
      })
    })


    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  },
);