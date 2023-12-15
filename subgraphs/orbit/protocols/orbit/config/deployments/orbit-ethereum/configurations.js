"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrbitMainnetConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class OrbitMainnetConfigurations {
    getNetwork() {
        return constants_2.Network.MAINNET;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return "0x1bf68a9d1eaee7826b3593c20a0ca93293cb489a";
    }
}
exports.OrbitMainnetConfigurations = OrbitMainnetConfigurations;
