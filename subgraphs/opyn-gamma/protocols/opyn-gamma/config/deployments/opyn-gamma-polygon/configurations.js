"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpynPolygonConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
class OpynPolygonConfigurations {
    getNetwork() {
        return constants_1.Network.MATIC;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getOracleAddress(blockNumber) {
        return graph_ts_1.Address.fromString("0x3d561c832706e6e0b485a7a78958982e782e8e91");
    }
    getControllerAddress() {
        return graph_ts_1.Address.fromString("0x7a23c712bddde52b22d8ff52e4cdadb1bcb0b203");
    }
    getMarginPoolAddress() {
        return graph_ts_1.Address.fromString("0x30ae5debc9edf60a23cd19494492b1ef37afa56d");
    }
}
exports.OpynPolygonConfigurations = OpynPolygonConfigurations;
