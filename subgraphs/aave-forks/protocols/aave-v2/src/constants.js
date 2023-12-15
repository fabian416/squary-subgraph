"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equalsIgnoreCase =
  exports.getNetworkSpecificConstant =
  exports.NetworkSpecificConstant =
  exports.FLASHLOAN_PREMIUM_TOTAL =
  exports.AAVE_DECIMALS =
  exports.Protocol =
  exports.USDC_POS_TOKEN_ADDRESS =
  exports.USDC_TOKEN_ADDRESS =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
//////////////////////////////
///// Ethereum Addresses /////
//////////////////////////////
exports.USDC_TOKEN_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // ETH
exports.USDC_POS_TOKEN_ADDRESS = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"; // Polygon
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
var Protocol;
(function (Protocol) {
  Protocol.PROTOCOL = "Aave";
  Protocol.NAME = "Aave v2";
  Protocol.SLUG = "aave-v2";
})((Protocol = exports.Protocol || (exports.Protocol = {})));
exports.AAVE_DECIMALS = 8;
// This is hardcoded and can not be changed, so it is set as a constant here
// https://etherscan.io/address/0x05bfa9157e92690b179033ca2f6dd1e86b25ea4d#code#F96#L89
exports.FLASHLOAN_PREMIUM_TOTAL = graph_ts_1.BigDecimal.fromString("0.0009"); // = 9/10000
////////////////////////////
///// Network Specific /////
////////////////////////////
class NetworkSpecificConstant {
  constructor(
    protocolAddress, // aka, LendingPoolAddressesProvider
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
        "0xb53c1a33016b2dc2ff3653530bff1848a515c8c5"
      ),
      constants_1.Network.MAINNET
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.AVALANCHE)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0xb6a86025f0fe1862b372cb0ca18ce3ede02a318f"
      ),
      constants_1.Network.AVALANCHE
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.MATIC)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0xd05e3e715d945b59290df0ae8ef85c1bdb684744"
      ),
      constants_1.Network.MATIC
    );
  } else {
    graph_ts_1.log.error(
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
