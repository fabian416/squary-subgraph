"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapMoonbeamConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapMoonbeamConfigurations {
    getNetwork() {
        return constants_1.Network.MOONBEAM;
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
        return (0, utils_1.toLowerCase)("0x30d2a9f5fdf90ace8c17952cbb4ee48a55d916a7");
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("0x2c78f1b70ccf63cdee49f9233e9faa99d43aa07e");
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0xacc15dc74880c9944775448304b263d191c6077f",
            "0x8f552a71efe5eefc207bf75485b356a0b3f01ec9",
            "0x1dc78acda13a8bc4408b207c9e48cdbc096d95e0",
            "0x8e70cd5b4ff3f62659049e74b6649c6603a0e594",
            "0x30d2a9f5fdf90ace8c17952cbb4ee48a55d916a7",
            "0xc234a67a4f840e61ade794be47de455361b52413",
            "0x322e86852e492a7ee17f28a78c663da38fb33bfb", /// Frax
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0x8f552a71efe5eefc207bf75485b356a0b3f01ec9",
            "0xc234a67a4f840e61ade794be47de455361b52413",
            "0x8e70cd5b4ff3f62659049e74b6649c6603a0e594", // USDT
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0x6853f323508ba1c33a09c4e956ecb9044cc1a801",
            "0x499a09c00911d373fda6c28818d95fa8ca148a60",
            "0xa8581e054e239fd7b2fa6db9298b941591f52dbe", // wETH/DAI
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
exports.SushiswapMoonbeamConfigurations = SushiswapMoonbeamConfigurations;
