"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PancakeV3BSCConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class PancakeV3BSCConfigurations {
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
        return graph_ts_1.Bytes.fromHexString("0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865"));
    }
    getProtocolFeeOnOff() {
        return constants_1.FeeSwitch.ON;
    }
    getInitialProtocolFeeProportion(fee) {
        if (fee == constants_1.INT_HUNDRED) {
            return graph_ts_1.BigDecimal.fromString("0.33");
        }
        else if (fee == constants_1.INT_FIVE_HUNDRED) {
            return graph_ts_1.BigDecimal.fromString("0.34");
        }
        return graph_ts_1.BigDecimal.fromString("0.32");
    }
    getProtocolFeeProportion(protocolFee) {
        return protocolFee.toBigDecimal().div(constants_1.BIGDECIMAL_TEN_THOUSAND);
    }
    getRewardIntervalType() {
        return constants_1.RewardIntervalType.NONE;
    }
    getReferenceToken() {
        return graph_ts_1.Bytes.fromHexString("0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"); // wBNB
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
            "0x36696169c63e42cd08ce11f5deebbcebae652050",
            "0x81a9b5f18179ce2bf8f001b8a634db80771f1824", // wBNB/USDC - 0.05
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
exports.PancakeV3BSCConfigurations = PancakeV3BSCConfigurations;
