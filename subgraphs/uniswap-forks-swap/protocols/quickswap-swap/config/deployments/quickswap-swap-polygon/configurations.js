"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickswapMaticConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
class QuickswapMaticConfigurations {
    getNetwork() {
        return constants_1.Network.MATIC;
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
        return "0x5757371414417b8c6caad45baef941abc7d3ab32";
    }
    getBrokenERC20Tokens() {
        return ["0x5d76fa95c308fce88d347556785dd1dd44416272"];
    }
}
exports.QuickswapMaticConfigurations = QuickswapMaticConfigurations;
