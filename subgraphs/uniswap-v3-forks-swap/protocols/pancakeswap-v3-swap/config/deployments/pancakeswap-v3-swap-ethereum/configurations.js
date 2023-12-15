"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PancakeV3EthereumConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils");
class PancakeV3EthereumConfigurations {
    getNetwork() {
        return constants_1.Network.MAINNET;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return graph_ts_1.Bytes.fromHexString("0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865");
    }
    getUntrackedPairs() {
        return (0, utils_1.stringToBytesList)([]);
    }
    getBrokenERC20Tokens() {
        return (0, utils_1.stringToBytesList)([]);
    }
}
exports.PancakeV3EthereumConfigurations = PancakeV3EthereumConfigurations;
