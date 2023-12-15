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
exports.handleWithdrawEvent = exports.handleDepositEvent = exports.handleStrategyReported_v2 = exports.handleStrategyReported_v1 = exports.handleUpdateManagementFee = exports.handleUpdatePerformanceFee = exports.handleWithdrawWithSharesAndRecipientAndLoss = exports.handleWithdrawWithSharesAndRecipient = exports.handleWithdrawWithShares = exports.handleWithdraw = exports.handleDepositWithAmountAndRecipient = exports.handleDepositWithAmount = exports.handleDeposit = exports.handleStrategyAdded_v2 = exports.handleStrategyAdded_v1 = void 0;
const schema_1 = require("../../generated/schema");
const Metrics_1 = require("../modules/Metrics");
const utils = __importStar(require("../common/utils"));
const Deposit_1 = require("../modules/Deposit");
const Withdraw_1 = require("../modules/Withdraw");
const constants = __importStar(require("../common/constants"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Strategy_1 = require("../modules/Strategy");
const initializers_1 = require("../common/initializers");
const templates_1 = require("../../generated/templates");
function handleStrategyAdded_v1(event) {
    const vaultAddress = event.address;
    const strategyAddress = event.params.strategy;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    if (vault) {
        templates_1.Strategy.create(strategyAddress);
        graph_ts_1.log.warning("[SetStrategy_v1] TxHash: {}, VaultId: {}, Strategy: {}", [
            event.transaction.hash.toHexString(),
            vaultAddress.toHexString(),
            strategyAddress.toHexString(),
        ]);
    }
}
exports.handleStrategyAdded_v1 = handleStrategyAdded_v1;
function handleStrategyAdded_v2(event) {
    const vaultAddress = event.address;
    const strategyAddress = event.params.strategy;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    if (vault) {
        templates_1.Strategy.create(strategyAddress);
        graph_ts_1.log.warning("[SetStrategy_v2] TxHash: {}, VaultId: {}, Strategy: {}", [
            event.transaction.hash.toHexString(),
            vaultAddress.toHexString(),
            strategyAddress.toHexString(),
        ]);
    }
}
exports.handleStrategyAdded_v2 = handleStrategyAdded_v2;
function handleDeposit(call) {
    const vaultAddress = call.to;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, call.block);
    if (vault) {
        const sharesMinted = call.outputs.value0;
        (0, Deposit_1._Deposit)(vaultAddress, call.transaction, call.block, vault, sharesMinted, constants.MAX_UINT256);
    }
    (0, Metrics_1.updateFinancials)(call.block);
    (0, Metrics_1.updateUsageMetrics)(call.block, call.from);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleDeposit = handleDeposit;
function handleDepositWithAmount(call) {
    const vaultAddress = call.to;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, call.block);
    if (vault) {
        const sharesMinted = call.outputs.value0;
        const depositAmount = call.inputs._amount;
        call.transaction;
        (0, Deposit_1._Deposit)(vaultAddress, call.transaction, call.block, vault, sharesMinted, depositAmount);
    }
    (0, Metrics_1.updateFinancials)(call.block);
    (0, Metrics_1.updateUsageMetrics)(call.block, call.from);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleDepositWithAmount = handleDepositWithAmount;
function handleDepositWithAmountAndRecipient(call) {
    const vaultAddress = call.to;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, call.block);
    if (vault) {
        const sharesMinted = call.outputs.value0;
        const depositAmount = call.inputs._amount;
        (0, Deposit_1._Deposit)(vaultAddress, call.transaction, call.block, vault, sharesMinted, depositAmount);
    }
    (0, Metrics_1.updateFinancials)(call.block);
    (0, Metrics_1.updateUsageMetrics)(call.block, call.from);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleDepositWithAmountAndRecipient = handleDepositWithAmountAndRecipient;
function handleWithdraw(call) {
    const vaultAddress = call.to;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, call.block);
    if (vault) {
        const withdrawAmount = call.outputs.value0;
        (0, Withdraw_1._Withdraw)(vaultAddress, call.transaction, call.block, vault, withdrawAmount, constants.MAX_UINT256);
    }
    (0, Metrics_1.updateFinancials)(call.block);
    (0, Metrics_1.updateUsageMetrics)(call.block, call.from);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleWithdraw = handleWithdraw;
function handleWithdrawWithShares(call) {
    const vaultAddress = call.to;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, call.block);
    if (vault) {
        const sharesBurnt = call.inputs._shares;
        const withdrawAmount = call.outputs.value0;
        (0, Withdraw_1._Withdraw)(vaultAddress, call.transaction, call.block, vault, withdrawAmount, sharesBurnt);
    }
    (0, Metrics_1.updateFinancials)(call.block);
    (0, Metrics_1.updateUsageMetrics)(call.block, call.from);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleWithdrawWithShares = handleWithdrawWithShares;
function handleWithdrawWithSharesAndRecipient(call) {
    const vaultAddress = call.to;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, call.block);
    if (vault) {
        const sharesBurnt = call.inputs._shares;
        const withdrawAmount = call.outputs.value0;
        (0, Withdraw_1._Withdraw)(vaultAddress, call.transaction, call.block, vault, withdrawAmount, sharesBurnt);
    }
    (0, Metrics_1.updateFinancials)(call.block);
    (0, Metrics_1.updateUsageMetrics)(call.block, call.from);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleWithdrawWithSharesAndRecipient = handleWithdrawWithSharesAndRecipient;
function handleWithdrawWithSharesAndRecipientAndLoss(call) {
    const vaultAddress = call.to;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, call.block);
    if (vault) {
        const sharesBurnt = call.inputs.maxShares;
        const withdrawAmount = call.outputs.value0;
        (0, Withdraw_1._Withdraw)(vaultAddress, call.transaction, call.block, vault, withdrawAmount, sharesBurnt);
    }
    (0, Metrics_1.updateFinancials)(call.block);
    (0, Metrics_1.updateUsageMetrics)(call.block, call.from);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleWithdrawWithSharesAndRecipientAndLoss = handleWithdrawWithSharesAndRecipientAndLoss;
function handleUpdatePerformanceFee(event) {
    const vaultAddress = event.address.toHexString();
    const vault = schema_1.Vault.load(vaultAddress);
    if (vault) {
        const performanceFeeId = utils.enumToPrefix(constants.VaultFeeType.PERFORMANCE_FEE) + vaultAddress;
        const performanceFee = schema_1.VaultFee.load(performanceFeeId);
        if (!performanceFee) {
            return;
        }
        performanceFee.feePercentage = event.params.performanceFee
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            .div(graph_ts_1.BigInt.fromI32(100))
            .toBigDecimal();
        performanceFee.save();
        graph_ts_1.log.warning("[updatePerformanceFee]\n TxHash: {}, performanceFee: {}", [
            event.transaction.hash.toHexString(),
            event.params.performanceFee.toString(),
        ]);
    }
}
exports.handleUpdatePerformanceFee = handleUpdatePerformanceFee;
function handleUpdateManagementFee(event) {
    const vaultAddress = event.address.toHexString();
    const vault = schema_1.Vault.load(vaultAddress);
    if (vault) {
        const performanceFeeId = utils.enumToPrefix(constants.VaultFeeType.MANAGEMENT_FEE) + vaultAddress;
        const performanceFee = schema_1.VaultFee.load(performanceFeeId);
        if (!performanceFee) {
            return;
        }
        performanceFee.feePercentage = event.params.managementFee
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            .div(graph_ts_1.BigInt.fromI32(100))
            .toBigDecimal();
        performanceFee.save();
        graph_ts_1.log.warning("[updateManagementFee]\n TxHash: {}, managementFee: {}", [
            event.transaction.hash.toHexString(),
            event.params.managementFee.toString(),
        ]);
    }
}
exports.handleUpdateManagementFee = handleUpdateManagementFee;
function handleStrategyReported_v1(event) {
    const vaultAddress = event.address;
    const strategyAddress = event.params.strategy;
    (0, Strategy_1.strategyReported)(event.params.gain, vaultAddress, strategyAddress, event);
    (0, Metrics_1.updateFinancials)(event.block);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
}
exports.handleStrategyReported_v1 = handleStrategyReported_v1;
function handleStrategyReported_v2(event) {
    const vaultAddress = event.address;
    const strategyAddress = event.params.strategy;
    (0, Strategy_1.strategyReported)(event.params.gain, vaultAddress, strategyAddress, event);
    (0, Metrics_1.updateFinancials)(event.block);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
}
exports.handleStrategyReported_v2 = handleStrategyReported_v2;
function handleDepositEvent(event) {
    const vaultAddress = event.address;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    if (vault) {
        const sharesMinted = event.params.shares;
        (0, Deposit_1._Deposit)(event.address, event.transaction, event.block, vault, sharesMinted, event.params.amount);
    }
    (0, Metrics_1.updateFinancials)(event.block);
    (0, Metrics_1.updateUsageMetrics)(event.block, event.params.recipient);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
}
exports.handleDepositEvent = handleDepositEvent;
function handleWithdrawEvent(event) {
    const vaultAddress = event.address;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    if (vault) {
        const sharesBurnt = event.params.shares;
        const withdrawAmount = event.params.amount;
        (0, Withdraw_1._Withdraw)(event.address, event.transaction, event.block, vault, withdrawAmount, sharesBurnt);
    }
    (0, Metrics_1.updateFinancials)(event.block);
    (0, Metrics_1.updateUsageMetrics)(event.block, event.transaction.from);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
}
exports.handleWithdrawEvent = handleWithdrawEvent;
