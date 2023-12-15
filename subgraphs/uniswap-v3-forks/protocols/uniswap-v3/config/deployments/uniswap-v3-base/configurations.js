"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapV3BaseConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class UniswapV3BaseConfigurations {
    getNetwork() {
        return constants_1.Network.BASE;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return graph_ts_1.Bytes.fromHexString("0x33128a8fc17869897dce68ed026d694621f6fdfd");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x33128a8fc17869897dce68ed026d694621f6fdfd"));
    }
    getProtocolFeeOnOff() {
        return constants_1.FeeSwitch.OFF;
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
        return graph_ts_1.Bytes.fromHexString("0x4200000000000000000000000000000000000006");
    }
    getRewardToken() {
        return graph_ts_1.Bytes.fromHexString("");
    }
    getWhitelistTokens() {
        return (0, utils_1.stringToBytesList)([
            "0x4200000000000000000000000000000000000006",
            "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
            "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca", // usdc
        ]);
    }
    getStableCoins() {
        return (0, utils_1.stringToBytesList)([
            "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca", // usdc
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.stringToBytesList)([
            "0x4c36388be6f416a29c8d8eee81c771ce6be14b18",
            "0x3ddf264ac95d19e81f8c25f4c300c4e59e424d43",
            "0xe584fe0c7505025c3819c82c99944b79a7cc009d", // usdc-weth 1%
        ]);
    }
    getUntrackedPairs() {
        return (0, utils_1.stringToBytesList)([]);
    }
    getUntrackedTokens() {
        return (0, utils_1.stringToBytesList)([]);
    }
    getMinimumLiquidityThreshold() {
        return graph_ts_1.BigDecimal.fromString("10000");
    }
    getBrokenERC20Tokens() {
        return (0, utils_1.stringToBytesList)([]);
    }
}
exports.UniswapV3BaseConfigurations = UniswapV3BaseConfigurations;
