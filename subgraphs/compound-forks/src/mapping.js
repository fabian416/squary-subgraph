"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAllMarketPrices =
  exports.getOrElse =
  exports.convertRatePerUnitToAPY =
  exports.getMarketDailySnapshotID =
  exports.getTokenPriceUSD =
  exports.getOrCreateMarketHourlySnapshot =
  exports.getOrCreateMarketDailySnapshot =
  exports.setBorrowInterestRate =
  exports.setSupplyInterestRate =
  exports._getOrCreateProtocol =
  exports.updateProtocol =
  exports.updateMarketDeposit =
  exports.updateMarket =
  exports.snapshotFinancials =
  exports._handleTransfer =
  exports._handleNewReserveFactor =
  exports._handleAccrueInterest =
  exports._handleLiquidateBorrow =
  exports._handleRepayBorrow =
  exports._handleBorrow =
  exports._handleRedeem =
  exports._handleMint =
  exports._handleMarketListed =
  exports._handleMarketEntered =
  exports._handleActionPaused =
  exports._handleNewPriceOracle =
  exports._handleNewLiquidationIncentive =
  exports._handleNewCollateralFactor =
  exports.UpdateMarketData =
  exports.MarketListedData =
  exports.TokenData =
  exports.ProtocolData =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../generated/schema");
const constants_1 = require("./constants");
const PriceOracle_1 = require("../generated/templates/CToken/PriceOracle");
const CToken_1 = require("../generated/templates/CToken/CToken");
const versions_1 = require("./versions");
var EventType;
(function (EventType) {
  EventType[(EventType["Deposit"] = 0)] = "Deposit";
  EventType[(EventType["Withdraw"] = 1)] = "Withdraw";
  EventType[(EventType["Borrow"] = 2)] = "Borrow";
  EventType[(EventType["Repay"] = 3)] = "Repay";
  EventType[(EventType["Liquidate"] = 4)] = "Liquidate";
  EventType[(EventType["Liquidated"] = 5)] = "Liquidated";
})(EventType || (EventType = {}));
////////////////////////
//// Custom Classes ////
////////////////////////
class ProtocolData {
  constructor(
    comptrollerAddr,
    name,
    slug,
    network,
    liquidationIncentiveMantissaResult,
    oracleResult
  ) {
    this.comptrollerAddr = comptrollerAddr;
    this.name = name;
    this.slug = slug;
    this.network = network;
    this.liquidationIncentiveMantissaResult =
      liquidationIncentiveMantissaResult;
    this.oracleResult = oracleResult;
  }
}
exports.ProtocolData = ProtocolData;
class TokenData {
  constructor(address, name, symbol, decimals) {
    this.address = address;
    this.name = name;
    this.symbol = symbol;
    this.decimals = decimals;
  }
}
exports.TokenData = TokenData;
class MarketListedData {
  constructor(protocol, token, cToken, cTokenReserveFactorMantissa) {
    this.protocol = protocol;
    this.token = token;
    this.cToken = cToken;
    this.cTokenReserveFactorMantissa = cTokenReserveFactorMantissa;
  }
}
exports.MarketListedData = MarketListedData;
class UpdateMarketData {
  constructor(
    totalSupplyResult,
    exchangeRateStoredResult,
    supplyRateResult,
    borrowRateResult,
    getUnderlyingPriceResult,
    unitPerYear
  ) {
    this.totalSupplyResult = totalSupplyResult;
    this.exchangeRateStoredResult = exchangeRateStoredResult;
    this.supplyRateResult = supplyRateResult;
    this.borrowRateResult = borrowRateResult;
    this.getUnderlyingPriceResult = getUnderlyingPriceResult;
    this.unitPerYear = unitPerYear;
  }
}
exports.UpdateMarketData = UpdateMarketData;
////////////////////////////////////
//// Comptroller Event Handlers ////
////////////////////////////////////
function _handleNewCollateralFactor(marketID, newCollateralFactorMantissa) {
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[handleNewCollateralFactor] Market not found: {}", [
      marketID,
    ]);
    return;
  }
  const collateralFactor = newCollateralFactorMantissa
    .toBigDecimal()
    .div(constants_1.mantissaFactorBD)
    .times(constants_1.BIGDECIMAL_HUNDRED);
  market.maximumLTV = collateralFactor;
  market.liquidationThreshold = collateralFactor;
  if (market.maximumLTV == constants_1.BIGDECIMAL_ZERO) {
    // when collateral factor is 0 the asset CANNOT be used as collateral
    market.canUseAsCollateral = false;
  } else {
    // ensure canUseAsCollateral can return to true
    market.canUseAsCollateral = true;
  }
  market.save();
}
exports._handleNewCollateralFactor = _handleNewCollateralFactor;
function _handleNewLiquidationIncentive(
  protocol,
  newLiquidationIncentiveMantissa
) {
  const liquidationIncentive = newLiquidationIncentiveMantissa
    .toBigDecimal()
    .div(constants_1.mantissaFactorBD)
    .minus(constants_1.BIGDECIMAL_ONE)
    .times(constants_1.BIGDECIMAL_HUNDRED);
  protocol._liquidationIncentive = liquidationIncentive;
  protocol.save();
  for (let i = 0; i < protocol._marketIDs.length; i++) {
    const market = schema_1.Market.load(protocol._marketIDs[i]);
    if (!market) {
      graph_ts_1.log.warning(
        "[handleNewLiquidationIncentive] Market not found: {}",
        [protocol._marketIDs[i]]
      );
      // best effort
      continue;
    }
    market.liquidationPenalty = liquidationIncentive;
    market.save();
  }
}
exports._handleNewLiquidationIncentive = _handleNewLiquidationIncentive;
function _handleNewPriceOracle(protocol, newPriceOracle) {
  protocol._priceOracle = newPriceOracle.toHexString();
  protocol.save();
}
exports._handleNewPriceOracle = _handleNewPriceOracle;
function _handleActionPaused(marketID, action, pauseState) {
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[handleActionPaused] Market not found: {}", [
      marketID,
    ]);
    return;
  }
  if (action == "Mint") {
    market.isActive = pauseState;
  } else if (action == "Borrow") {
    market.canBorrowFrom = pauseState;
  }
  market.save();
}
exports._handleActionPaused = _handleActionPaused;
function _handleMarketEntered(
  comptrollerAddr,
  marketID,
  borrowerID,
  entered // true = entered, false = exited
) {
  const protocol = schema_1.LendingProtocol.load(comptrollerAddr.toHexString());
  if (!protocol) {
    graph_ts_1.log.warning("[handleMint] protocol not found: {}", [
      comptrollerAddr.toHexString(),
    ]);
    return;
  }
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[_handleMarketEntered] market {} not found", [
      marketID,
    ]);
    return;
  }
  let account = schema_1.Account.load(borrowerID);
  if (!account) {
    account = createAccount(borrowerID);
    protocol.cumulativeUniqueUsers++;
    protocol.save();
  }
  const enabledCollaterals = account._enabledCollaterals;
  if (entered) {
    enabledCollaterals.push(marketID);
  } else {
    const index = enabledCollaterals.indexOf(marketID);
    if (index >= 0) {
      // drop 1 element at given index
      enabledCollaterals.splice(index, 1);
    }
  }
  account._enabledCollaterals = enabledCollaterals;
  account.save();
  // update lender position isCollateral if exists
  const counterID = borrowerID
    .concat("-")
    .concat(marketID)
    .concat("-")
    .concat(constants_1.PositionSide.LENDER);
  const positionCounter = schema_1._PositionCounter.load(counterID);
  if (positionCounter) {
    const positionID = positionCounter.id
      .concat("-")
      .concat(positionCounter.nextCount.toString());
    const position = schema_1.Position.load(positionID);
    if (position) {
      position.isCollateral =
        account._enabledCollaterals.indexOf(marketID) >= 0;
      position.save();
    }
  }
}
exports._handleMarketEntered = _handleMarketEntered;
function _handleMarketListed(marketListedData, event) {
  const cTokenAddr = marketListedData.cToken.address;
  let cToken = schema_1.Token.load(cTokenAddr.toHexString());
  if (cToken != null) {
    return;
  }
  // this is a new cToken, a new underlying token, and a new market
  //
  // create cToken
  //
  cToken = new schema_1.Token(cTokenAddr.toHexString());
  cToken.name = marketListedData.cToken.name;
  cToken.symbol = marketListedData.cToken.symbol;
  cToken.decimals = marketListedData.cToken.decimals;
  cToken.save();
  //
  // create underlying token
  //
  const underlyingToken = new schema_1.Token(
    marketListedData.token.address.toHexString()
  );
  underlyingToken.name = marketListedData.token.name;
  underlyingToken.symbol = marketListedData.token.symbol;
  underlyingToken.decimals = marketListedData.token.decimals;
  underlyingToken.save();
  //
  // create market
  //
  const market = new schema_1.Market(cTokenAddr.toHexString());
  market.name = cToken.name;
  market.protocol = marketListedData.protocol.id;
  market.inputToken = underlyingToken.id;
  market.outputToken = cToken.id;
  const supplyInterestRate = new schema_1.InterestRate(
    constants_1.InterestRateSide.LENDER.concat("-")
      .concat(constants_1.InterestRateType.VARIABLE)
      .concat("-")
      .concat(market.id)
  );
  supplyInterestRate.side = constants_1.InterestRateSide.LENDER;
  supplyInterestRate.type = constants_1.InterestRateType.VARIABLE;
  supplyInterestRate.rate = constants_1.BIGDECIMAL_ZERO;
  supplyInterestRate.save();
  const borrowInterestRate = new schema_1.InterestRate(
    constants_1.InterestRateSide.BORROWER.concat("-")
      .concat(constants_1.InterestRateType.VARIABLE)
      .concat("-")
      .concat(market.id)
  );
  borrowInterestRate.side = constants_1.InterestRateSide.BORROWER;
  borrowInterestRate.type = constants_1.InterestRateType.VARIABLE;
  borrowInterestRate.rate = constants_1.BIGDECIMAL_ZERO;
  borrowInterestRate.save();
  market.rates = [supplyInterestRate.id, borrowInterestRate.id];
  market.isActive = true;
  market.canUseAsCollateral = true;
  market.canBorrowFrom = true;
  market.liquidationPenalty = marketListedData.protocol._liquidationIncentive;
  market._reserveFactor = marketListedData.cTokenReserveFactorMantissa
    .toBigDecimal()
    .div(constants_1.mantissaFactorBD);
  market.createdTimestamp = event.block.timestamp;
  market.createdBlockNumber = event.block.number;
  // add zero fields
  market.maximumLTV = constants_1.BIGDECIMAL_ZERO;
  market.liquidationThreshold = constants_1.BIGDECIMAL_ZERO;
  market.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
  market.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  market.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
  market.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  market.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
  market.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
  market.inputTokenBalance = constants_1.BIGINT_ZERO;
  market.inputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
  market.outputTokenSupply = constants_1.BIGINT_ZERO;
  market.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
  market.exchangeRate = constants_1.BIGDECIMAL_ZERO;
  market.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  market.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  market.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  market.positionCount = 0;
  market.openPositionCount = 0;
  market.closedPositionCount = 0;
  market.lendingPositionCount = 0;
  market.borrowingPositionCount = 0;
  market._borrowBalance = constants_1.BIGINT_ZERO;
  market.save();
  //
  // update protocol
  //
  const marketIDs = marketListedData.protocol._marketIDs;
  marketIDs.push(market.id);
  marketListedData.protocol._marketIDs = marketIDs;
  marketListedData.protocol.totalPoolCount++;
  marketListedData.protocol.save();
}
exports._handleMarketListed = _handleMarketListed;
////////////////////////////////////
//// Transaction Event Handlers ////
////////////////////////////////////
function _handleMint(
  comptrollerAddr,
  minter,
  mintAmount,
  outputTokenSupplyResult,
  underlyingBalanceResult,
  event
) {
  const protocol = schema_1.LendingProtocol.load(comptrollerAddr.toHexString());
  if (!protocol) {
    graph_ts_1.log.warning("[handleMint] protocol not found: {}", [
      comptrollerAddr.toHexString(),
    ]);
    return;
  }
  const marketID = event.address.toHexString();
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[handleMint] Market not found: {}", [marketID]);
    return;
  }
  const underlyingToken = schema_1.Token.load(market.inputToken);
  if (!underlyingToken) {
    graph_ts_1.log.warning("[handleMint] Failed to load underlying token: {}", [
      market.inputToken,
    ]);
    return;
  }
  //
  // create account
  //
  let account = schema_1.Account.load(minter.toHexString());
  if (!account) {
    account = createAccount(minter.toHexString());
    account.save();
    protocol.cumulativeUniqueUsers++;
    protocol.save();
  }
  account.depositCount += 1;
  account.save();
  //
  // track unique depositors
  //
  const depositorActorID = "depositor".concat("-").concat(account.id);
  let depositorActor = schema_1._ActorAccount.load(depositorActorID);
  if (!depositorActor) {
    depositorActor = new schema_1._ActorAccount(depositorActorID);
    depositorActor.save();
    protocol.cumulativeUniqueDepositors += 1;
    protocol.save();
  }
  //
  // update position
  //
  const positionID = addPosition(
    protocol,
    market,
    account,
    underlyingBalanceResult,
    constants_1.PositionSide.LENDER,
    EventType.Deposit,
    event
  );
  //
  // create deposit
  //
  const depositID = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.transactionLogIndex.toString());
  const deposit = new schema_1.Deposit(depositID);
  deposit.hash = event.transaction.hash.toHexString();
  deposit.nonce = event.transaction.nonce;
  deposit.logIndex = event.transactionLogIndex.toI32();
  deposit.blockNumber = event.block.number;
  deposit.timestamp = event.block.timestamp;
  deposit.account = minter.toHexString();
  deposit.market = marketID;
  deposit.position = positionID;
  deposit.asset = market.inputToken;
  deposit.amount = mintAmount;
  const depositUSD = market.inputTokenPriceUSD.times(
    mintAmount
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(underlyingToken.decimals))
  );
  deposit.amountUSD = depositUSD;
  deposit.save();
  updateMarketDeposit(
    comptrollerAddr,
    market,
    underlyingToken,
    outputTokenSupplyResult,
    event
  );
  market.cumulativeDepositUSD = market.cumulativeDepositUSD.plus(depositUSD);
  market.save();
  updateMarketSnapshots(
    market,
    event.block.timestamp,
    event.block.number,
    depositUSD,
    EventType.Deposit
  );
  snapshotUsage(
    comptrollerAddr,
    event.block.number,
    event.block.timestamp,
    minter.toHexString(),
    EventType.Deposit,
    true
  );
}
exports._handleMint = _handleMint;
function _handleRedeem(
  comptrollerAddr,
  redeemer,
  redeemAmount,
  outputTokenSupplyResult,
  underlyingBalanceResult,
  event
) {
  const protocol = schema_1.LendingProtocol.load(comptrollerAddr.toHexString());
  if (!protocol) {
    graph_ts_1.log.warning("[handleRedeem] protocol not found: {}", [
      comptrollerAddr.toHexString(),
    ]);
    return;
  }
  const marketID = event.address.toHexString();
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[handleRedeem] Market not found: {}", [marketID]);
    return;
  }
  const underlyingToken = schema_1.Token.load(market.inputToken);
  if (!underlyingToken) {
    graph_ts_1.log.warning(
      "[handleRedeem] Failed to load underlying token: {}",
      [market.inputToken]
    );
    return;
  }
  //
  // create account
  //
  let account = schema_1.Account.load(redeemer.toHexString());
  if (!account) {
    account = createAccount(redeemer.toHexString());
    account.save();
    protocol.cumulativeUniqueUsers++;
    protocol.save();
  }
  account.withdrawCount += 1;
  account.save();
  const positionID = subtractPosition(
    protocol,
    market,
    account,
    underlyingBalanceResult,
    constants_1.PositionSide.LENDER,
    EventType.Withdraw,
    event
  );
  if (!positionID) {
    graph_ts_1.log.warning(
      "[handleRedeem] Failed to find position for account: {}",
      [account.id]
    );
    return;
  }
  const withdrawID = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.transactionLogIndex.toString());
  const withdraw = new schema_1.Withdraw(withdrawID);
  withdraw.hash = event.transaction.hash.toHexString();
  withdraw.nonce = event.transaction.nonce;
  withdraw.logIndex = event.transactionLogIndex.toI32();
  withdraw.blockNumber = event.block.number;
  withdraw.timestamp = event.block.timestamp;
  withdraw.account = redeemer.toHexString();
  withdraw.market = marketID;
  withdraw.position = positionID;
  withdraw.asset = market.inputToken;
  withdraw.amount = redeemAmount;
  withdraw.amountUSD = market.inputTokenPriceUSD.times(
    redeemAmount
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(underlyingToken.decimals))
  );
  withdraw.save();
  updateMarketDeposit(
    comptrollerAddr,
    market,
    underlyingToken,
    outputTokenSupplyResult,
    event
  );
  updateMarketSnapshots(
    market,
    event.block.timestamp,
    event.block.number,
    withdraw.amountUSD,
    EventType.Withdraw
  );
  snapshotUsage(
    comptrollerAddr,
    event.block.number,
    event.block.timestamp,
    redeemer.toHexString(),
    EventType.Withdraw,
    true
  );
}
exports._handleRedeem = _handleRedeem;
function _handleBorrow(
  comptrollerAddr,
  borrower,
  borrowAmount,
  borrowBalanceResult,
  totalBorrows,
  event
) {
  const protocol = schema_1.LendingProtocol.load(comptrollerAddr.toHexString());
  if (!protocol) {
    graph_ts_1.log.warning("[handleBorrow] protocol not found: {}", [
      comptrollerAddr.toHexString(),
    ]);
    return;
  }
  const marketID = event.address.toHexString();
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[handleBorrow] Market not found: {}", [marketID]);
    return;
  }
  const underlyingToken = schema_1.Token.load(market.inputToken);
  if (!underlyingToken) {
    graph_ts_1.log.warning(
      "[handleBorrow] Failed to load underlying token: {}",
      [market.inputToken]
    );
    return;
  }
  //
  // create account
  //
  let account = schema_1.Account.load(borrower.toHexString());
  if (!account) {
    account = createAccount(borrower.toHexString());
    account.save();
    protocol.cumulativeUniqueUsers++;
    protocol.save();
  }
  account.borrowCount += 1;
  account.save();
  //
  // track unique borrowers
  //
  const borrowerActorID = "borrower".concat("-").concat(account.id);
  let borrowerActor = schema_1._ActorAccount.load(borrowerActorID);
  if (!borrowerActor) {
    borrowerActor = new schema_1._ActorAccount(borrowerActorID);
    borrowerActor.save();
    protocol.cumulativeUniqueBorrowers += 1;
    protocol.save();
  }
  //
  // update position
  //
  const positionID = addPosition(
    protocol,
    market,
    account,
    borrowBalanceResult,
    constants_1.PositionSide.BORROWER,
    EventType.Borrow,
    event
  );
  const borrowID = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.transactionLogIndex.toString());
  const borrow = new schema_1.Borrow(borrowID);
  borrow.hash = event.transaction.hash.toHexString();
  borrow.nonce = event.transaction.nonce;
  borrow.logIndex = event.transactionLogIndex.toI32();
  borrow.blockNumber = event.block.number;
  borrow.timestamp = event.block.timestamp;
  borrow.account = borrower.toHexString();
  borrow.market = marketID;
  borrow.position = positionID;
  borrow.asset = market.inputToken;
  borrow.amount = borrowAmount;
  const borrowUSD = market.inputTokenPriceUSD.times(
    borrowAmount
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(underlyingToken.decimals))
  );
  borrow.amountUSD = borrowUSD;
  borrow.save();
  const underlyingTokenPriceUSD = market.inputTokenPriceUSD;
  market._borrowBalance = totalBorrows;
  market.totalBorrowBalanceUSD = totalBorrows
    .toBigDecimal()
    .div((0, constants_1.exponentToBigDecimal)(underlyingToken.decimals))
    .times(underlyingTokenPriceUSD);
  market.cumulativeBorrowUSD = market.cumulativeBorrowUSD.plus(borrowUSD);
  market.save();
  updateMarketSnapshots(
    market,
    event.block.timestamp,
    event.block.number,
    borrowUSD,
    EventType.Borrow
  );
  snapshotUsage(
    comptrollerAddr,
    event.block.number,
    event.block.timestamp,
    borrower.toHexString(),
    EventType.Borrow,
    true
  );
  updateProtocol(comptrollerAddr);
  snapshotFinancials(
    comptrollerAddr,
    event.block.number,
    event.block.timestamp
  );
}
exports._handleBorrow = _handleBorrow;
function _handleRepayBorrow(
  comptrollerAddr,
  borrower,
  payer,
  repayAmount,
  borrowBalanceResult,
  totalBorrows,
  event
) {
  const protocol = schema_1.LendingProtocol.load(comptrollerAddr.toHexString());
  if (!protocol) {
    graph_ts_1.log.warning("[handleRepayBorrow] protocol not found: {}", [
      comptrollerAddr.toHexString(),
    ]);
    return;
  }
  const marketID = event.address.toHexString();
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[handleRepayBorrow] Market not found: {}", [
      marketID,
    ]);
    return;
  }
  const underlyingToken = schema_1.Token.load(market.inputToken);
  if (!underlyingToken) {
    graph_ts_1.log.warning(
      "[handleRepayBorrow] Failed to load underlying token: {}",
      [market.inputToken]
    );
    return;
  }
  //
  // create account
  //
  let payerAccount = schema_1.Account.load(payer.toHexString());
  if (!payerAccount) {
    payerAccount = createAccount(payer.toHexString());
    payerAccount.save();
    protocol.cumulativeUniqueUsers++;
    protocol.save();
  }
  payerAccount.repayCount += 1;
  payerAccount.save();
  let borrowerAccount = schema_1.Account.load(borrower.toHexString());
  if (!borrowerAccount) {
    borrowerAccount = createAccount(borrower.toHexString());
    borrowerAccount.save();
    protocol.cumulativeUniqueUsers++;
    protocol.save();
  }
  const positionID = subtractPosition(
    protocol,
    market,
    borrowerAccount,
    borrowBalanceResult,
    constants_1.PositionSide.BORROWER,
    EventType.Repay,
    event
  );
  if (!positionID) {
    graph_ts_1.log.warning(
      "[handleRepayBorrow] Failed to find position for account: {}",
      [borrowerAccount.id]
    );
    return;
  }
  const repayID = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.transactionLogIndex.toString());
  const repay = new schema_1.Repay(repayID);
  repay.hash = event.transaction.hash.toHexString();
  repay.nonce = event.transaction.nonce;
  repay.logIndex = event.transactionLogIndex.toI32();
  repay.blockNumber = event.block.number;
  repay.timestamp = event.block.timestamp;
  repay.account = payer.toHexString();
  repay.market = marketID;
  repay.position = positionID;
  repay.asset = market.inputToken;
  repay.amount = repayAmount;
  repay.amountUSD = market.inputTokenPriceUSD.times(
    repayAmount
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(underlyingToken.decimals))
  );
  repay.save();
  const underlyingTokenPriceUSD = market.inputTokenPriceUSD;
  market._borrowBalance = totalBorrows;
  market.totalBorrowBalanceUSD = totalBorrows
    .toBigDecimal()
    .div((0, constants_1.exponentToBigDecimal)(underlyingToken.decimals))
    .times(underlyingTokenPriceUSD);
  market.save();
  updateMarketSnapshots(
    market,
    event.block.timestamp,
    event.block.number,
    repay.amountUSD,
    EventType.Repay
  );
  snapshotUsage(
    comptrollerAddr,
    event.block.number,
    event.block.timestamp,
    payer.toHexString(),
    EventType.Repay,
    true
  );
  updateProtocol(comptrollerAddr);
  snapshotFinancials(
    comptrollerAddr,
    event.block.number,
    event.block.timestamp
  );
}
exports._handleRepayBorrow = _handleRepayBorrow;
function _handleLiquidateBorrow(
  comptrollerAddr,
  cTokenCollateral,
  liquidator,
  borrower,
  seizeTokens,
  repayAmount,
  event
) {
  const protocol = schema_1.LendingProtocol.load(comptrollerAddr.toHexString());
  if (!protocol) {
    graph_ts_1.log.warning("[handleLiquidateBorrow] protocol not found: {}", [
      comptrollerAddr.toHexString(),
    ]);
    return;
  }
  const repayTokenMarketID = event.address.toHexString();
  const repayTokenMarket = schema_1.Market.load(repayTokenMarketID);
  if (!repayTokenMarket) {
    graph_ts_1.log.warning(
      "[handleLiquidateBorrow] Repay Token Market not found: {}",
      [repayTokenMarketID]
    );
    return;
  }
  if (!repayTokenMarket.inputToken) {
    graph_ts_1.log.warning(
      "[handleLiquidateBorrow] Repay Token Market {} has no input token",
      [repayTokenMarketID]
    );
    return;
  }
  const repayToken = schema_1.Token.load(repayTokenMarket.inputToken);
  if (!repayToken) {
    graph_ts_1.log.warning(
      "[handleLiquidateBorrow] Failed to load repay token: {}",
      [repayTokenMarket.inputToken]
    );
    return;
  }
  const liquidatedCTokenMarketID = cTokenCollateral.toHexString();
  const liquidatedCTokenMarket = schema_1.Market.load(liquidatedCTokenMarketID);
  if (!liquidatedCTokenMarket) {
    graph_ts_1.log.warning(
      "[handleLiquidateBorrow] Liquidated CToken Market not found: {}",
      [liquidatedCTokenMarketID]
    );
    return;
  }
  const liquidatedCTokenID = liquidatedCTokenMarket.outputToken;
  if (!liquidatedCTokenID) {
    graph_ts_1.log.warning(
      "[handleLiquidateBorrow] Liquidated CToken Market {} has no output token",
      [liquidatedCTokenMarketID]
    );
    return;
  }
  // compiler is too silly to figure out this is not null, so add a !
  const liquidatedCToken = schema_1.Token.load(liquidatedCTokenID);
  if (!liquidatedCToken) {
    graph_ts_1.log.warning(
      "[handleLiquidateBorrow] Failed to load liquidated cToken: {}",
      [liquidatedCTokenID]
    );
    return;
  }
  //
  // create account
  // update protocol
  //
  const liquidatorAccountID = liquidator.toHexString();
  let liquidatorAccount = schema_1.Account.load(liquidatorAccountID);
  if (!liquidatorAccount) {
    liquidatorAccount = createAccount(liquidatorAccountID);
    liquidatorAccount.save();
    protocol.cumulativeUniqueUsers++;
    protocol.save();
  }
  const liquidatorActorID = "liquidator"
    .concat("-")
    .concat(liquidatorAccountID);
  let liquidatorActor = schema_1._ActorAccount.load(liquidatorActorID);
  if (!liquidatorActor) {
    liquidatorActor = new schema_1._ActorAccount(liquidatorActorID);
    liquidatorActor.save();
    protocol.cumulativeUniqueLiquidators += 1;
    protocol.save();
  }
  const liquidateeAccountID = borrower.toHexString();
  let liquidateeAccount = schema_1.Account.load(liquidateeAccountID);
  if (!liquidateeAccount) {
    liquidateeAccount = createAccount(liquidateeAccountID);
    liquidateeAccount.save();
    protocol.cumulativeUniqueUsers++;
    protocol.save();
  }
  const liquidateeActorID = "liquidatee"
    .concat("-")
    .concat(liquidateeAccountID);
  let liquidateeActor = schema_1._ActorAccount.load(liquidateeActorID);
  if (!liquidateeActor) {
    liquidateeActor = new schema_1._ActorAccount(liquidateeActorID);
    liquidateeActor.save();
    protocol.cumulativeUniqueLiquidatees += 1;
    protocol.save();
  }
  //
  // update account
  //
  liquidatorAccount.liquidateCount += 1;
  liquidatorAccount.save();
  liquidateeAccount.liquidationCount += 1;
  liquidateeAccount.save();
  //
  // liquidate event
  //
  const liquidateID = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.transactionLogIndex.toString());
  const liquidate = new schema_1.Liquidate(liquidateID);
  liquidate.hash = event.transaction.hash.toHexString();
  liquidate.nonce = event.transaction.nonce;
  liquidate.logIndex = event.transactionLogIndex.toI32();
  liquidate.liquidator = liquidator.toHexString();
  liquidate.liquidatee = borrower.toHexString();
  // Not much to do other than associating with the borrower position
  // Because compound liquidate() emits both RepayBorrow and Liquidate
  // All logic should be handled on RepayBorrow already
  const positionId = whichPosition(borrower, repayTokenMarketID);
  if (!positionId) {
    graph_ts_1.log.warning(
      "[_liquidateBorrow] cannot find associated position for liquidation {}",
      [liquidateID]
    );
    return;
  }
  liquidate.position = positionId;
  liquidate.blockNumber = event.block.number;
  liquidate.timestamp = event.block.timestamp;
  liquidate.market = liquidatedCTokenID;
  liquidate.asset = repayTokenMarket.inputToken;
  liquidate.amount = seizeTokens;
  const gainUSD = seizeTokens
    .toBigDecimal()
    .div((0, constants_1.exponentToBigDecimal)(liquidatedCToken.decimals))
    .times(liquidatedCTokenMarket.outputTokenPriceUSD);
  const lossUSD = repayAmount
    .toBigDecimal()
    .div((0, constants_1.exponentToBigDecimal)(repayToken.decimals))
    .times(repayTokenMarket.inputTokenPriceUSD);
  liquidate.amountUSD = gainUSD;
  liquidate.profitUSD = gainUSD.minus(lossUSD);
  liquidate.save();
  liquidatedCTokenMarket.cumulativeLiquidateUSD =
    liquidatedCTokenMarket.cumulativeLiquidateUSD.plus(gainUSD);
  liquidatedCTokenMarket.save();
  updateMarketSnapshots(
    liquidatedCTokenMarket,
    event.block.timestamp,
    event.block.number,
    gainUSD,
    EventType.Liquidate
  );
  snapshotUsage(
    comptrollerAddr,
    event.block.number,
    event.block.timestamp,
    liquidator.toHexString(),
    EventType.Liquidate,
    true
  );
  snapshotUsage(
    comptrollerAddr,
    event.block.number,
    event.block.timestamp,
    borrower.toHexString(),
    EventType.Liquidated,
    false
  );
}
exports._handleLiquidateBorrow = _handleLiquidateBorrow;
///////////////////////////////
//// CToken Event Handlers ////
///////////////////////////////
// This function is called whenever mint, redeem, borrow, repay, liquidateBorrow happens
function _handleAccrueInterest(
  updateMarketData,
  comptrollerAddr,
  interestAccumulated,
  totalBorrows,
  updateMarketPrices,
  event
) {
  const marketID = event.address.toHexString();
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[handleAccrueInterest] Market not found: {}", [
      marketID,
    ]);
    return;
  }
  updateMarket(
    updateMarketData,
    marketID,
    interestAccumulated,
    totalBorrows,
    event.block.number,
    event.block.timestamp,
    updateMarketPrices,
    comptrollerAddr
  );
  updateProtocol(comptrollerAddr);
  snapshotFinancials(
    comptrollerAddr,
    event.block.number,
    event.block.timestamp
  );
}
exports._handleAccrueInterest = _handleAccrueInterest;
function _handleNewReserveFactor(marketID, newReserveFactorMantissa) {
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[handleNewReserveFactor] Market not found: {}", [
      marketID,
    ]);
    return;
  }
  const reserveFactor = newReserveFactorMantissa
    .toBigDecimal()
    .div(constants_1.mantissaFactorBD);
  market._reserveFactor = reserveFactor;
  market.save();
}
exports._handleNewReserveFactor = _handleNewReserveFactor;
function _handleTransfer(event, marketID, to, from, comptrollerAddr) {
  const protocol = schema_1.LendingProtocol.load(comptrollerAddr.toHexString());
  if (!protocol) {
    graph_ts_1.log.warning("[_handleTransfer] protocol not found: {}", [
      comptrollerAddr.toHexString(),
    ]);
    return;
  }
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[_handleTransfer] market not found: {}", [
      event.address.toHexString(),
    ]);
    return;
  }
  // if to / from - marketID then the transfer is associated with another event
  // ie, a mint, redeem, borrow, repay, liquidateBorrow
  // we want to skip these and let the event handlers take care of updates
  if (
    to.toHexString().toLowerCase() == marketID.toLowerCase() ||
    from.toHexString().toLowerCase() == marketID.toLowerCase()
  ) {
    return;
  }
  // grab accounts
  let toAccount = schema_1.Account.load(to.toHexString());
  if (!toAccount) {
    if (to == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)) {
      toAccount = null;
    } else {
      toAccount = createAccount(to.toHexString());
      toAccount.save();
      protocol.cumulativeUniqueUsers++;
      protocol.save();
    }
  }
  let fromAccount = schema_1.Account.load(from.toHexString());
  if (!fromAccount) {
    if (from == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)) {
      fromAccount = null;
    } else {
      fromAccount = createAccount(from.toHexString());
      fromAccount.save();
      protocol.cumulativeUniqueUsers++;
      protocol.save();
    }
  }
  const cTokenContract = CToken_1.CToken.bind(
    graph_ts_1.Address.fromString(marketID)
  );
  // update balance from sender
  if (fromAccount) {
    subtractPosition(
      protocol,
      market,
      fromAccount,
      cTokenContract.try_balanceOfUnderlying(from),
      constants_1.PositionSide.LENDER,
      -1, // TODO: not sure how to classify this event yet
      event
    );
  }
  // update balance from receiver
  if (toAccount) {
    addPosition(
      protocol,
      market,
      toAccount,
      cTokenContract.try_balanceOfUnderlying(to),
      constants_1.PositionSide.LENDER,
      -1, // TODO: not sure how to classify this event yet
      event
    );
  }
}
exports._handleTransfer = _handleTransfer;
/////////////////////////
//// Entity Updaters ////
/////////////////////////
/**
 *
 * @param blockNumber
 * @param blockTimestamp
 * @returns
 */
function snapshotFinancials(comptrollerAddr, blockNumber, blockTimestamp) {
  const protocol = schema_1.LendingProtocol.load(comptrollerAddr.toHexString());
  if (!protocol) {
    graph_ts_1.log.error(
      "[snapshotFinancials] Protocol not found, this SHOULD NOT happen",
      []
    );
    return;
  }
  const snapshotID = (
    blockTimestamp.toI32() / constants_1.SECONDS_PER_DAY
  ).toString();
  const snapshot = new schema_1.FinancialsDailySnapshot(snapshotID);
  snapshot.protocol = protocol.id;
  snapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
  snapshot.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD;
  snapshot.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD;
  snapshot.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
  snapshot.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
  snapshot.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD;
  snapshot.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD;
  snapshot.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD;
  snapshot.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD;
  snapshot.mintedTokenSupplies = protocol.mintedTokenSupplies;
  let dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
  let dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
  let dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
  let dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
  let dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
  let dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  let dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  let dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  for (let i = 0; i < protocol._marketIDs.length; i++) {
    const market = schema_1.Market.load(protocol._marketIDs[i]);
    if (!market) {
      graph_ts_1.log.warning("[snapshotFinancials] Market not found: {}", [
        protocol._marketIDs[i],
      ]);
      // best effort
      continue;
    }
    const marketDailySnapshotID = getMarketDailySnapshotID(
      market.id,
      blockTimestamp.toI32()
    );
    const marketDailySnapshot = schema_1.MarketDailySnapshot.load(
      marketDailySnapshotID
    );
    if (!marketDailySnapshot) {
      // this is okay - no MarketDailySnapshot means no transactions in that market during that day
      graph_ts_1.log.info(
        "[snapshotFinancials] MarketDailySnapshot not found (ie, no transactions in that market during this day): {}",
        [marketDailySnapshotID]
      );
      continue;
    }
    dailyDepositUSD = dailyDepositUSD.plus(marketDailySnapshot.dailyDepositUSD);
    dailyBorrowUSD = dailyBorrowUSD.plus(marketDailySnapshot.dailyBorrowUSD);
    dailyLiquidateUSD = dailyLiquidateUSD.plus(
      marketDailySnapshot.dailyLiquidateUSD
    );
    dailyWithdrawUSD = dailyWithdrawUSD.plus(
      marketDailySnapshot.dailyWithdrawUSD
    );
    dailyRepayUSD = dailyRepayUSD.plus(marketDailySnapshot.dailyRepayUSD);
    dailyTotalRevenueUSD = dailyTotalRevenueUSD.plus(
      marketDailySnapshot.dailyTotalRevenueUSD
    );
    dailyProtocolSideRevenueUSD = dailyProtocolSideRevenueUSD.plus(
      marketDailySnapshot.dailyProtocolSideRevenueUSD
    );
    dailySupplySideRevenueUSD = dailySupplySideRevenueUSD.plus(
      marketDailySnapshot.dailySupplySideRevenueUSD
    );
  }
  snapshot.dailyDepositUSD = dailyDepositUSD;
  snapshot.dailyBorrowUSD = dailyBorrowUSD;
  snapshot.dailyLiquidateUSD = dailyLiquidateUSD;
  snapshot.dailyWithdrawUSD = dailyWithdrawUSD;
  snapshot.dailyRepayUSD = dailyRepayUSD;
  snapshot.dailyTotalRevenueUSD = dailyTotalRevenueUSD;
  snapshot.dailyProtocolSideRevenueUSD = dailyProtocolSideRevenueUSD;
  snapshot.dailySupplySideRevenueUSD = dailySupplySideRevenueUSD;
  snapshot.blockNumber = blockNumber;
  snapshot.timestamp = blockTimestamp;
  snapshot.save();
}
exports.snapshotFinancials = snapshotFinancials;
/**
 * Snapshot usage.
 * It has to happen in handleMint, handleRedeem, handleBorrow, handleRepayBorrow and handleLiquidate,
 * because handleAccrueInterest doesn't have access to the accountID
 * @param newTxn On liquidate() we call snapshotUsage twice, and we don't want to increment txn counter on the 2nd call, hence we use the argument to differentiate
 */
function snapshotUsage(
  comptrollerAddr,
  blockNumber,
  blockTimestamp,
  accountID,
  eventType,
  newTxn
) {
  const protocol = schema_1.LendingProtocol.load(comptrollerAddr.toHexString());
  if (!protocol) {
    graph_ts_1.log.error(
      "[snapshotUsage] Protocol not found, this SHOULD NOT happen",
      []
    );
    return;
  }
  //
  // daily snapshot
  //
  const dailySnapshotID = (
    blockTimestamp.toI32() / constants_1.SECONDS_PER_DAY
  ).toString();
  let dailySnapshot = schema_1.UsageMetricsDailySnapshot.load(dailySnapshotID);
  if (!dailySnapshot) {
    dailySnapshot = new schema_1.UsageMetricsDailySnapshot(dailySnapshotID);
    dailySnapshot.protocol = protocol.id;
    dailySnapshot.dailyActiveUsers = constants_1.INT_ZERO;
    dailySnapshot.dailyActiveDepositors = constants_1.INT_ZERO;
    dailySnapshot.dailyActiveBorrowers = constants_1.INT_ZERO;
    dailySnapshot.dailyActiveLiquidators = constants_1.INT_ZERO;
    dailySnapshot.dailyActiveLiquidatees = constants_1.INT_ZERO;
    dailySnapshot.cumulativeUniqueUsers = constants_1.INT_ZERO;
    dailySnapshot.cumulativeUniqueDepositors = constants_1.INT_ZERO;
    dailySnapshot.cumulativeUniqueBorrowers = constants_1.INT_ZERO;
    dailySnapshot.cumulativeUniqueLiquidators = constants_1.INT_ZERO;
    dailySnapshot.cumulativeUniqueLiquidatees = constants_1.INT_ZERO;
    dailySnapshot.dailyTransactionCount = constants_1.INT_ZERO;
    dailySnapshot.dailyDepositCount = constants_1.INT_ZERO;
    dailySnapshot.dailyWithdrawCount = constants_1.INT_ZERO;
    dailySnapshot.dailyBorrowCount = constants_1.INT_ZERO;
    dailySnapshot.dailyRepayCount = constants_1.INT_ZERO;
    dailySnapshot.dailyLiquidateCount = constants_1.INT_ZERO;
    dailySnapshot.blockNumber = blockNumber;
    dailySnapshot.timestamp = blockTimestamp;
  }
  const dailyAccountID = constants_1.ActivityType.DAILY.concat("-")
    .concat(accountID)
    .concat("-")
    .concat(dailySnapshotID);
  let dailyActiveAccount = schema_1.ActiveAccount.load(dailyAccountID);
  if (!dailyActiveAccount) {
    dailyActiveAccount = new schema_1.ActiveAccount(dailyAccountID);
    dailyActiveAccount.save();
    dailySnapshot.dailyActiveUsers += 1;
  }
  const dailyActorAccountID = constants_1.ActivityType.DAILY.concat("-")
    .concat(eventType.toString())
    .concat("-")
    .concat(accountID)
    .concat("-")
    .concat(dailySnapshotID);
  let dailyActiveActorAccount =
    schema_1.ActiveAccount.load(dailyActorAccountID);
  const newDAU = dailyActiveActorAccount == null;
  if (newDAU) {
    dailyActiveActorAccount = new schema_1.ActiveAccount(dailyActorAccountID);
    dailyActiveActorAccount.save();
  }
  switch (eventType) {
    case EventType.Deposit:
      dailySnapshot.dailyDepositCount += 1;
      if (newDAU) {
        dailySnapshot.dailyActiveDepositors += 1;
      }
      break;
    case EventType.Withdraw:
      dailySnapshot.dailyWithdrawCount += 1;
      break;
    case EventType.Borrow:
      dailySnapshot.dailyBorrowCount += 1;
      if (newDAU) {
        dailySnapshot.dailyActiveBorrowers += 1;
      }
      break;
    case EventType.Repay:
      dailySnapshot.dailyRepayCount += 1;
      break;
    case EventType.Liquidate:
      dailySnapshot.dailyLiquidateCount += 1;
      if (newDAU) {
        dailySnapshot.dailyActiveLiquidators += 1;
      }
      break;
    case EventType.Liquidated:
      if (newDAU) {
        dailySnapshot.dailyActiveLiquidatees += 1;
      }
    default:
  }
  dailySnapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
  if (newTxn) {
    dailySnapshot.dailyTransactionCount += 1;
  }
  dailySnapshot.totalPoolCount = protocol.totalPoolCount;
  dailySnapshot.cumulativeUniqueDepositors =
    protocol.cumulativeUniqueDepositors;
  dailySnapshot.cumulativeUniqueBorrowers = protocol.cumulativeUniqueBorrowers;
  dailySnapshot.cumulativeUniqueLiquidators =
    protocol.cumulativeUniqueLiquidators;
  dailySnapshot.cumulativeUniqueLiquidatees =
    protocol.cumulativeUniqueLiquidatees;
  dailySnapshot.blockNumber = blockNumber;
  dailySnapshot.timestamp = blockTimestamp;
  dailySnapshot.save();
  //
  // hourly snapshot
  //
  const hourlySnapshotID = (
    blockTimestamp.toI32() / constants_1.SECONDS_PER_HOUR
  ).toString();
  let hourlySnapshot =
    schema_1.UsageMetricsHourlySnapshot.load(hourlySnapshotID);
  if (!hourlySnapshot) {
    hourlySnapshot = new schema_1.UsageMetricsHourlySnapshot(hourlySnapshotID);
    hourlySnapshot.protocol = protocol.id;
    hourlySnapshot.hourlyActiveUsers = constants_1.INT_ZERO;
    hourlySnapshot.cumulativeUniqueUsers = constants_1.INT_ZERO;
    hourlySnapshot.hourlyTransactionCount = constants_1.INT_ZERO;
    hourlySnapshot.hourlyDepositCount = constants_1.INT_ZERO;
    hourlySnapshot.hourlyWithdrawCount = constants_1.INT_ZERO;
    hourlySnapshot.hourlyBorrowCount = constants_1.INT_ZERO;
    hourlySnapshot.hourlyRepayCount = constants_1.INT_ZERO;
    hourlySnapshot.hourlyLiquidateCount = constants_1.INT_ZERO;
    hourlySnapshot.blockNumber = blockNumber;
    hourlySnapshot.timestamp = blockTimestamp;
  }
  const hourlyAccountID = constants_1.ActivityType.HOURLY.concat("-")
    .concat(accountID)
    .concat("-")
    .concat(hourlySnapshotID);
  let hourlyActiveAccount = schema_1.ActiveAccount.load(hourlyAccountID);
  if (!hourlyActiveAccount) {
    hourlyActiveAccount = new schema_1.ActiveAccount(hourlyAccountID);
    hourlyActiveAccount.save();
    hourlySnapshot.hourlyActiveUsers += 1;
  }
  hourlySnapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
  if (newTxn) {
    hourlySnapshot.hourlyTransactionCount += 1;
  }
  switch (eventType) {
    case EventType.Deposit:
      hourlySnapshot.hourlyDepositCount += 1;
      break;
    case EventType.Withdraw:
      hourlySnapshot.hourlyWithdrawCount += 1;
      break;
    case EventType.Borrow:
      hourlySnapshot.hourlyBorrowCount += 1;
      break;
    case EventType.Repay:
      hourlySnapshot.hourlyRepayCount += 1;
      break;
    case EventType.Liquidate:
      hourlySnapshot.hourlyLiquidateCount += 1;
      break;
    default:
      break;
  }
  hourlySnapshot.blockNumber = blockNumber;
  hourlySnapshot.timestamp = blockTimestamp;
  hourlySnapshot.save();
}
function updateMarketSnapshots(
  market,
  timestamp,
  blockNumber,
  amountUSD,
  eventType
) {
  const marketHourlySnapshot = getOrCreateMarketHourlySnapshot(
    market,
    timestamp,
    blockNumber
  );
  switch (eventType) {
    case EventType.Deposit:
      marketHourlySnapshot.hourlyDepositUSD =
        marketHourlySnapshot.hourlyDepositUSD.plus(amountUSD);
      break;
    case EventType.Borrow:
      marketHourlySnapshot.hourlyBorrowUSD =
        marketHourlySnapshot.hourlyBorrowUSD.plus(amountUSD);
      break;
    case EventType.Liquidate:
      marketHourlySnapshot.hourlyLiquidateUSD =
        marketHourlySnapshot.hourlyLiquidateUSD.plus(amountUSD);
      break;
    case EventType.Withdraw:
      marketHourlySnapshot.hourlyWithdrawUSD =
        marketHourlySnapshot.hourlyWithdrawUSD.plus(amountUSD);
      break;
    case EventType.Repay:
      marketHourlySnapshot.hourlyRepayUSD =
        marketHourlySnapshot.hourlyRepayUSD.plus(amountUSD);
      break;
    default:
      break;
  }
  marketHourlySnapshot.save();
  const marketDailySnapshot = getOrCreateMarketDailySnapshot(
    market,
    timestamp,
    blockNumber
  );
  switch (eventType) {
    case EventType.Deposit:
      marketDailySnapshot.dailyDepositUSD =
        marketDailySnapshot.dailyDepositUSD.plus(amountUSD);
      break;
    case EventType.Borrow:
      marketDailySnapshot.dailyBorrowUSD =
        marketDailySnapshot.dailyBorrowUSD.plus(amountUSD);
      break;
    case EventType.Liquidate:
      marketDailySnapshot.dailyLiquidateUSD =
        marketDailySnapshot.dailyLiquidateUSD.plus(amountUSD);
      break;
    case EventType.Withdraw:
      marketDailySnapshot.dailyWithdrawUSD =
        marketDailySnapshot.dailyWithdrawUSD.plus(amountUSD);
      break;
    case EventType.Repay:
      marketDailySnapshot.dailyRepayUSD =
        marketDailySnapshot.dailyRepayUSD.plus(amountUSD);
      break;
    default:
      break;
  }
  marketDailySnapshot.save();
}
// updateMarketPrices: true when every market price is updated on AccrueInterest()
function updateMarket(
  updateMarketData,
  marketID,
  interestAccumulatedMantissa,
  newTotalBorrow,
  blockNumber,
  blockTimestamp,
  updateMarketPrices,
  comptrollerAddress
) {
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[updateMarket] Market not found: {}", [marketID]);
    return;
  }
  const underlyingToken = schema_1.Token.load(market.inputToken);
  if (!underlyingToken) {
    graph_ts_1.log.warning("[updateMarket] Underlying token not found: {}", [
      market.inputToken,
    ]);
    return;
  }
  if (updateMarketPrices) {
    updateAllMarketPrices(comptrollerAddress, blockNumber);
  }
  // update this market's price no matter what
  const underlyingTokenPriceUSD = getTokenPriceUSD(
    updateMarketData.getUnderlyingPriceResult,
    underlyingToken.decimals
  );
  underlyingToken.lastPriceUSD = underlyingTokenPriceUSD;
  underlyingToken.lastPriceBlockNumber = blockNumber;
  underlyingToken.save();
  market.inputTokenPriceUSD = underlyingTokenPriceUSD;
  // get correct outputTokenDecimals for generic exchangeRate calculation
  let outputTokenDecimals = constants_1.cTokenDecimals;
  if (market.outputToken) {
    const outputToken = schema_1.Token.load(market.outputToken);
    if (!outputToken) {
      graph_ts_1.log.warning("[updateMarket] Output token not found: {}", [
        market.outputToken,
      ]);
    } else {
      outputTokenDecimals = outputToken.decimals;
    }
  }
  if (updateMarketData.exchangeRateStoredResult.reverted) {
    graph_ts_1.log.warning(
      "[updateMarket] Failed to get exchangeRateStored of Market {}",
      [marketID]
    );
  } else {
    // Formula: check out "Interpreting Exchange Rates" in https://compound.finance/docs#protocol-math
    const oneCTokenInUnderlying =
      updateMarketData.exchangeRateStoredResult.value
        .toBigDecimal()
        .div(
          (0, constants_1.exponentToBigDecimal)(
            constants_1.mantissaFactor +
              underlyingToken.decimals -
              outputTokenDecimals
          )
        );
    market.exchangeRate = oneCTokenInUnderlying;
    market.outputTokenPriceUSD = oneCTokenInUnderlying.times(
      underlyingTokenPriceUSD
    );
  }
  if (updateMarketData.supplyRateResult.reverted) {
    graph_ts_1.log.warning(
      "[updateMarket] Failed to get supplyRate of Market {}",
      [marketID]
    );
  } else {
    setSupplyInterestRate(
      marketID,
      convertRatePerUnitToAPY(
        updateMarketData.supplyRateResult.value,
        updateMarketData.unitPerYear
      )
    );
  }
  if (updateMarketData.borrowRateResult.reverted) {
    graph_ts_1.log.warning(
      "[updateMarket] Failed to get borrowRate of Market {}",
      [marketID]
    );
  } else {
    setBorrowInterestRate(
      marketID,
      convertRatePerUnitToAPY(
        updateMarketData.borrowRateResult.value,
        updateMarketData.unitPerYear
      )
    );
  }
  const interestAccumulatedUSD = interestAccumulatedMantissa
    .toBigDecimal()
    .div((0, constants_1.exponentToBigDecimal)(underlyingToken.decimals))
    .times(underlyingTokenPriceUSD);
  const protocolSideRevenueUSDDelta = interestAccumulatedUSD.times(
    market._reserveFactor
  );
  const supplySideRevenueUSDDelta = interestAccumulatedUSD.minus(
    protocolSideRevenueUSDDelta
  );
  market.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD.plus(
    interestAccumulatedUSD
  );
  market.cumulativeProtocolSideRevenueUSD =
    market.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenueUSDDelta);
  market.cumulativeSupplySideRevenueUSD =
    market.cumulativeSupplySideRevenueUSD.plus(supplySideRevenueUSDDelta);
  market.save();
  // update daily fields in marketDailySnapshot
  const dailySnapshot = getOrCreateMarketDailySnapshot(
    market,
    blockTimestamp,
    blockNumber
  );
  dailySnapshot.dailyTotalRevenueUSD = dailySnapshot.dailyTotalRevenueUSD.plus(
    interestAccumulatedUSD
  );
  dailySnapshot.dailyProtocolSideRevenueUSD =
    dailySnapshot.dailyProtocolSideRevenueUSD.plus(protocolSideRevenueUSDDelta);
  dailySnapshot.dailySupplySideRevenueUSD =
    dailySnapshot.dailySupplySideRevenueUSD.plus(supplySideRevenueUSDDelta);
  dailySnapshot.save();
  // update hourly fields in marketHourlySnapshot
  const hourlySnapshot = getOrCreateMarketHourlySnapshot(
    market,
    blockTimestamp,
    blockNumber
  );
  hourlySnapshot.hourlyTotalRevenueUSD =
    hourlySnapshot.hourlyTotalRevenueUSD.plus(interestAccumulatedUSD);
  hourlySnapshot.hourlyProtocolSideRevenueUSD =
    hourlySnapshot.hourlyProtocolSideRevenueUSD.plus(
      protocolSideRevenueUSDDelta
    );
  hourlySnapshot.hourlySupplySideRevenueUSD =
    hourlySnapshot.hourlySupplySideRevenueUSD.plus(supplySideRevenueUSDDelta);
  hourlySnapshot.save();
}
exports.updateMarket = updateMarket;
function updateMarketDeposit(
  comptrollerAddr,
  market,
  underlyingToken,
  totalSupplyResult,
  event
) {
  if (totalSupplyResult.reverted) {
    graph_ts_1.log.warning(
      "[updateMarket] Failed to get totalSupply of Market {}",
      [market.id]
    );
  } else {
    market.outputTokenSupply = totalSupplyResult.value;
  }
  // get correct outputTokenDecimals for generic exchangeRate calculation
  let outputTokenDecimals = constants_1.cTokenDecimals;
  if (market.outputToken) {
    const outputToken = schema_1.Token.load(market.outputToken);
    if (!outputToken) {
      graph_ts_1.log.warning("[updateMarket] Output token not found: {}", [
        market.outputToken,
      ]);
    } else {
      outputTokenDecimals = outputToken.decimals;
    }
  }
  const underlyingTokenPriceUSD = market.inputTokenPriceUSD;
  // calculate inputTokenBalance only if exchangeRate is updated properly
  // mantissaFactor = (inputTokenDecimals - outputTokenDecimals)  (Note: can be negative)
  // inputTokenBalance = (outputSupply * exchangeRate) * (10 ^ mantissaFactor)
  const inputTokenBalanceBD = (0, constants_1.BDChangeDecimals)(
    market.outputTokenSupply.toBigDecimal().times(market.exchangeRate),
    outputTokenDecimals,
    underlyingToken.decimals
  ).truncate(0);
  market.inputTokenBalance = graph_ts_1.BigInt.fromString(
    inputTokenBalanceBD.toString()
  );
  const underlyingSupplyUSD = market.inputTokenBalance
    .toBigDecimal()
    .div((0, constants_1.exponentToBigDecimal)(underlyingToken.decimals))
    .times(underlyingTokenPriceUSD);
  market.totalValueLockedUSD = underlyingSupplyUSD;
  market.totalDepositBalanceUSD = underlyingSupplyUSD;
  market.save();
  updateProtocol(comptrollerAddr);
  snapshotFinancials(
    comptrollerAddr,
    event.block.number,
    event.block.timestamp
  );
}
exports.updateMarketDeposit = updateMarketDeposit;
function updateProtocol(comptrollerAddr) {
  const protocol = schema_1.LendingProtocol.load(comptrollerAddr.toHexString());
  if (!protocol) {
    graph_ts_1.log.error(
      "[updateProtocol] Protocol not found, this SHOULD NOT happen",
      []
    );
    return;
  }
  let totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
  let totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  let totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
  let cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
  let cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
  let cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
  let cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  let cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  let cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
  for (let i = 0; i < protocol._marketIDs.length; i++) {
    const market = schema_1.Market.load(protocol._marketIDs[i]);
    if (!market) {
      graph_ts_1.log.warning("[updateProtocol] Market not found: {}", [
        protocol._marketIDs[i],
      ]);
      // best effort
      continue;
    }
    totalValueLockedUSD = totalValueLockedUSD.plus(market.totalValueLockedUSD);
    totalDepositBalanceUSD = totalDepositBalanceUSD.plus(
      market.totalDepositBalanceUSD
    );
    totalBorrowBalanceUSD = totalBorrowBalanceUSD.plus(
      market.totalBorrowBalanceUSD
    );
    cumulativeBorrowUSD = cumulativeBorrowUSD.plus(market.cumulativeBorrowUSD);
    cumulativeDepositUSD = cumulativeDepositUSD.plus(
      market.cumulativeDepositUSD
    );
    cumulativeLiquidateUSD = cumulativeLiquidateUSD.plus(
      market.cumulativeLiquidateUSD
    );
    cumulativeTotalRevenueUSD = cumulativeTotalRevenueUSD.plus(
      market.cumulativeTotalRevenueUSD
    );
    cumulativeProtocolSideRevenueUSD = cumulativeProtocolSideRevenueUSD.plus(
      market.cumulativeProtocolSideRevenueUSD
    );
    cumulativeSupplySideRevenueUSD = cumulativeSupplySideRevenueUSD.plus(
      market.cumulativeSupplySideRevenueUSD
    );
  }
  protocol.totalValueLockedUSD = totalValueLockedUSD;
  protocol.totalDepositBalanceUSD = totalDepositBalanceUSD;
  protocol.totalBorrowBalanceUSD = totalBorrowBalanceUSD;
  protocol.cumulativeBorrowUSD = cumulativeBorrowUSD;
  protocol.cumulativeDepositUSD = cumulativeDepositUSD;
  protocol.cumulativeLiquidateUSD = cumulativeLiquidateUSD;
  protocol.cumulativeTotalRevenueUSD = cumulativeTotalRevenueUSD;
  protocol.cumulativeProtocolSideRevenueUSD = cumulativeProtocolSideRevenueUSD;
  protocol.cumulativeSupplySideRevenueUSD = cumulativeSupplySideRevenueUSD;
  protocol.save();
}
exports.updateProtocol = updateProtocol;
////////////////////////
//// Entity Getters ////
////////////////////////
function _getOrCreateProtocol(protocolData) {
  let protocol = schema_1.LendingProtocol.load(
    protocolData.comptrollerAddr.toHexString()
  );
  if (!protocol) {
    protocol = new schema_1.LendingProtocol(
      protocolData.comptrollerAddr.toHexString()
    );
    protocol.name = protocolData.name;
    protocol.slug = protocolData.slug;
    protocol.network = protocolData.network;
    protocol.type = constants_1.ProtocolType.LENDING;
    protocol.lendingType = constants_1.LendingType.POOLED;
    protocol.riskType = constants_1.RiskType.GLOBAL;
    // Set quantitative data params
    protocol.cumulativeUniqueUsers = 0;
    protocol.cumulativeUniqueDepositors = 0;
    protocol.cumulativeUniqueBorrowers = 0;
    protocol.cumulativeUniqueLiquidators = 0;
    protocol.cumulativeUniqueLiquidatees = 0;
    protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
    protocol.totalPoolCount = constants_1.INT_ZERO;
    protocol.openPositionCount = 0;
    protocol.cumulativePositionCount = 0;
    protocol._marketIDs = [];
    // set liquidation incentive
    if (protocolData.liquidationIncentiveMantissaResult.reverted) {
      graph_ts_1.log.warning(
        "[getOrCreateProtocol] liquidationIncentiveMantissaResult reverted",
        []
      );
      protocol._liquidationIncentive = constants_1.BIGDECIMAL_ZERO;
    } else {
      protocol._liquidationIncentive =
        protocolData.liquidationIncentiveMantissaResult.value
          .toBigDecimal()
          .div(constants_1.mantissaFactorBD)
          .times(constants_1.BIGDECIMAL_HUNDRED);
    }
    if (protocolData.oracleResult.reverted) {
      graph_ts_1.log.warning("[getOrCreateProtocol] oracleResult reverted", []);
      protocol._priceOracle = "";
    } else {
      protocol._priceOracle = protocolData.oracleResult.value.toHexString();
    }
  }
  protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
  protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
  protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
  protocol.save();
  return protocol;
}
exports._getOrCreateProtocol = _getOrCreateProtocol;
function createAccount(accountID) {
  const account = new schema_1.Account(accountID);
  account.positionCount = 0;
  account.openPositionCount = 0;
  account.closedPositionCount = 0;
  account.depositCount = 0;
  account.withdrawCount = 0;
  account.borrowCount = 0;
  account.repayCount = 0;
  account.liquidateCount = 0;
  account.liquidationCount = 0;
  account._enabledCollaterals = [];
  account.save();
  return account;
}
/////////////////
//// Helpers ////
/////////////////
function setSupplyInterestRate(marketID, rate) {
  setInterestRate(marketID, rate, true);
}
exports.setSupplyInterestRate = setSupplyInterestRate;
function setBorrowInterestRate(marketID, rate) {
  setInterestRate(marketID, rate, false);
}
exports.setBorrowInterestRate = setBorrowInterestRate;
function setInterestRate(marketID, rate, isSupply) {
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[setInterestRate] Market not found: {}", [
      marketID,
    ]);
    return;
  }
  if (market.rates.length < 2) {
    graph_ts_1.log.warning(
      "[setInterestRate] Market has less than 2 rates: {}",
      [marketID]
    );
    return;
  }
  const supplyInterestRateID = market.rates[0];
  const borrowInterestRateID = market.rates[1];
  const supplyInterestRate = schema_1.InterestRate.load(supplyInterestRateID);
  if (!supplyInterestRate) {
    graph_ts_1.log.warning(
      "[setInterestRate] Supply interest rate not found: {}",
      [supplyInterestRateID]
    );
    return;
  }
  const borrowInterestRate = schema_1.InterestRate.load(borrowInterestRateID);
  if (!borrowInterestRate) {
    graph_ts_1.log.warning(
      "[setInterestRate] Borrow interest rate not found: {}",
      [borrowInterestRateID]
    );
    return;
  }
  if (isSupply) {
    supplyInterestRate.rate = rate;
    supplyInterestRate.save();
  } else {
    borrowInterestRate.rate = rate;
    borrowInterestRate.save();
  }
  market.rates = [supplyInterestRateID, borrowInterestRateID];
  market.save();
}
function getOrCreateMarketDailySnapshot(market, blockTimestamp, blockNumber) {
  const snapshotID = getMarketDailySnapshotID(
    market.id,
    blockTimestamp.toI32()
  );
  let snapshot = schema_1.MarketDailySnapshot.load(snapshotID);
  if (!snapshot) {
    snapshot = new schema_1.MarketDailySnapshot(snapshotID);
    // initialize zero values to ensure no null runtime errors
    snapshot.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.protocol = market.protocol;
    snapshot.market = market.id;
  }
  snapshot.rates = getSnapshotRates(
    market.rates,
    (blockTimestamp.toI32() / constants_1.SECONDS_PER_DAY).toString()
  );
  snapshot.totalValueLockedUSD = market.totalValueLockedUSD;
  snapshot.cumulativeSupplySideRevenueUSD =
    market.cumulativeSupplySideRevenueUSD;
  snapshot.cumulativeProtocolSideRevenueUSD =
    market.cumulativeProtocolSideRevenueUSD;
  snapshot.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
  snapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
  snapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
  snapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
  snapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
  snapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
  snapshot.inputTokenBalance = market.inputTokenBalance;
  snapshot.outputTokenSupply = market.outputTokenSupply;
  snapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
  snapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
  snapshot.exchangeRate = market.exchangeRate;
  snapshot.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
  snapshot.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
  snapshot.blockNumber = blockNumber;
  snapshot.timestamp = blockTimestamp;
  snapshot.save();
  return snapshot;
}
exports.getOrCreateMarketDailySnapshot = getOrCreateMarketDailySnapshot;
function getOrCreateMarketHourlySnapshot(market, blockTimestamp, blockNumber) {
  const snapshotID = getMarketHourlySnapshotID(
    market.id,
    blockTimestamp.toI32()
  );
  let snapshot = schema_1.MarketHourlySnapshot.load(snapshotID);
  if (!snapshot) {
    snapshot = new schema_1.MarketHourlySnapshot(snapshotID);
    // initialize zero values to ensure no null runtime errors
    snapshot.hourlyDepositUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.hourlyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.hourlyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.hourlyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.hourlyRepayUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    snapshot.protocol = market.protocol;
    snapshot.market = market.id;
  }
  snapshot.blockNumber = blockNumber;
  snapshot.timestamp = blockTimestamp;
  snapshot.rates = getSnapshotRates(
    market.rates,
    (blockTimestamp.toI32() / constants_1.SECONDS_PER_HOUR).toString()
  );
  snapshot.totalValueLockedUSD = market.totalValueLockedUSD;
  snapshot.cumulativeSupplySideRevenueUSD =
    market.cumulativeSupplySideRevenueUSD;
  snapshot.cumulativeProtocolSideRevenueUSD =
    market.cumulativeProtocolSideRevenueUSD;
  snapshot.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
  snapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
  snapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
  snapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
  snapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
  snapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
  snapshot.inputTokenBalance = market.inputTokenBalance;
  snapshot.outputTokenSupply = market.outputTokenSupply;
  snapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
  snapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
  snapshot.exchangeRate = market.exchangeRate;
  snapshot.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
  snapshot.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
  snapshot.save();
  return snapshot;
}
exports.getOrCreateMarketHourlySnapshot = getOrCreateMarketHourlySnapshot;
function getTokenPriceUSD(getUnderlyingPriceResult, underlyingDecimals) {
  const mantissaDecimalFactor = 18 - underlyingDecimals + 18;
  const bdFactor = (0, constants_1.exponentToBigDecimal)(mantissaDecimalFactor);
  return getOrElse(getUnderlyingPriceResult, constants_1.BIGINT_ZERO)
    .toBigDecimal()
    .div(bdFactor);
}
exports.getTokenPriceUSD = getTokenPriceUSD;
function getMarketHourlySnapshotID(marketID, timestamp) {
  return marketID
    .concat("-")
    .concat((timestamp / constants_1.SECONDS_PER_HOUR).toString());
}
function getMarketDailySnapshotID(marketID, timestamp) {
  return marketID
    .concat("-")
    .concat((timestamp / constants_1.SECONDS_PER_DAY).toString());
}
exports.getMarketDailySnapshotID = getMarketDailySnapshotID;
// A series of side effects on position added
// They include:
// * Create a new position when needed or reuse the exisitng position
// * Update position related data in protocol, market, account
// * Take position snapshot
function addPosition(
  protocol,
  market,
  account,
  balanceResult,
  side,
  eventType,
  event
) {
  const counterID = account.id
    .concat("-")
    .concat(market.id)
    .concat("-")
    .concat(side);
  let positionCounter = schema_1._PositionCounter.load(counterID);
  if (!positionCounter) {
    positionCounter = new schema_1._PositionCounter(counterID);
    positionCounter.nextCount = 0;
    positionCounter.save();
  }
  const positionID = positionCounter.id
    .concat("-")
    .concat(positionCounter.nextCount.toString());
  let position = schema_1.Position.load(positionID);
  const openPosition = position == null;
  if (openPosition) {
    position = new schema_1.Position(positionID);
    position.account = account.id;
    position.market = market.id;
    position.hashOpened = event.transaction.hash.toHexString();
    position.blockNumberOpened = event.block.number;
    position.timestampOpened = event.block.timestamp;
    position.side = side;
    if (side == constants_1.PositionSide.LENDER) {
      position.isCollateral =
        account._enabledCollaterals.indexOf(market.id) >= 0;
    }
    position.balance = constants_1.BIGINT_ZERO;
    position.depositCount = 0;
    position.withdrawCount = 0;
    position.borrowCount = 0;
    position.repayCount = 0;
    position.liquidationCount = 0;
    position.save();
  }
  position = position;
  if (balanceResult.reverted) {
    graph_ts_1.log.warning(
      "[addPosition] Fetch balance of {} from {} reverted",
      [account.id, market.id]
    );
  } else {
    position.balance = balanceResult.value;
  }
  if (eventType == EventType.Deposit) {
    position.depositCount += 1;
  } else if (eventType == EventType.Borrow) {
    position.borrowCount += 1;
  }
  position.save();
  if (openPosition) {
    //
    // update account position
    //
    account.positionCount += 1;
    account.openPositionCount += 1;
    account.save();
    //
    // update market position
    //
    market.positionCount += 1;
    market.openPositionCount += 1;
    if (eventType == EventType.Deposit) {
      market.lendingPositionCount += 1;
    } else if (eventType == EventType.Borrow) {
      market.borrowingPositionCount += 1;
    }
    market.save();
    //
    // update protocol position
    //
    protocol.cumulativePositionCount += 1;
    protocol.openPositionCount += 1;
    protocol.save();
  }
  //
  // take position snapshot
  //
  snapshotPosition(position, event);
  return positionID;
}
// A series of side effects on position subtracted
// They include:
// * Close a position when needed or reuse the exisitng position
// * Update position related data in protocol, market, account
// * Take position snapshot
function subtractPosition(
  protocol,
  market,
  account,
  balanceResult,
  side,
  eventType,
  event
) {
  const counterID = account.id
    .concat("-")
    .concat(market.id)
    .concat("-")
    .concat(side);
  const positionCounter = schema_1._PositionCounter.load(counterID);
  if (!positionCounter) {
    graph_ts_1.log.warning("[subtractPosition] position counter {} not found", [
      counterID,
    ]);
    return null;
  }
  const positionID = positionCounter.id
    .concat("-")
    .concat(positionCounter.nextCount.toString());
  const position = schema_1.Position.load(positionID);
  if (!position) {
    graph_ts_1.log.warning("[subtractPosition] position {} not found", [
      positionID,
    ]);
    return null;
  }
  if (balanceResult.reverted) {
    graph_ts_1.log.warning(
      "[subtractPosition] Fetch balance of {} from {} reverted",
      [account.id, market.id]
    );
  } else {
    position.balance = balanceResult.value;
  }
  if (eventType == EventType.Withdraw) {
    position.withdrawCount += 1;
  } else if (eventType == EventType.Repay) {
    position.repayCount += 1;
  }
  position.save();
  const closePosition = position.balance == constants_1.BIGINT_ZERO;
  if (closePosition) {
    //
    // update position counter
    //
    positionCounter.nextCount += 1;
    positionCounter.save();
    //
    // close position
    //
    position.hashClosed = event.transaction.hash.toHexString();
    position.blockNumberClosed = event.block.number;
    position.timestampClosed = event.block.timestamp;
    position.save();
    //
    // update account position
    //
    account.openPositionCount -= 1;
    account.closedPositionCount += 1;
    account.save();
    //
    // update market position
    //
    market.openPositionCount -= 1;
    market.closedPositionCount += 1;
    market.save();
    //
    // update protocol position
    //
    protocol.openPositionCount -= 1;
    protocol.save();
  }
  //
  // update position snapshot
  //
  snapshotPosition(position, event);
  return positionID;
}
function convertRatePerUnitToAPY(ratePerUnit, unitPerYear) {
  return ratePerUnit
    .times(graph_ts_1.BigInt.fromI32(unitPerYear))
    .toBigDecimal()
    .div(constants_1.mantissaFactorBD)
    .times(constants_1.BIGDECIMAL_HUNDRED);
}
exports.convertRatePerUnitToAPY = convertRatePerUnitToAPY;
function getOrElse(result, defaultValue) {
  if (result.reverted) {
    return defaultValue;
  }
  return result.value;
}
exports.getOrElse = getOrElse;
//
//
// create seperate InterestRate Entities for each market snapshot
// this is needed to prevent snapshot rates from being pointers to the current rate
function getSnapshotRates(rates, timeSuffix) {
  const snapshotRates = [];
  for (let i = 0; i < rates.length; i++) {
    const rate = schema_1.InterestRate.load(rates[i]);
    if (!rate) {
      graph_ts_1.log.warning(
        "[getSnapshotRates] rate {} not found, should not happen",
        [rates[i]]
      );
      continue;
    }
    // create new snapshot rate
    const snapshotRateId = rates[i].concat("-").concat(timeSuffix);
    const snapshotRate = new schema_1.InterestRate(snapshotRateId);
    snapshotRate.side = rate.side;
    snapshotRate.type = rate.type;
    snapshotRate.rate = rate.rate;
    snapshotRate.save();
    snapshotRates.push(snapshotRateId);
  }
  return snapshotRates;
}
function snapshotPosition(position, event) {
  const snapshot = new schema_1.PositionSnapshot(
    position.id
      .concat("-")
      .concat(event.transaction.hash.toHexString())
      .concat("-")
      .concat(event.logIndex.toString())
  );
  snapshot.hash = event.transaction.hash.toHexString();
  snapshot.logIndex = event.logIndex.toI32();
  snapshot.nonce = event.transaction.nonce;
  snapshot.position = position.id;
  snapshot.balance = position.balance;
  snapshot.blockNumber = event.block.number;
  snapshot.timestamp = event.block.timestamp;
  snapshot.save();
}
//
//
// if the flag is set to tru on _handleAccrueInterest() all markets will update price
// this is used to ensure there is no stale pricing data
function updateAllMarketPrices(comptrollerAddr, blockNumber) {
  const protocol = schema_1.LendingProtocol.load(comptrollerAddr.toHexString());
  if (!protocol) {
    graph_ts_1.log.warning("[updateAllMarketPrices] protocol not found: {}", [
      comptrollerAddr.toHexString(),
    ]);
    return;
  }
  const priceOracle = PriceOracle_1.PriceOracle.bind(
    graph_ts_1.Address.fromString(protocol._priceOracle)
  );
  for (let i = 0; i < protocol._marketIDs.length; i++) {
    const market = schema_1.Market.load(protocol._marketIDs[i]);
    if (!market) {
      break;
    }
    const underlyingToken = schema_1.Token.load(market.inputToken);
    if (!underlyingToken) {
      break;
    }
    // update market price
    const underlyingTokenPriceUSD = getTokenPriceUSD(
      priceOracle.try_getUnderlyingPrice(
        graph_ts_1.Address.fromString(market.id)
      ),
      underlyingToken.decimals
    );
    underlyingToken.lastPriceUSD = underlyingTokenPriceUSD;
    underlyingToken.lastPriceBlockNumber = blockNumber;
    underlyingToken.save();
    market.inputTokenPriceUSD = underlyingTokenPriceUSD;
    // update TVL, supplyUSD, borrowUSD
    market.totalDepositBalanceUSD = market.inputTokenBalance
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(underlyingToken.decimals))
      .times(underlyingTokenPriceUSD);
    market.totalBorrowBalanceUSD = market._borrowBalance
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(underlyingToken.decimals))
      .times(underlyingTokenPriceUSD);
    market.totalValueLockedUSD = market.inputTokenBalance
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(underlyingToken.decimals))
      .times(underlyingTokenPriceUSD);
    market.save();
  }
}
exports.updateAllMarketPrices = updateAllMarketPrices;
//
//
// This function finds the position modified by a liquidateBorrow()
function whichPosition(account, market) {
  // check if position has been created
  const counterID = account
    .toHexString()
    .concat("-")
    .concat(market)
    .concat("-")
    .concat(constants_1.PositionSide.BORROWER);
  const positionCounter = schema_1._PositionCounter.load(counterID);
  if (!positionCounter) {
    graph_ts_1.log.warning("[whichPosition] position counter {} not found", [
      counterID,
    ]);
    return null;
  }
  // first check if the position was not closed
  // ie, nextPosition is not associated with a new position yet
  let positionID = counterID
    .concat("-")
    .concat(positionCounter.nextCount.toString());
  let position = schema_1.Position.load(positionID);
  if (!position) {
    // next check if the previous position exists
    // ie, the position associated was closed
    positionID = counterID
      .concat("-")
      .concat((positionCounter.nextCount--).toString());
    position = schema_1.Position.load(positionID);
    if (!position) {
      graph_ts_1.log.warning(
        "[whichPosition] position not found for liquidate",
        []
      );
      return null;
    }
  }
  // update position liquidation count
  position.liquidationCount += 1;
  position.save();
  return position.id;
}
