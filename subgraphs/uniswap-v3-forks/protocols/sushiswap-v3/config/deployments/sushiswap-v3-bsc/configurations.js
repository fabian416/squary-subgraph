"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapV3BscConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapV3BscConfigurations {
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
        return graph_ts_1.Bytes.fromHexString("0x126555dd55a39328f69400d6ae4f782bd4c34abb");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x126555dd55a39328f69400d6ae4f782bd4c34abb"));
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
        return graph_ts_1.Bytes.fromHexString("0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"); // WBNB
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
            "0xf16e81dce15b08f326220742020379b855b87df9",
            "0x986cdf0fd180b40c4d6aeaa01ab740b996d8b782",
            "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC
        ]);
    }
    getStableCoins() {
        return (0, utils_1.stringToBytesList)([
            "0x55d398326f99059ff775485246999027b3197955",
            "0xe9e7cea3dedca5984780bafc599bd69add087d56",
            "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
            "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.stringToBytesList)([
            "0xc0e2792774b2f602f74f6056ed95ab958d253823", // USDC/wETH
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
exports.SushiswapV3BscConfigurations = SushiswapV3BscConfigurations;
