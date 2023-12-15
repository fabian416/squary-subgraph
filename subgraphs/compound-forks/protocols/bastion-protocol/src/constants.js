"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REWARD_TOKENS =
  exports.stNearOracle =
  exports.cStNearContract =
  exports.STNEAR_TOKEN_ADDRESS =
  exports.nearOracle =
  exports.cNearContract =
  exports.NEAR_TOKEN_ADDRESS =
  exports.bstnOracle =
  exports.cBSTNContract =
  exports.BSTN_TOKEN_ADDRESS =
  exports.nativeCToken =
  exports.nativeToken =
  exports.rewardDistributorAddress =
  exports.MULTICHAIN_REALM_ADDRESS =
  exports.STNEAR_REALM_ADDRESS =
  exports.AURORA_REALM_ADDRESS =
  exports.comptrollerAddr =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
const mapping_1 = require("../../../src/mapping");
//////////////////////////////
/////     Addresses      /////
//////////////////////////////
exports.comptrollerAddr = graph_ts_1.Address.fromString(
  "0x6de54724e128274520606f038591a00c5e94a1f6"
);
exports.AURORA_REALM_ADDRESS = graph_ts_1.Address.fromString(
  "0xe1cf09bda2e089c63330f0ffe3f6d6b790835973"
);
exports.STNEAR_REALM_ADDRESS = graph_ts_1.Address.fromString(
  "0xe550a886716241afb7ee276e647207d7667e1e79"
);
exports.MULTICHAIN_REALM_ADDRESS = graph_ts_1.Address.fromString(
  "0xa195b3d7aa34e47fb2d2e5a682df2d9efa2daf06"
);
exports.rewardDistributorAddress = graph_ts_1.Address.fromString(
  "0x98e8d4b4f53fa2a2d1b9c651af919fc839ee4c1a"
);
exports.nativeToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"),
  "Ether",
  "ETH",
  18
);
exports.nativeCToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0x4e8fe8fd314cfc09bdb0942c5adcc37431abdcd0"),
  "Bastion Ether",
  "cETH",
  constants_1.cTokenDecimals
);
exports.BSTN_TOKEN_ADDRESS = graph_ts_1.Address.fromString(
  "0x9f1f933c660a1dc856f0e0fe058435879c5ccef0"
);
exports.cBSTNContract = graph_ts_1.Address.fromString(
  "0x08ac1236ae3982ec9463efe10f0f320d9f5a9a4b"
);
exports.bstnOracle = graph_ts_1.Address.fromString(
  "0x4fa59cae2b1e0d3bbadb3385ba29b0b35822e8ad"
);
exports.NEAR_TOKEN_ADDRESS = graph_ts_1.Address.fromString(
  "0xc42c30ac6cc15fac9bd938618bcaa1a1fae8501d"
);
exports.cNearContract = graph_ts_1.Address.fromString(
  "0x8c14ea853321028a7bb5e4fb0d0147f183d3b677"
);
exports.nearOracle = graph_ts_1.Address.fromString(
  "0x91a99a522d6fc3a424701b875497279c426c1d70"
);
exports.STNEAR_TOKEN_ADDRESS = graph_ts_1.Address.fromString(
  "0x07f9f7f963c5cd2bbffd30ccfb964be114332e30"
);
exports.cStNearContract = graph_ts_1.Address.fromString(
  "0x30fff4663a8dcdd9ed81e60acf505e6159f19bbc"
);
exports.stNearOracle = graph_ts_1.Address.fromString(
  "0x71ebea24b18f6ecf97c5a5bcaef3e0639575f08c"
);
// reward token mappings
exports.REWARD_TOKENS = [
  graph_ts_1.Address.fromString("0x9f1f933c660a1dc856f0e0fe058435879c5ccef0"),
  graph_ts_1.Address.fromString("0xc42c30ac6cc15fac9bd938618bcaa1a1fae8501d"), // wNEAR (index 1)
  //some realm market has Meta as a reward token e.g Staked NEAR Realm
];
