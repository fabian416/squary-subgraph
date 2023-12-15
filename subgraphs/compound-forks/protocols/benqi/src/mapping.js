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
const OldComptroller_1 = require("../../../generated/templates/CToken/OldComptroller");
const JoePair_1 = require("../../../generated/templates/CToken/JoePair");
const templates_1 = require("../../../generated/templates");
const ERC20_1 = require("../../../generated/Comptroller/ERC20");
const constants_2 = require("./constants");
const PriceOracle_1 = require("../../../generated/templates/CToken/PriceOracle");
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
  (0, mapping_1._handleMarketEntered)(
    constants_2.comptrollerAddr,
    event.params.qiToken.toHexString(),
    event.params.account.toHexString(),
    true
  );
}
exports.handleMarketEntered = handleMarketEntered;
function handleMarketExited(event) {
  (0, mapping_1._handleMarketEntered)(
    constants_2.comptrollerAddr,
    event.params.qiToken.toHexString(),
    event.params.account.toHexString(),
    false
  );
}
exports.handleMarketExited = handleMarketExited;
function handleMarketListed(event) {
  templates_1.CToken.create(event.params.qiToken);
  const cTokenAddr = event.params.qiToken;
  const cToken = schema_1.Token.load(cTokenAddr.toHexString());
  if (cToken != null) {
    return;
  }
  // this is a new cToken, a new underlying token, and a new market
  const protocol = getOrCreateProtocol();
  const cTokenContract = CToken_1.CToken.bind(event.params.qiToken);
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
  const marketID = event.params.qiToken.toHexString();
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
  const marketID = event.params.qiToken.toHexString();
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
  const cTokenCollateral = event.params.qiTokenCollateral;
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
  (0, mapping_1._handleAccrueInterest)(
    updateMarketData,
    constants_2.comptrollerAddr,
    interestAccumulated,
    totalBorrows,
    false, // do not update all market prices
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
    "BENQI",
    "benqi",
    constants_1.Network.AVALANCHE,
    comptroller.try_liquidationIncentiveMantissa(),
    comptroller.try_oracle()
  );
  return (0, mapping_1._getOrCreateProtocol)(protocolData);
}
// rewardTokens = [QI-supply, AVAX-supply, QI-borrow, AVAX-borrow]
function initMarketRewards(marketID) {
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[initMarketRewards] market not found: {}", [
      marketID,
    ]);
    return;
  }
  let QiToken = schema_1.Token.load(constants_2.QiAddr.toHexString());
  if (!QiToken) {
    QiToken = new schema_1.Token(constants_2.QiAddr.toHexString());
    QiToken.name = "BENQI";
    QiToken.symbol = "QI";
    QiToken.decimals = 18;
    QiToken.save();
  }
  let AVAXToken = schema_1.Token.load(constants_2.AVAXAddr.toHexString());
  if (!AVAXToken) {
    AVAXToken = new schema_1.Token(constants_2.AVAXAddr.toHexString());
    AVAXToken.name = "AVAX";
    AVAXToken.symbol = "AVAX";
    AVAXToken.decimals = 18;
    AVAXToken.save();
  }
  let supplyRewardToken0 = schema_1.RewardToken.load(
    constants_1.InterestRateSide.LENDER.concat("-").concat(
      constants_2.QiAddr.toHexString()
    )
  );
  if (!supplyRewardToken0) {
    supplyRewardToken0 = new schema_1.RewardToken(
      constants_1.InterestRateSide.LENDER.concat("-").concat(
        constants_2.QiAddr.toHexString()
      )
    );
    supplyRewardToken0.token = QiToken.id;
    supplyRewardToken0.type = constants_1.RewardTokenType.DEPOSIT;
    supplyRewardToken0.save();
  }
  let supplyRewardToken1 = schema_1.RewardToken.load(
    constants_1.InterestRateSide.LENDER.concat("-").concat(
      constants_2.AVAXAddr.toHexString()
    )
  );
  if (!supplyRewardToken1) {
    supplyRewardToken1 = new schema_1.RewardToken(
      constants_1.InterestRateSide.LENDER.concat("-").concat(
        constants_2.AVAXAddr.toHexString()
      )
    );
    supplyRewardToken1.token = AVAXToken.id;
    supplyRewardToken1.type = constants_1.RewardTokenType.DEPOSIT;
    supplyRewardToken1.save();
  }
  let borrowRewardToken0 = schema_1.RewardToken.load(
    constants_1.InterestRateSide.BORROWER.concat("-").concat(
      constants_2.QiAddr.toHexString()
    )
  );
  if (!borrowRewardToken0) {
    borrowRewardToken0 = new schema_1.RewardToken(
      constants_1.InterestRateSide.BORROWER.concat("-").concat(
        constants_2.QiAddr.toHexString()
      )
    );
    borrowRewardToken0.token = QiToken.id;
    borrowRewardToken0.type = constants_1.RewardTokenType.BORROW;
    borrowRewardToken0.save();
  }
  let borrowRewardToken1 = schema_1.RewardToken.load(
    constants_1.InterestRateSide.BORROWER.concat("-").concat(
      constants_2.AVAXAddr.toHexString()
    )
  );
  if (!borrowRewardToken1) {
    borrowRewardToken1 = new schema_1.RewardToken(
      constants_1.InterestRateSide.BORROWER.concat("-").concat(
        constants_2.AVAXAddr.toHexString()
      )
    );
    borrowRewardToken1.token = AVAXToken.id;
    borrowRewardToken1.type = constants_1.RewardTokenType.BORROW;
    borrowRewardToken1.save();
  }
  market.rewardTokens = [
    supplyRewardToken0.id,
    supplyRewardToken1.id,
    borrowRewardToken0.id,
    borrowRewardToken1.id,
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
  const AVAXMarket = schema_1.Market.load(constants_2.qiAVAXAddr.toHexString());
  if (!AVAXMarket) {
    graph_ts_1.log.warning("[setMarketRewards] qiAVAX market not found: {}", [
      constants_2.qiAVAXAddr.toHexString(),
    ]);
    return;
  }
  let QiPriceUSD = constants_1.BIGDECIMAL_ZERO;
  const AVAXPriceUSD = AVAXMarket.inputTokenPriceUSD;
  if (blockNumber >= constants_2.TraderJoeQiWavaxPairStartBlock) {
    const oneQiInAVAX = getOneQiInAVAX();
    QiPriceUSD = AVAXPriceUSD.times(oneQiInAVAX);
  }
  let supplyQiEmission;
  let supplyAVAXEmission;
  let borrowQiEmission;
  let borrowAVAXEmission;
  // In Comptroller, 0 = Qi, 1 = AVAX
  if (blockNumber < 14000970) {
    // before 0xb8b3dc402f7e5BfB2883D9Ab1641CEC95D88702D gets deployed
    const oldComptroller = OldComptroller_1.OldComptroller.bind(
      constants_2.oldComptrollerAddr
    );
    supplyQiEmission = getRewardTokenEmission(
      oldComptroller.try_rewardSpeeds(0, marketAddress),
      18,
      QiPriceUSD
    );
    supplyAVAXEmission = getRewardTokenEmission(
      oldComptroller.try_rewardSpeeds(1, marketAddress),
      18,
      AVAXPriceUSD
    );
    borrowQiEmission = getRewardTokenEmission(
      oldComptroller.try_rewardSpeeds(0, marketAddress),
      18,
      QiPriceUSD
    );
    borrowAVAXEmission = getRewardTokenEmission(
      oldComptroller.try_rewardSpeeds(1, marketAddress),
      18,
      AVAXPriceUSD
    );
  } else {
    const comptroller = Comptroller_1.Comptroller.bind(
      constants_2.comptrollerAddr
    );
    supplyQiEmission = getRewardTokenEmission(
      comptroller.try_supplyRewardSpeeds(0, marketAddress),
      18,
      QiPriceUSD
    );
    supplyAVAXEmission = getRewardTokenEmission(
      comptroller.try_supplyRewardSpeeds(1, marketAddress),
      18,
      AVAXPriceUSD
    );
    borrowQiEmission = getRewardTokenEmission(
      comptroller.try_borrowRewardSpeeds(0, marketAddress),
      18,
      QiPriceUSD
    );
    borrowAVAXEmission = getRewardTokenEmission(
      comptroller.try_borrowRewardSpeeds(1, marketAddress),
      18,
      AVAXPriceUSD
    );
  }
  market.rewardTokenEmissionsAmount = [
    supplyQiEmission.amount,
    supplyAVAXEmission.amount,
    borrowQiEmission.amount,
    borrowAVAXEmission.amount,
  ];
  market.rewardTokenEmissionsUSD = [
    supplyQiEmission.USD,
    supplyAVAXEmission.USD,
    borrowQiEmission.USD,
    borrowAVAXEmission.USD,
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
// Fetch Qi vs AVAX price from Trader Joe
function getOneQiInAVAX() {
  const joePairContract = JoePair_1.JoePair.bind(
    constants_2.TraderJoeQiWavaxPairAddr
  );
  const getReservesResult = joePairContract.try_getReserves();
  if (getReservesResult.reverted) {
    graph_ts_1.log.warning("[getOneQiInAVAX] result reverted", []);
    return constants_1.BIGDECIMAL_ZERO;
  }
  const QiReserve = getReservesResult.value.value0;
  const WAVAXReserve = getReservesResult.value.value1;
  return WAVAXReserve.toBigDecimal().div(QiReserve.toBigDecimal());
}
