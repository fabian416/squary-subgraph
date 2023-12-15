"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOracleCall = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const token_1 = require("../helpers/token");
const const_1 = require("../utils/const");
function handleOracleCall(event) {
  const data = event.data;
  const receipt = event.receipt;
  const eventArgsArr = data.get("data");
  const eventArgs = eventArgsArr.toObject();
  const prices = eventArgs.get("prices");
  const pricesArr = prices.toArray();
  for (let i = 0; i < pricesArr.length; i++) {
    /* -------------------------------------------------------------------------- */
    /*                                  Asset ID                                  */
    /* -------------------------------------------------------------------------- */
    const price = pricesArr[i].toObject();
    const tokenId = price.get("asset_id");
    /* -------------------------------------------------------------------------- */
    /*                                    Price                                   */
    /* -------------------------------------------------------------------------- */
    const priceObj = price.get("price");
    if (!priceObj.isNull()) {
      /* -------------------------------------------------------------------------- */
      /*                                 Multiplier                                 */
      /* -------------------------------------------------------------------------- */
      const multiplier = priceObj.toObject().get("multiplier");
      const decimals = priceObj.toObject().get("decimals");
      const token = (0, token_1.getOrCreateToken)(tokenId.toString());
      const decimalFactor = decimals.toI64() - token.decimals;
      token.lastPriceUSD = graph_ts_1.BigDecimal.fromString(
        multiplier.toString()
      ).div(graph_ts_1.BigInt.fromI32(10).pow(decimalFactor).toBigDecimal());
      token.lastPriceBlockNumber = graph_ts_1.BigInt.fromString(
        receipt.block.header.height.toString()
      );
      if (token.lastPriceUSD.gt(const_1.BD_ZERO)) {
        token.save();
      } else {
        graph_ts_1.log.warning(
          "ORACLE::Token reported price is zero {} :: multiplier {} :: decimals {}",
          [token.id, multiplier.toString(), decimals.toString()]
        );
      }
    }
  }
}
exports.handleOracleCall = handleOracleCall;
