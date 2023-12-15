"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRedeemed = exports.handleWithdrawn = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const event_1 = require("../entities/event");
const market_1 = require("../entities/market");
const constants_1 = require("../utils/constants");
const LoanToken_1 = require("../../generated/templates/LoanToken/LoanToken");
const position_1 = require("../entities/position");
const token_1 = require("../entities/token");
const price_1 = require("../entities/price");
const market_2 = require("../entities/market");
function handleWithdrawn(event) {
    const timestamp = event.block.timestamp.toString();
    const contract = LoanToken_1.LoanToken.bind(event.address);
    const poolResult = contract.try_pool();
    let poolAddress;
    if (poolResult.reverted) {
        // Handling for leagcy loan token contract
        poolAddress = constants_1.LEGACY_POOL_ADDRESS;
    }
    else {
        poolAddress = poolResult.value.toHexString();
    }
    const market = (0, market_1.getMarket)(graph_ts_1.Address.fromString(poolAddress));
    const tokenResult = contract.try_token();
    let tokenAddress;
    if (tokenResult.reverted) {
        // Handling for leagcy loan token contract
        tokenAddress = constants_1.LEGACY_POOL_TOKEN_ADDRESS;
    }
    else {
        tokenAddress = tokenResult.value.toHexString();
    }
    const apyResult = contract.try_apy();
    if (!apyResult.reverted) {
        (0, market_2.updateMarketRates)(event, market, apyResult.value.toBigDecimal().div(constants_1.BIGDECIMAL_HUNDRED));
    }
    const amountResult = contract.try_amount();
    if (amountResult.reverted) {
        return;
    }
    const amount = amountResult.value;
    (0, event_1.createBorrow)(event, market, graph_ts_1.Address.fromString(tokenAddress), event.params.beneficiary, amount);
    (0, market_1.changeMarketBorrowBalance)(event, market, amount, true);
    const borrowerResult = contract.try_borrower();
    if (borrowerResult.reverted) {
        return;
    }
    (0, position_1.changeUserStableBorrowerPosition)(event, borrowerResult.value, market, amount);
}
exports.handleWithdrawn = handleWithdrawn;
function handleRedeemed(event) {
    const contract = LoanToken_1.LoanToken.bind(event.address);
    const tryPoolResult = contract.try_pool();
    if (tryPoolResult.reverted) {
        return;
    }
    const pool = tryPoolResult.value;
    const market = (0, market_1.getMarket)(pool);
    const tryTokenResult = contract.try_token();
    if (tryTokenResult.reverted) {
        return;
    }
    const token = tryTokenResult.value;
    const tryBorrowerResult = contract.try_borrower();
    if (tryBorrowerResult.reverted) {
        return;
    }
    const borrower = tryBorrowerResult.value;
    (0, event_1.createRepay)(event, market, token, borrower, event.params.redeemedAmount);
    const balanceChange = event.params.redeemedAmount.times(constants_1.BIGINT_NEGATIVE_ONE);
    (0, market_1.changeMarketBorrowBalance)(event, market, balanceChange, true);
    (0, position_1.changeUserStableBorrowerPosition)(event, borrower, market, balanceChange);
    const tryStatusResult = contract.try_status();
    if (tryStatusResult.reverted) {
        return;
    }
    const status = tryStatusResult.value;
    if (status == 3) {
        const tryAmountResult = contract.try_amount();
        if (tryAmountResult.reverted) {
            return;
        }
        const amount = tryAmountResult.value;
        const tryDebtResult = contract.try_debt();
        if (tryDebtResult.reverted) {
            return;
        }
        const debt = tryDebtResult.value;
        const fee = debt.minus(amount).div(constants_1.BIGINT_TEN);
        const underlyingToken = (0, token_1.getOrCreateToken)(token);
        (0, market_1.addMarketProtocolSideRevenue)(event, market, (0, price_1.amountInUSD)(fee, underlyingToken));
        (0, market_1.addMarketSupplySideRevenue)(event, market, (0, price_1.amountInUSD)(debt.minus(amount).minus(fee), underlyingToken));
    }
}
exports.handleRedeemed = handleRedeemed;
