"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../constants");
class WadRayMath {
    static wadMul(x, y) {
        if (x.isZero() || y.isZero())
            return graph_ts_1.BigInt.zero();
        return this.halfWAD.plus(x.times(y)).div(this.WAD);
    }
    static wadDiv(x, y) {
        return x.times(this.WAD).plus(y.div(constants_1.BIGINT_TWO)).div(y);
    }
    static rayMul(x, y) {
        if (x.isZero() || y.isZero())
            return graph_ts_1.BigInt.zero();
        return this.halfRAY.plus(x.times(y)).div(this.RAY);
    }
    static rayDiv(x, y) {
        return x.times(this.RAY).plus(y.div(constants_1.BIGINT_TWO)).div(y);
    }
    static rayToWad(x) {
        const y = x.div(constants_1.WAD_RAY_RATIO);
        // If x % RAY_WAD_RATIO >= HALF_RAY_WAD_RATIO, round up.
        return y.plus(x.mod(constants_1.WAD_RAY_RATIO).ge(constants_1.HALF_WAD_RAY_RATIO)
            ? constants_1.HALF_WAD_RAY_RATIO
            : graph_ts_1.BigInt.zero());
    }
    static wadToRay(x) {
        return x.times(constants_1.WAD_RAY_RATIO);
    }
    static wadDivUp(x, y) {
        return x.times(this.WAD).plus(y.minus(constants_1.BIGINT_ONE)).div(y);
    }
    static rayDivUp(x, y) {
        return x.times(this.RAY).plus(y.minus(constants_1.BIGINT_ONE)).div(y);
    }
}
WadRayMath.WAD = constants_1.WAD_BI;
WadRayMath.halfWAD = constants_1.HALF_WAD_BI;
WadRayMath.RAY = constants_1.RAY_BI;
WadRayMath.halfRAY = constants_1.HALF_RAY_BI;
exports.default = WadRayMath;
