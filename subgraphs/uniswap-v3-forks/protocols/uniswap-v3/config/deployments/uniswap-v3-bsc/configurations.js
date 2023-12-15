"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapV3BSCConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class UniswapV3BSCConfigurations {
    getNetwork() {
        return constants_1.Network.BSC;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return graph_ts_1.Bytes.fromHexString("0xdb1d10011ad0ff90774d0c6bb92e5c5c8b4461f7");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0xdb1d10011ad0ff90774d0c6bb92e5c5c8b4461f7"));
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
        return graph_ts_1.Bytes.fromHexString("0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"); // wbnb
    }
    getRewardToken() {
        return graph_ts_1.Bytes.fromHexString("");
    }
    getWhitelistTokens() {
        return (0, utils_1.stringToBytesList)([
            "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
            "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
            "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
            "0x55d398326f99059ff775485246999027b3197955",
            "0xe9e7cea3dedca5984780bafc599bd69add087d56",
            "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
            "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC
        ]);
    }
    getStableCoins() {
        return (0, utils_1.stringToBytesList)([
            "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
            "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
            "0x55d398326f99059ff775485246999027b3197955",
            "0xe9e7cea3dedca5984780bafc599bd69add087d56", // BUSD
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.stringToBytesList)([
            "0x32776ed4d96ed069a2d812773f0ad8ad9ef83cf8",
            "0x6fe9e9de56356f7edbfcbb29fab7cd69471a4869",
            "0x7862d9b4be2156b15d54f41ee4ede2d5b0b455e4", // wBNB/USDT - 0.30
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
exports.UniswapV3BSCConfigurations = UniswapV3BSCConfigurations;
