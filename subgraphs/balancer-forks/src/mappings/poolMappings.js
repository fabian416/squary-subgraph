"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSwapFeePercentageChanged = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const utils_1 = require("../common/utils");
function handleSwapFeePercentageChanged(event) {
  const poolAddress = event.address;
  const fees = (0, utils_1.getPoolFees)(poolAddress);
  graph_ts_1.log.warning(
    "[Pool:SwapFeeChanged] Pool: {}, TradingFees: {}, ProtocolFees: {}, LpFee: {}, Txn: {}",
    [
      poolAddress.toHexString(),
      fees.getTradingFees.toString(),
      fees.getProtocolFees.toString(),
      fees.getLpFees.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleSwapFeePercentageChanged = handleSwapFeePercentageChanged;
