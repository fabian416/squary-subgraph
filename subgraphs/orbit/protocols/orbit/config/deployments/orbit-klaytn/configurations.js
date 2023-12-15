"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrbitKlaytnConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class OrbitKlaytnConfigurations {
    getNetwork() {
        return constants_2.Network.KLAYTN;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return "0x9abc3f6c11dbd83234d6e6b2c373dfc1893f648d";
    }
}
exports.OrbitKlaytnConfigurations = OrbitKlaytnConfigurations;
