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
exports.collectFees = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const initializers_1 = require("../common/initializers");
function collectFees(event, feeUsd) {
    const sdk = (0, initializers_1.initializeSDK)(event);
    const totalFee = utils.bigIntToBigDecimal(feeUsd, constants.PRICE_PRECISION_DECIMALS);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    pool.addRevenueUSD(totalFee.times(constants.PROTOCOL_SIDE_REVENUE_PERCENT), totalFee.times(constants.BIGDECIMAL_ONE.minus(constants.PROTOCOL_SIDE_REVENUE_PERCENT).minus(constants.STAKE_SIDE_REVENUE_PERCENT)), totalFee.times(constants.STAKE_SIDE_REVENUE_PERCENT));
}
exports.collectFees = collectFees;
