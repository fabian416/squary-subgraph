"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BB_aUSD_ADDRESS =
  exports.rETH_ADDRESS =
  exports.IB_TOKEN_ADDRESS =
  exports.rETH_OP_USD_POOL_ADDRESS =
  exports.rETH_IB_POOL_ADDRESS =
  exports.BEETHOVEN_POOL_DEPLOYED_BLOCK =
  exports.getNetworkSpecificConstant =
  exports.NetworkSpecificConstant =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
class NetworkSpecificConstant {
  constructor(comptrollerAddr, network, unitPerYear) {
    this.comptrollerAddr = comptrollerAddr;
    this.network = network;
    this.unitPerYear = unitPerYear;
  }
}
exports.NetworkSpecificConstant = NetworkSpecificConstant;
function getNetworkSpecificConstant() {
  const network = graph_ts_1.dataSource.network();
  if (equalsIgnoreCase(network, constants_1.Network.MAINNET)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0xab1c342c7bf5ec5f02adea1c2270670bca144cbb"
      ),
      constants_1.Network.MAINNET,
      constants_1.ETHEREUM_BLOCKS_PER_YEAR
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.FANTOM)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x4250a6d3bd57455d7c6821eecb6206f507576cd2"
      ),
      constants_1.Network.FANTOM,
      // Iron bank on fantom actually calculates interest based on timestamp
      // See https://github.com/messari/subgraphs/issues/1746 for details
      constants_1.SECONDS_PER_YEAR
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.AVALANCHE)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x2ee80614ccbc5e28654324a66a396458fa5cd7cc"
      ),
      constants_1.Network.AVALANCHE,
      // Iron bank on avalance actually calculates interest based on timestamp
      // See https://github.com/messari/subgraphs/issues/1746 for details
      constants_1.SECONDS_PER_YEAR
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.OPTIMISM)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0xe0b57feed45e7d908f2d0dacd26f113cf26715bf"
      ),
      constants_1.Network.OPTIMISM,
      // Iron bank on optimism actually calculates interest based on timestamp
      // See https://github.com/messari/subgraphs/issues/1746 for details
      constants_1.SECONDS_PER_YEAR
    );
  } else {
    graph_ts_1.log.error(
      "[getNetworkSpecificConstant] Unsupported network {}",
      [network]
    );
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x0000000000000000000000000000000000000000"
      ),
      "",
      0
    );
  }
}
exports.getNetworkSpecificConstant = getNetworkSpecificConstant;
function equalsIgnoreCase(a, b) {
  return a.toLowerCase() == b.toLowerCase();
}
// contract addresses on optimism for reward emission USD calculation
exports.BEETHOVEN_POOL_DEPLOYED_BLOCK = graph_ts_1.BigInt.fromI32(25922732);
exports.rETH_IB_POOL_ADDRESS = "0x785f08fb77ec934c01736e30546f87b4daccbe50";
exports.rETH_OP_USD_POOL_ADDRESS = "0xb0de49429fbb80c635432bbad0b3965b28560177";
exports.IB_TOKEN_ADDRESS = "0x00a35fd824c717879bf370e70ac6868b95870dfb";
exports.rETH_ADDRESS = "0x9bcef72be871e61ed4fbbc7630889bee758eb81d";
exports.BB_aUSD_ADDRESS = "0x6222ae1d2a9f6894da50aa25cb7b303497f9bebd";
