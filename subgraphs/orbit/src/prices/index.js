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
exports.getUsdPrice = exports.getLiquidityBoundPrice = exports.getUsdPricePerToken = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const types_1 = require("./common/types");
const utils = __importStar(require("./common/utils"));
const constants = __importStar(require("./common/constants"));
const AaveOracle = __importStar(require("./oracles/AaveOracle"));
const CurveRouter = __importStar(require("./routers/CurveRouter"));
const ChainLinkFeed = __importStar(require("./oracles/ChainLinkFeed"));
const YearnLensOracle = __importStar(require("./oracles/YearnLensOracle"));
const UniswapForksRouter = __importStar(require("./routers/UniswapForksRouter"));
const CurveCalculations = __importStar(require("./calculations/CalculationsCurve"));
const SushiCalculations = __importStar(require("./calculations/CalculationsSushiswap"));
function getUsdPricePerToken(tokenAddr, block = null) {
    if (tokenAddr.equals(constants.NULL.TYPE_ADDRESS)) {
        return new types_1.CustomPriceType();
    }
    const config = utils.getConfig();
    if (config.network() == "default") {
        graph_ts_1.log.warning("Failed to fetch price: network {} not implemented", [
            graph_ts_1.dataSource.network(),
        ]);
        return new types_1.CustomPriceType();
    }
    if (config.hardcodedStables().includes(tokenAddr)) {
        return types_1.CustomPriceType.initialize(constants.BIGDECIMAL_USD_PRICE, constants.DEFAULT_USDC_DECIMALS);
    }
    const oracle = new types_1.OracleType();
    const override = config.getOracleOverride(tokenAddr, block);
    if (override) {
        oracle.setOracleConfig(override);
    }
    const oracleCount = oracle.oracleCount;
    const oracleOrder = oracle.oracleOrder;
    const prices = [];
    for (let i = 0; i < oracleOrder.length; i++) {
        if (prices.length >= oracleCount) {
            break;
        }
        let oraclePrice = new types_1.CustomPriceType();
        if (oracleOrder[i] == constants.OracleType.YEARN_LENS_ORACLE) {
            oraclePrice = YearnLensOracle.getTokenPriceUSDC(tokenAddr, block);
        }
        else if (oracleOrder[i] == constants.OracleType.CHAINLINK_FEED) {
            oraclePrice = ChainLinkFeed.getTokenPriceUSDC(tokenAddr, block);
        }
        else if (oracleOrder[i] == constants.OracleType.CURVE_CALCULATIONS) {
            oraclePrice = CurveCalculations.getTokenPriceUSDC(tokenAddr, block);
        }
        else if (oracleOrder[i] == constants.OracleType.SUSHI_CALCULATIONS) {
            oraclePrice = SushiCalculations.getTokenPriceUSDC(tokenAddr, block);
        }
        else if (oracleOrder[i] == constants.OracleType.AAVE_ORACLE) {
            oraclePrice = AaveOracle.getTokenPriceUSDC(tokenAddr, block);
        }
        else if (oracleOrder[i] == constants.OracleType.CURVE_ROUTER) {
            oraclePrice = CurveRouter.getCurvePriceUsdc(tokenAddr, block);
        }
        else if (oracleOrder[i] == constants.OracleType.UNISWAP_FORKS_ROUTER) {
            oraclePrice = UniswapForksRouter.getTokenPriceUSDC(tokenAddr, block);
        }
        if (!oraclePrice.reverted) {
            prices.push(oraclePrice);
        }
    }
    if (prices.length == constants.INT_ZERO) {
        graph_ts_1.log.warning("[Oracle] Failed to Fetch Price, tokenAddr: {}", [
            tokenAddr.toHexString(),
        ]);
        return new types_1.CustomPriceType();
    }
    else if (prices.length == constants.INT_ONE) {
        return prices[constants.INT_ZERO];
    }
    else if (prices.length == constants.INT_TWO) {
        return utils.averagePrice(prices);
    }
    const k = Math.ceil(prices.length / constants.INT_TWO);
    const closestPrices = utils.kClosestPrices(k, prices);
    return utils.averagePrice(closestPrices);
}
exports.getUsdPricePerToken = getUsdPricePerToken;
function getLiquidityBoundPrice(tokenAddress, tokenPrice, amount) {
    const reportedPriceUSD = tokenPrice.usdPrice.times(amount);
    const liquidity = tokenPrice.liquidity;
    let liquidityBoundPriceUSD = reportedPriceUSD;
    if (liquidity > constants.BIGDECIMAL_ZERO && reportedPriceUSD > liquidity) {
        liquidityBoundPriceUSD = liquidity.div(amount);
        graph_ts_1.log.warning("[getLiquidityBoundPrice] token: {} (reported price * amount): ({} * {}) bound to available liquidity: {}; new price: {}", [
            tokenAddress.toHexString(),
            tokenPrice.usdPrice.toString(),
            amount.toString(),
            liquidity.toString(),
            liquidityBoundPriceUSD.toString(),
        ]);
    }
    return liquidityBoundPriceUSD;
}
exports.getLiquidityBoundPrice = getLiquidityBoundPrice;
function getUsdPrice(tokenAddr, amount, block = null) {
    const tokenPrice = getUsdPricePerToken(tokenAddr, block);
    if (!tokenPrice.reverted) {
        return tokenPrice.usdPrice.times(amount);
    }
    return constants.BIGDECIMAL_ZERO;
}
exports.getUsdPrice = getUsdPrice;
