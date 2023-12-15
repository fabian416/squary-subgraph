"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StargateMetisConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class StargateMetisConfigurations {
    getNetwork() {
        return constants_2.Network.METIS;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return "0xaf54be5b6eec24d6bfacf1cce4eaf680a8239398";
    }
}
exports.StargateMetisConfigurations = StargateMetisConfigurations;
