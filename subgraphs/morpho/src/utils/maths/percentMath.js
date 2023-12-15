"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-magic-numbers */
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../constants");
const BASE_PERCENT = graph_ts_1.BigInt.fromI32(10000);
const HALF_PERCENT = BASE_PERCENT.div(constants_1.BIGINT_TWO);
class PercentMath {
    static percentMul(x, percent) {
        if (x.isZero() || percent.isZero())
            return graph_ts_1.BigInt.zero();
        return x.times(percent).plus(this.HALF_PERCENT).div(this.BASE_PERCENT);
    }
    static percentDiv(x, percent) {
        if (x.isZero() || percent.isZero())
            return graph_ts_1.BigInt.zero();
        return x
            .times(this.BASE_PERCENT)
            .plus(percent.div(constants_1.BIGINT_TWO))
            .div(percent);
    }
    static weiToPercent(weiNumber) {
        const tenExponent14 = graph_ts_1.BigInt.fromI32(10).pow(14);
        return weiNumber
            .times(this.BASE_PERCENT)
            .div(tenExponent14)
            .plus(this.HALF_PERCENT)
            .div(this.BASE_PERCENT);
    }
    static percentDivUp(x, percent) {
        return x
            .times(this.BASE_PERCENT)
            .plus(percent.minus(constants_1.BIGINT_ONE))
            .div(percent);
    }
    static weightedAvg(x, y, percent) {
        const z = this.BASE_PERCENT.minus(percent);
        return x
            .times(z)
            .plus(y.times(percent))
            .plus(this.HALF_PERCENT)
            .div(this.BASE_PERCENT);
    }
}
PercentMath.BASE_PERCENT = BASE_PERCENT;
PercentMath.HALF_PERCENT = HALF_PERCENT;
exports.default = PercentMath;
