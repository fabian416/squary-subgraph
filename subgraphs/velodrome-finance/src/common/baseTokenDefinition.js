"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseTokenLookup = exports.BaseTokenDefinition = void 0;
/* eslint-disable prefer-const */
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
class UsdPathConfig {
}
class BaseTokenDefinition {
    static optimism(optimismPools) {
        const USDC = graph_ts_1.Address.fromString("0x7f5c764cbc14f9669b88837ca1490cca17c31607");
        const sUSD = graph_ts_1.Address.fromString("0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9");
        const DAI = graph_ts_1.Address.fromString("0xda10009cbd5d07dd0cecc66161fc93d7c9000da1");
        const OP = graph_ts_1.Address.fromString("0x4200000000000000000000000000000000000042");
        const WETH = graph_ts_1.Address.fromString("0x4200000000000000000000000000000000000006");
        let lookup = new graph_ts_1.TypedMap();
        lookup.set(USDC, { pathUsdIdx: [-1], path: [constants_1.ZERO_ADDRESS], priority: 4 });
        lookup.set(sUSD, {
            pathUsdIdx: [0],
            path: [optimismPools.get("USDC_sUSD")],
            priority: 3,
        });
        lookup.set(DAI, {
            pathUsdIdx: [0],
            path: [optimismPools.get("USDC_DAI")],
            priority: 2,
        });
        lookup.set(OP, {
            pathUsdIdx: [1],
            path: [optimismPools.get("OP_USDC")],
            priority: 1,
        });
        lookup.set(WETH, {
            pathUsdIdx: [1],
            path: [optimismPools.get("WETH_USDC")],
            priority: 0,
        });
        return lookup;
    }
    static nonBase() {
        let lookup = {
            path: [constants_1.ZERO_ADDRESS],
            pathUsdIdx: [-1],
            priority: -1,
        };
        return lookup;
    }
    static network(network, hardcodedPools) {
        let mapping = new graph_ts_1.TypedMap();
        if (network == "optimism") {
            mapping = this.optimism(hardcodedPools.get(network));
        }
        return mapping;
    }
}
exports.BaseTokenDefinition = BaseTokenDefinition;
function getBaseTokenLookup(token, hardcodedPools) {
    let baseTokenLookup = BaseTokenDefinition.network(graph_ts_1.dataSource.network(), hardcodedPools);
    let tokenLookup = baseTokenLookup.get(token);
    if (tokenLookup == null) {
        tokenLookup = BaseTokenDefinition.nonBase();
    }
    return tokenLookup;
}
exports.getBaseTokenLookup = getBaseTokenLookup;
