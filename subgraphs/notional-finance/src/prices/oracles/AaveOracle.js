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
exports.getTokenPriceUSDC = exports.getAaveOracleContract = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const AaveOracleContract_1 = require("../../../generated/Notional/AaveOracleContract");
function getAaveOracleContract(contract, block = null) {
    if ((block && contract.startBlock.gt(block.number)) ||
        utils.isNullAddress(contract.address))
        return null;
    return AaveOracleContract_1.AaveOracleContract.bind(contract.address);
}
exports.getAaveOracleContract = getAaveOracleContract;
function getTokenPriceUSDC(tokenAddr, block = null) {
    const config = utils.getConfig();
    if (!config || config.aaveOracleBlacklist().includes(tokenAddr))
        return new types_1.CustomPriceType();
    const aaveOracleContract = getAaveOracleContract(config.aaveOracle(), block);
    if (!aaveOracleContract)
        return new types_1.CustomPriceType();
    const tokenPrice = utils
        .readValue(aaveOracleContract.try_getAssetPrice(tokenAddr), constants.BIGINT_ZERO)
        .toBigDecimal();
    return types_1.CustomPriceType.initialize(tokenPrice, constants.AAVE_ORACLE_DECIMALS, constants.OracleType.AAVE_ORACLE);
}
exports.getTokenPriceUSDC = getTokenPriceUSDC;
