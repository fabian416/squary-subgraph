"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.max = exports.min = exports.ERC1155_INTERFACE_IDENTIFIER = exports.ERC721_INTERFACE_IDENTIFIER = exports.STRATEGY_PRIVATE_SALE_ADDRESSES = exports.STRATEGY_ANY_ITEM_FROM_COLLECTION_ADDRESSES = exports.STRATEGY_STANDARD_SALE_ADDRESSES = exports.WETH_ADDRESS = exports.SECONDS_PER_DAY = exports.MANTISSA_FACTOR = exports.BIGDECIMAL_MAX = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_ZERO = exports.BIGINT_ZERO = exports.SaleStrategy = exports.NftStandard = exports.Network = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
var Network;
(function (Network) {
    Network.ARBITRUM_ONE = "ARBITRUM_ONE";
    Network.ARWEAVE_MAINNET = "ARWEAVE_MAINNET";
    Network.AURORA = "AURORA";
    Network.AVALANCHE = "AVALANCHE";
    Network.BOBA = "BOBA";
    Network.BSC = "BSC"; // aka BNB Chain
    Network.CELO = "CELO";
    Network.COSMOS = "COSMOS";
    Network.MAINNET = "MAINNET"; // Ethereum mainnet
    Network.FANTOM = "FANTOM";
    Network.FUSE = "FUSE";
    Network.HARMONY = "HARMONY";
    Network.JUNO = "JUNO";
    Network.MOONBEAM = "MOONBEAM";
    Network.MOONRIVER = "MOONRIVER";
    Network.NEAR_MAINNET = "NEAR_MAINNET";
    Network.OPTIMISM = "OPTIMISM";
    Network.OSMOSIS = "OSMOSIS";
    Network.MATIC = "MATIC"; // aka Polygon
    Network.XDAI = "XDAI"; // aka Gnosis Chain
    Network.CRONOS = "CRONOS"; // Crypto.com Cronos chain
})(Network = exports.Network || (exports.Network = {}));
var NftStandard;
(function (NftStandard) {
    NftStandard.ERC721 = "ERC721";
    NftStandard.ERC1155 = "ERC1155";
    NftStandard.UNKNOWN = "UNKNOWN";
})(NftStandard = exports.NftStandard || (exports.NftStandard = {}));
var SaleStrategy;
(function (SaleStrategy) {
    SaleStrategy.STANDARD_SALE = "STANDARD_SALE";
    SaleStrategy.ANY_ITEM_FROM_COLLECTION = "ANY_ITEM_FROM_COLLECTION";
    SaleStrategy.ANY_ITEM_FROM_SET = "ANY_ITEM_FROM_SET";
    SaleStrategy.DUTCH_AUCTION = "DUTCH_AUCTION";
    SaleStrategy.PRIVATE_SALE = "PRIVATE_SALE";
})(SaleStrategy = exports.SaleStrategy || (exports.SaleStrategy = {}));
exports.BIGINT_ZERO = graph_ts_1.BigInt.zero();
exports.BIGDECIMAL_ZERO = graph_ts_1.BigDecimal.zero();
exports.BIGDECIMAL_HUNDRED = graph_ts_1.BigInt.fromI32(100).toBigDecimal();
exports.BIGDECIMAL_MAX = graph_ts_1.BigInt.fromI32(i32.MAX_VALUE).toBigDecimal();
exports.MANTISSA_FACTOR = graph_ts_1.BigInt.fromI32(10)
    .pow(18)
    .toBigDecimal();
exports.SECONDS_PER_DAY = 24 * 60 * 60;
exports.WETH_ADDRESS = graph_ts_1.Address.fromString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
exports.STRATEGY_STANDARD_SALE_ADDRESSES = [
    graph_ts_1.Address.fromString("0x56244bb70cbd3ea9dc8007399f61dfc065190031"),
    graph_ts_1.Address.fromString("0x579af6fd30bf83a5ac0d636bc619f98dbdeb930c"),
];
exports.STRATEGY_ANY_ITEM_FROM_COLLECTION_ADDRESSES = [
    graph_ts_1.Address.fromString("0x86f909f70813cdb1bc733f4d97dc6b03b8e7e8f3"),
    graph_ts_1.Address.fromString("0x09f93623019049c76209c26517acc2af9d49c69b"),
];
exports.STRATEGY_PRIVATE_SALE_ADDRESSES = [
    graph_ts_1.Address.fromString("0x58d83536d3efedb9f7f2a1ec3bdaad2b1a4dd98c"),
];
exports.ERC721_INTERFACE_IDENTIFIER = "0x80ac58cd";
exports.ERC1155_INTERFACE_IDENTIFIER = "0xd9b67a26";
function min(a, b) {
    return a.lt(b) ? a : b;
}
exports.min = min;
function max(a, b) {
    return a.lt(b) ? b : a;
}
exports.max = max;
