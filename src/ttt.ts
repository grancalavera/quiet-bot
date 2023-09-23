import chalk from "chalk";

export type Board<T> = [T, T, T, T, T, T, T, T, T];
export type Player = "X" | "O";
export type Move = Player | " ";
export type Position = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Play = [Player, Position];

type Winner = [Player, Combo];
type Combo = [number, number, number];
type RawBoard = Board<string>;

export type Game = {
  board: Board<Move>;
  movesPlayed: number;
};

export const createGame = (): Game => ({
  board: blankBoard,
  movesPlayed: 0,
});

export const availablePositions = (game: Game): Position[] =>
  game.board.reduce((acc, move, index) => {
    if (move === " ") {
      acc.push((index + 1) as Position);
    }
    return acc;
  }, [] as Position[]);

export const nextPlayer = (game: Game): Player =>
  game.movesPlayed % 2 === 0 ? "X" : "O";

export const printGameProgress = (game: Game): string => {
  const board: RawBoard = game.board.map((move, index) => {
    return move === " " ? (index + 1).toString() : move;
  }) as RawBoard;
  return printBoard(board);
};

export const printWinningCombo = ([player, combo]: Winner): string => {
  const board = blankBoard.map((_, index) =>
    combo.includes(index) ? player : " "
  ) as RawBoard;
  return printBoard(board);
};

export const playMove = (game: Game, play: Play): Game => {
  const [player, position] = play;
  const board = game.board.map((value, index) =>
    index + 1 === position ? player : value
  ) as Board<Move>;
  return { board, movesPlayed: game.movesPlayed + 1 };
};

const printBoard = (board: RawBoard): string => {
  const c = cell(board);
  return `

  ${c(1)} │ ${c(2)} │ ${c(3)}  
 ───┼───┼───
  ${c(4)} │ ${c(5)} │ ${c(6)}  
 ───┼───┼───
  ${c(7)} │ ${c(8)} │ ${c(9)}

`;
};

const isPlayer = (candidate: string): candidate is Player =>
  candidate === "X" || candidate === "O";

const cell =
  (board: RawBoard) =>
  (position: Position): string => {
    const value = board[position - 1] ?? " ";
    return isPlayer(value) ? value : chalk.grey(value);
  };

const blankBoard: Board<" "> = [" ", " ", " ", " ", " ", " ", " ", " ", " "];

const winnnigCombos: Combo[] = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // middle column
  [2, 5, 8], // right column
  [0, 4, 8], // top left to bottom right diagonal
  [2, 4, 6], // top right to bottom left diagonal
];

export const findWinner = (game: Game): [Player, Combo] | null => {
  const { board } = game;

  for (const combo of winnnigCombos) {
    const [a, b, c] = combo;
    const player = board[a];
    if (
      player !== undefined &&
      player !== " " &&
      player === board[b] &&
      player === board[c]
    ) {
      return [player, combo];
    }
  }

  return null;
};
