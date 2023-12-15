"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLiquidatefCash = exports.handleLiquidateCollateralCurrency = exports.handleLiquidateLocalCurrency = exports.handleLendBorrowTrade = void 0;
/* eslint-disable @typescript-eslint/no-magic-numbers */
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Notional_1 = require("../../generated/Notional/Notional");
const constants_1 = require("../common/constants");
const numbers_1 = require("../common/numbers");
const account_1 = require("../getters/account");
const market_1 = require("../getters/market");
const transactions_1 = require("../setters/transactions");
const accountAssets_1 = require("../getters/accountAssets");
const util_1 = require("../common/util");
const arrays_1 = require("../common/arrays");
const interestRate_1 = require("../getters/interestRate");
const token_1 = require("../getters/token");
function handleLendBorrowTrade(event) {
    // params
    const currencyId = event.params.currencyId;
    const maturity = event.params.maturity;
    const marketId = currencyId.toString() + "-" + maturity.toString();
    // entities
    const market = (0, market_1.getOrCreateMarket)(event, marketId);
    const account = (0, account_1.getOrCreateAccount)(event.params.account.toHexString());
    const token = (0, util_1.getTokenFromCurrency)(event, currencyId.toString());
    // protocol contract
    const notional = Notional_1.Notional.bind(graph_ts_1.Address.fromString(constants_1.PROTOCOL_ID));
    // update input token price
    const tokenPriceUSD = token.lastPriceUSD
        ? token.lastPriceUSD
        : constants_1.BIGDECIMAL_ZERO;
    market.inputTokenPriceUSD = tokenPriceUSD;
    // update liquidation params
    const rateStorageCall = notional.try_getRateStorage(currencyId);
    if (rateStorageCall.reverted) {
        graph_ts_1.log.error("[handleLendBorrowTrade] getRateStorage for currencyId {} reverted", [currencyId.toString()]);
    }
    else {
        market.maximumLTV = graph_ts_1.BigDecimal.fromString((rateStorageCall.value.getEthRate().haircut * 0.01).toString());
        market.liquidationThreshold = graph_ts_1.BigDecimal.fromString((rateStorageCall.value.getEthRate().rateBuffer * 0.01).toString());
        market.liquidationPenalty = graph_ts_1.BigDecimal.fromString((rateStorageCall.value.getEthRate().liquidationDiscount - constants_1.INT_HUNDRED).toString());
    }
    // update output token
    const encodedIdCall = notional.try_encodeToId(currencyId, maturity, 1);
    if (encodedIdCall.reverted) {
        graph_ts_1.log.error("[handleLendBorrowTrade] encodeToId for currencyId {}, maturity {} reverted", [currencyId.toString(), maturity.toString()]);
    }
    else {
        market.outputToken = (0, token_1.getOrCreateERC1155Token)(constants_1.PROTOCOL_ID, encodedIdCall.value).id;
    }
    market.save();
    // track status of markets
    const allMarkets = (0, market_1.getMarketsWithStatus)(event);
    if (allMarkets.activeMarkets.indexOf(market.id) < 0) {
        allMarkets.activeMarkets = (0, arrays_1.addToArrayAtIndex)(allMarkets.activeMarkets, market.id, 0);
        allMarkets.save();
    }
    // get active markets
    const currencyIds = [1, 2, 3, 4];
    let activeMarkets = [];
    for (let i = 0; i < currencyIds.length; i++) {
        const call = notional.try_getActiveMarkets(currencyIds[i]);
        if (call.reverted) {
            graph_ts_1.log.error("[handleLendBorrowTrade] getActiveMarkets for currencyId {} reverted", [currencyIds[i].toString()]);
        }
        else {
            for (let j = 0; j < call.value.length; j++) {
                const maturity = call.value[j].maturity;
                const impliedRate = call.value[j].lastImpliedRate;
                const currencyMarket = currencyIds[i].toString() + "-" + maturity.toString();
                // set active markets for currency
                activeMarkets = activeMarkets.concat([currencyMarket]);
                // set/update current market attributes
                if (currencyMarket == market.id) {
                    const mkt = (0, market_1.getOrCreateMarket)(event, currencyMarket);
                    // set interest rate for market
                    const interestRate = (0, interestRate_1.getOrCreateInterestRate)(currencyMarket);
                    const rate = (0, numbers_1.bigIntToBigDecimal)(impliedRate, constants_1.RATE_PRECISION_DECIMALS);
                    interestRate.rate = rate.times(constants_1.BIGDECIMAL_HUNDRED);
                    interestRate.save();
                    // set exchange rate for market in event
                    const timeToMaturity = (0, numbers_1.bigIntToBigDecimal)(maturity.minus(event.block.timestamp), 0);
                    // set exchange rate only when timeMaturity > 0
                    if (timeToMaturity > constants_1.BIGDECIMAL_ZERO) {
                        const exchangeRate = graph_ts_1.BigDecimal.fromString(Math.exp(parseFloat(rate.times(timeToMaturity).div(constants_1.SECONDS_PER_YEAR).toString())).toString());
                        mkt.exchangeRate = exchangeRate;
                    }
                    mkt.save();
                }
            }
        }
    }
    // update market entities when they become inactive
    for (let k = 0; k < allMarkets.activeMarkets.length; k++) {
        if (!activeMarkets.includes(allMarkets.activeMarkets[k])) {
            const m = (0, market_1.getOrCreateMarket)(event, allMarkets.activeMarkets[k]);
            // market status
            m.isActive = false;
            m.canBorrowFrom = false;
            // manual update balances to 0
            m.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
            m.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
            m.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
            // manually update positions to 0
            m.positionCount = 0;
            m.closedPositionCount += m.openPositionCount;
            m.openPositionCount = 0;
            m.closedPositionCount = 0;
            m.lendingPositionCount = 0;
            m.borrowingPositionCount = 0;
            m.save();
            const maturedMarketIndex = allMarkets.activeMarkets.indexOf(m.id);
            allMarkets.activeMarkets = (0, arrays_1.removeFromArrayAtIndex)(allMarkets.activeMarkets, maturedMarketIndex);
            allMarkets.maturedMarkets = (0, arrays_1.addToArrayAtIndex)(allMarkets.maturedMarkets, m.id, 0);
            allMarkets.save();
        }
    }
    // account fCash before; we use asset entity to track fCash values before and after TX
    const fCashBeforeTransaction = (0, accountAssets_1.getOrCreateAsset)(account.id, currencyId.toString(), event.params.maturity).notional;
    // update fCash asset values
    const accountPortfolioCallResult = notional.try_getAccountPortfolio(event.params.account);
    if (accountPortfolioCallResult.reverted) {
        graph_ts_1.log.error("[handleLendBorrowTrade] getAccountPortfolio reverted", []);
    }
    else {
        const portfolio = new Array();
        for (let i = 0; i < accountPortfolioCallResult.value.length; i++) {
            portfolio.push(accountPortfolioCallResult.value[i]);
        }
        (0, accountAssets_1.updateAccountAssets)(account, portfolio, event);
        // Update fCash for currency-maturity pair for an account when portfolio is empty
        if (portfolio.length == 0) {
            (0, accountAssets_1.updateAccountAssetOnEmptyPortfolio)(account.id, currencyId.toString(), event.params.maturity, event);
        }
    }
    // account fCash after; we use asset entity to track fCash values before and after TX
    const fCashAfterTransaction = (0, accountAssets_1.getOrCreateAsset)(account.id, currencyId.toString(), event.params.maturity).notional;
    // LendBorrow amounts (assetCash, fCash, USD)
    const cTokenAmount = event.params.netAssetCash;
    const fCashAmount = event.params.netfCash;
    const amountUSD = (0, numbers_1.bigIntToBigDecimal)(cTokenAmount, token.decimals).times(tokenPriceUSD);
    // we need absolute amounts for metrics; fCash is signed
    let absAmountUSD = amountUSD;
    let absAmount = cTokenAmount;
    let absfCashAmount = fCashAmount;
    if (cTokenAmount < constants_1.BIGINT_ZERO) {
        absAmountUSD = amountUSD.neg();
        absAmount = cTokenAmount.neg();
    }
    if (fCashAmount < constants_1.BIGINT_ZERO) {
        absfCashAmount = fCashAmount.neg();
    }
    // Identify Transaction Type:
    // transactions of different user intention may call the
    // same action type in notional smart contract design
    if (fCashBeforeTransaction <= constants_1.BIGINT_ZERO &&
        fCashAfterTransaction < fCashBeforeTransaction) {
        (0, transactions_1.createBorrow)(event, market, absfCashAmount, absAmount, absAmountUSD);
    }
    else if (
    // Logging for reference. More details in README.
    fCashBeforeTransaction > constants_1.BIGINT_ZERO &&
        fCashAfterTransaction < constants_1.BIGINT_ZERO &&
        fCashAfterTransaction < fCashBeforeTransaction) {
        graph_ts_1.log.warning(" -- Withdraw and Borrow at the same time, account: {}, hash: {}, fCashAmount: {}", [account.id, event.transaction.hash.toHexString(), fCashAmount.toString()]);
    }
    else if (fCashBeforeTransaction > constants_1.BIGINT_ZERO &&
        fCashAfterTransaction >= constants_1.BIGINT_ZERO &&
        fCashAfterTransaction < fCashBeforeTransaction) {
        (0, transactions_1.createWithdraw)(event, market, absfCashAmount, absAmount, absAmountUSD);
    }
    else if (
    // Logging for reference. More details in README.
    fCashBeforeTransaction < constants_1.BIGINT_ZERO &&
        fCashAfterTransaction > constants_1.BIGINT_ZERO &&
        fCashAfterTransaction > fCashBeforeTransaction) {
        graph_ts_1.log.warning(" -- Repay and Deposit at the same time, account: {}, hash: {}, fCashAmount: {}", [account.id, event.transaction.hash.toHexString(), fCashAmount.toString()]);
    }
    else if (fCashBeforeTransaction >= constants_1.BIGINT_ZERO &&
        fCashAfterTransaction > fCashBeforeTransaction) {
        (0, transactions_1.createDeposit)(event, market, absfCashAmount, absAmount, absAmountUSD);
    }
    else if (fCashBeforeTransaction < constants_1.BIGINT_ZERO &&
        fCashAfterTransaction <= constants_1.BIGINT_ZERO &&
        fCashAfterTransaction > fCashBeforeTransaction) {
        (0, transactions_1.createRepay)(event, market, absfCashAmount, absAmount, absAmountUSD);
    }
}
exports.handleLendBorrowTrade = handleLendBorrowTrade;
function handleLiquidateLocalCurrency(event) {
    const currencyId = event.params.localCurrencyId;
    const liquidatee = event.params.liquidated;
    const liquidator = event.params.liquidator;
    const amount = event.params.netLocalFromLiquidator;
    (0, transactions_1.createLiquidate)(event, currencyId, liquidator, liquidatee, amount);
}
exports.handleLiquidateLocalCurrency = handleLiquidateLocalCurrency;
function handleLiquidateCollateralCurrency(event) {
    const currencyId = event.params.localCurrencyId;
    const liquidatee = event.params.liquidated;
    const liquidator = event.params.liquidator;
    const amount = event.params.netLocalFromLiquidator;
    (0, transactions_1.createLiquidate)(event, currencyId, liquidator, liquidatee, amount);
}
exports.handleLiquidateCollateralCurrency = handleLiquidateCollateralCurrency;
function handleLiquidatefCash(event) {
    const currencyId = event.params.localCurrencyId;
    const liquidatee = event.params.liquidated;
    const liquidator = event.params.liquidator;
    const amount = event.params.netLocalFromLiquidator;
    (0, transactions_1.createLiquidate)(event, currencyId, liquidator, liquidatee, amount);
}
exports.handleLiquidatefCash = handleLiquidatefCash;
