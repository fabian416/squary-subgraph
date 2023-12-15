"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiswapBscConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
class BiswapBscConfigurations {
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
        return "0x858e3312ed3a876947ea49d572a7c42de08af7ee";
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x858e3312ed3a876947ea49d572a7c42de08af7ee"));
    }
    getTradeFee(blockNumber) {
        if (blockNumber < graph_ts_1.BigInt.fromI32(20488163)) {
            return graph_ts_1.BigDecimal.fromString("0.1");
        }
        return graph_ts_1.BigDecimal.fromString("0.2");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getProtocolFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.05");
    }
    getLPFeeToOn(blockNumber) {
        if (blockNumber < graph_ts_1.BigInt.fromI32(20488163)) {
            return graph_ts_1.BigDecimal.fromString("0.05");
        }
        return graph_ts_1.BigDecimal.fromString("0.15");
    }
    getProtocolFeeToOff() {
        return graph_ts_1.BigDecimal.fromString("0");
    }
    getLPFeeToOff() {
        return graph_ts_1.BigDecimal.fromString("0");
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
        return "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
    }
    getRewardToken() {
        return "0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95";
    }
    getWhitelistTokens() {
        return [
            "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
            "0xe9e7cea3dedca5984780bafc599bd69add087d56",
            "0x55d398326f99059ff775485246999027b3197955",
            "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
            "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
            "0x4bd17003473389a42daf6a0a729f6fdb328bbbd7",
            "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
            "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
            "0x250632378e573c6be1ac2f97fcdf00515d0aa91b",
            "0x965f527d9159dce6288a2219db51fc6eef120dd1", // BSW
        ];
    }
    getStableCoins() {
        return [
            "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
            "0x55d398326f99059ff775485246999027b3197955",
            "0xe9e7cea3dedca5984780bafc599bd69add087d56", // BUSD
        ];
    }
    getStableOraclePools() {
        return [
            "0x06cd679121ec37b0a2fd673d4976b09d81791856",
            "0x8840c6252e2e86e545defb6da98b2a0e26d8c1ba",
            "0xacaac9311b0096e04dfe96b6d87dec867d3883dc", // BUSD/WBNB
        ];
    }
    getUntrackedPairs() {
        return [];
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
exports.BiswapBscConfigurations = BiswapBscConfigurations;
