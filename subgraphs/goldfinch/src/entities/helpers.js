"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransactionFromEvent = exports.estimateJuniorAPY = exports.calculateEstimatedInterestForTranchedPool = exports.getCreatedAtOverride = exports.isV1StyleDeal = exports.getEstimatedSeniorPoolInvestment = exports.getJuniorDeposited = exports.getTotalDeposited = exports.usdcWithFiduPrecision = exports.fiduFromAtomic = void 0;
/* eslint-disable @typescript-eslint/no-magic-numbers */
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const SeniorPool_1 = require("../../generated/SeniorPool/SeniorPool");
const FixedLeverageRatioStrategy_1 = require("../../generated/templates/TranchedPool/FixedLeverageRatioStrategy");
const metadata_1 = require("../metadata");
const utils_1 = require("../common/utils");
const user_1 = require("./user");
const FIDU_DECIMAL_PLACES = 18;
const FIDU_DECIMALS = graph_ts_1.BigInt.fromI32(10).pow(FIDU_DECIMAL_PLACES);
const USDC_DECIMAL_PLACES = 6;
const USDC_DECIMALS = graph_ts_1.BigInt.fromI32(10).pow(USDC_DECIMAL_PLACES);
const ONE = graph_ts_1.BigInt.fromString("1");
const ZERO = graph_ts_1.BigInt.fromString("0");
const ONE_HUNDRED = graph_ts_1.BigDecimal.fromString("100");
function fiduFromAtomic(amount) {
    return amount.div(FIDU_DECIMALS);
}
exports.fiduFromAtomic = fiduFromAtomic;
function usdcWithFiduPrecision(amount) {
    return amount.times(FIDU_DECIMALS).div(USDC_DECIMALS).times(FIDU_DECIMALS);
}
exports.usdcWithFiduPrecision = usdcWithFiduPrecision;
function getTotalDeposited(address, juniorTranches, seniorTranches) {
    let totalDeposited = new graph_ts_1.BigInt(0);
    for (let i = 0, k = juniorTranches.length; i < k; ++i) {
        const jrTranche = juniorTranches[i];
        const srTranche = seniorTranches[i];
        if (!jrTranche || !srTranche) {
            throw new Error(`Missing tranche information for ${address.toHexString()}`);
        }
        totalDeposited = totalDeposited.plus(jrTranche.principalDeposited);
        totalDeposited = totalDeposited.plus(srTranche.principalDeposited);
    }
    return totalDeposited;
}
exports.getTotalDeposited = getTotalDeposited;
function getJuniorDeposited(juniorTranches) {
    let juniorDeposited = graph_ts_1.BigInt.zero();
    for (let i = 0; i < juniorTranches.length; i++) {
        juniorDeposited = juniorDeposited.plus(juniorTranches[i].principalDeposited);
    }
    return juniorDeposited;
}
exports.getJuniorDeposited = getJuniorDeposited;
const fixedLeverageRatioAddress = graph_ts_1.Address.fromString("0x9b2acd3fd9aa6c60b26cf748bfff682f27893320"); // This is hardcoded from mainnet. When running off the local chain, this shouldn't be needed.
function getEstimatedSeniorPoolInvestment(tranchedPoolAddress, tranchedPoolVersion, seniorPoolAddress) {
    if (tranchedPoolVersion == utils_1.VERSION_BEFORE_V2_2) {
        // This means that the pool is not compatible with multiple slices, so we need to use a hack to estimate senior pool investment
        const fixedLeverageRatioStrategyContract = FixedLeverageRatioStrategy_1.FixedLeverageRatioStrategy.bind(fixedLeverageRatioAddress);
        return fixedLeverageRatioStrategyContract.estimateInvestment(seniorPoolAddress, tranchedPoolAddress);
    }
    const seniorPoolContract = SeniorPool_1.SeniorPool.bind(seniorPoolAddress);
    return seniorPoolContract.estimateInvestment(tranchedPoolAddress);
}
exports.getEstimatedSeniorPoolInvestment = getEstimatedSeniorPoolInvestment;
/**
 * This exists solely for legacy pools. It looks at a hard-coded metadata blob to determine whether a tranched pool's address is a known legacy pool
 */
function isV1StyleDeal(address) {
    const poolMetadata = metadata_1.MAINNET_METADATA.get(address.toHexString());
    if (poolMetadata != null) {
        const isV1StyleDeal = poolMetadata.toObject().get("v1StyleDeal");
        if (isV1StyleDeal != null) {
            return isV1StyleDeal.toBool();
        }
    }
    return false;
}
exports.isV1StyleDeal = isV1StyleDeal;
function getCreatedAtOverride(address) {
    const poolMetadata = metadata_1.MAINNET_METADATA.get(address.toHexString());
    if (poolMetadata != null) {
        const createdAt = poolMetadata.toObject().get("createdAt");
        if (createdAt != null) {
            return createdAt.toBigInt();
        }
    }
    return null;
}
exports.getCreatedAtOverride = getCreatedAtOverride;
function calculateEstimatedInterestForTranchedPool(tranchedPoolId) {
    const tranchedPool = schema_1.TranchedPool.load(tranchedPoolId);
    if (!tranchedPool) {
        return graph_ts_1.BigDecimal.fromString("0");
    }
    const creditLine = schema_1.CreditLine.load(tranchedPool.creditLine);
    if (!creditLine) {
        return graph_ts_1.BigDecimal.fromString("0");
    }
    const protocolFee = graph_ts_1.BigDecimal.fromString("0.1");
    const leverageRatio = tranchedPool.estimatedLeverageRatio;
    const seniorFraction = leverageRatio
        ? leverageRatio.divDecimal(ONE.plus(leverageRatio).toBigDecimal())
        : ONE.toBigDecimal();
    const seniorBalance = creditLine.balance.toBigDecimal().times(seniorFraction);
    const juniorFeePercentage = tranchedPool.juniorFeePercent
        .toBigDecimal()
        .div(ONE_HUNDRED);
    const isV1Pool = tranchedPool.isV1StyleDeal;
    const seniorPoolPercentageOfInterest = isV1Pool
        ? graph_ts_1.BigDecimal.fromString("1").minus(protocolFee)
        : graph_ts_1.BigDecimal.fromString("1").minus(juniorFeePercentage).minus(protocolFee);
    return seniorBalance
        .times(creditLine.interestAprDecimal)
        .times(seniorPoolPercentageOfInterest);
}
exports.calculateEstimatedInterestForTranchedPool = calculateEstimatedInterestForTranchedPool;
function estimateJuniorAPY(tranchedPool) {
    if (!tranchedPool) {
        return graph_ts_1.BigDecimal.fromString("0");
    }
    const creditLine = schema_1.CreditLine.load(tranchedPool.creditLine);
    if (!creditLine) {
        throw new Error(`Missing creditLine for TranchedPool ${tranchedPool.id}`);
    }
    if (isV1StyleDeal(graph_ts_1.Address.fromString(tranchedPool.id))) {
        return creditLine.interestAprDecimal;
    }
    let balance;
    if (!creditLine.balance.isZero()) {
        balance = creditLine.balance;
    }
    else if (!creditLine.limit.isZero()) {
        balance = creditLine.limit;
    }
    else if (!creditLine.maxLimit.isZero()) {
        balance = creditLine.maxLimit;
    }
    else {
        return graph_ts_1.BigDecimal.fromString("0");
    }
    const leverageRatio = tranchedPool.estimatedLeverageRatio;
    // A missing leverage ratio implies this was a v1 style deal and the senior pool supplied all the capital
    const seniorFraction = leverageRatio
        ? leverageRatio.divDecimal(ONE.plus(leverageRatio).toBigDecimal())
        : ONE.toBigDecimal();
    const juniorFraction = leverageRatio
        ? ONE.divDecimal(ONE.plus(leverageRatio).toBigDecimal())
        : ZERO.toBigDecimal();
    const interestRateFraction = creditLine.interestAprDecimal.div(ONE_HUNDRED);
    const juniorFeeFraction = tranchedPool.juniorFeePercent.divDecimal(ONE_HUNDRED);
    const reserveFeeFraction = tranchedPool.reserveFeePercent.divDecimal(ONE_HUNDRED);
    const grossSeniorInterest = balance
        .toBigDecimal()
        .times(interestRateFraction)
        .times(seniorFraction);
    const grossJuniorInterest = balance
        .toBigDecimal()
        .times(interestRateFraction)
        .times(juniorFraction);
    const juniorFee = grossSeniorInterest.times(juniorFeeFraction);
    const juniorReserveFeeOwed = grossJuniorInterest.times(reserveFeeFraction);
    const netJuniorInterest = grossJuniorInterest
        .plus(juniorFee)
        .minus(juniorReserveFeeOwed);
    const juniorTranche = balance.toBigDecimal().times(juniorFraction);
    return netJuniorInterest.div(juniorTranche).times(ONE_HUNDRED);
}
exports.estimateJuniorAPY = estimateJuniorAPY;
/**
 * A helper function that creates a Transaction entity from an Ethereum event. Does not save the entity, you must call .save() yourself, after you add any additional properties.
 * @param event Ethereum event to process. Can be any event.
 * @param category The category to assign to this. Must conform to the TransactionCategory enum.
 * @param userAddress The address of the user that should be associated with this transaction. The corresponding `user` entity will be created if it doesn't exist
 * @returns Instance of a Transaction entity.
 */
function createTransactionFromEvent(event, category, userAddress) {
    const transaction = new schema_1.Transaction(event.transaction.hash.concatI32(event.logIndex.toI32()));
    transaction.transactionHash = event.transaction.hash;
    transaction.timestamp = event.block.timestamp.toI32();
    transaction.blockNumber = event.block.number.toI32();
    transaction.category = category;
    const user = (0, user_1.getOrInitUser)(userAddress);
    transaction.user = user.id;
    return transaction;
}
exports.createTransactionFromEvent = createTransactionFromEvent;
