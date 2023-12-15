"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSwap = exports.handleBurn = exports.handleMint = exports.handleSync = exports.handleTransfer = void 0;
const creators_1 = require("../common/creators");
const handlers_1 = require("../common/handlers");
const updateMetrics_1 = require("../common/updateMetrics");
const constants_1 = require("../common/constants");
const getters_1 = require("../common/getters");
// Handle transfers event.
// The transfers are either occur as a part of the Mint or Burn event process.
// The tokens being transferred in these events are the LP tokens from the liquidity pool that emitted this event.
function handleTransfer(event) {
    const pool = (0, getters_1.getLiquidityPool)(event.address.toHexString());
    // ignore initial transfers for first adds
    if (event.params.to.toHexString() == constants_1.ZERO_ADDRESS &&
        event.params.value.equals(constants_1.BIGINT_THOUSAND) &&
        pool.outputTokenSupply == constants_1.BIGINT_ZERO) {
        return;
    }
    // mints
    if (event.params.from.toHexString() == constants_1.ZERO_ADDRESS) {
        (0, handlers_1.handleTransferMint)(event, pool, event.params.value, event.params.to.toHexString());
    }
    // Case where direct send first on native token withdrawls.
    // For burns, mint tokens are first transferred to the pool before transferred for burn.
    // This gets the EOA that made the burn loaded into the _Transfer.
    if (event.params.to == event.address) {
        (0, handlers_1.handleTransferToPoolBurn)(event, event.params.from.toHexString());
    }
    // burn
    if (event.params.to.toHexString() == constants_1.ZERO_ADDRESS &&
        event.params.from == event.address) {
        (0, handlers_1.handleTransferBurn)(event, pool, event.params.value, event.params.from.toHexString());
    }
}
exports.handleTransfer = handleTransfer;
// Handle Sync event.
// Emitted after every Swap, Mint, and Burn event.
// Gives information about the rebalancing of tokens used to update tvl, balances, and token pricing
function handleSync(event) {
    (0, updateMetrics_1.updateInputTokenBalances)(event, event.address.toHexString(), event.params.reserve0, event.params.reserve1);
    (0, updateMetrics_1.updateTvlAndTokenPrices)(event, event.address.toHexString());
}
exports.handleSync = handleSync;
// Handle a mint event emitted from a pool contract. Considered a deposit into the given liquidity pool.
function handleMint(event) {
    (0, creators_1.createDeposit)(event, event.params.amount0, event.params.amount1);
    (0, updateMetrics_1.updateUsageMetrics)(event, event.params.sender, constants_1.UsageType.DEPOSIT);
    (0, updateMetrics_1.updateFinancials)(event);
    (0, updateMetrics_1.updatePoolMetrics)(event);
}
exports.handleMint = handleMint;
// Handle a burn event emitted from a pool contract. Considered a withdraw into the given liquidity pool.
function handleBurn(event) {
    (0, creators_1.createWithdraw)(event, event.params.amount0, event.params.amount1);
    (0, updateMetrics_1.updateUsageMetrics)(event, event.transaction.from, constants_1.UsageType.WITHDRAW);
    (0, updateMetrics_1.updateFinancials)(event);
    (0, updateMetrics_1.updatePoolMetrics)(event);
}
exports.handleBurn = handleBurn;
// Handle a swap event emitted from a pool contract.
function handleSwap(event) {
    (0, creators_1.createSwapHandleVolumeAndFees)(event, event.params.to.toHexString(), event.params.sender.toHexString(), event.params.amount0In, event.params.amount1In, event.params.amount0Out, event.params.amount1Out);
    (0, updateMetrics_1.updateFinancials)(event);
    (0, updateMetrics_1.updatePoolMetrics)(event);
    (0, updateMetrics_1.updateUsageMetrics)(event, event.transaction.from, constants_1.UsageType.SWAP);
}
exports.handleSwap = handleSwap;
