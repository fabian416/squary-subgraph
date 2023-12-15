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
exports.CustomPriceType =
  exports.ContractInfo =
  exports.TokenInfo =
  exports.Wrapped =
    void 0;
const constants = __importStar(require("./constants"));
class Wrapped {
  constructor(inner) {
    this.inner = inner;
  }
}
exports.Wrapped = Wrapped;
class TokenInfo {
  constructor() {
    this._name = "";
    this._decimals = constants.DEFAULT_USDC_DECIMALS;
    this._address = constants.NULL.TYPE_ADDRESS;
  }
  static set(name, decimals, address, isStable = true) {
    const instance = new TokenInfo();
    instance._name = name;
    instance._decimals = decimals;
    instance._address = address;
    instance._isStable = isStable;
    return instance;
  }
  get name() {
    return this._name;
  }
  get decimals() {
    return this._decimals;
  }
  get address() {
    return this._address;
  }
  get isStable() {
    return this._isStable;
  }
}
exports.TokenInfo = TokenInfo;
class ContractInfo {
  constructor() {
    this._address = constants.NULL.TYPE_ADDRESS;
    this._startBlock = constants.BIGINT_ZERO;
  }
  static set(address, startBlock) {
    const instance = new ContractInfo();
    instance._address = address;
    instance._startBlock = startBlock;
    return instance;
  }
  get address() {
    return this._address;
  }
  get startBlock() {
    return this._startBlock;
  }
}
exports.ContractInfo = ContractInfo;
class CustomPriceType {
  constructor() {
    this._usdPrice = new Wrapped(constants.BIGDECIMAL_ZERO);
    this._decimals = new Wrapped(constants.BIGINT_ZERO.toI32());
    this._oracleType = "";
  }
  static initialize(_usdPrice, _decimals = 0, _oracleType = "") {
    const instance = new CustomPriceType();
    instance._usdPrice = new Wrapped(_usdPrice);
    instance._decimals = new Wrapped(_decimals);
    instance._oracleType = _oracleType;
    return instance;
  }
  static initializePegged(
    _usdPrice = constants.BIGDECIMAL_USD_PRICE,
    _decimals = constants.DEFAULT_USDC_DECIMALS,
    _oracleType = "HardcodedStable"
  ) {
    const result = new CustomPriceType();
    result._usdPrice = new Wrapped(_usdPrice);
    result._decimals = new Wrapped(_decimals);
    result._oracleType = _oracleType;
    return result;
  }
  get reverted() {
    return this._usdPrice.inner == constants.BIGDECIMAL_ZERO;
  }
  get usdPrice() {
    return changetype(this._usdPrice).inner.div(
      constants.BIGINT_TEN.pow(this.decimals).toBigDecimal()
    );
  }
  get decimals() {
    return changetype(this._decimals).inner;
  }
  get oracleType() {
    return this._oracleType;
  }
}
exports.CustomPriceType = CustomPriceType;
