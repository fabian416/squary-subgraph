"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementPoolExercisedCount = exports.incrementPoolMintedCount = exports.decrementPoolPositionCount = exports.incrementPoolPositionCount = exports.addPoolExercisedVolume = exports.addPoolClosedVolume = exports.addPoolMintVolume = exports.updatePoolOpenInterest = exports.updatePoolTVL = exports.handlePoolWithdraw = exports.handlePoolDeposit = exports.getOrCreatePool = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const tokens_1 = require("../common/tokens");
const price_1 = require("../price");
const protocol_1 = require("./protocol");
function getOrCreatePool(token) {
    let pool = schema_1.LiquidityPool.load(token.id);
    if (!pool) {
        pool = new schema_1.LiquidityPool(token.id);
        pool.protocol = (0, protocol_1.getOrCreateOpynProtocol)().id;
        pool.name = token.name;
        pool.symbol = token.symbol;
        pool.inputTokens = [token.id];
        pool.outputToken = null;
        pool.rewardTokens = null;
        pool.fees = [];
        pool.oracle = null;
        pool.createdTimestamp = constants_1.BIGINT_ZERO;
        pool.createdBlockNumber = constants_1.BIGINT_ZERO;
        pool.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeEntryPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeExitPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeTotalPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeDepositPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeWithdrawPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeTotalLiquidityPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeVolumeByTokenAmount = [constants_1.BIGINT_ZERO];
        pool.cumulativeVolumeByTokenUSD = [constants_1.BIGDECIMAL_ZERO];
        pool.cumulativeDepositedVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeDepositedVolumeByTokenUSD = [constants_1.BIGDECIMAL_ZERO];
        pool.cumulativeDepositedVolumeByTokenAmount = [constants_1.BIGINT_ZERO];
        pool.cumulativeWithdrawVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeWithdrawVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeWithdrawVolumeByTokenUSD = [constants_1.BIGDECIMAL_ZERO];
        pool.cumulativeWithdrawVolumeByTokenAmount = [constants_1.BIGINT_ZERO];
        pool.cumulativeExercisedVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeClosedVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        pool.openInterestUSD = constants_1.BIGDECIMAL_ZERO;
        pool.putsMintedCount = constants_1.INT_ZERO;
        pool.callsMintedCount = constants_1.INT_ZERO;
        pool.contractsMintedCount = constants_1.INT_ZERO;
        pool.contractsTakenCount = constants_1.INT_ZERO;
        pool.contractsExpiredCount = constants_1.INT_ZERO;
        pool.contractsExercisedCount = constants_1.INT_ZERO;
        pool.contractsClosedCount = constants_1.INT_ZERO;
        pool.openPositionCount = constants_1.INT_ZERO;
        pool.closedPositionCount = constants_1.INT_ZERO;
        pool.inputTokenBalances = [constants_1.BIGINT_ZERO];
        pool.inputTokenWeights = [constants_1.BIGINT_HUNDRED.toBigDecimal()];
        pool.outputTokenSupply = null;
        pool.outputTokenPriceUSD = null;
        pool.stakedOutputTokenAmount = null;
        pool.rewardTokenEmissionsAmount = null;
        pool.rewardTokenEmissionsUSD = null;
        pool._lastDailySnapshotTimestamp = constants_1.BIGINT_ZERO;
        pool._lastHourlySnapshotTimestamp = constants_1.BIGINT_ZERO;
        pool.save();
        (0, protocol_1.incrementProtocolTotalPoolCount)();
    }
    return pool;
}
exports.getOrCreatePool = getOrCreatePool;
function handlePoolDeposit(event, pool, deposit) {
    const amount = deposit.inputTokenAmounts[0];
    pool.inputTokenBalances = [pool.inputTokenBalances[0].plus(amount)];
    pool.cumulativeDepositedVolumeUSD = pool.cumulativeDepositedVolumeUSD.plus(deposit.amountUSD);
    pool.cumulativeDepositedVolumeByTokenUSD = [
        pool.cumulativeDepositedVolumeByTokenUSD[0].plus(deposit.amountUSD),
    ];
    pool.cumulativeDepositedVolumeByTokenAmount = [
        pool.cumulativeDepositedVolumeByTokenAmount[0].plus(amount),
    ];
    pool.save();
    updatePoolTVL(event, pool);
}
exports.handlePoolDeposit = handlePoolDeposit;
function handlePoolWithdraw(event, pool, withdraw) {
    const amount = withdraw.inputTokenAmounts[0];
    pool.inputTokenBalances = [pool.inputTokenBalances[0].minus(amount)];
    pool.cumulativeWithdrawVolumeUSD = pool.cumulativeWithdrawVolumeUSD.plus(withdraw.amountUSD);
    pool.cumulativeWithdrawVolumeByTokenUSD = [
        pool.cumulativeWithdrawVolumeByTokenUSD[0].plus(withdraw.amountUSD),
    ];
    pool.cumulativeWithdrawVolumeByTokenAmount = [
        pool.cumulativeWithdrawVolumeByTokenAmount[0].plus(amount),
    ];
    pool.save();
    updatePoolTVL(event, pool);
}
exports.handlePoolWithdraw = handlePoolWithdraw;
function updatePoolTVL(event, pool) {
    const token = (0, tokens_1.getOrCreateToken)(pool.inputTokens[0]);
    const totalValueLocked = (0, price_1.getUSDAmount)(event, token, pool.inputTokenBalances[0]);
    (0, protocol_1.updateProtocolUSDLocked)(totalValueLocked.minus(pool.totalValueLockedUSD));
    pool.totalValueLockedUSD = totalValueLocked;
    pool.save();
}
exports.updatePoolTVL = updatePoolTVL;
function updatePoolOpenInterest(event, pool, netChangeUSD) {
    pool.openInterestUSD = pool.openInterestUSD.plus(netChangeUSD);
    pool.save();
    (0, protocol_1.updateProtocolOpenInterest)(netChangeUSD);
}
exports.updatePoolOpenInterest = updatePoolOpenInterest;
function addPoolMintVolume(event, pool, amountUSD) {
    pool.cumulativeVolumeUSD = pool.cumulativeVolumeUSD.plus(amountUSD);
    pool.save();
    (0, protocol_1.addProtocolMintVolume)(amountUSD);
}
exports.addPoolMintVolume = addPoolMintVolume;
function addPoolClosedVolume(event, pool, amountUSD) {
    pool.cumulativeClosedVolumeUSD =
        pool.cumulativeClosedVolumeUSD.plus(amountUSD);
    pool.save();
    (0, protocol_1.addProtocolClosedVolume)(amountUSD);
}
exports.addPoolClosedVolume = addPoolClosedVolume;
function addPoolExercisedVolume(event, pool, amountUSD) {
    pool.cumulativeExercisedVolumeUSD =
        pool.cumulativeExercisedVolumeUSD.plus(amountUSD);
    pool.save();
    (0, protocol_1.addProtocolExercisedVolume)(amountUSD);
}
exports.addPoolExercisedVolume = addPoolExercisedVolume;
function incrementPoolPositionCount(event, option) {
    const pool = schema_1.LiquidityPool.load(option.pool);
    pool.openPositionCount += 1;
    pool.contractsTakenCount += 1;
    pool.save();
    (0, protocol_1.incrementProtocolPositionCount)();
}
exports.incrementPoolPositionCount = incrementPoolPositionCount;
function decrementPoolPositionCount(event, option) {
    const pool = schema_1.LiquidityPool.load(option.pool);
    pool.openPositionCount -= 1;
    pool.closedPositionCount += 1;
    pool.contractsClosedCount += 1;
    pool.save();
    (0, protocol_1.decrementProtocolPositionCount)();
}
exports.decrementPoolPositionCount = decrementPoolPositionCount;
function incrementPoolMintedCount(event, option) {
    const pool = schema_1.LiquidityPool.load(option.pool);
    if (option.type == constants_1.OptionType.CALL) {
        pool.callsMintedCount += 1;
    }
    else {
        pool.putsMintedCount += 1;
    }
    pool.contractsMintedCount += 1;
    pool.save();
    (0, protocol_1.incrementProtocolMintedCount)(option);
}
exports.incrementPoolMintedCount = incrementPoolMintedCount;
function incrementPoolExercisedCount(event, option) {
    const pool = schema_1.LiquidityPool.load(option.pool);
    pool.contractsExercisedCount += 1;
    pool.save();
    (0, protocol_1.incrementProtocolExercisedCount)();
}
exports.incrementPoolExercisedCount = incrementPoolExercisedCount;
