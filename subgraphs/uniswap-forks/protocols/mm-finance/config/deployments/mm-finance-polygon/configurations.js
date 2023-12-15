"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MMFinanceMaticConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
class MMFinanceMaticConfigurations {
    getNetwork() {
        return constants_1.Network.MATIC;
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
        return "0x7cfb780010e9c861e03bcbc7ac12e013137d47a5";
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x7cfb780010e9c861e03bcbc7ac12e013137d47a5"));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTradeFee(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.17");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getProtocolFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.068"); // in their docs it's 0.07, but looking at the code is really 0.068
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getLPFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.102");
    }
    getProtocolFeeToOff() {
        return graph_ts_1.BigDecimal.fromString("0");
    }
    getLPFeeToOff() {
        return graph_ts_1.BigDecimal.fromString("0.17");
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
        return "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"; // WMATIC
    }
    getRewardToken() {
        return "0x22a31bd4cb694433b6de19e0acc2899e553e9481"; // MMFToken
    }
    getWhitelistTokens() {
        return [
            "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
            "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", // wETH
        ];
    }
    getStableCoins() {
        return [
            "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // USDT
        ];
    }
    getStableOraclePools() {
        return [
            "0xb965c131f1c48d89b1760860b782d2acdf87273b",
            "0xa789324e64268c5385ea7678435fa83532705b0f", // USDT/wMATIC in MMFinance
        ];
    }
    getUntrackedPairs() {
        return [];
    }
    getUntrackedTokens() {
        return [
            "0x21e0401aacfcec454b0da7faab7e8a000ce28480", // MM Finance Test Token
        ];
    }
    getBrokenERC20Tokens() {
        return [];
    }
    getMinimumLiquidityThresholdTrackVolume() {
        return constants_1.MINIMUM_LIQUIDITY_ONE_THOUSAND;
    }
    getMinimumLiquidityThresholdTrackPrice() {
        return constants_1.MINIMUM_LIQUIDITY_ONE_THOUSAND;
    }
}
exports.MMFinanceMaticConfigurations = MMFinanceMaticConfigurations;
