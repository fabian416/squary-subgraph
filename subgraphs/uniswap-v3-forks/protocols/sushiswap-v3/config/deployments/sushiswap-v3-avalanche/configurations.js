"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapV3AvalancheConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapV3AvalancheConfigurations {
    getNetwork() {
        return constants_1.Network.AVALANCHE;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return graph_ts_1.Bytes.fromHexString("0x3e603c14af37ebdad31709c4f848fc6ad5bec715");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x3e603c14af37ebdad31709c4f848fc6ad5bec715"));
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
        return graph_ts_1.Bytes.fromHexString("0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"); // WAVAX
    }
    getRewardToken() {
        return graph_ts_1.Bytes.fromHexString("");
    }
    getWhitelistTokens() {
        return (0, utils_1.stringToBytesList)([
            "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
            "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
            "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
            "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
            "0xc7198437980c041c805a1edcba50c1ce5db95118",
            "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
            "0xd586e7f844cea2f87f50152665bcbc2c279d8d70",
            "0x50b7545627a5162f82a992c33b87adc75187b218",
            "0x130966628846bfd36ff31a822705796e8cb8c18d",
            "0x37b608519f91f70f2eeb0e5ed9af4061722e4f76",
            "0xb54f16fb19478766a268f172c9480f8da1a7c9c3",
            "0xce1bffbd5374dac86a2893119683f4911a2f7814",
            "0x0da67235dd5787d67955420c84ca1cecd4e5bb3b", // WMEMO
        ]);
    }
    getStableCoins() {
        return (0, utils_1.stringToBytesList)([
            "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
            "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
            "0xc7198437980c041c805a1edcba50c1ce5db95118",
            "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
            "0xd586e7f844cea2f87f50152665bcbc2c279d8d70",
            "0x130966628846bfd36ff31a822705796e8cb8c18d", // MIM
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.stringToBytesList)([
            "0x4a5c0e100f830a1f6b76a42e6bb4be2a7fe0d61b", // USDC/wETH
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
exports.SushiswapV3AvalancheConfigurations = SushiswapV3AvalancheConfigurations;
