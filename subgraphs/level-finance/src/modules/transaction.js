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
const tranche_1 = require("./tranche");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const initializers_1 = require("../common/initializers");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Pool_1 = require("../../generated/Pool/Pool");
const enums_1 = require("../sdk/protocols/perpfutures/enums");
function transaction(accountAddress, tokenAddress, trancheAddress, mintAmount, transactionType, sdk, pool, amount = constants.BIGINT_ZERO) {
    const account = (0, initializers_1.getOrCreateAccount)(accountAddress, pool, sdk);
    const token = sdk.Tokens.getOrCreateToken(tokenAddress);
    if (!token._isWhitelisted)
        return;
    if (transactionType === enums_1.TransactionType.DEPOSIT) {
        utils.checkAndUpdateInputTokens(pool, token, amount);
    }
    if (transactionType === enums_1.TransactionType.WITHDRAW) {
        utils.checkAndUpdateInputTokens(pool, token);
    }
    const poolInputTokens = pool.getInputTokens();
    const idx = pool.getInputTokens().indexOf(token.id);
    const inputTokenBalances = pool.pool.inputTokenBalances;
    const network = graph_ts_1.dataSource.network();
    const poolContract = Pool_1.Pool.bind(graph_ts_1.Address.fromBytes(pool.getBytesID()));
    if (utils.equalsIgnoreCase(network, constants.Network.ARBITRUM_ONE)) {
        const tokenBalance = utils.readValue(poolContract.try_poolBalances(graph_ts_1.Address.fromBytes(token.id)), constants.BIGINT_ZERO);
        inputTokenBalances[idx] = tokenBalance;
    }
    else {
        const poolTokenResult = poolContract.try_poolTokens(graph_ts_1.Address.fromBytes(token.id));
        if (!poolTokenResult.reverted) {
            let tokenBalance = poolTokenResult.value.getPoolBalance();
            if (!tokenBalance) {
                tokenBalance = constants.BIGINT_ZERO;
            }
            inputTokenBalances[idx] = tokenBalance;
        }
    }
    const amountsArray = new Array(poolInputTokens.length).fill(constants.BIGINT_ZERO);
    amountsArray[idx] = amount;
    pool.setInputTokenBalances(inputTokenBalances, true);
    if (transactionType === enums_1.TransactionType.DEPOSIT) {
        account.deposit(pool, amountsArray, mintAmount, true);
    }
    if (transactionType === enums_1.TransactionType.WITHDRAW) {
        account.withdraw(pool, amountsArray, mintAmount, true);
    }
    (0, tranche_1.updateTranche)(trancheAddress, transactionType, token, amount);
    pool.addTranche(graph_ts_1.Bytes.fromHexString(trancheAddress.toHexString()));
    const outputTokenSupply = utils.getOutputTokenSupply(pool);
    pool.setOutputTokenSupply(outputTokenSupply);
}
exports.transaction = transaction;
