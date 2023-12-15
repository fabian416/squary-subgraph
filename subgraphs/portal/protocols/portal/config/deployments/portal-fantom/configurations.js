"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalFantomConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class PortalFantomConfigurations {
    getNetwork() {
        return constants_2.Network.FANTOM;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getNetworkID() {
        return graph_ts_1.BigInt.fromI32(10);
    }
    getFactoryAddress() {
        return graph_ts_1.Address.fromString("0x126783a6cb203a3e35344528b26ca3a0489a1485");
    }
    getBridgeAddress() {
        return graph_ts_1.Address.fromString("0x7c9fc5741288cdfdd83ceb07f3ea7e22618d79d2");
    }
}
exports.PortalFantomConfigurations = PortalFantomConfigurations;
