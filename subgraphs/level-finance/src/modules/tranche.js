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
exports.updateTranche = void 0;
const utils = __importStar(require("../common/utils"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
const enums_1 = require("../sdk/protocols/perpfutures/enums");
function updateTranche(trancheAddress, transactionType, inputToken, amount) {
    if (!inputToken.lastPriceUSD)
        return;
    if (!trancheAddress)
        return;
    const tranche = (0, initializers_1.getOrCreateTranche)(graph_ts_1.Address.fromHexString(trancheAddress.toHexString()));
    const amountUSD = utils
        .bigIntToBigDecimal(amount, inputToken.decimals)
        .times(inputToken.lastPriceUSD);
    if (transactionType == enums_1.TransactionType.DEPOSIT) {
        tranche.tvl = tranche.tvl.plus(amountUSD);
    }
    if (transactionType == enums_1.TransactionType.WITHDRAW) {
        tranche.tvl = tranche.tvl.minus(amountUSD);
    }
    tranche.totalSupply = utils.getLpTokenSupply(trancheAddress);
    tranche.save();
}
exports.updateTranche = updateTranche;
