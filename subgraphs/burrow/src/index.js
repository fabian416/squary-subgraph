"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReceipt = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const actions_1 = require("./handlers/actions");
const config_1 = require("./handlers/config");
const market_1 = require("./handlers/market");
const oracle_1 = require("./handlers/oracle");
const liquidate_1 = require("./handlers/liquidate");
const type_1 = require("./utils/type");
function handleReceipt(receipt) {
  const actions = receipt.receipt.actions;
  for (let i = 0; i < actions.length; i++) {
    handleAction(actions[i], receipt);
  }
}
exports.handleReceipt = handleReceipt;
function handleAction(action, receipt) {
  if (action.kind != graph_ts_1.near.ActionKind.FUNCTION_CALL) {
    graph_ts_1.log.info("Early return: {}", ["Not a function call"]);
    return;
  }
  const outcome = receipt.outcome;
  const methodName = action.toFunctionCall().methodName;
  const methodArgs = action.toFunctionCall().args;
  const argsData = graph_ts_1.json.try_fromBytes(methodArgs);
  if (argsData.isError) {
    graph_ts_1.log.warning("[handleAction] Error parsing args {}", [
      methodName,
    ]);
    return;
  }
  const argsObject = argsData.value.toObject();
  const eventData = new type_1.EventData(
    null,
    methodName,
    argsObject,
    receipt,
    0,
    null
  );
  handleMethod(eventData);
  for (let logIndex = 0; logIndex < outcome.logs.length; logIndex++) {
    const outcomeLog = outcome.logs[logIndex]
      .toString()
      .slice("EVENT_JSON:".length);
    const jsonData = graph_ts_1.json.try_fromString(outcomeLog);
    if (jsonData.isError) {
      graph_ts_1.log.warning("Error parsing outcomeLog {}", [outcomeLog]);
      return;
    }
    const jsonObject = jsonData.value.toObject();
    const event = jsonObject.get("event");
    const data = jsonObject.get("data");
    if (!event || !data) return;
    const dataArr = data.toArray();
    const dataObj = dataArr[0].toObject();
    const args = argsData.value.toObject();
    const eventData = new type_1.EventData(
      event.toString(),
      methodName,
      dataObj,
      receipt,
      logIndex,
      args
    );
    handleEvent(eventData);
  }
}
function handleEvent(event) {
  if (event.eventName == "deposit") {
    (0, actions_1.handleDeposit)(event);
  } else if (event.eventName == "deposit_to_reserve") {
    (0, actions_1.handleDepositToReserve)(event);
  } else if (event.eventName == "withdraw_succeeded") {
    (0, actions_1.handleWithdraw)(event);
  } else if (event.eventName == "borrow") {
    (0, actions_1.handleBorrow)(event);
  } else if (event.eventName == "repay") {
    (0, actions_1.handleRepayment)(event);
  } else if (event.eventName == "liquidate") {
    (0, liquidate_1.handleLiquidate)(event);
  } else if (event.eventName == "force_close") {
    (0, liquidate_1.handleForceClose)(event);
  }
}
function handleMethod(method) {
  if (method.methodName == "new" || method.methodName == "update_config") {
    (0, config_1.handleNew)(method);
  } else if (method.methodName == "oracle_on_call") {
    (0, oracle_1.handleOracleCall)(method);
  } else if (method.methodName == "add_asset") {
    (0, market_1.handleNewAsset)(method);
  } else if (method.methodName == "update_asset") {
    (0, market_1.handleUpdateAsset)(method);
  }
}
