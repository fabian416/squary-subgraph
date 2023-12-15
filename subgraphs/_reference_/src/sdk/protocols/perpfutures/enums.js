"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityType =
  exports.EventType =
  exports.PositionType =
  exports.TransactionType =
    void 0;
var TransactionType;
(function (TransactionType) {
  TransactionType.DEPOSIT = "DEPOSIT";
  TransactionType.WITHDRAW = "WITHDRAW";
  TransactionType.BORROW = "BORROW";
  TransactionType.SWAP = "SWAP";
  TransactionType.COLLATERAL_IN = "COLLATERAL_IN";
  TransactionType.COLLATERAL_OUT = "COLLATERAL_OUT";
  TransactionType.LIQUIDATE = "LIQUIDATE";
})(
  (TransactionType = exports.TransactionType || (exports.TransactionType = {}))
);
var PositionType;
(function (PositionType) {
  PositionType.LONG = "LONG";
  PositionType.SHORT = "SHORT";
})((PositionType = exports.PositionType || (exports.PositionType = {})));
var EventType;
(function (EventType) {
  EventType.DEPOSIT = "DEPOSIT";
  EventType.WITHDRAW = "WITHDRAW";
  EventType.SWAP = "SWAP";
  EventType.LIQUIDATE = "LIQUIDATE";
})((EventType = exports.EventType || (exports.EventType = {})));
var ActivityType;
(function (ActivityType) {
  ActivityType.LIQUIDATOR = "LIQUIDATOR";
  ActivityType.LIQUIDATEE = "LIQUIDATEE";
  ActivityType.DEPOSIT = "DEPOSIT";
  ActivityType.BORROW = "BORROW";
})((ActivityType = exports.ActivityType || (exports.ActivityType = {})));
