"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SONNE_USDC_LP =
  exports.SONNE_ADDRESS =
  exports.nativeCToken =
  exports.nativeToken =
  exports.comptrollerAddr =
  exports.USDC_DECIMALS =
  exports.DEFAULT_DECIMALS =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
const mapping_1 = require("../../../src/mapping");
exports.DEFAULT_DECIMALS = 18;
exports.USDC_DECIMALS = 6;
//////////////////////////////
/////     Addresses      /////
//////////////////////////////
exports.comptrollerAddr = graph_ts_1.Address.fromString(
  "0x60CF091cD3f50420d50fD7f707414d0DF4751C58"
);
exports.nativeToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0x4200000000000000000000000000000000000042"),
  "Optimism",
  "OP",
  18
);
exports.nativeCToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0x8cD6b19A07d754bF36AdEEE79EDF4F2134a8F571"),
  "Sonne Optimism",
  "soOP",
  constants_1.cTokenDecimals
);
exports.SONNE_ADDRESS = graph_ts_1.Address.fromString(
  "0x1DB2466d9F5e10D7090E7152B68d62703a2245F0"
);
exports.SONNE_USDC_LP = graph_ts_1.Address.fromString(
  "0xc899C4D73ED8dF2eAd1543AB915888B0Bf7d57a2"
);
