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
exports.handleBuyback = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const Revenue_1 = require("../modules/Revenue");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
function handleBuyback(event) {
  if (utils.isBuyBackTransactionPresent(event.transaction)) return;
  const context = graph_ts_1.dataSource.context();
  const vaultAddress = graph_ts_1.Address.fromString(
    context.getString("vaultAddress")
  );
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
  const strategyAddress = event.address;
  const harvestedAmount = event.params.earnedAmount;
  const harvestTokenAddress = event.params.earnedAddress;
  const harvestedToken = (0, initializers_1.getOrCreateToken)(
    harvestTokenAddress,
    event.block
  );
  const harvestedAmountUSD = harvestedAmount
    .divDecimal(
      constants.BIGINT_TEN.pow(harvestedToken.decimals).toBigDecimal()
    )
    .times(harvestedToken.lastPriceUSD);
  const performanceFeesPercentage = utils.getStrategyPerformaceFees(
    vaultAddress,
    strategyAddress
  );
  const supplySideRevenueUSD = harvestedAmountUSD.times(
    constants.BIGDECIMAL_ONE.minus(
      performanceFeesPercentage.feePercentage.div(constants.BIGDECIMAL_HUNDRED)
    )
  );
  const protocolSideRevenueUSD = harvestedAmountUSD.times(
    performanceFeesPercentage.feePercentage.div(constants.BIGDECIMAL_HUNDRED)
  );
  (0, Revenue_1.updateRevenueSnapshots)(
    vault,
    supplySideRevenueUSD,
    protocolSideRevenueUSD,
    event.block
  );
  graph_ts_1.log.warning(
    "[BuyBack] vaultAddress: {}, strategyAddress: {}, harvestedAmountUSD: {}, supplySideRevenueUSD: {}, protocolSideRevenueUSD: {}, TxnHash: {}",
    [
      vault.id,
      strategyAddress.toHexString(),
      harvestedAmountUSD.toString(),
      supplySideRevenueUSD.toString(),
      protocolSideRevenueUSD.toString(),
      event.transaction.hash.toHexString(),
    ]
  );
}
exports.handleBuyback = handleBuyback;
