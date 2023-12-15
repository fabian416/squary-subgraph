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
exports.updateProtocolTotalValueLockedUSD = exports.updateProtocolAfterNewVault = exports.createFeeType = exports.getTokenDecimals = exports.readValue = exports.prefixID = exports.enumToPrefix = void 0;
const constants = __importStar(require("../common/constants"));
const schema_1 = require("../../generated/schema");
const initializers_1 = require("./initializers");
const schema_2 = require("../../generated/schema");
const ERC20_1 = require("../../generated/Registry_v1/ERC20");
function enumToPrefix(snake) {
    return snake.toLowerCase().replace("_", "-") + "-";
}
exports.enumToPrefix = enumToPrefix;
function prefixID(enumString, ID) {
    return enumToPrefix(enumString) + ID;
}
exports.prefixID = prefixID;
function readValue(callResult, defaultValue) {
    return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
function getTokenDecimals(tokenAddr) {
    const token = ERC20_1.ERC20.bind(tokenAddr);
    const decimals = readValue(token.try_decimals(), constants.DEFAULT_DECIMALS);
    return constants.BIGINT_TEN.pow(decimals.toI32()).toBigDecimal();
}
exports.getTokenDecimals = getTokenDecimals;
function createFeeType(feeId, feeType, feePercentage) {
    const fees = new schema_1.VaultFee(feeId);
    fees.feeType = feeType;
    fees.feePercentage = feePercentage
        .toBigDecimal()
        .div(constants.BIGDECIMAL_HUNDRED);
    fees.save();
}
exports.createFeeType = createFeeType;
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
        const vault = schema_2.Vault.load(vaultIds[vaultIdx]);
        if (!vault)
            continue;
        totalValueLockedUSD = totalValueLockedUSD.plus(vault.totalValueLockedUSD);
    }
    protocol.totalValueLockedUSD = totalValueLockedUSD;
    protocol.save();
}
exports.updateProtocolTotalValueLockedUSD = updateProtocolTotalValueLockedUSD;
