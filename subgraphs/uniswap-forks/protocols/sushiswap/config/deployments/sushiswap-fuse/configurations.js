"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapFuseConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapFuseConfigurations {
    getNetwork() {
        return constants_1.Network.FUSE;
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
        return (0, utils_1.toLowerCase)("0x43ea90e2b786728520e4f930d2a71a477bf2737c");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString((0, utils_1.toLowerCase)("0x43ea90e2b786728520e4f930d2a71a477bf2737c")));
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
        return (0, utils_1.toLowerCase)("0xa722c13135930332eb3d749b2f0906559d2c5b99");
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("0x90708b20ccc1eb95a4fa7c8b18fd2c22a0ff9e78");
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0x0be9e53fd7edac9f859882afdda116645287c629",
            "0xa722c13135930332eb3d749b2f0906559d2c5b99",
            "0x33284f95ccb7b948d9d352e1439561cf83d8d00d",
            "0x620fd5fa44be6af63715ef4e65ddfa0387ad13f5",
            "0x94ba7a27c7a95863d1bdc7645ac2951e0cca06ba",
            "0xfadbbf8ce7d5b7041be672561bba99f79c532e10",
            "0x249be57637d8b013ad64785404b24aebae9b098b", // fUSD
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0x620fd5fa44be6af63715ef4e65ddfa0387ad13f5",
            "0x94ba7a27c7a95863d1bdc7645ac2951e0cca06ba",
            "0xfadbbf8ce7d5b7041be672561bba99f79c532e10",
            "0x249be57637d8b013ad64785404b24aebae9b098b", // fUSD
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0xba9ca720e314f42e17e80991c1d0affe47387108",
            "0xadf3924f44d0ae0242333cde32d75309b30a0fcc",
            "0x44f5b873d6b2a2ee8309927e22f3359c7f23d428", // wETH/DAI
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
exports.SushiswapFuseConfigurations = SushiswapFuseConfigurations;
