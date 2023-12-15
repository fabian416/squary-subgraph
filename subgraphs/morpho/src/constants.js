"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAY_BI = exports.RAY = exports.HALF_WAD_BI = exports.WAD_BI = exports.WAD = exports.HALF_UNITS_BI = exports.BASE_UNITS_BI = exports.BASE_UNITS = exports.BLOCKS_PER_YEAR = exports.BLOCKS_PER_DAY = exports.SECONDS_PER_DAY = exports.SECONDS_PER_HOUR = exports.RAY_OFFSET = exports.DEFAULT_DECIMALS = exports.BIGDECIMAL_HUNDRED = exports.BIGDECIMAL_THREE = exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.BIGINT_TEN_TO_EIGHTEENTH = exports.BIGINT_THREE = exports.BIGINT_TWO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.INT_EIGHT = exports.INT_FOUR = exports.INT_TWO = exports.INT_ONE = exports.INT_ZERO = exports.INT_NEGATIVE_ONE = exports.COMPTROLLER_ADDRESS = exports.COMP_ADDRESS = exports.CCOMP_ADDRESS = exports.ETH_USD_PRICE_FEED_ADDRESS = exports.WRAPPED_ETH = exports.C_ETH = exports.MORPHO_COMPOUND_ADDRESS = exports.MORPHO_AAVE_V2_ADDRESS = exports.USDC_TOKEN_ADDRESS = exports.RewardTokenType = exports.RiskType = exports.CollateralizationType = exports.PermissionType = exports.Network = exports.ActivityType = exports.EventType = exports.PositionSide = exports.InterestRateSide = exports.InterestRateType = exports.LendingType = exports.ProtocolType = void 0;
exports.getProtocolData = exports.ProtocolData = exports.ReserveUpdateParams = exports.equalsIgnoreCase = exports.minBN = exports.exponentToBigInt = exports.exponentToBigDecimal = exports.wadToRay = exports.rayToWad = exports.readValue = exports.HALF_WAD_RAY_RATIO = exports.WAD_RAY_RATIO = exports.HALF_RAY_BI = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
var ProtocolType;
(function (ProtocolType) {
    ProtocolType.LENDING = "LENDING";
})(ProtocolType = exports.ProtocolType || (exports.ProtocolType = {}));
var LendingType;
(function (LendingType) {
    LendingType.POOLED = "POOLED";
})(LendingType = exports.LendingType || (exports.LendingType = {}));
var InterestRateType;
(function (InterestRateType) {
    InterestRateType.STABLE = "STABLE";
    InterestRateType.VARIABLE = "VARIABLE";
    InterestRateType.FIXED = "FIXED";
    InterestRateType.P2P = "P2P";
})(InterestRateType = exports.InterestRateType || (exports.InterestRateType = {}));
var InterestRateSide;
(function (InterestRateSide) {
    InterestRateSide.LENDER = "LENDER";
    InterestRateSide.BORROWER = "BORROWER";
})(InterestRateSide = exports.InterestRateSide || (exports.InterestRateSide = {}));
var PositionSide;
(function (PositionSide) {
    PositionSide.COLLATERAL = "COLLATERAL";
    PositionSide.BORROWER = "BORROWER";
})(PositionSide = exports.PositionSide || (exports.PositionSide = {}));
var EventType;
(function (EventType) {
    EventType.DEPOSIT = 1;
    EventType.WITHDRAW = 2;
    EventType.BORROW = 3;
    EventType.REPAY = 4;
    EventType.LIQUIDATOR = 5;
    EventType.LIQUIDATEE = 6;
    EventType.SUPPLIER_POSITION_UPDATE = 7;
    EventType.BORROWER_POSITION_UPDATE = 8;
})(EventType = exports.EventType || (exports.EventType = {}));
var ActivityType;
(function (ActivityType) {
    ActivityType.DAILY = "DAILY";
    ActivityType.HOURLY = "HOURLY";
})(ActivityType = exports.ActivityType || (exports.ActivityType = {}));
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
})(Network = exports.Network || (exports.Network = {}));
var PermissionType;
(function (PermissionType) {
    PermissionType.WHITELIST_ONLY = "WHITELIST_ONLY";
    PermissionType.PERMISSIONED = "PERMISSIONED";
    PermissionType.PERMISSIONLESS = "PERMISSIONLESS";
    PermissionType.ADMIN = "ADMIN";
})(PermissionType = exports.PermissionType || (exports.PermissionType = {}));
var CollateralizationType;
(function (CollateralizationType) {
    CollateralizationType.OVER_COLLATERALIZED = "OVER_COLLATERALIZED";
    CollateralizationType.UNDER_COLLATERALIZED = "UNDER_COLLATERALIZED";
    CollateralizationType.UNCOLLATERALIZED = "UNCOLLATERALIZED";
})(CollateralizationType = exports.CollateralizationType || (exports.CollateralizationType = {}));
var RiskType;
(function (RiskType) {
    RiskType.GLOBAL = "GLOBAL";
    RiskType.ISOLATED = "ISOLATED";
})(RiskType = exports.RiskType || (exports.RiskType = {}));
var RewardTokenType;
(function (RewardTokenType) {
    RewardTokenType.DEPOSIT = "DEPOSIT";
    RewardTokenType.VARIABLE_BORROW = "VARIABLE_BORROW";
    RewardTokenType.STABLE_BORROW = "STABLE_BORROW";
    RewardTokenType.STAKE = "STAKE";
})(RewardTokenType = exports.RewardTokenType || (exports.RewardTokenType = {}));
/////////////////////
///// Addresses /////
/////////////////////
exports.USDC_TOKEN_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // used for Mainnet pricing
exports.MORPHO_AAVE_V2_ADDRESS = graph_ts_1.Address.fromBytes(graph_ts_1.Bytes.fromHexString("0x777777c9898d384f785ee44acfe945efdff5f3e0"));
exports.MORPHO_COMPOUND_ADDRESS = graph_ts_1.Address.fromBytes(graph_ts_1.Bytes.fromHexString("0x8888882f8f843896699869179fb6e4f7e3b58888"));
exports.C_ETH = graph_ts_1.Address.fromBytes(graph_ts_1.Bytes.fromHexString("0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5"));
exports.WRAPPED_ETH = graph_ts_1.Address.fromBytes(graph_ts_1.Bytes.fromHexString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"));
exports.ETH_USD_PRICE_FEED_ADDRESS = graph_ts_1.Address.fromBytes(graph_ts_1.Bytes.fromHexString("0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419"));
exports.CCOMP_ADDRESS = graph_ts_1.Address.fromString("0x70e36f6bf80a52b3b46b3af8e106cc0ed743e8e4");
exports.COMP_ADDRESS = graph_ts_1.Address.fromString("0xc00e94cb662c3520282e6f5717214004a7f26888");
exports.COMPTROLLER_ADDRESS = graph_ts_1.Address.fromString("0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b");
///////////////////
///// Numbers /////
///////////////////
exports.INT_NEGATIVE_ONE = -1;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
exports.INT_EIGHT = 8;
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TWO = graph_ts_1.BigInt.fromI32(2);
exports.BIGINT_THREE = graph_ts_1.BigInt.fromI32(3);
exports.BIGINT_TEN_TO_EIGHTEENTH = graph_ts_1.BigInt.fromString("10").pow(18);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.zero());
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_THREE = new graph_ts_1.BigDecimal(exports.BIGINT_THREE);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(100));
exports.DEFAULT_DECIMALS = 18;
exports.RAY_OFFSET = 27;
exports.SECONDS_PER_HOUR = 60 * 60;
exports.SECONDS_PER_DAY = 60 * 60 * 24;
exports.BLOCKS_PER_DAY = graph_ts_1.BigInt.fromI32(7200);
exports.BLOCKS_PER_YEAR = graph_ts_1.BigInt.fromI32(2632320); // 7200 blocks per day
///////////////////////////////
///// Protocols variables /////
///////////////////////////////
exports.BASE_UNITS = graph_ts_1.BigDecimal.fromString("10000");
exports.BASE_UNITS_BI = graph_ts_1.BigInt.fromString("10000");
exports.HALF_UNITS_BI = exports.BASE_UNITS_BI.div(exports.BIGINT_TWO);
exports.WAD = graph_ts_1.BigDecimal.fromString("1000000000000000000");
exports.WAD_BI = graph_ts_1.BigInt.fromString("1000000000000000000");
exports.HALF_WAD_BI = exports.WAD_BI.div(exports.BIGINT_TWO);
exports.RAY = graph_ts_1.BigDecimal.fromString("1000000000000000000000000000");
exports.RAY_BI = graph_ts_1.BigInt.fromString("1000000000000000000000000000");
exports.HALF_RAY_BI = exports.RAY_BI.div(exports.BIGINT_TWO);
exports.WAD_RAY_RATIO = graph_ts_1.BigInt.fromI32(10).pow(9);
exports.HALF_WAD_RAY_RATIO = exports.WAD_RAY_RATIO.div(exports.BIGINT_TWO);
/////////////////////////////
///// Utility Functions /////
/////////////////////////////
function readValue(callResult, defaultValue) {
    return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
function rayToWad(a) {
    const halfRatio = graph_ts_1.BigInt.fromI32(10).pow(9).div(graph_ts_1.BigInt.fromI32(2));
    return halfRatio.plus(a).div(graph_ts_1.BigInt.fromI32(10).pow(9));
}
exports.rayToWad = rayToWad;
function wadToRay(a) {
    return a.times(graph_ts_1.BigInt.fromI32(10).pow(9));
}
exports.wadToRay = wadToRay;
// n => 10^n
function exponentToBigDecimal(decimals) {
    let result = exports.BIGINT_ONE;
    const ten = graph_ts_1.BigInt.fromI32(10);
    for (let i = 0; i < decimals; i++) {
        result = result.times(ten);
    }
    return result.toBigDecimal();
}
exports.exponentToBigDecimal = exponentToBigDecimal;
function exponentToBigInt(decimals) {
    let result = exports.BIGINT_ONE;
    const ten = graph_ts_1.BigInt.fromI32(10);
    for (let i = 0; i < decimals; i++) {
        result = result.times(ten);
    }
    return result;
}
exports.exponentToBigInt = exponentToBigInt;
function minBN(b1, b2) {
    return b1.gt(b2) ? b2 : b1;
}
exports.minBN = minBN;
function equalsIgnoreCase(a, b) {
    return a.replace("-", "_").toLowerCase() == b.replace("-", "_").toLowerCase();
}
exports.equalsIgnoreCase = equalsIgnoreCase;
///////////////////////////
//// Protocol Specific ////
///////////////////////////
// Morpho Aave specific
class ReserveUpdateParams {
    constructor(event, marketAddress, protocol, reserveSupplyIndex, reserveBorrowIndex, poolSupplyRate, poolBorrowRate) {
        this.event = event;
        this.marketAddress = marketAddress;
        this.protocol = protocol;
        this.reserveSupplyIndex = reserveSupplyIndex;
        this.reserveBorrowIndex = reserveBorrowIndex;
        this.poolSupplyRate = poolSupplyRate;
        this.poolBorrowRate = poolBorrowRate;
    }
}
exports.ReserveUpdateParams = ReserveUpdateParams;
class ProtocolData {
    constructor(protocolID, protocol, name, slug, network, lendingType, lenderPermissionType, borrowerPermissionType, poolCreatorPermissionType, collateralizationType, riskType) {
        this.protocolID = protocolID;
        this.protocol = protocol;
        this.name = name;
        this.slug = slug;
        this.network = network;
        this.lendingType = lendingType;
        this.lenderPermissionType = lenderPermissionType;
        this.borrowerPermissionType = borrowerPermissionType;
        this.poolCreatorPermissionType = poolCreatorPermissionType;
        this.collateralizationType = collateralizationType;
        this.riskType = riskType;
    }
}
exports.ProtocolData = ProtocolData;
function getProtocolData(protocolAddress) {
    if (protocolAddress == exports.MORPHO_AAVE_V2_ADDRESS) {
        return new ProtocolData(graph_ts_1.Bytes.fromHexString(exports.MORPHO_AAVE_V2_ADDRESS.toHexString()), "Morpho", "Morpho Aave V2", "morpho-aave-v2", Network.MAINNET, LendingType.POOLED, PermissionType.PERMISSIONLESS, PermissionType.PERMISSIONLESS, PermissionType.PERMISSIONED, CollateralizationType.UNDER_COLLATERALIZED, RiskType.ISOLATED);
    }
    if (protocolAddress == exports.MORPHO_COMPOUND_ADDRESS) {
        return new ProtocolData(graph_ts_1.Bytes.fromHexString(exports.MORPHO_COMPOUND_ADDRESS.toHexString()), "Morpho", "Morpho Compound", "morpho-compound", Network.MAINNET, LendingType.POOLED, PermissionType.PERMISSIONLESS, PermissionType.PERMISSIONLESS, PermissionType.PERMISSIONED, CollateralizationType.UNDER_COLLATERALIZED, RiskType.ISOLATED);
    }
    graph_ts_1.log.critical("[getProtocolData] Protocol not found: {}", [
        protocolAddress.toHexString(),
    ]);
    return new ProtocolData(graph_ts_1.Bytes.fromHexString("0x0000000"), "", "", "", "", "", "", null, null, null, null);
}
exports.getProtocolData = getProtocolData;
