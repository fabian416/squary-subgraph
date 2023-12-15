"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MUXProtocolArbitrumConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/utils/constants");
class MUXProtocolArbitrumConfigurations {
    getNetwork() {
        return constants_1.Network.ARBITRUM_ONE;
    }
    getPoolAddress() {
        return graph_ts_1.Bytes.fromHexString("0x3e0199792ce69dc29a0a36146bfa68bd7c8d6633");
    }
    getMUXLPAddress() {
        return graph_ts_1.Bytes.fromHexString("0x7cbaf5a14d953ff896e5b3312031515c858737c8");
    }
}
exports.MUXProtocolArbitrumConfigurations = MUXProtocolArbitrumConfigurations;
