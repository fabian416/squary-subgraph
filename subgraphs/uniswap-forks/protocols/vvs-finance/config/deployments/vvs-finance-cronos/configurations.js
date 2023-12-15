"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VSSFinanceCronosConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
class VSSFinanceCronosConfigurations {
    getNetwork() {
        return constants_1.Network.CRONOS;
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
        return "0x3b44b2a187a7b3824131f8db5a74194d0a42fc15";
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x3b44b2a187a7b3824131f8db5a74194d0a42fc15"));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTradeFee(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.3");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getProtocolFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.1");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getLPFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.2");
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
        return constants_1.RewardIntervalType.BLOCK;
    }
    getRewardTokenRate() {
        return constants_1.BIGINT_ZERO;
    }
    getReferenceToken() {
        return "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23";
    }
    getRewardToken() {
        return "0x2d03bece6747adc00e1a131bba1469c15fd11e03";
    }
    getWhitelistTokens() {
        return [
            "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23",
            "0xf2001b145b43032aaf5ee2884e456ccd805f677d",
            "0xc21223249ca28397b4b6541dffaecc539bff0c59",
            "0x66e428c3f67a68878562e79a0234c1f83c208770",
            "0xe44fd7fcb2b1581822d0c862b68222998a0c299a", // wETH
        ];
    }
    getStableCoins() {
        return [
            "0xf2001b145b43032aaf5ee2884e456ccd805f677d",
            "0xc21223249ca28397b4b6541dffaecc539bff0c59",
            "0x66e428c3f67a68878562e79a0234c1f83c208770", // USDT
        ];
    }
    getStableOraclePools() {
        return [
            "0xe61db569e231b3f5530168aa2c9d50246525b6d6",
            "0x3eb9ff92e19b73235a393000c176c8bb150f1b20",
            "0x3d2180db9e1b909f35c398bc39ef36108c0fc8c3", // USDT/wCRO
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
exports.VSSFinanceCronosConfigurations = VSSFinanceCronosConfigurations;
