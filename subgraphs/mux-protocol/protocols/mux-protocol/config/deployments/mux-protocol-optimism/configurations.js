"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MUXProtocolOptimismConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/utils/constants");
class MUXProtocolOptimismConfigurations {
    getNetwork() {
        return constants_1.Network.OPTIMISM;
    }
    getPoolAddress() {
        return graph_ts_1.Bytes.fromHexString("0xc6bd76fa1e9e789345e003b361e4a0037dfb7260");
    }
    getMUXLPAddress() {
        return graph_ts_1.Bytes.fromHexString("0x0509474f102b5cd3f1f09e1e91feb25938ef0f17");
    }
}
exports.MUXProtocolOptimismConfigurations = MUXProtocolOptimismConfigurations;
