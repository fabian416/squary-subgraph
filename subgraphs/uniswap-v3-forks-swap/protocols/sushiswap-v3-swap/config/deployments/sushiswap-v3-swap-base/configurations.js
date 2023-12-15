"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapV3BaseConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils");
class SushiswapV3BaseConfigurations {
    getNetwork() {
        return constants_1.Network.BASE;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return graph_ts_1.Bytes.fromHexString("0xc35dadb65012ec5796536bd9864ed8773abc74c4");
    }
    getUntrackedPairs() {
        return (0, utils_1.stringToBytesList)([]);
    }
    getBrokenERC20Tokens() {
        return (0, utils_1.stringToBytesList)([]);
    }
}
exports.SushiswapV3BaseConfigurations = SushiswapV3BaseConfigurations;
