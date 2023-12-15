"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPoolCount = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../configurations/configure");
const enums_1 = require("../sdk/protocols/bridge/enums");
const Factory_1 = require("../../generated/LPStaking_0/Factory");
const Pool_1 = require("../../generated/LPStaking_0/Pool");
const templates_1 = require("../../generated/templates");
function checkPoolCount(sdk) {
    const poolCount = sdk.Protocol.getPoolCount();
    const factoryContract = Factory_1.Factory.bind(graph_ts_1.Address.fromString(configure_1.NetworkConfigs.getFactoryAddress()));
    const poolCountFromFactory = factoryContract.allPoolsLength().toI32();
    if (poolCount != poolCountFromFactory) {
        for (let i = 0; i < poolCountFromFactory; i++) {
            const poolAddr = factoryContract.allPools(graph_ts_1.BigInt.fromI32(i));
            const pool = sdk.Pools.loadPool(poolAddr);
            if (!pool.isInitialized) {
                const poolContract = Pool_1.Pool.bind(poolAddr);
                const poolName = poolContract.name();
                const poolSymbol = poolContract.symbol();
                const token = sdk.Tokens.getOrCreateToken(poolAddr);
                pool.initialize(poolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, token);
                templates_1.PoolTemplate.create(poolAddr);
            }
        }
    }
}
exports.checkPoolCount = checkPoolCount;
