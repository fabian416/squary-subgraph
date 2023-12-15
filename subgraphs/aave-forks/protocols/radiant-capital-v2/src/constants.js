"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkSpecificConstant =
  exports.NetworkSpecificConstant =
  exports.FLASHLOAN_PREMIUM_TOTAL =
  exports.rTOKEN_DECIMALS =
  exports.Protocol =
  exports.getRewardConfig =
  exports.BSC_REWARD_CONFIG =
  exports.ARBITRUM_REWARD_CONFIG =
  exports.RewardConfig =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
const helpers_1 = require("../../../src/helpers");
///////////////////////
///// Reward Info /////
///////////////////////
class RewardConfig {
  constructor(
    rewardTokenAddress,
    otherPoolTokenAddress,
    poolAddress, // used for pricing the token
    rTokenMarket // used to price the other token in the market
  ) {
    this.rewardTokenAddress = rewardTokenAddress;
    this.otherPoolTokenAddress = otherPoolTokenAddress;
    this.poolAddress = poolAddress;
    this.rTokenMarket = rTokenMarket;
  }
}
exports.RewardConfig = RewardConfig;
exports.ARBITRUM_REWARD_CONFIG = new RewardConfig(
  "0x3082cc23568ea640225c2467653db90e9250aaa0", // RDNT token
  "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // WETH token
  "0xa8ba5f3ccfb8d2b7f4225e371cde11871e088933", // RDNT/WETH pool
  "0x0df5dfd95966753f01cb80e76dc20ea958238c46" // rWETH market
);
exports.BSC_REWARD_CONFIG = new RewardConfig(
  "0xf7de7e8a6bd59ed41a4b5fe50278b3b7f31384df", // RDNT token
  constants_1.ZERO_ADDRESS, // NO POOL
  constants_1.ZERO_ADDRESS, // NO POOL
  constants_1.ZERO_ADDRESS // NO POOL
);
function getRewardConfig() {
  const network = graph_ts_1.dataSource.network();
  if (
    (0, helpers_1.equalsIgnoreCase)(network, constants_1.Network.ARBITRUM_ONE)
  ) {
    return exports.ARBITRUM_REWARD_CONFIG;
  }
  if ((0, helpers_1.equalsIgnoreCase)(network, constants_1.Network.BSC)) {
    return exports.BSC_REWARD_CONFIG;
  }
  graph_ts_1.log.error("[getRewardConfig] Unsupported network {}", [network]);
  return new RewardConfig(
    constants_1.ZERO_ADDRESS,
    constants_1.ZERO_ADDRESS,
    constants_1.ZERO_ADDRESS,
    constants_1.ZERO_ADDRESS
  );
}
exports.getRewardConfig = getRewardConfig;
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
var Protocol;
(function (Protocol) {
  Protocol.PROTOCOL = "Radiant Capital";
  Protocol.NAME = "Radiant Capital V2";
  Protocol.SLUG = "radiant-capital-v2";
})((Protocol = exports.Protocol || (exports.Protocol = {})));
// Number of decimals in which rToken oracle prices are returned.
exports.rTOKEN_DECIMALS = 8;
// This is hardcoded and can not be changed, so it is set as a constant here
// https://arbiscan.io/address/0xd1b589c00c940c4c3f7b25e53c8d921c44ef9140#code#F19#L97
exports.FLASHLOAN_PREMIUM_TOTAL = graph_ts_1.BigDecimal.fromString("0.0009"); // = 9/10000
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
  if (
    (0, helpers_1.equalsIgnoreCase)(network, constants_1.Network.ARBITRUM_ONE)
  ) {
    return new NetworkSpecificConstant(
      "0x091d52cace1edc5527c99cdcfa6937c1635330e4",
      constants_1.Network.ARBITRUM_ONE
    );
  } else if (
    (0, helpers_1.equalsIgnoreCase)(network, constants_1.Network.BSC)
  ) {
    return new NetworkSpecificConstant(
      "0x63764769da006395515c3f8aff9c91a809ef6607",
      constants_1.Network.BSC
    );
  } else {
    graph_ts_1.log.critical(
      "[getNetworkSpecificConstant] Unsupported network: {}",
      [network]
    );
    return new NetworkSpecificConstant(constants_1.ZERO_ADDRESS, "");
  }
}
exports.getNetworkSpecificConstant = getNetworkSpecificConstant;
