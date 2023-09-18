import "dotenv/config";
import {
  Game,
  Play,
  availablePositions,
  createGame,
  findWinner,
  nextPlayer,
  playMove,
  printGameProgress,
  printWinningCombo,
} from "./ttt.js";

import { select } from "@inquirer/prompts";

const gameLoop = async (game: Game): Promise<void> => {
  const winner = findWinner(game);

  if (winner) {
    console.log(printWinningCombo(winner));
    console.log(`Winner is ${winner[0]}`);

    const playAgain = await select({
      message: "Play again?",
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
    });

    if (playAgain) {
      return gameLoop(createGame());
    } else {
      console.log("Goodbye 👋");
      process.exit(0);
    }
  }

  const player = nextPlayer(game);
  const positions = availablePositions(game);

  console.log(printGameProgress(game));

  const position = await select({
    message: `Select a position for ${player}`,
    choices: positions.map((position) => ({
      name: position.toString(),
      value: position,
    })),
  });

  const play: Play = [player, position];

  return gameLoop(playMove(game, play));
};

await gameLoop(createGame());
