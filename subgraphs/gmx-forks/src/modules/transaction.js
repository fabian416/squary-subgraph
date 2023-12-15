"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transaction = void 0;
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const enums_1 = require("../sdk/protocols/perpfutures/enums");
function transaction(event, accountAddress, tokenAddress, vaultTVL, outputTokenSupply, mintAmount, transactionType, amount = constants.BIGINT_ZERO) {
    const sdk = (0, initializers_1.initializeSDK)(event);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    const account = (0, initializers_1.getOrCreateAccount)(accountAddress, pool, sdk);
    const token = sdk.Tokens.getOrCreateToken(tokenAddress);
    if (transactionType === enums_1.TransactionType.DEPOSIT) {
        utils.checkAndUpdateInputTokens(pool, token, amount);
    }
    if (transactionType === enums_1.TransactionType.WITHDRAW) {
        utils.checkAndUpdateInputTokens(pool, token);
    }
    const poolInputTokens = pool.getInputTokens();
    const idx = pool.getInputTokens().indexOf(token.id);
    const amountsArray = new Array(poolInputTokens.length).fill(constants.BIGINT_ZERO);
    amountsArray[idx] = amount;
    pool.setTotalValueLocked(utils.bigIntToBigDecimal(vaultTVL, constants.DEFAULT_DECIMALS));
    pool.setOutputTokenSupply(outputTokenSupply);
    pool.setStakedOutputTokenAmount(outputTokenSupply);
    if (transactionType === enums_1.TransactionType.DEPOSIT) {
        account.deposit(pool, amountsArray, mintAmount, true);
    }
    if (transactionType === enums_1.TransactionType.WITHDRAW) {
        account.withdraw(pool, amountsArray, mintAmount, true);
    }
}
exports.transaction = transaction;
