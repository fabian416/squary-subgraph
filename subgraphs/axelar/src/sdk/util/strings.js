"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEVMAddress = void 0;
function isValidEVMAddress(input) {
  const ADDRESS_STR_LENGTH = 42;
  if (input.length !== ADDRESS_STR_LENGTH) {
    return false;
  }
  if (
    input.length == ADDRESS_STR_LENGTH &&
    input.substring(0, 2).toLowerCase() == "0x"
  ) {
    return true;
  }
  return false;
}
exports.isValidEVMAddress = isValidEVMAddress;
