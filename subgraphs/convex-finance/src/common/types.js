"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomFeesType = exports.PoolInfoType = void 0;
const constants = __importStar(require("../common/constants"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
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
    return this._lockIncentive.toBigDecimal().div(constants.DENOMINATOR);
  }
  get callIncentive() {
    return this._callIncentive.toBigDecimal().div(constants.DENOMINATOR);
  }
  get stakerIncentive() {
    return this._stakerIncentive.toBigDecimal().div(constants.DENOMINATOR);
  }
  get platformFee() {
    return this._platformFee.toBigDecimal().div(constants.DENOMINATOR);
  }
  totalFees() {
    return this.lockIncentive
      .plus(this.callIncentive)
      .plus(this.stakerIncentive)
      .plus(this.platformFee);
  }
}
exports.CustomFeesType = CustomFeesType;
