"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAnswerUpdated = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../constants");
const getters_1 = require("../getters");
const numbers_1 = require("../utils/numbers");
function updateTokenPrice(tokenAddress, priceUSD, event) {
  const token = (0, getters_1.getOrCreateToken)(
    graph_ts_1.Address.fromString(tokenAddress)
  );
  token.lastPriceUSD = priceUSD;
  token.lastPriceBlockNumber = event.block.number;
  token.save();
}
///////////////////////////
///// MIM Price Oracle /////
///////////////////////////
function handleAnswerUpdated(event) {
  const priceUSD = constants_1.BIGDECIMAL_ONE.div(
    (0, numbers_1.bigIntToBigDecimal)(
      event.params.current,
      constants_1.CHAINLINK_ORACLE_DECIMALS
    )
  );
  updateTokenPrice(
    (0, getters_1.getMIMAddress)(graph_ts_1.dataSource.network()),
    priceUSD,
    event
  );
}
exports.handleAnswerUpdated = handleAnswerUpdated;
