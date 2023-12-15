"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MUXProtocolFantomConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/utils/constants");
class MUXProtocolFantomConfigurations {
    getNetwork() {
        return constants_1.Network.FANTOM;
    }
    getPoolAddress() {
        return graph_ts_1.Bytes.fromHexString("0x2e81f443a11a943196c88afcb5a0d807721a88e6");
    }
    getMUXLPAddress() {
        return graph_ts_1.Bytes.fromHexString("0xddade9a8da4851960dfcff1ae4a18ee75c39edd2");
    }
}
exports.MUXProtocolFantomConfigurations = MUXProtocolFantomConfigurations;
