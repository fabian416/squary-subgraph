"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRewardTokenById = exports.getOrCreateRewardToken = exports.getTokenById = exports.getOrCreateToken = exports.UNKNOWN_TOKEN_VALUE = void 0;
const schema_1 = require("../../generated/schema");
const IERC20Detailed_1 = require("../../generated/templates/TruefiPool2/IERC20Detailed");
const IERC20DetailedBytes_1 = require("../../generated/templates/TruefiPool2/IERC20DetailedBytes");
const strings_1 = require("../utils/strings");
exports.UNKNOWN_TOKEN_VALUE = "unknown";
function getOrCreateToken(tokenAddress, underlyingAsset = null) {
    let token = schema_1.Token.load(tokenAddress.toHexString());
    if (!token) {
        const contract = IERC20Detailed_1.IERC20Detailed.bind(tokenAddress);
        token = new schema_1.Token(tokenAddress.toHexString());
        token.name = fetchTokenName(contract);
        token.symbol = fetchTokenSymbol(contract);
        token.decimals = contract.decimals();
        token.underlyingAsset = underlyingAsset;
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getTokenById(tokenId) {
    return schema_1.Token.load(tokenId);
}
exports.getTokenById = getTokenById;
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
    const contractNameBytes = IERC20DetailedBytes_1.IERC20DetailedBytes.bind(contract._address);
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
    let contractSymbolBytes = IERC20DetailedBytes_1.IERC20DetailedBytes.bind(contract._address);
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
    }
    return symbolValue;
}
function getOrCreateRewardToken(tokenAddress, rewardTokenType, interestRateType, distributionEnd) {
    // deposit-variable-0x123, borrow-stable-0x123, borrow-variable-0x123
    const id = (0, strings_1.prefixID)(rewardTokenType, (0, strings_1.prefixID)(interestRateType, tokenAddress.toHexString()));
    let rewardToken = schema_1.RewardToken.load(id);
    if (!rewardToken) {
        rewardToken = new schema_1.RewardToken(id);
        rewardToken.type = rewardTokenType;
        rewardToken.token = getOrCreateToken(tokenAddress).id;
    }
    rewardToken.distributionEnd = distributionEnd;
    rewardToken.save();
    return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
function getRewardTokenById(id) {
    return schema_1.RewardToken.load(id);
}
exports.getRewardTokenById = getRewardTokenById;
