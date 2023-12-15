"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StargateOptimismConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class StargateOptimismConfigurations {
    getNetwork() {
        return constants_2.Network.OPTIMISM;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return "0xe3b53af74a4bf62ae5511055290838050bf764df";
    }
}
exports.StargateOptimismConfigurations = StargateOptimismConfigurations;
