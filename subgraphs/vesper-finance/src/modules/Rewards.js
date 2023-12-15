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
exports.updateRewardTokenEmissions = exports.updateRewardToken = void 0;
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const prices_1 = require("../prices");
const constants = __importStar(require("../common/constants"));
const Reward_1 = require("../common/Reward");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const PoolRewards_1 = require("../../generated/templates/PoolRewards/PoolRewards");
function updateRewardToken(vaultAddress, poolRewardsAddress, block) {
    const poolRewardsContract = PoolRewards_1.PoolRewards.bind(poolRewardsAddress);
    let rewardTokens = utils.readValue(poolRewardsContract.try_getRewardTokens(), []);
    for (let i = 0; i < rewardTokens.length; i += 1) {
        let rewardToken = rewardTokens[i];
        let rewardRate = utils.readValue(poolRewardsContract.try_rewardRates(rewardToken), constants.BIGINT_ZERO);
        let rewardRatePerDay = (0, Reward_1.getRewardsPerDay)(block.timestamp, block.number, rewardRate.toBigDecimal(), constants.RewardIntervalType.TIMESTAMP);
        let rewardPerDay = graph_ts_1.BigInt.fromString(rewardRatePerDay.toString());
        updateRewardTokenEmissions(rewardToken, vaultAddress, rewardPerDay, block);
        graph_ts_1.log.warning("[Rewards] Vault: {}, RewardToken: {}, RewardRate: {}", [
            vaultAddress.toHexString(),
            rewardToken.toHexString(),
            rewardRatePerDay.toString(),
        ]);
    }
}
exports.updateRewardToken = updateRewardToken;
function updateRewardTokenEmissions(rewardTokenAddress, vaultAddress, rewardTokenPerDay, block) {
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, block);
    const rewardToken = (0, initializers_1.getOrCreateRewardToken)(rewardTokenAddress);
    if (!vault.rewardTokens) {
        vault.rewardTokens = [];
    }
    let rewardTokens = vault.rewardTokens;
    if (!rewardTokens.includes(rewardToken.id)) {
        rewardTokens.push(rewardToken.id);
        vault.rewardTokens = rewardTokens;
    }
    const rewardTokenIndex = rewardTokens.indexOf(rewardToken.id);
    if (!vault.rewardTokenEmissionsAmount) {
        vault.rewardTokenEmissionsAmount = [];
    }
    let rewardTokenEmissionsAmount = vault.rewardTokenEmissionsAmount;
    if (!vault.rewardTokenEmissionsUSD) {
        vault.rewardTokenEmissionsUSD = [];
    }
    let rewardTokenEmissionsUSD = vault.rewardTokenEmissionsUSD;
    const rewardTokenPrice = (0, prices_1.getUsdPricePerToken)(rewardTokenAddress);
    const rewardTokenDecimals = utils.getTokenDecimals(rewardTokenAddress);
    rewardTokenEmissionsAmount[rewardTokenIndex] = rewardTokenPerDay;
    rewardTokenEmissionsUSD[rewardTokenIndex] = rewardTokenPerDay
        .toBigDecimal()
        .div(rewardTokenDecimals)
        .times(rewardTokenPrice.usdPrice)
        .div(rewardTokenPrice.decimalsBaseTen);
    vault.rewardTokenEmissionsAmount = rewardTokenEmissionsAmount;
    vault.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
    vault.save();
}
exports.updateRewardTokenEmissions = updateRewardTokenEmissions;
