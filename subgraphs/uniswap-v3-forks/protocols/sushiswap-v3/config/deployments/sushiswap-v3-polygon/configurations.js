"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapV3PolygonConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapV3PolygonConfigurations {
    getNetwork() {
        return constants_1.Network.MATIC;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return graph_ts_1.Bytes.fromHexString("0x917933899c6a5f8e37f31e19f92cdbff7e8ff0e2");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x917933899c6a5f8e37f31e19f92cdbff7e8ff0e2"));
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
        return graph_ts_1.Bytes.fromHexString("0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"); // WMATIC
    }
    getRewardToken() {
        return graph_ts_1.Bytes.fromHexString("");
    }
    getWhitelistTokens() {
        return (0, utils_1.stringToBytesList)([
            "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
            "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
            "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
            "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
            "0xd6df932a45c0f255f85145f286ea0b292b21c90b",
            "0x45c32fa6df82ead1e2ef74d17b76547eddfaff89",
            "0x2f800db0fdb5223b3c3f354886d907a671414a7f",
            "0x34d4ab47bee066f361fa52d792e69ac7bd05ee23",
            "0xe8377a076adabb3f9838afb77bee96eac101ffb1",
            "0x61daecab65ee2a1d5b6032df030f3faa3d116aa7",
            "0xd3f07ea86ddf7baebefd49731d7bbd207fedc53b",
            "0x236eec6359fb44cce8f97e99387aa7f8cd5cde1f",
            "0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b", // BOB
        ]);
    }
    getStableCoins() {
        return (0, utils_1.stringToBytesList)([
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
            "0x45c32fa6df82ead1e2ef74d17b76547eddfaff89", // FRAX
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.stringToBytesList)([
            "0x21988c9cfd08db3b5793c2c6782271dc94749251", // USDC/wETH
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
exports.SushiswapV3PolygonConfigurations = SushiswapV3PolygonConfigurations;
