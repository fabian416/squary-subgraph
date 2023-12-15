"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateLPToken = exports.getOrCreateToken = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../../configurations/configure");
const constants_1 = require("../constants");
const ERC20_1 = require("../../../generated/Factory/ERC20");
const schema_1 = require("../../../generated/schema");
function getOrCreateToken(address) {
    let token = schema_1.Token.load(address);
    if (!token) {
        token = new schema_1.Token(address);
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
