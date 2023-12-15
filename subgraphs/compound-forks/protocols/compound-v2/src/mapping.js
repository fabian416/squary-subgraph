"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProtocol =
  exports.handleActionPaused =
  exports.handleNewLiquidationIncentive =
  exports.handleNewCollateralFactor =
  exports.handleNewPriceOracle =
  exports.handleMarketExited =
  exports.handleMarketEntered =
  exports.handleMarketListed =
  exports.handleAccrueInterestOld =
  exports.handleAccrueInterestNew =
  exports.handleTransfer =
  exports.handleNewReserveFactor =
  exports.handleLiquidateBorrow =
  exports.handleRepayBorrow =
  exports.handleBorrow =
  exports.handleRedeem =
  exports.handleMint =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Comptroller_1 = require("../../../generated/Comptroller/Comptroller");
const CToken_1 = require("../../../generated/templates/CToken/CToken");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("./constants");
const mapping_1 = require("../../../src/mapping");
const templates_1 = require("../../../generated/templates");
const constants_2 = require("../../../src/constants");
const ERC20_1 = require("../../../generated/Comptroller/ERC20");
const rewards_1 = require("./rewards");
const prices_1 = require("./prices");
const index_1 = require("./prices/index");
const PriceOracle2_1 = require("../../../generated/Comptroller/PriceOracle2");
const token_1 = require("./token");
///////////////////////////////
//// CToken Level Handlers ////
///////////////////////////////
function handleMint(event) {
  const minter = event.params.minter;
  const mintAmount = event.params.mintAmount;
  const contract = CToken_1.CToken.bind(event.address);
  const outputTokenSupplyResult = contract.try_totalSupply();
  const balanceOfUnderlyingResult = contract.try_balanceOfUnderlying(
    event.params.minter
  );
  (0, mapping_1._handleMint)(
    constants_1.comptrollerAddr,
    minter,
    mintAmount,
    outputTokenSupplyResult,
    balanceOfUnderlyingResult,
    event
  );
}
exports.handleMint = handleMint;
function handleRedeem(event) {
  const redeemer = event.params.redeemer;
  const redeemAmount = event.params.redeemAmount;
  const contract = CToken_1.CToken.bind(event.address);
  const outputTokenSupplyResult = contract.try_totalSupply();
  const balanceOfUnderlyingResult = contract.try_balanceOfUnderlying(
    event.params.redeemer
  );
  (0, mapping_1._handleRedeem)(
    constants_1.comptrollerAddr,
    redeemer,
    redeemAmount,
    outputTokenSupplyResult,
    balanceOfUnderlyingResult,
    event
  );
}
exports.handleRedeem = handleRedeem;
function handleBorrow(event) {
  const borrower = event.params.borrower;
  const borrowAmount = event.params.borrowAmount;
  const totalBorrows = event.params.totalBorrows;
  const contract = CToken_1.CToken.bind(event.address);
  const borrowBalanceStoredResult = contract.try_borrowBalanceStored(
    event.params.borrower
  );
  (0, mapping_1._handleBorrow)(
    constants_1.comptrollerAddr,
    borrower,
    borrowAmount,
    borrowBalanceStoredResult,
    totalBorrows,
    event
  );
}
exports.handleBorrow = handleBorrow;
function handleRepayBorrow(event) {
  const payer = event.params.payer;
  const borrower = event.params.borrower;
  const repayAmount = event.params.repayAmount;
  const totalBorrows = event.params.totalBorrows;
  const contract = CToken_1.CToken.bind(event.address);
  const borrowBalanceStoredResult = contract.try_borrowBalanceStored(
    event.params.borrower
  );
  (0, mapping_1._handleRepayBorrow)(
    constants_1.comptrollerAddr,
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
  const cTokenCollateral = event.params.cTokenCollateral;
  const liquidator = event.params.liquidator;
  const borrower = event.params.borrower;
  const seizeTokens = event.params.seizeTokens;
  const repayAmount = event.params.repayAmount;
  (0, mapping_1._handleLiquidateBorrow)(
    constants_1.comptrollerAddr,
    cTokenCollateral,
    liquidator,
    borrower,
    seizeTokens,
    repayAmount,
    event
  );
}
exports.handleLiquidateBorrow = handleLiquidateBorrow;
function handleNewReserveFactor(event) {
  const marketID = event.address.toHexString();
  const newReserveFactorMantissa = event.params.newReserveFactorMantissa;
  (0, mapping_1._handleNewReserveFactor)(marketID, newReserveFactorMantissa);
}
exports.handleNewReserveFactor = handleNewReserveFactor;
function handleTransfer(event) {
  (0, mapping_1._handleTransfer)(
    event,
    event.address.toHexString(),
    event.params.to,
    event.params.from,
    constants_1.comptrollerAddr
  );
}
exports.handleTransfer = handleTransfer;
function handleAccrueInterestNew(event) {
  handleAccrueInterest(
    event,
    event.params.interestAccumulated,
    event.params.totalBorrows
  );
}
exports.handleAccrueInterestNew = handleAccrueInterestNew;
function handleAccrueInterestOld(event) {
  handleAccrueInterest(
    event,
    event.params.interestAccumulated,
    event.params.totalBorrows
  );
}
exports.handleAccrueInterestOld = handleAccrueInterestOld;
////////////////////////////////////
//// Comptroller Level Handlers ////
////////////////////////////////////
function handleMarketListed(event) {
  // CToken ABI changes at block 8983575
  // To handle we must create the old CToken in order to capture the old acrueInterest signature
  if (event.block.number.toI32() <= 8983575) {
    templates_1.CTokenOld.create(event.params.cToken);
  }
  templates_1.CToken.create(event.params.cToken);
  const cTokenAddr = event.params.cToken;
  const cToken = schema_1.Token.load(cTokenAddr.toHexString());
  if (cToken != null) {
    return;
  }
  // this is a new cToken, a new underlying token, and a new market
  const protocol = getOrCreateProtocol();
  const cTokenContract = CToken_1.CToken.bind(event.params.cToken);
  const cTokenReserveFactorMantissa = (0, mapping_1.getOrElse)(
    cTokenContract.try_reserveFactorMantissa(),
    constants_2.BIGINT_ZERO
  );
  // get underlying token data
  let underlyingTokenAddr;
  let underlyingName;
  let underlyingSymbol;
  let underlyingDecimals;
  if (
    event.params.cToken ==
    graph_ts_1.Address.fromString(constants_1.CETH_ADDRESS)
  ) {
    // must hard code ETH bc it cannot fetch 0x0 address
    underlyingTokenAddr = graph_ts_1.Address.fromString(
      constants_1.ETH_ADDRESS
    );
    underlyingName = constants_1.ETH_NAME;
    underlyingSymbol = constants_1.ETH_SYMBOL;
    underlyingDecimals = constants_1.ETH_DECIMALS;
  } else {
    // grab token normally
    const underlyingTokenAddrResult = cTokenContract.try_underlying();
    if (underlyingTokenAddrResult.reverted) {
      graph_ts_1.log.warning(
        "[handleMarketListed] could not fetch underlying token of cToken: {}",
        [cTokenAddr.toHexString()]
      );
      return;
    }
    underlyingTokenAddr = underlyingTokenAddrResult.value;
    underlyingName = (0, token_1.fetchTokenName)(underlyingTokenAddr);
    underlyingSymbol = (0, token_1.fetchTokenSymbol)(underlyingTokenAddr);
    underlyingDecimals = (0, token_1.fetchTokenDecimals)(underlyingTokenAddr);
  }
  (0, mapping_1._handleMarketListed)(
    new mapping_1.MarketListedData(
      protocol,
      new mapping_1.TokenData(
        underlyingTokenAddr,
        underlyingName,
        underlyingSymbol,
        underlyingDecimals
      ),
      new mapping_1.TokenData(
        cTokenAddr,
        (0, mapping_1.getOrElse)(cTokenContract.try_name(), "unknown"),
        (0, mapping_1.getOrElse)(cTokenContract.try_symbol(), "unknown"),
        constants_2.cTokenDecimals
      ),
      cTokenReserveFactorMantissa
    ),
    event
  );
}
exports.handleMarketListed = handleMarketListed;
function handleMarketEntered(event) {
  (0, mapping_1._handleMarketEntered)(
    constants_1.comptrollerAddr,
    event.params.cToken.toHexString(),
    event.params.account.toHexString(),
    true
  );
}
exports.handleMarketEntered = handleMarketEntered;
function handleMarketExited(event) {
  (0, mapping_1._handleMarketEntered)(
    constants_1.comptrollerAddr,
    event.params.cToken.toHexString(),
    event.params.account.toHexString(),
    false
  );
}
exports.handleMarketExited = handleMarketExited;
function handleNewPriceOracle(event) {
  const protocol = getOrCreateProtocol();
  const newPriceOracle = event.params.newPriceOracle;
  (0, mapping_1._handleNewPriceOracle)(protocol, newPriceOracle);
}
exports.handleNewPriceOracle = handleNewPriceOracle;
function handleNewCollateralFactor(event) {
  const marketID = event.params.cToken.toHexString();
  const collateralFactorMantissa = event.params.newCollateralFactorMantissa;
  (0, mapping_1._handleNewCollateralFactor)(marketID, collateralFactorMantissa);
}
exports.handleNewCollateralFactor = handleNewCollateralFactor;
function handleNewLiquidationIncentive(event) {
  const protocol = getOrCreateProtocol();
  const newLiquidationIncentive = event.params.newLiquidationIncentiveMantissa;
  (0, mapping_1._handleNewLiquidationIncentive)(
    protocol,
    newLiquidationIncentive
  );
}
exports.handleNewLiquidationIncentive = handleNewLiquidationIncentive;
function handleActionPaused(event) {
  const marketID = event.params.cToken.toHexString();
  const action = event.params.action;
  const pauseState = event.params.pauseState;
  (0, mapping_1._handleActionPaused)(marketID, action, pauseState);
}
exports.handleActionPaused = handleActionPaused;
/////////////////
//// Helpers ////
/////////////////
function getOrCreateProtocol() {
  const comptroller = Comptroller_1.Comptroller.bind(
    constants_1.comptrollerAddr
  );
  const protocolData = new mapping_1.ProtocolData(
    constants_1.comptrollerAddr,
    constants_1.PROTOCOL_NAME,
    constants_1.PROTOCOL_SLUG,
    constants_1.Network.MAINNET,
    comptroller.try_liquidationIncentiveMantissa(),
    comptroller.try_oracle()
  );
  return (0, mapping_1._getOrCreateProtocol)(protocolData);
}
// "override" _handleAccrueInterest in ../src/mapping.ts
// Compound v2 calculates price differently in certain stuations
function handleAccrueInterest(event, interestAccumulated, totalBorrows) {
  const marketAddress = event.address;
  const cTokenContract = CToken_1.CToken.bind(marketAddress);
  const protocol = getOrCreateProtocol();
  const oracleContract = PriceOracle2_1.PriceOracle2.bind(
    graph_ts_1.Address.fromString(protocol._priceOracle)
  );
  // update blocksPerDay using rewards.ts
  (0, rewards_1.getRewardsPerDay)(
    event.block.timestamp,
    event.block.number,
    constants_2.BIGDECIMAL_ZERO,
    rewards_1.RewardIntervalType.BLOCK
  );
  const blocksPerDay = graph_ts_1.BigInt.fromString(
    (0, rewards_1.getOrCreateCircularBuffer)()
      .blocksPerDay.truncate(0)
      .toString()
  ).toI32();
  const updateMarketData = new mapping_1.UpdateMarketData(
    cTokenContract.try_totalSupply(),
    cTokenContract.try_exchangeRateStored(),
    cTokenContract.try_supplyRatePerBlock(),
    cTokenContract.try_borrowRatePerBlock(),
    oracleContract.try_getUnderlyingPrice(marketAddress),
    blocksPerDay * constants_2.DAYS_PER_YEAR
  );
  //
  // Replacing _handleAccrueInterest() to properly derive asset price
  //
  const marketID = event.address.toHexString();
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[handleAccrueInterest] Market not found: {}", [
      marketID,
    ]);
    return;
  }
  // update rewards for market is necessary
  updateRewards(event, market);
  // creates and initializes market snapshots
  //
  // daily snapshot
  //
  (0, mapping_1.getOrCreateMarketDailySnapshot)(
    market,
    event.block.timestamp,
    event.block.number
  );
  //
  // hourly snapshot
  //
  (0, mapping_1.getOrCreateMarketHourlySnapshot)(
    market,
    event.block.timestamp,
    event.block.number
  );
  updateMarket(
    updateMarketData,
    marketID,
    interestAccumulated,
    totalBorrows,
    event.block.number,
    event.block.timestamp,
    false, // do not update all prices
    constants_1.comptrollerAddr
  );
  updateProtocol(constants_1.comptrollerAddr);
  (0, mapping_1.snapshotFinancials)(
    constants_1.comptrollerAddr,
    event.block.number,
    event.block.timestamp
  );
}
// "override" updateMarket() in ../src/mapping.ts
// Compound v2 calculates price differently in certain stuations
function updateMarket(
  updateMarketData,
  marketID,
  interestAccumulatedMantissa,
  newTotalBorrow,
  blockNumber,
  blockTimestamp,
  updateMarketPrices,
  comptrollerAddress
) {
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[updateMarket] Market not found: {}", [marketID]);
    return;
  }
  const underlyingToken = schema_1.Token.load(market.inputToken);
  if (!underlyingToken) {
    graph_ts_1.log.warning("[updateMarket] Underlying token not found: {}", [
      market.inputToken,
    ]);
    return;
  }
  if (updateMarketPrices) {
    (0, mapping_1.updateAllMarketPrices)(comptrollerAddress, blockNumber);
  }
  // compound v2 specific price calculation (see ./prices.ts)
  const underlyingTokenPriceUSD = (0, prices_1.getUSDPriceOfToken)(
    market,
    blockNumber.toI32()
  );
  underlyingToken.lastPriceUSD = underlyingTokenPriceUSD;
  underlyingToken.lastPriceBlockNumber = blockNumber;
  underlyingToken.save();
  market.inputTokenPriceUSD = underlyingTokenPriceUSD;
  if (updateMarketData.totalSupplyResult.reverted) {
    graph_ts_1.log.warning(
      "[updateMarket] Failed to get totalSupply of Market {}",
      [marketID]
    );
  } else {
    market.outputTokenSupply = updateMarketData.totalSupplyResult.value;
  }
  // get correct outputTokenDecimals for generic exchangeRate calculation
  let outputTokenDecimals = constants_2.cTokenDecimals;
  if (market.outputToken) {
    const outputToken = schema_1.Token.load(market.outputToken);
    if (!outputToken) {
      graph_ts_1.log.warning("[updateMarket] Output token not found: {}", [
        market.outputToken,
      ]);
    } else {
      outputTokenDecimals = outputToken.decimals;
    }
  }
  if (updateMarketData.exchangeRateStoredResult.reverted) {
    graph_ts_1.log.warning(
      "[updateMarket] Failed to get exchangeRateStored of Market {}",
      [marketID]
    );
  } else {
    // Formula: check out "Interpreting Exchange Rates" in https://compound.finance/docs#protocol-math
    const oneCTokenInUnderlying =
      updateMarketData.exchangeRateStoredResult.value
        .toBigDecimal()
        .div(
          (0, constants_2.exponentToBigDecimal)(
            constants_2.mantissaFactor +
              underlyingToken.decimals -
              outputTokenDecimals
          )
        );
    market.exchangeRate = oneCTokenInUnderlying;
    market.outputTokenPriceUSD = oneCTokenInUnderlying.times(
      underlyingTokenPriceUSD
    );
    // calculate inputTokenBalance only if exchangeRate is updated properly
    // mantissaFactor = (inputTokenDecimals - outputTokenDecimals)  (Note: can be negative)
    // inputTokenBalance = (outputSupply * exchangeRate) * (10 ^ mantissaFactor)
    if (underlyingToken.decimals > outputTokenDecimals) {
      // we want to multiply out the difference to expand BD
      const mantissaFactorBD = (0, constants_2.exponentToBigDecimal)(
        underlyingToken.decimals - outputTokenDecimals
      );
      const inputTokenBalanceBD = market.outputTokenSupply
        .toBigDecimal()
        .times(market.exchangeRate)
        .times(mantissaFactorBD)
        .truncate(0);
      market.inputTokenBalance = graph_ts_1.BigInt.fromString(
        inputTokenBalanceBD.toString()
      );
    } else {
      // we want to divide back the difference to decrease the BD
      const mantissaFactorBD = (0, constants_2.exponentToBigDecimal)(
        outputTokenDecimals - underlyingToken.decimals
      );
      const inputTokenBalanceBD = market.outputTokenSupply
        .toBigDecimal()
        .times(market.exchangeRate)
        .div(mantissaFactorBD)
        .truncate(0);
      market.inputTokenBalance = graph_ts_1.BigInt.fromString(
        inputTokenBalanceBD.toString()
      );
    }
  }
  const underlyingSupplyUSD = market.inputTokenBalance
    .toBigDecimal()
    .div((0, constants_2.exponentToBigDecimal)(underlyingToken.decimals))
    .times(underlyingTokenPriceUSD);
  market.totalValueLockedUSD = underlyingSupplyUSD;
  market.totalDepositBalanceUSD = underlyingSupplyUSD;
  market._borrowBalance = newTotalBorrow;
  market.totalBorrowBalanceUSD = newTotalBorrow
    .toBigDecimal()
    .div((0, constants_2.exponentToBigDecimal)(underlyingToken.decimals))
    .times(underlyingTokenPriceUSD);
  if (updateMarketData.supplyRateResult.reverted) {
    graph_ts_1.log.warning(
      "[updateMarket] Failed to get supplyRate of Market {}",
      [marketID]
    );
  } else {
    (0, mapping_1.setSupplyInterestRate)(
      marketID,
      (0, mapping_1.convertRatePerUnitToAPY)(
        updateMarketData.supplyRateResult.value,
        updateMarketData.unitPerYear
      )
    );
  }
  if (updateMarketData.borrowRateResult.reverted) {
    graph_ts_1.log.warning(
      "[updateMarket] Failed to get borrowRate of Market {}",
      [marketID]
    );
  } else {
    (0, mapping_1.setBorrowInterestRate)(
      marketID,
      (0, mapping_1.convertRatePerUnitToAPY)(
        updateMarketData.borrowRateResult.value,
        updateMarketData.unitPerYear
      )
    );
  }
  const interestAccumulatedUSD = interestAccumulatedMantissa
    .toBigDecimal()
    .div((0, constants_2.exponentToBigDecimal)(underlyingToken.decimals))
    .times(underlyingTokenPriceUSD);
  const protocolSideRevenueUSDDelta = interestAccumulatedUSD.times(
    market._reserveFactor
  );
  const supplySideRevenueUSDDelta = interestAccumulatedUSD.minus(
    protocolSideRevenueUSDDelta
  );
  market.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD.plus(
    interestAccumulatedUSD
  );
  market.cumulativeProtocolSideRevenueUSD =
    market.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenueUSDDelta);
  market.cumulativeSupplySideRevenueUSD =
    market.cumulativeSupplySideRevenueUSD.plus(supplySideRevenueUSDDelta);
  market.save();
  // update daily fields in marketDailySnapshot
  const dailySnapshot = (0, mapping_1.getOrCreateMarketDailySnapshot)(
    market,
    blockTimestamp,
    blockNumber
  );
  dailySnapshot.dailyTotalRevenueUSD = dailySnapshot.dailyTotalRevenueUSD.plus(
    interestAccumulatedUSD
  );
  dailySnapshot.dailyProtocolSideRevenueUSD =
    dailySnapshot.dailyProtocolSideRevenueUSD.plus(protocolSideRevenueUSDDelta);
  dailySnapshot.dailySupplySideRevenueUSD =
    dailySnapshot.dailySupplySideRevenueUSD.plus(supplySideRevenueUSDDelta);
  dailySnapshot.save();
  // update hourly fields in marketHourlySnapshot
  const hourlySnapshot = (0, mapping_1.getOrCreateMarketHourlySnapshot)(
    market,
    blockTimestamp,
    blockNumber
  );
  hourlySnapshot.hourlyTotalRevenueUSD =
    hourlySnapshot.hourlyTotalRevenueUSD.plus(interestAccumulatedUSD);
  hourlySnapshot.hourlyProtocolSideRevenueUSD =
    hourlySnapshot.hourlyProtocolSideRevenueUSD.plus(
      protocolSideRevenueUSDDelta
    );
  hourlySnapshot.hourlySupplySideRevenueUSD =
    hourlySnapshot.hourlySupplySideRevenueUSD.plus(supplySideRevenueUSDDelta);
  hourlySnapshot.save();
}
function updateProtocol(comptrollerAddr) {
  const protocol = schema_1.LendingProtocol.load(comptrollerAddr.toHexString());
  if (!protocol) {
    graph_ts_1.log.error(
      "[updateProtocol] Protocol not found, this SHOULD NOT happen",
      []
    );
    return;
  }
  let totalValueLockedUSD = constants_2.BIGDECIMAL_ZERO;
  let totalDepositBalanceUSD = constants_2.BIGDECIMAL_ZERO;
  let totalBorrowBalanceUSD = constants_2.BIGDECIMAL_ZERO;
  let cumulativeBorrowUSD = constants_2.BIGDECIMAL_ZERO;
  let cumulativeDepositUSD = constants_2.BIGDECIMAL_ZERO;
  let cumulativeLiquidateUSD = constants_2.BIGDECIMAL_ZERO;
  let cumulativeTotalRevenueUSD = constants_2.BIGDECIMAL_ZERO;
  let cumulativeProtocolSideRevenueUSD = constants_2.BIGDECIMAL_ZERO;
  let cumulativeSupplySideRevenueUSD = constants_2.BIGDECIMAL_ZERO;
  for (let i = 0; i < protocol._marketIDs.length; i++) {
    const market = schema_1.Market.load(protocol._marketIDs[i]);
    if (!market) {
      graph_ts_1.log.warning("[updateProtocol] Market not found: {}", [
        protocol._marketIDs[i],
      ]);
      // best effort
      continue;
    }
    totalValueLockedUSD = totalValueLockedUSD.plus(market.totalValueLockedUSD);
    totalDepositBalanceUSD = totalDepositBalanceUSD.plus(
      market.totalDepositBalanceUSD
    );
    totalBorrowBalanceUSD = totalBorrowBalanceUSD.plus(
      market.totalBorrowBalanceUSD
    );
    cumulativeBorrowUSD = cumulativeBorrowUSD.plus(market.cumulativeBorrowUSD);
    cumulativeDepositUSD = cumulativeDepositUSD.plus(
      market.cumulativeDepositUSD
    );
    cumulativeLiquidateUSD = cumulativeLiquidateUSD.plus(
      market.cumulativeLiquidateUSD
    );
    cumulativeTotalRevenueUSD = cumulativeTotalRevenueUSD.plus(
      market.cumulativeTotalRevenueUSD
    );
    cumulativeProtocolSideRevenueUSD = cumulativeProtocolSideRevenueUSD.plus(
      market.cumulativeProtocolSideRevenueUSD
    );
    cumulativeSupplySideRevenueUSD = cumulativeSupplySideRevenueUSD.plus(
      market.cumulativeSupplySideRevenueUSD
    );
  }
  protocol.totalValueLockedUSD = totalValueLockedUSD;
  protocol.totalDepositBalanceUSD = totalDepositBalanceUSD;
  protocol.totalBorrowBalanceUSD = totalBorrowBalanceUSD;
  protocol.cumulativeBorrowUSD = cumulativeBorrowUSD;
  protocol.cumulativeDepositUSD = cumulativeDepositUSD;
  protocol.cumulativeLiquidateUSD = cumulativeLiquidateUSD;
  protocol.cumulativeTotalRevenueUSD = cumulativeTotalRevenueUSD;
  protocol.cumulativeProtocolSideRevenueUSD = cumulativeProtocolSideRevenueUSD;
  protocol.cumulativeSupplySideRevenueUSD = cumulativeSupplySideRevenueUSD;
  protocol.save();
}
exports.updateProtocol = updateProtocol;
function updateRewards(event, market) {
  // COMP was not created until block 10271924: https://etherscan.io/tx/0x03dab5602fb58bb44c1a248fd1b283ca46b539969fe02db144983247d00cfb89
  if (event.block.number.toI32() > 10271924) {
    let rewardTokenBorrow = null;
    let rewardTokenDeposit = null;
    // check if market has COMP reward tokens
    if (market.rewardTokens == null) {
      // get or create COMP token
      let compToken = schema_1.Token.load(constants_1.COMP_ADDRESS);
      if (!compToken) {
        const tokenContract = ERC20_1.ERC20.bind(
          graph_ts_1.Address.fromString(constants_1.COMP_ADDRESS)
        );
        compToken = new schema_1.Token(constants_1.COMP_ADDRESS);
        compToken.name = (0, mapping_1.getOrElse)(
          tokenContract.try_name(),
          "unkown"
        );
        compToken.symbol = (0, mapping_1.getOrElse)(
          tokenContract.try_symbol(),
          "unkown"
        );
        compToken.decimals = (0, mapping_1.getOrElse)(
          tokenContract.try_decimals(),
          0
        );
        compToken.save();
      }
      const borrowID = constants_1.RewardTokenType.BORROW.concat("-").concat(
        constants_1.COMP_ADDRESS
      );
      rewardTokenBorrow = schema_1.RewardToken.load(borrowID);
      if (!rewardTokenBorrow) {
        rewardTokenBorrow = new schema_1.RewardToken(borrowID);
        rewardTokenBorrow.token = compToken.id; // COMP already made from cCOMP market
        rewardTokenBorrow.type = constants_1.RewardTokenType.BORROW;
        rewardTokenBorrow.save();
      }
      const depositID = constants_1.RewardTokenType.DEPOSIT.concat("-").concat(
        constants_1.COMP_ADDRESS
      );
      rewardTokenDeposit = schema_1.RewardToken.load(depositID);
      if (!rewardTokenDeposit) {
        rewardTokenDeposit = new schema_1.RewardToken(depositID);
        rewardTokenDeposit.token = compToken.id; // COMP already made from cCOMP market
        rewardTokenDeposit.type = constants_1.RewardTokenType.DEPOSIT;
        rewardTokenDeposit.save();
      }
      market.rewardTokens = [rewardTokenDeposit.id, rewardTokenBorrow.id];
    }
    // get COMP distribution/block
    const rewardDecimals = schema_1.Token.load(
      constants_1.COMP_ADDRESS
    ).decimals; // COMP is already made from cCOMP market
    const troller = Comptroller_1.Comptroller.bind(
      graph_ts_1.Address.fromString(constants_1.COMPTROLLER_ADDRESS)
    );
    const blocksPerDay = graph_ts_1.BigInt.fromString(
      (0, rewards_1.getOrCreateCircularBuffer)()
        .blocksPerDay.truncate(0)
        .toString()
    );
    let compPriceUSD = constants_2.BIGDECIMAL_ZERO;
    let supplyCompPerDay = constants_2.BIGINT_ZERO;
    let borrowCompPerDay = constants_2.BIGINT_ZERO;
    // get comp speeds (changed storage after block 13322798)
    // See proposal 62: https://compound.finance/governance/proposals/62
    if (event.block.number.toI32() > 13322798) {
      // comp speeds can be different for supply/borrow side
      const tryBorrowSpeed = troller.try_compBorrowSpeeds(event.address);
      const trySupplySpeed = troller.try_compSupplySpeeds(event.address);
      borrowCompPerDay = tryBorrowSpeed.reverted
        ? constants_2.BIGINT_ZERO
        : tryBorrowSpeed.value.times(blocksPerDay);
      supplyCompPerDay = trySupplySpeed.reverted
        ? constants_2.BIGINT_ZERO
        : trySupplySpeed.value.times(blocksPerDay);
    } else {
      // comp speeds are the same for supply/borrow side
      const tryCompSpeed = troller.try_compSpeeds(event.address);
      supplyCompPerDay = tryCompSpeed.reverted
        ? constants_2.BIGINT_ZERO
        : tryCompSpeed.value.times(blocksPerDay);
      borrowCompPerDay = supplyCompPerDay;
    }
    // get COMP price
    // cCOMP was made at this block height 10960099
    if (event.block.number.toI32() > 10960099) {
      const compMarket = schema_1.Market.load(constants_1.CCOMP_ADDRESS);
      if (!compMarket) {
        graph_ts_1.log.warning("[updateRewards] Market not found: {}", [
          constants_1.CCOMP_ADDRESS,
        ]);
        return;
      }
      compPriceUSD = compMarket.inputTokenPriceUSD;
    } else {
      // try to get COMP price between blocks 10271924 - 10960099 using price oracle library
      const customPrice = (0, index_1.getUsdPricePerToken)(
        graph_ts_1.Address.fromString(constants_1.COMP_ADDRESS)
      );
      compPriceUSD = customPrice.usdPrice.div(customPrice.decimalsBaseTen);
    }
    const borrowCompPerDayUSD = borrowCompPerDay
      .toBigDecimal()
      .div((0, constants_2.exponentToBigDecimal)(rewardDecimals))
      .times(compPriceUSD);
    const supplyCompPerDayUSD = supplyCompPerDay
      .toBigDecimal()
      .div((0, constants_2.exponentToBigDecimal)(rewardDecimals))
      .times(compPriceUSD);
    market.rewardTokenEmissionsAmount = [borrowCompPerDay, supplyCompPerDay]; // same order as market.rewardTokens
    market.rewardTokenEmissionsUSD = [borrowCompPerDayUSD, supplyCompPerDayUSD];
    market.save();
  }
}
