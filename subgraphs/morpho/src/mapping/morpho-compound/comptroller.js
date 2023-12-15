"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNewPriceOracle = exports.handleNewCollateralFactor = exports.handleNewCloseFactor = exports.handleNewBorrowCap = void 0;
const constants_1 = require("../../constants");
const fetchers_1 = require("./fetchers");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const templates_1 = require("../../../generated/templates");
const initializers_1 = require("../../utils/initializers");
function handleNewBorrowCap(event) {
    const market = schema_1.Market.load(event.params.cToken);
    if (market === null)
        return; // Market not created on Morpho Compound
    market.borrowCap = event.params.newBorrowCap;
    market.save();
}
exports.handleNewBorrowCap = handleNewBorrowCap;
function handleNewCloseFactor(event) {
    const protocol = (0, initializers_1.getOrInitMarketList)(constants_1.MORPHO_COMPOUND_ADDRESS);
    const closeFactor = event.params.newCloseFactorMantissa
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS))
        .minus(constants_1.BIGDECIMAL_ONE);
    for (let i = 0; i < protocol.markets.length; i++) {
        const market = (0, initializers_1.getMarket)(protocol.markets[i]);
        market.liquidationPenalty = closeFactor;
        market.save();
    }
}
exports.handleNewCloseFactor = handleNewCloseFactor;
function handleNewCollateralFactor(event) {
    const market = schema_1.Market.load(event.params.cToken);
    if (market === null)
        return; // Market not created on Morpho Compound
    market.liquidationThreshold = event.params.newCollateralFactorMantissa
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS));
    market.save();
}
exports.handleNewCollateralFactor = handleNewCollateralFactor;
function handleNewPriceOracle(event) {
    if (event.params.newPriceOracle.equals(graph_ts_1.Address.fromHexString("0xad47d5a59b6d1ca4dc3ebd53693fda7d7449f165")) // Blacklist broken oracle
    )
        return;
    const protocol = (0, fetchers_1.getCompoundProtocol)(constants_1.MORPHO_COMPOUND_ADDRESS);
    protocol._oracle = event.params.newPriceOracle;
    protocol.save();
    templates_1.CompoundOracle.create(event.params.newPriceOracle);
}
exports.handleNewPriceOracle = handleNewPriceOracle;
