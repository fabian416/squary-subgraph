"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeMarketPosition = exports.openMarketLenderPosition = exports.openMarketBorrowerPosition = exports.addMarketVolume = exports.addMarketRepayVolume = exports.setMarketAssetBalance = exports.setMarketVSTDebt = exports.getOrCreateMarketHourlySnapshot = exports.getOrCreateMarketSnapshot = exports.getOrCreateMarket = exports.getOrCreateStabilityPool = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const VestaParameters_1 = require("../../generated/VestaParameters/VestaParameters");
const protocol_1 = require("./protocol");
const token_1 = require("./token");
const rate_1 = require("./rate");
const event_1 = require("./event");
const numbers_1 = require("../utils/numbers");
const constants_1 = require("../utils/constants");
function getOrCreateStabilityPool(pool, asset, event) {
    const poolID = pool.toHexString();
    let market = schema_1.Market.load(poolID);
    if (market) {
        return market;
    }
    const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
    const VSTToken = (0, token_1.getVSTToken)();
    const VSTPriceUSD = (0, token_1.getVSTTokenPrice)(event);
    const assetToken = (0, token_1.getOrCreateAssetToken)(asset);
    market = new schema_1.Market(poolID);
    market.protocol = protocol.id;
    market.name = `${assetToken.symbol} StabilityPool`;
    market.isActive = true;
    market.canUseAsCollateral = false;
    market.canBorrowFrom = false;
    market.maximumLTV = constants_1.BIGDECIMAL_ZERO;
    market.liquidationThreshold = constants_1.BIGDECIMAL_ZERO;
    market.liquidationPenalty = constants_1.BIGDECIMAL_ZERO;
    market.inputToken = VSTToken.id;
    market.rewardTokens = [(0, token_1.getOrCreateRewardToken)().id];
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
    market.inputTokenPriceUSD = VSTPriceUSD;
    market.outputTokenSupply = constants_1.BIGINT_ZERO;
    market.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
    market.exchangeRate = constants_1.BIGDECIMAL_ZERO;
    market.rewardTokenEmissionsAmount = [];
    market.rewardTokenEmissionsUSD = [];
    market.positionCount = 0;
    market.openPositionCount = 0;
    market.closedPositionCount = 0;
    market.lendingPositionCount = 0;
    market.borrowingPositionCount = 0;
    market.createdTimestamp = event.block.timestamp;
    market.createdBlockNumber = event.block.number;
    market._asset = asset.toHexString();
    market.save();
    const stabilityPools = protocol._stabilityPools;
    stabilityPools.push(market.id);
    protocol._stabilityPools = stabilityPools;
    protocol.save();
    // map asset to stability pool
    let assetToSP = schema_1._AssetToStabilityPool.load(asset.toHexString());
    if (!assetToSP) {
        assetToSP = new schema_1._AssetToStabilityPool(asset.toHexString());
        assetToSP.stabilityPool = market.id;
        assetToSP.save();
    }
    return market;
}
exports.getOrCreateStabilityPool = getOrCreateStabilityPool;
function getOrCreateMarket(asset) {
    const assetAddress = asset.toHexString();
    const marketID = `${constants_1.ACTIVE_POOL_ADDRESS}-${assetAddress}`;
    let market = schema_1.Market.load(marketID);
    if (!market) {
        const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
        protocol.totalPoolCount += constants_1.INT_ONE;
        protocol.save();
        const inputToken = (0, token_1.getOrCreateAssetToken)(asset);
        const maxLTV = setMaxLTV(assetAddress);
        const liquidationPenalty = setLiquidationPenalty(assetAddress);
        market = new schema_1.Market(marketID);
        market.protocol = protocol.id;
        market.name = inputToken.name;
        market.isActive = true;
        market.canUseAsCollateral = true;
        market.canBorrowFrom = true;
        market.maximumLTV = maxLTV;
        market.liquidationThreshold = maxLTV;
        market.liquidationPenalty = liquidationPenalty;
        market.inputToken = inputToken.id;
        market.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        market.rates = [(0, rate_1.getOrCreateStableBorrowerInterestRate)(assetAddress).id];
        market.createdTimestamp = constants_1.ACTIVE_POOL_CREATED_TIMESTAMP;
        market.createdBlockNumber = constants_1.ACTIVE_POOL_CREATED_BLOCK;
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
        market.positionCount = constants_1.INT_ZERO;
        market.openPositionCount = constants_1.INT_ZERO;
        market.closedPositionCount = constants_1.INT_ZERO;
        market.lendingPositionCount = constants_1.INT_ZERO;
        market.borrowingPositionCount = constants_1.INT_ZERO;
        market.save();
        (0, protocol_1.addProtocolMarketAssets)(market);
    }
    return market;
}
exports.getOrCreateMarket = getOrCreateMarket;
function getOrCreateMarketSnapshot(event, market) {
    const day = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    const id = `${market.id}-${day}`;
    let marketSnapshot = schema_1.MarketDailySnapshot.load(id);
    if (!marketSnapshot) {
        marketSnapshot = new schema_1.MarketDailySnapshot(id);
        marketSnapshot.protocol = market.protocol;
        marketSnapshot.market = market.id;
        marketSnapshot.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.dailyRepayUSD = constants_1.BIGDECIMAL_ZERO;
    }
    marketSnapshot.rates = getSnapshotRates(market.rates, (event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY).toString());
    marketSnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
    marketSnapshot.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD;
    marketSnapshot.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD;
    marketSnapshot.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
    marketSnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketSnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketSnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketSnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketSnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketSnapshot.inputTokenBalance = market.inputTokenBalance;
    marketSnapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketSnapshot.outputTokenSupply = market.outputTokenSupply;
    marketSnapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
    marketSnapshot.exchangeRate = market.exchangeRate;
    marketSnapshot.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
    marketSnapshot.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
    marketSnapshot.blockNumber = event.block.number;
    marketSnapshot.timestamp = event.block.timestamp;
    marketSnapshot.save();
    return marketSnapshot;
}
exports.getOrCreateMarketSnapshot = getOrCreateMarketSnapshot;
function getOrCreateMarketHourlySnapshot(event, market) {
    const timestamp = event.block.timestamp.toI64();
    const hour = timestamp / constants_1.SECONDS_PER_HOUR;
    const id = `${market.id}-${hour}`;
    let marketSnapshot = schema_1.MarketHourlySnapshot.load(id);
    if (!marketSnapshot) {
        marketSnapshot = new schema_1.MarketHourlySnapshot(id);
        marketSnapshot.protocol = market.protocol;
        marketSnapshot.market = market.id;
        marketSnapshot.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyDepositUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyBorrowUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyWithdrawUSD = constants_1.BIGDECIMAL_ZERO;
        marketSnapshot.hourlyRepayUSD = constants_1.BIGDECIMAL_ZERO;
    }
    marketSnapshot.rates = getSnapshotRates(market.rates, (event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY).toString());
    marketSnapshot.totalValueLockedUSD = market.totalValueLockedUSD;
    marketSnapshot.cumulativeSupplySideRevenueUSD =
        market.cumulativeSupplySideRevenueUSD;
    marketSnapshot.cumulativeProtocolSideRevenueUSD =
        market.cumulativeProtocolSideRevenueUSD;
    marketSnapshot.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD;
    marketSnapshot.totalDepositBalanceUSD = market.totalDepositBalanceUSD;
    marketSnapshot.cumulativeDepositUSD = market.cumulativeDepositUSD;
    marketSnapshot.totalBorrowBalanceUSD = market.totalBorrowBalanceUSD;
    marketSnapshot.cumulativeBorrowUSD = market.cumulativeBorrowUSD;
    marketSnapshot.cumulativeLiquidateUSD = market.cumulativeLiquidateUSD;
    marketSnapshot.inputTokenBalance = market.inputTokenBalance;
    marketSnapshot.inputTokenPriceUSD = market.inputTokenPriceUSD;
    marketSnapshot.outputTokenSupply = market.outputTokenSupply;
    marketSnapshot.outputTokenPriceUSD = market.outputTokenPriceUSD;
    marketSnapshot.exchangeRate = market.exchangeRate;
    marketSnapshot.rewardTokenEmissionsAmount = market.rewardTokenEmissionsAmount;
    marketSnapshot.rewardTokenEmissionsUSD = market.rewardTokenEmissionsUSD;
    marketSnapshot.blockNumber = event.block.number;
    marketSnapshot.timestamp = event.block.timestamp;
    marketSnapshot.save();
    return marketSnapshot;
}
exports.getOrCreateMarketHourlySnapshot = getOrCreateMarketHourlySnapshot;
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
function setMarketVSTDebt(event, asset, debtVST) {
    const debtUSD = (0, numbers_1.bigIntToBigDecimal)(debtVST);
    const market = getOrCreateMarket(asset);
    const debtUSDChange = debtUSD.minus(market.totalBorrowBalanceUSD);
    market.totalBorrowBalanceUSD = debtUSD;
    market.save();
    getOrCreateMarketSnapshot(event, market);
    getOrCreateMarketHourlySnapshot(event, market);
    (0, protocol_1.updateProtocolBorrowBalance)(event, debtUSDChange);
}
exports.setMarketVSTDebt = setMarketVSTDebt;
function setMarketAssetBalance(event, asset, balanceAsset) {
    const assetPrice = (0, token_1.getCurrentAssetPrice)(asset);
    const balanceUSD = (0, numbers_1.bigIntToBigDecimal)(balanceAsset).times(assetPrice);
    const market = getOrCreateMarket(asset);
    const netChangeUSD = balanceUSD.minus(market.totalValueLockedUSD);
    market.totalValueLockedUSD = balanceUSD;
    market.totalDepositBalanceUSD = balanceUSD;
    market.inputToken = asset.toHexString();
    market.inputTokenBalance = balanceAsset;
    market.inputTokenPriceUSD = assetPrice;
    market.save();
    getOrCreateMarketSnapshot(event, market);
    getOrCreateMarketHourlySnapshot(event, market);
    (0, protocol_1.updateProtocolUSDLocked)(event, netChangeUSD);
}
exports.setMarketAssetBalance = setMarketAssetBalance;
function addMarketRepayVolume(event, market, amountUSD) {
    addMarketVolume(event, market, amountUSD, event_1.EventType.Repay);
}
exports.addMarketRepayVolume = addMarketRepayVolume;
function addMarketVolume(event, market, amountUSD, eventType) {
    const dailySnapshot = getOrCreateMarketSnapshot(event, market);
    const hourlySnapshot = getOrCreateMarketHourlySnapshot(event, market);
    switch (eventType) {
        case event_1.EventType.Deposit:
            market.cumulativeDepositUSD = market.cumulativeDepositUSD.plus(amountUSD);
            dailySnapshot.dailyDepositUSD =
                dailySnapshot.dailyDepositUSD.plus(amountUSD);
            hourlySnapshot.hourlyDepositUSD =
                hourlySnapshot.hourlyDepositUSD.plus(amountUSD);
            (0, protocol_1.addProtocolVolume)(event, amountUSD, event_1.EventType.Deposit);
            break;
        case event_1.EventType.Borrow:
            market.cumulativeBorrowUSD = market.cumulativeBorrowUSD.plus(amountUSD);
            dailySnapshot.dailyBorrowUSD =
                dailySnapshot.dailyBorrowUSD.plus(amountUSD);
            hourlySnapshot.hourlyBorrowUSD =
                hourlySnapshot.hourlyBorrowUSD.plus(amountUSD);
            (0, protocol_1.addProtocolVolume)(event, amountUSD, event_1.EventType.Borrow);
            break;
        case event_1.EventType.Liquidate:
            market.cumulativeLiquidateUSD =
                market.cumulativeLiquidateUSD.plus(amountUSD);
            dailySnapshot.dailyLiquidateUSD =
                dailySnapshot.dailyLiquidateUSD.plus(amountUSD);
            hourlySnapshot.hourlyLiquidateUSD =
                hourlySnapshot.hourlyLiquidateUSD.plus(amountUSD);
            (0, protocol_1.addProtocolVolume)(event, amountUSD, event_1.EventType.Liquidate);
            break;
        case event_1.EventType.Withdraw:
            dailySnapshot.dailyWithdrawUSD =
                dailySnapshot.dailyWithdrawUSD.plus(amountUSD);
            hourlySnapshot.hourlyWithdrawUSD =
                hourlySnapshot.hourlyWithdrawUSD.plus(amountUSD);
            (0, protocol_1.addProtocolVolume)(event, amountUSD, event_1.EventType.Withdraw);
            break;
        case event_1.EventType.Repay:
            dailySnapshot.dailyRepayUSD = dailySnapshot.dailyRepayUSD.plus(amountUSD);
            hourlySnapshot.hourlyRepayUSD =
                hourlySnapshot.hourlyRepayUSD.plus(amountUSD);
            (0, protocol_1.addProtocolVolume)(event, amountUSD, event_1.EventType.Repay);
            break;
        default:
            break;
    }
    market.save();
    dailySnapshot.save();
    hourlySnapshot.save();
}
exports.addMarketVolume = addMarketVolume;
function openMarketBorrowerPosition(market) {
    market.openPositionCount += 1;
    market.positionCount += 1;
    market.borrowingPositionCount += 1;
    market.save();
    (0, protocol_1.incrementProtocolPositionCount)();
}
exports.openMarketBorrowerPosition = openMarketBorrowerPosition;
function openMarketLenderPosition(market) {
    market.openPositionCount += 1;
    market.positionCount += 1;
    market.lendingPositionCount += 1;
    market.save();
    (0, protocol_1.incrementProtocolPositionCount)();
}
exports.openMarketLenderPosition = openMarketLenderPosition;
function closeMarketPosition(market) {
    market.openPositionCount -= 1;
    market.closedPositionCount += 1;
    market.save();
    (0, protocol_1.decrementProtocolOpenPositionCount)();
}
exports.closeMarketPosition = closeMarketPosition;
function setMaxLTV(asset) {
    let MaxLTV = constants_1.MAXIMUM_LTV;
    const contract = VestaParameters_1.VestaParameters.bind(graph_ts_1.Address.fromString(constants_1.VESTA_PARAMETERS_ADDRESS));
    const tryMCR = contract.try_MCR(graph_ts_1.Address.fromString(asset));
    if (!tryMCR.reverted && tryMCR.value != constants_1.BIGINT_ZERO) {
        const adjustedMCR = (0, numbers_1.bigIntToBigDecimal)(tryMCR.value);
        MaxLTV = constants_1.BIGDECIMAL_HUNDRED.div(adjustedMCR);
    }
    return MaxLTV;
}
function setLiquidationPenalty(asset) {
    let adjustedBonusToSP = constants_1.BONUS_TO_SP;
    const contract = VestaParameters_1.VestaParameters.bind(graph_ts_1.Address.fromString(constants_1.VESTA_PARAMETERS_ADDRESS));
    const tryBonusToSP = contract.try_BonusToSP(graph_ts_1.Address.fromString(asset));
    if (!tryBonusToSP.reverted) {
        adjustedBonusToSP = (0, numbers_1.bigIntToBigDecimal)(tryBonusToSP.value).times(constants_1.BIGDECIMAL_HUNDRED);
    }
    return adjustedBonusToSP;
}
