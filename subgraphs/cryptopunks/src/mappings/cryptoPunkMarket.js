"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePunkBought = exports.handlePunkBidEntered = void 0;
const initializers_1 = require("../constants/initializers");
const Trades_1 = require("../modules/Trades");
function handlePunkBidEntered(event) {
  const tokenId = event.params.punkIndex;
  const bidAmount = event.params.value;
  const bidderAddress = event.params.fromAddress;
  (0, initializers_1.createBid)(tokenId, bidAmount, bidderAddress, event.block);
}
exports.handlePunkBidEntered = handlePunkBidEntered;
function handlePunkBought(event) {
  (0, Trades_1.updateTrades)(
    event.params.value,
    event.params.punkIndex,
    event.params.toAddress,
    event.params.fromAddress,
    event.transaction,
    event.block
  );
}
exports.handlePunkBought = handlePunkBought;
