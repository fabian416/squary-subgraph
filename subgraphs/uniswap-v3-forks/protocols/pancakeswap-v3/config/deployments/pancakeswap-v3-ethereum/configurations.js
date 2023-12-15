"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PancakeV3EthereumConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class PancakeV3EthereumConfigurations {
    getNetwork() {
        return constants_1.Network.MAINNET;
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
        return graph_ts_1.Bytes.fromHexString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"); // WETH
    }
    getRewardToken() {
        return graph_ts_1.Bytes.fromHexString("");
    }
    getWhitelistTokens() {
        return (0, utils_1.stringToBytesList)([
            "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "0x6b175474e89094c44da98b954eedeac495271d0f",
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "0x0000000000085d4780b73119b644ae5ecd22b376",
            "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643",
            "0x39aa39c021dfbae8fac545936693ac917d5e7563", // cUSDC
        ]);
    }
    getStableCoins() {
        return (0, utils_1.stringToBytesList)([
            "0x6b175474e89094c44da98b954eedeac495271d0f",
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "0x0000000000085d4780b73119b644ae5ecd22b376", // TUSD
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.stringToBytesList)([
            "0x1ac1a8feaaea1900c4166deeed0c11cc10669d36",
            "0x6ca298d2983ab03aa1da7679389d955a4efee15c", // WETH/USDT - 0.05
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
exports.PancakeV3EthereumConfigurations = PancakeV3EthereumConfigurations;
