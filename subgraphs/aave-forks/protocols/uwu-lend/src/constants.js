"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equalsIgnoreCase =
  exports.getNetworkSpecificConstant =
  exports.NetworkSpecificConstant =
  exports.PROTOCOL_ADDRESS =
  exports.FLASHLOAN_PREMIUM_TOTAL =
  exports.UWU_WETH_LP =
  exports.WETH_TOKEN_ADDRESS =
  exports.UWU_TOKEN_ADDRESS =
  exports.UWU_DECIMALS =
  exports.Protocol =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
var Protocol;
(function (Protocol) {
  Protocol.PROTOCOL = "UwU Lend";
  Protocol.NAME = "UwU Lend";
  Protocol.SLUG = "uwu-lend";
})((Protocol = exports.Protocol || (exports.Protocol = {})));
exports.UWU_DECIMALS = 8;
exports.UWU_TOKEN_ADDRESS = "0x55c08ca52497e2f1534b59e2917bf524d4765257";
exports.WETH_TOKEN_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
exports.UWU_WETH_LP = "0x3e04863dba602713bb5d0edbf7db7c3a9a2b6027"; // Sushiswap LP
// This is hardcoded and can not be changed, so it is set as a constant here
// https://github.com/aave/protocol-v2/blob/ce53c4a8c8620125063168620eba0a8a92854eb8/contracts/protocol/lendingpool/LendingPool.sol#L89
exports.FLASHLOAN_PREMIUM_TOTAL = graph_ts_1.BigDecimal.fromString("0.0009"); // 9/10000
////////////////////////////
///// Network Specific /////
////////////////////////////
exports.PROTOCOL_ADDRESS = graph_ts_1.Address.fromString(
  "0x011c0d38da64b431a1bdfc17ad72678eabf7f1fb"
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
    exports.PROTOCOL_ADDRESS,
    constants_1.Network.MAINNET
  );
}
exports.getNetworkSpecificConstant = getNetworkSpecificConstant;
function equalsIgnoreCase(a, b) {
  return a.replace("-", "_").toLowerCase() == b.replace("-", "_").toLowerCase();
}
exports.equalsIgnoreCase = equalsIgnoreCase;
