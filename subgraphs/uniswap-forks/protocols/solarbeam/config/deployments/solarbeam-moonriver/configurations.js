"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolarbeamMoonriverConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SolarbeamMoonriverConfigurations {
    getNetwork() {
        return constants_1.Network.MOONRIVER;
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
        return (0, utils_1.toLowerCase)("0x049581aeb6fe262727f290165c29bdab065a1b68");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString((0, utils_1.toLowerCase)("0x049581aeb6fe262727f290165c29bdab065a1b68")));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTradeFee(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.25");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getProtocolFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.05");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getLPFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.20");
    }
    getProtocolFeeToOff() {
        return graph_ts_1.BigDecimal.fromString("0");
    }
    getLPFeeToOff() {
        return graph_ts_1.BigDecimal.fromString("0.25");
    }
    getFeeOnOff() {
        return constants_1.FeeSwitch.ON;
    }
    getRewardIntervalType() {
        return constants_1.RewardIntervalType.TIMESTAMP;
    }
    getRewardTokenRate() {
        return constants_1.BIGINT_ZERO;
    }
    getReferenceToken() {
        return (0, utils_1.toLowerCase)("0x98878b06940ae243284ca214f92bb71a2b032b8a"); // wMOVR
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("0x6bd193ee6d2104f14f94e2ca6efefae561a4334b"); // SOLARBEAM
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0x98878b06940ae243284ca214f92bb71a2b032b8a",
            "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d",
            "0xb44a9b6905af7c801311e8f4e76932ee959c663c",
            "0x5d9ab5522c64e1f6ef5e3627eccc093f56167818",
            "0x1a93b23281cc1cde4c4741353f3064709a16197d",
            "0xffffffff1fcacbd218edc0eba20fc2308c778080", // xcKSM
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d",
            "0xb44a9b6905af7c801311e8f4e76932ee959c663c", // USDT
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0xe537f70a8b62204832b8ba91940b77d3f79aeb81", // USDC/wMOVR
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
        return constants_1.MINIMUM_LIQUIDITY_FIVE_THOUSAND;
    }
    getMinimumLiquidityThresholdTrackPrice() {
        return constants_1.MINIMUM_LIQUIDITY_THREE_THOUSAND;
    }
}
exports.SolarbeamMoonriverConfigurations = SolarbeamMoonriverConfigurations;
