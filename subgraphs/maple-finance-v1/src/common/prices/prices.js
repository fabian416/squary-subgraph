"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBptTokenAmountInUSD = exports.getBptTokenPriceUSD = exports.getTokenAmountInUSD = exports.getTokenPriceInUSD = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const chainlink_1 = require("./oracles/chainlink");
const maple_1 = require("./oracles/maple");
const yearn_1 = require("./oracles/yearn");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const CurveRouter_1 = require("./routers/CurveRouter");
const UniswapRouter_1 = require("./routers/UniswapRouter");
const SushiSwapRouter_1 = require("./routers/SushiSwapRouter");
const CalculationsSushiswap_1 = require("./calculations/CalculationsSushiswap");
const CalculationsCurve_1 = require("./calculations/CalculationsCurve");
const BalancerPool_1 = require("../../../generated/templates/Pool/BalancerPool");
const supporting_1 = require("../mappingHelpers/getOrCreate/supporting");
function getTokenPriceInUSD(event, token) {
    const network = graph_ts_1.dataSource.network();
    const tokenAddress = graph_ts_1.Address.fromString(token.id);
    // 1. Maple Oracle
    const mapleLensPrice = (0, maple_1.mapleOracleGetTokenPriceInUSD)(token);
    if (mapleLensPrice) {
        token._lastPriceOracle = constants_1.OracleType.MAPLE;
        token.lastPriceUSD = mapleLensPrice;
        token.lastPriceBlockNumber = event.block.number;
        token.save();
        return mapleLensPrice;
    }
    // 2. ChainLink Feed Registry
    const chainLinkPrice = (0, chainlink_1.chainlinkOracleGetTokenPriceInUSD)(token);
    if (chainLinkPrice) {
        token._lastPriceOracle = constants_1.OracleType.CHAIN_LINK;
        token.lastPriceUSD = chainLinkPrice;
        token.lastPriceBlockNumber = event.block.number;
        token.save();
        return chainLinkPrice;
    }
    // 3. Yearn Lens Oracle
    const yearnLensPrice = (0, yearn_1.yearnOracleGetTokenPriceInUSD)(token);
    if (yearnLensPrice) {
        token._lastPriceOracle = constants_1.OracleType.YEARN_LENS;
        token.lastPriceUSD = yearnLensPrice;
        token.lastPriceBlockNumber = event.block.number;
        token.save();
        return yearnLensPrice;
    }
    // 4. CalculationsCurve
    const calculationsCurvePrice = (0, CalculationsCurve_1.getTokenPriceFromCalculationCurve)(tokenAddress, network);
    if (!calculationsCurvePrice.reverted) {
        token._lastPriceOracle = constants_1.OracleType.CURVE_CALC;
        token.lastPriceUSD = calculationsCurvePrice.usdPrice;
        token.lastPriceBlockNumber = event.block.number;
        token.save();
        return calculationsCurvePrice.usdPrice;
    }
    // 5. CalculationsSushiSwap
    const calculationsSushiSwapPrice = (0, CalculationsSushiswap_1.getTokenPriceFromSushiSwap)(tokenAddress, network);
    if (!calculationsSushiSwapPrice.reverted) {
        token._lastPriceOracle = constants_1.OracleType.SUSHISWAP_CALC;
        token.lastPriceUSD = calculationsSushiSwapPrice.usdPrice;
        token.lastPriceBlockNumber = event.block.number;
        token.save();
        return calculationsSushiSwapPrice.usdPrice;
    }
    // 6. Curve Router
    const curvePrice = (0, CurveRouter_1.getCurvePriceUsdc)(tokenAddress, network);
    if (!curvePrice.reverted) {
        token._lastPriceOracle = constants_1.OracleType.CURVE_ROUTE;
        token.lastPriceUSD = curvePrice.usdPrice;
        token.lastPriceBlockNumber = event.block.number;
        token.save();
        return curvePrice.usdPrice;
    }
    // 7. Uniswap Router
    const uniswapPrice = (0, UniswapRouter_1.getPriceUsdc)(tokenAddress, network);
    if (!uniswapPrice.reverted) {
        token._lastPriceOracle = constants_1.OracleType.UNISWAP_ROUTE;
        token.lastPriceUSD = uniswapPrice.usdPrice;
        token.lastPriceBlockNumber = event.block.number;
        token.save();
        return uniswapPrice.usdPrice;
    }
    // 8. SushiSwap Router
    const sushiswapPrice = (0, SushiSwapRouter_1.getPriceUsdc)(tokenAddress, network);
    if (!sushiswapPrice.reverted) {
        token._lastPriceOracle = constants_1.OracleType.SUSHISWAP_ROUTE;
        token.lastPriceUSD = sushiswapPrice.usdPrice;
        token.lastPriceBlockNumber = event.block.number;
        token.save();
        return sushiswapPrice.usdPrice;
    }
    token._lastPriceOracle = constants_1.OracleType.ERROR_NOT_FOUND;
    graph_ts_1.log.warning("[Oracle] Failed to Fetch Price, tokenAddr: {}", [token.id]);
    return constants_1.ZERO_BD;
}
exports.getTokenPriceInUSD = getTokenPriceInUSD;
function getTokenAmountInUSD(event, token, amount) {
    const tokenPriceUSD = getTokenPriceInUSD(event, token);
    return (0, utils_1.parseUnits)(amount, token.decimals).times(tokenPriceUSD);
}
exports.getTokenAmountInUSD = getTokenAmountInUSD;
function getBptTokenPriceUSD(event, bptToken) {
    const balancerContract = BalancerPool_1.BalancerPool.bind(graph_ts_1.Address.fromString(bptToken.id));
    const inputTokenAddresses = (0, utils_1.readCallResult)(balancerContract.try_getCurrentTokens(), new Array(), balancerContract.try_getCurrentTokens.name);
    const totalBptSupply = (0, utils_1.readCallResult)(balancerContract.try_totalSupply(), constants_1.ZERO_BI, balancerContract.try_totalSupply.name);
    let balanceUSD = constants_1.ZERO_BD;
    for (let i = 0; i < inputTokenAddresses.length; i++) {
        const address = inputTokenAddresses[i];
        const token = (0, supporting_1.getOrCreateToken)(address);
        const tokenBalance = (0, utils_1.readCallResult)(balancerContract.try_getBalance(address), constants_1.ZERO_BI, balancerContract.try_getBalance.name);
        const tokenAmountUSD = getTokenAmountInUSD(event, token, tokenBalance);
        balanceUSD = balanceUSD.plus(tokenAmountUSD);
    }
    const pricePerBptUSD = totalBptSupply.notEqual(constants_1.ZERO_BI)
        ? balanceUSD.div((0, utils_1.parseUnits)(totalBptSupply, bptToken.decimals))
        : constants_1.ZERO_BD;
    return pricePerBptUSD;
}
exports.getBptTokenPriceUSD = getBptTokenPriceUSD;
function getBptTokenAmountInUSD(event, bptToken, amount) {
    const tokenPriceUSD = getBptTokenPriceUSD(event, bptToken);
    return (0, utils_1.parseUnits)(amount, bptToken.decimals).times(tokenPriceUSD);
}
exports.getBptTokenAmountInUSD = getBptTokenAmountInUSD;
