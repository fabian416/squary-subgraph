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
exports.updateRewardTokenEmissions = exports.updateRewardTokenInfo = void 0;
const initializers_1 = require("../common/initializers");
const constants = __importStar(require("../common/constants"));
const rewards_1 = require("../common/rewards");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function updateRewardTokenInfo(vault, rewardToken, rewardRate, block) {
  const rewardRatePerDay = (0, rewards_1.getRewardsPerDay)(
    block.timestamp,
    block.number,
    rewardRate.toBigDecimal(),
    constants.RewardIntervalType.TIMESTAMP
  );
  const rewardPerDay = graph_ts_1.BigInt.fromString(
    rewardRatePerDay.toString()
  );
  updateRewardTokenEmissions(
    vault,
    graph_ts_1.Address.fromString(rewardToken.id),
    rewardPerDay,
    block
  );
  graph_ts_1.log.warning(
    "[Rewards] Vault: {}, rewardTokenAddress: {}, RewardRate: {}",
    [vault.id, rewardToken.id, rewardRatePerDay.toString()]
  );
}
exports.updateRewardTokenInfo = updateRewardTokenInfo;
function updateRewardTokenEmissions(
  vault,
  rewardTokenAddress,
  rewardTokenPerDay,
  block
) {
  const rewardToken = (0, initializers_1.getOrCreateRewardToken)(
    rewardTokenAddress,
    block
  );
  if (!vault.rewardTokens) {
    vault.rewardTokens = [];
  }
  const rewardTokens = vault.rewardTokens;
  if (!rewardTokens.includes(rewardToken.id)) {
    rewardTokens.push(rewardToken.id);
    vault.rewardTokens = rewardTokens.sort();
  }
  const rewardTokenIndex = vault.rewardTokens.indexOf(rewardToken.id);
  if (!vault.rewardTokenEmissionsAmount) {
    vault.rewardTokenEmissionsAmount = [];
  }
  const rewardTokenEmissionsAmount = vault.rewardTokenEmissionsAmount;
  if (!vault.rewardTokenEmissionsUSD) {
    vault.rewardTokenEmissionsUSD = [];
  }
  const rewardTokenEmissionsUSD = vault.rewardTokenEmissionsUSD;
  const token = (0, initializers_1.getOrCreateToken)(rewardTokenAddress, block);
  rewardTokenEmissionsAmount[rewardTokenIndex] = rewardTokenPerDay;
  rewardTokenEmissionsUSD[rewardTokenIndex] = rewardTokenPerDay
    .toBigDecimal()
    .div(constants.BIGINT_TEN.pow(token.decimals).toBigDecimal())
    .times(token.lastPriceUSD);
  vault.rewardTokenEmissionsAmount = rewardTokenEmissionsAmount;
  vault.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
  vault.save();
}
exports.updateRewardTokenEmissions = updateRewardTokenEmissions;
