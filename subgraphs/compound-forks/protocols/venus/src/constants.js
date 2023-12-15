"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORACLE_PRECISION =
  exports.XVS =
  exports.vXVS =
  exports.VDAI_MARKET_ADDRESS =
  exports.nativeCToken =
  exports.nativeToken =
  exports.comptrollerAddr =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
const mapping_1 = require("../../../src/mapping");
exports.comptrollerAddr = graph_ts_1.Address.fromString(
  "0xfD36E2c2a6789Db23113685031d7F16329158384"
);
exports.nativeToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"),
  "BNB",
  "BNB",
  18
);
exports.nativeCToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0xA07c5b74C9B40447a954e1466938b865b6BBea36"),
  "Venus BNB",
  "vBNB",
  constants_1.cTokenDecimals
);
exports.VDAI_MARKET_ADDRESS = graph_ts_1.Address.fromString(
  "0x334b3ecb4dca3593bccc3c7ebd1a1c1d1780fbf1"
);
exports.vXVS = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0x151b1e2635a717bcdc836ecd6fbb62b674fe3e1d"),
  "Venus XVS",
  "vXVS",
  constants_1.cTokenDecimals
);
exports.XVS = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63"),
  "Venus",
  "XVS",
  18
);
// number of decimals the oracle results are scaled by.
exports.ORACLE_PRECISION = 18;
