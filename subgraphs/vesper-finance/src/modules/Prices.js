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
exports.getPriceOfOutputTokens = exports.getPricePerShare = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const CurveRouter_1 = require("../prices/routers/CurveRouter");
const Pool_1 = require("../../generated/templates/PoolRewards/Pool");
function getPricePerShare(vaultAddress) {
    const vaultContract = Pool_1.Pool.bind(vaultAddress);
    let pricePerShare = utils.readValue(vaultContract.try_pricePerShare(), constants.BIGINT_ZERO);
    if (pricePerShare.equals(constants.BIGINT_ZERO)) {
        pricePerShare = utils.readValue(vaultContract.try_getPricePerShare(), constants.BIGINT_ZERO);
    }
    return pricePerShare;
}
exports.getPricePerShare = getPricePerShare;
function getPriceOfOutputTokens(vaultAddress) {
    const network = graph_ts_1.dataSource.network();
    const vaultContract = Pool_1.Pool.bind(vaultAddress);
    const pricePerShare = getPricePerShare(vaultAddress);
    const tokenAddress = utils.readValue(vaultContract.try_token(), constants.NULL.TYPE_ADDRESS);
    let virtualPrice = (0, CurveRouter_1.getPriceUsdcRecommended)(tokenAddress, network);
    let inputTokenDecimals = utils.getTokenDecimals(tokenAddress);
    let price = pricePerShare
        .toBigDecimal()
        .div(inputTokenDecimals)
        .times(virtualPrice.usdPrice)
        .div(virtualPrice.decimalsBaseTen);
    return price;
}
exports.getPriceOfOutputTokens = getPriceOfOutputTokens;
