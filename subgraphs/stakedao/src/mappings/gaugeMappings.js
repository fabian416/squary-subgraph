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
exports.handleRewardAdded = exports.handleAddReward = void 0;
const Reward_1 = require("../modules/Reward");
const Gauge_1 = require("../../generated/templates/Gauge/Gauge");
const utils = __importStar(require("../common/utils"));
const Prices_1 = require("../Prices");
const constants = __importStar(require("../common/constants"));
const schema_1 = require("../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
const Strategy_1 = require("../../generated/Controller/Strategy");
function handleAddReward(call) {
    const gaugeAddress = call.to;
    const gaugeContract = Gauge_1.Gauge.bind(gaugeAddress);
    const vaultAddress = gaugeContract.stakingToken();
    const vault = schema_1.Vault.load(vaultAddress.toHexString());
    if (vault) {
        const rewardTokensIds = [];
        let rewardTokenAddress;
        // Assuming that their are a maximum of 10 rewardTokens in the vault.
        for (let i = 0; i <= constants.INT_TEN; i++) {
            rewardTokenAddress = utils.readValue(gaugeContract.try_rewardTokens(graph_ts_1.BigInt.fromI32(i)), constants.ZERO_ADDRESS);
            if (rewardTokenAddress.equals(constants.ZERO_ADDRESS)) {
                break;
            }
            const rewardToken = (0, initializers_1.getOrCreateRewardToken)(rewardTokenAddress);
            rewardTokensIds.push(rewardToken.id);
        }
        vault.rewardTokens = rewardTokensIds;
        vault._rewardTokensIds = rewardTokensIds;
        vault.save();
        graph_ts_1.log.warning("[Gauge: AddReward] vaultId: {}, gaugeId: {}, rewardTokensIds: {}", [
            vaultAddress.toHexString(),
            gaugeAddress.toHexString(),
            rewardTokensIds.join(", "),
        ]);
    }
}
exports.handleAddReward = handleAddReward;
function handleRewardAdded(event) {
    const gaugeAddress = event.address;
    const gaugeContract = Gauge_1.Gauge.bind(gaugeAddress);
    const vaultAddress = gaugeContract.stakingToken();
    const vault = schema_1.Vault.load(vaultAddress.toHexString());
    if (!vault)
        return;
    const strategyAddress = graph_ts_1.Address.fromString(vault._strategy);
    const strategyContract = Strategy_1.Strategy.bind(strategyAddress);
    const performanceFee = utils
        .readValue(strategyContract.try_performanceFee(), constants.BIGINT_ZERO)
        .toBigDecimal();
    const rewardEarned = event.params.reward.toBigDecimal();
    const rewardTokenAddress = graph_ts_1.Address.fromString(vault._rewardTokensIds[0]);
    const rewardTokenPrice = (0, Prices_1.getUsdPricePerToken)(rewardTokenAddress);
    const rewardTokenDecimals = constants.BIGINT_TEN.pow(utils.getTokenDecimals(rewardTokenAddress).toI32()).toBigDecimal();
    const supplySideRewardEarned = rewardEarned.times(constants.BIGDECIMAL_ONE.minus(performanceFee.div(constants.DENOMINATOR)));
    const supplySideRewardEarnedUSD = supplySideRewardEarned
        .div(rewardTokenDecimals)
        .times(rewardTokenPrice.usdPrice)
        .div(rewardTokenPrice.decimalsBaseTen);
    const protocolSideRewardEarned = rewardEarned
        .times(performanceFee)
        .div(constants.BIGDECIMAL_HUNDRED);
    const protocolSideRewardEarnedUSD = protocolSideRewardEarned
        .div(rewardTokenDecimals)
        .times(rewardTokenPrice.usdPrice)
        .div(rewardTokenPrice.decimalsBaseTen);
    const totalRevenueUSD = supplySideRewardEarnedUSD.plus(protocolSideRewardEarnedUSD);
    vault.save();
    (0, Reward_1.updateRewardTokenEmission)(vaultAddress, gaugeAddress, 0, rewardTokenAddress, rewardTokenDecimals, rewardTokenPrice);
    (0, Reward_1.updateFinancialsAfterRewardAdded)(event.block, totalRevenueUSD, supplySideRewardEarnedUSD, protocolSideRewardEarnedUSD);
    graph_ts_1.log.warning("[RewardAdded] vault: {}, Strategy: {}, Gauge: {}, supplySideRewardEarned: {}, protocolSideRewardEarned: {}, rewardToken: {}, totalRevenueUSD: {}, TxHash: {}", [
        vaultAddress.toHexString(),
        strategyAddress.toHexString(),
        gaugeAddress.toHexString(),
        supplySideRewardEarned.toString(),
        protocolSideRewardEarned.toString(),
        rewardTokenAddress.toHexString(),
        totalRevenueUSD.toString(),
        event.transaction.hash.toHexString(),
    ]);
}
exports.handleRewardAdded = handleRewardAdded;
