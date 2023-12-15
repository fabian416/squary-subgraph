"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeTrade = exports.openTrade = exports.getSharesTransferred = exports.getFundingRate = exports.getPairOpenInterest = exports.createTokenAmountArray = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../configurations/configure");
const constants_1 = require("../common/constants");
const enums_1 = require("../sdk/protocols/perpfutures/enums");
const constants_2 = require("../sdk/util/constants");
const numbers_1 = require("../sdk/util/numbers");
const rewards_1 = require("../sdk/util/rewards");
const Storage_1 = require("../../generated/Vault/Storage");
const PairInfo_1 = require("../../generated/Vault/PairInfo");
const Vault_1 = require("../../generated/Vault/Vault");
const PairStorage_1 = require("../../generated/Vault/PairStorage");
function createTokenAmountArray(pool, tokens, amounts) {
    if (tokens.length != amounts.length) {
        return new Array();
    }
    const tokenAmounts = new Array(pool.getInputTokens().length).fill(constants_2.BIGINT_ZERO);
    for (let idx = 0; idx < amounts.length; idx++) {
        const indexOfToken = pool.getInputTokens().indexOf(tokens[idx].id);
        tokenAmounts[indexOfToken] = amounts[idx];
    }
    return tokenAmounts;
}
exports.createTokenAmountArray = createTokenAmountArray;
class OpenInterest {
    constructor(long, short) {
        this.long = long;
        this.short = short;
    }
}
function getPairOpenInterest(pairIndex, event) {
    const storageContract = Storage_1.Storage.bind(configure_1.NetworkConfigs.getStorageAddress());
    const openInterestLongCall = storageContract.try_openInterestDai(pairIndex, constants_2.BIGINT_ZERO);
    if (openInterestLongCall.reverted) {
        graph_ts_1.log.error("[openInterestLongCall reverted] hash: {} pairIndex: {}", [
            event.transaction.hash.toHexString(),
            pairIndex.toString(),
        ]);
        return new OpenInterest(constants_2.BIGINT_ZERO, constants_2.BIGINT_ZERO);
    }
    const openInterestLong = openInterestLongCall.value;
    const openInterestShortCall = storageContract.try_openInterestDai(pairIndex, constants_2.BIGINT_ONE);
    if (openInterestShortCall.reverted) {
        graph_ts_1.log.error("[openInterestShortCall reverted] hash: {} pairIndex: {}", [
            event.transaction.hash.toHexString(),
            pairIndex.toString(),
        ]);
        return new OpenInterest(constants_2.BIGINT_ZERO, constants_2.BIGINT_ZERO);
    }
    const openInterestShort = openInterestShortCall.value;
    return new OpenInterest(openInterestLong, openInterestShort);
}
exports.getPairOpenInterest = getPairOpenInterest;
function getFundingRate(pairIndex, event) {
    const pairInfoContract = PairInfo_1.PairInfo.bind(configure_1.NetworkConfigs.getPairInfoAddress());
    const fundingRatePerBlockCall = pairInfoContract.try_getFundingFeePerBlockP(pairIndex);
    if (fundingRatePerBlockCall.reverted) {
        graph_ts_1.log.error("[fundingRatePerBlockCall reverted]  hash: {} pairInfoContract: {} pairIndex: {}", [
            event.transaction.hash.toHexString(),
            configure_1.NetworkConfigs.getPairInfoAddress().toHexString(),
            pairIndex.toString(),
        ]);
        return constants_2.BIGDECIMAL_ZERO;
    }
    const fundingRatePerBlock = fundingRatePerBlockCall.value;
    const fundingRatePerDay = (0, rewards_1.getRewardsPerDay)(event.block.timestamp, event.block.number, fundingRatePerBlock.toBigDecimal(), rewards_1.RewardIntervalType.BLOCK).div(constants_1.PRECISION_BD);
    return fundingRatePerDay;
}
exports.getFundingRate = getFundingRate;
function getSharesTransferred(collateralAmount, event) {
    const vaultContract = Vault_1.Vault.bind(configure_1.NetworkConfigs.getVaultAddress());
    const sharesTransferredCall = vaultContract.try_convertToShares(collateralAmount);
    if (sharesTransferredCall.reverted) {
        graph_ts_1.log.error("[sharesTransferredCall reverted] hash: {} collateralAmount: {}", [event.transaction.hash.toHexString(), collateralAmount.toString()]);
        return constants_2.BIGINT_ZERO;
    }
    const sharesTransferred = sharesTransferredCall.value;
    return sharesTransferred;
}
exports.getSharesTransferred = getSharesTransferred;
function openTrade(pool, account, position, pairIndex, collateralToken, collateralAmount, leverage, sharesTransferred, fundingRatePerDay, event) {
    const leveragedAmount = collateralAmount.times(leverage);
    pool.addInflowVolumeByToken(collateralToken, leveragedAmount);
    pool.addVolumeByToken(collateralToken, leveragedAmount);
    const pairStorageContract = PairStorage_1.PairStorage.bind(configure_1.NetworkConfigs.getPairStorageAddress());
    const openFeePCall = pairStorageContract.try_pairOpenFeeP(pairIndex);
    if (openFeePCall.reverted) {
        graph_ts_1.log.error("[openFeePCall reverted] hash: {} pairIndex: {}", [
            event.transaction.hash.toHexString(),
            pairIndex.toString(),
        ]);
        return;
    }
    const openFeeP = openFeePCall.value;
    const openingFee = (0, numbers_1.bigDecimalToBigInt)(leveragedAmount
        .times(openFeeP)
        .toBigDecimal()
        .div(constants_1.PRECISION_BD.times(constants_2.BIGDECIMAL_HUNDRED)));
    pool.addPremiumByToken(collateralToken, openingFee, enums_1.TransactionType.COLLATERAL_IN);
    const positionID = position.getBytesID();
    const collateralAmounts = createTokenAmountArray(pool, [collateralToken], [collateralAmount]);
    account.collateralIn(pool, positionID, collateralAmounts, sharesTransferred);
    if (leverage > constants_2.BIGINT_ONE) {
        account.borrow(pool, positionID, graph_ts_1.Address.fromBytes(collateralToken.id), leveragedAmount.minus(collateralAmount));
    }
    position.setLeverage(leverage.toBigDecimal());
    position.setBalance(collateralToken, collateralAmount);
    position.setCollateralBalance(collateralToken, collateralAmount);
    position.addCollateralInCount();
    position.setFundingrateOpen(fundingRatePerDay);
}
exports.openTrade = openTrade;
function closeTrade(pool, account, position, pairIndex, collateralToken, collateralAmount, leverage, sharesTransferred, fundingRatePerDay, percentProfit, isExistingOpenPosition, event, isLiquidation, liquidator = null, liquidatee = null) {
    const leveragedAmount = collateralAmount.times(leverage);
    const pnl = collateralAmount
        .times(percentProfit)
        .toBigDecimal()
        .div(constants_1.PRECISION_BD.times(constants_2.BIGDECIMAL_HUNDRED));
    const pnlAmount = collateralAmount.plus((0, numbers_1.bigDecimalToBigInt)(pnl));
    const pairStorageContract = PairStorage_1.PairStorage.bind(configure_1.NetworkConfigs.getPairStorageAddress());
    const closeFeePCall = pairStorageContract.try_pairCloseFeeP(pairIndex);
    if (closeFeePCall.reverted) {
        graph_ts_1.log.error("[closeFeePCall reverted] hash: {} pairIndex: {}", [
            event.transaction.hash.toHexString(),
            pairIndex.toString(),
        ]);
        return;
    }
    const closeFeeP = closeFeePCall.value;
    const closingFee = (0, numbers_1.bigDecimalToBigInt)(leveragedAmount
        .times(closeFeeP)
        .toBigDecimal()
        .div(constants_1.PRECISION_BD.times(constants_2.BIGDECIMAL_HUNDRED)));
    const positionID = position.getBytesID();
    position.setFundingrateClosed(fundingRatePerDay);
    position.closePosition(isExistingOpenPosition);
    if (isLiquidation) {
        if (percentProfit <= constants_2.BIGINT_ZERO) {
            pool.addClosedInflowVolumeByToken(collateralToken, collateralAmount);
        }
        pool.addPremiumByToken(collateralToken, closingFee, enums_1.TransactionType.LIQUIDATE);
        account.liquidate(pool, graph_ts_1.Address.fromBytes(collateralToken.id), graph_ts_1.Address.fromBytes(collateralToken.id), collateralAmount, liquidator, liquidatee, positionID, pnl);
        position.addLiquidationCount();
        position.setBalanceClosed(collateralToken, constants_2.BIGINT_ZERO);
        position.setCollateralBalanceClosed(collateralToken, constants_2.BIGINT_ZERO);
        position.setRealisedPnlClosed(collateralToken, (0, numbers_1.bigDecimalToBigInt)(pnl));
    }
    else {
        if (percentProfit <= constants_2.BIGINT_ZERO) {
            pool.addClosedInflowVolumeByToken(collateralToken, collateralAmount.minus(pnlAmount));
            pool.addOutflowVolumeByToken(collateralToken, pnlAmount);
            pool.addVolumeByToken(collateralToken, pnlAmount);
            position.setBalanceClosed(collateralToken, pnlAmount);
            position.setCollateralBalanceClosed(collateralToken, pnlAmount);
            position.setRealisedPnlClosed(collateralToken, (0, numbers_1.bigDecimalToBigInt)(pnl));
        }
        else {
            const leveragedPnlAmount = pnlAmount.times(leverage);
            pool.addOutflowVolumeByToken(collateralToken, leveragedPnlAmount);
            pool.addVolumeByToken(collateralToken, leveragedPnlAmount);
            position.setBalanceClosed(collateralToken, leveragedPnlAmount);
            position.setCollateralBalanceClosed(collateralToken, leveragedPnlAmount);
            position.setRealisedPnlClosed(collateralToken, (0, numbers_1.bigDecimalToBigInt)(pnl).times(leverage));
        }
        pool.addPremiumByToken(collateralToken, closingFee, enums_1.TransactionType.COLLATERAL_OUT);
        const collateralAmounts = createTokenAmountArray(pool, [collateralToken], [pnlAmount]);
        account.collateralOut(pool, positionID, collateralAmounts, sharesTransferred);
        position.addCollateralOutCount();
    }
}
exports.closeTrade = closeTrade;
