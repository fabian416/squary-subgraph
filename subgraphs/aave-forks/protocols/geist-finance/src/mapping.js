"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const GToken_1 = require("../../../generated/LendingPool/GToken");
const mapping_1 = require("../../../src/mapping");
const helpers_1 = require("../../../src/helpers");
const constants_2 = require("../../../src/constants");
const ChefIncentivesController_1 = require("../../../generated/LendingPool/ChefIncentivesController");
const SpookySwapOracle_1 = require("../../../generated/LendingPool/SpookySwapOracle");
const manager_1 = require("../../../src/sdk/manager");
const constants_3 = require("../../../src/sdk/constants");
const token_1 = require("../../../src/sdk/token");
function getProtocolData() {
  return new manager_1.ProtocolData(
    graph_ts_1.Address.fromString(constants_1.Protocol.PROTOCOL_ADDRESS),
    constants_1.Protocol.PROTOCOL,
    constants_1.Protocol.NAME,
    constants_1.Protocol.SLUG,
    constants_1.Protocol.NETWORK,
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
    protocolData
    // No stable debt token in geist
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
    graph_ts_1.log.warning(
      "[handleReserveDataUpdated] Market not found for reserve {}",
      [event.params.reserve.toHexString()]
    );
    return;
  }
  const manager = new manager_1.DataManager(
    market.id,
    market.inputToken,
    event,
    protocolData
  );
  updateRewards(manager, event);
  const gTokenContract = GToken_1.GToken.bind(
    graph_ts_1.Address.fromBytes(market.outputToken)
  );
  // update gToken price
  let assetPriceUSD;
  const CRV_PRICE_BLOCK_NUMBER = 25266668;
  // CRV prices are not returned from gCRV for the first 3 days
  // ie blocks 24879410 - 25266668
  if (
    market.id.toHexString().toLowerCase() ==
      constants_1.CRV_ADDRESS.toLowerCase() &&
    event.block.number.toI64() <= CRV_PRICE_BLOCK_NUMBER
  ) {
    assetPriceUSD = getCRVPriceUSD();
  } else {
    const tryPrice = gTokenContract.try_getAssetPrice();
    if (tryPrice.reverted) {
      graph_ts_1.log.warning(
        "[handleReserveDataUpdated] Token price not found in Market: {}",
        [market.id.toHexString()]
      );
      return;
    }
    // get asset price normally
    assetPriceUSD = tryPrice.value
      .toBigDecimal()
      .div((0, helpers_1.exponentToBigDecimal)(constants_2.DEFAULT_DECIMALS));
  }
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
    event.params.user // address that is getting debt reduced
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
///////////////////
///// Helpers /////
///////////////////
// GEIST price is generated from FTM-GEIST reserve on SpookySwap
function getGeistPriceUSD() {
  const geistFtmLP = SpookySwapOracle_1.SpookySwapOracle.bind(
    graph_ts_1.Address.fromString(constants_1.GEIST_FTM_LP_ADDRESS)
  );
  const reserves = geistFtmLP.try_getReserves();
  if (reserves.reverted) {
    graph_ts_1.log.error(
      "[getGeistPriceUSD] Unable to get price for asset {}",
      [constants_1.REWARD_TOKEN_ADDRESS]
    );
    return constants_2.BIGDECIMAL_ZERO;
  }
  const reserveFTM = reserves.value.value0;
  const reserveGEIST = reserves.value.value1;
  const priceGEISTinFTM = reserveFTM
    .toBigDecimal()
    .div(reserveGEIST.toBigDecimal());
  // get FTM price
  const gTokenContract = GToken_1.GToken.bind(
    graph_ts_1.Address.fromString(constants_1.GFTM_ADDRESS)
  );
  const tryPrice = gTokenContract.try_getAssetPrice();
  return tryPrice.reverted
    ? constants_2.BIGDECIMAL_ZERO
    : tryPrice.value
        .toBigDecimal()
        .div((0, helpers_1.exponentToBigDecimal)(constants_2.DEFAULT_DECIMALS))
        .times(priceGEISTinFTM);
}
// GEIST price is generated from CRV-FTM LP on SpookySwap
function getCRVPriceUSD() {
  const crvFtmLP = SpookySwapOracle_1.SpookySwapOracle.bind(
    graph_ts_1.Address.fromString(constants_1.CRV_FTM_LP_ADDRESS)
  );
  const reserves = crvFtmLP.try_getReserves();
  if (reserves.reverted) {
    graph_ts_1.log.error("[getCRVPriceUSD] Unable to get price for asset {}", [
      constants_1.CRV_ADDRESS,
    ]);
    return constants_2.BIGDECIMAL_ZERO;
  }
  const reserveCRV = reserves.value.value0;
  const reserveFTM = reserves.value.value1;
  const priceCRVinFTM = reserveFTM
    .toBigDecimal()
    .div(reserveCRV.toBigDecimal());
  // get FTM price
  const gTokenContract = GToken_1.GToken.bind(
    graph_ts_1.Address.fromString(constants_1.GFTM_ADDRESS)
  );
  const tryPrice = gTokenContract.try_getAssetPrice();
  graph_ts_1.log.warning("crv price: ${}", [
    tryPrice.reverted
      ? constants_2.BIGDECIMAL_ZERO.toString()
      : tryPrice.value
          .toBigDecimal()
          .div(
            (0, helpers_1.exponentToBigDecimal)(constants_2.DEFAULT_DECIMALS)
          )
          .times(priceCRVinFTM)
          .toString(),
  ]);
  return tryPrice.reverted
    ? constants_2.BIGDECIMAL_ZERO
    : tryPrice.value
        .toBigDecimal()
        .div((0, helpers_1.exponentToBigDecimal)(constants_2.DEFAULT_DECIMALS))
        .times(priceCRVinFTM);
}
// Rewards / day calculation
// rewards per second = totalRewardsPerSecond * (allocPoint / totalAllocPoint)
// rewards per day = rewardsPerSecond * 60 * 60 * 24
// Borrow rewards are 3x the rewards per day for deposits
function updateRewards(manager, event) {
  const market = manager.getMarket();
  const gTokenContract = GToken_1.GToken.bind(
    graph_ts_1.Address.fromBytes(market.outputToken)
  );
  const tryIncentiveController = gTokenContract.try_getIncentivesController();
  if (!tryIncentiveController.reverted) {
    return;
  }
  const incentiveControllerContract =
    ChefIncentivesController_1.ChefIncentivesController.bind(
      tryIncentiveController.value
    );
  const tryPoolInfo = incentiveControllerContract.try_poolInfo(
    graph_ts_1.Address.fromBytes(market.outputToken)
  );
  const tryTotalAllocPoint = incentiveControllerContract.try_totalAllocPoint();
  const tryTotalRewardsPerSecond =
    incentiveControllerContract.try_rewardsPerSecond();
  if (
    tryPoolInfo.reverted ||
    tryTotalAllocPoint.reverted ||
    tryTotalRewardsPerSecond.reverted
  ) {
    return;
  }
  // create reward tokens
  const tokenManager = new token_1.TokenManager(
    graph_ts_1.Address.fromString(constants_1.REWARD_TOKEN_ADDRESS),
    event
  );
  const rewardTokenBorrow = tokenManager.getOrCreateRewardToken(
    constants_3.RewardTokenType.VARIABLE_BORROW
  );
  const rewardTokenDeposit = tokenManager.getOrCreateRewardToken(
    constants_3.RewardTokenType.DEPOSIT
  );
  const rewardTokenPriceUSD = getGeistPriceUSD();
  tokenManager.updatePrice(rewardTokenPriceUSD);
  // calculate rewards per day
  const rewardsPerSecond = tryTotalRewardsPerSecond.value
    .times(tryPoolInfo.value.value1)
    .div(tryTotalAllocPoint.value);
  const rewardsPerDay = rewardsPerSecond.times(
    graph_ts_1.BigInt.fromI32(constants_2.SECONDS_PER_DAY)
  );
  const rewardsPerDayUSD = rewardsPerDay
    .toBigDecimal()
    .div((0, helpers_1.exponentToBigDecimal)(constants_2.DEFAULT_DECIMALS))
    .times(rewardTokenPriceUSD);
  const rewardDataBorrow = new manager_1.RewardData(
    rewardTokenBorrow,
    rewardsPerDay.times(constants_2.BIGINT_THREE),
    rewardsPerDayUSD.times(constants_2.BIGDECIMAL_THREE)
  );
  const rewardDataDeposit = new manager_1.RewardData(
    rewardTokenDeposit,
    rewardsPerDay,
    rewardsPerDayUSD
  );
  manager.updateRewards(rewardDataBorrow);
  manager.updateRewards(rewardDataDeposit);
}
