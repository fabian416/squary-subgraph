"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapV3CeloConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class UniswapV3CeloConfigurations {
    getNetwork() {
        return constants_1.Network.CELO;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return graph_ts_1.Bytes.fromHexString("0xd9dc0d8f754c027df7ecb4bd381301cec76cd32f");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0xd9dc0d8f754c027df7ecb4bd381301cec76cd32f"));
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
        return graph_ts_1.Bytes.fromHexString("0x471ece3750da237f93b8e339c536989b8978a438");
    }
    getRewardToken() {
        return graph_ts_1.Bytes.fromHexString("");
    }
    getWhitelistTokens() {
        return (0, utils_1.stringToBytesList)([
            "0x471ece3750da237f93b8e339c536989b8978a438",
            "0x765de816845861e75a25fca122bb6898b8b1282a",
            "0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73",
            "0x02de4766c272abc10bc88c220d214a26960a7e92",
            "0x32a9fe697a32135bfd313a6ac28792dae4d9979d",
            "0x66803fb87abd4aac3cbb3fad7c3aa01f6f3fb207", // wETH
        ]);
    }
    getStableCoins() {
        return (0, utils_1.stringToBytesList)([
            "0x765de816845861e75a25fca122bb6898b8b1282a", // cusd
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.stringToBytesList)([
            "0x079e7a44f42e9cd2442c3b9536244be634e8f888", // celo/cusd - 0.3%
        ]);
    }
    getUntrackedPairs() {
        return (0, utils_1.stringToBytesList)([]);
    }
    getUntrackedTokens() {
        return (0, utils_1.stringToBytesList)([]);
    }
    getMinimumLiquidityThreshold() {
        return graph_ts_1.BigDecimal.fromString("25000");
    }
    getBrokenERC20Tokens() {
        return (0, utils_1.stringToBytesList)([]);
    }
}
exports.UniswapV3CeloConfigurations = UniswapV3CeloConfigurations;
