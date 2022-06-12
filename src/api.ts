import axios from 'axios';
import FormData from 'form-data';
import { Phraze, Puzzle } from '../types';

const API_BASE_URL = 'https://hidden-sierra-71371.herokuapp.com/api/v1';

type body = {
  address: string;
  message: string;
  signature: string;
};

const getTimestamp = () => Math.floor(Date.now() / 1000);

const getAuthToken = async (body: body) => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/sign/?t=${getTimestamp()}`,
    body
  );

  return response.data.auth_token;
};

const getPuzzle = async (token: string) => {
  const request = await axios.get<Phraze>(
    `${API_BASE_URL}/puzzles/?t=${getTimestamp()}`,
    {
      headers: { authorization: `Bearer ${token}` },
    }
  );
  return request.data;
};

const getClueById = async (puzzle: Phraze, id: number) => {
  return puzzle.puzzles[0].clues[id - 1];
};

const checkGuess = async (
  token: string,
  board: string,
  clueUUID: string,
  guess: string
) => {
  const bodyFormData = new FormData();
  bodyFormData.append('type', 'guess');
  bodyFormData.append('guess', guess);
  bodyFormData.append('slug', board);
  bodyFormData.append('clue', clueUUID);

  const request = await axios.post<Puzzle[]>(
    `${API_BASE_URL}/puzzles/guess?t=${getTimestamp()}`,
    bodyFormData,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );

  const guessObject = request.data[0].clues.find(
    ({ uuid }: { uuid: string }) => uuid === clueUUID
  );

  return {
    correct: guessObject?.guess?.correct || false,
    guessesLeft: guessObject?.guesses_remaining_today || 0,
  };
};

const checkSideQuest = async (
  token: string,
  board: string,
  clueUUID: string,
  guess: string
) => {
  const bodyFormData = new FormData();
  bodyFormData.append('type', 'checkpoint-guess');
  bodyFormData.append('guess', guess);
  bodyFormData.append('slug', board);
  bodyFormData.append('clue', clueUUID);

  const request = await axios.post<Puzzle[]>(
    `${API_BASE_URL}/puzzles/guess?t=${getTimestamp()}`,
    bodyFormData,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );

  const guessObject = request.data[0].clues.find(
    ({ uuid }: { uuid: string }) => uuid === clueUUID
  );

  if (guessObject)
    if (guessObject.checkpoint_guess)
      if (guessObject.checkpoint_guess.checkpoint_correct) return true;
  return false;
};

export { getAuthToken, getPuzzle, getClueById, checkGuess, checkSideQuest };
