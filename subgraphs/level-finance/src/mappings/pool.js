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
exports.handleSwapWithPrices = exports.handleSwap = exports.handleLiquidityRemoved = exports.handleLiquidityAdded = exports.handleTokenWhitelisted = exports.handleTokenDelisted = exports.handlePositionLiquidatedWithoutSignedPnl = exports.handlePositionLiquidated = exports.handlePositionDecreasedWithoutSignedPnl = exports.handlePositionDecreased = exports.handlePositionIncreased = void 0;
const swap_1 = require("../modules/swap");
const fee_1 = require("../modules/fee");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants = __importStar(require("../common/constants"));
const position_1 = require("../modules/position");
const transaction_1 = require("../modules/transaction");
const enums_1 = require("../sdk/protocols/perpfutures/enums");
const initializers_1 = require("../common/initializers");
function handlePositionIncreased(event) {
    const accountAddress = event.params.account;
    const collateralTokenAddress = event.params.collateralToken;
    const collateralValue = event.params.collateralValue;
    const feeValue = event.params.feeValue;
    const indexPrice = event.params.indexPrice;
    const indexTokenAddress = event.params.indexToken;
    const key = event.params.key;
    const side = event.params.side;
    const sizeChange = event.params.sizeChanged;
    const sdk = (0, initializers_1.initializeSDK)(event);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    (0, position_1.updatePosition)(event, key, accountAddress, collateralTokenAddress, collateralValue, constants.IS_COLLATERAL_IN_USD, indexTokenAddress, sizeChange, indexPrice, feeValue, side == constants.Side.LONG, enums_1.TransactionType.COLLATERAL_IN, constants.BIGINT_ZERO, sdk, pool);
    (0, fee_1.collectFees)(feeValue, indexTokenAddress, sdk, pool, true);
    //fee in usd
}
exports.handlePositionIncreased = handlePositionIncreased;
function handlePositionDecreased(event) {
    const accountAddress = event.params.account;
    const collateralTokenAddress = event.params.collateralToken;
    const collateralValue = event.params.collateralChanged;
    const feeValue = event.params.feeValue;
    const indexPrice = event.params.indexPrice;
    const indexTokenAddress = event.params.indexToken;
    const key = event.params.key;
    const side = event.params.side;
    const sizeChange = event.params.sizeChanged;
    const pnl = event.params.pnl.abs.times(event.params.pnl.sig.equals(constants.BIGINT_ZERO)
        ? constants.BIGINT_NEGONE
        : constants.BIGINT_ONE);
    const sdk = (0, initializers_1.initializeSDK)(event);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    (0, position_1.updatePosition)(event, key, accountAddress, collateralTokenAddress, collateralValue, true, indexTokenAddress, sizeChange, indexPrice, feeValue, side == constants.Side.LONG, enums_1.TransactionType.COLLATERAL_OUT, pnl, sdk, pool);
    (0, fee_1.collectFees)(feeValue, indexTokenAddress, sdk, pool, true);
    //fee in usd
}
exports.handlePositionDecreased = handlePositionDecreased;
function handlePositionDecreasedWithoutSignedPnl(event) {
    const accountAddress = event.params.account;
    const collateralTokenAddress = event.params.collateralToken;
    const collateralValue = event.params.collateralChanged;
    const feeValue = event.params.feeValue;
    const indexPrice = event.params.indexPrice;
    const indexTokenAddress = event.params.indexToken;
    const key = event.params.key;
    const side = event.params.side;
    const sizeChange = event.params.sizeChanged;
    const pnl = event.params.pnl;
    const sdk = (0, initializers_1.initializeSDK)(event);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    (0, position_1.updatePosition)(event, key, accountAddress, collateralTokenAddress, collateralValue, true, indexTokenAddress, sizeChange, indexPrice, feeValue, side == constants.Side.LONG, enums_1.TransactionType.COLLATERAL_OUT, pnl, sdk, pool);
    (0, fee_1.collectFees)(feeValue, indexTokenAddress, sdk, pool, true);
    //fee in usd
}
exports.handlePositionDecreasedWithoutSignedPnl = handlePositionDecreasedWithoutSignedPnl;
function handlePositionLiquidated(event) {
    const accountAddress = event.params.account;
    const collateralTokenAddress = event.params.collateralToken;
    const collateralValue = event.params.collateralValue;
    const feeValue = event.params.feeValue;
    const indexPrice = event.params.indexPrice;
    const indexTokenAddress = event.params.indexToken;
    const key = event.params.key;
    const side = event.params.side;
    const sizeChange = event.params.size;
    const realisedPnl = event.params.pnl.abs.times(event.params.pnl.sig.equals(constants.BIGINT_ZERO)
        ? constants.BIGINT_NEGONE
        : constants.BIGINT_ONE);
    const sdk = (0, initializers_1.initializeSDK)(event);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    (0, position_1.updatePosition)(event, key, accountAddress, collateralTokenAddress, collateralValue, true, indexTokenAddress, sizeChange, indexPrice, feeValue, side == constants.Side.LONG, enums_1.TransactionType.LIQUIDATE, realisedPnl, sdk, pool);
    (0, fee_1.collectFees)(feeValue, indexTokenAddress, sdk, pool, true);
    //fee in usd
}
exports.handlePositionLiquidated = handlePositionLiquidated;
function handlePositionLiquidatedWithoutSignedPnl(event) {
    const accountAddress = event.params.account;
    const collateralTokenAddress = event.params.collateralToken;
    const collateralValue = event.params.collateralValue;
    const feeValue = event.params.feeValue;
    const indexPrice = event.params.indexPrice;
    const indexTokenAddress = event.params.indexToken;
    const key = event.params.key;
    const side = event.params.side;
    const sizeChange = event.params.size;
    const realisedPnl = event.params.pnl;
    const sdk = (0, initializers_1.initializeSDK)(event);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    (0, position_1.updatePosition)(event, key, accountAddress, collateralTokenAddress, collateralValue, true, indexTokenAddress, sizeChange, indexPrice, feeValue, side == constants.Side.LONG, enums_1.TransactionType.LIQUIDATE, realisedPnl, sdk, pool);
    (0, fee_1.collectFees)(feeValue, indexTokenAddress, sdk, pool, true);
    //fee in usd
}
exports.handlePositionLiquidatedWithoutSignedPnl = handlePositionLiquidatedWithoutSignedPnl;
function handleTokenDelisted(event) {
    const tokenAddress = event.params.token;
    const sdk = (0, initializers_1.initializeSDK)(event);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    const token = sdk.Tokens.getOrCreateToken(tokenAddress);
    token._isWhitelisted = false;
    token.save();
    const inputTokens = pool.getInputTokens();
    const idx = inputTokens.indexOf(graph_ts_1.Bytes.fromHexString(tokenAddress.toHexString()));
    const inputTokenBalances = pool.pool.inputTokenBalances;
    inputTokenBalances[idx] = constants.BIGINT_ZERO;
    pool.setInputTokenBalances(inputTokenBalances);
}
exports.handleTokenDelisted = handleTokenDelisted;
function handleTokenWhitelisted(event) {
    const tokenAddress = event.params.token;
    const sdk = (0, initializers_1.initializeSDK)(event);
    const token = sdk.Tokens.getOrCreateToken(tokenAddress);
    token._isWhitelisted = true;
    token.save();
}
exports.handleTokenWhitelisted = handleTokenWhitelisted;
function handleLiquidityAdded(event) {
    const amount = event.params.amount;
    const fee = event.params.fee;
    const lpAmount = event.params.lpAmount;
    const senderAddress = event.params.sender;
    const tokenAddress = event.params.token;
    const tranche = event.params.tranche;
    const sdk = (0, initializers_1.initializeSDK)(event);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    (0, transaction_1.transaction)(senderAddress, tokenAddress, tranche, lpAmount, enums_1.TransactionType.DEPOSIT, sdk, pool, amount);
    //fee in token in 18 decimals
    (0, fee_1.collectFees)(fee, tokenAddress, sdk, pool);
}
exports.handleLiquidityAdded = handleLiquidityAdded;
function handleLiquidityRemoved(event) {
    const amount = event.params.amountOut;
    const fee = event.params.fee;
    const lpAmount = event.params.lpAmount;
    const senderAddress = event.params.sender;
    const tokenAddress = event.params.token;
    const tranche = event.params.tranche;
    const sdk = (0, initializers_1.initializeSDK)(event);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    (0, transaction_1.transaction)(senderAddress, tokenAddress, tranche, lpAmount, enums_1.TransactionType.WITHDRAW, sdk, pool, amount);
    //fee in token in 18 decimals
    (0, fee_1.collectFees)(fee, tokenAddress, sdk, pool);
}
exports.handleLiquidityRemoved = handleLiquidityRemoved;
function handleSwap(event) {
    const amountIn = event.params.amountIn;
    const amountOut = event.params.amountOut;
    const tokenInAddress = event.params.tokenIn;
    const tokenOutAddress = event.params.tokenOut;
    const accountAddress = event.params.sender;
    const fee = event.params.fee;
    const sdk = (0, initializers_1.initializeSDK)(event);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    (0, swap_1.swap)(accountAddress, tokenInAddress, amountIn, tokenOutAddress, amountOut, sdk, pool);
    //fee is in 18 decimals in amount in price
    (0, fee_1.collectFees)(fee, tokenInAddress, sdk, pool);
}
exports.handleSwap = handleSwap;
function handleSwapWithPrices(event) {
    const amountIn = event.params.amountIn;
    const amountOut = event.params.amountOut;
    const tokenInAddress = event.params.tokenIn;
    const tokenOutAddress = event.params.tokenOut;
    const accountAddress = event.params.sender;
    const fee = event.params.fee;
    const sdk = (0, initializers_1.initializeSDK)(event);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    (0, swap_1.swap)(accountAddress, tokenInAddress, amountIn, tokenOutAddress, amountOut, sdk, pool);
    //fee is in 18 decimals in amount in price
    (0, fee_1.collectFees)(fee, tokenInAddress, sdk, pool);
}
exports.handleSwapWithPrices = handleSwapWithPrices;
