"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePoolSnapshotHourID = exports.updatePoolSnapshotDayID = exports.incrementPoolUniqueLiquidatees = exports.incrementPoolUniqueLiquidators = exports.incrementPoolUniqueBorrowers = exports.incrementPoolUniqueDepositors = exports.incrementPoolUniqueUsers = exports.increasePoolStakeSideRevenue = exports.increasePoolSupplySideRevenue = exports.increasePoolProtocolSideRevenue = exports.increasePoolTotalRevenue = exports.updatePoolFundingRate = exports.updatePoolRewardToken = exports.updatePoolInputTokenBalance = exports.updatePoolOpenInterestUSD = exports.updatePoolTvl = exports.updatePoolOutputToken = exports.decrementPoolOpenPositionCount = exports.incrementPoolOpenPositionCount = exports.increasePoolPremium = exports.increasePoolVolume = exports.getOrCreateLiquidityPool = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const event_1 = require("./event");
const protocol_1 = require("./protocol");
const token_1 = require("./token");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const strings_1 = require("../utils/strings");
function getOrCreateLiquidityPool(event, poolAddress, poolName, poolSymbol) {
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    let pool = schema_1.LiquidityPool.load(poolAddress);
    if (!pool) {
        pool = new schema_1.LiquidityPool(poolAddress);
        // Metadata
        pool.protocol = protocol.id;
        pool.name = poolName;
        pool.symbol = poolSymbol;
        pool.createdTimestamp = event.block.timestamp;
        pool.createdBlockNumber = event.block.number;
        // Tokens
        pool.inputTokens = [];
        pool.outputToken = null;
        pool.rewardTokens = [];
        pool.fees = createPoolFees(poolAddress);
        // Quantitative Revenue Data
        pool.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeStakeSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeEntryPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeExitPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeTotalPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeDepositPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeWithdrawPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeTotalLiquidityPremiumUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeUniqueUsers = constants_1.INT_ZERO;
        pool.cumulativeUniqueDepositors = constants_1.INT_ZERO;
        pool.cumulativeUniqueBorrowers = constants_1.INT_ZERO;
        pool.cumulativeUniqueLiquidators = constants_1.INT_ZERO;
        pool.cumulativeUniqueLiquidatees = constants_1.INT_ZERO;
        pool.longOpenInterestUSD = constants_1.BIGDECIMAL_ZERO;
        pool.shortOpenInterestUSD = constants_1.BIGDECIMAL_ZERO;
        pool.totalOpenInterestUSD = constants_1.BIGDECIMAL_ZERO;
        pool.longPositionCount = constants_1.INT_ZERO;
        pool.shortPositionCount = constants_1.INT_ZERO;
        pool.openPositionCount = constants_1.INT_ZERO;
        pool.closedPositionCount = constants_1.INT_ZERO;
        pool.cumulativePositionCount = constants_1.INT_ZERO;
        // Quantitative Token Data
        pool.inputTokenBalances = [];
        pool.inputTokenWeights = [];
        pool.outputTokenSupply = constants_1.BIGINT_ZERO;
        pool.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        pool.stakedOutputTokenAmount = constants_1.BIGINT_ZERO;
        pool.rewardTokenEmissionsAmount = [];
        pool.rewardTokenEmissionsUSD = [];
        pool.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeVolumeByTokenAmount = [];
        pool.cumulativeVolumeByTokenUSD = [];
        pool.cumulativeInflowVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeInflowVolumeByTokenAmount = [];
        pool.cumulativeInflowVolumeByTokenUSD = [];
        pool.cumulativeClosedInflowVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeClosedInflowVolumeByTokenAmount = [];
        pool.cumulativeClosedInflowVolumeByTokenUSD = [];
        pool.cumulativeOutflowVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeOutflowVolumeByTokenAmount = [];
        pool.cumulativeOutflowVolumeByTokenUSD = [];
        pool.fundingrate = [];
        pool.cumulativeUniqueUsers = constants_1.INT_ZERO;
        pool._lastSnapshotDayID = constants_1.BIGINT_ZERO;
        pool._lastSnapshotHourID = constants_1.BIGINT_ZERO;
        pool._lastUpdateTimestamp = constants_1.BIGINT_ZERO;
        // update number of pools
        protocol.totalPoolCount += 1;
        protocol.save();
        pool.save();
    }
    return pool;
}
exports.getOrCreateLiquidityPool = getOrCreateLiquidityPool;
function increasePoolVolume(event, pool, sizeUSDDelta, collateralTokenAddress, collateralTokenAmountDelta, collateralUSDDelta, eventType) {
    let collateralTokenIndex = constants_1.INT_NEGATIVE_ONE;
    if (collateralTokenAddress) {
        collateralTokenIndex = pool.inputTokens.indexOf(collateralTokenAddress);
        if (collateralTokenIndex < 0) {
            updatePoolInputTokenBalance(event, pool, (0, token_1.getOrCreateToken)(event, collateralTokenAddress), constants_1.BIGINT_ZERO, eventType);
            collateralTokenIndex = pool.inputTokens.indexOf(collateralTokenAddress);
        }
    }
    switch (eventType) {
        case event_1.EventType.CollateralIn:
            pool.cumulativeInflowVolumeUSD =
                pool.cumulativeInflowVolumeUSD.plus(collateralUSDDelta);
            pool.cumulativeVolumeUSD = pool.cumulativeVolumeUSD.plus(sizeUSDDelta);
            const cumulativeInflowVolumeByTokenAmount = pool.cumulativeInflowVolumeByTokenAmount;
            const cumulativeInflowVolumeByTokenUSD = pool.cumulativeInflowVolumeByTokenUSD;
            if (collateralTokenIndex >= 0) {
                cumulativeInflowVolumeByTokenAmount[collateralTokenIndex] =
                    cumulativeInflowVolumeByTokenAmount[collateralTokenIndex].plus(collateralTokenAmountDelta);
                cumulativeInflowVolumeByTokenUSD[collateralTokenIndex] =
                    cumulativeInflowVolumeByTokenUSD[collateralTokenIndex].plus(collateralUSDDelta);
            }
            pool.cumulativeInflowVolumeByTokenAmount =
                cumulativeInflowVolumeByTokenAmount;
            pool.cumulativeInflowVolumeByTokenUSD = cumulativeInflowVolumeByTokenUSD;
            break;
        case event_1.EventType.CollateralOut:
            pool.cumulativeOutflowVolumeUSD =
                pool.cumulativeOutflowVolumeUSD.plus(collateralUSDDelta);
            pool.cumulativeVolumeUSD = pool.cumulativeVolumeUSD.plus(sizeUSDDelta);
            const cumulativeOutflowVolumeByTokenAmount = pool.cumulativeOutflowVolumeByTokenAmount;
            const cumulativeOutflowVolumeByTokenUSD = pool.cumulativeOutflowVolumeByTokenUSD;
            if (collateralTokenIndex >= 0) {
                cumulativeOutflowVolumeByTokenAmount[collateralTokenIndex] =
                    cumulativeOutflowVolumeByTokenAmount[collateralTokenIndex].plus(collateralTokenAmountDelta);
                cumulativeOutflowVolumeByTokenUSD[collateralTokenIndex] =
                    cumulativeOutflowVolumeByTokenUSD[collateralTokenIndex].plus(collateralUSDDelta);
            }
            pool.cumulativeOutflowVolumeByTokenAmount =
                cumulativeOutflowVolumeByTokenAmount;
            pool.cumulativeOutflowVolumeByTokenUSD =
                cumulativeOutflowVolumeByTokenUSD;
            break;
        case event_1.EventType.ClosePosition:
        case event_1.EventType.Liquidated:
            pool.cumulativeClosedInflowVolumeUSD =
                pool.cumulativeClosedInflowVolumeUSD.plus(collateralUSDDelta);
            const cumulativeClosedInflowVolumeByTokenAmount = pool.cumulativeClosedInflowVolumeByTokenAmount;
            const cumulativeClosedInflowVolumeByTokenUSD = pool.cumulativeClosedInflowVolumeByTokenUSD;
            if (collateralTokenIndex >= 0) {
                cumulativeClosedInflowVolumeByTokenAmount[collateralTokenIndex] =
                    cumulativeClosedInflowVolumeByTokenAmount[collateralTokenIndex].plus(collateralTokenAmountDelta);
                cumulativeClosedInflowVolumeByTokenUSD[collateralTokenIndex] =
                    cumulativeClosedInflowVolumeByTokenUSD[collateralTokenIndex].plus(collateralUSDDelta);
            }
            pool.cumulativeClosedInflowVolumeByTokenAmount =
                cumulativeClosedInflowVolumeByTokenAmount;
            pool.cumulativeClosedInflowVolumeByTokenUSD =
                cumulativeClosedInflowVolumeByTokenUSD;
            break;
        default:
            break;
    }
    const cumulativeVolumeByTokenAmount = pool.cumulativeVolumeByTokenAmount;
    const cumulativeVolumeByTokenUSD = pool.cumulativeVolumeByTokenUSD;
    if (collateralTokenIndex >= 0) {
        cumulativeVolumeByTokenAmount[collateralTokenIndex] =
            cumulativeVolumeByTokenAmount[collateralTokenIndex].plus(collateralTokenAmountDelta);
        cumulativeVolumeByTokenUSD[collateralTokenIndex] =
            cumulativeVolumeByTokenUSD[collateralTokenIndex].plus(collateralUSDDelta);
    }
    pool.cumulativeVolumeByTokenAmount = cumulativeVolumeByTokenAmount;
    pool.cumulativeVolumeByTokenUSD = cumulativeVolumeByTokenUSD;
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
    (0, protocol_1.increaseProtocolVolume)(event, sizeUSDDelta, collateralUSDDelta, eventType);
}
exports.increasePoolVolume = increasePoolVolume;
function increasePoolPremium(event, pool, amountUSD, eventType) {
    switch (eventType) {
        case event_1.EventType.Deposit:
            pool.cumulativeDepositPremiumUSD =
                pool.cumulativeDepositPremiumUSD.plus(amountUSD);
            pool.cumulativeTotalLiquidityPremiumUSD =
                pool.cumulativeTotalLiquidityPremiumUSD.plus(amountUSD);
            break;
        case event_1.EventType.Withdraw:
            pool.cumulativeWithdrawPremiumUSD =
                pool.cumulativeWithdrawPremiumUSD.plus(amountUSD);
            pool.cumulativeTotalLiquidityPremiumUSD =
                pool.cumulativeTotalLiquidityPremiumUSD.plus(amountUSD);
            break;
        case event_1.EventType.CollateralIn:
            pool.cumulativeEntryPremiumUSD =
                pool.cumulativeEntryPremiumUSD.plus(amountUSD);
            pool.cumulativeTotalPremiumUSD =
                pool.cumulativeTotalPremiumUSD.plus(amountUSD);
            break;
        case event_1.EventType.CollateralOut:
            pool.cumulativeExitPremiumUSD =
                pool.cumulativeExitPremiumUSD.plus(amountUSD);
            pool.cumulativeTotalPremiumUSD =
                pool.cumulativeTotalPremiumUSD.plus(amountUSD);
            break;
        default:
            break;
    }
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
    (0, protocol_1.increaseProtocolPremium)(event, amountUSD, eventType);
}
exports.increasePoolPremium = increasePoolPremium;
function incrementPoolOpenPositionCount(event, pool, positionSide) {
    if (constants_1.PositionSide.LONG == positionSide) {
        pool.longPositionCount += constants_1.INT_ONE;
    }
    else {
        pool.shortPositionCount += constants_1.INT_ONE;
    }
    pool.openPositionCount += constants_1.INT_ONE;
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
    (0, protocol_1.incrementProtocolOpenPositionCount)(event, positionSide);
}
exports.incrementPoolOpenPositionCount = incrementPoolOpenPositionCount;
function decrementPoolOpenPositionCount(event, pool, positionSide) {
    if (constants_1.PositionSide.LONG == positionSide) {
        pool.longPositionCount -= constants_1.INT_ONE;
    }
    else {
        pool.shortPositionCount -= constants_1.INT_ONE;
    }
    pool.openPositionCount -= constants_1.INT_ONE;
    pool.closedPositionCount += constants_1.INT_ONE;
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
    (0, protocol_1.decrementProtocolOpenPositionCount)(event, positionSide);
}
exports.decrementPoolOpenPositionCount = decrementPoolOpenPositionCount;
function updatePoolOutputToken(event, pool, outputTokenAddress) {
    pool.outputToken = (0, token_1.getOrCreateToken)(event, outputTokenAddress).id;
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
}
exports.updatePoolOutputToken = updatePoolOutputToken;
function updatePoolTvl(event, pool, outputTokenAmount, outputTokenPrice, eventType) {
    const prevPoolTVL = pool.totalValueLockedUSD;
    if (eventType == event_1.EventType.Deposit) {
        pool.outputTokenSupply = pool.outputTokenSupply.plus(outputTokenAmount);
    }
    else if (eventType == event_1.EventType.Withdraw) {
        pool.outputTokenSupply = pool.outputTokenSupply.minus(outputTokenAmount);
    }
    pool.outputTokenPriceUSD = (0, numbers_1.convertToDecimal)(outputTokenPrice, constants_1.DEFAULT_DECIMALS);
    pool.totalValueLockedUSD = (0, numbers_1.convertToDecimal)(pool.outputTokenSupply, constants_1.DEFAULT_DECIMALS).times(pool.outputTokenPriceUSD);
    const tvlChangeUSD = pool.totalValueLockedUSD.minus(prevPoolTVL);
    pool.stakedOutputTokenAmount = pool.outputTokenSupply;
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
    // Protocol
    (0, protocol_1.updateProtocolTVL)(event, tvlChangeUSD);
}
exports.updatePoolTvl = updatePoolTvl;
function updatePoolOpenInterestUSD(event, pool, amountChangeUSD, isLong) {
    if (isLong) {
        pool.longOpenInterestUSD =
            pool.longOpenInterestUSD.plus(amountChangeUSD) >= constants_1.BIGDECIMAL_ZERO
                ? pool.longOpenInterestUSD.plus(amountChangeUSD)
                : constants_1.BIGDECIMAL_ZERO;
    }
    else {
        pool.shortOpenInterestUSD =
            pool.shortOpenInterestUSD.plus(amountChangeUSD) >= constants_1.BIGDECIMAL_ZERO
                ? pool.shortOpenInterestUSD.plus(amountChangeUSD)
                : constants_1.BIGDECIMAL_ZERO;
    }
    const preTotalOpenInterestUSD = pool.totalOpenInterestUSD;
    pool.totalOpenInterestUSD = pool.longOpenInterestUSD.plus(pool.shortOpenInterestUSD);
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
    // Protocol
    (0, protocol_1.updateProtocolOpenInterestUSD)(event, pool.totalOpenInterestUSD.minus(preTotalOpenInterestUSD), isLong);
}
exports.updatePoolOpenInterestUSD = updatePoolOpenInterestUSD;
function updatePoolInputTokenBalance(event, pool, inputToken, inputTokenAmount, eventType) {
    const inputTokens = pool.inputTokens;
    const inputTokenBalances = pool.inputTokenBalances;
    const inputTokenIndex = inputTokens.indexOf(inputToken.id);
    if (inputTokenIndex >= 0) {
        if (eventType == event_1.EventType.Deposit) {
            inputTokenBalances[inputTokenIndex] =
                inputTokenBalances[inputTokenIndex].plus(inputTokenAmount);
        }
        else if (eventType == event_1.EventType.Withdraw) {
            inputTokenBalances[inputTokenIndex] =
                inputTokenBalances[inputTokenIndex].minus(inputTokenAmount) >=
                    constants_1.BIGINT_ZERO
                    ? inputTokenBalances[inputTokenIndex].minus(inputTokenAmount)
                    : constants_1.BIGINT_ZERO;
        }
    }
    else {
        const inputTokenWeights = pool.inputTokenWeights;
        const fundingrates = pool.fundingrate;
        const cumulativeVolumeByTokenAmount = pool.cumulativeVolumeByTokenAmount;
        const cumulativeVolumeByTokenUSD = pool.cumulativeVolumeByTokenUSD;
        const cumulativeInflowVolumeByTokenAmount = pool.cumulativeInflowVolumeByTokenAmount;
        const cumulativeInflowVolumeByTokenUSD = pool.cumulativeInflowVolumeByTokenUSD;
        const cumulativeClosedInflowVolumeByTokenAmount = pool.cumulativeClosedInflowVolumeByTokenAmount;
        const cumulativeClosedInflowVolumeByTokenUSD = pool.cumulativeClosedInflowVolumeByTokenUSD;
        const cumulativeOutflowVolumeByTokenAmount = pool.cumulativeOutflowVolumeByTokenAmount;
        const cumulativeOutflowVolumeByTokenUSD = pool.cumulativeOutflowVolumeByTokenUSD;
        inputTokens.push(inputToken.id);
        inputTokenBalances.push(inputTokenAmount);
        fundingrates.push(constants_1.BIGDECIMAL_ZERO);
        inputTokenWeights.push(constants_1.BIGDECIMAL_ZERO);
        cumulativeVolumeByTokenAmount.push(constants_1.BIGINT_ZERO);
        cumulativeVolumeByTokenUSD.push(constants_1.BIGDECIMAL_ZERO);
        cumulativeInflowVolumeByTokenAmount.push(constants_1.BIGINT_ZERO);
        cumulativeInflowVolumeByTokenUSD.push(constants_1.BIGDECIMAL_ZERO);
        cumulativeClosedInflowVolumeByTokenAmount.push(constants_1.BIGINT_ZERO);
        cumulativeClosedInflowVolumeByTokenUSD.push(constants_1.BIGDECIMAL_ZERO);
        cumulativeOutflowVolumeByTokenAmount.push(constants_1.BIGINT_ZERO);
        cumulativeOutflowVolumeByTokenUSD.push(constants_1.BIGDECIMAL_ZERO);
        (0, numbers_1.poolArraySort)(inputTokens, inputTokenBalances, fundingrates, cumulativeVolumeByTokenAmount, cumulativeVolumeByTokenUSD, cumulativeInflowVolumeByTokenAmount, cumulativeInflowVolumeByTokenUSD, cumulativeClosedInflowVolumeByTokenAmount, cumulativeClosedInflowVolumeByTokenUSD, cumulativeOutflowVolumeByTokenAmount, cumulativeOutflowVolumeByTokenUSD);
        for (let i = 0; i < inputTokens.length; i++) {
            inputTokenWeights[i] = constants_1.BIGDECIMAL_ZERO;
        }
        pool.inputTokenWeights = inputTokenWeights;
        pool.fundingrate = fundingrates;
        pool.cumulativeVolumeByTokenAmount = cumulativeVolumeByTokenAmount;
        pool.cumulativeVolumeByTokenUSD = cumulativeVolumeByTokenUSD;
        pool.cumulativeInflowVolumeByTokenAmount =
            cumulativeInflowVolumeByTokenAmount;
        pool.cumulativeInflowVolumeByTokenUSD = cumulativeInflowVolumeByTokenUSD;
        pool.cumulativeClosedInflowVolumeByTokenAmount =
            cumulativeClosedInflowVolumeByTokenAmount;
        pool.cumulativeClosedInflowVolumeByTokenUSD =
            cumulativeClosedInflowVolumeByTokenUSD;
        pool.cumulativeOutflowVolumeByTokenAmount =
            cumulativeOutflowVolumeByTokenAmount;
        pool.cumulativeOutflowVolumeByTokenUSD = cumulativeOutflowVolumeByTokenUSD;
    }
    pool.inputTokens = inputTokens;
    pool.inputTokenBalances = inputTokenBalances;
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
}
exports.updatePoolInputTokenBalance = updatePoolInputTokenBalance;
function updatePoolRewardToken(event, pool, rewardToken, tokensPerDay, tokensPerDayUSD) {
    const rewardTokens = pool.rewardTokens;
    const rewardTokenEmissionsAmount = pool.rewardTokenEmissionsAmount;
    const rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
    const rewardTokenIndex = rewardTokens.indexOf(rewardToken.id);
    if (rewardTokenIndex >= 0) {
        rewardTokenEmissionsAmount[rewardTokenIndex] = tokensPerDay;
        rewardTokenEmissionsUSD[rewardTokenIndex] = tokensPerDayUSD;
    }
    else {
        rewardTokens.push(rewardToken.id);
        rewardTokenEmissionsAmount.push(tokensPerDay);
        rewardTokenEmissionsUSD.push(tokensPerDayUSD);
        (0, numbers_1.multiArraySort)(rewardTokens, rewardTokenEmissionsAmount, rewardTokenEmissionsUSD);
    }
    pool.rewardTokens = rewardTokens;
    pool.rewardTokenEmissionsAmount = rewardTokenEmissionsAmount;
    pool.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
}
exports.updatePoolRewardToken = updatePoolRewardToken;
function updatePoolFundingRate(event, pool, fundingToken, fundingrate) {
    const fundingTokens = pool.inputTokens;
    const fundingrates = pool.fundingrate;
    const fundingTokenIndex = fundingTokens.indexOf(fundingToken.id);
    if (fundingTokenIndex >= 0) {
        fundingrates[fundingTokenIndex] = fundingrate;
    }
    pool.fundingrate = fundingrates;
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
}
exports.updatePoolFundingRate = updatePoolFundingRate;
function increasePoolTotalRevenue(event, pool, amountChangeUSD) {
    pool.cumulativeTotalRevenueUSD =
        pool.cumulativeTotalRevenueUSD.plus(amountChangeUSD);
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
    // Protocol
    (0, protocol_1.increaseProtocolTotalRevenue)(event, amountChangeUSD);
}
exports.increasePoolTotalRevenue = increasePoolTotalRevenue;
function increasePoolProtocolSideRevenue(event, pool, amountChangeUSD) {
    pool.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD.plus(amountChangeUSD);
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
    // Protocol
    (0, protocol_1.increaseProtocolSideRevenue)(event, amountChangeUSD);
}
exports.increasePoolProtocolSideRevenue = increasePoolProtocolSideRevenue;
function increasePoolSupplySideRevenue(event, pool, amountChangeUSD) {
    pool.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD.plus(amountChangeUSD);
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
    // Protocol
    (0, protocol_1.increaseProtocolSupplySideRevenue)(event, amountChangeUSD);
}
exports.increasePoolSupplySideRevenue = increasePoolSupplySideRevenue;
function increasePoolStakeSideRevenue(event, pool, amountChangeUSD) {
    pool.cumulativeStakeSideRevenueUSD =
        pool.cumulativeStakeSideRevenueUSD.plus(amountChangeUSD);
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
    // Protocol
    (0, protocol_1.increaseProtocolStakeSideRevenue)(event, amountChangeUSD);
}
exports.increasePoolStakeSideRevenue = increasePoolStakeSideRevenue;
function incrementPoolUniqueUsers(event, pool) {
    pool.cumulativeUniqueUsers += constants_1.INT_ONE;
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
    // Protocol
    (0, protocol_1.incrementProtocolUniqueUsers)(event);
}
exports.incrementPoolUniqueUsers = incrementPoolUniqueUsers;
function incrementPoolUniqueDepositors(event, pool) {
    pool.cumulativeUniqueDepositors += constants_1.INT_ONE;
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
    // Protocol
    (0, protocol_1.incrementProtocolUniqueDepositors)(event);
}
exports.incrementPoolUniqueDepositors = incrementPoolUniqueDepositors;
function incrementPoolUniqueBorrowers(event, pool) {
    pool.cumulativeUniqueBorrowers += constants_1.INT_ONE;
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
    // Protocol
    (0, protocol_1.incrementProtocolUniqueBorrowers)(event);
}
exports.incrementPoolUniqueBorrowers = incrementPoolUniqueBorrowers;
function incrementPoolUniqueLiquidators(event, pool) {
    pool.cumulativeUniqueLiquidators += constants_1.INT_ONE;
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
    // Protocol
    (0, protocol_1.incrementProtocolUniqueLiquidators)(event);
}
exports.incrementPoolUniqueLiquidators = incrementPoolUniqueLiquidators;
function incrementPoolUniqueLiquidatees(event, pool) {
    pool.cumulativeUniqueLiquidatees += constants_1.INT_ONE;
    pool._lastUpdateTimestamp = event.block.timestamp;
    pool.save();
    // Protocol
    (0, protocol_1.incrementProtocolUniqueLiquidatees)(event);
}
exports.incrementPoolUniqueLiquidatees = incrementPoolUniqueLiquidatees;
function updatePoolSnapshotDayID(event, pool, snapshotDayID) {
    pool._lastSnapshotDayID = graph_ts_1.BigInt.fromI32(snapshotDayID);
    pool.save();
}
exports.updatePoolSnapshotDayID = updatePoolSnapshotDayID;
function updatePoolSnapshotHourID(event, pool, snapshotHourID) {
    pool._lastSnapshotHourID = graph_ts_1.BigInt.fromI32(snapshotHourID);
    pool.save();
}
exports.updatePoolSnapshotHourID = updatePoolSnapshotHourID;
function createPoolFees(poolAddress) {
    // get or create fee entities, set fee types
    const tradingFeeId = graph_ts_1.Bytes.fromUTF8((0, strings_1.enumToPrefix)(constants_1.LiquidityPoolFeeType.FIXED_TRADING_FEE)).concat(poolAddress);
    const tradingFee = getOrCreateLiquidityPoolFee(tradingFeeId, constants_1.LiquidityPoolFeeType.FIXED_TRADING_FEE);
    const protocolFeeId = graph_ts_1.Bytes.fromUTF8((0, strings_1.enumToPrefix)(constants_1.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE)).concat(poolAddress);
    const protocolFee = getOrCreateLiquidityPoolFee(protocolFeeId, constants_1.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE);
    const lpFeeId = graph_ts_1.Bytes.fromUTF8((0, strings_1.enumToPrefix)(constants_1.LiquidityPoolFeeType.FIXED_LP_FEE)).concat(poolAddress);
    const lpFee = getOrCreateLiquidityPoolFee(lpFeeId, constants_1.LiquidityPoolFeeType.FIXED_LP_FEE);
    const stakeFeeId = graph_ts_1.Bytes.fromUTF8((0, strings_1.enumToPrefix)(constants_1.LiquidityPoolFeeType.FIXED_STAKE_FEE)).concat(poolAddress);
    const stakeFee = getOrCreateLiquidityPoolFee(stakeFeeId, constants_1.LiquidityPoolFeeType.FIXED_STAKE_FEE);
    const depositFeeId = graph_ts_1.Bytes.fromUTF8((0, strings_1.enumToPrefix)(constants_1.LiquidityPoolFeeType.DEPOSIT_FEE)).concat(poolAddress);
    const depositFee = getOrCreateLiquidityPoolFee(depositFeeId, constants_1.LiquidityPoolFeeType.DEPOSIT_FEE);
    const withdrawalFeeId = graph_ts_1.Bytes.fromUTF8((0, strings_1.enumToPrefix)(constants_1.LiquidityPoolFeeType.WITHDRAWAL_FEE)).concat(poolAddress);
    const withdrawalFee = getOrCreateLiquidityPoolFee(withdrawalFeeId, constants_1.LiquidityPoolFeeType.WITHDRAWAL_FEE);
    return [
        tradingFee.id,
        protocolFee.id,
        lpFee.id,
        stakeFee.id,
        depositFee.id,
        withdrawalFee.id,
    ];
}
function getOrCreateLiquidityPoolFee(feeId, feeType, feePercentage = constants_1.BIGDECIMAL_ZERO) {
    let fees = schema_1.LiquidityPoolFee.load(feeId);
    if (!fees) {
        fees = new schema_1.LiquidityPoolFee(feeId);
        fees.feeType = feeType;
        fees.feePercentage = feePercentage;
        fees.save();
    }
    if (feePercentage.notEqual(constants_1.BIGDECIMAL_ZERO)) {
        fees.feePercentage = feePercentage;
        fees.save();
    }
    return fees;
}
