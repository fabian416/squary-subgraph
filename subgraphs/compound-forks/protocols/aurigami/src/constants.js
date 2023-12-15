"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USDT_MARKET =
  exports.ETH_MARKET =
  exports.WNEAR_MARKET =
  exports.WNEAR_USN_LP =
  exports.TRI_USDT_LP =
  exports.AURORA_ETH_LP =
  exports.WNEAR_PLY_LP =
  exports.USN_MARKET =
  exports.TRI_MARKET =
  exports.AURORA_MARKET =
  exports.PLY_MARKET =
  exports.AURI_LENS_CONTRACT_ADDRESS =
  exports.AURORA_TOKEN_ADDRESS =
  exports.PLY_TOKEN_ADDRESS =
  exports.nativeCToken =
  exports.nativeToken =
  exports.comptrollerAddr =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
const mapping_1 = require("../../../src/mapping");
//////////////////////////////
/////     Addresses      /////
//////////////////////////////
exports.comptrollerAddr = graph_ts_1.Address.fromString(
  "0x817af6cfAF35BdC1A634d6cC94eE9e4c68369Aeb"
);
exports.nativeToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"),
  "Ether",
  "ETH",
  18
);
exports.nativeCToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0xca9511B610bA5fc7E311FDeF9cE16050eE4449E9"),
  "Aurigami Ether",
  "auETH",
  constants_1.cTokenDecimals
);
exports.PLY_TOKEN_ADDRESS = graph_ts_1.Address.fromString(
  "0x09c9d464b58d96837f8d8b6f4d9fe4ad408d3a4f"
);
exports.AURORA_TOKEN_ADDRESS = graph_ts_1.Address.fromString(
  "0x8bec47865ade3b172a928df8f990bc7f2a3b9f79"
);
exports.AURI_LENS_CONTRACT_ADDRESS = graph_ts_1.Address.fromString(
  "0xFfdFfBDB966Cb84B50e62d70105f2Dbf2e0A1e70"
);
// Markets with broken price oracles
exports.PLY_MARKET = graph_ts_1.Address.fromString(
  "0xc9011e629c9d0b8b1e4a2091e123fbb87b3a792c"
);
exports.AURORA_MARKET = graph_ts_1.Address.fromString(
  "0x8888682e24dd4df7b7ff2b91fccb575737e433bf"
);
exports.TRI_MARKET = graph_ts_1.Address.fromString(
  "0x6ea6c03061bddce23d4ec60b6e6e880c33d24dca"
);
exports.USN_MARKET = graph_ts_1.Address.fromString(
  "0x5ccad065400341db391fd3a4b7f50087b678d7cc"
);
// Trisolaris LP Pools to get the price of the above tokens
// PLY market / wNEAR/PLY LP > missing first 2 days
// reserve0 -> PLY
// reserve1 -> wNEAR
exports.WNEAR_PLY_LP = graph_ts_1.Address.fromString(
  "0x044b6b0cd3bb13d2b9057781df4459c66781dce7"
);
// AURORA market / AURORA/ETH LP
// reserve0 -> AURORA
// reserve1 -> ETH
exports.AURORA_ETH_LP = graph_ts_1.Address.fromString(
  "0x5eeC60F348cB1D661E4A5122CF4638c7DB7A886e"
);
// TRI market / TRI/USDT LP
// reserve0 -> USDT.e
// reserve1 -> TRI
exports.TRI_USDT_LP = graph_ts_1.Address.fromString(
  "0x61C9E05d1Cdb1b70856c7a2c53fA9c220830633c"
);
// USN market / wNEAR/USN LP > missing first month
// reserve0 -> USN
// reserve1 -> wNEAR
exports.WNEAR_USN_LP = graph_ts_1.Address.fromString(
  "0xA36DF7c571bEbA7B3fB89F25dFc990EAC75F525A"
);
// Helper market addresses
exports.WNEAR_MARKET = graph_ts_1.Address.fromString(
  "0xae4fac24dcdae0132c6d04f564dcf059616e9423"
);
exports.ETH_MARKET = graph_ts_1.Address.fromString(
  "0xca9511b610ba5fc7e311fdef9ce16050ee4449e9"
);
exports.USDT_MARKET = graph_ts_1.Address.fromString(
  "0xad5a2437ff55ed7a8cad3b797b3ec7c5a19b1c54"
);
