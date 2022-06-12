"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const combos_json_1 = __importDefault(require("./combos.json"));
const config_json_1 = require("../config.json");
const ethers_1 = require("ethers");
require("dotenv/config");
const api_1 = require("./api");
const fs_1 = require("fs");
const MS_TO_SECONDS = 1000;
const MESSAGE = 'Welcome back to PhrazeBoard, valued participant!';
const CLUE_ID = 7;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomNumberBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
console.log(process.env.PRIVATE_KEY);
(async () => {
    if (!process.env.PRIVATE_KEY)
        return;
    const wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY);
    const signature = await wallet.signMessage(MESSAGE);
    const body = {
        address: wallet.address,
        message: MESSAGE,
        signature,
    };
    const authToken = await (0, api_1.getAuthToken)(body);
    const puzzle = await (0, api_1.getPuzzle)(authToken);
    const clue = await (0, api_1.getClueById)(puzzle, CLUE_ID);
    const UUID = clue.uuid;
    for (let i = config_json_1.nextIndex; i < combos_json_1.default.length; i++) {
        const combination = combos_json_1.default[i].toLocaleLowerCase();
        const guessIsCorrect = await (0, api_1.checkSideQuest)(authToken, 'blue', UUID, combination);
        console.log(combination, guessIsCorrect);
        if (guessIsCorrect) {
            console.log(`${combination} is correct!`);
            await fs_1.promises.writeFile('./answer.json', JSON.stringify({ nextIndex: i + 1, answer: combination }, null, 2), 'utf8');
            break;
        }
        if (i % 50 === 0) {
            await fs_1.promises.writeFile('./backup.json', JSON.stringify({ nextIndex: i + 1 }, null, 2), 'utf8');
            console.log(`Waiting 5-15 seconds, ${i + 1} combos done...`);
            await sleep(randomNumberBetween(6, 19) * MS_TO_SECONDS);
        }
        await fs_1.promises.writeFile('config.json', JSON.stringify({ nextIndex: i + 1 }, null, 2), 'utf8');
        await sleep(randomNumberBetween(1, 5) * MS_TO_SECONDS);
    }
})();
