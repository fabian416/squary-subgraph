"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.denormalizeAmount = exports.normalizeAmount = exports.truncateAddress = exports.getCrossTokenAddress = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const crossTokenAddress_1 = require("../common/crossTokenAddress");
const constants_1 = require("../sdk/util/constants");
function getCrossTokenAddress(tokenID, tokenChainID, chainID, crossChainID) {
    const key = tokenID
        .toLowerCase()
        .concat(":")
        .concat(chainID.toString())
        .concat(":")
        .concat(crossChainID.toString());
    let obj;
    if (tokenChainID != chainID) {
        obj = graph_ts_1.json.fromString(crossTokenAddress_1.SourceByDest).toObject().get(key);
    }
    else {
        obj = graph_ts_1.json.fromString(crossTokenAddress_1.DestBySource).toObject().get(key);
    }
    if (!obj) {
        graph_ts_1.log.warning("[getCrossTokenAddress] No crossTokenAddress for key: {}", [
            key,
        ]);
        return graph_ts_1.Bytes.fromUTF8(constants_1.ZERO_ADDRESS);
    }
    return graph_ts_1.Bytes.fromUTF8(obj.toString());
}
exports.getCrossTokenAddress = getCrossTokenAddress;
function truncateAddress(bAddr) {
    return graph_ts_1.Address.fromString(bAddr.toHexString().replace("0x000000000000000000000000", "0x"));
}
exports.truncateAddress = truncateAddress;
function normalizeAmount(amount, decimals) {
    if (decimals > 8) {
        amount = amount.div(graph_ts_1.BigInt.fromI32(10).pow((decimals - 8)));
    }
    return amount;
}
exports.normalizeAmount = normalizeAmount;
function denormalizeAmount(amount, decimals) {
    if (decimals > 8) {
        amount = amount.times(graph_ts_1.BigInt.fromI32(10).pow((decimals - 8)));
    }
    return amount;
}
exports.denormalizeAmount = denormalizeAmount;
