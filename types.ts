export interface Question {
  id: string;
  text: string;
  image?: string;
  options: string[];
  correctIndex: number;
}

export interface GameSettings {
  team1Name: string;
  team2Name: string;
  timePerQuestion: number; // in seconds
  questions: Question[];
}

export type GamePhase = 'setup' | 'playing' | 'victory';
export type RoundPhase = 'answering' | 'revealed';

export interface GameState {
  currentQuestionIndex: number;
  team1Score: number;
  team2Score: number;
  timeLeft: number;
  team1Selection: number | null; // index of selected option
  team2Selection: number | null; // index of selected option
  roundPhase: RoundPhase;
}
