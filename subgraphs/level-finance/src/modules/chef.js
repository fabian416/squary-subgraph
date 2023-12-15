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
exports.updateMasterChef = void 0;
const initializers_1 = require("../../src/common/initializers");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const constants_1 = require("../sdk/util/constants");
const rewards_1 = require("../../src/common/rewards");
const schema_1 = require("../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
// Updated Liquidity pool staked amount and emmissions on a deposit to the masterchef contract.
function updateMasterChef(event, pid, amount) {
    const sdk = (0, initializers_1.initializeSDK)(event);
    const masterChefV2Pool = schema_1._MasterChefStakingPool.load(constants.MasterChef.MASTERCHEFV2 + "-" + pid.toString());
    const masterChefV2 = (0, initializers_1.getOrCreateMasterChef)(event, constants.MasterChef.MASTERCHEFV2);
    // Return if pool does not exist
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    if (!pool) {
        return;
    }
    const levelToken = sdk.Tokens.getOrCreateToken(constants.LEVEL_TOKEN_ADDRESS);
    // Calculate Reward Emission per second to a specific pool
    // Pools are allocated based on their fraction of the total allocation times the rewards emitted per second
    const rewardAmountPerInterval = masterChefV2.adjustedRewardTokenRate
        .times(masterChefV2Pool.poolAllocPoint)
        .div(masterChefV2.totalAllocPoint);
    const rewardAmountPerIntervalBigDecimal = graph_ts_1.BigDecimal.fromString(rewardAmountPerInterval.toString());
    // Based on the emissions rate for the pool, calculate the rewards per day for the pool.
    const rewardTokenPerDay = (0, rewards_1.getRewardsPerDay)(event.block.timestamp, event.block.number, rewardAmountPerIntervalBigDecimal, masterChefV2.rewardTokenInterval);
    // Update the amount of staked tokens after deposit
    // Positive for deposits, negative for withdraws
    pool.addStakedOutputTokenAmount(amount);
    pool.setRewardEmissions(constants_1.RewardTokenType.DEPOSIT, levelToken, graph_ts_1.BigInt.fromString(utils.roundToWholeNumber(rewardTokenPerDay).toString()));
    masterChefV2Pool.lastRewardBlock = event.block.number;
    masterChefV2Pool.save();
    masterChefV2.save();
}
exports.updateMasterChef = updateMasterChef;
