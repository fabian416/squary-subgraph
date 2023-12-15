"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleParameterUpdated = exports.handlePositionLiquidated = exports.handlePositionModified = exports.handleFundingRecomputed = exports.handleMarginTransferred = exports.handleNewAccountSmartMargin = exports.handleMarketAdded = void 0;
const config_1 = require("../sdk/protocols/config");
const perpfutures_1 = require("../sdk/protocols/perpfutures");
const configure_1 = require("../../configurations/configure");
const versions_1 = require("../versions");
const schema_1 = require("../../generated/schema");
const _ERC20_1 = require("../../generated/FuturesMarketManager2/_ERC20");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const prices_1 = require("../prices");
const numbers_1 = require("../sdk/util/numbers");
const constants_1 = require("../sdk/util/constants");
const templates_1 = require("../../generated/templates");
const helpers_1 = require("./helpers");
const enums_1 = require("../sdk/protocols/perpfutures/enums");
class Pricer {
    getTokenPrice(token, block) {
        graph_ts_1.log.info("Block: {}", [block.number.toString()]);
        const price = (0, prices_1.getUsdPricePerToken)(graph_ts_1.Address.fromBytes(token.id));
        return price.usdPrice;
    }
    getAmountValueUSD(token, amount, block) {
        graph_ts_1.log.info("Block: {}", [block.number.toString()]);
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
const conf = new config_1.ProtocolConfig(configure_1.NetworkConfigs.getFactoryAddress().toHexString(), configure_1.NetworkConfigs.getProtocolName(), configure_1.NetworkConfigs.getProtocolSlug(), versions_1.Versions);
/*
  This function is called when a new market added
  We just checks if it is a market, and then stores it
*/
function handleMarketAdded(event) {
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    // check that it's a v1 market before adding
    if (event.params.marketKey.toString().endsWith("PERP")) {
        const pool = sdk.Pools.loadPool(event.params.market);
        const marketKey = (0, helpers_1.loadMarketKey)(event.params.marketKey, pool).toString();
        if (!pool.isInitialized) {
            const token = sdk.Tokens.getOrCreateToken(configure_1.NetworkConfigs.getSUSDAddress());
            pool.initialize(marketKey, marketKey, [token], null, "chainlink");
        }
        pool.setPoolFee(constants_1.LiquidityPoolFeeType.DYNAMIC_TAKER_FEE, constants_1.BIGDECIMAL_ZERO);
        pool.setPoolFee(constants_1.LiquidityPoolFeeType.DYNAMIC_TAKER_DELAYED_FEE, constants_1.BIGDECIMAL_ZERO);
        pool.setPoolFee(constants_1.LiquidityPoolFeeType.DYNAMIC_TAKER_DELAYED_OFFCHAIN_FEE, constants_1.BIGDECIMAL_ZERO);
        pool.setPoolFee(constants_1.LiquidityPoolFeeType.DYNAMIC_MAKER_FEE, null);
        pool.setPoolFee(constants_1.LiquidityPoolFeeType.DYNAMIC_MAKER_DELAYED_FEE, null);
        pool.setPoolFee(constants_1.LiquidityPoolFeeType.DYNAMIC_MAKER_DELAYED_OFFCHAIN_FEE, constants_1.BIGDECIMAL_ZERO);
        pool.setPoolFee(constants_1.LiquidityPoolFeeType.DYNAMIC_MAKER_DELAYED_OFFCHAIN_FEE, constants_1.BIGDECIMAL_ZERO);
        // perps v2 market
        templates_1.PerpsV2Market.create(event.params.market);
    }
}
exports.handleMarketAdded = handleMarketAdded;
/*
  This function is fired when a new smart margin account is created.
  We are storing the new smart margin account with it's owner address for future reference.
*/
function handleNewAccountSmartMargin(event) {
    // create a new entity to store the cross-margin account owner
    const smAccountAddress = event.params.account;
    let smartMarginAccount = schema_1._SmartMarginAccount.load(smAccountAddress);
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    if (smartMarginAccount == null) {
        smartMarginAccount = new schema_1._SmartMarginAccount(smAccountAddress);
        const loadAccountResponse = sdk.Accounts.loadAccount(event.params.creator);
        if (loadAccountResponse.isNewUser) {
            const protocol = sdk.Protocol;
            protocol.addUser();
        }
        smartMarginAccount.owner = loadAccountResponse.account.getBytesId();
        smartMarginAccount.version = event.params.version;
        smartMarginAccount.save();
    }
}
exports.handleNewAccountSmartMargin = handleNewAccountSmartMargin;
/*
 This function is fired when a Margin is transferred from or to a market position of an account.
 If marginDelta > 0 then it is "deposit", else it is "withdraw".
*/
function handleMarginTransferred(event) {
    const marketAddress = graph_ts_1.dataSource.address();
    const marginDelta = event.params.marginDelta;
    const caller = event.params.account;
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    const pool = sdk.Pools.loadPool(marketAddress);
    const token = sdk.Tokens.getOrCreateToken(configure_1.NetworkConfigs.getSUSDAddress());
    const loadAccountResponse = sdk.Accounts.loadAccount(caller);
    const account = loadAccountResponse.account;
    if (loadAccountResponse.isNewUser) {
        const protocol = sdk.Protocol;
        protocol.addUser();
        pool.addUser();
    }
    const amounts = (0, helpers_1.createTokenAmountArray)(pool, [token], [marginDelta.abs()]);
    // Deposit
    if (marginDelta.gt(constants_1.BIGINT_ZERO)) {
        account.deposit(pool, amounts, constants_1.BIGINT_ZERO);
        pool.addInflowVolumeByToken(token, marginDelta.abs());
        pool.addInputTokenBalances(amounts);
    }
    // Withdraw
    if (marginDelta.lt(constants_1.BIGINT_ZERO)) {
        account.withdraw(pool, amounts, constants_1.BIGINT_ZERO);
        pool.addInputTokenBalances(amounts.map((amount) => amount.times(constants_1.BIGINT_MINUS_ONE)));
    }
}
exports.handleMarginTransferred = handleMarginTransferred;
/*
  This function is fired when the funding of a pool is recomputed
  We are storing the position with index for future reference
*/
function handleFundingRecomputed(event) {
    const marketAddress = graph_ts_1.dataSource.address();
    const fundingRate = event.params.funding;
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    const pool = sdk.Pools.loadPool(marketAddress);
    const fundingRateEntity = new schema_1._FundingRate((0, helpers_1.getFundingRateId)(pool, event.params.index));
    fundingRateEntity.funding = event.params.funding;
    fundingRateEntity.save();
    pool.setFundingRate([(0, numbers_1.bigIntToBigDecimal)(fundingRate)]);
}
exports.handleFundingRecomputed = handleFundingRecomputed;
/*
 This function is first when a position of a account is modified, in the following cases:
  1. A new position is created
  2. An existing position changes side, ex : LONG becomes SHORT, or SHORT becomes LONG
  3. An existing position is on same side just increase or decrease in the size
  4. A position is closed
  5. A position is liquidated
 */
function handlePositionModified(event) {
    const marketAddress = graph_ts_1.dataSource.address();
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    const pool = sdk.Pools.loadPool(marketAddress);
    const isClose = event.params.size.isZero();
    const sendingAccount = event.params.account;
    const smartMarginAccount = schema_1._SmartMarginAccount.load(sendingAccount);
    const accountAddress = smartMarginAccount
        ? graph_ts_1.Address.fromBytes(smartMarginAccount.owner)
        : sendingAccount;
    const loadAccountResponse = sdk.Accounts.loadAccount(accountAddress);
    const account = loadAccountResponse.account;
    if (loadAccountResponse.isNewUser) {
        const protocol = sdk.Protocol;
        protocol.addUser();
        pool.addUser();
    }
    const token = sdk.Tokens.getOrCreateToken(configure_1.NetworkConfigs.getSUSDAddress());
    const fees = event.params.fee;
    /* if tradeSize == 0 then either margin transferred or position liquidated
     (both these events are not checked here) */
    if (event.params.tradeSize.gt(constants_1.BIGINT_ZERO)) {
        // loading account last position in this pool, otherwise create new one
        const isLong = event.params.size.gt(constants_1.BIGINT_ZERO);
        const positionResponse = sdk.Positions.loadPosition(pool, account, token, token, isLong ? constants_1.PositionSide.LONG : constants_1.PositionSide.SHORT, event, true);
        const position = positionResponse.position;
        const newPositionSize = event.params.size;
        const oldPositionSize = position.getSize();
        const oldPositionPrice = position.getPrice();
        const margin = event.params.margin;
        const amounts = (0, helpers_1.createTokenAmountArray)(pool, [token], [margin]);
        let fundingAccrued = constants_1.BIGINT_ZERO;
        let currentFundingRate = constants_1.BIGINT_ZERO;
        const previousFunding = schema_1._FundingRate.load((0, helpers_1.getFundingRateId)(pool, position.getFundingIndex()));
        const currentFunding = schema_1._FundingRate.load((0, helpers_1.getFundingRateId)(pool, event.params.fundingIndex));
        if (currentFunding != null) {
            currentFundingRate = currentFunding.funding;
        }
        if (position.getFundingIndex() != event.params.fundingIndex &&
            currentFunding &&
            previousFunding) {
            fundingAccrued = currentFunding.funding
                .minus(previousFunding.funding)
                .times(oldPositionSize)
                .div(constants_1.BIGINT_TEN_TO_EIGHTEENTH);
        }
        // position closed
        if (isClose) {
            const pnl = event.params.lastPrice
                .minus(oldPositionPrice)
                .times(oldPositionSize)
                .div(constants_1.BIGINT_TEN_TO_EIGHTEENTH)
                .plus(fundingAccrued)
                .minus(fees);
            account.collateralOut(pool, position.getBytesID(), amounts, constants_1.BIGINT_ZERO);
            position.setBalanceClosed(token, margin);
            position.setCollateralBalanceClosed(token, margin);
            position.setRealisedPnlUsdClosed((0, numbers_1.bigIntToBigDecimal)(pnl));
            position.setFundingrateClosed((0, numbers_1.bigIntToBigDecimal)(currentFundingRate));
            position.addCollateralOutCount();
            position.closePosition();
            pool.addPremiumByToken(token, fees, enums_1.TransactionType.COLLATERAL_OUT);
            pool.addOutflowVolumeByToken(token, margin);
        }
        else {
            const totalMarginRemaining = event.params.margin;
            const positionTotalPrice = event.params.lastPrice.times(newPositionSize);
            const leverage = positionTotalPrice.div(totalMarginRemaining);
            account.collateralIn(pool, position.getBytesID(), amounts, constants_1.BIGINT_ZERO);
            position.setBalance(token, totalMarginRemaining);
            position.setCollateralBalance(token, totalMarginRemaining);
            position.setPrice(event.params.lastPrice);
            position.setSize(event.params.size);
            position.setFundingIndex(event.params.fundingIndex);
            position.setLeverage((0, numbers_1.bigIntToBigDecimal)(leverage));
            position.addCollateralInCount();
            pool.addPremiumByToken(token, fees, enums_1.TransactionType.COLLATERAL_IN);
            pool.addInflowVolumeByToken(token, margin);
        }
        const volume = event.params.lastPrice
            .times(newPositionSize)
            .div(constants_1.BIGINT_TEN_TO_EIGHTEENTH)
            .abs();
        pool.addVolumeByToken(token, volume);
    }
    (0, helpers_1.updateOpenInterest)(marketAddress, pool, event.params.lastPrice);
    pool.addRevenueByToken(token, constants_1.BIGINT_ZERO, fees, constants_1.BIGINT_ZERO);
}
exports.handlePositionModified = handlePositionModified;
/*
  This function is fired when a position is liquidated
*/
function handlePositionLiquidated(event) {
    const totalFee = event.params.flaggerFee
        .plus(event.params.liquidatorFee)
        .plus(event.params.stakersFee);
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    (0, helpers_1.liquidation)(event, event.params.account, event.params.liquidator, totalFee, event.params.stakersFee, sdk);
}
exports.handlePositionLiquidated = handlePositionLiquidated;
function handleParameterUpdated(event) {
    const sdk = perpfutures_1.SDK.initializeFromEvent(conf, new Pricer(), new TokenInit(), event);
    const marketKey = schema_1._MarketKey.load(event.params.marketKey);
    if (marketKey != null) {
        const paramKey = event.params.parameter.toString();
        const poolFee = constants_1.ParameterKeys.get(paramKey);
        if (poolFee != null) {
            const market = sdk.Pools.loadPool(marketKey.market);
            market.setPoolFee(poolFee, (0, numbers_1.bigIntToBigDecimal)(event.params.value));
        }
    }
}
exports.handleParameterUpdated = handleParameterUpdated;
