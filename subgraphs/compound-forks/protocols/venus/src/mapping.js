"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVenusSpeedUpdated =
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
const rewards_1 = require("./rewards");
function handleNewPriceOracle(event) {
  const protocol = getOrCreateProtocol();
  const newPriceOracle = event.params.newPriceOracle;
  (0, mapping_1._handleNewPriceOracle)(protocol, newPriceOracle);
}
exports.handleNewPriceOracle = handleNewPriceOracle;
function handleMarketEntered(event) {
  (0, mapping_1._handleMarketEntered)(
    constants_2.comptrollerAddr,
    event.params.vToken.toHexString(),
    event.params.account.toHexString(),
    true
  );
}
exports.handleMarketEntered = handleMarketEntered;
function handleMarketExited(event) {
  (0, mapping_1._handleMarketEntered)(
    constants_2.comptrollerAddr,
    event.params.vToken.toHexString(),
    event.params.account.toHexString(),
    false
  );
}
exports.handleMarketExited = handleMarketExited;
function handleMarketListed(event) {
  templates_1.CToken.create(event.params.vToken);
  const cTokenAddr = event.params.vToken;
  const cToken = schema_1.Token.load(cTokenAddr.toHexString());
  if (cToken != null) {
    return;
  }
  // this is a new cToken, a new underlying token, and a new market
  const protocol = getOrCreateProtocol();
  const cTokenContract = CToken_1.CToken.bind(event.params.vToken);
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
  const marketID = event.params.vToken.toHexString();
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
  const marketID = event.params.vToken.toHexString();
  const action = actionEnumToString(event.params.action);
  const pauseState = event.params.pauseState;
  (0, mapping_1._handleActionPaused)(marketID, action, pauseState);
}
exports.handleActionPaused = handleActionPaused;
function actionEnumToString(action) {
  // https://github.com/VenusProtocol/venus-protocol/blob/develop/contracts/ComptrollerStorage.sol#L214
  switch (action) {
    case 0:
      return "Mint";
    case 1:
      return "Redeem";
    case 2:
      return "Borrow";
    case 3:
      return "RepayBorrow";
    case 4:
      return "Seize";
    case 5:
      return "LiquidateBorrow";
    case 6:
      return "Transfer";
    case 7:
      return "EnterMarket";
    case 8:
      return "ExitMarket";
    default:
      return "Unknown";
  }
}
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
  const market = schema_1.Market.load(marketAddress.toHexString());
  updateRewardValueUSD(market);
  const cTokenContract = CToken_1.CToken.bind(marketAddress);
  const protocol = getOrCreateProtocol();
  const oracleContract = PriceOracle_1.PriceOracle.bind(
    graph_ts_1.Address.fromString(protocol._priceOracle)
  );
  // DAI price oracle broken from blocks 17803407 - 17836448
  // We will override it to exactly 1 USD for those blocks
  let tryUnderlyingPrice = oracleContract.try_getUnderlyingPrice(marketAddress);
  if (
    marketAddress == constants_2.VDAI_MARKET_ADDRESS &&
    event.block.number.toI32() >= 17803407 &&
    event.block.number.toI32() <= 17836448
  ) {
    tryUnderlyingPrice = graph_ts_1.ethereum.CallResult.fromValue(
      graph_ts_1.BigInt.fromI64(1000000000000000000)
    );
  }
  const updateMarketData = new mapping_1.UpdateMarketData(
    cTokenContract.try_totalSupply(),
    cTokenContract.try_exchangeRateStored(),
    cTokenContract.try_supplyRatePerBlock(),
    cTokenContract.try_borrowRatePerBlock(),
    tryUnderlyingPrice,
    constants_1.BSC_BLOCKS_PER_YEAR
  );
  const interestAccumulated = event.params.interestAccumulated;
  const totalBorrows = event.params.totalBorrows;
  (0, mapping_1._handleAccrueInterest)(
    updateMarketData,
    constants_2.comptrollerAddr,
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
    constants_2.comptrollerAddr
  );
}
exports.handleTransfer = handleTransfer;
// update market reward amounts based on event data.
function handleVenusSpeedUpdated(event) {
  const marketAddress = event.params.vToken;
  const speed = event.params.newSpeed;
  const rewards = (0, rewards_1.getRewardsPerDay)(
    event.block.timestamp,
    event.block.number,
    speed.toBigDecimal(),
    rewards_1.RewardIntervalType.BLOCK
  );
  const rewardAmount = graph_ts_1.BigInt.fromString(
    rewards.truncate(0).toString()
  );
  const borrowRewardToken = getOrCreateRewardToken(
    constants_1.RewardTokenType.BORROW
  );
  const supplyRewardToken = getOrCreateRewardToken(
    constants_1.RewardTokenType.DEPOSIT
  );
  const market = schema_1.Market.load(marketAddress.toHexString());
  market.rewardTokens = [
    borrowRewardToken.rewardToken.id,
    supplyRewardToken.rewardToken.id,
  ];
  market.rewardTokenEmissionsAmount = [rewardAmount, rewardAmount]; // venus gives the same amount to borrowers and suppliers for each market
  market.rewardTokenEmissionsUSD = [
    constants_1.BIGDECIMAL_ZERO,
    constants_1.BIGDECIMAL_ZERO,
  ];
  updateRewardValueUSD(market);
  market.save();
  // update market snapshots.
  (0, mapping_1.getOrCreateMarketDailySnapshot)(
    market,
    event.block.timestamp,
    event.block.number
  );
  (0, mapping_1.getOrCreateMarketHourlySnapshot)(
    market,
    event.block.timestamp,
    event.block.number
  );
}
exports.handleVenusSpeedUpdated = handleVenusSpeedUpdated;
// updateRewardValueUSD will update the reward value in USD, assuming
// the reward amount hasn't changed. If it changes it will be updated on VenusSpeedUpdated.
// This function can be called anytime and it will update the reward value in USD.
function updateRewardValueUSD(market) {
  if (!market.rewardTokens || market.rewardTokens.length == 0) {
    return;
  }
  const protocol = getOrCreateProtocol();
  const oracleContract = PriceOracle_1.PriceOracle.bind(
    graph_ts_1.Address.fromString(protocol._priceOracle)
  );
  const priceCall = oracleContract.try_getUnderlyingPrice(
    constants_2.vXVS.address
  );
  if (priceCall.reverted) {
    graph_ts_1.log.error(
      "unable to calculate rewards: priceCall reverted for vXVS {}",
      [constants_2.vXVS.address.toHexString()]
    );
    return;
  }
  const rewardAmount = market.rewardTokenEmissionsAmount[0];
  const rewardAmountUSD = rewardAmount
    .times(priceCall.value)
    .divDecimal(
      (0, constants_1.exponentToBigDecimal)(constants_2.ORACLE_PRECISION)
    )
    .div((0, constants_1.exponentToBigDecimal)(constants_2.XVS.decimals));
  market.rewardTokenEmissionsUSD = [rewardAmountUSD, rewardAmountUSD];
  market.save();
}
class rewardToken {}
function getOrCreateRewardToken(type) {
  let token = schema_1.Token.load(constants_2.XVS.address.toHexString());
  if (!token) {
    token = new schema_1.Token(constants_2.XVS.address.toHexString());
    token.symbol = "XVS";
    token.decimals = 18;
    token.name = "Venus";
    token.save();
  }
  const rewardTokenId = type + "-" + token.id;
  let rToken = schema_1.RewardToken.load(rewardTokenId);
  if (!rToken) {
    rToken = new schema_1.RewardToken(rewardTokenId);
    rToken.token = token.id;
    rToken.type = type;
    rToken.save();
  }
  return {
    token: token,
    rewardToken: rToken,
  };
}
function getOrCreateProtocol() {
  const comptroller = Comptroller_1.Comptroller.bind(
    constants_2.comptrollerAddr
  );
  const protocolData = new mapping_1.ProtocolData(
    constants_2.comptrollerAddr,
    "Venus",
    "venus",
    constants_1.Network.BSC,
    comptroller.try_liquidationIncentiveMantissa(),
    comptroller.try_oracle()
  );
  return (0, mapping_1._getOrCreateProtocol)(protocolData);
}
