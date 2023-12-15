"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equalsIgnoreCase =
  exports.getNetworkSpecificConstant =
  exports.NetworkSpecificConstant =
  exports.InterestRateMode =
  exports.AAVE_DECIMALS =
  exports.IavsTokenType =
  exports.Protocol =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
var Protocol;
(function (Protocol) {
  Protocol.PROTOCOL = "Spark Lend";
  Protocol.NAME = "Spark Lend";
  Protocol.SLUG = "spark-lend";
})((Protocol = exports.Protocol || (exports.Protocol = {})));
var IavsTokenType;
(function (IavsTokenType) {
  IavsTokenType.ATOKEN = "ATOKEN";
  IavsTokenType.INPUTTOKEN = "INPUTTOKEN";
  IavsTokenType.VTOKEN = "VTOKEN";
  IavsTokenType.STOKEN = "STOKEN";
})((IavsTokenType = exports.IavsTokenType || (exports.IavsTokenType = {})));
exports.AAVE_DECIMALS = 8;
var InterestRateMode;
(function (InterestRateMode) {
  InterestRateMode.NONE = 0;
  InterestRateMode.STABLE = 1;
  InterestRateMode.VARIABLE = 2;
})(
  (InterestRateMode =
    exports.InterestRateMode || (exports.InterestRateMode = {}))
);
////////////////////////////
///// Network Specific /////
////////////////////////////
class NetworkSpecificConstant {
  constructor(
    protocolAddress, // aka, PoolAddressesProviderRegistry
    network
  ) {
    this.protocolAddress = protocolAddress;
    this.network = network;
  }
}
exports.NetworkSpecificConstant = NetworkSpecificConstant;
function getNetworkSpecificConstant() {
  const network = graph_ts_1.dataSource.network();
  if (equalsIgnoreCase(network, constants_1.Network.MAINNET)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x03cfa0c4622ff84e50e75062683f44c9587e6cc1"
      ),
      constants_1.Network.MAINNET
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.GNOSIS)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0xa98dacb3fc964a6a0d2ce3b77294241585eaba6d"
      ),
      constants_1.Network.GNOSIS
    );
  } else {
    graph_ts_1.log.critical(
      "[getNetworkSpecificConstant] Unsupported network: {}",
      [network]
    );
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS),
      ""
    );
  }
}
exports.getNetworkSpecificConstant = getNetworkSpecificConstant;
function equalsIgnoreCase(a, b) {
  return a.replace("-", "_").toLowerCase() == b.replace("-", "_").toLowerCase();
}
exports.equalsIgnoreCase = equalsIgnoreCase;
