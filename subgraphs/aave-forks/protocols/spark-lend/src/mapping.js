"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUserEModeSet =
  exports.handleSiloedBorrowingChanged =
  exports.handleSwapBorrowRateMode =
  exports.handleStableTransfer =
  exports.handleVariableTransfer =
  exports.handleCollateralTransfer =
  exports.handleMintedToTreasury =
  exports.handleFlashloan =
  exports.handleLiquidationCall =
  exports.handleRepay =
  exports.handleBorrow =
  exports.handleWithdraw =
  exports.handleDeposit =
  exports.handleReserveUsedAsCollateralDisabled =
  exports.handleReserveUsedAsCollateralEnabled =
  exports.handleReserveDataUpdated =
  exports.handleFlashloanPremiumToProtocolUpdated =
  exports.handleFlashloanPremiumTotalUpdated =
  exports.handleLiquidationProtocolFeeChanged =
  exports.handleReserveFactorChanged =
  exports.handleReservePaused =
  exports.handleReserveFrozen =
  exports.handleReserveBorrowing =
  exports.handleReserveActive =
  exports.handleCollateralConfigurationChanged =
  exports.handleReserveInitialized =
  exports.handleAssetConfigUpdated =
  exports.handlePriceOracleUpdated =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const AaveOracle_1 = require("../../../generated/RewardsController/AaveOracle");
const LendingPool_1 = require("../../../generated/LendingPool/LendingPool");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("./constants");
const mapping_1 = require("../../../src/mapping");
const constants_2 = require("../../../src/constants");
const manager_1 = require("../../../src/sdk/manager");
const helpers_1 = require("../../../src/helpers");
const constants_3 = require("../../../src/sdk/constants");
const account_1 = require("../../../src/sdk/account");
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
////////////////////////////////////////
///// PoolAddressProvider Handlers /////
////////////////////////////////////////
function handlePriceOracleUpdated(event) {
  (0, mapping_1._handlePriceOracleUpdated)(
    event.params.newAddress,
    protocolData,
    event
  );
}
exports.handlePriceOracleUpdated = handlePriceOracleUpdated;
/////////////////////////////////////
///// RewardController Handlers /////
/////////////////////////////////////
function handleAssetConfigUpdated(event) {
  // it is not clear which market.oracle shouild we use
  // use the protocol-wide defaultOracle
  const defaultOracle = schema_1._DefaultOracle.load(protocolData.protocolID);
  let rewardTokenPriceUSD = constants_2.BIGDECIMAL_ZERO;
  if (!defaultOracle || !defaultOracle.oracle) {
    graph_ts_1.log.warning(
      "[handleAssetConfigUpdated]_DefaultOracle for {} not set; rewardTokenPriceUSD set to default 0.0",
      [protocolData.protocolID.toHexString()]
    );
  } else {
    rewardTokenPriceUSD = getAssetPriceInUSDC(
      event.params.reward,
      graph_ts_1.Address.fromBytes(defaultOracle.oracle)
    );
  }
  (0, mapping_1._handleAssetConfigUpdated)(
    event,
    event.params.asset,
    event.params.reward,
    rewardTokenPriceUSD,
    event.params.newEmission,
    event.params.newDistributionEnd,
    protocolData
  );
}
exports.handleAssetConfigUpdated = handleAssetConfigUpdated;
/////////////////////////////////////
///// PoolConfigurator Handlers /////
/////////////////////////////////////
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
function handleReserveActive(event) {
  (0, mapping_1._handleReserveActivated)(event.params.asset, protocolData);
}
exports.handleReserveActive = handleReserveActive;
function handleReserveBorrowing(event) {
  if (event.params.enabled) {
    (0, mapping_1._handleBorrowingEnabledOnReserve)(
      event.params.asset,
      protocolData
    );
  } else {
    (0, mapping_1._handleBorrowingDisabledOnReserve)(
      event.params.asset,
      protocolData
    );
  }
}
exports.handleReserveBorrowing = handleReserveBorrowing;
function handleReserveFrozen(event) {
  (0, mapping_1._handleReserveDeactivated)(event.params.asset, protocolData);
}
exports.handleReserveFrozen = handleReserveFrozen;
function handleReservePaused(event) {
  (0, mapping_1._handleReserveDeactivated)(event.params.asset, protocolData);
}
exports.handleReservePaused = handleReservePaused;
function handleReserveFactorChanged(event) {
  (0, mapping_1._handleReserveFactorChanged)(
    event.params.asset,
    event.params.newReserveFactor,
    protocolData
  );
}
exports.handleReserveFactorChanged = handleReserveFactorChanged;
function handleLiquidationProtocolFeeChanged(event) {
  (0, mapping_1._handleLiquidationProtocolFeeChanged)(
    event.params.asset,
    event.params.newFee,
    protocolData
  );
}
exports.handleLiquidationProtocolFeeChanged =
  handleLiquidationProtocolFeeChanged;
function handleFlashloanPremiumTotalUpdated(event) {
  const rate = event.params.newFlashloanPremiumTotal
    .toBigDecimal()
    .div((0, helpers_1.exponentToBigDecimal)(constants_2.INT_FOUR));
  (0, mapping_1._handleFlashloanPremiumTotalUpdated)(rate, protocolData);
}
exports.handleFlashloanPremiumTotalUpdated = handleFlashloanPremiumTotalUpdated;
function handleFlashloanPremiumToProtocolUpdated(event) {
  const rate = event.params.newFlashloanPremiumToProtocol
    .toBigDecimal()
    .div((0, helpers_1.exponentToBigDecimal)(constants_2.INT_FOUR));
  (0, mapping_1._handleFlashloanPremiumToProtocolUpdated)(rate, protocolData);
}
exports.handleFlashloanPremiumToProtocolUpdated =
  handleFlashloanPremiumToProtocolUpdated;
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
    event.params.user
  );
}
exports.handleWithdraw = handleWithdraw;
function handleBorrow(event) {
  // determine whether the borrow position is in isolated mode
  // borrow in isolated mode will have an IsolationModeTotalDebtUpdated event emitted
  // before the Borrow event
  // https://github.com/aave/aave-v3-core/blob/29ff9b9f89af7cd8255231bc5faf26c3ce0fb7ce/contracts/protocol/libraries/logic/BorrowLogic.sol#L139
  let isIsolated = false;
  const receipt = event.receipt;
  if (!receipt) {
    graph_ts_1.log.warning(
      "[handleBorrow]No receipt for tx {}; cannot set isIsolated flag",
      [event.transaction.hash.toHexString()]
    );
  } else {
    isIsolated = getIsIsolatedFlag(event);
  }
  let interestRateType = null;
  if (event.params.interestRateMode === constants_1.InterestRateMode.STABLE) {
    interestRateType = constants_3.InterestRateType.STABLE;
  } else if (
    event.params.interestRateMode === constants_1.InterestRateMode.VARIABLE
  ) {
    interestRateType = constants_3.InterestRateType.VARIABLE;
  }
  (0, mapping_1._handleBorrow)(
    event,
    event.params.amount,
    event.params.reserve,
    protocolData,
    event.params.onBehalfOf,
    interestRateType,
    isIsolated
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
  const collateralMarket = (0, helpers_1.getMarketFromToken)(
    event.params.collateralAsset,
    protocolData
  );
  if (!collateralMarket) {
    graph_ts_1.log.error(
      "[handleLiquidationCall]Failed to find market for asset {}",
      [event.params.collateralAsset.toHexString()]
    );
    return;
  }
  if (!collateralMarket._liquidationProtocolFee) {
    storeLiquidationProtocolFee(
      collateralMarket,
      event.address,
      event.params.collateralAsset
    );
  }
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
function handleMintedToTreasury(event) {
  (0, mapping_1._handleMintedToTreasury)(
    event,
    protocolData,
    event.params.reserve,
    event.params.amountMinted
  );
}
exports.handleMintedToTreasury = handleMintedToTreasury;
/////////////////////////
//// Transfer Events ////
/////////////////////////
function handleCollateralTransfer(event) {
  // determine the transfer amount because different versions of the AToken contract
  // pass discounted and undiscounted amount to Transfer() and BalanceTransfer() event
  // here we get the higher of the two amount and use it as the transfer amount
  // e.g. https://arbiscan.io/tx/0x7ee837a19f37f0f74acb75be2eb07de85adcf1fcca1b66e8d2118958ce4fe8a1#eventlog
  // logIndex 18 and 21
  let amount = event.params.value;
  const receipt = event.receipt;
  if (!receipt) {
    graph_ts_1.log.warning("[handleBorrow]No receipt for tx {}", [
      event.transaction.hash.toHexString(),
    ]);
  } else {
    const btAmount = getBalanceTransferAmount(event);
    amount = btAmount.gt(amount) ? btAmount : amount;
  }
  (0, mapping_1._handleTransfer)(
    event,
    protocolData,
    constants_3.PositionSide.COLLATERAL,
    event.params.to,
    event.params.from,
    amount
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
function handleSwapBorrowRateMode(event) {
  const interestRateMode = event.params.interestRateMode;
  if (
    ![
      constants_1.InterestRateMode.STABLE,
      constants_1.InterestRateMode.VARIABLE,
    ].includes(event.params.interestRateMode)
  ) {
    graph_ts_1.log.error(
      "[handleSwapBorrowRateMode]interestRateMode {} is not one of [{}, {}]",
      [
        interestRateMode.toString(),
        constants_1.InterestRateMode.STABLE.toString(),
        constants_1.InterestRateMode.VARIABLE.toString(),
      ]
    );
    return;
    return;
  }
  const interestRateType =
    event.params.interestRateMode === constants_1.InterestRateMode.STABLE
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
function handleSiloedBorrowingChanged(event) {
  const market = (0, helpers_1.getMarketFromToken)(
    event.params.asset,
    protocolData
  );
  if (!market) {
    graph_ts_1.log.error(
      "[handleSiloedBorrowingChanged]market not found for token {}",
      [event.params.asset.toHexString()]
    );
    return;
  }
  market._siloedBorrowing = event.params.newState;
  market.save();
}
exports.handleSiloedBorrowingChanged = handleSiloedBorrowingChanged;
function handleUserEModeSet(event) {
  const account = new account_1.AccountManager(event.params.user).getAccount();
  account._eMode = true;
  account.save();
}
exports.handleUserEModeSet = handleUserEModeSet;
///////////////////
///// Helpers /////
///////////////////
function getAssetPriceInUSDC(tokenAddress, priceOracle) {
  const oracle = AaveOracle_1.AaveOracle.bind(priceOracle);
  const baseUnit = (0, helpers_1.readValue)(
    oracle.try_BASE_CURRENCY_UNIT(),
    graph_ts_1.BigInt.fromI32(constants_3.INT_TEN).pow(
      constants_1.AAVE_DECIMALS
    )
  ).toBigDecimal();
  const oracleResult = (0, helpers_1.readValue)(
    oracle.try_getAssetPrice(tokenAddress),
    constants_2.BIGINT_ZERO
  );
  if (oracleResult.gt(constants_2.BIGINT_ZERO)) {
    return oracleResult.toBigDecimal().div(baseUnit);
  }
  // fall price oracle unimplemented
  return constants_2.BIGDECIMAL_ZERO;
}
function storeLiquidationProtocolFee(market, poolAddress, reserve) {
  // Store LiquidationProtocolFee if not set, as setLiquidationProtocolFee() may be never called
  // and no LiquidationProtocolFeeChanged event is emitted
  // see https://github.com/aave/aave-v3-core/blob/1e46f1cbb7ace08995cb4c8fa4e4ece96a243be3/contracts/protocol/libraries/configuration/ReserveConfiguration.sol#L491
  // for how to decode configuration data to get _liquidationProtocolFee
  const liquidationProtocolFeeMask =
    "0xFFFFFFFFFFFFFFFFFFFFFF0000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
  const liquidationProtocolFeeStartBitPosition = constants_3.INT_152;
  const pool = LendingPool_1.LendingPool.bind(poolAddress);
  const poolConfigData = pool.getConfiguration(reserve).data;
  const liquidationProtocolFee = decodeConfig(
    poolConfigData,
    liquidationProtocolFeeMask,
    liquidationProtocolFeeStartBitPosition
  )
    .toBigDecimal()
    .div((0, helpers_1.exponentToBigDecimal)(constants_2.INT_FOUR));
  graph_ts_1.log.info(
    "[storeLiquidationProtocolFee]market {} liquidationProtocolFee={}",
    [market.id.toHexString(), liquidationProtocolFee.toString()]
  );
  market._liquidationProtocolFee = liquidationProtocolFee;
  market.save();
}
function decodeConfig(storedData, maskStr, startBitPosition) {
  // aave-v3 stores configuration in packed bits (ReserveConfiguration.sol)
  // decoding them by applying a bit_not mask and right shift by startBitPosition
  // see https://github.com/aave/aave-v3-core/blob/1e46f1cbb7ace08995cb4c8fa4e4ece96a243be3/contracts/protocol/libraries/configuration/ReserveConfiguration.sol#L491
  // for how to decode configuration data to get _liquidationProtocolFee
  const maskArray = new Uint8Array(constants_3.INT_THIRTY_TWO);
  maskArray.set(graph_ts_1.Bytes.fromHexString(maskStr));
  // BITWISE NOT
  for (let i = 0; i < maskArray.length; i++) {
    maskArray[i] = ~maskArray[i];
  }
  // reverse for little endian
  const configMaskBigInt = graph_ts_1.BigInt.fromUnsignedBytes(
    graph_ts_1.Bytes.fromUint8Array(maskArray.reverse())
  );
  const config = storedData
    .bitAnd(configMaskBigInt)
    .rightShift(startBitPosition);
  return config;
}
function getIsIsolatedFlag(event) {
  let isIsolated = false;
  const ISOLATE_MODE = "IsolationModeTotalDebtUpdated(address,uint256)";
  const eventSignature = graph_ts_1.crypto.keccak256(
    graph_ts_1.ByteArray.fromUTF8(ISOLATE_MODE)
  );
  const logs = event.receipt.logs;
  //IsolationModeTotalDebtUpdated emitted before Borrow's event.logIndex
  // e.g. https://etherscan.io/tx/0x4b038b26555d4b6c057cd612057b39e6482a7c60eb44058ee61d299332efdf29#eventlog
  const eventLogIndex = event.logIndex;
  for (let i = 0; i < logs.length; i++) {
    const thisLog = logs[i];
    if (thisLog.topics.length > constants_2.INT_ZERO) {
      if (thisLog.logIndex.gt(eventLogIndex)) {
        // no IsolationModeTotalDebtUpdated log before Borrow
        break;
      }
      // topics[0] - signature
      const logSignature = thisLog.topics[0];
      if (thisLog.address == event.address && logSignature == eventSignature) {
        graph_ts_1.log.info(
          "[getIsIsolatedFlag]found IsolationModeTotalDebtUpdated event isolated=true tx {}",
          [event.transaction.hash.toHexString()]
        );
        isIsolated = true;
        break;
      }
    }
  }
  return isIsolated;
}
function getBalanceTransferAmount(event) {
  let btAmount = constants_2.BIGINT_ZERO;
  const BALANCE_TRANSFER =
    "BalanceTransfer(address, address, uint256, uint256)";
  const eventSignature = graph_ts_1.crypto.keccak256(
    graph_ts_1.ByteArray.fromUTF8(BALANCE_TRANSFER)
  );
  const logs = event.receipt.logs;
  // BalanceTransfer emitted after Transfer's event.logIndex
  // e.g. https://arbiscan.io/tx/0x7ee837a19f37f0f74acb75be2eb07de85adcf1fcca1b66e8d2118958ce4fe8a1#eventlog
  const eventLogIndex = event.logIndex;
  for (let i = 0; i < logs.length; i++) {
    const thisLog = logs[i];
    if (thisLog.topics.length > constants_2.INT_ZERO) {
      if (thisLog.logIndex.le(eventLogIndex)) {
        // skip event with logIndex < event.logIndex
        continue;
      }
      // topics[0] - signature
      const logSignature = thisLog.topics[0];
      if (thisLog.address == event.address && logSignature == eventSignature) {
        const UINT256_UINT256 = "(uint256,uint256)";
        const decoded = graph_ts_1.ethereum.decode(
          UINT256_UINT256,
          thisLog.data
        );
        if (!decoded) continue;
        const logData = decoded.toTuple();
        btAmount = logData[0].toBigInt();
        graph_ts_1.log.info(
          "[handleCollateralTransfer] BalanceTransfer amount= {} tx {}",
          [btAmount.toString(), event.transaction.hash.toHexString()]
        );
        break;
      }
    }
  }
  return btAmount;
}
