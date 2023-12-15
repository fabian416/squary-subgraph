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
exports.getOrCreateVaultsDailySnapshots = exports.getOrCreateVaultsHourlySnapshots = exports.getOrCreateLiquidityGauge = exports.getOrCreateAccount = exports.getOrCreateSwap = exports.getOrCreateAuction = exports.getOrCreateVault = exports.getOrCreateUsageMetricsHourlySnapshot = exports.getOrCreateUsageMetricsDailySnapshot = exports.getOrCreateFinancialDailySnapshots = exports.getOrCreateYieldAggregator = exports.getOrCreateRewardToken = exports.getOrCreateFee = exports.getOrCreateToken = void 0;
const schema_1 = require("../../generated/schema");
const utils = __importStar(require("./utils"));
const constants = __importStar(require("./constants"));
const prices_1 = require("../prices");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ERC20_1 = require("../../generated/templates/LiquidityGauge/ERC20");
const templates_1 = require("../../generated/templates");
const LiquidityGaugeV5_1 = require("../../generated/templates/LiquidityGauge/LiquidityGaugeV5");
const RibbonThetaVaultWithSwap_1 = require("../../generated/templates/LiquidityGauge/RibbonThetaVaultWithSwap");
const versions_1 = require("../versions");
function getOrCreateToken(address, block, vault = constants.NULL.TYPE_ADDRESS, isOutputToken = false) {
    let token = schema_1.Token.load(address.toHexString());
    if (!token) {
        token = new schema_1.Token(address.toHexString());
        const contract = ERC20_1.ERC20.bind(address);
        token.name = utils.readValue(contract.try_name(), "");
        token.symbol = utils.readValue(contract.try_symbol(), "");
        token.decimals = utils.readValue(contract.try_decimals(), constants.DEFAULT_DECIMALS.toI32());
        token._vaultId = vault.toHexString();
        token.lastPriceBlockNumber = block.number;
        token._isOutputToken = isOutputToken ? true : false; //Added the ternary condition to remove type error
        if (isOutputToken) {
            token.lastPriceUSD = utils.getOutputTokenPriceUSD(vault, block);
        }
        else {
            token.lastPriceUSD = (0, prices_1.getUsdPricePerToken)(address).usdPrice;
        }
        token.save();
    }
    if (token._vaultId) {
        if (!token._isOutputToken) {
            token.lastPriceUSD = (0, prices_1.getUsdPricePerToken)(address).usdPrice;
            token.lastPriceBlockNumber = block.number;
        }
        if (token._isOutputToken) {
            token.lastPriceUSD = utils.getOutputTokenPriceUSD(vault, block);
            token.lastPriceBlockNumber = block.number;
        }
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateFee(feeId, feeType, feePercentage = constants.BIGDECIMAL_ZERO) {
    let fees = schema_1.VaultFee.load(feeId);
    if (!fees) {
        fees = new schema_1.VaultFee(feeId);
        fees.feeType = feeType;
        fees.feePercentage = feePercentage;
        fees.save();
    }
    return fees;
}
exports.getOrCreateFee = getOrCreateFee;
function getOrCreateRewardToken(tokenAddress, vaultAddress, block, isOToken = false) {
    const tokenId = constants.RewardTokenType.DEPOSIT + "-" + tokenAddress.toHexString();
    let rewardToken = schema_1.RewardToken.load(tokenId);
    if (!rewardToken) {
        rewardToken = new schema_1.RewardToken(tokenId);
        rewardToken.token = getOrCreateToken(tokenAddress, block, vaultAddress, isOToken).id;
        rewardToken.type = constants.RewardTokenType.DEPOSIT;
        rewardToken.save();
    }
    return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
function getOrCreateYieldAggregator() {
    let protocol = schema_1.YieldAggregator.load(constants.PROTOCOL_ID);
    if (!protocol) {
        protocol = new schema_1.YieldAggregator(constants.PROTOCOL_ID);
        protocol.name = constants.PROTOCOL_NAME;
        protocol.slug = constants.PROTOCOL_SLUG;
        protocol.network = graph_ts_1.dataSource.network().toUpperCase().replace("-", "_");
        protocol.type = constants.ProtocolType.YIELD;
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
function getOrCreateFinancialDailySnapshots(block) {
    const id = block.timestamp.toI64() / constants.SECONDS_PER_DAY;
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(id.toString());
    if (!financialMetrics) {
        financialMetrics = new schema_1.FinancialsDailySnapshot(id.toString());
        financialMetrics.protocol = constants.PROTOCOL_ID;
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
    const id = (block.timestamp.toI64() / constants.SECONDS_PER_DAY).toString();
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(id);
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(id);
        usageMetrics.protocol = constants.PROTOCOL_ID;
        usageMetrics.dailyActiveUsers = 0;
        usageMetrics.cumulativeUniqueUsers = 0;
        usageMetrics.dailyTransactionCount = 0;
        usageMetrics.dailyDepositCount = 0;
        usageMetrics.dailyWithdrawCount = 0;
        usageMetrics.blockNumber = block.number;
        usageMetrics.timestamp = block.timestamp;
        const protocol = getOrCreateYieldAggregator();
        usageMetrics.totalPoolCount = protocol.totalPoolCount;
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
        usageMetrics.protocol = constants.PROTOCOL_ID;
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
function getOrCreateVault(vaultAddress, block) {
    let vault = schema_1.Vault.load(vaultAddress.toHexString());
    if (!vault) {
        vault = new schema_1.Vault(vaultAddress.toHexString());
        const vaultContract = RibbonThetaVaultWithSwap_1.RibbonThetaVaultWithSwap.bind(vaultAddress);
        vault.name = utils.readValue(vaultContract.try_name(), "");
        vault.symbol = utils.readValue(vaultContract.try_symbol(), "");
        vault.protocol = constants.PROTOCOL_ID;
        vault._decimals = utils.readValue(vaultContract.try_decimals(), 0);
        vault.depositLimit = utils.readValue(vaultContract.try_cap(), constants.BIGINT_ZERO);
        let asset = utils.readValue(vaultContract.try_asset(), constants.NULL.TYPE_ADDRESS);
        if (asset.equals(constants.NULL.TYPE_ADDRESS)) {
            const vaultParams = vaultContract.try_vaultParams();
            if (!vaultParams.reverted) {
                asset = vaultParams.value.getAsset();
            }
            if (asset.equals(constants.NULL.TYPE_ADDRESS)) {
                const vaultParamsEarnVault = vaultContract.try_vaultParams1();
                if (!vaultParamsEarnVault.reverted) {
                    asset = vaultParamsEarnVault.value.getAsset();
                }
            }
        }
        const inputToken = getOrCreateToken(asset, block, vaultAddress);
        vault.inputToken = inputToken.id;
        vault.inputTokenBalance = constants.BIGINT_ZERO;
        const outputTokenAddress = vaultAddress;
        if (outputTokenAddress.notEqual(constants.NULL.TYPE_ADDRESS)) {
            const outputToken = getOrCreateToken(outputTokenAddress, block, vaultAddress, true);
            vault.outputToken = outputToken.id;
        }
        vault.outputTokenSupply = constants.BIGINT_ZERO;
        vault.outputTokenPriceUSD = constants.BIGDECIMAL_ZERO;
        vault.pricePerShare = constants.BIGDECIMAL_ZERO;
        vault.createdBlockNumber = block.number;
        vault.createdTimestamp = block.timestamp;
        vault.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
        vault.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
        vault.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
        vault.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
        const withdrawlFeeId = utils.enumToPrefix(constants.VaultFeeType.WITHDRAWAL_FEE) +
            vaultAddress.toHexString();
        getOrCreateFee(withdrawlFeeId, constants.VaultFeeType.WITHDRAWAL_FEE);
        const performanceFeeId = utils.enumToPrefix(constants.VaultFeeType.PERFORMANCE_FEE) +
            vaultAddress.toHexString();
        getOrCreateFee(performanceFeeId, constants.VaultFeeType.PERFORMANCE_FEE);
        const managementFeeId = utils.enumToPrefix(constants.VaultFeeType.MANAGEMENT_FEE) +
            vaultAddress.toHexString();
        getOrCreateFee(managementFeeId, constants.VaultFeeType.MANAGEMENT_FEE);
        vault.fees = [withdrawlFeeId, performanceFeeId, managementFeeId];
        utils.updateProtocolAfterNewVault(vaultAddress);
        vault.save();
    }
    return vault;
}
exports.getOrCreateVault = getOrCreateVault;
function getOrCreateAuction(auctionId, vaultAddress = constants.NULL.TYPE_ADDRESS, optionToken = constants.NULL.TYPE_ADDRESS, biddingToken = constants.NULL.TYPE_ADDRESS) {
    let auction = schema_1._Auction.load(auctionId.toString());
    if (!auction) {
        auction = new schema_1._Auction(auctionId.toString());
        auction.optionToken = optionToken.toHexString();
        auction.biddingToken = biddingToken.toHexString();
        auction.vault = vaultAddress.toHexString();
        auction.save();
    }
    return auction;
}
exports.getOrCreateAuction = getOrCreateAuction;
function getOrCreateSwap(swapId, vaultAddress = constants.NULL.TYPE_ADDRESS, optionToken = constants.NULL.TYPE_ADDRESS, biddingToken = constants.NULL.TYPE_ADDRESS) {
    let swapOffer = schema_1._SwapOffer.load(swapId.toString());
    if (!swapOffer) {
        swapOffer = new schema_1._SwapOffer(swapId.toString());
        swapOffer.optionToken = optionToken.toHexString();
        swapOffer.biddingToken = biddingToken.toHexString();
        swapOffer.vault = vaultAddress.toHexString();
        swapOffer.save();
    }
    return swapOffer;
}
exports.getOrCreateSwap = getOrCreateSwap;
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
function getOrCreateLiquidityGauge(gaugeAddress) {
    let gauge = schema_1._LiquidityGauge.load(gaugeAddress.toHexString());
    if (!gauge) {
        gauge = new schema_1._LiquidityGauge(gaugeAddress.toHexString());
        const gaugeContract = LiquidityGaugeV5_1.LiquidityGaugeV5.bind(gaugeAddress);
        gauge.name = utils.readValue(gaugeContract.try_name(), "");
        gauge.decimals = utils.readValue(gaugeContract.try_decimals(), constants.BIGINT_ZERO);
        let vaultAddress = utils.readValue(gaugeContract.try_lp_token(), constants.NULL.TYPE_ADDRESS);
        if (vaultAddress.equals(constants.NULL.TYPE_ADDRESS)) {
            vaultAddress = utils.readValue(gaugeContract.try_stakingToken(), constants.NULL.TYPE_ADDRESS);
        }
        gauge.vault = vaultAddress.toHexString();
        gauge.symbol = utils.readValue(gaugeContract.try_symbol(), "");
        gauge.save();
        templates_1.LiquidityGauge.create(gaugeAddress);
    }
    return gauge;
}
exports.getOrCreateLiquidityGauge = getOrCreateLiquidityGauge;
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
        vaultSnapshots.outputTokenPriceUSD = vault.outputTokenPriceUSD
            ? vault.outputTokenPriceUSD
            : constants.BIGDECIMAL_ZERO;
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
        vaultSnapshots.rewardTokenEmissionsAmount =
            vault.rewardTokenEmissionsAmount;
        vaultSnapshots.rewardTokenEmissionsUSD = vault.rewardTokenEmissionsUSD;
        vaultSnapshots.blockNumber = block.number;
        vaultSnapshots.timestamp = block.timestamp;
        vaultSnapshots.save();
    }
    return vaultSnapshots;
}
exports.getOrCreateVaultsHourlySnapshots = getOrCreateVaultsHourlySnapshots;
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
        vaultSnapshots.outputTokenPriceUSD = vault.outputTokenPriceUSD
            ? vault.outputTokenPriceUSD
            : constants.BIGDECIMAL_ZERO;
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
        vaultSnapshots.rewardTokenEmissionsAmount =
            vault.rewardTokenEmissionsAmount;
        vaultSnapshots.rewardTokenEmissionsUSD = vault.rewardTokenEmissionsUSD;
        vaultSnapshots.save();
    }
    return vaultSnapshots;
}
exports.getOrCreateVaultsDailySnapshots = getOrCreateVaultsDailySnapshots;
