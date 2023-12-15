"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UbeswapCeloConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class UbeswapCeloConfigurations {
    getNetwork() {
        return constants_1.Network.CELO;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_SLUG;
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
    getFactoryAddress() {
        return "0x62d5b84be28a183abb507e125b384122d2c25fae";
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x62d5b84be28a183abb507e125b384122d2c25fae"));
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
        return graph_ts_1.BigDecimal.fromString("0.05");
    }
    //Liquidity providers earn a 0.25% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
    getLPFeeToOff() {
        return graph_ts_1.BigDecimal.fromString("0.25");
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
        return (0, utils_1.toLowerCase)("0x471ece3750da237f93b8e339c536989b8978a438");
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("0x00be915b9dcf56a3cbe739d9b9c202ca692409ec");
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0x471ece3750da237f93b8e339c536989b8978a438",
            "0x7037f7296b2fc7908de7b57a89efaa8319f0c500",
            "0x765de816845861e75a25fca122bb6898b8b1282a",
            "0xa8d0e6799ff3fd19c6459bf02689ae09c4d78ba7",
            "0xe273ad7ee11dcfaa87383ad5977ee1504ac07568",
            "0xd629eb00deced2a080b7ec630ef6ac117e614f1b",
            "0x122013fd7df1c6f636a5bb8f03108e876548b455",
            "0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73",
            "0x00be915b9dcf56a3cbe739d9b9c202ca692409ec",
            "0x64defa3544c695db8c535d289d843a189aa26b98",
            "0x918146359264c492bd6934071c6bd31c854edbc3",
            "0x17700282592d6917f6a73d0bf8accf4d578c131e", // MOO
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0x2a3684e9dc20b857375ea04235f2f7edbe818fa7",
            "0x765de816845861e75a25fca122bb6898b8b1282a",
            "0x64defa3544c695db8c535d289d843a189aa26b98",
            "0x918146359264c492bd6934071c6bd31c854edbc3", // mcUSD2
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0x1e593f1fe7b61c53874b54ec0c59fd0d5eb8621e",
            "0x684da04524b1a6baf99566d722de94ce989ea722",
            "0xb460f9ae1fea4f77107146c1960bb1c978118816", // CELO/mCUSD
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
        return constants_1.MINIMUM_LIQUIDITY_TEN_THOUSAND;
    }
}
exports.UbeswapCeloConfigurations = UbeswapCeloConfigurations;
