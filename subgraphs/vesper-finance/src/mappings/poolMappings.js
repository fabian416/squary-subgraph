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
exports.handleUpdatedPoolRewards = exports.handleEarningReported = exports.handleUpdatedWithdrawFee = exports.handleUpdatedUniversalFee = exports.handleUniversalFeePaid = exports.handleWithdraw = exports.handleDeposit = void 0;
const Metrics_1 = require("../modules/Metrics");
const utils = __importStar(require("../common/utils"));
const Deposit_1 = require("../modules/Deposit");
const Withdraw_1 = require("../modules/Withdraw");
const prices_1 = require("../prices");
const constants = __importStar(require("../common/constants"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
const templates_1 = require("../../generated/templates");
const Revenue_1 = require("../modules/Revenue");
const Rewards_1 = require("../modules/Rewards");
const initializers_1 = require("../common/initializers");
const PoolRewards_1 = require("../../generated/templates/PoolRewards/PoolRewards");
function handleDeposit(event) {
    const vaultAddress = event.address;
    const sharesMinted = event.params.shares;
    const depositAmount = event.params.amount;
    (0, Deposit_1.Deposit)(vaultAddress, depositAmount, sharesMinted, event.transaction, event.block);
    (0, Metrics_1.updateFinancials)(event.block);
    (0, Metrics_1.updateUsageMetrics)(event.block, event.transaction.from);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
}
exports.handleDeposit = handleDeposit;
function handleWithdraw(event) {
    const vaultAddress = event.address;
    const sharesBurnt = event.params.shares;
    const withdrawAmount = event.params.amount;
    (0, Withdraw_1.Withdraw)(vaultAddress, withdrawAmount, sharesBurnt, event.transaction, event.block);
    (0, Metrics_1.updateFinancials)(event.block);
    (0, Metrics_1.updateUsageMetrics)(event.block, event.transaction.from);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
}
exports.handleWithdraw = handleWithdraw;
function handleUniversalFeePaid(event) {
    const vaultAddress = event.address;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    let inputTokenAddress = graph_ts_1.Address.fromString(vault.inputToken);
    let inputTokenPrice = (0, prices_1.getUsdPricePerToken)(inputTokenAddress);
    let inputTokenDecimals = utils.getTokenDecimals(inputTokenAddress);
    const protocolSideRevenueUSD = event.params.fee
        .toBigDecimal()
        .div(inputTokenDecimals)
        .times(inputTokenPrice.usdPrice)
        .div(inputTokenPrice.decimalsBaseTen);
    (0, Revenue_1.updateRevenueSnapshots)(vault, constants.BIGDECIMAL_ZERO, protocolSideRevenueUSD, event.block);
}
exports.handleUniversalFeePaid = handleUniversalFeePaid;
function handleUpdatedUniversalFee(event) { }
exports.handleUpdatedUniversalFee = handleUpdatedUniversalFee;
function handleUpdatedWithdrawFee(event) {
    const vaultAddress = event.address;
    const withdrawalFeeId = utils.enumToPrefix(constants.VaultFeeType.WITHDRAWAL_FEE) +
        vaultAddress.toHexString();
    const withdrawalFee = (0, initializers_1.getOrCreateFee)(withdrawalFeeId, constants.VaultFeeType.WITHDRAWAL_FEE);
    withdrawalFee.feePercentage = event.params.newWithdrawFee
        .toBigDecimal()
        .div(constants.MAX_BPS.toBigDecimal());
    withdrawalFee.save();
    graph_ts_1.log.info("[UpdateWithdrawFee] vault: {}, newWithdrawFee: {}", [
        vaultAddress.toHexString(),
        withdrawalFee.feePercentage.toString(),
    ]);
}
exports.handleUpdatedWithdrawFee = handleUpdatedWithdrawFee;
function handleEarningReported(event) {
    const vaultAddress = event.address;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    let inputTokenAddress = graph_ts_1.Address.fromString(vault.inputToken);
    let inputTokenPrice = (0, prices_1.getUsdPricePerToken)(inputTokenAddress);
    let inputTokenDecimals = utils.getTokenDecimals(inputTokenAddress);
    const supplySideRevenueUSD = event.params.profit
        .toBigDecimal()
        .div(inputTokenDecimals)
        .times(inputTokenPrice.usdPrice)
        .div(inputTokenPrice.decimalsBaseTen);
    (0, Revenue_1.updateRevenueSnapshots)(vault, supplySideRevenueUSD, constants.BIGDECIMAL_ZERO, event.block);
    (0, Metrics_1.updateFinancials)(event.block);
    (0, Metrics_1.updateUsageMetrics)(event.block, event.transaction.from);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
}
exports.handleEarningReported = handleEarningReported;
function handleUpdatedPoolRewards(event) {
    const newPoolRewards = event.params.newPoolRewards;
    const poolRewardsContract = PoolRewards_1.PoolRewards.bind(newPoolRewards);
    const vaultAddress = utils.readValue(poolRewardsContract.try_pool(), constants.NULL.TYPE_ADDRESS);
    const rewardTokens = utils.readValue(poolRewardsContract.try_getRewardTokens(), []);
    for (let i = 0; i < rewardTokens.length; i += 1) {
        let rewardToken = rewardTokens[i];
        (0, Rewards_1.updateRewardTokenEmissions)(rewardToken, vaultAddress, constants.BIGINT_ZERO, event.block);
    }
    if (newPoolRewards.notEqual(constants.NULL.TYPE_ADDRESS))
        templates_1.PoolRewards.create(newPoolRewards);
    graph_ts_1.log.warning("[UpdatedPoolRewards] vault: {}, newPoolRewards: {}", [
        event.address.toHexString(),
        newPoolRewards.toHexString(),
    ]);
}
exports.handleUpdatedPoolRewards = handleUpdatedPoolRewards;
