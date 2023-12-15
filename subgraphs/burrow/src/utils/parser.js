"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse0 = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
function parse0(data) {
  /* -------------------------------------------------------------------------- */
  /*                                   Account                                  */
  /* -------------------------------------------------------------------------- */
  const account_id = data.get("account_id");
  if (!account_id) {
    graph_ts_1.log.warning("parse0() :: account_id data not found :: data", []);
    throw new Error();
  }
  /* -------------------------------------------------------------------------- */
  /*                                   Amount                                   */
  /* -------------------------------------------------------------------------- */
  const amount = data.get("amount");
  if (!amount) {
    graph_ts_1.log.warning("parse0() :: account_id data not found :: data", []);
    throw new Error();
  }
  /* -------------------------------------------------------------------------- */
  /*                                  Token ID                                  */
  /* -------------------------------------------------------------------------- */
  const token_id = data.get("token_id");
  if (!token_id) {
    graph_ts_1.log.warning("parse0() :: account_id data not found :: data", []);
    throw new Error();
  }
  return [account_id.toString(), amount.toString(), token_id.toString()];
}
exports.parse0 = parse0;
