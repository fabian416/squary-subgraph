"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoneyswapMaticConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
class HoneyswapMaticConfigurations {
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
        return "0x03daa61d8007443a6584e3d8f85105096543c19c";
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x03daa61d8007443a6584e3d8f85105096543c19c"));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTradeFee(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.30");
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
        return "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"; // WETH
    }
    getRewardToken() {
        return "0x37d1ebc3af809b8fadb45dce7077efc629b2b5bb"; //pCOMB
    }
    getWhitelistTokens() {
        return [
            "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
            "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
            "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
            "0x5434fbcb072b6fd514d6b2dd50224e9ce38e5738",
            "0xe83ce6bfb580583bd6a62b4be7b34fc25f02910d", // MABBC
        ];
    }
    getStableCoins() {
        return [
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
            "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // USDT
        ];
    }
    getStableOraclePools() {
        return [
            "0xd862db749534d539713b2c392421fe5a8e43e19e", //USDC-WETH
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
        return constants_1.MINIMUM_LIQUIDITY_ONE_THOUSAND;
    }
    getMinimumLiquidityThresholdTrackPrice() {
        return constants_1.MINIMUM_LIQUIDITY_ONE_THOUSAND;
    }
}
exports.HoneyswapMaticConfigurations = HoneyswapMaticConfigurations;
