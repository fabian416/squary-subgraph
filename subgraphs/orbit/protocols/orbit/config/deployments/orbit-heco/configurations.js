"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrbitHecoConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class OrbitHecoConfigurations {
    getNetwork() {
        return constants_2.Network.HECO;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return "0x38c92a7c2b358e2f2b91723e5c4fc7aa8b4d279f";
    }
}
exports.OrbitHecoConfigurations = OrbitHecoConfigurations;
