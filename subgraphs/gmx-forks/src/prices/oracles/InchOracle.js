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
exports.getTokenPriceUSDC = void 0;
const utils = __importStar(require("../common/utils"));
const __1 = require("..");
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const InchOracleContract_1 = require("../../../generated/templates/MlpManagerTemplate/InchOracleContract");
function getTokenPriceUSDC(tokenAddr, block = null) {
    const config = utils.getConfig();
    const contractAddress = utils.getContract(config.inchOracle(), block);
    if (!contractAddress || config.inchOracleBlacklist().includes(tokenAddr))
        return new types_1.CustomPriceType();
    const srcTokenDecimals = utils.getTokenDecimals(tokenAddr);
    const inchOracleContract = InchOracleContract_1.InchOracleContract.bind(contractAddress);
    for (let i = 0; i < constants.STABLE_TOKENS.length; i++) {
        const dstToken = config
            .whitelistedTokens()
            .mustGet(constants.STABLE_TOKENS[i]);
        let tokenPrice = utils
            .readValue(inchOracleContract.try_getRate(tokenAddr, dstToken.address, true), constants.BIGINT_ZERO)
            .toBigDecimal();
        if (tokenPrice.equals(constants.BIGDECIMAL_ZERO))
            continue;
        if (constants.STABLE_TOKENS[i] == "WETH") {
            tokenPrice = (0, __1.getUsdPricePerToken)(dstToken.address).usdPrice;
        }
        return types_1.CustomPriceType.initialize(tokenPrice.times(constants.BIGINT_TEN.pow(srcTokenDecimals.toI32()).toBigDecimal()), (dstToken.decimals + constants.DEFAULT_DECIMALS.toI32()), constants.OracleType.INCH_ORACLE);
    }
    return new types_1.CustomPriceType();
}
exports.getTokenPriceUSDC = getTokenPriceUSDC;
