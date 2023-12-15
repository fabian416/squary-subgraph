"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMarketCreated = void 0;
const constants_1 = require("../../constants");
const MorphoCompound_1 = require("../../../generated/Morpho/MorphoCompound");
const fetchers_1 = require("./fetchers");
const schema_1 = require("../../../generated/schema");
const CToken_1 = require("../../../generated/Morpho/CToken");
const helpers_1 = require("../../helpers");
const Comptroller_1 = require("../../../generated/Morpho/Comptroller");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const templates_1 = require("../../../generated/templates");
const CompoundOracle_1 = require("../../../generated/Morpho/CompoundOracle");
const initializers_1 = require("../../utils/initializers");
function handleMarketCreated(event) {
    // Sync protocol creation since MarketCreated is the first event emitted
    const protocol = (0, fetchers_1.getCompoundProtocol)(event.address);
    templates_1.CToken.create(event.params._poolToken);
    const morpho = MorphoCompound_1.MorphoCompound.bind(event.address);
    const cToken = CToken_1.CToken.bind(event.params._poolToken);
    const comptroller = Comptroller_1.Comptroller.bind(morpho.comptroller());
    const priceOracle = CompoundOracle_1.CompoundOracle.bind(comptroller.oracle());
    let underlying;
    if (event.params._poolToken.equals(constants_1.C_ETH))
        underlying = constants_1.WRAPPED_ETH;
    else
        underlying = cToken.underlying();
    const inputToken = (0, initializers_1.getOrInitToken)(underlying);
    const usdPrice = priceOracle
        .getUnderlyingPrice(event.params._poolToken)
        .toBigDecimal()
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        .div((0, constants_1.exponentToBigDecimal)(36 - inputToken.decimals));
    const market = new schema_1.Market(event.params._poolToken);
    market.protocol = event.address;
    market.name = `Morpho ${cToken.name()}`;
    market.isActive = true;
    market.canBorrowFrom = true;
    market.canUseAsCollateral = true;
    const compMarket = comptroller.markets(event.params._poolToken);
    market.maximumLTV = compMarket
        .getCollateralFactorMantissa()
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS));
    market.liquidationThreshold = market.maximumLTV;
    market.liquidationPenalty = comptroller
        .liquidationIncentiveMantissa()
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS))
        .minus(constants_1.BIGDECIMAL_ONE);
    market.canIsolate = false;
    market.createdTimestamp = event.block.timestamp;
    market.createdBlockNumber = event.block.number;
    market.inputToken = inputToken.id;
    market.borrowedToken = inputToken.id;
    market.stableBorrowedTokenBalance = graph_ts_1.BigInt.zero(); // There is no stable borrow on Morpho
    market.variableBorrowedTokenBalance = graph_ts_1.BigInt.zero();
    market.inputTokenBalance = cToken.getCash();
    market.inputTokenPriceUSD = usdPrice;
    const morphoMarket = morpho.marketParameters(event.params._poolToken);
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
    const morphoPoolIndexes = morpho.lastPoolIndexes(event.params._poolToken);
    market._reserveSupplyIndex = cToken.exchangeRateStored();
    market._reserveBorrowIndex = cToken.borrowIndex();
    market._lastReserveUpdate = cToken.accrualBlockNumber();
    market._poolSupplyRate = cToken.supplyRatePerBlock();
    market._poolBorrowRate = cToken.borrowRatePerBlock();
    market._p2pSupplyIndex = morpho.p2pSupplyIndex(event.params._poolToken);
    market._p2pBorrowIndex = morpho.p2pBorrowIndex(event.params._poolToken);
    market._p2pSupplyIndexFromRates = morpho.p2pSupplyIndex(event.params._poolToken);
    market._p2pBorrowIndexFromRates = morpho.p2pBorrowIndex(event.params._poolToken);
    market._p2pSupplyRate = graph_ts_1.BigInt.zero();
    market._p2pBorrowRate = graph_ts_1.BigInt.zero();
    market._lastPoolSupplyIndex = morphoPoolIndexes.getLastSupplyPoolIndex();
    market._lastPoolBorrowIndex = morphoPoolIndexes.getLastBorrowPoolIndex();
    market._lastPoolUpdate = morphoPoolIndexes.getLastUpdateBlockNumber();
    market._isP2PDisabled = morpho.p2pDisabled(event.params._poolToken);
    const reserveFactor = graph_ts_1.BigInt.fromI32(morphoMarket.getReserveFactor());
    const p2pIndexCursor = graph_ts_1.BigInt.fromI32(morphoMarket.getP2pIndexCursor());
    market.reserveFactor = reserveFactor.toBigDecimal().div(constants_1.BASE_UNITS);
    market._reserveFactor_BI = reserveFactor;
    market._p2pIndexCursor = p2pIndexCursor.toBigDecimal().div(constants_1.BASE_UNITS);
    market._p2pIndexCursor_BI = p2pIndexCursor;
    market._totalSupplyOnPool = graph_ts_1.BigDecimal.zero();
    market._totalBorrowOnPool = graph_ts_1.BigDecimal.zero();
    market._totalSupplyInP2P = graph_ts_1.BigDecimal.zero();
    market._totalBorrowInP2P = graph_ts_1.BigDecimal.zero();
    const delta = morpho.deltas(event.params._poolToken);
    market._p2pSupplyDelta = delta.getP2pSupplyDelta();
    market._p2pBorrowDelta = delta.getP2pBorrowDelta();
    market._p2pSupplyAmount = delta.getP2pSupplyAmount();
    market._p2pBorrowAmount = delta.getP2pBorrowAmount();
    market._scaledSupplyOnPool = graph_ts_1.BigInt.zero();
    market._scaledSupplyInP2P = graph_ts_1.BigInt.zero();
    market._scaledBorrowOnPool = graph_ts_1.BigInt.zero();
    market._scaledBorrowInP2P = graph_ts_1.BigInt.zero();
    market._virtualScaledSupply = graph_ts_1.BigInt.zero();
    market._virtualScaledBorrow = graph_ts_1.BigInt.zero();
    market._poolSupplyAmount = graph_ts_1.BigInt.zero();
    market._poolBorrowAmount = graph_ts_1.BigInt.zero();
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
    market._indexesOffset = 18;
    market.rates = [];
    // Compound borrow cap
    market.borrowCap = comptroller.borrowCaps(event.params._poolToken);
    market.save();
    const list = (0, initializers_1.getOrInitMarketList)(event.address);
    const markets = list.markets;
    list.markets = markets.concat([market.id]);
    list.save();
    (0, helpers_1.updateProtocolAfterNewMarket)(market.id, protocol.id);
}
exports.handleMarketCreated = handleMarketCreated;
