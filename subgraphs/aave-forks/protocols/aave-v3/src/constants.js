"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POOL_ADDRESSES_PROVIDER_ID_KEY =
  exports.PROTOCOL_ID_KEY =
  exports.equalsIgnoreCase =
  exports.getNetworkSpecificConstant =
  exports.NetworkSpecificConstant =
  exports.InterestRateMode =
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
  Protocol.NAME = "Aave v3";
  Protocol.SLUG = "aave-v3";
})((Protocol = exports.Protocol || (exports.Protocol = {})));
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
  if (equalsIgnoreCase(network, constants_1.Network.ARBITRUM_ONE)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x770ef9f4fe897e59dacc474ef11238303f9552b6"
      ),
      constants_1.Network.ARBITRUM_ONE
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.AVALANCHE)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x770ef9f4fe897e59dacc474ef11238303f9552b6"
      ),
      constants_1.Network.AVALANCHE
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.FANTOM)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x770ef9f4fe897e59dacc474ef11238303f9552b6"
      ),
      constants_1.Network.FANTOM
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.HARMONY)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x770ef9f4fe897e59dacc474ef11238303f9552b6"
      ),
      constants_1.Network.HARMONY
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.MATIC)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x770ef9f4fe897e59dacc474ef11238303f9552b6"
      ),
      constants_1.Network.MATIC
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.OPTIMISM)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x770ef9f4fe897e59dacc474ef11238303f9552b6"
      ),
      constants_1.Network.OPTIMISM
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.MAINNET)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0xbaa999ac55eace41ccae355c77809e68bb345170"
      ),
      constants_1.Network.MAINNET
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.METIS)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x9e7b73ffd9d2026f3ff4212c29e209e09c8a91f5"
      ),
      constants_1.Network.METIS
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.BASE)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0xe20fcbdbffc4dd138ce8b2e6fbb6cb49777ad64d"
      ),
      constants_1.Network.BASE
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
// Context keys
exports.PROTOCOL_ID_KEY = "protocolId";
exports.POOL_ADDRESSES_PROVIDER_ID_KEY = "poolAddressesProviderId";
