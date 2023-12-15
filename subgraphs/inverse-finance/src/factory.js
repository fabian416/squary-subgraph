"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDistributedSupplierComp = exports.handleDistributedBorrowerComp = exports.handleNewLiquidationIncentive = exports.handleNewCloseFactor = exports.handleNewCollateralFactor = exports.handleMintBorrowPaused = exports.handleTransferSeizePaused = exports.handleMarketListed = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const templates_1 = require("../generated/templates");
const Factory_1 = require("../generated/Factory/Factory");
const constants_1 = require("./common/constants");
const getters_1 = require("./common/getters");
const schema_1 = require("../generated/schema");
const helpers_1 = require("./common/helpers");
const utils_1 = require("./common/utils");
function handleMarketListed(event) {
    let protocol = (0, getters_1.getOrCreateProtocol)();
    protocol.totalPoolCount += constants_1.INT_ONE;
    protocol.save();
    (0, getters_1.getOrCreateToken)(event.params.cToken);
    (0, getters_1.getOrCreateUnderlyingToken)(event.params.cToken);
    let marketAddr = event.params.cToken.toHexString();
    (0, getters_1.getOrCreateMarket)(marketAddr, event);
    let marketMetrics = (0, getters_1.getOrCreateUsageMetricsDailySnapshot)(event);
    marketMetrics.totalPoolCount = protocol.totalPoolCount;
    marketMetrics.save();
    // trigger CToken template
    templates_1.CToken.create(event.params.cToken);
}
exports.handleMarketListed = handleMarketListed;
function handleTransferSeizePaused(event) {
    // TransferSeizePaused applies to all markets
    if (event.params.action == "Transfer") {
        // reset market.isActive based on whether 'Transfer' is paused
        // 'Transfer' pause pauses all markets
        // once 'Transfer' is paused, it is no longer possible to deposit/withdraw
        let factoryContract = Factory_1.Factory.bind(graph_ts_1.Address.fromString(constants_1.FACTORY_ADDRESS));
        let marketAddrs = factoryContract.getAllMarkets();
        for (let i = 0; i < marketAddrs.length; i++) {
            let marketId = marketAddrs[i].toHexString();
            let market = schema_1.Market.load(marketId);
            if (market != null) {
                market.isActive = !event.params.pauseState;
                market.save();
            }
            else {
                graph_ts_1.log.warning("Market {} does not exist.", [marketId]);
            }
        }
    }
}
exports.handleTransferSeizePaused = handleTransferSeizePaused;
function handleMintBorrowPaused(event) {
    // reset market.canBorrowFrom with ActionPaused event
    if (event.params.action == "Borrow") {
        let marketId = event.params.cToken.toHexString();
        let market = schema_1.Market.load(marketId);
        if (market != null) {
            market.canBorrowFrom = !event.params.pauseState;
            market.save();
        }
        else {
            graph_ts_1.log.warning("Market {} does not exist.", [marketId]);
        }
    }
}
exports.handleMintBorrowPaused = handleMintBorrowPaused;
function handleNewCollateralFactor(event) {
    let marketId = event.params.cToken.toHexString();
    let market = schema_1.Market.load(marketId);
    if (market != null) {
        let ltvFactor = event.params.newCollateralFactorMantissa
            .toBigDecimal()
            .div((0, utils_1.decimalsToBigDecimal)(constants_1.MANTISSA_DECIMALS))
            .times(constants_1.BIGDECIMAL_HUNDRED);
        market.maximumLTV = ltvFactor;
        market.liquidationThreshold = ltvFactor;
        market.save();
    }
    else {
        graph_ts_1.log.warning("Market {} does not exist.", [marketId]);
    }
}
exports.handleNewCollateralFactor = handleNewCollateralFactor;
function handleNewCloseFactor(event) {
    // The liquidator may not repay more than what is allowed by the closeFactor
    // Nothing we need here
}
exports.handleNewCloseFactor = handleNewCloseFactor;
function handleNewLiquidationIncentive(event) {
    // NewLiquidationIncentive applies to all markets
    let factoryContract = Factory_1.Factory.bind(graph_ts_1.Address.fromString(constants_1.FACTORY_ADDRESS));
    let marketAddrs = factoryContract.getAllMarkets();
    for (let i = 0; i < marketAddrs.length; i++) {
        let marketId = marketAddrs[i].toHexString();
        let market = schema_1.Market.load(marketId);
        if (market != null) {
            let liquidationPenalty = event.params.newLiquidationIncentiveMantissa
                .toBigDecimal()
                .div((0, utils_1.decimalsToBigDecimal)(constants_1.MANTISSA_DECIMALS))
                .minus(constants_1.BIGDECIMAL_ONE)
                .times(constants_1.BIGDECIMAL_HUNDRED);
            market.liquidationPenalty = liquidationPenalty;
            market.save();
        }
        else {
            graph_ts_1.log.warning("Market {} does not exist.", [marketId]);
        }
    }
}
exports.handleNewLiquidationIncentive = handleNewLiquidationIncentive;
function handleDistributedBorrowerComp(event) {
    let marketId = event.params.cToken.toHexString();
    // market.rewardTokens = [
    //    prefixID(INV_ADDRESS, RewardTokenType.DEPOSIT),
    //    prefixID(INV_ADDRESS, RewardTokenType.BORROW),
    //  ]
    let newEmissionsAmount = [constants_1.BIGINT_ZERO, event.params.compDelta];
    (0, helpers_1.updateMarketEmission)(marketId, newEmissionsAmount, event);
}
exports.handleDistributedBorrowerComp = handleDistributedBorrowerComp;
function handleDistributedSupplierComp(event) {
    let marketId = event.params.cToken.toHexString();
    // market.rewardTokens = [
    //    prefixID(INV_ADDRESS, RewardTokenType.DEPOSIT),
    //    prefixID(INV_ADDRESS, RewardTokenType.BORROW),
    //  ]
    let newEmissionsAmount = [event.params.compDelta, constants_1.BIGINT_ZERO];
    (0, helpers_1.updateMarketEmission)(marketId, newEmissionsAmount, event);
}
exports.handleDistributedSupplierComp = handleDistributedSupplierComp;
