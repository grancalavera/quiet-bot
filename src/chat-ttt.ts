import { select } from "@inquirer/prompts";
import "dotenv/config";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";
import {
  Game,
  Play,
  Player,
  Position,
  availablePositions,
  createGame,
  findWinner,
  nextPlayer,
  playMove,
  printGameProgress,
  printWinningCombo,
} from "./ttt.js";
import assert from "assert";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
You are a tic tac toe assistant. You are playing agaist an user and you both take turns
placing an X or O on the board. The board is represented by a 3x3 grid, each empty cell 
in the grid has a number from 1 to 9 associated with it:

 1 2 3 
 4 5 6
 7 8 9

The user plays X and the assistnt plays O.

The objective of the game is to place three of your marks in a horizontal, vertical, or diagonal row.

You (assistant) must try to win the game by placing three of your marks in a horizontal, vertical, or diagonal row.

To place an X on the board, the user player types the number of the cell they want to play in.

For example, if the user wants to play in the top left corner, they would type 1, then the
board would look like this:
 
 X 2 3 
 4 5 6
 7 8 9

The assistant can now play on any of the remaining cells: 2, 3, 4, 5, 6, 7, 8, or 9.

If the assistant wants to play in the center, it would type 5, and the board would look like this:

 X 2 3
 4 O 6
 7 8 9

If a move has been played in a cell, the number representing such cell cannot be typed again. For 
example, I the game representeda above, neither the user nor the assistant can play 1 or 5 again.

If the user will be able to play three of their marks in a horizontal, vertical, or diagonal row, the
assistant must try to block the user from doing so. If the assistant will be able to play three of their.

For example, if is the assistant's turn and the board looks like this:

 X X 3
 4 O 6
 7 8 9

The assistant may play in cell 3 to prevent the user from winning the game:

 X X O
 4 O 6
 7 8 9

If the assistant has the opportunity to win the game, it must do so. For example, if is the assistant's
turn and the board looks like this:

 X X O
 4 O X
 7 8 9

Then the assistant may play in cell 7 to win the game:

 X X O
 4 O X
 O 8 9

You can only reply with a number between 1 and 9. 

Don't use any words or punctuation, just the number of the cell you want to play in.
`;

const initialMessages: ChatCompletionMessageParam[] = [
  { role: "system", content: systemPrompt },
];

const playHuman = async (
  player: Player,
  positions: Position[]
): Promise<[Position, ChatCompletionMessageParam]> => {
  const position = await select({
    message: `Select a position for ${player}`,
    choices: positions.map((position) => ({
      name: position.toString(),
      value: position,
    })),
  });
  return [position, { role: "user", content: position.toString() }];
};

function assertIsPosition(candidate: number): asserts candidate is Position {
  assert(candidate >= 1 && candidate <= 9, `Invalid position: ${candidate}`);
}

const playAI = async (
  player: Player,
  messages: ChatCompletionMessageParam[]
): Promise<[Position, ChatCompletionMessageParam]> => {
  console.log(`Waiting for AI to play as ${player}...`);

  const completion = await openai.chat.completions.create({
    messages,
    model: "gpt-4",
    temperature: 1,
  });

  const rawPosition = completion.choices[0]?.message.content ?? "";

  const position = parseInt(rawPosition, 10);
  assertIsPosition(position);

  console.log(`AI played ${position}`);

  return [position, { role: "assistant", content: rawPosition }];
};

const gameLoop = async (
  game: Game,
  messages: ChatCompletionMessageParam[]
): Promise<void> => {
  const [, ...gameMessages] = messages;
  console.log(
    gameMessages
      .map((message) => `${(message.role + ":").padEnd(10)} ${message.content}`)
      .join("\n")
  );

  const winner = findWinner(game);

  if (winner) {
    console.log(printWinningCombo(winner));
    console.log(winner[0] === "X" ? "Human wins!" : "AI wins!");
    return gameOver();
  }

  const positions = availablePositions(game);

  if (positions.length === 0) {
    console.log("It's a tie!");
    return gameOver();
  }

  console.log(printGameProgress(game));

  const player = nextPlayer(game);

  const [position, message] = await (player === "X"
    ? playHuman(player, positions)
    : playAI(player, messages));

  const play: Play = [player, position];

  return gameLoop(playMove(game, play), [...messages, message]);
};

const gameOver = async (): Promise<void> => {
  const playAgain = await select({
    message: "Play again?",
    choices: [
      { name: "Yes", value: true },
      { name: "No", value: false },
    ],
  });

  if (playAgain) {
    return gameLoop(createGame(), initialMessages);
  }

  console.log("Goodbye 👋");
  process.exit(0);
};

gameLoop(createGame(), initialMessages);
