"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickswapMaticConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class QuickswapMaticConfigurations {
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
        return (0, utils_1.toLowerCase)("0x5757371414417b8c6caad45baef941abc7d3ab32");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString((0, utils_1.toLowerCase)("0x5757371414417b8c6caad45baef941abc7d3ab32")));
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
        return constants_1.FeeSwitch.OFF;
    }
    getRewardIntervalType() {
        return constants_1.RewardIntervalType.NONE;
    }
    getRewardTokenRate() {
        return constants_1.BIGINT_ZERO;
    }
    getReferenceToken() {
        return (0, utils_1.toLowerCase)("0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"); // wETH
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("");
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", // DAI
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", // DAI
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0x853ee4b2a13f8a742d64c8f088be7ba2131f670d",
            "0x4a35582a710e1f4b2030a3f826da20bfb6703c09", // DAI/wETH
        ]);
    }
    getUntrackedPairs() {
        return (0, utils_1.toLowerCaseList)([]);
    }
    getUntrackedTokens() {
        return [
            "0x1518820879bc87d4dfea5664bb1b6c240d20d4f2",
            "0x26d41380012d698e0a65c0f268cfa8ed0148f6f3",
            "0xb4ebbe7f64cf74320fe64ab679a378eb39a80d49", // FIL
        ];
    }
    getBrokenERC20Tokens() {
        return ["0x5d76fa95c308fce88d347556785dd1dd44416272"];
    }
    getMinimumLiquidityThresholdTrackVolume() {
        return constants_1.MINIMUM_LIQUIDITY_TEN_THOUSAND;
    }
    getMinimumLiquidityThresholdTrackPrice() {
        return constants_1.MINIMUM_LIQUIDITY_FIVE_THOUSAND;
    }
}
exports.QuickswapMaticConfigurations = QuickswapMaticConfigurations;
