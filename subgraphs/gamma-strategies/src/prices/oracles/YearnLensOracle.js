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
exports.getTokenPriceFromYearnLens = exports.getYearnLensContract = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const YearnLensContract_1 = require("../../../generated/templates/Hypervisor/YearnLensContract");
function getYearnLensContract(network) {
    return YearnLensContract_1.YearnLensContract.bind(graph_ts_1.Address.fromString(constants.YEARN_LENS_CONTRACT_ADDRESS.get(network)));
}
exports.getYearnLensContract = getYearnLensContract;
function getTokenPriceFromYearnLens(tokenAddr, network) {
    const yearnLensContract = getYearnLensContract(network);
    if (!yearnLensContract) {
        return new types_1.CustomPriceType();
    }
    let tokenPrice = utils
        .readValue(yearnLensContract.try_getPriceUsdcRecommended(tokenAddr), constants.BIGINT_ZERO)
        .toBigDecimal();
    return types_1.CustomPriceType.initialize(tokenPrice, constants.DEFAULT_USDC_DECIMALS);
}
exports.getTokenPriceFromYearnLens = getTokenPriceFromYearnLens;
