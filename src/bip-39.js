"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var bip_39_json_1 = require("./bip-39.json");
var config_json_1 = require("../config.json");
var ethers_1 = require("ethers");
require("dotenv/config");
var api_1 = require("./api");
var fs_1 = require("fs");
var MS_TO_SECONDS = 1000;
var MESSAGE = 'Welcome back to PhrazeBoard, valued participant!';
var CLUE_ID = 10;
var sleep = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
var randomNumberBetween = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
console.log(process.env.PRIVATE_KEY);
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var wallet, signature, body, authToken, puzzle, clue, UUID, i, bipWord, guessIsCorrect;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!process.env.PRIVATE_KEY)
                    return [2 /*return*/];
                wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY);
                return [4 /*yield*/, wallet.signMessage(MESSAGE)];
            case 1:
                signature = _a.sent();
                body = {
                    address: wallet.address,
                    message: MESSAGE,
                    signature: signature
                };
                return [4 /*yield*/, (0, api_1.getAuthToken)(body)];
            case 2:
                authToken = _a.sent();
                return [4 /*yield*/, (0, api_1.getPuzzle)(authToken)];
            case 3:
                puzzle = _a.sent();
                return [4 /*yield*/, (0, api_1.getClueById)(puzzle, CLUE_ID)];
            case 4:
                clue = _a.sent();
                UUID = clue.uuid;
                i = config_json_1.nextIndex;
                _a.label = 5;
            case 5:
                if (!(i < bip_39_json_1["default"].length)) return [3 /*break*/, 15];
                bipWord = bip_39_json_1["default"][i].toLocaleLowerCase();
                return [4 /*yield*/, (0, api_1.checkSideQuest)(authToken, 'blue', UUID, bipWord)];
            case 6:
                guessIsCorrect = _a.sent();
                console.log(bipWord, guessIsCorrect);
                if (!guessIsCorrect) return [3 /*break*/, 8];
                console.log("".concat(bipWord, " is correct!"));
                return [4 /*yield*/, fs_1.promises.writeFile('./answer.json', JSON.stringify({ nextIndex: i + 1, answer: bipWord }, null, 2), 'utf8')];
            case 7:
                _a.sent();
                return [3 /*break*/, 15];
            case 8:
                if (!(i % 50 === 0)) return [3 /*break*/, 11];
                return [4 /*yield*/, fs_1.promises.writeFile('./backup.json', JSON.stringify({ nextIndex: i + 1 }, null, 2), 'utf8')];
            case 9:
                _a.sent();
                console.log("Waiting 5-15 seconds, ".concat(i + 1, " words done..."));
                return [4 /*yield*/, sleep(randomNumberBetween(6, 19) * MS_TO_SECONDS)];
            case 10:
                _a.sent();
                _a.label = 11;
            case 11: return [4 /*yield*/, fs_1.promises.writeFile('config.json', JSON.stringify({ nextIndex: i + 1 }, null, 2), 'utf8')];
            case 12:
                _a.sent();
                return [4 /*yield*/, sleep(randomNumberBetween(1, 5) * MS_TO_SECONDS)];
            case 13:
                _a.sent();
                _a.label = 14;
            case 14:
                i++;
                return [3 /*break*/, 5];
            case 15: return [2 /*return*/];
        }
    });
}); })();
