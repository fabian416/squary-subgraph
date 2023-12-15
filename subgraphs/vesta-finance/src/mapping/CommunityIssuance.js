"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTotalVSTAIssuedUpdated = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const CommunityIssuance_1 = require("../../generated/CommunityIssuance/CommunityIssuance");
const market_1 = require("../entities/market");
const constants_1 = require("../utils/constants");
const schema_1 = require("../../generated/schema");
const token_1 = require("../entities/token");
const numbers_1 = require("../utils/numbers");
/*
 * Update reward emssion
 *
 * @param event TotalVSTAIssuedUpdated event
 *
 */
function handleTotalVSTAIssuedUpdated(event) {
    calculateDailyVSTARewards(event, event.params.stabilityPool);
}
exports.handleTotalVSTAIssuedUpdated = handleTotalVSTAIssuedUpdated;
function calculateDailyVSTARewards(event, pool) {
    const stabilityPool = (0, market_1.getOrCreateStabilityPool)(pool, null, event);
    const contract = CommunityIssuance_1.CommunityIssuance.bind(event.address);
    const stabilityPoolRewardsResult = contract.try_stabilityPoolRewards(pool);
    if (stabilityPoolRewardsResult.reverted) {
        graph_ts_1.log.error("[calculateDailyVestaRewards]CommunityIssuance.stabilityPoolRewards() reverted for tx {}", [event.transaction.hash.toHexString()]);
        return;
    }
    // read RewardDistributionPerMin from the `DistributionRewards` struct,
    // not using try_* here
    const rewardTokenEmissionAmount = stabilityPoolRewardsResult.value
        .getRewardDistributionPerMin()
        .times(constants_1.MINUTES_PER_DAY);
    const VSTAToken = (0, token_1.getOrCreateAssetToken)(graph_ts_1.Address.fromString(constants_1.VSTA_ADDRESS));
    const rewardTokens = stabilityPool.rewardTokens;
    if (!rewardTokens || rewardTokens.length == 0) {
        let rewardToken = schema_1.RewardToken.load(constants_1.VSTA_ADDRESS);
        if (!rewardToken) {
            rewardToken = new schema_1.RewardToken(constants_1.VSTA_ADDRESS);
            rewardToken.token = VSTAToken.id;
            rewardToken.type = constants_1.RewardTokenType.DEPOSIT;
            rewardToken.save();
        }
        stabilityPool.rewardTokens = [rewardToken.id];
    }
    const VSTAPriceUSD = (0, token_1.getVSTATokenPrice)(event);
    let rewardTokenEmissionsUSD = constants_1.BIGDECIMAL_ZERO;
    if (VSTAPriceUSD) {
        rewardTokenEmissionsUSD = rewardTokenEmissionAmount
            .divDecimal((0, numbers_1.exponentToBigDecimal)(VSTAToken.decimals))
            .times(VSTAPriceUSD);
        VSTAToken.lastPriceUSD = VSTAPriceUSD;
        VSTAToken.lastPriceBlockNumber = event.block.number;
        VSTAToken.save();
    }
    stabilityPool.rewardTokenEmissionsAmount = [rewardTokenEmissionAmount];
    stabilityPool.rewardTokenEmissionsUSD = [rewardTokenEmissionsUSD];
    stabilityPool.save();
    (0, market_1.getOrCreateMarketSnapshot)(event, stabilityPool);
    (0, market_1.getOrCreateMarketHourlySnapshot)(event, stabilityPool);
    VSTAToken.lastPriceUSD = VSTAPriceUSD;
    VSTAToken.lastPriceBlockNumber = event.block.number;
    VSTAToken.save();
}
