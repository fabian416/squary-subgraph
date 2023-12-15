"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenAmountsSumUSD = exports.getPriceUSD = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const SwapV1_1 = require("../../generated/templates/Swap/SwapV1");
const token_1 = require("../entities/token");
const prices_1 = require("../prices");
const constants_1 = require("../prices/common/constants");
const constants_2 = require("./constants");
const numbers_1 = require("./numbers");
const OPTIMISM = "optimism";
const WETH = "WETH";
const WBTC = "WBTC";
const SDL = "SDL";
const USD_TOKENS = new Set();
USD_TOKENS.add("alUSD");
USD_TOKENS.add("FEI");
USD_TOKENS.add("FRAX");
USD_TOKENS.add("LUSD");
USD_TOKENS.add("DAI");
USD_TOKENS.add("USDC");
USD_TOKENS.add("USDT");
USD_TOKENS.add("sUSD");
USD_TOKENS.add("wCUSD");
USD_TOKENS.add("nUSD");
USD_TOKENS.add("MIM");
USD_TOKENS.add("USDs");
const ETH_TOKENS = new Set();
ETH_TOKENS.add(WETH);
ETH_TOKENS.add("alETH");
ETH_TOKENS.add("sETH");
ETH_TOKENS.add("vETH2");
const BTC_TOKENS = new Set();
BTC_TOKENS.add(WBTC);
BTC_TOKENS.add("tBTC");
BTC_TOKENS.add("renBTC");
BTC_TOKENS.add("sBTC");
function getPriceUSD(token, event) {
    const symbol = token.symbol;
    if (USD_TOKENS.has(symbol)) {
        return constants_2.BIGDECIMAL_ONE;
    }
    if (token.lastPriceBlockNumber &&
        token.lastPriceBlockNumber == event.block.number) {
        return token.lastPriceUSD;
    }
    // No market for SDL yet
    if (symbol == SDL) {
        return constants_2.BIGDECIMAL_ZERO;
    }
    if (token._pool) {
        // it is an LP token, get price from underlying
        const pool = schema_1.LiquidityPool.load(token._pool);
        return pool.outputTokenPriceUSD
            ? pool.outputTokenPriceUSD
            : constants_2.BIGDECIMAL_ZERO;
    }
    const network = graph_ts_1.dataSource.network();
    if (network == OPTIMISM) {
        // Optimism currently has only one USD pool, should not reach this
        graph_ts_1.log.error("Failed to fetch price: network {} not implemented", [network]);
        return constants_2.BIGDECIMAL_ZERO;
    }
    let price;
    if (ETH_TOKENS.has(symbol)) {
        const address = constants_1.WHITELIST_TOKENS_MAP.get(network).get(WETH);
        price = (0, prices_1.getUsdPrice)(address);
    }
    else if (BTC_TOKENS.has(symbol)) {
        const address = constants_1.WHITELIST_TOKENS_MAP.get(network).get(WBTC);
        price = (0, prices_1.getUsdPrice)(address);
    }
    else {
        price = (0, prices_1.getUsdPrice)(graph_ts_1.Address.fromString(token.id));
    }
    if (!price || price.equals(constants_2.BIGDECIMAL_ZERO)) {
        graph_ts_1.log.info("fetching token price from saddle: {}", [token.id]);
        price = getUSDPriceFromSaddle(graph_ts_1.Address.fromString(token.id));
    }
    token.lastPriceBlockNumber = event.block.number;
    token.lastPriceUSD = price;
    token.save();
    return price;
}
exports.getPriceUSD = getPriceUSD;
function getTokenAmountsSumUSD(event, tokenAmounts, tokens) {
    let sum = constants_2.BIGDECIMAL_ZERO;
    for (let i = 0; i < tokens.length; i++) {
        if (tokenAmounts[i] == constants_2.BIGINT_ZERO) {
            continue;
        }
        const token = (0, token_1.getOrCreateTokenFromString)(tokens[i]);
        const amount = (0, numbers_1.bigIntToBigDecimal)(tokenAmounts[i], token.decimals);
        sum = sum.plus(amount.times(getPriceUSD(token, event)));
    }
    return sum;
}
exports.getTokenAmountsSumUSD = getTokenAmountsSumUSD;
// getUSDPriceFromSaddle will attempt to fetch a given token price from
// a saddle pool, using the highest liquidity pool that contains a whitelisted stable.
function getUSDPriceFromSaddle(token) {
    if (!constants_2.WHITELISTED_STABLE_ADDRESSES.has(graph_ts_1.dataSource.network())) {
        return constants_2.BIGDECIMAL_ZERO;
    }
    const tp = schema_1._TokenPools.load(token.toHexString());
    if (!tp) {
        return constants_2.BIGDECIMAL_ZERO;
    }
    const pool = getHighestLiquidityStablePool(tp.pools);
    if (!pool) {
        return constants_2.BIGDECIMAL_ZERO;
    }
    const stable = pickOutputToken(pool.inputTokens);
    if (!stable) {
        graph_ts_1.log.error("unable to calculate price, no route found to whitelisted stable. Token {} Pool {}", [token.toHexString(), pool.id]);
        return constants_2.BIGDECIMAL_ZERO;
    }
    const inDecimals = (0, token_1.getTokenDecimals)(token.toHexString());
    const amountOne = constants_1.BIGINT_TEN.pow(inDecimals);
    const value = calculateSwap(pool, token, stable, amountOne);
    if (value.equals(constants_2.BIGINT_ZERO)) {
        return constants_2.BIGDECIMAL_ZERO;
    }
    const outDecimals = (0, token_1.getTokenDecimals)(stable.toHexString());
    return (0, numbers_1.bigIntToBigDecimal)(value, outDecimals);
}
function pickOutputToken(tokens) {
    const stables = constants_2.WHITELISTED_STABLE_ADDRESSES.get(graph_ts_1.dataSource.network());
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (stables.has(token)) {
            return graph_ts_1.Address.fromString(token);
        }
    }
    return null;
}
function getHighestLiquidityStablePool(liqPools) {
    if (!liqPools) {
        return null;
    }
    let bestPool = null;
    let maxLiq = constants_2.LIQUIDITY_THRESHOLD_FOR_SADDLE_PRICING;
    for (let i = 0; i < liqPools.length; i++) {
        const pool = schema_1.LiquidityPool.load(liqPools[i]);
        if (pool.totalValueLockedUSD.lt(maxLiq)) {
            continue;
        }
        if (!poolHasWhitelistedStable(pool)) {
            continue;
        }
        bestPool = pool;
        maxLiq = pool.totalValueLockedUSD;
    }
    return bestPool;
}
// poolHasWhitelistedStable will return true if the pool trades any of the
// whitelisted stable tokens.
function poolHasWhitelistedStable(pool) {
    const stables = constants_2.WHITELISTED_STABLE_ADDRESSES.get(graph_ts_1.dataSource.network());
    for (let i = 0; i < pool.inputTokens.length; i++) {
        if (stables.has(pool.inputTokens[i])) {
            return true;
        }
    }
    return false;
}
// calculateSwap returns the amount of `tokenOut` that would result from swapping
// `amount` of `tokenIn` in a given saddle pool.
function calculateSwap(pool, tokenIn, tokenOut, amount) {
    const inputIndex = pool._inputTokensOrdered.indexOf(tokenIn.toHexString());
    const outputIndex = pool._inputTokensOrdered.indexOf(tokenOut.toHexString());
    if (inputIndex == -1 || outputIndex == -1) {
        graph_ts_1.log.error("error calculating price from saddle: token not found in target pool. InToken: {} OutToken: {} Pool: {}", [tokenIn.toHexString(), tokenOut.toHexString(), pool.id]);
        graph_ts_1.log.critical("", []);
        return constants_2.BIGINT_ZERO;
    }
    const contract = SwapV1_1.SwapV1.bind(graph_ts_1.Address.fromString(pool.id));
    let call;
    if (!pool._basePool) {
        call = contract.try_calculateSwap(inputIndex, outputIndex, amount);
    }
    else {
        call = contract.try_calculateSwapUnderlying(inputIndex, outputIndex, amount);
    }
    if (call.reverted) {
        graph_ts_1.log.error("unable to calculate swap from saddle pool. Pool: {}, TokenIn: {}, TokenOut: {}, Amount: {}", [
            pool.id,
            tokenIn.toHexString(),
            tokenOut.toHexString(),
            amount.toString(),
        ]);
        return constants_2.BIGINT_ZERO;
    }
    return call.value;
}
