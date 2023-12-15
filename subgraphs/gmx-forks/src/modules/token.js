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
exports.TokenPrice = exports.TokenInitialize = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const _ERC20_1 = require("../../generated/templates/MlpManagerTemplate/_ERC20");
const prices_1 = require("../prices");
const graph_ts_1 = require("@graphprotocol/graph-ts");
class TokenInitialize {
    getTokenParams(address) {
        const tokenContract = _ERC20_1._ERC20.bind(address);
        const name = utils.readValue(tokenContract.try_name(), "");
        const symbol = utils.readValue(tokenContract.try_symbol(), "");
        const decimals = utils
            .readValue(tokenContract.try_decimals(), constants.BIGINT_ZERO)
            .toI32();
        return { name, symbol, decimals };
    }
}
exports.TokenInitialize = TokenInitialize;
class TokenPrice {
    getTokenPrice(token, block) {
        const tokenAddress = graph_ts_1.Address.fromBytes(token.id);
        let tokenPrice = constants.BIGDECIMAL_ZERO;
        if (token.lastPriceUSD)
            tokenPrice = token.lastPriceUSD;
        if (token._setByEvent)
            return tokenPrice;
        // mlp price is calculated by the SDK
        if (tokenAddress == constants.MLP_ADDRESS) {
            return tokenPrice;
        }
        if (token.lastPriceUSD &&
            token.lastPriceBlockNumber &&
            block.number
                .minus(token.lastPriceBlockNumber)
                .lt(constants.PRICE_CACHING_BLOCKS)) {
            return tokenPrice;
        }
        // for escrowed token, use the price of it non escrowed version
        if (tokenAddress.equals(constants.ESCROWED_MMY_ADDRESS)) {
            tokenPrice = (0, prices_1.getUsdPricePerToken)(constants.MMY_ADDRESS, block).usdPrice;
        }
        else {
            tokenPrice = (0, prices_1.getUsdPricePerToken)(tokenAddress, block).usdPrice;
        }
        token.lastPriceUSD = tokenPrice;
        token.lastPriceBlockNumber = block.number;
        token._setByEvent = false;
        token.save();
        return tokenPrice;
    }
    getAmountValueUSD(token, amount, block) {
        const tokenAddress = graph_ts_1.Address.fromBytes(token.id);
        let tokenPrice = constants.BIGDECIMAL_ZERO;
        if (token.lastPriceUSD)
            tokenPrice = token.lastPriceUSD;
        if (token._setByEvent)
            return tokenPrice.times(utils.bigIntToBigDecimal(amount, token.decimals));
        // mlp price is calculated by the SDK
        if (tokenAddress == constants.MLP_ADDRESS) {
            return tokenPrice.times(utils.bigIntToBigDecimal(amount, token.decimals));
        }
        if (token.lastPriceUSD &&
            token.lastPriceBlockNumber &&
            block.number
                .minus(token.lastPriceBlockNumber)
                .lt(constants.PRICE_CACHING_BLOCKS)) {
            return tokenPrice.times(utils.bigIntToBigDecimal(amount, token.decimals));
        }
        // for escrowed token, use the price of its non escrowed version
        if (tokenAddress.equals(constants.ESCROWED_MMY_ADDRESS)) {
            tokenPrice = (0, prices_1.getUsdPricePerToken)(constants.MMY_ADDRESS, block).usdPrice;
        }
        else {
            tokenPrice = (0, prices_1.getUsdPricePerToken)(tokenAddress, block).usdPrice;
        }
        token.lastPriceUSD = tokenPrice;
        token.lastPriceBlockNumber = block.number;
        token._setByEvent = false;
        token.save();
        return tokenPrice.times(utils.bigIntToBigDecimal(amount, token.decimals));
    }
}
exports.TokenPrice = TokenPrice;
