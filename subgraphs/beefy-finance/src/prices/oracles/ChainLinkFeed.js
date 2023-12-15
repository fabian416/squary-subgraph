"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenPriceFromChainLink = exports.getChainLinkContract = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const types_1 = require("../common/types");
const ChainlinkOracle_1 = require("../../../generated/Standard/ChainlinkOracle");
const oracles_1 = require("./oracles");
const ERC20_1 = require("../../../generated/Standard/ERC20");
const constants_1 = require("../common/constants");
function getChainLinkContract(asset) {
  for (let i = 0; i < oracles_1.polygonOracles.length; i++) {
    if (oracles_1.polygonOracles[i][0] === asset) {
      return ChainlinkOracle_1.ChainlinkOracle.bind(
        graph_ts_1.Address.fromString(oracles_1.polygonOracles[i][1])
      );
    }
  }
  return ChainlinkOracle_1.ChainlinkOracle.bind(constants_1.ZERO_ADDRESS);
}
exports.getChainLinkContract = getChainLinkContract;
function getTokenPriceFromChainLink(tokenAddr) {
  const tokenContract = ERC20_1.ERC20.bind(tokenAddr);
  const symbol = tokenContract.symbol();
  const chainLinkContract = getChainLinkContract(symbol);
  if (chainLinkContract._address === constants_1.ZERO_ADDRESS) {
    return new types_1.CustomPriceType();
  }
  const result = chainLinkContract.try_latestRoundData();
  if (!result.reverted) {
    const decimals = tokenContract.decimals();
    return types_1.CustomPriceType.initialize(
      result.value.value1.toBigDecimal(),
      decimals
    );
  }
  return new types_1.CustomPriceType();
}
exports.getTokenPriceFromChainLink = getTokenPriceFromChainLink;
