"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReserveFeeClaimed = exports.handleReserveFactorSet = exports.handlePauseStatusSet = exports.handlePartialPauseStatusSet = exports.handleP2PStatusSet = exports.handleP2PIndexCursorSet = exports.handleOwnershipTransferred = exports.handleMaxSortedUsersSet = exports.handleIsWithdrawPausedSet = exports.handleIsSupplyPausedSet = exports.handleIsRepayPausedSet = exports.handleIsLiquidateCollateralPausedSet = exports.handleIsLiquidateBorrowPausedSet = exports.handleIsDeprecatedSet = exports.handleIsBorrowPausedSet = exports.handleDefaultMaxGasForMatchingSet = exports.handleRepaid = exports.handleWithdrawn = exports.handleLiquidated = exports.handleP2PIndexesUpdated = exports.handleSupplierPositionUpdated = exports.handleBorrowerPositionUpdated = exports.handleSupplied = exports.handleP2PSupplyDeltaUpdated = exports.handleP2PBorrowDeltaUpdated = exports.handleP2PAmountsUpdated = exports.handleBorrowed = exports.handleMarketCreated = void 0;
const common_1 = require("../common");
const fetchers_1 = require("./fetchers");
const constants_1 = require("../../constants");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../../utils/initializers");
const aaveMath_1 = require("../../utils/maths/aaveMath");
const helpers_1 = require("../../helpers");
var handleMarketCreated_1 = require("./handleMarketCreated");
Object.defineProperty(exports, "handleMarketCreated", { enumerable: true, get: function () { return handleMarketCreated_1.handleMarketCreated; } });
function handleBorrowed(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    (0, common_1._handleBorrowed)(event, protocol, market, event.params._borrower, event.params._amount, event.params._balanceOnPool, event.params._balanceInP2P);
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleBorrowed = handleBorrowed;
function handleP2PAmountsUpdated(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._p2pSupplyAmount = event.params._p2pSupplyAmount;
    market._p2pBorrowAmount = event.params._p2pBorrowAmount;
    (0, helpers_1.updateP2PRates)(market, new aaveMath_1.AaveMath());
    market.save();
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleP2PAmountsUpdated = handleP2PAmountsUpdated;
function handleP2PBorrowDeltaUpdated(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._p2pBorrowDelta = event.params._p2pBorrowDelta;
    (0, helpers_1.updateP2PRates)(market, new aaveMath_1.AaveMath());
    market.save();
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleP2PBorrowDeltaUpdated = handleP2PBorrowDeltaUpdated;
function handleP2PSupplyDeltaUpdated(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._p2pSupplyDelta = event.params._p2pSupplyDelta;
    (0, helpers_1.updateP2PRates)(market, new aaveMath_1.AaveMath());
    market.save();
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleP2PSupplyDeltaUpdated = handleP2PSupplyDeltaUpdated;
function handleSupplied(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    (0, common_1._handleSupplied)(event, (0, fetchers_1.getAaveProtocol)(event.address), market, event.params._onBehalf, event.params._amount, event.params._balanceOnPool, event.params._balanceInP2P);
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleSupplied = handleSupplied;
function handleBorrowerPositionUpdated(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    (0, common_1._handleBorrowerPositionUpdated)(event, protocol, event.params._poolToken, event.params._user, event.params._balanceOnPool, event.params._balanceInP2P);
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleBorrowerPositionUpdated = handleBorrowerPositionUpdated;
function handleSupplierPositionUpdated(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    (0, common_1._handleSupplierPositionUpdated)(event, protocol, event.params._poolToken, event.params._user, event.params._balanceOnPool, event.params._balanceInP2P);
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleSupplierPositionUpdated = handleSupplierPositionUpdated;
function handleP2PIndexesUpdated(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    (0, common_1._handleP2PIndexesUpdated)(event, protocol, market, event.params._poolSupplyIndex, event.params._p2pSupplyIndex, event.params._poolBorrowIndex, event.params._p2pBorrowIndex);
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleP2PIndexesUpdated = handleP2PIndexesUpdated;
function handleLiquidated(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    (0, common_1._handleLiquidated)(event, protocol, event.params._poolTokenCollateral, event.params._poolTokenBorrowed, event.params._liquidator, event.params._liquidated, event.params._amountSeized, event.params._amountRepaid);
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleLiquidated = handleLiquidated;
function handleWithdrawn(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    (0, common_1._handleWithdrawn)(event, protocol, market, event.params._supplier, event.params._amount, event.params._balanceOnPool, event.params._balanceInP2P);
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleWithdrawn = handleWithdrawn;
function handleRepaid(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    (0, common_1._handleRepaid)(event, protocol, market, event.params._onBehalf, event.params._amount, event.params._balanceOnPool, event.params._balanceInP2P);
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleRepaid = handleRepaid;
function handleDefaultMaxGasForMatchingSet(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    protocol._defaultMaxGasForMatchingSupply =
        event.params._defaultMaxGasForMatching.supply;
    protocol._defaultMaxGasForMatchingBorrow =
        event.params._defaultMaxGasForMatching.borrow;
    protocol._defaultMaxGasForMatchingWithdraw =
        event.params._defaultMaxGasForMatching.withdraw;
    protocol._defaultMaxGasForMatchingRepay =
        event.params._defaultMaxGasForMatching.repay;
    protocol.save();
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleDefaultMaxGasForMatchingSet = handleDefaultMaxGasForMatchingSet;
function handleIsBorrowPausedSet(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isBorrowPaused = event.params._isPaused;
    market.save();
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleIsBorrowPausedSet = handleIsBorrowPausedSet;
function handleIsDeprecatedSet(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market.isActive = !event.params._isDeprecated;
    market.save();
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleIsDeprecatedSet = handleIsDeprecatedSet;
function handleIsLiquidateBorrowPausedSet(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isLiquidateBorrowPaused = event.params._isPaused;
    market.save();
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleIsLiquidateBorrowPausedSet = handleIsLiquidateBorrowPausedSet;
function handleIsLiquidateCollateralPausedSet(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isLiquidateCollateralPaused = event.params._isPaused;
    market.save();
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleIsLiquidateCollateralPausedSet = handleIsLiquidateCollateralPausedSet;
function handleIsRepayPausedSet(event) {
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isRepayPaused = event.params._isPaused;
    market.save();
}
exports.handleIsRepayPausedSet = handleIsRepayPausedSet;
function handleIsSupplyPausedSet(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isSupplyPaused = event.params._isPaused;
    market.save();
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleIsSupplyPausedSet = handleIsSupplyPausedSet;
function handleIsWithdrawPausedSet(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isWithdrawPaused = event.params._isPaused;
    market.save();
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleIsWithdrawPausedSet = handleIsWithdrawPausedSet;
function handleMaxSortedUsersSet(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    protocol._maxSortedUsers = event.params._newValue;
    protocol.save();
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleMaxSortedUsersSet = handleMaxSortedUsersSet;
function handleOwnershipTransferred(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    protocol._owner = event.params.newOwner;
    protocol.save();
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleOwnershipTransferred = handleOwnershipTransferred;
function handleP2PIndexCursorSet(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._p2pIndexCursor = graph_ts_1.BigInt.fromI32(event.params._newValue)
        .toBigDecimal()
        .div(constants_1.BASE_UNITS);
    market.save();
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleP2PIndexCursorSet = handleP2PIndexCursorSet;
function handleP2PStatusSet(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isP2PDisabled = event.params._isP2PDisabled;
    market.save();
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleP2PStatusSet = handleP2PStatusSet;
function handlePartialPauseStatusSet(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isBorrowPaused = event.params._newStatus;
    market._isSupplyPaused = event.params._newStatus;
    market.save();
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handlePartialPauseStatusSet = handlePartialPauseStatusSet;
function handlePauseStatusSet(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market._isBorrowPaused = event.params._newStatus;
    market._isSupplyPaused = event.params._newStatus;
    market._isWithdrawPaused = event.params._newStatus;
    market._isRepayPaused = event.params._newStatus;
    market.save();
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handlePauseStatusSet = handlePauseStatusSet;
function handleReserveFactorSet(event) {
    const protocol = (0, fetchers_1.getAaveProtocol)(event.address);
    const market = (0, initializers_1.getMarket)(event.params._poolToken);
    market.reserveFactor = graph_ts_1.BigInt.fromI32(event.params._newValue)
        .toBigDecimal()
        .div(constants_1.BASE_UNITS);
    market.save();
    (0, helpers_1.updateFinancials)(protocol, event.block);
}
exports.handleReserveFactorSet = handleReserveFactorSet;
// Reserve Fee Claimed is emitted when the treasury claims tokens allocated
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
function handleReserveFeeClaimed(event) { }
exports.handleReserveFeeClaimed = handleReserveFeeClaimed;
