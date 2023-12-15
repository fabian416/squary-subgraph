"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMasterChefTotalAllocation = exports.getOrCreateMasterChefStakingPool = exports.getOrCreateMasterChef = exports.createMasterChefStakingPool = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../../../../configurations/configure");
const schema_1 = require("../../../../../generated/schema");
const constants_1 = require("../../../../../src/common/constants");
const getters_1 = require("../../../../../src/common/getters");
function createMasterChefStakingPool(event, masterChefType, poolAddress) {
    const masterChefPool = new schema_1._MasterChefStakingPool(masterChefType + "-" + poolAddress.toHexString());
    masterChefPool.poolAddress = poolAddress.toHexString();
    masterChefPool.multiplier = constants_1.BIGINT_ONE;
    masterChefPool.poolAllocPoint = constants_1.BIGINT_ZERO;
    masterChefPool.lastRewardBlock = event.block.number;
    graph_ts_1.log.warning("MASTERCHEF POOL CREATED: " + poolAddress.toHexString(), []);
    const pool = schema_1.LiquidityPool.load(masterChefPool.poolAddress);
    if (pool) {
        pool.rewardTokens = [
            (0, getters_1.getOrCreateToken)(event, configure_1.NetworkConfigs.getRewardToken()).id,
        ];
        pool.save();
    }
    masterChefPool.save();
    return masterChefPool;
}
exports.createMasterChefStakingPool = createMasterChefStakingPool;
// Create the masterchef contract that contains data used to calculate rewards for all pools.
function getOrCreateMasterChef(event, masterChefType) {
    let masterChef = schema_1._MasterChef.load(masterChefType);
    if (masterChef) {
        if (masterChef.address) {
            return masterChef;
        }
        masterChef.address = event.address.toHexString();
        masterChef.save();
        return masterChef;
    }
    masterChef = new schema_1._MasterChef(masterChefType);
    masterChef.address = event.address.toHexString();
    masterChef.totalAllocPoint = constants_1.BIGINT_ZERO;
    masterChef.rewardTokenInterval = configure_1.NetworkConfigs.getRewardIntervalType();
    masterChef.rewardTokenRate = configure_1.NetworkConfigs.getRewardTokenRate();
    graph_ts_1.log.warning("MasterChef Type: " + masterChefType, []);
    masterChef.adjustedRewardTokenRate = configure_1.NetworkConfigs.getRewardTokenRate();
    masterChef.lastUpdatedRewardRate = constants_1.BIGINT_ZERO;
    masterChef.save();
    return masterChef;
}
exports.getOrCreateMasterChef = getOrCreateMasterChef;
// Create a MasterChefStaking pool using the MasterChef pid for id.
function getOrCreateMasterChefStakingPool(event, masterChefType, poolAddress) {
    let masterChefPool = schema_1._MasterChefStakingPool.load(masterChefType + "-" + poolAddress.toHexString());
    // Create entity to track masterchef pool mappings
    if (!masterChefPool) {
        masterChefPool = new schema_1._MasterChefStakingPool(masterChefType + "-" + poolAddress.toHexString());
        masterChefPool.multiplier = constants_1.BIGINT_ONE;
        masterChefPool.poolAllocPoint = constants_1.BIGINT_ZERO;
        masterChefPool.lastRewardBlock = event.block.number;
        graph_ts_1.log.warning("MASTERCHEF POOL CREATED: " + poolAddress.toHexString(), []);
        masterChefPool.save();
    }
    return masterChefPool;
}
exports.getOrCreateMasterChefStakingPool = getOrCreateMasterChefStakingPool;
// Update the total allocation for all pools whenever the allocation points are updated for a pool.
function updateMasterChefTotalAllocation(event, oldPoolAlloc, newPoolAlloc, masterChefType) {
    const masterChef = getOrCreateMasterChef(event, masterChefType);
    masterChef.totalAllocPoint = masterChef.totalAllocPoint.plus(newPoolAlloc.minus(oldPoolAlloc));
    masterChef.save();
}
exports.updateMasterChefTotalAllocation = updateMasterChefTotalAllocation;
