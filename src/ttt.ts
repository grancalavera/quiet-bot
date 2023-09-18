export type Board<T> = [T, T, T, T, T, T, T, T, T];
export type Player = "X" | "O";
export type Move = Player | " ";
export type Position = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Play = [Player, Position];
type Winner = [Player, Combo];
type Combo = [number, number, number];

export type Game = {
  board: Board<Move>;
  plays: Play[];
};

export const createGame = (): Game => ({
  board: [" ", " ", " ", " ", " ", " ", " ", " ", " "],
  plays: [],
});

export const availablePositions = (game: Game): Position[] =>
  game.board.reduce((acc, move, index) => {
    if (move === " ") {
      acc.push((index + 1) as Position);
    }
    return acc;
  }, [] as Position[]);

export const nextPlayer = (game: Game): Player =>
  game.plays.length % 2 === 0 ? "X" : "O";

export const printGameProgress = (game: Game): string => {
  const board: RawBoard = game.board.map((move, index) => {
    return move === " " ? (index + 1).toString() : move;
  }) as RawBoard;
  return printBoard(board);
};

export const printWinningCombo = ([player, combo]: Winner): string => {
  const board = blankBoard.map((_, index) =>
    combo.includes(index) ? player : " "
  ) as Board<string>;
  return printBoard(board);
};

export const playMove = (game: Game, play: Play): Game => {
  const [player, position] = play;
  const board = game.board.map((value, index) =>
    index + 1 === position ? player : value
  ) as Board<Move>;
  const plays = [...game.plays, play];
  return { board, plays };
};

type RawBoard = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
];

const printBoard = ([_1, _2, _3, _4, _5, _6, _7, _8, _9]: RawBoard): string => `

  ${_1} │ ${_2} │ ${_3}  
 ───┼───┼───
  ${_4} │ ${_5} │ ${_6}  
 ───┼───┼───
  ${_7} │ ${_8} │ ${_9}

`;

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
