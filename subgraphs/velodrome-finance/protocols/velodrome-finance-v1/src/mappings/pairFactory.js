"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePairCreated = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const entities_1 = require("../../../../src/mappings/helpers/entities");
const pools_1 = require("../../../../src/mappings/helpers/pools");
const getters_1 = require("../../../../src/common/getters");
const constants_1 = require("../common/constants");
const constants_2 = require("../../../../src/common/constants");
const PairFactory_1 = require("../../../../generated/Factory/PairFactory");
const templates_1 = require("../../../../generated/templates");
function handlePairCreated(event) {
    const protocol = (0, getters_1.getOrCreateDex)(constants_1.FACTORY_ADDRESS, constants_1.PROTOCOL_NAME, constants_1.PROTOCOL_SLUG);
    templates_1.Pair.create(event.params.pair);
    (0, entities_1.createLiquidityPool)(protocol, event.params.pair, event.params.token0, event.params.token1, event.params.stable, constants_1.HARDCODED_POOLS, event);
    const factoryContract = PairFactory_1.PairFactory.bind(graph_ts_1.Address.fromString(constants_1.FACTORY_ADDRESS));
    const stableFee = factoryContract
        .stableFee()
        .toBigDecimal()
        .div(constants_2.BIGDECIMAL_HUNDRED);
    const volatileFee = factoryContract
        .volatileFee()
        .toBigDecimal()
        .div(constants_2.BIGDECIMAL_HUNDRED);
    (0, pools_1.updateAllPoolFees)(protocol, stableFee, volatileFee, event.block, false);
}
exports.handlePairCreated = handlePairCreated;
