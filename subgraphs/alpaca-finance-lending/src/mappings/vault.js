"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRewardTokens =
  exports.updateInterest =
  exports.handleKill =
  exports.handleRemoveDebt =
  exports.handleAddDebt =
  exports.handleTransfer =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Vault_1 = require("../../generated/ibALPACA/Vault");
const ConfigurableInterestVaultConfig_1 = require("../../generated/ibALPACA/ConfigurableInterestVaultConfig");
const FairLaunch_1 = require("../../generated/ibALPACA/FairLaunch");
const schema_1 = require("../../generated/schema");
const token_1 = require("../entities/token");
const event_1 = require("../entities/event");
const position_1 = require("../entities/position");
const market_1 = require("../entities/market");
const price_1 = require("../entities/price");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
function handleTransfer(event) {
  if (event.params.value.equals(constants_1.BIGINT_ZERO)) {
    return;
  }
  if (
    event.params.from ==
      graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS) &&
    event.params.to == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)
  ) {
    return;
  }
  if (
    event.params.from == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)
  ) {
    _handleMint(event);
    return;
  }
  if (
    event.params.to == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)
  ) {
    _handleBurn(event);
    return;
  }
  const market = (0, market_1.getMarket)(event.address);
  const contract = Vault_1.Vault.bind(event.address);
  // Handle transfer as withdraw + deposit
  (0, event_1.createWithdraw)(
    event,
    market,
    graph_ts_1.Address.fromString(market.inputToken),
    event.params.from,
    event.params.value,
    true
  );
  (0, position_1.updateUserPosition)(
    event,
    event.params.from,
    market,
    contract.balanceOf(event.params.from),
    constants_1.PositionSide.LENDER,
    true
  );
  (0, event_1.createDeposit)(
    event,
    market,
    graph_ts_1.Address.fromString(market.inputToken),
    event.params.to,
    event.params.value,
    true
  );
  (0, position_1.updateUserPosition)(
    event,
    event.params.to,
    market,
    contract.balanceOf(event.params.to),
    constants_1.PositionSide.LENDER,
    true
  );
}
exports.handleTransfer = handleTransfer;
function _handleMint(event) {
  const contract = Vault_1.Vault.bind(event.address);
  const tryTokenResult = contract.try_token();
  if (tryTokenResult.reverted) {
    graph_ts_1.log.warning(
      "[handleMint] could not get token info from vault contract",
      []
    );
    return;
  }
  const market = (0, market_1.getOrCreateMarket)(
    event,
    tryTokenResult.value,
    event.address
  );
  updateInterest(event, market);
  (0, event_1.createDeposit)(
    event,
    market,
    tryTokenResult.value,
    event.params.to,
    event.params.value
  );
  (0, position_1.updateUserPosition)(
    event,
    event.params.to,
    market,
    contract.balanceOf(event.params.to),
    constants_1.PositionSide.LENDER,
    true
  );
  (0, market_1.updateTokenSupply)(event, market, event.params.value);
}
function _handleBurn(event) {
  const market = (0, market_1.getMarket)(event.address);
  updateInterest(event, market);
  const contract = Vault_1.Vault.bind(event.address);
  const tryTokenResult = contract.try_token();
  if (tryTokenResult.reverted) {
    return;
  }
  (0, event_1.createWithdraw)(
    event,
    market,
    tryTokenResult.value,
    event.params.from,
    event.params.value
  );
  (0, position_1.updateUserPosition)(
    event,
    event.params.to,
    market,
    contract.balanceOf(event.params.to),
    constants_1.PositionSide.LENDER,
    true
  );
  (0, market_1.updateTokenSupply)(
    event,
    market,
    event.params.value.times(constants_1.BIGINT_NEGATIVE_ONE)
  );
}
function handleAddDebt(event) {
  const market = (0, market_1.getMarket)(event.address);
  updateInterest(event, market);
  const contract = Vault_1.Vault.bind(event.address);
  const trytoken = contract.try_token();
  const tryTotalDebtVal = contract.try_vaultDebtVal();
  const tryDeltaDebtVal = contract.try_debtShareToVal(event.params.debtShare);
  if (
    trytoken.reverted ||
    tryDeltaDebtVal.reverted ||
    tryTotalDebtVal.reverted
  ) {
    graph_ts_1.log.error(
      "[handleAddDebt]Failed to handle add debt for market {} tx={}",
      [market.id, event.transaction.hash.toHexString()]
    );
    return;
  }
  const tryPositions = contract.try_positions(event.params.id);
  if (tryPositions.reverted) {
    return;
  }
  (0, event_1.createBorrow)(
    event,
    market,
    trytoken.value,
    tryPositions.value.getOwner(),
    tryDeltaDebtVal.value
  );
  (0, market_1.changeMarketBorrowBalance)(event, market, tryTotalDebtVal.value);
  (0, position_1.updateUserPosition)(
    event,
    tryPositions.value.getOwner(),
    market,
    tryDeltaDebtVal.value,
    constants_1.PositionSide.BORROWER,
    false
  );
}
exports.handleAddDebt = handleAddDebt;
function handleRemoveDebt(event) {
  const market = (0, market_1.getMarket)(event.address);
  updateInterest(event, market);
  const contract = Vault_1.Vault.bind(event.address);
  const trytoken = contract.try_token();
  const tryTotalDebtVal = contract.try_vaultDebtVal();
  const tryDeltaDebtVal = contract.try_debtShareToVal(event.params.debtShare);
  if (
    trytoken.reverted ||
    tryDeltaDebtVal.reverted ||
    tryTotalDebtVal.reverted
  ) {
    graph_ts_1.log.error(
      "[handleRemoveDebt]Failed to handle remove debt from market {} tx={}",
      [market.id, event.transaction.hash.toHexString()]
    );
    return;
  }
  const tryPositions = contract.try_positions(event.params.id);
  if (tryPositions.reverted) {
    return;
  }
  (0, event_1.createRepay)(
    event,
    market,
    trytoken.value,
    tryPositions.value.getOwner(),
    tryDeltaDebtVal.value
  );
  (0, market_1.changeMarketBorrowBalance)(event, market, tryTotalDebtVal.value);
  (0, position_1.updateUserPosition)(
    event,
    tryPositions.value.getOwner(),
    market,
    tryDeltaDebtVal.value,
    constants_1.PositionSide.BORROWER,
    false
  );
}
exports.handleRemoveDebt = handleRemoveDebt;
function handleKill(event) {
  const market = (0, market_1.getMarket)(event.address);
  updateInterest(event, market);
  let protocolSideProfitRatio = constants_1.LIQUIDATION_PROTOCOL_SIDE_RATIO;
  const vaultContract = Vault_1.Vault.bind(event.address);
  const tryConfig = vaultContract.try_config();
  if (tryConfig.reverted) {
    graph_ts_1.log.warning(
      "[handleKill] could not fetch config contract address",
      []
    );
    return;
  }
  const configContract =
    ConfigurableInterestVaultConfig_1.ConfigurableInterestVaultConfig.bind(
      tryConfig.value
    );
  const tryGetKillBps = configContract.try_getKillBps();
  const tryGetKillTreasuryBps = configContract.try_getKillTreasuryBps();
  if (tryGetKillBps.reverted || tryGetKillTreasuryBps.reverted) {
    graph_ts_1.log.warning(
      "[handleKill] could not fetch liquidation config data",
      []
    );
    return;
  }
  protocolSideProfitRatio = tryGetKillTreasuryBps.value.divDecimal(
    tryGetKillTreasuryBps.value.plus(tryGetKillBps.value).toBigDecimal()
  );
  (0, event_1.createLiquidate)(
    event,
    market,
    graph_ts_1.Address.fromString(market.inputToken),
    event.params.posVal,
    graph_ts_1.Address.fromString(market.inputToken),
    event.params.prize,
    (0, numbers_1.bigDecimalToBigInt)(
      event.params.prize.toBigDecimal().times(protocolSideProfitRatio)
    ),
    event.params.killer,
    event.params.owner
  );
}
exports.handleKill = handleKill;
function updateInterest(event, market) {
  // Compute interest rate once per day. Otherwise, it will greatly slow down the indexing.
  const day = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
  const id = `${market.id}-${day}`;
  const marketSnapshot = schema_1.MarketDailySnapshot.load(id);
  if (marketSnapshot != null) {
    return;
  }
  const vaultContract = Vault_1.Vault.bind(event.address);
  const tryReservePool = vaultContract.try_reservePool();
  if (tryReservePool.reverted) {
    graph_ts_1.log.warning("[updateInterest] could not fetch reservePool", []);
    return;
  }
  const tryTotalToken = vaultContract.try_totalToken();
  const tryVaultDebtVal = vaultContract.try_vaultDebtVal();
  const tryConfig = vaultContract.try_config();
  if (
    tryTotalToken.reverted ||
    tryVaultDebtVal.reverted ||
    tryConfig.reverted
  ) {
    graph_ts_1.log.warning(
      "[updateInterest] failed on vault contract call",
      []
    );
    return;
  }
  const vaultDebtVal = tryVaultDebtVal.value;
  const totalTokenAmount = tryTotalToken.value;
  let floating = totalTokenAmount.minus(vaultDebtVal);
  // config.getInterestRate(vaultDebtVal, floating) matches
  // to how alpaca front end calculates APY, but floating may
  // be negative, in this case, add back reservePool
  if (floating.lt(constants_1.BIGINT_ZERO)) {
    floating = floating.plus(tryReservePool.value);
  }
  const configContract =
    ConfigurableInterestVaultConfig_1.ConfigurableInterestVaultConfig.bind(
      tryConfig.value
    );
  const tryGetInterestRate = configContract.try_getInterestRate(
    vaultDebtVal,
    floating
  );
  if (
    tryGetInterestRate.reverted ||
    totalTokenAmount.equals(constants_1.BIGINT_ZERO)
  ) {
    graph_ts_1.log.warning(
      "[updateInterest] could not update interest rate",
      []
    );
    return;
  }
  const ratePerSec = tryGetInterestRate.value;
  const borrowerAPY = (0, numbers_1.bigIntToBigDecimal)(
    ratePerSec.times(constants_1.SECONDS_PER_YEAR)
  ).times(constants_1.BIGDECIMAL_HUNDRED);
  const lenderAPY = borrowerAPY
    .times(vaultDebtVal.toBigDecimal())
    .times(
      constants_1.BIGDECIMAL_ONE.minus(
        constants_1.PROTOCOL_LENDING_FEE.div(constants_1.BIGDECIMAL_HUNDRED)
      )
    )
    .div(totalTokenAmount.toBigDecimal());
  (0, market_1.updateMarketRates)(event, market, borrowerAPY, lenderAPY);
  const dailyInterest = ratePerSec
    .times(vaultDebtVal)
    .times(constants_1.BIGINT_SECONDS_PER_DAY)
    .div(constants_1.BIGINT_TEN_TO_EIGHTEENTH);
  const protocolSideProfitUSD = (0, price_1.amountInUSD)(
    dailyInterest
      .times(constants_1.BIGINT_PROTOCOL_LENDING_FEE)
      .div(constants_1.BIGINT_HUNDRED),
    (0, token_1.getOrCreateToken)(
      graph_ts_1.Address.fromString(market.inputToken)
    ),
    event.block.number
  );
  const supplySideProfitUSD = protocolSideProfitUSD
    .div(constants_1.PROTOCOL_LENDING_FEE)
    .times(
      constants_1.BIGDECIMAL_HUNDRED.minus(constants_1.PROTOCOL_LENDING_FEE)
    );
  (0, market_1.addMarketProtocolSideRevenue)(
    event,
    market,
    protocolSideProfitUSD
  );
  (0, market_1.addMarketSupplySideRevenue)(event, market, supplySideProfitUSD);
}
exports.updateInterest = updateInterest;
function updateRewardTokens(event, market) {
  const vaultContract = Vault_1.Vault.bind(event.address);
  const fairlaunchContract = FairLaunch_1.FairLaunch.bind(
    graph_ts_1.Address.fromString(constants_1.FAIRLAUNCH_ADDRESS_BSC)
  );
  const tryDebtToken = vaultContract.try_debtToken();
  let tryDebtTokenValue = null;
  if (!tryDebtToken.reverted) {
    tryDebtTokenValue = tryDebtToken.value;
  }
  const tryAlpaca = fairlaunchContract.try_alpaca();
  const tryAlpacaPerBlock = fairlaunchContract.try_alpacaPerBlock();
  const tryTotalAllocPoint = fairlaunchContract.try_totalAllocPoint();
  const tryPoolLength = fairlaunchContract.try_poolLength();
  if (
    tryAlpaca.reverted ||
    tryAlpacaPerBlock.reverted ||
    tryTotalAllocPoint.reverted ||
    tryPoolLength.reverted
  ) {
    return;
  }
  let ibTokenRewardUpdated = false;
  let debtTokenRewardUpdated = false;
  if (tryDebtTokenValue === null) {
    debtTokenRewardUpdated = true;
  }
  for (
    let i = constants_1.BIGINT_ZERO;
    i.lt(tryPoolLength.value);
    i = i.plus(constants_1.BIGINT_ONE)
  ) {
    const tryPoolInfo = fairlaunchContract.try_poolInfo(i);
    if (!tryPoolInfo.reverted) {
      const stakeTokenValue = tryPoolInfo.value.getStakeToken();
      if (
        stakeTokenValue == event.address ||
        (tryDebtTokenValue !== null && stakeTokenValue == tryDebtTokenValue)
      ) {
        let rewardTokenType = constants_1.RewardTokenType.BORROW;
        if (event.address == stakeTokenValue) {
          rewardTokenType = constants_1.RewardTokenType.DEPOSIT;
          ibTokenRewardUpdated = true;
        } else {
          debtTokenRewardUpdated = true;
        }
        const rewardToken = (0, token_1.getOrCreateRewardToken)(
          tryAlpaca.value,
          rewardTokenType,
          constants_1.InterestRateType.VARIABLE
        );
        (0, market_1.updateMarketRewardTokens)(
          event,
          market,
          rewardToken,
          tryAlpacaPerBlock.value
            .times(tryPoolInfo.value.getAllocPoint())
            .div(tryTotalAllocPoint.value)
        );
        if (ibTokenRewardUpdated && debtTokenRewardUpdated) {
          break;
        }
      }
    }
  }
}
exports.updateRewardTokens = updateRewardTokens;
