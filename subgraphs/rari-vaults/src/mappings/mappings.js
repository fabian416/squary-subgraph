"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEtherWithdrawal = exports.handleEtherDeposit = exports.handleDAIWithdrawal = exports.handleDAIDeposit = exports.handleYieldWithdrawal = exports.handleYieldDeposit = exports.handleUSDCWithdrawal = exports.handleUSDCDeposit = void 0;
// map blockchain data to entities outlined in schema.graphql
const constants_1 = require("../common/utils/constants");
const helpers_1 = require("./helpers");
const metrics_1 = require("../common/metrics");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const utils_1 = require("../common/utils/utils");
////////////////////////////
//// USDC Pool Handlers ////
////////////////////////////
function handleUSDCDeposit(event) {
    // get address of asset
    let code = event.params.currencyCode.toHexString();
    let assetAddress;
    if (constants_1.TOKEN_MAPPING.has(code)) {
        assetAddress = constants_1.TOKEN_MAPPING.get(code);
    }
    else {
        assetAddress = constants_1.ZERO_ADDRESS;
    }
    // create withdraw
    (0, helpers_1.createDeposit)(event, event.params.amount, assetAddress, constants_1.USDC_VAULT_ADDRESS);
    (0, metrics_1.updateUsageMetrics)(event, event.params.sender, constants_1.TransactionType.DEPOSIT);
    (0, metrics_1.updateFinancials)(event);
    let vaultId = constants_1.USDC_VAULT_ADDRESS + "-" + assetAddress;
    (0, metrics_1.updateVaultDailyMetrics)(event, vaultId);
    (0, metrics_1.updateVaultHourlyMetrics)(event, vaultId);
}
exports.handleUSDCDeposit = handleUSDCDeposit;
function handleUSDCWithdrawal(event) {
    // get address of asset
    let code = event.params.currencyCode.toHexString();
    let assetAddress;
    if (constants_1.TOKEN_MAPPING.has(code)) {
        assetAddress = constants_1.TOKEN_MAPPING.get(code);
    }
    else {
        assetAddress = constants_1.ZERO_ADDRESS;
    }
    // create withdraw
    let feeAmount = graph_ts_1.BigInt.fromString(event.params.amount
        .toBigDecimal()
        .times(event.params.withdrawalFeeRate
        .toBigDecimal()
        .div((0, utils_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS)))
        .truncate(0)
        .toString());
    (0, helpers_1.createWithdraw)(event, event.params.amount, feeAmount, assetAddress, constants_1.USDC_VAULT_ADDRESS);
    (0, metrics_1.updateUsageMetrics)(event, event.params.sender, constants_1.TransactionType.WITHDRAW);
    (0, metrics_1.updateFinancials)(event);
    let vaultId = constants_1.USDC_VAULT_ADDRESS + "-" + assetAddress;
    (0, metrics_1.updateVaultDailyMetrics)(event, vaultId);
    (0, metrics_1.updateVaultHourlyMetrics)(event, vaultId);
}
exports.handleUSDCWithdrawal = handleUSDCWithdrawal;
/////////////////////////////
//// Yield Pool Handlers ////
/////////////////////////////
function handleYieldDeposit(event) {
    // get address of asset
    let code = event.params.currencyCode.toHexString();
    let assetAddress;
    if (constants_1.TOKEN_MAPPING.has(code)) {
        assetAddress = constants_1.TOKEN_MAPPING.get(code);
    }
    else {
        assetAddress = constants_1.ZERO_ADDRESS;
    }
    (0, helpers_1.createDeposit)(event, event.params.amount, assetAddress, constants_1.YIELD_VAULT_ADDRESS);
    (0, metrics_1.updateUsageMetrics)(event, event.params.sender, constants_1.TransactionType.DEPOSIT);
    (0, metrics_1.updateFinancials)(event);
    let vaultId = constants_1.YIELD_VAULT_ADDRESS + "-" + assetAddress;
    (0, metrics_1.updateVaultDailyMetrics)(event, vaultId);
    (0, metrics_1.updateVaultHourlyMetrics)(event, vaultId);
}
exports.handleYieldDeposit = handleYieldDeposit;
function handleYieldWithdrawal(event) {
    // get address of asset
    let code = event.params.currencyCode.toHexString();
    let assetAddress;
    if (constants_1.TOKEN_MAPPING.has(code)) {
        assetAddress = constants_1.TOKEN_MAPPING.get(code);
    }
    else {
        assetAddress = constants_1.ZERO_ADDRESS;
    }
    (0, helpers_1.createWithdraw)(event, event.params.amount, event.params.amount.minus(event.params.amountTransferred), assetAddress, constants_1.YIELD_VAULT_ADDRESS);
    (0, metrics_1.updateUsageMetrics)(event, event.params.sender, constants_1.TransactionType.WITHDRAW);
    (0, metrics_1.updateFinancials)(event);
    let vaultId = constants_1.YIELD_VAULT_ADDRESS + "-" + assetAddress;
    (0, metrics_1.updateVaultDailyMetrics)(event, vaultId);
    (0, metrics_1.updateVaultHourlyMetrics)(event, vaultId);
}
exports.handleYieldWithdrawal = handleYieldWithdrawal;
///////////////////////////
//// DAI Pool Handlers ////
///////////////////////////
function handleDAIDeposit(event) {
    // get address of asset
    let code = event.params.currencyCode.toHexString();
    let assetAddress;
    if (constants_1.TOKEN_MAPPING.has(code)) {
        assetAddress = constants_1.TOKEN_MAPPING.get(code);
    }
    else {
        assetAddress = constants_1.ZERO_ADDRESS;
    }
    (0, helpers_1.createDeposit)(event, event.params.amount, assetAddress, constants_1.DAI_VAULT_ADDRESS);
    (0, metrics_1.updateUsageMetrics)(event, event.params.sender, constants_1.TransactionType.DEPOSIT);
    (0, metrics_1.updateFinancials)(event);
    let vaultId = constants_1.DAI_VAULT_ADDRESS + "-" + assetAddress;
    (0, metrics_1.updateVaultDailyMetrics)(event, vaultId);
    (0, metrics_1.updateVaultHourlyMetrics)(event, vaultId);
}
exports.handleDAIDeposit = handleDAIDeposit;
function handleDAIWithdrawal(event) {
    // get address of asset
    let code = event.params.currencyCode.toHexString();
    let assetAddress;
    if (constants_1.TOKEN_MAPPING.has(code)) {
        assetAddress = constants_1.TOKEN_MAPPING.get(code);
    }
    else {
        assetAddress = constants_1.ZERO_ADDRESS;
    }
    let feeAmount = graph_ts_1.BigInt.fromString(event.params.amount
        .toBigDecimal()
        .times(event.params.withdrawalFeeRate
        .toBigDecimal()
        .div((0, utils_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS)))
        .truncate(0)
        .toString());
    (0, helpers_1.createWithdraw)(event, event.params.amount, feeAmount, assetAddress, constants_1.DAI_VAULT_ADDRESS);
    (0, metrics_1.updateUsageMetrics)(event, event.params.sender, constants_1.TransactionType.WITHDRAW);
    (0, metrics_1.updateFinancials)(event);
    let vaultId = constants_1.DAI_VAULT_ADDRESS + "-" + assetAddress;
    (0, metrics_1.updateVaultDailyMetrics)(event, vaultId);
    (0, metrics_1.updateVaultHourlyMetrics)(event, vaultId);
}
exports.handleDAIWithdrawal = handleDAIWithdrawal;
/////////////////////////////
//// Ether Pool Handlers ////
/////////////////////////////
function handleEtherDeposit(event) {
    (0, helpers_1.createDeposit)(event, event.params.amount, constants_1.ETH_ADDRESS, // only token in this pool
    constants_1.ETHER_VAULT_ADDRESS);
    (0, metrics_1.updateUsageMetrics)(event, event.params.sender, constants_1.TransactionType.DEPOSIT);
    (0, metrics_1.updateFinancials)(event);
    let vaultId = constants_1.ETHER_VAULT_ADDRESS + "-" + constants_1.ETH_ADDRESS;
    (0, metrics_1.updateVaultDailyMetrics)(event, vaultId);
    (0, metrics_1.updateVaultHourlyMetrics)(event, vaultId);
}
exports.handleEtherDeposit = handleEtherDeposit;
function handleEtherWithdrawal(event) {
    (0, helpers_1.createWithdraw)(event, event.params.amount, constants_1.BIGINT_ZERO, constants_1.ETH_ADDRESS, constants_1.ETHER_VAULT_ADDRESS);
    (0, metrics_1.updateUsageMetrics)(event, event.params.sender, constants_1.TransactionType.WITHDRAW);
    (0, metrics_1.updateFinancials)(event);
    let vaultId = constants_1.ETHER_VAULT_ADDRESS + "-" + constants_1.ETH_ADDRESS;
    (0, metrics_1.updateVaultDailyMetrics)(event, vaultId);
    (0, metrics_1.updateVaultHourlyMetrics)(event, vaultId);
}
exports.handleEtherWithdrawal = handleEtherWithdrawal;
