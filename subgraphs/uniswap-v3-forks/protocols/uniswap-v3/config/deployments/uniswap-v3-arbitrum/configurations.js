"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapV3ArbitrumConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class UniswapV3ArbitrumConfigurations {
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
        return graph_ts_1.Bytes.fromHexString("0x82af49447d8a07e3bd95bd0d56f35241523fbab1");
    }
    getRewardToken() {
        return graph_ts_1.Bytes.fromHexString("");
    }
    getWhitelistTokens() {
        return (0, utils_1.stringToBytesList)([
            "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
            "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "0xd74f5255d557944cf7dd0e45ff521520002d5748",
            "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
            "0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a", // gmx
        ]);
    }
    getStableCoins() {
        return (0, utils_1.stringToBytesList)([
            "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
            "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            "0xd74f5255d557944cf7dd0e45ff521520002d5748", // USDs
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.stringToBytesList)([
            "0xc31e54c7a869b9fcbecc14363cf510d1c41fa443",
            "0x17c14d2c404d167802b16c450d3c99f88f2c4f4d",
            "0xc858a329bf053be78d6239c4a4343b8fbd21472b", // wETH/USDT
        ]);
    }
    getUntrackedPairs() {
        return (0, utils_1.stringToBytesList)([]);
    }
    getUntrackedTokens() {
        return (0, utils_1.stringToBytesList)([
            "0x916c1daf79236700eb67e593dc2456890ffba548",
            "0x73e7d8bad2677656c8cfbe6e18a9257c6be2b87f",
            "0x7a6717ceabe536bb9a6bb39182a4cd575d4e222e",
        ]);
    }
    getMinimumLiquidityThreshold() {
        return graph_ts_1.BigDecimal.fromString("100000");
    }
    getBrokenERC20Tokens() {
        return (0, utils_1.stringToBytesList)([]);
    }
}
exports.UniswapV3ArbitrumConfigurations = UniswapV3ArbitrumConfigurations;
