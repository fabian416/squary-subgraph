"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAMMTVE = exports.UNKNOWN_TOKEN_VALUE = exports.INVALID_TOKEN_DECIMALS = void 0;
/* eslint-disable prefer-const */
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const constants_2 = require("./constants");
const L2_Amm_1 = require("../../../generated/HopL2Amm/L2_Amm");
exports.INVALID_TOKEN_DECIMALS = 0;
exports.UNKNOWN_TOKEN_VALUE = "unknown";
function updateAMMTVE(ammAddress, token, hPool, pool) {
    const Amm = L2_Amm_1.L2_Amm.bind(ammAddress);
    const inputBalanceCallA = Amm.try_getTokenBalance(graph_ts_1.BigInt.zero().toI32());
    const inputBalanceCallB = Amm.try_getTokenBalance(constants_1.BIGINT_ONE.toI32());
    if (!inputBalanceCallA.reverted && !inputBalanceCallB.reverted) {
        pool.setInputTokenBalance(inputBalanceCallA.value);
        hPool.setInputTokenBalance(inputBalanceCallB.value);
        hPool.setNetValueExportedUSD(constants_1.BIGDECIMAL_ZERO);
        if (constants_2.SIX_DECIMAL_TOKENS.includes(token.toHexString())) {
            let poolTVE = inputBalanceCallA.value
                .plus(inputBalanceCallB.value)
                .minus(pool.pool._inputTokenLiquidityBalance);
            pool.setNetValueExportedUSD(poolTVE.div(constants_2.BIGINT_TEN_TO_SIX).toBigDecimal());
            graph_ts_1.log.info("TVE1: {}, TVE2: {}, iTB-A: {}, iTB-B: {}, iTLB: {}", [
                poolTVE.toString(),
                poolTVE.div(constants_2.BIGINT_TEN_TO_SIX).toBigDecimal().toString(),
                inputBalanceCallA.value.toString(),
                inputBalanceCallB.value.toString(),
                pool.pool._inputTokenLiquidityBalance.toString(),
            ]);
        }
        else {
            let poolTVE = inputBalanceCallA.value
                .plus(inputBalanceCallB.value)
                .minus(pool.pool._inputTokenLiquidityBalance);
            pool.setNetValueExportedUSD(poolTVE.div(constants_1.BIGINT_TEN_TO_EIGHTEENTH).toBigDecimal());
            graph_ts_1.log.info("TVE1: {}, TVE2: {}, iTB-A: {}, iTB-B: {}, iTLB: {}", [
                poolTVE.toString(),
                poolTVE.div(constants_1.BIGINT_TEN_TO_EIGHTEENTH).toBigDecimal().toString(),
                inputBalanceCallA.value.toString(),
                inputBalanceCallB.value.toString(),
                pool.pool._inputTokenLiquidityBalance.toString(),
            ]);
        }
    }
    else {
        graph_ts_1.log.info("InputBalanceCall Reverted", []);
    }
}
exports.updateAMMTVE = updateAMMTVE;
