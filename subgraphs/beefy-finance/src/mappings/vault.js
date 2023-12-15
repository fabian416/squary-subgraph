"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChargedFees =
  exports.handleStratHarvest =
  exports.handleStratHarvestWithAmount =
  exports.handleWithdraw =
  exports.handleDeposit =
  exports.getFees =
  exports.updateVaultAndSnapshots =
  exports.createVaultFromStrategy =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const BeefyStrategy_1 = require("../../generated/Standard/BeefyStrategy");
const BeefyVault_1 = require("../../generated/Standard/BeefyVault");
const getters_1 = require("../utils/getters");
const deposit_1 = require("./deposit");
const withdraw_1 = require("./withdraw");
const snapshots_1 = require("../utils/snapshots");
const token_1 = require("./token");
const constants_1 = require("../prices/common/constants");
const protocol_1 = require("./protocol");
function createVaultFromStrategy(strategyAddress, event) {
  const strategyContract = BeefyStrategy_1.BeefyStrategy.bind(strategyAddress);
  const vaultAddress = strategyContract.vault();
  const vault = new schema_1.Vault(vaultAddress.toHex());
  const vaultContract = BeefyVault_1.BeefyVault.bind(vaultAddress);
  vault.name = (0, token_1.fetchTokenName)(vaultAddress);
  vault.symbol = (0, token_1.fetchTokenSymbol)(vaultAddress);
  vault.strategy = strategyAddress.toHex();
  vault.inputTokenBalance = constants_1.BIGINT_ZERO;
  let want = strategyContract.try_want();
  if (want.reverted) {
    want = vaultContract.try_token();
  }
  if (want.reverted) {
    vault.inputToken = (0, getters_1.getTokenOrCreate)(
      constants_1.ZERO_ADDRESS,
      event.block
    ).id;
  } else {
    vault.inputToken = (0, getters_1.getTokenOrCreate)(
      want.value,
      event.block
    ).id;
  }
  vault.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
  vault.outputToken = (0, getters_1.getTokenOrCreate)(
    vaultAddress,
    event.block
  ).id;
  vault.fees = getFees(vault.id, strategyContract);
  vault.createdTimestamp = event.block.timestamp;
  vault.createdBlockNumber = event.block.number;
  vault.outputTokenSupply = constants_1.BIGINT_ZERO;
  vault.pricePerShare = constants_1.BIGINT_ZERO;
  vault.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
  const beefy = (0, getters_1.getBeefyFinanceOrCreate)(vault.id);
  vault.protocol = beefy.id;
  vault.save();
  if (beefy.vaults[0] != vault.id) {
    beefy.vaults = beefy.vaults.concat([vault.id]);
    beefy.save();
  }
  return vault;
}
exports.createVaultFromStrategy = createVaultFromStrategy;
function updateVaultAndSnapshots(vault, block) {
  const vaultContract = BeefyVault_1.BeefyVault.bind(
    graph_ts_1.Address.fromString(vault.id.split("x")[1])
  );
  let call = vaultContract.try_balance();
  if (call.reverted) {
    vault.inputTokenBalance = constants_1.BIGINT_ZERO;
  } else {
    vault.inputTokenBalance = call.value;
  }
  call = vaultContract.try_totalSupply();
  if (call.reverted) {
    vault.outputTokenSupply = constants_1.BIGINT_ZERO;
  } else {
    vault.outputTokenSupply = call.value;
  }
  call = vaultContract.try_getPricePerFullShare();
  if (call.reverted) {
    vault.pricePerShare = constants_1.BIGINT_ZERO;
  } else {
    vault.pricePerShare = call.value.div(
      graph_ts_1.BigInt.fromI32(vaultContract.decimals())
    );
  }
  const wantCall = vaultContract.try_want();
  if (wantCall.reverted) {
    vault.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
  } else {
    const inputToken = (0, getters_1.getTokenOrCreate)(wantCall.value, block);
    vault.totalValueLockedUSD = inputToken.lastPriceUSD
      .times(vault.inputTokenBalance.toBigDecimal())
      .div(constants_1.BIGINT_TEN.pow(inputToken.decimals).toBigDecimal());
  }
  const outputSupply = vault.outputTokenSupply;
  if (outputSupply && outputSupply != constants_1.BIGINT_ZERO)
    vault.outputTokenPriceUSD = vault.totalValueLockedUSD.div(
      outputSupply.toBigDecimal()
    );
  vault.save();
  (0, snapshots_1.updateVaultHourlySnapshot)(block, vault);
  (0, snapshots_1.updateVaultDailySnapshot)(block, vault);
}
exports.updateVaultAndSnapshots = updateVaultAndSnapshots;
function getFees(vaultId, strategyContract) {
  const fees = [];
  let call = strategyContract.try_STRATEGIST_FEE();
  if (!call.reverted) {
    const strategistFee = new schema_1.VaultFee("STRATEGIST_FEE-" + vaultId);
    strategistFee.feePercentage = call.value.divDecimal(
      constants_1.BIGDECIMAL_HUNDRED
    );
    strategistFee.feeType = "STRATEGIST_FEE";
    strategistFee.save();
    fees.push(strategistFee.id);
  }
  call = strategyContract.try_withdrawalFee();
  if (!call.reverted) {
    const withdrawalFee = new schema_1.VaultFee("WITHDRAWAL_FEE-" + vaultId);
    withdrawalFee.feePercentage = call.value.divDecimal(
      constants_1.BIGDECIMAL_HUNDRED
    );
    withdrawalFee.feeType = "WITHDRAWAL_FEE";
    withdrawalFee.save();
    fees.push(withdrawalFee.id);
  }
  call = strategyContract.try_callFee();
  if (!call.reverted) {
    const callFee = new schema_1.VaultFee("MANAGEMENT_FEE-" + vaultId);
    callFee.feePercentage = call.value.divDecimal(
      constants_1.BIGDECIMAL_HUNDRED
    );
    callFee.feeType = "MANAGEMENT_FEE";
    callFee.save();
    fees.push(callFee.id);
  }
  call = strategyContract.try_beefyFee();
  if (!call.reverted) {
    const beefyFee = new schema_1.VaultFee("PERFORMANCE_FEE-" + vaultId);
    beefyFee.feePercentage = call.value.divDecimal(
      constants_1.BIGDECIMAL_HUNDRED
    );
    beefyFee.feeType = "PERFORMANCE_FEE";
    beefyFee.save();
    fees.push(beefyFee.id);
  }
  return fees;
}
exports.getFees = getFees;
function handleDeposit(event) {
  const vault = (0, getters_1.getVaultFromStrategyOrCreate)(
    event.address,
    event
  );
  const depositedAmount = event.params.tvl.minus(vault.inputTokenBalance);
  (0, deposit_1.createDeposit)(event, depositedAmount, vault.id);
  updateVaultAndSnapshots(vault, event.block);
  (0, protocol_1.updateProtocolUsage)(event, vault, true, false);
}
exports.handleDeposit = handleDeposit;
function handleWithdraw(event) {
  const vault = (0, getters_1.getVaultFromStrategyOrCreate)(
    event.address,
    event
  );
  const withdrawnAmount = event.params.tvl.minus(vault.inputTokenBalance);
  (0, withdraw_1.createWithdraw)(event, withdrawnAmount, vault.id);
  updateVaultAndSnapshots(vault, event.block);
  (0, protocol_1.updateProtocolRevenueFromWithdraw)(
    event,
    vault,
    withdrawnAmount
  );
}
exports.handleWithdraw = handleWithdraw;
function handleStratHarvestWithAmount(event) {
  const vault = (0, getters_1.getVaultFromStrategyOrCreate)(
    event.address,
    event
  );
  updateVaultAndSnapshots(vault, event.block);
  (0, protocol_1.updateProtocolRevenueFromHarvest)(
    event,
    event.params.wantHarvested,
    vault
  );
}
exports.handleStratHarvestWithAmount = handleStratHarvestWithAmount;
function handleStratHarvest(event) {
  const vault = (0, getters_1.getVaultFromStrategyOrCreate)(
    event.address,
    event
  );
  const strategyContract = BeefyStrategy_1.BeefyStrategy.bind(event.address);
  const balance = strategyContract.try_balanceOf();
  if (!balance.reverted) {
    const amountHarvested = balance.value.minus(vault.inputTokenBalance);
    updateVaultAndSnapshots(vault, event.block);
    (0, protocol_1.updateProtocolRevenueFromHarvest)(
      event,
      amountHarvested,
      vault
    );
  } else {
    updateVaultAndSnapshots(vault, event.block);
  }
}
exports.handleStratHarvest = handleStratHarvest;
function handleChargedFees(event) {
  const vault = (0, getters_1.getVaultFromStrategyOrCreate)(
    event.address,
    event
  );
  updateVaultAndSnapshots(vault, event.block);
  (0, protocol_1.updateProtocolRevenueFromChargedFees)(event, vault); //si rompe qua!
}
exports.handleChargedFees = handleChargedFees;
