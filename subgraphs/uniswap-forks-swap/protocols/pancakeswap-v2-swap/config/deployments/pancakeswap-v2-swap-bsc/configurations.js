"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PancakeswapV2BscConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
class PancakeswapV2BscConfigurations {
    getNetwork() {
        return constants_1.Network.BSC;
    }
    getSchemaVersion() {
        return constants_1.PROTOCOL_SCHEMA_VERSION;
    }
    getSubgraphVersion() {
        return constants_2.PROTOCOL_SUBGRAPH_VERSION;
    }
    getMethodologyVersion() {
        return constants_2.PROTOCOL_METHODOLOGY_VERSION;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return "0xca143ce32fe78f1f7019d7d551a6402fc5350c73";
    }
    getBrokenERC20Tokens() {
        return [];
    }
}
exports.PancakeswapV2BscConfigurations = PancakeswapV2BscConfigurations;
