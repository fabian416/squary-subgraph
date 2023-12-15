"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._handleSwapBorrowRateMode =
  exports._handleAssetConfigUpdated =
  exports._handleTransfer =
  exports._handleMintedToTreasury =
  exports._handleFlashLoan =
  exports._handleLiquidate =
  exports._handleRepay =
  exports._handleBorrow =
  exports._handleWithdraw =
  exports._handleDeposit =
  exports._handleReserveDataUpdated =
  exports._handleUnpaused =
  exports._handlePaused =
  exports._handleFlashloanPremiumToProtocolUpdated =
  exports._handleFlashloanPremiumTotalUpdated =
  exports._handleReserveUsedAsCollateralDisabled =
  exports._handleReserveUsedAsCollateralEnabled =
  exports._handleLiquidationProtocolFeeChanged =
  exports._handleReserveFactorChanged =
  exports._handleReserveDeactivated =
  exports._handleReserveActivated =
  exports._handleBorrowingDisabledOnReserve =
  exports._handleBorrowingEnabledOnReserve =
  exports._handleCollateralConfigurationChanged =
  exports._handleReserveInitialized =
  exports._handlePriceOracleUpdated =
    void 0;
// generic aave-v2 handlers
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../generated/schema");
const AToken_1 = require("../generated/LendingPool/AToken");
const StableDebtToken_1 = require("../generated/LendingPool/StableDebtToken");
const VariableDebtToken_1 = require("../generated/LendingPool/VariableDebtToken");
const constants_1 = require("./constants");
const constants_2 = require("./sdk/constants");
const helpers_1 = require("./helpers");
const templates_1 = require("../generated/templates");
const ERC20_1 = require("../generated/LendingPool/ERC20");
const manager_1 = require("./sdk/manager");
const constants_3 = require("./sdk/constants");
const token_1 = require("./sdk/token");
const account_1 = require("./sdk/account");
const position_1 = require("./sdk/position");
//////////////////////////////////
///// Configuration Handlers /////
//////////////////////////////////
function _handlePriceOracleUpdated(newPriceOracle, protocolData, event) {
  graph_ts_1.log.info("[_handlePriceOracleUpdated] New oracleAddress: {}", [
    newPriceOracle.toHexString(),
  ]);
  // since all aave markets share the same oracle
  // we will use _DefaultOracle entity for markets whose oracle is not set
  let defaultOracle = schema_1._DefaultOracle.load(protocolData.protocolID);
  if (!defaultOracle) {
    defaultOracle = new schema_1._DefaultOracle(protocolData.protocolID);
  }
  defaultOracle.oracle = newPriceOracle;
  defaultOracle.save();
  const marketList = schema_1._MarketList.load(protocolData.protocolID);
  if (!marketList) {
    graph_ts_1.log.warning(
      "[_handlePriceOracleUpdated]marketList for {} does not exist",
      [protocolData.protocolID.toHexString()]
    );
    return;
  }
  const markets = marketList.markets;
  for (let i = 0; i < markets.length; i++) {
    const _market = schema_1.Market.load(markets[i]);
    if (!_market) {
      graph_ts_1.log.warning(
        "[_handlePriceOracleUpdated] Market not found: {}",
        [markets[i].toHexString()]
      );
      continue;
    }
    const manager = new manager_1.DataManager(
      markets[i],
      _market.inputToken,
      event,
      protocolData
    );
    _market.oracle = manager.getOrCreateOracle(
      newPriceOracle,
      true,
      constants_2.OracleSource.CHAINLINK
    ).id;
    _market.save();
  }
}
exports._handlePriceOracleUpdated = _handlePriceOracleUpdated;
function _handleReserveInitialized(
  event,
  underlyingToken,
  outputToken,
  variableDebtToken,
  protocolData,
  stableDebtToken = graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)
) {
  // create VToken template
  templates_1.VariableDebtToken.create(variableDebtToken);
  // create AToken template to watch Transfer
  templates_1.AToken.create(outputToken);
  const manager = new manager_1.DataManager(
    outputToken,
    underlyingToken,
    event,
    protocolData
  );
  const market = manager.getMarket();
  const outputTokenManager = new token_1.TokenManager(outputToken, event);
  const vDebtTokenManager = new token_1.TokenManager(
    variableDebtToken,
    event,
    constants_3.TokenType.REBASING
  );
  market.outputToken = outputTokenManager.getToken().id;
  market.name = outputTokenManager._getName();
  market._vToken = vDebtTokenManager.getToken().id;
  // map tokens to market
  const inputToken = manager.getInputToken();
  inputToken._market = market.id;
  inputToken._iavsTokenType = constants_1.IavsTokenType.INPUTTOKEN;
  inputToken.save();
  const aToken = outputTokenManager.getToken();
  aToken._market = market.id;
  aToken._iavsTokenType = constants_1.IavsTokenType.ATOKEN;
  aToken.save();
  const vToken = vDebtTokenManager.getToken();
  vToken._market = market.id;
  vToken._iavsTokenType = constants_1.IavsTokenType.VTOKEN;
  vToken.save();
  if (stableDebtToken != graph_ts_1.Address.zero()) {
    const sDebtTokenManager = new token_1.TokenManager(stableDebtToken, event);
    const sToken = sDebtTokenManager.getToken();
    sToken._market = market.id;
    sToken._iavsTokenType = constants_1.IavsTokenType.STOKEN;
    sToken.save();
    market._sToken = sToken.id;
    templates_1.StableDebtToken.create(stableDebtToken);
  }
  const defaultOracle = schema_1._DefaultOracle.load(protocolData.protocolID);
  if (!market.oracle && defaultOracle) {
    market.oracle = manager.getOrCreateOracle(
      graph_ts_1.Address.fromBytes(defaultOracle.oracle),
      true,
      constants_2.OracleSource.CHAINLINK
    ).id;
  }
  market.save();
}
exports._handleReserveInitialized = _handleReserveInitialized;
function _handleCollateralConfigurationChanged(
  asset,
  liquidationPenalty,
  liquidationThreshold,
  maximumLTV,
  protocolData
) {
  const market = (0, helpers_1.getMarketFromToken)(asset, protocolData);
  if (!market) {
    graph_ts_1.log.warning(
      "[_handleCollateralConfigurationChanged] Market for asset {} not found",
      [asset.toHexString()]
    );
    return;
  }
  market.maximumLTV = maximumLTV
    .toBigDecimal()
    .div(constants_1.BIGDECIMAL_HUNDRED);
  market.liquidationThreshold = liquidationThreshold
    .toBigDecimal()
    .div(constants_1.BIGDECIMAL_HUNDRED);
  // The liquidation bonus value is equal to the liquidation penalty, the naming is a matter of which side of the liquidation a user is on
  // The liquidationBonus parameter comes out as above 100%, represented by a 5 digit integer over 10000 (100%).
  // To extract the expected value in the liquidationPenalty field: convert to BigDecimal, subtract by 10000 and divide by 100
  const bdLiquidationPenalty = liquidationPenalty.toBigDecimal();
  if (
    bdLiquidationPenalty.gt(
      (0, helpers_1.exponentToBigDecimal)(constants_1.INT_FOUR)
    )
  ) {
    market.liquidationPenalty = bdLiquidationPenalty
      .minus((0, helpers_1.exponentToBigDecimal)(constants_1.INT_FOUR))
      .div(constants_1.BIGDECIMAL_HUNDRED);
  }
  market.save();
}
exports._handleCollateralConfigurationChanged =
  _handleCollateralConfigurationChanged;
function _handleBorrowingEnabledOnReserve(asset, procotolData) {
  const market = (0, helpers_1.getMarketFromToken)(asset, procotolData);
  if (!market) {
    graph_ts_1.log.warning(
      "[_handleBorrowingEnabledOnReserve] Market not found {}",
      [asset.toHexString()]
    );
    return;
  }
  market.canBorrowFrom = true;
  market.save();
  (0, helpers_1.storePrePauseState)(market);
}
exports._handleBorrowingEnabledOnReserve = _handleBorrowingEnabledOnReserve;
function _handleBorrowingDisabledOnReserve(asset, procotolData) {
  const market = (0, helpers_1.getMarketFromToken)(asset, procotolData);
  if (!market) {
    graph_ts_1.log.warning(
      "[_handleBorrowingDisabledOnReserve] Market for token {} not found",
      [asset.toHexString()]
    );
    return;
  }
  market.canBorrowFrom = false;
  market.save();
  (0, helpers_1.storePrePauseState)(market);
}
exports._handleBorrowingDisabledOnReserve = _handleBorrowingDisabledOnReserve;
function _handleReserveActivated(asset, protocolData) {
  const market = (0, helpers_1.getMarketFromToken)(asset, protocolData);
  if (!market) {
    graph_ts_1.log.warning(
      "[_handleReserveActivated] Market for token {} not found",
      [asset.toHexString()]
    );
    return;
  }
  market.isActive = true;
  market.save();
  (0, helpers_1.storePrePauseState)(market);
}
exports._handleReserveActivated = _handleReserveActivated;
function _handleReserveDeactivated(asset, procotolData) {
  const market = (0, helpers_1.getMarketFromToken)(asset, procotolData);
  if (!market) {
    graph_ts_1.log.warning(
      "[_handleReserveDeactivated] Market for token {} not found",
      [asset.toHexString()]
    );
    return;
  }
  market.isActive = false;
  market.save();
  (0, helpers_1.storePrePauseState)(market);
}
exports._handleReserveDeactivated = _handleReserveDeactivated;
function _handleReserveFactorChanged(asset, reserveFactor, procotolData) {
  const market = (0, helpers_1.getMarketFromToken)(asset, procotolData);
  if (!market) {
    graph_ts_1.log.warning(
      "[_handleReserveFactorChanged] Market for token {} not found",
      [asset.toHexString()]
    );
    return;
  }
  market.reserveFactor = reserveFactor
    .toBigDecimal()
    .div((0, helpers_1.exponentToBigDecimal)(constants_1.INT_FOUR));
  market.save();
}
exports._handleReserveFactorChanged = _handleReserveFactorChanged;
function _handleLiquidationProtocolFeeChanged(
  asset,
  liquidationProtocolFee,
  procotolData
) {
  const market = (0, helpers_1.getMarketFromToken)(asset, procotolData);
  if (!market) {
    graph_ts_1.log.warning(
      "[_handleLiquidationProtocolFeeChanged] Market for token {} not found",
      [asset.toHexString()]
    );
    return;
  }
  market._liquidationProtocolFee = liquidationProtocolFee
    .toBigDecimal()
    .div((0, helpers_1.exponentToBigDecimal)(constants_1.INT_FOUR));
  market.save();
}
exports._handleLiquidationProtocolFeeChanged =
  _handleLiquidationProtocolFeeChanged;
function _handleReserveUsedAsCollateralEnabled(asset, accountID, procotolData) {
  const market = (0, helpers_1.getMarketFromToken)(asset, procotolData);
  if (!market) {
    graph_ts_1.log.warning(
      "[_handleReserveUsedAsCollateralEnabled] Market for token {} not found",
      [asset.toHexString()]
    );
    return;
  }
  const accountManager = new account_1.AccountManager(accountID);
  const account = accountManager.getAccount();
  const markets = account._enabledCollaterals
    ? account._enabledCollaterals
    : [];
  markets.push(market.id);
  account._enabledCollaterals = markets;
  account.save();
}
exports._handleReserveUsedAsCollateralEnabled =
  _handleReserveUsedAsCollateralEnabled;
function _handleReserveUsedAsCollateralDisabled(
  asset,
  accountID,
  procotolData
) {
  const market = (0, helpers_1.getMarketFromToken)(asset, procotolData);
  if (!market) {
    graph_ts_1.log.warning(
      "[_handleReserveUsedAsCollateralEnabled] Market for token {} not found",
      [asset.toHexString()]
    );
    return;
  }
  const accountManager = new account_1.AccountManager(accountID);
  const account = accountManager.getAccount();
  const markets = account._enabledCollaterals
    ? account._enabledCollaterals
    : [];
  const index = markets.indexOf(market.id);
  if (index >= 0) {
    // drop 1 element at given index
    markets.splice(index, 1);
  }
  account._enabledCollaterals = markets;
  account.save();
}
exports._handleReserveUsedAsCollateralDisabled =
  _handleReserveUsedAsCollateralDisabled;
function _handleFlashloanPremiumTotalUpdated(rate, procotolData) {
  const flashloanPremium = (0, helpers_1.getOrCreateFlashloanPremium)(
    procotolData
  );
  flashloanPremium.premiumRateTotal = rate;
  flashloanPremium.save();
}
exports._handleFlashloanPremiumTotalUpdated =
  _handleFlashloanPremiumTotalUpdated;
function _handleFlashloanPremiumToProtocolUpdated(rate, procotolData) {
  const flashloanPremium = (0, helpers_1.getOrCreateFlashloanPremium)(
    procotolData
  );
  flashloanPremium.premiumRateToProtocol = rate;
  flashloanPremium.save();
}
exports._handleFlashloanPremiumToProtocolUpdated =
  _handleFlashloanPremiumToProtocolUpdated;
function _handlePaused(protocolData) {
  const marketList = schema_1._MarketList.load(protocolData.protocolID);
  if (!marketList) {
    graph_ts_1.log.warning("[_handlePaused]marketList for {} does not exist", [
      protocolData.protocolID.toHexString(),
    ]);
    return;
  }
  const markets = marketList.markets;
  for (let i = 0; i < markets.length; i++) {
    const market = schema_1.Market.load(markets[i]);
    if (!market) {
      graph_ts_1.log.warning("[Paused] Market not found: {}", [
        markets[i].toHexString(),
      ]);
      continue;
    }
    (0, helpers_1.storePrePauseState)(market);
    market.isActive = false;
    market.canUseAsCollateral = false;
    market.canBorrowFrom = false;
    market.save();
  }
}
exports._handlePaused = _handlePaused;
function _handleUnpaused(protocolData) {
  const marketList = schema_1._MarketList.load(protocolData.protocolID);
  if (!marketList) {
    graph_ts_1.log.warning(
      "[_handleUnpaused]marketList for {} does not exist",
      [protocolData.protocolID.toHexString()]
    );
    return;
  }
  const markets = marketList.markets;
  for (let i = 0; i < markets.length; i++) {
    const market = schema_1.Market.load(markets[i]);
    if (!market) {
      graph_ts_1.log.warning("[_handleUnpaused] Market not found: {}", [
        markets[i].toHexString(),
      ]);
      continue;
    }
    (0, helpers_1.restorePrePauseState)(market);
  }
}
exports._handleUnpaused = _handleUnpaused;
////////////////////////////////
///// Transaction Handlers /////
////////////////////////////////
function _handleReserveDataUpdated(
  event,
  liquidityRate, // deposit rate in ray
  liquidityIndex,
  variableBorrowIndex,
  variableBorrowRate,
  stableBorrowRate,
  protocolData,
  asset,
  assetPriceUSD = constants_1.BIGDECIMAL_ZERO,
  updateRewards = false
) {
  let market = (0, helpers_1.getMarketFromToken)(asset, protocolData);
  if (!market) {
    graph_ts_1.log.warning(
      "[_handlReserveDataUpdated] Market for asset {} not found",
      [asset.toHexString()]
    );
    return;
  }
  const manager = new manager_1.DataManager(
    market.id,
    market.inputToken,
    event,
    protocolData
  );
  market = manager.getMarket();
  const inputToken = manager.getInputToken();
  // get current borrow balance
  let trySBorrowBalance = null;
  if (market._sToken) {
    const stableDebtContract = StableDebtToken_1.StableDebtToken.bind(
      graph_ts_1.Address.fromBytes(market._sToken)
    );
    trySBorrowBalance = stableDebtContract.try_totalSupply();
  }
  const variableDebtContract = VariableDebtToken_1.VariableDebtToken.bind(
    graph_ts_1.Address.fromBytes(market._vToken)
  );
  const tryVBorrowBalance = variableDebtContract.try_totalSupply();
  let sBorrowBalance = constants_1.BIGINT_ZERO;
  let vBorrowBalance = constants_1.BIGINT_ZERO;
  if (trySBorrowBalance != null && !trySBorrowBalance.reverted) {
    sBorrowBalance = trySBorrowBalance.value;
  }
  if (!tryVBorrowBalance.reverted) {
    vBorrowBalance = tryVBorrowBalance.value;
  }
  // broken if both revert
  if (
    trySBorrowBalance != null &&
    trySBorrowBalance.reverted &&
    tryVBorrowBalance.reverted
  ) {
    graph_ts_1.log.warning("[ReserveDataUpdated] No borrow balance found", []);
    return;
  }
  // update total supply balance
  const aTokenContract = AToken_1.AToken.bind(
    graph_ts_1.Address.fromBytes(market.outputToken)
  );
  const tryTotalSupply = aTokenContract.try_totalSupply();
  if (tryTotalSupply.reverted) {
    graph_ts_1.log.warning(
      "[ReserveDataUpdated] Error getting total supply on market: {}",
      [market.id.toHexString()]
    );
    return;
  }
  if (assetPriceUSD.equals(constants_1.BIGDECIMAL_ZERO)) {
    assetPriceUSD = market.inputTokenPriceUSD;
  }
  manager.updateMarketAndProtocolData(
    assetPriceUSD,
    tryTotalSupply.value,
    vBorrowBalance,
    sBorrowBalance,
    null,
    null,
    tryTotalSupply.value
  );
  const tryScaledSupply = aTokenContract.try_scaledTotalSupply();
  if (tryScaledSupply.reverted) {
    graph_ts_1.log.warning(
      "[ReserveDataUpdated] Error getting scaled total supply on market: {}",
      [asset.toHexString()]
    );
    return;
  }
  // calculate new revenue
  // New Interest = totalScaledSupply * (difference in liquidity index)
  let currSupplyIndex = market.supplyIndex;
  if (!currSupplyIndex) {
    manager.updateSupplyIndex(constants_1.BIGINT_ONE_RAY);
    currSupplyIndex = constants_1.BIGINT_ONE_RAY;
  }
  const liquidityIndexDiff = liquidityIndex
    .minus(currSupplyIndex)
    .toBigDecimal()
    .div((0, helpers_1.exponentToBigDecimal)(constants_1.RAY_OFFSET));
  manager.updateSupplyIndex(liquidityIndex); // must update to current liquidity index
  manager.updateBorrowIndex(variableBorrowIndex);
  const newRevenueBD = tryScaledSupply.value
    .toBigDecimal()
    .div((0, helpers_1.exponentToBigDecimal)(inputToken.decimals))
    .times(liquidityIndexDiff);
  let totalRevenueDeltaUSD = newRevenueBD.times(assetPriceUSD);
  const receipt = event.receipt;
  let FlashLoanPremiumToLPUSD = constants_1.BIGDECIMAL_ZERO;
  if (!receipt) {
    graph_ts_1.log.warning(
      "[_handleReserveDataUpdated]No receipt for tx {}; cannot subtract Flashloan revenue",
      [event.transaction.hash.toHexString()]
    );
  } else {
    const flashLoanPremiumAmount = (0, helpers_1.getFlashloanPremiumAmount)(
      event,
      asset
    );
    const flashLoanPremiumUSD = flashLoanPremiumAmount
      .toBigDecimal()
      .div((0, helpers_1.exponentToBigDecimal)(inputToken.decimals))
      .times(assetPriceUSD);
    const flashloanPremium = (0, helpers_1.getOrCreateFlashloanPremium)(
      protocolData
    );
    FlashLoanPremiumToLPUSD = (0, helpers_1.calcuateFlashLoanPremiumToLPUSD)(
      flashLoanPremiumUSD,
      flashloanPremium.premiumRateToProtocol
    );
  }
  // deduct flashloan premium that may have already been accounted for in
  // _handleFlashloan()
  totalRevenueDeltaUSD = totalRevenueDeltaUSD.minus(FlashLoanPremiumToLPUSD);
  if (
    totalRevenueDeltaUSD.lt(constants_1.BIGDECIMAL_ZERO) &&
    totalRevenueDeltaUSD.gt(constants_1.BIGDECIMAL_NEG_ONE_CENT)
  ) {
    // totalRevenueDeltaUSD may become a tiny negative number after
    // subtracting flashloan premium due to rounding
    // see https://github.com/messari/subgraphs/pull/1993#issuecomment-1608414803
    // for more details
    totalRevenueDeltaUSD = constants_1.BIGDECIMAL_ZERO;
  }
  let reserveFactor = market.reserveFactor;
  if (!reserveFactor) {
    graph_ts_1.log.warning(
      "[_handleReserveDataUpdated]reserveFactor = null for market {}, default to 0.0",
      [asset.toHexString()]
    );
    reserveFactor = constants_1.BIGDECIMAL_ZERO;
  }
  const protocolSideRevenueDeltaUSD = totalRevenueDeltaUSD.times(reserveFactor);
  const supplySideRevenueDeltaUSD = totalRevenueDeltaUSD.minus(
    protocolSideRevenueDeltaUSD
  );
  const fee = manager.getOrUpdateFee(
    constants_3.FeeType.PROTOCOL_FEE,
    null,
    market.reserveFactor
  );
  manager.addProtocolRevenue(protocolSideRevenueDeltaUSD, fee);
  manager.addSupplyRevenue(supplySideRevenueDeltaUSD, fee);
  manager.getOrUpdateRate(
    constants_2.InterestRateSide.BORROWER,
    constants_2.InterestRateType.VARIABLE,
    (0, helpers_1.rayToWad)(variableBorrowRate)
      .toBigDecimal()
      .div(
        (0, helpers_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS - 2)
      )
  );
  if (market._sToken) {
    // geist does not have stable borrow rates
    manager.getOrUpdateRate(
      constants_2.InterestRateSide.BORROWER,
      constants_2.InterestRateType.STABLE,
      (0, helpers_1.rayToWad)(stableBorrowRate)
        .toBigDecimal()
        .div(
          (0, helpers_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS - 2)
        )
    );
  }
  manager.getOrUpdateRate(
    constants_2.InterestRateSide.LENDER,
    constants_2.InterestRateType.VARIABLE,
    (0, helpers_1.rayToWad)(liquidityRate)
      .toBigDecimal()
      .div(
        (0, helpers_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS - 2)
      )
  );
  // if updateRewards is true:
  // - check if reward distribution ends,
  // - refresh rewardEmissionAmountUSD with current token price
  // this is here because _handleReserveDataUpdated is called most frequently
  // if data freshness is a priority (at the cost of indexing speed)
  // we can iterate through all markets in _MarketList and get latest
  // token price from oracle (to be implemented)
  if (updateRewards && market.rewardTokens) {
    for (let i = 0; i < market.rewardTokens.length; i++) {
      const rewardToken = schema_1.RewardToken.load(market.rewardTokens[i]);
      if (!rewardToken) {
        continue;
      }
      const rewardTokenManager = new token_1.TokenManager(
        graph_ts_1.Address.fromBytes(rewardToken.token),
        event
      );
      let emission = market.rewardTokenEmissionsAmount[i];
      if (
        rewardToken._distributionEnd &&
        rewardToken._distributionEnd.lt(event.block.timestamp)
      ) {
        emission = constants_1.BIGINT_ZERO;
      }
      const emissionUSD = rewardTokenManager.getAmountUSD(emission);
      const rewardData = new manager_1.RewardData(
        rewardToken,
        emission,
        emissionUSD
      );
      manager.updateRewards(rewardData);
    }
  }
}
exports._handleReserveDataUpdated = _handleReserveDataUpdated;
function _handleDeposit(event, amount, asset, protocolData, accountID) {
  const market = (0, helpers_1.getMarketFromToken)(asset, protocolData);
  if (!market) {
    graph_ts_1.log.warning("[_handleDeposit] Market for token {} not found", [
      asset.toHexString(),
    ]);
    return;
  }
  const manager = new manager_1.DataManager(
    market.id,
    market.inputToken,
    event,
    protocolData
  );
  const tokenManager = new token_1.TokenManager(
    asset,
    event,
    constants_3.TokenType.REBASING
  );
  const amountUSD = tokenManager.getAmountUSD(amount);
  const newCollateralBalance = (0, helpers_1.getCollateralBalance)(
    market,
    accountID
  );
  const principal = (0, helpers_1.getPrincipal)(
    market,
    accountID,
    constants_2.PositionSide.COLLATERAL
  );
  manager.createDeposit(
    asset,
    accountID,
    amount,
    amountUSD,
    newCollateralBalance,
    null,
    false,
    principal
  );
  const account = schema_1.Account.load(accountID);
  if (!account) {
    graph_ts_1.log.warning("[_handleDeposit]account {} not found", [
      accountID.toHexString(),
    ]);
    return;
  }
  const positionManager = new position_1.PositionManager(
    account,
    market,
    constants_2.PositionSide.COLLATERAL
  );
  if (
    !account._enabledCollaterals ||
    account._enabledCollaterals.indexOf(market.id) == -1
  ) {
    // Supply in isolated mode won't have ReserveUsedAsCollateralEnabled set
    // https://github.com/aave/aave-v3-core/blob/29ff9b9f89af7cd8255231bc5faf26c3ce0fb7ce/contracts/protocol/libraries/logic/SupplyLogic.sol#L76-L88
    positionManager.setIsolation(true);
    return;
  }
  positionManager.setCollateral(true);
  if (account._eMode) {
    const positionID = positionManager.getPositionID();
    if (!positionID) {
      graph_ts_1.log.error("[_handleDeposit]position not found", []);
      return;
    }
    const position = schema_1.Position.load(positionID);
    if (!position) {
      graph_ts_1.log.error("[_handleDeposit]position with ID {} not found", [
        positionID,
      ]);
      return;
    }
    position._eMode = true;
    position.save();
  }
}
exports._handleDeposit = _handleDeposit;
function _handleWithdraw(event, amount, asset, protocolData, accountID) {
  const market = (0, helpers_1.getMarketFromToken)(asset, protocolData);
  if (!market) {
    graph_ts_1.log.warning("[_handleWithdraw] Market for token {} not found", [
      asset.toHexString(),
    ]);
    return;
  }
  const manager = new manager_1.DataManager(
    market.id,
    market.inputToken,
    event,
    protocolData
  );
  const tokenManager = new token_1.TokenManager(
    asset,
    event,
    constants_3.TokenType.REBASING
  );
  const amountUSD = tokenManager.getAmountUSD(amount);
  const newCollateralBalance = (0, helpers_1.getCollateralBalance)(
    market,
    accountID
  );
  const principal = (0, helpers_1.getPrincipal)(
    market,
    accountID,
    constants_2.PositionSide.COLLATERAL
  );
  manager.createWithdraw(
    asset,
    accountID,
    amount,
    amountUSD,
    newCollateralBalance,
    null,
    principal
  );
}
exports._handleWithdraw = _handleWithdraw;
function _handleBorrow(
  event,
  amount,
  asset,
  protocolData,
  accountID,
  interestRateType = null,
  isIsolated = false
) {
  const market = (0, helpers_1.getMarketFromToken)(asset, protocolData);
  if (!market) {
    graph_ts_1.log.warning("[_handleBorrow] Market for token {} not found", [
      asset.toHexString(),
    ]);
    return;
  }
  const manager = new manager_1.DataManager(
    market.id,
    market.inputToken,
    event,
    protocolData
  );
  const tokenManager = new token_1.TokenManager(
    asset,
    event,
    constants_3.TokenType.REBASING
  );
  const amountUSD = tokenManager.getAmountUSD(amount);
  const newBorrowBalances = (0, helpers_1.getBorrowBalances)(market, accountID);
  const principal = (0, helpers_1.getPrincipal)(
    market,
    accountID,
    constants_2.PositionSide.BORROWER,
    interestRateType
  );
  manager.createBorrow(
    asset,
    accountID,
    amount,
    amountUSD,
    newBorrowBalances[0].plus(newBorrowBalances[1]),
    market.inputTokenPriceUSD,
    interestRateType,
    isIsolated,
    principal
  );
}
exports._handleBorrow = _handleBorrow;
function _handleRepay(event, amount, asset, protocolData, accountID) {
  const market = (0, helpers_1.getMarketFromToken)(asset, protocolData);
  if (!market) {
    graph_ts_1.log.warning("[_handleRepay] Market for token {} not found", [
      asset.toHexString(),
    ]);
    return;
  }
  const manager = new manager_1.DataManager(
    market.id,
    market.inputToken,
    event,
    protocolData
  );
  const tokenManager = new token_1.TokenManager(
    asset,
    event,
    constants_3.TokenType.REBASING
  );
  const amountUSD = tokenManager.getAmountUSD(amount);
  const newBorrowBalances = (0, helpers_1.getBorrowBalances)(market, accountID);
  // use debtToken Transfer event for Burn/Mint to determine interestRateType of the Repay event
  const interestRateType = (0, helpers_1.getInterestRateType)(event);
  if (!interestRateType) {
    graph_ts_1.log.error(
      "[_handleRepay]Cannot determine interest rate type for Repay event {}-{}",
      [
        event.transaction.hash.toHexString(),
        event.transactionLogIndex.toString(),
      ]
    );
  }
  const principal = (0, helpers_1.getPrincipal)(
    market,
    accountID,
    constants_2.PositionSide.BORROWER,
    interestRateType
  );
  manager.createRepay(
    asset,
    accountID,
    amount,
    amountUSD,
    newBorrowBalances[0].plus(newBorrowBalances[1]),
    market.inputTokenPriceUSD,
    interestRateType,
    principal
  );
}
exports._handleRepay = _handleRepay;
function _handleLiquidate(
  event,
  amount, // amount of collateral liquidated
  collateralAsset, // collateral market
  protocolData,
  liquidator,
  liquidatee, // account liquidated
  debtAsset, // token repaid to cover debt,
  debtToCover // the amount of debt repaid by liquidator
) {
  const market = (0, helpers_1.getMarketFromToken)(
    collateralAsset,
    protocolData
  );
  if (!market) {
    graph_ts_1.log.warning("[_handleLiquidate] Market for token {} not found", [
      collateralAsset.toHexString(),
    ]);
    return;
  }
  const manager = new manager_1.DataManager(
    market.id,
    market.inputToken,
    event,
    protocolData
  );
  const inputToken = manager.getInputToken();
  let inputTokenPriceUSD = market.inputTokenPriceUSD;
  if (!inputTokenPriceUSD) {
    graph_ts_1.log.warning(
      "[_handleLiquidate] Price of input token {} is not set, default to 0.0",
      [inputToken.id.toHexString()]
    );
    inputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
  }
  const amountUSD = amount
    .toBigDecimal()
    .div((0, helpers_1.exponentToBigDecimal)(inputToken.decimals))
    .times(inputTokenPriceUSD);
  // according to logic in _calculateAvailableCollateralToLiquidate()
  // liquidatedCollateralAmount = collateralAmount - liquidationProtocolFee
  // liquidationProtocolFee = bonusCollateral * liquidationProtocolFeePercentage
  // bonusCollateral = collateralAmount - (collateralAmount / liquidationBonus)
  // liquidationBonus = 1 + liquidationPenalty
  // => liquidationProtocolFee = liquidationPenalty * liquidationProtocolFeePercentage * liquidatedCollateralAmount / (1 + liquidationPenalty - liquidationPenalty*liquidationProtocolFeePercentage)
  if (!market._liquidationProtocolFee) {
    // liquidationProtocolFee is only set for v3 markets
    graph_ts_1.log.warning(
      "[_handleLiquidate]market {} _liquidationProtocolFee = null. Must be a v2 market, setting to 0.",
      [collateralAsset.toHexString()]
    );
    market._liquidationProtocolFee = constants_1.BIGDECIMAL_ZERO;
    market.save();
  }
  const liquidationProtocolFeeUSD = amountUSD
    .times(market.liquidationPenalty)
    .times(market._liquidationProtocolFee)
    .div(
      constants_1.BIGDECIMAL_ONE.plus(market.liquidationPenalty).minus(
        market.liquidationPenalty.times(market._liquidationProtocolFee)
      )
    );
  const fee = manager.getOrUpdateFee(
    constants_3.FeeType.LIQUIDATION_FEE,
    null,
    market._liquidationProtocolFee
  );
  manager.addProtocolRevenue(liquidationProtocolFeeUSD, fee);
  const debtTokenMarket = (0, helpers_1.getMarketFromToken)(
    debtAsset,
    protocolData
  );
  if (!debtTokenMarket) {
    graph_ts_1.log.warning(
      "[_handleLiquidate] market for Debt token  {} not found",
      [debtAsset.toHexString()]
    );
    return;
  }
  let debtTokenPriceUSD = debtTokenMarket.inputTokenPriceUSD;
  if (!debtTokenPriceUSD) {
    graph_ts_1.log.warning(
      "[_handleLiquidate] Price of token {} is not set, default to 0.0",
      [debtAsset.toHexString()]
    );
    debtTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
  }
  const profitUSD = amountUSD.minus(
    debtToCover.toBigDecimal().times(debtTokenPriceUSD)
  );
  const collateralBalance = (0, helpers_1.getCollateralBalance)(
    market,
    liquidatee
  );
  const debtBalances = (0, helpers_1.getBorrowBalances)(
    debtTokenMarket,
    liquidatee
  );
  const totalDebtBalance = debtBalances[0].plus(debtBalances[1]);
  const subtractBorrowerPosition = false;
  const collateralPrincipal = (0, helpers_1.getPrincipal)(
    market,
    liquidatee,
    constants_2.PositionSide.COLLATERAL
  );
  const liquidate = manager.createLiquidate(
    collateralAsset,
    debtAsset,
    liquidator,
    liquidatee,
    amount,
    amountUSD,
    profitUSD,
    collateralBalance,
    totalDebtBalance,
    null,
    subtractBorrowerPosition,
    collateralPrincipal
  );
  if (!liquidate) {
    return;
  }
  const liquidatedPositions = liquidate.positions;
  const liquidateeAccount = new account_1.AccountManager(
    liquidatee
  ).getAccount();
  const protocol = manager.getOrCreateLendingProtocol(protocolData);
  // Use the Transfer event for debtToken to burn to determine the interestRateType for debtToken liquidated
  // e.g. https://polygonscan.com/tx/0x2578371e35a1fa146aa34ea3936678c20091a08d55fd8cb46e0292fd95fe7f60#eventlog (v2)
  // https://optimistic.etherscan.io/tx/0xea6110df93b6581cf47b7261b33d9a1ae5cc5cac3b55931a11b7843641780958#eventlog (v3)
  // Variable debt is liquidated first
  const vBorrowerPosition = new position_1.PositionManager(
    liquidateeAccount,
    debtTokenMarket,
    constants_2.PositionSide.BORROWER,
    constants_2.InterestRateType.VARIABLE
  );
  const vBorrowerPositionBalance = vBorrowerPosition._getPositionBalance();
  if (
    vBorrowerPositionBalance &&
    vBorrowerPositionBalance.gt(constants_1.BIGINT_ZERO)
  ) {
    const vPrincipal = (0, helpers_1.getPrincipal)(
      market,
      graph_ts_1.Address.fromBytes(liquidateeAccount.id),
      constants_2.PositionSide.BORROWER,
      constants_2.InterestRateType.VARIABLE
    );
    vBorrowerPosition.subtractPosition(
      event,
      protocol,
      debtBalances[1],
      constants_2.TransactionType.LIQUIDATE,
      debtTokenMarket.inputTokenPriceUSD,
      vPrincipal
    );
    liquidatedPositions.push(vBorrowerPosition.getPositionID());
  }
  const sBorrowerPosition = new position_1.PositionManager(
    liquidateeAccount,
    debtTokenMarket,
    constants_2.PositionSide.BORROWER,
    constants_2.InterestRateType.STABLE
  );
  const sBorrowerPositionBalance = sBorrowerPosition._getPositionBalance();
  // Stable debt is liquidated after exhuasting variable debt
  if (
    debtBalances[1].equals(constants_1.BIGINT_ZERO) &&
    sBorrowerPositionBalance &&
    sBorrowerPositionBalance.gt(constants_1.BIGINT_ZERO)
  ) {
    const sPrincipal = (0, helpers_1.getPrincipal)(
      market,
      graph_ts_1.Address.fromBytes(liquidateeAccount.id),
      constants_2.PositionSide.BORROWER,
      constants_2.InterestRateType.STABLE
    );
    sBorrowerPosition.subtractPosition(
      event,
      protocol,
      debtBalances[0],
      constants_2.TransactionType.LIQUIDATE,
      debtTokenMarket.inputTokenPriceUSD,
      sPrincipal
    );
    liquidatedPositions.push(sBorrowerPosition.getPositionID());
  }
  liquidate.positions = liquidatedPositions;
  liquidate.save();
}
exports._handleLiquidate = _handleLiquidate;
function _handleFlashLoan(
  asset,
  amount,
  account,
  procotolData,
  event,
  premiumAmount,
  flashloanPremium
) {
  const market = (0, helpers_1.getMarketFromToken)(asset, procotolData);
  if (!market) {
    graph_ts_1.log.warning("[_handleFlashLoan] market for token {} not found", [
      asset.toHexString(),
    ]);
    return;
  }
  const manager = new manager_1.DataManager(
    market.id,
    market.inputToken,
    event,
    procotolData
  );
  const tokenManager = new token_1.TokenManager(asset, event);
  const amountUSD = tokenManager.getAmountUSD(amount);
  const premiumUSDTotal = tokenManager.getAmountUSD(premiumAmount);
  const flashloan = manager.createFlashloan(asset, account, amount, amountUSD);
  flashloan.feeAmount = premiumAmount;
  flashloan.feeAmountUSD = premiumUSDTotal;
  flashloan.save();
  let reserveFactor = market.reserveFactor;
  if (!reserveFactor) {
    reserveFactor = constants_1.BIGDECIMAL_ZERO;
  }
  const protocolRevenueShare = reserveFactor;
  let premiumUSDToProtocol = premiumUSDTotal.times(protocolRevenueShare);
  let premiumUSDToLP = premiumUSDTotal.minus(premiumUSDToProtocol);
  const premiumRateTotal = flashloanPremium.premiumRateTotal;
  let premiumRateToProtocol = premiumRateTotal.times(protocolRevenueShare);
  let premiumRateToLP = premiumRateTotal.minus(premiumRateToProtocol);
  if (flashloanPremium.premiumRateToProtocol.gt(constants_1.BIGDECIMAL_ZERO)) {
    // according to https://github.com/aave/aave-v3-core/blob/29ff9b9f89af7cd8255231bc5faf26c3ce0fb7ce/contracts/interfaces/IPool.sol#L634
    // premiumRateToProtocol is the percentage of premium to protocol
    premiumUSDToProtocol = premiumUSDTotal
      .times(flashloanPremium.premiumRateToProtocol)
      .plus(premiumUSDToProtocol);
    premiumRateToProtocol = premiumRateTotal
      .times(flashloanPremium.premiumRateToProtocol)
      .plus(premiumRateToProtocol);
    // premium to LP
    premiumUSDToLP = premiumUSDTotal.minus(premiumUSDToProtocol);
    premiumRateToLP = premiumRateTotal.minus(premiumRateToProtocol);
    // this part of the premium is transferred to the treasury and not
    // accrued to liquidityIndex and thus no need to deduct
  }
  const feeToProtocol = manager.getOrUpdateFee(
    constants_3.FeeType.FLASHLOAN_PROTOCOL_FEE,
    null,
    premiumRateToProtocol
  );
  manager.addProtocolRevenue(premiumUSDToProtocol, feeToProtocol);
  // flashloan premium to LP is accrued in liquidityIndex and handled in
  // _handleReserveDataUpdated;
  // https://github.com/aave/aave-v3-core/blob/master/contracts/protocol/libraries/logic/FlashLoanLogic.sol#L233-L237
  const feeToLP = manager.getOrUpdateFee(
    constants_3.FeeType.FLASHLOAN_LP_FEE,
    null,
    premiumRateToLP
  );
  manager.addSupplyRevenue(premiumUSDToLP, feeToLP);
}
exports._handleFlashLoan = _handleFlashLoan;
function _handleMintedToTreasury(event, protocolData, asset, amount) {
  const market = (0, helpers_1.getMarketFromToken)(asset, protocolData);
  if (!market) {
    graph_ts_1.log.warning(
      "[_handleMintedToTreasury] Market for token {} not found",
      [asset.toHexString()]
    );
    return;
  }
  const tokenManager = new token_1.TokenManager(market.inputToken, event);
  const amountUSD = tokenManager.getAmountUSD(amount);
  const treasuryAddress = (0, helpers_1.getTreasuryAddress)(market);
  const treasuryBalance = (0, helpers_1.getCollateralBalance)(
    market,
    treasuryAddress
  );
  const treasuryPrincipal = (0, helpers_1.getPrincipal)(
    market,
    treasuryAddress,
    constants_2.PositionSide.COLLATERAL
  );
  const manager = new manager_1.DataManager(
    market.id,
    market.inputToken,
    event,
    protocolData
  );
  manager.createTransfer(
    asset,
    graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS),
    treasuryAddress,
    amount,
    amountUSD,
    constants_1.BIGINT_ZERO,
    treasuryBalance,
    null,
    null,
    treasuryPrincipal
  );
}
exports._handleMintedToTreasury = _handleMintedToTreasury;
/////////////////////////
//// Transfer Events ////
/////////////////////////
function _handleTransfer(event, protocolData, positionSide, to, from, amount) {
  const asset = event.address;
  const market = (0, helpers_1.getMarketByAuxillaryToken)(asset, protocolData);
  if (!market) {
    graph_ts_1.log.warning("[_handleTransfer] market not found: {}", [
      asset.toHexString(),
    ]);
    return;
  }
  // if the to / from addresses are the same as the asset
  // then this transfer is emitted as part of another event
  // ie, a deposit, withdraw, borrow, repay, etc
  // we want to let that handler take care of position updates
  // and zero addresses mean it is a part of a burn / mint
  if (
    to == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS) ||
    from == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS) ||
    to == asset ||
    from == asset
  ) {
    return;
  }
  const tokenContract = ERC20_1.ERC20.bind(asset);
  const senderBalanceResult = tokenContract.try_balanceOf(from);
  const receiverBalanceResult = tokenContract.try_balanceOf(to);
  if (senderBalanceResult.reverted) {
    graph_ts_1.log.warning(
      "[_handleTransfer]token {} balanceOf() call for account {} reverted",
      [asset.toHexString(), from.toHexString()]
    );
    return;
  }
  if (receiverBalanceResult.reverted) {
    graph_ts_1.log.warning(
      "[_handleTransfer]token {} balanceOf() call for account {} reverted",
      [asset.toHexString(), to.toHexString()]
    );
    return;
  }
  const tokenManager = new token_1.TokenManager(asset, event);
  const assetToken = tokenManager.getToken();
  let interestRateType;
  if (assetToken._iavsTokenType == constants_1.IavsTokenType.STOKEN) {
    interestRateType = constants_2.InterestRateType.STABLE;
  } else if (assetToken._iavsTokenType == constants_1.IavsTokenType.VTOKEN) {
    interestRateType = constants_2.InterestRateType.VARIABLE;
  } else {
    interestRateType = null;
  }
  const senderPrincipal = (0, helpers_1.getPrincipal)(
    market,
    from,
    positionSide,
    interestRateType
  );
  const receiverPrincipal = (0, helpers_1.getPrincipal)(
    market,
    to,
    positionSide,
    interestRateType
  );
  const inputTokenManager = new token_1.TokenManager(market.inputToken, event);
  const amountUSD = inputTokenManager.getAmountUSD(amount);
  const manager = new manager_1.DataManager(
    market.id,
    market.inputToken,
    event,
    protocolData
  );
  manager.createTransfer(
    asset,
    from,
    to,
    amount,
    amountUSD,
    senderBalanceResult.value,
    receiverBalanceResult.value,
    interestRateType,
    senderPrincipal,
    receiverPrincipal
  );
}
exports._handleTransfer = _handleTransfer;
function _handleAssetConfigUpdated(
  event,
  assetAddress,
  rewardTokenAddress,
  rewardTokenPriceUSD,
  emissionPerSecond, // amount/second
  distributionEnd, // timestamp when emission ends
  protocolData
) {
  const market = (0, helpers_1.getMarketFromToken)(assetAddress, protocolData);
  if (!market) {
    graph_ts_1.log.error(
      "[_handleAssetConfigUpdated]Market for token {} not found",
      [assetAddress.toHexString()]
    );
    return;
  }
  const manager = new manager_1.DataManager(
    market.id,
    market.inputToken,
    event,
    protocolData
  );
  const assetToken = new token_1.TokenManager(assetAddress, event).getToken();
  if (!assetToken._iavsTokenType) {
    graph_ts_1.log.error(
      "[_handleAssetConfigUpdated]_iavsTokenType field for token {} is not set",
      [assetAddress.toHexString()]
    );
    return;
  }
  // There can be more than one reward tokens for a side,
  // e.g. one reward token for variable borrowing
  // and another for stable borrowing
  let rewardTokenType;
  if (assetToken._iavsTokenType == constants_1.IavsTokenType.ATOKEN) {
    rewardTokenType = constants_2.RewardTokenType.DEPOSIT;
  } else if (assetToken._iavsTokenType == constants_1.IavsTokenType.STOKEN) {
    rewardTokenType = constants_2.RewardTokenType.STABLE_BORROW;
  } else if (assetToken._iavsTokenType == constants_1.IavsTokenType.VTOKEN) {
    rewardTokenType = constants_2.RewardTokenType.VARIABLE_BORROW;
  } else {
    graph_ts_1.log.error(
      "[_handleAssetConfigUpdated] _iavsTokenType field for token {} is not one of ATOKEN, STOKEN, or VTOKEN",
      [assetAddress.toHexString()]
    );
    return;
  }
  const rewardTokenManager = new token_1.TokenManager(
    rewardTokenAddress,
    event
  );
  const rewardToken =
    rewardTokenManager.getOrCreateRewardToken(rewardTokenType);
  rewardToken._distributionEnd = distributionEnd;
  rewardToken.save();
  let emission = emissionPerSecond.times(
    graph_ts_1.BigInt.fromI32(constants_2.SECONDS_PER_DAY)
  );
  if (
    rewardToken._distributionEnd &&
    rewardToken._distributionEnd.lt(event.block.timestamp)
  ) {
    graph_ts_1.log.info(
      "[_handleAssetConfigUpdated]distributionEnd {} < block timestamp {}; emission set to 0",
      [event.block.timestamp.toString(), distributionEnd.toString()]
    );
    emission = constants_1.BIGINT_ZERO;
  }
  if (rewardTokenPriceUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
    rewardTokenManager.updatePrice(rewardTokenPriceUSD);
  }
  const emissionUSD = rewardTokenManager.getAmountUSD(emission);
  const rewardData = new manager_1.RewardData(
    rewardToken,
    emission,
    emissionUSD
  );
  manager.updateRewards(rewardData);
}
exports._handleAssetConfigUpdated = _handleAssetConfigUpdated;
function _handleSwapBorrowRateMode(
  event,
  market,
  user,
  newBorrowBalances,
  endInterestRateType,
  protocolData
) {
  const account = new account_1.AccountManager(user).getAccount();
  const manager = new manager_1.DataManager(
    market.id,
    market.inputToken,
    event,
    protocolData
  );
  const protocol = manager.getOrCreateLendingProtocol(protocolData);
  const sPositionManager = new position_1.PositionManager(
    account,
    market,
    constants_2.PositionSide.BORROWER,
    constants_2.InterestRateType.STABLE
  );
  const vPositionManager = new position_1.PositionManager(
    account,
    market,
    constants_2.PositionSide.BORROWER,
    constants_2.InterestRateType.VARIABLE
  );
  const stableTokenBalance = newBorrowBalances[0];
  const variableTokenBalance = newBorrowBalances[1];
  const vPrincipal = (0, helpers_1.getPrincipal)(
    market,
    graph_ts_1.Address.fromBytes(account.id),
    constants_2.PositionSide.BORROWER,
    constants_2.InterestRateType.VARIABLE
  );
  const sPrincipal = (0, helpers_1.getPrincipal)(
    market,
    graph_ts_1.Address.fromBytes(account.id),
    constants_2.PositionSide.BORROWER,
    constants_2.InterestRateType.STABLE
  );
  //all open position converted to STABLE
  if (endInterestRateType === constants_2.InterestRateType.STABLE) {
    vPositionManager.subtractPosition(
      event,
      protocol,
      variableTokenBalance,
      constants_2.TransactionType.SWAP,
      market.inputTokenPriceUSD,
      vPrincipal
    );
    sPositionManager.addPosition(
      event,
      market.inputToken,
      protocol,
      stableTokenBalance,
      constants_2.TransactionType.SWAP,
      market.inputTokenPriceUSD,
      sPrincipal
    );
  } else {
    //all open position converted to VARIABLE
    vPositionManager.addPosition(
      event,
      market.inputToken,
      protocol,
      variableTokenBalance,
      constants_2.TransactionType.SWAP,
      market.inputTokenPriceUSD,
      vPrincipal
    );
    sPositionManager.subtractPosition(
      event,
      protocol,
      stableTokenBalance,
      constants_2.TransactionType.SWAP,
      market.inputTokenPriceUSD,
      sPrincipal
    );
  }
}
exports._handleSwapBorrowRateMode = _handleSwapBorrowRateMode;
