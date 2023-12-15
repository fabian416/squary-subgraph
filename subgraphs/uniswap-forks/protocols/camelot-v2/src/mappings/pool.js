"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSetStableSwap = exports.handleFeePercentUpdated = exports.handleSwap = exports.handleBurn = exports.handleMint = exports.handleSync = exports.handleTransfer = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../src/common/constants");
const updateMetrics_1 = require("../../../../src/common/updateMetrics");
const utils_1 = require("../../../../src/common/utils/utils");
const pool_1 = require("../../../../src/mappings/pool");
const creators_1 = require("../../src/common/creators");
const constants_2 = require("../common/constants");
const creators_2 = require("../common/creators");
const schema_1 = require("../../../../generated/schema");
// Handle transfers event.
// The transfers are either occur as a part of the Mint or Burn event process.
// The tokens being transferred in these events are the LP tokens from the liquidity pool that emitted this event.
function handleTransfer(event) {
    (0, pool_1.handleTransfer)(event);
}
exports.handleTransfer = handleTransfer;
// Handle Sync event.
// Emitted after every Swap, Mint, and Burn event.
// Gives information about the rebalancing of tokens used to update tvl, balances, and token pricing
function handleSync(event) {
    (0, pool_1.handleSync)(event);
}
exports.handleSync = handleSync;
// Handle a mint event emitted from a pool contract. Considered a deposit into the given liquidity pool.
function handleMint(event) {
    (0, pool_1.handleMint)(event);
}
exports.handleMint = handleMint;
// Handle a burn event emitted from a pool contract. Considered a withdraw into the given liquidity pool.
function handleBurn(event) {
    (0, pool_1.handleBurn)(event);
}
exports.handleBurn = handleBurn;
// Handle a swap event emitted from a pool contract.
function handleSwap(event) {
    (0, creators_2.createSwapHandleVolumeAndFees)(event, event.params.to.toHexString(), event.params.sender.toHexString(), event.params.amount0In, event.params.amount1In, event.params.amount0Out, event.params.amount1Out);
    (0, updateMetrics_1.updateFinancials)(event);
    (0, updateMetrics_1.updatePoolMetrics)(event);
    (0, updateMetrics_1.updateUsageMetrics)(event, event.transaction.from, constants_1.UsageType.SWAP);
}
exports.handleSwap = handleSwap;
function handleFeePercentUpdated(event) {
    const token0TradeFee = (0, utils_1.convertTokenToDecimal)(graph_ts_1.BigInt.fromI32(event.params.token0FeePercent), constants_2.INT_THREE);
    const token1TradeFee = (0, utils_1.convertTokenToDecimal)(graph_ts_1.BigInt.fromI32(event.params.token0FeePercent), constants_2.INT_THREE);
    (0, creators_1.createPoolFees)(event.address.toHexString(), token0TradeFee, token1TradeFee);
}
exports.handleFeePercentUpdated = handleFeePercentUpdated;
function handleSetStableSwap(event) {
    const helperStore = new schema_1._HelperStore(event.address.toHexString());
    if (event.params.stableSwap) {
        helperStore.valueString = constants_2.PairType.STABLE;
    }
    else {
        helperStore.valueString = constants_2.PairType.VOLATILE;
    }
    helperStore.save();
}
exports.handleSetStableSwap = handleSetStableSwap;
