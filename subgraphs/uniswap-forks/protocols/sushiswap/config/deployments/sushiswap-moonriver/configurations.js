"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapMoonriverConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapMoonriverConfigurations {
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
        return constants_1.RewardIntervalType.TIMESTAMP;
    }
    getRewardTokenRate() {
        return constants_1.BIGINT_ZERO;
    }
    getReferenceToken() {
        return (0, utils_1.toLowerCase)("0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c");
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("0xf390830df829cf22c53c8840554b98eafc5dcbc2");
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c",
            "0xf50225a84382c74cbdea10b0c176f71fc3de0c4d",
            "0xe6a991ffa8cfe62b0bf6bf72959a3d4f11b2e0f5",
            "0x1a93b23281cc1cde4c4741353f3064709a16197d",
            "0xb44a9b6905af7c801311e8f4e76932ee959c663c",
            "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d",
            "0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844",
            "0x0cae51e1032e8461f4806e26332c030e34de3adb", // MIM
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d",
            "0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844",
            "0xb44a9b6905af7c801311e8f4e76932ee959c663c", // USDT
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0xb1fdb392fcb3886aea012d5ce70d459d2c77ac08",
            "0xb0a594e76a876de40a7fda9819e5c4ec6d9fd222",
            "0xc6ca9c83c07a7a3a5461c817ea5210723508a9fd", // wETH/DAI
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
exports.SushiswapMoonriverConfigurations = SushiswapMoonriverConfigurations;
