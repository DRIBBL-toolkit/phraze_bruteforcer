import words from '../board.json';
import { nextIndex } from '../config.json';
import { ethers } from 'ethers';
import 'dotenv/config';
import { checkSideQuest, getAuthToken, getClueById, getPuzzle } from './api';
import { promises as fs } from 'fs';

const MS_TO_SECONDS = 1000;
const MESSAGE = 'Welcome back to PhrazeBoard, valued participant!';
const CLUE_ID = 10;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const randomNumberBetween = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

console.log(process.env.PRIVATE_KEY);
(async () => {
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
  const clue = await getClueById(puzzle, CLUE_ID);
  const UUID = clue.uuid;
  console.log(UUID);
  for (let i = nextIndex; i < words.length; i++) {
    const word = words[i].toLocaleLowerCase();
    const guessIsCorrect = await checkSideQuest(authToken, 'blue', UUID, word);
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
})();
