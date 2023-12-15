"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TheGraphArbitrumConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
class TheGraphArbitrumConfigurations {
    getNetwork() {
        return constants_1.Network.ARBITRUM_ONE;
    }
    getGraphTokenAddress() {
        return "0x9623063377ad1b27544c965ccd7342f7ea7e88c7";
    }
    getControllerAddress() {
        return "0x0a8491544221dd212964fbb96487467291b2c97e";
    }
}
exports.TheGraphArbitrumConfigurations = TheGraphArbitrumConfigurations;
