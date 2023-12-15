"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrosschainTokenType = exports.TransactionType = exports.TransferType = exports.BridgePoolType = exports.BridgePermissionType = void 0;
var BridgePermissionType;
(function (BridgePermissionType) {
    BridgePermissionType.WHITELIST = "WHITELIST";
    BridgePermissionType.PERMISSIONLESS = "PERMISSIONLESS";
    BridgePermissionType.PRIVATE = "PRIVATE";
})(BridgePermissionType = exports.BridgePermissionType || (exports.BridgePermissionType = {}));
var BridgePoolType;
(function (BridgePoolType) {
    BridgePoolType.LOCK_RELEASE = "LOCK_RELEASE";
    BridgePoolType.BURN_MINT = "BURN_MINT";
    BridgePoolType.LIQUIDITY = "LIQUIDITY";
})(BridgePoolType = exports.BridgePoolType || (exports.BridgePoolType = {}));
var TransferType;
(function (TransferType) {
    TransferType.MINT = "MINT";
    TransferType.BURN = "BURN";
    TransferType.LOCK = "LOCK";
    TransferType.RELEASE = "RELEASE";
})(TransferType = exports.TransferType || (exports.TransferType = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType.LIQUIDITY_DEPOSIT = "LIQUIDITY_DEPOSIT";
    TransactionType.LIQUIDITY_WITHDRAW = "LIQUIDITY_WITHDRAW";
    TransactionType.TRANSFER_IN = "TRANSFER_IN";
    TransactionType.TRANSFER_OUT = "TRANSFER_OUT";
    TransactionType.MESSAGE_SENT = "MESSAGE_SENT";
    TransactionType.MESSAGE_RECEIVED = "MESSAGE_RECEIVED";
    TransactionType.OTHER = "OTHER";
})(TransactionType = exports.TransactionType || (exports.TransactionType = {}));
var CrosschainTokenType;
(function (CrosschainTokenType) {
    CrosschainTokenType.WRAPPED = "WRAPPED";
    CrosschainTokenType.CANONICAL = "CANONICAL";
})(CrosschainTokenType = exports.CrosschainTokenType || (exports.CrosschainTokenType = {}));
