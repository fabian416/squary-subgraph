"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReserveDataUpdated = void 0;
const common_1 = require("../common");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const aaveMath_1 = require("../../utils/maths/aaveMath");
const fetchers_1 = require("./fetchers");
const schema_1 = require("../../../generated/schema");
const initializers_1 = require("../../utils/initializers");
const constants_1 = require("../../constants");
/**
 * Updates the reserve data for the given reserve
 * Since Morpho use indexes to approximate the P2P rates, we can assume that the P2P rates are updated each time the reserve data is updated
 * @param event
 */
function handleReserveDataUpdated(event) {
    const tokenMapping = schema_1.UnderlyingTokenMapping.load(event.params.reserve);
    if (!tokenMapping)
        return; // Not a Morpho market
    const aTokenAddress = graph_ts_1.Address.fromBytes(tokenMapping.aToken);
    const market = (0, initializers_1.getMarket)(aTokenAddress);
    const inputToken = (0, initializers_1.getOrInitToken)(event.params.reserve);
    const protocol = (0, fetchers_1.getAaveProtocol)(constants_1.MORPHO_AAVE_V2_ADDRESS);
    // update the token price frequently
    const tokenPrice = (0, fetchers_1.fetchAssetPrice)(market);
    market.inputTokenPriceUSD = tokenPrice;
    inputToken.lastPriceUSD = tokenPrice;
    market.save();
    inputToken.save();
    const params = new constants_1.ReserveUpdateParams(event, market.id, protocol, event.params.liquidityIndex, event.params.variableBorrowIndex, event.params.liquidityRate, event.params.variableBorrowRate);
    (0, common_1._handleReserveUpdate)(params, market, new aaveMath_1.AaveMath());
}
exports.handleReserveDataUpdated = handleReserveDataUpdated;
