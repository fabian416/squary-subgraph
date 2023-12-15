"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MUXProtocolAvalancheConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/utils/constants");
class MUXProtocolAvalancheConfigurations {
    getNetwork() {
        return constants_1.Network.AVALANCHE;
    }
    getPoolAddress() {
        return graph_ts_1.Bytes.fromHexString("0x0ba2e492e8427fad51692EE8958eBf936bee1d84");
    }
    getMUXLPAddress() {
        return graph_ts_1.Bytes.fromHexString("0xaf2d365e668baafedcfd256c0fbbe519e594e390");
    }
}
exports.MUXProtocolAvalancheConfigurations = MUXProtocolAvalancheConfigurations;
