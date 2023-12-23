"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRevenue = exports.updatePriceForMarket = exports.createTransactions = exports.updateUsageMetrics = exports.snapshotPosition = exports.liquidatePosition = exports.transferPosition = exports.updatePosition = exports.updateFinancialsSnapshot = exports.snapshotMarket = exports.updateMarket = exports.updateProtocol = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const getters_1 = require("./getters");
const constants_1 = require("./constants");
const strings_1 = require("../utils/strings");
const numbers_1 = require("../utils/numbers");
const DAI_1 = require("../../generated/Vat/DAI");
const getters_2 = require("./getters");
function updateProtocol(deltaCollateralUSD = constants_1.BIGDECIMAL_ZERO, deltaDebtUSD = constants_1.BIGDECIMAL_ZERO, liquidateUSD = constants_1.BIGDECIMAL_ZERO, newTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO, newSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO, protocolSideRevenueType = 0) {
    const protocol = (0, getters_1.getOrCreateLendingProtocol)();
    // update Deposit
    if (deltaCollateralUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        protocol.cumulativeDepositUSD =
            protocol.cumulativeDepositUSD.plus(deltaCollateralUSD);
    }
    // protocol.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD.plus(deltaCollateralUSD);
    // instead, iterate over markets to get "mark-to-market" deposit balance
    let totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    let totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    for (let i = 0; i < protocol.marketIDList.length; i++) {
        const marketID = protocol.marketIDList[i];
        const market = schema_1.Market.load(marketID);
        totalBorrowBalanceUSD = totalBorrowBalanceUSD.plus(market.totalBorrowBalanceUSD);
        totalDepositBalanceUSD = totalDepositBalanceUSD.plus(market.totalDepositBalanceUSD);
    }
    protocol.totalBorrowBalanceUSD = totalBorrowBalanceUSD;
    protocol.totalDepositBalanceUSD = totalDepositBalanceUSD;
    protocol.totalValueLockedUSD = protocol.totalDepositBalanceUSD;
    /* alternatively, get total borrow (debt) from vat.debt
    // this would include borrow interest, etc
    // so they two will have some difference
    let vatContract = Vat.bind(Address.fromString(VAT_ADDRESS));
    let debtCall = vatContract.try_debt();
    if (debtCall.reverted) {
      log.warning("[updateProtocal]Failed to call Vat.debt; not updating protocol.totalBorrowBalanceUSD", []);
    } else {
      protocol.totalBorrowBalanceUSD = bigIntToBDUseDecimals(debtCall.value, RAD+);
    }
    */
    // update Borrow
    if (deltaDebtUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        protocol.cumulativeBorrowUSD =
            protocol.cumulativeBorrowUSD.plus(deltaDebtUSD);
    }
    if (liquidateUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        protocol.cumulativeLiquidateUSD =
            protocol.cumulativeLiquidateUSD.plus(liquidateUSD);
    }
    if (newTotalRevenueUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        protocol.cumulativeTotalRevenueUSD =
            protocol.cumulativeTotalRevenueUSD.plus(newTotalRevenueUSD);
    }
    if (newSupplySideRevenueUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        protocol.cumulativeSupplySideRevenueUSD =
            protocol.cumulativeSupplySideRevenueUSD.plus(newSupplySideRevenueUSD);
    }
    const newProtocolSideRevenueUSD = newTotalRevenueUSD.minus(newSupplySideRevenueUSD);
    if (newProtocolSideRevenueUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        protocol.cumulativeProtocolSideRevenueUSD =
            protocol.cumulativeTotalRevenueUSD.minus(protocol.cumulativeSupplySideRevenueUSD);
        switch (protocolSideRevenueType) {
            case constants_1.ProtocolSideRevenueType.STABILITYFEE:
                protocol._cumulativeProtocolSideStabilityFeeRevenue =
                    protocol._cumulativeProtocolSideStabilityFeeRevenue.plus(newProtocolSideRevenueUSD);
                break;
            case constants_1.ProtocolSideRevenueType.LIQUIDATION:
                protocol._cumulativeProtocolSideLiquidationRevenue =
                    protocol._cumulativeProtocolSideLiquidationRevenue.plus(newProtocolSideRevenueUSD);
                break;
            case constants_1.ProtocolSideRevenueType.PSM:
                protocol._cumulativeProtocolSidePSMRevenue =
                    protocol._cumulativeProtocolSidePSMRevenue.plus(newProtocolSideRevenueUSD);
                break;
        }
    }
    // update mintedTokenSupplies
    const daiContract = DAI_1.DAI.bind(graph_ts_1.Address.fromString(constants_1.DAI_ADDRESS));
    protocol.mintedTokens = [constants_1.DAI_ADDRESS];
    protocol.mintedTokenSupplies = [daiContract.totalSupply()];
    protocol.save();
}
exports.updateProtocol = updateProtocol;
function updateMarket(event, market, deltaCollateral = constants_1.BIGINT_ZERO, deltaCollateralUSD = constants_1.BIGDECIMAL_ZERO, deltaDebtUSD = constants_1.BIGDECIMAL_ZERO, liquidateUSD = constants_1.BIGDECIMAL_ZERO, newTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO, newSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO) {
    const token = (0, getters_2.getOrCreateToken)(market.inputToken);
    if (deltaCollateral != constants_1.BIGINT_ZERO) {
        // deltaCollateral can be positive or negative
        market.inputTokenBalance = market.inputTokenBalance.plus(deltaCollateral);
        if (deltaCollateral.gt(constants_1.BIGINT_ZERO)) {
            market.cumulativeDepositUSD =
                market.cumulativeDepositUSD.plus(deltaCollateralUSD);
        }
        else if (deltaCollateral.lt(constants_1.BIGINT_ZERO)) {
            // ignore as we don't care about cumulativeWithdraw in a market
        }
    }
    if (token.lastPriceUSD) {
        market.inputTokenPriceUSD = token.lastPriceUSD;
        // here we "mark-to-market" - re-price total collateral using last price
        market.totalDepositBalanceUSD = (0, numbers_1.bigIntToBDUseDecimals)(market.inputTokenBalance, token.decimals).times(market.inputTokenPriceUSD);
    }
    else if (deltaCollateralUSD != constants_1.BIGDECIMAL_ZERO) {
        market.totalDepositBalanceUSD =
            market.totalDepositBalanceUSD.plus(deltaCollateralUSD);
    }
    market.totalValueLockedUSD = market.totalDepositBalanceUSD;
    if (deltaDebtUSD != constants_1.BIGDECIMAL_ZERO) {
        market.totalBorrowBalanceUSD =
            market.totalBorrowBalanceUSD.plus(deltaDebtUSD);
        if (deltaDebtUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
            market.cumulativeBorrowUSD =
                market.cumulativeBorrowUSD.plus(deltaDebtUSD);
        }
        else if (deltaDebtUSD.lt(constants_1.BIGDECIMAL_ZERO)) {
            // again ignore repay
        }
    }
    if (liquidateUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        market.cumulativeLiquidateUSD =
            market.cumulativeLiquidateUSD.plus(liquidateUSD);
    }
    // update revenue
    if (newTotalRevenueUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        market.cumulativeTotalRevenueUSD =
            market.cumulativeTotalRevenueUSD.plus(newTotalRevenueUSD);
    }
    if (newSupplySideRevenueUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        market.cumulativeSupplySideRevenueUSD =
            market.cumulativeSupplySideRevenueUSD.plus(newSupplySideRevenueUSD);
    }
    if (newTotalRevenueUSD.gt(constants_1.BIGDECIMAL_ZERO) ||
        newSupplySideRevenueUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        market.cumulativeProtocolSideRevenueUSD =
            market.cumulativeTotalRevenueUSD.minus(market.cumulativeSupplySideRevenueUSD);
    }
    market.save();
    snapshotMarket(event, market, deltaCollateralUSD, deltaDebtUSD, liquidateUSD, newTotalRevenueUSD, newSupplySideRevenueUSD);
}
exports.updateMarket = updateMarket;
function snapshotMarket(event, market, deltaCollateralUSD = constants_1.BIGDECIMAL_ZERO, deltaDebtUSD = constants_1.BIGDECIMAL_ZERO, liquidateUSD = constants_1.BIGDECIMAL_ZERO, newTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO, newSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO) {
    const marketID = market.id;
    const marketHourlySnapshot = (0, getters_1.getOrCreateMarketHourlySnapshot)(event, marketID);
    const marketDailySnapshot = (0, getters_1.getOrCreateMarketDailySnapshot)(event, marketID);
    if (marketHourlySnapshot == null || marketDailySnapshot == null) {
        graph_ts_1.log.error("[snapshotMarket]Failed to get marketsnapshot for {}", [
            marketID,
        ]);
        return;
    }
    const hours = (event.block.timestamp.toI32() / constants_1.SECONDS_PER_HOUR).toString();
    const hourlySnapshotRates = (0, getters_1.getSnapshotRates)(market.rates, hours);
    const days = (event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY).toString();
    const dailySnapshotRates = (0, getters_1.getSnapshotRates)(market.rates, days);
    marketHourlySnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
    marketHourlySnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketHourlySnapshot.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD;
    marketHourlySnapshot.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD;
    marketHourlySnapshot.cumulativeTotalRevenueUSD =
        market.cumulativeTotalRevenueUSD;
    marketHourlySnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketHourlySnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketHourlySnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketHourlySnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketHourlySnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketHourlySnapshot.inputTokenBalance = market.inputTokenBalance;
    marketHourlySnapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketHourlySnapshot.rates = hourlySnapshotRates;
    //marketHourlySnapshot.outputTokenSupply = market.outputTokenSupply;
    //marketHourlySnapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
    marketHourlySnapshot.blockNumber = event.block.number;
    marketHourlySnapshot.timestamp = event.block.timestamp;
    marketDailySnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
    marketDailySnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketDailySnapshot.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD;
    marketDailySnapshot.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD;
    marketDailySnapshot.cumulativeTotalRevenueUSD =
        market.cumulativeTotalRevenueUSD;
    marketDailySnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketDailySnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketDailySnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketDailySnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketDailySnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketDailySnapshot.inputTokenBalance = market.inputTokenBalance;
    marketDailySnapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketDailySnapshot.rates = dailySnapshotRates;
    //marketDailySnapshot.outputTokenSupply = market.outputTokenSupply;
    //marketDailySnapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
    marketDailySnapshot.blockNumber = event.block.number;
    marketDailySnapshot.timestamp = event.block.timestamp;
    if (deltaCollateralUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        marketHourlySnapshot.hourlyDepositUSD =
            marketHourlySnapshot.hourlyDepositUSD.plus(deltaCollateralUSD);
        marketDailySnapshot.dailyDepositUSD =
            marketDailySnapshot.dailyDepositUSD.plus(deltaCollateralUSD);
    }
    else if (deltaCollateralUSD.lt(constants_1.BIGDECIMAL_ZERO)) {
        // minus a negative number
        marketHourlySnapshot.hourlyWithdrawUSD =
            marketHourlySnapshot.hourlyWithdrawUSD.minus(deltaCollateralUSD);
        marketDailySnapshot.dailyWithdrawUSD =
            marketDailySnapshot.dailyWithdrawUSD.minus(deltaCollateralUSD);
    }
    if (deltaDebtUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        marketHourlySnapshot.hourlyBorrowUSD =
            marketHourlySnapshot.hourlyBorrowUSD.plus(deltaDebtUSD);
        marketDailySnapshot.dailyBorrowUSD =
            marketDailySnapshot.dailyBorrowUSD.plus(deltaDebtUSD);
    }
    else if (deltaDebtUSD.lt(constants_1.BIGDECIMAL_ZERO)) {
        // minus a negative number
        marketHourlySnapshot.hourlyRepayUSD =
            marketHourlySnapshot.hourlyRepayUSD.minus(deltaDebtUSD);
        marketDailySnapshot.dailyRepayUSD =
            marketDailySnapshot.dailyRepayUSD.minus(deltaDebtUSD);
    }
    if (liquidateUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        marketHourlySnapshot.hourlyLiquidateUSD =
            marketHourlySnapshot.hourlyLiquidateUSD.plus(liquidateUSD);
        marketDailySnapshot.dailyLiquidateUSD =
            marketDailySnapshot.dailyLiquidateUSD.plus(liquidateUSD);
    }
    // update revenue
    if (newTotalRevenueUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        marketHourlySnapshot.hourlyTotalRevenueUSD =
            marketHourlySnapshot.hourlyTotalRevenueUSD.plus(newTotalRevenueUSD);
        marketDailySnapshot.dailyTotalRevenueUSD =
            marketDailySnapshot.dailyTotalRevenueUSD.plus(newTotalRevenueUSD);
    }
    if (newSupplySideRevenueUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        marketHourlySnapshot.hourlySupplySideRevenueUSD =
            marketHourlySnapshot.hourlySupplySideRevenueUSD.plus(newSupplySideRevenueUSD);
        marketDailySnapshot.dailySupplySideRevenueUSD =
            marketDailySnapshot.dailySupplySideRevenueUSD.plus(newSupplySideRevenueUSD);
    }
    if (newTotalRevenueUSD.gt(constants_1.BIGDECIMAL_ZERO) ||
        newSupplySideRevenueUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        marketHourlySnapshot.hourlyProtocolSideRevenueUSD =
            marketHourlySnapshot.hourlyTotalRevenueUSD.minus(marketHourlySnapshot.hourlySupplySideRevenueUSD);
        marketDailySnapshot.dailyProtocolSideRevenueUSD =
            marketDailySnapshot.dailyTotalRevenueUSD.minus(marketDailySnapshot.dailySupplySideRevenueUSD);
    }
    marketHourlySnapshot.save();
    marketDailySnapshot.save();
}
exports.snapshotMarket = snapshotMarket;
function updateFinancialsSnapshot(event, deltaCollateralUSD = constants_1.BIGDECIMAL_ZERO, deltaDebtUSD = constants_1.BIGDECIMAL_ZERO, liquidateUSD = constants_1.BIGDECIMAL_ZERO, newTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO, newSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO, protocolSideRevenueType = 0) {
    const protocol = (0, getters_1.getOrCreateLendingProtocol)();
    const financials = (0, getters_1.getOrCreateFinancials)(event);
    financials.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financials.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD;
    financials.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD;
    financials.mintedTokenSupplies = protocol.mintedTokenSupplies;
    financials.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
    financials.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    financials._cumulativeProtocolSideStabilityFeeRevenue =
        protocol._cumulativeProtocolSideStabilityFeeRevenue;
    financials._cumulativeProtocolSideLiquidationRevenue =
        protocol._cumulativeProtocolSideLiquidationRevenue;
    financials._cumulativeProtocolSidePSMRevenue =
        protocol._cumulativeProtocolSidePSMRevenue;
    financials.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD;
    financials.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
    financials.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
    financials.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD;
    if (deltaCollateralUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        financials.dailyDepositUSD =
            financials.dailyDepositUSD.plus(deltaCollateralUSD);
    }
    else if (deltaCollateralUSD.lt(constants_1.BIGDECIMAL_ZERO)) {
        // minus a negative number
        financials.dailyWithdrawUSD =
            financials.dailyWithdrawUSD.minus(deltaCollateralUSD);
    }
    if (deltaDebtUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        financials.dailyBorrowUSD = financials.dailyBorrowUSD.plus(deltaDebtUSD);
    }
    else if (deltaDebtUSD.lt(constants_1.BIGDECIMAL_ZERO)) {
        // minus a negative number
        financials.dailyRepayUSD = financials.dailyRepayUSD.minus(deltaDebtUSD);
    }
    if (liquidateUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        financials.dailyLiquidateUSD =
            financials.dailyLiquidateUSD.plus(liquidateUSD);
    }
    if (newTotalRevenueUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        financials.dailyTotalRevenueUSD =
            financials.dailyTotalRevenueUSD.plus(newTotalRevenueUSD);
    }
    if (newSupplySideRevenueUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        financials.dailySupplySideRevenueUSD =
            financials.dailySupplySideRevenueUSD.plus(newSupplySideRevenueUSD);
    }
    const newProtocolSideRevenueUSD = newTotalRevenueUSD.minus(newSupplySideRevenueUSD);
    if (newProtocolSideRevenueUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        financials.dailyProtocolSideRevenueUSD =
            financials.dailyTotalRevenueUSD.minus(financials.dailySupplySideRevenueUSD);
        switch (protocolSideRevenueType) {
            case constants_1.ProtocolSideRevenueType.STABILITYFEE:
                financials._dailyProtocolSideStabilityFeeRevenue =
                    financials._dailyProtocolSideStabilityFeeRevenue.plus(newProtocolSideRevenueUSD);
                break;
            case constants_1.ProtocolSideRevenueType.LIQUIDATION:
                financials._dailyProtocolSideLiquidationRevenue =
                    financials._dailyProtocolSideLiquidationRevenue.plus(newProtocolSideRevenueUSD);
                break;
            case constants_1.ProtocolSideRevenueType.PSM:
                financials._dailyProtocolSidePSMRevenue =
                    financials._dailyProtocolSidePSMRevenue.plus(newProtocolSideRevenueUSD);
                break;
        }
    }
    financials.blockNumber = event.block.number;
    financials.timestamp = event.block.timestamp;
    financials.save();
}
exports.updateFinancialsSnapshot = updateFinancialsSnapshot;
// updatePosition based on deposit/withdraw/borrow/repay
// Need to be called after createTransactions
function updatePosition(event, urn, ilk, deltaCollateral = constants_1.BIGINT_ZERO, deltaDebt = constants_1.BIGINT_ZERO) {
    const marketID = (0, getters_1.getMarketAddressFromIlk)(ilk).toHexString();
    const accountAddress = (0, getters_1.getOwnerAddress)(urn);
    const eventID = (0, strings_1.createEventID)(event); // deposit, withdraw, borrow, repay, liquidate
    const protocol = (0, getters_1.getOrCreateLendingProtocol)();
    const market = (0, getters_1.getOrCreateMarket)(marketID);
    const account = (0, getters_1.getOrCreateAccount)(accountAddress);
    if (deltaCollateral.notEqual(constants_1.BIGINT_ZERO)) {
        let lenderPosition = (0, getters_1.getOpenPosition)(urn, ilk, constants_1.PositionSide.LENDER);
        if (lenderPosition == null) {
            // this is a new lender position, deltaCollateral > 0
            // because user cannot create a lender position with deltaCollateral <=0
            lenderPosition = (0, getters_1.getOrCreatePosition)(event, urn, ilk, constants_1.PositionSide.LENDER, true);
            if (deltaCollateral.le(constants_1.BIGINT_ZERO)) {
                graph_ts_1.log.error("[updatePosition]Creating a new lender position {} with deltaCollateral ={} <= 0 at tx {}-{}", [
                    lenderPosition.id,
                    deltaCollateral.toString(),
                    event.transaction.hash.toHexString(),
                    event.transactionLogIndex.toString(),
                ]);
                graph_ts_1.log.critical("", []);
            }
            protocol.openPositionCount += constants_1.INT_ONE;
            protocol.cumulativePositionCount += constants_1.INT_ONE;
            market.positionCount += constants_1.INT_ONE;
            market.openPositionCount += constants_1.INT_ONE;
            market.lendingPositionCount += constants_1.INT_ONE;
            account.positionCount += constants_1.INT_ONE;
            account.openPositionCount += constants_1.INT_ONE;
            //account.depositCount += INT_ONE;
        }
        lenderPosition.balance = lenderPosition.balance.plus(deltaCollateral);
        // this may be less than 0 (but > -100) from rounding & for tokens with decimals < 18
        // because we keep position balance in native unit, but maker always keep them in WAD (18 decimals)
        //
        // for example 1. at block 12507581, urn 0x03453d22095c0edd61cd40c3ccdc394a0e85dc1a
        // repaid -203334964101176257798573 dai, when the borrow balance
        // was 203334964101176257798572
        // 2. at block 14055178, urn 0x1c47bb6773db2a441264c1af2c943d8bdfaf19fe
        // repaid -30077488379451392498995529 dai, when the borrow balance
        // was 30077488379451392498995503
        if (lenderPosition.balance.lt(constants_1.BIGINT_ZERO)) {
            if (lenderPosition.balance.ge(constants_1.BIGINT_NEG_HUNDRED)) {
                // a small negative lender position, likely due to rounding
                lenderPosition.balance = constants_1.BIGINT_ZERO;
            }
            else {
                graph_ts_1.log.error("[updatePosition]A negative lender balance of {} for position {} with tx {}-{}", [
                    lenderPosition.balance.toString(),
                    lenderPosition.id,
                    event.transaction.hash.toHexString(),
                    event.transactionLogIndex.toString(),
                ]);
                graph_ts_1.log.critical("", []);
            }
        }
        if (deltaCollateral.gt(constants_1.BIGINT_ZERO)) {
            // deposit
            lenderPosition.depositCount += constants_1.INT_ONE;
            // link event to position (createTransactions needs to be called first)
            const deposit = schema_1.Deposit.load(eventID);
            deposit.position = lenderPosition.id;
            deposit.save();
        }
        else if (deltaCollateral.lt(constants_1.BIGINT_ZERO)) {
            lenderPosition.withdrawCount += constants_1.INT_ONE;
            if (lenderPosition.balance == constants_1.BIGINT_ZERO) {
                // close lender position
                lenderPosition.blockNumberClosed = event.block.number;
                lenderPosition.timestampClosed = event.block.timestamp;
                lenderPosition.hashClosed = event.transaction.hash.toHexString();
                protocol.openPositionCount -= constants_1.INT_ONE;
                market.openPositionCount -= constants_1.INT_ONE;
                market.closedPositionCount += constants_1.INT_ONE;
                account.openPositionCount -= constants_1.INT_ONE;
                account.closedPositionCount += constants_1.INT_ONE;
            }
            // link event to position (createTransactions needs to be called first)
            const withdraw = schema_1.Withdraw.load(eventID);
            withdraw.position = lenderPosition.id;
            withdraw.save();
        }
        graph_ts_1.log.info("[updatePosition]position positionID={}, account={}, balance={}", [
            lenderPosition.id,
            lenderPosition.account,
            lenderPosition.balance.toString(),
        ]);
        lenderPosition.save();
        snapshotPosition(event, lenderPosition);
    }
    if (deltaDebt.notEqual(constants_1.BIGINT_ZERO)) {
        let borrowerPosition = (0, getters_1.getOpenPosition)(urn, ilk, constants_1.PositionSide.BORROWER);
        if (borrowerPosition == null) {
            // new borrower position
            borrowerPosition = (0, getters_1.getOrCreatePosition)(event, urn, ilk, constants_1.PositionSide.BORROWER, true);
            if (deltaDebt.le(constants_1.BIGINT_ZERO)) {
                graph_ts_1.log.error("[updatePosition]Creating a new lender position {} with deltaDebt={} <= 0 at tx {}-{}", [
                    borrowerPosition.id,
                    deltaDebt.toString(),
                    event.transaction.hash.toHexString(),
                    event.transactionLogIndex.toString(),
                ]);
                graph_ts_1.log.critical("", []);
            }
            protocol.openPositionCount += constants_1.INT_ONE;
            protocol.cumulativePositionCount += constants_1.INT_ONE;
            market.positionCount += constants_1.INT_ONE;
            market.openPositionCount += constants_1.INT_ONE;
            market.borrowingPositionCount += constants_1.INT_ONE;
            account.positionCount += constants_1.INT_ONE;
            account.openPositionCount += constants_1.INT_ONE;
        }
        borrowerPosition.balance = borrowerPosition.balance.plus(deltaDebt);
        // see comment above for lenderPosition.balance
        if (borrowerPosition.balance.lt(constants_1.BIGINT_ZERO)) {
            if (borrowerPosition.balance.ge(constants_1.BIGINT_NEG_HUNDRED)) {
                // a small negative lender position, likely due to rounding
                borrowerPosition.balance = constants_1.BIGINT_ZERO;
            }
            else {
                graph_ts_1.log.error("[updatePosition]A negative lender balance of {} for position {} with tx {}-{}", [
                    borrowerPosition.balance.toString(),
                    borrowerPosition.id,
                    event.transaction.hash.toHexString(),
                    event.transactionLogIndex.toString(),
                ]);
                graph_ts_1.log.critical("", []);
            }
            graph_ts_1.log.critical("", []);
        }
        if (deltaDebt.gt(constants_1.BIGINT_ZERO)) {
            borrowerPosition.borrowCount += constants_1.INT_ONE;
            //account.borrowCount += INT_ONE;
            // link event to position (createTransactions needs to be called first)
            const borrow = schema_1.Borrow.load(eventID);
            borrow.position = borrowerPosition.id;
            borrow.save();
        }
        else if (deltaDebt.lt(constants_1.BIGINT_ZERO)) {
            borrowerPosition.repayCount += constants_1.INT_ONE;
            if (borrowerPosition.balance == constants_1.BIGINT_ZERO) {
                // close borrowerPosition
                borrowerPosition.blockNumberClosed = event.block.number;
                borrowerPosition.timestampClosed = event.block.timestamp;
                borrowerPosition.hashClosed = event.transaction.hash.toHexString();
                protocol.openPositionCount -= constants_1.INT_ONE;
                market.openPositionCount -= constants_1.INT_ONE;
                market.closedPositionCount += constants_1.INT_ONE;
                account.openPositionCount -= constants_1.INT_ONE;
                account.closedPositionCount += constants_1.INT_ONE;
                //account.repayCount += INT_ONE;
            }
            const repay = schema_1.Repay.load(eventID);
            repay.position = borrowerPosition.id;
            repay.save();
        }
        graph_ts_1.log.info("[updatePosition]position positionID={}, account={}, balance={}", [
            borrowerPosition.id,
            borrowerPosition.account,
            borrowerPosition.balance.toString(),
        ]);
        borrowerPosition.save();
        snapshotPosition(event, borrowerPosition);
    }
    protocol.save();
    market.save();
    account.save();
    if (account.openPositionCount < 0) {
        graph_ts_1.log.error("[updatePosition]urn {} for account {} openPositionCount={} at tx {}-{}", [
            urn,
            account.id,
            account.openPositionCount.toString(),
            event.transaction.hash.toHexString(),
            event.transactionLogIndex.toString(),
        ]);
        graph_ts_1.log.critical("", []);
    }
}
exports.updatePosition = updatePosition;
// handle transfer of position from one user account (src) to another (dst),
// possibly to another urn address
function transferPosition(event, ilk, srcUrn, // src urn
dstUrn, // dst urn
side, srcAccountAddress = null, dstAccountAddress = null, transferAmount = null // suport partial transfer of a position
) {
    if (srcUrn == dstUrn && srcAccountAddress == dstAccountAddress) {
        graph_ts_1.log.info("[transferPosition]srcUrn {}==dstUrn {} && srcAccountAddress {}==dstAccountAddress {}, no transfer", [
            srcUrn,
            dstUrn,
            srcAccountAddress ? srcAccountAddress : "null",
            dstAccountAddress ? dstAccountAddress : "null",
        ]);
        return;
    }
    const protocol = (0, getters_1.getOrCreateLendingProtocol)();
    const market = (0, getters_1.getMarketFromIlk)(ilk);
    const usageHourlySnapshot = (0, getters_1.getOrCreateUsageMetricsHourlySnapshot)(event);
    const usageDailySnapshot = (0, getters_1.getOrCreateUsageMetricsDailySnapshot)(event);
    if (srcAccountAddress == null) {
        srcAccountAddress = (0, getters_1.getOwnerAddress)(srcUrn).toLowerCase();
    }
    const srcAccount = (0, getters_1.getOrCreateAccount)(srcAccountAddress);
    const srcPosition = (0, getters_1.getOpenPosition)(srcUrn, ilk, side);
    if (srcPosition == null) {
        graph_ts_1.log.warning("[transferPosition]No open position found for source: urn {}/ilk {}/side {}; no transfer", [srcUrn, ilk.toHexString(), side]);
        return;
    }
    const srcPositionBalance0 = srcPosition.balance;
    if (!transferAmount || transferAmount > srcPosition.balance) {
        const transferAmountStr = transferAmount
            ? transferAmount.toString()
            : "null";
        graph_ts_1.log.warning("[transferPosition]transferAmount={} is null or > src position balance {} for {}", [transferAmountStr, srcPosition.balance.toString(), srcPosition.id]);
        transferAmount = srcPosition.balance;
    }
    assert(transferAmount <= srcPosition.balance, `[transferPosition]src ${srcUrn}/ilk ${ilk.toHexString()}/side ${side} transfer amount ${transferAmount.toString()} > balance ${srcPosition.balance}`);
    srcPosition.balance = srcPosition.balance.minus(transferAmount);
    if (srcPosition.balance == constants_1.BIGINT_ZERO) {
        srcPosition.blockNumberClosed = event.block.number;
        srcPosition.timestampClosed = event.block.timestamp;
        srcPosition.hashClosed = event.transaction.hash.toHexString();
        protocol.openPositionCount -= constants_1.INT_ONE;
        market.openPositionCount -= constants_1.INT_ONE;
        market.closedPositionCount += constants_1.INT_ONE;
        srcAccount.openPositionCount -= constants_1.INT_ONE;
        srcAccount.closedPositionCount += constants_1.INT_ONE;
    }
    srcPosition.save();
    snapshotPosition(event, srcPosition);
    if (dstAccountAddress == null) {
        dstAccountAddress = (0, getters_1.getOwnerAddress)(dstUrn).toLowerCase();
    }
    let dstAccount = schema_1.Account.load(dstAccountAddress);
    if (dstAccount == null) {
        dstAccount = (0, getters_1.getOrCreateAccount)(dstAccountAddress);
        protocol.cumulativeUniqueUsers += 1;
        usageDailySnapshot.cumulativeUniqueUsers += 1;
        usageHourlySnapshot.cumulativeUniqueUsers += 1;
    }
    // transfer srcUrn to dstUrn
    // or partial transfer of a position (amount < position.balance)
    let dstPosition = (0, getters_1.getOpenPosition)(dstUrn, ilk, side);
    if (!dstPosition) {
        dstPosition = (0, getters_1.getOrCreatePosition)(event, dstUrn, ilk, side, true);
    }
    dstPosition.balance = dstPosition.balance.plus(transferAmount);
    dstPosition.save();
    snapshotPosition(event, dstPosition);
    protocol.openPositionCount += constants_1.INT_ONE;
    protocol.cumulativePositionCount += constants_1.INT_ONE;
    market.openPositionCount += constants_1.INT_ONE;
    market.positionCount += constants_1.INT_ONE;
    if (side == constants_1.PositionSide.BORROWER) {
        market.borrowingPositionCount += constants_1.INT_ONE;
    }
    else if (side == constants_1.PositionSide.LENDER) {
        market.lendingPositionCount += constants_1.INT_ONE;
    }
    dstAccount.openPositionCount += constants_1.INT_ONE;
    dstAccount.positionCount += constants_1.INT_ONE;
    graph_ts_1.log.info("[transferPosition]transfer {} from {} (is_urn={},balance={}) to {} (is_urn={},balance={})", [
        transferAmount.toString(),
        srcPosition.id,
        srcPosition._is_urn.toString(),
        srcPositionBalance0.toString(),
        dstPosition.id,
        dstPosition._is_urn.toString(),
        dstPosition.balance.toString(),
    ]);
    protocol.save();
    market.save();
    usageDailySnapshot.save();
    usageHourlySnapshot.save();
    srcAccount.save();
    dstAccount.save();
    assert(srcAccount.openPositionCount >= 0, `Account ${srcAccount.id} openPositionCount=${srcAccount.openPositionCount}`);
    assert(dstAccount.openPositionCount >= 0, `Account ${dstAccount.id} openPositionCount=${dstAccount.openPositionCount}`);
}
exports.transferPosition = transferPosition;
// handle liquidations for Position entity
function liquidatePosition(event, urn, ilk, collateral, // net collateral liquidated
debt // debt repaid
) {
    const protocol = (0, getters_1.getOrCreateLendingProtocol)();
    const market = (0, getters_1.getMarketFromIlk)(ilk);
    const accountAddress = (0, getters_1.getOwnerAddress)(urn);
    const account = (0, getters_1.getOrCreateAccount)(accountAddress);
    graph_ts_1.log.info("[liquidatePosition]urn={}, ilk={}, collateral={}, debt={}", [
        urn,
        ilk.toHexString(),
        collateral.toString(),
        debt.toString(),
    ]);
    const borrowerPosition = (0, getters_1.getOpenPosition)(urn, ilk, constants_1.PositionSide.BORROWER);
    const lenderPosition = (0, getters_1.getOpenPosition)(urn, ilk, constants_1.PositionSide.LENDER);
    if (debt > borrowerPosition.balance) {
        //this can happen because of rounding
        graph_ts_1.log.warning("[liquidatePosition]debt repaid {} > borrowing balance {}", [
            debt.toString(),
            borrowerPosition.balance.toString(),
        ]);
        debt = borrowerPosition.balance;
    }
    borrowerPosition.balance = borrowerPosition.balance.minus(debt);
    borrowerPosition.liquidationCount += constants_1.INT_ONE;
    assert(borrowerPosition.balance.ge(constants_1.BIGINT_ZERO), `[liquidatePosition]balance of position ${borrowerPosition.id} ${borrowerPosition.balance} < 0`);
    // liquidation closes the borrowing side position
    if (borrowerPosition.balance == constants_1.BIGINT_ZERO) {
        borrowerPosition.blockNumberClosed = event.block.number;
        borrowerPosition.timestampClosed = event.block.timestamp;
        borrowerPosition.hashClosed = event.transaction.hash.toHexString();
        snapshotPosition(event, borrowerPosition);
        protocol.openPositionCount -= constants_1.INT_ONE;
        market.openPositionCount -= constants_1.INT_ONE;
        market.closedPositionCount += constants_1.INT_ONE;
        market.borrowingPositionCount -= constants_1.INT_ONE;
        account.openPositionCount -= constants_1.INT_ONE;
        account.closedPositionCount += constants_1.INT_ONE;
    }
    borrowerPosition.save();
    snapshotPosition(event, borrowerPosition);
    lenderPosition.balance = lenderPosition.balance.minus(collateral);
    lenderPosition.liquidationCount += constants_1.INT_ONE;
    if (lenderPosition.balance == constants_1.BIGINT_ZERO) {
        // lender side is closed
        lenderPosition.blockNumberClosed = event.block.number;
        lenderPosition.timestampClosed = event.block.timestamp;
        lenderPosition.hashClosed = event.transaction.hash.toHexString();
        protocol.openPositionCount -= constants_1.INT_ONE;
        market.openPositionCount -= constants_1.INT_ONE;
        market.closedPositionCount += constants_1.INT_ONE;
        market.lendingPositionCount -= constants_1.INT_ONE;
        account.openPositionCount -= constants_1.INT_ONE;
        account.closedPositionCount += constants_1.INT_ONE;
    }
    lenderPosition.save();
    snapshotPosition(event, lenderPosition);
    protocol.save();
    market.save();
    account.save();
    //assert(account.openPositionCount >= 0, `Account ${account.id} openPositionCount=${account.openPositionCount}`);
    return [lenderPosition.id, borrowerPosition.id];
}
exports.liquidatePosition = liquidatePosition;
function snapshotPosition(event, position) {
    const txHash = event.transaction.hash.toHexString();
    const snapshotID = `${position.id}-${txHash}-${event.logIndex.toString()}`;
    let snapshot = schema_1.PositionSnapshot.load(snapshotID);
    if (snapshot == null) {
        // this should always be the case with schema v2.0.1
        snapshot = new schema_1.PositionSnapshot(snapshotID);
        snapshot.hash = txHash;
        snapshot.logIndex = event.logIndex.toI32();
        snapshot.nonce = event.transaction.nonce;
        snapshot.position = position.id;
        snapshot.balance = position.balance;
        snapshot.blockNumber = event.block.number;
        snapshot.timestamp = event.block.timestamp;
        snapshot.save();
    }
    else {
        graph_ts_1.log.error("[snapshotPosition]Position snapshot {} already exists for position {} at tx hash {}", [snapshotID, position.id, txHash]);
    }
}
exports.snapshotPosition = snapshotPosition;
// update usage for deposit/withdraw/borrow/repay
function updateUsageMetrics(event, users = [], //user u, v, w
deltaCollateralUSD = constants_1.BIGDECIMAL_ZERO, deltaDebtUSD = constants_1.BIGDECIMAL_ZERO, liquidateUSD = constants_1.BIGDECIMAL_ZERO, liquidator = null, liquidatee = null) {
    const protocol = (0, getters_1.getOrCreateLendingProtocol)();
    const usageHourlySnapshot = (0, getters_1.getOrCreateUsageMetricsHourlySnapshot)(event);
    const usageDailySnapshot = (0, getters_1.getOrCreateUsageMetricsDailySnapshot)(event);
    const hours = (event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR).toString();
    const days = (event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString();
    // userU, userV, userW may be the same, they may not
    for (let i = 0; i < users.length; i++) {
        const accountID = users[i];
        let account = schema_1.Account.load(accountID);
        if (account == null) {
            account = (0, getters_1.getOrCreateAccount)(accountID);
            protocol.cumulativeUniqueUsers += 1;
            usageHourlySnapshot.cumulativeUniqueUsers += 1;
            usageDailySnapshot.cumulativeUniqueUsers += 1;
        }
        const hourlyActiveAcctountID = "hourly-"
            .concat(accountID)
            .concat("-")
            .concat(hours);
        let hourlyActiveAccount = schema_1.ActiveAccount.load(hourlyActiveAcctountID);
        if (hourlyActiveAccount == null) {
            hourlyActiveAccount = new schema_1.ActiveAccount(hourlyActiveAcctountID);
            hourlyActiveAccount.save();
            usageHourlySnapshot.hourlyActiveUsers += 1;
        }
        const dailyActiveAcctountID = "daily-"
            .concat(accountID)
            .concat("-")
            .concat(days);
        let dailyActiveAccount = schema_1.ActiveAccount.load(dailyActiveAcctountID);
        if (dailyActiveAccount == null) {
            dailyActiveAccount = new schema_1.ActiveAccount(dailyActiveAcctountID);
            dailyActiveAccount.save();
            usageDailySnapshot.dailyActiveUsers += 1;
        }
    }
    if (deltaCollateralUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        usageHourlySnapshot.hourlyDepositCount += 1;
        usageDailySnapshot.dailyDepositCount += 1;
        const depositAccount = schema_1.Account.load(users[1]); // user v
        if (depositAccount.depositCount == 0) {
            // a new depositor
            protocol.cumulativeUniqueDepositors += 1;
            usageDailySnapshot.cumulativeUniqueDepositors += 1;
        }
        depositAccount.depositCount += constants_1.INT_ONE;
        depositAccount.save();
        const dailyDepositorAcctountID = "daily-depositor-"
            .concat(users[1])
            .concat("-")
            .concat(days);
        let dailyDepositorAccount = schema_1.ActiveAccount.load(dailyDepositorAcctountID);
        if (dailyDepositorAccount == null) {
            dailyDepositorAccount = new schema_1.ActiveAccount(dailyDepositorAcctountID);
            dailyDepositorAccount.save();
            usageDailySnapshot.dailyActiveDepositors += 1;
        }
    }
    else if (deltaCollateralUSD.lt(constants_1.BIGDECIMAL_ZERO)) {
        usageHourlySnapshot.hourlyWithdrawCount += 1;
        usageDailySnapshot.dailyWithdrawCount += 1;
        const withdrawAccount = schema_1.Account.load(users[1]);
        withdrawAccount.withdrawCount += constants_1.INT_ONE;
        withdrawAccount.save();
    }
    if (deltaDebtUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        usageHourlySnapshot.hourlyBorrowCount += 1;
        usageDailySnapshot.dailyBorrowCount += 1;
        const borrowAccount = schema_1.Account.load(users[2]); // user w
        if (borrowAccount.borrowCount == 0) {
            // a new borrower
            protocol.cumulativeUniqueBorrowers += 1;
            usageDailySnapshot.cumulativeUniqueBorrowers += 1;
        }
        borrowAccount.borrowCount += constants_1.INT_ONE;
        borrowAccount.save();
        const dailyBorrowerAcctountID = "daily-borrow-"
            .concat(users[2])
            .concat("-")
            .concat(days);
        let dailyBorrowerAccount = schema_1.ActiveAccount.load(dailyBorrowerAcctountID);
        if (dailyBorrowerAccount == null) {
            dailyBorrowerAccount = new schema_1.ActiveAccount(dailyBorrowerAcctountID);
            dailyBorrowerAccount.save();
            usageDailySnapshot.dailyActiveBorrowers += 1;
        }
    }
    else if (deltaDebtUSD.lt(constants_1.BIGDECIMAL_ZERO)) {
        usageHourlySnapshot.hourlyRepayCount += 1;
        usageDailySnapshot.dailyRepayCount += 1;
        const repayAccount = schema_1.Account.load(users[1]);
        repayAccount.repayCount += constants_1.INT_ONE;
        repayAccount.save();
    }
    if (liquidateUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
        usageHourlySnapshot.hourlyLiquidateCount += 1;
        usageDailySnapshot.dailyLiquidateCount += 1;
        if (liquidator) {
            let liquidatorAccount = schema_1.Account.load(liquidator);
            // a new liquidator
            if (liquidatorAccount == null || liquidatorAccount.liquidateCount == 0) {
                if (liquidatorAccount == null) {
                    // liquidators will repay debt & withdraw collateral,
                    // they are unique users if not yet in Account
                    protocol.cumulativeUniqueUsers += 1;
                    usageDailySnapshot.cumulativeUniqueUsers += 1;
                    usageHourlySnapshot.cumulativeUniqueUsers += 1;
                }
                liquidatorAccount = (0, getters_1.getOrCreateAccount)(liquidator);
                protocol.cumulativeUniqueLiquidators += 1;
                usageDailySnapshot.cumulativeUniqueLiquidators += 1;
            }
            liquidatorAccount.liquidateCount += constants_1.INT_ONE;
            liquidatorAccount.save();
            const dailyLiquidatorAcctountID = "daily-liquidate"
                .concat(liquidator)
                .concat("-")
                .concat(days);
            let dailyLiquidatorAccount = schema_1.ActiveAccount.load(dailyLiquidatorAcctountID);
            if (dailyLiquidatorAccount == null) {
                dailyLiquidatorAccount = new schema_1.ActiveAccount(dailyLiquidatorAcctountID);
                dailyLiquidatorAccount.save();
                usageDailySnapshot.dailyActiveLiquidators += 1;
            }
        }
        if (liquidatee) {
            let liquidateeAccount = schema_1.Account.load(liquidatee);
            // a new liquidatee
            if (liquidateeAccount == null ||
                liquidateeAccount.liquidationCount == 0) {
                // liquidatee should already have positions & should not be new users
                liquidateeAccount = (0, getters_1.getOrCreateAccount)(liquidatee);
                protocol.cumulativeUniqueLiquidatees += 1;
                usageDailySnapshot.cumulativeUniqueLiquidatees += 1;
            }
            liquidateeAccount.liquidationCount += constants_1.INT_ONE;
            liquidateeAccount.save();
            const dailyLiquidateeAcctountID = "daily-liquidatee-"
                .concat(liquidatee)
                .concat("-")
                .concat(days);
            let dailyLiquidateeAccount = schema_1.ActiveAccount.load(dailyLiquidateeAcctountID);
            if (dailyLiquidateeAccount == null) {
                dailyLiquidateeAccount = new schema_1.ActiveAccount(dailyLiquidateeAcctountID);
                dailyLiquidateeAccount.save();
                usageDailySnapshot.dailyActiveLiquidatees += 1;
            }
        }
    }
    usageHourlySnapshot.hourlyTransactionCount += 1;
    usageDailySnapshot.dailyTransactionCount += 1;
    usageHourlySnapshot.blockNumber = event.block.number;
    usageDailySnapshot.blockNumber = event.block.number;
    usageHourlySnapshot.timestamp = event.block.timestamp;
    usageDailySnapshot.timestamp = event.block.timestamp;
    protocol.save();
    usageHourlySnapshot.save();
    usageDailySnapshot.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
function createTransactions(event, market, lender, borrower, deltaCollateral = constants_1.BIGINT_ZERO, deltaCollateralUSD = constants_1.BIGDECIMAL_ZERO, deltaDebt = constants_1.BIGINT_ZERO, deltaDebtUSD = constants_1.BIGDECIMAL_ZERO) {
    const transactionID = (0, strings_1.createEventID)(event);
    if (deltaCollateral.gt(constants_1.BIGINT_ZERO)) {
        // deposit
        const deposit = new schema_1.Deposit(transactionID);
        deposit.hash = event.transaction.hash.toHexString();
        deposit.logIndex = event.logIndex.toI32();
        deposit.nonce = event.transaction.nonce;
        deposit.account = lender;
        deposit.blockNumber = event.block.number;
        deposit.timestamp = event.block.timestamp;
        deposit.market = market.id;
        deposit.asset = market.inputToken;
        deposit.amount = deltaCollateral;
        deposit.amountUSD = deltaCollateralUSD;
        deposit.position = "";
        deposit.save();
    }
    else if (deltaCollateral.lt(constants_1.BIGINT_ZERO)) {
        //withdraw
        const withdraw = new schema_1.Withdraw(transactionID);
        withdraw.hash = event.transaction.hash.toHexString();
        withdraw.logIndex = event.logIndex.toI32();
        withdraw.nonce = event.transaction.nonce;
        withdraw.account = lender;
        withdraw.blockNumber = event.block.number;
        withdraw.timestamp = event.block.timestamp;
        withdraw.market = market.id;
        withdraw.asset = market.inputToken;
        withdraw.amount = deltaCollateral.times(constants_1.BIGINT_NEG_ONE);
        withdraw.amountUSD = deltaCollateralUSD.times(constants_1.BIGDECIMAL_NEG_ONE);
        withdraw.position = "";
        withdraw.save();
    }
    if (deltaDebt.gt(constants_1.BIGINT_ZERO)) {
        // borrow
        const borrow = new schema_1.Borrow(transactionID);
        borrow.hash = event.transaction.hash.toHexString();
        borrow.logIndex = event.logIndex.toI32();
        borrow.nonce = event.transaction.nonce;
        borrow.account = borrower;
        borrow.blockNumber = event.block.number;
        borrow.timestamp = event.block.timestamp;
        borrow.market = market.id;
        borrow.asset = market.inputToken;
        borrow.amount = deltaDebt;
        borrow.amountUSD = deltaDebtUSD;
        borrow.position = "";
        borrow.save();
    }
    else if (deltaDebt.lt(constants_1.BIGINT_ZERO)) {
        // repay
        const repay = new schema_1.Repay(transactionID);
        repay.hash = event.transaction.hash.toHexString();
        repay.logIndex = event.logIndex.toI32();
        repay.nonce = event.transaction.nonce;
        repay.account = borrower;
        repay.blockNumber = event.block.number;
        repay.timestamp = event.block.timestamp;
        repay.market = market.id;
        repay.asset = market.inputToken;
        repay.amount = deltaDebt.times(constants_1.BIGINT_NEG_ONE);
        repay.amountUSD = deltaDebtUSD.times(constants_1.BIGDECIMAL_NEG_ONE);
        repay.position = "";
        repay.save();
    }
    // liquidate is handled by getOrCreateLiquidate() in getters
}
exports.createTransactions = createTransactions;
function updatePriceForMarket(marketID, event) {
    // Price is updated for market marketID
    const market = (0, getters_1.getOrCreateMarket)(marketID);
    const token = schema_1.Token.load(market.inputToken);
    market.inputTokenPriceUSD = token.lastPriceUSD;
    market.totalDepositBalanceUSD = (0, numbers_1.bigIntToBDUseDecimals)(market.inputTokenBalance, token.decimals).times(market.inputTokenPriceUSD);
    market.totalValueLockedUSD = market.totalDepositBalanceUSD;
    market.save();
    // iterate to update protocol level totalDepositBalanceUSD
    const protocol = (0, getters_1.getOrCreateLendingProtocol)();
    const marketIDList = protocol.marketIDList;
    let protocolTotalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    for (let i = 0; i < marketIDList.length; i++) {
        const marketAddress = marketIDList[i];
        const market = (0, getters_1.getOrCreateMarket)(marketAddress);
        if (market == null) {
            graph_ts_1.log.warning("[updatePriceForMarket]market {} doesn't exist", [
                marketAddress,
            ]);
            continue;
        }
        protocolTotalDepositBalanceUSD = protocolTotalDepositBalanceUSD.plus(market.totalDepositBalanceUSD);
    }
    protocol.totalDepositBalanceUSD = protocolTotalDepositBalanceUSD;
    protocol.totalValueLockedUSD = protocol.totalDepositBalanceUSD;
    protocol.save();
    updateFinancialsSnapshot(event);
}
exports.updatePriceForMarket = updatePriceForMarket;
function updateRevenue(event, marketID, newTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO, newSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO, protocolSideRevenueType = 0) {
    const market = (0, getters_1.getOrCreateMarket)(marketID);
    if (market) {
        updateMarket(event, market, constants_1.BIGINT_ZERO, constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, newTotalRevenueUSD, newSupplySideRevenueUSD);
    }
    updateProtocol(constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, newTotalRevenueUSD, newSupplySideRevenueUSD, protocolSideRevenueType);
    updateFinancialsSnapshot(event, constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, newTotalRevenueUSD, newSupplySideRevenueUSD, protocolSideRevenueType);
}
exports.updateRevenue = updateRevenue;