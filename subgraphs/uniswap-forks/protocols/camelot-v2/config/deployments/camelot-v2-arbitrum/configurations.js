"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CamelotV2Configurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
class CamelotV2Configurations {
    getNetwork() {
        return constants_1.Network.ARBITRUM_ONE;
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
        return constants_2.FACTORY_ADDRESS;
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString(constants_2.FACTORY_ADDRESS));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTradeFee(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.3");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getProtocolFeeToOn(blockNumber) {
        return constants_1.BIGDECIMAL_ZERO;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getLPFeeToOn(blockNumber) {
        return constants_1.BIGDECIMAL_ZERO;
    }
    getProtocolFeeToOff() {
        return constants_1.BIGDECIMAL_ZERO;
    }
    getLPFeeToOff() {
        return constants_1.BIGDECIMAL_ZERO;
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
        return "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"; //WETH
    }
    getRewardToken() {
        return "0x3d9907f9a368ad0a51be60f7da3b97cf940982d8"; // GRAIL
    }
    getWhitelistTokens() {
        return [
            "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
            "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
        ];
    }
    getStableCoins() {
        return [
            "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
            "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
            "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
        ];
    }
    getStableOraclePools() {
        return [
            "0x84652bb2539513baf36e225c930fdd8eaa63ce27",
            "0x97b192198d164c2a1834295e302b713bc32c8f1d", // USDT/wETH created block 40441957
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
        return constants_1.MINIMUM_LIQUIDITY_TWENTY_FIVE_THOUSAND;
    }
    getMinimumLiquidityThresholdTrackPrice() {
        return constants_1.MINIMUM_LIQUIDITY_TWENTY_FIVE_THOUSAND;
    }
}
exports.CamelotV2Configurations = CamelotV2Configurations;
