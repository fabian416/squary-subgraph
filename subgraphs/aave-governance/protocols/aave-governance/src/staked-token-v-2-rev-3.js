"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer =
  exports.handleDelegatedPowerChanged =
  exports.handleDelegateChanged =
    void 0;
const tokenHandlers_1 = require("../../../src/tokenHandlers");
// DelegateChanged(indexed address,indexed address,indexed address)
function handleDelegateChanged(event) {
  (0, tokenHandlers_1._handleDelegateChanged)(
    event.params.delegationType,
    event.params.delegator.toHexString(),
    event.params.delegatee.toHexString(),
    event
  );
}
exports.handleDelegateChanged = handleDelegateChanged;
function handleDelegatedPowerChanged(event) {
  (0, tokenHandlers_1._handleDelegatedPowerChanged)(
    event.params.delegationType,
    event.params.user.toHexString(),
    event.params.amount,
    event,
    true
  );
}
exports.handleDelegatedPowerChanged = handleDelegatedPowerChanged;
// // Transfer(indexed address,indexed address,uint256)
function handleTransfer(event) {
  (0, tokenHandlers_1._handleStakedTokenTransfer)(
    event.params.from.toHexString(),
    event.params.to.toHexString(),
    event.params.value,
    event
  );
}
exports.handleTransfer = handleTransfer;
