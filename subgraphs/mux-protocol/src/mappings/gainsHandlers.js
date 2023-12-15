"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGainsUpdatePositionEvent = exports.handleLimitExecuted = exports.handleMarketExecuted = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const PairInfo_1 = require("../../generated/CallbacksV6.3/PairInfo");
const Referrals_1 = require("../../generated/CallbacksV6.3/Referrals");
const event_1 = require("../entities/event");
const token_1 = require("../entities/token");
const account_1 = require("../entities/account");
const protocol_1 = require("../entities/protocol");
const pool_1 = require("../entities/pool");
const snapshots_1 = require("../entities/snapshots");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const rewards_1 = require("../entities/rewards");
const handlers_1 = require("./handlers");
// Event emitted when a trade executes immediately, at the market price
function handleMarketExecuted(event) {
    const daiAddress = graph_ts_1.Address.fromString(constants_1.DAI_ADDRESS_ARBITRUM);
    let eventType = event_1.EventType.CollateralOut;
    if (event.params.open) {
        eventType = event_1.EventType.CollateralIn;
    }
    handleGainsUpdatePositionEvent(event, event.params.t.trader, daiAddress, event.params.positionSizeDai, daiAddress, event.params.positionSizeDai.times(event.params.t.leverage), event.params.t.buy, eventType, event.params.percentProfit, event.params.t.pairIndex);
}
exports.handleMarketExecuted = handleMarketExecuted;
// Event emitted when a trade executes at exact price set if price reaches threshold
function handleLimitExecuted(event) {
    const daiAddress = graph_ts_1.Address.fromString(constants_1.DAI_ADDRESS_ARBITRUM);
    // orderType [TP, SL, LIQ, OPEN] (0-index)
    let eventType = event_1.EventType.CollateralOut;
    if (event.params.orderType == constants_1.INT_THREE) {
        eventType = event_1.EventType.CollateralIn;
    }
    else if (event.params.orderType == constants_1.INT_TWO) {
        eventType = event_1.EventType.Liquidated;
    }
    handleGainsUpdatePositionEvent(event, event.params.t.trader, daiAddress, event.params.positionSizeDai, daiAddress, event.params.positionSizeDai.times(event.params.t.leverage), event.params.t.buy, eventType, event.params.percentProfit, event.params.t.pairIndex);
}
exports.handleLimitExecuted = handleLimitExecuted;
function handleGainsUpdatePositionEvent(event, accountAddress, collateralTokenAddress, collateralAmountDelta, indexTokenAddress, indexTokenAmountDelta, isLong, eventType, percentProfit, PairIndex) {
    // If the referrer address from Gains Trade Referrals contract call is not related with MUX protocol, the trading does not come from MUX protocol.
    const referralsContract = Referrals_1.Referrals.bind(graph_ts_1.Address.fromString(constants_1.GAINS_REFERRALS_ADDRESS));
    const referrer = referralsContract.getTraderReferrer(accountAddress);
    if (referrer.toHexString().toLowerCase() != constants_1.GAINS_MUX_REFERRER_ADDRESS) {
        return;
    }
    const pool = (0, pool_1.getOrCreateLiquidityPool)(event, graph_ts_1.Address.fromString(constants_1.GAINS_VAULT_ADDRESS), constants_1.GAINS_POOL_NAME, constants_1.GAINS_POOL_SYMBOL);
    (0, snapshots_1.takeSnapshots)(event, pool);
    const account = (0, account_1.getOrCreateAccount)(event, pool, accountAddress);
    (0, account_1.incrementAccountEventCount)(event, pool, account, eventType, indexTokenAmountDelta);
    (0, protocol_1.incrementProtocolEventCount)(event, eventType, indexTokenAmountDelta);
    const indexToken = (0, token_1.getOrCreateToken)(event, indexTokenAddress);
    const sizeUSDDelta = (0, numbers_1.convertToDecimal)(indexTokenAmountDelta, indexToken.decimals).times(indexToken.lastPriceUSD);
    const collateralToken = (0, token_1.getOrCreateToken)(event, collateralTokenAddress);
    const collateralUSDDelta = (0, numbers_1.convertToDecimal)(collateralAmountDelta, collateralToken.decimals).times(collateralToken.lastPriceUSD);
    setFundingRate(event, pool, collateralToken, PairIndex);
    const pnlUSD = collateralUSDDelta
        .times((0, numbers_1.convertToDecimal)(percentProfit, constants_1.GAINS_PRECISION_DECIMALS))
        .div(constants_1.BIGDECIMAL_HUNDRED)
        .times(collateralUSDDelta);
    let positionBalance = constants_1.BIGINT_ZERO;
    let positionBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    let positionCollateralBalance = constants_1.BIGINT_ZERO;
    let positionCollateralBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    if (eventType == event_1.EventType.CollateralIn) {
        positionBalance = indexTokenAmountDelta;
        positionBalanceUSD = sizeUSDDelta;
        positionCollateralBalance = collateralAmountDelta;
        positionCollateralBalanceUSD = collateralUSDDelta;
    }
    (0, handlers_1.handleUpdatePositionEvent)(event, pool, account, collateralToken, collateralAmountDelta, collateralUSDDelta, positionCollateralBalance, positionCollateralBalanceUSD, indexToken, sizeUSDDelta, positionBalance, positionBalanceUSD, pnlUSD, isLong, eventType, pnlUSD);
}
exports.handleGainsUpdatePositionEvent = handleGainsUpdatePositionEvent;
function setFundingRate(event, pool, token, pairIndex) {
    const pairInfoContract = PairInfo_1.PairInfo.bind(graph_ts_1.Address.fromString(constants_1.GAINS_PAIRINFO_ADDRESS));
    const fundingRatePerBlockCall = pairInfoContract.try_getFundingFeePerBlockP(pairIndex);
    if (fundingRatePerBlockCall.reverted) {
        return constants_1.BIGDECIMAL_ZERO;
    }
    const fundingRatePerBlock = fundingRatePerBlockCall.value;
    const fundingRatePerDay = (0, rewards_1.getRewardsPerDay)(event.block.timestamp, event.block.number, fundingRatePerBlock.toBigDecimal(), rewards_1.RewardIntervalType.BLOCK).div((0, numbers_1.exponentToBigDecimal)(constants_1.GAINS_PRECISION_DECIMALS));
    (0, pool_1.updatePoolFundingRate)(event, pool, token, fundingRatePerDay);
    return fundingRatePerDay;
}
