"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMarketKey = exports.updateOpenInterest = exports.liquidation = exports.getFundingRateId = exports.createTokenAmountArray = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../sdk/util/constants");
const schema_1 = require("../../generated/schema");
const configure_1 = require("../../configurations/configure");
const numbers_1 = require("../sdk/util/numbers");
const PerpsV2MarketProxyable_1 = require("../../generated/templates/PerpsV2Market/PerpsV2MarketProxyable");
function createTokenAmountArray(pool, tokens, amounts) {
    if (tokens.length != amounts.length) {
        return new Array();
    }
    const tokenAmounts = new Array(pool.getInputTokens().length).fill(constants_1.BIGINT_ZERO);
    for (let idx = 0; idx < amounts.length; idx++) {
        const indexOfToken = pool.getInputTokens().indexOf(tokens[idx].id);
        tokenAmounts[indexOfToken] = amounts[idx];
    }
    return tokenAmounts;
}
exports.createTokenAmountArray = createTokenAmountArray;
function getFundingRateId(pool, fundingIndex) {
    return pool
        .getBytesID()
        .concat(graph_ts_1.Bytes.fromUTF8("-"))
        .concat(graph_ts_1.Bytes.fromByteArray(graph_ts_1.Bytes.fromBigInt(fundingIndex)));
}
exports.getFundingRateId = getFundingRateId;
function liquidation(event, sendingAccount, liquidator, totalFees, stakerFees, sdk) {
    const pool = sdk.Pools.loadPool(graph_ts_1.dataSource.address());
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
    const position = sdk.Positions.loadLastPosition(pool, account);
    if (position != null) {
        let fundingRate = constants_1.BIGINT_ZERO;
        const positionFunding = schema_1._FundingRate.load(getFundingRateId(pool, position.getFundingIndex()));
        if (positionFunding != null) {
            fundingRate = positionFunding.funding;
        }
        const pnl = position
            .getRealisedPnlUsd()
            .minus((0, numbers_1.bigIntToBigDecimal)(totalFees));
        account.liquidate(pool, graph_ts_1.Address.fromBytes(token.id), graph_ts_1.Address.fromBytes(token.id), position.position.collateralBalance, liquidator, accountAddress, position.getBytesID(), pnl);
        position.addLiquidationCount();
        position.setBalanceClosed(token, constants_1.BIGINT_ZERO);
        position.setCollateralBalanceClosed(token, constants_1.BIGINT_ZERO);
        position.setRealisedPnlUsdClosed(pnl);
        position.setFundingrateClosed((0, numbers_1.bigIntToBigDecimal)(fundingRate));
        position.closePosition();
        pool.addClosedInflowVolumeByToken(token, stakerFees);
    }
}
exports.liquidation = liquidation;
function updateOpenInterest(marketAddress, pool, lastPrice) {
    const contract = PerpsV2MarketProxyable_1.PerpsV2MarketProxyable.bind(marketAddress);
    const marketSizeCall = contract.try_marketSize();
    const marketSkewCall = contract.try_marketSkew();
    let marketSize = constants_1.BIGINT_ZERO;
    let marketSkew = constants_1.BIGINT_ZERO;
    if (!marketSizeCall.reverted && !marketSkewCall.reverted) {
        marketSize = marketSizeCall.value;
        marketSkew = marketSkewCall.value;
    }
    const shortOpenInterstAmount = marketSize
        .minus(marketSkew)
        .div(graph_ts_1.BigInt.fromI32(2));
    const longOpenInterstAmount = marketSize
        .plus(marketSkew)
        .div(graph_ts_1.BigInt.fromI32(2));
    pool.setLongOpenInterest(longOpenInterstAmount, lastPrice);
    pool.setShortOpenInterest(shortOpenInterstAmount, lastPrice);
}
exports.updateOpenInterest = updateOpenInterest;
function loadMarketKey(marketKey, pool) {
    let marketKeyEntity = schema_1._MarketKey.load(marketKey);
    if (marketKeyEntity == null) {
        marketKeyEntity = new schema_1._MarketKey(marketKey);
    }
    marketKeyEntity.market = pool.getBytesID();
    marketKeyEntity.save();
    return marketKeyEntity.id;
}
exports.loadMarketKey = loadMarketKey;
