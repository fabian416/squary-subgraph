"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGFIPrice = exports.getNewPosition = exports.getOpenPosition = exports.getNextPositionCount = exports.getOrCreatePositionCounter = exports.getSnapshotRates = exports.getOrCreateAccount = exports.getOrCreateUser = exports.getOrCreateInterestRate = exports.getOrCreateFinancialsDailySnapshot = exports.getOrCreateUsageMetricsHourlySnapshot = exports.getOrCreateUsageMetricsDailySnapshot = exports.getOrCreateMarketHourlySnapshot = exports.getOrCreateMarketDailySnapshot = exports.getOrCreateMarket = exports.getOrCreateProtocol = exports.getOrCreateRewardToken = exports.getOrCreateToken = exports.getOrCreatePoolToken = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ERC20_1 = require("../../generated/GoldfinchFactory/ERC20");
const schema_1 = require("../../generated/schema");
const constants_1 = require("./constants");
const TranchedPool_1 = require("../../generated/templates/TranchedPool/TranchedPool");
const UniswapV2Pair_1 = require("../../generated/BackerRewards/UniswapV2Pair");
const utils_1 = require("./utils");
const versions_1 = require("../versions");
function getOrCreatePoolToken(tokenId, marketId = null) {
    let poolToken = schema_1._PoolTokenStore.load(tokenId);
    if (!poolToken) {
        poolToken = new schema_1._PoolTokenStore(tokenId);
        poolToken.market = marketId;
        poolToken.save();
    }
    return poolToken;
}
exports.getOrCreatePoolToken = getOrCreatePoolToken;
function getOrCreateToken(tokenAddr) {
    const tokenId = tokenAddr.toHexString();
    let token = schema_1.Token.load(tokenId);
    if (token == null) {
        token = new schema_1.Token(tokenId);
        // GFI contract was deployed after senior pool; the following call will fail
        // when invoked by senior_pool.handleDepositMade
        if (tokenId == constants_1.GFI_ADDRESS) {
            token.name = "Goldfinch";
            token.symbol = "GFI";
            token.decimals = 18;
        }
        else {
            graph_ts_1.log.info("[getOrCreateToken]tokenAddr={}", [tokenId]);
            const contract = ERC20_1.ERC20.bind(tokenAddr);
            token.name = contract.name();
            token.symbol = contract.symbol();
            token.decimals = contract.decimals();
        }
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateRewardToken(tokenAddr, type) {
    const tokenId = `${type}-${tokenAddr.toHexString()}`;
    let rewardToken = schema_1.RewardToken.load(tokenId);
    if (!rewardToken) {
        const token = getOrCreateToken(tokenAddr);
        rewardToken = new schema_1.RewardToken(tokenId);
        rewardToken.token = token.id;
        rewardToken.type = type;
        rewardToken.save();
    }
    return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
function getOrCreateProtocol() {
    let protocol = schema_1.LendingProtocol.load(constants_1.FACTORY_ADDRESS);
    if (!protocol) {
        protocol = new schema_1.LendingProtocol(constants_1.FACTORY_ADDRESS);
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.network = constants_1.Network.MAINNET;
        protocol.type = constants_1.ProtocolType.LENDING;
        protocol.lendingType = constants_1.LendingType.POOLED;
        protocol.riskType = constants_1.RiskType.GLOBAL;
        protocol.mintedTokens = [];
        protocol.mintedTokenSupplies = [];
        ////// quantitative data //////
        protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
        protocol.cumulativeUniqueDepositors = constants_1.INT_ZERO;
        protocol.cumulativeUniqueBorrowers = constants_1.INT_ZERO;
        protocol.cumulativeUniqueLiquidators = constants_1.INT_ZERO;
        protocol.cumulativeUniqueLiquidatees = constants_1.INT_ZERO;
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalPoolCount = constants_1.INT_ZERO;
        protocol.openPositionCount = constants_1.INT_ZERO;
        protocol.cumulativePositionCount = constants_1.INT_ZERO;
        protocol._marketIDs = [];
    }
    // ensure versions are updated even when grafting
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    return protocol;
}
exports.getOrCreateProtocol = getOrCreateProtocol;
function getOrCreateMarket(marketId, event) {
    // marketID = poolAddr
    // all pool/market have the same underlying USDC
    // with one borrower and multiple lenders
    let market = schema_1.Market.load(marketId);
    if (market == null) {
        let name;
        if (marketId != constants_1.SENIOR_POOL_ADDRESS) {
            const poolContract = TranchedPool_1.TranchedPool.bind(graph_ts_1.Address.fromString(marketId));
            name = poolContract._name;
        }
        else {
            name = "Senior Pool";
        }
        const protocol = getOrCreateProtocol();
        market = new schema_1.Market(marketId);
        market.protocol = protocol.id;
        market.name = name;
        market.isActive = false;
        market.canUseAsCollateral = false;
        market.canBorrowFrom = true;
        // maximumLTV = 0 as Goldfinch borrowing is undercollateralized
        // to KYC'ed borrowers
        market.maximumLTV = constants_1.BIGDECIMAL_ZERO;
        // no liquidations, so liquidationThreshold and liquidationPenalty set to 0
        market.liquidationThreshold = constants_1.BIGDECIMAL_ZERO;
        market.liquidationPenalty = constants_1.BIGDECIMAL_ZERO;
        market.inputToken = constants_1.USDC_ADDRESS;
        market.rates = [];
        market.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        market.inputTokenBalance = constants_1.BIGINT_ZERO;
        market.inputTokenPriceUSD = constants_1.BIGDECIMAL_ONE; //USDC
        market.outputTokenSupply = constants_1.BIGINT_ZERO;
        market.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        market.exchangeRate = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.rewardTokenEmissionsAmount = [];
        market.rewardTokenEmissionsUSD = [];
        market.positionCount = 0;
        market.openPositionCount = 0;
        market.closedPositionCount = 0;
        market.lendingPositionCount = 0;
        market.borrowingPositionCount = 0;
        market.createdTimestamp = event.block.timestamp;
        market.createdBlockNumber = event.block.number;
        market._lenderInterestAmountUSD = constants_1.BIGDECIMAL_ZERO;
        market._borrowerInterestAmountUSD = constants_1.BIGDECIMAL_ZERO;
        market._membershipRewardEligibleAmount = constants_1.BIGINT_ZERO;
        market._membershipRewardNextEpochAmount = constants_1.BIGINT_ZERO;
        market.save();
        let marketIDs = protocol._marketIDs;
        marketIDs = marketIDs.concat([market.id]);
        protocol._marketIDs = marketIDs;
        protocol.save();
    }
    return market;
}
exports.getOrCreateMarket = getOrCreateMarket;
function getOrCreateMarketDailySnapshot(marketId, event) {
    const days = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    const daysStr = days.toString();
    const id = (0, utils_1.prefixID)(marketId, daysStr);
    let marketMetrics = schema_1.MarketDailySnapshot.load(id);
    if (marketMetrics == null) {
        marketMetrics = new schema_1.MarketDailySnapshot(id);
        const market = getOrCreateMarket(marketId, event);
        marketMetrics.protocol = constants_1.FACTORY_ADDRESS;
        marketMetrics.market = marketId;
        marketMetrics.blockNumber = event.block.number;
        marketMetrics.timestamp = event.block.timestamp;
        marketMetrics.rates = market.rates;
        marketMetrics.totalValueLockedUSD = market.totalValueLockedUSD;
        marketMetrics.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
        marketMetrics.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeDepositUSD = market.cumulativeDepositUSD;
        marketMetrics.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
        marketMetrics.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
        marketMetrics.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
        marketMetrics.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.inputTokenBalance = market.inputTokenBalance;
        marketMetrics.inputTokenPriceUSD = market.inputTokenPriceUSD;
        marketMetrics.outputTokenSupply = market.outputTokenSupply;
        marketMetrics.outputTokenPriceUSD = market.outputTokenPriceUSD;
        marketMetrics.exchangeRate = market.exchangeRate;
        marketMetrics.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
        marketMetrics.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
        marketMetrics.cumulativeSupplySideRevenueUSD =
            market.cumulativeSupplySideRevenueUSD;
        marketMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeProtocolSideRevenueUSD =
            market.cumulativeProtocolSideRevenueUSD;
        marketMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
        marketMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.save();
    }
    return marketMetrics;
}
exports.getOrCreateMarketDailySnapshot = getOrCreateMarketDailySnapshot;
function getOrCreateMarketHourlySnapshot(marketId, event) {
    // Hours since Unix epoch time
    const hours = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
    const hoursStr = hours.toString();
    const id = (0, utils_1.prefixID)(marketId, hoursStr);
    let marketMetrics = schema_1.MarketHourlySnapshot.load(id);
    if (marketMetrics == null) {
        marketMetrics = new schema_1.MarketHourlySnapshot(id);
        const market = getOrCreateMarket(marketId, event);
        marketMetrics.protocol = constants_1.FACTORY_ADDRESS;
        marketMetrics.market = marketId;
        marketMetrics.blockNumber = event.block.number;
        marketMetrics.timestamp = event.block.timestamp;
        marketMetrics.rates = market.rates;
        marketMetrics.totalValueLockedUSD = market.totalValueLockedUSD;
        marketMetrics.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
        marketMetrics.hourlyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeDepositUSD = market.cumulativeDepositUSD;
        marketMetrics.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
        marketMetrics.hourlyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
        marketMetrics.hourlyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
        marketMetrics.hourlyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.hourlyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.inputTokenBalance = market.inputTokenBalance;
        marketMetrics.inputTokenPriceUSD = market.inputTokenPriceUSD;
        marketMetrics.outputTokenSupply = market.outputTokenSupply;
        marketMetrics.outputTokenPriceUSD = market.outputTokenPriceUSD;
        marketMetrics.exchangeRate = market.exchangeRate;
        marketMetrics.cumulativeSupplySideRevenueUSD =
            market.cumulativeSupplySideRevenueUSD;
        marketMetrics.cumulativeProtocolSideRevenueUSD =
            market.cumulativeProtocolSideRevenueUSD;
        marketMetrics.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
        marketMetrics.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
        marketMetrics.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
        marketMetrics.save();
    }
    return marketMetrics;
}
exports.getOrCreateMarketHourlySnapshot = getOrCreateMarketHourlySnapshot;
function getOrCreateUsageMetricsDailySnapshot(event) {
    // Number of days since Unix epoch
    const days = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    const daysStr = days.toString();
    const protocol = getOrCreateProtocol();
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(daysStr);
    if (usageMetrics == null) {
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(daysStr);
        usageMetrics.protocol = protocol.id;
        usageMetrics.totalPoolCount = constants_1.INT_ZERO;
        usageMetrics.dailyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.dailyActiveDepositors = constants_1.INT_ZERO;
        usageMetrics.dailyActiveBorrowers = constants_1.INT_ZERO;
        usageMetrics.dailyActiveLiquidators = constants_1.INT_ZERO;
        usageMetrics.dailyActiveLiquidatees = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueUsers = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueDepositors = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueBorrowers = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueLiquidators = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueLiquidatees = constants_1.INT_ZERO;
        usageMetrics.dailyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.dailyDepositCount = constants_1.INT_ZERO;
        usageMetrics.dailyWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.dailyBorrowCount = constants_1.INT_ZERO;
        usageMetrics.dailyRepayCount = constants_1.INT_ZERO;
        usageMetrics.dailyLiquidateCount = constants_1.INT_ZERO;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricsDailySnapshot = getOrCreateUsageMetricsDailySnapshot;
function getOrCreateUsageMetricsHourlySnapshot(event) {
    // Number of days since Unix epoch
    const hours = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
    const hoursStr = hours.toString();
    const protocol = getOrCreateProtocol();
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(hoursStr);
    if (usageMetrics == null) {
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(hoursStr);
        usageMetrics.protocol = protocol.id;
        usageMetrics.hourlyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueUsers = constants_1.INT_ZERO;
        usageMetrics.hourlyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.hourlyDepositCount = constants_1.INT_ZERO;
        usageMetrics.hourlyWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.hourlyBorrowCount = constants_1.INT_ZERO;
        usageMetrics.hourlyRepayCount = constants_1.INT_ZERO;
        usageMetrics.hourlyLiquidateCount = constants_1.INT_ZERO;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot;
function getOrCreateFinancialsDailySnapshot(event) {
    const daysStr = (event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString();
    const protocol = getOrCreateProtocol();
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(daysStr);
    if (financialMetrics == null) {
        financialMetrics = new schema_1.FinancialsDailySnapshot(daysStr);
        financialMetrics.protocol = constants_1.FACTORY_ADDRESS;
        financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
        financialMetrics.mintedTokenSupplies = protocol.mintedTokenSupplies;
        financialMetrics.cumulativeSupplySideRevenueUSD =
            protocol.cumulativeSupplySideRevenueUSD;
        financialMetrics.cumulativeProtocolSideRevenueUSD =
            protocol.cumulativeProtocolSideRevenueUSD;
        financialMetrics.cumulativeTotalRevenueUSD =
            protocol.cumulativeTotalRevenueUSD;
        financialMetrics.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
        financialMetrics.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
        financialMetrics.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD;
        financialMetrics.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD;
        financialMetrics.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD;
        financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.blockNumber = event.block.number;
        financialMetrics.timestamp = event.block.timestamp;
        financialMetrics.save();
    }
    return financialMetrics;
}
exports.getOrCreateFinancialsDailySnapshot = getOrCreateFinancialsDailySnapshot;
function getOrCreateInterestRate(marketId, side = constants_1.InterestRateSide.BORROWER, type = constants_1.InterestRateType.VARIABLE, rate = constants_1.BIGDECIMAL_ZERO) {
    const id = `${side}-${type}-${marketId}`;
    let interestRate = schema_1.InterestRate.load(id);
    if (interestRate == null) {
        interestRate = new schema_1.InterestRate(id);
        interestRate.side = side;
        interestRate.type = type;
        interestRate.rate = rate;
    }
    return interestRate;
}
exports.getOrCreateInterestRate = getOrCreateInterestRate;
function getOrCreateUser(userAddr) {
    let user = schema_1.User.load(userAddr);
    if (!user) {
        user = new schema_1.User(userAddr);
        user.save();
    }
    return user;
}
exports.getOrCreateUser = getOrCreateUser;
function getOrCreateAccount(accountID) {
    let account = schema_1.Account.load(accountID);
    if (account == null) {
        account = new schema_1.Account(accountID);
        account.depositCount = constants_1.INT_ZERO;
        account.withdrawCount = constants_1.INT_ZERO;
        account.borrowCount = constants_1.INT_ZERO;
        account.repayCount = constants_1.INT_ZERO;
        account.liquidateCount = constants_1.INT_ZERO;
        account.liquidationCount = constants_1.INT_ZERO;
        account.positionCount = constants_1.INT_ZERO;
        account.openPositionCount = constants_1.INT_ZERO;
        account.closedPositionCount = constants_1.INT_ZERO;
        account.save();
    }
    return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
// create seperate InterestRate Entities for each market snapshot
// this is needed to prevent snapshot rates from being pointers to the current rate
function getSnapshotRates(rates, timeSuffix) {
    const snapshotRates = [];
    for (let i = 0; i < rates.length; i++) {
        const rate = schema_1.InterestRate.load(rates[i]);
        if (!rate) {
            graph_ts_1.log.warning("[getSnapshotRates] rate {} not found, should not happen", [
                rates[i],
            ]);
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
function getOrCreatePositionCounter(accountID, marketID, side) {
    const counterID = `${accountID}-${marketID}-${side}`;
    let positionCounter = schema_1._PositionCounter.load(counterID);
    if (!positionCounter) {
        positionCounter = new schema_1._PositionCounter(counterID);
        positionCounter.nextCount = constants_1.INT_ZERO;
        positionCounter.save();
    }
    return positionCounter;
}
exports.getOrCreatePositionCounter = getOrCreatePositionCounter;
///////////////////////////
///////// Helpers /////////
///////////////////////////
function getNextPositionCount(accountID, marketID, side) {
    const positionCounter = getOrCreatePositionCounter(accountID, marketID, side);
    return positionCounter.nextCount;
}
exports.getNextPositionCount = getNextPositionCount;
// find the open position for the matching urn/ilk/side combination
// there should be only one or none
function getOpenPosition(accountID, marketID, side) {
    const positionCounter = getOrCreatePositionCounter(accountID, marketID, side);
    const nextCount = positionCounter.nextCount;
    for (let counter = nextCount; counter >= 0; counter--) {
        const positionID = `${positionCounter.id}-${counter}`;
        const position = schema_1.Position.load(positionID);
        if (position) {
            const hashClosed = position.hashClosed != null ? position.hashClosed : "null";
            const balance = position.balance.toString();
            const account = position.account;
            if (position.hashClosed == null) {
                graph_ts_1.log.debug("[getOpenPosition]found open position counter={}, position.id={}, account={}, balance={}, hashClosed={}", [counter.toString(), positionID, account, balance, hashClosed]);
                return position;
            }
        }
    }
    graph_ts_1.log.warning("[getOpenPosition]No open position found for account {}/market {}/side {}", [accountID, marketID, side]);
    return null;
}
exports.getOpenPosition = getOpenPosition;
function getNewPosition(accountID, marketID, side, event) {
    const positionCounter = getOrCreatePositionCounter(accountID, marketID, side);
    positionCounter.nextCount += constants_1.INT_ONE;
    positionCounter.save();
    const positionID = `${positionCounter.id}-${positionCounter.nextCount}`;
    const position = new schema_1.Position(positionID);
    position.account = accountID;
    position.market = marketID;
    position.side = side;
    position.hashOpened = event.transaction.hash.toHexString();
    position.blockNumberOpened = event.block.number;
    position.timestampOpened = event.block.timestamp;
    position.side = side;
    position.isCollateral = false;
    position.balance = constants_1.BIGINT_ZERO;
    position.depositCount = 0;
    position.withdrawCount = 0;
    position.borrowCount = 0;
    position.repayCount = 0;
    position.liquidationCount = 0;
    return position;
}
exports.getNewPosition = getNewPosition;
// Goldfinch (GFI) price is generated from WETH-GFI reserve on Uniswap.
function getGFIPrice(event) {
    const GFIPriceInWETH = getToken0PriceInToken1(constants_1.WETH_GFI_UniswapV2_Pair, constants_1.GFI_ADDRESS, constants_1.WETH_ADDRESS);
    const WETHPriceInUSDC = getToken0PriceInToken1(constants_1.USDC_WETH_UniswapV2_Pair, constants_1.WETH_ADDRESS, constants_1.USDC_ADDRESS);
    if (!GFIPriceInWETH || !WETHPriceInUSDC) {
        return null;
    }
    const GFIPriceInUSD = GFIPriceInWETH.times(WETHPriceInUSDC).times(constants_1.GFI_DECIMALS.div(constants_1.USDC_DECIMALS));
    graph_ts_1.log.info("[getGFIPrice]GFI Price USD={} at timestamp {}", [
        GFIPriceInUSD.toString(),
        event.block.timestamp.toString(),
    ]);
    return GFIPriceInUSD;
}
exports.getGFIPrice = getGFIPrice;
function getToken0PriceInToken1(pairAddress, token0, token1) {
    const pairContract = UniswapV2Pair_1.UniswapV2Pair.bind(graph_ts_1.Address.fromString(pairAddress));
    const reserves = pairContract.try_getReserves();
    if (reserves.reverted) {
        graph_ts_1.log.error("[getToken0PriceInToken1]Unable to get reserves for pair {}", [
            pairAddress,
        ]);
        return null;
    }
    let token0Amount;
    let token1Amount;
    const pairToken0 = pairContract.token0().toHexString();
    const pairToken1 = pairContract.token1().toHexString();
    if (pairToken0 == token0) {
        if (pairToken1 != token1) {
            graph_ts_1.log.error("[getToken0PriceInToken1]tokens for pair {} = ({}, {}) do not match ({}, {})", [pairAddress, pairToken0, pairToken1, token0, token1]);
            return null;
        }
        token0Amount = reserves.value.value0;
        token1Amount = reserves.value.value1;
    }
    else {
        if (pairToken0 != token1 || pairToken1 != token0) {
            graph_ts_1.log.error("[getToken0PriceInToken1]tokens for pair {} = ({}, {}) do not match ({}, {})", [pairAddress, pairToken0, pairToken1, token1, token0]);
            return null;
        }
        token0Amount = reserves.value.value1;
        token1Amount = reserves.value.value0;
    }
    const token0PriceInToken1 = token1Amount.divDecimal(token0Amount.toBigDecimal());
    return token0PriceInToken1;
}
