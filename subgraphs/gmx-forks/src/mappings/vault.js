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
exports.handleUpdateFundingRate = exports.handleSwap = exports.handleLiquidatePosition = exports.handleIncreasePosition = exports.handleDecreasePosition = exports.handleDecreasePoolAmount = exports.handleIncreasePoolAmount = exports.handleCollectSwapFees = exports.handleCollectMarginFees = exports.handleClosePosition = void 0;
const position_1 = require("../modules/position");
const swap_1 = require("../modules/swap");
const utils = __importStar(require("../common/utils"));
const fees_1 = require("../modules/fees");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants = __importStar(require("../common/constants"));
const amount_1 = require("../modules/amount");
const volume_1 = require("../modules/volume");
const enums_1 = require("../sdk/protocols/perpfutures/enums");
const initializers_1 = require("../common/initializers");
const schema_1 = require("../../generated/schema");
function handleClosePosition(event) {
    const sdk = (0, initializers_1.initializeSDK)(event);
    const realisedPnlUSD = utils.bigIntToBigDecimal(event.params.realisedPnl, constants.PRICE_PRECISION_DECIMALS);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    (0, position_1.updatePositionRealisedPnlUSD)(event.params.key, realisedPnlUSD, pool, sdk);
    if (event.params.realisedPnl < constants.BIGINT_ZERO) {
        (0, volume_1.increasePoolVolume)(pool, constants.BIGDECIMAL_ZERO, constants.NULL.TYPE_ADDRESS, constants.BIGINT_ZERO, enums_1.TransactionType.LIQUIDATE, constants.BIGINT_NEGONE.toBigDecimal().times(realisedPnlUSD), true, sdk);
    }
}
exports.handleClosePosition = handleClosePosition;
function handleCollectMarginFees(event) {
    (0, fees_1.collectFees)(event, event.params.feeUsd);
}
exports.handleCollectMarginFees = handleCollectMarginFees;
function handleCollectSwapFees(event) {
    (0, fees_1.collectFees)(event, event.params.feeUsd);
}
exports.handleCollectSwapFees = handleCollectSwapFees;
function handleIncreasePoolAmount(event) {
    (0, amount_1.updatePoolAmount)(event.params.amount, true, event.params.token, event);
}
exports.handleIncreasePoolAmount = handleIncreasePoolAmount;
function handleDecreasePoolAmount(event) {
    (0, amount_1.updatePoolAmount)(event.params.amount, false, event.params.token, event);
}
exports.handleDecreasePoolAmount = handleDecreasePoolAmount;
function handleDecreasePosition(event) {
    (0, position_1.updatePosition)(event, event.params.key, event.params.account, event.params.collateralToken, event.params.collateralDelta, event.params.indexToken, event.params.sizeDelta, event.params.price, event.params.fee, event.params.isLong, enums_1.TransactionType.COLLATERAL_OUT, constants.BIGINT_ZERO);
}
exports.handleDecreasePosition = handleDecreasePosition;
function handleIncreasePosition(event) {
    (0, position_1.updatePosition)(event, event.params.key, event.params.account, event.params.collateralToken, event.params.collateralDelta, event.params.indexToken, event.params.sizeDelta, event.params.price, event.params.fee, event.params.isLong, enums_1.TransactionType.COLLATERAL_IN, constants.BIGINT_ZERO);
}
exports.handleIncreasePosition = handleIncreasePosition;
function handleLiquidatePosition(event) {
    (0, position_1.updatePosition)(event, event.params.key, event.params.account, event.params.collateralToken, event.params.collateral, event.params.indexToken, event.params.size, event.params.markPrice, constants.BIGINT_ZERO, event.params.isLong, enums_1.TransactionType.LIQUIDATE, event.params.realisedPnl);
}
exports.handleLiquidatePosition = handleLiquidatePosition;
function handleSwap(event) {
    (0, swap_1.swap)(event, event.params.account, event.params.tokenIn, event.params.amountIn, event.params.tokenOut, event.params.amountOutAfterFees);
}
exports.handleSwap = handleSwap;
function handleUpdateFundingRate(event) {
    const tokenAddress = event.params.token;
    const fundingrate = event.params.fundingRate;
    const pool = schema_1.LiquidityPool.load(graph_ts_1.Bytes.fromHexString(constants.VAULT_ADDRESS.toHexString()));
    if (!pool)
        return;
    const inputTokens = pool.inputTokens;
    const fundingTokenIndex = inputTokens.indexOf(graph_ts_1.Bytes.fromHexString(tokenAddress.toHexString()));
    const fundingrates = pool.fundingrate;
    if (fundingTokenIndex >= 0) {
        fundingrates[fundingTokenIndex] = utils.bigIntToBigDecimal(fundingrate, constants.FUNDING_PRECISION_DECIMALS);
    }
    pool.fundingrate = fundingrates;
    pool.save();
}
exports.handleUpdateFundingRate = handleUpdateFundingRate;
