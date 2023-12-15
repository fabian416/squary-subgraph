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
  exports.handleMarketExited =
  exports.handleMarketEntered =
  exports.handleMarketListed =
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
const Pair_1 = require("../../../generated/templates/CToken/Pair");
const constants_2 = require("./constants");
const PriceOracle_1 = require("../../../generated/templates/CToken/PriceOracle");
function handleNewPriceOracle(event) {
  const protocol = getOrCreateProtocol();
  const newPriceOracle = event.params.newPriceOracle;
  (0, mapping_1._handleNewPriceOracle)(protocol, newPriceOracle);
}
exports.handleNewPriceOracle = handleNewPriceOracle;
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
function handleNewReserveFactor(event) {
  const marketID = event.address.toHexString();
  const newReserveFactorMantissa = event.params.newReserveFactorMantissa;
  (0, mapping_1._handleNewReserveFactor)(marketID, newReserveFactorMantissa);
}
exports.handleNewReserveFactor = handleNewReserveFactor;
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
  const updateMarketData = new mapping_1.UpdateMarketData(
    cTokenContract.try_totalSupply(),
    cTokenContract.try_exchangeRateStored(),
    cTokenContract.try_supplyRatePerBlock(),
    cTokenContract.try_borrowRatePerBlock(),
    getPrice(marketAddress, protocol._priceOracle),
    constants_1.SECONDS_PER_YEAR
  );
  const interestAccumulated = event.params.interestAccumulated;
  const totalBorrows = event.params.totalBorrows;
  (0, mapping_1._handleAccrueInterest)(
    updateMarketData,
    constants_2.comptrollerAddr,
    interestAccumulated,
    totalBorrows,
    false, // do not update market prices since not all markets have proper price oracle
    event
  );
  updateRewards(event.address);
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
    "Sonne Finance",
    "sonne-finance",
    constants_1.Network.OPTIMISM,
    comptroller.try_liquidationIncentiveMantissa(),
    comptroller.try_oracle()
  );
  return (0, mapping_1._getOrCreateProtocol)(protocolData);
}
/////////////////
//// Helpers ////
/////////////////
class RewardTokenEmission {
  constructor(amount, amountUSD) {
    this.amount = amount;
    this.amountUSD = amountUSD;
  }
}
// calculate SONNE reward speeds
function updateRewards(marketID) {
  const market = schema_1.Market.load(marketID.toHexString());
  if (!market) {
    graph_ts_1.log.warning("Market not found for address {}", [
      marketID.toHexString(),
    ]);
    return;
  }
  const comptroller = Comptroller_1.Comptroller.bind(
    constants_2.comptrollerAddr
  );
  const tryBorrowRate = comptroller.try_compBorrowSpeeds(marketID);
  const trySupplyRate = comptroller.try_compSupplySpeeds(marketID);
  if (tryBorrowRate.reverted || trySupplyRate.reverted) {
    graph_ts_1.log.warning("Failed to get reward speed for market {}", [
      marketID.toHexString(),
    ]);
    return;
  }
  const borrowRewardToken = getOrCreateRewardToken(
    constants_2.SONNE_ADDRESS,
    constants_1.RewardTokenType.BORROW
  );
  const supplyRewardToken = getOrCreateRewardToken(
    constants_2.SONNE_ADDRESS,
    constants_1.RewardTokenType.DEPOSIT
  );
  const sonnePriceUSD = getSonnePrice();
  const borrowRewards = getRewardsPerDay(
    tryBorrowRate.value,
    borrowRewardToken,
    sonnePriceUSD
  );
  const supplyRewards = getRewardsPerDay(
    trySupplyRate.value,
    supplyRewardToken,
    sonnePriceUSD
  );
  market.rewardTokens = [borrowRewardToken.id, supplyRewardToken.id];
  market.rewardTokenEmissionsAmount = [
    borrowRewards.amount,
    supplyRewards.amount,
  ];
  market.rewardTokenEmissionsUSD = [
    borrowRewards.amountUSD,
    supplyRewards.amountUSD,
  ];
  market.save();
}
function getRewardsPerDay(rewardSpeed, rewardToken, priceUSD) {
  // Reward speed of <= 1 is 0
  if (rewardSpeed.gt(constants_1.BIGINT_ONE) && rewardToken) {
    const token = getOrCreateToken(
      graph_ts_1.Address.fromString(rewardToken.token)
    );
    const amount = rewardSpeed.times(
      graph_ts_1.BigInt.fromI64(constants_1.SECONDS_PER_DAY)
    );
    const amountUSD = amount
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(token.decimals))
      .times(priceUSD);
    return new RewardTokenEmission(amount, amountUSD);
  }
  return new RewardTokenEmission(
    constants_1.BIGINT_ZERO,
    constants_1.BIGDECIMAL_ZERO
  );
}
function getOrCreateRewardToken(tokenAddress, type) {
  const rewardTokenId = type.concat("-").concat(tokenAddress.toHexString());
  let rewardToken = schema_1.RewardToken.load(rewardTokenId);
  if (!rewardToken) {
    rewardToken = new schema_1.RewardToken(rewardTokenId);
    rewardToken.token = getOrCreateToken(tokenAddress).id;
    rewardToken.type = type;
    rewardToken.save();
  }
  return rewardToken;
}
function getOrCreateToken(tokenAddress) {
  let token = schema_1.Token.load(tokenAddress.toHexString());
  if (!token) {
    token = new schema_1.Token(tokenAddress.toHexString());
    const erc20Contract = ERC20_1.ERC20.bind(tokenAddress);
    token.name = (0, mapping_1.getOrElse)(erc20Contract.try_name(), "Unknown");
    token.symbol = (0, mapping_1.getOrElse)(
      erc20Contract.try_symbol(),
      "UNKWN"
    );
    token.decimals = (0, mapping_1.getOrElse)(erc20Contract.try_decimals(), 0);
    token.save();
  }
  return token;
}
function getPrice(marketAddress, priceOracle) {
  // get the price normally
  const oracleContract = PriceOracle_1.PriceOracle.bind(
    graph_ts_1.Address.fromString(priceOracle)
  );
  return oracleContract.try_getUnderlyingPrice(marketAddress);
}
// get $SONNE price from SONNE/USDC lp pair on Velodrome
// SONNE/USDC was created before Sonne Finance was launched
function getSonnePrice() {
  const lpPair = Pair_1.Pair.bind(constants_2.SONNE_USDC_LP);
  const tryReserves = lpPair.try_getReserves();
  if (tryReserves.reverted) {
    graph_ts_1.log.warning("tryReserves reverted", []);
    return constants_1.BIGDECIMAL_ZERO;
  }
  // no divide by zero
  if (
    tryReserves.value.value0.equals(constants_1.BIGINT_ZERO) ||
    tryReserves.value.value1.equals(constants_1.BIGINT_ZERO)
  ) {
    graph_ts_1.log.warning("tryReserves value is zero for LP: ", [
      constants_2.SONNE_USDC_LP.toHexString(),
    ]);
    return constants_1.BIGDECIMAL_ZERO;
  }
  // $SONNE = reserve1 / reserve0
  // Note: must normalize decimals
  const reserveBalance0 = tryReserves.value.value0
    .toBigDecimal()
    .div((0, constants_1.exponentToBigDecimal)(constants_2.DEFAULT_DECIMALS));
  const reserveBalance1 = tryReserves.value.value1
    .toBigDecimal()
    .div((0, constants_1.exponentToBigDecimal)(constants_2.USDC_DECIMALS));
  return reserveBalance1.div(reserveBalance0);
}
