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
exports.handleLossReported = exports.handleEarningReported = void 0;
const utils = __importStar(require("../common/utils"));
const prices_1 = require("../prices");
const constants = __importStar(require("../common/constants"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
const Revenue_1 = require("../modules/Revenue");
const PoolAccountant_1 = require("../../generated/templates/PoolAccountant/PoolAccountant");
function handleEarningReported(event) {
    const poolAccountantAddress = event.address;
    const accountantContract = PoolAccountant_1.PoolAccountant.bind(poolAccountantAddress);
    const vaultAddress = utils.readValue(accountantContract.try_pool(), constants.NULL.TYPE_ADDRESS);
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    let inputTokenAddress = graph_ts_1.Address.fromString(vault.inputToken);
    let inputTokenPrice = (0, prices_1.getUsdPricePerToken)(inputTokenAddress);
    let inputTokenDecimals = utils.getTokenDecimals(inputTokenAddress);
    const supplySideRevenueUSD = event.params.profit
        .toBigDecimal()
        .div(inputTokenDecimals)
        .times(inputTokenPrice.usdPrice)
        .div(inputTokenPrice.decimalsBaseTen);
    (0, Revenue_1.updateRevenueSnapshots)(vault, supplySideRevenueUSD, constants.BIGDECIMAL_ZERO, event.block);
}
exports.handleEarningReported = handleEarningReported;
function handleLossReported(event) {
    const poolAccountantAddress = event.address;
    const accountantContract = PoolAccountant_1.PoolAccountant.bind(poolAccountantAddress);
    const vaultAddress = utils.readValue(accountantContract.try_pool(), constants.NULL.TYPE_ADDRESS);
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    let inputTokenAddress = graph_ts_1.Address.fromString(vault.inputToken);
    let inputTokenPrice = (0, prices_1.getUsdPricePerToken)(inputTokenAddress);
    let inputTokenDecimals = utils.getTokenDecimals(inputTokenAddress);
    const supplySideLossUSD = event.params.loss
        .toBigDecimal()
        .div(inputTokenDecimals)
        .times(inputTokenPrice.usdPrice)
        .div(inputTokenPrice.decimalsBaseTen)
        .times(constants.BIGDECIMAL_NEGATIVE_ONE);
    (0, Revenue_1.updateRevenueSnapshots)(vault, supplySideLossUSD, constants.BIGDECIMAL_ZERO, event.block);
}
exports.handleLossReported = handleLossReported;
