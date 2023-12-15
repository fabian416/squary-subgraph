"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PangolinAvalancheConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
class PangolinAvalancheConfigurations {
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
        return "0xefa94de7a4656d787667c749f7e1223d71e9fd88";
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0xefa94de7a4656d787667c749f7e1223d71e9fd88"));
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
        const contract = this.getFactoryContract();
        const feeToResult = contract.try_feeTo();
        if (!feeToResult.reverted && feeToResult.value != graph_ts_1.Address.zero()) {
            return constants_1.FeeSwitch.ON;
        }
        return constants_1.FeeSwitch.OFF;
    }
    getRewardIntervalType() {
        return constants_1.RewardIntervalType.TIMESTAMP;
    }
    getRewardTokenRate() {
        return constants_1.BIGINT_ZERO;
    }
    getReferenceToken() {
        return "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"; // wAVAX
    }
    getRewardToken() {
        return "0x60781c2586d68229fde47564546784ab3faca982";
    }
    getWhitelistTokens() {
        return [
            "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
            "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
            "0xc7198437980c041c805a1edcba50c1ce5db95118",
            "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
            "0xde3a24028580884448a5397872046a019649b084", // USDT old
        ];
    }
    getStableCoins() {
        return [
            "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
            "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
            "0xc7198437980c041c805a1edcba50c1ce5db95118",
            "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
            "0xde3a24028580884448a5397872046a019649b084",
            "0xba7deebbfc5fa1100fb055a87773e1e99cd3507a", // DAI
        ];
    }
    getStableOraclePools() {
        return [
            "0xe3ba3d5e3f98eeff5e9eddd5bd20e476202770da",
            "0x0e0100ab771e9288e0aa97e11557e6654c3a9665",
            "0xbd918ed441767fe7924e99f6a0e0b568ac1970d9",
            "0x17a2e8275792b4616befb02eb9ae699aa0dcb94b",
            "0x9ee0a4e21bd333a6bb2ab298194320b8daa26516", // USDT old/WAVAX
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
exports.PangolinAvalancheConfigurations = PangolinAvalancheConfigurations;
