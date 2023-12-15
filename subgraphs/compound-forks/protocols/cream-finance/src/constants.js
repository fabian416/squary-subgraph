"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETH_CUTOFF_BLOCK =
  exports.equalsIgnoreCase =
  exports.getNetworkSpecificConstant =
  exports.ETH_ADDRESS =
  exports.BNB_USD_CHAINLINK_ORACLE =
  exports.NetworkSpecificConstant =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
const mapping_1 = require("../../../src/mapping");
class NetworkSpecificConstant {
  constructor(
    comptrollerAddr,
    network,
    unitPerYear,
    nativeToken,
    nativeCToken
  ) {
    this.comptrollerAddr = comptrollerAddr;
    this.network = network;
    this.unitPerYear = unitPerYear;
    this.nativeToken = nativeToken;
    this.nativeCToken = nativeCToken;
  }
}
exports.NetworkSpecificConstant = NetworkSpecificConstant;
// Notable addresses
exports.BNB_USD_CHAINLINK_ORACLE = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";
exports.ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
function getNetworkSpecificConstant() {
  const network = graph_ts_1.dataSource.network();
  if (equalsIgnoreCase(network, constants_1.Network.MAINNET)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x3d5BC3c8d13dcB8bF317092d84783c2697AE9258"
      ),
      constants_1.Network.MAINNET,
      constants_1.ETHEREUM_BLOCKS_PER_YEAR,
      new mapping_1.TokenData(
        graph_ts_1.Address.fromString(exports.ETH_ADDRESS),
        "Ether",
        "ETH",
        18
      ),
      new mapping_1.TokenData(
        graph_ts_1.Address.fromString(
          "0xD06527D5e56A3495252A528C4987003b712860eE"
        ),
        "Cream Ether",
        "crETH",
        constants_1.cTokenDecimals
      )
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.BSC)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x589de0f0ccf905477646599bb3e5c622c84cc0ba"
      ),
      constants_1.Network.BSC,
      constants_1.BSC_BLOCKS_PER_YEAR,
      new mapping_1.TokenData(
        graph_ts_1.Address.fromString(
          "0x0000000000000000000000000000000000000000"
        ),
        "BNB",
        "BNB",
        18
      ),
      new mapping_1.TokenData(
        graph_ts_1.Address.fromString(
          "0x1ffe17b99b439be0afc831239ddecda2a790ff3a"
        ),
        "Cream BNB",
        "crBNB",
        constants_1.cTokenDecimals
      )
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.MATIC)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x20CA53E2395FA571798623F1cFBD11Fe2C114c24"
      ),
      constants_1.Network.MATIC,
      constants_1.MATIC_BLOCKS_PER_YEAR,
      null,
      null
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.ARBITRUM_ONE)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0xbadaC56c9aca307079e8B8FC699987AAc89813ee"
      ),
      constants_1.Network.ARBITRUM_ONE,
      constants_1.ARBITRUM_BLOCKS_PER_YEAR,
      null,
      null
    );
  } else {
    graph_ts_1.log.error(
      "[getNetworkSpecificConstant] Unsupported network: {}",
      [network]
    );
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x0000000000000000000000000000000000000000"
      ),
      "",
      0,
      null,
      null
    );
  }
}
exports.getNetworkSpecificConstant = getNetworkSpecificConstant;
function equalsIgnoreCase(a, b) {
  return a.replace("-", "_").toLowerCase() == b.replace("-", "_").toLowerCase();
}
exports.equalsIgnoreCase = equalsIgnoreCase;
// First ethereum block on October 27, 2021
// we are cutting off activity after this block since CREAM ethereum was "deprecated"
exports.ETH_CUTOFF_BLOCK = 13499798;
