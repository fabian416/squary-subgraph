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
exports.getOrCreateStrategy = exports.getOrCreateVaultsHourlySnapshots = exports.getOrCreateVaultsDailySnapshots = exports.getOrCreateUsageMetricsHourlySnapshot = exports.getOrCreateUsageMetricsDailySnapshot = exports.getOrCreateFinancialDailySnapshots = exports.getOrCreateRewardToken = exports.getOrCreateToken = exports.getOrCreateYieldAggregator = exports.getOrCreateAccount = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const schema_1 = require("../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_2 = require("../../generated/schema");
const templates_1 = require("../../generated/templates");
const ERC20_1 = require("../../generated/Controller/ERC20");
const Strategy_1 = require("../../generated/Controller/Strategy");
const EthereumController_1 = require("../../generated/Controller/EthereumController");
const versions_1 = require("../versions");
function getOrCreateAccount(id) {
    let account = schema_1.Account.load(id);
    if (!account) {
        account = new schema_1.Account(id);
        account.save();
        const protocol = getOrCreateYieldAggregator();
        protocol.cumulativeUniqueUsers += 1;
        protocol.save();
    }
    return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
function getOrCreateYieldAggregator() {
    const protocolId = constants.ETHEREUM_PROTOCOL_ID;
    let protocol = schema_1.YieldAggregator.load(protocolId);
    if (!protocol) {
        protocol = new schema_1.YieldAggregator(protocolId);
        protocol.name = constants.Protocol.NAME;
        protocol.slug = constants.Protocol.SLUG;
        protocol.network = constants.Protocol.NETWORK;
        protocol.type = constants.Protocol.TYPE;
        //////// Quantitative Data ////////
        protocol.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
        protocol.cumulativeUniqueUsers = 0;
        protocol.totalPoolCount = 0;
        protocol._vaultIds = [];
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateYieldAggregator = getOrCreateYieldAggregator;
function getOrCreateToken(address) {
    const tokenId = address.toHexString();
    let token = schema_1.Token.load(tokenId);
    if (!token) {
        token = new schema_1.Token(tokenId);
        const contract = ERC20_1.ERC20.bind(address);
        token.name = utils.readValue(contract.try_name(), "");
        token.symbol = utils.readValue(contract.try_symbol(), "");
        token.decimals = utils
            .readValue(contract.try_decimals(), constants.BIGINT_ZERO)
            .toI32();
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateRewardToken(address) {
    const rewardTokenId = address.toHexString();
    let rewardToken = schema_1.RewardToken.load(rewardTokenId);
    if (!rewardToken) {
        rewardToken = new schema_1.RewardToken(rewardTokenId);
        const token = getOrCreateToken(address);
        rewardToken.token = token.id;
        rewardToken.type = constants.RewardTokenType.DEPOSIT;
        rewardToken.save();
    }
    return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
function getOrCreateFinancialDailySnapshots(block) {
    const id = block.timestamp.toI64() / constants.SECONDS_PER_DAY;
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(id.toString());
    if (!financialMetrics) {
        financialMetrics = new schema_1.FinancialsDailySnapshot(id.toString());
        financialMetrics.protocol = constants.ETHEREUM_PROTOCOL_ID;
        financialMetrics.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
        financialMetrics.dailySupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
        financialMetrics.dailyProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeProtocolSideRevenueUSD =
            constants.BIGDECIMAL_ZERO;
        financialMetrics.dailyTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
        financialMetrics.blockNumber = block.number;
        financialMetrics.timestamp = block.timestamp;
        financialMetrics.save();
    }
    return financialMetrics;
}
exports.getOrCreateFinancialDailySnapshots = getOrCreateFinancialDailySnapshots;
function getOrCreateUsageMetricsDailySnapshot(block) {
    const id = block.timestamp.toI64() / constants.SECONDS_PER_DAY;
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(id.toString());
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(id.toString());
        usageMetrics.protocol = constants.ETHEREUM_PROTOCOL_ID;
        usageMetrics.dailyActiveUsers = 0;
        usageMetrics.cumulativeUniqueUsers = 0;
        usageMetrics.dailyTransactionCount = 0;
        usageMetrics.dailyDepositCount = 0;
        usageMetrics.dailyWithdrawCount = 0;
        const protocol = getOrCreateYieldAggregator();
        usageMetrics.totalPoolCount = protocol.totalPoolCount;
        usageMetrics.blockNumber = block.number;
        usageMetrics.timestamp = block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricsDailySnapshot = getOrCreateUsageMetricsDailySnapshot;
function getOrCreateUsageMetricsHourlySnapshot(block) {
    const metricsID = (block.timestamp.toI64() / constants.SECONDS_PER_HOUR).toString();
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(metricsID);
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(metricsID);
        usageMetrics.protocol = constants.ETHEREUM_PROTOCOL_ID;
        usageMetrics.hourlyActiveUsers = 0;
        usageMetrics.cumulativeUniqueUsers = 0;
        usageMetrics.hourlyTransactionCount = 0;
        usageMetrics.hourlyDepositCount = 0;
        usageMetrics.hourlyWithdrawCount = 0;
        usageMetrics.blockNumber = block.number;
        usageMetrics.timestamp = block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot;
function getOrCreateVaultsDailySnapshots(vault, block) {
    const id = vault.id
        .concat("-")
        .concat((block.timestamp.toI64() / constants.SECONDS_PER_DAY).toString());
    let vaultSnapshots = schema_1.VaultDailySnapshot.load(id);
    if (!vaultSnapshots) {
        vaultSnapshots = new schema_1.VaultDailySnapshot(id);
        vaultSnapshots.protocol = vault.protocol;
        vaultSnapshots.vault = vault.id;
        vaultSnapshots.totalValueLockedUSD = vault.totalValueLockedUSD;
        vaultSnapshots.inputTokenBalance = vault.inputTokenBalance;
        vaultSnapshots.outputTokenSupply = vault.outputTokenSupply
            ? vault.outputTokenSupply
            : constants.BIGINT_ZERO;
        vaultSnapshots.pricePerShare = vault.pricePerShare
            ? vault.pricePerShare
            : constants.BIGDECIMAL_ZERO;
        vaultSnapshots.dailySupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
        vaultSnapshots.cumulativeSupplySideRevenueUSD =
            vault.cumulativeSupplySideRevenueUSD;
        vaultSnapshots.dailyProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
        vaultSnapshots.cumulativeProtocolSideRevenueUSD =
            vault.cumulativeProtocolSideRevenueUSD;
        vaultSnapshots.dailyTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
        vaultSnapshots.cumulativeTotalRevenueUSD = vault.cumulativeTotalRevenueUSD;
        vaultSnapshots.blockNumber = block.number;
        vaultSnapshots.timestamp = block.timestamp;
        vaultSnapshots.save();
    }
    return vaultSnapshots;
}
exports.getOrCreateVaultsDailySnapshots = getOrCreateVaultsDailySnapshots;
function getOrCreateVaultsHourlySnapshots(vault, block) {
    const id = vault.id
        .concat("-")
        .concat((block.timestamp.toI64() / constants.SECONDS_PER_HOUR).toString());
    let vaultSnapshots = schema_1.VaultHourlySnapshot.load(id);
    if (!vaultSnapshots) {
        vaultSnapshots = new schema_1.VaultHourlySnapshot(id);
        vaultSnapshots.protocol = vault.protocol;
        vaultSnapshots.vault = vault.id;
        vaultSnapshots.totalValueLockedUSD = vault.totalValueLockedUSD;
        vaultSnapshots.inputTokenBalance = vault.inputTokenBalance;
        vaultSnapshots.outputTokenSupply = vault.outputTokenSupply
            ? vault.outputTokenSupply
            : constants.BIGINT_ZERO;
        vaultSnapshots.pricePerShare = vault.pricePerShare
            ? vault.pricePerShare
            : constants.BIGDECIMAL_ZERO;
        vaultSnapshots.hourlySupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
        vaultSnapshots.cumulativeSupplySideRevenueUSD =
            vault.cumulativeSupplySideRevenueUSD;
        vaultSnapshots.hourlyProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
        vaultSnapshots.cumulativeProtocolSideRevenueUSD =
            vault.cumulativeProtocolSideRevenueUSD;
        vaultSnapshots.hourlyTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
        vaultSnapshots.cumulativeTotalRevenueUSD = vault.cumulativeTotalRevenueUSD;
        vaultSnapshots.blockNumber = block.number;
        vaultSnapshots.timestamp = block.timestamp;
        vaultSnapshots.save();
    }
    return vaultSnapshots;
}
exports.getOrCreateVaultsHourlySnapshots = getOrCreateVaultsHourlySnapshots;
function getOrCreateStrategy(controllerAddress, vault, _inputAddress, _strategyAddress = null) {
    let strategyAddress;
    const controller = EthereumController_1.EthereumController.bind(controllerAddress);
    if (!_strategyAddress) {
        strategyAddress = utils
            .readValue(controller.try_strategies(_inputAddress), constants.ZERO_ADDRESS)
            .toHexString();
    }
    else {
        strategyAddress = _strategyAddress.toHexString();
    }
    if (strategyAddress == constants.ZERO_ADDRESS_STRING) {
        return strategyAddress;
    }
    const strategy = new schema_2._Strategy(strategyAddress);
    const strategyContract = Strategy_1.Strategy.bind(graph_ts_1.Address.fromString(strategyAddress));
    strategy.vaultAddress = graph_ts_1.Address.fromString(vault.id);
    strategy.inputToken = _inputAddress;
    strategy.save();
    const withdrawalFeeId = utils.prefixID(constants.VaultFeeType.WITHDRAWAL_FEE, vault.id);
    const withdrawalFee = utils.readValue(strategyContract.try_withdrawalFee(), constants.DEFAULT_WITHDRAWAL_FEE);
    utils.createFeeType(withdrawalFeeId, constants.VaultFeeType.WITHDRAWAL_FEE, withdrawalFee);
    const performanceFeeId = utils.prefixID(constants.VaultFeeType.PERFORMANCE_FEE, vault.id);
    const performanceFee = utils.readValue(strategyContract.try_performanceFee(), constants.DEFAULT_PERFORMANCE_FEE);
    utils.createFeeType(performanceFeeId, constants.VaultFeeType.PERFORMANCE_FEE, performanceFee);
    vault.fees = [withdrawalFeeId, performanceFeeId];
    vault._strategy = strategyAddress;
    vault.save();
    templates_1.Strategy.create(graph_ts_1.Address.fromString(strategyAddress));
    return strategyAddress;
}
exports.getOrCreateStrategy = getOrCreateStrategy;
