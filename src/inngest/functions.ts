import {   openai, createAgent } from "@inngest/agent-kit";
import { inngest } from "./client";
import {Sandbox} from "@e2b/code-interpreter";
import { getSandBox } from "./utils";


export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "event/helloWorld" },
  async ({ event, step }) => {
    const sandBoxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("silver-nextjs");
      return sandbox.sandboxId;
    })
    const summarizer = createAgent({
      name: "summarizer",
      system: "You are an expert summarizer.  You summarize in two words",
      model: openai({ model: "gpt-4o",}),
    });

    const {output } = await summarizer.run(
      `Summarize the following text: ${event.data.value}`  
    )
    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandBox(sandBoxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    })
    
    
    return { output, sandboxUrl };
  },
);