"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetTotalSupply = exports.getAssetDecimals = exports.getAssetSymbol = exports.getAssetName = void 0;
const ERC20_1 = require("../../generated/euler/ERC20");
const ERC20SymbolBytes_1 = require("../../generated/euler/ERC20SymbolBytes");
const ERC20NameBytes_1 = require("../../generated/euler/ERC20NameBytes");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
// Functions designed to try...catch erc20 name/symbol/decimals to prevent errors
function getAssetName(address) {
    const contract = ERC20_1.ERC20.bind(address);
    const nameCall = contract.try_name();
    if (!nameCall.reverted) {
        return nameCall.value;
    }
    const bytesContract = ERC20NameBytes_1.ERC20NameBytes.bind(address);
    const nameBytesCall = bytesContract.try_name();
    if (!nameBytesCall.reverted) {
        return nameBytesCall.value.toString();
    }
    graph_ts_1.log.error("name() call (string or bytes) reverted for {}", [address.toHex()]);
    return "UNKNOWN";
}
exports.getAssetName = getAssetName;
function getAssetSymbol(address) {
    const contract = ERC20_1.ERC20.bind(address);
    const symbolCall = contract.try_symbol();
    if (!symbolCall.reverted) {
        return symbolCall.value;
    }
    const bytesContract = ERC20SymbolBytes_1.ERC20SymbolBytes.bind(address);
    const symbolBytesCall = bytesContract.try_symbol();
    if (!symbolBytesCall.reverted) {
        return symbolBytesCall.value.toString();
    }
    graph_ts_1.log.error("symbol() call (string or bytes) reverted for {}", [address.toHex()]);
    return "UNKNOWN";
}
exports.getAssetSymbol = getAssetSymbol;
function getAssetDecimals(address) {
    const contract = ERC20_1.ERC20.bind(address);
    const decimalsCall = contract.try_decimals();
    if (!decimalsCall.reverted) {
        return decimalsCall.value;
    }
    graph_ts_1.log.error("decimals() call reverted for {}", [address.toHex()]);
    return -1;
}
exports.getAssetDecimals = getAssetDecimals;
function getAssetTotalSupply(address) {
    const contract = ERC20_1.ERC20.bind(address);
    const supplyCall = contract.try_totalSupply();
    if (!supplyCall.reverted) {
        return supplyCall.value;
    }
    graph_ts_1.log.error("try_totalSupply() call (bigint) reverted for {}", [address.toHex()]);
    return constants_1.BIGINT_ZERO;
}
exports.getAssetTotalSupply = getAssetTotalSupply;
