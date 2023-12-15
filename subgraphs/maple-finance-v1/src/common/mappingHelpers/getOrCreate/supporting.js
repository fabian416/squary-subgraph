"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateRewardToken = exports.getOrCreateToken = void 0;
const schema_1 = require("../../../../generated/schema");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
function getOrCreateToken(tokenAddress) {
    let token = schema_1.Token.load(tokenAddress.toHexString());
    if (!token) {
        token = new schema_1.Token(tokenAddress.toHexString());
        // check for ETH token - unique
        if (tokenAddress.toHexString() == constants_1.ETH_ADDRESS) {
            token.name = constants_1.ETH_NAME;
            token.symbol = constants_1.ETH_SYMBOL;
            token.decimals = constants_1.ETH_DECIMALS;
        }
        else {
            token.name = (0, utils_1.getAssetName)(tokenAddress);
            token.symbol = (0, utils_1.getAssetSymbol)(tokenAddress);
            token.decimals = (0, utils_1.getAssetDecimals)(tokenAddress);
        }
        token.lastPriceUSD = constants_1.ZERO_BD;
        token.lastPriceBlockNumber = constants_1.ZERO_BI;
        token._lastPriceOracle = constants_1.OracleType.NONE;
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateRewardToken(tokenAddress) {
    let rewardToken = schema_1.RewardToken.load(tokenAddress.toHexString());
    if (!rewardToken) {
        rewardToken = new schema_1.RewardToken(tokenAddress.toHexString());
        const token = getOrCreateToken(tokenAddress);
        rewardToken.token = token.id;
        rewardToken.type = constants_1.RewardTokenType.DEPOSIT;
        rewardToken.save();
    }
    return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
