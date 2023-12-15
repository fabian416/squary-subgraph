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
exports.getPriceOfOutputTokens = exports.getPricePerShare = void 0;
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const Vault_1 = require("../../generated/templates/Strategy/Vault");
function getPricePerShare(vaultAddress) {
  const vaultContract = Vault_1.Vault.bind(vaultAddress);
  const pricePerShare = utils.readValue(
    vaultContract.try_getPricePerFullShare(),
    constants.BIGINT_ZERO
  );
  return pricePerShare;
}
exports.getPricePerShare = getPricePerShare;
function getPriceOfOutputTokens(vaultAddress, block) {
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, block);
  const inputToken = (0, initializers_1.getOrCreateTokenFromString)(
    vault.inputToken,
    block
  );
  const outputTokenPrice = vault.pricePerShare
    .div(constants.BIGINT_TEN.pow(inputToken.decimals).toBigDecimal())
    .times(inputToken.lastPriceUSD);
  return outputTokenPrice;
}
exports.getPriceOfOutputTokens = getPriceOfOutputTokens;
