"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MISSING_POOLS_MAP =
  exports.POOL_ADDRESS_V2 =
  exports.CURVE_POOL_REGISTRY =
  exports.CURVE_REGISTRY =
  exports.CONVEX_TOKEN_ADDRESS =
  exports.CRV_TOKEN_ADDRESS =
  exports.CONVEX_BOOSTER_ADDRESS =
  exports.USDC_DENOMINATOR =
  exports.DENOMINATOR =
  exports.DEFAULT_DECIMALS =
  exports.USDC_DECIMALS =
  exports.BIGDECIMAL_SECONDS_PER_DAY =
  exports.BIGDECIMAL_HUNDRED =
  exports.BIGDECIMAL_ONE =
  exports.BIGDECIMAL_ZERO =
  exports.BIGINT_SECONDS_PER_DAY =
  exports.BIGINT_HUNDRED =
  exports.BIGINT_TEN =
  exports.BIGINT_ONE =
  exports.BIGINT_ZERO =
  exports.INT_EIGHTEEN =
  exports.DEFAULT_WITHDRAWAL_FEE =
  exports.DEFAULT_PERFORMANCE_FEE =
  exports.DEFAULT_MANAGEMENT_FEE =
  exports.CVX_MAX_SUPPLY =
  exports.CVX_CLIFF_SIZE =
  exports.CVX_CLIFF_COUNT =
  exports.SECONDS_PER_DAY =
  exports.SECONDS_PER_HOUR =
  exports.SECONDS_PER_YEAR =
  exports.MAX_BPS =
  exports.Protocol =
  exports.NULL =
  exports.RewardIntervalType =
  exports.RewardTokenType =
  exports.VaultFeeType =
  exports.ProtocolType =
  exports.Network =
    void 0;
/* eslint-disable rulesdir/no-checksum-addresses */
const graph_ts_1 = require("@graphprotocol/graph-ts");
// The network names corresponding to the Network enum in the schema.
// They also correspond to the ones in `dataSource.network()` after converting to lower case.
// See below for a complete list:
// https://thegraph.com/docs/en/hosted-service/what-is-hosted-service/#supported-networks-on-the-hosted-service
var Network;
(function (Network) {
  Network.ARBITRUM_ONE = "ARBITRUM_ONE";
  Network.ARWEAVE_MAINNET = "ARWEAVE_MAINNET";
  Network.AVALANCHE = "AVALANCHE";
  Network.BOBA = "BOBA";
  Network.AURORA = "AURORA";
  Network.BSC = "BSC"; // aka BNB Chain
  Network.CELO = "CELO";
  Network.COSMOS = "COSMOS";
  Network.CRONOS = "CRONOS";
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
})((Network = exports.Network || (exports.Network = {})));
var ProtocolType;
(function (ProtocolType) {
  ProtocolType.EXCHANGE = "EXCHANGE";
  ProtocolType.LENDING = "LENDING";
  ProtocolType.YIELD = "YIELD";
  ProtocolType.BRIDGE = "BRIDGE";
  ProtocolType.GENERIC = "GENERIC";
})((ProtocolType = exports.ProtocolType || (exports.ProtocolType = {})));
var VaultFeeType;
(function (VaultFeeType) {
  VaultFeeType.MANAGEMENT_FEE = "MANAGEMENT_FEE";
  VaultFeeType.PERFORMANCE_FEE = "PERFORMANCE_FEE";
  VaultFeeType.DEPOSIT_FEE = "DEPOSIT_FEE";
  VaultFeeType.WITHDRAWAL_FEE = "WITHDRAWAL_FEE";
})((VaultFeeType = exports.VaultFeeType || (exports.VaultFeeType = {})));
var RewardTokenType;
(function (RewardTokenType) {
  RewardTokenType.DEPOSIT = "DEPOSIT";
  RewardTokenType.BORROW = "BORROW";
})(
  (RewardTokenType = exports.RewardTokenType || (exports.RewardTokenType = {}))
);
var RewardIntervalType;
(function (RewardIntervalType) {
  RewardIntervalType.BLOCK = "BLOCK";
  RewardIntervalType.TIMESTAMP = "TIMESTAMP";
})(
  (RewardIntervalType =
    exports.RewardIntervalType || (exports.RewardIntervalType = {}))
);
var NULL;
(function (NULL) {
  NULL.TYPE_STRING = "0x0000000000000000000000000000000000000000";
  NULL.TYPE_ADDRESS = graph_ts_1.Address.fromString(NULL.TYPE_STRING);
})((NULL = exports.NULL || (exports.NULL = {})));
var Protocol;
(function (Protocol) {
  Protocol.NAME = "convex";
  Protocol.SLUG = "convex";
})((Protocol = exports.Protocol || (exports.Protocol = {})));
exports.MAX_BPS = graph_ts_1.BigInt.fromI32(10000);
exports.SECONDS_PER_YEAR = graph_ts_1.BigInt.fromI32(31556952);
exports.SECONDS_PER_HOUR = 60 * 60;
exports.SECONDS_PER_DAY = 60 * 60 * 24;
exports.CVX_CLIFF_COUNT = graph_ts_1.BigDecimal.fromString("1000");
exports.CVX_CLIFF_SIZE = graph_ts_1.BigDecimal.fromString("100000");
exports.CVX_MAX_SUPPLY = graph_ts_1.BigDecimal.fromString("100000000");
exports.DEFAULT_MANAGEMENT_FEE = graph_ts_1.BigInt.fromI32(200);
exports.DEFAULT_PERFORMANCE_FEE = graph_ts_1.BigInt.fromI32(2000);
exports.DEFAULT_WITHDRAWAL_FEE = graph_ts_1.BigInt.fromI32(50);
exports.INT_EIGHTEEN = 18;
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGINT_SECONDS_PER_DAY = graph_ts_1.BigInt.fromI32(
  exports.SECONDS_PER_DAY
);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_HUNDRED = graph_ts_1.BigDecimal.fromString("100");
exports.BIGDECIMAL_SECONDS_PER_DAY = new graph_ts_1.BigDecimal(
  graph_ts_1.BigInt.fromI32(exports.SECONDS_PER_DAY)
);
exports.USDC_DECIMALS = 6;
exports.DEFAULT_DECIMALS = graph_ts_1.BigInt.fromI32(18);
exports.DENOMINATOR = graph_ts_1.BigDecimal.fromString("10000");
exports.USDC_DENOMINATOR = graph_ts_1.BigDecimal.fromString("1000000");
exports.CONVEX_BOOSTER_ADDRESS = graph_ts_1.Address.fromString(
  "0xf403c135812408bfbe8713b5a23a04b3d48aae31"
);
exports.CRV_TOKEN_ADDRESS = graph_ts_1.Address.fromString(
  "0xd533a949740bb3306d119cc777fa900ba034cd52"
);
exports.CONVEX_TOKEN_ADDRESS = graph_ts_1.Address.fromString(
  "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B"
);
var CURVE_REGISTRY;
(function (CURVE_REGISTRY) {
  CURVE_REGISTRY.v1 = graph_ts_1.Address.fromString(
    "0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c"
  );
  CURVE_REGISTRY.v2 = graph_ts_1.Address.fromString(
    "0x90e00ace148ca3b23ac1bc8c240c2a7dd9c2d7f5"
  );
})((CURVE_REGISTRY = exports.CURVE_REGISTRY || (exports.CURVE_REGISTRY = {})));
var CURVE_POOL_REGISTRY;
(function (CURVE_POOL_REGISTRY) {
  CURVE_POOL_REGISTRY.v1 = graph_ts_1.Address.fromString(
    "0x8F942C20D02bEfc377D41445793068908E2250D0"
  );
  CURVE_POOL_REGISTRY.v2 = graph_ts_1.Address.fromString(
    "0x4AacF35761d06Aa7142B9326612A42A2b9170E33"
  );
})(
  (CURVE_POOL_REGISTRY =
    exports.CURVE_POOL_REGISTRY || (exports.CURVE_POOL_REGISTRY = {}))
);
exports.POOL_ADDRESS_V2 = new Map();
exports.POOL_ADDRESS_V2.set(
  "0x3b6831c0077a1e44ed0a21841c3bc4dc11bce833",
  graph_ts_1.Address.fromString("0x9838eCcC42659FA8AA7daF2aD134b53984c9427b")
);
exports.POOL_ADDRESS_V2.set(
  "0x3d229e1b4faab62f621ef2f6a610961f7bd7b23b",
  graph_ts_1.Address.fromString("0x98a7F18d4E56Cfe84E3D081B40001B3d5bD3eB8B")
);
exports.MISSING_POOLS_MAP = new graph_ts_1.TypedMap();
exports.MISSING_POOLS_MAP.set(
  graph_ts_1.Address.fromString("0x90244f43d548a4f8dfecfad91a193465b1fad6f7"),
  graph_ts_1.Address.fromString("0x941eb6f616114e4ecaa85377945ea306002612fe")
);
exports.MISSING_POOLS_MAP.set(
  graph_ts_1.Address.fromString("0xe160364fd8407ffc8b163e278300c6c5d18ff61d"),
  graph_ts_1.Address.fromString("0xf43b15ab692fde1f9c24a9fce700adcc809d5391")
);
exports.MISSING_POOLS_MAP.set(
  graph_ts_1.Address.fromString("0x2302aabe69e6e7a1b0aa23aac68fccb8a4d2b460"),
  graph_ts_1.Address.fromString("0x9a22cdb1ca1cdd2371cd5bb5199564c4e89465eb")
);
exports.MISSING_POOLS_MAP.set(
  graph_ts_1.Address.fromString("0x1054ff2ffa34c055a13dcd9e0b4c0ca5b3aeceb9"),
  graph_ts_1.Address.fromString("0xe07bde9eb53deffa979dae36882014b758111a78")
);
exports.MISSING_POOLS_MAP.set(
  graph_ts_1.Address.fromString("0x3a70dfa7d2262988064a2d051dd47521e43c9bdd"),
  graph_ts_1.Address.fromString("0x3a70dfa7d2262988064a2d051dd47521e43c9bdd")
);
exports.MISSING_POOLS_MAP.set(
  graph_ts_1.Address.fromString("0x401322b9fddba8c0a8d40fbcece1d1752c12316b"),
  graph_ts_1.Address.fromString("0xfe4a08f22fe65759ba91db2e2cada09b4415b0d7")
);
exports.MISSING_POOLS_MAP.set(
  graph_ts_1.Address.fromString("0x54c8ecf46a81496eeb0608bd3353388b5d7a2a33"),
  graph_ts_1.Address.fromString("0x5b692073f141c31384fae55856cfb6cbffe91e60")
);
exports.MISSING_POOLS_MAP.set(
  graph_ts_1.Address.fromString("0x08cea8e5b4551722deb97113c139dd83c26c5398"),
  graph_ts_1.Address.fromString("0x6df0d77f0496ce44e72d695943950d8641fca5cf")
);
exports.MISSING_POOLS_MAP.set(
  graph_ts_1.Address.fromString("0x8682fbf0cbf312c891532ba9f1a91e44f81ad7df"),
  graph_ts_1.Address.fromString("0x1570af3df649fc74872c5b8f280a162a3bdd4eb6")
);
exports.MISSING_POOLS_MAP.set(
  graph_ts_1.Address.fromString("0x22cf19eb64226e0e1a79c69b345b31466fd273a7"),
  graph_ts_1.Address.fromString("0xacce4fe9ce2a6fe9af83e7cf321a3ff7675e0ab6")
);
exports.MISSING_POOLS_MAP.set(
  graph_ts_1.Address.fromString("0x127091ede112aed7bae281747771b3150bb047bb"),
  graph_ts_1.Address.fromString("0xeb0265938c1190ab4e3e1f6583bc956df47c0f93")
);
exports.MISSING_POOLS_MAP.set(
  graph_ts_1.Address.fromString("0x80caccdbd3f07bbdb558db4a9e146d099933d677"),
  graph_ts_1.Address.fromString("0xef04f337fcb2ea220b6e8db5edbe2d774837581c")
);
exports.MISSING_POOLS_MAP.set(
  graph_ts_1.Address.fromString("0x3660bd168494d61ffdac21e403d0f6356cf90fd7"),
  graph_ts_1.Address.fromString("0x6ec38b3228251a0c5d491faf66858e2e23d7728b")
);
exports.MISSING_POOLS_MAP.set(
  graph_ts_1.Address.fromString("0xf7b55c3732ad8b2c2da7c24f30a69f55c54fb717"),
  graph_ts_1.Address.fromString("0xf7b55c3732ad8b2c2da7c24f30a69f55c54fb717")
);
exports.MISSING_POOLS_MAP.set(
  graph_ts_1.Address.fromString("0x48ff31bbbd8ab553ebe7cbd84e1ea3dba8f54957"),
  graph_ts_1.Address.fromString("0x48ff31bbbd8ab553ebe7cbd84e1ea3dba8f54957")
);
exports.MISSING_POOLS_MAP.set(
  graph_ts_1.Address.fromString("0xdf55670e27be5cde7228dd0a6849181891c9eba1"),
  graph_ts_1.Address.fromString("0x3211c6cbef1429da3d0d58494938299c92ad5860")
);
exports.MISSING_POOLS_MAP.set(
  graph_ts_1.Address.fromString("0x8c524635d52bd7b1bd55e062303177a7d916c046"),
  graph_ts_1.Address.fromString("0x8c524635d52bd7b1bd55e062303177a7d916c046")
);
