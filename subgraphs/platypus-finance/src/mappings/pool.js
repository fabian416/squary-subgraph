"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRetentionRatioAndHaircutRate = exports.handleAssetAdded = exports.handleSwap = exports.handleWithdraw = exports.handleDeposit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Pool_1 = require("../../generated/Pool/Pool");
const constants_1 = require("../common/constants");
const getters_1 = require("../common/getters");
const metrics_1 = require("../common/metrics");
const helpers_1 = require("./helpers");
function handleDeposit(event) {
    const assetAddress = (0, getters_1.getAssetAddressForPoolToken)(event, event.address, event.params.token);
    if (assetAddress.equals(constants_1.ZERO_ADDRESS)) {
        graph_ts_1.log.error("[{}][AssetNotFound] Asset {} not found in Pool {} for token {}", [
            event.transaction.hash.toHexString(),
            assetAddress.toHexString(),
            event.address.toHexString(),
            event.params.token.toHexString(),
        ]);
        return;
    }
    (0, helpers_1.createDeposit)(event, event.params.amount, event.params.token, assetAddress, event.params.liquidity, event.params.to, event.params.sender);
    (0, metrics_1.updateFinancials)(event);
    (0, metrics_1.updateUsageMetrics)(event, event.params.sender, constants_1.TransactionType.DEPOSIT);
    (0, metrics_1.updatePoolMetrics)(event, assetAddress, event.params.token);
}
exports.handleDeposit = handleDeposit;
function handleWithdraw(event) {
    const assetAddress = (0, getters_1.getAssetAddressForPoolToken)(event, event.address, event.params.token);
    if (assetAddress.equals(constants_1.ZERO_ADDRESS)) {
        graph_ts_1.log.error("[{}][AssetNotFound] Asset {} not found in Pool {} for token {}", [
            event.transaction.hash.toHexString(),
            assetAddress.toHexString(),
            event.address.toHexString(),
            event.params.token.toHexString(),
        ]);
        return;
    }
    (0, helpers_1.createWithdraw)(event, event.params.amount, event.params.token, assetAddress, event.params.liquidity, event.params.to, event.params.sender);
    (0, metrics_1.updateFinancials)(event);
    (0, metrics_1.updateUsageMetrics)(event, event.params.sender, constants_1.TransactionType.WITHDRAW);
    (0, metrics_1.updatePoolMetrics)(event, assetAddress, event.params.token);
}
exports.handleWithdraw = handleWithdraw;
function handleSwap(event) {
    const fromAssetAddress = (0, getters_1.getAssetAddressForPoolToken)(event, event.address, event.params.fromToken);
    if (fromAssetAddress.equals(constants_1.ZERO_ADDRESS)) {
        graph_ts_1.log.error("[{}][AssetNotFound] Asset {} not found in Pool {} for token {}", [
            event.transaction.hash.toHexString(),
            fromAssetAddress.toHexString(),
            event.address.toHexString(),
            event.params.fromToken.toHexString(),
        ]);
        return;
    }
    const toAssetAddress = (0, getters_1.getAssetAddressForPoolToken)(event, event.address, event.params.toToken);
    if (toAssetAddress.equals(constants_1.ZERO_ADDRESS)) {
        graph_ts_1.log.error("[{}][AssetNotFound] Asset {} not found in Pool {} for token {}", [
            event.transaction.hash.toHexString(),
            toAssetAddress.toHexString(),
            event.address.toHexString(),
            event.params.toToken.toHexString(),
        ]);
        return;
    }
    fetchRetentionRatioAndHaircutRate(event, event.address);
    (0, metrics_1.updateMetricsAfterSwap)(event, event.address, fromAssetAddress, toAssetAddress, event.params.fromToken, event.params.toToken, event.params.fromAmount, event.params.toAmount, event.params.sender, event.params.to);
    (0, metrics_1.updateUsageMetrics)(event, event.params.sender, constants_1.TransactionType.SWAP);
}
exports.handleSwap = handleSwap;
function handleAssetAdded(event) {
    (0, helpers_1.createAsset)(event, event.address, event.params.token, event.params.asset);
    (0, metrics_1.updateProtocolTVL)(event, event.params.asset);
}
exports.handleAssetAdded = handleAssetAdded;
function fetchRetentionRatioAndHaircutRate(event, poolAddress) {
    // Get LiquidtiyPoolParamsHelper
    const liquidityPoolParams = (0, getters_1.getOrCreateLiquidityPoolParamsHelper)(event, poolAddress);
    if (liquidityPoolParams.updateBlockNumber.lt(event.block.number)) {
        const PoolContract = Pool_1.Pool.bind(poolAddress);
        const retentionRatio_call = PoolContract.try_getRetentionRatio();
        if (retentionRatio_call.reverted) {
            graph_ts_1.log.error("[Fetch Retention Ratio]Error fetching Retention Ration for address: {}", [poolAddress.toHexString()]);
        }
        // Update LiquidityPoolParamsHelper
        liquidityPoolParams.RetentionRatio = retentionRatio_call.value.toBigDecimal();
        const haircutRate_call = PoolContract.try_getHaircutRate();
        if (haircutRate_call.reverted) {
            graph_ts_1.log.error("[Fetch Haircut Rate]Error fetching Haircut Rate for address: {}", [poolAddress.toHexString()]);
        }
        // Update LiquidityPoolParamsHelper
        liquidityPoolParams.HaircutRate = haircutRate_call.value.toBigDecimal();
        liquidityPoolParams.updateBlockNumber = event.block.number;
        liquidityPoolParams.save();
    }
}
exports.fetchRetentionRatioAndHaircutRate = fetchRetentionRatioAndHaircutRate;
