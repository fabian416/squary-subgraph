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
exports.updateVaultFees = exports.updateWithdrawlFees = exports.Transaction = exports.UpdateMetricsAfterTransaction = exports.createDepositTransaction = exports.createWithdrawTransaction = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const Revenue_1 = require("./Revenue");
const constants = __importStar(require("../common/constants"));
const RibbonThetaVaultWithSwap_1 = require("../../generated/templates/LiquidityGauge/RibbonThetaVaultWithSwap");
function createWithdrawTransaction(vault, amount, amountUSD, transaction, block) {
    const withdrawTransactionId = "withdraw-" + transaction.hash.toHexString();
    let withdrawTransaction = schema_1.Withdraw.load(withdrawTransactionId);
    if (!withdrawTransaction) {
        withdrawTransaction = new schema_1.Withdraw(withdrawTransactionId);
        withdrawTransaction.vault = vault.id;
        withdrawTransaction.protocol = constants.PROTOCOL_ID;
        withdrawTransaction.to = transaction.to.toHexString();
        withdrawTransaction.from = transaction.from.toHexString();
        withdrawTransaction.hash = transaction.hash.toHexString();
        withdrawTransaction.logIndex = transaction.index.toI32();
        withdrawTransaction.asset = vault.inputToken;
        withdrawTransaction.amount = amount;
        withdrawTransaction.amountUSD = amountUSD;
        withdrawTransaction.timestamp = block.timestamp;
        withdrawTransaction.blockNumber = block.number;
        withdrawTransaction.save();
    }
    return withdrawTransaction;
}
exports.createWithdrawTransaction = createWithdrawTransaction;
function createDepositTransaction(vault, amount, amountUSD, transaction, block) {
    const transactionId = "deposit-" + transaction.hash.toHexString();
    let depositTransaction = schema_1.Deposit.load(transactionId);
    if (!depositTransaction) {
        depositTransaction = new schema_1.Deposit(transactionId);
        depositTransaction.vault = vault.id;
        depositTransaction.protocol = constants.PROTOCOL_ID;
        depositTransaction.to = vault.id;
        depositTransaction.from = transaction.from.toHexString();
        depositTransaction.hash = transaction.hash.toHexString();
        depositTransaction.logIndex = transaction.index.toI32();
        depositTransaction.asset = vault.inputToken;
        depositTransaction.amount = amount;
        depositTransaction.amountUSD = amountUSD;
        depositTransaction.timestamp = block.timestamp;
        depositTransaction.blockNumber = block.number;
        depositTransaction.save();
    }
    return depositTransaction;
}
exports.createDepositTransaction = createDepositTransaction;
function UpdateMetricsAfterTransaction(block, type) {
    const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
    // Update hourly and daily deposit transaction count
    const metricsDailySnapshot = (0, initializers_1.getOrCreateUsageMetricsDailySnapshot)(block);
    const metricsHourlySnapshot = (0, initializers_1.getOrCreateUsageMetricsHourlySnapshot)(block);
    if (type == constants.TransactionType.WITHDRAW) {
        metricsDailySnapshot.dailyWithdrawCount += 1;
        metricsHourlySnapshot.hourlyWithdrawCount += 1;
    }
    if (type == constants.TransactionType.DEPOSIT) {
        metricsDailySnapshot.dailyDepositCount += 1;
        metricsHourlySnapshot.hourlyDepositCount += 1;
    }
    metricsDailySnapshot.save();
    metricsHourlySnapshot.save();
    protocol.save();
}
exports.UpdateMetricsAfterTransaction = UpdateMetricsAfterTransaction;
function Transaction(vaultAddress, amount, transaction, block, type, feeAmount = constants.BIGINT_ZERO) {
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, block);
    const vaultContract = RibbonThetaVaultWithSwap_1.RibbonThetaVaultWithSwap.bind(vaultAddress);
    const inputTokenAddress = graph_ts_1.Address.fromString(vault.inputToken);
    const inputToken = (0, initializers_1.getOrCreateToken)(inputTokenAddress, block);
    vault.outputTokenSupply = utils.getOutputTokenSupply(vaultAddress, block);
    const totalValue = utils.readValue(vaultContract.try_totalBalance(), constants.BIGINT_ZERO);
    vault.inputTokenBalance = totalValue;
    if (totalValue.notEqual(constants.BIGINT_ZERO)) {
        vault.totalValueLockedUSD = utils
            .bigIntToBigDecimal(vault.inputTokenBalance, vault._decimals)
            .times(inputToken.lastPriceUSD);
    }
    vault.pricePerShare = utils.getVaultPricePerShare(vaultAddress);
    vault.outputTokenPriceUSD = utils.getOutputTokenPriceUSD(vaultAddress, block);
    vault.save();
    if (type == constants.TransactionType.REFRESH) {
        return;
    }
    const amountUSD = utils
        .bigIntToBigDecimal(amount, vault._decimals)
        .times(inputToken.lastPriceUSD);
    if (type == constants.TransactionType.DEPOSIT) {
        createDepositTransaction(vault, amount, amountUSD, transaction, block);
    }
    if (type == constants.TransactionType.WITHDRAW) {
        createWithdrawTransaction(vault, amount, amountUSD, transaction, block);
        if (feeAmount.notEqual(constants.BIGINT_ZERO)) {
            const withdrawalFeeUSD = utils
                .bigIntToBigDecimal(feeAmount, vault._decimals)
                .times(inputToken.lastPriceUSD);
            (0, Revenue_1.updateRevenueSnapshots)(vault, constants.BIGDECIMAL_ZERO, withdrawalFeeUSD, block);
        }
    }
    UpdateMetricsAfterTransaction(block, type);
    utils.updateProtocolTotalValueLockedUSD();
}
exports.Transaction = Transaction;
function updateWithdrawlFees(vaultAddress, feeAmount, withdrawAmount) {
    const withdrawFeePercentage = feeAmount
        .divDecimal(withdrawAmount.toBigDecimal())
        .times(constants.BIGDECIMAL_HUNDRED);
    const withdrawlFeeId = utils.enumToPrefix(constants.VaultFeeType.WITHDRAWAL_FEE) +
        vaultAddress.toHexString();
    const withdrawlFeeStore = (0, initializers_1.getOrCreateFee)(withdrawlFeeId, constants.VaultFeeType.WITHDRAWAL_FEE, withdrawFeePercentage);
    withdrawlFeeStore.save();
}
exports.updateWithdrawlFees = updateWithdrawlFees;
function updateVaultFees(vaultAddress, block) {
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, block);
    const vaultContract = RibbonThetaVaultWithSwap_1.RibbonThetaVaultWithSwap.bind(vaultAddress);
    const performanceFee = utils.bigIntToBigDecimal(utils.readValue(vaultContract.try_performanceFee(), constants.BIGINT_ZERO), 6);
    const managementFee = utils.bigIntToBigDecimal(utils.readValue(vaultContract.try_managementFee(), constants.BIGINT_ZERO), vault._decimals);
    const performanceFeeId = utils.enumToPrefix(constants.VaultFeeType.WITHDRAWAL_FEE) +
        vaultAddress.toHexString();
    const managementFeeId = utils.enumToPrefix(constants.VaultFeeType.WITHDRAWAL_FEE) +
        vaultAddress.toHexString();
    const performanceFeeStore = (0, initializers_1.getOrCreateFee)(performanceFeeId, constants.VaultFeeType.PERFORMANCE_FEE);
    const managementFeeStore = (0, initializers_1.getOrCreateFee)(managementFeeId, constants.VaultFeeType.MANAGEMENT_FEE);
    performanceFeeStore.feePercentage = performanceFee;
    managementFeeStore.feePercentage = managementFee;
    performanceFeeStore.save();
    managementFeeStore.save();
}
exports.updateVaultFees = updateVaultFees;
