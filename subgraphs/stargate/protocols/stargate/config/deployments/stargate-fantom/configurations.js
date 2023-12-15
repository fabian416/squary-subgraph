"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StargateFantomConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class StargateFantomConfigurations {
    getNetwork() {
        return constants_2.Network.FANTOM;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return "0x9d1b1669c73b033dfe47ae5a0164ab96df25b944";
    }
}
exports.StargateFantomConfigurations = StargateFantomConfigurations;
