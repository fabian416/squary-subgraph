"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapV3MaticConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class UniswapV3MaticConfigurations {
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
        return graph_ts_1.Bytes.fromHexString("0x7ceb23fd6bc0add59e62ac25578270cff1b9f619");
    }
    getRewardToken() {
        return graph_ts_1.Bytes.fromHexString("");
    }
    getWhitelistTokens() {
        return (0, utils_1.stringToBytesList)([
            "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
            "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            "0xa3fa99a148fa48d14ed51d610c367c61876997f1",
            "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
            "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39",
            "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", // matic
        ]);
    }
    getStableCoins() {
        return (0, utils_1.stringToBytesList)([
            "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            "0xa3fa99a148fa48d14ed51d610c367c61876997f1", // mimatic
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.stringToBytesList)([
            "0x45dda9cb7c25131df268515131f647d726f50608",
            "0x0e44ceb592acfc5d3f09d996302eb4c499ff8c10", // usdc/weth - 0.30
        ]);
    }
    getUntrackedPairs() {
        return (0, utils_1.stringToBytesList)([]);
    }
    getUntrackedTokens() {
        return (0, utils_1.stringToBytesList)([
            "0xff20f43918c70b9fa47b6e3992b042225b17f73e",
            "0xdc8d88d9e57cc7be548f76e5e413c4838f953018", // SW DAO Token
        ]);
    }
    getMinimumLiquidityThreshold() {
        return graph_ts_1.BigDecimal.fromString("100000");
    }
    getBrokenERC20Tokens() {
        return (0, utils_1.stringToBytesList)([]);
    }
}
exports.UniswapV3MaticConfigurations = UniswapV3MaticConfigurations;
