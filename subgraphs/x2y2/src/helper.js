"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.max = exports.min = exports.PROTOCOL_FEE_MANAGER = exports.SECONDS_PER_DAY = exports.FEE_PERCENTAGE_FACTOR = exports.BIGDECIMAL_HUNDRED = exports.MANTISSA_FACTOR = exports.BIGDECIMAL_MAX = exports.BIGDECIMAL_ZERO = exports.BIGINT_ZERO = exports.X2Y2Op = exports.SaleStrategy = exports.NftStandard = exports.Network = void 0;
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
// Constants ported from X2Y2 contracts
// See https://github.com/0xbe1/x2y2-contracts/blob/master/contracts/MarketConsts.sol#L92
var X2Y2Op;
(function (X2Y2Op) {
    X2Y2Op.COMPLETE_SELL_OFFER = 1;
    X2Y2Op.COMPLETE_BUY_OFFER = 2;
})(X2Y2Op = exports.X2Y2Op || (exports.X2Y2Op = {}));
exports.BIGINT_ZERO = graph_ts_1.BigInt.zero();
exports.BIGDECIMAL_ZERO = graph_ts_1.BigDecimal.zero();
exports.BIGDECIMAL_MAX = graph_ts_1.BigInt.fromI32(i32.MAX_VALUE).toBigDecimal();
exports.MANTISSA_FACTOR = graph_ts_1.BigInt.fromI32(10)
    .pow(18)
    .toBigDecimal();
exports.BIGDECIMAL_HUNDRED = graph_ts_1.BigInt.fromI32(100).toBigDecimal();
// EvInventory.detail.fees returns Fee[], Fee.percentage 5000 represents 0.5%, and the factor is 1e6
exports.FEE_PERCENTAGE_FACTOR = graph_ts_1.BigInt.fromI32(1000000).toBigDecimal();
exports.SECONDS_PER_DAY = 24 * 60 * 60;
exports.PROTOCOL_FEE_MANAGER = graph_ts_1.Address.fromString("0xd823c605807cc5e6bd6fc0d7e4eea50d3e2d66cd");
function min(a, b) {
    return a.lt(b) ? a : b;
}
exports.min = min;
function max(a, b) {
    return a.lt(b) ? b : a;
}
exports.max = max;
