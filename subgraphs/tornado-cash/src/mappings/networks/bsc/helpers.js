"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWithdrawal = exports.createDeposit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const getters_1 = require("../../../common/getters");
const numbers_1 = require("../../../common/utils/numbers");
const constants_1 = require("../../../common/constants");
const metrics_1 = require("../../../common/metrics");
function createDeposit(poolAddress, event) {
    const pool = (0, getters_1.getOrCreatePool)(poolAddress, event);
    const inputToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[0]), event.block.number);
    pool.inputTokenBalances = [
        pool.inputTokenBalances[0].plus(pool._denomination),
    ];
    const inputTokenBalanceUSD = (0, numbers_1.bigIntToBigDecimal)(pool.inputTokenBalances[0], inputToken.decimals).times(inputToken.lastPriceUSD);
    pool.inputTokenBalancesUSD = [inputTokenBalanceUSD];
    pool.totalValueLockedUSD = inputTokenBalanceUSD;
    pool.save();
}
exports.createDeposit = createDeposit;
function createWithdrawal(poolAddress, event) {
    const pool = (0, getters_1.getOrCreatePool)(poolAddress, event);
    const inputToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(pool.inputTokens[0]), event.block.number);
    pool.inputTokenBalances = [
        pool.inputTokenBalances[0].minus(pool._denomination),
    ];
    const inputTOkenBalanceUSD = (0, numbers_1.bigIntToBigDecimal)(pool.inputTokenBalances[0], inputToken.decimals).times(inputToken.lastPriceUSD);
    pool.inputTokenBalancesUSD = [inputTOkenBalanceUSD];
    pool.totalValueLockedUSD = inputTOkenBalanceUSD;
    pool.save();
    const relayerFeeUsd = (0, numbers_1.bigIntToBigDecimal)(event.params.fee, inputToken.decimals).times(inputToken.lastPriceUSD);
    if (relayerFeeUsd != constants_1.BIGDECIMAL_ZERO) {
        const protocolFeeUsd = constants_1.BIGDECIMAL_ZERO;
        (0, metrics_1.updateRevenue)(event, poolAddress, relayerFeeUsd, protocolFeeUsd);
    }
}
exports.createWithdrawal = createWithdrawal;
