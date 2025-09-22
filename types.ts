export enum GamePhase {
  HOME = 'HOME',
  LOBBY = 'LOBBY',
  GAME = 'GAME',
  ROUND_RESULT = 'ROUND_RESULT',
  GAME_OVER = 'GAME_OVER',
}

export interface Player {
  id: string; // socket.id
  name: string;
  score: number;
  isHost: boolean;
}

export interface Vote {
  voterId: string;
  votedForId: string;
}

export interface GameState {
  gameCode: string;
  phase: GamePhase;
  players: Player[];
  shuffledQuestions: string[];
  currentQuestionIndex: number;
  votes: Vote[];
}
