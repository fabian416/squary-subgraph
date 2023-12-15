"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DECIMALS =
  exports.ZERO_ADDRESS =
  exports.MKR_ADDRESS =
  exports.DF_ADDRESS =
  exports.iETH_ADDRESS =
  exports.BigDecimalTruncateToBigInt =
  exports.prefixID =
  exports.enumToPrefix =
  exports.anyTrue =
  exports.getNetworkSpecificConstant =
  exports.NetworkSpecificConstant =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
// similar to Arbitrum block numbers issue below, set block numbers
// to those of mainnet
const OPTIMISM_BLOCKS_PER_YEAR = constants_1.ETHEREUM_BLOCKS_PER_YEAR;
const AVALANCHE_BLOCKS_PER_DAY = constants_1.AVALANCHE_BLOCKS_PER_YEAR / 365;
const BSC_BLOCKS_PER_DAY = constants_1.BSC_BLOCKS_PER_YEAR / 365;
const ETHEREUM_BLOCKS_PER_DAY = constants_1.ETHEREUM_BLOCKS_PER_YEAR / 365;
const MATIC_BLOCKS_PER_DAY = constants_1.MATIC_BLOCKS_PER_YEAR / 365;
const OPTIMISM_BLOCKS_PER_DAY = OPTIMISM_BLOCKS_PER_YEAR / 365;
// For interest rate and reward emission calculation,
// dforce use ethereum block number
// see discussion in https://github.com/messari/subgraphs/issues/939
const ARBITRUM_BLOCKS_PER_YEAR = constants_1.ETHEREUM_BLOCKS_PER_YEAR;
const ARBITRUM_BLOCKS_PER_DAY = ETHEREUM_BLOCKS_PER_DAY;
class NetworkSpecificConstant {
  constructor(
    comptrollerAddr,
    network,
    blocksPerDay,
    blocksPerYear,
    rewardTokenAddress
  ) {
    this.comptrollerAddr = comptrollerAddr;
    this.network = network;
    this.blocksPerDay = blocksPerDay;
    this.blocksPerYear = blocksPerYear;
    this.rewardTokenAddress = rewardTokenAddress;
  }
}
exports.NetworkSpecificConstant = NetworkSpecificConstant;
function getNetworkSpecificConstant() {
  const network = graph_ts_1.dataSource.network();
  if (equalsIgnoreCase(network, constants_1.Network.MAINNET)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x8B53Ab2c0Df3230EA327017C91Eb909f815Ad113"
      ),
      constants_1.Network.MAINNET,
      ETHEREUM_BLOCKS_PER_DAY,
      constants_1.ETHEREUM_BLOCKS_PER_YEAR,
      graph_ts_1.Address.fromString(
        "0x431ad2ff6a9C365805eBaD47Ee021148d6f7DBe0"
      )
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.BSC)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x0b53E608bD058Bb54748C35148484fD627E6dc0A"
      ),
      constants_1.Network.BSC,
      BSC_BLOCKS_PER_DAY,
      constants_1.BSC_BLOCKS_PER_YEAR,
      graph_ts_1.Address.fromString(
        "0x4a9a2b2b04549c3927dd2c9668a5ef3fca473623"
      )
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.ARBITRUM_ONE)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x8E7e9eA9023B81457Ae7E6D2a51b003D421E5408"
      ),
      constants_1.Network.ARBITRUM_ONE,
      ARBITRUM_BLOCKS_PER_DAY,
      ARBITRUM_BLOCKS_PER_YEAR,
      graph_ts_1.Address.fromString(
        "0xae6aab43c4f3e0cea4ab83752c278f8debaba689"
      )
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.OPTIMISM)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0xA300A84D8970718Dac32f54F61Bd568142d8BCF4"
      ),
      constants_1.Network.OPTIMISM,
      OPTIMISM_BLOCKS_PER_DAY,
      OPTIMISM_BLOCKS_PER_YEAR,
      graph_ts_1.Address.fromString(
        "0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3"
      )
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.MATIC)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x52eacd19e38d501d006d2023c813d7e37f025f37"
      ),
      constants_1.Network.MATIC,
      MATIC_BLOCKS_PER_DAY,
      constants_1.MATIC_BLOCKS_PER_YEAR,
      graph_ts_1.Address.fromString(
        "0x08c15fa26e519a78a666d19ce5c646d55047e0a3"
      )
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.AVALANCHE)) {
    return new NetworkSpecificConstant(
      graph_ts_1.Address.fromString(
        "0x75b9a7b6f55754d4d0e952da4bdb55eaea7df38e"
      ),
      constants_1.Network.AVALANCHE,
      AVALANCHE_BLOCKS_PER_DAY,
      constants_1.AVALANCHE_BLOCKS_PER_YEAR,
      graph_ts_1.Address.fromString(exports.ZERO_ADDRESS)
    );
  }
  graph_ts_1.log.error("[getNetworkSpecificConstant] Unsupported network {}", [
    network,
  ]);
  return new NetworkSpecificConstant(
    graph_ts_1.Address.fromString(exports.ZERO_ADDRESS),
    "",
    0,
    0,
    graph_ts_1.Address.fromString(exports.ZERO_ADDRESS)
  );
}
exports.getNetworkSpecificConstant = getNetworkSpecificConstant;
function equalsIgnoreCase(a, b) {
  return a.toLowerCase().replace("-", "_") == b.toLowerCase().replace("-", "_");
}
// whether any element of the input array is true
function anyTrue(inputArray) {
  return inputArray.some((element) => element == true);
}
exports.anyTrue = anyTrue;
// Converts snake case to kebab case and appends a hyphen.
// (e.g. "TRADING_FEE" to "trading-fee-"), mainly used to create entity IDs
function enumToPrefix(snake) {
  return snake.replace("_", "-") + "-";
}
exports.enumToPrefix = enumToPrefix;
// Prefix an ID with a enum string in order to differentiate IDs
// e.g. combine XPOOL, TRADING_FEE and 0x1234 into xpool-trading-fee-0x1234
function prefixID(ID, enumString1, enumString2 = null) {
  let prefix = enumToPrefix(enumString1);
  if (enumString2 != null) {
    prefix += enumToPrefix(enumString2);
  }
  return prefix + ID;
}
exports.prefixID = prefixID;
//convert BigDecimal to BigInt by truncating the decimal places
function BigDecimalTruncateToBigInt(x) {
  //let intStr = x.toString().split(".")[0];
  const intStr = x.truncate(0).toString();
  return graph_ts_1.BigInt.fromString(intStr);
}
exports.BigDecimalTruncateToBigInt = BigDecimalTruncateToBigInt;
exports.iETH_ADDRESS = "0x5acd75f21659a59ffab9aebaf350351a8bfaabc0";
exports.DF_ADDRESS = "0x431ad2ff6a9c365805ebad47ee021148d6f7dbe0";
exports.MKR_ADDRESS = "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2";
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.DEFAULT_DECIMALS = 18;
