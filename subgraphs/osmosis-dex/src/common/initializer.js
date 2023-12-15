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
exports.msgCreatePoolHandler = exports.getOrCreateLiquidityPoolHourlySnapshots = exports.getOrCreateLiquidityPoolDailySnapshots = exports.getOrCreateUsageMetricsHourlySnapshot = exports.getOrCreateUsageMetricsDailySnapshot = exports.getOrCreateFinancialDailySnapshots = exports.getOrCreateToken = exports.getOrCreateDexAmmProtocol = exports.getOrCreateLiquidityPoolFee = exports.getOrCreateAccount = void 0;
const as_proto_1 = require("as-proto");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants = __importStar(require("../common/constants"));
const utils = __importStar(require("../common/utils"));
const Decoder_1 = require("../modules/Decoder");
const registry_1 = require("./registry");
const versions_1 = require("../versions");
function getOrCreateAccount(id) {
    let account = schema_1.Account.load(id);
    if (!account) {
        account = new schema_1.Account(id);
        account.save();
        const protocol = getOrCreateDexAmmProtocol();
        protocol.cumulativeUniqueUsers += 1;
        protocol.save();
    }
    return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
function getOrCreateLiquidityPoolFee(feeId, feeType, feePercentage = constants.BIGDECIMAL_ZERO) {
    let fees = schema_1.LiquidityPoolFee.load(feeId);
    if (!fees) {
        fees = new schema_1.LiquidityPoolFee(feeId);
        fees.feeType = feeType;
        fees.feePercentage = feePercentage;
        fees.save();
    }
    if (feePercentage.notEqual(constants.BIGDECIMAL_ZERO)) {
        fees.feePercentage = feePercentage;
        fees.save();
    }
    return fees;
}
exports.getOrCreateLiquidityPoolFee = getOrCreateLiquidityPoolFee;
function getOrCreateDexAmmProtocol() {
    const protocolId = constants.Protocol.NAME;
    let protocol = schema_1.DexAmmProtocol.load(protocolId);
    if (!protocol) {
        protocol = new schema_1.DexAmmProtocol(protocolId);
        protocol.name = constants.Protocol.NAME;
        protocol.slug = constants.Protocol.SLUG;
        protocol.network = constants.Network.OSMOSIS;
        protocol.type = constants.ProtocolType.EXCHANGE;
        //////// Quantitative Data ////////
        protocol.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
        protocol.cumulativeVolumeUSD = constants.BIGDECIMAL_ZERO;
        protocol.protocolControlledValueUSD = constants.BIGDECIMAL_ZERO;
        protocol.cumulativeUniqueUsers = 0;
        protocol.totalPoolCount = 0;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateDexAmmProtocol = getOrCreateDexAmmProtocol;
function getOrCreateToken(denom) {
    let token = schema_1.Token.load(denom);
    if (!token) {
        token = new schema_1.Token(denom);
        token.name = denom;
        token.symbol = denom;
        token.decimals = 18;
        token._isStableCoin = false;
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateFinancialDailySnapshots(block) {
    const id = block.header.time.seconds / constants.SECONDS_PER_DAY;
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(id.toString());
    if (!financialMetrics) {
        financialMetrics = new schema_1.FinancialsDailySnapshot(id.toString());
        financialMetrics.protocol = constants.Protocol.NAME;
        const protocol = getOrCreateDexAmmProtocol();
        financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
        financialMetrics.dailyVolumeUSD = constants.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeVolumeUSD = protocol.cumulativeVolumeUSD;
        financialMetrics.dailySupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeSupplySideRevenueUSD =
            protocol.cumulativeSupplySideRevenueUSD;
        financialMetrics.dailyProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeProtocolSideRevenueUSD =
            protocol.cumulativeProtocolSideRevenueUSD;
        financialMetrics.dailyTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeTotalRevenueUSD =
            protocol.cumulativeTotalRevenueUSD;
        financialMetrics.blockNumber = graph_ts_1.BigInt.fromI32(block.header.height);
        financialMetrics.timestamp = graph_ts_1.BigInt.fromI32(block.header.time.seconds);
        financialMetrics.save();
    }
    return financialMetrics;
}
exports.getOrCreateFinancialDailySnapshots = getOrCreateFinancialDailySnapshots;
function getOrCreateUsageMetricsDailySnapshot(block) {
    const id = (block.header.time.seconds / constants.SECONDS_PER_DAY).toString();
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(id);
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(id);
        usageMetrics.protocol = constants.Protocol.NAME;
        usageMetrics.dailyActiveUsers = 0;
        usageMetrics.dailyTransactionCount = 0;
        usageMetrics.dailyDepositCount = 0;
        usageMetrics.dailyWithdrawCount = 0;
        usageMetrics.dailySwapCount = 0;
        const protocol = getOrCreateDexAmmProtocol();
        usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
        usageMetrics.totalPoolCount = protocol.totalPoolCount;
        usageMetrics.blockNumber = graph_ts_1.BigInt.fromI32(block.header.height);
        usageMetrics.timestamp = graph_ts_1.BigInt.fromI32(block.header.time.seconds);
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricsDailySnapshot = getOrCreateUsageMetricsDailySnapshot;
function getOrCreateUsageMetricsHourlySnapshot(block) {
    const metricsID = (block.header.time.seconds / constants.SECONDS_PER_HOUR).toString();
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(metricsID);
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(metricsID);
        usageMetrics.protocol = constants.Protocol.NAME;
        usageMetrics.hourlyActiveUsers = 0;
        usageMetrics.hourlyTransactionCount = 0;
        usageMetrics.hourlyDepositCount = 0;
        usageMetrics.hourlyWithdrawCount = 0;
        usageMetrics.hourlySwapCount = 0;
        const protocol = getOrCreateDexAmmProtocol();
        usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
        usageMetrics.blockNumber = graph_ts_1.BigInt.fromI32(block.header.height);
        usageMetrics.timestamp = graph_ts_1.BigInt.fromI32(block.header.time.seconds);
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot;
function getOrCreateLiquidityPoolDailySnapshots(liquidityPoolId, block) {
    const id = liquidityPoolId
        .concat("-")
        .concat((block.header.time.seconds / constants.SECONDS_PER_DAY).toString());
    let poolSnapshots = schema_1.LiquidityPoolDailySnapshot.load(id);
    if (!poolSnapshots) {
        poolSnapshots = new schema_1.LiquidityPoolDailySnapshot(id);
        poolSnapshots.protocol = constants.Protocol.NAME;
        poolSnapshots.pool = liquidityPoolId;
        const pool = schema_1.LiquidityPool.load(liquidityPoolId);
        if (!pool) {
            return null;
        }
        poolSnapshots.totalValueLockedUSD = pool.totalValueLockedUSD;
        const inputTokenLength = pool.inputTokens.length;
        poolSnapshots.dailyVolumeByTokenAmount = new Array(inputTokenLength).fill(constants.BIGINT_ZERO);
        poolSnapshots.dailyVolumeByTokenUSD = new Array(inputTokenLength).fill(constants.BIGDECIMAL_ZERO);
        poolSnapshots.inputTokenBalances = pool.inputTokenBalances;
        poolSnapshots.inputTokenWeights = pool.inputTokenWeights;
        poolSnapshots.outputTokenSupply = pool.outputTokenSupply;
        poolSnapshots.outputTokenPriceUSD = pool.outputTokenPriceUSD;
        poolSnapshots.rewardTokenEmissionsAmount = null;
        poolSnapshots.rewardTokenEmissionsUSD = null;
        poolSnapshots.stakedOutputTokenAmount = null;
        poolSnapshots.dailySupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
        poolSnapshots.cumulativeSupplySideRevenueUSD =
            pool.cumulativeSupplySideRevenueUSD;
        poolSnapshots.dailyProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
        poolSnapshots.cumulativeProtocolSideRevenueUSD =
            pool.cumulativeProtocolSideRevenueUSD;
        poolSnapshots.dailyTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
        poolSnapshots.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
        poolSnapshots.dailyVolumeUSD = constants.BIGDECIMAL_ZERO;
        poolSnapshots.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
        poolSnapshots.blockNumber = graph_ts_1.BigInt.fromI32(block.header.height);
        poolSnapshots.timestamp = graph_ts_1.BigInt.fromI32(block.header.time.seconds);
        poolSnapshots.save();
    }
    return poolSnapshots;
}
exports.getOrCreateLiquidityPoolDailySnapshots = getOrCreateLiquidityPoolDailySnapshots;
function getOrCreateLiquidityPoolHourlySnapshots(liquidityPoolId, block) {
    const id = liquidityPoolId
        .concat("-")
        .concat((block.header.time.seconds / constants.SECONDS_PER_HOUR).toString());
    let poolSnapshots = schema_1.LiquidityPoolHourlySnapshot.load(id);
    if (!poolSnapshots) {
        poolSnapshots = new schema_1.LiquidityPoolHourlySnapshot(id);
        poolSnapshots.protocol = constants.Protocol.NAME;
        poolSnapshots.pool = liquidityPoolId;
        const pool = schema_1.LiquidityPool.load(liquidityPoolId);
        if (!pool) {
            return null;
        }
        poolSnapshots.totalValueLockedUSD = pool.totalValueLockedUSD;
        const inputTokenLength = pool.inputTokens.length;
        poolSnapshots.hourlyVolumeByTokenAmount = new Array(inputTokenLength).fill(constants.BIGINT_ZERO);
        poolSnapshots.hourlyVolumeByTokenUSD = new Array(inputTokenLength).fill(constants.BIGDECIMAL_ZERO);
        poolSnapshots.inputTokenBalances = pool.inputTokenBalances;
        poolSnapshots.inputTokenWeights = pool.inputTokenWeights;
        poolSnapshots.outputTokenSupply = pool.outputTokenSupply;
        poolSnapshots.outputTokenPriceUSD = pool.outputTokenPriceUSD;
        poolSnapshots.rewardTokenEmissionsAmount = null;
        poolSnapshots.rewardTokenEmissionsUSD = null;
        poolSnapshots.stakedOutputTokenAmount = null;
        poolSnapshots.hourlySupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
        poolSnapshots.cumulativeSupplySideRevenueUSD =
            pool.cumulativeSupplySideRevenueUSD;
        poolSnapshots.hourlyProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
        poolSnapshots.cumulativeProtocolSideRevenueUSD =
            pool.cumulativeProtocolSideRevenueUSD;
        poolSnapshots.hourlyTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
        poolSnapshots.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
        poolSnapshots.hourlyVolumeUSD = constants.BIGDECIMAL_ZERO;
        poolSnapshots.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
        poolSnapshots.blockNumber = graph_ts_1.BigInt.fromI32(block.header.height);
        poolSnapshots.timestamp = graph_ts_1.BigInt.fromI32(block.header.time.seconds);
        poolSnapshots.save();
    }
    return poolSnapshots;
}
exports.getOrCreateLiquidityPoolHourlySnapshots = getOrCreateLiquidityPoolHourlySnapshots;
function msgCreatePoolHandler(msgValue, data) {
    (0, registry_1.initRegistry)();
    const poolId = getPoolId(data.tx.result.events);
    const liquidityPoolId = constants.Protocol.NAME.concat("-").concat(poolId.toString());
    const liquidityPool = new schema_1.LiquidityPool(liquidityPoolId);
    const message = as_proto_1.Protobuf.decode(msgValue, Decoder_1.MsgCreateBalancerPool.decode);
    liquidityPool.name = `${message.poolAssets[0].token.denom} / ${message.poolAssets[1].token.denom}`;
    liquidityPool.symbol = "gamm/pool/".concat(poolId.toString());
    liquidityPool.protocol = constants.Protocol.NAME;
    const inputTokens = [];
    const inputTokenBalances = [];
    const inputTokenWeights = [];
    let tokenWeight = constants.BIGDECIMAL_ZERO;
    let totalPoolWeight = constants.BIGDECIMAL_ZERO;
    for (let i = 0; i < message.poolAssets.length; i++) {
        inputTokens.push(getOrCreateToken(message.poolAssets[i].token.denom).id);
        inputTokenBalances.push(message.poolAssets[i].token.amount);
        tokenWeight = message.poolAssets[i].weight.toBigDecimal();
        inputTokenWeights.push(tokenWeight);
        totalPoolWeight = totalPoolWeight.plus(tokenWeight);
    }
    for (let i = 0; i < inputTokenWeights.length; i++) {
        inputTokenWeights[i] = inputTokenWeights[i]
            .div(totalPoolWeight)
            .times(constants.BIGDECIMAL_HUNDRED);
    }
    liquidityPool.inputTokens = inputTokens;
    liquidityPool.inputTokenBalances = inputTokenBalances;
    liquidityPool.inputTokenWeights = inputTokenWeights;
    liquidityPool.outputToken = getOrCreateToken("PoolToken".concat("-").concat(poolId.toString())).id;
    liquidityPool.outputTokenSupply = constants.BIGINT_ZERO;
    liquidityPool.outputTokenPriceUSD = constants.BIGDECIMAL_ZERO;
    liquidityPool.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    liquidityPool.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    liquidityPool.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    liquidityPool.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    liquidityPool.cumulativeVolumeUSD = constants.BIGDECIMAL_ZERO;
    liquidityPool.rewardTokens = [];
    liquidityPool.rewardTokenEmissionsAmount = [];
    liquidityPool.rewardTokenEmissionsUSD = [];
    liquidityPool.fees = utils
        .getPoolFees(liquidityPoolId.toString(), message.poolParams)
        .stringIds();
    liquidityPool.isSingleSided = false;
    liquidityPool.createdBlockNumber = graph_ts_1.BigInt.fromI32(data.tx.height);
    liquidityPool.createdTimestamp = graph_ts_1.BigInt.fromI32(data.block.header.time.seconds);
    liquidityPool.save();
    utils.updatePoolTVL(liquidityPool, data.block);
    utils.updateProtocolAfterNewLiquidityPool(liquidityPool.totalValueLockedUSD);
    return;
}
exports.msgCreatePoolHandler = msgCreatePoolHandler;
function getPoolId(events) {
    for (let idx = 0; idx < events.length; idx++) {
        if (events[idx].eventType == "pool_created") {
            return graph_ts_1.BigInt.fromString(events[idx].getAttributeValue("pool_id"));
        }
    }
    return constants.BIGINT_ZERO;
}
