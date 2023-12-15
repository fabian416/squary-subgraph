"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapGnosisConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapGnosisConfigurations {
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
        return (0, utils_1.toLowerCase)("0xe91d153e0b41518a2ce8dd3d7944fa863463a97d"); // wxDAI
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("0x2995d1317dcd4f0ab89f4ae60f3f020a4f17c7ce");
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1",
            "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",
            "0x8e5bbbb09ed1ebde8674cda39a0c169401db4252",
            "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83",
            "0x4ecaba5870353805a9f068101a40e0f32ed605c6",
            "0x44fa8e6f47987339850636f88629646662444217",
            "0xfe7ed09c4956f7cdb54ec4ffcb9818db2d7025b8", // USDP
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83",
            "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",
            "0x4ecaba5870353805a9f068101a40e0f32ed605c6", // USDT
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0xa227c72a4055a9dc949cae24f54535fe890d3663",
            "0x6685c047eab042297e659bfaa7423e94b4a14b9e", // wETH/USDT
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
        return constants_1.MINIMUM_LIQUIDITY_THREE_THOUSAND;
    }
}
exports.SushiswapGnosisConfigurations = SushiswapGnosisConfigurations;
