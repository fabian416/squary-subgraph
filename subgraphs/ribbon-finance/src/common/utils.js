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
exports.bigIntToBigDecimal = exports.getOutputTokenSupply = exports.getOutputTokenPriceUSD = exports.getVaultPricePerShare = exports.updateProtocolTotalValueLockedUSD = exports.updateProtocolAfterNewVault = exports.getVaultBalance = exports.readValue = exports.enumToPrefix = exports.equalsIgnoreCase = void 0;
const initializers_1 = require("./initializers");
const constants = __importStar(require("./constants"));
const schema_1 = require("../../generated/schema");
const RibbonThetaVaultWithSwap_1 = require("../../generated/templates/LiquidityGauge/RibbonThetaVaultWithSwap");
function equalsIgnoreCase(a, b) {
    return a.replace("-", "_").toLowerCase() == b.replace("-", "_").toLowerCase();
}
exports.equalsIgnoreCase = equalsIgnoreCase;
function enumToPrefix(snake) {
    return snake.toLowerCase().replace("_", "-") + "-";
}
exports.enumToPrefix = enumToPrefix;
function readValue(callResult, defaultValue) {
    return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
function getVaultBalance(vaultAddress, decimals) {
    const vaultContract = RibbonThetaVaultWithSwap_1.RibbonThetaVaultWithSwap.bind(vaultAddress);
    const vaultBalance = bigIntToBigDecimal(readValue(vaultContract.try_totalBalance(), constants.BIGINT_ZERO), decimals);
    return vaultBalance;
}
exports.getVaultBalance = getVaultBalance;
function updateProtocolAfterNewVault(vaultAddress) {
    const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
    const vaultIds = protocol._vaultIds;
    vaultIds.push(vaultAddress.toHexString());
    protocol._vaultIds = vaultIds;
    protocol.totalPoolCount += 1;
    protocol.save();
}
exports.updateProtocolAfterNewVault = updateProtocolAfterNewVault;
function updateProtocolTotalValueLockedUSD() {
    const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
    const vaultIds = protocol._vaultIds;
    let totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    for (let vaultIdx = 0; vaultIdx < vaultIds.length; vaultIdx++) {
        const vault = schema_1.Vault.load(vaultIds[vaultIdx]);
        if (!vault)
            continue;
        totalValueLockedUSD = totalValueLockedUSD.plus(vault.totalValueLockedUSD);
    }
    protocol.totalValueLockedUSD = totalValueLockedUSD;
    protocol.save();
}
exports.updateProtocolTotalValueLockedUSD = updateProtocolTotalValueLockedUSD;
function getVaultPricePerShare(vaultAddress) {
    const vaultContract = RibbonThetaVaultWithSwap_1.RibbonThetaVaultWithSwap.bind(vaultAddress);
    const vaultDecimals = readValue(vaultContract.try_decimals(), 18);
    const vaultPricePerShare = readValue(vaultContract.try_pricePerShare(), constants.BIGINT_ZERO).toBigDecimal();
    if (vaultPricePerShare.notEqual(constants.BIGDECIMAL_ZERO))
        return vaultPricePerShare;
    const totalTokensDeposits = bigIntToBigDecimal(readValue(vaultContract.try_totalBalance(), constants.BIGINT_ZERO), vaultDecimals);
    const totalSupply = bigIntToBigDecimal(readValue(vaultContract.try_totalSupply(), constants.BIGINT_ZERO), vaultDecimals);
    const pricePerShare = totalTokensDeposits
        .times(constants.BIGINT_TEN.pow(vaultDecimals).toBigDecimal())
        .div(totalSupply);
    return pricePerShare;
}
exports.getVaultPricePerShare = getVaultPricePerShare;
function getOutputTokenPriceUSD(vaultAddress, block) {
    const vaultContract = RibbonThetaVaultWithSwap_1.RibbonThetaVaultWithSwap.bind(vaultAddress);
    const vaultDecimals = readValue(vaultContract.try_decimals(), 18);
    let asset = readValue(vaultContract.try_asset(), constants.NULL.TYPE_ADDRESS);
    if (asset.equals(constants.NULL.TYPE_ADDRESS)) {
        const vaultParams = vaultContract.try_vaultParams();
        if (!vaultParams.reverted) {
            asset = vaultParams.value.getAsset();
        }
        if (asset.equals(constants.NULL.TYPE_ADDRESS)) {
            const vaultParamsEarnVault = vaultContract.try_vaultParams1();
            if (!vaultParamsEarnVault.reverted) {
                asset = vaultParamsEarnVault.value.getAsset();
            }
        }
    }
    const inputToken = (0, initializers_1.getOrCreateToken)(asset, block, vaultAddress);
    const vaultTotalBalance = bigIntToBigDecimal(readValue(vaultContract.try_totalBalance(), constants.BIGINT_ZERO), vaultDecimals);
    const vaultTVL = vaultTotalBalance.times(inputToken.lastPriceUSD);
    const vaultTotalSupply = bigIntToBigDecimal(readValue(vaultContract.try_totalSupply(), constants.BIGINT_ZERO), vaultDecimals);
    if (vaultTotalSupply.equals(constants.BIGDECIMAL_ZERO))
        return constants.BIGDECIMAL_ZERO;
    const outputTokenPriceUSD = vaultTVL.div(vaultTotalSupply);
    return outputTokenPriceUSD;
}
exports.getOutputTokenPriceUSD = getOutputTokenPriceUSD;
function getOutputTokenSupply(vaultAddress, block) {
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, block);
    if (!vault.outputToken)
        return constants.BIGINT_ZERO;
    const vaultContract = RibbonThetaVaultWithSwap_1.RibbonThetaVaultWithSwap.bind(vaultAddress);
    const outputTokenSupply = readValue(vaultContract.try_totalSupply(), constants.BIGINT_ZERO);
    return outputTokenSupply;
}
exports.getOutputTokenSupply = getOutputTokenSupply;
function bigIntToBigDecimal(bigInt, decimals) {
    return bigInt.divDecimal(constants.BIGINT_TEN.pow(decimals).toBigDecimal());
}
exports.bigIntToBigDecimal = bigIntToBigDecimal;
