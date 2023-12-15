"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapV3FantomConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapV3FantomConfigurations {
    getNetwork() {
        return constants_1.Network.FANTOM;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return graph_ts_1.Bytes.fromHexString("0x7770978eed668a3ba661d51a773d3a992fc9ddcb");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x7770978eed668a3ba661d51a773d3a992fc9ddcb"));
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
        return graph_ts_1.Bytes.fromHexString("0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"); // WFTM
    }
    getRewardToken() {
        return graph_ts_1.Bytes.fromHexString("");
    }
    getWhitelistTokens() {
        return (0, utils_1.stringToBytesList)([
            "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
            "0x74b23882a30290451a17c44f4f05243b6b58c76d",
            "0xad84341756bf337f5a0164515b1f6f993d194e1f",
            "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
            "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
            "0xae75a438b2e0cb8bb01ec1e1e376de11d44477cc", // SUSHI
        ]);
    }
    getStableCoins() {
        return (0, utils_1.stringToBytesList)([
            "0xad84341756bf337f5a0164515b1f6f993d194e1f",
            "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
            "0x04068da6c83afcfa0e13ba15a6696662335d5b75", // USDC
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.stringToBytesList)([
            "0x37216637e92ff3fd1aece7f39eb8d71fc2545b9b", // USDC/wETH
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
exports.SushiswapV3FantomConfigurations = SushiswapV3FantomConfigurations;
