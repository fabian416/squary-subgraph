"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLogAccrue =
  exports.handleLogExchangeRate =
  exports.handleLogRepay =
  exports.handleLiquidation =
  exports.handleLogBorrow =
  exports.handleLogRemoveCollateral =
  exports.handleLogAddCollateral =
  exports.handleLogDeploy =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const DegenBox_1 = require("../generated/BentoBox/DegenBox");
const Cauldron_1 = require("../generated/templates/Cauldron/Cauldron");
const MarketOracle_1 = require("../generated/templates/Cauldron/MarketOracle");
const schema_1 = require("../generated/schema");
const constants_1 = require("./common/constants");
const numbers_1 = require("./common/utils/numbers");
const getters_1 = require("./common/getters");
const templates_1 = require("../generated/templates");
const metrics_1 = require("./common/metrics");
const setters_1 = require("./common/setters");
const positions_1 = require("./positions");
function handleLogDeploy(event) {
  const account = event.transaction.from.toHex().toLowerCase();
  if (constants_1.ABRA_ACCOUNTS.indexOf(account) > constants_1.NEG_INT_ONE) {
    (0, setters_1.createMarket)(
      event.params.cloneAddress.toHexString(),
      event.block.number,
      event.block.timestamp
    );
    templates_1.Cauldron.create(event.params.cloneAddress);
  }
}
exports.handleLogDeploy = handleLogDeploy;
function handleLogAddCollateral(event) {
  const depositEvent = new schema_1.Deposit(
    event.transaction.hash.toHexString() +
      "-" +
      event.transactionLogIndex.toString()
  );
  const market = (0, getters_1.getMarket)(event.address.toHexString());
  if (!market) {
    return;
  }
  // update market prices
  updateAllTokenPrices(event.block.number);
  const CauldronContract = Cauldron_1.Cauldron.bind(event.address);
  const collateralToken = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(market.inputToken)
  );
  const tokenPriceUSD = collateralToken.lastPriceUSD;
  const amountUSD = (0, numbers_1.bigIntToBigDecimal)(
    event.params.share,
    collateralToken.decimals
  ).times(tokenPriceUSD);
  const protocol = (0, getters_1.getOrCreateLendingProtocol)();
  const account = (0, positions_1.getOrCreateAccount)(
    event.params.to.toHexString(),
    protocol
  );
  depositEvent.hash = event.transaction.hash.toHexString();
  depositEvent.nonce = event.transaction.nonce;
  depositEvent.logIndex = event.transactionLogIndex.toI32();
  depositEvent.market = market.id;
  depositEvent.account = account.id;
  depositEvent.blockNumber = event.block.number;
  depositEvent.timestamp = event.block.timestamp;
  depositEvent.market = market.id;
  depositEvent.asset = collateralToken.id;
  // Amount needs to be calculated differently as bentobox deals shares and amounts in a different way.
  // usage of toAmount function converts shares to actual amount based on collateral
  depositEvent.amount = DegenBox_1.DegenBox.bind(
    CauldronContract.bentoBox()
  ).toAmount(
    graph_ts_1.Address.fromString(collateralToken.id),
    event.params.share,
    false
  );
  depositEvent.amountUSD = amountUSD;
  depositEvent.position = (0, positions_1.updatePositions)(
    constants_1.PositionSide.LENDER,
    protocol,
    market,
    constants_1.EventType.DEPOSIT,
    account,
    event
  );
  depositEvent.save();
  (0, metrics_1.updateMarketStats)(
    market.id,
    constants_1.EventType.DEPOSIT,
    collateralToken.id,
    event.params.share,
    event
  );
  (0, metrics_1.updateTVL)(event);
  (0, metrics_1.updateMarketMetrics)(event); // must run updateMarketStats first as updateMarketMetrics uses values updated in updateMarketStats
  (0, metrics_1.updateUsageMetrics)(event, event.params.from, event.params.to);
}
exports.handleLogAddCollateral = handleLogAddCollateral;
function handleLogRemoveCollateral(event) {
  let liquidation = false;
  if (event.params.from.toHexString() != event.params.to.toHexString()) {
    (0, setters_1.createLiquidateEvent)(event);
    liquidation = true;
  }
  const withdrawalEvent = new schema_1.Withdraw(
    event.transaction.hash.toHexString() +
      "-" +
      event.transactionLogIndex.toString()
  );
  const market = (0, getters_1.getMarket)(event.address.toHexString());
  if (!market) {
    return;
  }
  // update market prices
  updateAllTokenPrices(event.block.number);
  const collateralToken = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(market.inputToken)
  );
  const CauldronContract = Cauldron_1.Cauldron.bind(event.address);
  const tokenPriceUSD = collateralToken.lastPriceUSD;
  const amountUSD = (0, numbers_1.bigIntToBigDecimal)(
    event.params.share,
    collateralToken.decimals
  ).times(tokenPriceUSD);
  const protocol = (0, getters_1.getOrCreateLendingProtocol)();
  const account = (0, positions_1.getOrCreateAccount)(
    event.params.from.toHexString(),
    protocol
  );
  withdrawalEvent.hash = event.transaction.hash.toHexString();
  withdrawalEvent.nonce = event.transaction.nonce;
  withdrawalEvent.logIndex = event.transactionLogIndex.toI32();
  withdrawalEvent.market = market.id;
  withdrawalEvent.account = account.id;
  withdrawalEvent.blockNumber = event.block.number;
  withdrawalEvent.timestamp = event.block.timestamp;
  withdrawalEvent.market = market.id;
  withdrawalEvent.asset = collateralToken.id;
  withdrawalEvent.amount = DegenBox_1.DegenBox.bind(
    CauldronContract.bentoBox()
  ).toAmount(
    graph_ts_1.Address.fromString(collateralToken.id),
    event.params.share,
    false
  );
  withdrawalEvent.amountUSD = amountUSD;
  withdrawalEvent.position = (0, positions_1.updatePositions)(
    constants_1.PositionSide.LENDER,
    protocol,
    market,
    constants_1.EventType.WITHDRAW,
    account,
    event,
    liquidation
  );
  withdrawalEvent.save();
  (0, metrics_1.updateMarketStats)(
    market.id,
    constants_1.EventType.WITHDRAW,
    collateralToken.id,
    event.params.share,
    event
  );
  (0, metrics_1.updateTVL)(event);
  (0, metrics_1.updateMarketMetrics)(event); // must run updateMarketStats first as updateMarketMetrics uses values updated in updateMarketStats
  (0, metrics_1.updateUsageMetrics)(event, event.params.from, event.params.to);
}
exports.handleLogRemoveCollateral = handleLogRemoveCollateral;
function handleLogBorrow(event) {
  const borrowEvent = new schema_1.Borrow(
    event.transaction.hash.toHexString() +
      "-" +
      event.transactionLogIndex.toString()
  );
  const market = (0, getters_1.getMarket)(event.address.toHexString());
  if (!market) {
    return;
  }
  // update market prices
  updateAllTokenPrices(event.block.number);
  const mimToken = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(
      (0, getters_1.getMIMAddress)(graph_ts_1.dataSource.network())
    )
  );
  const mimPriceUSD = mimToken.lastPriceUSD;
  const amountUSD = (0, numbers_1.bigIntToBigDecimal)(
    event.params.amount,
    constants_1.DEFAULT_DECIMALS
  ).times(mimPriceUSD);
  const protocol = (0, getters_1.getOrCreateLendingProtocol)();
  const account = (0, positions_1.getOrCreateAccount)(
    event.params.from.toHexString(),
    protocol
  );
  borrowEvent.hash = event.transaction.hash.toHexString();
  borrowEvent.nonce = event.transaction.nonce;
  borrowEvent.logIndex = event.transactionLogIndex.toI32();
  borrowEvent.market = market.id;
  borrowEvent.account = account.id;
  borrowEvent.blockNumber = event.block.number;
  borrowEvent.timestamp = event.block.timestamp;
  borrowEvent.market = market.id;
  borrowEvent.asset = mimToken.id;
  borrowEvent.amount = event.params.amount;
  borrowEvent.amountUSD = amountUSD;
  borrowEvent.position = (0, positions_1.updatePositions)(
    constants_1.PositionSide.BORROWER,
    protocol,
    market,
    constants_1.EventType.BORROW,
    account,
    event
  );
  borrowEvent.save();
  (0, metrics_1.updateBorrowAmount)(market);
  (0, metrics_1.updateTotalBorrows)(event);
  (0, metrics_1.updateMarketStats)(
    market.id,
    constants_1.EventType.BORROW,
    (0, getters_1.getMIMAddress)(graph_ts_1.dataSource.network()),
    event.params.amount,
    event
  );
  (0, metrics_1.updateMarketMetrics)(event); // must run updateMarketStats first as updateMarketMetrics uses values updated in updateMarketStats
  (0, metrics_1.updateUsageMetrics)(event, event.params.from, event.params.to);
}
exports.handleLogBorrow = handleLogBorrow;
// Liquidation steps
// - Liquidations are found in logRemoveCollateral event when from!=to, logRepay events are emitted directly after (logRemoveCollateral's log index +1)
// 1) When handling logRemoveCollateral emitted by a market contract, check if from!=to in the log receipt
// 2) If from!=to, save the collateral amount removed in Liquidate entity
// 3) In logRepay, also check if from!=to and check if we saved the tx_hash - log_index +1 in a Liquidate entity
//    - Retrieve Liquidate entity to obtain the collateral amount removed and subtract the MIM amount repayed from LogRepay to determine the profit in USD
function handleLiquidation(event) {
  // Retrieve cached liquidation that holds amount of collateral to help calculate profit usd (obtained from log remove collateral with from != to)
  const liquidateProxy = (0, getters_1.getLiquidateEvent)(event); // retrieve cached liquidation by subtracting 1 from the current event log index (as we registered the liquidation in logRemoveCollateral that occurs 1 log index before this event)
  if (!liquidateProxy) {
    graph_ts_1.log.error(
      "Liquidation {} not found in cache. Liquidation event must be registered in logRemoveCollateral event",
      [
        event.transaction.hash.toHexString() +
          "-" +
          event.transactionLogIndex.toString(),
      ]
    );
    return;
  }
  const liquidateEvent = new schema_1.Liquidate(
    "liquidate" +
      "-" +
      event.transaction.hash.toHexString() +
      "-" +
      event.transactionLogIndex.toString()
  );
  liquidateEvent.amount = liquidateProxy.amount;
  const market = (0, getters_1.getMarket)(event.address.toHexString());
  if (!market) {
    return;
  }
  const usageHourlySnapshot = (0,
  getters_1.getOrCreateUsageMetricsHourlySnapshot)(event);
  const usageDailySnapshot = (0,
  getters_1.getOrCreateUsageMetricsDailySnapshot)(event);
  const marketHourlySnapshot = (0, getters_1.getOrCreateMarketHourlySnapshot)(
    event,
    market.id
  );
  const marketDailySnapshot = (0, getters_1.getOrCreateMarketDailySnapshot)(
    event,
    market.id
  );
  if (!marketHourlySnapshot || !marketDailySnapshot) {
    return;
  }
  // update market prices
  updateAllTokenPrices(event.block.number);
  const financialsDailySnapshot = (0, getters_1.getOrCreateFinancials)(event);
  const collateralToken = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(market.inputToken)
  );
  const mimToken = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(
      (0, getters_1.getMIMAddress)(graph_ts_1.dataSource.network())
    )
  );
  const CauldronContract = Cauldron_1.Cauldron.bind(event.address);
  const tokenPriceUSD = collateralToken.lastPriceUSD;
  const collateralAmount = DegenBox_1.DegenBox.bind(
    CauldronContract.bentoBox()
  ).toAmount(
    graph_ts_1.Address.fromString(collateralToken.id),
    liquidateEvent.amount,
    false
  );
  const protocol = (0, getters_1.getOrCreateLendingProtocol)();
  const collateralAmountUSD = (0, numbers_1.bigIntToBigDecimal)(
    collateralAmount,
    collateralToken.decimals
  ).times(tokenPriceUSD);
  const mimAmountUSD = (0, numbers_1.bigIntToBigDecimal)(
    event.params.amount,
    constants_1.DEFAULT_DECIMALS
  ).times(
    (0, getters_1.getOrCreateToken)(
      graph_ts_1.Address.fromString(
        (0, getters_1.getMIMAddress)(graph_ts_1.dataSource.network())
      )
    ).lastPriceUSD
  );
  const liquidateeAccount = (0, positions_1.getOrCreateAccount)(
    event.params.to.toHexString(),
    protocol
  );
  const liquidatorAccount = (0, positions_1.getOrCreateAccount)(
    event.params.from.toHexString(),
    protocol
  );
  liquidateEvent.hash = event.transaction.hash.toHexString();
  liquidateEvent.nonce = event.transaction.nonce;
  liquidateEvent.logIndex = event.transactionLogIndex.toI32();
  liquidateEvent.liquidatee = liquidateeAccount.id;
  liquidateEvent.liquidator = liquidatorAccount.id;
  liquidateEvent.blockNumber = event.block.number;
  liquidateEvent.timestamp = event.block.timestamp;
  liquidateEvent.market = market.id;
  liquidateEvent.asset = mimToken.id;
  liquidateEvent.amount = collateralAmount;
  liquidateEvent.amountUSD = collateralAmountUSD;
  liquidateEvent.profitUSD = collateralAmountUSD.minus(mimAmountUSD);
  liquidateEvent.position = (0, positions_1.getLiquidatePosition)(
    constants_1.InterestRateSide.BORROW,
    market.id,
    event.params.to.toHexString()
  );
  liquidateEvent.save();
  usageHourlySnapshot.hourlyLiquidateCount += 1;
  usageHourlySnapshot.save();
  usageDailySnapshot.dailyLiquidateCount += 1;
  usageDailySnapshot.save();
  liquidateeAccount.liquidateCount = liquidateeAccount.liquidateCount + 1;
  liquidateeAccount.save();
  (0, positions_1.addAccountToProtocol)(
    constants_1.EventType.LIQUIDATEE,
    liquidateeAccount,
    event,
    protocol
  );
  liquidatorAccount.liquidationCount = liquidatorAccount.liquidationCount + 1;
  liquidatorAccount.save();
  (0, positions_1.addAccountToProtocol)(
    constants_1.EventType.LIQUIDATOR,
    liquidatorAccount,
    event,
    protocol
  );
  marketHourlySnapshot.hourlyLiquidateUSD =
    marketHourlySnapshot.hourlyLiquidateUSD.plus(collateralAmountUSD);
  marketDailySnapshot.dailyLiquidateUSD =
    marketDailySnapshot.dailyLiquidateUSD.plus(collateralAmountUSD);
  financialsDailySnapshot.dailyLiquidateUSD =
    financialsDailySnapshot.dailyLiquidateUSD.plus(collateralAmountUSD);
  const marketCumulativeLiquidateUSD =
    market.cumulativeLiquidateUSD.plus(collateralAmountUSD);
  market.cumulativeLiquidateUSD = marketCumulativeLiquidateUSD;
  marketHourlySnapshot.cumulativeLiquidateUSD = marketCumulativeLiquidateUSD;
  marketDailySnapshot.cumulativeLiquidateUSD = marketCumulativeLiquidateUSD;
  marketHourlySnapshot.save();
  marketDailySnapshot.save();
  market.save();
  const protocolCumulativeLiquidateUSD =
    protocol.cumulativeLiquidateUSD.plus(collateralAmountUSD);
  financialsDailySnapshot.cumulativeLiquidateUSD =
    protocolCumulativeLiquidateUSD;
  protocol.cumulativeLiquidateUSD = protocolCumulativeLiquidateUSD;
  protocol.save();
  financialsDailySnapshot.save();
}
exports.handleLiquidation = handleLiquidation;
function handleLogRepay(event) {
  const invoker = event.transaction.from.toHex().toLowerCase();
  const address = event.address.toHex().toLowerCase();
  const to = event.transaction.to
    ? event.transaction.to.toHex().toLowerCase()
    : null;
  const user = event.params.to.toHex().toLowerCase();
  let liquidation = false;
  if ([invoker, address, to].indexOf(user) == -1) {
    handleLiquidation(event);
    liquidation = true;
  }
  // update market prices
  updateAllTokenPrices(event.block.number);
  const repayEvent = new schema_1.Repay(
    event.transaction.hash.toHexString() +
      "-" +
      event.transactionLogIndex.toString()
  );
  const market = (0, getters_1.getMarket)(event.address.toHexString());
  if (!market) {
    return;
  }
  const mimToken = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(
      (0, getters_1.getMIMAddress)(graph_ts_1.dataSource.network())
    )
  );
  const mimPriceUSD = mimToken.lastPriceUSD;
  const amountUSD = (0, numbers_1.bigIntToBigDecimal)(
    event.params.amount,
    constants_1.DEFAULT_DECIMALS
  ).times(mimPriceUSD);
  const protocol = (0, getters_1.getOrCreateLendingProtocol)();
  const account = (0, positions_1.getOrCreateAccount)(
    event.params.to.toHexString(),
    protocol
  );
  repayEvent.hash = event.transaction.hash.toHexString();
  repayEvent.nonce = event.transaction.nonce;
  repayEvent.logIndex = event.transactionLogIndex.toI32();
  repayEvent.market = market.id;
  repayEvent.account = account.id;
  repayEvent.blockNumber = event.block.number;
  repayEvent.timestamp = event.block.timestamp;
  repayEvent.market = market.id;
  repayEvent.asset = mimToken.id;
  repayEvent.amount = event.params.amount;
  repayEvent.amountUSD = amountUSD;
  repayEvent.position = (0, positions_1.updatePositions)(
    constants_1.PositionSide.BORROWER,
    protocol,
    market,
    constants_1.EventType.REPAY,
    account,
    event,
    liquidation
  );
  repayEvent.save();
  (0, metrics_1.updateBorrowAmount)(market);
  (0, metrics_1.updateTotalBorrows)(event);
  (0, metrics_1.updateMarketStats)(
    market.id,
    constants_1.EventType.REPAY,
    (0, getters_1.getMIMAddress)(graph_ts_1.dataSource.network()),
    event.params.part,
    event
  ); // smart contract code subs event.params.part from totalBorrow
  (0, metrics_1.updateMarketMetrics)(event); // must run updateMarketStats first as updateMarketMetrics uses values updated in updateMarketStats
  (0, metrics_1.updateUsageMetrics)(event, event.params.from, event.params.to);
}
exports.handleLogRepay = handleLogRepay;
function handleLogExchangeRate(event) {
  const market = (0, getters_1.getMarket)(event.address.toHexString());
  if (!market) {
    return;
  }
  const token = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(market.inputToken)
  );
  (0, setters_1.updateTokenPrice)(
    event.params.rate,
    token,
    market,
    event.block.number
  );
  (0, metrics_1.updateTVL)(event);
}
exports.handleLogExchangeRate = handleLogExchangeRate;
function handleLogAccrue(event) {
  const mimPriceUSD = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(
      (0, getters_1.getMIMAddress)(graph_ts_1.dataSource.network())
    )
  ).lastPriceUSD;
  const feesUSD = (0, numbers_1.bigIntToBigDecimal)(
    event.params.accruedAmount,
    constants_1.DEFAULT_DECIMALS
  ).times(mimPriceUSD);
  (0, metrics_1.updateFinancials)(event, feesUSD, event.address.toHexString());
}
exports.handleLogAccrue = handleLogAccrue;
// updates all input token prices using the price oracle
// this is a secondary option since not every market's price oracle "peekSpot()" will work
function updateAllTokenPrices(blockNumber) {
  const protocol = (0, getters_1.getOrCreateLendingProtocol)();
  for (let i = 0; i < protocol.marketIDList.length; i++) {
    const market = (0, getters_1.getMarket)(protocol.marketIDList[i]);
    if (!market) {
      graph_ts_1.log.warning("[updateAllTokenPrices] Market not found: {}", [
        protocol.marketIDList[i],
      ]);
      continue;
    }
    // check if price was already updated this block
    const inputToken = (0, getters_1.getOrCreateToken)(
      graph_ts_1.Address.fromString(market.inputToken)
    );
    if (
      inputToken.lastPriceBlockNumber &&
      inputToken.lastPriceBlockNumber.ge(blockNumber)
    ) {
      continue;
    }
    // load PriceOracle contract and get peek (real/current) exchange rate
    if (market.priceOracle === null) {
      graph_ts_1.log.warning(
        "[updateAllTokenPrices] Market {} has no priceOracle",
        [market.id]
      );
      continue;
    }
    const marketPriceOracle = MarketOracle_1.MarketOracle.bind(
      graph_ts_1.Address.fromBytes(market.priceOracle)
    );
    // get exchange rate for input token
    const exchangeRateCall = marketPriceOracle.try_peekSpot(
      graph_ts_1.Bytes.fromHexString("0x00")
    );
    if (
      exchangeRateCall.reverted ||
      exchangeRateCall.value == constants_1.BIGINT_ZERO
    ) {
      graph_ts_1.log.warning(
        "[updateAllTokenPrices] Market {} priceOracle peekSpot() failed",
        [market.id]
      );
      continue;
    }
    const exchangeRate = exchangeRateCall.value;
    (0, setters_1.updateTokenPrice)(
      exchangeRate,
      inputToken,
      market,
      blockNumber
    );
  }
}
