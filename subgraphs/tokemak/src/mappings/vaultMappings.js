"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateWithdrawTransactionFromCall = exports.getOrCreateDepositTransactionFromCall = exports.handleWithdrawRequest = exports.handleWithdrawEthPool = exports.handleWithdraw = exports.handleDepositWithRecipient = exports.handleDeposit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const utils_1 = require("../common/utils");
const tokens_1 = require("../common/tokens");
const financial_1 = require("../common/financial");
const usage_1 = require("../common/usage");
const vaults_1 = require("../common/vaults");
const prices_1 = require("../prices");
const protocol_1 = require("../common/protocol");
function handleDeposit(call) {
    graph_ts_1.log.info("[Vault mappings] Handle deposit with amount {}, vault {}", [
        call.inputs.amount.toString(),
        call.to.toHexString(),
    ]);
    const vaultAddress = call.to;
    // let vault = VaultStore.load(vaultAddress.toHexString());
    let vault = (0, vaults_1.getOrCreateVault)(vaultAddress, call.block.number, call.block.timestamp);
    if (vault) {
        let depositAmount = call.inputs.amount;
        let sharesMinted = depositAmount;
        deposit(call, vault, depositAmount, sharesMinted);
    }
    (0, financial_1.updateFinancials)(call.block.number, call.block.timestamp);
    (0, usage_1.updateUsageMetrics)(call.block, call.from, constants_1.CallType.DEPOSIT);
    (0, vaults_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleDeposit = handleDeposit;
function handleDepositWithRecipient(call) {
    graph_ts_1.log.info("[Vault mappings] Handle deposit with amount {}, vault {}", [
        call.inputs.amount.toString(),
        call.to.toHexString(),
    ]);
    const vaultAddress = call.to;
    let vault = (0, vaults_1.getOrCreateVault)(vaultAddress, call.block.number, call.block.timestamp);
    if (vault) {
        let depositAmount = call.inputs.amount;
        let sharesMinted = depositAmount;
        deposit(call, vault, depositAmount, sharesMinted);
    }
    (0, financial_1.updateFinancials)(call.block.number, call.block.timestamp);
    (0, usage_1.updateUsageMetrics)(call.block, call.from, constants_1.CallType.DEPOSIT);
    (0, vaults_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleDepositWithRecipient = handleDepositWithRecipient;
function deposit(call, vault, depositAmount, sharesMinted) {
    if (call.transaction.value > constants_1.BIGINT_ZERO && constants_1.WETH_VAULT.toLowerCase() === vault.id.toLowerCase()) {
        depositAmount = call.transaction.value;
    }
    const token = (0, tokens_1.getOrCreateToken)(graph_ts_1.Address.fromString(vault.inputToken));
    const outputToken = (0, tokens_1.getOrCreateToken)(graph_ts_1.Address.fromString(vault.outputToken));
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const tokenPrice = (0, prices_1.getUsdPrice)(graph_ts_1.Address.fromString(token.id), constants_1.BIGDECIMAL_ONE);
    const decimals = constants_1.BIGINT_TEN.pow(u8(token.decimals));
    const amountUSD = tokenPrice.times(depositAmount.toBigDecimal()).div(decimals.toBigDecimal());
    const tvl = vault.inputTokenBalance.plus(depositAmount);
    vault.totalValueLockedUSD = tokenPrice.times(tvl.toBigDecimal()).div(decimals.toBigDecimal());
    protocol.totalValueLockedUSD = protocol.totalValueLockedUSD.plus(amountUSD);
    vault.inputTokenBalance = tvl;
    vault.outputTokenSupply = vault.outputTokenSupply.plus((0, utils_1.convertTokenDecimals)(sharesMinted, token.decimals, outputToken.decimals));
    vault.outputTokenPriceUSD = tokenPrice.times((0, utils_1.convertTokenDecimals)(decimals, token.decimals, outputToken.decimals).toBigDecimal());
    vault.pricePerShare = decimals.toBigDecimal();
    vault.save();
    protocol.save();
    getOrCreateDepositTransactionFromCall(call, depositAmount, amountUSD, "vault.deposit()");
}
function handleWithdraw(call) {
    graph_ts_1.log.info("[Vault mappings] Handle withdraw with shares. TX hash: {}", [call.transaction.hash.toHexString()]);
    const vaultAddress = call.to;
    let vault = (0, vaults_1.getOrCreateVault)(vaultAddress, call.block.number, call.block.timestamp);
    if (vault) {
        const requestedAmount = call.inputs.requestedAmount;
        const withdrawAmount = requestedAmount;
        withdraw(call, vault, withdrawAmount, requestedAmount);
    }
    (0, financial_1.updateFinancials)(call.block.number, call.block.timestamp);
    (0, usage_1.updateUsageMetrics)(call.block, call.from, constants_1.CallType.WITHDRAW);
    (0, vaults_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleWithdraw = handleWithdraw;
function handleWithdrawEthPool(call) {
    graph_ts_1.log.info("[Vault mappings] Handle withdraw with shares. TX hash: {}", [call.transaction.hash.toHexString()]);
    const vaultAddress = call.to;
    let vault = (0, vaults_1.getOrCreateVault)(vaultAddress, call.block.number, call.block.timestamp);
    if (vault) {
        const requestedAmount = call.inputs.requestedAmount;
        const withdrawAmount = requestedAmount;
        withdraw(call, vault, withdrawAmount, requestedAmount);
    }
    (0, financial_1.updateFinancials)(call.block.number, call.block.timestamp);
    (0, usage_1.updateUsageMetrics)(call.block, call.from, constants_1.CallType.WITHDRAW);
    (0, vaults_1.updateVaultSnapshots)(vaultAddress, call.block);
}
exports.handleWithdrawEthPool = handleWithdrawEthPool;
function handleWithdrawRequest(event) {
    graph_ts_1.log.info("[Vault mappings] Handle withdraw request with shares. TX hash: {}", [event.transaction.hash.toHexString()]);
    (0, usage_1.updateUsageMetrics)(event.block, event.params.requestor);
}
exports.handleWithdrawRequest = handleWithdrawRequest;
function withdraw(call, vault, withdrawAmount, sharesBurnt) {
    const token = (0, tokens_1.getOrCreateToken)(graph_ts_1.Address.fromString(vault.inputToken));
    const outputToken = (0, tokens_1.getOrCreateToken)(graph_ts_1.Address.fromString(vault.outputToken));
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const tokenPrice = (0, prices_1.getUsdPrice)(graph_ts_1.Address.fromString(token.id), constants_1.BIGDECIMAL_ONE);
    const decimals = constants_1.BIGINT_TEN.pow(u8(token.decimals));
    const amountUSD = tokenPrice.times(withdrawAmount.div(decimals).toBigDecimal());
    const tvl = vault.inputTokenBalance.minus(withdrawAmount);
    vault.totalValueLockedUSD = tokenPrice.times(tvl.div(decimals).toBigDecimal());
    protocol.totalValueLockedUSD = protocol.totalValueLockedUSD.minus(amountUSD);
    vault.outputTokenSupply = vault.outputTokenSupply.minus((0, utils_1.convertTokenDecimals)(sharesBurnt, token.decimals, outputToken.decimals));
    vault.outputTokenPriceUSD = tokenPrice.times((0, utils_1.convertTokenDecimals)(decimals, token.decimals, outputToken.decimals).toBigDecimal());
    vault.inputTokenBalance = tvl;
    vault.pricePerShare = decimals.toBigDecimal();
    vault.save();
    protocol.save();
    getOrCreateWithdrawTransactionFromCall(call, withdrawAmount, amountUSD, "vault.withdraw()");
}
function getOrCreateDepositTransactionFromCall(call, amount, amountUSD, action) {
    graph_ts_1.log.debug("[Transaction] Get or create deposit transaction hash {} from call action {}, to {}", [
        call.transaction.hash.toHexString(),
        action,
        call.to.toHexString(),
    ]);
    let tx = call.transaction;
    let id = "deposit-" + tx.hash.toHexString();
    let transaction = schema_1.Deposit.load(id);
    if (transaction == null) {
        transaction = new schema_1.Deposit(id);
        transaction.logIndex = tx.index.toI32();
        transaction.to = call.to.toHexString();
        transaction.from = tx.from.toHexString();
        transaction.hash = tx.hash.toHexString();
        transaction.timestamp = call.block.timestamp;
        transaction.blockNumber = call.block.number;
        transaction.protocol = constants_1.PROTOCOL_ID;
        transaction.vault = call.to.toHexString();
        const vault = (0, vaults_1.getOrCreateVault)(call.to, call.block.number, call.block.timestamp);
        if (vault) {
            transaction.asset = vault.inputToken;
        }
        transaction.amount = amount;
        transaction.amountUSD = amountUSD;
        transaction.save();
    }
    return transaction;
}
exports.getOrCreateDepositTransactionFromCall = getOrCreateDepositTransactionFromCall;
function getOrCreateWithdrawTransactionFromCall(call, amount, amountUSD, action) {
    graph_ts_1.log.debug("[Transaction] Get or create withdraw transaction hash {} from call action {}, to {}", [
        call.transaction.hash.toHexString(),
        action,
        call.to.toHexString(),
    ]);
    let tx = call.transaction;
    let id = "withdraw-" + tx.hash.toHexString();
    let transaction = schema_1.Withdraw.load(id);
    if (transaction == null) {
        transaction = new schema_1.Withdraw(id);
        transaction.logIndex = tx.index.toI32();
        transaction.to = call.to.toHexString();
        transaction.from = tx.from.toHexString();
        transaction.hash = tx.hash.toHexString();
        transaction.timestamp = call.block.timestamp;
        transaction.blockNumber = call.block.number;
        transaction.protocol = constants_1.PROTOCOL_ID;
        transaction.vault = call.to.toHexString();
        const vault = (0, vaults_1.getOrCreateVault)(call.to, call.block.number, call.block.timestamp);
        if (vault) {
            transaction.asset = vault.inputToken;
        }
        transaction.amount = amount;
        transaction.amountUSD = amountUSD;
        transaction.save();
    }
    return transaction;
}
exports.getOrCreateWithdrawTransactionFromCall = getOrCreateWithdrawTransactionFromCall;
