"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapV3MainnetConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class UniswapV3MainnetConfigurations {
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
        return graph_ts_1.Bytes.fromHexString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
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
            "0x39aa39c021dfbae8fac545936693ac917d5e7563",
            "0x86fadb80d8d2cff3c3680819e4da99c10232ba0f",
            "0x57ab1ec28d129707052df4df418d58a2d46d5f51",
            "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
            "0xc00e94cb662c3520282e6f5717214004a7f26888",
            "0x514910771af9ca656af840dff83e8264ecf986ca",
            "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
            "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
            "0x111111111117dc0aa78b770fa6a738034120c302",
            "0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8",
            "0x956f47f50a910163d8bf957cf5846d573e7f87ca",
            "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
            "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
            "0xfe2e637202056d30016725477c5da089ab0a043a", // sETH2
        ]);
    }
    getStableCoins() {
        return (0, utils_1.stringToBytesList)([
            "0x6b175474e89094c44da98b954eedeac495271d0f",
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "0x0000000000085d4780b73119b644ae5ecd22b376",
            "0x956f47f50a910163d8bf957cf5846d573e7f87ca",
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.stringToBytesList)([
            "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8", // USDC/wETH
        ]);
    }
    getUntrackedPairs() {
        return (0, utils_1.stringToBytesList)([]);
    }
    getUntrackedTokens() {
        return (0, utils_1.stringToBytesList)([
            "0x0df66b8644771fae9400d93e74a509a3546cd13e", // X token
        ]);
    }
    getMinimumLiquidityThreshold() {
        return graph_ts_1.BigDecimal.fromString("200000");
    }
    getBrokenERC20Tokens() {
        return (0, utils_1.stringToBytesList)([]);
    }
}
exports.UniswapV3MainnetConfigurations = UniswapV3MainnetConfigurations;
