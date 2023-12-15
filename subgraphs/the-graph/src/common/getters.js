"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateIndexer = exports.getOrCreateRewardToken = exports.getOrCreateToken = exports.getOrCreateFinancialsDailySnapshot = exports.getOrCreateUsageMetricHourlySnapshot = exports.getOrCreateUsageMetricDailySnapshot = exports.getOrCreateProtocol = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants = __importStar(require("./constants"));
const utils = __importStar(require("./utils"));
const schema_1 = require("../../generated/schema");
const _ERC20_1 = require("../../generated/Staking/_ERC20");
const constants_1 = require("../../protocols/the-graph/src/constants");
const prices_1 = require("../prices");
const constants_2 = require("./constants");
const versions_1 = require("../versions");
const configure_1 = require("../../configurations/configure");
function getOrCreateProtocol() {
    let protocol = schema_1.Protocol.load(configure_1.NetworkConfigs.getControllerAddress());
    if (!protocol) {
        protocol = new schema_1.Protocol(configure_1.NetworkConfigs.getControllerAddress());
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.network = configure_1.NetworkConfigs.getNetwork();
        protocol.type = constants_2.ProtocolType.GENERIC;
        protocol.totalValueLockedUSD = constants_2.BIGDECIMAL_ZERO;
        // Needed?
        protocol.protocolControlledValueUSD = constants_2.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants_2.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_2.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_2.BIGDECIMAL_ZERO;
        protocol.cumulativeUniqueUsers = constants_2.INT_ZERO;
        protocol.totalPoolCount = constants_2.INT_ZERO;
        protocol._totalGRTLocked = constants_2.BIGINT_ZERO;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateProtocol = getOrCreateProtocol;
function getOrCreateUsageMetricDailySnapshot(event) {
    // Number of days since Unix epoch
    const id = event.block.timestamp.toI32() / constants_2.SECONDS_PER_DAY;
    const dayId = id.toString();
    // Create unique id for the day
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(dayId);
    if (!usageMetrics) {
        const protocol = getOrCreateProtocol();
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(dayId);
        usageMetrics.protocol = protocol.id;
        usageMetrics.dailyActiveUsers = constants_2.INT_ZERO;
        usageMetrics.cumulativeUniqueUsers = constants_2.INT_ZERO;
        usageMetrics.dailyTransactionCount = constants_2.INT_ZERO;
        usageMetrics.totalPoolCount = protocol.totalPoolCount;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricDailySnapshot = getOrCreateUsageMetricDailySnapshot;
function getOrCreateUsageMetricHourlySnapshot(event) {
    // Number of days since Unix epoch
    const hour = event.block.timestamp.toI32() / constants_2.SECONDS_PER_HOUR;
    const hourId = hour.toString();
    // Create unique id for the day
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(hourId);
    if (!usageMetrics) {
        const protocol = getOrCreateProtocol();
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(hourId);
        usageMetrics.protocol = protocol.id;
        usageMetrics.hourlyActiveUsers = constants_2.INT_ZERO;
        usageMetrics.cumulativeUniqueUsers = constants_2.INT_ZERO;
        usageMetrics.hourlyTransactionCount = constants_2.INT_ZERO;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricHourlySnapshot = getOrCreateUsageMetricHourlySnapshot;
function getOrCreateFinancialsDailySnapshot(event) {
    // Number of days since Unix epoch
    const dayID = event.block.timestamp.toI32() / constants_2.SECONDS_PER_DAY;
    const id = dayID.toString();
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(id);
    if (!financialMetrics) {
        const protocol = getOrCreateProtocol();
        financialMetrics = new schema_1.FinancialsDailySnapshot(id);
        financialMetrics.protocol = protocol.id;
        financialMetrics.totalValueLockedUSD = constants_2.BIGDECIMAL_ZERO;
        // Needed?
        financialMetrics.protocolControlledValueUSD = constants_2.BIGDECIMAL_ZERO;
        financialMetrics.dailySupplySideRevenueUSD = constants_2.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeSupplySideRevenueUSD = constants_2.BIGDECIMAL_ZERO;
        financialMetrics.dailyProtocolSideRevenueUSD = constants_2.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeProtocolSideRevenueUSD = constants_2.BIGDECIMAL_ZERO;
        financialMetrics.dailyTotalRevenueUSD = constants_2.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeTotalRevenueUSD = constants_2.BIGDECIMAL_ZERO;
        financialMetrics.blockNumber = event.block.number;
        financialMetrics.timestamp = event.block.timestamp;
        financialMetrics.save();
    }
    return financialMetrics;
}
exports.getOrCreateFinancialsDailySnapshot = getOrCreateFinancialsDailySnapshot;
function getOrCreateToken(event, address) {
    let token = schema_1.Token.load(address);
    if (!token) {
        token = new schema_1.Token(address);
        const erc20Contract = _ERC20_1._ERC20.bind(graph_ts_1.Address.fromString(address));
        token.name = utils.readValue(erc20Contract.try_name(), "");
        token.symbol = utils.readValue(erc20Contract.try_symbol(), "");
        token.decimals = utils
            .readValue(erc20Contract.try_decimals(), constants.DEFAULT_DECIMALS_BIGINT)
            .toI32();
        const tokenPrice = (0, prices_1.getUsdPricePerToken)(graph_ts_1.Address.fromString(address));
        token.lastPriceUSD = tokenPrice.usdPrice;
        token.lastPriceBlockNumber = event.block.number;
        token.save();
    }
    if (!token.lastPriceUSD ||
        !token.lastPriceBlockNumber ||
        event.block.number
            .minus(token.lastPriceBlockNumber)
            .gt(constants.ETH_AVERAGE_BLOCK_PER_HOUR)) {
        const tokenPrice = (0, prices_1.getUsdPricePerToken)(graph_ts_1.Address.fromString(address));
        token.lastPriceUSD = tokenPrice.usdPrice;
        token.lastPriceBlockNumber = event.block.number;
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateRewardToken(event, address, RewardTokenType) {
    let rewardToken = schema_1.RewardToken.load(address);
    if (rewardToken == null) {
        const token = getOrCreateToken(event, address);
        rewardToken = new schema_1.RewardToken(RewardTokenType + "-" + address);
        rewardToken.token = token.id;
        rewardToken.type = RewardTokenType;
        rewardToken.save();
    }
    return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
function getOrCreateIndexer(event, indexerAddress) {
    const indexerAddressString = indexerAddress.toHexString();
    let indexer = schema_1._Indexer.load(indexerAddressString);
    if (!indexer) {
        indexer = new schema_1._Indexer(event.address.toHexString());
        indexer.indexingRewardCut = constants_2.BIGINT_ZERO;
        indexer.queryFeeCut = constants_2.BIGINT_ZERO;
        indexer.delegatedTokens = constants_2.BIGINT_ZERO;
        indexer.cooldownBlocks = constants_2.BIGINT_ZERO;
        indexer.save();
    }
    return indexer;
}
exports.getOrCreateIndexer = getOrCreateIndexer;
