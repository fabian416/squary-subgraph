"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraderJoeAvalancheConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class TraderJoeAvalancheConfigurations {
    getNetwork() {
        return constants_1.Network.AVALANCHE;
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
        return (0, utils_1.toLowerCase)("0x9ad6c38be94206ca50bb0d90783181662f0cfa10");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString((0, utils_1.toLowerCase)("0x9ad6c38be94206ca50bb0d90783181662f0cfa10")));
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
        return constants_2.TRADER_JOE_AVALANCHE_REWARD_TOKEN_RATE;
    }
    getReferenceToken() {
        return (0, utils_1.toLowerCase)("0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7");
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd");
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
            "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
            "0xc7198437980c041c805a1edcba50c1ce5db95118",
            "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
            "0xde3a24028580884448a5397872046a019649b084", // USDT old
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
            "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
            "0xc7198437980c041c805a1edcba50c1ce5db95118",
            "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
            "0xde3a24028580884448a5397872046a019649b084", // USDT old
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0xe4b9865c0866346ba3613ec122040a365637fb46",
            "0xf4003f4efbe8691b60249e6afbd307abe7758adb",
            "0xed8cbd9f0ce3c6986b22002f03c6475ceb7a6256",
            "0xa389f9430876455c36478deea9769b7ca4e3ddb1",
            "0xbb4646a764358ee93c2a9c4a147d5aded527ab73", // USDT old/wAVAX
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
exports.TraderJoeAvalancheConfigurations = TraderJoeAvalancheConfigurations;
