"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapV3BaseConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils");
class UniswapV3BaseConfigurations {
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
        return graph_ts_1.Bytes.fromHexString("0x33128a8fc17869897dce68ed026d694621f6fdfd");
    }
    getUntrackedPairs() {
        return (0, utils_1.stringToBytesList)([]);
    }
    getBrokenERC20Tokens() {
        return (0, utils_1.stringToBytesList)([]);
    }
}
exports.UniswapV3BaseConfigurations = UniswapV3BaseConfigurations;
