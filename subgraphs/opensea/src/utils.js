"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.max = exports.min = exports.decode_nftTransfer_Method = exports.decode_atomicize_Method = exports.decode_matchERC1155UsingCriteria_Method = exports.decode_matchERC721UsingCriteria_Method = exports.decode_ERC1155Transfer_Method = exports.decode_ERC721Transfer_Method = exports.guardedArrayReplace = exports.calculateFinalPrice = exports.calculateMatchPrice = exports.atomicizeCallData = exports.validateCallDataFunctionSelector = exports.getSaleStrategy = exports.getOrderSide = exports.getFunctionSelector = exports.DecodedAtomicizeResult = exports.DecodedTransferResult = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
class DecodedTransferResult {
    constructor(method, from, to, token, tokenId, amount) {
        this.method = method;
        this.from = from;
        this.to = to;
        this.token = token;
        this.tokenId = tokenId;
        this.amount = amount;
    }
}
exports.DecodedTransferResult = DecodedTransferResult;
class DecodedAtomicizeResult {
    constructor(targets, callDatas) {
        this.targets = targets;
        this.callDatas = callDatas;
    }
}
exports.DecodedAtomicizeResult = DecodedAtomicizeResult;
/**
 * Get first 4 bytes of the calldata (function selector/method ID)
 */
function getFunctionSelector(callData) {
    return graph_ts_1.Bytes.fromUint8Array(callData.subarray(0, 4)).toHexString();
}
exports.getFunctionSelector = getFunctionSelector;
/**
 * Get order side from side parameter
 * enum Side { Buy, Sell }
 * https://github.com/ProjectWyvern/wyvern-ethereum/blob/bfca101b2407e4938398fccd8d1c485394db7e01/contracts/exchange/SaleKindInterface.sol#L22
 */
function getOrderSide(side) {
    if (side == 0) {
        return constants_1.Side.BUY;
    }
    else {
        return constants_1.Side.SELL;
    }
}
exports.getOrderSide = getOrderSide;
/**
 * Get sale strategy from saleKind parameter
 * enum SaleKind { FixedPrice, DutchAuction }
 * https://github.com/ProjectWyvern/wyvern-ethereum/blob/bfca101b2407e4938398fccd8d1c485394db7e01/contracts/exchange/SaleKindInterface.sol#L29
 */
function getSaleStrategy(saleKind) {
    if (saleKind == 0) {
        return constants_1.SaleStrategy.STANDARD_SALE;
    }
    else {
        return constants_1.SaleStrategy.DUTCH_AUCTION;
    }
}
exports.getSaleStrategy = getSaleStrategy;
/**
 * Validate function selectors that can be decoded
 * Relevant function selectors/method IDs can be found via https://www.4byte.directory
 */
function validateCallDataFunctionSelector(callData) {
    const functionSelector = getFunctionSelector(callData);
    return (functionSelector == constants_1.TRANSFER_FROM_SELECTOR ||
        functionSelector == constants_1.ERC721_SAFE_TRANSFER_FROM_SELECTOR ||
        functionSelector == constants_1.ERC1155_SAFE_TRANSFER_FROM_SELECTOR ||
        functionSelector == constants_1.MATCH_ERC721_TRANSFER_FROM_SELECTOR ||
        functionSelector == constants_1.MATCH_ERC721_SAFE_TRANSFER_FROM_SELECTOR ||
        functionSelector == constants_1.MATCH_ERC1155_SAFE_TRANSFER_FROM_SELECTOR);
}
exports.validateCallDataFunctionSelector = validateCallDataFunctionSelector;
/**
 * Split up/atomicize a set of calldata bytes into individual ERC721/1155 transfer calldata bytes
 * Creates a list of calldatas which can be decoded in decodeSingleNftData
 */
function atomicizeCallData(callDatas, callDataLengths) {
    const atomicizedCallData = [];
    let index = 0;
    for (let i = 0; i < callDataLengths.length; i++) {
        const length = callDataLengths[i].toI32();
        const callData = graph_ts_1.Bytes.fromUint8Array(callDatas.subarray(index, index + length));
        atomicizedCallData.push(callData);
        index += length;
    }
    return atomicizedCallData;
}
exports.atomicizeCallData = atomicizeCallData;
/**
 * Calculate the price two orders would match at, if in fact they would match (otherwise fail)
 * Returns sellPrice for sell-side order maker (sale) and buyPrice for buy-side order maker (bid/offer)
 * https://github.com/ProjectWyvern/wyvern-ethereum/blob/bfca101b2407e4938398fccd8d1c485394db7e01/contracts/exchange/ExchangeCore.sol#L460
 */
function calculateMatchPrice(call) {
    const sellSideFeeRecipient = call.inputs.addrs[10];
    const sellSide = call.inputs.feeMethodsSidesKindsHowToCalls[5];
    const sellSaleKind = call.inputs.feeMethodsSidesKindsHowToCalls[6];
    const sellBasePrice = call.inputs.uints[13];
    const sellExtra = call.inputs.uints[14];
    const sellListingTime = call.inputs.uints[15];
    const sellExpirationTime = call.inputs.uints[16];
    // Calculate sell price
    const sellPrice = calculateFinalPrice(sellSide, sellSaleKind, sellBasePrice, sellExtra, sellListingTime, sellExpirationTime, call.block.timestamp);
    const buySide = call.inputs.feeMethodsSidesKindsHowToCalls[1];
    const buySaleKind = call.inputs.feeMethodsSidesKindsHowToCalls[2];
    const buyBasePrice = call.inputs.uints[4];
    const buyExtra = call.inputs.uints[5];
    const buyListingTime = call.inputs.uints[6];
    const buyExpirationTime = call.inputs.uints[7];
    // Calculate buy price
    const buyPrice = calculateFinalPrice(buySide, buySaleKind, buyBasePrice, buyExtra, buyListingTime, buyExpirationTime, call.block.timestamp);
    // Maker/taker priority
    return sellSideFeeRecipient.notEqual(constants_1.NULL_ADDRESS) ? sellPrice : buyPrice;
}
exports.calculateMatchPrice = calculateMatchPrice;
/**
 * Calculate the settlement price of an order using Order paramters
 * Returns basePrice if FixedPrice sale or calculate auction settle price if DutchAuction sale
 * https://github.com/ProjectWyvern/wyvern-ethereum/blob/bfca101b2407e4938398fccd8d1c485394db7e01/contracts/exchange/SaleKindInterface.sol#L70
 * NOTE: "now" keyword is simply an alias for block.timestamp
 * https://docs.soliditylang.org/en/v0.4.26/units-and-global-variables.html?highlight=now#block-and-transaction-properties
 */
function calculateFinalPrice(side, saleKind, basePrice, extra, listingTime, expirationTime, now) {
    if (getSaleStrategy(saleKind) == constants_1.SaleStrategy.STANDARD_SALE) {
        return basePrice;
    }
    else if (getSaleStrategy(saleKind) == constants_1.SaleStrategy.DUTCH_AUCTION) {
        const diff = extra
            .times(now.minus(listingTime))
            .div(expirationTime.minus(listingTime));
        if (getOrderSide(side) == constants_1.Side.SELL) {
            return basePrice.minus(diff);
        }
        else {
            return basePrice.plus(diff);
        }
    }
    else {
        return constants_1.BIGINT_ZERO;
    }
}
exports.calculateFinalPrice = calculateFinalPrice;
/**
 * Replace bytes in an array with bytes in another array, guarded by a bitmask
 * Used to merge calldataBuy and calldataSell using replacementPattern as a bitmask to recreate calldata sent to sell.target
 * https://github.com/ProjectWyvern/wyvern-ethereum/blob/bfca101b2407e4938398fccd8d1c485394db7e01/contracts/common/ArrayUtils.sol#L28
 */
function guardedArrayReplace(_array, _replacement, _mask) {
    // If replacementPattern is empty, meaning that both arrays buyCallData == sellCallData,
    // no merging is necessary. Returns first array (buyCallData)
    if (_mask.length == 0) {
        return _array;
    }
    // Copies original Bytes Array to avoid buffer overwrite
    const array = graph_ts_1.Bytes.fromUint8Array(_array.slice(0));
    const replacement = graph_ts_1.Bytes.fromUint8Array(_replacement.slice(0));
    const mask = graph_ts_1.Bytes.fromUint8Array(_mask.slice(0));
    array.reverse();
    replacement.reverse();
    mask.reverse();
    let bigIntArray = graph_ts_1.BigInt.fromUnsignedBytes(array);
    let bigIntReplacement = graph_ts_1.BigInt.fromUnsignedBytes(replacement);
    const bigIntMask = graph_ts_1.BigInt.fromUnsignedBytes(mask);
    bigIntReplacement = bigIntReplacement.bitAnd(bigIntMask);
    bigIntArray = bigIntArray.bitOr(bigIntReplacement);
    return graph_ts_1.Bytes.fromHexString(bigIntArray.toHexString());
}
exports.guardedArrayReplace = guardedArrayReplace;
/**
 * Decode Ethereum calldata of transferFrom/safeTransferFrom calls using function signature
 * 0x23b872dd transferFrom(address,address,uint256)
 * 0x42842e0e safeTransferFrom(address,address,uint256)
 * https://www.4byte.directory/signatures/?bytes4_signature=0x23b872dd
 * https://www.4byte.directory/signatures/?bytes4_signature=0x42842e0e
 */
function decode_ERC721Transfer_Method(target, callData) {
    const functionSelector = getFunctionSelector(callData);
    const dataWithoutFunctionSelector = graph_ts_1.Bytes.fromUint8Array(callData.subarray(4));
    const decoded = graph_ts_1.ethereum
        .decode("(address,address,uint256)", dataWithoutFunctionSelector)
        .toTuple();
    const senderAddress = decoded[0].toAddress();
    const recieverAddress = decoded[1].toAddress();
    const tokenId = decoded[2].toBigInt();
    return new DecodedTransferResult(functionSelector, senderAddress, recieverAddress, target, tokenId, constants_1.BIGINT_ONE);
}
exports.decode_ERC721Transfer_Method = decode_ERC721Transfer_Method;
/**
 * Decode Ethereum calldata of safeTransferFrom call using function signature
 * 0xf242432a safeTransferFrom(address,address,uint256,uint256,bytes)
 * https://www.4byte.directory/signatures/?bytes4_signature=0xf242432a
 * NOTE: needs ETHABI_DECODE_PREFIX to decode (contains arbitrary bytes)
 */
function decode_ERC1155Transfer_Method(target, callData) {
    const functionSelector = getFunctionSelector(callData);
    const dataWithoutFunctionSelector = graph_ts_1.Bytes.fromUint8Array(callData.subarray(4));
    const dataWithoutFunctionSelectorWithPrefix = constants_1.ETHABI_DECODE_PREFIX.concat(dataWithoutFunctionSelector);
    const decoded = graph_ts_1.ethereum
        .decode("(address,address,uint256,uint256,bytes)", dataWithoutFunctionSelectorWithPrefix)
        .toTuple();
    const senderAddress = decoded[0].toAddress();
    const recieverAddress = decoded[1].toAddress();
    const tokenId = decoded[2].toBigInt();
    const amount = decoded[3].toBigInt();
    return new DecodedTransferResult(functionSelector, senderAddress, recieverAddress, target, tokenId, amount);
}
exports.decode_ERC1155Transfer_Method = decode_ERC1155Transfer_Method;
/**
 * Decode Ethereum calldata of matchERC721UsingCriteria/matchERC721WithSafeTransferUsingCriteria calls using function signature
 * 0xfb16a595 matchERC721UsingCriteria(address,address,address,uint256,bytes32,bytes32[])
 * 0xc5a0236e matchERC721WithSafeTransferUsingCriteria(address,address,address,uint256,bytes32,bytes32[])
 * https://www.4byte.directory/signatures/?bytes4_signature=0xfb16a595
 * https://www.4byte.directory/signatures/?bytes4_signature=0xc5a0236e
 * NOTE: needs ETHABI_DECODE_PREFIX to decode (contains arbitrary bytes/bytes array)
 */
function decode_matchERC721UsingCriteria_Method(callData) {
    const functionSelector = getFunctionSelector(callData);
    const dataWithoutFunctionSelector = graph_ts_1.Bytes.fromUint8Array(callData.subarray(4));
    const dataWithoutFunctionSelectorWithPrefix = constants_1.ETHABI_DECODE_PREFIX.concat(dataWithoutFunctionSelector);
    const decoded = graph_ts_1.ethereum
        .decode("(address,address,address,uint256,bytes32,bytes32[])", dataWithoutFunctionSelectorWithPrefix)
        .toTuple();
    const senderAddress = decoded[0].toAddress();
    const recieverAddress = decoded[1].toAddress();
    const nftContractAddress = decoded[2].toAddress();
    const tokenId = decoded[3].toBigInt();
    return new DecodedTransferResult(functionSelector, senderAddress, recieverAddress, nftContractAddress, tokenId, constants_1.BIGINT_ONE);
}
exports.decode_matchERC721UsingCriteria_Method = decode_matchERC721UsingCriteria_Method;
/**
 * Decode Ethereum calldata of matchERC1155UsingCriteria call using function signature
 * 0x96809f90 matchERC1155UsingCriteria(address,address,address,uint256,uint256,bytes32,bytes32[])
 * https://www.4byte.directory/signatures/?bytes4_signature=0x96809f90
 * NOTE: needs ETHABI_DECODE_PREFIX to decode (contains arbitrary bytes/bytes array)
 */
function decode_matchERC1155UsingCriteria_Method(callData) {
    const functionSelector = getFunctionSelector(callData);
    const dataWithoutFunctionSelector = graph_ts_1.Bytes.fromUint8Array(callData.subarray(4));
    const dataWithoutFunctionSelectorWithPrefix = constants_1.ETHABI_DECODE_PREFIX.concat(dataWithoutFunctionSelector);
    const decoded = graph_ts_1.ethereum
        .decode("(address,address,address,uint256,uint256,bytes32,bytes32[])", dataWithoutFunctionSelectorWithPrefix)
        .toTuple();
    const senderAddress = decoded[0].toAddress();
    const recieverAddress = decoded[1].toAddress();
    const nftContractAddress = decoded[2].toAddress();
    const tokenId = decoded[3].toBigInt();
    const amount = decoded[4].toBigInt();
    return new DecodedTransferResult(functionSelector, senderAddress, recieverAddress, nftContractAddress, tokenId, amount);
}
exports.decode_matchERC1155UsingCriteria_Method = decode_matchERC1155UsingCriteria_Method;
/**
 * Decode Ethereum calldata of atomicize call using function signature
 * 0x68f0bcaa atomicize(address[],uint256[],uint256[],bytes)
 * https://www.4byte.directory/signatures/?bytes4_signature=0x68f0bcaa
 * NOTE: needs ETHABI_DECODE_PREFIX to decode (contains arbitrary bytes/arrays)
 */
function decode_atomicize_Method(callData) {
    const dataWithoutFunctionSelector = graph_ts_1.Bytes.fromUint8Array(callData.subarray(4));
    const dataWithoutFunctionSelectorWithPrefix = constants_1.ETHABI_DECODE_PREFIX.concat(dataWithoutFunctionSelector);
    const decoded = graph_ts_1.ethereum
        .decode("(address[],uint256[],uint256[],bytes)", dataWithoutFunctionSelectorWithPrefix)
        .toTuple();
    const targets = decoded[0].toAddressArray();
    const callDataLengths = decoded[2].toBigIntArray();
    const callDatas = decoded[3].toBytes();
    const atomicizedCallDatas = atomicizeCallData(callDatas, callDataLengths);
    return new DecodedAtomicizeResult(targets, atomicizedCallDatas);
}
exports.decode_atomicize_Method = decode_atomicize_Method;
function decode_nftTransfer_Method(target, callData) {
    const functionSelector = getFunctionSelector(callData);
    if (functionSelector == constants_1.TRANSFER_FROM_SELECTOR ||
        functionSelector == constants_1.ERC721_SAFE_TRANSFER_FROM_SELECTOR) {
        return decode_ERC721Transfer_Method(target, callData);
    }
    else if (functionSelector == constants_1.MATCH_ERC721_TRANSFER_FROM_SELECTOR ||
        functionSelector == constants_1.MATCH_ERC721_SAFE_TRANSFER_FROM_SELECTOR) {
        return decode_matchERC721UsingCriteria_Method(callData);
    }
    else if (functionSelector == constants_1.ERC1155_SAFE_TRANSFER_FROM_SELECTOR) {
        return decode_ERC1155Transfer_Method(target, callData);
    }
    else {
        return decode_matchERC1155UsingCriteria_Method(callData);
    }
}
exports.decode_nftTransfer_Method = decode_nftTransfer_Method;
function min(a, b) {
    return a.lt(b) ? a : b;
}
exports.min = min;
function max(a, b) {
    return a.lt(b) ? b : a;
}
exports.max = max;
