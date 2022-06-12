export interface Phraze {
  puzzles: Puzzle[];
}

export interface Puzzle {
  uuid: string;
  clues: Clue[];
  game: Game;
  slug: string;
  u: string;
}

export interface Clue {
  uuid: string;
  checkpoint: null | string;
  checkpoint_guess: Guess | null;
  description: null | string;
  discovered: boolean;
  first_user_correct: string;
  guess: Guess | null;
  guesses_remaining_today: number;
  image_name: null | string;
  locked: boolean;
  public_at: string;
  unlock_time: null;
}

export interface Guess {
  answer: null | string;
  checkpoint_answer: null | string;
  checkpoint_correct: boolean;
  correct: boolean;
}

export interface Game {
  uuid: string;
  allow_list_mint_price: number;
  burnable: boolean;
  mint_price: number;
  name: string;
  prize: string;
  slug: string;
  state: string;
}
