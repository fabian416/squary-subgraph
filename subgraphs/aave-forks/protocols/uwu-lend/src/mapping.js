"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStableTransfer =
  exports.handleVariableTransfer =
  exports.handleCollateralTransfer =
  exports.handleSwapBorrowRateMode =
  exports.handleFlashloan =
  exports.handleLiquidationCall =
  exports.handleRepay =
  exports.handleBorrow =
  exports.handleWithdraw =
  exports.handleDeposit =
  exports.handleUnpaused =
  exports.handlePaused =
  exports.handleReserveUsedAsCollateralDisabled =
  exports.handleReserveUsedAsCollateralEnabled =
  exports.handleReserveDataUpdated =
  exports.handleReserveFactorChanged =
  exports.handleReserveDeactivated =
  exports.handleReserveActivated =
  exports.handleBorrowingDisabledOnReserve =
  exports.handleBorrowingEnabledOnReserve =
  exports.handleCollateralConfigurationChanged =
  exports.handleReserveInitialized =
  exports.handlePriceOracleUpdated =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const AToken_1 = require("../../../generated/LendingPool/AToken");
const mapping_1 = require("../../../src/mapping");
const constants_2 = require("../../../src/constants");
const schema_1 = require("../../../generated/schema");
const ChefIncentivesController_1 = require("../../../generated/LendingPool/ChefIncentivesController");
const SushiSwapLP_1 = require("../../../generated/LendingPool/SushiSwapLP");
const IPriceOracleGetter_1 = require("../../../generated/LendingPool/IPriceOracleGetter");
const manager_1 = require("../../../src/sdk/manager");
const constants_3 = require("../../../src/sdk/constants");
const helpers_1 = require("../../../src/helpers");
const token_1 = require("../../../src/sdk/token");
function getProtocolData() {
  const constants = (0, constants_1.getNetworkSpecificConstant)();
  return new manager_1.ProtocolData(
    constants.protocolAddress,
    constants_1.Protocol.PROTOCOL,
    constants_1.Protocol.NAME,
    constants_1.Protocol.SLUG,
    constants.network,
    constants_3.LendingType.POOLED,
    constants_3.PermissionType.PERMISSIONLESS,
    constants_3.PermissionType.PERMISSIONLESS,
    constants_3.PermissionType.ADMIN,
    constants_3.CollateralizationType.OVER_COLLATERALIZED,
    constants_3.RiskType.GLOBAL
  );
}
const protocolData = getProtocolData();
///////////////////////////////////////////////
///// LendingPoolAddressProvider Handlers /////
///////////////////////////////////////////////
function handlePriceOracleUpdated(event) {
  (0, mapping_1._handlePriceOracleUpdated)(
    event.params.newAddress,
    protocolData,
    event
  );
}
exports.handlePriceOracleUpdated = handlePriceOracleUpdated;
//////////////////////////////////////
///// Lending Pool Configuration /////
//////////////////////////////////////
function handleReserveInitialized(event) {
  // This function handles market entity from reserve creation event
  // Attempt to load or create the market implementation
  (0, mapping_1._handleReserveInitialized)(
    event,
    event.params.asset,
    event.params.aToken,
    event.params.variableDebtToken,
    protocolData,
    event.params.stableDebtToken
  );
}
exports.handleReserveInitialized = handleReserveInitialized;
function handleCollateralConfigurationChanged(event) {
  (0, mapping_1._handleCollateralConfigurationChanged)(
    event.params.asset,
    event.params.liquidationBonus,
    event.params.liquidationThreshold,
    event.params.ltv,
    protocolData
  );
}
exports.handleCollateralConfigurationChanged =
  handleCollateralConfigurationChanged;
function handleBorrowingEnabledOnReserve(event) {
  (0, mapping_1._handleBorrowingEnabledOnReserve)(
    event.params.asset,
    protocolData
  );
}
exports.handleBorrowingEnabledOnReserve = handleBorrowingEnabledOnReserve;
function handleBorrowingDisabledOnReserve(event) {
  (0, mapping_1._handleBorrowingDisabledOnReserve)(
    event.params.asset,
    protocolData
  );
}
exports.handleBorrowingDisabledOnReserve = handleBorrowingDisabledOnReserve;
function handleReserveActivated(event) {
  (0, mapping_1._handleReserveActivated)(event.params.asset, protocolData);
}
exports.handleReserveActivated = handleReserveActivated;
function handleReserveDeactivated(event) {
  (0, mapping_1._handleReserveDeactivated)(event.params.asset, protocolData);
}
exports.handleReserveDeactivated = handleReserveDeactivated;
function handleReserveFactorChanged(event) {
  (0, mapping_1._handleReserveFactorChanged)(
    event.params.asset,
    event.params.factor,
    protocolData
  );
}
exports.handleReserveFactorChanged = handleReserveFactorChanged;
/////////////////////////////////
///// Lending Pool Handlers /////
/////////////////////////////////
function handleReserveDataUpdated(event) {
  const market = (0, helpers_1.getMarketFromToken)(
    event.params.reserve,
    protocolData
  );
  if (!market) {
    graph_ts_1.log.warning("[handleReserveDataUpdated] Market not found", [
      event.params.reserve.toHexString(),
    ]);
    return;
  }
  const manager = new manager_1.DataManager(
    market.id,
    market.inputToken,
    event,
    protocolData
  );
  const assetPriceUSD = getAssetPriceInUSDC(
    graph_ts_1.Address.fromBytes(market.inputToken),
    manager.getOracleAddress()
  );
  (0, mapping_1._handleReserveDataUpdated)(
    event,
    event.params.liquidityRate,
    event.params.liquidityIndex,
    event.params.variableBorrowIndex,
    event.params.variableBorrowRate,
    event.params.stableBorrowRate,
    protocolData,
    event.params.reserve,
    assetPriceUSD
  );
  updateRewards(manager, event);
}
exports.handleReserveDataUpdated = handleReserveDataUpdated;
function handleReserveUsedAsCollateralEnabled(event) {
  // This Event handler enables a reserve/market to be used as collateral
  (0, mapping_1._handleReserveUsedAsCollateralEnabled)(
    event.params.reserve,
    event.params.user,
    protocolData
  );
}
exports.handleReserveUsedAsCollateralEnabled =
  handleReserveUsedAsCollateralEnabled;
function handleReserveUsedAsCollateralDisabled(event) {
  // This Event handler disables a reserve/market being used as collateral
  (0, mapping_1._handleReserveUsedAsCollateralDisabled)(
    event.params.reserve,
    event.params.user,
    protocolData
  );
}
exports.handleReserveUsedAsCollateralDisabled =
  handleReserveUsedAsCollateralDisabled;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handlePaused(event) {
  (0, mapping_1._handlePaused)(protocolData);
}
exports.handlePaused = handlePaused;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleUnpaused(event) {
  (0, mapping_1._handleUnpaused)(protocolData);
}
exports.handleUnpaused = handleUnpaused;
function handleDeposit(event) {
  (0, mapping_1._handleDeposit)(
    event,
    event.params.amount,
    event.params.reserve,
    protocolData,
    event.params.onBehalfOf
  );
}
exports.handleDeposit = handleDeposit;
function handleWithdraw(event) {
  (0, mapping_1._handleWithdraw)(
    event,
    event.params.amount,
    event.params.reserve,
    protocolData,
    event.params.to
  );
}
exports.handleWithdraw = handleWithdraw;
function handleBorrow(event) {
  (0, mapping_1._handleBorrow)(
    event,
    event.params.amount,
    event.params.reserve,
    protocolData,
    event.params.onBehalfOf
  );
}
exports.handleBorrow = handleBorrow;
function handleRepay(event) {
  (0, mapping_1._handleRepay)(
    event,
    event.params.amount,
    event.params.reserve,
    protocolData,
    event.params.user
  );
}
exports.handleRepay = handleRepay;
function handleLiquidationCall(event) {
  (0, mapping_1._handleLiquidate)(
    event,
    event.params.liquidatedCollateralAmount,
    event.params.collateralAsset,
    protocolData,
    event.params.liquidator,
    event.params.user,
    event.params.debtAsset,
    event.params.debtToCover
  );
}
exports.handleLiquidationCall = handleLiquidationCall;
function handleFlashloan(event) {
  const flashloanPremium = (0, helpers_1.getOrCreateFlashloanPremium)(
    protocolData
  );
  flashloanPremium.premiumRateTotal = constants_1.FLASHLOAN_PREMIUM_TOTAL;
  flashloanPremium.save();
  (0, mapping_1._handleFlashLoan)(
    event.params.asset,
    event.params.amount,
    event.params.initiator,
    protocolData,
    event,
    event.params.premium,
    flashloanPremium
  );
}
exports.handleFlashloan = handleFlashloan;
function handleSwapBorrowRateMode(event) {
  const interestRateMode = event.params.rateMode.toI32();
  if (
    ![
      constants_2.InterestRateMode.STABLE,
      constants_2.InterestRateMode.VARIABLE,
    ].includes(interestRateMode)
  ) {
    graph_ts_1.log.error(
      "[handleSwapBorrowRateMode]interestRateMode {} is not one of [{}, {}]",
      [
        interestRateMode.toString(),
        constants_2.InterestRateMode.STABLE.toString(),
        constants_2.InterestRateMode.VARIABLE.toString(),
      ]
    );
    return;
  }
  const interestRateType =
    interestRateMode === constants_2.InterestRateMode.STABLE
      ? constants_3.InterestRateType.STABLE
      : constants_3.InterestRateType.VARIABLE;
  const market = (0, helpers_1.getMarketFromToken)(
    event.params.reserve,
    protocolData
  );
  if (!market) {
    graph_ts_1.log.error(
      "[handleLiquidationCall]Failed to find market for asset {}",
      [event.params.reserve.toHexString()]
    );
    return;
  }
  const newBorrowBalances = (0, helpers_1.getBorrowBalances)(
    market,
    event.params.user
  );
  (0, mapping_1._handleSwapBorrowRateMode)(
    event,
    market,
    event.params.user,
    newBorrowBalances,
    interestRateType,
    protocolData
  );
}
exports.handleSwapBorrowRateMode = handleSwapBorrowRateMode;
/////////////////////////
//// Transfer Events ////
/////////////////////////
function handleCollateralTransfer(event) {
  (0, mapping_1._handleTransfer)(
    event,
    protocolData,
    constants_3.PositionSide.COLLATERAL,
    event.params.to,
    event.params.from,
    event.params.value
  );
}
exports.handleCollateralTransfer = handleCollateralTransfer;
function handleVariableTransfer(event) {
  (0, mapping_1._handleTransfer)(
    event,
    protocolData,
    constants_3.PositionSide.BORROWER,
    event.params.to,
    event.params.from,
    event.params.value
  );
}
exports.handleVariableTransfer = handleVariableTransfer;
function handleStableTransfer(event) {
  (0, mapping_1._handleTransfer)(
    event,
    protocolData,
    constants_3.PositionSide.BORROWER,
    event.params.to,
    event.params.from,
    event.params.value
  );
}
exports.handleStableTransfer = handleStableTransfer;
///////////////////
///// Helpers /////
///////////////////
function updateRewards(manager, event) {
  const market = manager.getMarket();
  // Get UWU rewards for the given pool
  const aTokenContract = AToken_1.AToken.bind(
    graph_ts_1.Address.fromBytes(market.outputToken)
  );
  const tryIncentiveController = aTokenContract.try_getIncentivesController();
  if (!tryIncentiveController.reverted) {
    graph_ts_1.log.warning(
      "[updateRewards]aToken {} getIncentivesController() call reverted",
      [market.outputToken.toHexString()]
    );
    return;
  }
  const rewardEmissionsAmount = [
    constants_2.BIGINT_ZERO,
    constants_2.BIGINT_ZERO,
  ];
  const rewardEmissionsUSD = [
    constants_2.BIGDECIMAL_ZERO,
    constants_2.BIGDECIMAL_ZERO,
  ];
  const incentiveControllerContract =
    ChefIncentivesController_1.ChefIncentivesController.bind(
      tryIncentiveController.value
    );
  const tryDepPoolInfo = incentiveControllerContract.try_poolInfo(
    graph_ts_1.Address.fromBytes(market.outputToken)
  );
  const tryBorPoolInfo = incentiveControllerContract.try_poolInfo(
    graph_ts_1.Address.fromBytes(market._vToken)
  );
  const tryAllocPoints = incentiveControllerContract.try_totalAllocPoint();
  const tryRewardsPerSecond =
    incentiveControllerContract.try_rewardsPerSecond();
  const tokenManager = new token_1.TokenManager(
    graph_ts_1.Address.fromString(constants_1.UWU_TOKEN_ADDRESS),
    event
  );
  const uwuToken = tokenManager.getToken();
  const rewardTokenBorrow = tokenManager.getOrCreateRewardToken(
    constants_3.RewardTokenType.VARIABLE_BORROW
  );
  const rewardTokenDeposit = tokenManager.getOrCreateRewardToken(
    constants_3.RewardTokenType.DEPOSIT
  );
  const uwuPriceUSD = getUwuPriceUSD();
  tokenManager.updatePrice(uwuPriceUSD);
  // calculate rewards per pool
  // Rewards/sec/poolSide = rewardsPerSecond * poolAllocPoints / totalAllocPoints
  if (
    !tryBorPoolInfo.reverted &&
    !tryAllocPoints.reverted &&
    !tryRewardsPerSecond.reverted
  ) {
    const poolAllocPoints = tryBorPoolInfo.value.value1;
    const borRewardsPerDay = tryRewardsPerSecond.value
      .times(graph_ts_1.BigInt.fromI32(constants_2.SECONDS_PER_DAY))
      .toBigDecimal()
      .div((0, helpers_1.exponentToBigDecimal)(uwuToken.decimals))
      .times(
        poolAllocPoints.toBigDecimal().div(tryAllocPoints.value.toBigDecimal())
      );
    const borRewardsPerDayBI = graph_ts_1.BigInt.fromString(
      borRewardsPerDay
        .times((0, helpers_1.exponentToBigDecimal)(uwuToken.decimals))
        .truncate(0)
        .toString()
    );
    const rewardDataBorrow = new manager_1.RewardData(
      rewardTokenBorrow,
      borRewardsPerDayBI,
      borRewardsPerDay.times(uwuPriceUSD)
    );
    manager.updateRewards(rewardDataBorrow);
  }
  if (
    !tryDepPoolInfo.reverted &&
    !tryAllocPoints.reverted &&
    !tryRewardsPerSecond.reverted
  ) {
    const poolAllocPoints = tryDepPoolInfo.value.value1;
    const depRewardsPerDay = tryRewardsPerSecond.value
      .times(graph_ts_1.BigInt.fromI32(constants_2.SECONDS_PER_DAY))
      .toBigDecimal()
      .div((0, helpers_1.exponentToBigDecimal)(uwuToken.decimals))
      .times(
        poolAllocPoints.toBigDecimal().div(tryAllocPoints.value.toBigDecimal())
      );
    const depRewardsPerDayBI = graph_ts_1.BigInt.fromString(
      depRewardsPerDay
        .times((0, helpers_1.exponentToBigDecimal)(uwuToken.decimals))
        .truncate(0)
        .toString()
    );
    rewardEmissionsAmount[1] = depRewardsPerDayBI;
    rewardEmissionsUSD[1] = depRewardsPerDay.times(uwuPriceUSD);
    const rewardDataDeposit = new manager_1.RewardData(
      rewardTokenDeposit,
      depRewardsPerDayBI,
      depRewardsPerDay.times(uwuPriceUSD)
    );
    manager.updateRewards(rewardDataDeposit);
  }
}
function getAssetPriceInUSDC(tokenAddress, priceOracle) {
  const oracle = IPriceOracleGetter_1.IPriceOracleGetter.bind(priceOracle);
  let oracleResult = (0, helpers_1.readValue)(
    oracle.try_getAssetPrice(tokenAddress),
    constants_2.BIGINT_ZERO
  );
  // if the result is zero or less, try the fallback oracle
  if (!oracleResult.gt(constants_2.BIGINT_ZERO)) {
    const tryFallback = oracle.try_getFallbackOracle();
    if (tryFallback) {
      const fallbackOracle = IPriceOracleGetter_1.IPriceOracleGetter.bind(
        tryFallback.value
      );
      oracleResult = (0, helpers_1.readValue)(
        fallbackOracle.try_getAssetPrice(tokenAddress),
        constants_2.BIGINT_ZERO
      );
    }
  }
  return oracleResult
    .toBigDecimal()
    .div((0, helpers_1.exponentToBigDecimal)(constants_1.UWU_DECIMALS));
}
//
// get UWU price based off WETH price
function getUwuPriceUSD() {
  const sushiContract = SushiSwapLP_1.SushiSwapLP.bind(
    graph_ts_1.Address.fromString(constants_1.UWU_WETH_LP)
  );
  const tryReserves = sushiContract.try_getReserves();
  if (tryReserves.reverted) {
    graph_ts_1.log.warning(
      "[getUwuPriceUSD] failed to get reserves for UWU-WETH LP",
      []
    );
    return constants_2.BIGDECIMAL_ZERO;
  }
  const uwuReserveBalance = tryReserves.value.value0;
  const wethReserveBalance = tryReserves.value.value1;
  if (
    uwuReserveBalance.equals(constants_2.BIGINT_ZERO) ||
    wethReserveBalance.equals(constants_2.BIGINT_ZERO)
  ) {
    graph_ts_1.log.warning(
      "[getUwuPriceUSD] UWU or WETH reserve balance is zero",
      []
    );
    return constants_2.BIGDECIMAL_ZERO;
  }
  // get WETH price in USD
  const defaultOracle = schema_1._DefaultOracle.load(protocolData.protocolID);
  if (!defaultOracle || !defaultOracle.oracle) {
    graph_ts_1.log.warning(
      "[getUwuPriceUSD]defaultOracle.oracle for {} is not set",
      [protocolData.protocolID.toHexString()]
    );
    return constants_2.BIGDECIMAL_ZERO;
  }
  const wethPriceUSD = getAssetPriceInUSDC(
    graph_ts_1.Address.fromString(constants_1.WETH_TOKEN_ADDRESS),
    graph_ts_1.Address.fromBytes(defaultOracle.oracle)
  );
  const uwuPriceUSD = wethPriceUSD.div(
    uwuReserveBalance.toBigDecimal().div(wethReserveBalance.toBigDecimal())
  );
  return uwuPriceUSD;
}
