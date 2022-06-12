"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSideQuest = exports.checkGuess = exports.getClueById = exports.getPuzzle = exports.getAuthToken = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const API_BASE_URL = 'https://hidden-sierra-71371.herokuapp.com/api/v1';
const getTimestamp = () => Math.floor(Date.now() / 1000);
const getAuthToken = async (body) => {
    const response = await axios_1.default.post(`${API_BASE_URL}/auth/sign/?t=${getTimestamp()}`, body);
    return response.data.auth_token;
};
exports.getAuthToken = getAuthToken;
const getPuzzle = async (token) => {
    const request = await axios_1.default.get(`${API_BASE_URL}/puzzles/?t=${getTimestamp()}`, {
        headers: { authorization: `Bearer ${token}` },
    });
    return request.data;
};
exports.getPuzzle = getPuzzle;
const getClueById = async (puzzle, id) => {
    return puzzle.puzzles[0].clues[id - 1];
};
exports.getClueById = getClueById;
const checkGuess = async (token, board, clueUUID, guess) => {
    const bodyFormData = new form_data_1.default();
    bodyFormData.append('type', 'guess');
    bodyFormData.append('guess', guess);
    bodyFormData.append('slug', board);
    bodyFormData.append('clue', clueUUID);
    const request = await axios_1.default.post(`${API_BASE_URL}/puzzles/guess?t=${getTimestamp()}`, bodyFormData, {
        headers: {
            authorization: `Bearer ${token}`,
        },
    });
    const guessObject = request.data[0].clues.find(({ uuid }) => uuid === clueUUID);
    return {
        correct: guessObject?.guess?.correct || false,
        guessesLeft: guessObject?.guesses_remaining_today || 0,
    };
};
exports.checkGuess = checkGuess;
const checkSideQuest = async (token, board, clueUUID, guess) => {
    const bodyFormData = new form_data_1.default();
    bodyFormData.append('type', 'checkpoint-guess');
    bodyFormData.append('guess', guess);
    bodyFormData.append('slug', board);
    bodyFormData.append('clue', clueUUID);
    const request = await axios_1.default.post(`${API_BASE_URL}/puzzles/guess?t=${getTimestamp()}`, bodyFormData, {
        headers: {
            authorization: `Bearer ${token}`,
        },
    });
    const guessObject = request.data[0].clues.find(({ uuid }) => uuid === clueUUID);
    if (guessObject)
        if (guessObject.checkpoint_guess)
            if (guessObject.checkpoint_guess.checkpoint_correct)
                return true;
    return false;
};
exports.checkSideQuest = checkSideQuest;
