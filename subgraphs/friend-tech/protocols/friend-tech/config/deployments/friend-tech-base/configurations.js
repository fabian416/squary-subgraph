"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendTechBaseConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
class FriendTechBaseConfigurations {
    getNetwork() {
        return constants_1.Network.BASE;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return graph_ts_1.Address.fromString("0xcf205808ed36593aa40a44f10c7f7c2f67d4a4d4");
    }
    getTreasuryAddress() {
        return graph_ts_1.Address.fromString("0xdd9176ea3e7559d6b68b537ef555d3e89403f742");
    }
}
exports.FriendTechBaseConfigurations = FriendTechBaseConfigurations;
