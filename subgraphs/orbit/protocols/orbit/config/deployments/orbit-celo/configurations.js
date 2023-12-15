"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrbitCeloConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class OrbitCeloConfigurations {
    getNetwork() {
        return constants_2.Network.CELO;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return "0x979cd0826c2bf62703ef62221a4fea1f23da3777";
    }
}
exports.OrbitCeloConfigurations = OrbitCeloConfigurations;
