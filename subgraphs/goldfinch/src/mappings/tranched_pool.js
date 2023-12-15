"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSharePriceUpdated = exports.handleReserveFundsCollected = exports.handlePaymentApplied = exports.handleDrawdownMade = exports.handleEmergencyShutdown = exports.handleSliceCreated = exports.handleTrancheLocked = exports.handleWithdrawalMade = exports.handleDrawdownsUnpaused = exports.handleDrawdownsPaused = exports.handleDepositMade = exports.handleCreditLineMigrated = void 0;
const schema_1 = require("../../generated/schema");
const GoldfinchConfig_1 = require("../../generated/templates/TranchedPool/GoldfinchConfig");
const CreditLine_1 = require("../../generated/templates/TranchedPool/CreditLine");
const TranchedPool_1 = require("../../generated/templates/TranchedPool/TranchedPool");
const constants_1 = require("../common/constants");
const helpers_1 = require("../entities/helpers");
const tranched_pool_1 = require("../entities/tranched_pool");
const user_1 = require("../entities/user");
const zapper_1 = require("../entities/zapper");
const utils_1 = require("../common/utils");
const getters_1 = require("../common/getters");
const CreditLine_2 = require("../../generated/templates/TranchedPool/CreditLine");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const helpers_2 = require("../common/helpers");
const helpers_3 = require("./helpers");
function handleCreditLineMigrated(event) {
    const market = (0, getters_1.getOrCreateMarket)(event.address.toHexString(), event);
    market._creditLine = event.params.newCreditLine.toHexString();
    const creditLineContract = CreditLine_2.CreditLine.bind(event.params.newCreditLine);
    const currentLimitResult = creditLineContract.try_currentLimit();
    if (!currentLimitResult.reverted &&
        currentLimitResult.value.le(constants_1.BIGINT_ZERO)) {
        creditLineContract.interestApr();
        market.canBorrowFrom = false;
    }
    market.save();
    //
    (0, tranched_pool_1.initOrUpdateTranchedPool)(event.address, event.block.timestamp);
    (0, tranched_pool_1.updatePoolCreditLine)(event.address, event.block.timestamp);
}
exports.handleCreditLineMigrated = handleCreditLineMigrated;
function handleDepositMade(event) {
    const poolContract = TranchedPool_1.TranchedPool.bind(event.address);
    const configAddress = poolContract.config();
    const creditLineAddress = poolContract.creditLine();
    (0, helpers_3._handleDepositMessari)(event.address.toHexString(), event.params.tokenId, event.params.amount, event.params.owner.toHexString(), configAddress, creditLineAddress, event);
    // save a mapping of tokenID to market (tranched pool) id for backer emission reward
    //const tokenId = event.params.tokenId.toHexString();
    //getOrCreatePoolToken(tokenId, market.id);
    //log.info("[handleDepositMade]poolToken({}, {})", [tokenId, market.id]);
    //
    (0, tranched_pool_1.handleDeposit)(event);
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "TRANCHED_POOL_DEPOSIT", event.params.owner);
    transaction.loan = event.address.toHexString();
    transaction.sentAmount = event.params.amount;
    transaction.sentToken = "USDC";
    transaction.receivedNftId = event.params.tokenId.toString();
    transaction.receivedNftType = "POOL_TOKEN";
    transaction.save();
    (0, zapper_1.createZapMaybe)(event);
}
exports.handleDepositMade = handleDepositMade;
function handleDrawdownsPaused(event) {
    const market = (0, getters_1.getOrCreateMarket)(event.address.toHexString(), event);
    market.canBorrowFrom = false;
    market.save();
    //
    (0, tranched_pool_1.initOrUpdateTranchedPool)(event.address, event.block.timestamp);
}
exports.handleDrawdownsPaused = handleDrawdownsPaused;
function handleDrawdownsUnpaused(event) {
    const market = (0, getters_1.getOrCreateMarket)(event.address.toHexString(), event);
    market.canBorrowFrom = true;
    market.save();
    //
    (0, tranched_pool_1.initOrUpdateTranchedPool)(event.address, event.block.timestamp);
}
exports.handleDrawdownsUnpaused = handleDrawdownsUnpaused;
function handleWithdrawalMade(event) {
    (0, helpers_3._handleWithdrawMessari)(event.address.toHexString(), event.params.principalWithdrawn, event.params.owner.toHexString(), event);
    //
    (0, tranched_pool_1.initOrUpdateTranchedPool)(event.address, event.block.timestamp);
    (0, tranched_pool_1.updatePoolCreditLine)(event.address, event.block.timestamp);
    const tranchedPoolContract = TranchedPool_1.TranchedPool.bind(event.address);
    const seniorPoolAddress = (0, utils_1.getAddressFromConfig)(tranchedPoolContract, constants_1.CONFIG_KEYS_ADDRESSES.SeniorPool);
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, event.params.owner.equals(seniorPoolAddress)
        ? "SENIOR_POOL_REDEMPTION"
        : "TRANCHED_POOL_WITHDRAWAL", event.params.owner);
    transaction.transactionHash = event.transaction.hash;
    transaction.loan = event.address.toHexString();
    transaction.sentNftId = event.params.tokenId.toString();
    transaction.sentNftType = "POOL_TOKEN";
    transaction.receivedAmount = event.params.interestWithdrawn.plus(event.params.principalWithdrawn);
    transaction.receivedToken = "USDC";
    transaction.save();
    (0, zapper_1.deleteZapAfterUnzapMaybe)(event);
}
exports.handleWithdrawalMade = handleWithdrawalMade;
function handleTrancheLocked(event) {
    const marketID = event.address.toHexString();
    const market = (0, getters_1.getOrCreateMarket)(marketID, event);
    graph_ts_1.log.debug("[handleTrancheLocked]market._interestTimestamp for market {} set to {}", [marketID, event.block.timestamp.toString()]);
    market._interestTimestamp = event.block.timestamp;
    market.save();
    //
    (0, tranched_pool_1.initOrUpdateTranchedPool)(event.address, event.block.timestamp);
    (0, tranched_pool_1.updatePoolCreditLine)(event.address, event.block.timestamp);
    const tranchedPoolContract = TranchedPool_1.TranchedPool.bind(event.address);
    const goldfinchConfigContract = GoldfinchConfig_1.GoldfinchConfig.bind(tranchedPoolContract.config());
    const tranchedPool = assert(schema_1.TranchedPool.load(event.address.toHexString()));
    tranchedPool.estimatedLeverageRatio = (0, tranched_pool_1.getLeverageRatioFromConfig)(goldfinchConfigContract);
    tranchedPool.save();
}
exports.handleTrancheLocked = handleTrancheLocked;
function handleSliceCreated(event) {
    (0, tranched_pool_1.initOrUpdateTranchedPool)(event.address, event.block.timestamp);
    (0, tranched_pool_1.updatePoolCreditLine)(event.address, event.block.timestamp);
}
exports.handleSliceCreated = handleSliceCreated;
function handleEmergencyShutdown(event) {
    const market = (0, getters_1.getOrCreateMarket)(event.address.toHexString(), event);
    market.canBorrowFrom = false;
    market.isActive = false;
    market.save();
    //
    (0, tranched_pool_1.initOrUpdateTranchedPool)(event.address, event.block.timestamp);
    (0, tranched_pool_1.updatePoolCreditLine)(event.address, event.block.timestamp);
}
exports.handleEmergencyShutdown = handleEmergencyShutdown;
function handleDrawdownMade(event) {
    const marketID = event.address.toHexString();
    (0, helpers_3._handleDrawdownMessari)(marketID, event.params.amount, event.params.borrower.toHexString(), event);
    //
    const tranchedPool = assert(schema_1.TranchedPool.load(marketID));
    (0, user_1.getOrInitUser)(event.params.borrower); // ensures that a wallet making a drawdown is correctly considered a user
    (0, tranched_pool_1.initOrUpdateTranchedPool)(event.address, event.block.timestamp);
    (0, tranched_pool_1.updatePoolCreditLine)(event.address, event.block.timestamp);
    (0, tranched_pool_1.updatePoolTokensRedeemable)(tranchedPool);
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "TRANCHED_POOL_DRAWDOWN", event.params.borrower);
    transaction.loan = event.address.toHexString();
    transaction.receivedAmount = event.params.amount;
    transaction.receivedToken = "USDC";
    transaction.save();
}
exports.handleDrawdownMade = handleDrawdownMade;
function handlePaymentApplied(event) {
    (0, helpers_3._handleRepayMessari)(event.address.toHexString(), event.params.principalAmount, event.params.interestAmount, event.params.reserveAmount, event.params.payer.toHexString(), event);
    //
    (0, user_1.getOrInitUser)(event.params.payer); // ensures that a wallet making a payment is correctly considered a user
    (0, tranched_pool_1.initOrUpdateTranchedPool)(event.address, event.block.timestamp);
    (0, tranched_pool_1.updatePoolCreditLine)(event.address, event.block.timestamp);
    const tranchedPool = assert(schema_1.TranchedPool.load(event.address.toHexString()));
    tranchedPool.principalAmountRepaid = tranchedPool.principalAmountRepaid.plus(event.params.principalAmount);
    tranchedPool.interestAmountRepaid = tranchedPool.interestAmountRepaid.plus(event.params.interestAmount);
    tranchedPool.save();
    (0, tranched_pool_1.updatePoolTokensRedeemable)(tranchedPool);
    (0, tranched_pool_1.updatePoolRewardsClaimable)(tranchedPool, TranchedPool_1.TranchedPool.bind(event.address));
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "TRANCHED_POOL_REPAYMENT", event.params.payer);
    transaction.loan = event.address.toHexString();
    transaction.sentAmount = event.params.principalAmount.plus(event.params.interestAmount);
    transaction.sentToken = "USDC";
    transaction.save();
}
exports.handlePaymentApplied = handlePaymentApplied;
function handleReserveFundsCollected(event) {
    const marketID = event.address.toHexString();
    const amountUSD = event.params.amount.divDecimal(constants_1.USDC_DECIMALS);
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const market = (0, getters_1.getOrCreateMarket)(marketID, event);
    (0, helpers_2.updateRevenues)(protocol, market, constants_1.BIGDECIMAL_ZERO, amountUSD, event, true);
    //snapshots updated by updateRevenues()
}
exports.handleReserveFundsCollected = handleReserveFundsCollected;
function handleSharePriceUpdated(event) {
    // handle migrated pools
    const marketID = event.address.toHexString();
    const market = (0, getters_1.getOrCreateMarket)(marketID, event);
    if (!market._isMigratedTranchedPool) {
        // do nothing if it is not a migrated tranched pool
        return;
    }
    const tranchedPoolContract = TranchedPool_1.TranchedPool.bind(event.address);
    market.inputTokenBalance = tranchedPoolContract.getTranche(event.params.tranche).principalDeposited;
    market.totalDepositBalanceUSD =
        market.inputTokenBalance.divDecimal(constants_1.USDC_DECIMALS);
    market.totalValueLockedUSD = market.totalDepositBalanceUSD;
    // treat the migration as a one-off deposit
    market.cumulativeDepositUSD = market.totalDepositBalanceUSD;
    const configContract = GoldfinchConfig_1.GoldfinchConfig.bind(tranchedPoolContract.config());
    if (!market._poolToken) {
        market._poolToken = configContract
            .getAddress(graph_ts_1.BigInt.fromI32(constants_1.CONFIG_KEYS_ADDRESSES.PoolTokens))
            .toHexString();
    }
    const creditLineAddress = tranchedPoolContract.creditLine();
    const creditLineContract = CreditLine_1.CreditLine.bind(creditLineAddress);
    if (!market._creditLine) {
        market._creditLine = creditLineAddress.toHexString();
    }
    const borrower = creditLineContract.borrower().toHexString();
    const curretLimitResult = creditLineContract.try_currentLimit();
    if (!curretLimitResult.reverted && curretLimitResult.value.gt(constants_1.BIGINT_ZERO)) {
        market.isActive = true;
        market.canBorrowFrom = true;
    }
    const totalBorrowBalance = creditLineContract.balance();
    market.totalBorrowBalanceUSD = totalBorrowBalance.divDecimal(constants_1.USDC_DECIMALS);
    // set _isMigratedTranchedPool to false, so we only process the migration once
    market._isMigratedTranchedPool = false;
    market.save();
    const protocol = (0, getters_1.getOrCreateProtocol)();
    let marketIDs = protocol._marketIDs;
    if (marketIDs.indexOf(market.id) < 0) {
        marketIDs = marketIDs.concat([market.id]);
    }
    let totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    let totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    for (let i = 0; i < protocol._marketIDs.length; i++) {
        const mktID = protocol._marketIDs[i];
        const mkt = (0, getters_1.getOrCreateMarket)(mktID, event);
        totalDepositBalanceUSD = totalDepositBalanceUSD.plus(mkt.totalDepositBalanceUSD);
        totalBorrowBalanceUSD = totalBorrowBalanceUSD.plus(mkt.totalBorrowBalanceUSD);
    }
    protocol._marketIDs = marketIDs;
    protocol.totalDepositBalanceUSD = totalDepositBalanceUSD;
    protocol.totalValueLockedUSD = protocol.totalDepositBalanceUSD;
    // treat the migration as a one-off deposit
    protocol.cumulativeDepositUSD = protocol.cumulativeDepositUSD.plus(market.totalDepositBalanceUSD);
    protocol.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD.plus(market.totalBorrowBalanceUSD);
    protocol.save();
    graph_ts_1.log.info("[handleSharePriceUpdated]migrated tranched pool {}: market.tvl={},market.totalBorrowUSD={},tx={}", [
        market.id,
        market.totalDepositBalanceUSD.toString(),
        market.totalBorrowBalanceUSD.toString(),
        event.transaction.hash.toHexString(),
    ]);
    (0, helpers_2.snapshotMarket)(market, market.totalDepositBalanceUSD, event, constants_1.TransactionType.DEPOSIT);
    (0, helpers_2.snapshotMarket)(market, market.totalBorrowBalanceUSD, event, constants_1.TransactionType.BORROW);
    (0, helpers_2.snapshotFinancials)(protocol, market.totalDepositBalanceUSD, event, constants_1.TransactionType.DEPOSIT);
    (0, helpers_2.snapshotFinancials)(protocol, market.totalBorrowBalanceUSD, event, constants_1.TransactionType.BORROW);
    (0, helpers_2.updateUsageMetrics)(protocol, borrower, event, constants_1.TransactionType.BORROW);
    // ignore the depositor usage metrics as we have no info
    //handle borrow positin & transaction
    const borrowerAccount = (0, getters_1.getOrCreateAccount)(borrower);
    const borrowPositionID = (0, helpers_2.updatePosition)(protocol, market, borrowerAccount, totalBorrowBalance, constants_1.PositionSide.BORROWER, constants_1.TransactionType.BORROW, event);
    (0, helpers_2.createTransaction)(constants_1.TransactionType.BORROW, market, borrower, borrowPositionID, totalBorrowBalance, totalBorrowBalanceUSD, event);
    //handle lending positin & transaction
    const lenderAccount = (0, getters_1.getOrCreateAccount)(event.params.pool.toHexString());
    const lenderPositionID = (0, helpers_2.updatePosition)(protocol, market, lenderAccount, market.inputTokenBalance, constants_1.PositionSide.LENDER, constants_1.TransactionType.DEPOSIT, event);
    (0, helpers_2.createTransaction)(constants_1.TransactionType.DEPOSIT, market, borrower, lenderPositionID, market.inputTokenBalance, market.totalDepositBalanceUSD, event);
}
exports.handleSharePriceUpdated = handleSharePriceUpdated;
