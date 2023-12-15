"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMarketRewardTokenEmissions = exports.updateBackerRewardsData = exports.getBackerRewards = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const BackerRewards_1 = require("../../generated/BackerRewards/BackerRewards");
const constants_1 = require("../common/constants");
const getters_1 = require("../common/getters");
const utils_1 = require("../common/utils");
const BACKER_REWARDS_ID = "1";
function getBackerRewards() {
    let backerRewards = schema_1.BackerRewardsData.load(BACKER_REWARDS_ID);
    if (!backerRewards) {
        backerRewards = new schema_1.BackerRewardsData(BACKER_REWARDS_ID);
        backerRewards.contractAddress = "";
        backerRewards.totalRewards = graph_ts_1.BigInt.zero();
        backerRewards.totalRewardPercentOfTotalGFI = graph_ts_1.BigDecimal.zero();
        backerRewards.maxInterestDollarsEligible = graph_ts_1.BigInt.zero();
    }
    return backerRewards;
}
exports.getBackerRewards = getBackerRewards;
function updateBackerRewardsData(contractAddress) {
    const contract = BackerRewards_1.BackerRewards.bind(contractAddress);
    const backerRewards = getBackerRewards();
    backerRewards.contractAddress = contractAddress.toHexString();
    backerRewards.totalRewards = contract.totalRewards();
    backerRewards.totalRewardPercentOfTotalGFI = contract
        .totalRewardPercentOfTotalGFI()
        .toBigDecimal()
        .div(constants_1.GFI_DECIMALS)
        .div(graph_ts_1.BigDecimal.fromString("100"));
    // Note that this is actually measured in GFI, not dollars
    backerRewards.maxInterestDollarsEligible =
        contract.maxInterestDollarsEligible();
    backerRewards.save();
}
exports.updateBackerRewardsData = updateBackerRewardsData;
function updateMarketRewardTokenEmissions(event) {
    const protocol = (0, getters_1.getOrCreateProtocol)();
    for (let i = 0; i < protocol._marketIDs.length; i++) {
        const marketID = protocol._marketIDs[i];
        // tranchedPool.estimatedJuniorApyFromGfiRaw is updated
        // in calculateApyFromGfiForAllPools()
        const tranchedPool = schema_1.TranchedPool.load(marketID);
        if (!tranchedPool) {
            continue;
        }
        const market = (0, getters_1.getOrCreateMarket)(marketID, event);
        const rewardTokens = market.rewardTokens;
        if (!rewardTokens || rewardTokens.length == 0) {
            // GFI reward token only for depositor (backers)
            const rewardTokenAddress = graph_ts_1.Address.fromString(constants_1.GFI_ADDRESS);
            const rewardToken = (0, getters_1.getOrCreateRewardToken)(rewardTokenAddress, constants_1.RewardTokenType.DEPOSIT);
            market.rewardTokens = [rewardToken.id];
        }
        // reward token is for junior backers only, but messari
        // schema doesn't differentiate junor/senior tranche
        const rewardTokenEmissionsAmount = (0, utils_1.bigDecimalToBigInt)(market.totalDepositBalanceUSD
            .times(tranchedPool.estimatedJuniorApyFromGfiRaw)
            .div(graph_ts_1.BigDecimal.fromString(constants_1.DAYS_PER_YEAR.toString()))
            .times(constants_1.GFI_DECIMALS));
        const GFIpriceUSD = (0, getters_1.getGFIPrice)(event);
        const rewardTokenEmissionsUSD = !GFIpriceUSD
            ? constants_1.BIGDECIMAL_ZERO
            : rewardTokenEmissionsAmount.divDecimal(constants_1.GFI_DECIMALS).times(GFIpriceUSD);
        market.rewardTokenEmissionsAmount = [rewardTokenEmissionsAmount];
        market.rewardTokenEmissionsUSD = [rewardTokenEmissionsUSD];
        graph_ts_1.log.info("[updateMarketRewardTokenEmissions]daily emission amout={}, USD={} at tx {}", [
            rewardTokenEmissionsAmount.toString(),
            rewardTokenEmissionsUSD.toString(),
            event.transaction.hash.toHexString(),
        ]);
        market.save();
    }
}
exports.updateMarketRewardTokenEmissions = updateMarketRewardTokenEmissions;
