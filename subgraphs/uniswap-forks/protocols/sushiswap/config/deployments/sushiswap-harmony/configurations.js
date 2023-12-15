"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapHarmonyConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapHarmonyConfigurations {
    getNetwork() {
        return constants_1.Network.HARMONY;
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
        return (0, utils_1.toLowerCase)("0xcf664087a5bb0237a0bad6742852ec6c8d69a27a"); // wONE
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("0xbec775cb42abfa4288de81f387a9b1a3c4bc552a");
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0xcf664087a5bb0237a0bad6742852ec6c8d69a27a",
            "0x6983d1e6def3690c4d616b13597a09e6193ea013",
            "0x3095c7557bcb296ccc6e363de01b760ba031f2d9",
            "0x985458e523db3d53125813ed68c274899e9dfab4",
            "0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f",
            "0xe176ebe47d621b984a73036b9da5d834411ef734",
            "0xef977d2f931c1978db5f6747666fa1eacb0d0339",
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0x985458e523db3d53125813ed68c274899e9dfab4",
            "0xef977d2f931c1978db5f6747666fa1eacb0d0339",
            "0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f", // USDT
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0xbf255d8c30dbab84ea42110ea7dc870f01c0013a",
            "0x194f4a320cbda15a0910d1ae20e0049cdc50916e",
            "0x2c7862b408bb3dbff277110ffde1b4eaa45c692a", // USDT/wETH
        ]);
    }
    getUntrackedPairs() {
        return (0, utils_1.toLowerCaseList)([]);
    }
    getUntrackedTokens() {
        return [
            "0xed0b4b0f0e2c17646682fc98ace09feb99af3ade", // Reverse Token
        ];
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
exports.SushiswapHarmonyConfigurations = SushiswapHarmonyConfigurations;
