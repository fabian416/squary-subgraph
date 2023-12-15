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
exports.updateRewardTokenEmissions =
  exports.updateBeltRewards =
  exports.updateStakedOutputTokenAmount =
    void 0;
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
const MasterBelt_1 = require("../../generated/MasterBelt/MasterBelt");
const Strategy_1 = require("../../generated/templates/Strategy/Strategy");
function updateStakedOutputTokenAmount(vaultAddress, strategyAddress, block) {
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, block);
  const strategyContract = Strategy_1.Strategy.bind(strategyAddress);
  const wantLockedTotal = utils.readValue(
    strategyContract.try_wantLockedTotal(),
    constants.BIGINT_ZERO
  );
  vault.stakedOutputTokenAmount = wantLockedTotal;
  vault.save();
}
exports.updateStakedOutputTokenAmount = updateStakedOutputTokenAmount;
function updateBeltRewards(vaultAddress, allocPoint, masterBeltAddress, block) {
  const masterBeltContract = MasterBelt_1.MasterBelt.bind(masterBeltAddress);
  const beltPerBlock = utils
    .readValue(masterBeltContract.try_BELTPerBlock(), constants.BIGINT_ZERO)
    .toBigDecimal();
  const totalAllocPoint = utils
    .readValue(masterBeltContract.try_totalAllocPoint(), constants.BIGINT_ZERO)
    .toBigDecimal();
  // Get the rewards per day for this gauge
  const protocolTokenRewardEmissionsPerDay = beltPerBlock
    .times(allocPoint.toBigDecimal().div(totalAllocPoint))
    .times(constants.BIG_DECIMAL_SECONDS_PER_DAY.div(constants.BSC_BLOCK_RATE));
  updateRewardTokenEmissions(
    constants.BELT_TOKEN_ADDRESS,
    vaultAddress,
    graph_ts_1.BigInt.fromString(
      protocolTokenRewardEmissionsPerDay.truncate(0).toString()
    ),
    block
  );
}
exports.updateBeltRewards = updateBeltRewards;
function updateRewardTokenEmissions(
  rewardTokenAddress,
  poolAddress,
  rewardTokenPerDay,
  block
) {
  const vault = (0, initializers_1.getOrCreateVault)(poolAddress, block);
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
    vault.rewardTokens = rewardTokens;
  }
  const rewardTokenIndex = rewardTokens.indexOf(rewardToken.id);
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
