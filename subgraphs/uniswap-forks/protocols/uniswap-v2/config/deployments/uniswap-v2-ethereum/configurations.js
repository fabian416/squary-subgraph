"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapV2MainnetConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
class UniswapV2MainnetConfigurations {
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
        return "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f";
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f"));
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
        return constants_1.FeeSwitch.OFF;
    }
    getRewardIntervalType() {
        return constants_1.RewardIntervalType.NONE;
    }
    getRewardTokenRate() {
        return constants_1.BIGINT_ZERO;
    }
    getReferenceToken() {
        return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    }
    getRewardToken() {
        return "";
    }
    getWhitelistTokens() {
        return [
            "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "0x6b175474e89094c44da98b954eedeac495271d0f",
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "0x0000000000085d4780b73119b644ae5ecd22b376",
            "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643",
            "0x39aa39c021dfbae8fac545936693ac917d5e7563",
            "0x86fadb80d8d2cff3c3680819e4da99c10232ba0f",
            "0x57ab1ec28d129707052df4df418d58a2d46d5f51",
            "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
            "0xc00e94cb662c3520282e6f5717214004a7f26888",
            "0x514910771af9ca656af840dff83e8264ecf986ca",
            "0x960b236a07cf122663c4303350609a66a7b288c0",
            "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
            "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
            "0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8",
            "0x853d955acef822db058eb8505911ed77f175b99e",
            "0xa47c8bf37f92abed4a126bda807a7b7498661acd",
            "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
        ];
    }
    getStableCoins() {
        return [
            "0x6b175474e89094c44da98b954eedeac495271d0f",
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
        ];
    }
    getStableOraclePools() {
        return [
            "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",
            "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11",
            "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852", // USDT/wETH created block 10093341
        ];
    }
    getUntrackedPairs() {
        return ["0x9ea3b5b4ec044b70375236a281986106457b20ef"];
    }
    getUntrackedTokens() {
        return [
            // Uncomment some of these depending on how to pricing turns out.
            "0x77dc1f32a15f0c255b7ae0a1f67fc0b46e7b8bba",
            "0x5dbcf33d8c2e976c6b560249878e6f1491bca25c",
            "0xe0bcc5246e1561e6f6562fcecc2db910d1af0e6f",
            "0x48fb253446873234f2febbf9bdeaa72d9d387f94",
            "0xf8b20370896e6f6e5331bdae18081eda9d6854e8",
            "0xcd5a1ff8202ecbad7a2baa3cc4996bebe938146c",
            "0x495b0f097ae25adb5c042cba6a5633175599969d",
            "0x186a33d4dbcd700086a26188dcb74e69be463665",
            "0x35bd8472ed2da9eed980e49b8b92ccbcf625adbd",
            "0xb611920d44324655335b5e11ebc9c929faddfbaf",
            "0xf2bae67cc0b4642b9bc71264cc878598cb0722bd",
            "0x975ce667d59318e13da8acd3d2f534be5a64087b",
            "0x73da99602949c1e333b536889f925e7f4460dea7",
            "0x4ddebdae4d2c0d6d8044dd2a9845fc68d1bad40d",
            "0x4c6e796bbfe5eb37f9e3e0f66c009c8bf2a5f428",
            "0x956f47f50a910163d8bf957cf5846d573e7f87ca",
            "0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c",
            "0x6e10aacb89a28d6fa0fe68790777fec7e7f01890",
            "0xda6cb58a0d0c01610a29c5a65c303e13e885887c",
            "0x3896eac50598ce7c27d921c71710b5824780a4c1",
            "0x61bfc979ea8160ede9b862798b7833a97bafa02a",
            "0xe5f166c0d8872b68790061317bb6cca04582c912",
            "0xaf30d2a7e90d7dc361c8c4585e9bb7d2f6f15bc7",
            "0x89b51360dbb970d34059d27ed438d0c06cfaa5cb",
            "0x83aab16807b55413bc633a2b67a28cd3898cc10f",
            "0xea26c4ac16d4a5a106820bc8aee85fd0b7b2b664",
            "0x41dbecc1cdc5517c6f76f6a6e836adbee2754de3",
            "0x49d716dfe60b37379010a75329ae09428f17118d",
            "0xf4a7452f87486504f9ee9d911a1c488127f4f6e7",
            "0xdb33d49b5a41a97d296b7242a96ebd8ac77b3bb8",
            "0x69b148395ce0015c13e36bffbad63f49ef874e03",
            "0x33490ab0464ab2ae206c635b9c646f7031fa6c60",
            "0x1ceb05a055c635695fb6b7b28b330f21a8b6afa9",
            "0x75a1169e51a3c6336ef854f76cde949f999720b1",
            "0xa645264c5603e96c3b0b078cdab68733794b0a71",
            "0x36e220b053f4639a61effc07ee0627f94b4a2fa9",
            "0x080fa7af7a5cb15f257c3d29f364b347a573e640",
            "0x5848bb3be5e3b51c7c3aaf15d7b2b1f034e7713f",
            "0x5bc25f649fc4e26069ddf4cf4010f9f706c23831",
            "0x002eded60c6faf61b5dcfa8fb5832a388fc38523",
            "0x08389495d7456e1951ddf7c3a1314a4bfb646d8b",
            "0x8a6aca71a218301c7081d4e96d64292d3b275ce0",
            "0x265ba42daf2d20f3f358a7361d9f69cb4e28f0e6",
            "0x2229d9054495ac0f0a479a4904d96f2dbb5a9008",
            "0x3aa8869dc8df33f2bbb7447c9164572da6bd7341",
            "0xfb1e5f5e984c28ad7e228cdaa1f8a0919bb6a09b",
            "0x0d05f8db99423638fbb69c6208d76c678df0f3a5",
            "0x77cf1a5c2b2e2b2442acdbe53d1f6fd95419e597",
            "0x177d7a75b9e73d12d49451b03494768a17e33f61",
            "0xa9fbb83a2689f4ff86339a4b96874d718673b627",
            "0x1ceb05a055c635695fb6b7b28b330f21a8b6afa9",
            "0xcca0c9c383076649604ee31b20248bc04fdf61ca",
            "0xbc6e3cfde888e215bf7e425ee88cb133b1210be9",
            "0xd881a753ee98e7d91eb384a8e69ec998ffaa5a33",
            "0x976287ccb0c0f2b7bc0759c1cbaba3c39571f648",
            "0xd794dd1cada4cf79c9eebaab8327a1b0507ef7d4",
            "0x2b467594fe0ba4048f2148e64e47ff8373c6d73e",
            "0x7bb594b3c757801346801f025699e39e7aaf5a49",
            "0xcfb72ed3647cc8e7fa52e4f121ecdabefc305e7f",
            "0xe6a2dd48d0b604a2fcb447840078e0643659d864",
            "0x278923f10b7e575e129e62b747ee25db6e7bcf6b",
            "0x64f0d720ce8b97ba44cd002005d2dfa3186c0580",
            "0x1453dbb8a29551ade11d89825ca812e05317eaeb",
            "0x1e053d89e08c24aa2ce5c5b4206744dc2d7bd8f5",
            "0x8bcb77a5e9726d291ebe20b69d660b1afe6b7c26",
            "0xcb3df3108635932d912632ef7132d03ecfc39080",
            "0x9224b7a393bdad6a7d04f0d618057012a6ef5f38",
            "0xcdcfc0f66c522fd086a1b725ea3c0eeb9f9e8814",
            "0x767fe9edc9e0df98e07454847909b5e959d7ca0e",
            "0x75a1169e51a3c6336ef854f76cde949f999720b1",
            "0x74559bf30696c65e7374561e7638361dca9e3709",
            "0x56150c3845c15df287a5ec4878f707ddc273b4e0",
            "0xe31debd7abff90b06bca21010dd860d8701fd901",
            "0x1fc6ab5e2b4ebb09c37807f988b22b38f3e1c228",
            "0xbba477999ed5b067fddbb1fe1797ba026d89eb23",
            "0x9d86f93ff837b80032e3fd7b3f8e1aacc25d3d80",
            "0x0698dda3c390ff92722f9eed766d8b1727621df9",
            "0xbd62253c8033f3907c0800780662eab7378a4b96",
            "0xed7e17b99804d273eda67fc7d423cc9080ea8431",
            "0x395c8db957d743a62ac3aaaa4574553bcf2380b3",
            "0xd1e2d5085b39b80c9948aeb1b9aa83af6756bcc5",
            "0x80ab141f324c3d6f2b18b030f1c4e95d4d658778",
            "0x82a77710495a35549d2add797412b4a4497d33ef",
            "0x5b558564b57e4ff88c6b8d8e7eeee599bf79b368", // MultiMillion
        ];
    }
    getBrokenERC20Tokens() {
        return ["0x0000000000bf2686748e1c0255036e7617e7e8a5"];
    }
    getMinimumLiquidityThresholdTrackVolume() {
        return constants_1.MINIMUM_LIQUIDITY_FOUR_HUNDRED_THOUSAND;
    }
    getMinimumLiquidityThresholdTrackPrice() {
        return constants_1.MINIMUM_LIQUIDITY_FIVE_THOUSAND;
    }
}
exports.UniswapV2MainnetConfigurations = UniswapV2MainnetConfigurations;
