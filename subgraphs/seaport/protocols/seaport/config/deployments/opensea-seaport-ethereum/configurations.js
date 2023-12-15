"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeaportEthereumConfigurations = void 0;
const helper_1 = require("../../../../../src/helper");
const constants_1 = require("../../../src/constants");
class SeaportEthereumConfigurations {
    getNetwork() {
        return helper_1.Network.MAINNET;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_MARKETPLACE_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_MARKETPLACE_SLUG;
    }
    getSchemaVersion() {
        return helper_1.PROTOCOL_SCHEMA_VERSION;
    }
    getSubgraphVersion() {
        return constants_1.PROTOCOL_SUBGRAPH_VERSION;
    }
    getMethodologyVersion() {
        return constants_1.PROTOCOL_METHODOLOGY_VERSION;
    }
    getMarketplaceAddress() {
        return constants_1.PROTOCOL_MARKETPLACE_ADDRESS;
    }
}
exports.SeaportEthereumConfigurations = SeaportEthereumConfigurations;
