"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KwentaOptimismConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/sdk/util/constants");
class KwentaOptimismConfigurations {
    getNetwork() {
        return constants_1.Network.OPTIMISM;
    }
    getProtocolName() {
        return "Kwenta";
    }
    getProtocolSlug() {
        return "kwenta";
    }
    getFactoryAddress() {
        return graph_ts_1.Address.fromString("0x920cf626a271321c151d027030d5d08af699456b");
    }
    getSUSDAddress() {
        return graph_ts_1.Address.fromString("0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9");
    }
}
exports.KwentaOptimismConfigurations = KwentaOptimismConfigurations;
