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
exports.max =
  exports.min =
  exports.getHighestBiddersAddress =
  exports.getSellerAddressFromPunksOfferedForSale =
  exports.getStrategy =
    void 0;
const cryptopunkContract_1 = require("../../generated/cryptopunkContract/cryptopunkContract");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants = __importStar(require("./constants"));
function getStrategy(punkIndex, buyer) {
  const contract = cryptopunkContract_1.cryptopunkContract.bind(
    graph_ts_1.Address.fromString(constants.CRYPTOPUNK_CONTRACT_ADDRESS)
  );
  return contract.try_punksOfferedForSale(punkIndex).value.value4.equals(buyer)
    ? constants.SaleStrategy.PRIVATE_SALE
    : constants.SaleStrategy.STANDARD_SALE;
}
exports.getStrategy = getStrategy;
function getSellerAddressFromPunksOfferedForSale(punkIndex) {
  const contract = cryptopunkContract_1.cryptopunkContract.bind(
    graph_ts_1.Address.fromString(constants.CRYPTOPUNK_CONTRACT_ADDRESS)
  );
  return contract.try_punksOfferedForSale(punkIndex).value.value2;
}
exports.getSellerAddressFromPunksOfferedForSale =
  getSellerAddressFromPunksOfferedForSale;
function getHighestBiddersAddress(punkIndex) {
  const contract = cryptopunkContract_1.cryptopunkContract.bind(
    graph_ts_1.Address.fromString(constants.CRYPTOPUNK_CONTRACT_ADDRESS)
  );
  return contract.try_punkIndexToAddress(punkIndex).value;
}
exports.getHighestBiddersAddress = getHighestBiddersAddress;
function min(a, b) {
  return a < b ? a : b;
}
exports.min = min;
function max(a, b) {
  return a > b ? a : b;
}
exports.max = max;
