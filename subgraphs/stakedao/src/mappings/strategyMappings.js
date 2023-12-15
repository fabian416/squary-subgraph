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
exports.handleHarvested = exports.handleSetWithdrawalFee = exports.handleSetPerformanceFee = void 0;
const schema_1 = require("../../generated/schema");
const utils = __importStar(require("../common/utils"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants = __importStar(require("../common/constants"));
const Strategy_1 = require("../modules/Strategy");
function handleSetPerformanceFee(call) {
    const strategyAddress = call.to;
    const strategy = schema_1._Strategy.load(strategyAddress.toHexString());
    if (strategy) {
        const vaultAddress = strategy.vaultAddress;
        const performanceFeeId = utils.prefixID(constants.VaultFeeType.PERFORMANCE_FEE, vaultAddress.toHexString());
        const performanceFee = schema_1.VaultFee.load(performanceFeeId);
        performanceFee.feePercentage = call.inputs._performanceFee
            .toBigDecimal()
            .div(constants.BIGDECIMAL_HUNDRED);
        performanceFee.save();
        graph_ts_1.log.warning("[setPerformanceFee] TxHash: {}, PerformanceFee: {}", [
            call.transaction.hash.toHexString(),
            call.inputs._performanceFee.toString(),
        ]);
    }
}
exports.handleSetPerformanceFee = handleSetPerformanceFee;
function handleSetWithdrawalFee(call) {
    const strategyAddress = call.to;
    const strategy = schema_1._Strategy.load(strategyAddress.toHexString());
    if (strategy) {
        const vaultAddress = strategy.vaultAddress;
        const withdrawalFeeId = utils.prefixID(constants.VaultFeeType.WITHDRAWAL_FEE, vaultAddress.toHexString());
        const withdrawalFee = schema_1.VaultFee.load(withdrawalFeeId);
        withdrawalFee.feePercentage = call.inputs._withdrawalFee
            .toBigDecimal()
            .div(constants.BIGDECIMAL_HUNDRED);
        withdrawalFee.save();
        graph_ts_1.log.warning("[setWithdrawalFee] TxHash: {}, withdrawalFee: {}", [
            call.transaction.hash.toHexString(),
            call.inputs._withdrawalFee.toString(),
        ]);
    }
}
exports.handleSetWithdrawalFee = handleSetWithdrawalFee;
function handleHarvested(event) {
    const strategyAddress = event.address;
    const wantEarned = event.params.wantEarned;
    const strategy = schema_1._Strategy.load(strategyAddress.toHexString());
    if (!strategy)
        return;
    const vaultAddress = strategy.vaultAddress;
    const vault = schema_1.Vault.load(vaultAddress.toHexString());
    if (vault) {
        (0, Strategy_1._StrategyHarvested)(strategyAddress, vault, wantEarned, event.block, event.transaction);
    }
}
exports.handleHarvested = handleHarvested;
