"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateTick = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../constants");
const utils_1 = require("../utils/utils");
function getOrCreateTick(event, pool, tickIndex) {
    const id = pool.id.concatI32(tickIndex.toI32());
    let tick = schema_1.Tick.load(id);
    if (!tick) {
        tick = new schema_1.Tick(id);
        tick.index = tickIndex;
        tick.pool = pool.id;
        tick.createdTimestamp = event.block.timestamp;
        tick.createdBlockNumber = event.block.number;
        const price0 = (0, utils_1.bigDecimalExponentiated)(graph_ts_1.BigDecimal.fromString("1.0001"), tick.index);
        tick.prices = [price0, (0, utils_1.safeDivBigDecimal)(constants_1.BIGDECIMAL_ONE, price0)];
        tick.liquidityGross = constants_1.BIGINT_ZERO;
        tick.liquidityGrossUSD = constants_1.BIGDECIMAL_ZERO;
        tick.liquidityNet = constants_1.BIGINT_ZERO;
        tick.liquidityNetUSD = constants_1.BIGDECIMAL_ZERO;
        tick.lastSnapshotDayID = constants_1.INT_ZERO;
        tick.lastSnapshotHourID = constants_1.INT_ZERO;
        tick.lastUpdateBlockNumber = constants_1.BIGINT_ZERO;
        tick.lastUpdateTimestamp = constants_1.BIGINT_ZERO;
        tick.save();
    }
    return tick;
}
exports.getOrCreateTick = getOrCreateTick;
