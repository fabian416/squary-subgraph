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
exports.initializeSDK = exports.createOrUpdatePool = void 0;
const tokens_1 = require("../modules/tokens");
const versions_1 = require("../versions");
const utils = __importStar(require("../common/utils"));
const generic_1 = require("../sdk/protocols/generic");
const constants = __importStar(require("../common/constants"));
const events_1 = require("../sdk/util/events");
const config_1 = require("../sdk/protocols/config");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const BondingManager_1 = require("../../generated/BondingManager/BondingManager");
function createOrUpdatePool(poolAddress, event) {
    if (poolAddress.equals(constants.NULL.TYPE_ADDRESS)) {
        graph_ts_1.log.error("[createOrUpdatePool] Pool address null", []);
        return;
    }
    const sdk = initializeSDK(event);
    const bondingManagerContract = BondingManager_1.BondingManager.bind(constants.BONDING_MANAGER_ADDRESS);
    let totalInputTokenBalance = utils.readValue(bondingManagerContract.try_currentRoundTotalActiveStake(), constants.BIGINT_ZERO);
    if (totalInputTokenBalance.equals(constants.BIGINT_ZERO))
        totalInputTokenBalance = utils.readValue(bondingManagerContract.try_nextRoundTotalActiveStake(), constants.BIGINT_ZERO);
    const poolInputTokenBalance = utils.readValue(bondingManagerContract.try_transcoderTotalStake(poolAddress), constants.BIGINT_ZERO);
    const poolId = graph_ts_1.Bytes.fromUTF8(poolAddress.toHexString());
    const LPT = sdk.Tokens.getOrCreateToken(constants.LPT_ADDRESS);
    const pool = sdk.Pools.loadPool(poolId);
    pool.initialize("", "", [graph_ts_1.Bytes.fromHexString(constants.LPT_ADDRESS.toHexString())], null, false);
    pool.setInputTokenBalances([poolInputTokenBalance], true);
    let rewardTokenEmission = constants.BIGINT_ZERO;
    if (!totalInputTokenBalance.equals(constants.BIGINT_ZERO))
        rewardTokenEmission = poolInputTokenBalance
            .times((0, tokens_1.getTotalRewardTokens)())
            .div(totalInputTokenBalance);
    pool.setRewardEmissions(constants.RewardTokenType.DEPOSIT, LPT, rewardTokenEmission);
}
exports.createOrUpdatePool = createOrUpdatePool;
function initializeSDK(event) {
    const protocolConfig = new config_1.ProtocolConfig(constants.PROTOCOL_ID, constants.PROTOCOL_NAME, constants.PROTOCOL_SLUG, versions_1.Versions);
    const tokenPricer = new tokens_1.TokenPrice();
    const tokenInitializer = new tokens_1.TokenInitialize();
    const customEvent = events_1.CustomEventType.initialize(event.block, event.transaction, event.logIndex, event);
    const sdk = new generic_1.SDK(protocolConfig, tokenPricer, tokenInitializer, customEvent);
    return sdk;
}
exports.initializeSDK = initializeSDK;
