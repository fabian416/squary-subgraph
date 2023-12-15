"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapV3ArbitrumConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapV3ArbitrumConfigurations {
    getNetwork() {
        return constants_1.Network.ARBITRUM_ONE;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return graph_ts_1.Bytes.fromHexString("0x1af415a1eba07a4986a52b6f2e7de7003d82231e");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x1af415a1eba07a4986a52b6f2e7de7003d82231e"));
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
        return graph_ts_1.Bytes.fromHexString("0x82af49447d8a07e3bd95bd0d56f35241523fbab1"); // WETH
    }
    getRewardToken() {
        return graph_ts_1.Bytes.fromHexString("");
    }
    getWhitelistTokens() {
        return (0, utils_1.stringToBytesList)([
            "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "0xd4d42f0b6def4ce0383636770ef773390d85c61a",
            "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
            "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
            "0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a",
            "0x17fc002b466eec40dae837fc4be5c67993ddbd6f",
            "0x09ad12552ec45f82be90b38dfe7b06332a680864",
            "0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55",
            "0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1",
            "0x539bde0d7dbd336b79148aa742883198bbf60342",
            "0x912ce59144191c1204e64559fe8253a0e49e6548", // ARB
        ]);
    }
    getStableCoins() {
        return (0, utils_1.stringToBytesList)([
            "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
            "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
            "0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a",
            "0x17fc002b466eec40dae837fc4be5c67993ddbd6f", // FRAX
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.stringToBytesList)([
            "0x15e444da5b343c5a0931f5d3e85d158d1efc3d40", // USDC/wETH
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
exports.SushiswapV3ArbitrumConfigurations = SushiswapV3ArbitrumConfigurations;
