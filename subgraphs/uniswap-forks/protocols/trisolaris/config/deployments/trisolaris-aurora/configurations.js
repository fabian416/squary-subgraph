"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrisolarisAuroraConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class TrisolarisAuroraConfigurations {
    getNetwork() {
        return constants_1.Network.AURORA;
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
        return (0, utils_1.toLowerCase)("0xc66f594268041db60507f00703b152492fb176e7");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString((0, utils_1.toLowerCase)("0xc66f594268041db60507f00703b152492fb176e7")));
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
        return (0, utils_1.toLowerCase)("0xc42c30ac6cc15fac9bd938618bcaa1a1fae8501d"); // wNEAR
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("0xfa94348467f64d5a457f75f8bc40495d33c65abb"); // Trisolaris
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0xc42c30ac6cc15fac9bd938618bcaa1a1fae8501d",
            "0xb12bfca5a55806aaf64e99521918a4bf0fc40802",
            "0x4988a896b1227218e4a686fde5eabdcabd91571f",
            "0xfa94348467f64d5a457f75f8bc40495d33c65abb",
            "0x8bec47865ade3b172a928df8f990bc7f2a3b9f79",
            "0xa69d9ba086d41425f35988613c156db9a88a1a96",
            "0xf4eb217ba2454613b15dbdea6e5f22276410e89e", // wBTC
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0xb12bfca5a55806aaf64e99521918a4bf0fc40802",
            "0x4988a896b1227218e4a686fde5eabdcabd91571f", // USDT
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0x20f8aefb5697b77e0bb835a8518be70775cda1b0",
            "0x03b666f3488a7992b2385b12df7f35156d7b29cd", // USDT/wNEAR
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
exports.TrisolarisAuroraConfigurations = TrisolarisAuroraConfigurations;
