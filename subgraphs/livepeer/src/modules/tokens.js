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
exports.getTotalRewardTokens = exports.TokenPrice = exports.TokenInitialize = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const prices_1 = require("./prices");
const ERC20_1 = require("../../generated/BondingManager/ERC20");
const Minter_1 = require("../../generated/BondingManager/Minter");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const tokens_1 = require("../sdk/protocols/generic/tokens");
class TokenInitialize {
    getTokenParams(address) {
        const tokenContract = ERC20_1.ERC20.bind(address);
        const name = utils.readValue(tokenContract.try_name(), "");
        const symbol = utils.readValue(tokenContract.try_symbol(), "");
        const decimals = utils
            .readValue(tokenContract.try_decimals(), constants.BIGINT_ZERO)
            .toI32();
        const tokenParams = new tokens_1.TokenParams(name, symbol, decimals);
        return tokenParams;
    }
}
exports.TokenInitialize = TokenInitialize;
class TokenPrice {
    getTokenPrice(token) {
        const tokenAddress = graph_ts_1.Address.fromBytes(token.id);
        if (tokenAddress.equals(constants.LPT_ADDRESS)) {
            const lptPriceEth = (0, prices_1.getLptPriceEth)();
            const ethPriceUSD = (0, prices_1.getEthPriceUsd)();
            return lptPriceEth.times(ethPriceUSD);
        }
        if (tokenAddress.equals(constants.WETH_ADDRESS)) {
            const ethPriceUSD = (0, prices_1.getEthPriceUsd)();
            return ethPriceUSD;
        }
        const tokenPrice = constants.BIGDECIMAL_ZERO;
        return tokenPrice;
    }
    getAmountValueUSD(token, amount) {
        const tokenAddress = graph_ts_1.Address.fromBytes(token.id);
        if (tokenAddress.equals(constants.LPT_ADDRESS)) {
            const lptPriceEth = (0, prices_1.getLptPriceEth)();
            const ethPriceUSD = (0, prices_1.getEthPriceUsd)();
            const amountDecimal = utils.bigIntToBigDecimal(amount, token.decimals);
            return amountDecimal.times(ethPriceUSD).times(lptPriceEth);
        }
        if (tokenAddress.equals(constants.WETH_ADDRESS)) {
            const ethPriceUSD = (0, prices_1.getEthPriceUsd)();
            const amountDecimal = utils.bigIntToBigDecimal(amount, token.decimals);
            return amountDecimal.times(ethPriceUSD);
        }
        return constants.BIGDECIMAL_ZERO;
    }
}
exports.TokenPrice = TokenPrice;
function getTotalRewardTokens() {
    const minterContract = Minter_1.Minter.bind(constants.MINTER_ADDRESS);
    const totalSupply = utils.readValue(minterContract.try_getGlobalTotalSupply(), constants.BIGINT_ZERO);
    const inflationRate = utils.readValue(minterContract.try_inflation(), constants.BIGINT_ZERO);
    const rewardTokens = totalSupply
        .times(inflationRate)
        .div(constants.BIGINT_TEN.pow(9));
    return rewardTokens;
}
exports.getTotalRewardTokens = getTotalRewardTokens;
