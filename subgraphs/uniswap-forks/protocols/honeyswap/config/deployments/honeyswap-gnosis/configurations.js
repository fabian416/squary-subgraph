"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoneyswapGnosisConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
class HoneyswapGnosisConfigurations {
    getNetwork() {
        return constants_1.Network.GNOSIS;
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
        return "0xa818b4f111ccac7aa31d0bcc0806d64f2e0737d7";
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0xa818b4f111ccac7aa31d0bcc0806d64f2e0737d7"));
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
        return "0x9c58bacc331c9aa871afd802db6379a98e80cedb"; // GNO
    }
    getRewardToken() {
        return "0x38fb649ad3d6ba1113be5f57b927053e97fc5bf7"; // xCOMB
    }
    getWhitelistTokens() {
        return [
            "0x9c58bacc331c9aa871afd802db6379a98e80cedb",
            "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1",
            "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",
            "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83",
            "0x38fb649ad3d6ba1113be5f57b927053e97fc5bf7",
            "0x71850b7e9ee3f13ab46d67167341e4bdc905eef9",
            "0x21a42669643f45bc0e086b8fc2ed70c23d67509d",
            "0x4f4f9b8d5b4d0dc10506e5551b0513b61fd59e75",
            "0x4291f029b9e7acb02d49428458cf6fceac545f81",
            "0xdd96b45877d0e8361a4ddb732da741e97f3191ff",
            "0xe2e73a1c69ecf83f464efce6a5be353a37ca09b2",
            "0x3a97704a1b25f08aa230ae53b352e2e72ef52843", // AGVE
        ];
    }
    getStableCoins() {
        return [
            "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",
            "0xdd96b45877d0e8361a4ddb732da741e97f3191ff",
            "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83", // USDC
        ];
    }
    getStableOraclePools() {
        return [
            "0x321704900d52f44180068caa73778d5cd60695a6", // GNO-WXDAI
            // "0x9e8e5e4a0900fe4634c02aaf0f130cfb93c53fbc", // xCOMB-WXDAI
            // "0x7bea4af5d425f2d4485bdad1859c88617df31a67", // WETH-WXDAI
        ];
    }
    getUntrackedPairs() {
        return [];
    }
    getUntrackedTokens() {
        return [
            "0x2f26b15dd4d27d9811a08389a0171a3c8750890e",
            "0x5d32a9baf31a793dba7275f77856a47a0f5d09b3",
            "0x69f79c9ea174d4659b18c7993c7efbbbb58cf068", // Test HNY Token
        ];
    }
    getBrokenERC20Tokens() {
        return [];
    }
    getMinimumLiquidityThresholdTrackVolume() {
        return constants_1.MINIMUM_LIQUIDITY_ONE_THOUSAND;
    }
    getMinimumLiquidityThresholdTrackPrice() {
        return constants_1.MINIMUM_LIQUIDITY_ONE_THOUSAND;
    }
}
exports.HoneyswapGnosisConfigurations = HoneyswapGnosisConfigurations;
