import { input } from "@inquirer/prompts";
import "dotenv/config";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatLoop = async (
  messages: ChatCompletionMessageParam[]
): Promise<string> => {
  const prompt = await input({
    message: `
q: quit

Message:`,
  });

  if (prompt === "q") {
    console.log("Goodbye 👋");
    process.exit(0);
  }

  const userMessage: ChatCompletionMessageParam = {
    role: "user",
    content: prompt,
  };

  const completion = await openai.chat.completions.create({
    messages: [...messages, userMessage],
    model: "gpt-4",
    stream: true,
  });

  const assistantMessage: ChatCompletionMessageParam = {
    role: "assistant",
    content: "",
  };

  process.stdout.write("\n");

  for await (const chunk of completion) {
    const content = chunk.choices[0]?.delta.content ?? "";
    assistantMessage.content += content;
    process.stdout.write(content);
  }

  process.stdout.write("\n\n");

  return chatLoop([...messages, userMessage, assistantMessage]);
};

const systemPrompt = `You are an AI programming assistant. Follow the user's requirements carefully and 
    to the letter. First, think step-by-step and describe your plan for what to build in pseudocode, 
    written out in great detail. Then, output the code in a single code block. Minimize any other prose.`;

await chatLoop([{ role: "system", content: systemPrompt }]);
