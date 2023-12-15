"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortArrayByReference =
  exports.handleRewardSupplySpeedUpdated =
  exports.handleRewardBorrowSpeedUpdated =
  exports.handleRewardAddressChanged =
  exports.handleRewardAdded =
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
  exports.handleNewRewardDistributor =
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
function handleNewRewardDistributor(event) {
  graph_ts_1.log.info(
    "[handleNewRewardDistributor]New RewardDistributor {} for market {} at tx {}",
    [
      event.params.newRewardDistributor.toHexString(),
      event.address.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
  templates_1.RewardDistributor.create(event.params.newRewardDistributor);
}
exports.handleNewRewardDistributor = handleNewRewardDistributor;
function handleNewPriceOracle(event) {
  let realm = schema_1._Realm.load(event.address.toHexString());
  if (!realm) {
    realm = new schema_1._Realm(event.address.toHexString());
  }
  realm.priceOracle = event.params.newPriceOracle.toHexString();
  realm.save();
}
exports.handleNewPriceOracle = handleNewPriceOracle;
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
  if (event.params.cToken.equals(constants_2.cBSTNContract)) {
    graph_ts_1.log.info("[handleMarketListed]cBSTN token {} is skipped", [
      event.params.cToken.toHexString(),
    ]);
    return;
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
    constants_1.BIGINT_ZERO
  );
  let marketNamePrefix = "";
  if (event.address.equals(constants_2.AURORA_REALM_ADDRESS)) {
    marketNamePrefix = "Aurora Realm: ";
  } else if (event.address.equals(constants_2.STNEAR_REALM_ADDRESS)) {
    marketNamePrefix = "STNear Realm: ";
  } else if (event.address.equals(constants_2.MULTICHAIN_REALM_ADDRESS)) {
    marketNamePrefix = "Multichain Realm: ";
  }
  if (cTokenAddr == constants_2.nativeCToken.address) {
    const marketListedData = new mapping_1.MarketListedData(
      protocol,
      constants_2.nativeToken,
      constants_2.nativeCToken,
      cTokenReserveFactorMantissa
    );
    (0, mapping_1._handleMarketListed)(marketListedData, event);
    const market = schema_1.Market.load(cTokenAddr.toHexString());
    if (!market) {
      graph_ts_1.log.critical(
        "[handleMarketListed]market entity {} not added for tx {}-{}",
        [
          cTokenAddr.toHexString(),
          event.transaction.hash.toHexString(),
          event.transactionLogIndex.toString(),
        ]
      );
      return;
    }
    market.name = `${marketNamePrefix}${market.name}`;
    market._realm = event.address.toHexString();
    market.save();
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
  const market = schema_1.Market.load(cTokenAddr.toHexString());
  if (!market) {
    graph_ts_1.log.critical(
      "[handleMarketListed]market entity {} not added for tx {}-{}",
      [
        cTokenAddr.toHexString(),
        event.transaction.hash.toHexString(),
        event.transactionLogIndex.toString(),
      ]
    );
    return;
  }
  market.name = `${marketNamePrefix}${market.name}`;
  market._realm = event.address.toHexString();
  market.save();
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
  // it seems bastion protocol flips the pauseState, so we invert it here
  // https://github.com/messari/subgraphs/issues/1415#issuecomment-1475407997
  // https://github.com/messari/subgraphs/pull/1805#pullrequestreview-1349739373
  (0, mapping_1._handleActionPaused)(marketID, action, !pauseState);
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
  const market = schema_1.Market.load(marketAddress.toHexString());
  if (!market || !market._realm) {
    graph_ts_1.log.error(
      "[handleAccrueInterest]market {} doesn't exist or market.realm{} tx {}-{}",
      [
        marketAddress.toHexString(),
        market && !market._realm ? "=null" : "",
        event.transaction.hash.toHexString(),
        event.transactionLogIndex.toHexString(),
      ]
    );
    return;
  }
  updateRewardTokenPrices(market);
  const realm = schema_1._Realm.load(market._realm);
  if (!realm) {
    graph_ts_1.log.error(
      "[handleAccrueInterest]realm {} doesn't exist tx {}-{}",
      [
        market._realm,
        event.transaction.hash.toHexString(),
        event.transactionLogIndex.toString(),
      ]
    );
    return;
  }
  // replace price oracle for Near and stNear token in the stNear realm
  // as the stNear realm oracle returns prices relative to the Near price
  let priceOracle = graph_ts_1.Address.fromString(realm.priceOracle);
  let marketAddressForOracle = marketAddress;
  if (
    graph_ts_1.Address.fromString(market.inputToken).equals(
      constants_2.NEAR_TOKEN_ADDRESS
    )
  ) {
    priceOracle = constants_2.nearOracle;
    marketAddressForOracle = constants_2.cNearContract;
  } else if (
    graph_ts_1.Address.fromString(market.inputToken).equals(
      constants_2.STNEAR_TOKEN_ADDRESS
    )
  ) {
    priceOracle = constants_2.stNearOracle;
    marketAddressForOracle = constants_2.cStNearContract;
  }
  const oracleContract = PriceOracle_1.PriceOracle.bind(priceOracle);
  const cTokenContract = CToken_1.CToken.bind(marketAddress);
  const updateMarketData = new mapping_1.UpdateMarketData(
    cTokenContract.try_totalSupply(),
    cTokenContract.try_exchangeRateStored(),
    cTokenContract.try_supplyRatePerBlock(),
    cTokenContract.try_borrowRatePerBlock(),
    oracleContract.try_getUnderlyingPrice(marketAddressForOracle),
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
    "Bastion Protocol",
    "bastion-protocol",
    constants_1.Network.AURORA,
    comptroller.try_liquidationIncentiveMantissa(),
    comptroller.try_oracle()
  );
  return (0, mapping_1._getOrCreateProtocol)(protocolData);
}
function handleRewardAdded(event) {
  const rewardTypeId = event.params.rewardType.toString();
  let rewardToken = schema_1._RewardType.load(rewardTypeId);
  if (!rewardToken) {
    rewardToken = new schema_1._RewardType(rewardTypeId);
  }
  rewardToken.token = event.params.newRewardAddress.toHexString();
  rewardToken.save();
  getOrCreateToken(event.params.newRewardAddress);
}
exports.handleRewardAdded = handleRewardAdded;
function handleRewardAddressChanged(event) {
  const rewardTypeId = event.params.rewardType.toString();
  let rewardToken = schema_1._RewardType.load(rewardTypeId);
  if (!rewardToken) {
    rewardToken = new schema_1._RewardType(rewardTypeId);
  }
  rewardToken.token = event.params.newRewardAddress.toHexString();
  rewardToken.save();
  getOrCreateToken(event.params.newRewardAddress);
}
exports.handleRewardAddressChanged = handleRewardAddressChanged;
function handleRewardBorrowSpeedUpdated(event) {
  updateRewardSpeed(
    event.params.rewardType.toString(),
    event.params.cToken,
    event.params.newSpeed,
    constants_1.RewardTokenType.BORROW,
    event
  );
}
exports.handleRewardBorrowSpeedUpdated = handleRewardBorrowSpeedUpdated;
function handleRewardSupplySpeedUpdated(event) {
  updateRewardSpeed(
    event.params.rewardType.toString(),
    event.params.cToken,
    event.params.newSpeed,
    constants_1.RewardTokenType.DEPOSIT,
    event
  );
}
exports.handleRewardSupplySpeedUpdated = handleRewardSupplySpeedUpdated;
function updateRewardSpeed(
  rewardTypeId,
  cToken,
  newSpeed,
  rewardTokenType,
  event
) {
  const rewardType = schema_1._RewardType.load(rewardTypeId);
  if (!rewardType) {
    graph_ts_1.log.error(
      "[updateRewardSpeed]RewardType {} doesn't exist in _RewardType tx {}",
      [rewardTypeId, event.transaction.hash.toHexString()]
    );
    return;
  }
  const market = schema_1.Market.load(cToken.toHexString());
  if (!market) {
    graph_ts_1.log.error("[updateRewardSpeed]market {} doesn't exist", [
      cToken.toHexString(),
    ]);
    return;
  }
  const rewardTokenAddress = graph_ts_1.Address.fromString(rewardType.token);
  const token = getOrCreateToken(rewardTokenAddress);
  const dailyEmission = newSpeed.times(
    graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_DAY)
  );
  const priceUSD = getRewardTokenPrice(token);
  const dailyEmissionUSD = dailyEmission
    .toBigDecimal()
    .div((0, constants_1.exponentToBigDecimal)(token.decimals))
    .times(priceUSD);
  const rewardToken = getOrCreateRewardToken(token, rewardTokenType);
  const rewardTokens = market.rewardTokens ? market.rewardTokens : [];
  let rewardEmissions = market.rewardTokenEmissionsAmount
    ? market.rewardTokenEmissionsAmount
    : [];
  let rewardEmissionsUSD = market.rewardTokenEmissionsUSD
    ? market.rewardTokenEmissionsUSD
    : [];
  const rewardTokenIndex = rewardTokens.indexOf(rewardToken.id);
  if (rewardTokenIndex == -1) {
    // this is a new reward token
    rewardTokens.push(rewardToken.id);
    rewardEmissions.push(dailyEmission);
    rewardEmissionsUSD.push(dailyEmissionUSD);
    if (rewardTokens.length > 1) {
      // rewardTokenEmissionsAmount, rewardTokenEmissionsUSD needs to be sorted
      const rewardTokensUnsorted = rewardTokens;
      rewardTokens.sort();
      rewardEmissions = sortArrayByReference(
        rewardTokens,
        rewardTokensUnsorted,
        rewardEmissions
      );
      rewardEmissionsUSD = sortArrayByReference(
        rewardTokens,
        rewardTokensUnsorted,
        rewardEmissionsUSD
      );
    }
  } else {
    // existing reward token, update rewardEmissions and rewardEmissionsUSD at rewardTokenIndex
    rewardEmissions[rewardTokenIndex] = dailyEmission;
    rewardEmissionsUSD[rewardTokenIndex] = dailyEmissionUSD;
  }
  market.rewardTokens = rewardTokens;
  market.rewardTokenEmissionsAmount = rewardEmissions;
  market.rewardTokenEmissionsUSD = rewardEmissionsUSD;
  market.save();
  graph_ts_1.log.info(
    "[updateRewardSpeed]market {}/{} reward emission updated: rewardTokens [{}], emissions=[{}], emissionsUSD=[{}] at tx {}-{}",
    [
      market.id,
      market.name ? market.name : "",
      market.rewardTokens.toString(),
      market.rewardTokenEmissionsAmount.toString(),
      market.rewardTokenEmissionsUSD.toString(),
      event.transaction.hash.toHexString(),
      event.transactionLogIndex.toString(),
    ]
  );
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
function updateRewardTokenPrices(market) {
  if (!market.rewardTokens || market.rewardTokens.length == 0) {
    return;
  }
  const rewardEmissions = market.rewardTokenEmissionsAmount;
  if (!rewardEmissions || rewardEmissions.length == 0) {
    return;
  }
  const rewardEmissionsUSD = [];
  for (let i = 0; i < market.rewardTokens.length; i++) {
    const rewardTokenId = market.rewardTokens[i];
    const rewardToken = schema_1.RewardToken.load(rewardTokenId);
    if (!rewardToken) {
      graph_ts_1.log.error("[]reward token {} for market {} doesn't exist", [
        rewardTokenId,
        market.id,
      ]);
      return;
    }
    const token = getOrCreateToken(
      graph_ts_1.Address.fromString(rewardToken.token)
    );
    const priceUSD = getRewardTokenPrice(token);
    rewardEmissionsUSD.push(
      rewardEmissions[i]
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(token.decimals))
        .times(priceUSD)
    );
  }
  market.rewardTokenEmissionsUSD = rewardEmissionsUSD;
  market.save();
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
function getOrCreateRewardToken(token, type) {
  const rewardTokenId = type + "-" + token.id;
  let rewardToken = schema_1.RewardToken.load(rewardTokenId);
  if (!rewardToken) {
    rewardToken = new schema_1.RewardToken(rewardTokenId);
    rewardToken.token = token.id;
    rewardToken.type = type;
    rewardToken.save();
  }
  return rewardToken;
}
function getRewardTokenPrice(token) {
  if (
    graph_ts_1.Address.fromString(token.id).equals(
      constants_2.BSTN_TOKEN_ADDRESS
    )
  ) {
    const oracleContract = PriceOracle_1.PriceOracle.bind(
      constants_2.bstnOracle
    );
    const price = (0, mapping_1.getOrElse)(
      oracleContract.try_getUnderlyingPrice(constants_2.cBSTNContract),
      constants_1.BIGINT_ZERO
    );
    const priceUSD = price
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(constants_1.mantissaFactor));
    graph_ts_1.log.info("[getRewardTokenPrice]1 token {}/{} price={}", [
      token.id,
      token.symbol,
      priceUSD.toString(),
    ]);
    return priceUSD;
  }
  if (
    graph_ts_1.Address.fromString(token.id).equals(
      constants_2.NEAR_TOKEN_ADDRESS
    )
  ) {
    const oracleContract = PriceOracle_1.PriceOracle.bind(
      constants_2.nearOracle
    );
    const price = (0, mapping_1.getOrElse)(
      oracleContract.try_getUnderlyingPrice(constants_2.cNearContract),
      constants_1.BIGINT_ZERO
    );
    const priceUSD = price
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(constants_1.mantissaFactor));
    graph_ts_1.log.info("[getRewardTokenPrice]2 token {}/{} price={}", [
      token.id,
      token.symbol,
      priceUSD.toString(),
    ]);
    return priceUSD;
  }
  const priceUSD = token.lastPriceUSD
    ? token.lastPriceUSD
    : constants_1.BIGDECIMAL_ZERO;
  graph_ts_1.log.info("[getRewardTokenPrice]3 token {}/{} price={}", [
    token.id,
    token.symbol,
    priceUSD.toString(),
  ]);
  return priceUSD;
}
// A function which given 3 arrays of arbitrary types of the same length,
// where the first one holds the reference order, the second one holds the same elements
// as the first but in different order, and the third any arbitrary elements. It will return
// the third array after sorting it according to the order of the first one.
// For example:
// sortArrayByReference(['a', 'c', 'b'], ['a', 'b', 'c'], [1, 2, 3]) => [1, 3, 2]
function sortArrayByReference(reference, array, toSort) {
  const sorted = new Array();
  for (let i = 0; i < reference.length; i++) {
    const index = array.indexOf(reference[i]);
    sorted.push(toSort[index]);
  }
  return sorted;
}
exports.sortArrayByReference = sortArrayByReference;
