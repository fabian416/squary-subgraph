"use strict";
// Stake LLP to earn LVL
// LVL staking reward token is senior LLP
// Masterchef/Farming is LP staking reward token is LVL
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
exports.handleRewardPerSecondSet = exports.handleUnstaked = exports.handleStaked = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../sdk/util/constants");
const initializers_1 = require("../common/initializers");
const Staking_1 = require("../../generated/LevelStake/Staking");
function handleStaked(event) {
    const sdk = (0, initializers_1.initializeSDK)(event);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    if (constants.LEVEL_STAKE_ADDRESS.equals(constants.NULL.TYPE_ADDRESS))
        return;
    const stakingContract = Staking_1.Staking.bind(constants.LEVEL_STAKE_ADDRESS);
    const rewardPerSecond = utils.readValue(stakingContract.try_rewardsPerSecond(), constants.BIGINT_ZERO);
    graph_ts_1.log.warning("[Rewards] rewardsPerSecond {} ", [rewardPerSecond.toString()]);
    const seniorLlpToken = sdk.Tokens.getOrCreateToken(constants.SENIOR_LLP_ADDRESS);
    sdk.Tokens.getOrCreateRewardToken(seniorLlpToken, constants_1.RewardTokenType.STAKE);
    const rewardTokenEmission = rewardPerSecond.times(graph_ts_1.BigInt.fromI32(constants.SECONDS_PER_DAY));
    pool.setRewardEmissions(constants_1.RewardTokenType.STAKE, seniorLlpToken, rewardTokenEmission);
}
exports.handleStaked = handleStaked;
function handleUnstaked(event) {
    const sdk = (0, initializers_1.initializeSDK)(event);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    if (constants.LEVEL_STAKE_ADDRESS.equals(constants.NULL.TYPE_ADDRESS))
        return;
    const stakingContract = Staking_1.Staking.bind(constants.LEVEL_STAKE_ADDRESS);
    const rewardPerSecond = utils.readValue(stakingContract.try_rewardsPerSecond(), constants.BIGINT_ZERO);
    graph_ts_1.log.warning("[Rewards] rewardsPerSecond {} ", [rewardPerSecond.toString()]);
    const seniorLlpToken = sdk.Tokens.getOrCreateToken(constants.SENIOR_LLP_ADDRESS);
    sdk.Tokens.getOrCreateRewardToken(seniorLlpToken, constants_1.RewardTokenType.STAKE);
    const rewardTokenEmission = rewardPerSecond.times(graph_ts_1.BigInt.fromI32(constants.SECONDS_PER_DAY));
    pool.setRewardEmissions(constants_1.RewardTokenType.STAKE, seniorLlpToken, rewardTokenEmission);
}
exports.handleUnstaked = handleUnstaked;
function handleRewardPerSecondSet(event) {
    const sdk = (0, initializers_1.initializeSDK)(event);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    const rewardPerSecond = event.params._rewardsPerSecond;
    const seniorLlpToken = sdk.Tokens.getOrCreateToken(constants.SENIOR_LLP_ADDRESS);
    sdk.Tokens.getOrCreateRewardToken(seniorLlpToken, constants_1.RewardTokenType.STAKE);
    const rewardTokenEmission = rewardPerSecond.times(graph_ts_1.BigInt.fromI32(constants.SECONDS_PER_DAY));
    pool.setRewardEmissions(constants_1.RewardTokenType.STAKE, seniorLlpToken, rewardTokenEmission);
}
exports.handleRewardPerSecondSet = handleRewardPerSecondSet;
