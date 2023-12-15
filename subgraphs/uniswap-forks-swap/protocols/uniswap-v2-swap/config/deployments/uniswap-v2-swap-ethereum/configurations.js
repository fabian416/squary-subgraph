"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapV2MainnetConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
class UniswapV2MainnetConfigurations {
    getNetwork() {
        return constants_1.Network.MAINNET;
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
        return "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f";
    }
    getBrokenERC20Tokens() {
        return ["0x0000000000bf2686748e1c0255036e7617e7e8a5"];
    }
}
exports.UniswapV2MainnetConfigurations = UniswapV2MainnetConfigurations;
