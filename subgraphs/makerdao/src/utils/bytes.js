"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bytesToSignedBigInt = exports.bytesToUnsignedBigInt = exports.bytes32ToAddressHexString = exports.bytes32ToAddress = exports.extractCallData = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
function extractCallData(bytes, start, end) {
    return graph_ts_1.Bytes.fromUint8Array(bytes.subarray(start, end));
}
exports.extractCallData = extractCallData;
function bytes32ToAddress(bytes) {
    //take the last 40 hexstring & convert it to address (20 bytes)
    const address = bytes32ToAddressHexString(bytes);
    return graph_ts_1.Address.fromString(address);
}
exports.bytes32ToAddress = bytes32ToAddress;
function bytes32ToAddressHexString(bytes) {
    //take the last 40 hexstring: 0x + 32 bytes/64 hex characters
    return `0x${bytes.toHexString().slice(26).toLowerCase()}`;
}
exports.bytes32ToAddressHexString = bytes32ToAddressHexString;
function bytesToUnsignedBigInt(bytes, bigEndian = true) {
    // Caution: this function changes the input bytes for bigEndian
    return graph_ts_1.BigInt.fromUnsignedBytes(bigEndian ? graph_ts_1.Bytes.fromUint8Array(bytes.reverse()) : bytes);
}
exports.bytesToUnsignedBigInt = bytesToUnsignedBigInt;
function bytesToSignedBigInt(bytes, bigEndian = true) {
    // Caution: this function changes the input bytes for bigEndian
    return graph_ts_1.BigInt.fromSignedBytes(bigEndian ? graph_ts_1.Bytes.fromUint8Array(bytes.reverse()) : bytes);
}
exports.bytesToSignedBigInt = bytesToSignedBigInt;
