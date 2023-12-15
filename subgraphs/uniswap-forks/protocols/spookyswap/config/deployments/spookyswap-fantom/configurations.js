"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpookyswapFantomConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
class SpookyswapFantomConfigurations {
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
        return "0x152ee697f2e276fa89e96742e9bb9ab1f2e61be3";
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x152ee697f2e276fa89e96742e9bb9ab1f2e61be3"));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTradeFee(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.20");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getProtocolFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.03");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getLPFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.17");
    }
    getProtocolFeeToOff() {
        return graph_ts_1.BigDecimal.fromString("0");
    }
    getLPFeeToOff() {
        return graph_ts_1.BigDecimal.fromString("0.2");
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
        return "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";
    }
    getRewardToken() {
        return "0x841fad6eae12c286d1fd18d1d525dffa75c7effe";
    }
    getWhitelistTokens() {
        return [
            "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
            "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
            "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
            "0x049d68029688eabf473097a2fc38ef61633a3c7a",
            "0x74b23882a30290451a17c44f4f05243b6b58c76d",
            "0x321162cd933e2be498cd2267a90534a804051b11", // WBTC
        ];
    }
    getStableCoins() {
        return [
            "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
            "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
            "0x049d68029688eabf473097a2fc38ef61633a3c7a", // fUSDT
        ];
    }
    getStableOraclePools() {
        return [
            "0xe120ffbda0d14f3bb6d6053e90e63c572a66a428",
            "0x5965e53aa80a0bcf1cd6dbdd72e6a9b2aa047410",
            "0x2b4c76d0dc16be1c31d4c1dc53bf9b45987fc75c", // USDC/FTM
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
exports.SpookyswapFantomConfigurations = SpookyswapFantomConfigurations;
