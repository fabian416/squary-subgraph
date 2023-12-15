"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseswapBaseConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
class BaseswapBaseConfigurations {
    getNetwork() {
        return constants_1.Network.BASE;
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
        return "0xfda619b6d20975be80a10332cd39b9a4b0faa8bb";
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0xfda619b6d20975be80a10332cd39b9a4b0faa8bb"));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTradeFee(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.25");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getProtocolFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.25");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getLPFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0");
    }
    getProtocolFeeToOff() {
        return graph_ts_1.BigDecimal.fromString("0");
    }
    getLPFeeToOff() {
        return graph_ts_1.BigDecimal.fromString("0");
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
        return "0x4200000000000000000000000000000000000006";
    }
    getRewardToken() {
        return "";
    }
    getWhitelistTokens() {
        return [
            "0x4200000000000000000000000000000000000006",
            "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
            "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
            "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca",
            "0x50c5725949a6f0c72e6c4a641f24049a917db0cb", // dai
        ];
    }
    getStableCoins() {
        return [
            "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca",
            "0x50c5725949a6f0c72e6c4a641f24049a917db0cb", // DAI
        ];
    }
    getStableOraclePools() {
        return [
            "0x41d160033c222e6f3722ec97379867324567d883", // USDC/WETH
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
exports.BaseswapBaseConfigurations = BaseswapBaseConfigurations;
