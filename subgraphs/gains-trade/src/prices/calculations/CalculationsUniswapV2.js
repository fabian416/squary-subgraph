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
exports.getTokenPriceEth = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const __1 = require("..");
const numbers_1 = require("../../sdk/util/numbers");
const constants_1 = require("../../sdk/util/constants");
const UniswapFactory_1 = require("../../../generated/Vault/UniswapFactory");
const UniswapPair_1 = require("../../../generated/Vault/UniswapPair");
function getTokenPriceEth(tokenAddress, tokenDecimals) {
    const config = utils.getConfig();
    if (!config)
        return new types_1.CustomPriceType();
    const uniswapFactoryAddress = config.uniswapFactory();
    const uniswapFactoryContract = UniswapFactory_1.UniswapFactory.bind(uniswapFactoryAddress);
    const ethAddress = config.wethAddress();
    const uniswapPairCall = uniswapFactoryContract.try_getPair(tokenAddress, ethAddress);
    if (uniswapPairCall.reverted ||
        uniswapPairCall.value == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)) {
        graph_ts_1.log.warning("[CalculationsUniswapV2] pair not found on UniswapV2: {} vs {}", [tokenAddress.toHexString(), ethAddress.toHexString()]);
        return new types_1.CustomPriceType();
    }
    const uniswapPairAddress = uniswapPairCall.value;
    const uniswapPairContract = UniswapPair_1.UniswapPair.bind(uniswapPairAddress);
    const pairReservesCall = uniswapPairContract.try_getReserves();
    if (pairReservesCall.reverted) {
        return new types_1.CustomPriceType();
    }
    const ethReserves = pairReservesCall.value.value1;
    const ethPriceUSD = (0, __1.getUsdPricePerToken)(ethAddress).usdPrice;
    const tokenReserves = pairReservesCall.value.value0;
    const tokenPriceEth = ethReserves
        .toBigDecimal()
        .times(ethPriceUSD)
        .div((0, numbers_1.bigIntToBigDecimal)(tokenReserves, tokenDecimals.toI32()));
    return types_1.CustomPriceType.initialize(tokenPriceEth, constants.DEFAULT_DECIMALS.toI32());
}
exports.getTokenPriceEth = getTokenPriceEth;
