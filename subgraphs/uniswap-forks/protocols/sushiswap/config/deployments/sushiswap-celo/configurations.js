"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapCeloConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapCeloConfigurations {
    getNetwork() {
        return constants_1.Network.CELO;
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
        return (0, utils_1.toLowerCase)("0x2def4285787d58a2f811af24755a8150622f4361");
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("0x29dfce9c22003a4999930382fd00f9fd6133acd1");
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0x471ece3750da237f93b8e339c536989b8978a438",
            "0x765de816845861e75a25fca122bb6898b8b1282a",
            "0xef4229c8c3250c675f21bcefa42f58efbff6002a",
            "0x88eec49252c8cbc039dcdb394c0c2ba2f1637ea0",
            "0x90ca507a5d4458a4c6c6249d186b6dcb02a5bccd",
            "0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73",
            "0xbaab46e28388d2779e6e31fd00cf0e5ad95e327b", // wBTC
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0xef4229c8c3250c675f21bcefa42f58efbff6002a",
            "0xe4fe50cdd716522a56204352f00aa110f731932d",
            "0xb020d981420744f6b0fedd22bb67cd37ce18a1d5",
            "0x765de816845861e75a25fca122bb6898b8b1282a", // Celo Dollar
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0xbe6c36f49aac4ee12ca4b23765d9ea901be00683",
            "0x93887e0fa9f6c375b2765a6fe885593f16f077f9",
            "0xc77398cfb7b0f7ab42bafc02abc20a69ce8cef7f",
            "0x62f6470fbb1b0f8d2b2c7f497e4e12f820c318a6", // wETH/DAI
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
        return constants_1.MINIMUM_LIQUIDITY_THREE_THOUSAND;
    }
}
exports.SushiswapCeloConfigurations = SushiswapCeloConfigurations;
