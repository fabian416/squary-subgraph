"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpynEthereumConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
class OpynEthereumConfigurations {
    getNetwork() {
        return constants_1.Network.MAINNET;
    }
    getOracleAddress(blockNumber) {
        if (blockNumber < 12729956) {
            // V1 oracle
            return graph_ts_1.Address.fromString("0xc497f40d1b7db6fa5017373f1a0ec6d53126da23");
        }
        return graph_ts_1.Address.fromString("0x789cd7ab3742e23ce0952f6bc3eb3a73a0e08833");
    }
    getControllerAddress() {
        return graph_ts_1.Address.fromString("0x4ccc2339f87f6c59c6893e1a678c2266ca58dc72");
    }
    getMarginPoolAddress() {
        return graph_ts_1.Address.fromString("0x5934807cc0654d46755ebd2848840b616256c6ef");
    }
}
exports.OpynEthereumConfigurations = OpynEthereumConfigurations;
