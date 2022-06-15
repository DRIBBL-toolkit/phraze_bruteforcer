import words from '../board.json';
import { nextIndex } from '../config.json';
import { ethers, Wallet } from 'ethers';
import 'dotenv/config';
import {
  checkGuess,
  checkSideQuest,
  getAuthToken,
  getClueById,
  getPuzzle,
} from './api';
import { promises as fs } from 'fs';

const MS_TO_SECONDS = 1000;
const MESSAGE = 'Welcome back to PhrazeBoard, valued participant!';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const randomNumberBetween = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

console.log(process.env.PRIVATE_KEY);

const oneAccountMode = async ({ BOARD_TYPE, CLUE_ID }: questParams) => {
  if (!process.env.PRIVATE_KEY) return;
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  const signature = await wallet.signMessage(MESSAGE);
  const body = {
    address: wallet.address,
    message: MESSAGE,
    signature,
  };

  const authToken = await getAuthToken(body);
  const puzzle = await getPuzzle(authToken);
  const clue = await getClueById(puzzle, CLUE_ID, BOARD_TYPE);
  const UUID = clue.uuid;
  console.log(UUID);
  for (let i = nextIndex; i < words.length; i++) {
    const word = words[i].toLocaleLowerCase();
    const guessIsCorrect = await checkSideQuest(
      authToken,
      BOARD_TYPE,
      UUID,
      word
    );
    console.log(word, guessIsCorrect);
    if (guessIsCorrect) {
      console.log(`${word} is correct!`);
      await fs.writeFile(
        './answer.json',
        JSON.stringify({ nextIndex: i + 1, answer: word }, null, 2),
        'utf8'
      );
      break;
    }
    if (i % 50 === 0) {
      await fs.writeFile(
        './backup.json',
        JSON.stringify({ nextIndex: i + 1 }, null, 2),
        'utf8'
      );
      console.log(`Waiting 6-19 seconds, ${i + 1} words done...`);
      await sleep(randomNumberBetween(6, 19) * MS_TO_SECONDS);
    }
    await fs.writeFile(
      'config.json',
      JSON.stringify({ nextIndex: i + 1 }, null, 2),
      'utf8'
    );
    await sleep(randomNumberBetween(1, 5) * MS_TO_SECONDS);
  }
};

type questParams = {
  BOARD_TYPE: 'blue' | 'red';
  CLUE_ID: number;
  sideQuestAnswer?: string;
};

const mainQuest = async ({
  BOARD_TYPE,
  CLUE_ID,
  sideQuestAnswer,
}: questParams) => {
  let wallet = Wallet.createRandom();
  let authToken = await getAuthToken(await getSignatureBody(wallet));
  const puzzle = await getPuzzle(authToken);
  const clue = await getClueById(puzzle, CLUE_ID, BOARD_TYPE);
  const UUID = clue.uuid;
  console.log(UUID);
  let guessesLeft = 0;
  for (let i = nextIndex; i < words.length; i++) {
    const word = words[i].toLocaleLowerCase();

    if (guessesLeft <= 0) {
      wallet = Wallet.createRandom();
      authToken = await getAuthToken(await getSignatureBody(wallet));
      if (sideQuestAnswer)
        await checkSideQuest(authToken, BOARD_TYPE, UUID, sideQuestAnswer);
    }

    const { correct: guessIsCorrect, guessesLeft: left } = await checkGuess(
      authToken,
      BOARD_TYPE,
      UUID,
      word
    );
    guessesLeft = left;
    console.log(word, guessIsCorrect);
    if (guessIsCorrect) {
      console.log(`${word} is correct!`);
      await fs.writeFile(
        './answer.json',
        JSON.stringify(
          { nextIndex: i + 1, answer: word, privateKey: wallet.privateKey },
          null,
          2
        ),
        'utf8'
      );
      break;
    }
    if (i % 50 === 0) {
      await fs.writeFile(
        './backup.json',
        JSON.stringify({ nextIndex: i + 1 }, null, 2),
        'utf8'
      );
      console.log(`Waiting 6-19 seconds, ${i + 1} words done...`);
      await sleep(randomNumberBetween(6, 19) * MS_TO_SECONDS);
    }
    await fs.writeFile(
      'config.json',
      JSON.stringify({ nextIndex: i + 1 }, null, 2),
      'utf8'
    );
    await sleep(randomNumberBetween(1, 5) * MS_TO_SECONDS);
  }
};

const getSignatureBody = async (wallet: Wallet) => {
  const signature = await wallet.signMessage(MESSAGE);
  return {
    address: wallet.address,
    message: MESSAGE,
    signature,
  };
};

const settings: questParams = {
  BOARD_TYPE: 'red',
  CLUE_ID: 12,
  sideQuestAnswer: '1725',
};

mainQuest(settings);
// oneAccountMode(settings);
