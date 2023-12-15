"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransferBurn = exports.handleTransferToPoolBurn = exports.handleTransferMint = void 0;
const getters_1 = require("./getters");
const constants_1 = require("./constants");
// Handle data from transfer event for mints. Used to populate Deposit entity in the Mint event.
function handleTransferMint(event, pool, value, to) {
    const transfer = (0, getters_1.getOrCreateTransfer)(event);
    // Tracks supply of minted LP tokens
    pool.outputTokenSupply = pool.outputTokenSupply.plus(value);
    // if - create new mint if no mints so far or if last one is done already
    // else - This is done to remove a potential feeto mint --- Not active
    if (!transfer.type) {
        transfer.type = constants_1.TransferType.MINT;
        // Address that is minted to
        transfer.sender = to;
        transfer.liquidity = value;
    }
    else if (transfer.type == constants_1.TransferType.MINT) {
        // Updates the liquidity if the previous mint was a fee mint
        // Address that is minted to
        transfer.sender = to;
        transfer.liquidity = value;
    }
    transfer.save();
    pool.save();
}
exports.handleTransferMint = handleTransferMint;
/**
 * There are two Transfer event handlers for Burns because when the LP token is burned,
 * there the LP tokens are first transfered to the liquidity pool, and then the LP tokens are burned
 * to the null address from the particular liquidity pool.
 */
// Handle data from transfer event for burns. Used to populate Deposit entity in the Burn event.
function handleTransferToPoolBurn(event, from) {
    const transfer = (0, getters_1.getOrCreateTransfer)(event);
    transfer.type = constants_1.TransferType.BURN;
    transfer.sender = from;
    transfer.save();
}
exports.handleTransferToPoolBurn = handleTransferToPoolBurn;
// Handle data from transfer event for burns. Used to populate Deposit entity in the Burn event.
function handleTransferBurn(event, pool, value, from) {
    const transfer = (0, getters_1.getOrCreateTransfer)(event);
    // Tracks supply of minted LP tokens
    pool.outputTokenSupply = pool.outputTokenSupply.minus(value);
    // Uses address from the transfer to pool part of the burn. Set transfer type from this handler.
    if (transfer.type == constants_1.TransferType.BURN) {
        transfer.liquidity = value;
    }
    else {
        transfer.type = constants_1.TransferType.BURN;
        transfer.sender = from;
        transfer.liquidity = value;
    }
    transfer.save();
    pool.save();
}
exports.handleTransferBurn = handleTransferBurn;
