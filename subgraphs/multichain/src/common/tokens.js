"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNullEthValue = exports.fetchTokenSupply = exports.fetchTokenDecimals = exports.fetchTokenName = exports.fetchTokenSymbol = void 0;
const constants_1 = require("./constants");
const ERC20_1 = require("../../generated/Router-0/ERC20");
const ERC20SymbolBytes_1 = require("../../generated/Router-0/ERC20SymbolBytes");
const ERC20NameBytes_1 = require("../../generated/Router-0/ERC20NameBytes");
function fetchTokenSymbol(tokenAddress) {
    const contract = ERC20_1.ERC20.bind(tokenAddress);
    const contractSymbolBytes = ERC20SymbolBytes_1.ERC20SymbolBytes.bind(tokenAddress);
    // try types string and bytes32 for symbol
    let symbolValue = constants_1.UNKNOWN_TOKEN_VALUE;
    const symbolResult = contract.try_symbol();
    if (!symbolResult.reverted) {
        return symbolResult.value;
    }
    // non-standard ERC20 implementation
    const symbolResultBytes = contractSymbolBytes.try_symbol();
    if (!symbolResultBytes.reverted) {
        // for broken pairs that have no symbol function exposed
        if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
            symbolValue = symbolResultBytes.value.toString();
        }
    }
    return symbolValue;
}
exports.fetchTokenSymbol = fetchTokenSymbol;
function fetchTokenName(tokenAddress) {
    const contract = ERC20_1.ERC20.bind(tokenAddress);
    const contractNameBytes = ERC20NameBytes_1.ERC20NameBytes.bind(tokenAddress);
    // try types string and bytes32 for name
    let nameValue = constants_1.UNKNOWN_TOKEN_VALUE;
    const nameResult = contract.try_name();
    if (!nameResult.reverted) {
        return nameResult.value;
    }
    // non-standard ERC20 implementation
    const nameResultBytes = contractNameBytes.try_name();
    if (!nameResultBytes.reverted) {
        // for broken exchanges that have no name function exposed
        if (!isNullEthValue(nameResultBytes.value.toHexString())) {
            nameValue = nameResultBytes.value.toString();
        }
    }
    return nameValue;
}
exports.fetchTokenName = fetchTokenName;
function fetchTokenDecimals(tokenAddress) {
    const contract = ERC20_1.ERC20.bind(tokenAddress);
    // try types uint8 for decimals
    const decimalResult = contract.try_decimals();
    if (!decimalResult.reverted) {
        const decimalValue = decimalResult.value;
        return decimalValue;
    }
    return constants_1.INVALID_TOKEN_DECIMALS;
}
exports.fetchTokenDecimals = fetchTokenDecimals;
function fetchTokenSupply(tokenAddress) {
    const contract = ERC20_1.ERC20.bind(tokenAddress);
    const supplyResult = contract.try_totalSupply();
    if (!supplyResult.reverted) {
        const supplyValue = supplyResult.value;
        return supplyValue;
    }
    return constants_1.BIGINT_ZERO;
}
exports.fetchTokenSupply = fetchTokenSupply;
function isNullEthValue(value) {
    return (value ==
        "0x0000000000000000000000000000000000000000000000000000000000000001");
}
exports.isNullEthValue = isNullEthValue;
