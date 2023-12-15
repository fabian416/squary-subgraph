"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateRewardToken = exports.getTokenDecimals = exports.getOrCreateTokenFromString = exports.checkValidToken = exports.getOrCreateToken = exports.UNKNOWN_TOKEN_VALUE = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ERC20_1 = require("../../generated/templates/Swap/ERC20");
const ERC20NameBytes_1 = require("../../generated/templates/Swap/ERC20NameBytes");
const ERC20SymbolBytes_1 = require("../../generated/templates/Swap/ERC20SymbolBytes");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
exports.UNKNOWN_TOKEN_VALUE = "unknown";
function getOrCreateToken(tokenAddress, pool = null) {
    let token = schema_1.Token.load(tokenAddress.toHexString());
    if (!token) {
        const contract = ERC20_1.ERC20.bind(tokenAddress);
        token = new schema_1.Token(tokenAddress.toHexString());
        token.name = fetchTokenName(contract);
        token.symbol = fetchTokenSymbol(contract);
        token.decimals = contract.decimals();
        token._pool = pool;
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function isNullEthValue(value) {
    return (value ==
        "0x0000000000000000000000000000000000000000000000000000000000000001");
}
function fetchTokenName(contract) {
    // try types string and bytes32 for name
    let nameValue = exports.UNKNOWN_TOKEN_VALUE;
    const nameResult = contract.try_name();
    if (!nameResult.reverted) {
        return nameResult.value;
    }
    // non-standard ERC20 implementation
    const contractNameBytes = ERC20NameBytes_1.ERC20NameBytes.bind(contract._address);
    const nameResultBytes = contractNameBytes.try_name();
    if (!nameResultBytes.reverted) {
        // for broken exchanges that have no name function exposed
        if (!isNullEthValue(nameResultBytes.value.toHexString())) {
            nameValue = nameResultBytes.value.toString();
        }
    }
    return nameValue;
}
function fetchTokenSymbol(contract) {
    const contractSymbolBytes = ERC20SymbolBytes_1.ERC20SymbolBytes.bind(contract._address);
    // try types string and bytes32 for symbol
    let symbolValue = exports.UNKNOWN_TOKEN_VALUE;
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
function checkValidToken(tokenAddress) {
    const contract = ERC20_1.ERC20.bind(tokenAddress);
    return fetchTokenName(contract) != exports.UNKNOWN_TOKEN_VALUE;
}
exports.checkValidToken = checkValidToken;
function getOrCreateTokenFromString(tokenAddress, pool = null) {
    return getOrCreateToken(graph_ts_1.Address.fromString(tokenAddress), pool);
}
exports.getOrCreateTokenFromString = getOrCreateTokenFromString;
function getTokenDecimals(tokenAddress) {
    return schema_1.Token.load(tokenAddress).decimals;
}
exports.getTokenDecimals = getTokenDecimals;
function getOrCreateRewardToken(tokenAddress) {
    const id = tokenAddress.toHexString();
    let rewardToken = schema_1.RewardToken.load(id);
    if (!rewardToken) {
        rewardToken = new schema_1.RewardToken(id);
        rewardToken.type = constants_1.RewardTokenType.DEPOSIT;
        rewardToken.token = getOrCreateToken(tokenAddress).id;
        rewardToken.save();
    }
    return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
