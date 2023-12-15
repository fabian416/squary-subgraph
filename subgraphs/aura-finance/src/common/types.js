"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolTokensType = exports.CustomFeesType = exports.PoolInfoType = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../common/constants");
class PoolInfoType {
  constructor(result) {
    this._lpToken = new graph_ts_1.Wrapped(result.value0);
    this._token = new graph_ts_1.Wrapped(result.value1);
    this._gauge = new graph_ts_1.Wrapped(result.value2);
    this._crvRewards = new graph_ts_1.Wrapped(result.value3);
    this._stash = new graph_ts_1.Wrapped(result.value4);
    this._shutdown = new graph_ts_1.Wrapped(result.value5);
  }
  get lpToken() {
    return changetype(this._lpToken).inner;
  }
  get token() {
    return changetype(this._token).inner;
  }
  get gauge() {
    return changetype(this._gauge).inner;
  }
  get crvRewards() {
    return changetype(this._crvRewards).inner;
  }
  get stash() {
    return changetype(this._stash).inner;
  }
  get shutdown() {
    return changetype(this._shutdown).inner;
  }
}
exports.PoolInfoType = PoolInfoType;
class CustomFeesType {
  constructor(lockIncentive, callIncentive, stakerIncentive, platformFee) {
    this._lockIncentive = lockIncentive;
    this._callIncentive = callIncentive;
    this._stakerIncentive = stakerIncentive;
    this._platformFee = platformFee;
  }
  get lockIncentive() {
    return this._lockIncentive.toBigDecimal().div(constants_1.FEE_DENOMINATOR);
  }
  get callIncentive() {
    return this._callIncentive.toBigDecimal().div(constants_1.FEE_DENOMINATOR);
  }
  get stakerIncentive() {
    return this._stakerIncentive
      .toBigDecimal()
      .div(constants_1.FEE_DENOMINATOR);
  }
  get platformFee() {
    return this._platformFee.toBigDecimal().div(constants_1.FEE_DENOMINATOR);
  }
  totalFees() {
    return this.lockIncentive
      .plus(this.callIncentive)
      .plus(this.stakerIncentive)
      .plus(this.platformFee);
  }
}
exports.CustomFeesType = CustomFeesType;
class PoolTokensType {
  constructor(poolAddress, supply, tokens = [], balances = []) {
    this._poolAddress = poolAddress;
    this._tokens = tokens;
    this._balances = balances;
    this._supply = supply;
    this._popIndex = -1;
  }
  get getInputTokens() {
    const inputTokens = [];
    for (let idx = 0; idx < this._tokens.length; idx++) {
      if (this._tokens.at(idx) == this._poolAddress) {
        this._popIndex = idx;
        continue;
      }
      inputTokens.push(this._tokens.at(idx).toHexString());
    }
    return inputTokens;
  }
  get getBalances() {
    const balances = [];
    for (let idx = 0; idx < this._tokens.length; idx++) {
      if (idx == this._popIndex) {
        continue;
      }
      balances.push(this._balances.at(idx));
    }
    return balances;
  }
  get getSupply() {
    return this._supply;
  }
  get getPopIndex() {
    return this._popIndex;
  }
}
exports.PoolTokensType = PoolTokensType;
