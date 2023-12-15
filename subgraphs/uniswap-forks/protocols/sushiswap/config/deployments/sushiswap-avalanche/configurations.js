"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapAvalancheConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapAvalancheConfigurations {
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
        return constants_1.RewardIntervalType.NONE;
    }
    getRewardTokenRate() {
        return constants_1.BIGINT_ZERO;
    }
    getReferenceToken() {
        return (0, utils_1.toLowerCase)("0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7");
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("0x37b608519f91f70f2eeb0e5ed9af4061722e4f76");
    }
    getBrokenERC20Tokens() {
        return [];
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
            "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
            "0x50b7545627a5162f82a992c33b87adc75187b218",
            "0x130966628846bfd36ff31a822705796e8cb8c18d",
            "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
            "0xc7198437980c041c805a1edcba50c1ce5db95118",
            "0xd586e7f844cea2f87f50152665bcbc2c279d8d70",
            "0x37b608519f91f70f2eeb0e5ed9af4061722e4f76",
            "0xb54f16fb19478766a268f172c9480f8da1a7c9c3",
            "0xce1bffbd5374dac86a2893119683f4911a2f7814", // Abracadabra Spell
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0xba7deebbfc5fa1100fb055a87773e1e99cd3507a",
            "0xde3a24028580884448a5397872046a019649b084", // USDT
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0x47f1c2a9c9027a10c3b13d1c40dd976c5014339b",
            "0x034c1b19dab61b5de448efc1e10a2e592725c893", // wAVAX/DAI
        ]);
    }
    getUntrackedPairs() {
        return (0, utils_1.toLowerCaseList)([]);
    }
    getUntrackedTokens() {
        return [
            "0x0da67235dd5787d67955420c84ca1cecd4e5bb3b", // wMEMO
        ];
    }
    getMinimumLiquidityThresholdTrackVolume() {
        return constants_1.MINIMUM_LIQUIDITY_TEN_THOUSAND;
    }
    getMinimumLiquidityThresholdTrackPrice() {
        return constants_1.MINIMUM_LIQUIDITY_FIVE_THOUSAND;
    }
}
exports.SushiswapAvalancheConfigurations = SushiswapAvalancheConfigurations;
