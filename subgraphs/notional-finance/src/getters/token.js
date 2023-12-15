"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateERC1155Token = exports.getOrCreateToken = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const ERC20_1 = require("../../generated/Notional/ERC20");
const prices_1 = require("../prices");
const constants_1 = require("../common/constants");
function getOrCreateToken(tokenAddress, blockNumber) {
    const tokenId = tokenAddress.toHexString();
    let token = schema_1.Token.load(tokenId);
    if (!token) {
        token = new schema_1.Token(tokenId);
        if (tokenAddress == graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS)) {
            token.name = constants_1.ETH_NAME;
            token.symbol = constants_1.ETH_SYMBOL;
            token.decimals = 18;
        }
        else {
            token.name = _fetchTokenName(tokenAddress);
            token.symbol = _fetchTokenSymbol(tokenAddress);
            token.decimals = _fetchTokenDecimals(tokenAddress);
        }
    }
    // Optional lastPriceUSD and lastPriceBlockNumber, but used in financialMetrics
    if (!token.lastPriceBlockNumber ||
        token.lastPriceBlockNumber != blockNumber) {
        const price = (0, prices_1.getUsdPricePerToken)(tokenAddress);
        if (price.reverted) {
            token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
        }
        else {
            token.lastPriceUSD = price.usdPrice;
        }
        token.lastPriceBlockNumber = blockNumber;
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateERC1155Token(tokenAddress, encodedId) {
    const tokenId = "ERC1155-" + tokenAddress + "-" + encodedId.toString();
    let token = schema_1.Token.load(tokenId);
    if (!token) {
        token = new schema_1.Token(tokenId);
        token.save();
    }
    return token;
}
exports.getOrCreateERC1155Token = getOrCreateERC1155Token;
function _fetchTokenName(tokenAddress) {
    const tokenContract = ERC20_1.ERC20.bind(tokenAddress);
    const call = tokenContract.try_name();
    if (call.reverted) {
        return tokenAddress.toHexString();
    }
    else {
        return call.value;
    }
}
function _fetchTokenSymbol(tokenAddress) {
    const tokenContract = ERC20_1.ERC20.bind(tokenAddress);
    const call = tokenContract.try_symbol();
    if (call.reverted) {
        return " ";
    }
    else {
        return call.value;
    }
}
function _fetchTokenDecimals(tokenAddress) {
    const tokenContract = ERC20_1.ERC20.bind(tokenAddress);
    const call = tokenContract.try_decimals();
    if (call.reverted) {
        return 0;
    }
    else {
        return call.value;
    }
}
