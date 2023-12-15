"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MMFinanceCronosConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
class MMFinanceCronosConfigurations {
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
        return "0xd590cc180601aecd6eeadd9b7f2b7611519544f4";
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0xd590cc180601aecd6eeadd9b7f2b7611519544f4"));
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
        return "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23"; // WCRO
    }
    getRewardToken() {
        return "0x97749c9b61f878a880dfe312d2594ae07aed7656"; // MMFToken
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
            "0xa68466208f1a3eb21650320d2520ee8eba5ba623",
            "0xeb28c926a7afc75fcc8d6671acd4c4a298b38419", // USDT/wCRO in MMFinance
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
exports.MMFinanceCronosConfigurations = MMFinanceCronosConfigurations;
