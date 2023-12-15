"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseswapBaseConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
class BaseswapBaseConfigurations {
    getNetwork() {
        return constants_1.Network.BASE;
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
        return "0xfda619b6d20975be80a10332cd39b9a4b0faa8bb";
    }
    getBrokenERC20Tokens() {
        return [];
    }
}
exports.BaseswapBaseConfigurations = BaseswapBaseConfigurations;
