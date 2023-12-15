"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrbitBscConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class OrbitBscConfigurations {
    getNetwork() {
        return constants_2.Network.BSC;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return "0x89c527764f03bcb7dc469707b23b79c1d7beb780";
    }
}
exports.OrbitBscConfigurations = OrbitBscConfigurations;
