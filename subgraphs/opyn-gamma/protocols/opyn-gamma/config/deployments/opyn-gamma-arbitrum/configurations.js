"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpynArbitrumConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
class OpynArbitrumConfigurations {
    getNetwork() {
        return constants_1.Network.ARBITRUM_ONE;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getOracleAddress(blockNumber) {
        return graph_ts_1.Address.fromString("0x7a1e6f0f07ee2ddde14cd4b8eb582bad065357c5");
    }
    getControllerAddress() {
        return graph_ts_1.Address.fromString("0xee30f92cc9bf896679567d1acd551f0e179756fc");
    }
    getMarginPoolAddress() {
        return graph_ts_1.Address.fromString("0x63d8d20606c048b9b79a30ea45ca6787f8aeb051");
    }
}
exports.OpynArbitrumConfigurations = OpynArbitrumConfigurations;
