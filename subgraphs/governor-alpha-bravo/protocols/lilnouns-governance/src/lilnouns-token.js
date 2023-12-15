"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer = exports.handleDelegateVotesChanged = exports.handleDelegateChanged = void 0;
const constants_1 = require("../../../src/constants");
const tokenHandlers_1 = require("../../../src/tokenHandlers");
// DelegateChanged(indexed address,indexed address,indexed address)
function handleDelegateChanged(event) {
    (0, tokenHandlers_1._handleDelegateChanged)(event.params.delegator.toHexString(), event.params.fromDelegate.toHexString(), event.params.toDelegate.toHexString(), event);
}
exports.handleDelegateChanged = handleDelegateChanged;
// DelegateVotesChanged(indexed address,uint256,uint256)
// Called in succession to the above DelegateChanged event
function handleDelegateVotesChanged(event) {
    (0, tokenHandlers_1._handleDelegateVotesChanged)(event.params.delegate.toHexString(), event.params.previousBalance, event.params.newBalance, event);
}
exports.handleDelegateVotesChanged = handleDelegateVotesChanged;
// // Transfer(indexed address,indexed address,uint256)
function handleTransfer(event) {
    (0, tokenHandlers_1._handleTransfer)(event.params.from.toHexString(), event.params.to.toHexString(), constants_1.BIGINT_ONE, event);
}
exports.handleTransfer = handleTransfer;
