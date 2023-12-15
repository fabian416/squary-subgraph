"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCollateralConfigurationChanged = void 0;
const initializers_1 = require("../../utils/initializers");
const constants_1 = require("../../constants");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
function handleCollateralConfigurationChanged(event) {
    const tokenMapping = schema_1.UnderlyingTokenMapping.load(event.params.asset);
    if (!tokenMapping)
        return;
    // Morpho has the same parameters as Aave
    const market = (0, initializers_1.getMarket)(graph_ts_1.Address.fromBytes(tokenMapping.aToken));
    market.maximumLTV = event.params.ltv.toBigDecimal().div(constants_1.BASE_UNITS);
    market.liquidationThreshold = event.params.liquidationThreshold
        .toBigDecimal()
        .div(constants_1.BASE_UNITS);
    market.liquidationPenalty = event.params.liquidationBonus
        .toBigDecimal()
        .div(constants_1.BASE_UNITS);
    // The liquidation bonus value is equal to the liquidation penalty, the naming is a matter of which side of the liquidation a user is on
    // The liquidationBonus parameter comes out as above 1
    // The LiquidationPenalty is thus the liquidationBonus minus 1
    if (market.liquidationPenalty.gt(graph_ts_1.BigDecimal.zero())) {
        market.liquidationPenalty = market.liquidationPenalty.minus(constants_1.BIGDECIMAL_ONE);
    }
    market.save();
}
exports.handleCollateralConfigurationChanged = handleCollateralConfigurationChanged;
