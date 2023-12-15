"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateLPToken = exports.getOrCreateToken = exports.getLiquidityPool = exports.getOrCreateProtocol = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../configurations/configure");
const versions_1 = require("../versions");
const constants_1 = require("./constants");
const schema_1 = require("../../generated/schema");
const TokenABI_1 = require("../../generated/Factory/TokenABI");
function getOrCreateProtocol() {
    let protocol = schema_1.DexAmmProtocol.load(configure_1.NetworkConfigs.getFactoryAddress());
    if (!protocol) {
        protocol = new schema_1.DexAmmProtocol(configure_1.NetworkConfigs.getFactoryAddress());
        protocol.name = configure_1.NetworkConfigs.getProtocolName();
        protocol.slug = configure_1.NetworkConfigs.getProtocolSlug();
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
        protocol.network = configure_1.NetworkConfigs.getNetwork();
        protocol.type = constants_1.ProtocolType.EXCHANGE;
        protocol.totalPoolCount = constants_1.INT_ZERO;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateProtocol = getOrCreateProtocol;
function getLiquidityPool(poolAddress) {
    const pool = schema_1.LiquidityPool.load(poolAddress);
    return pool;
}
exports.getLiquidityPool = getLiquidityPool;
function getOrCreateToken(address) {
    let token = schema_1.Token.load(address);
    if (!token) {
        token = new schema_1.Token(address);
        let name = "";
        let symbol = "";
        let decimals = constants_1.DEFAULT_DECIMALS;
        if (!configure_1.NetworkConfigs.getBrokenERC20Tokens().includes(address.toLowerCase())) {
            const erc20Contract = TokenABI_1.TokenABI.bind(graph_ts_1.Address.fromString(address));
            // TODO: add overrides for name and symbol
            const nameCall = erc20Contract.try_name();
            if (!nameCall.reverted)
                name = nameCall.value;
            const symbolCall = erc20Contract.try_symbol();
            if (!symbolCall.reverted)
                symbol = symbolCall.value;
            const decimalsCall = erc20Contract.try_decimals();
            if (!decimalsCall.reverted)
                decimals = graph_ts_1.BigInt.fromString(decimalsCall.value.toString()).isI32()
                    ? decimalsCall.value
                    : constants_1.MAX_INT32.toI32();
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
        token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
        token.lastPriceBlockNumber = constants_1.BIGINT_ZERO;
        token._totalSupply = constants_1.BIGINT_ZERO;
        token._totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        token._largeTVLImpactBuffer = 0;
        token._largePriceChangeBuffer = 0;
        token.save();
    }
    return token;
}
exports.getOrCreateLPToken = getOrCreateLPToken;
