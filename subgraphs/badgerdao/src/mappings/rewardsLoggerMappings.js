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
exports.handleUnlockScheduleSet = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const Rewards_1 = require("../modules/Rewards");
const Revenue_1 = require("../modules/Revenue");
const initializers_1 = require("../common/initializers");
const DiggToken_1 = require("../../generated/rewardsLogger/DiggToken");
function handleUnlockScheduleSet(event) {
  const duration = event.params.duration;
  let totalAmount = event.params.totalAmount;
  const vaultAddress = event.params.beneficiary;
  const rewardTokenAddress = event.params.token;
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
  if (vault._bribesProcessor != constants.NULL.TYPE_STRING) {
    const rewardToken = (0, initializers_1.getOrCreateToken)(
      rewardTokenAddress,
      event.block
    );
    const rewardTokenDecimals = constants.BIGINT_TEN.pow(
      rewardToken.decimals
    ).toBigDecimal();
    const supplySideRevenueUSD = totalAmount
      .divDecimal(rewardTokenDecimals)
      .times(rewardToken.lastPriceUSD);
    (0, Revenue_1.updateRevenueSnapshots)(
      vault,
      supplySideRevenueUSD,
      constants.BIGDECIMAL_ZERO,
      event.block
    );
    return;
  }
  if (rewardTokenAddress.equals(constants.DIGG_TOKEN_ADDRESS)) {
    const diggContract = DiggToken_1.DiggToken.bind(
      constants.DIGG_TOKEN_ADDRESS
    );
    totalAmount = utils.readValue(
      diggContract.try_sharesToFragments(totalAmount),
      constants.BIGINT_ZERO
    );
  }
  const rewardRate = totalAmount.div(duration);
  (0, Rewards_1.updateRewardTokenInfo)(
    vault,
    (0, initializers_1.getOrCreateToken)(rewardTokenAddress, event.block),
    rewardRate,
    event.block
  );
}
exports.handleUnlockScheduleSet = handleUnlockScheduleSet;
