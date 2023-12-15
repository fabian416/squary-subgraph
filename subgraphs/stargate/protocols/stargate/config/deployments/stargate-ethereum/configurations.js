"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StargateMainnetConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class StargateMainnetConfigurations {
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
        return "0x06d538690af257da524f25d0cd52fd85b1c2173e";
    }
}
exports.StargateMainnetConfigurations = StargateMainnetConfigurations;
