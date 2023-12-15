"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSetValidPoolFactory = exports.handleGlobalsParamSet = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const templates_1 = require("../../generated/templates");
const constants_1 = require("../common/constants");
const utils_1 = require("../common/utils");
const protocol_1 = require("../common/mappingHelpers/getOrCreate/protocol");
function handleGlobalsParamSet(event) {
    ////
    // Update protocol
    ////
    if (constants_1.PROTOCOL_GLOBAL_PARAMS_TREASURY_FEE_KEY == event.params.which.toString()) {
        const protocol = (0, protocol_1.getOrCreateProtocol)();
        // Convert bips to percentage
        protocol._treasuryFee = event.params.value.toBigDecimal().div(graph_ts_1.BigDecimal.fromString("10000"));
        protocol.save();
    }
}
exports.handleGlobalsParamSet = handleGlobalsParamSet;
function handleSetValidPoolFactory(call) {
    const poolFactoryAddress = call.inputs.poolFactory;
    // Create pool factory template
    templates_1.PoolFactory.create(poolFactoryAddress);
    // Trigger protocol creation
    (0, protocol_1.getOrCreateProtocol)();
    // Create pool factory entity
    const eventFromCall = (0, utils_1.createEventFromCall)(call);
    (0, protocol_1.getOrCreatePoolFactory)(eventFromCall, poolFactoryAddress);
}
exports.handleSetValidPoolFactory = handleSetValidPoolFactory;
