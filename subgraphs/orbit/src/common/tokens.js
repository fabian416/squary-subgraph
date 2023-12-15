"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNullEthValue = exports.fetchTokenDecimals = exports.fetchTokenName = exports.fetchTokenSymbol = exports.UNKNOWN_TOKEN_VALUE = exports.INVALID_TOKEN_DECIMALS = void 0;
/* eslint-disable prefer-const */
const ERC20_1 = require("../../generated/Vault/ERC20");
const ERC20SymbolBytes_1 = require("../../generated/Vault/ERC20SymbolBytes");
const ERC20NameBytes_1 = require("../../generated/Vault/ERC20NameBytes");
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.INVALID_TOKEN_DECIMALS = 0;
exports.UNKNOWN_TOKEN_VALUE = "unknown";
function fetchTokenSymbol(tokenAddress) {
    let contract = ERC20_1.ERC20.bind(tokenAddress);
    let contractSymbolBytes = ERC20SymbolBytes_1.ERC20SymbolBytes.bind(tokenAddress);
    // try types string and bytes32 for symbol
    let symbolValue = "Unknown";
    let symbolResult = contract.try_symbol();
    if (!symbolResult.reverted) {
        return symbolResult.value;
    }
    // non-standard ERC20 implementation
    let symbolResultBytes = contractSymbolBytes.try_symbol();
    if (!symbolResultBytes.reverted) {
        // for broken pairs that have no symbol function exposed
        if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
            return symbolResultBytes.value.toString();
        }
    }
    graph_ts_1.log.warning("[getTokenParams]Fail to get symbol for token {}; default to 'Unknown'", [tokenAddress.toHexString()]);
    return symbolValue;
}
exports.fetchTokenSymbol = fetchTokenSymbol;
function fetchTokenName(tokenAddress) {
    let contract = ERC20_1.ERC20.bind(tokenAddress);
    let contractNameBytes = ERC20NameBytes_1.ERC20NameBytes.bind(tokenAddress);
    // try types string and bytes32 for name
    let nameValue = "Unknown Token";
    let nameResult = contract.try_name();
    if (!nameResult.reverted) {
        return nameResult.value;
    }
    // non-standard ERC20 implementation
    let nameResultBytes = contractNameBytes.try_name();
    if (!nameResultBytes.reverted) {
        // for broken exchanges that have no name function exposed
        if (!isNullEthValue(nameResultBytes.value.toHexString())) {
            return nameResultBytes.value.toString();
        }
    }
    graph_ts_1.log.warning("[getTokenParams]Fail to get name for token {}; default to 'Unknown Token'", [tokenAddress.toHexString()]);
    return nameValue;
}
exports.fetchTokenName = fetchTokenName;
function fetchTokenDecimals(tokenAddress) {
    let contract = ERC20_1.ERC20.bind(tokenAddress);
    // try types uint8 for decimals
    let decimalResult = contract.try_decimals();
    if (!decimalResult.reverted) {
        let decimalValue = decimalResult.value;
        return decimalValue;
    }
    graph_ts_1.log.warning("[getTokenParams]token {} decimals() call reverted; default to 18 decimals", [tokenAddress.toHexString()]);
    return 18;
}
exports.fetchTokenDecimals = fetchTokenDecimals;
function isNullEthValue(value) {
    return (value ==
        "0x0000000000000000000000000000000000000000000000000000000000000001");
}
exports.isNullEthValue = isNullEthValue;
