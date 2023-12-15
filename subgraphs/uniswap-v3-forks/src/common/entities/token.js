"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTokenPrices = exports.updateTokenWhitelists = exports.isFakeWhitelistToken = exports.getOrCreateTokenWhitelistSymbol = exports.getOrCreateTokenWhitelist = exports.getOrCreateLPToken = exports.getOrCreateToken = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../../configurations/configure");
const ERC20_1 = require("../../../generated/Factory/ERC20");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../constants");
const price_1 = require("../price/price");
const pool_1 = require("./pool");
function getOrCreateToken(event, address, getNewPrice = true) {
    let token = schema_1.Token.load(address);
    if (!token) {
        token = new schema_1.Token(address);
        let name = "";
        let symbol = "";
        let decimals = constants_1.DEFAULT_DECIMALS;
        if (!configure_1.NetworkConfigs.getBrokenERC20Tokens().includes(address)) {
            const erc20Contract = ERC20_1.ERC20.bind(graph_ts_1.Address.fromBytes(address));
            // TODO: add overrides for name and symbol
            const nameCall = erc20Contract.try_name();
            if (!nameCall.reverted)
                name = nameCall.value;
            const symbolCall = erc20Contract.try_symbol();
            if (!symbolCall.reverted)
                symbol = symbolCall.value;
            const decimalsCall = erc20Contract.try_decimals();
            if (!decimalsCall.reverted)
                decimals = decimalsCall.value;
        }
        if (token.id ==
            graph_ts_1.Address.fromHexString("0x82af49447d8a07e3bd95bd0d56f35241523fbab1".toLowerCase()) &&
            configure_1.NetworkConfigs.getNetwork() == constants_1.Network.ARBITRUM_ONE) {
            name = "WETH";
            symbol = "WETH";
            decimals = constants_1.DEFAULT_DECIMALS;
        }
        token.name = name;
        token.symbol = symbol;
        token.decimals = decimals;
        token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
        token.lastPriceBlockNumber = constants_1.BIGINT_ZERO;
        token._totalSupply = constants_1.BIGINT_ZERO;
        token._totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        token._largeTVLImpactBuffer = 0;
        token._largePriceChangeBuffer = 0;
        // Fixing token fields that did not return proper values from contract
        // Manually coded in when necessary
        token = fixTokenFields(token);
        token.save();
    }
    if (token.lastPriceBlockNumber &&
        event.block.number.minus(token.lastPriceBlockNumber).gt(constants_1.BIGINT_TEN) &&
        getNewPrice) {
        const newPrice = (0, price_1.findUSDPricePerToken)(event, token);
        token.lastPriceUSD = newPrice;
        token.lastPriceBlockNumber = event.block.number;
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateLPToken(tokenAddress, token0, token1) {
    let token = schema_1.Token.load(tokenAddress);
    // fetch info if null
    if (token === null) {
        token = new schema_1.Token(tokenAddress);
        token.symbol = token0.name + "/" + token1.name;
        token.name = token0.name + "/" + token1.name + " LP";
        token.decimals = constants_1.DEFAULT_DECIMALS;
        token.save();
    }
    return token;
}
exports.getOrCreateLPToken = getOrCreateLPToken;
function getOrCreateTokenWhitelist(tokenAddress) {
    let tokenTracker = schema_1._TokenWhitelist.load(tokenAddress);
    // fetch info if null
    if (!tokenTracker) {
        tokenTracker = new schema_1._TokenWhitelist(tokenAddress);
        tokenTracker.whitelistPools = [];
        tokenTracker.save();
    }
    return tokenTracker;
}
exports.getOrCreateTokenWhitelist = getOrCreateTokenWhitelist;
function formatTokenSymbol(tokenSymbol) {
    return tokenSymbol.replace(" ", "").toLowerCase();
}
function getOrCreateTokenWhitelistSymbol(tokenSymbol, tokenAddress) {
    // Strip and lowercase token symbol
    const formattedTokenSymbol = formatTokenSymbol(tokenSymbol);
    let tokenWhitelistSymbol = schema_1._TokenWhitelistSymbol.load(formattedTokenSymbol);
    // fetch info if null
    if (!tokenWhitelistSymbol) {
        tokenWhitelistSymbol = new schema_1._TokenWhitelistSymbol(formattedTokenSymbol);
        tokenWhitelistSymbol.address = tokenAddress;
        tokenWhitelistSymbol.save();
    }
    return tokenWhitelistSymbol;
}
exports.getOrCreateTokenWhitelistSymbol = getOrCreateTokenWhitelistSymbol;
function isFakeWhitelistToken(token) {
    const formattedTokenSymbol = formatTokenSymbol(token.symbol);
    const tokenWhitelistSymbol = schema_1._TokenWhitelistSymbol.load(formattedTokenSymbol);
    if (tokenWhitelistSymbol && tokenWhitelistSymbol.address != token.id) {
        return true;
    }
    return false;
}
exports.isFakeWhitelistToken = isFakeWhitelistToken;
// These whiteslists are used to track what pools the tokens are a part of. Used in price calculations.
function updateTokenWhitelists(token0, token1, poolAddress) {
    // update white listed pools
    if (configure_1.NetworkConfigs.getWhitelistTokens().includes(token0.id)) {
        const tokenWhitelist1 = getOrCreateTokenWhitelist(token1.id);
        const tokenWhitelistSymbol0 = getOrCreateTokenWhitelistSymbol(token0.symbol, token0.id);
        const newPools = tokenWhitelist1.whitelistPools;
        newPools.push(poolAddress);
        tokenWhitelist1.whitelistPools = newPools;
        tokenWhitelist1.save();
        tokenWhitelistSymbol0.save();
    }
    if (configure_1.NetworkConfigs.getWhitelistTokens().includes(token1.id)) {
        const tokenWhitelist0 = getOrCreateTokenWhitelist(token0.id);
        const tokenWhitelistSymbol1 = getOrCreateTokenWhitelistSymbol(token1.symbol, token1.id);
        const newPools = tokenWhitelist0.whitelistPools;
        newPools.push(poolAddress);
        tokenWhitelist0.whitelistPools = newPools;
        tokenWhitelist0.save();
        tokenWhitelistSymbol1.save();
    }
}
exports.updateTokenWhitelists = updateTokenWhitelists;
function updateTokenPrices(event, sqrtPriceX96) {
    const poolAmounts = (0, pool_1.getLiquidityPoolAmounts)(event.address);
    const token0 = getOrCreateToken(event, poolAmounts.inputTokens[constants_1.INT_ZERO]);
    const token1 = getOrCreateToken(event, poolAmounts.inputTokens[constants_1.INT_ONE]);
    poolAmounts.tokenPrices = (0, price_1.sqrtPriceX96ToTokenPrices)(sqrtPriceX96, token0, token1);
    poolAmounts.save();
}
exports.updateTokenPrices = updateTokenPrices;
function fixTokenFields(token) {
    // Arbitrum
    if (token.id ==
        graph_ts_1.Address.fromHexString("0x82af49447d8a07e3bd95bd0d56f35241523fbab1".toLowerCase()) &&
        configure_1.NetworkConfigs.getNetwork() == constants_1.Network.ARBITRUM_ONE) {
        token.name = "WETH";
        token.symbol = "WETH";
        token.decimals = constants_1.DEFAULT_DECIMALS;
    }
    if (token.id ==
        graph_ts_1.Address.fromHexString("0xff970a61a04b1ca14834a43f5de4533ebddb5cc8".toLowerCase()) &&
        configure_1.NetworkConfigs.getNetwork() == constants_1.Network.ARBITRUM_ONE) {
        token.name = "USDC";
        token.symbol = "USDC";
    }
    if (token.id ==
        graph_ts_1.Address.fromHexString("0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9".toLowerCase()) &&
        configure_1.NetworkConfigs.getNetwork() == constants_1.Network.ARBITRUM_ONE) {
        token.name = "USDT";
        token.symbol = "USDT";
    }
    return token;
}
