"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateL2IncomingBridgeMessage = exports.updateL2OutgoingBridgeMessage = exports.updateL1OutgoingBridgeMessage = exports.conf = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const chainIds_1 = require("../protocols/bridge/chainIds");
const config_1 = require("../../../src/sdk/protocols/bridge/config");
const versions_1 = require("../../../src/versions");
const enums_1 = require("../../../src/sdk/protocols/bridge/enums");
exports.conf = new config_1.BridgeConfig("0x03d7f750777ec48d39d080b020d83eb2cb4e3547", "HOP-"
    .concat(graph_ts_1.dataSource.network().toUpperCase().replace("-", "_"))
    .concat("-BRIDGE"), "hop-".concat(graph_ts_1.dataSource.network().replace("-", "_")).concat("-bridge"), enums_1.BridgePermissionType.PERMISSIONLESS, versions_1.Versions);
function updateL1OutgoingBridgeMessage(event, recipient, chainId, acc, inputToken, receipt) {
    for (let index = 0; index < receipt.logs.length; index++) {
        const _address = receipt.logs[index].address;
        if (receipt.logs[index].topics.length == 0)
            continue;
        const _topic0 = receipt.logs[index].topics[0].toHexString();
        const _data = receipt.logs[index].data;
        graph_ts_1.log.info("S8 - chainID: {}, topic0: {}, txHash: {}", [
            chainId.toString(),
            _topic0,
            event.transaction.hash.toHexString(),
        ]);
        if (!constants_1.MESSENGER_EVENT_SIGNATURES.includes(_topic0))
            continue;
        graph_ts_1.log.info("S9 - chainID: {}, inputToken: {}, topic0: {}, txHash: {}", [
            chainId.toString(),
            inputToken,
            _topic0,
            event.transaction.hash.toHexString(),
        ]);
        const data = graph_ts_1.Bytes.fromUint8Array(_data.subarray(0));
        graph_ts_1.log.info("MessageOUTDT - emittingContractaddress: {}, topic0: {}, logAddress: {}, data: {}", [
            event.address.toHexString(),
            _topic0,
            _address.toHexString(),
            data.toHexString(),
        ]);
        if (_topic0 == constants_1.ARBITRUM_L1_SIGNATURE) {
            acc.messageOut(chainId, recipient, data);
        }
        else if (_topic0 == constants_1.XDAI_L1_SIGNATURE) {
            const _xDaiData = receipt.logs[index].topics[3];
            acc.messageOut(chainId, recipient, _xDaiData);
        }
        else if (_topic0 == constants_1.OPTIMISM_L1_SIGNATURE) {
            const _optimismData = receipt.logs[index].topics[1];
            acc.messageOut(chainId, recipient, _optimismData);
            graph_ts_1.log.info("MessageOUT - BridgeAddress: {}, data: {}", [
                event.address.toHexString(),
                data.toHexString(),
            ]);
        }
    }
}
exports.updateL1OutgoingBridgeMessage = updateL1OutgoingBridgeMessage;
function updateL2OutgoingBridgeMessage(event, recipient, chainId, acc, receipt) {
    for (let index = 0; index < receipt.logs.length; index++) {
        const _address = receipt.logs[index].address;
        if (receipt.logs[index].topics.length == 0)
            continue;
        const _topic0 = receipt.logs[index].topics[0].toHexString();
        if (!constants_1.MESSENGER_EVENT_SIGNATURES.includes(_topic0))
            continue;
        const _data = receipt.logs[index].data;
        const data = graph_ts_1.Bytes.fromUint8Array(_data.subarray(0));
        graph_ts_1.log.info("MessageOUTDT - emittingContractaddress: {}, topic0: {},  logAddress: {}, data: {}", [
            event.address.toHexString(),
            _topic0,
            _address.toHexString(),
            data.toHexString(),
        ]);
        if (_topic0 == constants_1.XDAI_L2_SIGNATURE || _topic0 == constants_1.OPTIMISM_L2_SIGNATURE) {
            acc.messageOut(chainId, recipient, data);
        }
        graph_ts_1.log.info("MessageOUTDT2 - TokenAddress: {},  data: {}", [
            event.address.toHexString(),
            data.toHexString(),
        ]);
    }
    graph_ts_1.log.info("TransferOUT - TokenAddress: {},  txHash: {},", [
        event.address.toHexString(),
        event.transaction.hash.toHexString(),
    ]);
}
exports.updateL2OutgoingBridgeMessage = updateL2OutgoingBridgeMessage;
function updateL2IncomingBridgeMessage(event, recipient, acc, receipt) {
    for (let index = 0; index < receipt.logs.length; index++) {
        const _topic0 = receipt.logs[index].topics[0].toHexString();
        if (!constants_1.MESSENGER_EVENT_SIGNATURES.includes(_topic0))
            continue;
        const _optimismData = receipt.logs[index].topics[1];
        const _address = receipt.logs[index].address;
        const _data = receipt.logs[index].data;
        const data = graph_ts_1.Bytes.fromUint8Array(_data.subarray(0));
        graph_ts_1.log.info("MessageINDT - emittingContractaddress: {}, topic0: {}, logAddress: {}, data: {}", [
            event.address.toHexString(),
            _topic0,
            _address.toHexString(),
            data.toHexString(),
        ]);
        if (_topic0 == constants_1.OPTIMISM_L2_SIGNATURE) {
            acc.messageIn(chainIds_1.reverseChainIDs.get(constants_1.Network.MAINNET), recipient, _optimismData);
        }
        else if (_topic0 == constants_1.XDAI_L2_SIGNATURE) {
            acc.messageIn(chainIds_1.reverseChainIDs.get(constants_1.Network.MAINNET), recipient, data);
        }
        graph_ts_1.log.info("MessageIN - TokenAddress: {}, data: {}", [
            event.address.toHexString(),
            data.toHexString(),
        ]);
    }
    graph_ts_1.log.info("TransferIN - TokenAddress: {},  txHash: {}", [
        event.address.toHexString(),
        event.transaction.hash.toHexString(),
    ]);
}
exports.updateL2IncomingBridgeMessage = updateL2IncomingBridgeMessage;
