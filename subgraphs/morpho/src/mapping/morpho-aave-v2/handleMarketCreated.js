"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMarketCreated = void 0;
const MorphoAaveV2_1 = require("../../../generated/Morpho/MorphoAaveV2");
const fetchers_1 = require("./fetchers");
const constants_1 = require("../../constants");
const ERC20_1 = require("../../../generated/Morpho/ERC20");
const AToken_1 = require("../../../generated/Morpho/AToken");
const helpers_1 = require("../../helpers");
const LendingPool_1 = require("../../../generated/Morpho/LendingPool");
const PriceOracle_1 = require("../../../generated/Morpho/PriceOracle");
const schema_1 = require("../../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../../utils/initializers");
const ProtocolDataProvider_1 = require("../../../generated/Morpho/ProtocolDataProvider");
const LendingPoolAddressesProvider_1 = require("../../../generated/Morpho/LendingPoolAddressesProvider");
function handleMarketCreated(event) {
    // Sync protocol creation since MarketCreated is the first event emitted
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const aToken = AToken_1.AToken.bind(event.params._poolToken);
    const underlying = ERC20_1.ERC20.bind(aToken.UNDERLYING_ASSET_ADDRESS());
    const market = new schema_1.Market(event.params._poolToken);
    const morpho = MorphoAaveV2_1.MorphoAaveV2.bind(event.address);
    const lendingPool = LendingPool_1.LendingPool.bind(morpho.pool());
    const addressProvider = LendingPoolAddressesProvider_1.LendingPoolAddressesProvider.bind(morpho.addressesProvider());
    const oracle = PriceOracle_1.PriceOracle.bind(addressProvider.getPriceOracle());
    const USDC = graph_ts_1.Address.fromString("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
    const ethPrice = oracle.getAssetPrice(USDC);
    const dataProvider = ProtocolDataProvider_1.ProtocolDataProvider.bind(addressProvider.getAddress(graph_ts_1.Bytes.fromHexString("0x01")));
    const reserveConfiguration = dataProvider.getReserveConfigurationData(underlying._address);
    market.protocol = event.address;
    market.name = `Morpho ${aToken.name()}`;
    market.isActive = true;
    market.canBorrowFrom = true;
    market.canUseAsCollateral = true;
    market.maximumLTV = reserveConfiguration
        .getLtv()
        .toBigDecimal()
        .div(constants_1.BASE_UNITS);
    market.liquidationThreshold = reserveConfiguration
        .getLiquidationThreshold()
        .toBigDecimal()
        .div(constants_1.BASE_UNITS);
    market.liquidationPenalty = reserveConfiguration
        .getLiquidationBonus()
        .toBigDecimal()
        .div(constants_1.BASE_UNITS);
    market.canIsolate = false;
    market.createdTimestamp = event.block.timestamp;
    market.createdBlockNumber = event.block.number;
    const token = (0, initializers_1.getOrInitToken)(underlying._address);
    market.inputToken = token.id;
    market.borrowedToken = token.id;
    market.stableBorrowedTokenBalance = graph_ts_1.BigInt.zero(); // There is no stable borrow on Morpho
    market.variableBorrowedTokenBalance = graph_ts_1.BigInt.zero();
    market.inputTokenBalance = underlying.balanceOf(event.params._poolToken);
    market.inputTokenPriceUSD = oracle
        .getAssetPrice(underlying._address)
        .toBigDecimal()
        .div(constants_1.WAD)
        .div(ethPrice.toBigDecimal().div(constants_1.WAD));
    const morphoMarket = morpho.market(event.params._poolToken);
    market.totalValueLockedUSD = graph_ts_1.BigDecimal.zero();
    market.cumulativeSupplySideRevenueUSD = graph_ts_1.BigDecimal.zero();
    market.cumulativeProtocolSideRevenueUSD = graph_ts_1.BigDecimal.zero();
    market.cumulativeTotalRevenueUSD = graph_ts_1.BigDecimal.zero();
    market.totalDepositBalanceUSD = graph_ts_1.BigDecimal.zero();
    market.cumulativeDepositUSD = graph_ts_1.BigDecimal.zero();
    market.totalBorrowBalanceUSD = graph_ts_1.BigDecimal.zero();
    market.cumulativeBorrowUSD = graph_ts_1.BigDecimal.zero();
    market.cumulativeLiquidateUSD = graph_ts_1.BigDecimal.zero();
    market.cumulativeTransferUSD = graph_ts_1.BigDecimal.zero();
    market.cumulativeFlashloanUSD = graph_ts_1.BigDecimal.zero();
    market.transactionCount = 0;
    market.depositCount = 0;
    market.withdrawCount = 0;
    market.borrowCount = 0;
    market.repayCount = 0;
    market.liquidationCount = 0;
    market.transferCount = 0;
    market.flashloanCount = 0;
    market.cumulativeUniqueUsers = 0;
    market.cumulativeUniqueDepositors = 0;
    market.cumulativeUniqueBorrowers = 0;
    market.cumulativeUniqueLiquidators = 0;
    market.cumulativeUniqueLiquidatees = 0;
    market.cumulativeUniqueTransferrers = 0;
    market.cumulativeUniqueFlashloaners = 0;
    market.positionCount = 0;
    market.openPositionCount = 0;
    market.closedPositionCount = 0;
    market.lendingPositionCount = 0;
    market.borrowingPositionCount = 0;
    const morphoPoolIndexes = morpho.poolIndexes(event.params._poolToken);
    const poolReserveData = lendingPool.getReserveData(underlying._address);
    market._reserveSupplyIndex = poolReserveData.liquidityIndex;
    market._reserveBorrowIndex = poolReserveData.variableBorrowIndex;
    market._lastReserveUpdate = poolReserveData.lastUpdateTimestamp; // the current timestamp
    market._poolSupplyRate = poolReserveData.currentLiquidityRate;
    market._poolBorrowRate = poolReserveData.currentVariableBorrowRate;
    market._p2pSupplyIndexFromRates = morpho.p2pSupplyIndex(event.params._poolToken);
    market._p2pBorrowIndexFromRates = morpho.p2pBorrowIndex(event.params._poolToken);
    market._p2pSupplyRate = graph_ts_1.BigInt.zero();
    market._p2pBorrowRate = graph_ts_1.BigInt.zero();
    market._p2pIndexCursor_BI = graph_ts_1.BigInt.zero();
    market._reserveFactor_BI = graph_ts_1.BigInt.zero();
    market._reserveFactor_BI = graph_ts_1.BigInt.zero();
    market._p2pSupplyIndex = morpho.p2pSupplyIndex(event.params._poolToken);
    market._p2pBorrowIndex = morpho.p2pBorrowIndex(event.params._poolToken);
    market._lastPoolSupplyIndex = morphoPoolIndexes.getPoolSupplyIndex();
    market._lastPoolBorrowIndex = morphoPoolIndexes.getPoolBorrowIndex();
    market._lastPoolUpdate = morphoPoolIndexes.getLastUpdateTimestamp();
    market._scaledSupplyOnPool = graph_ts_1.BigInt.zero();
    market._scaledSupplyInP2P = graph_ts_1.BigInt.zero();
    market._scaledBorrowOnPool = graph_ts_1.BigInt.zero();
    market._scaledBorrowInP2P = graph_ts_1.BigInt.zero();
    market._virtualScaledSupply = graph_ts_1.BigInt.zero();
    market._virtualScaledBorrow = graph_ts_1.BigInt.zero();
    market._isP2PDisabled = morphoMarket.getIsP2PDisabled();
    market.reserveFactor = graph_ts_1.BigInt.fromI32(morphoMarket.getReserveFactor())
        .toBigDecimal()
        .div(constants_1.BASE_UNITS);
    market._p2pIndexCursor = graph_ts_1.BigInt.fromI32(morphoMarket.getP2pIndexCursor())
        .toBigDecimal()
        .div(constants_1.BASE_UNITS);
    market._totalSupplyOnPool = graph_ts_1.BigDecimal.zero();
    market._totalBorrowOnPool = graph_ts_1.BigDecimal.zero();
    market._totalSupplyInP2P = graph_ts_1.BigDecimal.zero();
    market._totalBorrowInP2P = graph_ts_1.BigDecimal.zero();
    const deltas = morpho.deltas(event.params._poolToken);
    market._p2pSupplyAmount = deltas.getP2pSupplyAmount();
    market._p2pBorrowAmount = deltas.getP2pBorrowAmount();
    market._p2pSupplyDelta = deltas.getP2pSupplyDelta();
    market._p2pBorrowDelta = deltas.getP2pBorrowDelta();
    market._poolSupplyAmount = graph_ts_1.BigInt.zero();
    market._poolBorrowAmount = graph_ts_1.BigInt.zero();
    const tokenMapping = new schema_1.UnderlyingTokenMapping(underlying._address);
    tokenMapping.aToken = event.params._poolToken;
    const tokenAddresses = dataProvider.getReserveTokensAddresses(underlying._address);
    tokenMapping.debtToken = tokenAddresses.getVariableDebtTokenAddress();
    tokenMapping.save();
    market._isSupplyPaused = false;
    market._isBorrowPaused = false;
    market._isWithdrawPaused = false;
    market._isRepayPaused = false;
    market._isLiquidateBorrowPaused = false;
    market._isLiquidateCollateralPaused = false;
    market._poolSupplyInterests = graph_ts_1.BigDecimal.zero();
    market._poolBorrowInterests = graph_ts_1.BigDecimal.zero();
    market._p2pSupplyInterests = graph_ts_1.BigDecimal.zero();
    market._p2pBorrowInterests = graph_ts_1.BigDecimal.zero();
    market._p2pBorrowInterestsImprovement = graph_ts_1.BigDecimal.zero();
    market._p2pBorrowInterestsImprovementUSD = graph_ts_1.BigDecimal.zero();
    market._p2pSupplyInterestsImprovement = graph_ts_1.BigDecimal.zero();
    market._p2pSupplyInterestsImprovementUSD = graph_ts_1.BigDecimal.zero();
    market._poolSupplyInterestsUSD = graph_ts_1.BigDecimal.zero();
    market._poolBorrowInterestsUSD = graph_ts_1.BigDecimal.zero();
    market._p2pSupplyInterestsUSD = graph_ts_1.BigDecimal.zero();
    market._p2pBorrowInterestsUSD = graph_ts_1.BigDecimal.zero();
    market._indexesOffset = 27;
    market.rates = [];
    market.save();
    const list = (0, initializers_1.getOrInitMarketList)(event.address);
    const markets = list.markets;
    list.markets = markets.concat([market.id]);
    list.save();
    (0, helpers_1.updateProtocolAfterNewMarket)(market.id, protocol.id);
}
exports.handleMarketCreated = handleMarketCreated;
