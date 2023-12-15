"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapV3MoonriverConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapV3MoonriverConfigurations {
    getNetwork() {
        return constants_1.Network.MOONRIVER;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return graph_ts_1.Bytes.fromHexString("0x2f255d3f3c0a3726c6c99e74566c4b18e36e3ce6");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x2f255d3f3c0a3726c6c99e74566c4b18e36e3ce6"));
    }
    getProtocolFeeOnOff() {
        return constants_1.FeeSwitch.ON;
    }
    getInitialProtocolFeeProportion(fee) {
        graph_ts_1.log.warning("getProtocolFeeRatio is not implemented: {}", [fee.toString()]);
        return constants_1.BIGDECIMAL_ZERO;
    }
    getProtocolFeeProportion(protocolFee) {
        return constants_1.BIGDECIMAL_ONE.div(protocolFee.toBigDecimal());
    }
    getRewardIntervalType() {
        return constants_1.RewardIntervalType.NONE;
    }
    getReferenceToken() {
        return graph_ts_1.Bytes.fromHexString("0xf50225a84382c74cbdea10b0c176f71fc3de0c4d"); // WMOVR
    }
    getRewardToken() {
        return graph_ts_1.Bytes.fromHexString("");
    }
    getWhitelistTokens() {
        return (0, utils_1.stringToBytesList)([
            "0xf50225a84382c74cbdea10b0c176f71fc3de0c4d",
            "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c",
            "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d",
            "0xb44a9b6905af7c801311e8f4e76932ee959c663c",
            "0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844",
            "0xe6a991ffa8cfe62b0bf6bf72959a3d4f11b2e0f5",
            "0x1a93b23281cc1cde4c4741353f3064709a16197d",
            "0x0cae51e1032e8461f4806e26332c030e34de3adb",
            "0xf390830df829cf22c53c8840554b98eafc5dcbc2", // SUSHI
        ]);
    }
    getStableCoins() {
        return (0, utils_1.stringToBytesList)([
            "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d",
            "0xb44a9b6905af7c801311e8f4e76932ee959c663c",
            "0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844",
            "0x1a93b23281cc1cde4c4741353f3064709a16197d", // FRAX
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.stringToBytesList)([
            "0x1f6568ffe1226ba293e6d7dab116b5825b2412c9", // USDC/wETH
        ]);
    }
    getUntrackedPairs() {
        return (0, utils_1.stringToBytesList)([]);
    }
    getUntrackedTokens() {
        return (0, utils_1.stringToBytesList)([]);
    }
    getMinimumLiquidityThreshold() {
        return graph_ts_1.BigDecimal.fromString("1000");
    }
    getBrokenERC20Tokens() {
        return (0, utils_1.stringToBytesList)([]);
    }
}
exports.SushiswapV3MoonriverConfigurations = SushiswapV3MoonriverConfigurations;
