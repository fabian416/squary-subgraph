"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapV3FuseConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapV3FuseConfigurations {
    getNetwork() {
        return constants_1.Network.FUSE;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return graph_ts_1.Bytes.fromHexString("0x1b9d177ccdea3c79b6c8f40761fc8dc9d0500eaa");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x1b9d177ccdea3c79b6c8f40761fc8dc9d0500eaa"));
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
        return graph_ts_1.Bytes.fromHexString("0x0be9e53fd7edac9f859882afdda116645287c629"); // WFUSE
    }
    getRewardToken() {
        return graph_ts_1.Bytes.fromHexString("");
    }
    getWhitelistTokens() {
        return (0, utils_1.stringToBytesList)([
            "0x0be9e53fd7edac9f859882afdda116645287c629",
            "0xa722c13135930332eb3d749b2f0906559d2c5b99",
            "0x33284f95ccb7b948d9d352e1439561cf83d8d00d",
            "0x620fd5fa44be6af63715ef4e65ddfa0387ad13f5",
            "0x94ba7a27c7a95863d1bdc7645ac2951e0cca06ba",
            "0xfadbbf8ce7d5b7041be672561bba99f79c532e10",
            "0x249be57637d8b013ad64785404b24aebae9b098b",
            "0x90708b20ccc1eb95a4fa7c8b18fd2c22a0ff9e78", // SUSHI
        ]);
    }
    getStableCoins() {
        return (0, utils_1.stringToBytesList)([
            "0x620fd5fa44be6af63715ef4e65ddfa0387ad13f5",
            "0x94ba7a27c7a95863d1bdc7645ac2951e0cca06ba",
            "0xfadbbf8ce7d5b7041be672561bba99f79c532e10",
            "0x249be57637d8b013ad64785404b24aebae9b098b", // FUSD
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.stringToBytesList)([
            "0xcd6506bf09d7823fdc40087de61261e432171435", // USDC/wETH
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
exports.SushiswapV3FuseConfigurations = SushiswapV3FuseConfigurations;
