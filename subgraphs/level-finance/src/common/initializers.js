"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMasterChefTotalAllocation = exports.getOrCreateMasterChefStakingPool = exports.getOrCreateMasterChef = exports.createMasterChefStakingPool = exports.getOrCreateTranche = exports.getOrCreateAccount = exports.getOrCreatePool = exports.initializeSDK = void 0;
const schema_1 = require("../../generated/schema");
const versions_1 = require("../versions");
const constants = __importStar(require("../common/constants"));
const perpfutures_1 = require("../sdk/protocols/perpfutures");
const constants_1 = require("../sdk/util/constants");
const config_1 = require("../sdk/protocols/config");
const token_1 = require("../modules/token");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function initializeSDK(event) {
    const protocolConfig = new config_1.ProtocolConfig(constants.PROTOCOL_ID, constants.PROTOCOL_NAME, constants.PROTOCOL_SLUG, versions_1.Versions);
    const tokenPricer = new token_1.TokenPrice();
    const tokenInitializer = new token_1.TokenInitialize();
    const sdk = perpfutures_1.SDK.initializeFromEvent(protocolConfig, tokenPricer, tokenInitializer, event);
    return sdk;
}
exports.initializeSDK = initializeSDK;
function getOrCreatePool(sdk) {
    const pool = sdk.Pools.loadPool(graph_ts_1.Bytes.fromHexString(constants.VAULT_ADDRESS.toHexString()));
    if (!pool.isInitialized) {
        const outputToken = sdk.Tokens.getOrCreateToken(constants.OUTPUT_TOKEN_ADDRESS);
        pool.initialize(constants.POOL_NAME, constants.POOL_SYMBOL, [], outputToken);
    }
    return pool;
}
exports.getOrCreatePool = getOrCreatePool;
function getOrCreateAccount(accountAddress, pool, sdk) {
    const loadAccountResponse = sdk.Accounts.loadAccount(accountAddress);
    const account = loadAccountResponse.account;
    if (loadAccountResponse.isNewUser) {
        const protocol = sdk.Protocol;
        protocol.addUser();
        pool.addUser();
    }
    return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
function getOrCreateTranche(address) {
    let tranche = schema_1._Tranche.load(address);
    if (!tranche) {
        tranche = new schema_1._Tranche(address);
        tranche.totalSupply = constants.BIGINT_ZERO;
        tranche.tvl = constants.BIGDECIMAL_ZERO;
        tranche.save();
    }
    return tranche;
}
exports.getOrCreateTranche = getOrCreateTranche;
function createMasterChefStakingPool(event, masterChefType, pid, poolAddress) {
    const masterChefPool = new schema_1._MasterChefStakingPool(masterChefType + "-" + pid.toString());
    masterChefPool.poolAddress = poolAddress.toHexString();
    masterChefPool.multiplier = constants.BIGINT_ONE;
    masterChefPool.poolAllocPoint = constants.BIGINT_ZERO;
    masterChefPool.lastRewardBlock = event.block.number;
    const sdk = initializeSDK(event);
    const rewardToken = sdk.Tokens.getOrCreateToken(constants.LEVEL_TOKEN_ADDRESS);
    sdk.Tokens.getOrCreateRewardToken(rewardToken, constants_1.RewardTokenType.DEPOSIT);
    masterChefPool.save();
    return masterChefPool;
}
exports.createMasterChefStakingPool = createMasterChefStakingPool;
// Create the masterchef contract that contains data used to calculate rewards for all pools.
function getOrCreateMasterChef(event, masterChefType) {
    let masterChef = schema_1._MasterChef.load(masterChefType);
    if (!masterChef) {
        masterChef = new schema_1._MasterChef(masterChefType);
        masterChef.totalAllocPoint = constants.BIGINT_ZERO;
        masterChef.rewardTokenInterval = constants.INFLATION_INTERVAL;
        masterChef.rewardTokenRate = graph_ts_1.BigInt.fromString(constants.STARTING_INFLATION_RATE.toString());
        masterChef.adjustedRewardTokenRate = graph_ts_1.BigInt.fromString(constants.STARTING_INFLATION_RATE.toString());
        masterChef.lastUpdatedRewardRate = constants.BIGINT_ZERO;
        masterChef.save();
    }
    return masterChef;
}
exports.getOrCreateMasterChef = getOrCreateMasterChef;
// Create a MasterChefStaking pool using the MasterChef pid for id.
function getOrCreateMasterChefStakingPool(event, masterChefType, pid) {
    let masterChefPool = schema_1._MasterChefStakingPool.load(masterChefType + "-" + pid.toString());
    // Create entity to track masterchef pool mappings
    if (!masterChefPool) {
        masterChefPool = new schema_1._MasterChefStakingPool(masterChefType + "-" + pid.toString());
        masterChefPool.multiplier = constants.BIGINT_ONE;
        masterChefPool.poolAllocPoint = constants.BIGINT_ZERO;
        masterChefPool.lastRewardBlock = event.block.number;
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
