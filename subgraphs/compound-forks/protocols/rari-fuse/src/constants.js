"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareNormalizedString =
  exports.PROTOCOL_SLUG =
  exports.PROTOCOL_NAME =
  exports.BLOCKLIST_MARKETS =
  exports.FLOAT_ADDRESS =
  exports.FLOAT_MARKET_ADDRESS =
  exports.VESPER_V_DOLLAR_ADDRESS =
  exports.FMIM_ADDRESS =
  exports.GOHM_ADDRESS =
  exports.SOHM_ADDRESS =
  exports.ETH_SYMBOL =
  exports.ETH_NAME =
  exports.ETH_ADDRESS =
  exports.ZERO_ADDRESS =
  exports.getNetworkSpecificConstant =
  exports.NetworkSpecificConstant =
    void 0;
// rari fuse v1 constants
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
/////////////////////////
//// Network Config  ////
/////////////////////////
class NetworkSpecificConstant {
  constructor(fusePoolDirectoryAddress, ethPriceOracle, network) {
    this.fusePoolDirectoryAddress = fusePoolDirectoryAddress;
    this.ethPriceOracle = ethPriceOracle;
    this.network = network;
  }
}
exports.NetworkSpecificConstant = NetworkSpecificConstant;
function getNetworkSpecificConstant() {
  const network = graph_ts_1.dataSource.network();
  if (equalsIgnoreCase(network, constants_1.Network.MAINNET)) {
    return new NetworkSpecificConstant(
      "0x835482fe0532f169024d5e9410199369aad5c77e",
      "0x1887118e49e0f4a78bd71b792a49de03504a764d",
      constants_1.Network.MAINNET
    );
  } else {
    return new NetworkSpecificConstant(
      "0xc201b8c8dd22c779025e16f1825c90e1e6dd6a08",
      "0xeeA67B2F24aa83ee5D0aFa569E8f45245e2ee803",
      constants_1.Network.ARBITRUM_ONE
    );
  }
}
exports.getNetworkSpecificConstant = getNetworkSpecificConstant;
function equalsIgnoreCase(a, b) {
  return a.replace("-", "_").toLowerCase() == b.replace("-", "_").toLowerCase();
}
////////////////////////////
//// Ethereum Addresses ////
////////////////////////////
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
exports.ETH_NAME = "Ether";
exports.ETH_SYMBOL = "ETH";
exports.SOHM_ADDRESS = "0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f";
exports.GOHM_ADDRESS = "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f";
exports.FMIM_ADDRESS = "0xd9444bab79720e8223b83e5d913d00c679b44b65";
exports.VESPER_V_DOLLAR_ADDRESS = "0x2914e8c1c2c54e5335dc9554551438c59373e807";
exports.FLOAT_MARKET_ADDRESS = "0x898beab27b8d44501de79b946f8d4c67918e1c47";
exports.FLOAT_ADDRESS = "0xb05097849bca421a3f51b249ba6cca4af4b97cb9";
// blocklist markets
// these pools have exotic tokens with low liquidity, and the prices are artificially inflated
// removing so it does not convolute the data
exports.BLOCKLIST_MARKETS = [
  "0xc0c997227922004da3a47185ac2be1d648db0062",
  "0xc47560509492e787542203e44e7cd7abca477f8f", // testpool3 Lantern Adequate Monetary Product
];
///////////////////////////
//// Protocol Specific ////
///////////////////////////
exports.PROTOCOL_NAME = "Rari Fuse";
exports.PROTOCOL_SLUG = "rari-fuse";
///////////////////////////
//// Helper Functions ////
///////////////////////////
function compareNormalizedString(a, b) {
  a = a.replace("_", "-").toLowerCase();
  b = b.replace("_", "-").toLowerCase();
  return a == b;
}
exports.compareNormalizedString = compareNormalizedString;
