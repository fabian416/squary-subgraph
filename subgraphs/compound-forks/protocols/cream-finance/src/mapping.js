"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer =
  exports.handleAccrueInterest =
  exports.handleLiquidateBorrow =
  exports.handleRepayBorrow =
  exports.handleBorrow =
  exports.handleRedeem =
  exports.handleMint =
  exports.handleNewReserveFactor =
  exports.handleActionPaused =
  exports.handleNewLiquidationIncentive =
  exports.handleNewCollateralFactor =
  exports.handleMarketListed =
  exports.handleMarketExited =
  exports.handleMarketEntered =
  exports.handleNewPriceOracle =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../../../src/constants");
const mapping_1 = require("../../../src/mapping");
// otherwise import from the specific subgraph root
const CToken_1 = require("../../../generated/Comptroller/CToken");
const Comptroller_1 = require("../../../generated/Comptroller/Comptroller");
const templates_1 = require("../../../generated/templates");
const ERC20_1 = require("../../../generated/Comptroller/ERC20");
const constants_2 = require("./constants");
const PriceOracle_1 = require("../../../generated/templates/CToken/PriceOracle");
const prices_1 = require("./prices");
const Oracle_1 = require("../../../generated/templates/CToken/Oracle");
// Global variables
let isDeprecated = false;
// Constant values
const constant = (0, constants_2.getNetworkSpecificConstant)();
const comptrollerAddr = constant.comptrollerAddr;
const network = constant.network;
const unitPerYear = constant.unitPerYear;
const nativeToken = constant.nativeToken;
const nativeCToken = constant.nativeCToken;
function handleNewPriceOracle(event) {
  if (
    isDeprecated ||
    deprecateSubgraph(event.block.number, event.block.timestamp)
  ) {
    return;
  }
  const protocol = getOrCreateProtocol();
  const newPriceOracle = event.params.newPriceOracle;
  (0, mapping_1._handleNewPriceOracle)(protocol, newPriceOracle);
}
exports.handleNewPriceOracle = handleNewPriceOracle;
function handleMarketEntered(event) {
  if (
    isDeprecated ||
    deprecateSubgraph(event.block.number, event.block.timestamp)
  ) {
    return;
  }
  (0, mapping_1._handleMarketEntered)(
    comptrollerAddr,
    event.params.cToken.toHexString(),
    event.params.account.toHexString(),
    true
  );
}
exports.handleMarketEntered = handleMarketEntered;
function handleMarketExited(event) {
  if (
    isDeprecated ||
    deprecateSubgraph(event.block.number, event.block.timestamp)
  ) {
    return;
  }
  (0, mapping_1._handleMarketEntered)(
    comptrollerAddr,
    event.params.cToken.toHexString(),
    event.params.account.toHexString(),
    false
  );
}
exports.handleMarketExited = handleMarketExited;
function handleMarketListed(event) {
  if (
    isDeprecated ||
    deprecateSubgraph(event.block.number, event.block.timestamp)
  ) {
    return;
  }
  templates_1.CToken.create(event.params.cToken);
  const cTokenAddr = event.params.cToken;
  // cream finance emits a MarketListed event that lists an invalid CToken
  // hardcode to skip it otherwise it messes up ETH token
  if (
    cTokenAddr ==
    graph_ts_1.Address.fromString("0xbdf447b39d152d6a234b4c02772b8ab5d1783f72")
  ) {
    return;
  }
  const cToken = schema_1.Token.load(cTokenAddr.toHexString());
  if (cToken != null) {
    return;
  }
  // this is a new cToken, a new underlying token, and a new market
  const protocol = getOrCreateProtocol();
  const cTokenContract = CToken_1.CToken.bind(event.params.cToken);
  const cTokenReserveFactorMantissa = (0, mapping_1.getOrElse)(
    cTokenContract.try_reserveFactorMantissa(),
    constants_1.BIGINT_ZERO
  );
  if (nativeToken && nativeCToken && cTokenAddr == nativeCToken.address) {
    // compilor is too silly to figure out this is not-null, hence the !
    const marketListedData = new mapping_1.MarketListedData(
      protocol,
      nativeToken,
      nativeCToken,
      cTokenReserveFactorMantissa
    );
    (0, mapping_1._handleMarketListed)(marketListedData, event);
    return;
  }
  const underlyingTokenAddrResult = cTokenContract.try_underlying();
  if (underlyingTokenAddrResult.reverted) {
    graph_ts_1.log.warning(
      "[handleMarketListed] could not fetch underlying token of cToken: {}",
      [cTokenAddr.toHexString()]
    );
    return;
  }
  const underlyingTokenAddr = underlyingTokenAddrResult.value;
  const underlyingTokenContract = ERC20_1.ERC20.bind(underlyingTokenAddr);
  (0, mapping_1._handleMarketListed)(
    new mapping_1.MarketListedData(
      protocol,
      new mapping_1.TokenData(
        underlyingTokenAddr,
        (0, mapping_1.getOrElse)(underlyingTokenContract.try_name(), "unknown"),
        (0, mapping_1.getOrElse)(
          underlyingTokenContract.try_symbol(),
          "unknown"
        ),
        (0, mapping_1.getOrElse)(underlyingTokenContract.try_decimals(), 0)
      ),
      new mapping_1.TokenData(
        cTokenAddr,
        (0, mapping_1.getOrElse)(cTokenContract.try_name(), "unknown"),
        (0, mapping_1.getOrElse)(cTokenContract.try_symbol(), "unknown"),
        constants_1.cTokenDecimals
      ),
      cTokenReserveFactorMantissa
    ),
    event
  );
}
exports.handleMarketListed = handleMarketListed;
function handleNewCollateralFactor(event) {
  if (
    isDeprecated ||
    deprecateSubgraph(event.block.number, event.block.timestamp)
  ) {
    return;
  }
  const marketID = event.params.cToken.toHexString();
  const collateralFactorMantissa = event.params.newCollateralFactorMantissa;
  (0, mapping_1._handleNewCollateralFactor)(marketID, collateralFactorMantissa);
}
exports.handleNewCollateralFactor = handleNewCollateralFactor;
function handleNewLiquidationIncentive(event) {
  if (
    isDeprecated ||
    deprecateSubgraph(event.block.number, event.block.timestamp)
  ) {
    return;
  }
  const protocol = getOrCreateProtocol();
  const newLiquidationIncentive = event.params.newLiquidationIncentiveMantissa;
  (0, mapping_1._handleNewLiquidationIncentive)(
    protocol,
    newLiquidationIncentive
  );
}
exports.handleNewLiquidationIncentive = handleNewLiquidationIncentive;
function handleActionPaused(event) {
  if (
    isDeprecated ||
    deprecateSubgraph(event.block.number, event.block.timestamp)
  ) {
    return;
  }
  const marketID = event.params.cToken.toHexString();
  const action = event.params.action;
  const pauseState = event.params.pauseState;
  (0, mapping_1._handleActionPaused)(marketID, action, pauseState);
}
exports.handleActionPaused = handleActionPaused;
function handleNewReserveFactor(event) {
  if (
    isDeprecated ||
    deprecateSubgraph(event.block.number, event.block.timestamp)
  ) {
    return;
  }
  const marketID = event.address.toHexString();
  const newReserveFactorMantissa = event.params.newReserveFactorMantissa;
  (0, mapping_1._handleNewReserveFactor)(marketID, newReserveFactorMantissa);
}
exports.handleNewReserveFactor = handleNewReserveFactor;
function handleMint(event) {
  if (
    isDeprecated ||
    deprecateSubgraph(event.block.number, event.block.timestamp)
  ) {
    return;
  }
  const minter = event.params.minter;
  const mintAmount = event.params.mintAmount;
  const contract = CToken_1.CToken.bind(event.address);
  const outputTokenSupplyResult = contract.try_totalSupply();
  const balanceOfUnderlyingResult = contract.try_balanceOfUnderlying(
    event.params.minter
  );
  (0, mapping_1._handleMint)(
    comptrollerAddr,
    minter,
    mintAmount,
    outputTokenSupplyResult,
    balanceOfUnderlyingResult,
    event
  );
}
exports.handleMint = handleMint;
function handleRedeem(event) {
  if (
    isDeprecated ||
    deprecateSubgraph(event.block.number, event.block.timestamp)
  ) {
    return;
  }
  const redeemer = event.params.redeemer;
  const redeemAmount = event.params.redeemAmount;
  const contract = CToken_1.CToken.bind(event.address);
  const outputTokenSupplyResult = contract.try_totalSupply();
  const balanceOfUnderlyingResult = contract.try_balanceOfUnderlying(
    event.params.redeemer
  );
  (0, mapping_1._handleRedeem)(
    comptrollerAddr,
    redeemer,
    redeemAmount,
    outputTokenSupplyResult,
    balanceOfUnderlyingResult,
    event
  );
}
exports.handleRedeem = handleRedeem;
function handleBorrow(event) {
  if (
    isDeprecated ||
    deprecateSubgraph(event.block.number, event.block.timestamp)
  ) {
    return;
  }
  const borrower = event.params.borrower;
  const borrowAmount = event.params.borrowAmount;
  const totalBorrows = event.params.totalBorrows;
  const contract = CToken_1.CToken.bind(event.address);
  const borrowBalanceStoredResult = contract.try_borrowBalanceStored(
    event.params.borrower
  );
  (0, mapping_1._handleBorrow)(
    comptrollerAddr,
    borrower,
    borrowAmount,
    borrowBalanceStoredResult,
    totalBorrows,
    event
  );
}
exports.handleBorrow = handleBorrow;
function handleRepayBorrow(event) {
  if (
    isDeprecated ||
    deprecateSubgraph(event.block.number, event.block.timestamp)
  ) {
    return;
  }
  const borrower = event.params.borrower;
  const payer = event.params.payer;
  const repayAmount = event.params.repayAmount;
  const totalBorrows = event.params.totalBorrows;
  const contract = CToken_1.CToken.bind(event.address);
  const borrowBalanceStoredResult = contract.try_borrowBalanceStored(
    event.params.borrower
  );
  (0, mapping_1._handleRepayBorrow)(
    comptrollerAddr,
    borrower,
    payer,
    repayAmount,
    borrowBalanceStoredResult,
    totalBorrows,
    event
  );
}
exports.handleRepayBorrow = handleRepayBorrow;
function handleLiquidateBorrow(event) {
  if (
    isDeprecated ||
    deprecateSubgraph(event.block.number, event.block.timestamp)
  ) {
    return;
  }
  const cTokenCollateral = event.params.cTokenCollateral;
  const liquidator = event.params.liquidator;
  const borrower = event.params.borrower;
  const seizeTokens = event.params.seizeTokens;
  const repayAmount = event.params.repayAmount;
  (0, mapping_1._handleLiquidateBorrow)(
    comptrollerAddr,
    cTokenCollateral,
    liquidator,
    borrower,
    seizeTokens,
    repayAmount,
    event
  );
}
exports.handleLiquidateBorrow = handleLiquidateBorrow;
function handleAccrueInterest(event) {
  if (
    isDeprecated ||
    deprecateSubgraph(event.block.number, event.block.timestamp)
  ) {
    return;
  }
  const marketAddress = event.address;
  const market = schema_1.Market.load(marketAddress.toHexString());
  if (!market) {
    graph_ts_1.log.warning("[handleAccrueInterest] market not found: {}", [
      marketAddress.toHexString(),
    ]);
    return;
  }
  const underlyingToken = schema_1.Token.load(market.inputToken);
  if (!underlyingToken) {
    graph_ts_1.log.warning(
      "[handleAccrueInterest] input token: {} not found in market: {}",
      [market.inputToken, market.id]
    );
    return;
  }
  const cTokenContract = CToken_1.CToken.bind(marketAddress);
  const protocol = getOrCreateProtocol();
  const oracleContract = PriceOracle_1.PriceOracle.bind(
    graph_ts_1.Address.fromString(protocol._priceOracle)
  );
  const updateMarketData = new mapping_1.UpdateMarketData(
    cTokenContract.try_totalSupply(),
    cTokenContract.try_exchangeRateStored(),
    cTokenContract.try_supplyRatePerBlock(),
    cTokenContract.try_borrowRatePerBlock(),
    getPriceUSD(
      oracleContract.try_getUnderlyingPrice(marketAddress),
      underlyingToken.decimals,
      event.block.number.toI32()
    ),
    unitPerYear
  );
  const interestAccumulated = event.params.interestAccumulated;
  const totalBorrows = event.params.totalBorrows;
  (0, mapping_1._handleAccrueInterest)(
    updateMarketData,
    comptrollerAddr,
    interestAccumulated,
    totalBorrows,
    false, // do not update all prices
    event
  );
}
exports.handleAccrueInterest = handleAccrueInterest;
function handleTransfer(event) {
  (0, mapping_1._handleTransfer)(
    event,
    event.address.toHexString(),
    event.params.to,
    event.params.from,
    comptrollerAddr
  );
}
exports.handleTransfer = handleTransfer;
function getOrCreateProtocol() {
  const comptroller = Comptroller_1.Comptroller.bind(comptrollerAddr);
  const protocolData = new mapping_1.ProtocolData(
    comptrollerAddr,
    "CREAM Finance",
    "cream-finance",
    network,
    comptroller.try_liquidationIncentiveMantissa(),
    comptroller.try_oracle()
  );
  return (0, mapping_1._getOrCreateProtocol)(protocolData);
}
// this function will get the USD price of any asset on CREAM BSC / ETH
// CREAM's oracles are denoted in the network's native unit
// So on ethereum we need to multiply tryUnderlyingPrice by the price of ETH
function getPriceUSD(tryUnderlyingPrice, underlyingDecimals, blockNumber) {
  if (tryUnderlyingPrice.reverted) {
    return graph_ts_1.ethereum.CallResult.fromValue(constants_1.BIGINT_ZERO);
  }
  if ((0, constants_2.equalsIgnoreCase)(network, constants_1.Network.MAINNET)) {
    const customPrice = (0, prices_1.getUsdPricePerToken)(
      graph_ts_1.Address.fromString(constants_2.ETH_ADDRESS)
    );
    const ethPriceUSD = customPrice.usdPrice.div(customPrice.decimalsBaseTen);
    const priceInETH = (0, mapping_1.getTokenPriceUSD)(
      tryUnderlyingPrice,
      underlyingDecimals
    );
    const priceUSD = ethPriceUSD.times(priceInETH);
    // put the price back into BigInt form with correct decimal offset
    const mantissaDecimalFactor = 18 - underlyingDecimals + 18;
    const bdFactor = (0, constants_1.exponentToBigDecimal)(
      mantissaDecimalFactor
    );
    const returnValue = graph_ts_1.BigInt.fromString(
      priceUSD.times(bdFactor).truncate(0).toString()
    );
    return graph_ts_1.ethereum.CallResult.fromValue(returnValue);
  }
  if ((0, constants_2.equalsIgnoreCase)(network, constants_1.Network.BSC)) {
    let bnbPriceUSD;
    if (blockNumber <= 1881676) {
      // cannot use Chainlink oracle
      // using LP pair to derive price
      // this is in effect for the first 2 months
      bnbPriceUSD = constants_1.BIGDECIMAL_ZERO; // TODO: find way to get bnb price on chain here
    } else {
      // use chainlink oracle BNB/USD starting on block 1881676
      const chainlinkOracle = Oracle_1.Oracle.bind(
        graph_ts_1.Address.fromString(constants_2.BNB_USD_CHAINLINK_ORACLE)
      );
      const tryPriceUSD = chainlinkOracle.try_latestAnswer();
      bnbPriceUSD = tryPriceUSD.reverted
        ? constants_1.BIGDECIMAL_ZERO
        : tryPriceUSD.value.toBigDecimal().div(constants_1.cTokenDecimalsBD);
    }
    const priceInBNB = (0, mapping_1.getTokenPriceUSD)(
      tryUnderlyingPrice,
      underlyingDecimals
    );
    const priceUSD = bnbPriceUSD.times(priceInBNB);
    // put the price back into BigInt form with correct decimal offset
    const mantissaDecimalFactor = 18 - underlyingDecimals + 18;
    const bdFactor = (0, constants_1.exponentToBigDecimal)(
      mantissaDecimalFactor
    );
    const returnValue = graph_ts_1.BigInt.fromString(
      priceUSD.times(bdFactor).truncate(0).toString()
    );
    return graph_ts_1.ethereum.CallResult.fromValue(returnValue);
  }
  // Polygon / Arbitrum deployments return price like normal
  return graph_ts_1.ethereum.CallResult.fromValue(tryUnderlyingPrice.value);
}
////////////////////////////
//// Deprecate Subgraph ////
////////////////////////////
// this function will deprecate Ethereum subgraph after 10/17/2022
// return false if not deprecated
function deprecateSubgraph(blockNumber, timestamp) {
  if (
    isDeprecated ||
    !(0, constants_2.equalsIgnoreCase)(network, constants_1.Network.MAINNET) ||
    blockNumber.toI32() < constants_2.ETH_CUTOFF_BLOCK
  ) {
    // skip if already deprecated, not ethereum, or not past the CUTOFF block
    return false;
  }
  const protocol = getOrCreateProtocol();
  // deprecate markets first
  deprecateMarkets(protocol._marketIDs, blockNumber, timestamp);
  // finish off with the protocol
  deprecateProtocol(protocol, timestamp);
  isDeprecated = true;
  return true;
}
function deprecateMarkets(marketIDList, blockNumber, timestamp) {
  for (let i = 0; i < marketIDList.length; i++) {
    const market = schema_1.Market.load(marketIDList[i]);
    if (!market) {
      continue;
    }
    // zero out the market fields that need to be zero'd out
    market.isActive = false;
    market.canUseAsCollateral = false;
    market.canBorrowFrom = false;
    market.rates = [];
    market.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    market.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    market.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    market.inputTokenBalance = constants_1.BIGINT_ZERO;
    market.inputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
    market.outputTokenSupply = constants_1.BIGINT_ZERO;
    market.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
    market.exchangeRate = constants_1.BIGDECIMAL_ZERO;
    market.rewardTokenEmissionsAmount = [];
    market.rewardTokenEmissionsUSD = [];
    market._borrowBalance = constants_1.BIGINT_ZERO;
    market.save();
    // clear out last marketDaily / hourly snapshot
    clearMarketSnapshots(market, blockNumber, timestamp);
  }
}
function deprecateProtocol(protocol, timestamp) {
  protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
  protocol.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  protocol.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  protocol.save();
  // clear out last financialsDailySnapshot
  clearFinancialSnapshot(timestamp);
}
function clearFinancialSnapshot(timestamp) {
  const financialsDailySnapshotID = (
    timestamp.toI32() / constants_1.SECONDS_PER_DAY
  ).toString();
  const financiasDailySnapshot = schema_1.FinancialsDailySnapshot.load(
    financialsDailySnapshotID
  );
  if (!financiasDailySnapshot) {
    graph_ts_1.log.warning(
      "[clearFinancialSnapshot] could not find FinancialsDailySnapshot with ID {}",
      [financialsDailySnapshotID]
    );
    return;
  }
  financiasDailySnapshot.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
  financiasDailySnapshot.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  financiasDailySnapshot.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  financiasDailySnapshot.save();
}
function clearMarketSnapshots(market, blockNumber, timestamp) {
  const marketDailySnapshot = (0, mapping_1.getOrCreateMarketDailySnapshot)(
    market,
    timestamp,
    blockNumber
  );
  // clear out aggregated fields
  marketDailySnapshot.rates = [];
  marketDailySnapshot.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
  marketDailySnapshot.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  marketDailySnapshot.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  marketDailySnapshot.inputTokenBalance = constants_1.BIGINT_ZERO;
  marketDailySnapshot.inputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
  marketDailySnapshot.outputTokenSupply = constants_1.BIGINT_ZERO;
  marketDailySnapshot.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
  marketDailySnapshot.exchangeRate = constants_1.BIGDECIMAL_ZERO;
  marketDailySnapshot.rewardTokenEmissionsAmount = [];
  marketDailySnapshot.rewardTokenEmissionsUSD = [];
  marketDailySnapshot.save();
  const marketHourlySnapshot = (0, mapping_1.getOrCreateMarketHourlySnapshot)(
    market,
    timestamp,
    blockNumber
  );
  marketHourlySnapshot.rates = [];
  marketHourlySnapshot.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
  marketHourlySnapshot.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  marketHourlySnapshot.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  marketHourlySnapshot.inputTokenBalance = constants_1.BIGINT_ZERO;
  marketHourlySnapshot.inputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
  marketHourlySnapshot.outputTokenSupply = constants_1.BIGINT_ZERO;
  marketHourlySnapshot.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
  marketHourlySnapshot.exchangeRate = constants_1.BIGDECIMAL_ZERO;
  marketHourlySnapshot.rewardTokenEmissionsAmount = [];
  marketHourlySnapshot.rewardTokenEmissionsUSD = [];
  marketHourlySnapshot.save();
}
