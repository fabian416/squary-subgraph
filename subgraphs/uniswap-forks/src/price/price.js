"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrackedVolumeUSD = exports.findUSDPricePerToken = exports.getNativeTokenPriceInUSD = void 0;
const index_1 = require("@graphprotocol/graph-ts/index");
const getters_1 = require("../common/getters");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const utils_1 = require("../common/utils/utils");
const configure_1 = require("../../configurations/configure");
const price_1 = require("../../protocols/camelot-v2/src/price");
// Update the token price of the native token for the specific protocol/network (see network specific configs)
// Update the token by referencing the native token against pools with the reference token and a stable coin
// Estimate the price against the pool with the highest liquidity
function getNativeTokenPriceInUSD(nativeToken) {
    let nativeAmount = constants_1.BIGDECIMAL_ZERO;
    let stableAmount = constants_1.BIGDECIMAL_ZERO;
    // fetch average price of NATIVE_TOKEN_ADDRESS from STABLE_ORACLES
    for (let i = 0; i < configure_1.NetworkConfigs.getStableOraclePools().length; i++) {
        const pool = schema_1._LiquidityPoolAmount.load(configure_1.NetworkConfigs.getStableOraclePools()[i]);
        if (!pool)
            continue;
        if (pool.inputTokens[0] == configure_1.NetworkConfigs.getReferenceToken()) {
            if (pool.inputTokenBalances[1] > stableAmount) {
                nativeAmount = pool.inputTokenBalances[0];
                stableAmount = pool.inputTokenBalances[1];
            }
        }
        else {
            if (pool.inputTokenBalances[0] > stableAmount) {
                nativeAmount = pool.inputTokenBalances[1];
                stableAmount = pool.inputTokenBalances[0];
            }
        }
    }
    nativeToken.lastPriceUSD = (0, utils_1.safeDiv)(stableAmount, nativeAmount);
    nativeToken.save();
    return nativeToken.lastPriceUSD;
}
exports.getNativeTokenPriceInUSD = getNativeTokenPriceInUSD;
/**
 * This derives the price of a token in USD using pools where it is paired with a whitelisted token and pair is above the minimum liquidity threshold (helps prevent bad pricing).
 * You can find the possible whitelisted tokens used for comparision in the network configuration typescript file.
 **/
function findUSDPricePerToken(event, token) {
    if (token.id == configure_1.NetworkConfigs.getReferenceToken()) {
        return getNativeTokenPriceInUSD(token);
    }
    const tokenWhitelist = (0, getters_1.getOrCreateTokenWhitelist)(token.id);
    const whiteList = tokenWhitelist.whitelistPools;
    // for now just take USD from pool with greatest TVL
    // need to update this to actually detect best rate based on liquidity distribution
    let largestLiquidityWhitelistTokens = constants_1.BIGDECIMAL_ZERO;
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
            const poolAddress = whiteList[i];
            const poolAmounts = (0, getters_1.getLiquidityPoolAmounts)(poolAddress);
            const pool = (0, getters_1.getLiquidityPool)(poolAddress);
            if (pool.outputTokenSupply.gt(constants_1.BIGINT_ZERO)) {
                const priceTokenIndex = get_token_index(pool, token);
                if (priceTokenIndex == -1) {
                    continue;
                }
                const whitelistTokenIndex = 0 == priceTokenIndex ? 1 : 0;
                const whitelistToken = (0, getters_1.getOrCreateToken)(event, pool.inputTokens[whitelistTokenIndex], false);
                const whitelistTokenLocked = poolAmounts.inputTokenBalances[whitelistTokenIndex].times(whitelistToken.lastPriceUSD);
                if (whitelistTokenLocked.gt(largestLiquidityWhitelistTokens) &&
                    whitelistTokenLocked.gt(configure_1.NetworkConfigs.getMinimumLiquidityThresholdTrackPrice())) {
                    largestLiquidityWhitelistTokens = whitelistTokenLocked;
                    // token1 per our token * nativeToken per token1
                    if (configure_1.NetworkConfigs.getProtocolSlug() == "camelot-v2") {
                        const newPrice = (0, price_1.findStablePairUSDPriceForToken)(pool, whitelistToken, token);
                        if (newPrice) {
                            priceSoFar = newPrice;
                            continue;
                        }
                    }
                    const newPrice = (0, utils_1.safeDiv)(poolAmounts.inputTokenBalances[whitelistTokenIndex], poolAmounts.inputTokenBalances[priceTokenIndex]).times(whitelistToken.lastPriceUSD);
                    if (isValidTVL(pool, token, newPrice)) {
                        priceSoFar = newPrice;
                    }
                }
            }
        }
    }
    if (constants_1.BIGDECIMAL_ZERO.equals(priceSoFar)) {
        return priceSoFar;
    }
    // Buffer token pricings that would cause large spikes on the protocol level
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const tokenTVLDelta = (0, utils_1.absBigDecimal)(priceSoFar
        .times((0, utils_1.convertTokenToDecimal)(token._totalSupply, token.decimals))
        .minus(token._totalValueLockedUSD));
    const protocolTVLPercentageDelta = (0, utils_1.absBigDecimal)((0, utils_1.safeDiv)(tokenTVLDelta, protocol.totalValueLockedUSD));
    if (protocolTVLPercentageDelta.gt(constants_1.BIGDECIMAL_FIVE_PERCENT)) {
        index_1.log.warning("Price too high for token: {} from pool: {}", [
            token.id,
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
function isValidTVL(pool, token, price) {
    const newTokenTotalValueLocked = (0, utils_1.convertTokenToDecimal)(token._totalSupply, token.decimals).times(price);
    // If price is too high, skip this pool
    if (newTokenTotalValueLocked.gt(constants_1.BIGDECIMAL_TEN_BILLION)) {
        index_1.log.warning("Price too high for token: {} from pool: {}", [
            token.id,
            pool.id,
        ]);
        return false;
    }
    return true;
}
/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 * Also, return the value of the valume for each token if it is contained in the whitelist
 */
function getTrackedVolumeUSD(pool, tokenAmount0, token0, tokenAmount1, token1) {
    const price0USD = token0.lastPriceUSD;
    const price1USD = token1.lastPriceUSD;
    // dont count tracked volume on these pairs - usually rebass tokens
    if (configure_1.NetworkConfigs.getUntrackedPairs().includes(pool.id)) {
        return [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
    }
    const poolDeposits = schema_1._HelperStore.load(pool.id);
    if (poolDeposits == null)
        return [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
    // if less than 5 LPs, require high minimum reserve amount amount or return 0
    // Updated from original subgraph. Number of deposits may not equal number of liquidity providers
    if (poolDeposits.valueInt < constants_1.INT_FIVE) {
        const reserve0USD = pool.inputTokenBalances[0].times(price0USD);
        const reserve1USD = pool.inputTokenBalances[1].times(price1USD);
        if (configure_1.NetworkConfigs.getWhitelistTokens().includes(token0.id) &&
            configure_1.NetworkConfigs.getWhitelistTokens().includes(token1.id)) {
            if (reserve0USD
                .plus(reserve1USD)
                .lt(configure_1.NetworkConfigs.getMinimumLiquidityThresholdTrackVolume())) {
                return [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
            }
        }
        if (configure_1.NetworkConfigs.getWhitelistTokens().includes(token0.id) &&
            !configure_1.NetworkConfigs.getWhitelistTokens().includes(token1.id)) {
            if (reserve0USD
                .times(constants_1.BIGDECIMAL_TWO)
                .lt(configure_1.NetworkConfigs.getMinimumLiquidityThresholdTrackVolume())) {
                return [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
            }
        }
        if (!configure_1.NetworkConfigs.getWhitelistTokens().includes(token0.id) &&
            configure_1.NetworkConfigs.getWhitelistTokens().includes(token1.id)) {
            if (reserve1USD
                .times(constants_1.BIGDECIMAL_TWO)
                .lt(configure_1.NetworkConfigs.getMinimumLiquidityThresholdTrackVolume())) {
                return [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
            }
        }
    }
    // both are whitelist tokens, return sum of both amounts
    if (configure_1.NetworkConfigs.getWhitelistTokens().includes(token0.id) &&
        configure_1.NetworkConfigs.getWhitelistTokens().includes(token1.id)) {
        const token0ValueUSD = tokenAmount0.times(price0USD);
        const token1ValueUSD = tokenAmount1.times(price1USD);
        return [
            token0ValueUSD,
            token1ValueUSD,
            token0ValueUSD.plus(token1ValueUSD).div(constants_1.BIGDECIMAL_TWO),
        ];
    }
    // take double value of the whitelisted token amount
    if (configure_1.NetworkConfigs.getWhitelistTokens().includes(token0.id) &&
        !configure_1.NetworkConfigs.getWhitelistTokens().includes(token1.id)) {
        return [
            tokenAmount0.times(price0USD),
            tokenAmount0.times(price0USD),
            tokenAmount0.times(price0USD),
        ];
    }
    // take double value of the whitelisted token amount
    if (!configure_1.NetworkConfigs.getWhitelistTokens().includes(token0.id) &&
        configure_1.NetworkConfigs.getWhitelistTokens().includes(token1.id)) {
        return [
            tokenAmount1.times(price1USD),
            tokenAmount1.times(price1USD),
            tokenAmount1.times(price1USD),
        ];
    }
    // neither token is on white list, tracked amount is 0
    return [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
}
exports.getTrackedVolumeUSD = getTrackedVolumeUSD;
