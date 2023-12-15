"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapFantomConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapFantomConfigurations {
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
        return (0, utils_1.toLowerCase)("0x74b23882a30290451a17c44f4f05243b6b58c76d");
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("0xae75a438b2e0cb8bb01ec1e1e376de11d44477cc");
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
            "0xad84341756bf337f5a0164515b1f6f993d194e1f",
            "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
            "0x74b23882a30290451a17c44f4f05243b6b58c76d",
            "0x04068da6c83afcfa0e13ba15a6696662335d5b75", // USDC
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
            "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
            "0x049d68029688eabf473097a2fc38ef61633a3c7a",
            "0xad84341756bf337f5a0164515b1f6f993d194e1f", // fUSD
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0xa48869049e36f8bfe0cc5cf655632626988c0140",
            "0xd019dd7c760c6431797d6ed170bffb8faee11f99",
            "0xd32f2eb49e91aa160946f3538564118388d6246a", // wETH/DAI
        ]);
    }
    getUntrackedPairs() {
        return (0, utils_1.toLowerCaseList)([]);
    }
    getUntrackedTokens() {
        return [
            "0x0751f7661f4b5a012cae6afe38e594a6f10d4313",
            "0xf6129f6705b826dbafaa26e03aad9dd20b9235c6",
            "0xc61b68d68ba5118afd9048728b4977ebe57130a0",
            "0x07a5b3d0cb418d07d9ad12cbdb30b5c5c6778531",
            "0xe297e06761a5489380538a0308b6f9b4a53bea45",
            "0xdaa10abbc76151893cda500580cd78cc0b807c47",
            "0x0ebdd4cdc95ec1e20d7fddc8aaedba0c840e4975",
            "0x6160240896d8039b2d901cd59dea95396c94a1c2", // Adult Entertainment Token
        ];
    }
    getBrokenERC20Tokens() {
        return [];
    }
    getMinimumLiquidityThresholdTrackVolume() {
        return constants_1.MINIMUM_LIQUIDITY_TWO_HUNDRED_FIFTY_THOUSAND;
    }
    getMinimumLiquidityThresholdTrackPrice() {
        return constants_1.MINIMUM_LIQUIDITY_FIVE_THOUSAND;
    }
}
exports.SushiswapFantomConfigurations = SushiswapFantomConfigurations;
