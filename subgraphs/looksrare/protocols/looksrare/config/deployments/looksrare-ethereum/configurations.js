"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LooksrareEthereumConfigurations = void 0;
const helper_1 = require("../../../../../src/helper");
const constants_1 = require("../../../src/constants");
class LooksrareEthereumConfigurations {
    getNetwork() {
        return helper_1.Network.MAINNET;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_MARKETPLACE_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_MARKETPLACE_SLUG;
    }
    getMarketplaceAddress() {
        return constants_1.PROTOCOL_MARKETPLACE_ADDRESS;
    }
}
exports.LooksrareEthereumConfigurations = LooksrareEthereumConfigurations;
