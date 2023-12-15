"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetDecimals = exports.getAssetSymbol = exports.getAssetName = void 0;
const ERC20_1 = require("../../../generated/RariYieldFundManager/ERC20");
const ERC20SymbolBytes_1 = require("../../../generated/RariYieldFundManager/ERC20SymbolBytes");
const ERC20NameBytes_1 = require("../../../generated/RariYieldFundManager/ERC20NameBytes");
const graph_ts_1 = require("@graphprotocol/graph-ts");
// Functions designed to try...catch erc20 name/symbol/decimals to prevent errors
function getAssetName(address) {
    let contract = ERC20_1.ERC20.bind(address);
    let nameCall = contract.try_name();
    if (!nameCall.reverted) {
        return nameCall.value;
    }
    let bytesContract = ERC20NameBytes_1.ERC20NameBytes.bind(address);
    let nameBytesCall = bytesContract.try_name();
    if (!nameBytesCall.reverted) {
        return nameBytesCall.value.toString();
    }
    graph_ts_1.log.error("name() call (string or bytes) reverted for {}", [address.toHex()]);
    return "UNKNOWN";
}
exports.getAssetName = getAssetName;
function getAssetSymbol(address) {
    let contract = ERC20_1.ERC20.bind(address);
    let symbolCall = contract.try_symbol();
    if (!symbolCall.reverted) {
        return symbolCall.value;
    }
    let bytesContract = ERC20SymbolBytes_1.ERC20SymbolBytes.bind(address);
    let symbolBytesCall = bytesContract.try_symbol();
    if (!symbolBytesCall.reverted) {
        return symbolBytesCall.value.toString();
    }
    graph_ts_1.log.error("symbol() call (string or bytes) reverted for {}", [
        address.toHex(),
    ]);
    return "UNKNOWN";
}
exports.getAssetSymbol = getAssetSymbol;
function getAssetDecimals(address) {
    let contract = ERC20_1.ERC20.bind(address);
    let decimalsCall = contract.try_decimals();
    if (!decimalsCall.reverted) {
        return decimalsCall.value;
    }
    graph_ts_1.log.error("decimals() call reverted for {}", [address.toHex()]);
    return -1;
}
exports.getAssetDecimals = getAssetDecimals;
