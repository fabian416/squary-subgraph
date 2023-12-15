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
exports.getTokenDecimals = exports.readValue = void 0;
const constants = __importStar(require("./constants"));
const ERC20_1 = require("../../../generated/Standard/ERC20");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function readValue(callResult, defaultValue) {
  return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
function getTokenDecimals(tokenAddr) {
  const token = ERC20_1.ERC20.bind(tokenAddr);
  const decimals = token.try_decimals();
  if (decimals.reverted) {
    return constants.DEFAULT_DECIMALS;
  }
  return graph_ts_1.BigInt.fromI32(decimals.value);
}
exports.getTokenDecimals = getTokenDecimals;
