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
exports.getOrCreateAccount = exports.getOrCreatePool = exports.initializeSDK = void 0;
const versions_1 = require("../versions");
const constants = __importStar(require("../common/constants"));
const perpfutures_1 = require("../sdk/protocols/perpfutures");
const config_1 = require("../sdk/protocols/config");
const constants_1 = require("../common/constants");
const token_1 = require("../modules/token");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function initializeSDK(event) {
    const protocolConfig = new config_1.ProtocolConfig(constants.PROTOCOL_ID, constants.PROTOCOL_NAME, constants.PROTOCOL_SLUG, versions_1.Versions);
    const tokenPricer = new token_1.TokenPrice();
    const tokenInitializer = new token_1.TokenInitialize();
    const sdk = perpfutures_1.SDK.initializeFromEvent(protocolConfig, tokenPricer, tokenInitializer, event);
    return sdk;
}
exports.initializeSDK = initializeSDK;
function getOrCreatePool(sdk) {
    const pool = sdk.Pools.loadPool(graph_ts_1.Bytes.fromHexString(constants.VAULT_ADDRESS.toHexString()));
    if (!pool.isInitialized) {
        const outputToken = sdk.Tokens.getOrCreateToken(constants.MLP_ADDRESS);
        pool.initialize(constants.POOL_NAME, constants.POOL_SYMBOL, [], outputToken);
        pool.setPoolFee(constants_1.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE, constants.PROTOCOL_SIDE_REVENUE_PERCENT.times(constants.BIGDECIMAL_HUNDRED));
        pool.setPoolFee(constants_1.LiquidityPoolFeeType.FIXED_STAKE_FEE, constants.STAKE_SIDE_REVENUE_PERCENT.times(constants.BIGDECIMAL_HUNDRED));
    }
    return pool;
}
exports.getOrCreatePool = getOrCreatePool;
function getOrCreateAccount(accountAddress, pool, sdk) {
    const loadAccountResponse = sdk.Accounts.loadAccount(accountAddress);
    const account = loadAccountResponse.account;
    if (loadAccountResponse.isNewUser) {
        const protocol = sdk.Protocol;
        protocol.addUser();
        pool.addUser();
    }
    return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
