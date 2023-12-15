"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortArrayByReference =
  exports.updateRewardEmissions =
  exports.updateRewardData =
  exports.removeRewardToken =
  exports.addRewardToken =
  exports.getOrCreateLiquidityGauge =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const LiquidityGaugeV4_1 = require("../../../generated/templates/LiquidityGauge/LiquidityGaugeV4");
const constants_1 = require("../../common/constants");
const getters_1 = require("../../common/getters");
const numbers_1 = require("../../common/utils/numbers");
const pricing_1 = require("./pricing");
function getOrCreateLiquidityGauge(gaugeAddress) {
  let gauge = schema_1._LiquidityGauge.load(gaugeAddress.toHex());
  if (!gauge) {
    gauge = new schema_1._LiquidityGauge(gaugeAddress.toHex());
    gauge.vault = "";
    gauge.save();
  }
  return gauge;
}
exports.getOrCreateLiquidityGauge = getOrCreateLiquidityGauge;
function addRewardToken(rewardTokenAddress, rewardTokenType, vault) {
  const rewardToken = (0, getters_1.getOrCreateRewardToken)(
    rewardTokenAddress,
    rewardTokenType
  );
  let rewardTokens = vault.rewardTokens;
  let rewardEmission = vault.rewardTokenEmissionsAmount;
  let rewardEmissionUSD = vault.rewardTokenEmissionsUSD;
  if (!rewardTokens) {
    rewardTokens = [rewardToken.id];
    rewardEmission = [constants_1.BIGINT_ZERO];
    rewardEmissionUSD = [constants_1.BIGDECIMAL_ZERO];
  } else {
    const index = rewardTokens.indexOf(rewardToken.id);
    if (index != -1) {
      // Do nothing if rewardToken is already in rewardTokens
      return;
    }
    rewardTokens.push(rewardToken.id);
    rewardEmission.push(constants_1.BIGINT_ZERO);
    rewardEmissionUSD.push(constants_1.BIGDECIMAL_ZERO);
    const rewardTokensUnsorted = rewardTokens;
    rewardTokens.sort();
    rewardEmission = sortArrayByReference(
      rewardTokens,
      rewardTokensUnsorted,
      rewardEmission
    );
    rewardEmissionUSD = sortArrayByReference(
      rewardTokens,
      rewardTokensUnsorted,
      rewardEmissionUSD
    );
  }
  vault.rewardTokens = rewardTokens;
  vault.rewardTokenEmissionsAmount = rewardEmission;
  vault.rewardTokenEmissionsUSD = rewardEmissionUSD;
  vault.save();
}
exports.addRewardToken = addRewardToken;
function removeRewardToken(rewardTokenId, vault) {
  const rewardTokens = vault.rewardTokens;
  if (!rewardTokens || rewardTokens.length == 0) {
    return;
  }
  const rewardEmission = vault.rewardTokenEmissionsAmount;
  const rewardEmissionUSD = vault.rewardTokenEmissionsUSD;
  const index = rewardTokens.indexOf(rewardTokenId);
  if (index != -1) {
    rewardTokens.splice(index, 1);
    rewardEmission.splice(index, 1);
    rewardEmissionUSD.splice(index, 1);
  }
  vault.rewardTokens = rewardTokens;
  vault.rewardTokenEmissionsAmount = rewardEmission;
  vault.rewardTokenEmissionsUSD = rewardEmissionUSD;
  vault.save();
}
exports.removeRewardToken = removeRewardToken;
function updateRewardData(gaugeAddress, rewardTokenAddress, event) {
  // get new rates
  const gaugeContract = LiquidityGaugeV4_1.LiquidityGaugeV4.bind(gaugeAddress);
  const rewardDataResult = gaugeContract.try_reward_data(rewardTokenAddress);
  if (rewardDataResult.reverted) {
    graph_ts_1.log.error(
      "[updateRewardData]reward_data() call for gauge {} and token {} reverted tx {}-{}",
      [
        gaugeAddress.toHexString(),
        rewardTokenAddress.toHexString(),
        event.transaction.hash.toHexString(),
        event.transactionLogIndex.toString(),
      ]
    );
    return;
  }
  const rate = rewardDataResult.value.getRate(); // rate is tokens per second
  const periodFinish = rewardDataResult.value.getPeriod_finish();
  const rewardDataId = `${gaugeAddress.toHexString()}-${rewardTokenAddress.toHexString()}`;
  let rewardData = schema_1._RewardData.load(rewardDataId);
  if (!rewardData) {
    rewardData = new schema_1._RewardData(rewardDataId);
  }
  rewardData.rate = rate;
  rewardData.PeriodFinish = periodFinish;
  rewardData.save();
}
exports.updateRewardData = updateRewardData;
function updateRewardEmissions(vault, gaugeAddress, event) {
  const rewardTokens = vault.rewardTokens ? vault.rewardTokens : [];
  for (let i = 0; i < rewardTokens.length; i++) {
    updateRewardEmission(vault, rewardTokens[i], gaugeAddress, event);
  }
}
exports.updateRewardEmissions = updateRewardEmissions;
function updateRewardEmission(vault, rewardTokenId, gaugeAddress, event) {
  const rewardToken = schema_1.RewardToken.load(rewardTokenId);
  if (!rewardToken) {
    graph_ts_1.log.error(
      "[updateRewardEmission]no RewardToken found for reward token {} tx {}-{}",
      [
        rewardTokenId,
        event.transaction.hash.toHexString(),
        event.transactionLogIndex.toString(),
      ]
    );
    return;
  }
  const rewardDataId = `${gaugeAddress.toHexString()}-${rewardToken.token}`;
  const rewardData = schema_1._RewardData.load(rewardDataId);
  if (!rewardData) {
    graph_ts_1.log.error(
      "[updateRewardEmission]no RewardData found for gauge {} and reward token {} tx {}-{}",
      [
        gaugeAddress.toHexString(),
        rewardTokenId,
        event.transaction.hash.toHexString(),
        event.transactionLogIndex.toString(),
      ]
    );
    return;
  }
  const rewardTokens = vault.rewardTokens ? vault.rewardTokens : [];
  const emissionsAmount = vault.rewardTokenEmissionsAmount
    ? vault.rewardTokenEmissionsAmount
    : [];
  const emissionsUSD = vault.rewardTokenEmissionsUSD
    ? vault.rewardTokenEmissionsUSD
    : [];
  const rewardTokenIndex = rewardTokens.indexOf(rewardTokenId);
  // once the reward period is past, the rate goes to 0
  if (event.block.timestamp.ge(rewardData.PeriodFinish)) {
    emissionsAmount[rewardTokenIndex] = constants_1.BIGINT_ZERO;
    emissionsUSD[rewardTokenIndex] = constants_1.BIGDECIMAL_ZERO;
  } else {
    emissionsAmount[rewardTokenIndex] = rewardData.rate.times(
      graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_DAY)
    );
    const token = (0, pricing_1.updateTokenPrice)(
      graph_ts_1.Address.fromString(rewardToken.token),
      event.block
    );
    emissionsUSD[rewardTokenIndex] = token.lastPriceUSD.times(
      (0, numbers_1.bigIntToBigDecimal)(
        emissionsAmount[rewardTokenIndex],
        token.decimals
      )
    );
  }
  vault.rewardTokenEmissionsAmount = emissionsAmount;
  vault.rewardTokenEmissionsUSD = emissionsUSD;
  vault.save();
}
// A function which given 3 arrays of arbitrary types of the same length,
// where the first one holds the reference order, the second one holds the same elements
// as the first but in different order, and the third any arbitrary elements. It will return
// the third array after sorting it according to the order of the first one.
// For example:
// sortArrayByReference(['a', 'c', 'b'], ['a', 'b', 'c'], [1, 2, 3]) => [1, 3, 2]
function sortArrayByReference(reference, array, toSort) {
  const sorted = new Array();
  for (let i = 0; i < reference.length; i++) {
    const index = array.indexOf(reference[i]);
    sorted.push(toSort[index]);
  }
  return sorted;
}
exports.sortArrayByReference = sortArrayByReference;
