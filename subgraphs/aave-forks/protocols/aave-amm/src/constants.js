"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equalsIgnoreCase =
  exports.getNetworkSpecificConstant =
  exports.NetworkSpecificConstant =
  exports.AMM_ADDRESS =
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
// https://etherscan.io/address/0xfbf029508c061b440d0cf7fd639e77fb2e196241#code#F55#L89
exports.FLASHLOAN_PREMIUM_TOTAL = graph_ts_1.BigDecimal.fromString("0.0009"); // = 9/10000
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
var Protocol;
(function (Protocol) {
  Protocol.PROTOCOL = "Aave";
  Protocol.NAME = "Aave AMM";
  Protocol.SLUG = "aave-amm";
})((Protocol = exports.Protocol || (exports.Protocol = {})));
exports.AAVE_DECIMALS = 8;
////////////////////////////
///// Network Specific /////
////////////////////////////
exports.AMM_ADDRESS = graph_ts_1.Address.fromString(
  "0xacc030ef66f9dfeae9cbb0cd1b25654b82cfa8d5"
);
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
    exports.AMM_ADDRESS,
    constants_1.Network.MAINNET
  );
}
exports.getNetworkSpecificConstant = getNetworkSpecificConstant;
function equalsIgnoreCase(a, b) {
  return a.replace("-", "_").toLowerCase() == b.replace("-", "_").toLowerCase();
}
exports.equalsIgnoreCase = equalsIgnoreCase;
