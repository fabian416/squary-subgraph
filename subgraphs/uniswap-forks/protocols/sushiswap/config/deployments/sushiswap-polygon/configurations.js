"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapMaticConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapMaticConfigurations {
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
        return (0, utils_1.toLowerCase)("0x7ceb23fd6bc0add59e62ac25578270cff1b9f619");
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a");
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
            "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
            "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6", // wBTC
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
            "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // USDT
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0x34965ba0ac2451a34a0471f04cca3f990b8dea27",
            "0xc2755915a85c6f6c1c0f3a86ac8c058f11caa9c9",
            "0x6ff62bfb8c12109e8000935a6de54dad83a4f39f", // wETH/DAI
        ]);
    }
    getUntrackedPairs() {
        return (0, utils_1.toLowerCaseList)([]);
    }
    getUntrackedTokens() {
        return [
            "0x43284543540a29de091f0a1526ac033da423e0e6", // SafePoly Token
        ];
    }
    getBrokenERC20Tokens() {
        return [];
    }
    getMinimumLiquidityThresholdTrackVolume() {
        return constants_1.MINIMUM_LIQUIDITY_TWENTY_FIVE_THOUSAND;
    }
    getMinimumLiquidityThresholdTrackPrice() {
        return constants_1.MINIMUM_LIQUIDITY_TWENTY_FIVE_THOUSAND;
    }
}
exports.SushiswapMaticConfigurations = SushiswapMaticConfigurations;
