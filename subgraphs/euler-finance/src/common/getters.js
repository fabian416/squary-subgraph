"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCutoffValue = exports.getOrCreateAccountStakeAmount = exports.getDeltaStakeAmount = exports.getStartBlockForEpoch = exports.getCurrentEpoch = exports.getSnapshotRates = exports.getOrCreateAssetStatus = exports.getOrCreateInterestRate = exports.getOrCreateLiquidate = exports.getOrCreateRepay = exports.getOrCreateBorrow = exports.getOrCreateWithdraw = exports.getOrCreateDeposit = exports.getOrCreateLendingProtocol = exports.getOrCreateMarket = exports.getOrCreateMarketHourlySnapshot = exports.getOrCreateMarketDailySnapshot = exports.getOrCreateUsageHourlySnapshot = exports.getOrCreateUsageDailySnapshot = exports.getOrCreateFinancials = exports.getOrCreateRewardToken = exports.getOrCreateToken = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const tokens_1 = require("./tokens");
const constants_1 = require("../common/constants");
const versions_1 = require("../versions");
function getOrCreateToken(tokenAddress) {
    let token = schema_1.Token.load(tokenAddress.toHexString());
    // fetch info if null
    if (!token) {
        token = new schema_1.Token(tokenAddress.toHexString());
        token.symbol = (0, tokens_1.getAssetSymbol)(tokenAddress);
        token.name = (0, tokens_1.getAssetName)(tokenAddress);
        token.decimals = (0, tokens_1.getAssetDecimals)(tokenAddress);
        token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
        token.lastPriceBlockNumber = constants_1.BIGINT_ZERO;
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateRewardToken(address, type) {
    const id = `${address.toHexString()}-${type}`;
    let rewardToken = schema_1.RewardToken.load(id);
    if (rewardToken == null) {
        const token = getOrCreateToken(address);
        rewardToken = new schema_1.RewardToken(id);
        rewardToken.token = token.id;
        rewardToken.type = type;
        rewardToken.save();
        return rewardToken;
    }
    return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
///////////////////
//// Snapshots ////
///////////////////
function getOrCreateFinancials(timestamp, blockNumber) {
    // Number of days since Unix epoch
    const days = (timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString();
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(days);
    if (!financialMetrics) {
        const protocol = getOrCreateLendingProtocol();
        financialMetrics = new schema_1.FinancialsDailySnapshot(days);
        financialMetrics.protocol = protocol.id;
        financialMetrics.blockNumber = blockNumber;
        financialMetrics.timestamp = timestamp;
        // update vars
        financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
        financialMetrics.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD;
        financialMetrics.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
        financialMetrics.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD;
        financialMetrics.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
        financialMetrics.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD;
        // update cumul revenues
        financialMetrics.cumulativeSupplySideRevenueUSD = protocol.cumulativeSupplySideRevenueUSD;
        financialMetrics.cumulativeProtocolSideRevenueUSD = protocol.cumulativeProtocolSideRevenueUSD;
        financialMetrics.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD;
        //updated in updateFinancials()
        financialMetrics.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        //daily revenues updated in updateRevenue()
        financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.save();
    }
    return financialMetrics;
}
exports.getOrCreateFinancials = getOrCreateFinancials;
function getOrCreateUsageDailySnapshot(event) {
    // Number of days since Unix epoch
    const id = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    // Create unique id for the day
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(id.toString());
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(id.toString());
        usageMetrics.protocol = constants_1.EULER_ADDRESS;
        usageMetrics.dailyActiveUsers = 0;
        usageMetrics.cumulativeUniqueUsers = 0;
        usageMetrics.dailyTransactionCount = 0;
        usageMetrics.dailyDepositCount = 0;
        usageMetrics.dailyWithdrawCount = 0;
        usageMetrics.dailyBorrowCount = 0;
        usageMetrics.dailyRepayCount = 0;
        usageMetrics.dailyLiquidateCount = 0;
        usageMetrics.totalPoolCount = 0;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageDailySnapshot = getOrCreateUsageDailySnapshot;
function getOrCreateUsageHourlySnapshot(event) {
    // Number of days since Unix epoch
    const hour = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
    // Create unique id for the day
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(hour.toString());
    if (!usageMetrics) {
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(hour.toString());
        usageMetrics.protocol = constants_1.EULER_ADDRESS;
        usageMetrics.hourlyActiveUsers = 0;
        usageMetrics.cumulativeUniqueUsers = 0;
        usageMetrics.hourlyTransactionCount = 0;
        usageMetrics.hourlyDepositCount = 0;
        usageMetrics.hourlyWithdrawCount = 0;
        usageMetrics.hourlyBorrowCount = 0;
        usageMetrics.hourlyRepayCount = 0;
        usageMetrics.hourlyLiquidateCount = 0;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageHourlySnapshot = getOrCreateUsageHourlySnapshot;
/**
 *
 * @param block: ethereum.block
 * @param marketId: id of market
 * @returns MarketDailySnapshot
 */
function getOrCreateMarketDailySnapshot(block, marketId) {
    const days = block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    const snapshotID = `${marketId}-${days.toString()}`;
    let marketMetrics = schema_1.MarketDailySnapshot.load(snapshotID);
    if (!marketMetrics) {
        const market = getOrCreateMarket(marketId);
        marketMetrics = new schema_1.MarketDailySnapshot(snapshotID);
        marketMetrics.protocol = constants_1.EULER_ADDRESS;
        marketMetrics.market = marketId;
        marketMetrics.blockNumber = block.timestamp;
        marketMetrics.timestamp = block.timestamp;
        // update other vars
        marketMetrics.totalValueLockedUSD = market.totalValueLockedUSD;
        marketMetrics.cumulativeSupplySideRevenueUSD = market.cumulativeSupplySideRevenueUSD;
        marketMetrics.cumulativeProtocolSideRevenueUSD = market.cumulativeProtocolSideRevenueUSD;
        marketMetrics.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
        marketMetrics.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
        marketMetrics.cumulativeDepositUSD = market.cumulativeDepositUSD;
        marketMetrics.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
        marketMetrics.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
        marketMetrics.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
        marketMetrics.inputTokenBalance = market.inputTokenBalance;
        marketMetrics.inputTokenPriceUSD = market.inputTokenPriceUSD;
        marketMetrics.outputTokenSupply = market.outputTokenSupply;
        marketMetrics.outputTokenPriceUSD = market.outputTokenPriceUSD;
        marketMetrics.exchangeRate = market.exchangeRate;
        marketMetrics.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
        marketMetrics.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
        marketMetrics.rates = market.rates; //rates snapshoted in updateInterestRates()
        // daily revenue updated in updateRevenue
        marketMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        // updated in updateMarketSnapshots
        marketMetrics.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.save();
    }
    return marketMetrics;
}
exports.getOrCreateMarketDailySnapshot = getOrCreateMarketDailySnapshot;
/**
 *
 * @param block: ethereum.block
 * @param marketId: id of market
 * @returns MarketHourlySnapshot
 */
function getOrCreateMarketHourlySnapshot(block, marketId) {
    const hours = block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
    const snapshotID = `${marketId}- ${hours.toString()}`;
    let marketMetrics = schema_1.MarketHourlySnapshot.load(snapshotID);
    if (!marketMetrics) {
        const market = getOrCreateMarket(marketId);
        marketMetrics = new schema_1.MarketHourlySnapshot(snapshotID);
        marketMetrics.protocol = constants_1.EULER_ADDRESS;
        marketMetrics.market = marketId;
        marketMetrics.blockNumber = block.timestamp;
        marketMetrics.timestamp = block.timestamp;
        // update other vars
        marketMetrics.totalValueLockedUSD = market.totalValueLockedUSD;
        marketMetrics.cumulativeSupplySideRevenueUSD = market.cumulativeSupplySideRevenueUSD;
        marketMetrics.cumulativeProtocolSideRevenueUSD = market.cumulativeProtocolSideRevenueUSD;
        marketMetrics.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
        marketMetrics.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
        marketMetrics.cumulativeDepositUSD = market.cumulativeDepositUSD;
        marketMetrics.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
        marketMetrics.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
        marketMetrics.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
        marketMetrics.inputTokenBalance = market.inputTokenBalance;
        marketMetrics.inputTokenPriceUSD = market.inputTokenPriceUSD;
        marketMetrics.outputTokenSupply = market.outputTokenSupply;
        marketMetrics.outputTokenPriceUSD = market.outputTokenPriceUSD;
        marketMetrics.exchangeRate = market.exchangeRate;
        marketMetrics.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
        marketMetrics.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
        marketMetrics.rates = market.rates; //rates snapshoted in updateInterestRates()
        // daily revenue updated in updateRevenue
        marketMetrics.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        // updated in updateMarketSnapshots
        marketMetrics.hourlyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.hourlyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.hourlyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.hourlyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.hourlyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.save();
    }
    return marketMetrics;
}
exports.getOrCreateMarketHourlySnapshot = getOrCreateMarketHourlySnapshot;
////////////////////////////
///// Lending Specific /////
////////////////////////////
function getOrCreateMarket(id) {
    let market = schema_1.Market.load(id);
    if (!market) {
        const protocol = getOrCreateLendingProtocol();
        market = new schema_1.Market(id);
        market.protocol = protocol.id;
        market.isActive = true;
        market.canUseAsCollateral = false;
        market.canBorrowFrom = true;
        market.maximumLTV = constants_1.BIGDECIMAL_ZERO;
        market.liquidationThreshold = constants_1.BIGDECIMAL_ZERO;
        market.liquidationPenalty = constants_1.BIGDECIMAL_ZERO;
        market.inputToken = id;
        market.rates = [];
        market.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        market.inputTokenBalance = constants_1.BIGINT_ZERO;
        market.inputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        market.outputTokenSupply = constants_1.BIGINT_ZERO;
        market.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        market.createdTimestamp = constants_1.BIGINT_ZERO;
        market.createdBlockNumber = constants_1.BIGINT_ZERO;
        market.exchangeRate = constants_1.BIGDECIMAL_ONE;
        market._totalBorrowBalance = constants_1.BIGINT_ZERO;
        market._dTokenExchangeRate = constants_1.BIGDECIMAL_ONE;
        market._stakedAmount = constants_1.BIGINT_ZERO;
        market._receivingRewards = false;
        // Because of a bug in graph-cli in handling Int field
        // we have to set the default value for all markets
        // https://github.com/graphprotocol/graph-cli/issues/896
        market._pricingType = constants_1.PRICINGTYPE__UNKNOWN;
        market.save();
        // update protocol.totalPoolCount
        protocol.totalPoolCount += 1;
        const marketIDs = protocol._marketIDs;
        marketIDs.push(market.id);
        protocol._marketIDs = marketIDs;
        protocol.save();
    }
    return market;
}
exports.getOrCreateMarket = getOrCreateMarket;
function getOrCreateLendingProtocol() {
    let protocol = schema_1.LendingProtocol.load(constants_1.EULER_ADDRESS);
    if (!protocol) {
        protocol = new schema_1.LendingProtocol(constants_1.EULER_ADDRESS);
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.network = constants_1.Network.MAINNET;
        protocol.type = constants_1.ProtocolType.LENDING;
        protocol.lendingType = constants_1.LendingType.POOLED;
        protocol.riskType = constants_1.RiskType.GLOBAL;
        protocol.cumulativeUniqueUsers = 0;
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.mintedTokens = [];
        protocol.mintedTokenSupplies = [];
        protocol.totalPoolCount = constants_1.INT_ZERO;
        protocol._marketIDs = [];
        protocol._lastUpdateBlockNumber = constants_1.BIGINT_ZERO;
    }
    // ensure to update versions with grafting
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateLendingProtocol = getOrCreateLendingProtocol;
function getOrCreateDeposit(event) {
    const hash = event.transaction.hash.toHexString();
    const logIndex = event.logIndex;
    const id = `${hash}-${logIndex}`;
    let entity = schema_1.Deposit.load(id);
    if (!entity) {
        entity = new schema_1.Deposit(id);
        entity.protocol = constants_1.EULER_ADDRESS;
        entity.hash = hash;
        entity.logIndex = logIndex.toI32();
        entity.timestamp = event.block.timestamp;
        entity.blockNumber = event.block.number;
    }
    return entity;
}
exports.getOrCreateDeposit = getOrCreateDeposit;
function getOrCreateWithdraw(event) {
    const hash = event.transaction.hash.toHexString();
    const logIndex = event.logIndex;
    const id = `${hash}-${logIndex}`;
    let entity = schema_1.Withdraw.load(id);
    if (!entity) {
        entity = new schema_1.Withdraw(id);
        entity.protocol = constants_1.EULER_ADDRESS;
        entity.hash = hash;
        entity.logIndex = logIndex.toI32();
        entity.timestamp = event.block.timestamp;
        entity.blockNumber = event.block.number;
    }
    return entity;
}
exports.getOrCreateWithdraw = getOrCreateWithdraw;
function getOrCreateBorrow(event) {
    const hash = event.transaction.hash.toHexString();
    const logIndex = event.logIndex;
    const id = `${hash}-${logIndex}`;
    let entity = schema_1.Borrow.load(id);
    if (!entity) {
        entity = new schema_1.Borrow(id);
        entity.protocol = constants_1.EULER_ADDRESS;
        entity.hash = hash;
        entity.logIndex = logIndex.toI32();
        entity.timestamp = event.block.timestamp;
        entity.blockNumber = event.block.number;
    }
    return entity;
}
exports.getOrCreateBorrow = getOrCreateBorrow;
function getOrCreateRepay(event) {
    const hash = event.transaction.hash.toHexString();
    const logIndex = event.logIndex;
    const id = `${hash}-${logIndex}`;
    let entity = schema_1.Repay.load(id);
    if (!entity) {
        entity = new schema_1.Repay(id);
        entity.protocol = constants_1.EULER_ADDRESS;
        entity.hash = hash;
        entity.logIndex = logIndex.toI32();
        entity.timestamp = event.block.timestamp;
        entity.blockNumber = event.block.number;
    }
    return entity;
}
exports.getOrCreateRepay = getOrCreateRepay;
function getOrCreateLiquidate(event) {
    const hash = event.transaction.hash.toHexString();
    const logIndex = event.logIndex;
    const id = `${hash}-${logIndex}`;
    let entity = schema_1.Liquidate.load(id);
    if (!entity) {
        entity = new schema_1.Liquidate(id);
        entity.protocol = constants_1.EULER_ADDRESS;
        entity.hash = hash;
        entity.logIndex = logIndex.toI32();
        entity.timestamp = event.block.timestamp;
        entity.blockNumber = event.block.number;
    }
    return entity;
}
exports.getOrCreateLiquidate = getOrCreateLiquidate;
function getOrCreateInterestRate(rateSide, rateType, marketId) {
    const id = rateSide + "-" + rateType + "-" + marketId;
    let rate = schema_1.InterestRate.load(id);
    if (rate == null) {
        rate = new schema_1.InterestRate(id);
        rate.rate = constants_1.BIGDECIMAL_ZERO;
        rate.side = rateSide;
        rate.type = rateType;
        rate.save();
    }
    return rate;
}
exports.getOrCreateInterestRate = getOrCreateInterestRate;
function getOrCreateAssetStatus(id) {
    let assetStatus = schema_1._AssetStatus.load(id);
    if (!assetStatus) {
        assetStatus = new schema_1._AssetStatus(id);
        assetStatus.totalBorrows = constants_1.BIGINT_ZERO;
        assetStatus.totalBalances = constants_1.BIGINT_ZERO;
        assetStatus.reserveFee = graph_ts_1.BigInt.fromString(constants_1.DEFAULT_RESERVE_FEE.truncate(0).toString());
        assetStatus.reserveBalance = constants_1.BIGINT_ZERO; // INITIAL_RESERVES
        assetStatus.interestRate = constants_1.BIGINT_ZERO;
        assetStatus.timestamp = constants_1.BIGINT_ZERO;
        assetStatus.save();
    }
    return assetStatus;
}
exports.getOrCreateAssetStatus = getOrCreateAssetStatus;
// this is needed to prevent snapshot rates from being pointers to the current rate
function getSnapshotRates(rates, timeSuffix) {
    const snapshotRates = [];
    for (let i = 0; i < rates.length; i++) {
        const rate = schema_1.InterestRate.load(rates[i]);
        if (!rate) {
            graph_ts_1.log.error("[getSnapshotRates] rate {} not found, should not happen", [rates[i]]);
            continue;
        }
        // create new snapshot rate
        const snapshotRateId = rates[i].concat("-").concat(timeSuffix);
        const snapshotRate = new schema_1.InterestRate(snapshotRateId);
        snapshotRate.side = rate.side;
        snapshotRate.type = rate.type;
        snapshotRate.rate = rate.rate;
        snapshotRate.save();
        snapshotRates.push(snapshotRateId);
    }
    return snapshotRates;
}
exports.getSnapshotRates = getSnapshotRates;
function getCurrentEpoch(event) {
    const blockNum = event.block.number;
    const epoch = blockNum.minus(constants_1.START_EPOCH_BLOCK).toI32() / constants_1.BLOCKS_PER_EPOCH + constants_1.START_EPOCH;
    if (epoch < constants_1.START_EPOCH || epoch > constants_1.START_EPOCH + constants_1.MAX_EPOCHS) {
        return -1;
    }
    return epoch;
}
exports.getCurrentEpoch = getCurrentEpoch;
function getStartBlockForEpoch(epoch) {
    if (epoch < constants_1.START_EPOCH || epoch > constants_1.START_EPOCH + constants_1.MAX_EPOCHS) {
        return null;
    }
    const startBlock = graph_ts_1.BigInt.fromI32((epoch - constants_1.START_EPOCH) * constants_1.BLOCKS_PER_EPOCH).plus(constants_1.START_EPOCH_BLOCK);
    // according to https://app.euler.finance/gauges, the start block is +1 on top of
    // block specified in https://docs.euler.finance/eul/distribution-1#eul-per-epoch
    // e.g. epoch 17 = 16030000, starting block = 16,030,001 on the guage page
    return startBlock.plus(constants_1.BIGINT_ONE);
}
exports.getStartBlockForEpoch = getStartBlockForEpoch;
function getDeltaStakeAmount(event) {
    const underlying = event.params.underlying.toHexString();
    const account = event.params.who.toHexString();
    const accountStakeAmount = getOrCreateAccountStakeAmount(underlying, account);
    const deltaAmount = event.params.newAmount.minus(accountStakeAmount.stakeAmount);
    accountStakeAmount.stakeAmount = event.params.newAmount;
    accountStakeAmount.save();
    return deltaAmount;
}
exports.getDeltaStakeAmount = getDeltaStakeAmount;
function getOrCreateAccountStakeAmount(underlying, account) {
    const id = `${underlying}-${account}`;
    let accountStakeAmount = schema_1._AccountStakeAmount.load(id);
    if (!accountStakeAmount) {
        accountStakeAmount = new schema_1._AccountStakeAmount(id);
        accountStakeAmount.undlerlying = underlying;
        accountStakeAmount.stakeAmount = constants_1.BIGINT_ZERO;
        accountStakeAmount.save();
    }
    return accountStakeAmount;
}
exports.getOrCreateAccountStakeAmount = getOrCreateAccountStakeAmount;
function getCutoffValue(numArray, top = 10) {
    const startIdx = numArray.length < top ? 0 : numArray.length - top;
    const topNumArray = numArray.sort().slice(startIdx);
    return topNumArray[0];
}
exports.getCutoffValue = getCutoffValue;
