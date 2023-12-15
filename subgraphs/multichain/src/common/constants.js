"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNKNOWN_TOKEN_VALUE = exports.INVALID_TOKEN_DECIMALS = exports.CONTEXT_KEY_CROSSCHAINID = exports.CONTEXT_KEY_CHAINID = exports.CONTEXT_KEY_POOLID = exports.INACCURATE_PRICEFEED_TOKENS = exports.NETWORK_BY_ID = exports.ID_BY_NETWORK = exports.MS_PER_YEAR = exports.DAYS_PER_YEAR = exports.MS_PER_DAY = exports.SECONDS_PER_HOUR = exports.SECONDS_PER_DAY = exports.MAX_UINT = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_FIFTY_FIVE = exports.BIGDECIMAL_FOURTY_FIVE = exports.BIGDECIMAL_TWO = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.INT_FOUR = exports.INT_TWO = exports.INT_ONE = exports.INT_ZERO = exports.INT_NEGATIVE_ONE = exports.BIGINT_MAX = exports.BIGINT_TEN_TO_EIGHTEENTH = exports.BIGINT_THOUSAND = exports.BIGINT_HUNDRED = exports.BIGINT_FIFTY_FIVE = exports.BIGINT_FOURTY_FIVE = exports.BIGINT_TWO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.ETH_ADDRESS = exports.ZERO_ADDRESS = exports.ETH_DECIMALS = exports.ETH_SYMBOL = exports.ETH_NAME = exports.BridgeType = exports.TransferType = exports.INVERSE_EVENT_TYPE = exports.EventType = exports.CrosschainTokenType = exports.BridgePoolType = exports.BridgePermissionType = exports.ProtocolType = exports.Network = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = void 0;
exports.SnapshotFrequency = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
////////////////////
///// Versions /////
////////////////////
exports.PROTOCOL_NAME = "Multichain";
exports.PROTOCOL_SLUG = "multichain";
////////////////////////
///// Schema Enums /////
////////////////////////
// The network names corresponding to the Network enum in the schema.
// They also correspond to the ones in `dataSource.network()` after converting to lower case.
// See below for a complete list:
// https://thegraph.com/docs/en/hosted-service/what-is-hosted-service/#supported-networks-on-the-hosted-service
var Network;
(function (Network) {
    Network.ADA = "ADA";
    Network.APT = "APT";
    Network.ARBITRUM_ONE = "ARBITRUM_ONE";
    Network.ARBITRUM_NOVA = "ARBITRUM_NOVA";
    Network.ASTAR = "ASTAR";
    Network.AURORA = "AURORA";
    Network.AVALANCHE = "AVALANCHE";
    Network.BITGERT = "BITGERT";
    Network.BITTORRENT = "BITTORRENT";
    Network.BLOCK = "BLOCK";
    Network.BOBA = "BOBA";
    Network.BOBA_2 = "BOBA_2";
    Network.BSC = "BSC"; // aka BNB Chain
    Network.BTC = "BTC";
    Network.CELO = "CELO";
    Network.CLOVER = "CLOVER";
    Network.COLX = "COLX";
    Network.CONFLUX = "CONFLUX";
    Network.CRONOS = "CRONOS";
    Network.CUBE = "CUBE";
    Network.DFK = "DFK";
    Network.DOGECHAIN = "DOGECHAIN";
    Network.MAINNET = "MAINNET"; // Ethereum mainnet
    Network.ETH_POW = "ETH_POW";
    Network.ETHEREUM_CLASSIC = "ETHEREUM_CLASSIC";
    Network.EVMOS = "EVMOS";
    Network.FANTOM = "FANTOM";
    Network.FITFI = "FITFI";
    Network.FUSE = "FUSE";
    Network.FUSION = "FUSION";
    Network.GODWOKEN_V1 = "GODWOKEN_V1";
    Network.HARMONY = "HARMONY";
    Network.HECO = "HECO";
    Network.HOO = "HOO";
    Network.IOTEX = "IOTEX";
    Network.KARDIA = "KARDIA";
    Network.KAVA = "KAVA";
    Network.KCC = "KCC";
    Network.KLAYTN = "KLAYTN";
    Network.LTC = "LTC";
    Network.MATIC = "MATIC"; // aka Polygon
    Network.METIS = "METIS";
    Network.MILKOMEDA = "MILKOMEDA";
    Network.MILKOMEDA_A1 = "MILKOMEDA_A1";
    Network.MOONBEAM = "MOONBEAM";
    Network.MOONRIVER = "MOONRIVER";
    Network.NAS = "NAS";
    Network.NEAR = "NEAR";
    Network.OASIS = "OASIS";
    Network.OKEXCHAIN = "OKEXCHAIN";
    Network.ONTOLOGY_EVM = "ONTOLOGY_EVM";
    Network.OPTIMISM = "OPTIMISM";
    Network.REI = "REI";
    Network.RONIN = "RONIN";
    Network.RSK = "RSK";
    Network.SHIDEN = "SHIDEN";
    Network.SMARTBCH = "SMARTBCH";
    Network.SOL = "SOL";
    Network.SYSCOIN = "SYSCOIN";
    Network.TELOS = "TELOS";
    Network.TERRA = "TERRA";
    Network.THUNDERCORE = "THUNDERCORE";
    Network.TOMOCHAIN = "TOMOCHAIN";
    Network.VELAS = "VELAS";
    Network.WEMIX = "WEMIX";
    Network.XDAI = "XDAI"; // aka Gnosis Chain
    Network.XRP = "XRP";
    Network.UNKNOWN_NETWORK = "UNKNOWN_NETWORK";
})(Network = exports.Network || (exports.Network = {}));
var ProtocolType;
(function (ProtocolType) {
    ProtocolType.EXCHANGE = "EXCHANGE";
    ProtocolType.LENDING = "LENDING";
    ProtocolType.YIELD = "YIELD";
    ProtocolType.BRIDGE = "BRIDGE";
    ProtocolType.GENERIC = "GENERIC";
})(ProtocolType = exports.ProtocolType || (exports.ProtocolType = {}));
var BridgePermissionType;
(function (BridgePermissionType) {
    BridgePermissionType.PERMISSIONLESS = "PERMISSIONLESS";
    BridgePermissionType.WHITELIST = "WHITELIST";
    BridgePermissionType.PRIVATE = "PRIVATE";
})(BridgePermissionType = exports.BridgePermissionType || (exports.BridgePermissionType = {}));
var BridgePoolType;
(function (BridgePoolType) {
    BridgePoolType.LOCK_RELEASE = "LOCK_RELEASE";
    BridgePoolType.BURN_MINT = "BURN_MINT";
    BridgePoolType.LIQUIDITY = "LIQUIDITY";
})(BridgePoolType = exports.BridgePoolType || (exports.BridgePoolType = {}));
var CrosschainTokenType;
(function (CrosschainTokenType) {
    CrosschainTokenType.WRAPPED = "WRAPPED";
    CrosschainTokenType.CANONICAL = "CANONICAL";
})(CrosschainTokenType = exports.CrosschainTokenType || (exports.CrosschainTokenType = {}));
var EventType;
(function (EventType) {
    EventType.DEPOSIT = "DEPOSIT";
    EventType.WITHDRAW = "WITHDRAW";
    EventType.TRANSFER_IN = "TRANSFER_IN";
    EventType.TRANSFER_OUT = "TRANSFER_OUT";
    EventType.MESSAGE_IN = "MESSAGE_IN";
    EventType.MESSAGE_OUT = "MESSAGE_OUT";
})(EventType = exports.EventType || (exports.EventType = {}));
exports.INVERSE_EVENT_TYPE = new graph_ts_1.TypedMap();
exports.INVERSE_EVENT_TYPE.set(EventType.DEPOSIT, EventType.WITHDRAW);
exports.INVERSE_EVENT_TYPE.set(EventType.WITHDRAW, EventType.DEPOSIT);
exports.INVERSE_EVENT_TYPE.set(EventType.TRANSFER_IN, EventType.TRANSFER_OUT);
exports.INVERSE_EVENT_TYPE.set(EventType.TRANSFER_OUT, EventType.TRANSFER_IN);
exports.INVERSE_EVENT_TYPE.set(EventType.MESSAGE_IN, EventType.MESSAGE_OUT);
exports.INVERSE_EVENT_TYPE.set(EventType.MESSAGE_OUT, EventType.MESSAGE_IN);
var TransferType;
(function (TransferType) {
    TransferType.MINT = "MINT";
    TransferType.BURN = "BURN";
    TransferType.LOCK = "LOCK";
    TransferType.RELEASE = "RELEASE";
})(TransferType = exports.TransferType || (exports.TransferType = {}));
var BridgeType;
(function (BridgeType) {
    BridgeType.BRIDGE = "BRIDGE";
    BridgeType.ROUTER = "ROUTER";
})(BridgeType = exports.BridgeType || (exports.BridgeType = {}));
////////////////////
///// Ethereum /////
////////////////////
exports.ETH_NAME = "Ether";
exports.ETH_SYMBOL = "ETH";
exports.ETH_DECIMALS = 18;
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
////////////////////////
///// Type Helpers /////
////////////////////////
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TWO = graph_ts_1.BigInt.fromI32(2);
exports.BIGINT_FOURTY_FIVE = graph_ts_1.BigInt.fromI32(45);
exports.BIGINT_FIFTY_FIVE = graph_ts_1.BigInt.fromI32(55);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGINT_THOUSAND = graph_ts_1.BigInt.fromI32(1000);
exports.BIGINT_TEN_TO_EIGHTEENTH = graph_ts_1.BigInt.fromString("10").pow(18);
exports.BIGINT_MAX = graph_ts_1.BigInt.fromString("115792089237316195423570985008687907853269984665640564039457584007913129639935");
exports.INT_NEGATIVE_ONE = -1;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_TWO = new graph_ts_1.BigDecimal(exports.BIGINT_TWO);
exports.BIGDECIMAL_FOURTY_FIVE = new graph_ts_1.BigDecimal(exports.BIGINT_FOURTY_FIVE);
exports.BIGDECIMAL_FIFTY_FIVE = new graph_ts_1.BigDecimal(exports.BIGINT_FIFTY_FIVE);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(exports.BIGINT_HUNDRED);
exports.MAX_UINT = graph_ts_1.BigInt.fromI32(2).times(graph_ts_1.BigInt.fromI32(255));
/////////////////////
///// Date/Time /////
/////////////////////
exports.SECONDS_PER_DAY = 60 * 60 * 24; // 86400
exports.SECONDS_PER_HOUR = 60 * 60; // 3600
exports.MS_PER_DAY = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000));
exports.DAYS_PER_YEAR = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(365));
exports.MS_PER_YEAR = exports.DAYS_PER_YEAR.times(new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(24 * 60 * 60 * 1000)));
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
exports.ID_BY_NETWORK = new graph_ts_1.TypedMap();
exports.ID_BY_NETWORK.set(Network.ARBITRUM_ONE, graph_ts_1.BigInt.fromI32(42161));
exports.ID_BY_NETWORK.set(Network.AVALANCHE, graph_ts_1.BigInt.fromI32(43114));
exports.ID_BY_NETWORK.set(Network.BSC, graph_ts_1.BigInt.fromI32(56));
exports.ID_BY_NETWORK.set(Network.CELO, graph_ts_1.BigInt.fromI32(42220));
exports.ID_BY_NETWORK.set(Network.MAINNET, graph_ts_1.BigInt.fromI32(1));
exports.ID_BY_NETWORK.set(Network.FANTOM, graph_ts_1.BigInt.fromI32(250));
exports.ID_BY_NETWORK.set(Network.XDAI, graph_ts_1.BigInt.fromI32(100));
exports.ID_BY_NETWORK.set(Network.OPTIMISM, graph_ts_1.BigInt.fromI32(10));
exports.ID_BY_NETWORK.set(Network.MATIC, graph_ts_1.BigInt.fromI32(137));
exports.NETWORK_BY_ID = new graph_ts_1.TypedMap();
exports.NETWORK_BY_ID.set("1", Network.MAINNET);
exports.NETWORK_BY_ID.set("10", Network.OPTIMISM);
exports.NETWORK_BY_ID.set("24", Network.KARDIA);
exports.NETWORK_BY_ID.set("25", Network.CRONOS);
exports.NETWORK_BY_ID.set("30", Network.RSK);
exports.NETWORK_BY_ID.set("40", Network.TELOS);
exports.NETWORK_BY_ID.set("56", Network.BSC);
exports.NETWORK_BY_ID.set("57", Network.SYSCOIN);
exports.NETWORK_BY_ID.set("58", Network.ONTOLOGY_EVM);
exports.NETWORK_BY_ID.set("61", Network.ETHEREUM_CLASSIC);
exports.NETWORK_BY_ID.set("66", Network.OKEXCHAIN);
exports.NETWORK_BY_ID.set("70", Network.HOO);
exports.NETWORK_BY_ID.set("88", Network.TOMOCHAIN);
exports.NETWORK_BY_ID.set("100", Network.XDAI);
exports.NETWORK_BY_ID.set("106", Network.VELAS);
exports.NETWORK_BY_ID.set("108", Network.THUNDERCORE);
exports.NETWORK_BY_ID.set("122", Network.FUSE);
exports.NETWORK_BY_ID.set("128", Network.HECO);
exports.NETWORK_BY_ID.set("137", Network.MATIC);
exports.NETWORK_BY_ID.set("199", Network.BITTORRENT);
exports.NETWORK_BY_ID.set("250", Network.FANTOM);
exports.NETWORK_BY_ID.set("288", Network.BOBA);
exports.NETWORK_BY_ID.set("321", Network.KCC);
exports.NETWORK_BY_ID.set("336", Network.SHIDEN);
exports.NETWORK_BY_ID.set("592", Network.ASTAR);
exports.NETWORK_BY_ID.set("1024", Network.CLOVER);
exports.NETWORK_BY_ID.set("1030", Network.CONFLUX);
exports.NETWORK_BY_ID.set("1088", Network.METIS);
exports.NETWORK_BY_ID.set("1111", Network.WEMIX);
exports.NETWORK_BY_ID.set("1234", Network.FITFI);
exports.NETWORK_BY_ID.set("1284", Network.MOONBEAM);
exports.NETWORK_BY_ID.set("1285", Network.MOONRIVER);
exports.NETWORK_BY_ID.set("1818", Network.CUBE);
exports.NETWORK_BY_ID.set("1294", Network.BOBA);
exports.NETWORK_BY_ID.set("2000", Network.DOGECHAIN);
exports.NETWORK_BY_ID.set("2001", Network.MILKOMEDA);
exports.NETWORK_BY_ID.set("2002", Network.MILKOMEDA_A1);
exports.NETWORK_BY_ID.set("2020", Network.RONIN);
exports.NETWORK_BY_ID.set("2222", Network.KAVA);
exports.NETWORK_BY_ID.set("4689", Network.IOTEX);
exports.NETWORK_BY_ID.set("8217", Network.KLAYTN);
exports.NETWORK_BY_ID.set("9001", Network.EVMOS);
exports.NETWORK_BY_ID.set("10000", Network.SMARTBCH);
exports.NETWORK_BY_ID.set("10001", Network.ETH_POW);
exports.NETWORK_BY_ID.set("32659", Network.FUSION);
exports.NETWORK_BY_ID.set("42161", Network.ARBITRUM_ONE);
exports.NETWORK_BY_ID.set("42170", Network.ARBITRUM_NOVA);
exports.NETWORK_BY_ID.set("42220", Network.CELO);
exports.NETWORK_BY_ID.set("42262", Network.OASIS);
exports.NETWORK_BY_ID.set("43114", Network.AVALANCHE);
exports.NETWORK_BY_ID.set("47805", Network.REI);
exports.NETWORK_BY_ID.set("53935", Network.DFK);
exports.NETWORK_BY_ID.set("71402", Network.GODWOKEN_V1);
exports.NETWORK_BY_ID.set("1313161554", Network.AURORA);
exports.NETWORK_BY_ID.set("1666600000", Network.HARMONY);
exports.NETWORK_BY_ID.set("32520", Network.BITGERT);
exports.NETWORK_BY_ID.set("1000005002307", Network.LTC);
exports.NETWORK_BY_ID.set("1000004346947", Network.BTC);
exports.NETWORK_BY_ID.set("1001129270360", Network.COLX);
exports.NETWORK_BY_ID.set("1284748104523", Network.BLOCK);
exports.NETWORK_BY_ID.set("1001313161554", Network.NEAR);
exports.NETWORK_BY_ID.set("1000005788240", Network.XRP);
exports.NETWORK_BY_ID.set("1000004280404", Network.APT);
exports.NETWORK_BY_ID.set("1000005128531", Network.NAS);
exports.NETWORK_BY_ID.set("1361940275777", Network.TERRA);
exports.NETWORK_BY_ID.set("1000004277313", Network.ADA);
exports.NETWORK_BY_ID.set("1000005459788", Network.SOL);
exports.NETWORK_BY_ID.set("0", Network.UNKNOWN_NETWORK);
const MAINNET_INACCURATE_PRICEFEED_TOKENS = [
    graph_ts_1.Address.fromString("0x86a298581388bc199e61bfecdca8ea22cf6c0da3"),
    graph_ts_1.Address.fromString("0x9b2f9f348425b1ef54c232f87ee7d4d570c1b552"),
    graph_ts_1.Address.fromString("0x015cea338ce68bd912b3c704620c6000ee9f4ab9"), // anyGCAKE
];
const BSC_INACCURATE_PRICEFEED_TOKENS = [
    graph_ts_1.Address.fromString("0x98d939325313ae0129c377b3eabdf39188b38760"),
    graph_ts_1.Address.fromString("0x1441e091e1247e6e6990ccb2c27169204fb04aa9"), // anyXMETA
];
const MATIC_INACCURATE_PRICEFEED_TOKENS = [
    graph_ts_1.Address.fromString("0xd4d4139b2f64b0367f522732b27be7701d36e187"), // anyHND
];
const AVALANCHE_INACCURATE_PRICEFEED_TOKENS = [
    graph_ts_1.Address.fromString("0xeaf8190fd5042ec3144184241fd405bb1dec59e8"),
    graph_ts_1.Address.fromString("0xa2f9a3323e3664b9684fbc9fb64861dc493085df"),
    graph_ts_1.Address.fromString("0x19f36bbb75cfb2969486d46a95e37c74a90c7cbb"), // anyPOPS
];
exports.INACCURATE_PRICEFEED_TOKENS = new graph_ts_1.TypedMap();
exports.INACCURATE_PRICEFEED_TOKENS.set(Network.ARBITRUM_ONE, []);
exports.INACCURATE_PRICEFEED_TOKENS.set(Network.AURORA, []);
exports.INACCURATE_PRICEFEED_TOKENS.set(Network.AVALANCHE, AVALANCHE_INACCURATE_PRICEFEED_TOKENS);
exports.INACCURATE_PRICEFEED_TOKENS.set(Network.BOBA, []);
exports.INACCURATE_PRICEFEED_TOKENS.set(Network.BSC, BSC_INACCURATE_PRICEFEED_TOKENS);
exports.INACCURATE_PRICEFEED_TOKENS.set(Network.CELO, []);
exports.INACCURATE_PRICEFEED_TOKENS.set(Network.CRONOS, []);
exports.INACCURATE_PRICEFEED_TOKENS.set(Network.FANTOM, []);
exports.INACCURATE_PRICEFEED_TOKENS.set(Network.FUSE, []);
exports.INACCURATE_PRICEFEED_TOKENS.set(Network.XDAI, []);
exports.INACCURATE_PRICEFEED_TOKENS.set(Network.HARMONY, []);
exports.INACCURATE_PRICEFEED_TOKENS.set(Network.MAINNET, MAINNET_INACCURATE_PRICEFEED_TOKENS);
exports.INACCURATE_PRICEFEED_TOKENS.set(Network.MOONBEAM, []);
exports.INACCURATE_PRICEFEED_TOKENS.set(Network.MOONRIVER, []);
exports.INACCURATE_PRICEFEED_TOKENS.set(Network.OPTIMISM, []);
exports.INACCURATE_PRICEFEED_TOKENS.set(Network.MATIC, MATIC_INACCURATE_PRICEFEED_TOKENS);
exports.INACCURATE_PRICEFEED_TOKENS.set(Network.UNKNOWN_NETWORK, []);
exports.CONTEXT_KEY_POOLID = "poolID";
exports.CONTEXT_KEY_CHAINID = "chainID";
exports.CONTEXT_KEY_CROSSCHAINID = "crosschainID";
exports.INVALID_TOKEN_DECIMALS = 0;
exports.UNKNOWN_TOKEN_VALUE = "unknown";
var SnapshotFrequency;
(function (SnapshotFrequency) {
    SnapshotFrequency.DAILY = "daily";
    SnapshotFrequency.HOURLY = "hourly";
})(SnapshotFrequency = exports.SnapshotFrequency || (exports.SnapshotFrequency = {}));
