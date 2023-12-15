"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StargateArbitrumConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class StargateArbitrumConfigurations {
    getNetwork() {
        return constants_2.Network.ARBITRUM_ONE;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return "0x55bdb4164d28fbaf0898e0ef14a589ac09ac9970";
    }
}
exports.StargateArbitrumConfigurations = StargateArbitrumConfigurations;
