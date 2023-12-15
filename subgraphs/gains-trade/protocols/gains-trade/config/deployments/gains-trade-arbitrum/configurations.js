"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GainsTradeArbitrumConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class GainsTradeArbitrumConfigurations {
    getNetwork() {
        return constants_2.Network.ARBITRUM_ONE;
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
        return graph_ts_1.Address.fromString("0xda10009cbd5d07dd0cecc66161fc93d7c9000da1");
    }
    getVaultAddress() {
        return graph_ts_1.Address.fromString("0xd85e038593d7a098614721eae955ec2022b9b91b");
    }
    getStorageAddress() {
        return graph_ts_1.Address.fromString("0xcfa6ebd475d89db04cad5a756fff1cb2bc5be33c");
    }
    getPairInfoAddress() {
        return graph_ts_1.Address.fromString("0x04a5e3cf21b0080b72facdca634349a56982d497");
    }
    getPairStorageAddress() {
        return graph_ts_1.Address.fromString("0xf67df2a4339ec1591615d94599081dd037960d4b");
    }
}
exports.GainsTradeArbitrumConfigurations = GainsTradeArbitrumConfigurations;
