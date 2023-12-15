"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAbsorbCollateral =
  exports.handleTransferCollateral =
  exports.handleTransfer =
  exports.handleWithdrawCollateral =
  exports.handleWithdraw =
  exports.handleSupplyCollateral =
  exports.handleSupply =
  exports.handleUpdateAssetSupplyCap =
  exports.handleUpdateAssetPriceFeed =
  exports.handleUpdateAssetLiquidationFactor =
  exports.handleUpdateAssetLiquidateCollateralFactor =
  exports.handleUpdateAssetBorrowCollateralFactor =
  exports.handleUpdateAsset =
  exports.handleSetBaseTrackingSupplySpeed =
  exports.handleSetBaseTrackingBorrowSpeed =
  exports.handleSetBaseTokenPriceFeed =
  exports.handleAddAsset =
  exports.handleCometDeployed =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Comet_1 = require("../../../generated/templates/Comet/Comet");
const ERC20_1 = require("../../../generated/templates/Comet/ERC20");
const constants_1 = require("../../../src/sdk/constants");
const manager_1 = require("../../../src/sdk/manager");
const constants_2 = require("./constants");
const templates_1 = require("../../../generated/templates");
const schema_1 = require("../../../generated/schema");
const CometRewards_1 = require("../../../generated/templates/Comet/CometRewards");
const Chainlink_1 = require("../../../generated/Configurator/Chainlink");
const token_1 = require("../../../src/sdk/token");
const account_1 = require("../../../src/sdk/account");
const position_1 = require("../../../src/sdk/position");
///////////////////////////////
///// Configurator Events /////
///////////////////////////////
//
//
// market creation
function handleCometDeployed(event) {
  templates_1.Comet.create(event.params.cometProxy);
  // create base token market
  const cometContract = Comet_1.Comet.bind(event.params.cometProxy);
  const tryBaseToken = cometContract.try_baseToken();
  const tryBaseOracle = cometContract.try_baseTokenPriceFeed();
  const protocolData = (0, constants_2.getProtocolData)();
  const baseTokenManager = new token_1.TokenManager(
    tryBaseToken.value,
    event,
    constants_1.TokenType.REBASING
  );
  const baseToken = baseTokenManager.getToken();
  if (!tryBaseToken.reverted) {
    const baseMarketID = event.params.cometProxy.concat(tryBaseToken.value);
    const manager = new manager_1.DataManager(
      baseMarketID,
      tryBaseToken.value,
      event,
      protocolData
    );
    if (!manager.isNewMarket()) {
      return;
    }
    manager.updateBorrowIndex(constants_2.BASE_INDEX_SCALE);
    manager.updateSupplyIndex(constants_2.BASE_INDEX_SCALE);
    const market = manager.getMarket();
    market.canBorrowFrom = true;
    // update market
    market.name = constants_2.MARKET_PREFIX.concat(baseToken.symbol)
      .concat(" - ")
      .concat(baseToken.name);
    market.outputToken = baseToken.id;
    market.outputTokenSupply = constants_1.BIGINT_ZERO;
    market.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
    market.exchangeRate = constants_1.BIGDECIMAL_ONE;
    market.relation = event.params.cometProxy;
    market._baseTrackingBorrowSpeed = constants_1.BIGINT_ZERO;
    market._baseTrackingSupplySpeed = constants_1.BIGINT_ZERO;
    market.canBorrowFrom = true;
    // create base token Oracle
    if (!tryBaseOracle.reverted) {
      market.oracle = manager.getOrCreateOracle(
        tryBaseOracle.value,
        true,
        constants_1.OracleSource.CHAINLINK
      ).id;
    }
    market.save();
  }
  // create collateral token markets
  let assetIndex = 0;
  let tryAssetInfo = cometContract.try_getAssetInfo(assetIndex);
  while (!tryAssetInfo.reverted) {
    const inputTokenID = tryAssetInfo.value.asset;
    const marketID = event.params.cometProxy.concat(inputTokenID);
    const manager = new manager_1.DataManager(
      marketID,
      inputTokenID,
      event,
      protocolData
    );
    const market = manager.getMarket();
    // add unique market fields
    market.name = constants_2.MARKET_PREFIX.concat(baseToken.symbol)
      .concat(" - ")
      .concat(manager.getInputToken().name);
    market.canUseAsCollateral = true;
    market.maximumLTV = (0, constants_1.bigIntToBigDecimal)(
      tryAssetInfo.value.borrowCollateralFactor,
      constants_2.NORMALIZE_DECIMALS
    );
    market.liquidationThreshold = (0, constants_1.bigIntToBigDecimal)(
      tryAssetInfo.value.liquidateCollateralFactor,
      constants_2.NORMALIZE_DECIMALS
    );
    market.liquidationPenalty = constants_1.BIGDECIMAL_HUNDRED.minus(
      (0, constants_1.bigIntToBigDecimal)(
        tryAssetInfo.value.liquidationFactor,
        constants_2.NORMALIZE_DECIMALS
      )
    );
    market.supplyCap = tryAssetInfo.value.supplyCap;
    market.relation = event.params.cometProxy;
    // create token Oracle
    market.oracle = manager.getOrCreateOracle(
      tryAssetInfo.value.priceFeed,
      true,
      constants_1.OracleSource.CHAINLINK
    ).id;
    market.save();
    // get next asset info
    assetIndex++;
    tryAssetInfo = cometContract.try_getAssetInfo(assetIndex);
  }
}
exports.handleCometDeployed = handleCometDeployed;
//
//
// Add a new asset onto an existing market
function handleAddAsset(event) {
  const protocolData = (0, constants_2.getProtocolData)();
  const inputTokenID = event.params.assetConfig.asset;
  const marketID = event.params.cometProxy.concat(inputTokenID);
  const manager = new manager_1.DataManager(
    marketID,
    inputTokenID,
    event,
    protocolData
  );
  const market = manager.getMarket();
  // add unique market fields
  market.canUseAsCollateral = true;
  market.maximumLTV = (0, constants_1.bigIntToBigDecimal)(
    event.params.assetConfig.borrowCollateralFactor,
    constants_2.NORMALIZE_DECIMALS
  );
  market.liquidationThreshold = (0, constants_1.bigIntToBigDecimal)(
    event.params.assetConfig.liquidateCollateralFactor,
    constants_2.NORMALIZE_DECIMALS
  );
  market.liquidationPenalty = constants_1.BIGDECIMAL_HUNDRED.minus(
    (0, constants_1.bigIntToBigDecimal)(
      event.params.assetConfig.liquidationFactor,
      constants_2.NORMALIZE_DECIMALS
    )
  );
  market.supplyCap = event.params.assetConfig.supplyCap;
  market.relation = event.params.cometProxy;
  // create token Oracle
  market.oracle = manager.getOrCreateOracle(
    event.params.assetConfig.priceFeed,
    true,
    constants_1.OracleSource.CHAINLINK
  ).id;
  market.save();
}
exports.handleAddAsset = handleAddAsset;
//
//
// Update the price feed for the base token
function handleSetBaseTokenPriceFeed(event) {
  const cometContract = Comet_1.Comet.bind(event.params.cometProxy);
  const tryBaseToken = cometContract.try_baseToken();
  if (tryBaseToken.reverted) {
    graph_ts_1.log.error(
      "[handleSetBaseTokenPriceFeed] Base token not found for comet: {}",
      [event.params.cometProxy.toHexString()]
    );
    return;
  }
  const marketID = event.params.cometProxy.concat(tryBaseToken.value);
  const manager = new manager_1.DataManager(
    marketID,
    tryBaseToken.value,
    event,
    (0, constants_2.getProtocolData)()
  );
  manager.getOrCreateOracle(
    event.params.newBaseTokenPriceFeed,
    true,
    constants_1.OracleSource.CHAINLINK
  );
}
exports.handleSetBaseTokenPriceFeed = handleSetBaseTokenPriceFeed;
//
//
// Update the reward borrow speed
function handleSetBaseTrackingBorrowSpeed(event) {
  const cometContract = Comet_1.Comet.bind(event.params.cometProxy);
  const tryBaseToken = cometContract.try_baseToken();
  if (tryBaseToken.reverted) {
    graph_ts_1.log.error(
      "[handleSetBaseTrackingBorrowSpeed] Base token not found for comet: {}",
      [event.params.cometProxy.toHexString()]
    );
    return;
  } else {
    graph_ts_1.log.warning("base speed; {}", [
      event.params.newBaseTrackingBorrowSpeed.toString(),
    ]);
  }
  const marketID = event.params.cometProxy.concat(tryBaseToken.value);
  const manager = new manager_1.DataManager(
    marketID,
    tryBaseToken.value,
    event,
    (0, constants_2.getProtocolData)()
  );
  const market = manager.getMarket();
  market._baseTrackingBorrowSpeed = event.params.newBaseTrackingBorrowSpeed;
  market.save();
  updateRewards(manager, event.address, event);
}
exports.handleSetBaseTrackingBorrowSpeed = handleSetBaseTrackingBorrowSpeed;
//
//
// Update the reward supply speed
function handleSetBaseTrackingSupplySpeed(event) {
  const cometContract = Comet_1.Comet.bind(event.params.cometProxy);
  const tryBaseToken = cometContract.try_baseToken();
  if (tryBaseToken.reverted) {
    graph_ts_1.log.error(
      "[handleSetBaseTrackingBorrowSpeed] Base token not found for comet: {}",
      [event.params.cometProxy.toHexString()]
    );
    return;
  }
  const marketID = event.params.cometProxy.concat(tryBaseToken.value);
  const manager = new manager_1.DataManager(
    marketID,
    tryBaseToken.value,
    event,
    (0, constants_2.getProtocolData)()
  );
  const market = manager.getMarket();
  market._baseTrackingSupplySpeed = event.params.newBaseTrackingSupplySpeed;
  market.save();
  updateRewards(manager, event.address, event);
}
exports.handleSetBaseTrackingSupplySpeed = handleSetBaseTrackingSupplySpeed;
//
//
// Update the AssetConfig for an existing asset
function handleUpdateAsset(event) {
  const marketID = event.params.cometProxy.concat(
    event.params.newAssetConfig.asset
  );
  const manager = new manager_1.DataManager(
    marketID,
    event.params.newAssetConfig.asset,
    event,
    (0, constants_2.getProtocolData)()
  );
  const market = manager.getMarket();
  // update market fields
  market.canUseAsCollateral = true;
  market.maximumLTV = (0, constants_1.bigIntToBigDecimal)(
    event.params.newAssetConfig.borrowCollateralFactor,
    constants_2.NORMALIZE_DECIMALS
  );
  market.liquidationThreshold = (0, constants_1.bigIntToBigDecimal)(
    event.params.newAssetConfig.liquidateCollateralFactor,
    constants_2.NORMALIZE_DECIMALS
  );
  market.liquidationPenalty = constants_1.BIGDECIMAL_HUNDRED.minus(
    (0, constants_1.bigIntToBigDecimal)(
      event.params.newAssetConfig.liquidationFactor,
      constants_2.NORMALIZE_DECIMALS
    )
  );
  market.supplyCap = event.params.newAssetConfig.supplyCap;
  market.save();
}
exports.handleUpdateAsset = handleUpdateAsset;
//
//
// Update the borrow collateral factor on a given collateral asset
function handleUpdateAssetBorrowCollateralFactor(event) {
  const marketID = event.params.cometProxy.concat(event.params.asset);
  const manager = new manager_1.DataManager(
    marketID,
    event.params.asset,
    event,
    (0, constants_2.getProtocolData)()
  );
  const market = manager.getMarket();
  market.maximumLTV = (0, constants_1.bigIntToBigDecimal)(
    event.params.newBorrowCF,
    constants_2.NORMALIZE_DECIMALS
  );
  market.save();
}
exports.handleUpdateAssetBorrowCollateralFactor =
  handleUpdateAssetBorrowCollateralFactor;
//
//
// Update the liquidate collateral factor on a given collateral asset
function handleUpdateAssetLiquidateCollateralFactor(event) {
  const marketID = event.params.cometProxy.concat(event.params.asset);
  const manager = new manager_1.DataManager(
    marketID,
    event.params.asset,
    event,
    (0, constants_2.getProtocolData)()
  );
  const market = manager.getMarket();
  market.liquidationThreshold = (0, constants_1.bigIntToBigDecimal)(
    event.params.newLiquidateCF,
    constants_2.NORMALIZE_DECIMALS
  );
  market.save();
}
exports.handleUpdateAssetLiquidateCollateralFactor =
  handleUpdateAssetLiquidateCollateralFactor;
//
//
// Update the liquidation factor on a given collateral asset
function handleUpdateAssetLiquidationFactor(event) {
  const marketID = event.params.cometProxy.concat(event.params.asset);
  const manager = new manager_1.DataManager(
    marketID,
    event.params.asset,
    event,
    (0, constants_2.getProtocolData)()
  );
  const market = manager.getMarket();
  market.liquidationPenalty = constants_1.BIGDECIMAL_HUNDRED.minus(
    (0, constants_1.bigIntToBigDecimal)(
      event.params.newLiquidationFactor,
      constants_2.NORMALIZE_DECIMALS
    )
  );
  market.save();
}
exports.handleUpdateAssetLiquidationFactor = handleUpdateAssetLiquidationFactor;
//
//
// Update the price feed for a collateral asset
function handleUpdateAssetPriceFeed(event) {
  const marketID = event.params.cometProxy.concat(event.params.asset);
  const manager = new manager_1.DataManager(
    marketID,
    event.params.asset,
    event,
    (0, constants_2.getProtocolData)()
  );
  manager.getOrCreateOracle(
    event.params.newPriceFeed,
    true,
    constants_1.OracleSource.CHAINLINK
  );
}
exports.handleUpdateAssetPriceFeed = handleUpdateAssetPriceFeed;
//
//
// Update the supply cap for a given collateral asset
function handleUpdateAssetSupplyCap(event) {
  const marketID = event.params.cometProxy.concat(event.params.asset);
  const manager = new manager_1.DataManager(
    marketID,
    event.params.asset,
    event,
    (0, constants_2.getProtocolData)()
  );
  const market = manager.getMarket();
  market.supplyCap = event.params.newSupplyCap;
  market.save();
}
exports.handleUpdateAssetSupplyCap = handleUpdateAssetSupplyCap;
////////////////////////
///// Comet Events /////
////////////////////////
//
//
// Supplying the base token (could be a Deposit or Repay)
function handleSupply(event) {
  const cometContract = Comet_1.Comet.bind(event.address);
  const tryBaseToken = cometContract.try_baseToken();
  const marketID = event.address.concat(tryBaseToken.value);
  const market = new manager_1.DataManager(
    marketID,
    tryBaseToken.value,
    event,
    (0, constants_2.getProtocolData)()
  );
  const accountID = event.params.dst;
  const accountActorID = event.params.from;
  const amount = event.params.amount;
  const token = market.getInputToken();
  updateMarketData(market);
  updateRevenue(market, event.address);
  updateRewards(market, event.address, event);
  const mintAmount = isMint(event);
  if (!mintAmount) {
    // Repay only
    createBaseTokenTransactions(
      cometContract,
      market,
      token,
      accountID,
      amount,
      constants_1.TransactionType.REPAY,
      constants_1.PositionSide.BORROWER,
      accountActorID
    );
  } else if (mintAmount.ge(amount)) {
    // deposit only
    createBaseTokenTransactions(
      cometContract,
      market,
      token,
      accountID,
      amount,
      constants_1.TransactionType.DEPOSIT,
      constants_1.PositionSide.COLLATERAL,
      accountActorID
    );
  } else {
    // mintAmount > amount
    // partial deposit and partial repay
    const repayAmount = amount.minus(mintAmount);
    const depositAmount = amount.minus(repayAmount);
    createBaseTokenTransactions(
      cometContract,
      market,
      token,
      accountID,
      repayAmount,
      constants_1.TransactionType.REPAY,
      constants_1.PositionSide.BORROWER,
      accountActorID
    );
    createBaseTokenTransactions(
      cometContract,
      market,
      token,
      accountID,
      depositAmount,
      constants_1.TransactionType.DEPOSIT,
      constants_1.PositionSide.COLLATERAL,
      accountActorID
    );
  }
}
exports.handleSupply = handleSupply;
//
//
// Supplying collateral tokens
function handleSupplyCollateral(event) {
  const marketID = event.address.concat(event.params.asset);
  const market = new manager_1.DataManager(
    marketID,
    event.params.asset,
    event,
    (0, constants_2.getProtocolData)()
  );
  const accountID = event.params.dst;
  const accountActorID = event.params.from;
  const asset = event.params.asset;
  const amount = event.params.amount;
  const token = market.getInputToken();
  updateMarketData(market);
  updateRevenue(market, event.address);
  updateRewards(market, event.address, event);
  const cometContract = Comet_1.Comet.bind(event.address);
  const supplyBalance = getUserBalance(cometContract, accountID, asset);
  const deposit = market.createDeposit(
    asset,
    accountID,
    amount,
    (0, constants_1.bigIntToBigDecimal)(amount, token.decimals).times(
      token.lastPriceUSD
    ),
    supplyBalance
  );
  deposit.accountActor = accountActorID;
  deposit.save();
}
exports.handleSupplyCollateral = handleSupplyCollateral;
//
//
// withdraws baseToken (could be a Withdrawal or Borrow)
function handleWithdraw(event) {
  const cometContract = Comet_1.Comet.bind(event.address);
  const tryBaseToken = cometContract.try_baseToken();
  const marketID = event.address.concat(tryBaseToken.value);
  const market = new manager_1.DataManager(
    marketID,
    tryBaseToken.value,
    event,
    (0, constants_2.getProtocolData)()
  );
  const accountID = event.params.src;
  const accountActorID = event.params.to;
  const amount = event.params.amount;
  const token = market.getInputToken();
  updateMarketData(market);
  updateRevenue(market, event.address);
  updateRewards(market, event.address, event);
  const burnAmount = isBurn(event);
  if (!burnAmount) {
    // Borrow only
    createBaseTokenTransactions(
      cometContract,
      market,
      token,
      accountID,
      amount,
      constants_1.TransactionType.BORROW,
      constants_1.PositionSide.BORROWER,
      accountActorID
    );
  } else if (burnAmount.ge(amount)) {
    // withdraw only
    createBaseTokenTransactions(
      cometContract,
      market,
      token,
      accountID,
      amount,
      constants_1.TransactionType.WITHDRAW,
      constants_1.PositionSide.COLLATERAL,
      accountActorID
    );
  } else {
    // burnAmount < amount
    // partial withdraw and partial borrow
    const borrowAmount = amount.minus(burnAmount);
    const withdrawAmount = amount.minus(borrowAmount);
    createBaseTokenTransactions(
      cometContract,
      market,
      token,
      accountID,
      borrowAmount,
      constants_1.TransactionType.BORROW,
      constants_1.PositionSide.BORROWER,
      accountActorID
    );
    createBaseTokenTransactions(
      cometContract,
      market,
      token,
      accountID,
      withdrawAmount,
      constants_1.TransactionType.WITHDRAW,
      constants_1.PositionSide.COLLATERAL,
      accountActorID
    );
  }
}
exports.handleWithdraw = handleWithdraw;
//
//
// Withdraw collateral tokens (cannot be a Borrow)
function handleWithdrawCollateral(event) {
  const marketID = event.address.concat(event.params.asset);
  const market = new manager_1.DataManager(
    marketID,
    event.params.asset,
    event,
    (0, constants_2.getProtocolData)()
  );
  const accountID = event.params.src;
  const accountActorID = event.params.to;
  const asset = event.params.asset;
  const amount = event.params.amount;
  const token = market.getInputToken();
  updateMarketData(market);
  updateRevenue(market, event.address);
  updateRewards(market, event.address, event);
  const cometContract = Comet_1.Comet.bind(event.address);
  const supplyBalance = getUserBalance(cometContract, accountID, asset);
  const withdraw = market.createWithdraw(
    asset,
    accountID,
    amount,
    (0, constants_1.bigIntToBigDecimal)(amount, token.decimals).times(
      token.lastPriceUSD
    ),
    supplyBalance
  );
  if (withdraw) {
    withdraw.accountActor = accountActorID;
    withdraw.save();
  }
}
exports.handleWithdrawCollateral = handleWithdrawCollateral;
//
//
// Transfer user base tokens to another account
// Note: this will only catch transfer function calls where both transfer's are emitted
function handleTransfer(event) {
  const supplyLog = findTransfer(event);
  if (!supplyLog) {
    // second transfer does not exist
    return;
  }
  const fromAddress = graph_ts_1.ethereum
    .decode("address", supplyLog.topics.at(1))
    .toAddress();
  if (
    fromAddress != constants_2.ZERO_ADDRESS ||
    event.address != supplyLog.address
  ) {
    // must be a transfer from the same comet
    // not apart of transferBase() since from address is not null
    return;
  }
  // transfer amounts may not be equal so we will act like this is a base token withdraw / supply
  const cometContract = Comet_1.Comet.bind(event.address);
  const tryBaseToken = cometContract.try_baseToken();
  const marketID = event.address.concat(tryBaseToken.value);
  const market = new manager_1.DataManager(
    marketID,
    tryBaseToken.value,
    event,
    (0, constants_2.getProtocolData)()
  );
  let amount = event.params.amount;
  const token = market.getInputToken();
  updateMarketData(market);
  updateRevenue(market, event.address);
  updateRewards(market, event.address, event);
  let newBalance = getUserBalance(
    cometContract,
    event.params.from,
    null,
    constants_1.PositionSide.COLLATERAL
  );
  market.createWithdraw(
    tryBaseToken.value,
    event.params.from,
    amount,
    amount
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(token.decimals))
      .times(token.lastPriceUSD),
    newBalance,
    constants_1.InterestRateType.VARIABLE,
    getPrincipal(event.params.from, cometContract)
  );
  amount = graph_ts_1.ethereum.decode("uint256", supplyLog.data).toBigInt();
  const toAddress = graph_ts_1.ethereum
    .decode("address", supplyLog.topics.at(2))
    .toAddress();
  newBalance = getUserBalance(
    cometContract,
    toAddress,
    null,
    constants_1.PositionSide.COLLATERAL
  );
  market.createDeposit(
    tryBaseToken.value,
    toAddress,
    amount,
    amount
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(token.decimals))
      .times(token.lastPriceUSD),
    newBalance,
    constants_1.InterestRateType.VARIABLE,
    getPrincipal(toAddress, cometContract)
  );
}
exports.handleTransfer = handleTransfer;
//
//
// Transfer user collateral to another account
function handleTransferCollateral(event) {
  const marketID = event.address.concat(event.params.asset);
  const market = new manager_1.DataManager(
    marketID,
    event.params.asset,
    event,
    (0, constants_2.getProtocolData)()
  );
  const sender = event.params.from;
  const receiver = event.params.to;
  const asset = event.params.asset;
  const amount = event.params.amount;
  const token = market.getInputToken();
  updateMarketData(market);
  // no revenue accrued during this event
  updateRewards(market, event.address, event);
  const cometContract = Comet_1.Comet.bind(event.address);
  const senderBalance = getUserBalance(cometContract, sender, asset);
  const receiverBalance = getUserBalance(cometContract, receiver, asset);
  market.createTransfer(
    asset,
    sender,
    receiver,
    amount,
    (0, constants_1.bigIntToBigDecimal)(amount, token.decimals).times(
      token.lastPriceUSD
    ),
    senderBalance,
    receiverBalance
  );
}
exports.handleTransferCollateral = handleTransferCollateral;
//
//
// Sell liquidated collateral at a discount (of liquidation penalty)
function handleAbsorbCollateral(event) {
  const marketID = event.address.concat(event.params.asset);
  const market = new manager_1.DataManager(
    marketID,
    event.params.asset,
    event,
    (0, constants_2.getProtocolData)()
  );
  const marketEntity = market.getMarket();
  const cometContract = Comet_1.Comet.bind(event.address);
  const liquidator = event.params.absorber;
  const borrower = event.params.borrower;
  const baseAsset = cometContract.baseToken();
  const amount = event.params.collateralAbsorbed;
  const amountUSD = (0, constants_1.bigIntToBigDecimal)(
    event.params.usdValue,
    constants_2.COMPOUND_DECIMALS
  );
  const liquidationPenalty = marketEntity.liquidationPenalty.div(
    constants_1.BIGDECIMAL_HUNDRED
  );
  const profitUSD = amountUSD.times(liquidationPenalty);
  updateMarketData(market);
  updateRevenue(market, event.address);
  updateRewards(market, event.address, event);
  const collateralBalance = getUserBalance(
    cometContract,
    borrower,
    event.params.asset,
    constants_1.PositionSide.COLLATERAL
  );
  const liquidate = market.createLiquidate(
    event.params.asset,
    liquidator,
    borrower,
    amount,
    amountUSD,
    profitUSD,
    collateralBalance
  );
  if (!liquidate) return;
  const positions = liquidate.positions;
  // update liquidatee base asset borrow position
  const liquidateeAcct = new account_1.AccountManager(borrower);
  const baseAssetBorrowBalance = getUserBalance(
    cometContract,
    borrower,
    null,
    constants_1.PositionSide.BORROWER
  );
  const priceUSD = getPrice(cometContract.baseTokenPriceFeed(), cometContract);
  const baseMarketID = event.address.concat(baseAsset);
  const baseMarket = new manager_1.DataManager(
    baseMarketID,
    baseAsset,
    event,
    (0, constants_2.getProtocolData)()
  );
  const liquidateePosition = new position_1.PositionManager(
    liquidateeAcct.getAccount(),
    baseMarket.getMarket(),
    constants_1.PositionSide.BORROWER,
    constants_1.InterestRateType.VARIABLE
  );
  liquidateePosition.subtractPosition(
    event,
    baseMarket.getProtocol(),
    baseAssetBorrowBalance,
    constants_1.TransactionType.LIQUIDATE,
    priceUSD,
    getPrincipal(borrower, cometContract)
  );
  const positionID = liquidateePosition.getPositionID();
  if (!positionID) return;
  positions.push(positionID);
  liquidate.positions = positions;
  liquidate.save();
}
exports.handleAbsorbCollateral = handleAbsorbCollateral;
///////////////////
///// Helpers /////
///////////////////
function createBaseTokenTransactions(
  comet,
  market,
  token,
  accountID,
  amount,
  transactionType,
  positionSide,
  accountActorID
) {
  const principal = getPrincipal(accountID, comet);
  const newBalance = getUserBalance(comet, accountID, null, positionSide);
  if (transactionType == constants_1.TransactionType.DEPOSIT) {
    const deposit = market.createDeposit(
      token.id,
      accountID,
      amount,
      (0, constants_1.bigIntToBigDecimal)(amount, token.decimals).times(
        token.lastPriceUSD
      ),
      newBalance,
      constants_1.InterestRateType.VARIABLE,
      principal
    );
    deposit.accountActor = accountActorID;
    deposit.save();
  }
  if (transactionType == constants_1.TransactionType.WITHDRAW) {
    const withdraw = market.createWithdraw(
      token.id,
      accountID,
      amount,
      (0, constants_1.bigIntToBigDecimal)(amount, token.decimals).times(
        token.lastPriceUSD
      ),
      newBalance,
      constants_1.InterestRateType.VARIABLE,
      principal
    );
    if (withdraw) {
      withdraw.accountActor = accountActorID;
      withdraw.save();
    }
  }
  if (transactionType == constants_1.TransactionType.BORROW) {
    const borrow = market.createBorrow(
      token.id,
      accountID,
      amount,
      (0, constants_1.bigIntToBigDecimal)(amount, token.decimals).times(
        token.lastPriceUSD
      ),
      newBalance,
      token.lastPriceUSD,
      constants_1.InterestRateType.VARIABLE,
      principal
    );
    borrow.accountActor = accountActorID;
    borrow.save();
  }
  if (transactionType == constants_1.TransactionType.REPAY) {
    const repay = market.createRepay(
      token.id,
      accountID,
      amount,
      (0, constants_1.bigIntToBigDecimal)(amount, token.decimals).times(
        token.lastPriceUSD
      ),
      newBalance,
      token.lastPriceUSD,
      constants_1.InterestRateType.VARIABLE,
      principal
    );
    if (repay) {
      repay.accountActor = accountActorID;
      repay.save();
    }
  }
}
//
//
// Get user balance
// leave asset empty if base token, but then you must provide a side
function getUserBalance(comet, account, asset = null, positionSide = null) {
  if (asset) {
    const tryBalance = comet.try_userCollateral(account, asset);
    return tryBalance.reverted
      ? constants_1.BIGINT_ZERO
      : tryBalance.value.value0;
  } else {
    if (positionSide == constants_1.PositionSide.COLLATERAL) {
      const tryBalance = comet.try_balanceOf(account);
      return tryBalance.reverted ? constants_1.BIGINT_ZERO : tryBalance.value;
    }
    if (positionSide == constants_1.PositionSide.BORROWER) {
      const tryBorrowBalance = comet.try_borrowBalanceOf(account);
      return tryBorrowBalance.reverted
        ? constants_1.BIGINT_ZERO
        : tryBorrowBalance.value;
    }
    return constants_1.BIGINT_ZERO;
  }
}
function updateRewards(dataManager, cometAddress, event) {
  const cometContract = Comet_1.Comet.bind(cometAddress);
  const tryTrackingIndexScale = cometContract.try_trackingIndexScale();
  const market = dataManager.getMarket();
  const tryBaseToken = cometContract.try_baseToken();
  if (tryBaseToken.reverted) {
    graph_ts_1.log.error("[updateRewards] Could not get base token", []);
    return;
  }
  // skip rewards calc if not base token market
  if (dataManager.getInputToken().id != tryBaseToken.value) {
    return;
  }
  const rewardContract = CometRewards_1.CometRewards.bind(
    (0, constants_2.getRewardAddress)()
  );
  const tryRewardConfig = rewardContract.try_rewardConfig(cometAddress);
  if (tryTrackingIndexScale.reverted || tryRewardConfig.reverted) {
    graph_ts_1.log.warning(
      "[updateRewards] Contract call(s) reverted on market: {}",
      [market.id.toHexString()]
    );
    return;
  }
  const tryBaseTrackingBorrow = cometContract.try_baseTrackingBorrowSpeed();
  const tryBaseTrackingSupply = cometContract.try_baseTrackingSupplySpeed();
  if (tryBaseTrackingBorrow.reverted || tryBaseTrackingSupply.reverted) {
    graph_ts_1.log.error(
      "[updateRewards] Contract call on base tracking speed failed on market: {}",
      [market.id.toHexString()]
    );
  }
  if (tryRewardConfig.value.value0 == constants_2.ZERO_ADDRESS) {
    graph_ts_1.log.warning(
      "[updateRewards] Reward token address is zero address",
      []
    );
    return;
  }
  const rewardToken = new token_1.TokenManager(
    tryRewardConfig.value.value0,
    event
  );
  // Update price for reward token using Chainlink oracle on Polygon
  if (
    (0, constants_2.equalsIgnoreCase)(
      graph_ts_1.dataSource.network(),
      constants_1.Network.MATIC
    ) ||
    (0, constants_2.equalsIgnoreCase)(
      graph_ts_1.dataSource.network(),
      constants_1.Network.ARBITRUM_ONE
    )
  ) {
    const chainlinkContract = Chainlink_1.Chainlink.bind(
      (0, constants_2.getCOMPChainlinkFeed)(graph_ts_1.dataSource.network())
    );
    const tryPrice = chainlinkContract.try_latestAnswer();
    if (tryPrice.reverted) {
      graph_ts_1.log.error(
        "[updateRewards] Chainlink price reverted on transaction: {}",
        [event.transaction.hash.toHexString()]
      );
    } else {
      rewardToken.updatePrice(
        (0, constants_1.bigIntToBigDecimal)(
          tryPrice.value,
          constants_2.COMPOUND_DECIMALS
        )
      );
    }
  }
  const decimals = rewardToken.getDecimals();
  const borrowRewardToken = rewardToken.getOrCreateRewardToken(
    constants_1.RewardTokenType.VARIABLE_BORROW
  );
  const supplyRewardToken = rewardToken.getOrCreateRewardToken(
    constants_1.RewardTokenType.DEPOSIT
  );
  market._baseTrackingBorrowSpeed = tryBaseTrackingBorrow.value;
  market._baseTrackingSupplySpeed = tryBaseTrackingSupply.value;
  market.save();
  // Reward tokens emitted per day as follows:
  // tokens/day = (speed * SECONDS_PER_DAY) / trackingIndexScale
  const borrowRewardPerDay = graph_ts_1.BigInt.fromString(
    market._baseTrackingBorrowSpeed
      .times(graph_ts_1.BigInt.fromI64(constants_1.SECONDS_PER_DAY))
      .div(tryTrackingIndexScale.value)
      .toBigDecimal()
      .times((0, constants_1.exponentToBigDecimal)(decimals))
      .truncate(0)
      .toString()
  );
  const supplyRewardPerDay = graph_ts_1.BigInt.fromString(
    market._baseTrackingSupplySpeed
      .times(graph_ts_1.BigInt.fromI64(constants_1.SECONDS_PER_DAY))
      .div(tryTrackingIndexScale.value)
      .toBigDecimal()
      .times((0, constants_1.exponentToBigDecimal)(decimals))
      .truncate(0)
      .toString()
  );
  const supplyRewardPerDayUSD = (0, constants_1.bigIntToBigDecimal)(
    supplyRewardPerDay,
    decimals
  ).times(rewardToken.getPriceUSD());
  const borrowRewardPerDayUSD = (0, constants_1.bigIntToBigDecimal)(
    borrowRewardPerDay,
    decimals
  ).times(rewardToken.getPriceUSD());
  dataManager.updateRewards(
    new manager_1.RewardData(
      borrowRewardToken,
      borrowRewardPerDay,
      borrowRewardPerDayUSD
    )
  );
  dataManager.updateRewards(
    new manager_1.RewardData(
      supplyRewardToken,
      supplyRewardPerDay,
      supplyRewardPerDayUSD
    )
  );
}
//
//
// update revenue (only can update base token market revenue)
function updateRevenue(dataManager, cometAddress) {
  const cometContract = Comet_1.Comet.bind(cometAddress);
  const inputToken = dataManager.getInputToken();
  if (cometContract.baseToken() != inputToken.id) {
    graph_ts_1.log.info(
      "[updateRevenue] Cannot update revenue for non-base token market",
      []
    );
    return;
  }
  const market = dataManager.getMarket();
  const tryTotalsBasic = cometContract.try_totalsBasic();
  if (tryTotalsBasic.reverted) {
    graph_ts_1.log.error("[updateRevenue] Could not get totalBasics()", []);
    return;
  }
  // the reserve factor is dynamic and is essentially
  // the spread between supply and borrow interest rates
  // reserveFactor = (borrowRate - supplyRate) / borrowRate
  const utilization = cometContract.getUtilization();
  const borrowRate = cometContract.getBorrowRate(utilization).toBigDecimal();
  const supplyRate = cometContract.getSupplyRate(utilization).toBigDecimal();
  if (borrowRate.lt(supplyRate)) {
    graph_ts_1.log.warning(
      "[updateRevenue] Borrow rate is less than supply rate at transaction: {}",
      [dataManager.event.transaction.hash.toHexString()]
    );
    return;
  }
  const reserveFactor = borrowRate.minus(supplyRate).div(borrowRate);
  market.reserveFactor = reserveFactor;
  market.save();
  const newBaseBorrowIndex = tryTotalsBasic.value.baseBorrowIndex;
  if (
    newBaseBorrowIndex.lt(market.borrowIndex) ||
    newBaseBorrowIndex == constants_2.BASE_INDEX_SCALE
  ) {
    graph_ts_1.log.error(
      "[updateRevenue] New base borrow index is less than old on market {}",
      [market.id.toHexString()]
    );
    return;
  }
  const totalBorrowBase = tryTotalsBasic.value.totalBorrowBase;
  const baseBorrowIndexDiff = newBaseBorrowIndex.minus(market.borrowIndex);
  dataManager.updateBorrowIndex(newBaseBorrowIndex);
  dataManager.updateSupplyIndex(tryTotalsBasic.value.baseSupplyIndex);
  const totalRevenueDeltaUSD = baseBorrowIndexDiff
    .toBigDecimal()
    .div(constants_2.BASE_INDEX_SCALE.toBigDecimal())
    .times(
      (0, constants_1.bigIntToBigDecimal)(totalBorrowBase, inputToken.decimals)
    )
    .times(inputToken.lastPriceUSD);
  const protocolRevenueDeltaUSD = totalRevenueDeltaUSD.times(reserveFactor);
  const supplySideRevenueDeltaUSD = totalRevenueDeltaUSD.minus(
    protocolRevenueDeltaUSD
  );
  const fee = dataManager.getOrUpdateFee(constants_1.FeeType.PROTOCOL_FEE);
  dataManager.addSupplyRevenue(supplySideRevenueDeltaUSD, fee);
  dataManager.addProtocolRevenue(protocolRevenueDeltaUSD, fee);
}
//
//
// Updates market TVL, borrows, prices, reserves
function updateMarketData(dataManager) {
  const market = dataManager.getMarket();
  const cometContract = Comet_1.Comet.bind(
    graph_ts_1.Address.fromBytes(market.relation)
  );
  const baseToken = cometContract.baseToken();
  const inputTokenPriceUSD = getPrice(
    dataManager.getOracleAddress(),
    cometContract
  );
  if (market.inputToken == baseToken) {
    // update base token market data
    const tryTotalSupply = cometContract.try_totalSupply();
    const tryTotalBorrow = cometContract.try_totalBorrow();
    // update reserves
    const tryReserves = cometContract.try_getReserves();
    let reservesBI = constants_1.BIGINT_ZERO;
    if (!tryReserves.reverted) {
      reservesBI = tryReserves.value;
    }
    dataManager.updateMarketAndProtocolData(
      inputTokenPriceUSD,
      tryTotalSupply.reverted ? constants_1.BIGINT_ZERO : tryTotalSupply.value,
      tryTotalBorrow.reverted ? constants_1.BIGINT_ZERO : tryTotalBorrow.value,
      null,
      reservesBI
    );
    // update rates
    const utilization = cometContract.getUtilization();
    const supplyRate = cometContract.getSupplyRate(utilization);
    const borrowRate = cometContract.getBorrowRate(utilization);
    dataManager.getOrUpdateRate(
      constants_1.InterestRateSide.BORROWER,
      constants_1.InterestRateType.VARIABLE,
      (0, constants_1.bigIntToBigDecimal)(
        borrowRate,
        constants_2.DEFAULT_DECIMALS
      )
        .times(
          graph_ts_1.BigDecimal.fromString(
            constants_1.SECONDS_PER_YEAR.toString()
          )
        )
        .times(constants_1.BIGDECIMAL_HUNDRED)
    );
    dataManager.getOrUpdateRate(
      constants_1.InterestRateSide.LENDER,
      constants_1.InterestRateType.VARIABLE,
      (0, constants_1.bigIntToBigDecimal)(
        supplyRate,
        constants_2.DEFAULT_DECIMALS
      )
        .times(
          graph_ts_1.BigDecimal.fromString(
            constants_1.SECONDS_PER_YEAR.toString()
          )
        )
        .times(constants_1.BIGDECIMAL_HUNDRED)
    );
  } else {
    // update collateral token market data
    const collateralERC20 = ERC20_1.ERC20.bind(
      graph_ts_1.Address.fromBytes(market.inputToken)
    );
    const tryBalance = collateralERC20.try_balanceOf(
      graph_ts_1.Address.fromBytes(market.relation)
    );
    // update reserves
    const tryReserves = cometContract.try_getCollateralReserves(
      graph_ts_1.Address.fromBytes(market.inputToken)
    );
    dataManager.updateMarketAndProtocolData(
      inputTokenPriceUSD,
      tryBalance.reverted ? constants_1.BIGINT_ZERO : tryBalance.value,
      null,
      null,
      tryReserves.reverted ? constants_1.BIGINT_ZERO : tryReserves.value
    );
  }
}
function getPrice(priceFeed, cometContract) {
  const tryPrice = cometContract.try_getPrice(priceFeed);
  if (tryPrice.reverted) {
    return constants_1.BIGDECIMAL_ZERO;
  }
  // The WETH market was deployed at block 16400710: https://etherscan.io/tx/0xfd5e08c8c8a524fcfa3f481b452067d41033644175bc5c3be6a8397847df27fa
  // In this market the price is returned in ETH, so we need to convert to USD
  // Comet address: 0xA17581A9E3356d9A858b789D68B4d866e593aE94
  if (
    cometContract._address ==
    graph_ts_1.Address.fromHexString(constants_2.WETH_COMET_ADDRESS)
  ) {
    const wethPriceUSD = getWETHPriceUSD();
    return (0, constants_1.bigIntToBigDecimal)(
      tryPrice.value,
      constants_2.COMPOUND_DECIMALS
    ).times(wethPriceUSD);
  }
  return (0, constants_1.bigIntToBigDecimal)(
    tryPrice.value,
    constants_2.COMPOUND_DECIMALS
  );
}
// get the price of WETH in USD on Mainnet
function getWETHPriceUSD() {
  const market = schema_1.Market.load(
    graph_ts_1.Bytes.fromHexString(constants_2.USDC_COMET_WETH_MARKET_ID)
  );
  if (!market) {
    return constants_1.BIGDECIMAL_ZERO;
  }
  return market.inputTokenPriceUSD;
}
function isMint(event) {
  const transfer = findTransfer(event);
  if (!transfer) {
    // ie, this event is a Deposit (not a Repay)
    return null;
  }
  const fromAddress = graph_ts_1.ethereum
    .decode("address", transfer.topics.at(1))
    .toAddress();
  if (
    fromAddress != constants_2.ZERO_ADDRESS ||
    event.address != transfer.address
  ) {
    // coincidence that there is a transfer, must be a mint from the same comet
    return null;
  }
  // return transfer amount
  return graph_ts_1.ethereum.decode("uint256", transfer.data).toBigInt();
}
function isBurn(event) {
  const transfer = findTransfer(event);
  if (!transfer) {
    // ie, this event is a Withdrawal (not a Borrow)
    return null;
  }
  const toAddress = graph_ts_1.ethereum
    .decode("address", transfer.topics.at(2))
    .toAddress();
  if (
    toAddress != constants_2.ZERO_ADDRESS ||
    event.address != transfer.address
  ) {
    // coincidence that there is a transfer, must be a burn from the same comet
    return null;
  }
  // return transfer amount
  return graph_ts_1.ethereum.decode("uint256", transfer.data).toBigInt();
}
//
//
// Find and return transfer (as long as it is one index after the handled event)
function findTransfer(event) {
  if (!event.receipt) {
    graph_ts_1.log.error("[findTransfer] No receipt found for event: {}", [
      event.transaction.hash.toHexString(),
    ]);
    return null;
  }
  const logs = event.receipt.logs;
  const transferLogIndex = event.logIndex.plus(constants_1.BIGINT_ONE); // expected index
  for (let i = 0; i < logs.length; i++) {
    const thisLog = logs[i];
    const logSignature = thisLog.topics[0];
    if (
      transferLogIndex.equals(thisLog.logIndex) &&
      logSignature == constants_2.ENCODED_TRANSFER_SIGNATURE
    ) {
      return thisLog;
    }
  }
  return null;
}
//
//
// Get the Position Principal
function getPrincipal(account, cometContract) {
  const tryUserBasic = cometContract.try_userBasic(account);
  if (tryUserBasic.reverted) {
    graph_ts_1.log.error("[getPrincipal] Could not get userBasic({})", [
      account.toHexString(),
    ]);
    return constants_1.BIGINT_ZERO;
  }
  return tryUserBasic.value.getPrincipal();
}
