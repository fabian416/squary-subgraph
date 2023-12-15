"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRewardDistributed = exports.handleSssFeeCharged = exports.handleDaiVaultFeeCharged = exports.handleLpFeeCharged = exports.handleDevGovFeeCharged = exports.handleLimitExecuted = exports.handleMarketExecuted = exports.handleDepositUnlocked = exports.handleDepositLocked = exports.handleWithdraw = exports.handleDeposit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const prices_1 = require("../prices");
const versions_1 = require("../versions");
const configure_1 = require("../../configurations/configure");
const helpers_1 = require("./helpers");
const constants_1 = require("../common/constants");
const _ERC20_1 = require("../../generated/Vault/_ERC20");
const perpfutures_1 = require("../sdk/protocols/perpfutures");
const config_1 = require("../sdk/protocols/perpfutures/config");
const numbers_1 = require("../sdk/util/numbers");
const constants_2 = require("../sdk/util/constants");
// Implement TokenPricer to pass it to the SDK constructor
class Pricer {
    getTokenPrice(token) {
        const price = (0, prices_1.getUsdPricePerToken)(graph_ts_1.Address.fromBytes(token.id));
        return price.usdPrice;
    }
    getAmountValueUSD(token, amount) {
        const _amount = (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals);
        return (0, prices_1.getUsdPrice)(graph_ts_1.Address.fromBytes(token.id), _amount);
    }
}
// Implement TokenInitializer
class TokenInit {
    getTokenParams(address) {
        const erc20 = _ERC20_1._ERC20.bind(address);
        const name = erc20.name();
        const symbol = erc20.symbol();
        const decimals = erc20.decimals().toI32();
        return {
            name,
            symbol,
            decimals,
        };
    }
}
const conf = new config_1.PerpetualConfig(configure_1.NetworkConfigs.getFactoryAddress().toHexString(), configure_1.NetworkConfigs.getProtocolName(), configure_1.NetworkConfigs.getProtocolSlug(), versions_1.Versions);
function handleDeposit(event) {
    const caller = event.params.sender;
    const depositAmount = event.params.assets;
    const mintAmount = event.params.shares;
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    const depositToken = sdk.Tokens.getOrCreateToken(configure_1.NetworkConfigs.getDaiAddress());
    const outputToken = sdk.Tokens.getOrCreateToken(graph_ts_1.dataSource.address());
    const pool = sdk.Pools.loadPool(graph_ts_1.dataSource.address());
    if (!pool.isInitialized) {
        pool.initialize(constants_1.VAULT_NAME, constants_1.VAULT_NAME, [depositToken], outputToken, constants_1.ORACLE);
        pool.setPoolFee(constants_2.LiquidityPoolFeeType.DYNAMIC_PROTOCOL_FEE, constants_1.STANDARD_FEE);
        pool.setPoolFee(constants_2.LiquidityPoolFeeType.DYNAMIC_LP_FEE, constants_1.STANDARD_FEE);
    }
    pool.addOutputTokenSupply(mintAmount);
    const depositAmounts = (0, helpers_1.createTokenAmountArray)(pool, [depositToken], [depositAmount]);
    const loadAccountResponse = sdk.Accounts.loadAccount(caller);
    const account = loadAccountResponse.account;
    if (loadAccountResponse.isNewUser) {
        const protocol = sdk.Protocol;
        protocol.addUser();
        pool.addUser();
    }
    account.deposit(pool, depositAmounts, mintAmount);
    pool.addInputTokenBalances(depositAmounts);
}
exports.handleDeposit = handleDeposit;
function handleWithdraw(event) {
    const caller = event.params.receiver;
    const withdrawAmount = event.params.assets;
    const burnAmount = event.params.shares;
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    const withdrawToken = sdk.Tokens.getOrCreateToken(configure_1.NetworkConfigs.getDaiAddress());
    const pool = sdk.Pools.loadPool(graph_ts_1.dataSource.address());
    pool.addOutputTokenSupply(burnAmount.times(constants_2.BIGINT_MINUS_ONE));
    const withdrawAmounts = (0, helpers_1.createTokenAmountArray)(pool, [withdrawToken], [withdrawAmount]);
    const loadAccountResponse = sdk.Accounts.loadAccount(caller);
    const account = loadAccountResponse.account;
    if (loadAccountResponse.isNewUser) {
        const protocol = sdk.Protocol;
        protocol.addUser();
        pool.addUser();
    }
    account.withdraw(pool, withdrawAmounts, burnAmount);
    pool.addInputTokenBalances(withdrawAmounts.map((amount) => amount.times(constants_2.BIGINT_MINUS_ONE)));
}
exports.handleWithdraw = handleWithdraw;
function handleDepositLocked(event) {
    const sender = event.params.sender;
    const stakeAmount = event.params.d.assetsDeposited;
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    const pool = sdk.Pools.loadPool(graph_ts_1.dataSource.address());
    pool.addStakedOutputTokenAmount(stakeAmount);
    const loadAccountResponse = sdk.Accounts.loadAccount(sender);
    if (loadAccountResponse.isNewUser) {
        const protocol = sdk.Protocol;
        protocol.addUser();
        pool.addUser();
    }
}
exports.handleDepositLocked = handleDepositLocked;
function handleDepositUnlocked(event) {
    const receiver = event.params.receiver;
    const unstakeAmount = event.params.d.assetsDeposited;
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    const pool = sdk.Pools.loadPool(graph_ts_1.dataSource.address());
    pool.addStakedOutputTokenAmount(unstakeAmount.times(constants_2.BIGINT_MINUS_ONE));
    const loadAccountResponse = sdk.Accounts.loadAccount(receiver);
    if (loadAccountResponse.isNewUser) {
        const protocol = sdk.Protocol;
        protocol.addUser();
        pool.addUser();
    }
}
exports.handleDepositUnlocked = handleDepositUnlocked;
// Event emitted when a trade executes immediately, at the market price
function handleMarketExecuted(event) {
    const trader = event.params.t.trader;
    const positionSide = event.params.t.buy
        ? constants_2.PositionSide.LONG
        : constants_2.PositionSide.SHORT;
    const leverage = event.params.t.leverage;
    const pairIndex = event.params.t.pairIndex;
    const percentProfit = event.params.percentProfit;
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    const collateralToken = sdk.Tokens.getOrCreateToken(configure_1.NetworkConfigs.getDaiAddress());
    const collateralAmount = event.params.positionSizeDai;
    const pool = sdk.Pools.loadPool(configure_1.NetworkConfigs.getVaultAddress());
    const openInterest = (0, helpers_1.getPairOpenInterest)(pairIndex, event);
    pool.updateOpenInterestByToken(pairIndex, collateralToken, openInterest.long, openInterest.short);
    const fundingRatePerDay = (0, helpers_1.getFundingRate)(pairIndex, event);
    pool.updateFundingRateByToken(pairIndex, collateralToken, fundingRatePerDay);
    const sharesTransferred = (0, helpers_1.getSharesTransferred)(collateralAmount, event);
    const loadAccountResponse = sdk.Accounts.loadAccount(trader);
    const account = loadAccountResponse.account;
    if (loadAccountResponse.isNewUser) {
        const protocol = sdk.Protocol;
        protocol.addUser();
        pool.addUser();
    }
    const loadPositionResponse = sdk.Positions.loadPosition(pool, account, collateralToken, collateralToken, positionSide, event.params.open);
    const position = loadPositionResponse.position;
    const isExistingOpenPosition = loadPositionResponse.isExistingOpenPosition;
    if (event.params.open) {
        (0, helpers_1.openTrade)(pool, account, position, pairIndex, collateralToken, collateralAmount, leverage, sharesTransferred, fundingRatePerDay, event);
    }
    else {
        (0, helpers_1.closeTrade)(pool, account, position, pairIndex, collateralToken, collateralAmount, leverage, sharesTransferred, fundingRatePerDay, percentProfit, isExistingOpenPosition, event, false);
    }
}
exports.handleMarketExecuted = handleMarketExecuted;
// Event emitted when a trade executes at exact price set if price reaches threshold
function handleLimitExecuted(event) {
    const trader = event.params.t.trader;
    const positionSide = event.params.t.buy
        ? constants_2.PositionSide.LONG
        : constants_2.PositionSide.SHORT;
    const leverage = event.params.t.leverage;
    const pairIndex = event.params.t.pairIndex;
    const percentProfit = event.params.percentProfit;
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    const collateralToken = sdk.Tokens.getOrCreateToken(configure_1.NetworkConfigs.getDaiAddress());
    const collateralAmount = event.params.positionSizeDai;
    const pool = sdk.Pools.loadPool(configure_1.NetworkConfigs.getVaultAddress());
    const openInterest = (0, helpers_1.getPairOpenInterest)(pairIndex, event);
    pool.updateOpenInterestByToken(pairIndex, collateralToken, openInterest.long, openInterest.short);
    const fundingRatePerDay = (0, helpers_1.getFundingRate)(pairIndex, event);
    pool.updateFundingRateByToken(pairIndex, collateralToken, fundingRatePerDay);
    const sharesTransferred = (0, helpers_1.getSharesTransferred)(collateralAmount, event);
    const loadAccountResponse = sdk.Accounts.loadAccount(trader);
    const account = loadAccountResponse.account;
    if (loadAccountResponse.isNewUser) {
        const protocol = sdk.Protocol;
        protocol.addUser();
        pool.addUser();
    }
    const loadPositionResponse = sdk.Positions.loadPosition(pool, account, collateralToken, collateralToken, positionSide, event.params.orderType == constants_2.INT_THREE ? true : false);
    const position = loadPositionResponse.position;
    const isExistingOpenPosition = loadPositionResponse.isExistingOpenPosition;
    // orderType [TP, SL, LIQ, OPEN] (0-index)
    if (event.params.orderType == constants_2.INT_THREE) {
        (0, helpers_1.openTrade)(pool, account, position, pairIndex, collateralToken, collateralAmount, leverage, sharesTransferred, fundingRatePerDay, event);
    }
    else if (event.params.orderType == 2) {
        (0, helpers_1.closeTrade)(pool, account, position, pairIndex, collateralToken, collateralAmount, leverage, sharesTransferred, fundingRatePerDay, percentProfit, isExistingOpenPosition, event, true, event.params.nftHolder, trader);
    }
    else {
        (0, helpers_1.closeTrade)(pool, account, position, pairIndex, collateralToken, collateralAmount, leverage, sharesTransferred, fundingRatePerDay, percentProfit, isExistingOpenPosition, event, false);
    }
}
exports.handleLimitExecuted = handleLimitExecuted;
function handleDevGovFeeCharged(event) {
    const devGovFee = event.params.valueDai;
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    const collateralToken = sdk.Tokens.getOrCreateToken(configure_1.NetworkConfigs.getDaiAddress());
    const pool = sdk.Pools.loadPool(configure_1.NetworkConfigs.getVaultAddress());
    pool.addRevenueByToken(collateralToken, devGovFee, constants_2.BIGINT_ZERO, constants_2.BIGINT_ZERO);
}
exports.handleDevGovFeeCharged = handleDevGovFeeCharged;
function handleLpFeeCharged(event) {
    const lpFee = event.params.valueDai;
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    const collateralToken = sdk.Tokens.getOrCreateToken(configure_1.NetworkConfigs.getDaiAddress());
    const pool = sdk.Pools.loadPool(configure_1.NetworkConfigs.getVaultAddress());
    pool.addRevenueByToken(collateralToken, constants_2.BIGINT_ZERO, lpFee, constants_2.BIGINT_ZERO);
}
exports.handleLpFeeCharged = handleLpFeeCharged;
function handleDaiVaultFeeCharged(event) {
    const vaultFee = event.params.valueDai;
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    const collateralToken = sdk.Tokens.getOrCreateToken(configure_1.NetworkConfigs.getDaiAddress());
    const pool = sdk.Pools.loadPool(configure_1.NetworkConfigs.getVaultAddress());
    pool.addRevenueByToken(collateralToken, constants_2.BIGINT_ZERO, vaultFee, constants_2.BIGINT_ZERO);
}
exports.handleDaiVaultFeeCharged = handleDaiVaultFeeCharged;
function handleSssFeeCharged(event) {
    const sssFee = event.params.valueDai;
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    const collateralToken = sdk.Tokens.getOrCreateToken(configure_1.NetworkConfigs.getDaiAddress());
    const pool = sdk.Pools.loadPool(configure_1.NetworkConfigs.getVaultAddress());
    pool.addRevenueByToken(collateralToken, constants_2.BIGINT_ZERO, constants_2.BIGINT_ZERO, sssFee);
}
exports.handleSssFeeCharged = handleSssFeeCharged;
function handleRewardDistributed(event) {
    const rewardAmount = event.params.assets;
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    const collateralToken = sdk.Tokens.getOrCreateToken(configure_1.NetworkConfigs.getDaiAddress());
    const pool = sdk.Pools.loadPool(configure_1.NetworkConfigs.getVaultAddress());
    pool.addDailyRewards(constants_2.RewardTokenType.DEPOSIT, collateralToken, rewardAmount);
}
exports.handleRewardDistributed = handleRewardDistributed;
