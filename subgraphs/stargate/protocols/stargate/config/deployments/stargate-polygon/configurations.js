"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StargatePolygonConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class StargatePolygonConfigurations {
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
        return "0x808d7c71ad2ba3fa531b068a2417c63106bc0949";
    }
}
exports.StargatePolygonConfigurations = StargatePolygonConfigurations;
