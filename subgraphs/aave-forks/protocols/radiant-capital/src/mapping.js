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
const RToken_1 = require("../../../generated/LendingPool/RToken");
const mapping_1 = require("../../../src/mapping");
const constants_2 = require("../../../src/constants");
const rewards_1 = require("./rewards");
const manager_1 = require("../../../src/sdk/manager");
const constants_3 = require("../../../src/sdk/constants");
const helpers_1 = require("../../../src/helpers");
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
    // No stable debt token in radiant
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
  const rTokenContract = RToken_1.RToken.bind(
    graph_ts_1.Address.fromBytes(market.outputToken)
  );
  (0, rewards_1.updateMarketRewards)(manager, event, rTokenContract);
  let assetPriceUSD = constants_2.BIGDECIMAL_ZERO;
  const tryPrice = rTokenContract.try_getAssetPrice();
  if (tryPrice.reverted) {
    graph_ts_1.log.error(
      "[handleReserveDataUpdated] Token price not found for Market {}; default to 0.0",
      [market.id.toHexString()]
    );
  } else {
    assetPriceUSD = tryPrice.value
      .toBigDecimal()
      .div((0, helpers_1.exponentToBigDecimal)(constants_1.rTOKEN_DECIMALS));
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
  (0, mapping_1._handlePaused)(getProtocolData());
}
exports.handlePaused = handlePaused;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleUnpaused(event) {
  (0, mapping_1._handleUnpaused)(getProtocolData());
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
