"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrackedVolumeUSD = exports.findUSDPricePerToken = exports.getNativeTokenPriceInUSD = exports.sqrtPriceX96ToTokenPrices = void 0;
const schema_1 = require("../../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../constants");
const utils_1 = require("../utils/utils");
const configure_1 = require("../../../configurations/configure");
const token_1 = require("../entities/token");
const pool_1 = require("../entities/pool");
const protocol_1 = require("../entities/protocol");
// Divide numbers too large for floating point or BigDecimal
function sqrtPriceX96ToTokenPrices(sqrtPriceX96, token0, token1) {
    const num = sqrtPriceX96.times(sqrtPriceX96);
    const denom = constants_1.Q192;
    const price1 = num
        .times(constants_1.PRECISION)
        .div(denom)
        .times((0, utils_1.exponentToBigInt)(token0.decimals))
        .div((0, utils_1.exponentToBigInt)(token1.decimals))
        .toBigDecimal()
        .div(constants_1.PRECISION.toBigDecimal());
    const price0 = (0, utils_1.safeDiv)(constants_1.BIGDECIMAL_ONE, price1);
    return [price0, price1];
}
exports.sqrtPriceX96ToTokenPrices = sqrtPriceX96ToTokenPrices;
// Derived the price of the native token (Ethereum) using pools where it is paired with a stable coin.
function getNativeTokenPriceInUSD(nativeToken) {
    let stableAmount = constants_1.BIGDECIMAL_ZERO;
    let tokenIndicator;
    let largestPool = schema_1._LiquidityPoolAmount.load(configure_1.NetworkConfigs.getStableOraclePools()[0]);
    if (largestPool == null) {
        graph_ts_1.log.warning("No STABLE_ORACLE_POOLS given", []);
        return nativeToken.lastPriceUSD;
    }
    if (largestPool.inputTokens[constants_1.INT_ZERO] == configure_1.NetworkConfigs.getReferenceToken()) {
        tokenIndicator = constants_1.INT_ONE;
    }
    else {
        tokenIndicator = constants_1.INT_ZERO;
    }
    // fetch average price of NATIVE_TOKEN_ADDRESS from STABLE_ORACLES
    for (let i = constants_1.INT_ZERO; i < configure_1.NetworkConfigs.getStableOraclePools().length; i++) {
        const pool = schema_1._LiquidityPoolAmount.load(configure_1.NetworkConfigs.getStableOraclePools()[i]);
        if (!pool)
            continue;
        if (pool.inputTokens[constants_1.INT_ZERO] == configure_1.NetworkConfigs.getReferenceToken()) {
            if (pool.inputTokenBalances[constants_1.INT_ONE] > stableAmount) {
                stableAmount = pool.inputTokenBalances[constants_1.INT_ONE];
                largestPool = pool;
                tokenIndicator = constants_1.INT_ONE;
            }
        }
        else {
            if (pool.inputTokenBalances[constants_1.INT_ZERO] > stableAmount) {
                stableAmount = pool.inputTokenBalances[constants_1.INT_ZERO];
                largestPool = pool;
                tokenIndicator = constants_1.INT_ZERO;
            }
        }
    }
    if (stableAmount.gt(constants_1.BIGDECIMAL_TEN_THOUSAND) &&
        largestPool.tokenPrices[tokenIndicator]) {
        nativeToken.lastPriceUSD = largestPool.tokenPrices[tokenIndicator];
    }
    return nativeToken.lastPriceUSD;
}
exports.getNativeTokenPriceInUSD = getNativeTokenPriceInUSD;
/**
 * This derives the price of a token in USD using pools where it is paired with a whitelisted token.
 * You can find the possible whitelisted tokens used for comparision in the network configuration typescript file.
 **/
function findUSDPricePerToken(event, token) {
    if (token.id == configure_1.NetworkConfigs.getReferenceToken()) {
        return getNativeTokenPriceInUSD(token);
    }
    const tokenWhitelist = (0, token_1.getOrCreateTokenWhitelist)(token.id);
    const whiteList = tokenWhitelist.whitelistPools;
    // for now just take USD from pool with greatest TVL
    // need to update this to actually detect best rate based on liquidity distribution
    let largestWhitelistTokenValue = constants_1.BIGDECIMAL_ZERO;
    let priceSoFar = constants_1.BIGDECIMAL_ZERO;
    // hardcoded fix for incorrect rates
    // if whitelist includes token - get the safe price
    if (configure_1.NetworkConfigs.getStableCoins().includes(token.id)) {
        priceSoFar = constants_1.BIGDECIMAL_ONE;
    }
    else if (configure_1.NetworkConfigs.getUntrackedTokens().includes(token.id)) {
        priceSoFar = constants_1.BIGDECIMAL_ZERO;
    }
    else {
        for (let i = 0; i < whiteList.length; ++i) {
            const poolAmounts = (0, pool_1.getLiquidityPoolAmounts)(whiteList[i]);
            const pool = (0, pool_1.getLiquidityPool)(whiteList[i]);
            if (pool.totalValueLockedUSD.gt(constants_1.BIGDECIMAL_ZERO)) {
                const token_index = get_token_index(pool, token);
                if (token_index == -1) {
                    graph_ts_1.log.critical("Token not found in pool", []);
                    continue;
                }
                const whitelistTokenIndex = 0 == token_index ? 1 : 0;
                const whitelistToken = (0, token_1.getOrCreateToken)(event, pool.inputTokens[whitelistTokenIndex], false);
                const whitelistTokenValueLocked = poolAmounts.inputTokenBalances[whitelistTokenIndex].times(whitelistToken.lastPriceUSD);
                // Check if it meets criteria to update prices.
                if (whitelistTokenValueLocked.gt(largestWhitelistTokenValue) &&
                    whitelistTokenValueLocked.gt(configure_1.NetworkConfigs.getMinimumLiquidityThreshold())) {
                    const newPriceSoFar = computePriceFromConvertedSqrtX96Ratio(pool, token, whitelistToken, poolAmounts.tokenPrices[whitelistTokenIndex]);
                    if (!newPriceSoFar) {
                        continue;
                    }
                    token._lastPricePool = pool.id;
                    // Set new price and largest pool for pricing.
                    largestWhitelistTokenValue = whitelistTokenValueLocked;
                    priceSoFar = newPriceSoFar;
                }
            }
        }
    }
    // Buffer token pricings that would cause large spikes on the protocol level
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const tokenTVLDelta = (0, utils_1.absBigDecimal)(priceSoFar
        .times((0, utils_1.convertTokenToDecimal)(token._totalSupply, token.decimals))
        .minus(token._totalValueLockedUSD));
    const protocolTVLPercentageDelta = (0, utils_1.absBigDecimal)((0, utils_1.safeDiv)(tokenTVLDelta, protocol.totalValueLockedUSD));
    if (protocolTVLPercentageDelta.gt(constants_1.BIGDECIMAL_FIVE_PERCENT)) {
        graph_ts_1.log.warning("Price too high for token: {} from pool: {}", [
            token.id.toHexString(),
            priceSoFar.toString(),
        ]);
        if (token._largeTVLImpactBuffer < constants_1.PRICE_CHANGE_BUFFER_LIMIT) {
            token._largeTVLImpactBuffer += 1;
            token.save();
            return token.lastPriceUSD;
        }
    }
    if (!token.lastPriceUSD || token.lastPriceUSD.equals(constants_1.BIGDECIMAL_ZERO)) {
        token.save();
        return priceSoFar;
    }
    // If priceSoFar 10x greater or less than token.lastPriceUSD, use token.lastPriceUSD
    // Increment buffer so that it allows large price jumps if seen repeatedly
    if (priceSoFar.gt(token.lastPriceUSD.times(constants_1.BIGDECIMAL_TWO)) ||
        priceSoFar.lt(token.lastPriceUSD.div(constants_1.BIGDECIMAL_TWO))) {
        if (token._largePriceChangeBuffer < constants_1.PRICE_CHANGE_BUFFER_LIMIT) {
            token._largePriceChangeBuffer += 1;
            token.save();
            return token.lastPriceUSD;
        }
    }
    token._largePriceChangeBuffer = 0;
    token._largeTVLImpactBuffer = 0;
    token.save();
    return priceSoFar;
}
exports.findUSDPricePerToken = findUSDPricePerToken;
// Tried to return null from here and it did not
function get_token_index(pool, token) {
    if (pool.inputTokens[0] == token.id) {
        return 0;
    }
    if (pool.inputTokens[1] == token.id) {
        return 1;
    }
    return -1;
}
function computePriceFromConvertedSqrtX96Ratio(pool, tokenToBePriced, whitelistToken, convertedSqrtX96Ratio) {
    // Calculate new price of a token and TVL of token in this pool.
    const newPriceSoFar = convertedSqrtX96Ratio.times(whitelistToken.lastPriceUSD);
    const newTokenTotalValueLocked = (0, utils_1.convertTokenToDecimal)(tokenToBePriced._totalSupply, tokenToBePriced.decimals).times(newPriceSoFar);
    // If price is too high, skip this pool
    if (newTokenTotalValueLocked.gt(constants_1.BIGDECIMAL_TEN_BILLION)) {
        graph_ts_1.log.warning("Price too high for token: {} from pool: {}", [
            tokenToBePriced.id.toHexString(),
            pool.id.toHexString(),
        ]);
        return null;
    }
    return newPriceSoFar;
}
/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 * Also, return the value of the valume for each token if it is contained in the whitelist
 */
function getTrackedVolumeUSD(pool, tokens, amountsUSD) {
    // dont count tracked volume on these pairs - usually rebase tokens
    if (configure_1.NetworkConfigs.getUntrackedPairs().includes(pool.id)) {
        return [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
    }
    const poolDeposits = schema_1._HelperStore.load(pool.id);
    if (poolDeposits == null)
        return [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
    // if less than 5 LPs, require high minimum reserve amount amount or return 0
    // Updated from original subgraph. Number of deposits may not equal number of liquidity providers
    if (poolDeposits.valueInt < 5) {
        const poolReservesUSD = [
            (0, utils_1.convertTokenToDecimal)(pool.inputTokenBalances[constants_1.INT_ZERO], tokens[constants_1.INT_ZERO].decimals).times(tokens[constants_1.INT_ZERO].lastPriceUSD),
            (0, utils_1.convertTokenToDecimal)(pool.inputTokenBalances[constants_1.INT_ONE], tokens[constants_1.INT_ONE].decimals).times(tokens[constants_1.INT_ONE].lastPriceUSD),
        ];
        if (configure_1.NetworkConfigs.getWhitelistTokens().includes(tokens[constants_1.INT_ZERO].id) &&
            configure_1.NetworkConfigs.getWhitelistTokens().includes(tokens[constants_1.INT_ONE].id)) {
            if (poolReservesUSD[constants_1.INT_ZERO].plus(poolReservesUSD[constants_1.INT_ONE]).lt(configure_1.NetworkConfigs.getMinimumLiquidityThreshold())) {
                return [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
            }
        }
        if (configure_1.NetworkConfigs.getWhitelistTokens().includes(tokens[constants_1.INT_ZERO].id) &&
            !configure_1.NetworkConfigs.getWhitelistTokens().includes(tokens[constants_1.INT_ONE].id)) {
            if (poolReservesUSD[constants_1.INT_ZERO].times(constants_1.BIGDECIMAL_TWO).lt(configure_1.NetworkConfigs.getMinimumLiquidityThreshold())) {
                return [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
            }
        }
        if (!configure_1.NetworkConfigs.getWhitelistTokens().includes(tokens[constants_1.INT_ZERO].id) &&
            configure_1.NetworkConfigs.getWhitelistTokens().includes(tokens[constants_1.INT_ONE].id)) {
            if (poolReservesUSD[constants_1.INT_ONE].times(constants_1.BIGDECIMAL_TWO).lt(configure_1.NetworkConfigs.getMinimumLiquidityThreshold())) {
                return [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
            }
        }
    }
    // both are whitelist tokens, return sum of both amounts
    if (configure_1.NetworkConfigs.getWhitelistTokens().includes(tokens[constants_1.INT_ZERO].id) &&
        configure_1.NetworkConfigs.getWhitelistTokens().includes(tokens[constants_1.INT_ONE].id)) {
        return [amountsUSD[constants_1.INT_ZERO], amountsUSD[constants_1.INT_ONE]];
    }
    // take double value of the whitelisted token amount
    if (configure_1.NetworkConfigs.getWhitelistTokens().includes(tokens[constants_1.INT_ZERO].id) &&
        !configure_1.NetworkConfigs.getWhitelistTokens().includes(tokens[constants_1.INT_ONE].id)) {
        return [amountsUSD[constants_1.INT_ZERO], amountsUSD[constants_1.INT_ZERO]];
    }
    // take double value of the whitelisted token amount
    if (!configure_1.NetworkConfigs.getWhitelistTokens().includes(tokens[constants_1.INT_ZERO].id) &&
        configure_1.NetworkConfigs.getWhitelistTokens().includes(tokens[constants_1.INT_ONE].id)) {
        return [amountsUSD[constants_1.INT_ONE], amountsUSD[constants_1.INT_ONE]];
    }
    // neither token is on white list, tracked amount is 0
    return [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
}
exports.getTrackedVolumeUSD = getTrackedVolumeUSD;
