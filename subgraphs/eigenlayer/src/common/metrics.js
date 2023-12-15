"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUsage =
  exports.updateVolume =
  exports.updateTVL =
  exports.updatePoolIsActive =
    void 0;
const getters_1 = require("./getters");
const utils_1 = require("./utils");
const constants_1 = require("./constants");
function updatePoolIsActive(poolAddress, isActive) {
  const pool = (0, getters_1.getPool)(poolAddress);
  pool.active = isActive;
  pool.save();
}
exports.updatePoolIsActive = updatePoolIsActive;
function updateTVL(poolAddress, tokenAddress, balance, event) {
  const protocol = (0, getters_1.getOrCreateProtocol)();
  const pool = (0, getters_1.getPool)(poolAddress);
  const token = (0, getters_1.getOrCreateToken)(tokenAddress, event);
  pool.inputTokenBalances = [balance];
  pool.inputTokenBalancesUSD = [
    (0, utils_1.bigIntToBigDecimal)(pool.inputTokenBalances[0]).times(
      token.lastPriceUSD
    ),
  ];
  const oldPoolTVL = pool.totalValueLockedUSD;
  pool.totalValueLockedUSD = pool.inputTokenBalancesUSD[0];
  protocol.totalValueLockedUSD = protocol.totalValueLockedUSD.plus(
    pool.totalValueLockedUSD.minus(oldPoolTVL)
  );
  pool.save();
  protocol.save();
}
exports.updateTVL = updateTVL;
function updateVolume(poolAddress, tokenAddress, isDeposit, amount, event) {
  const protocol = (0, getters_1.getOrCreateProtocol)();
  const pool = (0, getters_1.getPool)(poolAddress);
  const token = (0, getters_1.getOrCreateToken)(tokenAddress, event);
  if (isDeposit) {
    pool.cumulativeDepositVolumeAmount =
      pool.cumulativeDepositVolumeAmount.plus(amount);
    const oldPoolCumulativeDepositVolumeUSD = pool.cumulativeDepositVolumeUSD;
    pool.cumulativeDepositVolumeUSD = (0, utils_1.bigIntToBigDecimal)(
      pool.cumulativeDepositVolumeAmount
    ).times(token.lastPriceUSD);
    protocol.cumulativeDepositVolumeUSD =
      protocol.cumulativeDepositVolumeUSD.plus(
        pool.cumulativeDepositVolumeUSD.minus(oldPoolCumulativeDepositVolumeUSD)
      );
  } else {
    pool.cumulativeWithdrawalVolumeAmount =
      pool.cumulativeWithdrawalVolumeAmount.plus(amount);
    const oldPoolCumulativeWithdrawalVolumeUSD =
      pool.cumulativeWithdrawalVolumeUSD;
    pool.cumulativeWithdrawalVolumeUSD = (0, utils_1.bigIntToBigDecimal)(
      pool.cumulativeWithdrawalVolumeAmount
    ).times(token.lastPriceUSD);
    protocol.cumulativeWithdrawalVolumeUSD =
      protocol.cumulativeWithdrawalVolumeUSD.plus(
        pool.cumulativeWithdrawalVolumeUSD.minus(
          oldPoolCumulativeWithdrawalVolumeUSD
        )
      );
  }
  pool.cumulativeTotalVolumeAmount = pool.cumulativeDepositVolumeAmount.plus(
    pool.cumulativeWithdrawalVolumeAmount
  );
  pool.cumulativeTotalVolumeUSD = pool.cumulativeDepositVolumeUSD.plus(
    pool.cumulativeWithdrawalVolumeUSD
  );
  protocol.cumulativeTotalVolumeUSD = protocol.cumulativeDepositVolumeUSD.plus(
    protocol.cumulativeWithdrawalVolumeUSD
  );
  pool.netVolumeAmount = pool.cumulativeDepositVolumeAmount.minus(
    pool.cumulativeWithdrawalVolumeAmount
  );
  pool.netVolumeUSD = pool.cumulativeDepositVolumeUSD.minus(
    pool.cumulativeWithdrawalVolumeUSD
  );
  protocol.netVolumeUSD = protocol.cumulativeDepositVolumeUSD.minus(
    protocol.cumulativeWithdrawalVolumeUSD
  );
  pool.save();
  protocol.save();
}
exports.updateVolume = updateVolume;
function updateUsage(
  poolAddress,
  tokenAddress,
  accountAddress,
  isDeposit,
  amount,
  eventID,
  event
) {
  const protocol = (0, getters_1.getOrCreateProtocol)();
  const pool = (0, getters_1.getPool)(poolAddress);
  const account = (0, getters_1.getOrCreateAccount)(accountAddress);
  const token = (0, getters_1.getOrCreateToken)(tokenAddress, event);
  if (
    !account.deposits.length &&
    !account.withdrawsQueued.length &&
    !account.withdrawsCompleted.length
  ) {
    protocol.cumulativeUniqueUsers += constants_1.INT_ONE;
  }
  if (isDeposit) {
    if (!account.deposits.length) {
      protocol.cumulativeUniqueDepositors += constants_1.INT_ONE;
    }
    account.deposits = (0, utils_1.addToArrayAtIndex)(
      account.deposits,
      eventID
    );
    pool.cumulativeDepositCount += constants_1.INT_ONE;
    protocol.cumulativeDepositCount += constants_1.INT_ONE;
  } else {
    amount = amount.times(constants_1.BIGINT_MINUS_ONE);
    if (!account.withdrawsQueued.length && !account.withdrawsCompleted.length) {
      protocol.cumulativeUniqueWithdrawers += constants_1.INT_ONE;
    }
    pool.cumulativeWithdrawalCount += constants_1.INT_ONE;
    protocol.cumulativeWithdrawalCount += constants_1.INT_ONE;
  }
  pool.cumulativeTransactionCount += constants_1.INT_ONE;
  protocol.cumulativeTransactionCount += constants_1.INT_ONE;
  if (!account.pools.includes(pool.id)) {
    pool.cumulativeUniqueDepositors += constants_1.INT_ONE;
    let pools = account.pools;
    let poolBalances = account.poolBalances;
    let poolBalancesUSD = account.poolBalancesUSD;
    let _hasWithdrawnFromPool = account._hasWithdrawnFromPool;
    pools = (0, utils_1.addToArrayAtIndex)(pools, pool.id);
    poolBalances = (0, utils_1.addToArrayAtIndex)(poolBalances, amount);
    poolBalancesUSD = (0, utils_1.addToArrayAtIndex)(
      poolBalancesUSD,
      (0, utils_1.bigIntToBigDecimal)(amount).times(token.lastPriceUSD)
    );
    _hasWithdrawnFromPool = (0, utils_1.addToArrayAtIndex)(
      _hasWithdrawnFromPool,
      false
    );
    (0, utils_1.accountArraySort)(
      pools,
      poolBalances,
      poolBalancesUSD,
      _hasWithdrawnFromPool
    );
    account.pools = pools;
    account.poolBalances = poolBalances;
    account.poolBalancesUSD = poolBalancesUSD;
    account._hasWithdrawnFromPool = _hasWithdrawnFromPool;
  } else {
    const index = account.pools.indexOf(pool.id);
    if (!isDeposit) {
      if (!account._hasWithdrawnFromPool[index]) {
        pool.cumulativeUniqueWithdrawers += constants_1.INT_ONE;
      }
      account._hasWithdrawnFromPool = (0, utils_1.updateArrayAtIndex)(
        account._hasWithdrawnFromPool,
        true,
        index
      );
    }
    const newPoolBalances = account.poolBalances[index].plus(amount);
    const newPoolBalancesUSD = account.poolBalancesUSD[index].plus(
      (0, utils_1.bigIntToBigDecimal)(newPoolBalances).times(token.lastPriceUSD)
    );
    account.poolBalances = (0, utils_1.updateArrayAtIndex)(
      account.poolBalances,
      newPoolBalances,
      index
    );
    account.poolBalancesUSD = (0, utils_1.updateArrayAtIndex)(
      account.poolBalancesUSD,
      newPoolBalancesUSD,
      index
    );
  }
  account.save();
  pool.save();
  protocol.save();
}
exports.updateUsage = updateUsage;
