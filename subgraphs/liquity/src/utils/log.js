"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquityEtherSentLog = exports.ETHER_SENT_TOPIC0 = exports.ERC20TransferLog = exports.ERC20_TRANSFER_TOPIC0 = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
// Topic0 of ERC20 Transfer event.
exports.ERC20_TRANSFER_TOPIC0 = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
class ERC20TransferLog {
    constructor(log) {
        this.tokenAddr = log.address;
        this.from = ERC20TransferLog.getFrom(log);
        this.to = ERC20TransferLog.getDestination(log);
        this.amount = ERC20TransferLog.getAmount(log);
    }
    static parse(log) {
        if (!ERC20TransferLog.isTransferLog(log)) {
            return null;
        }
        return new ERC20TransferLog(log);
    }
    static isTransferLog(log) {
        return log.topics[0].toHexString() == exports.ERC20_TRANSFER_TOPIC0;
    }
    static getFrom(log) {
        return graph_ts_1.ethereum.decode("address", log.topics[1]).toAddress();
    }
    static getDestination(log) {
        return graph_ts_1.ethereum.decode("address", log.topics[2]).toAddress();
    }
    static getAmount(log) {
        return graph_ts_1.ethereum.decode("uint256", log.data).toBigInt();
    }
}
exports.ERC20TransferLog = ERC20TransferLog;
// Topic0 of EtherSent event, emitted by ActivePool when sending Ether away.
exports.ETHER_SENT_TOPIC0 = "0x6109e2559dfa766aaec7118351d48a523f0a4157f49c8d68749c8ac41318ad12";
class LiquityEtherSentLog {
    constructor(log) {
        const decoded = graph_ts_1.ethereum.decode("(address,uint256)", log.data).toTuple();
        this.to = decoded.at(0).toAddress();
        this.amount = decoded.at(1).toBigInt();
        this.contractAddr = log.address;
    }
    static parse(log) {
        if (!LiquityEtherSentLog.isEtherSentLog(log)) {
            return null;
        }
        return new LiquityEtherSentLog(log);
    }
    static isEtherSentLog(log) {
        return log.topics[0].toHexString() == exports.ETHER_SENT_TOPIC0;
    }
}
exports.LiquityEtherSentLog = LiquityEtherSentLog;
