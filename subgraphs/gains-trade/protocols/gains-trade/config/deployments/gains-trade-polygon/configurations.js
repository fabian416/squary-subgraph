"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GainsTradePolygonConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class GainsTradePolygonConfigurations {
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
        return graph_ts_1.Address.fromString("0xec9581354f7750bc8194e3e801f8ee1d91e2a8ac");
    }
    getDaiAddress() {
        return graph_ts_1.Address.fromString("0x8f3cf7ad23cd3cadbd9735aff958023239c6a063");
    }
    getVaultAddress() {
        return graph_ts_1.Address.fromString("0x91993f2101cc758d0deb7279d41e880f7defe827");
    }
    getStorageAddress() {
        return graph_ts_1.Address.fromString("0xaee4d11a16b2bc65edd6416fb626eb404a6d65bd");
    }
    getPairInfoAddress() {
        return graph_ts_1.Address.fromString("0xee7442accc1c27f2c69423576d3b1d25b563e977");
    }
    getPairStorageAddress() {
        return graph_ts_1.Address.fromString("0x6e5326e944f528c243b9ca5d14fe5c9269a8c922");
    }
}
exports.GainsTradePolygonConfigurations = GainsTradePolygonConfigurations;
