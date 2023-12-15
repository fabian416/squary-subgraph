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
exports.PoolFeesType = void 0;
const constants = __importStar(require("../common/constants"));
class PoolFeesType {
  constructor(depositFees, withdrawalFees, performanceFees) {
    this._depositFees = depositFees;
    this._withdrawalFees = withdrawalFees;
    this._performanceFees = performanceFees;
  }
  get getDepositFeesId() {
    return this._depositFees.id;
  }
  get getWithdrawalFeesId() {
    return this._withdrawalFees.id;
  }
  get getPerformanceFeesId() {
    return this._performanceFees.id;
  }
  get getDepositFees() {
    return this._depositFees.feePercentage.div(constants.BIGDECIMAL_HUNDRED);
  }
  get getWithdrawalFees() {
    return this._withdrawalFees.feePercentage.div(constants.BIGDECIMAL_HUNDRED);
  }
  get getPerformanceFees() {
    return this._performanceFees.feePercentage.div(
      constants.BIGDECIMAL_HUNDRED
    );
  }
  stringIds() {
    return [
      this.getDepositFeesId,
      this.getWithdrawalFeesId,
      this.getPerformanceFeesId,
    ];
  }
}
exports.PoolFeesType = PoolFeesType;
