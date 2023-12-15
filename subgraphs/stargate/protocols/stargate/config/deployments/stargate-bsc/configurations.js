"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StargateBscConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class StargateBscConfigurations {
    getNetwork() {
        return constants_2.Network.BSC;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return "0xe7ec689f432f29383f217e36e680b5c855051f25";
    }
}
exports.StargateBscConfigurations = StargateBscConfigurations;
