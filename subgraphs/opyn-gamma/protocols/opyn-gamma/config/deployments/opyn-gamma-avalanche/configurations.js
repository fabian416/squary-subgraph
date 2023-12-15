"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpynAvalancheConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
class OpynAvalancheConfigurations {
    getNetwork() {
        return constants_1.Network.AVALANCHE;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getOracleAddress(blockNumber) {
        return graph_ts_1.Address.fromString("0x108abfba5ad61bd61a930bfe73394558d60f0b10");
    }
    getControllerAddress() {
        return graph_ts_1.Address.fromString("0x9e3b94819aaf6de606c4aa844e3215725b997064");
    }
    getMarginPoolAddress() {
        return graph_ts_1.Address.fromString("0xccf6629aeab734e621cc59ebb0297196774fdb9d");
    }
}
exports.OpynAvalancheConfigurations = OpynAvalancheConfigurations;
