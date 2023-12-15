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
exports.updateRewardTokenEmissions = exports.updateRbnRewardsInfo = exports.updateFactoryRewards = exports.updateStakedOutputTokenAmount = exports.getRewardsData_v1 = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const schema_1 = require("../../generated/schema");
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const rewards_1 = require("../common/rewards");
const GaugeController_1 = require("../../generated/templates/LiquidityGauge/GaugeController");
const LiquidityGaugeV5_1 = require("../../generated/templates/LiquidityGauge/LiquidityGaugeV5");
function getRewardsData_v1(gaugeAddress, block) {
    const rewardRates = [];
    const rewardTokens = [];
    const gaugeContract = LiquidityGaugeV5_1.LiquidityGaugeV5.bind(gaugeAddress);
    const rewardToken = constants.RBN_TOKEN;
    rewardTokens.push(rewardToken);
    const rewardRate = utils.readValue(gaugeContract.try_rewardRate(), constants.BIGINT_ZERO);
    const periodFinish = utils.readValue(gaugeContract.try_periodFinish(), constants.BIGINT_ZERO);
    if (periodFinish.lt(block.timestamp)) {
        rewardRates.push(constants.BIGINT_ZERO);
    }
    else {
        rewardRates.push(rewardRate);
    }
    return new types_1.RewardsInfoType(rewardTokens, rewardRates);
}
exports.getRewardsData_v1 = getRewardsData_v1;
function updateStakedOutputTokenAmount(vaultAddress, gaugeAddress, block) {
    const vaultStore = schema_1.Vault.load(vaultAddress.toHexString());
    if (!vaultStore)
        return;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, block);
    const gaugeContract = LiquidityGaugeV5_1.LiquidityGaugeV5.bind(gaugeAddress);
    const gaugeWorkingSupply = utils.readValue(gaugeContract.try_totalSupply(), constants.BIGINT_ZERO);
    vault.stakedOutputTokenAmount = gaugeWorkingSupply;
    if (gaugeWorkingSupply.equals(constants.BIGINT_ZERO)) {
        const gaugeTotalSupply = utils.readValue(gaugeContract.try_totalSupply(), constants.BIGINT_ZERO);
        vault.stakedOutputTokenAmount = gaugeTotalSupply;
    }
    vault.save();
}
exports.updateStakedOutputTokenAmount = updateStakedOutputTokenAmount;
function updateFactoryRewards(vaultAddress, gaugeAddress, block) {
    const rewardsInfo = getRewardsData_v1(gaugeAddress, block);
    const rewardTokens = rewardsInfo.getRewardTokens;
    const rewardRates = rewardsInfo.getRewardRates;
    for (let i = 0; i < rewardTokens.length; i += 1) {
        const rewardToken = rewardTokens[i];
        const rewardRate = rewardRates[i];
        const rewardRatePerDay = (0, rewards_1.getRewardsPerDay)(block.timestamp, block.number, rewardRate.toBigDecimal(), constants.RewardIntervalType.TIMESTAMP);
        const rewardPerDay = graph_ts_1.BigInt.fromString(rewardRatePerDay.toString());
        updateRewardTokenEmissions(rewardToken, rewardPerDay, vaultAddress, block);
    }
}
exports.updateFactoryRewards = updateFactoryRewards;
function updateRbnRewardsInfo(gaugeAddress, vaultAddress, block) {
    (0, initializers_1.getOrCreateVault)(vaultAddress, block);
    const gaugeContract = LiquidityGaugeV5_1.LiquidityGaugeV5.bind(gaugeAddress);
    const gaugeControllerContract = GaugeController_1.GaugeController.bind(constants.GAUGE_CONTROLLER_ADDRESS);
    const inflationRate = utils
        .readValue(gaugeContract.try_inflation_rate(), constants.BIGINT_ZERO)
        .toBigDecimal();
    const gaugeRelativeWeight = utils.readValue(gaugeControllerContract.try_gauge_relative_weight(gaugeAddress), constants.BIGINT_ZERO);
    // rewards = inflation_rate * gauge_relative_weight * seconds_per_day
    const rbnRewardEmissionsPerDay = inflationRate
        .times(utils.bigIntToBigDecimal(gaugeRelativeWeight, 18))
        .times(graph_ts_1.BigDecimal.fromString(constants.SECONDS_PER_DAY.toString()));
    updateRewardTokenEmissions(constants.RBN_TOKEN, graph_ts_1.BigInt.fromString(rbnRewardEmissionsPerDay.truncate(0).toString()), vaultAddress, block);
}
exports.updateRbnRewardsInfo = updateRbnRewardsInfo;
function updateRewardTokenEmissions(rewardTokenAddress, rewardTokenPerDay, vaultAddress, block) {
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, block);
    const rewardToken = (0, initializers_1.getOrCreateRewardToken)(rewardTokenAddress, vaultAddress, block, false);
    if (!vault.rewardTokens) {
        vault.rewardTokens = [];
    }
    const rewardTokens = vault.rewardTokens;
    if (!rewardTokens.includes(rewardToken.id)) {
        rewardTokens.push(rewardToken.id);
        vault.rewardTokens = rewardTokens;
    }
    const rewardTokenIndex = rewardTokens.indexOf(rewardToken.id);
    if (!vault.rewardTokenEmissionsAmount) {
        vault.rewardTokenEmissionsAmount = [];
    }
    const rewardTokenEmissionsAmount = vault.rewardTokenEmissionsAmount;
    if (!vault.rewardTokenEmissionsUSD) {
        vault.rewardTokenEmissionsUSD = [];
    }
    const rewardTokenEmissionsUSD = vault.rewardTokenEmissionsUSD;
    const token = (0, initializers_1.getOrCreateToken)(rewardTokenAddress, block, vaultAddress, false);
    rewardTokenEmissionsAmount[rewardTokenIndex] = rewardTokenPerDay;
    rewardTokenEmissionsUSD[rewardTokenIndex] = utils
        .bigIntToBigDecimal(rewardTokenPerDay, token.decimals)
        .times(token.lastPriceUSD);
    vault.rewardTokenEmissionsAmount = rewardTokenEmissionsAmount;
    vault.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
    vault.save();
}
exports.updateRewardTokenEmissions = updateRewardTokenEmissions;
