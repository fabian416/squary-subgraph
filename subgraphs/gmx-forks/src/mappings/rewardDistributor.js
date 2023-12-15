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
exports.handleEsgmxToGlpChange = exports.handleEthToGlpChange = void 0;
const RewardDistributor_1 = require("../../generated/FeeGlpRewardDistributor/RewardDistributor");
const utils = __importStar(require("../common/utils"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants = __importStar(require("../common/constants"));
const constants_1 = require("../sdk/util/constants");
const initializers_1 = require("../common/initializers");
function handleEthToGlpChange(event) {
    handleTokensPerIntervalChange(event);
}
exports.handleEthToGlpChange = handleEthToGlpChange;
function handleEsgmxToGlpChange(event) {
    handleTokensPerIntervalChange(event);
}
exports.handleEsgmxToGlpChange = handleEsgmxToGlpChange;
function handleTokensPerIntervalChange(event) {
    const sdk = (0, initializers_1.initializeSDK)(event);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    const rewardDistributorContract = RewardDistributor_1.RewardDistributor.bind(event.address);
    const rewardTokenAddress = utils.readValue(rewardDistributorContract.try_rewardToken(), constants.NULL.TYPE_ADDRESS);
    if (rewardTokenAddress.equals(constants.NULL.TYPE_ADDRESS))
        return;
    // Based on the emissions rate for the pool, calculate the rewards per day for the pool.
    const tokensPerDay = event.params.amount.times(graph_ts_1.BigInt.fromI32(constants.SECONDS_PER_DAY));
    const token = sdk.Tokens.getOrCreateToken(rewardTokenAddress);
    sdk.Tokens.getOrCreateRewardToken(token, constants_1.RewardTokenType.DEPOSIT);
    pool.setRewardEmissions(constants_1.RewardTokenType.DEPOSIT, token, tokensPerDay);
}
