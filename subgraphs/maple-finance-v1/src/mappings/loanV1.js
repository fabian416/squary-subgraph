"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLiquidation = exports.handlePaymentMade = exports.handleDrawdown = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../common/constants");
const supporting_1 = require("../common/mappingHelpers/getOrCreate/supporting");
const markets_1 = require("../common/mappingHelpers/getOrCreate/markets");
const protocol_1 = require("../common/mappingHelpers/getOrCreate/protocol");
const snapshots_1 = require("../common/mappingHelpers/getOrCreate/snapshots");
const transactions_1 = require("../common/mappingHelpers/getOrCreate/transactions");
const intervalUpdate_1 = require("../common/mappingHelpers/update/intervalUpdate");
const prices_1 = require("../common/prices/prices");
const utils_1 = require("../common/utils");
function handleDrawdown(event) {
    const drawdownAmount = event.params.drawdownAmount;
    const treasuryFeePaid = (0, utils_1.bigDecimalToBigInt)(drawdownAmount.toBigDecimal().times((0, protocol_1.getOrCreateProtocol)()._treasuryFee));
    const loan = (0, markets_1.getOrCreateLoan)(event, event.address);
    ////
    // Create borrow
    ////
    (0, transactions_1.createBorrow)(event, loan, drawdownAmount, treasuryFeePaid);
    ////
    // Update market
    ////
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(loan.market));
    const inputToken = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.inputToken));
    const protocolRevenueUSD = (0, prices_1.getTokenAmountInUSD)(event, inputToken, treasuryFeePaid);
    market._cumulativeTreasuryRevenue = market._cumulativeTreasuryRevenue.plus(treasuryFeePaid);
    market.cumulativeProtocolSideRevenueUSD = market.cumulativeProtocolSideRevenueUSD.plus(protocolRevenueUSD);
    market.save();
    ////
    // Update loan
    ////
    loan.drawnDown = loan.drawnDown.plus(drawdownAmount);
    loan.treasuryFeePaid = loan.treasuryFeePaid.plus(treasuryFeePaid);
    loan.save();
    ////
    // Update protocol
    ////
    protocol.cumulativeProtocolSideRevenueUSD = protocol.cumulativeProtocolSideRevenueUSD.plus(protocolRevenueUSD);
    protocol.save();
    ////
    // Update financial snapshot
    ////
    const financialsDailySnapshot = (0, snapshots_1.getOrCreateFinancialsDailySnapshot)(event);
    financialsDailySnapshot.dailyProtocolSideRevenueUSD = financialsDailySnapshot.dailyProtocolSideRevenueUSD.plus((0, prices_1.getTokenAmountInUSD)(event, inputToken, treasuryFeePaid));
    financialsDailySnapshot.save();
    ////
    // Update market snapshot
    ////
    const marketDailySnapshot = (0, snapshots_1.getOrCreateMarketDailySnapshot)(event, market);
    marketDailySnapshot.dailyProtocolSideRevenueUSD =
        marketDailySnapshot.dailyProtocolSideRevenueUSD.plus(protocolRevenueUSD);
    marketDailySnapshot.save();
    const MarketHourlySnapshot = (0, snapshots_1.getOrCreateMarketHourlySnapshot)(event, market);
    MarketHourlySnapshot.hourlyProtocolSideRevenueUSD =
        MarketHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(protocolRevenueUSD);
    MarketHourlySnapshot.save();
    ////
    // Trigger interval update
    ////
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handleDrawdown = handleDrawdown;
function handlePaymentMade(event) {
    const loan = (0, markets_1.getOrCreateLoan)(event, event.address);
    ////
    // Create repay
    ////
    const repay = (0, transactions_1.createRepay)(event, loan, event.params.principalPaid, event.params.interestPaid, constants_1.ZERO_BI // Treasury establishment fee happens on drawfown for V1 loans
    );
    ////
    // Update loan
    ////
    loan.principalPaid = loan.principalPaid.plus(repay._principalPaid);
    loan.interestPaid = loan.interestPaid.plus(repay._interestPaid);
    loan.save();
    ////
    // Update financial snapshot
    ////
    const financialsDailySnapshot = (0, snapshots_1.getOrCreateFinancialsDailySnapshot)(event);
    financialsDailySnapshot.dailyRepayUSD = financialsDailySnapshot.dailyRepayUSD.plus(repay.amountUSD);
    financialsDailySnapshot.save();
    ////
    // Trigger interval update
    ////
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(loan.market));
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handlePaymentMade = handlePaymentMade;
function handleLiquidation(event) {
    const loan = (0, markets_1.getOrCreateLoan)(event, event.address);
    ////
    // Update loan, liqudiation accounted as principal paid
    ////
    loan.principalPaid = loan.principalPaid.plus(event.params.liquidityAssetReturned.minus(event.params.liquidationExcess));
    loan.save();
    ////
    // Trigger interval update
    ////
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(loan.market));
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handleLiquidation = handleLiquidation;
