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
const AuriLens_1 = require("../../../generated/templates/CToken/AuriLens");
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
  const cTokenCollateral = event.params.auTokenCollateral;
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
    cTokenContract.try_supplyRatePerTimestamp(),
    cTokenContract.try_borrowRatePerTimestamp(),
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
  // Rewards not started until block 64549279
  if (event.block.number.toI64() > 64549279) {
    updateRewards(event, event.address);
  }
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
    "Aurigami",
    "aurigami",
    constants_1.Network.AURORA,
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
// calculate PLY reward speeds
function updateRewards(event, marketID) {
  const protocol = getOrCreateProtocol();
  const market = schema_1.Market.load(marketID.toHexString());
  if (!market) {
    graph_ts_1.log.warning("Market not found for address {}", [
      marketID.toHexString(),
    ]);
    return;
  }
  const auriLensContract = AuriLens_1.AuriLens.bind(
    constants_2.AURI_LENS_CONTRACT_ADDRESS
  );
  const tryRewardSpeeds = auriLensContract.try_getRewardSpeeds(
    constants_2.comptrollerAddr,
    event.address
  );
  market.rewardTokens = [
    getOrCreateRewardToken(
      constants_2.PLY_TOKEN_ADDRESS,
      constants_1.RewardTokenType.BORROW
    ).id,
    getOrCreateRewardToken(
      constants_2.AURORA_TOKEN_ADDRESS,
      constants_1.RewardTokenType.BORROW
    ).id,
    getOrCreateRewardToken(
      constants_2.PLY_TOKEN_ADDRESS,
      constants_1.RewardTokenType.DEPOSIT
    ).id,
    getOrCreateRewardToken(
      constants_2.AURORA_TOKEN_ADDRESS,
      constants_1.RewardTokenType.DEPOSIT
    ).id,
  ];
  if (tryRewardSpeeds.reverted) {
    graph_ts_1.log.warning("Could not get borrow/supply speeds for market {}", [
      market.id,
    ]);
    return;
  }
  const rewardsAmount = [];
  const rewardsAmountUSD = [];
  let rewards;
  // PLY Borrow
  rewards = getRewardsPerDay(
    tryRewardSpeeds.value.plyRewardBorrowSpeed,
    schema_1.RewardToken.load(market.rewardTokens[0]),
    getPrice(constants_2.PLY_MARKET, protocol._priceOracle)
  );
  rewardsAmount.push(rewards.amount);
  rewardsAmountUSD.push(rewards.amountUSD);
  // AURORA Borrow
  rewards = getRewardsPerDay(
    tryRewardSpeeds.value.auroraRewardBorrowSpeed,
    schema_1.RewardToken.load(market.rewardTokens[1]),
    getPrice(constants_2.AURORA_MARKET, protocol._priceOracle)
  );
  rewardsAmount.push(rewards.amount);
  rewardsAmountUSD.push(rewards.amountUSD);
  // PLY Supply
  rewards = getRewardsPerDay(
    tryRewardSpeeds.value.plyRewardSupplySpeed,
    schema_1.RewardToken.load(market.rewardTokens[2]),
    getPrice(constants_2.PLY_MARKET, protocol._priceOracle)
  );
  rewardsAmount.push(rewards.amount);
  rewardsAmountUSD.push(rewards.amountUSD);
  // AURORA Supply
  rewards = getRewardsPerDay(
    tryRewardSpeeds.value.auroraRewardSupplySpeed,
    schema_1.RewardToken.load(market.rewardTokens[3]),
    getPrice(constants_2.AURORA_MARKET, protocol._priceOracle)
  );
  rewardsAmount.push(rewards.amount);
  rewardsAmountUSD.push(rewards.amountUSD);
  market.rewardTokenEmissionsAmount = rewardsAmount;
  market.rewardTokenEmissionsUSD = rewardsAmountUSD;
  market.save();
}
function getRewardsPerDay(rewardSpeed, rewardToken, price) {
  // Reward speed of <= 1 is 0
  if (rewardSpeed.gt(constants_1.BIGINT_ONE) && rewardToken) {
    const token = getOrCreateToken(
      graph_ts_1.Address.fromString(rewardToken.token)
    );
    const amount = rewardSpeed.times(
      graph_ts_1.BigInt.fromI64(constants_1.SECONDS_PER_DAY)
    );
    const mantissaFactorBD = (0, constants_1.exponentToBigDecimal)(
      18 - token.decimals + 18
    );
    const priceUSD = price.value.toBigDecimal().div(mantissaFactorBD);
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
  //
  //
  // There are 4 markets where the price oracle does not work
  // PLY, AURORA, TRI, USN
  // Use Trisolaris LP pool pairs to derive price
  if (marketAddress == constants_2.PLY_MARKET) {
    return graph_ts_1.ethereum.CallResult.fromValue(
      getPriceFromLp(
        priceOracle,
        constants_2.WNEAR_MARKET,
        constants_2.PLY_MARKET,
        constants_2.WNEAR_PLY_LP
      )
    );
  }
  if (marketAddress == constants_2.AURORA_MARKET) {
    return graph_ts_1.ethereum.CallResult.fromValue(
      getPriceFromLp(
        priceOracle,
        constants_2.ETH_MARKET,
        constants_2.AURORA_MARKET,
        constants_2.AURORA_ETH_LP
      )
    );
  }
  if (marketAddress == constants_2.TRI_MARKET) {
    return graph_ts_1.ethereum.CallResult.fromValue(
      getPriceFromLp(
        priceOracle,
        constants_2.USDT_MARKET,
        constants_2.TRI_MARKET,
        constants_2.TRI_USDT_LP
      )
    );
  }
  if (marketAddress == constants_2.USN_MARKET) {
    return graph_ts_1.ethereum.CallResult.fromValue(
      getPriceFromLp(
        priceOracle,
        constants_2.WNEAR_MARKET,
        constants_2.USN_MARKET,
        constants_2.WNEAR_USN_LP
      )
    );
  }
  // get the price normally
  const oracleContract = PriceOracle_1.PriceOracle.bind(
    graph_ts_1.Address.fromString(priceOracle)
  );
  return oracleContract.try_getUnderlyingPrice(marketAddress);
}
function getPriceFromLp(
  priceOracle, // aurigami price oracle
  knownMarketID, // address of the market we know the price of
  wantAddress, // market address of token we want to price
  lpAddress // address of LP token
) {
  const oracleContract = PriceOracle_1.PriceOracle.bind(
    graph_ts_1.Address.fromString(priceOracle)
  );
  const knownMarket = schema_1.Market.load(knownMarketID.toHexString());
  if (!knownMarket) {
    graph_ts_1.log.warning("knownMarket not found", []);
    return constants_1.BIGINT_ZERO;
  }
  const knownMarketDecimals = schema_1.Token.load(
    knownMarket.inputToken
  ).decimals;
  const knownPriceUSD = (0, mapping_1.getTokenPriceUSD)(
    oracleContract.try_getUnderlyingPrice(knownMarketID),
    knownMarketDecimals
  );
  const lpPair = Pair_1.Pair.bind(lpAddress);
  const tryReserves = lpPair.try_getReserves();
  if (tryReserves.reverted) {
    graph_ts_1.log.warning("tryReserves reverted", []);
    return constants_1.BIGINT_ZERO;
  }
  const wantMarket = schema_1.Market.load(wantAddress.toHexString());
  if (!wantMarket) {
    graph_ts_1.log.warning("wantMarket not found", []);
    return constants_1.BIGINT_ZERO;
  }
  const wantMarketDecimals = schema_1.Token.load(
    wantMarket.inputToken
  ).decimals;
  // no divide by zero
  if (
    tryReserves.value.value0.equals(constants_1.BIGINT_ZERO) ||
    tryReserves.value.value1.equals(constants_1.BIGINT_ZERO)
  ) {
    graph_ts_1.log.warning("tryReserves value is zero for LP: ", [
      lpAddress.toHexString(),
    ]);
    return constants_1.BIGINT_ZERO;
  }
  // decide which token we want to price
  const tryToken0 = lpPair.try_token0();
  if (tryToken0.reverted) {
    graph_ts_1.log.warning("tryToken0 reverted", []);
    return constants_1.BIGINT_ZERO;
  }
  let findToken0Price = true;
  if (
    tryToken0.value.toHexString().toLowerCase() !=
    wantMarket.inputToken.toLowerCase()
  ) {
    findToken0Price = false;
  }
  let priceBD;
  if (findToken0Price) {
    const reserveBalance0 = tryReserves.value.value0
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(wantMarketDecimals));
    const reserveBalance1 = tryReserves.value.value1
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(knownMarketDecimals));
    // price of reserve0 = price of reserve1 / (reserve0 / reserve1)
    priceBD = knownPriceUSD.div(reserveBalance0.div(reserveBalance1));
  } else {
    const reserveBalance0 = tryReserves.value.value0
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(knownMarketDecimals));
    const reserveBalance1 = tryReserves.value.value1
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(wantMarketDecimals));
    // price of reserve1 = price of reserve0 * (reserve0 / reserve1)
    priceBD = knownPriceUSD.times(reserveBalance0.div(reserveBalance1));
  }
  // convert back to BigInt
  const reverseMantissaFactor = 18 - wantMarketDecimals + 18;
  return graph_ts_1.BigInt.fromString(
    priceBD
      .times((0, constants_1.exponentToBigDecimal)(reverseMantissaFactor))
      .truncate(0)
      .toString()
  );
}
