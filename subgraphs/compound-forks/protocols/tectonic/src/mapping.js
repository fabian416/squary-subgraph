"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer =
  exports.handleAccrueInterest =
  exports.handleLiquidateBorrow =
  exports.handleRepayBorrow =
  exports.handleBorrow =
  exports.handleRedeem =
  exports.handleMint =
  exports.handleActionPaused =
  exports.handleNewLiquidationIncentive =
  exports.handleNewCollateralFactor =
  exports.handleMarketListed =
  exports.handleMarketExited =
  exports.handleMarketEntered =
  exports.handleNewReserveFactor =
  exports.handleNewPriceOracle =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../../../src/constants");
const mapping_1 = require("../../../src/mapping");
// otherwise import from the specific subgraph root
const CToken_1 = require("../../../generated/Comptroller/CToken");
const Core_1 = require("../../../generated/Comptroller/Core");
const Comptroller_1 = require("../../../generated/Comptroller/Comptroller");
const templates_1 = require("../../../generated/templates");
const ERC20_1 = require("../../../generated/Comptroller/ERC20");
const constants_2 = require("./constants");
const PriceOracle_1 = require("../../../generated/templates/CToken/PriceOracle");
function handleNewPriceOracle(event) {
  const protocol = getOrCreateProtocol();
  const newPriceOracle = event.params.newPriceOracle;
  (0, mapping_1._handleNewPriceOracle)(protocol, newPriceOracle);
}
exports.handleNewPriceOracle = handleNewPriceOracle;
function handleNewReserveFactor(event) {
  const marketID = event.address.toHexString();
  const newReserveFactorMantissa = event.params.newReserveFactorMantissa;
  (0, mapping_1._handleNewReserveFactor)(marketID, newReserveFactorMantissa);
}
exports.handleNewReserveFactor = handleNewReserveFactor;
function handleMarketEntered(event) {
  (0, mapping_1._handleMarketEntered)(
    constants_2.comptrollerAddr,
    event.params.cToken.toHexString(),
    event.params.account.toHexString(),
    true
  );
}
exports.handleMarketEntered = handleMarketEntered;
function handleMarketExited(event) {
  (0, mapping_1._handleMarketEntered)(
    constants_2.comptrollerAddr,
    event.params.cToken.toHexString(),
    event.params.account.toHexString(),
    false
  );
}
exports.handleMarketExited = handleMarketExited;
function handleMarketListed(event) {
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
    constants_1.BIGINT_ZERO
  );
  if (cTokenAddr == constants_2.nativeCToken.address) {
    const marketListedData = new mapping_1.MarketListedData(
      protocol,
      constants_2.nativeToken,
      constants_2.nativeCToken,
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
function handleMint(event) {
  const minter = event.params.minter;
  const mintAmount = event.params.mintAmount;
  const contract = CToken_1.CToken.bind(event.address);
  const outputTokenSupplyResult = contract.try_totalSupply();
  const balanceOfUnderlyingResult = contract.try_balanceOfUnderlying(
    event.params.minter
  );
  (0, mapping_1._handleMint)(
    constants_2.comptrollerAddr,
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
    constants_2.comptrollerAddr,
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
    constants_2.comptrollerAddr,
    borrower,
    borrowAmount,
    borrowBalanceStoredResult,
    totalBorrows,
    event
  );
}
exports.handleBorrow = handleBorrow;
function handleRepayBorrow(event) {
  const borrower = event.params.borrower;
  const payer = event.params.payer;
  const repayAmount = event.params.repayAmount;
  const totalBorrows = event.params.totalBorrows;
  const contract = CToken_1.CToken.bind(event.address);
  const borrowBalanceStoredResult = contract.try_borrowBalanceStored(
    event.params.borrower
  );
  (0, mapping_1._handleRepayBorrow)(
    constants_2.comptrollerAddr,
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
    constants_2.comptrollerAddr,
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
  const marketAddress = event.address;
  const cTokenContract = CToken_1.CToken.bind(marketAddress);
  const protocol = getOrCreateProtocol();
  const oracleContract = PriceOracle_1.PriceOracle.bind(
    graph_ts_1.Address.fromString(protocol._priceOracle)
  );
  const blocksPerDay = graph_ts_1.BigInt.fromString(
    (0, constants_2.getOrCreateCircularBuffer)()
      .blocksPerDay.truncate(0)
      .toString()
  ).toI32();
  const updateMarketData = new mapping_1.UpdateMarketData(
    cTokenContract.try_totalSupply(),
    cTokenContract.try_exchangeRateStored(),
    cTokenContract.try_supplyRatePerBlock(),
    cTokenContract.try_borrowRatePerBlock(),
    oracleContract.try_getUnderlyingPrice(marketAddress),
    blocksPerDay * constants_1.DAYS_PER_YEAR
  );
  const interestAccumulated = event.params.interestAccumulated;
  const totalBorrows = event.params.totalBorrows;
  const marketID = marketAddress.toHexString();
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[handleAccrueInterest] Market not found: {}", [
      marketID,
    ]);
    return;
  }
  updateTONICRewards(event, market, protocol);
  (0, mapping_1._handleAccrueInterest)(
    updateMarketData,
    constants_2.comptrollerAddr,
    interestAccumulated,
    totalBorrows,
    true,
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
    constants_2.comptrollerAddr
  );
}
exports.handleTransfer = handleTransfer;
function getOrCreateProtocol() {
  const comptroller = Comptroller_1.Comptroller.bind(
    constants_2.comptrollerAddr
  );
  const protocolData = new mapping_1.ProtocolData(
    constants_2.comptrollerAddr,
    "Tectonic",
    "tectonic",
    constants_1.Network.CRONOS,
    comptroller.try_liquidationIncentiveMantissa(),
    comptroller.try_oracle()
  );
  return (0, mapping_1._getOrCreateProtocol)(protocolData);
}
function updateTONICRewards(event, market, protocol) {
  let rewardTokenBorrow = null;
  let rewardTokenDeposit = null;
  // check if market has Tonic reward tokens
  if (market.rewardTokens == null) {
    // get or create Tonic token
    let TonicToken = schema_1.Token.load(constants_2.TONICAddress);
    if (!TonicToken) {
      const tokenContract = ERC20_1.ERC20.bind(
        graph_ts_1.Address.fromString(constants_2.TONICAddress)
      );
      TonicToken = new schema_1.Token(constants_2.TONICAddress);
      TonicToken.name = (0, mapping_1.getOrElse)(
        tokenContract.try_name(),
        "unkown"
      );
      TonicToken.symbol = (0, mapping_1.getOrElse)(
        tokenContract.try_symbol(),
        "unkown"
      );
      TonicToken.decimals = (0, mapping_1.getOrElse)(
        tokenContract.try_decimals(),
        0
      );
      TonicToken.save();
    }
    const borrowID = constants_1.RewardTokenType.BORROW.concat("-").concat(
      constants_2.TONICAddress
    );
    rewardTokenBorrow = schema_1.RewardToken.load(borrowID);
    if (!rewardTokenBorrow) {
      rewardTokenBorrow = new schema_1.RewardToken(borrowID);
      rewardTokenBorrow.token = TonicToken.id; // Tonic already made from tTonic market
      rewardTokenBorrow.type = constants_1.RewardTokenType.BORROW;
      rewardTokenBorrow.save();
    }
    const depositID = constants_1.RewardTokenType.DEPOSIT.concat("-").concat(
      constants_2.TONICAddress
    );
    rewardTokenDeposit = schema_1.RewardToken.load(depositID);
    if (!rewardTokenDeposit) {
      rewardTokenDeposit = new schema_1.RewardToken(depositID);
      rewardTokenDeposit.token = TonicToken.id; // Tonic already made from tTonic market
      rewardTokenDeposit.type = constants_1.RewardTokenType.DEPOSIT;
      rewardTokenDeposit.save();
    }
    market.rewardTokens = [rewardTokenDeposit.id, rewardTokenBorrow.id];
    market.save();
  }
  // get TONIC distribution/block
  // let rewardDecimals = Token.load(TONICAddress)!.decimals;
  const rewardDecimals = 18; // TONIC 18 decimals
  const troller = Core_1.Core.bind(constants_2.comptrollerAddr);
  let TonicPriceUSD = constants_1.BIGDECIMAL_ZERO;
  let supplyTonicPerDay = constants_1.BIGINT_ZERO;
  let borrowTonicPerDay = constants_1.BIGINT_ZERO;
  // Tonic speeds are the same for supply/borrow side
  const tryTonicSpeed = troller.try_tonicSpeeds(event.address);
  supplyTonicPerDay = tryTonicSpeed.reverted
    ? constants_1.BIGINT_ZERO
    : graph_ts_1.BigInt.fromString(
        (0, constants_2.getRewardsPerDay)(
          event.block.timestamp,
          event.block.number,
          tryTonicSpeed.value.toBigDecimal(),
          constants_2.RewardIntervalType.BLOCK
        )
          .truncate(0)
          .toString()
      );
  borrowTonicPerDay = supplyTonicPerDay;
  if (event.block.number.gt(graph_ts_1.BigInt.fromI32(1337194))) {
    const oracleContract = PriceOracle_1.PriceOracle.bind(
      graph_ts_1.Address.fromString(protocol._priceOracle)
    );
    const price = oracleContract.try_getUnderlyingPrice(
      graph_ts_1.Address.fromString(constants_2.tTONICAddress)
    );
    if (price.reverted) {
      graph_ts_1.log.warning(
        "[updateTonicrewards] getUnderlyingPrice reverted",
        []
      );
    } else {
      TonicPriceUSD = price.value
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(rewardDecimals));
    }
  }
  const borrowTonicPerDayUSD = borrowTonicPerDay
    .toBigDecimal()
    .div((0, constants_1.exponentToBigDecimal)(rewardDecimals))
    .times(TonicPriceUSD);
  const supplyTonicPerDayUSD = supplyTonicPerDay
    .toBigDecimal()
    .div((0, constants_1.exponentToBigDecimal)(rewardDecimals))
    .times(TonicPriceUSD);
  market.rewardTokenEmissionsAmount = [borrowTonicPerDay, supplyTonicPerDay]; // same order as market.rewardTokens
  market.rewardTokenEmissionsUSD = [borrowTonicPerDayUSD, supplyTonicPerDayUSD];
  market.save();
}
