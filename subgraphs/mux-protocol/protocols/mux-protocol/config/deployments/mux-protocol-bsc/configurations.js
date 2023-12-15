"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MUXProtocolBscConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/utils/constants");
class MUXProtocolBscConfigurations {
    getNetwork() {
        return constants_1.Network.BSC;
    }
    getPoolAddress() {
        return graph_ts_1.Bytes.fromHexString("0x855e99f768fad76dd0d3eb7c446c0b759c96d520");
    }
    getMUXLPAddress() {
        return graph_ts_1.Bytes.fromHexString("0x07145ad7C7351c6fe86b6b841fc9bed74eb475a7");
    }
}
exports.MUXProtocolBscConfigurations = MUXProtocolBscConfigurations;
