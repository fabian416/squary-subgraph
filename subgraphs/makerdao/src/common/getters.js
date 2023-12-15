"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSnapshotRates = exports.getOwnerAddress = exports.getOwnerAddressFromProxy = exports.getOwnerAddressFromUrn = exports.getMarketFromIlk = exports.getMarketAddressFromIlk = exports.getNextPositionCounter = exports.getOrCreatePositionCounter = exports.getOpenPosition = exports.getOrCreatePosition = exports.getOrCreateAccount = exports.getOrCreateChi = exports.getOrCreateLiquidate = exports.getLiquidateEvent = exports.getOrCreateInterestRate = exports.getOrCreateIlk = exports.getOrCreateMarket = exports.getOrCreateLendingProtocol = exports.getOrCreateFinancials = exports.getOrCreateMarketDailySnapshot = exports.getOrCreateMarketHourlySnapshot = exports.getOrCreateUsageMetricsDailySnapshot = exports.getOrCreateUsageMetricsHourlySnapshot = exports.getOrCreateToken = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const versions_1 = require("../versions");
const constants_1 = require("./constants");
function getOrCreateToken(tokenId, name = "unknown", symbol = "unknown", decimals = 18) {
    let token = schema_1.Token.load(tokenId);
    // fetch info if null
    if (token == null) {
        token = new schema_1.Token(tokenId);
        token.name = name;
        token.symbol = symbol;
        token.decimals = decimals;
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
///////////////////////////
///////// Metrics /////////
///////////////////////////
function getOrCreateUsageMetricsHourlySnapshot(event) {
    // Number of days since Unix epoch
    const id = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
    // Create unique id for the day
    let usageMetrics = schema_1.UsageMetricsHourlySnapshot.load(id.toString());
    const protocol = getOrCreateLendingProtocol();
    if (usageMetrics == null) {
        usageMetrics = new schema_1.UsageMetricsHourlySnapshot(id.toString());
        usageMetrics.protocol = protocol.id;
        usageMetrics.hourlyActiveUsers = 0;
        usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
        usageMetrics.hourlyTransactionCount = 0;
        usageMetrics.hourlyDepositCount = 0;
        usageMetrics.hourlyBorrowCount = 0;
        usageMetrics.hourlyWithdrawCount = 0;
        usageMetrics.hourlyRepayCount = 0;
        usageMetrics.hourlyLiquidateCount = 0;
        usageMetrics.blockNumber = constants_1.BIGINT_ZERO;
        usageMetrics.timestamp = constants_1.BIGINT_ZERO;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot;
function getOrCreateUsageMetricsDailySnapshot(event) {
    // Number of days since Unix epoch
    const id = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    // Create unique id for the day
    let usageMetrics = schema_1.UsageMetricsDailySnapshot.load(id.toString());
    const protocol = getOrCreateLendingProtocol();
    if (usageMetrics == null) {
        usageMetrics = new schema_1.UsageMetricsDailySnapshot(id.toString());
        usageMetrics.protocol = protocol.id;
        usageMetrics.dailyActiveUsers = 0;
        usageMetrics.dailyActiveDepositors = 0;
        usageMetrics.dailyActiveBorrowers = 0;
        usageMetrics.dailyActiveLiquidators = 0;
        usageMetrics.dailyActiveLiquidatees = 0;
        usageMetrics.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
        usageMetrics.cumulativeUniqueDepositors =
            protocol.cumulativeUniqueDepositors;
        usageMetrics.cumulativeUniqueBorrowers = protocol.cumulativeUniqueBorrowers;
        usageMetrics.cumulativeUniqueLiquidators =
            protocol.cumulativeUniqueLiquidators;
        usageMetrics.cumulativeUniqueLiquidatees =
            protocol.cumulativeUniqueLiquidatees;
        usageMetrics.totalPoolCount = protocol.totalPoolCount;
        usageMetrics.dailyTransactionCount = 0;
        usageMetrics.dailyDepositCount = 0;
        usageMetrics.dailyBorrowCount = 0;
        usageMetrics.dailyWithdrawCount = 0;
        usageMetrics.dailyRepayCount = 0;
        usageMetrics.dailyLiquidateCount = 0;
        usageMetrics.blockNumber = constants_1.BIGINT_ZERO;
        usageMetrics.timestamp = constants_1.BIGINT_ZERO;
        usageMetrics.save();
    }
    return usageMetrics;
}
exports.getOrCreateUsageMetricsDailySnapshot = getOrCreateUsageMetricsDailySnapshot;
function getOrCreateMarketHourlySnapshot(event, marketAddress) {
    const hours = event.block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR;
    const snapshotID = marketAddress.concat("-").concat(hours.toString());
    let marketMetrics = schema_1.MarketHourlySnapshot.load(snapshotID);
    const market = getOrCreateMarket(marketAddress);
    if (marketMetrics == null) {
        marketMetrics = new schema_1.MarketHourlySnapshot(snapshotID);
        marketMetrics.protocol = getOrCreateLendingProtocol().id;
        marketMetrics.market = marketAddress;
        marketMetrics.inputTokenBalance = market.inputTokenBalance;
        marketMetrics.inputTokenPriceUSD = market.inputTokenPriceUSD;
        marketMetrics.outputTokenSupply = market.outputTokenSupply;
        marketMetrics.outputTokenPriceUSD = market.outputTokenPriceUSD;
        marketMetrics.totalValueLockedUSD = market.totalValueLockedUSD;
        marketMetrics.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
        marketMetrics.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
        marketMetrics.cumulativeDepositUSD = market.cumulativeDepositUSD;
        marketMetrics.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
        marketMetrics.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
        marketMetrics.rates = market.rates;
        marketMetrics.blockNumber = event.block.number;
        marketMetrics.timestamp = event.block.timestamp;
        marketMetrics.hourlyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.hourlyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.hourlyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.hourlyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.hourlyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeSupplySideRevenueUSD =
            market.cumulativeSupplySideRevenueUSD;
        marketMetrics.cumulativeProtocolSideRevenueUSD =
            market.cumulativeProtocolSideRevenueUSD;
        marketMetrics.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
        marketMetrics.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.save();
    }
    return marketMetrics;
}
exports.getOrCreateMarketHourlySnapshot = getOrCreateMarketHourlySnapshot;
function getOrCreateMarketDailySnapshot(event, marketAddress) {
    const days = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    const snapshotID = marketAddress.concat("-").concat(days.toString());
    let marketMetrics = schema_1.MarketDailySnapshot.load(snapshotID);
    const market = getOrCreateMarket(marketAddress);
    if (marketMetrics == null) {
        marketMetrics = new schema_1.MarketDailySnapshot(snapshotID);
        marketMetrics.protocol = getOrCreateLendingProtocol().id;
        marketMetrics.market = marketAddress;
        marketMetrics.inputTokenBalance = market.inputTokenBalance;
        marketMetrics.inputTokenPriceUSD = market.inputTokenPriceUSD;
        marketMetrics.outputTokenSupply = market.outputTokenSupply;
        marketMetrics.outputTokenPriceUSD = market.outputTokenPriceUSD;
        marketMetrics.totalValueLockedUSD = market.totalValueLockedUSD;
        marketMetrics.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
        marketMetrics.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
        marketMetrics.cumulativeDepositUSD = market.cumulativeDepositUSD;
        marketMetrics.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
        marketMetrics.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
        marketMetrics.rates = market.rates;
        marketMetrics.blockNumber = event.block.number;
        marketMetrics.timestamp = event.block.timestamp;
        marketMetrics.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.cumulativeSupplySideRevenueUSD =
            market.cumulativeSupplySideRevenueUSD;
        marketMetrics.cumulativeProtocolSideRevenueUSD =
            market.cumulativeProtocolSideRevenueUSD;
        marketMetrics.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
        marketMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketMetrics.save();
    }
    return marketMetrics;
}
exports.getOrCreateMarketDailySnapshot = getOrCreateMarketDailySnapshot;
function getOrCreateFinancials(event) {
    // Number of days since Unix epoch
    const id = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    let financialMetrics = schema_1.FinancialsDailySnapshot.load(id.toString());
    const protocol = getOrCreateLendingProtocol();
    if (financialMetrics == null) {
        financialMetrics = new schema_1.FinancialsDailySnapshot(id.toString());
        financialMetrics.protocol = getOrCreateLendingProtocol().id;
        financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
        financialMetrics.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD;
        financialMetrics.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD;
        financialMetrics.mintedTokenSupplies = protocol.mintedTokenSupplies;
        financialMetrics.cumulativeSupplySideRevenueUSD =
            protocol.cumulativeSupplySideRevenueUSD;
        financialMetrics.cumulativeProtocolSideRevenueUSD =
            protocol.cumulativeProtocolSideRevenueUSD;
        financialMetrics._cumulativeProtocolSideStabilityFeeRevenue =
            protocol._cumulativeProtocolSideStabilityFeeRevenue;
        financialMetrics._cumulativeProtocolSideLiquidationRevenue =
            protocol._cumulativeProtocolSideLiquidationRevenue;
        financialMetrics._cumulativeProtocolSidePSMRevenue =
            protocol._cumulativeProtocolSidePSMRevenue;
        financialMetrics.cumulativeTotalRevenueUSD =
            protocol.cumulativeTotalRevenueUSD;
        financialMetrics.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD;
        financialMetrics.cumulativeDepositUSD = protocol.cumulativeDepositUSD;
        financialMetrics.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD;
        financialMetrics.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics._dailyProtocolSideStabilityFeeRevenue = constants_1.BIGDECIMAL_ZERO;
        financialMetrics._dailyProtocolSideLiquidationRevenue = constants_1.BIGDECIMAL_ZERO;
        financialMetrics._dailyProtocolSidePSMRevenue = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        financialMetrics.blockNumber = event.block.number;
        financialMetrics.timestamp = event.block.timestamp;
        financialMetrics.save();
    }
    return financialMetrics;
}
exports.getOrCreateFinancials = getOrCreateFinancials;
////////////////////////////
///// Lending Specific /////
///////////////////////////
function getOrCreateLendingProtocol() {
    let protocol = schema_1.LendingProtocol.load(constants_1.VAT_ADDRESS);
    if (protocol == null) {
        protocol = new schema_1.LendingProtocol(constants_1.VAT_ADDRESS);
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.network = constants_1.Network.MAINNET;
        protocol.type = constants_1.ProtocolType.LENDING;
        protocol.cumulativeUniqueUsers = 0;
        protocol.cumulativeUniqueBorrowers = 0;
        protocol.cumulativeUniqueDepositors = 0;
        protocol.cumulativeUniqueLiquidatees = 0;
        protocol.cumulativeUniqueLiquidators = 0;
        protocol.openPositionCount = 0;
        protocol.cumulativePositionCount = 0;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol._cumulativeProtocolSideStabilityFeeRevenue = constants_1.BIGDECIMAL_ZERO;
        protocol._cumulativeProtocolSideLiquidationRevenue = constants_1.BIGDECIMAL_ZERO;
        protocol._cumulativeProtocolSidePSMRevenue = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.totalPoolCount = 0;
        protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        protocol.lendingType = constants_1.LendingType.CDP;
        protocol.mintedTokens = [constants_1.DAI_ADDRESS];
        protocol.marketIDList = [];
        protocol._par = constants_1.BIGINT_ONE_RAY;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateLendingProtocol = getOrCreateLendingProtocol;
function getOrCreateMarket(marketID, name = "unknown", inputToken = constants_1.ZERO_ADDRESS, blockNumber = constants_1.BIGINT_ZERO, timeStamp = constants_1.BIGINT_ZERO) {
    let market = schema_1.Market.load(marketID);
    if (market == null) {
        if (marketID == constants_1.ZERO_ADDRESS) {
            graph_ts_1.log.warning("[getOrCreateMarket]Creating a new Market with marketID={}", [
                marketID,
            ]);
        }
        const protocol = getOrCreateLendingProtocol();
        market = new schema_1.Market(marketID);
        market.name = name;
        market.inputToken = inputToken;
        market.createdTimestamp = timeStamp;
        market.createdBlockNumber = blockNumber;
        market.protocol = protocol.id;
        // set defaults
        market.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        market.inputTokenBalance = constants_1.BIGINT_ZERO;
        market.inputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        // maker has no output token
        //market.outputToken = ZERO_ADDRESS;
        market.outputTokenSupply = constants_1.BIGINT_ZERO;
        market.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        market.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.isActive = true;
        market.canUseAsCollateral = true;
        market.canBorrowFrom = true;
        market.maximumLTV = constants_1.BIGDECIMAL_ZERO;
        market.liquidationThreshold = constants_1.BIGDECIMAL_ZERO;
        market.liquidationPenalty = constants_1.BIGDECIMAL_ZERO;
        market.rates = [constants_1.BIGDECIMAL_ZERO.toString()];
        market._mat = constants_1.BIGINT_ONE_RAY;
        market.positionCount = constants_1.INT_ZERO;
        market.openPositionCount = constants_1.INT_ZERO;
        market.closedPositionCount = constants_1.INT_ZERO;
        market.borrowingPositionCount = constants_1.INT_ZERO;
        market.lendingPositionCount = constants_1.INT_ZERO;
        market.save();
        const marketIDList = protocol.marketIDList;
        marketIDList.push(marketID);
        protocol.marketIDList = marketIDList;
        protocol.save();
    }
    return market;
}
exports.getOrCreateMarket = getOrCreateMarket;
function getOrCreateIlk(ilk, marketID = constants_1.ZERO_ADDRESS) {
    let _ilk = schema_1._Ilk.load(ilk.toHexString());
    if (_ilk == null && marketID != constants_1.ZERO_ADDRESS) {
        _ilk = new schema_1._Ilk(ilk.toHexString());
        _ilk.marketAddress = marketID;
        _ilk.save();
    }
    return _ilk;
}
exports.getOrCreateIlk = getOrCreateIlk;
function getOrCreateInterestRate(marketAddress, side, type) {
    const interestRateID = side + "-" + type + "-" + marketAddress;
    let interestRate = schema_1.InterestRate.load(interestRateID);
    if (interestRate) {
        return interestRate;
    }
    interestRate = new schema_1.InterestRate(interestRateID);
    interestRate.side = side;
    interestRate.type = type;
    interestRate.rate = constants_1.BIGDECIMAL_ONE;
    interestRate.save();
    return interestRate;
}
exports.getOrCreateInterestRate = getOrCreateInterestRate;
function getLiquidateEvent(LiquidateID) {
    const liquidate = schema_1.Liquidate.load(LiquidateID);
    if (liquidate == null) {
        graph_ts_1.log.error("[getLiquidateEvent]Liquidate entity with id {} does not exist", [
            LiquidateID,
        ]);
        return null;
    }
    return liquidate;
}
exports.getLiquidateEvent = getLiquidateEvent;
function getOrCreateLiquidate(LiquidateID, event = null, market = null, liquidatee = null, liquidator = null, amount = null, amountUSD = null, profitUSD = null) {
    let liquidate = schema_1.Liquidate.load(LiquidateID);
    if (liquidate == null) {
        liquidate = new schema_1.Liquidate(LiquidateID);
        liquidate.hash = event.transaction.hash.toHexString();
        liquidate.logIndex = event.logIndex.toI32();
        liquidate.nonce = event.transaction.nonce;
        liquidate.liquidator = liquidator;
        liquidate.liquidatee = liquidatee;
        liquidate.blockNumber = event.block.number;
        liquidate.timestamp = event.block.timestamp;
        liquidate.market = market.id;
        liquidate.asset = market.inputToken;
        liquidate.amount = amount;
        liquidate.amountUSD = amountUSD;
        liquidate.profitUSD = profitUSD;
        liquidate.position = "";
        liquidate.save();
    }
    return liquidate;
}
exports.getOrCreateLiquidate = getOrCreateLiquidate;
function getOrCreateChi(chiID) {
    let _chi = schema_1._Chi.load(chiID);
    if (_chi == null) {
        _chi = new schema_1._Chi(chiID);
        _chi.chi = constants_1.BIGINT_ONE_RAY;
        _chi.rho = constants_1.BIGINT_ZERO;
        _chi.save();
    }
    return _chi;
}
exports.getOrCreateChi = getOrCreateChi;
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
        account._positionIDList = [];
        account.save();
    }
    return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
function getOrCreatePosition(event, address, ilk, side, newPosition = false) {
    const urnOwnerAddr = getOwnerAddressFromUrn(address);
    const _is_urn = urnOwnerAddr == null ? false : true;
    // urn owner may be a proxy
    const proxyOwnerAddr = getOwnerAddressFromProxy(address);
    const urnProxyOwnerAddr = urnOwnerAddr
        ? getOwnerAddressFromProxy(urnOwnerAddr)
        : null;
    const _is_proxy = proxyOwnerAddr == null && urnProxyOwnerAddr == null ? false : true;
    const accountAddress = getOwnerAddress(address);
    const marketID = getMarketAddressFromIlk(ilk).toHexString();
    const positionPrefix = `${address}-${marketID}-${side}`;
    const counterEnity = getOrCreatePositionCounter(address, ilk, side);
    let counter = counterEnity.nextCount;
    let positionID = `${positionPrefix}-${counter}`;
    let position = schema_1.Position.load(positionID);
    if (newPosition && position != null) {
        // increase the counter to force a new position
        // this is necessary when receiving a transferred position
        counter += 1;
        positionID = `${positionPrefix}-${counter}`;
        position = schema_1.Position.load(positionID);
        counterEnity.nextCount = counter;
        counterEnity.save();
    }
    if (position == null) {
        // new position
        position = new schema_1.Position(positionID);
        position.market = marketID;
        position.account = accountAddress;
        position._is_urn = _is_urn;
        position._is_proxy = _is_proxy;
        position.hashOpened = event.transaction.hash.toHexString();
        position.blockNumberOpened = event.block.number;
        position.timestampOpened = event.block.timestamp;
        position.side = side;
        position.balance = constants_1.BIGINT_ZERO;
        position.depositCount = constants_1.INT_ZERO;
        position.withdrawCount = constants_1.INT_ZERO;
        position.borrowCount = constants_1.INT_ZERO;
        position.repayCount = constants_1.INT_ZERO;
        position.liquidationCount = constants_1.INT_ZERO;
        if (side == constants_1.PositionSide.LENDER) {
            //isCollateral is always enabled for maker lender position
            position.isCollateral = true;
        }
        position.save();
    }
    graph_ts_1.log.info("[getOrCreatePosition]Get/create position positionID={}, account={}, balance={}", [positionID, accountAddress, position.balance.toString()]);
    return position;
}
exports.getOrCreatePosition = getOrCreatePosition;
// find the open position for the matching urn/ilk/side combination
// there should be only one or none
function getOpenPosition(urn, ilk, side) {
    const marketID = getMarketAddressFromIlk(ilk).toHexString();
    const nextCounter = getNextPositionCounter(urn, ilk, side);
    graph_ts_1.log.info("[getOpenPosition]Finding open position for urn {}/ilk {}/side {}", [
        urn,
        ilk.toString(),
        side,
    ]);
    for (let counter = nextCounter; counter >= 0; counter--) {
        const positionID = `${urn}-${marketID}-${side}-${counter}`;
        const position = schema_1.Position.load(positionID);
        if (position) {
            const hashClosed = position.hashClosed != null ? position.hashClosed : "null";
            const balance = position.balance.toString();
            const account = position.account;
            // position is open
            if (position.hashClosed == null) {
                graph_ts_1.log.info("[getOpenPosition]found open position counter={}, position.id={}, account={}, balance={}, hashClosed={}", [counter.toString(), positionID, account, balance, hashClosed]);
                return position;
            }
            else {
                graph_ts_1.log.info("[getOpenPosition]iterating counter={}, position.id={}, account={}, balance={}, hashClosed={}", [counter.toString(), positionID, account, balance, hashClosed]);
            }
        }
        else {
            graph_ts_1.log.info("[getOpenPosition]iterating counter={}, position.id={} doesn't exist", [counter.toString(), positionID]);
        }
    }
    graph_ts_1.log.info("[getOpenPosition]No open position for urn {}/ilk {}/side {}", [
        urn,
        ilk.toString(),
        side,
    ]);
    return null;
}
exports.getOpenPosition = getOpenPosition;
function getOrCreatePositionCounter(urn, ilk, side) {
    const marketID = getMarketAddressFromIlk(ilk).toHexString();
    const ID = `${urn}-${marketID}-${side}`;
    let counterEnity = schema_1._PositionCounter.load(ID);
    if (!counterEnity) {
        counterEnity = new schema_1._PositionCounter(ID);
        counterEnity.nextCount = constants_1.INT_ZERO;
        counterEnity.save();
    }
    return counterEnity;
}
exports.getOrCreatePositionCounter = getOrCreatePositionCounter;
///////////////////////////
///////// Helpers /////////
///////////////////////////
function getNextPositionCounter(urn, ilk, side) {
    const counterEnity = getOrCreatePositionCounter(urn, ilk, side);
    return counterEnity.nextCount;
}
exports.getNextPositionCounter = getNextPositionCounter;
function getMarketAddressFromIlk(ilk) {
    const _ilk = getOrCreateIlk(ilk);
    if (_ilk)
        return graph_ts_1.Address.fromString(_ilk.marketAddress);
    graph_ts_1.log.warning("[getMarketAddressFromIlk]MarketAddress for ilk {} not found", [
        ilk.toString(),
    ]);
    return null;
}
exports.getMarketAddressFromIlk = getMarketAddressFromIlk;
function getMarketFromIlk(ilk) {
    const marketAddress = getMarketAddressFromIlk(ilk);
    if (marketAddress) {
        return getOrCreateMarket(marketAddress.toHexString());
    }
    return null;
}
exports.getMarketFromIlk = getMarketFromIlk;
function getOwnerAddressFromUrn(urn) {
    const _urn = schema_1._Urn.load(urn);
    if (_urn) {
        return _urn.ownerAddress;
    }
    return null;
}
exports.getOwnerAddressFromUrn = getOwnerAddressFromUrn;
function getOwnerAddressFromProxy(proxy) {
    const _proxy = schema_1._Proxy.load(proxy);
    if (_proxy) {
        return _proxy.ownerAddress;
    }
    return null;
}
exports.getOwnerAddressFromProxy = getOwnerAddressFromProxy;
// get owner address from possible urn or proxy address
// return itself if it is not an urn or proxy
function getOwnerAddress(address) {
    const urnOwner = getOwnerAddressFromUrn(address);
    let owner = urnOwner ? urnOwner : address;
    const proxyOwner = getOwnerAddressFromProxy(owner);
    owner = proxyOwner ? proxyOwner : owner;
    return owner;
}
exports.getOwnerAddress = getOwnerAddress;
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
