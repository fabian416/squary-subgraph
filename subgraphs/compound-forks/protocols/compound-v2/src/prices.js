"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUSDPriceOfToken = void 0;
// compound's price oracle price getter
const constants_1 = require("./constants");
const schema_1 = require("../../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const PriceOracle2_1 = require("../../../generated/Comptroller/PriceOracle2");
const PriceOracle1_1 = require("../../../generated/Comptroller/PriceOracle1");
const constants_2 = require("../../../src/constants");
// returns the token price
function getUSDPriceOfToken(market, blockNumber) {
  const cTokenAddress = market.id;
  const getToken = schema_1.Token.load(market.inputToken);
  if (getToken == null) {
    graph_ts_1.log.error("Couldn't find input token for market {}", [
      market.id,
    ]);
    return constants_2.BIGDECIMAL_ZERO;
  }
  const getTokenAddress = getToken.id;
  const getTokenDecimals = getToken.decimals;
  let tokenPrice;
  // get usd price of token
  if (blockNumber > 10678764) {
    // after block 10678764 ETH price was calculated in USD instead of USDC
    const ethPriceUSD = getUSDPriceETH();
    if (cTokenAddress == constants_1.CETH_ADDRESS) {
      tokenPrice = ethPriceUSD.truncate(getTokenDecimals);
    } else {
      const tokenPriceUSD = getTokenPrice(
        blockNumber,
        graph_ts_1.Address.fromString(cTokenAddress),
        graph_ts_1.Address.fromString(getTokenAddress),
        getTokenDecimals
      );
      tokenPrice = tokenPriceUSD.truncate(getTokenDecimals);
    }
  } else {
    const usdPriceinInETH = getUSDCPriceETH(blockNumber);
    if (cTokenAddress == constants_1.CETH_ADDRESS) {
      tokenPrice =
        constants_2.BIGDECIMAL_ONE.div(usdPriceinInETH).truncate(
          getTokenDecimals
        );
    } else {
      const tokenPriceETH = getTokenPrice(
        blockNumber,
        graph_ts_1.Address.fromString(cTokenAddress),
        graph_ts_1.Address.fromString(getTokenAddress),
        getTokenDecimals
      );
      const underlyingPrice = tokenPriceETH.truncate(getTokenDecimals);
      if (
        cTokenAddress == constants_1.CUSDC_ADDRESS ||
        cTokenAddress == constants_1.CUSDT_ADDRESS ||
        cTokenAddress == constants_1.CTUSD_ADDRESS
      ) {
        tokenPrice = constants_2.BIGDECIMAL_ONE;
      } else {
        tokenPrice = underlyingPrice
          .div(usdPriceinInETH)
          .truncate(getTokenDecimals);
      }
    }
  }
  return tokenPrice;
}
exports.getUSDPriceOfToken = getUSDPriceOfToken;
/////////////////
//// Helpers ////
/////////////////
// get usd price of underlying tokens (NOT eth)
function getTokenPrice(
  blockNumber,
  cTokenAddress,
  underlyingAddress,
  underlyingDecimals
) {
  const protocol = schema_1.LendingProtocol.load(
    constants_1.COMPTROLLER_ADDRESS
  );
  const oracle2Address = graph_ts_1.Address.fromString(protocol._priceOracle);
  let underlyingPrice;
  const mantissaFactorBD = (0, constants_2.exponentToBigDecimal)(18);
  /**
   * Note: The first Price oracle was only used for the first ~100 blocks:
   *    https://etherscan.io/address/0x02557a5E05DeFeFFD4cAe6D83eA3d173B272c904
   *
   * PriceOracle2 is used starting aroun block 7715908 and we need the cToken
   * address. This returns the value without factoring in decimals and wei.
   *
   * So the number is divided by (ethDecimals - tokenDecimals) and again by mantissa
   * USDC = 10 ^ ((18 - 6) + 18) = 10 ^ 30
   *
   */
  if (blockNumber > 7715908) {
    // calculate using PriceOracle2
    const mantissaDecimalFactor = 18 - underlyingDecimals + 18;
    const bdFactor = (0, constants_2.exponentToBigDecimal)(
      mantissaDecimalFactor
    );
    const priceOracle2 = PriceOracle2_1.PriceOracle2.bind(oracle2Address);
    const tryPrice = priceOracle2.try_getUnderlyingPrice(cTokenAddress);
    underlyingPrice = tryPrice.reverted
      ? constants_2.BIGDECIMAL_ZERO
      : tryPrice.value.toBigDecimal().div(bdFactor);
  } else {
    /**
     * Calculate using PriceOracle1
     *
     * Note: this returns the value already factoring in token decimals and wei,
     * therefore we only need to divide by the mantissa, 10^18
     */
    const priceOracle1 = PriceOracle1_1.PriceOracle1.bind(
      graph_ts_1.Address.fromString(constants_1.PRICE_ORACLE1_ADDRESS)
    );
    underlyingPrice = priceOracle1
      .getPrice(underlyingAddress)
      .toBigDecimal()
      .div(mantissaFactorBD);
  }
  return underlyingPrice;
}
// get usdc price of ETH
function getUSDCPriceETH(blockNumber) {
  const protocol = schema_1.LendingProtocol.load(
    constants_1.COMPTROLLER_ADDRESS
  );
  const oracle2Address = graph_ts_1.Address.fromString(protocol._priceOracle);
  let usdcPrice;
  const mantissaFactorBD = (0, constants_2.exponentToBigDecimal)(18);
  // see getTokenPrice() for explanation
  if (blockNumber > 7715908) {
    const priceOracle2 = PriceOracle2_1.PriceOracle2.bind(oracle2Address);
    const mantissaDecimalFactorUSDC = 18 - constants_1.USDC_DECIMALS + 18;
    const bdFactorUSDC = (0, constants_2.exponentToBigDecimal)(
      mantissaDecimalFactorUSDC
    );
    const tryPrice = priceOracle2.try_getUnderlyingPrice(
      graph_ts_1.Address.fromString(constants_1.CUSDC_ADDRESS)
    );
    usdcPrice = tryPrice.reverted
      ? constants_2.BIGDECIMAL_ZERO
      : tryPrice.value.toBigDecimal().div(bdFactorUSDC);
  } else {
    const priceOracle1 = PriceOracle1_1.PriceOracle1.bind(
      graph_ts_1.Address.fromString(constants_1.PRICE_ORACLE1_ADDRESS)
    );
    usdcPrice = priceOracle1
      .getPrice(graph_ts_1.Address.fromString(constants_1.USDC_ADDRESS))
      .toBigDecimal()
      .div(mantissaFactorBD);
  }
  return usdcPrice;
}
function getUSDPriceETH() {
  const protocol = schema_1.LendingProtocol.load(
    constants_1.COMPTROLLER_ADDRESS
  );
  const mantissaFactorBD = (0, constants_2.exponentToBigDecimal)(18);
  const oracle2Address = graph_ts_1.Address.fromString(protocol._priceOracle);
  const priceOracle2 = PriceOracle2_1.PriceOracle2.bind(oracle2Address);
  const tryPrice = priceOracle2.try_getUnderlyingPrice(
    graph_ts_1.Address.fromString(constants_1.CETH_ADDRESS)
  );
  const ethPriceInUSD = tryPrice.reverted
    ? constants_2.BIGDECIMAL_ZERO
    : tryPrice.value.toBigDecimal().div(mantissaFactorBD);
  return ethPriceInUSD;
}
