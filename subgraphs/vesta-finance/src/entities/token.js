"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getgOHMPrice = exports.getVSTATokenPrice = exports.getVSTTokenPrice = exports.getOrCreateRewardToken = exports.getCurrentAssetPrice = exports.setCurrentAssetPrice = exports.getVSTToken = exports.getOrCreateAssetToken = exports.UNKNOWN_TOKEN_VALUE = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const IERC20Detailed_1 = require("../../generated/TroveManager/IERC20Detailed");
const IERC20DetailedBytes_1 = require("../../generated/TroveManager/IERC20DetailedBytes");
const UniswapV2Pair_1 = require("../../generated/TroveManager/UniswapV2Pair");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const PriceFeedV1_1 = require("../../generated/PriceFeedV1/PriceFeedV1");
const protocol_1 = require("./protocol");
const WeightedPool_1 = require("../../generated/CommunityIssuance/WeightedPool");
const Vault_1 = require("../../generated/CommunityIssuance/Vault");
exports.UNKNOWN_TOKEN_VALUE = "unknown";
function getOrCreateAssetToken(tokenAddress) {
    return getOrCreateToken(tokenAddress);
}
exports.getOrCreateAssetToken = getOrCreateAssetToken;
function getVSTToken() {
    const token = getOrCreateToken(graph_ts_1.Address.fromString(constants_1.VST_ADDRESS));
    if (!token.lastPriceUSD) {
        token.lastPriceUSD = constants_1.BIGDECIMAL_ONE;
    }
    token.save();
    return token;
}
exports.getVSTToken = getVSTToken;
function getOrCreateToken(tokenAddress) {
    let token = schema_1.Token.load(tokenAddress.toHexString());
    if (!token) {
        token = new schema_1.Token(tokenAddress.toHexString());
        if (tokenAddress.toHexString() == constants_1.ETH_ADDRESS) {
            // Vesta finance use zero address as ETH reference address
            token.name = constants_1.ETH_NAME;
            token.symbol = constants_1.ETH_SYMBOL;
            token.decimals = constants_1.DEFAULT_DECIMALS;
        }
        else {
            const contract = IERC20Detailed_1.IERC20Detailed.bind(tokenAddress);
            token.name = fetchTokenName(contract);
            token.symbol = fetchTokenSymbol(contract);
            token.decimals = fetchTokenDecimals(contract);
        }
        token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
        token.save();
    }
    return token;
}
function setCurrentAssetPrice(blockNumber, asset, price) {
    const token = getOrCreateAssetToken(asset);
    let priceUSD = (0, numbers_1.bigIntToBigDecimal)(price);
    // get gOHM price from SushiSwap arbitrum because
    // Vesta price feed number is off
    if (asset.toHexString() == constants_1.gOHM_ADDRESS) {
        const gOHMPrice = getgOHMPrice(blockNumber);
        priceUSD = gOHMPrice ? gOHMPrice : priceUSD;
    }
    token.lastPriceUSD = priceUSD;
    token.lastPriceBlockNumber = blockNumber;
    graph_ts_1.log.info("[setCurrentAssetPrice]asset {} price set to {} at block {}", [
        asset.toHexString(),
        priceUSD.toString(),
        blockNumber.toString(),
    ]);
    token.save();
}
exports.setCurrentAssetPrice = setCurrentAssetPrice;
function getCurrentAssetPrice(asset) {
    const assetToken = getOrCreateAssetToken(asset);
    return assetToken.lastPriceUSD;
}
exports.getCurrentAssetPrice = getCurrentAssetPrice;
function isNullEthValue(value) {
    return (value ==
        "0x0000000000000000000000000000000000000000000000000000000000000001");
}
function fetchTokenName(contract) {
    // try types string and bytes32 for name
    let nameValue = exports.UNKNOWN_TOKEN_VALUE;
    const tryNameResult = contract.try_name();
    if (!tryNameResult.reverted) {
        return tryNameResult.value;
    }
    // non-standard ERC20 implementation
    const contractNameBytes = IERC20DetailedBytes_1.IERC20DetailedBytes.bind(contract._address);
    const tryNameResultBytes = contractNameBytes.try_name();
    if (!tryNameResultBytes.reverted) {
        // for broken exchanges that have no name function exposed
        if (!isNullEthValue(tryNameResultBytes.value.toHexString())) {
            nameValue = tryNameResultBytes.value.toString();
        }
    }
    return nameValue;
}
function fetchTokenSymbol(contract) {
    const contractSymbolBytes = IERC20DetailedBytes_1.IERC20DetailedBytes.bind(contract._address);
    // try types string and bytes32 for symbol
    let symbolValue = exports.UNKNOWN_TOKEN_VALUE;
    const trySymbolResult = contract.try_symbol();
    if (!trySymbolResult.reverted) {
        return trySymbolResult.value;
    }
    // non-standard ERC20 implementation
    const symbolResultBytes = contractSymbolBytes.try_symbol();
    if (!symbolResultBytes.reverted) {
        // for broken pairs that have no symbol function exposed
        if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
            symbolValue = symbolResultBytes.value.toString();
        }
    }
    return symbolValue;
}
function fetchTokenDecimals(contract) {
    let decimalValue = constants_1.DEFAULT_DECIMALS;
    const tryDecimalsResult = contract.try_decimals();
    if (!tryDecimalsResult.reverted) {
        decimalValue = tryDecimalsResult.value;
    }
    return decimalValue;
}
function getOrCreateRewardToken() {
    const token = getOrCreateToken(graph_ts_1.Address.fromString(constants_1.VSTA_ADDRESS));
    const id = `${constants_1.RewardTokenType.DEPOSIT}-${token.id}`;
    let rToken = schema_1.RewardToken.load(id);
    if (!rToken) {
        rToken = new schema_1.RewardToken(id);
        rToken.type = constants_1.RewardTokenType.DEPOSIT;
        rToken.token = token.id;
        rToken.save();
    }
    return rToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
function getVSTTokenPrice(event) {
    const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
    const priceFeedAddress = protocol._priceOracle && protocol._priceOracle != constants_1.EMPTY_STRING
        ? protocol._priceOracle
        : constants_1.PRICE_ORACLE_V1_ADDRESS;
    // this should work for boh V1 and V2
    const priceFeedContract = PriceFeedV1_1.PriceFeedV1.bind(graph_ts_1.Address.fromString(priceFeedAddress));
    const lastGoodPriceResult = priceFeedContract.try_lastGoodPrice(graph_ts_1.Address.fromString(constants_1.VST_ADDRESS));
    let VSTPrice = constants_1.BIGDECIMAL_ONE;
    if (lastGoodPriceResult.reverted ||
        lastGoodPriceResult.value.equals(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.warning("[getVSTTokenPrice]Querying price for VST token with Price Feed {} failed at tx {}; Price set to 1.0", [priceFeedAddress, event.transaction.hash.toHexString()]);
    }
    else {
        //convert to decimals with 18 decimals
        VSTPrice = (0, numbers_1.bigIntToBigDecimal)(lastGoodPriceResult.value, 18);
    }
    graph_ts_1.log.info("[getVSTTokenPrice]Price Feed {} VST Price=${} at block {} tx {}", [
        priceFeedAddress,
        VSTPrice.toString(),
        event.block.number.toString(),
        event.transaction.hash.toHexString(),
    ]);
    return VSTPrice;
}
exports.getVSTTokenPrice = getVSTTokenPrice;
function getVSTATokenPrice(event) {
    if (event.block.number.lt(constants_1.VSTA_BALANCER_POOL_CREATED_BLOCK)) {
        return null;
    }
    const VSTAPriceInWETH = getToken0PriceInToken1(constants_1.BAL_VSTA_WETH_POOL_ADDRESS, constants_1.VSTA_ADDRESS, constants_1.WETH_ADDRESS);
    const WETHPriceInUSD = getToken0PriceInToken1(constants_1.BAL_WETH_WBTC_USDC_POOL_ADDRESS, constants_1.WETH_ADDRESS, constants_1.USDC_ADDRESS);
    if (!VSTAPriceInWETH || !WETHPriceInUSD) {
        return null;
    }
    const VSTAPriceInUSD = VSTAPriceInWETH.times(WETHPriceInUSD)
        .times((0, numbers_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS))
        .div((0, numbers_1.exponentToBigDecimal)(constants_1.USDC_DECIMALS));
    graph_ts_1.log.info("[getVSTATokenPrice]VSTA Price USD={} at timestamp {}", [
        VSTAPriceInUSD.toString(),
        event.block.timestamp.toString(),
    ]);
    return VSTAPriceInUSD;
}
exports.getVSTATokenPrice = getVSTATokenPrice;
function getToken0PriceInToken1(poolAddress, token0, token1) {
    const poolContract = WeightedPool_1.WeightedPool.bind(graph_ts_1.Address.fromString(poolAddress));
    const vaultAddressResult = poolContract.try_getVault();
    if (vaultAddressResult.reverted) {
        graph_ts_1.log.info("[getToken0PriceInToken1]WeightedPoolContract ({}) getVault() call reverted", [poolAddress]);
        return null;
    }
    const vaultContract = Vault_1.Vault.bind(vaultAddressResult.value);
    const weightsResult = poolContract.try_getNormalizedWeights();
    if (weightsResult.reverted) {
        graph_ts_1.log.info("[getToken0PriceInToken1]VaultContract ({}) getNormalizedWeights() call reverted", [vaultAddressResult.value.toHexString()]);
        return null;
    }
    const poolIDResult = poolContract.try_getPoolId();
    if (poolIDResult.reverted) {
        graph_ts_1.log.info("[getToken0PriceInToken1]WeightedPoolContract ({}) getPoolId() call reverted", [poolAddress]);
        return null;
    }
    const poolTokensResult = vaultContract.try_getPoolTokens(poolIDResult.value);
    if (poolTokensResult.reverted) {
        graph_ts_1.log.info("[getToken0PriceInToken1]VaultContract ({}) getPoolTokens() call reverted", [poolAddress]);
        return null;
    }
    const poolTokenAddrs = poolTokensResult.value.getTokens();
    const poolTokenBalances = poolTokensResult.value.getBalances();
    const token0Idx = poolTokenAddrs.indexOf(graph_ts_1.Address.fromString(token0));
    const token1Idx = poolTokenAddrs.indexOf(graph_ts_1.Address.fromString(token1));
    if (token0Idx < 0 || token1Idx < 0) {
        // token0 or token1 not found in poolTokenAddrs, should not happen
        graph_ts_1.log.error("[getToken0PriceInToken1]token {} or token {} not found in poolTokens [{}]", [token0, token1, poolTokenAddrs.toString()]);
        return null;
    }
    const token0PriceInToken1 = poolTokenBalances[token1Idx]
        .times(weightsResult.value[token0Idx])
        .divDecimal(poolTokenBalances[token0Idx]
        .times(weightsResult.value[token1Idx])
        .toBigDecimal());
    return token0PriceInToken1;
}
// get gOHM price (the price from vesta price feed is off)
function getgOHMPrice(blockNumber) {
    const gOHMPriceInWETH = getToken0PriceInToken1UniswapV2(constants_1.SUSHI_gOHM_WETH_PAIR_ADDRESS, constants_1.gOHM_ADDRESS, constants_1.WETH_ADDRESS);
    const WETHPriceInUSDC = getToken0PriceInToken1UniswapV2(constants_1.SUSHI_WETH_USDC_PAIR_ADDRESS, constants_1.WETH_ADDRESS, constants_1.USDC_ADDRESS);
    if (!gOHMPriceInWETH || !WETHPriceInUSDC) {
        graph_ts_1.log.warning("[getgOHMPrice]Failed to get OHM price at block {}", [
            blockNumber.toString(),
        ]);
        return null;
    }
    const gOHMPriceInUSD = gOHMPriceInWETH
        .times(WETHPriceInUSDC)
        .times((0, numbers_1.exponentToBigDecimal)(constants_1.gOHM_DECIMALS - constants_1.USDC_DECIMALS));
    return gOHMPriceInUSD;
}
exports.getgOHMPrice = getgOHMPrice;
// get token price from uniswap forks
function getToken0PriceInToken1UniswapV2(pairAddress, token0, token1) {
    const pairContract = UniswapV2Pair_1.UniswapV2Pair.bind(graph_ts_1.Address.fromString(pairAddress));
    const reserves = pairContract.try_getReserves();
    if (reserves.reverted) {
        graph_ts_1.log.error("[getToken0PriceInToken1UniswapV2]Unable to get reserves for pair {}", [pairAddress]);
        return null;
    }
    let token0Amount;
    let token1Amount;
    const pairToken0 = pairContract.token0().toHexString();
    const pairToken1 = pairContract.token1().toHexString();
    if (pairToken0 == token0) {
        if (pairToken1 != token1) {
            graph_ts_1.log.error("[getToken0PriceInToken1UniswapV2]tokens for pair {} = ({}, {}) do not match ({}, {})", [pairAddress, pairToken0, pairToken1, token0, token1]);
            return null;
        }
        token0Amount = reserves.value.value0;
        token1Amount = reserves.value.value1;
    }
    else {
        if (pairToken0 != token1 || pairToken1 != token0) {
            graph_ts_1.log.error("[getToken0PriceInToken1UniswapV2]tokens for pair {} = ({}, {}) do not match ({}, {})", [pairAddress, pairToken0, pairToken1, token1, token0]);
            return null;
        }
        token0Amount = reserves.value.value1;
        token1Amount = reserves.value.value0;
    }
    const token0PriceInToken1 = token1Amount.divDecimal(token0Amount.toBigDecimal());
    return token0PriceInToken1;
}
