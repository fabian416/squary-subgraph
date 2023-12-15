"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSnapshotRates = exports.getOrCreateInterestRate = exports.getOrCreateFinancialsDailySnapshot = exports.getOrCreateUsageMetricsHourlySnapshot = exports.getOrCreateUsageMetricsDailySnapshot = exports.getOrCreateMarketHourlySnapshot = exports.getOrCreateMarketDailySnapshot = exports.getOrCreateMarket = exports.getOrCreateProtocol = exports.getUnderlyingTokenPricePerAmount = exports.getUnderlyingTokenPrice = exports.getOrCreateRewardToken = exports.getOrCreateUnderlyingToken = exports.getOrCreateToken = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../generated/Factory/Factory");
const PriceOracle_1 = require("../../generated/Factory/PriceOracle");
const CErc20_1 = require("../../generated/templates/CToken/CErc20");
const utils_1 = require("./utils");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const versions_1 = require("../versions");
function getOrCreateToken(cToken) {
    let tokenId = cToken.toHexString();
    let token = schema_1.Token.load(tokenId);
    if (token == null) {
        token = new schema_1.Token(tokenId);
        let contract = CErc20_1.CErc20.bind(cToken);
        token.name = contract.name();
        token.symbol = contract.symbol();
        token.decimals = contract.decimals();
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateUnderlyingToken(cToken) {
    // use default for cETH, which has no underlying
    let tokenId = constants_1.ZERO_ADDRESS;
    let name = "";
    let symbol = "";
    let decimals = 0;
    // underlying for cETH -> ETH
    if (cToken.toHexString() == "0x697b4acaa24430f254224eb794d2a85ba1fa1fb8") {
        name = "Ether";
        symbol = "ETH";
        decimals = 18;
    }
    //even if the underlying token is not always a CErc20,
    // it should work for the purpose of getting name, symbol, & decimals
    let cTokenContract = CErc20_1.CErc20.bind(cToken);
    let tryUnderlyingTokenAddr = cTokenContract.try_underlying();
    if (!tryUnderlyingTokenAddr.reverted) {
        tokenId = tryUnderlyingTokenAddr.value.toHexString();
        let underlyingTokenContract = CErc20_1.CErc20.bind(tryUnderlyingTokenAddr.value);
        name = underlyingTokenContract.name();
        symbol = underlyingTokenContract.symbol();
        decimals = underlyingTokenContract.decimals();
    }
    else {
        if (cToken.toHexString() != "0x697b4acaa24430f254224eb794d2a85ba1fa1fb8")
            graph_ts_1.log.warning("Failed to get underlying for market {}", [cToken.toHexString()]);
    }
    let token = schema_1.Token.load(tokenId);
    if (token == null) {
        token = new schema_1.Token(tokenId);
        token.name = name;
        token.symbol = symbol;
        token.decimals = decimals;
        token.save();
    }
    return token;
}
exports.getOrCreateUnderlyingToken = getOrCreateUnderlyingToken;
function getOrCreateRewardToken() {
    let tokenId = cToken.toHexString();
    let token = schema_1.Token.load(tokenId);
    if (token == null) {
        token = new schema_1.Token(tokenId);
        let contract = CErc20_1.CErc20.bind(cToken);
        token.name = contract.name();
        token.symbol = contract.symbol();
        token.decimals = contract.decimals();
        token.save();
    }
    return token;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
function getUnderlyingTokenPrice(cToken) {
    let factoryContract = Factory_1.Factory.bind(graph_ts_1.Address.fromString(constants_1.FACTORY_ADDRESS));
    let oracleAddress = factoryContract.oracle();
    let oracleContract = PriceOracle_1.PriceOracle.bind(oracleAddress);
    let underlyingDecimals = getOrCreateUnderlyingToken(cToken).decimals;
    let mantissaDecimalFactor = 18 - underlyingDecimals + 18;
    let underlyingPrice = oracleContract
        .getUnderlyingPrice(cToken)
        .toBigDecimal()
        .div((0, utils_1.decimalsToBigDecimal)(mantissaDecimalFactor));
    return underlyingPrice;
}
exports.getUnderlyingTokenPrice = getUnderlyingTokenPrice;
function getUnderlyingTokenPricePerAmount(cToken) {
    //return price of 1 underlying token unit
    let underlyingPrice = getUnderlyingTokenPrice(cToken);
    let decimals = getOrCreateUnderlyingToken(cToken).decimals;
    let denominator = (0, utils_1.decimalsToBigDecimal)(decimals);
    return underlyingPrice.div(denominator);
}
exports.getUnderlyingTokenPricePerAmount = getUnderlyingTokenPricePerAmount;
function getOrCreateProtocol() {
    let protocol = schema_1.LendingProtocol.load(constants_1.FACTORY_ADDRESS);
    if (!protocol) {
        protocol = new schema_1.LendingProtocol(constants_1.FACTORY_ADDRESS);
        protocol.name = "Inverse Finance";
        protocol.slug = "inverse-finance";
        protocol.network = constants_1.Network.ETHEREUM;
        protocol.type = constants_1.ProtocolType.LENDING;
        protocol.lendingType = constants_1.LendingType.CDP;
        protocol.riskType = constants_1.RiskType.GLOBAL;
        protocol.mintedTokens = [];
        protocol.mintedTokenSupplies = [];
        ////// quantitative data //////
        protocol.totalPoolCount = constants_1.INT_ZERO;
        protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        // metrics/markets - derived and don't need to be initialized
        //protocol.usageMetrics
        //protocol.financialMetrics
        //protocol.markets
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateProtocol = getOrCreateProtocol;
function getOrCreateMarket(marketId, event) {
    let market = schema_1.Market.load(marketId);
    if (market == null) {
        let contract = CErc20_1.CErc20.bind(graph_ts_1.Address.fromString(marketId));
        let asset = constants_1.ZERO_ADDRESS; //default
        let tryAsset = contract.try_underlying();
        if (!tryAsset.reverted) {
            asset = tryAsset.value.toHexString();
        }
        market = new schema_1.Market(marketId);
        market.protocol = constants_1.FACTORY_ADDRESS;
        market.name = contract.name();
        // isActive resets once Transfer is paused/unpaused
        market.isActive = true;
        market.canUseAsCollateral = false;
        market.canBorrowFrom = true; //borrowGuardianPaused is default to false
        market.maximumLTV = constants_1.BIGDECIMAL_ZERO;
        market.liquidationThreshold = constants_1.BIGDECIMAL_ZERO;
        market.liquidationPenalty = constants_1.BIGDECIMAL_ZERO;
        market.inputToken = asset;
        market.outputToken = marketId; //Token.load(marketId).id
        market.rewardTokens = [
            (0, utils_1.prefixID)(constants_1.INV_ADDRESS, constants_1.RewardTokenType.DEPOSIT),
            (0, utils_1.prefixID)(constants_1.INV_ADDRESS, constants_1.RewardTokenType.BORROW),
        ];
        market.rates = [
            (0, utils_1.prefixID)(marketId, constants_1.InterestRateSide.LENDER, constants_1.InterestRateType.VARIABLE),
            (0, utils_1.prefixID)(marketId, constants_1.InterestRateSide.BORROWER, constants_1.InterestRateType.VARIABLE),
        ];
        //inverse finance does not have stable borrow rate - default to null
        //market.stableBorrowRate
        market.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        market.inputTokenBalance = constants_1.BIGINT_ZERO;
        market.inputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        market.outputTokenSupply = constants_1.BIGINT_ZERO;
        market.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        market.exchangeRate = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
        market.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
        //market.snapshots - derived and don't need to be initialized
        //market.deposits
        //market.withdraws
        //market.borrows
        //market.repays
        //market.liquidates
        market.createdTimestamp = event.block.timestamp;
        market.createdBlockNumber = event.block.number;
        market.save();
    }
    return market;
}
exports.getOrCreateMarket = getOrCreateMarket;
function getOrCreateMarketDailySnapshot(event) {
    let days = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    let daysStr = days.toString();
    let marketId = event.address.toHexString();
    let id = (0, utils_1.prefixID)(marketId, daysStr);
    let market = getOrCreateMarket(marketId, event);
    let marketMetrics = schema_1.MarketDailySnapshot.load(id);
    if (marketMetrics == null) {
        marketMetrics = new schema_1.MarketDailySnapshot(id);
        marketMetrics.protocol = constants_1.FACTORY_ADDRESS;
        marketMetrics.market = marketId;
        marketMetrics.blockNumber = event.block.number;
        marketMetrics.timestamp = event.block.timestamp;
        marketMetrics.rates = [
            (0, utils_1.prefixID)(marketId, constants_1.InterestRateSide.LENDER, constants_1.InterestRateType.VARIABLE),
            (0, utils_1.prefixID)(marketId, constants_1.InterestRateSide.BORROWER, constants_1.InterestRateType.VARIABLE),
        ];
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
        marketMetrics.cumulativeSupplySideRevenueUSD = market.cumulativeSupplySideRevenueUSD;
        marketMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeProtocolSideRevenueUSD = market.cumulativeProtocolSideRevenueUSD;
        marketMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
        marketMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.save();
    }
    return marketMetrics;
}
exports.getOrCreateMarketDailySnapshot = getOrCreateMarketDailySnapshot;
function getOrCreateMarketHourlySnapshot(event) {
    // Hours since Unix epoch time
    let hours = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
    let hoursStr = hours.toString();
    let marketId = event.address.toHexString();
    let id = (0, utils_1.prefixID)(marketId, hoursStr);
    let market = getOrCreateMarket(marketId, event);
    let marketMetrics = schema_1.MarketHourlySnapshot.load(id);
    if (marketMetrics == null) {
        marketMetrics = new schema_1.MarketHourlySnapshot(id);
        marketMetrics.protocol = constants_1.FACTORY_ADDRESS;
        marketMetrics.market = marketId;
        marketMetrics.blockNumber = event.block.number;
        marketMetrics.timestamp = event.block.timestamp;
        marketMetrics.rates = [
            (0, utils_1.prefixID)(marketId, constants_1.InterestRateSide.LENDER, constants_1.InterestRateType.VARIABLE),
            (0, utils_1.prefixID)(marketId, constants_1.InterestRateSide.BORROWER, constants_1.InterestRateType.VARIABLE),
        ];
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
        marketMetrics.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
        marketMetrics.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
        marketMetrics.cumulativeSupplySideRevenueUSD = market.cumulativeSupplySideRevenueUSD;
        marketMetrics.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeProtocolSideRevenueUSD = market.cumulativeProtocolSideRevenueUSD;
        marketMetrics.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
        marketMetrics.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.save();
    }
    return marketMetrics;
}
exports.getOrCreateMarketHourlySnapshot = getOrCreateMarketHourlySnapshot;
function getOrCreateUsageMetricsDailySnapshot(event) {
    // Number of days since Unix epoch
    let days = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    let daysStr = days.toString();
    let protocol = getOrCreateProtocol();
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(daysStr);
    if (usageMetrics == null) {
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(daysStr);
        usageMetrics.protocol = constants_1.FACTORY_ADDRESS;
        usageMetrics.dailyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
        usageMetrics.dailyTransactionCount = constants_1.INT_ZERO;
        usageMetrics.dailyDepositCount = constants_1.INT_ZERO;
        usageMetrics.dailyWithdrawCount = constants_1.INT_ZERO;
        usageMetrics.dailyBorrowCount = constants_1.INT_ZERO;
        usageMetrics.dailyRepayCount = constants_1.INT_ZERO;
        usageMetrics.dailyLiquidateCount = constants_1.INT_ZERO;
        usageMetrics.totalPoolCount = protocol.totalPoolCount;
        usageMetrics.blockNumber = event.block.number;
        usageMetrics.timestamp = event.block.timestamp;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricsDailySnapshot = getOrCreateUsageMetricsDailySnapshot;
function getOrCreateUsageMetricsHourlySnapshot(event) {
    // Number of days since Unix epoch
    let hours = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
    let hoursStr = hours.toString();
    let protocol = getOrCreateProtocol();
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(hoursStr);
    if (usageMetrics == null) {
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(hoursStr);
        usageMetrics.protocol = constants_1.FACTORY_ADDRESS;
        usageMetrics.hourlyActiveUsers = constants_1.INT_ZERO;
        usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
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
    let daysStr = (event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString();
    let protocol = getOrCreateProtocol();
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(daysStr);
    if (financialMetrics == null) {
        financialMetrics = new schema_1.FinancialsDailySnapshot(daysStr);
        financialMetrics.protocol = constants_1.FACTORY_ADDRESS;
        financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
        financialMetrics.mintedTokenSupplies = protocol.mintedTokenSupplies;
        financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeSupplySideRevenueUSD = protocol.cumulativeSupplySideRevenueUSD;
        financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeProtocolSideRevenueUSD = protocol.cumulativeProtocolSideRevenueUSD;
        financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD;
        financialMetrics.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD;
        financialMetrics.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
        financialMetrics.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD;
        financialMetrics.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
        financialMetrics.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD;
        financialMetrics.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.blockNumber = event.block.number;
        financialMetrics.timestamp = event.block.timestamp;
        financialMetrics.save();
    }
    return financialMetrics;
}
exports.getOrCreateFinancialsDailySnapshot = getOrCreateFinancialsDailySnapshot;
function getOrCreateInterestRate(id = null, side = constants_1.InterestRateSide.BORROWER, type = constants_1.InterestRateType.VARIABLE, marketId = constants_1.ZERO_ADDRESS) {
    if (id == null) {
        assert(marketId != constants_1.ZERO_ADDRESS, "The marketId must be specified when InterestRate id is null");
        id = (0, utils_1.prefixID)(marketId, side, type);
    }
    let interestRate = schema_1.InterestRate.load(id);
    if (interestRate == null) {
        interestRate = new schema_1.InterestRate(id);
        interestRate.rate = constants_1.BIGDECIMAL_ZERO;
        interestRate.side = side;
        interestRate.type = type;
    }
    return interestRate;
}
exports.getOrCreateInterestRate = getOrCreateInterestRate;
// create seperate InterestRate Entities for each market snapshot
// this is needed to prevent snapshot rates from being pointers to the current rate
function getSnapshotRates(rates, timeSuffix) {
    let snapshotRates = [];
    for (let i = 0; i < rates.length; i++) {
        let rate = schema_1.InterestRate.load(rates[i]);
        if (!rate) {
            graph_ts_1.log.warning("[getSnapshotRates] rate {} not found, should not happen", [rates[i]]);
            continue;
        }
        // create new snapshot rate
        let snapshotRateId = rates[i].concat("-").concat(timeSuffix);
        let snapshotRate = new schema_1.InterestRate(snapshotRateId);
        snapshotRate.side = rate.side;
        snapshotRate.type = rate.type;
        snapshotRate.rate = rate.rate;
        snapshotRate.save();
        snapshotRates.push(snapshotRateId);
    }
    return snapshotRates;
}
exports.getSnapshotRates = getSnapshotRates;
