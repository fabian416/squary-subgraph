"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNullEthValue = exports.fetchTokenDecimals = exports.fetchTokenName = exports.fetchTokenSymbol = exports.UNKNOWN_TOKEN_VALUE = exports.INVALID_TOKEN_DECIMALS = void 0;
/* eslint-disable prefer-const */
const ERC20_1 = require("../../generated/Pool/ERC20");
const ERC20SymbolBytes_1 = require("../../generated/Pool/ERC20SymbolBytes");
const ERC20NameBytes_1 = require("../../generated/Pool/ERC20NameBytes");
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.INVALID_TOKEN_DECIMALS = 0;
exports.UNKNOWN_TOKEN_VALUE = "unknown";
function fetchTokenSymbol(tokenAddress) {
    let contract = ERC20_1.ERC20.bind(tokenAddress);
    let contractSymbolBytes = ERC20SymbolBytes_1.ERC20SymbolBytes.bind(tokenAddress);
    // try types string and bytes32 for symbol
    let symbolValue = exports.UNKNOWN_TOKEN_VALUE;
    let symbolResult = contract.try_symbol();
    if (!symbolResult.reverted) {
        return symbolResult.value;
    }
    // non-standard ERC20 implementation
    let symbolResultBytes = contractSymbolBytes.try_symbol();
    if (!symbolResultBytes.reverted) {
        // for broken pairs that have no symbol function exposed
        if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
            symbolValue = symbolResultBytes.value.toString();
        }
        else {
            // try with the static definition
            let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress);
            if (staticTokenDefinition != null) {
                symbolValue = staticTokenDefinition.symbol;
            }
        }
    }
    return symbolValue;
}
exports.fetchTokenSymbol = fetchTokenSymbol;
function fetchTokenName(tokenAddress) {
    let contract = ERC20_1.ERC20.bind(tokenAddress);
    let contractNameBytes = ERC20NameBytes_1.ERC20NameBytes.bind(tokenAddress);
    // try types string and bytes32 for name
    let nameValue = exports.UNKNOWN_TOKEN_VALUE;
    let nameResult = contract.try_name();
    if (!nameResult.reverted) {
        return nameResult.value;
    }
    // non-standard ERC20 implementation
    let nameResultBytes = contractNameBytes.try_name();
    if (!nameResultBytes.reverted) {
        // for broken exchanges that have no name function exposed
        if (!isNullEthValue(nameResultBytes.value.toHexString())) {
            nameValue = nameResultBytes.value.toString();
        }
        else {
            // try with the static definition
            let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress);
            if (staticTokenDefinition != null) {
                nameValue = staticTokenDefinition.name;
            }
        }
    }
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
    // try with the static definition
    let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress);
    if (staticTokenDefinition != null) {
        return staticTokenDefinition.decimals;
    }
    else {
        return exports.INVALID_TOKEN_DECIMALS;
    }
}
exports.fetchTokenDecimals = fetchTokenDecimals;
function isNullEthValue(value) {
    return value == "0x0000000000000000000000000000000000000000000000000000000000000001";
}
exports.isNullEthValue = isNullEthValue;
// Initialize a Token Definition with the attributes
class StaticTokenDefinition {
    // Initialize a Token Definition with its attributes
    constructor(address, symbol, name, decimals) {
        this.address = address;
        this.symbol = symbol;
        this.name = name;
        this.decimals = decimals;
    }
    // Get all tokens with a static defintion
    static getStaticDefinitions() {
        let staticDefinitions = new Array(6);
        // Add DGD
        let tokenDGD = new StaticTokenDefinition(graph_ts_1.Address.fromString("0xe0b7927c4af23765cb51314a0e0521a9645f0e2a"), "DGD", "DGD", 9);
        staticDefinitions.push(tokenDGD);
        // Add AAVE
        let tokenAAVE = new StaticTokenDefinition(graph_ts_1.Address.fromString("0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9"), "AAVE", "Aave Token", 18);
        staticDefinitions.push(tokenAAVE);
        // Add LIF
        let tokenLIF = new StaticTokenDefinition(graph_ts_1.Address.fromString("0xeb9951021698b42e4399f9cbb6267aa35f82d59d"), "LIF", "Lif", 18);
        staticDefinitions.push(tokenLIF);
        // Add SVD
        let tokenSVD = new StaticTokenDefinition(graph_ts_1.Address.fromString("0xbdeb4b83251fb146687fa19d1c660f99411eefe3"), "SVD", "savedroid", 18);
        staticDefinitions.push(tokenSVD);
        // Add TheDAO
        let tokenTheDAO = new StaticTokenDefinition(graph_ts_1.Address.fromString("0xbb9bc244d798123fde783fcc1c72d3bb8c189413"), "TheDAO", "TheDAO", 16);
        staticDefinitions.push(tokenTheDAO);
        // Add HPB
        let tokenHPB = new StaticTokenDefinition(graph_ts_1.Address.fromString("0x38c6a68304cdefb9bec48bbfaaba5c5b47818bb2"), "HPB", "HPBCoin", 18);
        staticDefinitions.push(tokenHPB);
        return staticDefinitions;
    }
    // Helper for hardcoded tokens
    static fromAddress(tokenAddress) {
        let staticDefinitions = this.getStaticDefinitions();
        let tokenAddressHex = tokenAddress.toHexString();
        // Search the definition using the address
        for (let i = 0; i < staticDefinitions.length; i++) {
            let staticDefinition = staticDefinitions[i];
            if (staticDefinition.address.toHexString() == tokenAddressHex) {
                return staticDefinition;
            }
        }
        // If not found, return null
        return null;
    }
}
