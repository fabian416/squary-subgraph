"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOutputToken = exports.OutputTokenValues = exports.updateTVL = exports.updateRevenues = exports.updateYieldFees = exports.createWithdraw = exports.createDeposit = void 0;
// helper functions for ./mappings.ts
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../common/utils/constants");
const schema_1 = require("../../generated/schema");
const getters_1 = require("../common/getters");
const utils_1 = require("../common/utils/utils");
const RariYieldFundManager_1 = require("../../generated/RariYieldFundManager/RariYieldFundManager");
const RariStableFundManager_1 = require("../../generated/RariUSDCFundManager/RariStableFundManager");
const RariEtherFundManager_1 = require("../../generated/RariEtherFundManager/RariEtherFundManager");
const prices_1 = require("../prices");
const ERC20_1 = require("../../generated/RariYieldFundManager/ERC20");
//////////////////////////////
//// Transaction Entities ////
//////////////////////////////
function createDeposit(event, amount, asset, vaultAddress) {
    // create id
    let hash = event.transaction.hash;
    let logIndex = event.transaction.index;
    let id = "deposit-" + hash.toHexString() + "-" + logIndex.toString();
    updateTVL(event); // also updates inputTokenBalance and prices
    // create Deposit
    let deposit = new schema_1.Deposit(id);
    // get (or create) asset
    let token = (0, getters_1.getOrCreateToken)(asset);
    let vault = (0, getters_1.getOrCreateVault)(event, vaultAddress, token.id);
    deposit.vault = vault.id;
    let customPrice = (0, prices_1.getUsdPricePerToken)(graph_ts_1.Address.fromString(asset));
    let assetPriceUSD = customPrice.usdPrice.div(customPrice.decimalsBaseTen);
    token.lastPriceUSD = assetPriceUSD;
    token.lastPriceBlockNumber = event.block.number;
    token.save();
    // fill in vars
    deposit.hash = hash.toHexString();
    deposit.logIndex = logIndex.toI32();
    deposit.protocol = constants_1.RARI_DEPLOYER;
    deposit.to = event.address.toHexString();
    deposit.from = event.transaction.from.toHexString();
    deposit.blockNumber = event.block.number;
    deposit.timestamp = event.block.timestamp;
    deposit.asset = token.id;
    deposit.amount = amount;
    deposit.amountUSD = amount
        .toBigDecimal()
        .div((0, utils_1.exponentToBigDecimal)(token.decimals))
        .times(assetPriceUSD);
    deposit.save();
    // get outputToken Supply/price
    let outputTokenInfo = updateOutputToken(vault, vaultAddress, event);
    vault.outputTokenSupply = outputTokenInfo.supply;
    vault.outputTokenPriceUSD = outputTokenInfo.priceUSD;
    vault.save();
    // update fees/revenues/token balances
    updateYieldFees(vaultAddress);
    updateRevenues(event, vault, constants_1.BIGDECIMAL_ZERO);
    // calculate pricePerShare
    // pricePerShare = (inputTokenBalance / outputTokenSupply)
    let decimals = token.decimals == -1 ? constants_1.DEFAULT_DECIMALS : token.decimals;
    vault.pricePerShare = vault.inputTokenBalance
        .toBigDecimal()
        .div((0, utils_1.exponentToBigDecimal)(decimals))
        .div(vault
        .outputTokenSupply.toBigDecimal()
        .div((0, utils_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS)));
    vault.save();
}
exports.createDeposit = createDeposit;
function createWithdraw(event, amount, feeAmount, // used to calculate withdrawal fee
asset, vaultAddress) {
    // create id
    let hash = event.transaction.hash;
    let logIndex = event.transaction.index;
    let id = "withdraw-" + hash.toHexString() + "-" + logIndex.toString();
    updateTVL(event); // also updates inputTokenBalance and prices
    // create Deposit
    let withdraw = new schema_1.Withdraw(id);
    // get (or create) token
    let token = (0, getters_1.getOrCreateToken)(asset);
    let vault = (0, getters_1.getOrCreateVault)(event, vaultAddress, token.id);
    withdraw.vault = vault.id;
    let customPrice = (0, prices_1.getUsdPricePerToken)(graph_ts_1.Address.fromString(asset));
    let assetPriceUSD = customPrice.usdPrice.div(customPrice.decimalsBaseTen);
    token.lastPriceUSD = assetPriceUSD;
    token.lastPriceBlockNumber = event.block.number;
    token.save();
    // populate vars,
    withdraw.hash = hash.toHexString();
    withdraw.logIndex = logIndex.toI32();
    withdraw.protocol = constants_1.RARI_DEPLOYER;
    withdraw.to = event.transaction.from.toHexString();
    withdraw.from = event.address.toHexString();
    withdraw.blockNumber = event.block.number;
    withdraw.timestamp = event.block.timestamp;
    withdraw.asset = token.id;
    withdraw.amount = amount;
    withdraw.amountUSD = amount
        .toBigDecimal()
        .div((0, utils_1.exponentToBigDecimal)(token.decimals))
        .times(assetPriceUSD);
    withdraw.save();
    // get outputToken Supply/price
    let outputTokenInfo = updateOutputToken(vault, vaultAddress, event);
    vault.outputTokenSupply = outputTokenInfo.supply;
    vault.outputTokenPriceUSD = outputTokenInfo.priceUSD;
    vault.save();
    // calculate withdrawal fee amount in USD
    let withdrawalFeeUSD = constants_1.BIGDECIMAL_ZERO;
    if (feeAmount.gt(constants_1.BIGINT_ZERO)) {
        withdrawalFeeUSD = feeAmount
            .toBigDecimal()
            .div((0, utils_1.exponentToBigDecimal)(token.decimals))
            .times(assetPriceUSD);
    }
    // update fees/revenues/token balances
    updateYieldFees(vaultAddress);
    updateRevenues(event, vault, withdrawalFeeUSD);
    // calculate pricePerShare
    let decimals = token.decimals == -1 ? constants_1.DEFAULT_DECIMALS : token.decimals;
    vault.pricePerShare = vault.inputTokenBalance
        .toBigDecimal()
        .div((0, utils_1.exponentToBigDecimal)(decimals))
        .div(vault
        .outputTokenSupply.toBigDecimal()
        .div((0, utils_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS)));
    vault.save();
}
exports.createWithdraw = createWithdraw;
/////////////////////////
//// Updates Helpers ////
/////////////////////////
// updates yield fees if necessary
function updateYieldFees(vaultAddress) {
    let perfFee = (0, getters_1.getOrCreateVaultFee)(constants_1.VaultFeeType.PERFORMANCE_FEE, vaultAddress);
    let tryWithdrawalFee;
    let tryPerfFee;
    if (vaultAddress == constants_1.YIELD_VAULT_ADDRESS) {
        // get fees
        let contract = RariYieldFundManager_1.RariYieldFundManager.bind(graph_ts_1.Address.fromString(constants_1.YIELD_VAULT_MANAGER_ADDRESS));
        let withdrawalFee = (0, getters_1.getOrCreateVaultFee)(constants_1.VaultFeeType.WITHDRAWAL_FEE, vaultAddress);
        tryWithdrawalFee = contract.try_getWithdrawalFeeRate();
        tryPerfFee = contract.try_getInterestFeeRate();
        if (!tryWithdrawalFee.reverted) {
            // only update fee if it was not reverted
            withdrawalFee.feePercentage = tryWithdrawalFee.value
                .toBigDecimal()
                .div((0, utils_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS - 2)); // this fee has mantissa factor 18 set on contract-level
            withdrawalFee.save();
        }
    }
    else if (vaultAddress == constants_1.USDC_VAULT_ADDRESS) {
        let contract = RariStableFundManager_1.RariStableFundManager.bind(graph_ts_1.Address.fromString(constants_1.USDC_VAULT_MANAGER_ADDRESS));
        tryPerfFee = contract.try_getInterestFeeRate();
    }
    else if (vaultAddress == constants_1.DAI_VAULT_ADDRESS) {
        let contract = RariStableFundManager_1.RariStableFundManager.bind(graph_ts_1.Address.fromString(constants_1.DAI_VAULT_MANAGER_ADDRESS));
        tryPerfFee = contract.try_getInterestFeeRate();
    }
    else {
        let contract = RariEtherFundManager_1.RariEtherFundManager.bind(graph_ts_1.Address.fromString(constants_1.ETHER_VAULT_MANAGER_ADDRESS));
        tryPerfFee = contract.try_getInterestFeeRate();
    }
    if (!tryPerfFee.reverted) {
        // only update fee if it was not reverted
        perfFee.feePercentage = tryPerfFee.value
            .toBigDecimal()
            .div((0, utils_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS - 2));
        perfFee.save();
    }
}
exports.updateYieldFees = updateYieldFees;
// updates revenues
// extraFees are withdrawal fees in Yield pool
function updateRevenues(event, vault, extraFee) {
    let financialMetrics = (0, getters_1.getOrCreateFinancials)(event);
    let protocol = (0, getters_1.getOrCreateYieldAggregator)();
    let vaultInterest = (0, getters_1.getOrCreateVaultInterest)(vault._vaultInterest, event.block.number);
    // setup revenues
    let newSupplyRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    let newProtooclRevenueUSD = extraFee;
    let newTotalRevenueUSD = extraFee;
    // get raw interest accrued based on vault address
    let tryTotalInterest;
    if (vault._vaultInterest == constants_1.YIELD_VAULT_ADDRESS) {
        let contract = RariYieldFundManager_1.RariYieldFundManager.bind(graph_ts_1.Address.fromString(constants_1.YIELD_VAULT_MANAGER_ADDRESS));
        tryTotalInterest = contract.try_getInterestFeesGenerated();
    }
    else if (vault._vaultInterest == constants_1.USDC_VAULT_ADDRESS) {
        let contract = RariStableFundManager_1.RariStableFundManager.bind(graph_ts_1.Address.fromString(constants_1.USDC_VAULT_MANAGER_ADDRESS));
        tryTotalInterest = contract.try_getInterestFeesGenerated();
    }
    else if (vault._vaultInterest == constants_1.DAI_VAULT_ADDRESS) {
        let contract = RariStableFundManager_1.RariStableFundManager.bind(graph_ts_1.Address.fromString(constants_1.DAI_VAULT_MANAGER_ADDRESS));
        tryTotalInterest = contract.try_getInterestFeesGenerated();
    }
    else {
        let contract = RariEtherFundManager_1.RariEtherFundManager.bind(graph_ts_1.Address.fromString(constants_1.ETHER_VAULT_MANAGER_ADDRESS));
        tryTotalInterest = contract.try_getInterestFeesGenerated();
    }
    if (!tryTotalInterest.reverted) {
        let prevInterest = vaultInterest.interestAccruedUSD;
        let updatedInterest = tryTotalInterest.value
            .toBigDecimal()
            .div((0, utils_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS));
        if (prevInterest.gt(updatedInterest)) {
            // do not calculate fees b/c old interest is greater than current
            // this means net deposits and interests are out of whack
            // ie, someone just deposited or withdrew a large amount of $$
            graph_ts_1.log.warning("updateRevenues() not updated because no new interest for vault {}", [vaultInterest.id]);
        }
        else {
            // set new interest in vaultInterest
            vaultInterest.interestAccruedUSD = updatedInterest;
            vaultInterest.lastBlockNumber = event.block.number;
            vaultInterest.save();
            let newTotalInterest = updatedInterest.minus(prevInterest);
            let performanceFee = (0, getters_1.getOrCreateVaultFee)(constants_1.VaultFeeType.PERFORMANCE_FEE, vault._vaultInterest).feePercentage.div((0, utils_1.exponentToBigDecimal)(constants_1.INT_TWO));
            let newFees = newTotalInterest.times(performanceFee);
            let newInterest = newTotalInterest.times(constants_1.BIGDECIMAL_ONE.minus(performanceFee));
            // calculate new interests
            newSupplyRevenueUSD = newSupplyRevenueUSD.plus(newInterest);
            newProtooclRevenueUSD = newProtooclRevenueUSD.plus(newFees);
            newTotalRevenueUSD = newTotalRevenueUSD.plus(newTotalInterest);
        }
    }
    // update vault revenues
    vault.cumulativeSupplySideRevenueUSD =
        vault.cumulativeSupplySideRevenueUSD.plus(newSupplyRevenueUSD);
    vault.cumulativeProtocolSideRevenueUSD =
        vault.cumulativeProtocolSideRevenueUSD.plus(newProtooclRevenueUSD);
    vault.cumulativeTotalRevenueUSD =
        vault.cumulativeTotalRevenueUSD.plus(newTotalRevenueUSD);
    // update total revenues
    protocol.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.plus(newSupplyRevenueUSD);
    protocol.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD.plus(newProtooclRevenueUSD);
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(newTotalRevenueUSD);
    // update financial revenues
    financialMetrics.dailySupplySideRevenueUSD =
        financialMetrics.dailySupplySideRevenueUSD.plus(newSupplyRevenueUSD);
    financialMetrics.dailyProtocolSideRevenueUSD =
        financialMetrics.dailyProtocolSideRevenueUSD.plus(newProtooclRevenueUSD);
    financialMetrics.dailyTotalRevenueUSD =
        financialMetrics.dailyTotalRevenueUSD.plus(newTotalRevenueUSD);
    // update daily snapshot revenues
    let dailySnapshot = (0, getters_1.getOrCreateVaultDailySnapshot)(event, vault.id);
    dailySnapshot.dailyProtocolSideRevenueUSD =
        dailySnapshot.dailyProtocolSideRevenueUSD.plus(newProtooclRevenueUSD);
    dailySnapshot.dailySupplySideRevenueUSD =
        dailySnapshot.dailySupplySideRevenueUSD.plus(newSupplyRevenueUSD);
    dailySnapshot.dailyTotalRevenueUSD =
        dailySnapshot.dailyTotalRevenueUSD.plus(newTotalRevenueUSD);
    dailySnapshot.save();
    // update hourly snapshot revenues
    let hourlySnapshot = (0, getters_1.getOrCreateVaultHourlySnapshot)(event, vault.id);
    hourlySnapshot.cumulativeProtocolSideRevenueUSD =
        hourlySnapshot.cumulativeProtocolSideRevenueUSD.plus(newProtooclRevenueUSD);
    hourlySnapshot.cumulativeSupplySideRevenueUSD =
        hourlySnapshot.cumulativeSupplySideRevenueUSD.plus(newSupplyRevenueUSD);
    hourlySnapshot.cumulativeTotalRevenueUSD =
        hourlySnapshot.cumulativeTotalRevenueUSD.plus(newTotalRevenueUSD);
    hourlySnapshot.save();
    vault.save();
    protocol.save();
    financialMetrics.save();
}
exports.updateRevenues = updateRevenues;
// as a side effect inputTokenBalance is updated
function updateTVL(event) {
    let protocol = (0, getters_1.getOrCreateYieldAggregator)();
    let totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    // loop through vaults and update each
    for (let i = 0; i < protocol._vaultList.length; i++) {
        let splitArr = protocol._vaultList[i].split("-", 2);
        let vaultAddress = splitArr[0];
        let tokenAddress = splitArr[1];
        let vault = (0, getters_1.getOrCreateVault)(event, vaultAddress, tokenAddress);
        let inputToken = (0, getters_1.getOrCreateToken)(vault.inputToken);
        // Get TVL from rari vaults on a per token basis
        // Rari vaults can have multiple inputTokens and can store multiple tokens
        // And the only way to get individual token balances is to use getRawFundBalance()
        // This function returns the amount with "unclaimed fees"
        // if...else to grab TVL for correct vault
        let tryTokenBalance;
        if (vaultAddress == constants_1.YIELD_VAULT_ADDRESS) {
            let contract = RariYieldFundManager_1.RariYieldFundManager.bind(graph_ts_1.Address.fromString(constants_1.YIELD_VAULT_MANAGER_ADDRESS));
            tryTokenBalance = contract.try_getRawFundBalance1(inputToken.symbol);
        }
        else if (vaultAddress == constants_1.USDC_VAULT_ADDRESS) {
            let contract = RariStableFundManager_1.RariStableFundManager.bind(graph_ts_1.Address.fromString(constants_1.USDC_VAULT_MANAGER_ADDRESS));
            tryTokenBalance = contract.try_getRawFundBalance1(inputToken.symbol);
        }
        else if (vaultAddress == constants_1.DAI_VAULT_ADDRESS) {
            let contract = RariStableFundManager_1.RariStableFundManager.bind(graph_ts_1.Address.fromString(constants_1.DAI_VAULT_MANAGER_ADDRESS));
            tryTokenBalance = contract.try_getRawFundBalance1(inputToken.symbol);
        }
        else {
            let contract = RariEtherFundManager_1.RariEtherFundManager.bind(graph_ts_1.Address.fromString(constants_1.ETHER_VAULT_MANAGER_ADDRESS));
            tryTokenBalance = contract.try_getRawFundBalance(); // in ETH
        }
        // update input token price
        let customPrice = (0, prices_1.getUsdPricePerToken)(graph_ts_1.Address.fromString(inputToken.id));
        inputToken.lastPriceUSD = customPrice.usdPrice.div(customPrice.decimalsBaseTen);
        inputToken.lastPriceBlockNumber = event.block.number;
        inputToken.save();
        vault.inputTokenBalance = tryTokenBalance.reverted
            ? vault.inputTokenBalance
            : tryTokenBalance.value;
        vault.totalValueLockedUSD = inputToken.lastPriceUSD.times(vault.inputTokenBalance
            .toBigDecimal()
            .div((0, utils_1.exponentToBigDecimal)(inputToken.decimals)));
        totalValueLockedUSD = totalValueLockedUSD.plus(vault.totalValueLockedUSD);
        vault.save();
    }
    protocol.totalValueLockedUSD = totalValueLockedUSD;
    protocol.save();
}
exports.updateTVL = updateTVL;
// custom class to pass output token values back to calling function
class OutputTokenValues {
    constructor(supply, priceUSD) {
        this.supply = supply;
        this.priceUSD = priceUSD;
    }
}
exports.OutputTokenValues = OutputTokenValues;
// returns output token price in USD
function updateOutputToken(vault, vaultContract, event) {
    // OutputTokenPrice = (TVL of all tokens in vault) / outputTokenSupply
    // Here: https://docs.rari.capital/yag/#usage
    // get and update outputTokenSupply
    let outputTokenContract = ERC20_1.ERC20.bind(graph_ts_1.Address.fromString(vault.outputToken));
    let tryTotalSupply = outputTokenContract.try_totalSupply();
    let outputTokenSupply = tryTotalSupply.reverted
        ? vault.outputTokenSupply
        : tryTotalSupply.value;
    // convert supply to BD
    let outputToken = (0, getters_1.getOrCreateToken)(vault.outputToken);
    let outputTokenSupplyBD = outputTokenSupply
        .toBigDecimal()
        .div((0, utils_1.exponentToBigDecimal)(outputToken.decimals));
    // set outputToken values to each vault / add up TVLs
    let totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    let protocol = (0, getters_1.getOrCreateYieldAggregator)();
    for (let i = 0; i < protocol._vaultList.length; i++) {
        let splitArr = protocol._vaultList[i].split("-", 2);
        let vaultAddress = splitArr[0];
        let tokenAddress = splitArr[1];
        if (vaultAddress.toLowerCase() == vaultContract.toLowerCase()) {
            let _vault = (0, getters_1.getOrCreateVault)(event, vaultAddress, tokenAddress);
            _vault.outputTokenSupply = outputTokenSupply;
            totalValueLockedUSD = totalValueLockedUSD.plus(_vault.totalValueLockedUSD);
            _vault.save();
        }
    }
    // calculate outputTokenPrice = TVL / outputTokenSupplyBD
    let outputTokenPriceUSD = outputTokenSupplyBD.equals(constants_1.BIGDECIMAL_ZERO)
        ? constants_1.BIGDECIMAL_ZERO
        : totalValueLockedUSD.div(outputTokenSupplyBD);
    // set outputTokenPrice
    for (let i = 0; i < protocol._vaultList.length; i++) {
        let splitArr = protocol._vaultList[i].split("-", 2);
        let vaultAddress = splitArr[0];
        let tokenAddress = splitArr[1];
        if (vaultAddress.toLowerCase() == vaultContract.toLowerCase()) {
            let _vault = (0, getters_1.getOrCreateVault)(event, vaultAddress, tokenAddress);
            _vault.outputTokenPriceUSD = outputTokenPriceUSD;
            _vault.save();
        }
    }
    let output = new OutputTokenValues(outputTokenSupply, outputTokenPriceUSD);
    return output;
}
exports.updateOutputToken = updateOutputToken;
