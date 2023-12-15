"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetSentLog = exports.AsssetSend_TOPIC0 = exports.ERC20TransferLog = exports.ERC20_TRANSFER_TOPIC0 = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
// Topic0 of ERC20 Transfer event.
// Transfer(address,address.uint256)
exports.ERC20_TRANSFER_TOPIC0 = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
class ERC20TransferLog {
    constructor(txLog) {
        this.tokenAddr = txLog.address;
        this.from = ERC20TransferLog.getFrom(txLog);
        this.to = ERC20TransferLog.getDestination(txLog);
        this.amount = ERC20TransferLog.getAmount(txLog);
    }
    static parse(txLog) {
        if (!ERC20TransferLog.isTransferLog(txLog)) {
            return null;
        }
        return new ERC20TransferLog(txLog);
    }
    static isTransferLog(txLog) {
        return txLog.topics[0].toHexString() == exports.ERC20_TRANSFER_TOPIC0;
    }
    static getFrom(txLog) {
        return graph_ts_1.ethereum.decode("address", txLog.topics[1]).toAddress();
    }
    static getDestination(txLog) {
        return graph_ts_1.ethereum.decode("address", txLog.topics[2]).toAddress();
    }
    static getAmount(txLog) {
        return graph_ts_1.ethereum.decode("uint256", txLog.data).toBigInt();
    }
}
exports.ERC20TransferLog = ERC20TransferLog;
// Topic0 of AssetSent event, emitted by ActivePool when sending Asset away.
// AssetSent(address,address,uint256)
exports.AsssetSend_TOPIC0 = "0xf89c3306c782ffbbe4593aa5673e97e9ad6a8c65d240405e8986363fada66392";
class AssetSentLog {
    constructor(txLog) {
        this.asset = graph_ts_1.ethereum.decode("address", txLog.topics[1]).toAddress();
        const decoded = graph_ts_1.ethereum.decode("(address,uint256)", txLog.data);
        if (decoded) {
            this.to = decoded.toTuple().at(0).toAddress();
            this.amount = decoded.toTuple().at(1).toBigInt();
            this.contractAddr = txLog.address;
        }
        else {
            graph_ts_1.log.error("failed to decode tx: {} logIdx: {} logData: {}", [
                txLog.transactionHash.toHexString(),
                txLog.logIndex.toString(),
                txLog.data.toHexString(),
            ]);
            this.to = graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS);
            this.amount = constants_1.BIGINT_ZERO;
            this.contractAddr = graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS);
        }
    }
    static parse(txLog) {
        if (!AssetSentLog.isAssetSentLog(txLog)) {
            return null;
        }
        return new AssetSentLog(txLog);
    }
    static isAssetSentLog(txLog) {
        return txLog.topics[0].toHexString() == exports.AsssetSend_TOPIC0;
    }
}
exports.AssetSentLog = AssetSentLog;
