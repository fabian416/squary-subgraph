"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StargateBaseConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class StargateBaseConfigurations {
    getNetwork() {
        return constants_2.Network.BASE;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return "0xaf5191b0de278c7286d6c7cc6ab6bb8a73ba2cd6";
    }
}
exports.StargateBaseConfigurations = StargateBaseConfigurations;
