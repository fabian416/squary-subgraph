"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapV3OptimismConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils");
class UniswapV3OptimismConfigurations {
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
        return graph_ts_1.Bytes.fromHexString("0x1f98431c8ad98523631ae4a59f267346ea31f984");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x1f98431c8ad98523631ae4a59f267346ea31f984"));
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
            "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
            "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
            "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
            "0x68f180fcce6836688e9084f035309e29bf0a2095",
            "0x9e1028f5f1d5ede59748ffcee5532509976840e0",
            "0x50c5725949a6f0c72e6c4a641f24049a917db0cb",
            "0x61baadcf22d2565b0f471b291c475db5555e0b76", // aelin
        ]);
    }
    getStableCoins() {
        return (0, utils_1.stringToBytesList)([
            "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
            "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
            "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", // dai
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.stringToBytesList)([
            "0x03af20bdaaffb4cc0a521796a223f7d85e2aac31",
            "0xb589969d38ce76d3d7aa319de7133bc9755fd840",
            "0x85149247691df622eaf1a8bd0cafd40bc45154a9", // weth/usdc - 0.05
        ]);
    }
    getUntrackedPairs() {
        return (0, utils_1.stringToBytesList)([]);
    }
    getUntrackedTokens() {
        return (0, utils_1.stringToBytesList)(["0xb5df6b8f7ebec28858b267fc2ddc59cc8aca7a8d"]);
    }
    getMinimumLiquidityThreshold() {
        return graph_ts_1.BigDecimal.fromString("100000");
    }
    getBrokenERC20Tokens() {
        return (0, utils_1.stringToBytesList)(["0x000000000000be0ab658f92dddac29d6df19a3be"]);
    }
}
exports.UniswapV3OptimismConfigurations = UniswapV3OptimismConfigurations;
