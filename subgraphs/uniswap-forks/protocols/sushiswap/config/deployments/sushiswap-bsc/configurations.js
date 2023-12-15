"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapBscConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapBscConfigurations {
    getNetwork() {
        return constants_1.Network.BSC;
    }
    getSchemaVersion() {
        return constants_1.PROTOCOL_SCHEMA_VERSION;
    }
    getSubgraphVersion() {
        return constants_2.PROTOCOL_SUBGRAPH_VERSION;
    }
    getMethodologyVersion() {
        return constants_2.PROTOCOL_METHODOLOGY_VERSION;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return (0, utils_1.toLowerCase)("0xc35dadb65012ec5796536bd9864ed8773abc74c4");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString((0, utils_1.toLowerCase)("0xc35dadb65012ec5796536bd9864ed8773abc74c4")));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTradeFee(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.3");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getProtocolFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.05");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getLPFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.25");
    }
    getProtocolFeeToOff() {
        return graph_ts_1.BigDecimal.fromString("0");
    }
    getLPFeeToOff() {
        return graph_ts_1.BigDecimal.fromString("0.3");
    }
    getFeeOnOff() {
        return constants_1.FeeSwitch.ON;
    }
    getRewardIntervalType() {
        return constants_1.RewardIntervalType.NONE;
    }
    getRewardTokenRate() {
        return constants_1.BIGINT_ZERO;
    }
    getReferenceToken() {
        return (0, utils_1.toLowerCase)("0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"); // wBNB
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("0x947950bcc74888a40ffa2593c5798f11fc9124c4");
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
            "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
            "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
            "0x55d398326f99059ff775485246999027b3197955",
            "0xe9e7cea3dedca5984780bafc599bd69add087d56",
            "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
            "0xf16e81dce15b08f326220742020379b855b87df9",
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
            "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
            "0x55d398326f99059ff775485246999027b3197955", // USDT
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0xc7632b7b2d768bbb30a404e13e1de48d1439ec21",
            "0xe6cf29055e747e95c058f64423d984546540ede5",
            "0x2905817b020fd35d9d09672946362b62766f0d69", // USDT/wBNB
        ]);
    }
    getUntrackedPairs() {
        return (0, utils_1.toLowerCaseList)([]);
    }
    getUntrackedTokens() {
        return [];
    }
    getBrokenERC20Tokens() {
        return [];
    }
    getMinimumLiquidityThresholdTrackVolume() {
        return constants_1.MINIMUM_LIQUIDITY_TEN_THOUSAND;
    }
    getMinimumLiquidityThresholdTrackPrice() {
        return constants_1.MINIMUM_LIQUIDITY_FIVE_THOUSAND;
    }
}
exports.SushiswapBscConfigurations = SushiswapBscConfigurations;
