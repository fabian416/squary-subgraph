"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TheGraphEthereumConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
class TheGraphEthereumConfigurations {
    getNetwork() {
        return constants_1.Network.MAINNET;
    }
    getGraphTokenAddress() {
        return "0xc944e90c64b2c07662a292be6244bdf05cda44a7";
    }
    getControllerAddress() {
        return "0x24ccd4d3ac8529ff08c58f74ff6755036e616117";
    }
}
exports.TheGraphEthereumConfigurations = TheGraphEthereumConfigurations;
