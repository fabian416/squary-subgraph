"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSetCustomFee = exports.handlePoolCreated = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const entities_1 = require("../../../../src/mappings/helpers/entities");
const getters_1 = require("../../../../src/common/getters");
const constants_1 = require("../common/constants");
const constants_2 = require("../../../../src/common/constants");
const pools_1 = require("../../../../src/mappings/helpers/pools");
const PoolFactory_1 = require("../../../../generated/Factory/PoolFactory");
const templates_1 = require("../../../../generated/templates");
function handlePoolCreated(event) {
    const protocol = (0, getters_1.getOrCreateDex)(constants_1.FACTORY_ADDRESS, constants_1.PROTOCOL_NAME, constants_1.PROTOCOL_SLUG);
    templates_1.Pool.create(event.params.pool);
    (0, entities_1.createLiquidityPool)(protocol, event.params.pool, event.params.token0, event.params.token1, event.params.stable, constants_1.HARDCODED_POOLS, event);
    const factoryContract = PoolFactory_1.PoolFactory.bind(graph_ts_1.Address.fromString(constants_1.FACTORY_ADDRESS));
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
exports.handlePoolCreated = handlePoolCreated;
function handleSetCustomFee(event) {
    const pool = (0, getters_1.getLiquidityPool)(event.params.pool);
    if (!pool)
        return;
    pool._customFeeApplied = true;
    const fee = event.params.fee.toBigDecimal().div(constants_2.BIGDECIMAL_HUNDRED);
    (0, entities_1.createPoolFees)(event.params.pool, fee);
}
exports.handleSetCustomFee = handleSetCustomFee;
