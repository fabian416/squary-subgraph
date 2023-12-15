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
const AaveIncentivesController_1 = require("../../../generated/LendingPool/AaveIncentivesController");
const StakedAave_1 = require("../../../generated/LendingPool/StakedAave");
const IPriceOracleGetter_1 = require("../../../generated/LendingPool/IPriceOracleGetter");
const manager_1 = require("../../../src/sdk/manager");
const helpers_1 = require("../../../src/helpers");
const constants_3 = require("../../../src/sdk/constants");
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
  // Mainnet Oracles return the price in eth, must convert to USD through the following method
  if (
    (0, helpers_1.equalsIgnoreCase)(
      graph_ts_1.dataSource.network(),
      constants_2.Network.MAINNET
    )
  ) {
    const priceUSDCInEth = (0, helpers_1.readValue)(
      oracle.try_getAssetPrice(
        graph_ts_1.Address.fromString(constants_1.USDC_TOKEN_ADDRESS)
      ),
      constants_2.BIGINT_ZERO
    );
    if (priceUSDCInEth.equals(constants_2.BIGINT_ZERO)) {
      return constants_2.BIGDECIMAL_ZERO;
    } else {
      return oracleResult.toBigDecimal().div(priceUSDCInEth.toBigDecimal());
    }
  }
  // last resort, should not be touched
  const inputToken = schema_1.Token.load(tokenAddress);
  if (!inputToken) {
    graph_ts_1.log.warning(
      "[getAssetPriceInUSDC]token {} not found in Token entity; return BIGDECIMAL_ZERO",
      [tokenAddress.toHexString()]
    );
    return constants_2.BIGDECIMAL_ZERO;
  }
  return oracleResult
    .toBigDecimal()
    .div((0, helpers_1.exponentToBigDecimal)(inputToken.decimals));
}
function updateRewards(manager, event) {
  // Reward rate (rewards/second) in a market comes from try_assets(to)
  // Supply side the to address is the aToken
  // Borrow side the to address is the variableDebtToken
  const market = manager.getMarket();
  const aTokenContract = AToken_1.AToken.bind(
    graph_ts_1.Address.fromBytes(market.outputToken)
  );
  const tryIncentiveController = aTokenContract.try_getIncentivesController();
  if (!tryIncentiveController.reverted) {
    graph_ts_1.log.warning(
      "[updateRewards]getIncentivesController() call for aToken {} is reverted",
      [market.outputToken.toHexString()]
    );
    return;
  }
  const incentiveControllerContract =
    AaveIncentivesController_1.AaveIncentivesController.bind(
      tryIncentiveController.value
    );
  const tryBorrowRewards = incentiveControllerContract.try_assets(
    graph_ts_1.Address.fromBytes(market._vToken)
  );
  const trySupplyRewards = incentiveControllerContract.try_assets(
    graph_ts_1.Address.fromBytes(market.outputToken)
  );
  const tryRewardAsset = incentiveControllerContract.try_REWARD_TOKEN();
  if (tryRewardAsset.reverted) {
    graph_ts_1.log.warning(
      "[updateRewards]REWARD_TOKEN() call for AaveIncentivesController contract {} is reverted",
      [tryIncentiveController.value.toHexString()]
    );
    return;
  }
  // create reward tokens
  const tokenManager = new token_1.TokenManager(tryRewardAsset.value, event);
  const rewardToken = tokenManager.getToken();
  const borrowRewardToken = tokenManager.getOrCreateRewardToken(
    constants_3.RewardTokenType.VARIABLE_BORROW
  );
  const depositRewardToken = tokenManager.getOrCreateRewardToken(
    constants_3.RewardTokenType.DEPOSIT
  );
  const rewardDecimals = rewardToken.decimals;
  const defaultOracle = schema_1._DefaultOracle.load(protocolData.protocolID);
  // get reward token price
  // get price of reward token (if stkAAVE it is tied to the price of AAVE)
  let rewardTokenPriceUSD = constants_2.BIGDECIMAL_ZERO;
  if (
    (0, helpers_1.equalsIgnoreCase)(
      graph_ts_1.dataSource.network(),
      constants_2.Network.MAINNET
    ) &&
    defaultOracle &&
    defaultOracle.oracle
  ) {
    // get staked token if possible to grab price of staked token
    const stakedTokenContract = StakedAave_1.StakedAave.bind(
      tryRewardAsset.value
    );
    const tryStakedToken = stakedTokenContract.try_STAKED_TOKEN();
    if (!tryStakedToken.reverted) {
      rewardTokenPriceUSD = getAssetPriceInUSDC(
        tryStakedToken.value,
        graph_ts_1.Address.fromBytes(defaultOracle.oracle)
      );
    }
  }
  // if reward token price was not found then use old method
  if (
    rewardTokenPriceUSD.equals(constants_2.BIGDECIMAL_ZERO) &&
    defaultOracle &&
    defaultOracle.oracle
  ) {
    rewardTokenPriceUSD = getAssetPriceInUSDC(
      tryRewardAsset.value,
      graph_ts_1.Address.fromBytes(defaultOracle.oracle)
    );
  }
  // we check borrow first since it will show up first in graphql ordering
  // see explanation in docs/Mapping.md#Array Sorting When Querying
  if (!tryBorrowRewards.reverted) {
    // update borrow rewards
    const borrowRewardsPerDay = tryBorrowRewards.value.value0.times(
      graph_ts_1.BigInt.fromI32(constants_2.SECONDS_PER_DAY)
    );
    const borrowRewardsPerDayUSD = borrowRewardsPerDay
      .toBigDecimal()
      .div((0, helpers_1.exponentToBigDecimal)(rewardDecimals))
      .times(rewardTokenPriceUSD);
    const borrowRewardData = new manager_1.RewardData(
      borrowRewardToken,
      borrowRewardsPerDay,
      borrowRewardsPerDayUSD
    );
    manager.updateRewards(borrowRewardData);
  }
  if (!trySupplyRewards.reverted) {
    // update deposit rewards
    const supplyRewardsPerDay = trySupplyRewards.value.value0.times(
      graph_ts_1.BigInt.fromI32(constants_2.SECONDS_PER_DAY)
    );
    const supplyRewardsPerDayUSD = supplyRewardsPerDay
      .toBigDecimal()
      .div((0, helpers_1.exponentToBigDecimal)(rewardDecimals))
      .times(rewardTokenPriceUSD);
    const depositRewardData = new manager_1.RewardData(
      depositRewardToken,
      supplyRewardsPerDay,
      supplyRewardsPerDayUSD
    );
    manager.updateRewards(depositRewardData);
  }
}
