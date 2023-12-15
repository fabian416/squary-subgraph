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
  exports.handleNewLiquidationIncentive =
  exports.handleActionPaused =
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
const SolarBeamLPToken_1 = require("../../../generated/templates/CToken/SolarBeamLPToken");
const templates_1 = require("../../../generated/templates");
const ERC20_1 = require("../../../generated/Comptroller/ERC20");
const PriceOracle_1 = require("../../../generated/templates/CToken/PriceOracle");
const constants_2 = require("./constants");
class RewardTokenEmission {
  constructor(amount, USD) {
    this.amount = amount;
    this.USD = USD;
  }
}
function handleNewPriceOracle(event) {
  const protocol = getOrCreateProtocol();
  const newPriceOracle = event.params.newPriceOracle;
  (0, mapping_1._handleNewPriceOracle)(protocol, newPriceOracle);
}
exports.handleNewPriceOracle = handleNewPriceOracle;
function handleMarketEntered(event) {
  const protocolData = (0, constants_2.getProtocolData)();
  (0, mapping_1._handleMarketEntered)(
    protocolData.comptrollerAddress,
    event.params.mToken.toHexString(),
    event.params.account.toHexString(),
    true
  );
}
exports.handleMarketEntered = handleMarketEntered;
function handleMarketExited(event) {
  const protocolData = (0, constants_2.getProtocolData)();
  (0, mapping_1._handleMarketEntered)(
    protocolData.comptrollerAddress,
    event.params.mToken.toHexString(),
    event.params.account.toHexString(),
    false
  );
}
exports.handleMarketExited = handleMarketExited;
function handleMarketListed(event) {
  templates_1.CToken.create(event.params.mToken);
  const cTokenAddr = event.params.mToken;
  const cToken = schema_1.Token.load(cTokenAddr.toHexString());
  if (cToken != null) {
    return;
  }
  // this is a new cToken, a new underlying token, and a new market
  const protocol = getOrCreateProtocol();
  const cTokenContract = CToken_1.CToken.bind(event.params.mToken);
  const cTokenReserveFactorMantissa = (0, mapping_1.getOrElse)(
    cTokenContract.try_reserveFactorMantissa(),
    constants_1.BIGINT_ZERO
  );
  const protocolData = (0, constants_2.getProtocolData)();
  if (cTokenAddr == protocolData.nativeCToken.address) {
    const marketListedData = new mapping_1.MarketListedData(
      protocol,
      protocolData.nativeToken,
      protocolData.nativeCToken,
      cTokenReserveFactorMantissa
    );
    (0, mapping_1._handleMarketListed)(marketListedData, event);
    initMarketRewards(cTokenAddr.toHexString());
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
  initMarketRewards(cTokenAddr.toHexString());
}
exports.handleMarketListed = handleMarketListed;
function handleNewCollateralFactor(event) {
  const marketID = event.params.mToken.toHexString();
  const collateralFactorMantissa = event.params.newCollateralFactorMantissa;
  (0, mapping_1._handleNewCollateralFactor)(marketID, collateralFactorMantissa);
}
exports.handleNewCollateralFactor = handleNewCollateralFactor;
function handleActionPaused(event) {
  const marketID = event.params.mToken.toHexString();
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[handleActionPaused] Market not found: {}", [
      marketID,
    ]);
    return;
  }
  if (event.params.action == "Mint") {
    market.isActive = event.params.pauseState;
  } else if (event.params.action == "Borrow") {
    market.canBorrowFrom = event.params.pauseState;
  }
  market.save();
}
exports.handleActionPaused = handleActionPaused;
function handleNewLiquidationIncentive(event) {
  const protocol = getOrCreateProtocol();
  const newLiquidationIncentive = event.params.newLiquidationIncentiveMantissa;
  (0, mapping_1._handleNewLiquidationIncentive)(
    protocol,
    newLiquidationIncentive
  );
}
exports.handleNewLiquidationIncentive = handleNewLiquidationIncentive;
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
  const protocolData = (0, constants_2.getProtocolData)();
  (0, mapping_1._handleMint)(
    protocolData.comptrollerAddress,
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
  const protocolData = (0, constants_2.getProtocolData)();
  (0, mapping_1._handleRedeem)(
    protocolData.comptrollerAddress,
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
  const protocolData = (0, constants_2.getProtocolData)();
  (0, mapping_1._handleBorrow)(
    protocolData.comptrollerAddress,
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
  const protocolData = (0, constants_2.getProtocolData)();
  (0, mapping_1._handleRepayBorrow)(
    protocolData.comptrollerAddress,
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
  const cTokenCollateral = event.params.mTokenCollateral;
  const liquidator = event.params.liquidator;
  const borrower = event.params.borrower;
  const seizeTokens = event.params.seizeTokens;
  const repayAmount = event.params.repayAmount;
  const protocolData = (0, constants_2.getProtocolData)();
  (0, mapping_1._handleLiquidateBorrow)(
    protocolData.comptrollerAddress,
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
  setMarketRewards(marketAddress, event.block.number.toI32());
  const cTokenContract = CToken_1.CToken.bind(marketAddress);
  const protocol = getOrCreateProtocol();
  const oracleContract = PriceOracle_1.PriceOracle.bind(
    graph_ts_1.Address.fromString(protocol._priceOracle)
  );
  const updateMarketData = new mapping_1.UpdateMarketData(
    cTokenContract.try_totalSupply(),
    cTokenContract.try_exchangeRateStored(),
    cTokenContract.try_supplyRatePerTimestamp(),
    cTokenContract.try_borrowRatePerTimestamp(),
    oracleContract.try_getUnderlyingPrice(marketAddress),
    constants_1.SECONDS_PER_YEAR
  );
  const interestAccumulated = event.params.interestAccumulated;
  const totalBorrows = event.params.totalBorrows;
  const protocolData = (0, constants_2.getProtocolData)();
  (0, mapping_1._handleAccrueInterest)(
    updateMarketData,
    protocolData.comptrollerAddress,
    interestAccumulated,
    totalBorrows,
    false, // do not update all prices
    event
  );
}
exports.handleAccrueInterest = handleAccrueInterest;
function handleTransfer(event) {
  const protocolData = (0, constants_2.getProtocolData)();
  (0, mapping_1._handleTransfer)(
    event,
    event.address.toHexString(),
    event.params.to,
    event.params.from,
    protocolData.comptrollerAddress
  );
}
exports.handleTransfer = handleTransfer;
function getOrCreateProtocol() {
  const protocolData = (0, constants_2.getProtocolData)();
  const comptroller = Comptroller_1.Comptroller.bind(
    protocolData.comptrollerAddress
  );
  const data = new mapping_1.ProtocolData(
    protocolData.comptrollerAddress,
    "Moonwell",
    "moonwell",
    protocolData.network,
    comptroller.try_liquidationIncentiveMantissa(),
    comptroller.try_oracle()
  );
  return (0, mapping_1._getOrCreateProtocol)(data);
}
function initMarketRewards(marketID) {
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[initMarketRewards] market not found: {}", [
      marketID,
    ]);
    return;
  }
  const protocolData = (0, constants_2.getProtocolData)();
  // Moonriver rewardTokens = [BORROW-MOVR, BORROW-MFAM, DEPOSIT-MOVR, DEPOSIT-MFAM]
  // Moonbeam rewardTokens = [BORROW-GLMR, BORROW-WELL, DEPOSIT-GLMR, DEPOSIT-WELL]
  let _rewardToken0 = schema_1.Token.load(
    protocolData.nativeToken.address.toHexString()
  );
  if (!_rewardToken0) {
    _rewardToken0 = new schema_1.Token(
      protocolData.nativeToken.address.toHexString()
    );
    _rewardToken0.name = protocolData.nativeToken.name;
    _rewardToken0.symbol = protocolData.nativeToken.symbol;
    _rewardToken0.decimals = protocolData.nativeToken.decimals;
    _rewardToken0.save();
  }
  const rewardToken0 = _rewardToken0;
  let _rewardToken1 = schema_1.Token.load(
    protocolData.auxilaryRewardToken.address.toHexString()
  );
  if (!_rewardToken1) {
    _rewardToken1 = new schema_1.Token(
      protocolData.auxilaryRewardToken.address.toHexString()
    );
    _rewardToken1.name = protocolData.auxilaryRewardToken.name;
    _rewardToken1.symbol = protocolData.auxilaryRewardToken.symbol;
    _rewardToken1.decimals = protocolData.auxilaryRewardToken.decimals;
    _rewardToken1.save();
  }
  const rewardToken1 = _rewardToken1;
  let supplyRewardToken0 = schema_1.RewardToken.load(
    constants_1.RewardTokenType.DEPOSIT.concat("-").concat(rewardToken0.id)
  );
  if (!supplyRewardToken0) {
    supplyRewardToken0 = new schema_1.RewardToken(
      constants_1.RewardTokenType.DEPOSIT.concat("-").concat(rewardToken0.id)
    );
    supplyRewardToken0.token = rewardToken0.id;
    supplyRewardToken0.type = constants_1.RewardTokenType.DEPOSIT;
    supplyRewardToken0.save();
  }
  let supplyRewardToken1 = schema_1.RewardToken.load(
    constants_1.RewardTokenType.DEPOSIT.concat("-").concat(rewardToken1.id)
  );
  if (!supplyRewardToken1) {
    supplyRewardToken1 = new schema_1.RewardToken(
      constants_1.RewardTokenType.DEPOSIT.concat("-").concat(rewardToken1.id)
    );
    supplyRewardToken1.token = rewardToken1.id;
    supplyRewardToken1.type = constants_1.RewardTokenType.DEPOSIT;
    supplyRewardToken1.save();
  }
  let borrowRewardToken0 = schema_1.RewardToken.load(
    constants_1.RewardTokenType.BORROW.concat("-").concat(rewardToken0.id)
  );
  if (!borrowRewardToken0) {
    borrowRewardToken0 = new schema_1.RewardToken(
      constants_1.RewardTokenType.BORROW.concat("-").concat(rewardToken0.id)
    );
    borrowRewardToken0.token = rewardToken0.id;
    borrowRewardToken0.type = constants_1.RewardTokenType.BORROW;
    borrowRewardToken0.save();
  }
  let borrowRewardToken1 = schema_1.RewardToken.load(
    constants_1.RewardTokenType.BORROW.concat("-").concat(rewardToken1.id)
  );
  if (!borrowRewardToken1) {
    borrowRewardToken1 = new schema_1.RewardToken(
      constants_1.RewardTokenType.BORROW.concat("-").concat(rewardToken1.id)
    );
    borrowRewardToken1.token = rewardToken1.id;
    borrowRewardToken1.type = constants_1.RewardTokenType.BORROW;
    borrowRewardToken1.save();
  }
  market.rewardTokens = [
    borrowRewardToken0.id,
    borrowRewardToken1.id,
    supplyRewardToken0.id,
    supplyRewardToken1.id,
  ];
  market.rewardTokenEmissionsAmount = [
    constants_1.BIGINT_ZERO,
    constants_1.BIGINT_ZERO,
    constants_1.BIGINT_ZERO,
    constants_1.BIGINT_ZERO,
  ];
  market.rewardTokenEmissionsUSD = [
    constants_1.BIGDECIMAL_ZERO,
    constants_1.BIGDECIMAL_ZERO,
    constants_1.BIGDECIMAL_ZERO,
    constants_1.BIGDECIMAL_ZERO,
  ];
  market.save();
}
function setMarketRewards(marketAddress, blockNumber) {
  const marketID = marketAddress.toHexString();
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[setMarketRewards] Market not found: {}", [
      marketID,
    ]);
    return;
  }
  const protocolData = (0, constants_2.getProtocolData)();
  const nativeMarket = schema_1.Market.load(
    protocolData.nativeCToken.address.toHexString()
  );
  if (!nativeMarket) {
    graph_ts_1.log.warning("[setMarketRewards] nativeMarket not found: {}", [
      protocolData.nativeCToken.address.toHexString(),
    ]);
    return;
  }
  const token0PriceUSD = nativeMarket.inputTokenPriceUSD;
  let token1PriceUSD = constants_1.BIGDECIMAL_ZERO;
  if (blockNumber >= protocolData.nativeLPStartBlock) {
    let oneAuxillaryInNative = constants_1.BIGDECIMAL_ZERO;
    if (
      (0, constants_1.equalsIgnoreCase)(
        graph_ts_1.dataSource.network(),
        constants_1.Network.MOONRIVER
      )
    ) {
      oneAuxillaryInNative = getOneMFAMInMOVR(protocolData.nativeLPAddress);
    } else {
      oneAuxillaryInNative = getOneWELLInGLMR(protocolData.nativeLPAddress);
    }
    token1PriceUSD = oneAuxillaryInNative.times(token0PriceUSD);
  }
  const comptroller = Comptroller_1.Comptroller.bind(
    protocolData.comptrollerAddress
  );
  // In Comptroller, 0 = MFAM, 1 = MOVR || 0 = WELL, 1 = GLMR
  const supplyNativeEmission = getRewardTokenEmission(
    comptroller.try_supplyRewardSpeeds(1, marketAddress),
    18,
    token0PriceUSD
  );
  const supplyAuxEmission = getRewardTokenEmission(
    comptroller.try_supplyRewardSpeeds(0, marketAddress),
    18,
    token1PriceUSD
  );
  const borrowNativeEmission = getRewardTokenEmission(
    comptroller.try_borrowRewardSpeeds(1, marketAddress),
    18,
    token0PriceUSD
  );
  const borrowAuxEmission = getRewardTokenEmission(
    comptroller.try_borrowRewardSpeeds(0, marketAddress),
    18,
    token1PriceUSD
  );
  market.rewardTokenEmissionsAmount = [
    borrowNativeEmission.amount,
    borrowAuxEmission.amount,
    supplyNativeEmission.amount,
    supplyAuxEmission.amount,
  ];
  market.rewardTokenEmissionsUSD = [
    borrowNativeEmission.USD,
    borrowAuxEmission.USD,
    supplyNativeEmission.USD,
    supplyAuxEmission.USD,
  ];
  market.save();
}
function getRewardTokenEmission(
  rewardSpeedsResult,
  tokenDecimals,
  tokenPriceUSD
) {
  if (rewardSpeedsResult.reverted) {
    graph_ts_1.log.warning("[getRewardTokenEmission] result reverted", []);
    return new RewardTokenEmission(
      constants_1.BIGINT_ZERO,
      constants_1.BIGDECIMAL_ZERO
    );
  }
  const rewardAmountPerSecond = rewardSpeedsResult.value;
  const rewardAmount = rewardAmountPerSecond.times(
    graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_DAY)
  );
  const rewardUSD = rewardAmount
    .toBigDecimal()
    .div((0, constants_1.exponentToBigDecimal)(tokenDecimals))
    .times(tokenPriceUSD);
  return new RewardTokenEmission(rewardAmount, rewardUSD);
}
// Fetch MFAM vs MOVR price from SolarBeam, as suggested by Luke, Moonwell's CEO.
function getOneMFAMInMOVR(lpAddress) {
  const lpTokenContract = SolarBeamLPToken_1.SolarBeamLPToken.bind(lpAddress);
  const getReservesResult = lpTokenContract.try_getReserves();
  if (getReservesResult.reverted) {
    graph_ts_1.log.warning("[getOneMFAMInMOVR] result reverted", []);
    return constants_1.BIGDECIMAL_ZERO;
  }
  const MOVRReserve = getReservesResult.value.value0;
  const MFAMReserve = getReservesResult.value.value1;
  return MOVRReserve.toBigDecimal().div(MFAMReserve.toBigDecimal());
}
// Fetch WELL vs GLMR price from SolarBeam
function getOneWELLInGLMR(lpAddress) {
  const lpTokenContract = SolarBeamLPToken_1.SolarBeamLPToken.bind(lpAddress);
  const getReservesResult = lpTokenContract.try_getReserves();
  if (getReservesResult.reverted) {
    graph_ts_1.log.warning("[getOneWELLInGLMR] result reverted", []);
    return constants_1.BIGDECIMAL_ZERO;
  }
  const GLMRReserve = getReservesResult.value.value1;
  const WELLReserve = getReservesResult.value.value0;
  return GLMRReserve.toBigDecimal().div(WELLReserve.toBigDecimal());
}
