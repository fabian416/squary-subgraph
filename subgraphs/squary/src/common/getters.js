"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDaysSinceEpoch = exports.getOrCreateDex = exports.getLiquidityPool = exports.getOrCreateRewardToken = exports.getOrCreateToken = void 0;
const schema_1 = require("../../generated/schema");
const tokens_1 = require("./tokens");
const constants_1 = require("../common/constants");
const versions_1 = require("../versions");
function getOrCreateToken(tokenAddress) {
    let token = schema_1.Token.load(tokenAddress.toHexString());
    // fetch info if null
    if (!token) {
        token = new schema_1.Token(tokenAddress.toHexString());
        token.symbol = (0, tokens_1.fetchTokenSymbol)(tokenAddress);
        token.name = (0, tokens_1.fetchTokenName)(tokenAddress);
        token.decimals = (0, tokens_1.fetchTokenDecimals)(tokenAddress);
        token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
        token.lastPriceBlockNumber = constants_1.BIGINT_ZERO;
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateRewardToken(address) {
    let rewardToken = schema_1.RewardToken.load(address.toHexString());
    if (rewardToken == null) {
        const token = getOrCreateToken(address);
        rewardToken = new schema_1.RewardToken(address.toHexString());
        rewardToken.token = token.id;
        rewardToken.type = constants_1.RewardTokenType.DEPOSIT;
        rewardToken.save();
        return rewardToken;
    }
    return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
function getLiquidityPool(poolAddress) {
    return schema_1.LiquidityPool.load(poolAddress);
}
exports.getLiquidityPool = getLiquidityPool;
///////////////////////////
///// DexAmm Specific /////
///////////////////////////
function getOrCreateDex() {
    let protocol = schema_1.DexAmmProtocol.load(constants_1.FACTORY_ADDRESS);
    if (!protocol) {
        protocol = new schema_1.DexAmmProtocol(constants_1.FACTORY_ADDRESS);
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
        protocol.network = constants_1.Network.MAINNET;
        protocol.type = constants_1.ProtocolType.EXCHANGE;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateDex = getOrCreateDex;
function getDaysSinceEpoch(secondsSinceEpoch) {
    return Math.floor(secondsSinceEpoch / constants_1.SECONDS_PER_DAY).toString();
}
exports.getDaysSinceEpoch = getDaysSinceEpoch;
