"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleForceClose = exports.handleLiquidate = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const account_1 = require("../helpers/account");
const position_1 = require("../helpers/position");
const actions_1 = require("../helpers/actions");
const market_1 = require("../helpers/market");
const protocol_1 = require("../update/protocol");
const protocol_2 = require("../helpers/protocol");
const schema_1 = require("../../generated/schema");
const const_1 = require("../utils/const");
const token_1 = require("../helpers/token");
// { account_id, liquidation_account_id, collateral_sum, repaid_sum }
function handleLiquidate(event) {
  const receipt = event.receipt;
  const data = event.data;
  const logIndex = event.logIndex;
  const args = event.args;
  const protocol = (0, protocol_2.getOrCreateProtocol)();
  const usageHourly = (0, protocol_2.getOrCreateUsageMetricsHourlySnapshot)(
    receipt
  );
  usageHourly.hourlyLiquidateCount += 1;
  const usageDaily = (0, protocol_2.getOrCreateUsageMetricsDailySnapshot)(
    receipt
  );
  usageDaily.dailyLiquidateCount += 1;
  const financialDaily = (0, protocol_2.getOrCreateFinancialDailySnapshot)(
    receipt
  );
  /* -------------------------------------------------------------------------- */
  /*                                 Liquidator                                 */
  /* -------------------------------------------------------------------------- */
  const account_id = data.get("account_id");
  if (!account_id) {
    graph_ts_1.log.info("{} data not found", ["account_id"]);
    return;
  }
  const liquidator = (0, account_1.getOrCreateAccount)(account_id.toString());
  if (liquidator.liquidateCount == 0) {
    protocol.cumulativeUniqueLiquidators =
      protocol.cumulativeUniqueLiquidators + 1;
  }
  if (liquidator._lastActiveTimestamp.lt(usageDaily.timestamp)) {
    usageDaily.dailyActiveLiquidators += 1;
  }
  liquidator.liquidateCount += 1;
  /* -------------------------------------------------------------------------- */
  /*                                 Liquidatee                                 */
  /* -------------------------------------------------------------------------- */
  const liquidation_account_id = data.get("liquidation_account_id");
  if (!liquidation_account_id) {
    graph_ts_1.log.info("{} data not found", ["liquidation_account_id"]);
    return;
  }
  const liquidatee = (0, account_1.getOrCreateAccount)(
    liquidation_account_id.toString()
  );
  if (liquidatee.liquidationCount == 0) {
    protocol.cumulativeUniqueLiquidatees =
      protocol.cumulativeUniqueLiquidatees + 1;
  }
  if (liquidatee._lastActiveTimestamp.lt(usageDaily.timestamp)) {
    usageDaily.dailyActiveLiquidatees += 1;
  }
  liquidatee.liquidationCount += 1;
  /* -------------------------------------------------------------------------- */
  /*                              Collateral Amount                             */
  /* -------------------------------------------------------------------------- */
  const collateral_sum = data.get("collateral_sum");
  if (!collateral_sum) {
    graph_ts_1.log.info("{} data not found", ["collateral_sum"]);
    return;
  }
  const collateral_sum_value = graph_ts_1.BigDecimal.fromString(
    collateral_sum.toString()
  );
  /* -------------------------------------------------------------------------- */
  /*                                Repaid Amount                               */
  /* -------------------------------------------------------------------------- */
  const repaid_sum = data.get("repaid_sum");
  if (!repaid_sum) {
    graph_ts_1.log.info("{} data not found", ["repaid_sum"]);
    return;
  }
  const repaid_sum_value = graph_ts_1.BigDecimal.fromString(
    repaid_sum.toString()
  );
  // discount
  const discountFactor = repaid_sum_value.div(collateral_sum_value);
  // finding token_in, token_in_amount, token_out and token_out_amount
  // TOKEN_IN: borrowed token
  // TOKEN_OUT: collateral token
  const token_in = new Array(),
    token_out = new Array();
  const token_in_amount = new Array(),
    token_out_amount = new Array();
  if (args) {
    let msg = args.get("msg");
    msg = graph_ts_1.json.fromString(msg.toString());
    const exec = msg.toObject().get("Execute");
    const actions = exec.toObject().get("actions");
    const actionsArr = actions.toArray();
    for (let i = 0; i < actionsArr.length; i++) {
      if (actionsArr[i].kind == graph_ts_1.JSONValueKind.OBJECT) {
        const a = actionsArr[i].toObject();
        const liqCall = a.get("Liquidate");
        if (liqCall) {
          /* -------------------------------------------------------------------------- */
          /*                       Repaid asset: id & amount                            */
          /* -------------------------------------------------------------------------- */
          const in_assets = liqCall.toObject().get("in_assets");
          const in_assets_array = in_assets.toArray();
          for (let i = 0; i < in_assets_array.length; i++) {
            const asset = in_assets_array[i].toObject();
            const asset_id = asset.get("token_id").toString();
            const asset_amt = asset.get("amount").toString();
            token_in.push(asset_id);
            token_in_amount.push(asset_amt);
          }
          /* -------------------------------------------------------------------------- */
          /*                            Collateral asset: id & amount                   */
          /* -------------------------------------------------------------------------- */
          const out_assets = liqCall.toObject().get("out_assets");
          const out_assets_array = out_assets.toArray();
          for (let i = 0; i < out_assets_array.length; i++) {
            const asset = out_assets_array[i].toObject();
            const asset_id = asset.get("token_id");
            const asset_amt = asset.get("amount");
            token_out.push(asset_id.toString());
            token_out_amount.push(asset_amt.toString());
          }
        }
      }
    }
  }
  let collateralLiquidated = const_1.BD_ZERO;
  let totalRepaidAmount = const_1.BD_ZERO;
  let collateralPointer = 0;
  if (token_out.length == 0) {
    graph_ts_1.log.warning("No collateral token found in liquidation", []);
    return;
  }
  const collateralToken = (0, token_1.getOrCreateToken)(
    token_out[collateralPointer]
  );
  collateralLiquidated = collateralLiquidated.plus(
    graph_ts_1.BigDecimal.fromString(token_out_amount[collateralPointer])
      .div(
        graph_ts_1.BigInt.fromI32(10)
          .pow(collateralToken.decimals + collateralToken.extraDecimals)
          .toBigDecimal()
      )
      .times(collateralToken.lastPriceUSD)
  );
  for (let i = 0; i < token_in.length; i++) {
    const liq = (0, actions_1.getOrCreateLiquidation)(
      receipt.outcome.id.toBase58().concat("-").concat(i.toString()),
      receipt
    );
    liq.liquidator = liquidator.id;
    liq.liquidatee = liquidatee.id;
    liq.logIndex = logIndex;
    const repaidMarket = (0, market_1.getOrCreateMarket)(token_in[i]);
    const dailySnapshot = (0, market_1.getOrCreateMarketDailySnapshot)(
      repaidMarket,
      receipt
    );
    const hourlySnapshot = (0, market_1.getOrCreateMarketHourlySnapshot)(
      repaidMarket,
      receipt
    );
    const repaidCounterID = liquidatee.id
      .concat("-")
      .concat(repaidMarket.id)
      .concat("-")
      .concat(const_1.PositionSide.BORROWER);
    const repaidCounter = schema_1._PositionCounter.load(repaidCounterID);
    if (!repaidCounter) {
      graph_ts_1.log.warning(
        "Borrowing position counter {} not found in liquidation",
        [repaidCounterID]
      );
      return;
    }
    const repaidPosition = (0, position_1.getOrCreatePosition)(
      liquidatee,
      repaidMarket,
      const_1.PositionSide.BORROWER,
      receipt,
      repaidCounter.nextCount
    );
    // lending position the liquidator repaid from
    const liquidatorPositionId = liquidator.id
      .concat("-")
      .concat(repaidMarket.id)
      .concat("-")
      .concat(const_1.PositionSide.LENDER);
    const liquidatorPositionCounter =
      schema_1._PositionCounter.load(liquidatorPositionId);
    if (!liquidatorPositionCounter) {
      graph_ts_1.log.warning(
        "Lending position counter {} not found in liquidation",
        [liquidatorPositionId]
      );
      return;
    }
    const liquidatorPosition = (0, position_1.getOrCreatePosition)(
      liquidator,
      repaidMarket,
      const_1.PositionSide.LENDER,
      receipt,
      liquidatorPositionCounter.nextCount
    );
    repaidPosition.balance = repaidPosition.balance.minus(
      graph_ts_1.BigInt.fromString(token_in_amount[i])
    );
    liquidatorPosition.balance = liquidatorPosition.balance.minus(
      graph_ts_1.BigInt.fromString(token_in_amount[i])
    );
    if (repaidPosition.balance.lt(const_1.BI_ZERO)) {
      repaidPosition.hashClosed = receipt.receipt.id.toBase58();
      repaidPosition.blockNumberClosed = graph_ts_1.BigInt.fromU64(
        receipt.block.header.height
      );
      repaidPosition.timestampClosed = graph_ts_1.BigInt.fromU64(
        (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
      );
      repaidCounter.nextCount += 1;
      // closing borrowed position
      repaidMarket.openPositionCount -= 1;
      repaidMarket.closedPositionCount += 1;
    }
    repaidPosition.save();
    const repaidToken = (0, token_1.getOrCreateToken)(token_in[i]);
    const repaidUSD = graph_ts_1.BigDecimal.fromString(token_in_amount[i])
      .times(repaidMarket.inputTokenPriceUSD)
      .div(
        graph_ts_1.BigInt.fromI32(10)
          .pow(repaidToken.decimals + repaidToken.extraDecimals)
          .toBigDecimal()
      );
    totalRepaidAmount = totalRepaidAmount.plus(repaidUSD);
    repaidMarket.cumulativeLiquidateUSD =
      repaidMarket.cumulativeLiquidateUSD.plus(repaidUSD);
    repaidMarket._totalBorrowed = repaidMarket._totalBorrowed.minus(
      graph_ts_1.BigDecimal.fromString(token_in_amount[i])
    );
    repaidMarket._totalDeposited = repaidMarket._totalDeposited.minus(
      graph_ts_1.BigDecimal.fromString(token_in_amount[i])
    );
    liq.amount = graph_ts_1.BigInt.fromString(token_in_amount[i]);
    liq.amountUSD = repaidUSD;
    liq.profitUSD = repaidUSD.times(discountFactor);
    liq.market = repaidMarket.id;
    liq.position = repaidPosition.id;
    const collateral = (0, market_1.getOrCreateMarket)(
      token_out[collateralPointer]
    );
    if (
      totalRepaidAmount.gt(collateralLiquidated) &&
      token_out.length > collateralPointer + 1
    ) {
      collateralPointer += 1;
      const collateralToken = (0, token_1.getOrCreateToken)(
        token_out[collateralPointer]
      );
      collateralLiquidated = collateralLiquidated.plus(
        graph_ts_1.BigDecimal.fromString(token_out_amount[collateralPointer])
          .div(
            graph_ts_1.BigInt.fromI32(10)
              .pow(collateralToken.decimals + collateralToken.extraDecimals)
              .toBigDecimal()
          )
          .times(collateralToken.lastPriceUSD)
      );
    }
    liq.asset = collateral.id;
    liq.save();
    liquidatorPosition.save();
    liquidatorPositionCounter.save();
    repaidCounter.save();
    repaidPosition.save();
    dailySnapshot.save();
    hourlySnapshot.save();
    repaidMarket.save();
  }
  for (let i = 0; i < token_out.length; i++) {
    const collateralMarket = (0, market_1.getOrCreateMarket)(token_out[i]);
    const collateralCounterID = liquidatee.id
      .concat("-")
      .concat(collateralMarket.id)
      .concat("-")
      .concat(const_1.PositionSide.LENDER);
    const collateralCounter =
      schema_1._PositionCounter.load(collateralCounterID);
    if (!collateralCounter) {
      graph_ts_1.log.warning(
        "Lender position counter {} not found in liquidation",
        [collateralCounterID]
      );
      return;
    }
    const collateralPosition = (0, position_1.getOrCreatePosition)(
      liquidatee,
      collateralMarket,
      "LENDER",
      receipt,
      collateralCounter.nextCount
    );
    // collateral position for liquidator
    const liquidatorCollateralCounterID = liquidator.id
      .concat("-")
      .concat(collateralMarket.id)
      .concat("-")
      .concat(const_1.PositionSide.LENDER);
    let liquidatorCollateralCounter = schema_1._PositionCounter.load(
      liquidatorCollateralCounterID
    );
    if (!liquidatorCollateralCounter) {
      // create new counter
      liquidatorCollateralCounter = new schema_1._PositionCounter(
        liquidatorCollateralCounterID
      );
      liquidatorCollateralCounter.nextCount = 0;
    }
    const liquidatorCollateralPosition = (0, position_1.getOrCreatePosition)(
      liquidator,
      collateralMarket,
      const_1.PositionSide.LENDER,
      receipt,
      liquidatorCollateralCounter.nextCount
    );
    collateralPosition.balance = collateralPosition.balance.minus(
      graph_ts_1.BigInt.fromString(token_out_amount[i])
    );
    liquidatorCollateralPosition.balance =
      liquidatorCollateralPosition.balance.plus(
        graph_ts_1.BigInt.fromString(token_out_amount[i])
      );
    if (collateralPosition.balance.lt(const_1.BI_ZERO)) {
      collateralPosition.balance = const_1.BI_ZERO;
      collateralPosition.hashClosed = receipt.receipt.id.toBase58();
      collateralPosition.blockNumberClosed = graph_ts_1.BigInt.fromU64(
        receipt.block.header.height
      );
      collateralPosition.timestampClosed = graph_ts_1.BigInt.fromU64(
        (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
      );
      collateralCounter.nextCount += 1;
      // closing collateral position
      collateralMarket.openPositionCount -= 1;
      collateralMarket.closedPositionCount += 1;
      liquidatee.openPositionCount -= 1;
    }
    liquidatorCollateralPosition.save();
    liquidatorCollateralCounter.save();
    collateralCounter.save();
    collateralPosition.save();
    collateralMarket.save();
  }
  liquidator.save();
  liquidatee.save();
  financialDaily.dailyLiquidateUSD =
    financialDaily.dailyLiquidateUSD.plus(repaid_sum_value);
  financialDaily.save();
  protocol.save();
  usageHourly.save();
  usageDaily.save();
  (0, protocol_1.updateProtocol)();
}
exports.handleLiquidate = handleLiquidate;
function handleForceClose(event) {
  const receipt = event.receipt;
  const data = event.data;
  const protocol = (0, protocol_2.getOrCreateProtocol)();
  const dailyProtocol = (0, protocol_2.getOrCreateUsageMetricsDailySnapshot)(
    receipt
  );
  const hourlyProtocol = (0, protocol_2.getOrCreateUsageMetricsHourlySnapshot)(
    receipt
  );
  const financialDaily = (0, protocol_2.getOrCreateFinancialDailySnapshot)(
    receipt
  );
  const liquidator = (0, account_1.getOrCreateAccount)(
    receipt.receipt.signerId
  );
  liquidator.liquidateCount += 1;
  liquidator.save();
  const liquidation_account_id = data.get("liquidation_account_id");
  if (!liquidation_account_id) {
    graph_ts_1.log.info("{} data not found", ["liquidation_account_id"]);
    return;
  }
  const collateral_sum = data.get("collateral_sum");
  if (!collateral_sum) {
    graph_ts_1.log.info("{} data not found", ["collateral_sum"]);
    return;
  }
  const repaid_sum = data.get("repaid_sum");
  if (!repaid_sum) {
    graph_ts_1.log.info("{} data not found", ["repaid_sum"]);
    return;
  }
  const liquidatee = (0, account_1.getOrCreateAccount)(
    liquidation_account_id.toString()
  );
  if (liquidatee.liquidationCount == 0) {
    protocol.cumulativeUniqueLiquidatees =
      protocol.cumulativeUniqueLiquidatees + 1;
  }
  liquidatee.liquidationCount += 1;
  liquidatee.save();
  protocol.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD.plus(
    graph_ts_1.BigDecimal.fromString(repaid_sum.toString())
  );
  financialDaily.dailyLiquidateUSD = financialDaily.dailyLiquidateUSD.plus(
    graph_ts_1.BigDecimal.fromString(repaid_sum.toString())
  );
  hourlyProtocol.hourlyLiquidateCount += 1;
  dailyProtocol.dailyLiquidateCount += 1;
  if (liquidator.liquidateCount == 0) {
    protocol.cumulativeUniqueLiquidators += 1;
    dailyProtocol.cumulativeUniqueLiquidators += 1;
  }
  if (liquidator._lastActiveTimestamp.lt(dailyProtocol.timestamp)) {
    dailyProtocol.dailyActiveLiquidators += 1;
  }
  if (liquidatee.liquidationCount == 0) {
    protocol.cumulativeUniqueLiquidatees += 1;
    dailyProtocol.cumulativeUniqueLiquidatees += 1;
  }
  if (liquidatee._lastActiveTimestamp.lt(dailyProtocol.timestamp)) {
    dailyProtocol.dailyActiveLiquidatees += 1;
  }
  protocol.save();
  // all position of liquidatee
  const markets = protocol._marketIds;
  for (let i = 0; i < markets.length; i++) {
    const market = (0, market_1.getOrCreateMarket)(markets[i]);
    const borrow_position = schema_1.Position.load(
      markets[i]
        .concat("-")
        .concat(liquidation_account_id.toString())
        .concat("-BORROWER")
    );
    const supply_position = schema_1.Position.load(
      markets[i]
        .concat("-")
        .concat(liquidation_account_id.toString())
        .concat("-BORROWER")
    );
    if (borrow_position) {
      if (borrow_position.balance.gt(const_1.BI_ZERO)) {
        market._totalBorrowed = market._totalBorrowed.minus(
          (0, const_1.BI_BD)(borrow_position.balance)
        );
        market._totalDeposited = market._totalDeposited.minus(
          (0, const_1.BI_BD)(borrow_position.balance)
        );
        market._totalReserved = market._totalReserved.plus(
          (0, const_1.BI_BD)(borrow_position.balance)
        );
        borrow_position.balance = const_1.BI_ZERO;
        borrow_position.hashClosed = receipt.receipt.id.toBase58();
        borrow_position.timestampClosed = graph_ts_1.BigInt.fromU64(
          (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
        );
        borrow_position.save();
      }
    }
    if (supply_position) {
      if (supply_position.balance.gt(const_1.BI_ZERO)) {
        market._totalDeposited = market._totalDeposited.minus(
          (0, const_1.BI_BD)(supply_position.balance)
        );
        market._totalReserved = market._totalReserved.plus(
          (0, const_1.BI_BD)(supply_position.balance)
        );
        supply_position.balance = const_1.BI_ZERO;
        supply_position.hashClosed = receipt.receipt.id.toBase58();
        supply_position.timestampClosed = graph_ts_1.BigInt.fromU64(
          (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
        );
        supply_position.save();
      }
    }
  }
}
exports.handleForceClose = handleForceClose;
