"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const getters_1 = require("./common/getters");
const metrics_1 = require("./common/metrics");
// handle staking events which are spell transfers to and from sspell
// updates treasury and usageMetrics
function handleTransfer(event) {
  //dataSource.network
  if (
    event.params.to.toHexString() ==
    (0, getters_1.getStakedSpellAddress)(graph_ts_1.dataSource.network())
  ) {
    // stake spell into sspell
    // just add the same address, the way updateUsageMetrics is written, it will not double count
    (0, metrics_1.updateUsageMetrics)(
      event,
      event.params.from,
      event.params.from
    );
  } else if (
    event.params.from.toHexString() ==
    (0, getters_1.getStakedSpellAddress)(graph_ts_1.dataSource.network())
  ) {
    // withdraw spell from sspell
    // just add the same address, the way updateUsageMetrics is written, it will not double count
    (0, metrics_1.updateUsageMetrics)(event, event.params.to, event.params.to);
  }
}
exports.handleTransfer = handleTransfer;
