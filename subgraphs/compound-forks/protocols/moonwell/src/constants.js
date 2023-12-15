"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProtocolData = exports.NetworkSpecificConstant = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
const mapping_1 = require("../../../src/mapping");
class NetworkSpecificConstant {
  constructor(
    comptrollerAddress,
    network,
    nativeToken,
    nativeCToken,
    auxilaryRewardToken, // additional reward token, aside from native token
    nativeLPAddress,
    nativeLPStartBlock
  ) {
    this.comptrollerAddress = comptrollerAddress;
    this.network = network;
    this.nativeToken = nativeToken;
    this.nativeCToken = nativeCToken;
    this.auxilaryRewardToken = auxilaryRewardToken;
    this.nativeLPAddress = nativeLPAddress;
    this.nativeLPStartBlock = nativeLPStartBlock;
  }
}
exports.NetworkSpecificConstant = NetworkSpecificConstant;
function getProtocolData() {
  const network = graph_ts_1.dataSource.network();
  if (
    (0, constants_1.equalsIgnoreCase)(network, constants_1.Network.MOONRIVER)
  ) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x0b7a0EAA884849c6Af7a129e899536dDDcA4905E"
      ),
      constants_1.Network.MOONRIVER,
      moonriverNativeToken,
      moonriverNativeCToken,
      moonriverAuxilaryRewardToken,
      graph_ts_1.Address.fromString(
        "0xE6Bfc609A2e58530310D6964ccdd236fc93b4ADB"
      ), // solarbeam movr-mfam pair
      1512356
    );
  }
  if (
    (0, constants_1.equalsIgnoreCase)(network, constants_1.Network.MOONBEAM)
  ) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x8E00D5e02E65A19337Cdba98bbA9F84d4186a180"
      ),
      constants_1.Network.MOONBEAM,
      moonbeamNativeToken,
      moonbeamNativeCToken,
      moonbeamAuxilaryRewardToken,
      graph_ts_1.Address.fromString(
        "0xb536c1F9A157B263B70A9a35705168ACC0271742"
      ), // solarbeam well-glmr pair
      1277866
    );
  }
  graph_ts_1.log.critical("Unsupported network: {}", [network]);
  return new NetworkSpecificConstant(
    graph_ts_1.Address.fromString("0x0"),
    network,
    moonriverNativeToken,
    moonriverNativeCToken,
    moonbeamAuxilaryRewardToken,
    graph_ts_1.Address.fromString("0x0"),
    0
  );
}
exports.getProtocolData = getProtocolData;
//
//
// TokenData classes
const moonriverNativeToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"),
  "MOVR",
  "MOVR",
  18
);
const moonriverNativeCToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0x6a1A771C7826596652daDC9145fEAaE62b1cd07f"),
  "Moonwell MOVR",
  "mMOVR",
  constants_1.cTokenDecimals
);
const moonbeamNativeToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"),
  "GLMR",
  "GLMR",
  18
);
const moonbeamNativeCToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0x091608f4e4a15335145be0A279483C0f8E4c7955"),
  "Moonwell GLMR",
  "mGLMR",
  constants_1.cTokenDecimals
);
const moonriverAuxilaryRewardToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0xbb8d88bcd9749636bc4d2be22aac4bb3b01a58f1"),
  "MFAM",
  "MFAM",
  18
);
const moonbeamAuxilaryRewardToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0x511aB53F793683763E5a8829738301368a2411E3"),
  "WELL",
  "WELL",
  18
);
