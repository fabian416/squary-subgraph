"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompoundRewards = exports.handleReserveFeeClaimed = exports.handleReserveFactorSet = exports.handlePauseStatusSet = exports.handlePartialPauseStatusSet = exports.handleP2PStatusSet = exports.handleP2PIndexCursorSet = exports.handleOwnershipTransferred = exports.handleMaxSortedUsersSet = exports.handleIsWithdrawPausedSet = exports.handleIsSupplyPausedSet = exports.handleIsRepayPausedSet = exports.handleIsLiquidateCollateralPausedSet = exports.handleIsLiquidateBorrowPausedSet = exports.handleIsDeprecatedSet = exports.handleIsBorrowPausedSet = exports.handleDefaultMaxGasForMatchingSet = exports.handleWithdrawn = exports.handleSupplierPositionUpdated = exports.handleSupplied = exports.handleRepaid = exports.handleP2PSupplyDeltaUpdated = exports.handleP2PBorrowDeltaUpdated = exports.handleP2PAmountsUpdated = exports.handleLiquidated = exports.handleBorrowerPositionUpdated = exports.handleBorrowed = exports.handleP2PIndexesUpdated = exports.handleMarketCreated = void 0;
const constants_1 = require("../../constants");
const common_1 = require("../common");
const fetchers_1 = require("./fetchers");
const helpers_1 = require("../../helpers");
const CToken_1 = require("../../../generated/Morpho/CToken");
const schema_1 = require("../../../generated/schema");
const Comptroller_1 = require("../../../generated/Morpho/Comptroller");
const CompoundOracle_1 = require("../../../generated/Morpho/CompoundOracle");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../../utils/initializers");
var handleMarketCreated_1 = require("./handleMarketCreated");
Object.defineProperty(exports, "handleMarketCreated", { enumerable: true, get: function () { return handleMarketCreated_1.handleMarketCreated; } });
function handleP2PIndexesUpdated(event) {
    const protocol = (0, fetchers_1.getCompoundProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    (0, common_1._handleP2PIndexesUpdated)(event, protocol, market, event.params._poolSupplyIndex, event.params._p2pSupplyIndex, event.params._poolBorrowIndex, event.params._p2pBorrowIndex);
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleP2PIndexesUpdated = handleP2PIndexesUpdated;
function handleBorrowed(event) {
    const protocol = (0, fetchers_1.getCompoundProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    (0, common_1._handleBorrowed)(event, protocol, market, event.params._borrower, event.params._amount, event.params._balanceOnPool, event.params._balanceInP2P);
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleBorrowed = handleBorrowed;
function handleBorrowerPositionUpdated(event) {
    const protocol = (0, fetchers_1.getCompoundProtocol)(event.address);
    (0, common_1._handleBorrowerPositionUpdated)(event, protocol, event.params._poolToken, event.params._user, event.params._balanceOnPool, event.params._balanceInP2P);
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleBorrowerPositionUpdated = handleBorrowerPositionUpdated;
function handleLiquidated(event) {
    const protocol = (0, fetchers_1.getCompoundProtocol)(event.address);
    (0, common_1._handleLiquidated)(event, protocol, event.params._poolTokenCollateralAddress, event.params._poolTokenBorrowedAddress, event.params._liquidator, event.params._liquidated, event.params._amountSeized, event.params._amountRepaid);
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleLiquidated = handleLiquidated;
function handleP2PAmountsUpdated(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._p2pSupplyAmount = event.params._p2pSupplyAmount;
    market._p2pBorrowAmount = event.params._p2pBorrowAmount;
    market.save();
}
exports.handleP2PAmountsUpdated = handleP2PAmountsUpdated;
function handleP2PBorrowDeltaUpdated(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._p2pBorrowDelta = event.params._p2pBorrowDelta;
    market.save();
}
exports.handleP2PBorrowDeltaUpdated = handleP2PBorrowDeltaUpdated;
function handleP2PSupplyDeltaUpdated(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._p2pSupplyDelta = event.params._p2pSupplyDelta;
    market.save();
}
exports.handleP2PSupplyDeltaUpdated = handleP2PSupplyDeltaUpdated;
function handleRepaid(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    (0, common_1._handleRepaid)(event, (0, fetchers_1.getCompoundProtocol)(event.address), market, event.params._onBehalf, event.params._amount, event.params._balanceOnPool, event.params._balanceInP2P);
}
exports.handleRepaid = handleRepaid;
function handleSupplied(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    (0, common_1._handleSupplied)(event, (0, fetchers_1.getCompoundProtocol)(event.address), market, event.params._supplier, event.params._amount, event.params._balanceOnPool, event.params._balanceInP2P);
    updateCompoundRewards(market);
}
exports.handleSupplied = handleSupplied;
function handleSupplierPositionUpdated(event) {
    (0, common_1._handleSupplierPositionUpdated)(event, (0, fetchers_1.getCompoundProtocol)(event.address), event.params._poolToken, event.params._user, event.params._balanceOnPool, event.params._balanceInP2P);
}
exports.handleSupplierPositionUpdated = handleSupplierPositionUpdated;
function handleWithdrawn(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    (0, common_1._handleWithdrawn)(event, (0, fetchers_1.getCompoundProtocol)(event.address), market, event.params._supplier, event.params._amount, event.params._balanceOnPool, event.params._balanceInP2P);
    updateCompoundRewards(market);
}
exports.handleWithdrawn = handleWithdrawn;
function handleDefaultMaxGasForMatchingSet(event) {
    const protocol = (0, fetchers_1.getCompoundProtocol)(event.address);
    protocol._defaultMaxGasForMatchingWithdraw =
        event.params._defaultMaxGasForMatching.withdraw;
    protocol._defaultMaxGasForMatchingSupply =
        event.params._defaultMaxGasForMatching.supply;
    protocol._defaultMaxGasForMatchingBorrow =
        event.params._defaultMaxGasForMatching.borrow;
    protocol._defaultMaxGasForMatchingRepay =
        event.params._defaultMaxGasForMatching.repay;
}
exports.handleDefaultMaxGasForMatchingSet = handleDefaultMaxGasForMatchingSet;
function handleIsBorrowPausedSet(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isBorrowPaused = event.params._isPaused;
    market.save();
}
exports.handleIsBorrowPausedSet = handleIsBorrowPausedSet;
function handleIsDeprecatedSet(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market.isActive = !event.params._isDeprecated;
    market.save();
}
exports.handleIsDeprecatedSet = handleIsDeprecatedSet;
function handleIsLiquidateBorrowPausedSet(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isLiquidateBorrowPaused = event.params._isPaused;
    market.save();
}
exports.handleIsLiquidateBorrowPausedSet = handleIsLiquidateBorrowPausedSet;
function handleIsLiquidateCollateralPausedSet(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isLiquidateCollateralPaused = event.params._isPaused;
    market.save();
}
exports.handleIsLiquidateCollateralPausedSet = handleIsLiquidateCollateralPausedSet;
function handleIsRepayPausedSet(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isRepayPaused = event.params._isPaused;
    market.save();
}
exports.handleIsRepayPausedSet = handleIsRepayPausedSet;
function handleIsSupplyPausedSet(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isSupplyPaused = event.params._isPaused;
    market.save();
}
exports.handleIsSupplyPausedSet = handleIsSupplyPausedSet;
function handleIsWithdrawPausedSet(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isWithdrawPaused = event.params._isPaused;
    market.save();
}
exports.handleIsWithdrawPausedSet = handleIsWithdrawPausedSet;
function handleMaxSortedUsersSet(event) {
    const protocol = (0, fetchers_1.getCompoundProtocol)(event.address);
    protocol._maxSortedUsers = event.params._newValue;
    protocol.save();
}
exports.handleMaxSortedUsersSet = handleMaxSortedUsersSet;
function handleOwnershipTransferred(event) {
    const protocol = (0, fetchers_1.getCompoundProtocol)(event.address);
    protocol._owner = event.params.newOwner;
    protocol.save();
}
exports.handleOwnershipTransferred = handleOwnershipTransferred;
function handleP2PIndexCursorSet(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._p2pIndexCursor = graph_ts_1.BigInt.fromI32(event.params._newValue)
        .toBigDecimal()
        .div(constants_1.BASE_UNITS);
    market.save();
}
exports.handleP2PIndexCursorSet = handleP2PIndexCursorSet;
function handleP2PStatusSet(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isP2PDisabled = event.params._isP2PDisabled;
    market.save();
}
exports.handleP2PStatusSet = handleP2PStatusSet;
function handlePartialPauseStatusSet(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isSupplyPaused = event.params._newStatus;
    market._isBorrowPaused = event.params._newStatus;
    market.save();
}
exports.handlePartialPauseStatusSet = handlePartialPauseStatusSet;
function handlePauseStatusSet(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isSupplyPaused = event.params._newStatus;
    market._isBorrowPaused = event.params._newStatus;
    market._isRepayPaused = event.params._newStatus;
    market._isWithdrawPaused = event.params._newStatus;
    market._isLiquidateBorrowPaused = event.params._newStatus;
    market._isLiquidateCollateralPaused = event.params._newStatus;
    market.save();
}
exports.handlePauseStatusSet = handlePauseStatusSet;
function handleReserveFactorSet(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market.reserveFactor = graph_ts_1.BigInt.fromI32(event.params._newValue)
        .toBigDecimal()
        .div(constants_1.BASE_UNITS);
    market.save();
}
exports.handleReserveFactorSet = handleReserveFactorSet;
// Emitted when the treasury claims allocated tokens
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
function handleReserveFeeClaimed(event) { }
exports.handleReserveFeeClaimed = handleReserveFeeClaimed;
// Update $COMP distributed rewards
function updateCompoundRewards(market) {
    // DEPOSIT first because it alphabetizes
    const rewardTokens = [
        (0, initializers_1.getOrCreateRewardToken)(constants_1.COMP_ADDRESS, constants_1.RewardTokenType.DEPOSIT).id,
        (0, initializers_1.getOrCreateRewardToken)(constants_1.COMP_ADDRESS, constants_1.RewardTokenType.VARIABLE_BORROW).id,
    ];
    const amounts = [graph_ts_1.BigInt.zero(), graph_ts_1.BigInt.zero()];
    const amountsUSD = [graph_ts_1.BigDecimal.zero(), graph_ts_1.BigDecimal.zero()];
    // get token amount in Compound market
    const cTokenContract = CToken_1.CToken.bind(graph_ts_1.Address.fromBytes(market.id));
    const tryCTokenAmount = cTokenContract.try_totalSupply();
    const tryBalanceOf = cTokenContract.try_balanceOf(constants_1.MORPHO_COMPOUND_ADDRESS);
    if (tryCTokenAmount.reverted || tryBalanceOf.reverted) {
        graph_ts_1.log.error("[updateCompoundRewards] cTokenContract.try_totalSupply() or cTokenContract.try_balanceOf(MORPHO_COMPOUND_ADDRESS) reverted for market: {}", [market.id.toHexString()]);
        return;
    }
    const morphoShare = tryBalanceOf.value
        .toBigDecimal()
        .div(tryCTokenAmount.value.toBigDecimal());
    // get COMP reward rate per side
    const comptrollerContract = Comptroller_1.Comptroller.bind(constants_1.COMPTROLLER_ADDRESS);
    const trySupplySpeed = comptrollerContract.try_compSupplySpeeds(graph_ts_1.Address.fromBytes(market.id));
    const tryBorrowSpeed = comptrollerContract.try_compBorrowSpeeds(graph_ts_1.Address.fromBytes(market.id));
    if (trySupplySpeed.reverted || tryBorrowSpeed.reverted) {
        graph_ts_1.log.error("[updateCompoundRewards] comptrollerContract.try_compSupplySpeeds(market.id) or comptrollerContract.try_compBorrowSpeeds(market.id) reverted for market: {}", [market.id.toHexString()]);
        return;
    }
    // get COMP price in USD
    const protocol = schema_1.LendingProtocol.load(market.protocol);
    if (!protocol) {
        graph_ts_1.log.error("[updateCompoundRewards] protocol not found for protocol: {}", [
            market.protocol.toHexString(),
        ]);
        return;
    }
    let priceUSD = graph_ts_1.BigDecimal.zero();
    if (protocol._oracle) {
        const oracleContract = CompoundOracle_1.CompoundOracle.bind(graph_ts_1.Address.fromBytes(protocol._oracle));
        const tryPriceUSD = oracleContract.try_getUnderlyingPrice(constants_1.CCOMP_ADDRESS);
        const bdFactor = (0, constants_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS);
        if (!tryPriceUSD.reverted) {
            priceUSD = tryPriceUSD.value.toBigDecimal().div(bdFactor);
        }
    }
    // set COMP rewards
    amounts[0] = graph_ts_1.BigInt.fromString(trySupplySpeed.value
        .toBigDecimal()
        .times(morphoShare)
        .times(constants_1.BLOCKS_PER_DAY.toBigDecimal())
        .truncate(0)
        .toString());
    amounts[1] = graph_ts_1.BigInt.fromString(tryBorrowSpeed.value
        .toBigDecimal()
        .times(morphoShare)
        .times(constants_1.BLOCKS_PER_DAY.toBigDecimal())
        .truncate(0)
        .toString());
    amountsUSD[0] = amounts[0]
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS))
        .times(priceUSD);
    amountsUSD[1] = amounts[1]
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS))
        .times(priceUSD);
    market.rewardTokens = rewardTokens;
    market.rewardTokenEmissionsAmount = amounts;
    market.rewardTokenEmissionsUSD = amountsUSD;
    market.save();
}
exports.updateCompoundRewards = updateCompoundRewards;
