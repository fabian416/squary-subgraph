"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tradeStrategy = exports.orderFulfillmentMethod = exports.valueToString = exports.isOpenSeaFeeAccount = exports.isERC1155 = exports.isERC721 = exports.isNFT = exports.isMoney = exports.max = exports.min = exports.ERC1155_INTERFACE_IDENTIFIER = exports.ERC721_INTERFACE_IDENTIFIER = exports.WETH_ADDRESS = exports.EXCHANGE_ADDRESS = exports.SECONDS_PER_DAY = exports.BIGDECIMAL_HUNDRED = exports.MANTISSA_FACTOR = exports.BIGDECIMAL_MAX = exports.BIGDECIMAL_ZERO = exports.BIGINT_ZERO = exports.SeaportItemType = exports.SaleStrategy = exports.NftStandard = exports.Network = exports.PROTOCOL_SCHEMA_VERSION = exports.OrderFulfillmentMethods = exports.MethodSignatures = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
var MethodSignatures;
(function (MethodSignatures) {
    MethodSignatures.FULFILL_BASIC_ORDER = "0XFB0F3EE1";
    MethodSignatures.FULFILL_ORDER = "0XB3A34C4C";
    MethodSignatures.FULFILL_ADVANCED_ORDER = "0XE7ACAB24";
    MethodSignatures.FULFILL_AVAILABLE_ORDERS = "0XED98A574";
    MethodSignatures.FULFILL_AVAILABLE_ADVANCED_ORDERS = "0X87201B41";
    MethodSignatures.MATCH_ORDERS = "0XA8174404";
    MethodSignatures.MATCH_ADVANCED_ORDERS = "0X55944A42";
})(MethodSignatures = exports.MethodSignatures || (exports.MethodSignatures = {}));
var OrderFulfillmentMethods;
(function (OrderFulfillmentMethods) {
    OrderFulfillmentMethods.FULFILL_BASIC_ORDER = "FULFILL_BASIC_ORDER";
    OrderFulfillmentMethods.FULFILL_ORDER = "FULFILL_ORDER";
    OrderFulfillmentMethods.FULFILL_ADVANCED_ORDER = "FULFILL_ADVANCED_ORDER";
    OrderFulfillmentMethods.FULFILL_AVAILABLE_ORDERS = "FULFILL_AVAILABLE_ORDERS";
    OrderFulfillmentMethods.FULFILL_AVAILABLE_ADVANCED_ORDERS = "FULFILL_AVAILABLE_ADVANCED_ORDERS";
    OrderFulfillmentMethods.MATCH_ORDERS = "MATCH_ORDERS";
    OrderFulfillmentMethods.MATCH_ADVANCED_ORDERS = "MATCH_ADVANCED_ORDERS";
})(OrderFulfillmentMethods = exports.OrderFulfillmentMethods || (exports.OrderFulfillmentMethods = {}));
exports.PROTOCOL_SCHEMA_VERSION = "1.0.0";
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
// Constants ported from Seaport contracts
// See https://github.com/ProjectOpenSea/seaport/blob/main/contracts/lib/ConsiderationEnums.sol#L116
var SeaportItemType;
(function (SeaportItemType) {
    SeaportItemType.NATIVE = 0;
    SeaportItemType.ERC20 = 1;
    SeaportItemType.ERC721 = 2;
    SeaportItemType.ERC1155 = 3;
    SeaportItemType.ERC721_WITH_CRITERIA = 4;
    SeaportItemType.ERC1155_WITH_CRITERIA = 5;
})(SeaportItemType = exports.SeaportItemType || (exports.SeaportItemType = {}));
exports.BIGINT_ZERO = graph_ts_1.BigInt.zero();
exports.BIGDECIMAL_ZERO = graph_ts_1.BigDecimal.zero();
exports.BIGDECIMAL_MAX = graph_ts_1.BigInt.fromI32(i32.MAX_VALUE).toBigDecimal();
exports.MANTISSA_FACTOR = graph_ts_1.BigInt.fromI32(10)
    .pow(18)
    .toBigDecimal();
exports.BIGDECIMAL_HUNDRED = graph_ts_1.BigInt.fromI32(100).toBigDecimal();
exports.SECONDS_PER_DAY = 24 * 60 * 60;
exports.EXCHANGE_ADDRESS = graph_ts_1.Address.fromString("0x00000000006c3852cbef3e08e8df289169ede581");
exports.WETH_ADDRESS = graph_ts_1.Address.fromString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
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
function isMoney(itemType) {
    return (itemType == SeaportItemType.NATIVE || itemType == SeaportItemType.ERC20);
}
exports.isMoney = isMoney;
function isNFT(itemType) {
    return (itemType == SeaportItemType.ERC721 ||
        itemType == SeaportItemType.ERC1155 ||
        itemType == SeaportItemType.ERC721_WITH_CRITERIA ||
        itemType == SeaportItemType.ERC1155_WITH_CRITERIA);
}
exports.isNFT = isNFT;
function isERC721(itemType) {
    return (itemType == SeaportItemType.ERC721 ||
        itemType == SeaportItemType.ERC721_WITH_CRITERIA);
}
exports.isERC721 = isERC721;
function isERC1155(itemType) {
    return (itemType == SeaportItemType.ERC1155 ||
        itemType == SeaportItemType.ERC1155_WITH_CRITERIA);
}
exports.isERC1155 = isERC1155;
function isOpenSeaFeeAccount(address) {
    const OPENSEA_WALLET_ADDRESS = graph_ts_1.Address.fromString("0x5b3256965e7c3cf26e11fcaf296dfc8807c01073");
    const OPENSEA_FEES_ACCOUNT = graph_ts_1.Address.fromString("0x8de9c5a032463c561423387a9648c5c7bcc5bc90");
    // This can be found https://github.com/web3w/seaport-js/blob/399fa568c04749fd8f96829fa7a6b73d1e440458/src/contracts/index.ts#L30
    const OPENSEA_ETHEREUM_FEE_COLLECTOR = graph_ts_1.Address.fromString("0x0000a26b00c1F0DF003000390027140000fAa719");
    return (address == OPENSEA_WALLET_ADDRESS ||
        address == OPENSEA_FEES_ACCOUNT ||
        address == OPENSEA_ETHEREUM_FEE_COLLECTOR);
}
exports.isOpenSeaFeeAccount = isOpenSeaFeeAccount;
const valueToString = (value) => {
    if (value.kind === graph_ts_1.ethereum.ValueKind.ADDRESS) {
        return value.toAddress().toHexString();
    }
    if (value.kind === graph_ts_1.ethereum.ValueKind.BOOL) {
        return value.toBoolean() ? "True" : "False";
    }
    if (value.kind === graph_ts_1.ethereum.ValueKind.BYTES) {
        return value.toBytes().toHexString();
    }
    if (value.kind === graph_ts_1.ethereum.ValueKind.FIXED_BYTES) {
        return value.toBytes().toHexString();
    }
    if (value.kind === graph_ts_1.ethereum.ValueKind.INT) {
        return value.toBigInt().toString();
    }
    if (value.kind === graph_ts_1.ethereum.ValueKind.STRING) {
        return value.toString();
    }
    if (value.kind === graph_ts_1.ethereum.ValueKind.UINT) {
        return value.toBigInt().toString();
    }
    if (value.kind === graph_ts_1.ethereum.ValueKind.ARRAY) {
        return "Is an array";
    }
    return "value kind not found";
};
exports.valueToString = valueToString;
function orderFulfillmentMethod(event) {
    const methodSignature = event.transaction.input.toHexString().slice(0, 10).toUpperCase();
    let fulfillmentType = null;
    if (methodSignature == MethodSignatures.FULFILL_BASIC_ORDER.toUpperCase()) {
        fulfillmentType = OrderFulfillmentMethods.FULFILL_BASIC_ORDER;
    }
    if (methodSignature == MethodSignatures.FULFILL_ORDER) {
        fulfillmentType = OrderFulfillmentMethods.FULFILL_ORDER;
    }
    if (methodSignature == MethodSignatures.FULFILL_ADVANCED_ORDER) {
        fulfillmentType = OrderFulfillmentMethods.FULFILL_ADVANCED_ORDER;
    }
    if (methodSignature == MethodSignatures.FULFILL_AVAILABLE_ORDERS) {
        fulfillmentType = OrderFulfillmentMethods.FULFILL_AVAILABLE_ORDERS;
    }
    if (methodSignature == MethodSignatures.FULFILL_AVAILABLE_ADVANCED_ORDERS) {
        fulfillmentType = OrderFulfillmentMethods.FULFILL_AVAILABLE_ADVANCED_ORDERS;
    }
    if (methodSignature == MethodSignatures.MATCH_ORDERS) {
        fulfillmentType = OrderFulfillmentMethods.MATCH_ORDERS;
    }
    if (methodSignature == MethodSignatures.MATCH_ADVANCED_ORDERS) {
        fulfillmentType === OrderFulfillmentMethods.MATCH_ADVANCED_ORDERS;
    }
    return fulfillmentType;
}
exports.orderFulfillmentMethod = orderFulfillmentMethod;
function tradeStrategy(event) {
    const methodSignature = event.transaction.input.toHexString().slice(0, 10).toUpperCase();
    let strategy = SaleStrategy.STANDARD_SALE; // default to this
    if (methodSignature == MethodSignatures.FULFILL_BASIC_ORDER) {
        strategy = SaleStrategy.STANDARD_SALE;
    }
    if (methodSignature == MethodSignatures.FULFILL_ORDER) {
        strategy = SaleStrategy.ANY_ITEM_FROM_SET;
    }
    if (methodSignature == MethodSignatures.FULFILL_ADVANCED_ORDER) {
        strategy = SaleStrategy.ANY_ITEM_FROM_SET;
    }
    if (methodSignature == MethodSignatures.FULFILL_AVAILABLE_ORDERS) {
        strategy = SaleStrategy.ANY_ITEM_FROM_SET;
    }
    if (methodSignature == MethodSignatures.FULFILL_AVAILABLE_ADVANCED_ORDERS) {
        strategy = SaleStrategy.ANY_ITEM_FROM_SET;
    }
    if (methodSignature == MethodSignatures.MATCH_ORDERS) {
        strategy = SaleStrategy.ANY_ITEM_FROM_SET;
    }
    if (methodSignature == MethodSignatures.MATCH_ADVANCED_ORDERS) {
        strategy = SaleStrategy.ANY_ITEM_FROM_SET;
    }
    return strategy;
}
exports.tradeStrategy = tradeStrategy;
