"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intervalUpdate = exports.intervalUpdateFinancialsDailySnapshot = exports.intervalUpdateMarketDailySnapshot = exports.intervalUpdateMarketHourlySnapshot = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../../generated/schema");
const PoolLib_1 = require("../../../../generated/templates/Pool/PoolLib");
const constants_1 = require("../../constants");
const prices_1 = require("../../prices/prices");
const utils_1 = require("../../utils");
const markets_1 = require("../getOrCreate/markets");
const protocol_1 = require("../getOrCreate/protocol");
const snapshots_1 = require("../getOrCreate/snapshots");
const supporting_1 = require("../getOrCreate/supporting");
function intervalUpdateMplReward(event, mplReward) {
    const rewardActive = event.block.timestamp < mplReward.periodFinishedTimestamp;
    if (rewardActive) {
        mplReward.rewardTokenEmissionAmountPerDay = mplReward.rewardRatePerSecond.times(constants_1.SEC_PER_DAY);
    }
    else {
        mplReward.rewardTokenEmissionAmountPerDay = constants_1.ZERO_BI;
    }
    mplReward.lastUpdatedBlockNumber = event.block.number;
    mplReward.save();
}
function intervalUpdateStakeLocker(event, stakeLocker) {
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(stakeLocker.market));
    const stakeToken = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(stakeLocker.stakeToken));
    const unrecognizedLosses = stakeLocker.cumulativeLosses.minus(stakeLocker.recognizedLosses);
    stakeLocker.stakeTokenBalance = stakeLocker.cumulativeStake
        .minus(stakeLocker.cumulativeUnstake)
        .minus(unrecognizedLosses);
    stakeLocker.stakeTokenBalanceUSD = (0, prices_1.getBptTokenAmountInUSD)(event, stakeToken, stakeLocker.stakeTokenBalance);
    const poolLibContract = PoolLib_1.PoolLib.bind(constants_1.MAPLE_POOL_LIB_ADDRESS);
    stakeLocker.stakeTokenSwapOutBalanceInPoolInputTokens = (0, utils_1.readCallResult)(poolLibContract.try_getSwapOutValueLocker(graph_ts_1.Address.fromString(stakeLocker.stakeToken), graph_ts_1.Address.fromString(market.inputToken), graph_ts_1.Address.fromString(stakeLocker.id)), constants_1.ZERO_BI, poolLibContract.try_getSwapOutValueLocker.name);
    stakeLocker.lastUpdatedBlockNumber = event.block.number;
    stakeLocker.save();
}
function intervalUpdateMarket(event, market) {
    const stakeLocker = (0, markets_1.getOrCreateStakeLocker)(event, graph_ts_1.Address.fromString(market._stakeLocker));
    const inputToken = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.inputToken));
    const outputToken = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.outputToken));
    const lpMplReward = market._mplRewardMplLp
        ? (0, markets_1.getOrCreateMplReward)(event, graph_ts_1.Address.fromString(market._mplRewardMplLp))
        : null;
    const stakeMplReward = market._mplRewardMplStake
        ? (0, markets_1.getOrCreateMplReward)(event, graph_ts_1.Address.fromString(market._mplRewardMplStake))
        : null;
    market._totalDepositBalance = market._cumulativeDeposit
        .minus(market._cumulativeWithdraw)
        .minus(market._cumulativePoolLosses);
    market._totalInterestBalance = market._cumulativeInterest.minus(market._cumulativeInterestClaimed);
    market.inputTokenBalance = market._totalDepositBalance.plus(market._totalInterestBalance);
    market.outputTokenSupply = (0, utils_1.bigDecimalToBigInt)(market._totalDepositBalance.toBigDecimal().div(market._initialExchangeRate));
    market._cumulativeLiquidate = stakeLocker.cumulativeLossesInPoolInputToken.plus(market._cumulativePoolLosses);
    market._totalBorrowBalance = market._cumulativeBorrow
        .minus(market._cumulativePrincipalRepay)
        .minus(market._cumulativeLiquidate);
    if (market.outputTokenSupply.gt(constants_1.ZERO_BI)) {
        market.exchangeRate = market.inputTokenBalance.toBigDecimal().div(market.outputTokenSupply.toBigDecimal());
    }
    market.inputTokenPriceUSD = (0, prices_1.getTokenPriceInUSD)(event, inputToken);
    market.outputTokenPriceUSD = market.inputTokenPriceUSD
        .times((0, utils_1.powBigDecimal)(constants_1.TEN_BD, outputToken.decimals - inputToken.decimals))
        .times(market.exchangeRate);
    market.totalDepositBalanceUSD = (0, prices_1.getTokenAmountInUSD)(event, inputToken, market._totalDepositBalance);
    market.totalValueLockedUSD = market.totalDepositBalanceUSD;
    market.totalBorrowBalanceUSD = (0, prices_1.getTokenAmountInUSD)(event, inputToken, market._totalBorrowBalance);
    market.cumulativeTotalRevenueUSD = market.cumulativeProtocolSideRevenueUSD.plus(market.cumulativeSupplySideRevenueUSD);
    const rewardTokenEmissionAmount = new Array();
    const rewardTokenEmissionUSD = new Array();
    for (let i = 0; i < market.rewardTokens.length; i++) {
        let tokenEmission = constants_1.ZERO_BI;
        let tokenEmissionUSD = constants_1.ZERO_BD;
        const rewardToken = (0, supporting_1.getOrCreateRewardToken)(graph_ts_1.Address.fromString(market.rewardTokens[i]));
        const rewardTokenToken = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(rewardToken.token));
        if (lpMplReward && lpMplReward.rewardToken == rewardToken.id) {
            tokenEmission = tokenEmission.plus(lpMplReward.rewardTokenEmissionAmountPerDay);
        }
        if (stakeMplReward && stakeMplReward.rewardToken == rewardToken.id) {
            tokenEmission = tokenEmission.plus(stakeMplReward.rewardTokenEmissionAmountPerDay);
        }
        tokenEmissionUSD = (0, prices_1.getTokenAmountInUSD)(event, rewardTokenToken, tokenEmission);
        rewardTokenEmissionAmount.push(tokenEmission);
        rewardTokenEmissionUSD.push(tokenEmissionUSD);
    }
    market.rewardTokenEmissionsAmount = rewardTokenEmissionAmount;
    market.rewardTokenEmissionsUSD = rewardTokenEmissionUSD;
    market._lastUpdatedBlockNumber = event.block.number;
    market.save();
    return market;
}
function intervalUpdateProtocol(event, marketBefore, marketAfter) {
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const marketIDs = protocol._marketIDs;
    let totalValueLockedUSD = constants_1.ZERO_BD;
    let totalDepositBalanceUSD = constants_1.ZERO_BD;
    let totalBorrowBalanceUSD = constants_1.ZERO_BD;
    for (let i = 0; i < marketIDs.length; i++) {
        const market = schema_1.Market.load(marketIDs[i]);
        if (!market) {
            // fail safe in case market does not exist for some reason
            graph_ts_1.log.warning("[intervalUpdateProtocol] Market does not exist: {}", [marketIDs[i]]);
            continue;
        }
        totalValueLockedUSD += market.totalValueLockedUSD;
        totalDepositBalanceUSD += market.totalDepositBalanceUSD;
        totalBorrowBalanceUSD += market.totalBorrowBalanceUSD;
    }
    protocol.totalValueLockedUSD = totalValueLockedUSD;
    protocol.totalDepositBalanceUSD = totalDepositBalanceUSD;
    protocol.totalBorrowBalanceUSD = totalBorrowBalanceUSD;
    // update protocol revenue
    const deltaRevenueUSD = marketAfter.cumulativeTotalRevenueUSD.minus(marketBefore.cumulativeTotalRevenueUSD);
    protocol.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD.plus(deltaRevenueUSD);
    ////
    // Update financial snapshot for dailyTotalRevenueUSD
    ////
    const financialsSnapshot = (0, snapshots_1.getOrCreateFinancialsDailySnapshot)(event);
    financialsSnapshot.dailyTotalRevenueUSD = financialsSnapshot.dailyTotalRevenueUSD.plus(deltaRevenueUSD);
    financialsSnapshot.save();
    protocol.save();
}
function intervalUpdateMarketHourlySnapshot(event, market) {
    const marketSnapshot = (0, snapshots_1.getOrCreateMarketHourlySnapshot)(event, market);
    marketSnapshot.rates = market.rates;
    marketSnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
    marketSnapshot.cumulativeSupplySideRevenueUSD = market.cumulativeSupplySideRevenueUSD;
    marketSnapshot.cumulativeProtocolSideRevenueUSD = market.cumulativeProtocolSideRevenueUSD;
    marketSnapshot.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
    marketSnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketSnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketSnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketSnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketSnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketSnapshot.inputTokenBalance = market.inputTokenBalance;
    marketSnapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketSnapshot.outputTokenSupply = market.outputTokenSupply;
    marketSnapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
    marketSnapshot.exchangeRate = market.exchangeRate;
    marketSnapshot.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
    marketSnapshot.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
    marketSnapshot.hourlyTotalRevenueUSD = marketSnapshot.hourlySupplySideRevenueUSD.plus(marketSnapshot.hourlyProtocolSideRevenueUSD);
    marketSnapshot.save();
    // Hourly accumulators are event driven updates
}
exports.intervalUpdateMarketHourlySnapshot = intervalUpdateMarketHourlySnapshot;
function intervalUpdateMarketDailySnapshot(event, market) {
    const marketSnapshot = (0, snapshots_1.getOrCreateMarketDailySnapshot)(event, market);
    marketSnapshot.rates = market.rates;
    marketSnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
    marketSnapshot.cumulativeSupplySideRevenueUSD = market.cumulativeSupplySideRevenueUSD;
    marketSnapshot.cumulativeProtocolSideRevenueUSD = market.cumulativeProtocolSideRevenueUSD;
    marketSnapshot.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
    marketSnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketSnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketSnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketSnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketSnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketSnapshot.inputTokenBalance = market.inputTokenBalance;
    marketSnapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketSnapshot.outputTokenSupply = market.outputTokenSupply;
    marketSnapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
    marketSnapshot.exchangeRate = market.exchangeRate;
    marketSnapshot.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
    marketSnapshot.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
    marketSnapshot.dailyTotalRevenueUSD = marketSnapshot.dailySupplySideRevenueUSD.plus(marketSnapshot.dailyProtocolSideRevenueUSD);
    marketSnapshot.save();
    // Daily accumulators are event driven updates
}
exports.intervalUpdateMarketDailySnapshot = intervalUpdateMarketDailySnapshot;
function intervalUpdateFinancialsDailySnapshot(event) {
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const financialsSnapshot = (0, snapshots_1.getOrCreateFinancialsDailySnapshot)(event);
    financialsSnapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialsSnapshot.protocolControlledValueUSD = protocol.protocolControlledValueUSD;
    financialsSnapshot.mintedTokenSupplies = protocol.mintedTokenSupplies;
    financialsSnapshot.cumulativeSupplySideRevenueUSD = protocol.cumulativeSupplySideRevenueUSD;
    financialsSnapshot.cumulativeProtocolSideRevenueUSD = protocol.cumulativeProtocolSideRevenueUSD;
    financialsSnapshot.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD;
    financialsSnapshot.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD;
    financialsSnapshot.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
    financialsSnapshot.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD;
    financialsSnapshot.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
    financialsSnapshot.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD;
    financialsSnapshot._treasuryFee = protocol._treasuryFee;
    financialsSnapshot.save();
    // Daily accumulators are event driven updates
}
exports.intervalUpdateFinancialsDailySnapshot = intervalUpdateFinancialsDailySnapshot;
/**
 * Trigger an interval update for this market
 * This does the following
 * 1. interval update the market (mplRewards + stakeLocker + market)
 * 2. interval update the protocol
 * 3. update snapshots
 */
function intervalUpdate(event, market) {
    ////
    // Interval update MplReward's
    ////
    if (market._mplRewardMplLp) {
        const lpMplReward = (0, markets_1.getOrCreateMplReward)(event, graph_ts_1.Address.fromString(market._mplRewardMplLp));
        intervalUpdateMplReward(event, lpMplReward);
    }
    if (market._mplRewardMplStake) {
        const stakeMplReward = (0, markets_1.getOrCreateMplReward)(event, graph_ts_1.Address.fromString(market._mplRewardMplStake));
        intervalUpdateMplReward(event, stakeMplReward);
    }
    ////
    // Interval update stakeLocker
    ////
    const stakeLocker = (0, markets_1.getOrCreateStakeLocker)(event, graph_ts_1.Address.fromString(market._stakeLocker));
    intervalUpdateStakeLocker(event, stakeLocker);
    ////
    // Interval update market
    ////
    // Use a copy instead of original as to hold before and after for intervalUpdateProtocol
    const marketAfter = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(market.id));
    intervalUpdateMarket(event, marketAfter);
    // If market hasn't already been updated this block
    ////
    // Interval update protocol
    ////
    intervalUpdateProtocol(event, market, marketAfter);
    ////
    // Interval update market snapshots
    ////
    intervalUpdateMarketHourlySnapshot(event, market);
    intervalUpdateMarketDailySnapshot(event, market);
    ////
    // Interval update financials snapshot
    ////
    intervalUpdateFinancialsDailySnapshot(event);
}
exports.intervalUpdate = intervalUpdate;
