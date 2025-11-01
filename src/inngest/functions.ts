import {   openai, createAgent } from "@inngest/agent-kit";
import { inngest } from "./client";


export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "event/helloWorld" },
  async ({ event }) => {
    const summarizer = createAgent({
      name: "summarizer",
      system: "You are an expert summarizer.  You summarize in two words",
      model: openai({ model: "gpt-4o",}),
    });

    const {output } = await summarizer.run(
      `Summarize the following text: ${event.data.value}`  
    )
    console.log(output);
    
    
    return { output };
  },
);