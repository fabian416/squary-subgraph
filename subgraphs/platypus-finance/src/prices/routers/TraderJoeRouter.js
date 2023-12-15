"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPriceFromRouter = exports.getPriceUsdc = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const TraderJoeRouter_1 = require("../../../generated/Pool/TraderJoeRouter");
function getPriceUsdc(tokenAddress, network) {
    const usdc_address = constants.WHITELIST_TOKENS_MAP.get(network).get("USDC");
    return getPriceFromRouter(tokenAddress, usdc_address, network);
}
exports.getPriceUsdc = getPriceUsdc;
function getPriceFromRouter(token0Address, token1Address, network) {
    const wethAddress = constants.SUSHISWAP_WETH_ADDRESS.get(network);
    const ethAddress = constants.WHITELIST_TOKENS_MAP.get(network).get(constants.NETWORK_BASE_TOKEN_MAP.get(network)[0]);
    // Convert ETH address to WETH
    if (token0Address == ethAddress) {
        token0Address = wethAddress;
    }
    if (token1Address == ethAddress) {
        token1Address = wethAddress;
    }
    const path = [];
    let numberOfJumps;
    const inputTokenIsWeth = token0Address == wethAddress || token1Address == wethAddress;
    if (inputTokenIsWeth) {
        // Path = [token0, weth] or [weth, token1]
        numberOfJumps = graph_ts_1.BigInt.fromI32(1);
        path.push(token0Address);
        path.push(token1Address);
    }
    else {
        // Path = [token0, weth, token1]
        numberOfJumps = graph_ts_1.BigInt.fromI32(2);
        path.push(token0Address);
        path.push(wethAddress);
        path.push(token1Address);
    }
    const token0Decimals = utils.getTokenDecimals(token0Address);
    const amountIn = constants.BIGINT_TEN.pow(token0Decimals.toI32());
    const routerAddresses = constants.TRADERJOE_ROUTER_ADDRESS_MAP.get(network);
    const routerAddressV1 = routerAddresses.get("routerV1");
    const routerAddressV2 = routerAddresses.get("routerV2");
    let amountOutArray;
    graph_ts_1.log.info("[TraderJoe Router]Calling: AmountIn: {} using path: {}!", [
        amountIn.toString(),
        path.map(item => item.toHexString()).toString(),
    ]);
    if (routerAddressV1) {
        const TraderJoeRouterV1 = TraderJoeRouter_1.TraderJoeRouter.bind(routerAddressV1);
        amountOutArray = TraderJoeRouterV1.try_getAmountsOut(amountIn, path);
        if (amountOutArray.reverted && routerAddressV2) {
            const TraderJoeRouterV2 = TraderJoeRouter_1.TraderJoeRouter.bind(routerAddressV2);
            amountOutArray = TraderJoeRouterV2.try_getAmountsOut(amountIn, path);
            if (amountOutArray.reverted) {
                return new types_1.CustomPriceType();
            }
        }
        const amountOut = amountOutArray.value[amountOutArray.value.length - 1];
        const feeBips = graph_ts_1.BigInt.fromI32(30); // .3% per swap fees
        const amountOutBigDecimal = amountOut
            .times(constants.BIGINT_TEN_THOUSAND)
            .div(constants.BIGINT_TEN_THOUSAND.minus(feeBips.times(numberOfJumps)))
            .toBigDecimal();
        return types_1.CustomPriceType.initialize(amountOutBigDecimal, constants.DEFAULT_USDC_DECIMALS);
    }
    return new types_1.CustomPriceType();
}
exports.getPriceFromRouter = getPriceFromRouter;
