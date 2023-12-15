"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProtocolFee = exports.getSupplySideFee = exports.createOrUpdateAllFees = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const strings_1 = require("../utils/strings");
function createOrUpdateFee(address, feeType, feePercentage) {
    const id = (0, strings_1.prefixID)(feeType, address.toHexString());
    let fee = schema_1.LiquidityPoolFee.load(id);
    if (!fee) {
        fee = new schema_1.LiquidityPoolFee(id);
        fee.feeType = feeType;
    }
    fee.feePercentage = feePercentage;
    fee.save();
    return fee;
}
function createOrUpdateAllFees(address, totalFee, adminFee) {
    // -2 to get percentage value, e.g 0.5 = 50%
    const tradingFeePercent = (0, numbers_1.bigIntToBigDecimal)(totalFee, constants_1.FEE_PRECISION - constants_1.INT_TWO);
    const tradingFee = createOrUpdateFee(address, constants_1.LiquidityPoolFeeType.FIXED_TRADING_FEE, tradingFeePercent);
    const protocolFeePercent = (0, numbers_1.bigIntToBigDecimal)(adminFee, constants_1.FEE_PRECISION).times(tradingFeePercent);
    const protocolFee = createOrUpdateFee(address, constants_1.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE, protocolFeePercent);
    const lpFeePercentage = tradingFeePercent.minus(protocolFeePercent);
    const lpFee = createOrUpdateFee(address, constants_1.LiquidityPoolFeeType.FIXED_LP_FEE, lpFeePercentage);
    return [tradingFee.id, protocolFee.id, lpFee.id];
}
exports.createOrUpdateAllFees = createOrUpdateAllFees;
function getSupplySideFee(address) {
    const id = (0, strings_1.prefixID)(constants_1.LiquidityPoolFeeType.FIXED_LP_FEE, address);
    const fee = schema_1.LiquidityPoolFee.load(id);
    return fee.feePercentage.div(constants_1.BIGDECIMAL_HUNDRED);
}
exports.getSupplySideFee = getSupplySideFee;
function getProtocolFee(address) {
    const id = (0, strings_1.prefixID)(constants_1.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE, address);
    const fee = schema_1.LiquidityPoolFee.load(id);
    return fee.feePercentage.div(constants_1.BIGDECIMAL_HUNDRED);
}
exports.getProtocolFee = getProtocolFee;
