"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRepayment =
  exports.handleBorrow =
  exports.handleWithdraw =
  exports.handleDepositToReserve =
  exports.handleDeposit =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const account_1 = require("../helpers/account");
const position_1 = require("../helpers/position");
const actions_1 = require("../helpers/actions");
const market_1 = require("../helpers/market");
const token_1 = require("../helpers/token");
const market_2 = require("../update/market");
const shares_1 = require("../utils/shares");
const protocol_1 = require("../update/protocol");
const protocol_2 = require("../helpers/protocol");
const parser_1 = require("../utils/parser");
const const_1 = require("../utils/const");
const graph_ts_2 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
function handleDeposit(event) {
  const receipt = event.receipt;
  const logIndex = event.logIndex;
  const data = event.data;
  const deposit = (0, actions_1.getOrCreateDeposit)(
    receipt.outcome.id.toBase58().concat("-").concat(logIndex.toString()),
    receipt
  );
  deposit.logIndex = logIndex;
  const parsedData = (0, parser_1.parse0)(data);
  const account_id = parsedData[0];
  const amount = parsedData[1];
  const token_id = parsedData[2];
  const market = (0, market_1.getOrCreateMarket)(token_id);
  const protocol = (0, protocol_2.getOrCreateProtocol)();
  const dailySnapshot = (0, market_1.getOrCreateMarketDailySnapshot)(
    market,
    receipt
  );
  const hourlySnapshot = (0, market_1.getOrCreateMarketHourlySnapshot)(
    market,
    receipt
  );
  const usageDailySnapshot = (0,
  protocol_2.getOrCreateUsageMetricsDailySnapshot)(receipt);
  const usageHourlySnapshot = (0,
  protocol_2.getOrCreateUsageMetricsHourlySnapshot)(receipt);
  const financialDailySnapshot = (0,
  protocol_2.getOrCreateFinancialDailySnapshot)(receipt);
  const account = (0, account_1.getOrCreateAccount)(account_id);
  const counterID = account.id
    .concat("-")
    .concat(market.id)
    .concat("-")
    .concat(const_1.PositionSide.LENDER);
  let positionCounter = schema_1._PositionCounter.load(counterID);
  if (!positionCounter) {
    positionCounter = new schema_1._PositionCounter(counterID);
    positionCounter.nextCount = 0;
    account.positionCount += 1;
  }
  const position = (0, position_1.getOrCreatePosition)(
    account,
    market,
    const_1.PositionSide.LENDER,
    receipt,
    positionCounter.nextCount
  );
  const token = (0, token_1.getOrCreateToken)(token_id);
  deposit.account = account.id;
  deposit.amount = graph_ts_1.BigInt.fromString(amount);
  deposit.asset = token.id;
  deposit.market = market.id;
  deposit.position = position.id;
  deposit.amountUSD = deposit.amount
    .divDecimal(
      graph_ts_1.BigInt.fromI32(10)
        .pow(token.decimals + token.extraDecimals)
        .toBigDecimal()
    )
    .times(token.lastPriceUSD);
  // usage metrics
  const hourlyActiveAccount = schema_1.ActiveAccount.load(
    const_1.AccountTime.HOURLY.concat(account.id).concat(
      (0, const_1.NANOS_TO_HOUR)(
        receipt.block.header.timestampNanosec
      ).toString()
    )
  );
  const dailyActiveAccount = schema_1.ActiveAccount.load(
    const_1.AccountTime.DAILY.concat(account.id).concat(
      (0, const_1.NANOS_TO_DAY)(
        receipt.block.header.timestampNanosec
      ).toString()
    )
  );
  if (dailyActiveAccount == null) {
    usageDailySnapshot.dailyActiveDepositors += 1;
    usageDailySnapshot.dailyActiveUsers += 1;
  }
  if (hourlyActiveAccount == null) {
    usageHourlySnapshot.hourlyActiveUsers += 1;
  }
  usageDailySnapshot.dailyDepositCount += 1;
  usageDailySnapshot.dailyTransactionCount += 1;
  usageHourlySnapshot.hourlyDepositCount += 1;
  usageHourlySnapshot.hourlyTransactionCount += 1;
  position.depositCount += 1;
  position.balance = position.balance.plus(deposit.amount);
  // update account
  if (account.depositCount == 0) {
    protocol.cumulativeUniqueDepositors += 1;
    protocol.cumulativeUniqueUsers += 1;
  }
  account.depositCount += 1;
  // deposit amount
  market.outputTokenSupply = market.outputTokenSupply.plus(
    (0, shares_1.amount_to_shares)(
      (0, const_1.BI_BD)(deposit.amount),
      market.outputTokenSupply,
      market._totalDeposited
    )
  );
  market._totalDeposited = market._totalDeposited.plus(
    (0, const_1.BI_BD)(deposit.amount)
  );
  // historical
  market._totalDepositedHistory = market._totalDepositedHistory.plus(
    deposit.amount
  );
  market.cumulativeDepositUSD = market.cumulativeDepositUSD.plus(
    deposit.amountUSD
  );
  // snapshot
  dailySnapshot.dailyDepositUSD = dailySnapshot.dailyDepositUSD.plus(
    deposit.amountUSD
  );
  hourlySnapshot.hourlyDepositUSD = hourlySnapshot.hourlyDepositUSD.plus(
    deposit.amountUSD
  );
  financialDailySnapshot.dailyDepositUSD =
    financialDailySnapshot.dailyDepositUSD.plus(deposit.amountUSD);
  const positionSnapshot = (0, position_1.getOrCreatePositionSnapshot)(
    position,
    receipt
  );
  positionSnapshot.logIndex = logIndex;
  (0, market_2.updateMarket)(
    market,
    dailySnapshot,
    hourlySnapshot,
    financialDailySnapshot,
    receipt
  );
  positionCounter.save();
  positionSnapshot.save();
  financialDailySnapshot.save();
  usageDailySnapshot.save();
  usageHourlySnapshot.save();
  dailySnapshot.save();
  hourlySnapshot.save();
  market.save();
  account.save();
  deposit.save();
  position.save();
  protocol.save();
  (0, protocol_1.updateProtocol)();
}
exports.handleDeposit = handleDeposit;
function handleDepositToReserve(event) {
  const parsedData = (0, parser_1.parse0)(event.data);
  const amount = parsedData[1];
  const token_id = parsedData[2];
  const market = (0, market_1.getOrCreateMarket)(token_id);
  market._totalReserved = market._totalReserved.plus(
    graph_ts_2.BigDecimal.fromString(amount)
  );
  // for revenue calculation
  market._addedToReserve = market._addedToReserve.plus(
    graph_ts_2.BigDecimal.fromString(amount)
  );
  market.save();
}
exports.handleDepositToReserve = handleDepositToReserve;
function handleWithdraw(event) {
  const receipt = event.receipt;
  const logIndex = event.logIndex;
  const data = event.data;
  const withdraw = (0, actions_1.getOrCreateWithdrawal)(
    receipt.outcome.id.toBase58().concat("-").concat(logIndex.toString()),
    receipt
  );
  withdraw.logIndex = logIndex;
  const parsedData = (0, parser_1.parse0)(data);
  const account_id = parsedData[0];
  const amount = parsedData[1];
  const token_id = parsedData[2];
  const market = (0, market_1.getOrCreateMarket)(token_id.toString());
  const dailySnapshot = (0, market_1.getOrCreateMarketDailySnapshot)(
    market,
    receipt
  );
  const hourlySnapshot = (0, market_1.getOrCreateMarketHourlySnapshot)(
    market,
    receipt
  );
  const usageDailySnapshot = (0,
  protocol_2.getOrCreateUsageMetricsDailySnapshot)(receipt);
  const usageHourlySnapshot = (0,
  protocol_2.getOrCreateUsageMetricsHourlySnapshot)(receipt);
  const financialDailySnapshot = (0,
  protocol_2.getOrCreateFinancialDailySnapshot)(receipt);
  const account = (0, account_1.getOrCreateAccount)(account_id.toString());
  const counterID = account.id
    .concat("-")
    .concat(market.id)
    .concat("-")
    .concat(const_1.PositionSide.LENDER);
  const positionCounter = schema_1._PositionCounter.load(counterID);
  if (!positionCounter) {
    graph_ts_1.log.warning(
      "Lending position counter {} not found in withdraw",
      [counterID]
    );
    return;
  }
  const position = (0, position_1.getOrCreatePosition)(
    account,
    market,
    const_1.PositionSide.LENDER,
    receipt,
    positionCounter.nextCount
  );
  const token = (0, token_1.getOrCreateToken)(token_id.toString());
  withdraw.account = account.id;
  withdraw.amount = graph_ts_1.BigInt.fromString(amount.toString());
  withdraw.asset = token.id;
  withdraw.market = market.id;
  withdraw.position = position.id;
  withdraw.amountUSD = withdraw.amount
    .divDecimal(
      graph_ts_1.BigInt.fromI32(10)
        .pow(token.decimals + token.extraDecimals)
        .toBigDecimal()
    )
    .times(token.lastPriceUSD);
  // usage metrics
  const hourlyActiveAccount = schema_1.ActiveAccount.load(
    const_1.AccountTime.HOURLY.concat(account.id).concat(
      (0, const_1.NANOS_TO_HOUR)(
        receipt.block.header.timestampNanosec
      ).toString()
    )
  );
  const dailyActiveAccount = schema_1.ActiveAccount.load(
    const_1.AccountTime.DAILY.concat(account.id).concat(
      (0, const_1.NANOS_TO_DAY)(
        receipt.block.header.timestampNanosec
      ).toString()
    )
  );
  if (dailyActiveAccount == null) {
    usageDailySnapshot.dailyActiveUsers += 1;
  }
  if (hourlyActiveAccount == null) {
    usageHourlySnapshot.hourlyActiveUsers += 1;
  }
  usageDailySnapshot.dailyWithdrawCount += 1;
  usageDailySnapshot.dailyTransactionCount += 1;
  usageHourlySnapshot.hourlyWithdrawCount += 1;
  usageHourlySnapshot.hourlyTransactionCount += 1;
  position.withdrawCount += 1;
  // close if balance is zero
  if (position.balance.le(withdraw.amount)) {
    positionCounter.nextCount += 1;
    account.positionCount += 1;
    position.balance = const_1.BI_ZERO;
    account.openPositionCount -= 1;
    account.closedPositionCount += 1;
    market.openPositionCount -= 1;
    market.closedPositionCount += 1;
    market.lendingPositionCount -= 1;
    position.hashClosed = receipt.outcome.id.toBase58();
    position.timestampClosed = graph_ts_1.BigInt.fromU64(
      (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
    );
    position.blockNumberClosed = graph_ts_1.BigInt.fromU64(
      receipt.block.header.height
    );
  }
  account.withdrawCount = account.withdrawCount + 1;
  market._totalWithrawnHistory = market._totalWithrawnHistory.plus(
    withdraw.amount
  );
  market.outputTokenSupply = market.outputTokenSupply.minus(
    (0, shares_1.amount_to_shares)(
      (0, const_1.BI_BD)(withdraw.amount),
      market.outputTokenSupply,
      market._totalDeposited
    )
  );
  market._totalDeposited = market._totalDeposited.minus(
    (0, const_1.BI_BD)(withdraw.amount)
  );
  if (market._totalDeposited.lt(const_1.BD_ZERO)) {
    market._totalReserved = market._totalReserved.plus(market._totalDeposited);
    market._totalDeposited = const_1.BD_ZERO;
    market.outputTokenSupply = const_1.BI_ZERO;
    if (market._totalReserved.lt(const_1.BD_ZERO)) {
      graph_ts_1.log.warning("OVERFLOW :: market._totalReserved < 0", []);
      market._totalReserved = const_1.BD_ZERO;
    }
  }
  // snapshot
  dailySnapshot.dailyWithdrawUSD = dailySnapshot.dailyWithdrawUSD.plus(
    withdraw.amountUSD
  );
  hourlySnapshot.hourlyWithdrawUSD = hourlySnapshot.hourlyWithdrawUSD.plus(
    withdraw.amountUSD
  );
  financialDailySnapshot.dailyWithdrawUSD =
    financialDailySnapshot.dailyWithdrawUSD.plus(withdraw.amountUSD);
  const positionSnapshot = (0, position_1.getOrCreatePositionSnapshot)(
    position,
    receipt
  );
  positionSnapshot.logIndex = logIndex;
  (0, market_2.updateMarket)(
    market,
    dailySnapshot,
    hourlySnapshot,
    financialDailySnapshot,
    receipt
  );
  positionCounter.save();
  positionSnapshot.save();
  financialDailySnapshot.save();
  dailySnapshot.save();
  hourlySnapshot.save();
  usageDailySnapshot.save();
  usageHourlySnapshot.save();
  market.save();
  account.save();
  withdraw.save();
  position.save();
  (0, protocol_1.updateProtocol)();
}
exports.handleWithdraw = handleWithdraw;
function handleBorrow(event) {
  const receipt = event.receipt;
  const logIndex = event.logIndex;
  const data = event.data;
  const borrow = (0, actions_1.getOrCreateBorrow)(
    receipt.outcome.id.toBase58().concat("-").concat(logIndex.toString()),
    receipt
  );
  borrow.logIndex = logIndex;
  const parsedData = (0, parser_1.parse0)(data);
  const account_id = parsedData[0];
  const amount = parsedData[1];
  const token_id = parsedData[2];
  const market = (0, market_1.getOrCreateMarket)(token_id.toString());
  const protocol = (0, protocol_2.getOrCreateProtocol)();
  const dailySnapshot = (0, market_1.getOrCreateMarketDailySnapshot)(
    market,
    receipt
  );
  const hourlySnapshot = (0, market_1.getOrCreateMarketHourlySnapshot)(
    market,
    receipt
  );
  const usageDailySnapshot = (0,
  protocol_2.getOrCreateUsageMetricsDailySnapshot)(receipt);
  const usageHourlySnapshot = (0,
  protocol_2.getOrCreateUsageMetricsHourlySnapshot)(receipt);
  const financialDailySnapshot = (0,
  protocol_2.getOrCreateFinancialDailySnapshot)(receipt);
  const account = (0, account_1.getOrCreateAccount)(account_id.toString());
  // borrow position
  const counterID = account.id
    .concat("-")
    .concat(market.id)
    .concat("-")
    .concat(const_1.PositionSide.BORROWER);
  let positionCounter = schema_1._PositionCounter.load(counterID);
  if (!positionCounter) {
    positionCounter = new schema_1._PositionCounter(counterID);
    positionCounter.nextCount = 0;
    account.positionCount += 1;
  }
  const position = (0, position_1.getOrCreatePosition)(
    account,
    market,
    const_1.PositionSide.BORROWER,
    receipt,
    positionCounter.nextCount
  );
  /**
   * lending position
   * @dev borrowed amount is deposited to lending position: it needs to be withdrawn to wallet to use
   */
  const lendingCounterID = account.id
    .concat("-")
    .concat(market.id)
    .concat("-")
    .concat(const_1.PositionSide.LENDER);
  let lendingPositionCounter = schema_1._PositionCounter.load(lendingCounterID);
  if (!lendingPositionCounter) {
    lendingPositionCounter = new schema_1._PositionCounter(lendingCounterID);
    lendingPositionCounter.nextCount = 0;
    account.positionCount += 1;
  }
  const lendingPosition = (0, position_1.getOrCreatePosition)(
    account,
    market,
    const_1.PositionSide.LENDER,
    receipt,
    lendingPositionCounter.nextCount
  );
  const token = (0, token_1.getOrCreateToken)(token_id.toString());
  borrow.account = account.id;
  borrow.amount = graph_ts_1.BigInt.fromString(amount.toString());
  borrow.asset = token.id;
  borrow.market = market.id;
  borrow.position = position.id;
  borrow.amountUSD = borrow.amount
    .divDecimal(
      graph_ts_1.BigInt.fromI32(10)
        .pow(token.decimals + token.extraDecimals)
        .toBigDecimal()
    )
    .times(token.lastPriceUSD);
  const hourlyActiveAccount = schema_1.ActiveAccount.load(
    const_1.AccountTime.HOURLY.concat(account.id).concat(
      (0, const_1.NANOS_TO_HOUR)(
        receipt.block.header.timestampNanosec
      ).toString()
    )
  );
  const dailyActiveAccount = schema_1.ActiveAccount.load(
    const_1.AccountTime.DAILY.concat(account.id).concat(
      (0, const_1.NANOS_TO_DAY)(
        receipt.block.header.timestampNanosec
      ).toString()
    )
  );
  if (dailyActiveAccount == null) {
    usageDailySnapshot.dailyActiveUsers += 1;
    usageDailySnapshot.dailyActiveBorrowers += 1;
  }
  if (hourlyActiveAccount == null) {
    usageHourlySnapshot.hourlyActiveUsers += 1;
  }
  usageDailySnapshot.dailyBorrowCount += 1;
  usageDailySnapshot.dailyTransactionCount += 1;
  usageHourlySnapshot.hourlyBorrowCount += 1;
  usageHourlySnapshot.hourlyTransactionCount += 1;
  position.balance = position.balance.plus(borrow.amount);
  lendingPosition.balance = lendingPosition.balance.plus(borrow.amount);
  if (account.borrowCount == 0) {
    protocol.cumulativeUniqueBorrowers += 1;
  }
  account.borrowCount += 1;
  // asset.borrowed.deposit(borrowed_shares, amount);
  market._totalBorrowed = market._totalBorrowed.plus(
    (0, const_1.BI_BD)(borrow.amount)
  );
  market._totalBorrowedHistory = market._totalBorrowedHistory.plus(
    borrow.amount
  );
  market.cumulativeBorrowUSD = market.cumulativeBorrowUSD.plus(
    borrow.amountUSD
  );
  // borrowed amount gets withdrawn from the account => so we need to add that to deposits
  // asset.supplied.deposit(supplied_shares, amount);
  market._totalDeposited = market._totalDeposited.plus(
    (0, const_1.BI_BD)(borrow.amount)
  );
  market.outputTokenSupply = market.outputTokenSupply.plus(
    (0, shares_1.amount_to_shares)(
      (0, const_1.BI_BD)(borrow.amount),
      market.outputTokenSupply,
      market._totalDeposited
    )
  );
  // snapshot
  dailySnapshot.dailyBorrowUSD = dailySnapshot.dailyBorrowUSD.plus(
    borrow.amountUSD
  );
  hourlySnapshot.hourlyBorrowUSD = hourlySnapshot.hourlyBorrowUSD.plus(
    borrow.amountUSD
  );
  financialDailySnapshot.dailyBorrowUSD =
    financialDailySnapshot.dailyBorrowUSD.plus(borrow.amountUSD);
  const positionSnapshot = (0, position_1.getOrCreatePositionSnapshot)(
    position,
    receipt
  );
  positionSnapshot.logIndex = logIndex;
  (0, market_2.updateMarket)(
    market,
    dailySnapshot,
    hourlySnapshot,
    financialDailySnapshot,
    receipt
  );
  lendingPosition.save();
  positionCounter.save();
  lendingPositionCounter.save();
  positionSnapshot.save();
  financialDailySnapshot.save();
  usageDailySnapshot.save();
  usageHourlySnapshot.save();
  hourlySnapshot.save();
  dailySnapshot.save();
  market.save();
  account.save();
  borrow.save();
  position.save();
  protocol.save();
  (0, protocol_1.updateProtocol)();
}
exports.handleBorrow = handleBorrow;
function handleRepayment(event) {
  const receipt = event.receipt;
  const logIndex = event.logIndex;
  const data = event.data;
  const repay = (0, actions_1.getOrCreateRepayment)(
    receipt.outcome.id.toBase58().concat("-").concat(logIndex.toString()),
    receipt
  );
  repay.logIndex = logIndex;
  const parsedData = (0, parser_1.parse0)(data);
  const account_id = parsedData[0];
  const amount = parsedData[1];
  const token_id = parsedData[2];
  const market = (0, market_1.getOrCreateMarket)(token_id.toString());
  const dailySnapshot = (0, market_1.getOrCreateMarketDailySnapshot)(
    market,
    receipt
  );
  const hourlySnapshot = (0, market_1.getOrCreateMarketHourlySnapshot)(
    market,
    receipt
  );
  const usageDailySnapshot = (0,
  protocol_2.getOrCreateUsageMetricsDailySnapshot)(receipt);
  const usageHourlySnapshot = (0,
  protocol_2.getOrCreateUsageMetricsHourlySnapshot)(receipt);
  const financialDailySnapshot = (0,
  protocol_2.getOrCreateFinancialDailySnapshot)(receipt);
  const account = (0, account_1.getOrCreateAccount)(account_id.toString());
  const token = (0, token_1.getOrCreateToken)(token_id.toString());
  repay.market = market.id;
  repay.account = account.id;
  repay.amount = graph_ts_1.BigInt.fromString(amount.toString());
  repay.asset = token.id;
  const counterID = account.id
    .concat("-")
    .concat(market.id)
    .concat("-")
    .concat(const_1.PositionSide.BORROWER);
  const positionCounter = schema_1._PositionCounter.load(counterID);
  if (!positionCounter) {
    graph_ts_1.log.warning("Borrowing position counter {} not found in repay", [
      counterID,
    ]);
    return;
  }
  const position = (0, position_1.getOrCreatePosition)(
    account,
    market,
    const_1.PositionSide.BORROWER,
    receipt,
    positionCounter.nextCount
  );
  repay.position = position.id;
  repay.amountUSD = repay.amount
    .divDecimal(
      graph_ts_1.BigInt.fromI32(10)
        .pow(token.decimals + token.extraDecimals)
        .toBigDecimal()
    )
    .times(token.lastPriceUSD);
  const hourlyActiveAccount = schema_1.ActiveAccount.load(
    const_1.AccountTime.HOURLY.concat(account.id).concat(
      (0, const_1.NANOS_TO_HOUR)(
        receipt.block.header.timestampNanosec
      ).toString()
    )
  );
  const dailyActiveAccount = schema_1.ActiveAccount.load(
    const_1.AccountTime.DAILY.concat(account.id).concat(
      (0, const_1.NANOS_TO_DAY)(
        receipt.block.header.timestampNanosec
      ).toString()
    )
  );
  if (dailyActiveAccount == null) {
    usageDailySnapshot.dailyActiveUsers += 1;
  }
  if (hourlyActiveAccount == null) {
    usageHourlySnapshot.hourlyActiveUsers += 1;
  }
  usageDailySnapshot.dailyRepayCount += 1;
  usageDailySnapshot.dailyTransactionCount += 1;
  usageHourlySnapshot.hourlyRepayCount += 1;
  usageHourlySnapshot.hourlyTransactionCount += 1;
  if (position.balance.le(repay.amount)) {
    positionCounter.nextCount += 1;
    position.balance = const_1.BI_ZERO;
    account.openPositionCount -= 1;
    account.closedPositionCount += 1;
    market.openPositionCount -= 1;
    market.closedPositionCount += 1;
    market.borrowingPositionCount -= 1;
    position.hashClosed = receipt.outcome.id.toBase58();
    position.timestampClosed = graph_ts_1.BigInt.fromU64(
      (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
    );
    position.blockNumberClosed = graph_ts_1.BigInt.fromU64(
      receipt.block.header.height
    );
  }
  account.repayCount += 1;
  // asset.borrowed.withdraw(borrowed_shares, amount);
  market._totalBorrowed = market._totalBorrowed.minus(
    (0, const_1.BI_BD)(repay.amount)
  );
  market._totalRepaidHistory = market._totalRepaidHistory.plus(repay.amount);
  // minus repay amount from total deposited => because user has to deposit first to repay loan
  // asset.supplied.withdraw(supplied_shares, amount);
  market._totalDeposited = market._totalDeposited.minus(
    (0, const_1.BI_BD)(repay.amount)
  );
  market.outputTokenSupply = market.outputTokenSupply.minus(
    (0, shares_1.amount_to_shares)(
      (0, const_1.BI_BD)(repay.amount),
      market.outputTokenSupply,
      market._totalDeposited
    )
  );
  // snapshot
  dailySnapshot.dailyRepayUSD = dailySnapshot.dailyRepayUSD.plus(
    repay.amountUSD
  );
  hourlySnapshot.hourlyRepayUSD = hourlySnapshot.hourlyRepayUSD.plus(
    repay.amountUSD
  );
  financialDailySnapshot.dailyRepayUSD =
    financialDailySnapshot.dailyRepayUSD.plus(repay.amountUSD);
  // update position balance
  position.balance = position.balance.minus(repay.amount);
  const positionSnapshot = (0, position_1.getOrCreatePositionSnapshot)(
    position,
    receipt
  );
  positionSnapshot.logIndex = logIndex;
  (0, market_2.updateMarket)(
    market,
    dailySnapshot,
    hourlySnapshot,
    financialDailySnapshot,
    receipt
  );
  positionCounter.save();
  positionSnapshot.save();
  financialDailySnapshot.save();
  hourlySnapshot.save();
  dailySnapshot.save();
  usageDailySnapshot.save();
  usageHourlySnapshot.save();
  market.save();
  account.save();
  repay.save();
  position.save();
  (0, protocol_1.updateProtocol)();
}
exports.handleRepayment = handleRepayment;
