"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRewardEpoch24Onward = exports.processRewardEpoch18_23 = exports.processRewardEpoch6_17 = exports.updateWeightedStakedAmount = exports.snapshotMarket = exports.updateUsageMetrics = exports.snapshotFinancials = exports.updateRevenue = exports.updateInterestRates = exports.updatePrices = exports.createLiquidation = exports.createWithdraw = exports.createRepay = exports.createDeposit = exports.createBorrow = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Euler_1 = require("../../generated/euler/Euler");
const getters_1 = require("../common/getters");
const constants_1 = require("../common/constants");
const conversions_1 = require("../common/conversions");
const schema_1 = require("../../generated/schema");
const Exec_1 = require("../../generated/euler/Exec");
const conversions_2 = require("../common/conversions");
const schema_2 = require("../../generated/schema");
const constants_2 = require("../common/constants");
function createBorrow(event) {
    const borrow = (0, getters_1.getOrCreateBorrow)(event);
    const underlying = event.params.underlying.toHexString();
    const assetStatus = (0, getters_1.getOrCreateAssetStatus)(underlying);
    const marketId = assetStatus.eToken;
    const accountAddress = event.params.account.toHexString();
    const underlyingToken = (0, getters_1.getOrCreateToken)(event.params.underlying);
    borrow.market = marketId;
    borrow.asset = underlying;
    borrow.from = marketId;
    borrow.to = accountAddress;
    borrow.amount = (0, conversions_1.bigIntChangeDecimals)(event.params.amount, constants_1.DEFAULT_DECIMALS, underlyingToken.decimals);
    // catch CRYPTEX outlier price at block 15358330
    // see transaction: https://etherscan.io/tx/0x77885d38a6c496fdc39675f57185ab8bb11e8d1f14eb9f4a536fc1c4d24d84d2
    if (underlying.toLowerCase() == constants_1.CRYPTEX_MARKET_ID.toLowerCase() &&
        event.block.number.equals(graph_ts_1.BigInt.fromI32(15358330))) {
        // this is the price of CTX on August 17, 2022 at 11AM UTC-0
        // see: https://www.coingecko.com/en/coins/cryptex-finance
        const CTX_PRICE = graph_ts_1.BigDecimal.fromString("3.98");
        borrow.amountUSD = event.params.amount.toBigDecimal().div(constants_1.DECIMAL_PRECISION).times(CTX_PRICE);
    }
    else {
        borrow.amountUSD = (0, conversions_1.bigIntToBDUseDecimals)(borrow.amount, underlyingToken.decimals).times(underlyingToken.lastPriceUSD);
    }
    borrow.save();
    const market = (0, getters_1.getOrCreateMarket)(marketId);
    market.cumulativeBorrowUSD = market.cumulativeBorrowUSD.plus(borrow.amountUSD);
    market.save();
    const protocol = (0, getters_1.getOrCreateLendingProtocol)();
    protocol.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD.plus(borrow.amountUSD);
    protocol.save();
    return borrow.amountUSD;
}
exports.createBorrow = createBorrow;
function createDeposit(event) {
    const deposit = (0, getters_1.getOrCreateDeposit)(event);
    const underlying = event.params.underlying.toHexString();
    const assetStatus = (0, getters_1.getOrCreateAssetStatus)(underlying);
    const marketId = assetStatus.eToken;
    const accountAddress = event.params.account;
    const underlyingToken = (0, getters_1.getOrCreateToken)(event.params.underlying);
    deposit.market = marketId;
    deposit.asset = underlying;
    deposit.from = accountAddress.toHexString();
    deposit.to = marketId;
    deposit.amount = (0, conversions_1.bigIntChangeDecimals)(event.params.amount, constants_1.DEFAULT_DECIMALS, underlyingToken.decimals);
    deposit.amountUSD = (0, conversions_1.bigIntToBDUseDecimals)(deposit.amount, underlyingToken.decimals).times(underlyingToken.lastPriceUSD);
    deposit.save();
    const market = (0, getters_1.getOrCreateMarket)(marketId);
    market.cumulativeDepositUSD = market.cumulativeDepositUSD.plus(deposit.amountUSD);
    market.save();
    const protocol = (0, getters_1.getOrCreateLendingProtocol)();
    protocol.cumulativeDepositUSD = protocol.cumulativeDepositUSD.plus(deposit.amountUSD);
    protocol.save();
    return deposit.amountUSD;
}
exports.createDeposit = createDeposit;
function createRepay(event) {
    const repay = (0, getters_1.getOrCreateRepay)(event);
    const underlying = event.params.underlying.toHexString();
    const assetStatus = (0, getters_1.getOrCreateAssetStatus)(underlying);
    const marketId = assetStatus.eToken;
    const accountAddress = event.params.account;
    const market = (0, getters_1.getOrCreateMarket)(marketId);
    const underlyingToken = (0, getters_1.getOrCreateToken)(event.params.underlying);
    repay.market = marketId;
    repay.asset = underlying;
    repay.from = accountAddress.toHexString();
    repay.to = marketId;
    repay.amount = (0, conversions_1.bigIntChangeDecimals)(event.params.amount, constants_1.DEFAULT_DECIMALS, underlyingToken.decimals);
    repay.amountUSD = (0, conversions_1.bigIntToBDUseDecimals)(repay.amount, underlyingToken.decimals).times(underlyingToken.lastPriceUSD);
    repay.save();
    market.save();
    return repay.amountUSD;
}
exports.createRepay = createRepay;
function createWithdraw(event) {
    const withdraw = (0, getters_1.getOrCreateWithdraw)(event);
    const underlying = event.params.underlying.toHexString();
    const assetStatus = (0, getters_1.getOrCreateAssetStatus)(underlying);
    const marketId = assetStatus.eToken;
    const accountAddress = event.params.account;
    const underlyingToken = (0, getters_1.getOrCreateToken)(event.params.underlying);
    withdraw.market = marketId;
    withdraw.asset = underlying;
    withdraw.from = marketId;
    withdraw.to = accountAddress.toHexString();
    withdraw.amount = (0, conversions_1.bigIntChangeDecimals)(event.params.amount, constants_1.DEFAULT_DECIMALS, underlyingToken.decimals);
    withdraw.amountUSD = (0, conversions_1.bigIntToBDUseDecimals)(withdraw.amount, underlyingToken.decimals).times(underlyingToken.lastPriceUSD);
    withdraw.save();
    return withdraw.amountUSD;
}
exports.createWithdraw = createWithdraw;
function createLiquidation(event) {
    const liquidation = (0, getters_1.getOrCreateLiquidate)(event);
    const underlyingTokenId = event.params.underlying.toHexString();
    const seizedTokenId = event.params.collateral.toHexString();
    const underlyingToken = (0, getters_1.getOrCreateToken)(event.params.underlying);
    const seizedToken = (0, getters_1.getOrCreateToken)(event.params.collateral);
    // repay token market
    const underlyingAssetStatus = (0, getters_1.getOrCreateAssetStatus)(underlyingTokenId);
    const collateralAssetStatus = (0, getters_1.getOrCreateAssetStatus)(seizedTokenId);
    const market = (0, getters_1.getOrCreateMarket)(underlyingAssetStatus.eToken);
    const collateralMarket = (0, getters_1.getOrCreateMarket)(collateralAssetStatus.eToken);
    liquidation.market = collateralMarket.id;
    liquidation.asset = underlyingTokenId;
    liquidation.from = event.params.liquidator.toHexString();
    liquidation.to = market.id; // Market that tokens are repaid to
    liquidation.liquidatee = event.params.violator.toHexString();
    // Amount of collateral liquidated in native units (schema definition)
    // Amount is denominated in collateral
    liquidation.amount = (0, conversions_1.bigIntChangeDecimals)(event.params._yield, constants_1.DEFAULT_DECIMALS, seizedToken.decimals);
    liquidation.amountUSD = (0, conversions_1.bigIntToBDUseDecimals)(liquidation.amount, seizedToken.decimals).times(seizedToken.lastPriceUSD);
    const repayUSD = (0, conversions_1.bigIntToBDUseDecimals)(event.params.repay, constants_1.DEFAULT_DECIMALS).times(underlyingToken.lastPriceUSD);
    liquidation.profitUSD = liquidation.amountUSD.minus(repayUSD);
    liquidation.save();
    collateralMarket.cumulativeLiquidateUSD = collateralMarket.cumulativeLiquidateUSD.plus(liquidation.amountUSD);
    collateralMarket.liquidationPenalty = liquidation.profitUSD.div(liquidation.amountUSD).times(constants_1.BIGDECIMAL_HUNDRED);
    collateralMarket.save();
    const protocol = (0, getters_1.getOrCreateLendingProtocol)();
    protocol.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD.plus(liquidation.amountUSD);
    protocol.save();
    return liquidation.amountUSD;
}
exports.createLiquidation = createLiquidation;
function updatePrices(execProxyAddress, market, event) {
    const underlying = graph_ts_1.Address.fromString(market.inputToken);
    // update price
    const execProxyContract = Exec_1.Exec.bind(execProxyAddress);
    const blockNumber = event.block.number;
    const underlyingPriceWETHResult = execProxyContract.try_getPriceFull(underlying);
    // this is the inversion of WETH price in USD
    const USDCPriceWETHResult = execProxyContract.try_getPriceFull(graph_ts_1.Address.fromString(constants_1.USDC_ERC20_ADDRESS));
    if (underlyingPriceWETHResult.reverted) {
        graph_ts_1.log.warning("[updatePrices]try_getPriceFull({}) reverted at block {}", [
            underlying.toHexString(),
            blockNumber.toString(),
        ]);
        return null;
    }
    if (USDCPriceWETHResult.reverted) {
        graph_ts_1.log.warning("[updatePrices]try_getPriceFull({}) reverted at block {}", ["USDC", blockNumber.toString()]);
        return null;
    }
    const underlyingPriceUSD = underlyingPriceWETHResult.value
        .getCurrPrice()
        .divDecimal(USDCPriceWETHResult.value.getCurrPrice().toBigDecimal());
    const token = (0, getters_1.getOrCreateToken)(underlying);
    token.lastPriceUSD = underlyingPriceUSD;
    token.lastPriceBlockNumber = blockNumber;
    token.save();
    market.inputTokenPriceUSD = underlyingPriceUSD;
    if (market.exchangeRate && market.exchangeRate.gt(constants_1.BIGDECIMAL_ZERO)) {
        market.outputTokenPriceUSD = underlyingPriceUSD.div(market.exchangeRate);
    }
    market.save();
    if (market.outputToken) {
        const eToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.outputToken));
        eToken.lastPriceUSD = market.outputTokenPriceUSD;
        eToken.lastPriceBlockNumber = blockNumber;
        eToken.save();
    }
    if (market._dToken && market._dTokenExchangeRate.gt(constants_1.BIGDECIMAL_ZERO)) {
        const dToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(market._dToken));
        dToken.lastPriceUSD = underlyingPriceUSD.div(market._dTokenExchangeRate);
        dToken.lastPriceBlockNumber = blockNumber;
        dToken.save();
    }
    // update market.rewardTokenEmissionUSD when updating EUL price
    if (market.inputToken == constants_1.EUL_ADDRESS) {
        updateRewardEmissionsUSD(underlyingPriceUSD);
    }
    return underlyingPriceUSD;
}
exports.updatePrices = updatePrices;
function updateRewardEmissionsUSD(underlyingPriceUSD) {
    const protocol = (0, getters_1.getOrCreateLendingProtocol)();
    for (let i = 0; i < protocol._marketIDs.length; i++) {
        const mktID = protocol._marketIDs[i];
        const mkt = schema_1.Market.load(mktID);
        if (!mkt || !mkt.rewardTokenEmissionsAmount || mkt.rewardTokenEmissionsAmount.length == 0) {
            graph_ts_1.log.info("[updateRewardEmissionsUSD]Skip upating reward emissionsUSD for market {}", [mktID]);
            continue;
        }
        const rewardEmissionsUSD = [];
        for (let i = 0; i < mkt.rewardTokenEmissionsAmount.length; i++) {
            const amountUSD = mkt
                .rewardTokenEmissionsAmount[i].divDecimal(graph_ts_1.BigDecimal.fromString(constants_1.EUL_DECIMALS.toString()))
                .times(underlyingPriceUSD);
            rewardEmissionsUSD.push(amountUSD);
        }
        mkt.rewardTokenEmissionsUSD = rewardEmissionsUSD;
        mkt.save();
    }
}
function updateInterestRates(market, interestRate, reserveFee, totalBorrows, totalBalances, event) {
    // interestRate is Borrow Rate in Second Percentage Yield
    // See computeAPYs() in EulerGeneralView.sol
    const borrowSPY = interestRate;
    const borrowAPY = (0, conversions_2.bigDecimalExponential)(borrowSPY.divDecimal(constants_1.INTEREST_RATE_DECIMALS), constants_1.SECONDS_PER_YEAR).minus(constants_1.BIGDECIMAL_ONE);
    const supplySideShare = constants_1.BIGDECIMAL_ONE.minus(reserveFee.divDecimal(constants_1.RESERVE_FEE_SCALE));
    const supplySPY = interestRate
        .times(totalBorrows)
        .toBigDecimal()
        .times(supplySideShare)
        .div(totalBalances.toBigDecimal());
    const supplyAPY = (0, conversions_2.bigDecimalExponential)(supplySPY.div(constants_1.INTEREST_RATE_DECIMALS), constants_1.SECONDS_PER_YEAR).minus(constants_1.BIGDECIMAL_ONE);
    const borrowerRate = (0, getters_1.getOrCreateInterestRate)(constants_1.InterestRateSide.BORROWER, constants_1.InterestRateType.VARIABLE, market.id);
    borrowerRate.rate = borrowAPY.times(constants_1.BIGDECIMAL_HUNDRED);
    borrowerRate.save();
    const lenderRate = (0, getters_1.getOrCreateInterestRate)(constants_1.InterestRateSide.LENDER, constants_1.InterestRateType.VARIABLE, market.id);
    lenderRate.rate = supplyAPY.times(constants_1.BIGDECIMAL_HUNDRED);
    lenderRate.save();
    market.rates = [borrowerRate.id, lenderRate.id];
    market.save();
    const marketDailySnapshot = (0, getters_1.getOrCreateMarketDailySnapshot)(event.block, market.id);
    const days = (event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY).toString();
    marketDailySnapshot.rates = (0, getters_1.getSnapshotRates)(market.rates, days);
    marketDailySnapshot.blockNumber = event.block.number;
    marketDailySnapshot.timestamp = event.block.timestamp;
    marketDailySnapshot.save();
    const marketHourlySnapshot = (0, getters_1.getOrCreateMarketDailySnapshot)(event.block, market.id);
    const hours = (event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY).toString();
    marketHourlySnapshot.rates = (0, getters_1.getSnapshotRates)(market.rates, hours);
    marketHourlySnapshot.blockNumber = event.block.number;
    marketHourlySnapshot.timestamp = event.block.timestamp;
    marketHourlySnapshot.save();
}
exports.updateInterestRates = updateInterestRates;
function updateRevenue(reserveBalance, totalBalances, totalBorrows, protocol, market, assetStatus, event) {
    const marketId = market.id;
    const underlying = graph_ts_1.Address.fromString(market.inputToken);
    const block = event.block;
    const token = (0, getters_1.getOrCreateToken)(underlying);
    const deltaReserveBalance = reserveBalance.minus(assetStatus.reserveBalance);
    const newProtocolSideRevenue = deltaReserveBalance
        .toBigDecimal()
        .times(market.exchangeRate) // convert to underlying
        .div(constants_1.DECIMAL_PRECISION)
        .times(token.lastPriceUSD);
    // AssetStatus.reserveBalance may include protocol side revenue
    // from interest and liquidation; separate protocol side revenue
    // into interest revenue and liquidation revenue if it is a liquidation,
    // because liquidation revenue is not shared with the supply side,
    // and interest revenue is shared
    let newLiquidationRevenue = constants_1.BIGDECIMAL_ZERO;
    let newProtocolSideInterestRevenue = newProtocolSideRevenue;
    let newTotalInterestRevenue = newProtocolSideInterestRevenue;
    let newSupplySideRevenue = constants_1.BIGDECIMAL_ZERO;
    const repayFromLiquidation = getRepayForLiquidation(event);
    if (repayFromLiquidation) {
        // split reserve fee from liquidation
        const repayAmountFromLiquidation = (0, conversions_1.bigIntToBDUseDecimals)(repayFromLiquidation, constants_1.DEFAULT_DECIMALS);
        // The reserve fee is charged on repay amount in a liquidation, the percent is
        // determined by UNDERLYING_RESERVES_FEE.div(DECIMAL_PRECISION)
        // UNDERLYING_RESERVES_FEE = 0.02 * 1e18 as of Oct 2022
        // Reference: Line 156 Liquidation.sol
        // https://github.com/euler-xyz/euler-contracts/blob/580fa725d65ac1fc1a42603e54aa28022f6cda6d/contracts/modules/Liquidation.sol#L156
        const reserveFeeProportion = constants_1.UNDERLYING_RESERVES_FEE.div(constants_1.DECIMAL_PRECISION);
        newLiquidationRevenue = repayAmountFromLiquidation.times(reserveFeeProportion).times(token.lastPriceUSD);
        if (newProtocolSideRevenue.lt(newLiquidationRevenue)) {
            graph_ts_1.log.warning("[updateRevenue]total protocol side revenue {} < liquidation revenue {} at tx {}", [
                newProtocolSideRevenue.toString(),
                newLiquidationRevenue.toString(),
                event.transaction.hash.toHexString(),
            ]);
        }
        else {
            newProtocolSideInterestRevenue = newProtocolSideRevenue.minus(newLiquidationRevenue);
        }
        graph_ts_1.log.info("[updateRevenue]liquidation rev ${} + interest rev ${} = total protocol rev of ${} for tx {}", [
            newLiquidationRevenue.toString(),
            newProtocolSideInterestRevenue.toString(),
            newProtocolSideRevenue.toString(),
            event.transaction.hash.toHexString(),
        ]);
    }
    // reserve fee from interest revenue
    // because protocolSideRev = totalRev * reserveFee/RESERVE_FEE_SCALE
    // ==> totalRev = protocolSideRev * RESERVE_FEE_SCALE / reserveFee
    if (newProtocolSideInterestRevenue.gt(constants_1.BIGDECIMAL_ZERO)) {
        newTotalInterestRevenue = newProtocolSideInterestRevenue
            .times(constants_1.RESERVE_FEE_SCALE)
            .div(assetStatus.reserveFee.toBigDecimal());
        newSupplySideRevenue = newTotalInterestRevenue.minus(newProtocolSideInterestRevenue);
    }
    // update protocol revenue
    protocol.cumulativeSupplySideRevenueUSD = protocol.cumulativeSupplySideRevenueUSD.plus(newSupplySideRevenue);
    protocol.cumulativeProtocolSideRevenueUSD = protocol.cumulativeProtocolSideRevenueUSD.plus(newProtocolSideRevenue);
    protocol.cumulativeTotalRevenueUSD = protocol.cumulativeSupplySideRevenueUSD.plus(protocol.cumulativeProtocolSideRevenueUSD);
    protocol.save();
    // update market's revenue
    market.cumulativeSupplySideRevenueUSD = market.cumulativeSupplySideRevenueUSD.plus(newSupplySideRevenue);
    market.cumulativeProtocolSideRevenueUSD = market.cumulativeProtocolSideRevenueUSD.plus(newProtocolSideRevenue);
    market.cumulativeTotalRevenueUSD = market.cumulativeSupplySideRevenueUSD.plus(market.cumulativeProtocolSideRevenueUSD);
    market.save();
    const marketDailySnapshot = (0, getters_1.getOrCreateMarketDailySnapshot)(block, marketId);
    const marketHourlySnapshot = (0, getters_1.getOrCreateMarketHourlySnapshot)(block, marketId);
    const financialSnapshot = (0, getters_1.getOrCreateFinancials)(block.timestamp, block.number);
    // update daily snapshot
    marketDailySnapshot.dailySupplySideRevenueUSD =
        marketDailySnapshot.dailySupplySideRevenueUSD.plus(newSupplySideRevenue);
    marketDailySnapshot.dailyProtocolSideRevenueUSD =
        marketDailySnapshot.dailyProtocolSideRevenueUSD.plus(newProtocolSideRevenue);
    marketDailySnapshot.dailyTotalRevenueUSD = marketDailySnapshot.dailySupplySideRevenueUSD.plus(marketDailySnapshot.dailyProtocolSideRevenueUSD);
    marketDailySnapshot.save();
    // update hourly snapshot
    marketHourlySnapshot.hourlySupplySideRevenueUSD =
        marketHourlySnapshot.hourlySupplySideRevenueUSD.plus(newSupplySideRevenue);
    marketHourlySnapshot.hourlyProtocolSideRevenueUSD =
        marketHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(newProtocolSideRevenue);
    marketHourlySnapshot.hourlyTotalRevenueUSD = marketHourlySnapshot.hourlySupplySideRevenueUSD.plus(marketHourlySnapshot.hourlyProtocolSideRevenueUSD);
    marketHourlySnapshot.save();
    // update financials
    financialSnapshot.dailySupplySideRevenueUSD = financialSnapshot.dailySupplySideRevenueUSD.plus(newSupplySideRevenue);
    financialSnapshot.dailyProtocolSideRevenueUSD =
        financialSnapshot.dailyProtocolSideRevenueUSD.plus(newProtocolSideRevenue);
    financialSnapshot.dailyTotalRevenueUSD = financialSnapshot.dailySupplySideRevenueUSD.plus(financialSnapshot.dailyProtocolSideRevenueUSD);
    financialSnapshot.save();
}
exports.updateRevenue = updateRevenue;
// updates the FinancialDailySnapshot Entity
function snapshotFinancials(block, amountUSD, eventType = null, protocol = null) {
    const financialMetrics = (0, getters_1.getOrCreateFinancials)(block.timestamp, block.number);
    if (block.number.ge(financialMetrics.blockNumber)) {
        // financials snapshot already exists and is stale, refresh
        if (!protocol)
            protocol = (0, getters_1.getOrCreateLendingProtocol)();
        financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
        financialMetrics.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD;
        financialMetrics.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
        financialMetrics.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD;
        financialMetrics.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
        financialMetrics.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD;
        // update cumul revenues
        financialMetrics.cumulativeSupplySideRevenueUSD = protocol.cumulativeSupplySideRevenueUSD;
        financialMetrics.cumulativeProtocolSideRevenueUSD = protocol.cumulativeProtocolSideRevenueUSD;
        financialMetrics.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD;
    }
    // update the block number and timestamp
    financialMetrics.blockNumber = block.number;
    financialMetrics.timestamp = block.timestamp;
    if (eventType != null) {
        // add to daily amounts
        if (eventType == constants_2.TransactionType.DEPOSIT) {
            financialMetrics.dailyDepositUSD = financialMetrics.dailyDepositUSD.plus(amountUSD);
        }
        else if (eventType == constants_2.TransactionType.BORROW) {
            financialMetrics.dailyBorrowUSD = financialMetrics.dailyBorrowUSD.plus(amountUSD);
        }
        else if (eventType == constants_2.TransactionType.REPAY) {
            financialMetrics.dailyRepayUSD = financialMetrics.dailyRepayUSD.plus(amountUSD);
        }
        else if (eventType == constants_2.TransactionType.WITHDRAW) {
            financialMetrics.dailyWithdrawUSD = financialMetrics.dailyWithdrawUSD.plus(amountUSD);
        }
        else if (eventType == constants_2.TransactionType.LIQUIDATE) {
            financialMetrics.dailyLiquidateUSD = financialMetrics.dailyLiquidateUSD.plus(amountUSD);
        }
    }
    financialMetrics.save();
}
exports.snapshotFinancials = snapshotFinancials;
// update a given UsageMetricDailySnapshot
function updateUsageMetrics(event, from, transaction) {
    // Number of days since Unix epoch
    const id = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    const hour = event.block.timestamp.toI64() / constants_2.SECONDS_PER_HOUR;
    const dailyMetrics = (0, getters_1.getOrCreateUsageDailySnapshot)(event);
    const hourlyMetrics = (0, getters_1.getOrCreateUsageHourlySnapshot)(event);
    // Update the block number and timestamp to that of the last transaction of that day
    dailyMetrics.blockNumber = event.block.number;
    dailyMetrics.timestamp = event.block.timestamp;
    dailyMetrics.dailyTransactionCount += 1;
    // update hourlyMetrics
    hourlyMetrics.blockNumber = event.block.number;
    hourlyMetrics.timestamp = event.block.timestamp;
    hourlyMetrics.hourlyTransactionCount += 1;
    const accountId = from.toHexString();
    let account = schema_2.Account.load(accountId);
    const protocol = (0, getters_1.getOrCreateLendingProtocol)();
    dailyMetrics.totalPoolCount = protocol.totalPoolCount;
    if (!account) {
        account = new schema_2.Account(accountId);
        account.save();
        protocol.cumulativeUniqueUsers += 1;
        protocol.save();
    }
    hourlyMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    dailyMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    // Combine the id and the user address to generate a unique user id for the day
    const dailyActiveAccountId = constants_2.ActivityType.DAILY + "-" + from.toHexString() + "-" + id.toString();
    let dailyActiveAccount = schema_2.ActiveAccount.load(dailyActiveAccountId);
    if (!dailyActiveAccount) {
        dailyActiveAccount = new schema_2.ActiveAccount(dailyActiveAccountId);
        dailyActiveAccount.save();
        dailyMetrics.dailyActiveUsers += 1;
    }
    // create active account for hourlyMetrics
    const hourlyActiveAccountId = constants_2.ActivityType.HOURLY + "-" + from.toHexString() + "-" + hour.toString();
    let hourlyActiveAccount = schema_2.ActiveAccount.load(hourlyActiveAccountId);
    if (!hourlyActiveAccount) {
        hourlyActiveAccount = new schema_2.ActiveAccount(hourlyActiveAccountId);
        hourlyActiveAccount.save();
        hourlyMetrics.hourlyActiveUsers += 1;
    }
    // update transaction for daily/hourly metrics
    updateTransactionCount(dailyMetrics, hourlyMetrics, transaction);
    hourlyMetrics.save();
    dailyMetrics.save();
}
exports.updateUsageMetrics = updateUsageMetrics;
// update MarketDailySnapshot & MarketHourlySnapshot
function snapshotMarket(block, marketId, amountUSD, eventType = null) {
    const marketDailyMetrics = (0, getters_1.getOrCreateMarketDailySnapshot)(block, marketId);
    const marketHourlyMetrics = (0, getters_1.getOrCreateMarketHourlySnapshot)(block, marketId);
    const market = (0, getters_1.getOrCreateMarket)(marketId);
    marketDailyMetrics.totalValueLockedUSD = market.totalValueLockedUSD;
    marketDailyMetrics.cumulativeSupplySideRevenueUSD = market.cumulativeSupplySideRevenueUSD;
    marketDailyMetrics.cumulativeProtocolSideRevenueUSD = market.cumulativeProtocolSideRevenueUSD;
    marketDailyMetrics.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
    marketDailyMetrics.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketDailyMetrics.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketDailyMetrics.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketDailyMetrics.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketDailyMetrics.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketDailyMetrics.inputTokenBalance = market.inputTokenBalance;
    marketDailyMetrics.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketDailyMetrics.outputTokenSupply = market.outputTokenSupply;
    marketDailyMetrics.outputTokenPriceUSD = market.outputTokenPriceUSD;
    marketDailyMetrics.exchangeRate = market.exchangeRate;
    marketDailyMetrics.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
    marketDailyMetrics.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
    marketHourlyMetrics.totalValueLockedUSD = market.totalValueLockedUSD;
    marketHourlyMetrics.cumulativeSupplySideRevenueUSD = market.cumulativeSupplySideRevenueUSD;
    marketHourlyMetrics.cumulativeProtocolSideRevenueUSD = market.cumulativeProtocolSideRevenueUSD;
    marketHourlyMetrics.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
    marketHourlyMetrics.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketHourlyMetrics.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketHourlyMetrics.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketHourlyMetrics.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketHourlyMetrics.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketHourlyMetrics.inputTokenBalance = market.inputTokenBalance;
    marketHourlyMetrics.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketHourlyMetrics.outputTokenSupply = market.outputTokenSupply;
    marketHourlyMetrics.outputTokenPriceUSD = market.outputTokenPriceUSD;
    marketHourlyMetrics.exchangeRate = market.exchangeRate;
    marketHourlyMetrics.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
    marketHourlyMetrics.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
    // update to latest block/timestamp
    marketDailyMetrics.blockNumber = block.number;
    marketDailyMetrics.timestamp = block.timestamp;
    marketHourlyMetrics.blockNumber = block.number;
    marketHourlyMetrics.timestamp = block.timestamp;
    // add to daily amounts
    if (eventType != null) {
        if (eventType == constants_2.TransactionType.DEPOSIT) {
            marketDailyMetrics.dailyDepositUSD = marketDailyMetrics.dailyDepositUSD.plus(amountUSD);
            marketHourlyMetrics.hourlyDepositUSD = marketHourlyMetrics.hourlyDepositUSD.plus(amountUSD);
        }
        else if (eventType == constants_2.TransactionType.BORROW) {
            marketDailyMetrics.dailyBorrowUSD = marketDailyMetrics.dailyBorrowUSD.plus(amountUSD);
            marketHourlyMetrics.hourlyBorrowUSD = marketHourlyMetrics.hourlyBorrowUSD.plus(amountUSD);
        }
        else if (eventType == constants_2.TransactionType.REPAY) {
            marketDailyMetrics.dailyRepayUSD = marketDailyMetrics.dailyRepayUSD.plus(amountUSD);
            marketHourlyMetrics.hourlyRepayUSD = marketHourlyMetrics.hourlyRepayUSD.plus(amountUSD);
        }
        else if (eventType == constants_2.TransactionType.WITHDRAW) {
            marketDailyMetrics.dailyWithdrawUSD = marketDailyMetrics.dailyWithdrawUSD.plus(amountUSD);
            marketHourlyMetrics.hourlyWithdrawUSD = marketHourlyMetrics.hourlyWithdrawUSD.plus(amountUSD);
        }
        else if (eventType == constants_2.TransactionType.LIQUIDATE) {
            marketDailyMetrics.dailyLiquidateUSD = marketDailyMetrics.dailyLiquidateUSD.plus(amountUSD);
            marketHourlyMetrics.hourlyLiquidateUSD = marketHourlyMetrics.hourlyLiquidateUSD.plus(amountUSD);
        }
    }
    marketDailyMetrics.save();
    marketHourlyMetrics.save();
}
exports.snapshotMarket = snapshotMarket;
/////////////////
//// Helpers ////
/////////////////
function updateTransactionCount(dailyUsage, hourlyUsage, transaction) {
    if (transaction == constants_2.TransactionType.DEPOSIT) {
        hourlyUsage.hourlyDepositCount += 1;
        dailyUsage.dailyDepositCount += 1;
    }
    else if (transaction == constants_2.TransactionType.WITHDRAW) {
        hourlyUsage.hourlyWithdrawCount += 1;
        dailyUsage.dailyWithdrawCount += 1;
    }
    else if (transaction == constants_2.TransactionType.BORROW) {
        hourlyUsage.hourlyBorrowCount += 1;
        dailyUsage.dailyBorrowCount += 1;
    }
    else if (transaction == constants_2.TransactionType.REPAY) {
        hourlyUsage.hourlyRepayCount += 1;
        dailyUsage.dailyRepayCount += 1;
    }
    else if (transaction == constants_2.TransactionType.LIQUIDATE) {
        hourlyUsage.hourlyLiquidateCount += 1;
        dailyUsage.dailyLiquidateCount += 1;
    }
    hourlyUsage.save();
    dailyUsage.save();
}
// get repay amount if a Liquidation event is emitted after current event in the same transaction
// return null if not a liquidation event or error
function getRepayForLiquidation(event) {
    if (!event.receipt) {
        graph_ts_1.log.warning("[getRepayForLiquidation][{}] has no event.receipt", [event.transaction.hash.toHexString()]);
        return null;
    }
    const currentEventLogIndex = event.logIndex;
    const logs = event.receipt.logs;
    const liquidationSig = graph_ts_1.crypto.keccak256(graph_ts_1.ByteArray.fromUTF8("Liquidation(address,address,address,address,uint256,uint256,uint256,uint256,uint256)"));
    let foundIndex = -1;
    for (let i = 0; i < logs.length; i++) {
        const currLog = logs.at(i);
        if (currLog.logIndex.equals(currentEventLogIndex)) {
            // only check event after the current logIndex
            foundIndex = i;
            break;
        }
    }
    // L222 executeLiquidation() . in Liquidation.sol
    // there are 4 other events (Withdraw, Deposit, Transfer, AssetStatue) between first (underlying) AssetStatus
    // and Liquidation. E.g. for tx 0x11656662685b05549734fff285e314521c6b3e6c1fa82cd551e2e40a41fae7a9
    // the logIndex of the first AssetStatus is 115, logIndex of Liquidation is 120
    if (foundIndex >= 0 && foundIndex + 5 < logs.length) {
        const nextLog = logs.at(foundIndex + 5);
        const topic0Sig = nextLog.topics.at(0); //topic0
        if (topic0Sig.equals(liquidationSig)) {
            const repay = graph_ts_1.ethereum.decode("uint256", graph_ts_1.Bytes.fromUint8Array(nextLog.data.subarray(32, 64))).toBigInt();
            return repay;
        }
    }
    return null;
}
function updateWeightedStakedAmount(market, endBlock) {
    const blocksLapsed = endBlock.minus(market._stakeLastUpdateBlock);
    const _weightedStakedAmount = market._weightedStakedAmount.plus(market._stakedAmount.times(blocksLapsed));
    market._weightedStakedAmount = _weightedStakedAmount;
    market._stakeLastUpdateBlock = endBlock;
    market.save();
}
exports.updateWeightedStakedAmount = updateWeightedStakedAmount;
function processRewardEpoch6_17(epoch, epochStartBlock, event) {
    const epochID = epoch.epoch;
    // rank markets in the epoch just ended (prev epoch)
    // find the top ten staked markets; according to the euler guage
    // https://app.euler.finance/gaugeweight
    // See the `Reward Token Emissions Amount` in README.md for a description of the method
    const prevEpochID = epochID - 1;
    const prevEpoch = schema_1._Epoch.load(prevEpochID.toString());
    if (prevEpoch) {
        const protocol = (0, getters_1.getOrCreateLendingProtocol)();
        // finalize mkt._weightedStakedAmount for prev epoch & distribute rewards
        // The array is needed to select top 10 staked markets
        const marketWeightedStakedAmounts = [];
        for (let i = 0; i < protocol._marketIDs.length; i++) {
            const mktID = protocol._marketIDs[i];
            const mkt = schema_1.Market.load(mktID);
            if (!mkt) {
                graph_ts_1.log.error("[handleStake]market {} doesn't exist, but this should not happen at tx ={}", [
                    mktID,
                    event.transaction.hash.toHexString(),
                ]);
                continue;
            }
            // eIP28 blacklist FTT market from EUL distribution
            // https://snapshot.org/#/eulerdao.eth/proposal/0x40874e40bc18ff33a9504a770d5aadfa4ea8241a64bf24a36777cb5acc3b59a7
            if (epochID >= 16 && mkt.inputToken == constants_1.FTT_ADDRESS) {
                mkt._stakedAmount = constants_1.BIGINT_ZERO;
                mkt._weightedStakedAmount = constants_1.BIGINT_ZERO;
            }
            const stakedAmount = mkt._stakedAmount;
            if (stakedAmount.gt(constants_1.BIGINT_ZERO)) {
                // finalized mkt._weightedStakedAmount for the epoch just ended
                // epochStartBlock.minus(BIGINT_ONE) is the end block of prev epoch
                updateWeightedStakedAmount(mkt, epochStartBlock.minus(constants_1.BIGINT_ONE));
            }
            marketWeightedStakedAmounts.push(mkt._weightedStakedAmount ? mkt._weightedStakedAmount : constants_1.BIGINT_ZERO);
            mkt.save();
        }
        const EULPriceUSD = getEULPriceUSD(event);
        const rewardToken = (0, getters_1.getOrCreateRewardToken)(graph_ts_1.Address.fromString(constants_1.EUL_ADDRESS), constants_1.RewardTokenType.BORROW);
        const totalRewardAmount = graph_ts_1.BigDecimal.fromString((constants_1.EUL_DIST[epochID - constants_1.START_EPOCH] * constants_1.EUL_DECIMALS).toString());
        // select top 10 staked markets, calculate sqrt(weighted staked amount)
        const cutoffAmount = (0, getters_1.getCutoffValue)(marketWeightedStakedAmounts, 10);
        let sumAccumulator = constants_1.BIGDECIMAL_ZERO;
        for (let i = 0; i < marketWeightedStakedAmounts.length; i++) {
            // TODO: reflect changes in eIP 24 and 28
            if (marketWeightedStakedAmounts[i].ge(cutoffAmount)) {
                sumAccumulator = sumAccumulator.plus(marketWeightedStakedAmounts[i].sqrt().toBigDecimal());
            }
        }
        // scale to daily emission amount
        const dailyScaler = graph_ts_1.BigDecimal.fromString((constants_1.BLOCKS_PER_DAY / constants_1.BLOCKS_PER_EPOCH).toString());
        for (let i = 0; i < protocol._marketIDs.length; i++) {
            const mktID = protocol._marketIDs[i];
            const mkt = schema_1.Market.load(mktID);
            if (!mkt) {
                graph_ts_1.log.error("[handleStake]market {} doesn't exist, but this should not happen | tx ={}", [
                    mktID,
                    event.transaction.hash.toHexString(),
                ]);
                continue;
            }
            if (mkt.rewardTokens && mkt.rewardTokens.length > 0) {
                // reset reward emissions for the epoch
                mkt.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
                mkt.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
            }
            // distribute the rewards among top 10 staked markets
            // Only for epochs after START_EPOCH (6)
            const _weightedStakedAmount = mkt._weightedStakedAmount;
            if (_weightedStakedAmount && _weightedStakedAmount.ge(cutoffAmount)) {
                mkt.rewardTokens = [rewardToken.id];
                const rewardTokenEmissionsAmount = (0, conversions_1.BigDecimalTruncateToBigInt)(_weightedStakedAmount.sqrt().divDecimal(sumAccumulator).times(totalRewardAmount).times(dailyScaler));
                const rewardTokenEmissionsUSD = rewardTokenEmissionsAmount
                    .divDecimal(graph_ts_1.BigDecimal.fromString(constants_1.EUL_DECIMALS.toString()))
                    .times(EULPriceUSD);
                mkt.rewardTokenEmissionsAmount = [rewardTokenEmissionsAmount];
                mkt.rewardTokenEmissionsUSD = [rewardTokenEmissionsUSD];
                graph_ts_1.log.info("[processRewardEpoch6_17]mkt {} rewarded {} EUL tokens ${} for epoch {}", [
                    mkt.name,
                    mkt.rewardTokenEmissionsAmount.toString(),
                    mkt.rewardTokenEmissionsUSD.toString(),
                    epoch.id,
                ]);
            }
            // reset mkt._weightedStakedAmount for the new epoch
            mkt._weightedStakedAmount = constants_1.BIGINT_ZERO;
            // EUL staked remains staked for the market until unstaked
            // so not reset mkt._stakedAmount
            mkt.save();
        }
    }
}
exports.processRewardEpoch6_17 = processRewardEpoch6_17;
function processRewardEpoch18_23(epoch, epochStartBlock, event) {
    // eIP24 changes the reward distribution
    // https://snapshot.org/#/eulerdao.eth/proposal/0x7e65ffa930507d9116ebc83663000ade6ff93fc452f437a3e95d755ccc324f93
    const epochID = epoch.epoch;
    const prevEpochID = epochID - 1;
    const prevEpoch = schema_1._Epoch.load(prevEpochID.toString());
    if (prevEpoch) {
        const protocol = (0, getters_1.getOrCreateLendingProtocol)();
        // finalize mkt._weightedStakedAmount for prev epoch & distribute rewards
        // The array is needed to select top 10 staked markets
        // const marketWeightedStakedAmounts: BigInt[] = [];
        let sumAccumulator = constants_1.BIGDECIMAL_ZERO;
        for (let i = 0; i < protocol._marketIDs.length; i++) {
            const mktID = protocol._marketIDs[i];
            const mkt = schema_1.Market.load(mktID);
            if (!mkt) {
                graph_ts_1.log.error("[handleStake]market {} doesn't exist, but this should not happen at tx ={}", [
                    mktID,
                    event.transaction.hash.toHexString(),
                ]);
                continue;
            }
            // eIP28 blacklist FTT market from EUL distribution
            // https://snapshot.org/#/eulerdao.eth/proposal/0x40874e40bc18ff33a9504a770d5aadfa4ea8241a64bf24a36777cb5acc3b59a7
            if (epochID >= 16 && mkt.inputToken == constants_1.FTT_ADDRESS) {
                mkt._stakedAmount = constants_1.BIGINT_ZERO;
                mkt._weightedStakedAmount = constants_1.BIGINT_ZERO;
            }
            const stakedAmount = mkt._stakedAmount;
            let mktWeightedStakedAmount = constants_1.BIGINT_ZERO;
            if (isMarketEligible(mkt) && stakedAmount.gt(constants_1.BIGINT_ZERO)) {
                // finalized mkt._weightedStakedAmount for the epoch just ended
                // epochStartBlock.minus(BIGINT_ONE) is the end block of prev epoch
                updateWeightedStakedAmount(mkt, epochStartBlock.minus(constants_1.BIGINT_ONE));
                mktWeightedStakedAmount = mkt._weightedStakedAmount;
            }
            mkt.save();
            sumAccumulator = sumAccumulator.plus(mktWeightedStakedAmount.sqrt().toBigDecimal());
        }
        const EULPriceUSD = getEULPriceUSD(event);
        const borrowerRewardToken = (0, getters_1.getOrCreateRewardToken)(graph_ts_1.Address.fromString(constants_1.EUL_ADDRESS), constants_1.RewardTokenType.BORROW);
        const lenderRewardToken = (0, getters_1.getOrCreateRewardToken)(graph_ts_1.Address.fromString(constants_1.EUL_ADDRESS), constants_1.RewardTokenType.DEPOSIT);
        const totalRewardAmount = graph_ts_1.BigDecimal.fromString((constants_1.EUL_DIST[epochID - constants_1.START_EPOCH] * constants_1.EUL_DECIMALS).toString());
        // scale to daily emission amount
        const dailyScaler = graph_ts_1.BigDecimal.fromString((constants_1.BLOCKS_PER_DAY / constants_1.BLOCKS_PER_EPOCH).toString());
        const EUL_DECIMALS_BD = graph_ts_1.BigDecimal.fromString(constants_1.EUL_DECIMALS.toString());
        for (let i = 0; i < protocol._marketIDs.length; i++) {
            const mktID = protocol._marketIDs[i];
            const mkt = schema_1.Market.load(mktID);
            if (!mkt) {
                graph_ts_1.log.error("[handleStake]market {} doesn't exist, but this should not happen | tx ={}", [
                    mktID,
                    event.transaction.hash.toHexString(),
                ]);
                continue;
            }
            if (mkt.rewardTokens && mkt.rewardTokens.length > 0) {
                // reset reward emissions for the epoch
                mkt.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
                mkt.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
            }
            const rewardTokens = [];
            const rewardTokenAmount = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
            const rewardTokenUSD = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
            // eIP24: 8000 EUL borrower rewards each for USDC, USDT, WETH, and WstETH
            if ([constants_1.USDC_ADDRESS, constants_1.USDT_ADDRESS, constants_1.WETH_ADDRESS, constants_1.WStETH_ADDRESS].includes(mkt.inputToken)) {
                rewardTokens.push(borrowerRewardToken.id);
                rewardTokenAmount[0] = (0, conversions_1.BigDecimalTruncateToBigInt)(graph_ts_1.BigDecimal.fromString("8000").times(EUL_DECIMALS_BD).times(dailyScaler));
                rewardTokenUSD[0] = rewardTokenAmount[0].divDecimal(EUL_DECIMALS_BD).times(EULPriceUSD);
            }
            // eIP24: 5000 EUL lender staking rewards each for USDC, USDT, WETH
            if ([constants_1.USDC_ADDRESS, constants_1.USDT_ADDRESS, constants_1.WETH_ADDRESS].includes(mkt.inputToken)) {
                rewardTokens.push(lenderRewardToken.id);
                rewardTokenAmount[1] = (0, conversions_1.BigDecimalTruncateToBigInt)(graph_ts_1.BigDecimal.fromString("5000").times(EUL_DECIMALS_BD).times(dailyScaler));
                rewardTokenUSD[1] = rewardTokenAmount[1].divDecimal(EUL_DECIMALS_BD).times(EULPriceUSD);
            }
            // distribute the rewards among eligible staked markets
            const _weightedStakedAmount = mkt._weightedStakedAmount;
            if (isMarketEligible(mkt) && _weightedStakedAmount) {
                if (rewardTokens.length == 0) {
                    rewardTokens.push(borrowerRewardToken.id);
                }
                mkt.rewardTokens = rewardTokens;
                rewardTokenAmount[0] = rewardTokenAmount[0].plus((0, conversions_1.BigDecimalTruncateToBigInt)(_weightedStakedAmount.sqrt().divDecimal(sumAccumulator).times(totalRewardAmount).times(dailyScaler)));
                rewardTokenUSD[0] = rewardTokenAmount[0]
                    .divDecimal(graph_ts_1.BigDecimal.fromString(constants_1.EUL_DECIMALS.toString()))
                    .times(EULPriceUSD);
                mkt.rewardTokenEmissionsAmount = rewardTokenAmount;
                mkt.rewardTokenEmissionsUSD = rewardTokenUSD;
                graph_ts_1.log.info("[processRewardEpoch18_23]mkt {} rewarded {} EUL tokens ${} for epoch {}", [
                    mkt.name,
                    rewardTokenAmount.toString(),
                    rewardTokenUSD.toString(),
                    epoch.id,
                ]);
            }
            // reset mkt._weightedStakedAmount for the new epoch
            mkt._weightedStakedAmount = constants_1.BIGINT_ZERO;
            // EUL staked remains staked for the market until unstaked
            // so not reset mkt._stakedAmount
            mkt.save();
        }
    }
}
exports.processRewardEpoch18_23 = processRewardEpoch18_23;
function processRewardEpoch24Onward(epoch, epochStartBlock, event) {
    // eIP51 changes the reward distribution from epoch 24 onward
    // https://snapshot.org/#/eulerdao.eth/proposal/0x551f9e6f3fba50a0fc2c69e361f7a81979189aa7f0ed923a1873bd578896942b
    const epochID = epoch.epoch;
    const prevEpochID = epochID - 1;
    const prevEpoch = schema_1._Epoch.load(prevEpochID.toString());
    if (prevEpoch) {
        const protocol = (0, getters_1.getOrCreateLendingProtocol)();
        let sumAccumulator = constants_1.BIGDECIMAL_ZERO;
        for (let i = 0; i < protocol._marketIDs.length; i++) {
            const mktID = protocol._marketIDs[i];
            const mkt = schema_1.Market.load(mktID);
            if (!mkt) {
                graph_ts_1.log.error("[processRewardEpoch24Onward]market {} doesn't exist, but this should not happen at tx ={}", [
                    mktID,
                    event.transaction.hash.toHexString(),
                ]);
                continue;
            }
            // eIP28 blacklist FTT market from EUL distribution
            // https://snapshot.org/#/eulerdao.eth/proposal/0x40874e40bc18ff33a9504a770d5aadfa4ea8241a64bf24a36777cb5acc3b59a7
            if (epochID >= 16 && mkt.inputToken == constants_1.FTT_ADDRESS) {
                mkt._stakedAmount = constants_1.BIGINT_ZERO;
                mkt._weightedStakedAmount = constants_1.BIGINT_ZERO;
            }
            const stakedAmount = mkt._stakedAmount;
            let mktWeightedStakedAmount = constants_1.BIGINT_ZERO;
            if (isMarketEligible(mkt) && stakedAmount.gt(constants_1.BIGINT_ZERO)) {
                // finalized mkt._weightedStakedAmount for the epoch just ended
                // epochStartBlock.minus(BIGINT_ONE) is the end block of prev epoch
                updateWeightedStakedAmount(mkt, epochStartBlock.minus(constants_1.BIGINT_ONE));
                mktWeightedStakedAmount = mkt._weightedStakedAmount;
            }
            mkt.save();
            sumAccumulator = sumAccumulator.plus(mktWeightedStakedAmount.sqrt().toBigDecimal());
        }
        const EULPriceUSD = getEULPriceUSD(event);
        const borrowerRewardToken = (0, getters_1.getOrCreateRewardToken)(graph_ts_1.Address.fromString(constants_1.EUL_ADDRESS), constants_1.RewardTokenType.BORROW);
        const lenderRewardToken = (0, getters_1.getOrCreateRewardToken)(graph_ts_1.Address.fromString(constants_1.EUL_ADDRESS), constants_1.RewardTokenType.DEPOSIT);
        const GAUGE_REWARD_AMOUNT = graph_ts_1.BigDecimal.fromString("8000");
        // scale to daily emission amount
        const dailyScaler = graph_ts_1.BigDecimal.fromString((constants_1.BLOCKS_PER_DAY / constants_1.BLOCKS_PER_EPOCH).toString());
        const EUL_DECIMALS_BD = graph_ts_1.BigDecimal.fromString(constants_1.EUL_DECIMALS.toString());
        for (let i = 0; i < protocol._marketIDs.length; i++) {
            const mktID = protocol._marketIDs[i];
            const mkt = schema_1.Market.load(mktID);
            if (!mkt) {
                graph_ts_1.log.error("[processRewardEpoch24Onward]market {} doesn't exist, but this should not happen | tx ={}", [
                    mktID,
                    event.transaction.hash.toHexString(),
                ]);
                continue;
            }
            if (mkt.rewardTokens && mkt.rewardTokens.length > 0) {
                // reset reward emissions for the epoch
                mkt.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
                mkt.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
            }
            const rewardTokens = [];
            const rewardTokenAmount = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
            const rewardTokenUSD = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
            // eIP51: 8000 EUL borrower rewards each for USDC, WETH, and WstETH
            if ([constants_1.USDC_ADDRESS, constants_1.WETH_ADDRESS, constants_1.WStETH_ADDRESS].includes(mkt.inputToken)) {
                const BORROWER_REWARD_AMOUNT = graph_ts_1.BigDecimal.fromString("8000");
                rewardTokens.push(borrowerRewardToken.id);
                rewardTokenAmount[0] = (0, conversions_1.BigDecimalTruncateToBigInt)(BORROWER_REWARD_AMOUNT.times(EUL_DECIMALS_BD).times(dailyScaler));
                rewardTokenUSD[0] = rewardTokenAmount[0].divDecimal(EUL_DECIMALS_BD).times(EULPriceUSD);
            }
            // eIP51: 5000 EUL lender staking rewards each for USDC,
            //        1000 for USDT, 9000 for WETH
            let STAKING_REWARD_AMOUNT = constants_1.BIGDECIMAL_ZERO;
            if (mkt.inputToken === constants_1.USDC_ADDRESS) {
                STAKING_REWARD_AMOUNT = graph_ts_1.BigDecimal.fromString("5000");
            }
            else if (mkt.inputToken === constants_1.USDT_ADDRESS) {
                STAKING_REWARD_AMOUNT = graph_ts_1.BigDecimal.fromString("1000");
            }
            else if (mkt.inputToken === constants_1.WETH_ADDRESS) {
                STAKING_REWARD_AMOUNT = graph_ts_1.BigDecimal.fromString("9000");
            }
            if (STAKING_REWARD_AMOUNT.gt(constants_1.BIGDECIMAL_ZERO)) {
                rewardTokens.push(lenderRewardToken.id);
                rewardTokenAmount[1] = (0, conversions_1.BigDecimalTruncateToBigInt)(STAKING_REWARD_AMOUNT.times(EUL_DECIMALS_BD).times(dailyScaler));
                rewardTokenUSD[1] = rewardTokenAmount[1].divDecimal(EUL_DECIMALS_BD).times(EULPriceUSD);
            }
            // distribute the 8000 rewards proportinally among eligible markets
            // "8,000 EUL per epoch shared proportionally among assets with Chainlink oracle"
            const _weightedStakedAmount = mkt._weightedStakedAmount;
            if (isMarketEligible(mkt) && _weightedStakedAmount) {
                if (rewardTokens.length == 0) {
                    rewardTokens.push(borrowerRewardToken.id);
                }
                mkt.rewardTokens = rewardTokens;
                rewardTokenAmount[0] = rewardTokenAmount[0].plus((0, conversions_1.BigDecimalTruncateToBigInt)(_weightedStakedAmount.sqrt().divDecimal(sumAccumulator).times(GAUGE_REWARD_AMOUNT).times(dailyScaler)));
                rewardTokenUSD[0] = rewardTokenAmount[0]
                    .divDecimal(graph_ts_1.BigDecimal.fromString(constants_1.EUL_DECIMALS.toString()))
                    .times(EULPriceUSD);
                mkt.rewardTokenEmissionsAmount = rewardTokenAmount;
                mkt.rewardTokenEmissionsUSD = rewardTokenUSD;
                graph_ts_1.log.info("[processRewardEpoch24Onward]mkt {} rewarded {} EUL tokens ${} for epoch {}", [
                    mkt.name,
                    rewardTokenAmount.toString(),
                    rewardTokenUSD.toString(),
                    epoch.id,
                ]);
            }
            // reset mkt._weightedStakedAmount for the new epoch
            mkt._weightedStakedAmount = constants_1.BIGINT_ZERO;
            // EUL staked remains staked for the market until unstaked
            // so not reset mkt._stakedAmount
            mkt.save();
        }
    }
}
exports.processRewardEpoch24Onward = processRewardEpoch24Onward;
function isMarketEligible(market) {
    // eIP24 requires assets with a Chainlink oracle (either now or in the future) + WETH (the reference asset)
    // https://snapshot.org/#/eulerdao.eth/proposal/0x7e65ffa930507d9116ebc83663000ade6ff93fc452f437a3e95d755ccc324f93
    const pricingType = market._pricingType;
    if ((pricingType && pricingType == constants_1.PRICINGTYPE__CHAINLINK) || market.inputToken == constants_1.WETH_ADDRESS) {
        return true;
    }
    return false;
}
function getEULPriceUSD(event) {
    const eulerContract = Euler_1.Euler.bind(graph_ts_1.Address.fromString(constants_1.EULER_ADDRESS));
    const execProxyAddress = eulerContract.moduleIdToProxy(constants_1.MODULEID__EXEC);
    const eulMarket = (0, getters_1.getOrCreateMarket)(constants_1.EUL_MARKET_ADDRESS);
    let EULPriceUSD = updatePrices(execProxyAddress, eulMarket, event);
    if (!EULPriceUSD) {
        const EULToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.EUL_ADDRESS));
        EULPriceUSD = EULToken.lastPriceUSD;
    }
    return EULPriceUSD;
}
