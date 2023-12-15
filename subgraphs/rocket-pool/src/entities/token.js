"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateRewardToken = exports.getOrCreateToken = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const _ERC20_1 = require("../../generated/rocketStorage/_ERC20");
const prices_1 = require("../prices");
const constants_1 = require("../utils/constants");
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
            token.name = fetchTokenName(tokenAddress);
            token.symbol = fetchTokenSymbol(tokenAddress);
            token.decimals = fetchTokenDecimals(tokenAddress);
        }
    }
    if (token.lastPriceBlockNumber &&
        token.lastPriceBlockNumber.equals(blockNumber)) {
        token.save();
        return token;
    }
    const price = (0, prices_1.getUsdPricePerToken)(tokenAddress);
    if (price.reverted) {
        token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
    }
    else {
        token.lastPriceUSD = price.usdPrice.div(price.decimalsBaseTen);
    }
    token.lastPriceBlockNumber = blockNumber;
    token.save();
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function fetchTokenName(tokenAddress) {
    const tokenContract = _ERC20_1._ERC20.bind(tokenAddress);
    const call = tokenContract.try_name();
    if (call.reverted) {
        return tokenAddress.toHexString();
    }
    else {
        return call.value;
    }
}
function fetchTokenSymbol(tokenAddress) {
    const tokenContract = _ERC20_1._ERC20.bind(tokenAddress);
    const call = tokenContract.try_symbol();
    if (call.reverted) {
        return " ";
    }
    else {
        return call.value;
    }
}
function fetchTokenDecimals(tokenAddress) {
    const tokenContract = _ERC20_1._ERC20.bind(tokenAddress);
    const call = tokenContract.try_decimals();
    if (call.reverted) {
        return 0;
    }
    else {
        return call.value.toI32();
    }
}
function getOrCreateRewardToken(address, type, blocknumber) {
    const token = getOrCreateToken(address, blocknumber);
    const rewardTokenId = `${token.id}-${type}`;
    let rewardToken = schema_1.RewardToken.load(rewardTokenId);
    if (!rewardToken) {
        rewardToken = new schema_1.RewardToken(rewardTokenId);
        rewardToken.token = token.id;
        rewardToken.type = type;
        rewardToken.save();
    }
    return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
