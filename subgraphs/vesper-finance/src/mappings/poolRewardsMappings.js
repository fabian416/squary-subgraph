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
exports.handleRewardTokenAdded = exports.handleRewardPaid = exports.handleRewardAdded = void 0;
const Rewards_1 = require("../modules/Rewards");
const utils = __importStar(require("../common/utils"));
const prices_1 = require("../prices");
const constants = __importStar(require("../common/constants"));
const initializers_1 = require("../common/initializers");
const Revenue_1 = require("../modules/Revenue");
const Metrics_1 = require("../modules/Metrics");
const PoolRewards_1 = require("../../generated/templates/PoolRewards/PoolRewards");
function handleRewardAdded(event) {
    const rewardAmount = event.params.reward;
    const rewardToken = event.params.rewardToken;
    const poolRewardsAddress = event.address;
    const poolRewardsContract = PoolRewards_1.PoolRewards.bind(poolRewardsAddress);
    const vaultAddress = utils.readValue(poolRewardsContract.try_pool(), constants.NULL.TYPE_ADDRESS);
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    let rewardTokenPrice = (0, prices_1.getUsdPricePerToken)(rewardToken);
    let rewardTokenDecimals = utils.getTokenDecimals(rewardToken);
    const supplySideRevenueUSD = rewardAmount
        .toBigDecimal()
        .div(rewardTokenDecimals)
        .times(rewardTokenPrice.usdPrice)
        .div(rewardTokenPrice.decimalsBaseTen);
    (0, Revenue_1.updateRevenueSnapshots)(vault, supplySideRevenueUSD, constants.BIGDECIMAL_ZERO, event.block);
    (0, Rewards_1.updateRewardToken)(vaultAddress, poolRewardsAddress, event.block);
}
exports.handleRewardAdded = handleRewardAdded;
function handleRewardPaid(event) {
    const poolRewardsAddress = event.address;
    const poolRewardsContract = PoolRewards_1.PoolRewards.bind(poolRewardsAddress);
    const vaultAddress = utils.readValue(poolRewardsContract.try_pool(), constants.NULL.TYPE_ADDRESS);
    (0, Metrics_1.updateFinancials)(event.block);
    (0, Metrics_1.updateUsageMetrics)(event.block, event.transaction.from);
    (0, Rewards_1.updateRewardToken)(vaultAddress, poolRewardsAddress, event.block);
}
exports.handleRewardPaid = handleRewardPaid;
function handleRewardTokenAdded(event) {
    const newRewardsAddress = event.params.rewardToken;
    const poolRewardsAddress = event.address;
    const poolRewardsContract = PoolRewards_1.PoolRewards.bind(poolRewardsAddress);
    const vaultAddress = utils.readValue(poolRewardsContract.try_pool(), constants.NULL.TYPE_ADDRESS);
    (0, Rewards_1.updateRewardTokenEmissions)(newRewardsAddress, vaultAddress, constants.BIGINT_ZERO, event.block);
}
exports.handleRewardTokenAdded = handleRewardTokenAdded;
