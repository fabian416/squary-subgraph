"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpiritSwapFantomConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SpiritSwapFantomConfigurations {
    getNetwork() {
        return constants_1.Network.FANTOM;
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
        return (0, utils_1.toLowerCase)("0xef45d134b73241eda7703fa787148d9c9f4950b0");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString((0, utils_1.toLowerCase)("0xef45d134b73241eda7703fa787148d9c9f4950b0")));
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
        return constants_1.RewardIntervalType.BLOCK;
    }
    getRewardTokenRate() {
        return constants_1.BIGINT_ZERO;
    }
    getReferenceToken() {
        return (0, utils_1.toLowerCase)("0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83");
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("0x5cc61a78f164885776aa610fb0fe1257df78e59b");
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
            "0xdc301622e621166bd8e82f2ca0a26c13ad0be355",
            "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
            "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
            "0x049d68029688eabf473097a2fc38ef61633a3c7a", // fUSDT
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
            "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
            "0x049d68029688eabf473097a2fc38ef61633a3c7a", // fUSDT
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0xe7e90f5a767406eff87fdad7eb07ef407922ec1d", // USDC/FTM
        ]);
    }
    getUntrackedPairs() {
        return (0, utils_1.toLowerCaseList)([]);
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
exports.SpiritSwapFantomConfigurations = SpiritSwapFantomConfigurations;
