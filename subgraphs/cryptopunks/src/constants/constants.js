"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECONDS_PER_DAY =
  exports.ETH_DECIMALS =
  exports.BIGDECIMAL_MAX =
  exports.BIGDECIMAL_HUNDRED =
  exports.BIGDECIMAL_ZERO =
  exports.BIGINT_ONE =
  exports.BIGINT_ZERO =
  exports.NULL_ADDRESS =
  exports.CRYPTOPUNK_TOTAL_SUPPLY =
  exports.CRYPTOPUNK_SYMBOL =
  exports.CRYPTOPUNK_NAME =
  exports.MARKETPLACE_SLUG =
  exports.MARKETPLACE_NAME =
  exports.CRYPTOPUNK_CONTRACT_ADDRESS =
  exports.TradeType =
  exports.AccountType =
  exports.SaleStrategy =
  exports.NftStandard =
  exports.Network =
    void 0;
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
})((Network = exports.Network || (exports.Network = {})));
var NftStandard;
(function (NftStandard) {
  NftStandard.ERC721 = "ERC721";
  NftStandard.ERC1155 = "ERC1155";
  NftStandard.UNKNOWN = "UNKNOWN";
})((NftStandard = exports.NftStandard || (exports.NftStandard = {})));
var SaleStrategy;
(function (SaleStrategy) {
  SaleStrategy.STANDARD_SALE = "STANDARD_SALE";
  SaleStrategy.ANY_ITEM_FROM_COLLECTION = "ANY_ITEM_FROM_COLLECTION";
  SaleStrategy.ANY_ITEM_FROM_SET = "ANY_ITEM_FROM_SET";
  SaleStrategy.DUTCH_AUCTION = "DUTCH_AUCTION";
  SaleStrategy.PRIVATE_SALE = "PRIVATE_SALE";
})((SaleStrategy = exports.SaleStrategy || (exports.SaleStrategy = {})));
var AccountType;
(function (AccountType) {
  AccountType.MARKETPLACE_ACCOUNT = "MARKETPLACE_ACCOUNT";
  AccountType.COLLECTION_ACCOUNT = "COLLECTION_ACCOUNT";
  AccountType.DAILY_MARKETPLACE_ACCOUNT = "DAILY_MARKETPLACE_ACCOUNT";
  AccountType.DAILY_COLLECTION_ACCOUNT = "DAILY_COLLECTION_ACCOUNT";
})((AccountType = exports.AccountType || (exports.AccountType = {})));
var TradeType;
(function (TradeType) {
  TradeType.BUYER = "Buyer";
  TradeType.SELLER = "Seller";
})((TradeType = exports.TradeType || (exports.TradeType = {})));
exports.CRYPTOPUNK_CONTRACT_ADDRESS =
  "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193bbb";
exports.MARKETPLACE_NAME = "CryptoPunks";
exports.MARKETPLACE_SLUG = "cryptopunks";
exports.CRYPTOPUNK_NAME = "CRYPTOPUNKS";
exports.CRYPTOPUNK_SYMBOL = "Ͼ";
exports.CRYPTOPUNK_TOTAL_SUPPLY = graph_ts_1.BigInt.fromString("10000");
exports.NULL_ADDRESS = graph_ts_1.Address.zero();
exports.BIGINT_ZERO = graph_ts_1.BigInt.zero();
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGDECIMAL_ZERO = graph_ts_1.BigDecimal.zero();
exports.BIGDECIMAL_HUNDRED = graph_ts_1.BigInt.fromI32(100).toBigDecimal();
exports.BIGDECIMAL_MAX = graph_ts_1.BigInt.fromI32(
  i32.MAX_VALUE
).toBigDecimal();
exports.ETH_DECIMALS = graph_ts_1.BigDecimal.fromString("1000000000000000000");
exports.SECONDS_PER_DAY = 24 * 60 * 60;
