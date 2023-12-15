"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapV3OptimismConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapV3OptimismConfigurations {
    getNetwork() {
        return constants_1.Network.OPTIMISM;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return graph_ts_1.Bytes.fromHexString("0x9c6522117e2ed1fe5bdb72bb0ed5e3f2bde7dbe0");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x9c6522117e2ed1fe5bdb72bb0ed5e3f2bde7dbe0"));
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
        return graph_ts_1.Bytes.fromHexString("0x4200000000000000000000000000000000000006"); // WETH
    }
    getRewardToken() {
        return graph_ts_1.Bytes.fromHexString("");
    }
    getWhitelistTokens() {
        return (0, utils_1.stringToBytesList)([
            "0x4200000000000000000000000000000000000006",
            "0x4200000000000000000000000000000000000042",
            "0x68f180fcce6836688e9084f035309e29bf0a2095",
            "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
            "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
            "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
            "0x7170bd6f5ab1ac44a1ba7a0beb5f3f06c2d4a898",
            "0x3eaeb77b03dbc0f6321ae1b72b2e9adb0f60112b", // SUSHI
        ]);
    }
    getStableCoins() {
        return (0, utils_1.stringToBytesList)([
            "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
            "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
            "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", // DAI
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.stringToBytesList)([
            "0x79e11ef350d7c73925f8d0037c2dd1b8ced41533", // USDC/wETH
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
exports.SushiswapV3OptimismConfigurations = SushiswapV3OptimismConfigurations;
