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
exports.getPriceOfOutputTokens = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const Vault_1 = require("../../generated/templates/Vault/Vault");
const CurveRouter_1 = require("../Prices/routers/CurveRouter");
function getPriceOfOutputTokens(vaultAddress, tokenAddress, _decimals) {
    const network = graph_ts_1.dataSource.network();
    const vaultContract = Vault_1.Vault.bind(vaultAddress);
    const pricePerShare = utils.readValue(vaultContract.try_pricePerShare(), constants.BIGINT_ZERO);
    const virtualPrice = (0, CurveRouter_1.getPriceUsdcRecommended)(tokenAddress, network);
    return pricePerShare
        .toBigDecimal()
        .div(_decimals)
        .times(virtualPrice.usdPrice)
        .div(constants.USDC_DENOMINATOR);
}
exports.getPriceOfOutputTokens = getPriceOfOutputTokens;
