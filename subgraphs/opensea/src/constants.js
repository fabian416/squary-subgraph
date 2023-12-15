"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECONDS_PER_DAY = exports.BIGDECIMAL_MAX = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_ZERO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.INVERSE_BASIS_POINT = exports.MANTISSA_FACTOR = exports.ERC1155_INTERFACE_IDENTIFIER = exports.ERC721_INTERFACE_IDENTIFIER = exports.ETHABI_DECODE_PREFIX = exports.MATCH_ERC1155_SAFE_TRANSFER_FROM_SELECTOR = exports.MATCH_ERC721_SAFE_TRANSFER_FROM_SELECTOR = exports.MATCH_ERC721_TRANSFER_FROM_SELECTOR = exports.ERC1155_SAFE_TRANSFER_FROM_SELECTOR = exports.ERC721_SAFE_TRANSFER_FROM_SELECTOR = exports.TRANSFER_FROM_SELECTOR = exports.EXCHANGE_MARKETPLACE_FEE = exports.WYVERN_ATOMICIZER_ADDRESS = exports.WETH_ADDRESS = exports.NULL_ADDRESS = exports.Side = exports.SaleStrategy = exports.NftStandard = exports.Network = void 0;
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
var Side;
(function (Side) {
    Side.BUY = "BUY_SIDE";
    Side.SELL = "SELL_SIDE";
})(Side = exports.Side || (exports.Side = {}));
// Represents native ETH when used in the paymentToken field
exports.NULL_ADDRESS = graph_ts_1.Address.zero();
exports.WETH_ADDRESS = graph_ts_1.Address.fromString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
exports.WYVERN_ATOMICIZER_ADDRESS = graph_ts_1.Address.fromString("0xc99f70bfd82fb7c8f8191fdfbfb735606b15e5c5");
exports.EXCHANGE_MARKETPLACE_FEE = graph_ts_1.BigInt.fromI32(250);
// Function Selectors for ERC721/1155 Transfer Methods
// 0x23b872dd	transferFrom(address,address,uint256)
// 0x42842e0e	safeTransferFrom(address,address,uint256)
// 0xf242432a safeTransferFrom(address,address,uint256,uint256,bytes)
exports.TRANSFER_FROM_SELECTOR = "0x23b872dd";
exports.ERC721_SAFE_TRANSFER_FROM_SELECTOR = "0x42842e0e";
exports.ERC1155_SAFE_TRANSFER_FROM_SELECTOR = "0xf242432a";
// Function Selectors for MerkleValidator Methods (0xBAf2127B49fC93CbcA6269FAdE0F7F31dF4c88a7)
// 0xfb16a595 matchERC721UsingCriteria(address,address,address,uint256,bytes32,bytes32[])
// 0xc5a0236e matchERC721WithSafeTransferUsingCriteria(address,address,address,uint256,bytes32,bytes32[])
// 0x96809f90 matchERC1155UsingCriteria(address,address,address,uint256,uint256,bytes32,bytes32[])
exports.MATCH_ERC721_TRANSFER_FROM_SELECTOR = "0xfb16a595";
exports.MATCH_ERC721_SAFE_TRANSFER_FROM_SELECTOR = "0xc5a0236e";
exports.MATCH_ERC1155_SAFE_TRANSFER_FROM_SELECTOR = "0x96809f90";
exports.ETHABI_DECODE_PREFIX = graph_ts_1.Bytes.fromHexString("0000000000000000000000000000000000000000000000000000000000000020");
exports.ERC721_INTERFACE_IDENTIFIER = "0x80ac58cd";
exports.ERC1155_INTERFACE_IDENTIFIER = "0xd9b67a26";
exports.MANTISSA_FACTOR = graph_ts_1.BigInt.fromI32(10).pow(18).toBigDecimal();
exports.INVERSE_BASIS_POINT = graph_ts_1.BigDecimal.fromString("10000");
exports.BIGINT_ZERO = graph_ts_1.BigInt.zero();
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGDECIMAL_ZERO = graph_ts_1.BigDecimal.zero();
exports.BIGDECIMAL_HUNDRED = graph_ts_1.BigInt.fromI32(100).toBigDecimal();
exports.BIGDECIMAL_MAX = graph_ts_1.BigInt.fromI32(i32.MAX_VALUE).toBigDecimal();
exports.SECONDS_PER_DAY = 24 * 60 * 60;
