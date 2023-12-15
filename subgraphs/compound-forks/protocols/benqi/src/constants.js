"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nativeCToken =
  exports.nativeToken =
  exports.TraderJoeQiWavaxPairStartBlock =
  exports.TraderJoeQiWavaxPairAddr =
  exports.QiAddr =
  exports.qiAVAXAddr =
  exports.AVAXAddr =
  exports.comptrollerAddr =
  exports.oldComptrollerAddr =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
const mapping_1 = require("../../../src/mapping");
exports.oldComptrollerAddr = graph_ts_1.Address.fromString(
  "0xD38A19100530b99c3b84CCA971DfD96BD557AA91"
);
exports.comptrollerAddr = graph_ts_1.Address.fromString(
  "0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4"
);
exports.AVAXAddr = graph_ts_1.Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
exports.qiAVAXAddr = graph_ts_1.Address.fromString(
  "0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c"
);
exports.QiAddr = graph_ts_1.Address.fromString(
  "0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5"
);
exports.TraderJoeQiWavaxPairAddr = graph_ts_1.Address.fromString(
  "0x2774516897AC629aD3ED9dCac7e375Dda78412b9"
);
exports.TraderJoeQiWavaxPairStartBlock = 3077799;
exports.nativeToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"),
  "AVAX",
  "AVAX",
  18
);
exports.nativeCToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c"),
  "Benqi AVAX",
  "qiAVAX",
  constants_1.cTokenDecimals
);
