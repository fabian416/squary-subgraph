"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSeaV2EthereumConfigurations = void 0;
const constants_1 = require("../../../../../src/constants");
const constants_2 = require("../../../src/constants");
class OpenSeaV2EthereumConfigurations {
    getNetwork() {
        return constants_1.Network.MAINNET;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_MARKETPLACE_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_MARKETPLACE_SLUG;
    }
    getMarketplaceAddress() {
        return constants_2.PROTOCOL_MARKETPLACE_ADDRESS;
    }
}
exports.OpenSeaV2EthereumConfigurations = OpenSeaV2EthereumConfigurations;
