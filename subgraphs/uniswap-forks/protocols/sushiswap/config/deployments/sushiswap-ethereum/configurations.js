"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapMainnetConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapMainnetConfigurations {
    getNetwork() {
        return constants_1.Network.MAINNET;
    }
    getSchemaVersion() {
        return constants_1.PROTOCOL_SCHEMA_VERSION;
    }
    getSubgraphVersion() {
        return constants_2.PROTOCOL_SUBGRAPH_VERSION;
    }
    getMethodologyVersion() {
        return constants_2.PROTOCOL_METHODOLOGY_VERSION;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return (0, utils_1.toLowerCase)("0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString((0, utils_1.toLowerCase)("0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac")));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTradeFee(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.3");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getProtocolFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.05");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getLPFeeToOn(blockNumber) {
        return graph_ts_1.BigDecimal.fromString("0.25");
    }
    getProtocolFeeToOff() {
        return graph_ts_1.BigDecimal.fromString("0");
    }
    getLPFeeToOff() {
        return graph_ts_1.BigDecimal.fromString("0.3");
    }
    getFeeOnOff() {
        return constants_1.FeeSwitch.ON;
    }
    getRewardIntervalType() {
        return constants_1.RewardIntervalType.BLOCK;
    }
    getRewardTokenRate() {
        return constants_2.MASTERCHEFV2_SUSHI_PER_BLOCK;
    }
    getReferenceToken() {
        return (0, utils_1.toLowerCase)("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    }
    getRewardToken() {
        return (0, utils_1.toLowerCase)("0x6b3595068778dd592e39a122f4f5a5cf09c90fe2");
    }
    getWhitelistTokens() {
        return (0, utils_1.toLowerCaseList)([
            "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "0x6b175474e89094c44da98b954eedeac495271d0f",
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
            // "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            // "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            // "0x6b175474e89094c44da98b954eedeac495271d0f",
            // "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            // "0x383518188c0c6d7730d91b2c03a03c837814a899",
            // "0xdac17f958d2ee523a2206206994597c13d831ec7",
            // "0x0000000000085d4780b73119b644ae5ecd22b376",
            // "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643",
            // "0x57ab1ec28d129707052df4df418d58a2d46d5f51",
            // "0x514910771af9ca656af840dff83e8264ecf986ca",
            // "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
            // "0x8798249c2e607446efb7ad49ec89dd1865ff4272",
            // "0x1456688345527be1f37e9e627da0837d6f08c925",
            // "0x3449fc1cd036255ba1eb19d65ff4ba2b8903a69a",
            // "0x2ba592f78db6436527729929aaf6c908497cb200",
            // "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0",
            // "0xa1faa113cbe53436df28ff0aee54275c13b40975",
            // "0xdb0f18081b505a7de20b18ac41856bcb4ba86a1a",
            // "0x04fa0d235c4abf4bcf4787af4cf447de572ef828",
            // "0x3155ba85d5f96b2d030a4966af206230e46849cb",
            // "0x87d73e916d7057945c9bcd8cdd94e42a6f47f776",
            // "0xdfe66b14d37c77f4e9b180ceb433d1b164f0281d",
            // "0xad32a8e6220741182940c5abf610bde99e737b2d",
            // "0xafcE9B78D409bF74980CACF610AFB851BF02F257",
            // "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"
        ]);
    }
    getStableCoins() {
        return (0, utils_1.toLowerCaseList)([
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "0x6b175474e89094c44da98b954eedeac495271d0f",
            "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.toLowerCaseList)([
            "0x397ff1542f962076d0bfe58ea045ffa2d347aca0",
            "0x06da0fd433c1a5d7a4faa01111c044910a184553",
            "0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f", // wETH/DAI
        ]);
    }
    getUntrackedPairs() {
        return (0, utils_1.toLowerCaseList)([]);
    }
    getUntrackedTokens() {
        return [
            "0xbd2f0cd039e0bfcf88901c98c0bfac5ab27566e3",
            "0x618679df9efcd19694bb1daa8d00718eacfa2883",
            "0xea7cc765ebc94c4805e3bff28d7e4ae48d06468a",
            "0x749b964f3dd571b177fc6e415a07f62b05047da4",
            "0xd417144312dbf50465b1c641d016962017ef6240",
            "0xe9f84de264e91529af07fa2c746e934397810334",
            "0x1337def16f9b486faed0293eb623dc8395dfe46a",
            "0x4b4d2e899658fb59b1d518b68fe836b100ee8958",
            "0xa487bf43cf3b10dffc97a9a744cbb7036965d3b9",
            "0x948a9bb69d1d1202c160d26804aefff0634a492e",
            "0x46ecb116aba95a7c3365a1b159efc3254e86819a",
            "0xea14af7ba0103c4d60ced5f6e6829148a613f0f3",
            "0xbbda19aabab9ad3ffef43976b18c922e30cf41c5",
            "0xc7924bf912ebc9b92e3627aed01f816629c7e400",
            "0x948a9bb69d1d1202c160d26804aefff0634a492e",
            "0x53a1e9912323b8016424d6287286e3b6de263f76",
            "0x81ee56e81224378a81d4cfc9135916383248d9eb",
            "0x4f8726a494a7a155d2ef9ea840acdd7f4069059c", // Plasma
        ];
    }
    getBrokenERC20Tokens() {
        return [];
    }
    getMinimumLiquidityThresholdTrackVolume() {
        return constants_1.MINIMUM_LIQUIDITY_TEN_THOUSAND;
    }
    getMinimumLiquidityThresholdTrackPrice() {
        return constants_1.MINIMUM_LIQUIDITY_TWENTY_FIVE_THOUSAND;
    }
}
exports.SushiswapMainnetConfigurations = SushiswapMainnetConfigurations;
