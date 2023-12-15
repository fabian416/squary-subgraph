"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equalsIgnoreCase =
  exports.getNetworkSpecificConstant =
  exports.NetworkSpecificConstant =
  exports.RWA_ADDRESS =
  exports.AAVE_DECIMALS =
  exports.Protocol =
  exports.FLASHLOAN_PREMIUM_TOTAL =
  exports.USDC_TOKEN_ADDRESS =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
//////////////////////////////
///// Ethereum Addresses /////
//////////////////////////////
exports.USDC_TOKEN_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
// This is hardcoded and can not be changed, so it is set as a constant here
// http://etherscan.io/address/0x1b94587eef7538b99c348781720af92cd71f7f4d#code#F1#L89
exports.FLASHLOAN_PREMIUM_TOTAL = graph_ts_1.BigDecimal.fromString("0.0009"); // = 9/10000
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
var Protocol;
(function (Protocol) {
  Protocol.PROTOCOL = "Aave";
  Protocol.NAME = "Aave RWA";
  Protocol.SLUG = "aave-rwa";
})((Protocol = exports.Protocol || (exports.Protocol = {})));
exports.AAVE_DECIMALS = 8;
////////////////////////////
///// Network Specific /////
////////////////////////////
exports.RWA_ADDRESS = graph_ts_1.Address.fromString(
  "0xb953a066377176092879a151c07798b3946eea4b"
); // protocol id
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
  return new NetworkSpecificConstant(
    exports.RWA_ADDRESS,
    constants_1.Network.MAINNET
  );
}
exports.getNetworkSpecificConstant = getNetworkSpecificConstant;
function equalsIgnoreCase(a, b) {
  return a.replace("-", "_").toLowerCase() == b.replace("-", "_").toLowerCase();
}
exports.equalsIgnoreCase = equalsIgnoreCase;
