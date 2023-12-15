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
exports.exponentToBigDecimal = exports.convertTokenToDecimal = exports.roundToWholeNumber = exports.updateProtocolAfterNewLiquidityPool = exports.updateProtocolTotalValueLockedUSD = exports.getPoolFees = exports.updatePoolTVL = exports.calculateAverage = exports.readValue = exports.prefixID = exports.enumToPrefix = exports.bigDecimalToBigInt = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const types_1 = require("./types");
const initializer_1 = require("./initializer");
const constants = __importStar(require("../common/constants"));
const utils = __importStar(require("../common/utils"));
function bigDecimalToBigInt(n) {
    return graph_ts_1.BigInt.fromString(n.toString().split(".")[0]);
}
exports.bigDecimalToBigInt = bigDecimalToBigInt;
function enumToPrefix(snake) {
    return snake.toLowerCase().replace("_", "-") + "-";
}
exports.enumToPrefix = enumToPrefix;
function prefixID(enumString, ID) {
    return enumToPrefix(enumString) + ID;
}
exports.prefixID = prefixID;
function readValue(callResult, defaultValue) {
    return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
function calculateAverage(items) {
    let sum = graph_ts_1.BigDecimal.fromString("0");
    for (let i = 0; i < items.length; i++) {
        sum = sum.plus(items[i]);
    }
    return sum.div(graph_ts_1.BigDecimal.fromString(graph_ts_1.BigInt.fromI32(items.length).toString()));
}
exports.calculateAverage = calculateAverage;
function updatePoolTVL(liquidityPool, block) {
    const index = updateBaseTokenPrice(liquidityPool, block);
    if (index < 0) {
        return false;
    }
    const inputTokens = liquidityPool.inputTokens;
    const token = (0, initializer_1.getOrCreateToken)(inputTokens[index]);
    let lastPrice = constants.BIGDECIMAL_ZERO;
    if (token.lastPriceUSD !== null) {
        lastPrice = token.lastPriceUSD;
    }
    const inputTokenBalances = liquidityPool.inputTokenBalances;
    const inputTokenWeights = liquidityPool.inputTokenWeights;
    const amountUSD = utils
        .convertTokenToDecimal(inputTokenBalances[index], token.decimals)
        .times(lastPrice);
    liquidityPool.totalValueLockedUSD = amountUSD
        .times(constants.BIGDECIMAL_HUNDRED)
        .div(inputTokenWeights[index]);
    liquidityPool.save();
    return true;
}
exports.updatePoolTVL = updatePoolTVL;
function updateBaseTokenPrice(liquidityPool, block) {
    const inputTokens = liquidityPool.inputTokens;
    let stableCoinIndex = -1;
    let osmoIndex = -1;
    let atomIndex = -1;
    for (let i = 0; i < inputTokens.length; i++) {
        const tmpToken = (0, initializer_1.getOrCreateToken)(inputTokens[i]);
        if (tmpToken._isStableCoin) {
            stableCoinIndex = i;
            break;
        }
        else if (tmpToken.id == constants.ATOM_DENOM) {
            atomIndex = i;
        }
        else if (tmpToken.id == constants.OSMO_DENOM) {
            osmoIndex = i;
        }
    }
    if (stableCoinIndex < 0 && osmoIndex < 0 && atomIndex < 0) {
        return -1;
    }
    const id = (block.header.time.seconds / constants.SECONDS_PER_DAY).toString();
    let index = -1;
    if (stableCoinIndex >= 0) {
        index = stableCoinIndex;
    }
    else if (atomIndex >= 0) {
        index = atomIndex;
    }
    else if (osmoIndex >= 0) {
        index = osmoIndex;
    }
    const token = (0, initializer_1.getOrCreateToken)(inputTokens[index]);
    if (stableCoinIndex < 0 &&
        block.header.height < constants.STABLE_COIN_START_BLOCK &&
        (!token._lastPriceDate || token._lastPriceDate != id)) {
        // Load price retrieved from offchain data source
        const tokenPrice = schema_1._TokenPrice.load(id);
        if (tokenPrice != null) {
            if (token.id == constants.ATOM_DENOM) {
                token.lastPriceUSD = tokenPrice.cosmos;
            }
            else if (token.id == constants.OSMO_DENOM) {
                token.lastPriceUSD = tokenPrice.osmosis;
            }
        }
        token.lastPriceBlockNumber = graph_ts_1.BigInt.fromI32(block.header.height);
        token._lastPriceDate = id;
        token.save();
    }
    return index;
}
function getPoolFees(liquidityPoolId, poolParams) {
    let swapFee = constants.BIGDECIMAL_ZERO;
    if (poolParams != null && poolParams.swapFee !== null) {
        swapFee = poolParams.swapFee
            .div(constants.BIGINT_TEN.pow(18).toBigDecimal())
            .times(constants.BIGDECIMAL_HUNDRED);
    }
    const tradingFeeId = utils.enumToPrefix(constants.LiquidityPoolFeeType.FIXED_TRADING_FEE) +
        liquidityPoolId;
    const tradingFee = (0, initializer_1.getOrCreateLiquidityPoolFee)(tradingFeeId, constants.LiquidityPoolFeeType.FIXED_TRADING_FEE, swapFee);
    let protocolFees = constants.BIGDECIMAL_ZERO;
    if (poolParams != null && poolParams.exitFee !== null) {
        protocolFees = poolParams.exitFee
            .div(constants.BIGINT_TEN.pow(18).toBigDecimal())
            .times(constants.BIGDECIMAL_HUNDRED);
    }
    const protocolFeeId = enumToPrefix(constants.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE) +
        liquidityPoolId;
    const protocolFee = (0, initializer_1.getOrCreateLiquidityPoolFee)(protocolFeeId, constants.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE, protocolFees);
    const lpFeeId = enumToPrefix(constants.LiquidityPoolFeeType.FIXED_LP_FEE) + liquidityPoolId;
    const lpFee = (0, initializer_1.getOrCreateLiquidityPoolFee)(lpFeeId, constants.LiquidityPoolFeeType.FIXED_LP_FEE, swapFee);
    return new types_1.PoolFeesType(tradingFee, protocolFee, lpFee);
}
exports.getPoolFees = getPoolFees;
function updateProtocolTotalValueLockedUSD(tvlChange) {
    const protocol = (0, initializer_1.getOrCreateDexAmmProtocol)();
    protocol.totalValueLockedUSD = protocol.totalValueLockedUSD.plus(tvlChange);
    protocol.save();
}
exports.updateProtocolTotalValueLockedUSD = updateProtocolTotalValueLockedUSD;
function updateProtocolAfterNewLiquidityPool(tvlChange) {
    const protocol = (0, initializer_1.getOrCreateDexAmmProtocol)();
    protocol.totalValueLockedUSD = protocol.totalValueLockedUSD.plus(tvlChange);
    protocol.totalPoolCount += 1;
    protocol.save();
}
exports.updateProtocolAfterNewLiquidityPool = updateProtocolAfterNewLiquidityPool;
// Round BigDecimal to whole number
function roundToWholeNumber(n) {
    return n.truncate(0);
}
exports.roundToWholeNumber = roundToWholeNumber;
// convert emitted values to tokens count
function convertTokenToDecimal(tokenAmount, exchangeDecimals) {
    if (exchangeDecimals == 0) {
        return tokenAmount.toBigDecimal();
    }
    return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}
exports.convertTokenToDecimal = convertTokenToDecimal;
// convert decimals
function exponentToBigDecimal(decimals) {
    let bd = constants.BIGDECIMAL_ONE;
    for (let i = constants.INT_ZERO; i < decimals; i = i + constants.INT_ONE) {
        bd = bd.times(constants.BIGDECIMAL_TEN);
    }
    return bd;
}
exports.exponentToBigDecimal = exponentToBigDecimal;
