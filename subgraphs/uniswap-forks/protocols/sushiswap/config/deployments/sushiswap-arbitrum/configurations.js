"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapArbitrumConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapArbitrumConfigurations {
    getNetwork() {
        return constants_1.Network.ARBITRUM_ONE;
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
        return (0, utils_1.toLowerCase)("0x82af49447d8a07e3bd95bd0d56f35241523fbab1");
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("0xd4d42f0b6def4ce0383636770ef773390d85c61a");
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
            "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
            "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
            "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0x905dfcd5649217c42684f23958568e533c711aa3",
            "0xcb0e5bfa72bbb4d16ab5aa0c60601c438f04b4ad", // wETH/USDT
        ]);
    }
    getUntrackedPairs() {
        return (0, utils_1.toLowerCaseList)([]);
    }
    getUntrackedTokens() {
        return [
            "0x3010eadefaba5756226c0543ab4ea1f975018c65",
            "0x5204ca6252643b1cfc6bbac05698c45e70f2cb1c",
            "0x15e32be99b3af4b7517639b3ac608c93f73e42de",
            "0xf5520364a2e2ff1cb2e007df7cbe01c8b2cd7e0d",
            "0x014a029338d7953e0df6dc5ea351ade9743c98ed",
            "0x806d6626f88834971d9b26f4e8fffc9f6f46bc35",
            "0x7753a4ff7c9994ade950095e68eed44f83931dfd",
            "0xd4cd3e9d44b8d2b87535bb210eae220daf48f5a3",
            "0xed2be16e5f53365ef8e2a1d2c3ff2fca1d94c8bd",
            "0x0856853f067c1e3dc28e9636ef9de0bddeea0838",
            "0x80b95b558f067ba86d5cd4084889ea0fda5ebd6d",
            "0x930002e02eaff5a40c4e5e9210a44e564e04aba7",
            "0xb24086ecbb8dffb943b5ccf97e6da9a434308f3f",
        ];
    }
    getBrokenERC20Tokens() {
        return [];
    }
    getMinimumLiquidityThresholdTrackVolume() {
        return constants_1.MINIMUM_LIQUIDITY_TEN_THOUSAND;
    }
    getMinimumLiquidityThresholdTrackPrice() {
        return constants_1.MINIMUM_LIQUIDITY_TWENTY_FIVE_THOUSAND;
    }
}
exports.SushiswapArbitrumConfigurations = SushiswapArbitrumConfigurations;
