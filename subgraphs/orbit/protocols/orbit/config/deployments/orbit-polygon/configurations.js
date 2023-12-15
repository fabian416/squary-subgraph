"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrbitMaticConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class OrbitMaticConfigurations {
    getNetwork() {
        return constants_2.Network.MATIC;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return "0x506dc4c6408813948470a06ef6e4a1daf228dbd5";
    }
}
exports.OrbitMaticConfigurations = OrbitMaticConfigurations;
