"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeP2PBorrowRate = exports.computeP2PSupplyRate = exports.computeP2PIndex = exports.computeGrowthFactors = exports.GrowthFactors = void 0;
const constants_1 = require("../constants");
const percentMath_1 = __importDefault(require("./maths/percentMath"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
class GrowthFactors {
    constructor(p2pBorrowGrowthFactor, p2pSupplyGrowthFactor, poolBorrowGrowthFactor, poolSupplyGrowthFactor) {
        this.p2pBorrowGrowthFactor = p2pBorrowGrowthFactor;
        this.p2pSupplyGrowthFactor = p2pSupplyGrowthFactor;
        this.poolBorrowGrowthFactor = poolBorrowGrowthFactor;
        this.poolSupplyGrowthFactor = poolSupplyGrowthFactor;
    }
}
exports.GrowthFactors = GrowthFactors;
function computeP2PRate(poolBorrowRate, poolSupplyRate, p2pIndexCursor) {
    if (poolBorrowRate.lt(poolSupplyRate))
        return poolBorrowRate;
    return percentMath_1.default.weightedAvg(poolSupplyRate, poolBorrowRate, p2pIndexCursor);
}
function computeGrowthFactors(newPoolSupplyIndex, newPoolBorrowIndex, lastSupplyPoolIndex, lastBorrowPoolIndex, p2pIndexCursor, reserveFactor, __MATHS__) {
    const poolSupplyGrowthFactor = __MATHS__.indexDiv(newPoolSupplyIndex, lastSupplyPoolIndex);
    const poolBorrowGrowthFactor = __MATHS__.indexDiv(newPoolBorrowIndex, lastBorrowPoolIndex);
    let p2pSupplyGrowthFactor;
    let p2pBorrowGrowthFactor;
    if (poolSupplyGrowthFactor <= poolBorrowGrowthFactor) {
        const p2pGrowthFactor = percentMath_1.default.weightedAvg(poolSupplyGrowthFactor, poolBorrowGrowthFactor, p2pIndexCursor);
        p2pSupplyGrowthFactor = p2pGrowthFactor.minus(percentMath_1.default.percentMul(p2pGrowthFactor.minus(poolSupplyGrowthFactor), reserveFactor));
        p2pBorrowGrowthFactor = p2pGrowthFactor.plus(percentMath_1.default.percentMul(poolBorrowGrowthFactor.minus(p2pGrowthFactor), reserveFactor));
    }
    else {
        // The case poolSupplyGrowthFactor > poolBorrowGrowthFactor happens because someone sent underlying tokens to the
        // cToken contract: the peer-to-peer growth factors are set to the pool borrow growth factor.
        p2pSupplyGrowthFactor = poolBorrowGrowthFactor;
        p2pBorrowGrowthFactor = poolBorrowGrowthFactor;
    }
    return new GrowthFactors(p2pBorrowGrowthFactor, p2pSupplyGrowthFactor, poolBorrowGrowthFactor, poolSupplyGrowthFactor);
}
exports.computeGrowthFactors = computeGrowthFactors;
function computeP2PIndex(lastPoolIndex, lastP2PIndex, p2pGrowthFactor, poolGrowthFactor, p2pDelta, p2pAmount, proportionIdle, __MATHS__) {
    let newP2PIndex;
    if (p2pAmount.isZero() || (p2pDelta.isZero() && proportionIdle.isZero())) {
        newP2PIndex = __MATHS__.indexMul(lastP2PIndex, p2pGrowthFactor);
    }
    else {
        const shareOfTheDelta = (0, constants_1.minBN)(__MATHS__.indexDiv(__MATHS__.indexMul(p2pDelta, lastPoolIndex), __MATHS__.indexMul(p2pAmount, lastP2PIndex)), __MATHS__.INDEX_ONE().minus(proportionIdle) // To avoid shareOfTheDelta + proportionIdle > 1 with rounding errors.
        );
        newP2PIndex = __MATHS__.indexMul(lastP2PIndex, __MATHS__
            .indexMul(__MATHS__.INDEX_ONE().minus(shareOfTheDelta).minus(proportionIdle), p2pGrowthFactor)
            .plus(__MATHS__.indexMul(shareOfTheDelta, poolGrowthFactor))
            .plus(proportionIdle));
    }
    return newP2PIndex;
}
exports.computeP2PIndex = computeP2PIndex;
function computeP2PSupplyRate(poolBorrowRate, poolSupplyRate, poolIndex, p2pIndex, p2pIndexCursor, p2pDelta, p2pAmount, reserveFactor, proportionIdle, __MATHS__) {
    let p2pSupplyRate;
    if (poolSupplyRate.gt(poolBorrowRate)) {
        p2pSupplyRate = poolBorrowRate;
    }
    else {
        const p2pRate = computeP2PRate(poolBorrowRate, poolSupplyRate, p2pIndexCursor);
        p2pSupplyRate = p2pRate.minus(percentMath_1.default.percentMul(p2pRate.minus(poolSupplyRate), reserveFactor));
    }
    if (p2pDelta.gt(graph_ts_1.BigInt.zero()) && p2pAmount.gt(graph_ts_1.BigInt.zero())) {
        const shareOfTheDelta = (0, constants_1.minBN)(__MATHS__.indexDiv(__MATHS__.indexMul(p2pDelta, poolIndex), __MATHS__.indexMul(p2pAmount, p2pIndex)), __MATHS__.INDEX_ONE().minus(proportionIdle) // To avoid shareOfTheDelta > 1 with rounding errors.
        );
        p2pSupplyRate = __MATHS__
            .indexMul(p2pSupplyRate, __MATHS__.INDEX_ONE().minus(shareOfTheDelta).minus(proportionIdle))
            .plus(__MATHS__.indexMul(poolSupplyRate, shareOfTheDelta))
            .plus(proportionIdle);
    }
    return p2pSupplyRate;
}
exports.computeP2PSupplyRate = computeP2PSupplyRate;
function computeP2PBorrowRate(poolBorrowRate, poolSupplyRate, poolIndex, p2pIndex, p2pIndexCursor, p2pDelta, p2pAmount, reserveFactor, proportionIdle, __MATHS__) {
    let p2pBorrowRate;
    if (poolSupplyRate.gt(poolBorrowRate)) {
        p2pBorrowRate = poolBorrowRate;
    }
    else {
        const p2pRate = computeP2PRate(poolBorrowRate, poolSupplyRate, p2pIndexCursor);
        p2pBorrowRate = p2pRate.plus(percentMath_1.default.percentMul(poolBorrowRate.minus(p2pRate), reserveFactor));
    }
    if (p2pDelta.gt(graph_ts_1.BigInt.zero()) && p2pAmount.gt(graph_ts_1.BigInt.zero())) {
        const shareOfTheDelta = (0, constants_1.minBN)(__MATHS__.indexDiv(__MATHS__.indexMul(p2pDelta, poolIndex), __MATHS__.indexMul(p2pAmount, p2pIndex)), __MATHS__.INDEX_ONE().minus(proportionIdle) // To avoid shareOfTheDelta > 1 with rounding errors.
        );
        p2pBorrowRate = __MATHS__
            .indexMul(p2pBorrowRate, __MATHS__.INDEX_ONE().minus(shareOfTheDelta).minus(proportionIdle))
            .plus(__MATHS__.indexMul(poolBorrowRate, shareOfTheDelta))
            .plus(proportionIdle);
    }
    return p2pBorrowRate;
}
exports.computeP2PBorrowRate = computeP2PBorrowRate;
