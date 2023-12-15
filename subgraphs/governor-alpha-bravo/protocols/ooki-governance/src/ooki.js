"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer = void 0;
const tokenHandlers_1 = require("../../../src/tokenHandlers");
// DelegateChanged(indexed address,indexed address,indexed address)
// export function handleDelegateChanged(event: DelegateChanged): void {
//   _handleDelegateChanged(
//     event.params.delegator.toHexString(),
//     event.params.fromDelegate.toHexString(),
//     event.params.toDelegate.toHexString(),
//     event
//   );
// }
// // DelegateVotesChanged(indexed address,uint256,uint256)
// // Called in succession to the above DelegateChanged event
// export function handleDelegateVotesChanged(event: DelegateVotesChanged): void {
//   _handleDelegateVotesChanged(
//     event.params.delegate.toHexString(),
//     event.params.previousBalance,
//     event.params.newBalance,
//     event
//   );
// }
// // Transfer(indexed address,indexed address,uint256)
function handleTransfer(event) {
    (0, tokenHandlers_1._handleTransfer)(event.params.from.toHexString(), event.params.to.toHexString(), event.params.value, event);
}
exports.handleTransfer = handleTransfer;
