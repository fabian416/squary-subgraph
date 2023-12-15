"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReserveFundsCollected = exports.handlePrincipalWrittenDown = exports.handlePrincipalCollected = exports.handleInterestCollected = exports.handleInvestmentMadeInSenior = exports.handleInvestmentMadeInJunior = exports.handleWithdrawalMade = exports.handleDepositMade = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const SeniorPool_1 = require("../../generated/SeniorPool/SeniorPool");
const Fidu_1 = require("../../generated/SeniorPool/Fidu");
const constants_1 = require("../common/constants");
const helpers_1 = require("../entities/helpers");
const senior_pool_1 = require("../entities/senior_pool");
const user_1 = require("../entities/user");
const utils_1 = require("../common/utils");
const getters_1 = require("../common/getters");
const schema_1 = require("../../generated/schema");
const helpers_2 = require("../common/helpers");
const market_1 = require("../entities/market");
function handleDepositMade(event) {
    const capitalProvider = event.params.capitalProvider.toHexString();
    const amount = event.params.amount;
    const amountUSD = amount.divDecimal(constants_1.USDC_DECIMALS);
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const market = (0, getters_1.getOrCreateMarket)(event.address.toHexString(), event);
    const inputToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(market.inputToken));
    const outputToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.FIDU_ADDRESS));
    const rewardToken = (0, getters_1.getOrCreateRewardToken)(graph_ts_1.Address.fromString(constants_1.GFI_ADDRESS), constants_1.RewardTokenType.DEPOSIT);
    market.outputToken = outputToken.id;
    market.rewardTokens = [rewardToken.id];
    // USDC
    market.inputTokenPriceUSD = constants_1.BIGDECIMAL_ONE;
    const seniorPoolContract = SeniorPool_1.SeniorPool.bind(event.address);
    market.inputTokenBalance = seniorPoolContract.assets();
    market.totalDepositBalanceUSD =
        market.inputTokenBalance.divDecimal(constants_1.USDC_DECIMALS);
    market.totalValueLockedUSD = market.totalDepositBalanceUSD;
    market.cumulativeDepositUSD = market.cumulativeDepositUSD.plus(amountUSD);
    if (!market._interestTimestamp) {
        market._interestTimestamp = event.block.timestamp;
    }
    const fiduContract = Fidu_1.Fidu.bind(graph_ts_1.Address.fromString(market.outputToken));
    market.outputTokenSupply = fiduContract.totalSupply();
    const accountBalance = fiduContract.balanceOf(event.params.capitalProvider);
    market.outputTokenPriceUSD = (0, utils_1.bigIntToBDUseDecimals)(seniorPoolContract.sharePrice(), outputToken.decimals);
    market.exchangeRate = (0, utils_1.bigIntToBDUseDecimals)(event.params.amount, inputToken.decimals).div((0, utils_1.bigIntToBDUseDecimals)(event.params.shares, outputToken.decimals));
    let marketIDs = protocol._marketIDs;
    if (marketIDs.indexOf(market.id) < 0) {
        marketIDs = marketIDs.concat([market.id]);
    }
    let totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    for (let i = 0; i < protocol._marketIDs.length; i++) {
        const mkt = (0, getters_1.getOrCreateMarket)(protocol._marketIDs[i], event);
        totalDepositBalanceUSD = totalDepositBalanceUSD.plus(mkt.totalDepositBalanceUSD);
        graph_ts_1.log.info("[handleDepositMade]mkt {} totalDepositBalanceUSD={}", [
            mkt.id,
            mkt.totalDepositBalanceUSD.toString(),
        ]);
    }
    protocol.cumulativeDepositUSD = protocol.cumulativeDepositUSD.plus(amountUSD);
    protocol.totalDepositBalanceUSD = totalDepositBalanceUSD;
    protocol.totalValueLockedUSD = protocol.totalDepositBalanceUSD;
    market.save();
    protocol.save();
    graph_ts_1.log.info("[handleDepositMade]market {}: amountUSD={},market.tvl={},protocl.tvl={},tx={}", [
        market.id,
        amountUSD.toString(),
        market.totalValueLockedUSD.toString(),
        protocol.totalValueLockedUSD.toString(),
        event.transaction.hash.toHexString(),
    ]);
    assert(protocol.totalValueLockedUSD.ge(constants_1.BIGDECIMAL_ZERO), `TVL ${protocol.totalValueLockedUSD} <= 0 after tx ${event.transaction.hash.toHexString()}`);
    (0, helpers_2.snapshotMarket)(market, amountUSD, event, constants_1.TransactionType.DEPOSIT);
    (0, helpers_2.snapshotFinancials)(protocol, amountUSD, event, constants_1.TransactionType.DEPOSIT);
    (0, helpers_2.updateUsageMetrics)(protocol, capitalProvider, event, constants_1.TransactionType.DEPOSIT);
    const account = (0, getters_1.getOrCreateAccount)(capitalProvider);
    const positionID = (0, helpers_2.updatePosition)(protocol, market, account, accountBalance, constants_1.PositionSide.LENDER, constants_1.TransactionType.DEPOSIT, event);
    (0, helpers_2.createTransaction)(constants_1.TransactionType.DEPOSIT, market, capitalProvider, positionID, amount, amountUSD, event);
    // ORIGINAL CODE BELOW
    const rewardTokenAddress = graph_ts_1.Address.fromString(rewardToken.token);
    (0, senior_pool_1.updatePoolStatus)(event);
    (0, user_1.handleDeposit)(event);
    // Purposefully ignore deposits from StakingRewards contract because those will get captured as DepositAndStake events instead
    if (!event.params.capitalProvider.equals(rewardTokenAddress)) {
        const transaction = (0, helpers_1.createTransactionFromEvent)(event, "SENIOR_POOL_DEPOSIT", event.params.capitalProvider);
        transaction.sentAmount = event.params.amount;
        transaction.sentToken = "USDC";
        transaction.receivedAmount = event.params.shares;
        transaction.receivedToken = "FIDU";
        // usdc / fidu
        transaction.fiduPrice = (0, helpers_1.usdcWithFiduPrecision)(event.params.amount).div(event.params.shares);
        transaction.save();
    }
}
exports.handleDepositMade = handleDepositMade;
function handleWithdrawalMade(event) {
    const capitalProvider = event.params.capitalProvider.toHexString();
    const amount = event.params.userAmount.plus(event.params.reserveAmount);
    const amountUSD = amount.divDecimal(constants_1.USDC_DECIMALS);
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const market = (0, getters_1.getOrCreateMarket)(event.address.toHexString(), event);
    const outputToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.FIDU_ADDRESS));
    //const outputToken = Token.load(market.outputToken!)!;
    const seniorPoolContract = SeniorPool_1.SeniorPool.bind(event.address);
    market.inputTokenBalance = seniorPoolContract.assets();
    market.totalDepositBalanceUSD =
        market.inputTokenBalance.divDecimal(constants_1.USDC_DECIMALS);
    market.totalValueLockedUSD = market.totalDepositBalanceUSD;
    assert(market.totalValueLockedUSD.ge(constants_1.BIGDECIMAL_ZERO), `market ${market.id} TVL ${market.totalValueLockedUSD} < 0 after tx ${event.transaction.hash.toHexString()}`);
    const fiduContract = Fidu_1.Fidu.bind(graph_ts_1.Address.fromString(constants_1.FIDU_ADDRESS));
    const accountBalance = fiduContract.balanceOf(event.params.capitalProvider);
    market.outputTokenSupply = fiduContract.totalSupply();
    market.outputTokenPriceUSD = (0, utils_1.bigIntToBDUseDecimals)(seniorPoolContract.sharePrice(), outputToken.decimals);
    let marketIDs = protocol._marketIDs;
    if (marketIDs.indexOf(market.id) < 0) {
        marketIDs = marketIDs.concat([market.id]);
    }
    let totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    for (let i = 0; i < marketIDs.length; i++) {
        const mkt = (0, getters_1.getOrCreateMarket)(marketIDs[i], event);
        totalDepositBalanceUSD = totalDepositBalanceUSD.plus(mkt.totalDepositBalanceUSD);
    }
    protocol._marketIDs = marketIDs;
    protocol.totalDepositBalanceUSD = totalDepositBalanceUSD;
    (0, helpers_2.snapshotMarket)(market, amountUSD, event, constants_1.TransactionType.WITHDRAW);
    (0, helpers_2.snapshotFinancials)(protocol, amountUSD, event, constants_1.TransactionType.WITHDRAW);
    (0, helpers_2.updateUsageMetrics)(protocol, capitalProvider, event, constants_1.TransactionType.WITHDRAW);
    const account = (0, getters_1.getOrCreateAccount)(capitalProvider);
    const positionID = (0, helpers_2.updatePosition)(protocol, market, account, accountBalance, constants_1.PositionSide.LENDER, constants_1.TransactionType.WITHDRAW, event);
    (0, helpers_2.createTransaction)(constants_1.TransactionType.WITHDRAW, market, capitalProvider, positionID, amount, amountUSD, event);
    market.save();
    protocol.save();
    graph_ts_1.log.info("[handleWithdrawalMade]market {}: amountUSD={},market.tvl={},protocl.tvl={},tx={}", [
        market.id,
        amountUSD.toString(),
        market.totalValueLockedUSD.toString(),
        protocol.totalValueLockedUSD.toString(),
        event.transaction.hash.toHexString(),
    ]);
    // ORIGINAL CODE BELOW
    (0, senior_pool_1.updatePoolStatus)(event);
    const stakingRewardsAddress = getStakingRewardsAddressFromSeniorPoolAddress(event.address);
    // Purposefully ignore withdrawals made by StakingRewards contract because those will be captured as UnstakeAndWithdraw
    if (!event.params.capitalProvider.equals(stakingRewardsAddress)) {
        const transaction = (0, helpers_1.createTransactionFromEvent)(event, "SENIOR_POOL_WITHDRAWAL", event.params.capitalProvider);
        const seniorPoolContract = SeniorPool_1.SeniorPool.bind(event.address);
        const sharePrice = seniorPoolContract.sharePrice();
        const BI_FIDU_DECIMALS = (0, utils_1.bigDecimalToBigInt)(constants_1.FIDU_DECIMALS);
        const BI_USDC_DECIMALS = (0, utils_1.bigDecimalToBigInt)(constants_1.USDC_DECIMALS);
        transaction.sentAmount = event.params.userAmount
            .plus(event.params.reserveAmount)
            .times(BI_FIDU_DECIMALS)
            .div(BI_USDC_DECIMALS)
            .times(BI_FIDU_DECIMALS)
            .div(sharePrice);
        transaction.sentToken = "FIDU";
        transaction.receivedAmount = event.params.userAmount;
        transaction.receivedToken = "USDC";
        transaction.fiduPrice = sharePrice;
        transaction.save();
    }
}
exports.handleWithdrawalMade = handleWithdrawalMade;
// this event is never emitted in the current version
// because senior pool never invests in junior tranche
function handleInvestmentMadeInJunior(event) {
    const newBorrowUSD = event.params.amount.divDecimal(constants_1.USDC_DECIMALS);
    const market = (0, getters_1.getOrCreateMarket)(event.address.toHexString(), event);
    market.totalBorrowBalanceUSD =
        market.totalBorrowBalanceUSD.plus(newBorrowUSD);
    market.cumulativeBorrowUSD = market.cumulativeBorrowUSD.plus(newBorrowUSD);
    if (!market._interestTimestamp) {
        market._interestTimestamp = event.block.timestamp;
    }
    market.save();
    (0, helpers_2.snapshotMarket)(market, newBorrowUSD, event, constants_1.TransactionType.BORROW);
    // deduct investment amount from TVL/totalDepositBalance to avoid double counting
    // because they will be counted as deposits to invested tranched pools
    // Also not update protocol.totalBorrowBalanceUSD to avoid double counting
    const protocol = (0, getters_1.getOrCreateProtocol)();
    protocol.totalDepositBalanceUSD =
        protocol.totalDepositBalanceUSD.minus(newBorrowUSD);
    protocol.totalValueLockedUSD = protocol.totalDepositBalanceUSD;
    protocol.save();
    graph_ts_1.log.info("[handleInvestmentMadeInJunior]market {}: amountUSD={},market.tvl={},protocl.tvl={},tx={}", [
        market.id,
        newBorrowUSD.toString(),
        market.totalValueLockedUSD.toString(),
        protocol.totalValueLockedUSD.toString(),
        event.transaction.hash.toHexString(),
    ]);
    //
    (0, senior_pool_1.updatePoolStatus)(event);
    (0, senior_pool_1.updatePoolInvestments)(event.address, event.params.tranchedPool);
}
exports.handleInvestmentMadeInJunior = handleInvestmentMadeInJunior;
function handleInvestmentMadeInSenior(event) {
    const newBorrowUSD = event.params.amount.divDecimal(constants_1.USDC_DECIMALS);
    const market = (0, getters_1.getOrCreateMarket)(event.address.toHexString(), event);
    market.totalBorrowBalanceUSD =
        market.totalBorrowBalanceUSD.plus(newBorrowUSD);
    market.cumulativeBorrowUSD = market.cumulativeBorrowUSD.plus(newBorrowUSD);
    if (!market._interestTimestamp) {
        market._interestTimestamp = event.block.timestamp;
    }
    market.save();
    (0, helpers_2.snapshotMarket)(market, newBorrowUSD, event, constants_1.TransactionType.BORROW);
    // deduct investment amount from TVL/totalDepositBalance to avoid double counting
    // because they will be counted as deposits to invested tranched pools
    // Similarly, not updating protocol.totalBorrowBalanceUSD to avoid double counting
    const protocol = (0, getters_1.getOrCreateProtocol)();
    protocol.totalDepositBalanceUSD =
        protocol.totalDepositBalanceUSD.minus(newBorrowUSD);
    protocol.totalValueLockedUSD = protocol.totalDepositBalanceUSD;
    protocol.save();
    graph_ts_1.log.info("[handleInvestmentMadeInSenior]market {}: amountUSD={},market.tvl={},protocl.tvl={},tx={}", [
        market.id,
        newBorrowUSD.toString(),
        market.totalValueLockedUSD.toString(),
        protocol.totalValueLockedUSD.toString(),
        event.transaction.hash.toHexString(),
    ]);
    // no need to snapshotFinancials here because it will be snapshoted
    // when DepositMade is handled in tranched pool
    // not updating usage metrics as this is not a transaction type of interest
    // ORIGINAL CODE
    (0, senior_pool_1.updatePoolStatus)(event);
    (0, senior_pool_1.updatePoolInvestments)(event.address, event.params.tranchedPool);
}
exports.handleInvestmentMadeInSenior = handleInvestmentMadeInSenior;
function handleInterestCollected(event) {
    // this is the interest for the supply side; protocol side is
    // handled in handleReserveFundsCollected
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const market = (0, getters_1.getOrCreateMarket)(event.address.toHexString(), event);
    const outputToken = schema_1.Token.load(market.outputToken);
    const newSupplySideRevUSD = event.params.amount.divDecimal(constants_1.USDC_DECIMALS);
    const seniorPoolContract = SeniorPool_1.SeniorPool.bind(event.address);
    outputToken.lastPriceUSD = (0, utils_1.bigIntToBDUseDecimals)(seniorPoolContract.sharePrice(), outputToken.decimals);
    market.outputTokenPriceUSD = outputToken.lastPriceUSD;
    market.save();
    outputToken.save();
    let updateProtocol = false;
    // depending on whether the interest is from compound or from a tranched pool
    // if it is from compound, update protocol level revenue
    // if it is from a tranched pool, the interest revenue has been accounted there.
    // Only update rates when interest is collected from tranched pools
    const interestAmountUSD = event.params.amount.divDecimal(constants_1.USDC_DECIMALS);
    if (!market._lenderInterestAmountUSD) {
        market._lenderInterestAmountUSD = constants_1.BIGDECIMAL_ZERO;
    }
    if (event.params.payer == event.address) {
        // interest from compound sweep, new revenue not having been accounted
        updateProtocol = true;
        // cumulate lender interest amount, but not updating rates
        market._lenderInterestAmountUSD =
            market._lenderInterestAmountUSD.plus(interestAmountUSD);
        market.save();
    }
    else {
        if (!market._borrowerInterestAmountUSD) {
            market._borrowerInterestAmountUSD = constants_1.BIGDECIMAL_ZERO;
        }
        market._borrowerInterestAmountUSD =
            market._borrowerInterestAmountUSD.plus(interestAmountUSD);
        market._lenderInterestAmountUSD =
            market._lenderInterestAmountUSD.plus(interestAmountUSD);
        market.save();
        (0, market_1.updateInterestRates)(market, market._borrowerInterestAmountUSD, market._lenderInterestAmountUSD, event);
    }
    (0, helpers_2.updateRevenues)(protocol, market, newSupplySideRevUSD, constants_1.BIGDECIMAL_ZERO, event, updateProtocol);
    // ORIGINAL CODE
    (0, senior_pool_1.updatePoolStatus)(event);
}
exports.handleInterestCollected = handleInterestCollected;
function handlePrincipalCollected(event) {
    const deltaBorrowUSD = event.params.amount.divDecimal(constants_1.USDC_DECIMALS);
    const market = (0, getters_1.getOrCreateMarket)(event.address.toHexString(), event);
    market.totalBorrowBalanceUSD =
        market.totalBorrowBalanceUSD.minus(deltaBorrowUSD);
    market.save();
    const protocol = (0, getters_1.getOrCreateProtocol)();
    protocol.totalBorrowBalanceUSD =
        protocol.totalBorrowBalanceUSD.minus(deltaBorrowUSD);
    protocol.save();
    (0, helpers_2.snapshotMarket)(market, deltaBorrowUSD, event, null);
    (0, helpers_2.snapshotFinancials)(protocol, deltaBorrowUSD, event, null);
    // ORIGINAL CODE
    (0, senior_pool_1.updatePoolStatus)(event);
}
exports.handlePrincipalCollected = handlePrincipalCollected;
function handlePrincipalWrittenDown(event) {
    // writing down amount can be positive (recovering of previous writing down) or negative
    const amountUSD = event.params.amount.divDecimal(constants_1.USDC_DECIMALS);
    const market = (0, getters_1.getOrCreateMarket)(event.address.toHexString(), event);
    const outputToken = schema_1.Token.load(market.outputToken);
    market.inputTokenBalance = market.inputTokenBalance.plus(event.params.amount);
    market.totalDepositBalanceUSD = market.totalDepositBalanceUSD.plus(amountUSD);
    market.totalValueLockedUSD = market.totalDepositBalanceUSD;
    market.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD.plus(amountUSD);
    const seniorPoolContract = SeniorPool_1.SeniorPool.bind(event.address);
    outputToken.lastPriceUSD = (0, utils_1.bigIntToBDUseDecimals)(seniorPoolContract.sharePrice(), outputToken.decimals);
    market.outputTokenPriceUSD = outputToken.lastPriceUSD;
    // writing down eats into supply side revenue this can cause
    // cumulative total/supply side revenue to decrease
    market.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD.plus(amountUSD);
    market.cumulativeTotalRevenueUSD = market.cumulativeSupplySideRevenueUSD.plus(market.cumulativeProtocolSideRevenueUSD);
    market.save();
    outputToken.save();
    assert(market.totalValueLockedUSD.ge(constants_1.BIGDECIMAL_ZERO), `market ${market.id} TVL ${market.totalValueLockedUSD} < 0 after tx ${event.transaction.hash.toHexString()}`);
    const protocol = (0, getters_1.getOrCreateProtocol)();
    protocol.totalDepositBalanceUSD =
        protocol.totalDepositBalanceUSD.plus(amountUSD);
    protocol.totalValueLockedUSD = protocol.totalDepositBalanceUSD;
    protocol.totalBorrowBalanceUSD =
        protocol.totalBorrowBalanceUSD.plus(amountUSD);
    // writing down eats into supply side revenue, this can cause
    // cumulative supply side revenue to decrease
    protocol.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.plus(amountUSD);
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.plus(protocol.cumulativeProtocolSideRevenueUSD);
    protocol.save();
    (0, helpers_2.snapshotMarket)(market, amountUSD, event, null, false);
    (0, helpers_2.snapshotFinancials)(protocol, amountUSD, event, null);
    //
    (0, senior_pool_1.updatePoolStatus)(event);
}
exports.handlePrincipalWrittenDown = handlePrincipalWrittenDown;
function handleReserveFundsCollected(event) {
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const market = (0, getters_1.getOrCreateMarket)(event.address.toHexString(), event);
    const newProtocolSideRevenueUSD = event.params.amount.divDecimal(constants_1.USDC_DECIMALS);
    (0, helpers_2.updateRevenues)(protocol, market, constants_1.BIGDECIMAL_ZERO, newProtocolSideRevenueUSD, event, true);
    //
    (0, senior_pool_1.updatePoolStatus)(event);
}
exports.handleReserveFundsCollected = handleReserveFundsCollected;
// Helper function to extract the StakingRewards address from the config on Senior Pool
function getStakingRewardsAddressFromSeniorPoolAddress(seniorPoolAddress) {
    const seniorPoolContract = SeniorPool_1.SeniorPool.bind(seniorPoolAddress);
    return (0, utils_1.getAddressFromConfig)(seniorPoolContract, constants_1.CONFIG_KEYS_ADDRESSES.StakingRewards);
}
