import { input } from "@inquirer/prompts";
import "dotenv/config";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const quitSignal = "q";

type Move = "X" | "O" | " ";
type Board = [Move, Move, Move, Move, Move, Move, Move, Move, Move];
const blankBoard: Board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
const xOnlyBoard: Board = ["X", "X", "X", "X", "X", "X", "X", "X", "X"];

const printBoard = ([_1, _2, _3, _4, _5, _6, _7, _8, _9]: [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
]): string => {
  return `
  ${_1} │ ${_2} │ ${_3}  
 ───┼───┼───
  ${_4} │ ${_5} │ ${_6}  
 ───┼───┼───
  ${_7} │ ${_8} │ ${_9}

 `;
};

const playMove = (board: Board, move: Move, cell: number): Board =>
  board.map((value, index) =>
    index + 1 === cell ? (value = move) : (value = value)
  ) as Board;

const chatLoop = async (
  messages: ChatCompletionMessageParam[]
): Promise<string> => {
  const prompt = await input({
    message: `
${quitSignal}: quit

Message:`,
  });

  if (prompt === quitSignal) {
    console.log("\nGoodbye 👋");
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
    temperature: 0,
  });

  const assistantMessage: ChatCompletionMessageParam = {
    role: "assistant",
    content: "",
  };

  process.stdout.write("\n");

  for await (const chunk of completion) {
    const content = chunk.choices[0]?.delta.content ?? "";
    assistantMessage.content += content;
  }

  let move = parseInt(assistantMessage.content ?? "");

  process.stdout.write("\n\n");

  return chatLoop([...messages, userMessage, assistantMessage]);
};

const systemPrompt = `You are an expert tic tac toe player. You are playing agaist a human and you both take turns
placing an X or O on the board. The first player to get three in a row wins. The game ends in a tie if
there are no more moves left. The human player goes first. The human player is X and the AI is O.

The grid is nubmered like this:

  1 │ 2 │ 3 
 ───┼───┼───
  4 │ 5 │ 6 
 ───┼───┼───
  7 │ 8 │ 9 
  
If you want to play a move, you just need to spedify the number of the cell you want to play in. 
For example if the human player wants to play in the top left corner, they would type 1, then the 
board would look like this:

  X │   │  
 ───┼───┼───
    │   │  
 ───┼───┼───
    │   │ 
    
The AI would then play a move, for example in the center, by typing 5:

  X │   │  
 ───┼───┼───
    │ O │  
 ───┼───┼───
    │   │ 

If a move has been played in a cell, you cannot play there again. For example, you neither 
the human or the AI can play 1 nor 5 again.

You can only reply with a number between 1 and 9. 

Don't use any words or punctuation, just the number of the cell you want to play in.
`;

// console.log(`System prompt: ${systemPrompt}\n`);
// await chatLoop([{ role: "system", content: systemPrompt }]);
console.log(printBoard(blankBoard));
