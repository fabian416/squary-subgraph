"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApeswapMaticConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
class ApeswapMaticConfigurations {
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
        return "0xcf083be4164828f00cae704ec15a36d711491284";
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0xcf083be4164828f00cae704ec15a36d711491284"));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTradeFee(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.2");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getProtocolFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.15");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getLPFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.05");
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
        return constants_1.RewardIntervalType.TIMESTAMP;
    }
    getRewardTokenRate() {
        return constants_1.BIGINT_ZERO;
    }
    getReferenceToken() {
        return "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
    }
    getRewardToken() {
        return "0x5d47baba0d66083c52009271faf3f50dcc01023c";
    }
    getWhitelistTokens() {
        return [
            "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
            "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
            "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            "0xa649325aa7c5093d12d6f98eb4378deae68ce23f",
            "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
            "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
            "0x5d47baba0d66083c52009271faf3f50dcc01023c", // BANANA
        ];
    }
    getStableCoins() {
        return [
            "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
            "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // USDC
        ];
    }
    getStableOraclePools() {
        return [
            "0xd32f3139a214034a0f9777c87ee0a064c1ff6ae2",
            "0x65d43b64e3b31965cd5ea367d4c2b94c03084797",
            "0x019011032a7ac3a87ee885b6c08467ac46ad11cd", // WMATIC/USDC
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
exports.ApeswapMaticConfigurations = ApeswapMaticConfigurations;
