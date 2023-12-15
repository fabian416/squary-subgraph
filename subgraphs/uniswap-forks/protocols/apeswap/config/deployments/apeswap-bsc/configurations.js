"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApeswapBscConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
class ApeswapBscConfigurations {
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
        return "0x0841bd0b734e4f5853f0dd8d7ea041c241fb0da6";
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x0841bd0b734e4f5853f0dd8d7ea041c241fb0da6"));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTradeFee(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.2");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getProtocolFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.05");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getLPFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.15");
    }
    getProtocolFeeToOff() {
        return graph_ts_1.BigDecimal.fromString("0");
    }
    getLPFeeToOff() {
        return graph_ts_1.BigDecimal.fromString("0.2");
    }
    getFeeOnOff() {
        return constants_1.FeeSwitch.ON;
    }
    getRewardIntervalType() {
        return constants_1.RewardIntervalType.BLOCK;
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
            "0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95",
            "0xddb3bd8645775f59496c821e4f55a7ea6a6dc299", // GNANA
        ];
    }
    getStableCoins() {
        return [
            "0x6b175474e89094c44da98b954eedeac495271d0f",
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "0x0000000000085d4780b73119b644ae5ecd22b376",
            "0x956f47f50a910163d8bf957cf5846d573e7f87ca",
            "0x4dd28568d05f09b02220b09c2cb307bfd837cb95",
        ];
    }
    getStableOraclePools() {
        return [
            "0x51e6d27fa57373d8d4c256231241053a70cb1d93",
            "0xf3010261b58b2874639ca2e860e9005e3be5de0b",
            "0x20bcc3b8a0091ddac2d0bc30f68e6cbb97de59cd", // USDT/WBNB created block 648115
        ];
    }
    getUntrackedPairs() {
        return [];
    }
    getUntrackedTokens() {
        return [
            "0x87bade473ea0513d4aa7085484aeaa6cb6ebe7e3",
            "0x7e7d3556310830581815b1aa1bbbc9e5d7097580",
            "0xd9a88f9b7101046786490baf433f0f6ab3d753e2", // BBQ
        ];
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
exports.ApeswapBscConfigurations = ApeswapBscConfigurations;
