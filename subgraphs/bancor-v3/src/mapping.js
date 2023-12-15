"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleProgramEnabled =
  exports.handleProgramTerminated =
  exports.handleProgramCreated =
  exports.handleBNTTotalLiquidityUpdated =
  exports.handleTotalLiquidityUpdated =
  exports.handleBNTWithdrawn =
  exports.handleTokensWithdrawn =
  exports.handleBNTDeposited =
  exports.handleTokensDeposited =
  exports.handleTokensTraded =
  exports.handleWithdrawalFeePPMUpdated =
  exports.handleNetworkFeePPMUpdated =
  exports.handleTradingFeePPMUpdated =
  exports.handleDefaultTradingFeePPMUpdated =
  exports.handlePoolCollectionAdded =
  exports.handlePoolTokenCreated =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const templates_1 = require("../generated/templates");
const PoolToken_1 = require("../generated/BancorNetwork/PoolToken");
const BancorNetworkInfo_1 = require("../generated/BancorNetwork/BancorNetworkInfo");
const ERC20_1 = require("../generated/BancorNetwork/ERC20");
const schema_1 = require("../generated/schema");
const constants_1 = require("./constants");
const versions_1 = require("./versions");
const withdrawFeeIdx = 0;
const tradingFeeIdx = 1;
const protocolFeeIdx = 2;
const lpFeeIdx = 3;
var EventType;
(function (EventType) {
  EventType[(EventType["Swap"] = 0)] = "Swap";
  EventType[(EventType["Withdraw"] = 1)] = "Withdraw";
  EventType[(EventType["Deposit"] = 2)] = "Deposit";
})(EventType || (EventType = {}));
function handlePoolTokenCreated(event) {
  const poolTokenAddress = event.params.poolToken;
  const reserveTokenAddress = event.params.token;
  const poolTokenID = poolTokenAddress.toHexString();
  let poolToken = schema_1.Token.load(poolTokenID);
  if (poolToken != null) {
    graph_ts_1.log.warning(
      "[handlePoolTokenCreated] pool token {} already exists",
      [poolTokenID]
    );
    return;
  }
  // pool token
  poolToken = new schema_1.Token(poolTokenID);
  const poolTokenContract = PoolToken_1.PoolToken.bind(poolTokenAddress);
  const poolTokenNameResult = poolTokenContract.try_name();
  if (poolTokenNameResult.reverted) {
    graph_ts_1.log.warning("[handlePoolTokenCreated] try_name on {} reverted", [
      poolTokenID,
    ]);
    poolToken.name = "unknown name";
  } else {
    poolToken.name = poolTokenNameResult.value;
  }
  const poolTokenSymbolResult = poolTokenContract.try_symbol();
  if (poolTokenSymbolResult.reverted) {
    graph_ts_1.log.warning(
      "[handlePoolTokenCreated] try_symbol on {} reverted",
      [poolTokenID]
    );
    poolToken.symbol = "unknown symbol";
  } else {
    poolToken.symbol = poolTokenSymbolResult.value;
  }
  const poolTokenDecimalsResult = poolTokenContract.try_decimals();
  if (poolTokenDecimalsResult.reverted) {
    graph_ts_1.log.warning(
      "[handlePoolTokenCreated] try_decimals on {} reverted",
      [poolTokenID]
    );
    poolToken.decimals = 0;
  } else {
    poolToken.decimals = poolTokenDecimalsResult.value;
  }
  poolToken.save();
  // reserve token
  const reserveTokenID = reserveTokenAddress.toHexString();
  const reserveToken = new schema_1.Token(reserveTokenID);
  reserveToken._poolToken = poolTokenID;
  if (
    reserveTokenAddress == graph_ts_1.Address.fromString(constants_1.EthAddr)
  ) {
    reserveToken.name = "Ether";
    reserveToken.symbol = "ETH";
    reserveToken.decimals = constants_1.INT_EIGHTEEN;
  } else {
    const tokenContract = ERC20_1.ERC20.bind(
      graph_ts_1.Address.fromString(reserveTokenID)
    );
    const tokenNameResult = tokenContract.try_name();
    if (tokenNameResult.reverted) {
      graph_ts_1.log.warning(
        "[handlePoolTokenCreated] try_name on {} reverted",
        [reserveTokenID]
      );
      reserveToken.name = "unknown name";
    } else {
      reserveToken.name = tokenNameResult.value;
    }
    const tokenSymbolResult = tokenContract.try_symbol();
    if (tokenSymbolResult.reverted) {
      graph_ts_1.log.warning(
        "[handlePoolTokenCreated] try_symbol on {} reverted",
        [reserveTokenID]
      );
      reserveToken.symbol = "unknown symbol";
    } else {
      reserveToken.symbol = tokenSymbolResult.value;
    }
    const tokenDecimalsResult = tokenContract.try_decimals();
    if (tokenDecimalsResult.reverted) {
      graph_ts_1.log.warning(
        "[handlePoolTokenCreated] try_decimals on {} reverted",
        [reserveTokenID]
      );
      reserveToken.decimals = 0;
    } else {
      reserveToken.decimals = tokenDecimalsResult.value;
    }
  }
  reserveToken.save();
  const liquidityPool = createLiquidityPool(
    reserveToken,
    poolToken,
    event.block.timestamp,
    event.block.number
  );
  const protocol = schema_1.DexAmmProtocol.load(constants_1.BancorNetworkAddr);
  if (!protocol) {
    graph_ts_1.log.warning("[handlePoolTokenCreated] protocol not found", []);
    return;
  }
  const poolIDs = protocol._poolIDs;
  poolIDs.push(liquidityPool.id);
  protocol._poolIDs = poolIDs;
  protocol.totalPoolCount = poolIDs.length;
  protocol.save();
}
exports.handlePoolTokenCreated = handlePoolTokenCreated;
function handlePoolCollectionAdded(event) {
  templates_1.PoolCollection.create(event.params.poolCollection);
}
exports.handlePoolCollectionAdded = handlePoolCollectionAdded;
function handleDefaultTradingFeePPMUpdated(event) {
  const protocol = getOrCreateProtocol();
  protocol._defaultTradingFeeRate = event.params.newFeePPM
    .toBigDecimal()
    .div((0, constants_1.exponentToBigDecimal)(constants_1.INT_SIX));
  protocol.save();
  for (let i = 0; i < protocol._poolIDs.length; i++) {
    updateLiquidityPoolFees(protocol._poolIDs[i]);
  }
}
exports.handleDefaultTradingFeePPMUpdated = handleDefaultTradingFeePPMUpdated;
function handleTradingFeePPMUpdated(event) {
  const reserveTokenID = event.params.pool.toHexString();
  const reserveToken = schema_1.Token.load(reserveTokenID);
  if (!reserveToken) {
    graph_ts_1.log.warning(
      "[handleTradingFeePPMUpdated] reserve token {} not found",
      [reserveTokenID]
    );
    return;
  }
  if (!reserveToken._poolToken) {
    graph_ts_1.log.warning(
      "[handleTradingFeePPMUpdated] reserve token {} has no pool token",
      [reserveTokenID]
    );
    return;
  }
  const liquidityPoolID = reserveToken._poolToken;
  const liquidityPool = schema_1.LiquidityPool.load(liquidityPoolID);
  if (!liquidityPool) {
    graph_ts_1.log.warning(
      "[handleTradingFeePPMUpdated] liquidity pool {} not found",
      [liquidityPoolID]
    );
    return;
  }
  liquidityPool._tradingFeeRate = event.params.newFeePPM
    .toBigDecimal()
    .div((0, constants_1.exponentToBigDecimal)(constants_1.INT_SIX));
  liquidityPool.save();
  updateLiquidityPoolFees(liquidityPoolID);
}
exports.handleTradingFeePPMUpdated = handleTradingFeePPMUpdated;
function handleNetworkFeePPMUpdated(event) {
  const protocol = getOrCreateProtocol();
  protocol._networkFeeRate = event.params.newFeePPM
    .toBigDecimal()
    .div((0, constants_1.exponentToBigDecimal)(constants_1.INT_SIX));
  protocol.save();
  for (let i = 0; i < protocol._poolIDs.length; i++) {
    updateLiquidityPoolFees(protocol._poolIDs[i]);
  }
}
exports.handleNetworkFeePPMUpdated = handleNetworkFeePPMUpdated;
function handleWithdrawalFeePPMUpdated(event) {
  const protocol = getOrCreateProtocol();
  protocol._withdrawalFeeRate = event.params.newFeePPM
    .toBigDecimal()
    .div((0, constants_1.exponentToBigDecimal)(constants_1.INT_SIX));
  protocol.save();
  for (let i = 0; i < protocol._poolIDs.length; i++) {
    updateLiquidityPoolFees(protocol._poolIDs[i]);
  }
}
exports.handleWithdrawalFeePPMUpdated = handleWithdrawalFeePPMUpdated;
function handleTokensTraded(event) {
  const sourceTokenID = event.params.sourceToken.toHexString();
  const targetTokenID = event.params.targetToken.toHexString();
  const sourceToken = schema_1.Token.load(sourceTokenID);
  if (!sourceToken) {
    graph_ts_1.log.warning("[handleTokensTraded] source token {} not found", [
      sourceTokenID,
    ]);
    return;
  }
  const targetToken = schema_1.Token.load(targetTokenID);
  if (!targetToken) {
    graph_ts_1.log.warning("[handleTokensTraded] target token {} not found", [
      targetTokenID,
    ]);
    return;
  }
  if (!sourceToken._poolToken) {
    graph_ts_1.log.warning(
      "[handleTokensTraded] reserve token {} has no pool token",
      [sourceToken.id]
    );
    return;
  }
  const swap = new schema_1.Swap(
    "swap-"
      .concat(event.transaction.hash.toHexString())
      .concat("-")
      .concat(event.logIndex.toString())
  );
  swap.hash = event.transaction.hash.toHexString();
  swap.logIndex = event.logIndex.toI32();
  swap.protocol = constants_1.BancorNetworkAddr;
  swap.blockNumber = event.block.number;
  swap.timestamp = event.block.timestamp;
  swap.from = event.params.trader.toHexString();
  swap.to = sourceToken._poolToken;
  swap.tokenIn = sourceTokenID;
  swap.amountIn = event.params.sourceAmount;
  const amountInUSD = getDaiAmount(sourceToken.id, event.params.sourceAmount);
  swap.amountInUSD = amountInUSD;
  swap.tokenOut = targetTokenID;
  swap.amountOut = event.params.targetAmount;
  swap.amountOutUSD = getDaiAmount(targetToken.id, event.params.targetAmount);
  swap.pool = sourceToken._poolToken;
  swap._tradingFeeAmount = event.params.targetFeeAmount;
  const tradingFeeAmountUSD = getDaiAmount(
    targetToken.id,
    event.params.targetFeeAmount
  );
  swap._tradingFeeAmountUSD = tradingFeeAmountUSD;
  swap.save();
  const liquidityPool = schema_1.LiquidityPool.load(sourceToken._poolToken);
  if (!liquidityPool) {
    graph_ts_1.log.warning("[handleTokensTraded] liquidity pool {} not found", [
      sourceToken._poolToken,
    ]);
    return;
  }
  const protocol = getOrCreateProtocol();
  const protocolSideRevenue = tradingFeeAmountUSD.times(
    protocol._networkFeeRate
  );
  const supplySideRevenue = tradingFeeAmountUSD.minus(protocolSideRevenue);
  liquidityPool.cumulativeTotalRevenueUSD =
    liquidityPool.cumulativeTotalRevenueUSD.plus(tradingFeeAmountUSD);
  liquidityPool.cumulativeProtocolSideRevenueUSD =
    liquidityPool.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenue);
  liquidityPool.cumulativeSupplySideRevenueUSD =
    liquidityPool.cumulativeSupplySideRevenueUSD.plus(supplySideRevenue);
  liquidityPool.cumulativeVolumeUSD =
    liquidityPool.cumulativeVolumeUSD.plus(amountInUSD);
  liquidityPool._cumulativeTradingFeeAmountUSD =
    liquidityPool._cumulativeTradingFeeAmountUSD.plus(tradingFeeAmountUSD);
  // update reward emission
  if (liquidityPool._latestRewardProgramID.gt(constants_1.zeroBI)) {
    const programID = liquidityPool._latestRewardProgramID.toString();
    const rewardProgram = schema_1.RewardProgram.load(programID);
    if (!rewardProgram) {
      graph_ts_1.log.warning(
        "[_handleTotalLiquidityUpdated] reward program {} not found",
        [programID]
      );
    } else if (
      rewardProgram.startTime.le(event.block.timestamp) &&
      rewardProgram.endTime.ge(event.block.timestamp) &&
      rewardProgram.enabled
    ) {
      const rewardAmountInDay = rewardProgram.rewardsRate.times(
        graph_ts_1.BigInt.fromI32(constants_1.secondsPerDay)
      );
      const rewardAmountUSD = getDaiAmount(
        constants_1.BntAddr,
        rewardAmountInDay
      );
      liquidityPool.rewardTokenEmissionsAmount = [rewardAmountInDay];
      liquidityPool.rewardTokenEmissionsUSD = [rewardAmountUSD];
    }
  }
  liquidityPool.save();
  updateProtocolRevenue();
  updateProtocolVolume();
  snapshotUsage(
    event.block.number,
    event.block.timestamp,
    event.params.trader.toHexString(),
    EventType.Swap
  );
  snapshotLiquidityPool(
    sourceToken._poolToken,
    event.block.number,
    event.block.timestamp
  );
  updateLiquidityPoolSnapshotVolume(
    sourceToken._poolToken,
    event.params.sourceAmount,
    amountInUSD,
    event.block.number,
    event.block.timestamp
  );
  updateLiquidityPoolSnapshotRevenue(
    sourceToken._poolToken,
    tradingFeeAmountUSD,
    protocol._networkFeeRate,
    event.block.number,
    event.block.timestamp
  );
  snapshotFinancials(event.block.timestamp, event.block.number);
}
exports.handleTokensTraded = handleTokensTraded;
function handleTokensDeposited(event) {
  const reserveTokenID = event.params.token.toHexString();
  const reserveToken = schema_1.Token.load(reserveTokenID);
  if (!reserveToken) {
    graph_ts_1.log.warning(
      "[handleTokensDeposited] reserve token {} not found",
      [reserveTokenID]
    );
    return;
  }
  if (!reserveToken._poolToken) {
    graph_ts_1.log.warning(
      "[handleTokensDeposited] reserve token {} has no pool token",
      [reserveTokenID]
    );
    return;
  }
  const poolToken = schema_1.Token.load(reserveToken._poolToken);
  if (!poolToken) {
    graph_ts_1.log.warning("[handleTokensDeposited] pool token {} not found", [
      reserveToken._poolToken,
    ]);
    return;
  }
  _handleTokensDeposited(
    event,
    event.params.provider,
    reserveToken,
    event.params.tokenAmount,
    poolToken,
    event.params.poolTokenAmount
  );
}
exports.handleTokensDeposited = handleTokensDeposited;
function handleBNTDeposited(event) {
  const bntToken = schema_1.Token.load(constants_1.BntAddr);
  if (!bntToken) {
    graph_ts_1.log.warning("[handleBNTDeposited] BNT token {} not found", [
      constants_1.BntAddr,
    ]);
    return;
  }
  const bnBntToken = schema_1.Token.load(constants_1.BnBntAddr);
  if (!bnBntToken) {
    graph_ts_1.log.warning("[handleBNTDeposited] bnBNT token {} not found", [
      constants_1.BnBntAddr,
    ]);
    return;
  }
  _handleTokensDeposited(
    event,
    event.params.provider,
    bntToken,
    event.params.bntAmount,
    bnBntToken,
    event.params.poolTokenAmount
  );
}
exports.handleBNTDeposited = handleBNTDeposited;
function handleTokensWithdrawn(event) {
  const reserveTokenID = event.params.token.toHexString();
  const reserveToken = schema_1.Token.load(reserveTokenID);
  if (!reserveToken) {
    graph_ts_1.log.warning(
      "[handleTokensWithdrawn] reserve token {} not found",
      [reserveTokenID]
    );
    return;
  }
  const poolToken = schema_1.Token.load(reserveToken._poolToken);
  if (!poolToken) {
    graph_ts_1.log.warning("[handleTokensWithdrawn] pool token {} not found", [
      reserveToken._poolToken,
    ]);
    return;
  }
  _handleTokensWithdrawn(
    event,
    event.params.provider,
    reserveToken,
    event.params.tokenAmount,
    poolToken,
    event.params.poolTokenAmount,
    event.params.withdrawalFeeAmount
  );
}
exports.handleTokensWithdrawn = handleTokensWithdrawn;
function handleBNTWithdrawn(event) {
  const bntToken = schema_1.Token.load(constants_1.BntAddr);
  if (!bntToken) {
    graph_ts_1.log.warning("[handleBNTWithdrawn] BNT token {} not found", [
      constants_1.BntAddr,
    ]);
    return;
  }
  const bnBntToken = schema_1.Token.load(constants_1.BnBntAddr);
  if (!bnBntToken) {
    graph_ts_1.log.warning("[handleBNTWithdrawn] bnBNT token {} not found", [
      constants_1.BnBntAddr,
    ]);
    return;
  }
  _handleTokensWithdrawn(
    event,
    event.params.provider,
    bntToken,
    event.params.bntAmount,
    bnBntToken,
    event.params.poolTokenAmount,
    event.params.withdrawalFeeAmount
  );
}
exports.handleBNTWithdrawn = handleBNTWithdrawn;
function handleTotalLiquidityUpdated(event) {
  const tokenAddress = event.params.pool.toHexString();
  const token = schema_1.Token.load(tokenAddress);
  if (!token) {
    graph_ts_1.log.warning(
      "[handleTotalLiquidityUpdated] reserve token {} not found",
      [tokenAddress]
    );
    return;
  }
  if (!token._poolToken) {
    graph_ts_1.log.warning(
      "[handleTotalLiquidityUpdated] reserve token {} has no pool token",
      [tokenAddress]
    );
    return;
  }
  const poolToken = schema_1.Token.load(token._poolToken);
  if (!poolToken) {
    graph_ts_1.log.warning(
      "[handleTotalLiquidityUpdated] pool token {} not found",
      [token._poolToken]
    );
    return;
  }
  const liquidityPool = schema_1.LiquidityPool.load(token._poolToken);
  if (!liquidityPool) {
    graph_ts_1.log.warning(
      "[handleTotalLiquidityUpdated] liquidity pool {} not found",
      [token._poolToken]
    );
    return;
  }
  _handleTotalLiquidityUpdated(
    liquidityPool,
    token.id,
    event.params.stakedBalance,
    event.params.poolTokenSupply,
    poolToken.decimals
  );
}
exports.handleTotalLiquidityUpdated = handleTotalLiquidityUpdated;
function handleBNTTotalLiquidityUpdated(event) {
  const bnBntToken = schema_1.Token.load(constants_1.BnBntAddr);
  if (!bnBntToken) {
    graph_ts_1.log.warning(
      "[handleBNTTotalLiquidityUpdated] bnBNT token {} not found",
      [constants_1.BnBntAddr]
    );
    return;
  }
  const bnBntLiquidityPool = schema_1.LiquidityPool.load(constants_1.BnBntAddr);
  if (!bnBntLiquidityPool) {
    graph_ts_1.log.warning(
      "[handleBNTTotalLiquidityUpdated] bnBNT liquidity pool {} not found",
      [constants_1.BnBntAddr]
    );
    return;
  }
  _handleTotalLiquidityUpdated(
    bnBntLiquidityPool,
    constants_1.BntAddr,
    event.params.stakedBalance,
    event.params.poolTokenSupply,
    bnBntToken.decimals
  );
}
exports.handleBNTTotalLiquidityUpdated = handleBNTTotalLiquidityUpdated;
// currently each pool only has 1 reward program
function handleProgramCreated(event) {
  const reserveTokenId = event.params.pool.toHexString();
  const reserveToken = schema_1.Token.load(reserveTokenId);
  if (!reserveToken) {
    graph_ts_1.log.warning(
      "[handleProgramCreated] reserve token {} not found",
      [reserveTokenId]
    );
    return;
  }
  if (!reserveToken._poolToken) {
    graph_ts_1.log.warning(
      "[handleProgramCreated] reserve token {} has no pool token",
      [reserveTokenId]
    );
    return;
  }
  const liquidityPool = schema_1.LiquidityPool.load(reserveToken._poolToken);
  if (!liquidityPool) {
    graph_ts_1.log.warning(
      "[handleProgramCreated] liquidity pool {} not found",
      [reserveToken._poolToken]
    );
    return;
  }
  const rewardProgramID = event.params.programId.toString();
  const rewardProgram = new schema_1.RewardProgram(rewardProgramID);
  rewardProgram.pool = liquidityPool.id;
  rewardProgram.enabled = true;
  rewardProgram.totalRewards = event.params.totalRewards;
  rewardProgram.startTime = event.params.startTime;
  rewardProgram.endTime = event.params.endTime;
  rewardProgram.rewardsRate = event.params.totalRewards.div(
    event.params.endTime.minus(event.params.startTime)
  );
  rewardProgram.save();
  liquidityPool._latestRewardProgramID = event.params.programId;
  liquidityPool.save();
}
exports.handleProgramCreated = handleProgramCreated;
function handleProgramTerminated(event) {
  const programID = event.params.programId.toString();
  const rewardProgram = schema_1.RewardProgram.load(programID);
  if (!rewardProgram) {
    graph_ts_1.log.warning(
      "[handleProgramTerminated] reward program {} not found",
      [programID]
    );
    return;
  }
  rewardProgram.endTime = event.params.endTime;
  rewardProgram.save();
}
exports.handleProgramTerminated = handleProgramTerminated;
function handleProgramEnabled(event) {
  const programID = event.params.programId.toString();
  const rewardProgram = schema_1.RewardProgram.load(programID);
  if (!rewardProgram) {
    graph_ts_1.log.warning(
      "[handleProgramTerminated] reward program {} not found",
      [programID]
    );
    return;
  }
  rewardProgram.enabled = event.params.status;
  rewardProgram.save();
}
exports.handleProgramEnabled = handleProgramEnabled;
function getOrCreateProtocol() {
  let protocol = schema_1.DexAmmProtocol.load(constants_1.BancorNetworkAddr);
  if (!protocol) {
    protocol = new schema_1.DexAmmProtocol(constants_1.BancorNetworkAddr);
    protocol.name = "Bancor V3";
    protocol.slug = "bancor-v3";
    protocol.network = constants_1.Network.MAINNET;
    protocol.type = constants_1.ProtocolType.EXCHANGE;
    protocol.totalValueLockedUSD = constants_1.zeroBD;
    protocol.cumulativeVolumeUSD = constants_1.zeroBD;
    protocol.cumulativeSupplySideRevenueUSD = constants_1.zeroBD;
    protocol.cumulativeProtocolSideRevenueUSD = constants_1.zeroBD;
    protocol.cumulativeTotalRevenueUSD = constants_1.zeroBD;
    protocol.cumulativeUniqueUsers = 0;
    protocol.totalPoolCount = 0;
    protocol._poolIDs = [];
    protocol._defaultTradingFeeRate = constants_1.zeroBD;
    protocol._networkFeeRate = constants_1.zeroBD;
    protocol._withdrawalFeeRate = constants_1.zeroBD;
  }
  protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
  protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
  protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
  protocol.save();
  return protocol;
}
function createLiquidityPool(
  reserveToken,
  poolToken,
  blockTimestamp,
  blockNumber
) {
  const protocol = getOrCreateProtocol();
  // init fees
  const withdrawalFee = new schema_1.LiquidityPoolFee(
    constants_1.LiquidityPoolFeeType.WITHDRAWAL_FEE.concat("-").concat(
      poolToken.id
    )
  );
  withdrawalFee.feePercentage = constants_1.zeroBD;
  withdrawalFee.feeType = constants_1.LiquidityPoolFeeType.WITHDRAWAL_FEE;
  withdrawalFee.save();
  const tradingFee = new schema_1.LiquidityPoolFee(
    constants_1.LiquidityPoolFeeType.DYNAMIC_TRADING_FEE.concat("-").concat(
      poolToken.id
    )
  );
  tradingFee.feePercentage = constants_1.zeroBD;
  tradingFee.feeType = constants_1.LiquidityPoolFeeType.DYNAMIC_TRADING_FEE;
  tradingFee.save();
  const protocolFee = new schema_1.LiquidityPoolFee(
    constants_1.LiquidityPoolFeeType.DYNAMIC_PROTOCOL_FEE.concat("-").concat(
      poolToken.id
    )
  );
  protocolFee.feePercentage = constants_1.zeroBD;
  protocolFee.feeType = constants_1.LiquidityPoolFeeType.DYNAMIC_PROTOCOL_FEE;
  protocolFee.save();
  const lpFee = new schema_1.LiquidityPoolFee(
    constants_1.LiquidityPoolFeeType.DYNAMIC_LP_FEE.concat("-").concat(
      poolToken.id
    )
  );
  lpFee.feePercentage = constants_1.zeroBD;
  lpFee.feeType = constants_1.LiquidityPoolFeeType.DYNAMIC_LP_FEE;
  lpFee.save();
  const rewardToken = new schema_1.RewardToken(
    constants_1.RewardTokenType.DEPOSIT.concat("-").concat(constants_1.BntAddr)
  );
  rewardToken.token = constants_1.BnBntAddr;
  rewardToken.type = constants_1.RewardTokenType.DEPOSIT;
  rewardToken.save();
  const liquidityPool = new schema_1.LiquidityPool(poolToken.id);
  liquidityPool.protocol = protocol.id;
  liquidityPool.name = poolToken.name;
  liquidityPool.symbol = poolToken.symbol;
  liquidityPool.inputTokens = [reserveToken.id];
  liquidityPool.outputToken = poolToken.id;
  liquidityPool.rewardTokens = [rewardToken.id];
  liquidityPool.fees = [
    withdrawalFee.id,
    tradingFee.id,
    protocolFee.id,
    lpFee.id,
  ];
  liquidityPool.isSingleSided = true;
  liquidityPool.createdTimestamp = blockTimestamp;
  liquidityPool.createdBlockNumber = blockNumber;
  liquidityPool.totalValueLockedUSD = constants_1.zeroBD;
  liquidityPool.cumulativeTotalRevenueUSD = constants_1.zeroBD;
  liquidityPool.cumulativeProtocolSideRevenueUSD = constants_1.zeroBD;
  liquidityPool.cumulativeSupplySideRevenueUSD = constants_1.zeroBD;
  liquidityPool.cumulativeVolumeUSD = constants_1.zeroBD;
  liquidityPool.inputTokenBalances = [constants_1.zeroBI];
  liquidityPool.inputTokenWeights = [
    new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(1)),
  ];
  liquidityPool.outputTokenSupply = constants_1.zeroBI;
  liquidityPool.outputTokenPriceUSD = constants_1.zeroBD;
  liquidityPool.stakedOutputTokenAmount = constants_1.zeroBI;
  liquidityPool.rewardTokenEmissionsAmount = [constants_1.zeroBI];
  liquidityPool.rewardTokenEmissionsUSD = [constants_1.zeroBD];
  liquidityPool._tradingFeeRate = protocol._defaultTradingFeeRate;
  liquidityPool._cumulativeTradingFeeAmountUSD = constants_1.zeroBD;
  liquidityPool._cumulativeWithdrawalFeeAmountUSD = constants_1.zeroBD;
  liquidityPool._latestRewardProgramID = constants_1.zeroBI;
  liquidityPool.save();
  updateLiquidityPoolFees(poolToken.id);
  return liquidityPool;
}
function _handleTokensDeposited(
  event,
  depositer,
  reserveToken,
  reserveTokenAmount,
  poolToken,
  poolTokenAmount
) {
  const deposit = new schema_1.Deposit(
    "deposit-"
      .concat(event.transaction.hash.toHexString())
      .concat("-")
      .concat(event.logIndex.toString())
  );
  deposit.hash = event.transaction.hash.toHexString();
  deposit.logIndex = event.logIndex.toI32();
  deposit.protocol = getOrCreateProtocol().id;
  deposit.blockNumber = event.block.number;
  deposit.timestamp = event.block.timestamp;
  deposit.to = poolToken.id;
  deposit.from = depositer.toHexString();
  deposit.inputTokens = [reserveToken.id];
  deposit.inputTokenAmounts = [reserveTokenAmount];
  deposit.outputToken = poolToken.id;
  deposit.outputTokenAmount = poolTokenAmount;
  deposit.amountUSD = getDaiAmount(reserveToken.id, reserveTokenAmount);
  deposit.pool = poolToken.id;
  deposit.save();
  snapshotUsage(
    event.block.number,
    event.block.timestamp,
    depositer.toHexString(),
    EventType.Deposit
  );
  snapshotLiquidityPool(
    poolToken.id,
    event.block.number,
    event.block.timestamp
  );
  snapshotFinancials(event.block.timestamp, event.block.number);
}
function _handleTokensWithdrawn(
  event,
  withdrawer,
  reserveToken,
  reserveTokenAmount,
  poolToken,
  poolTokenAmount,
  withdrawalFeeAmount
) {
  const withdraw = new schema_1.Withdraw(
    "withdraw-"
      .concat(event.transaction.hash.toHexString())
      .concat("-")
      .concat(event.logIndex.toString())
  );
  withdraw.hash = event.transaction.hash.toHexString();
  withdraw.logIndex = event.logIndex.toI32();
  withdraw.protocol = getOrCreateProtocol().id;
  withdraw.blockNumber = event.block.number;
  withdraw.timestamp = event.block.timestamp;
  withdraw.to = withdrawer.toHexString();
  withdraw.from = poolToken.id;
  withdraw.inputTokens = [reserveToken.id];
  withdraw.inputTokenAmounts = [reserveTokenAmount];
  withdraw.outputToken = poolToken.id;
  withdraw.outputTokenAmount = poolTokenAmount;
  withdraw.amountUSD = getDaiAmount(reserveToken.id, reserveTokenAmount);
  withdraw.pool = poolToken.id;
  withdraw._withdrawalFeeAmount = withdrawalFeeAmount;
  const withdrawalFeeAmountUSD = getDaiAmount(
    reserveToken.id,
    withdrawalFeeAmount
  );
  withdraw._withdrawalFeeAmountUSD = withdrawalFeeAmountUSD;
  withdraw.save();
  const liquidityPool = schema_1.LiquidityPool.load(poolToken.id);
  if (!liquidityPool) {
    graph_ts_1.log.warning(
      "[handleTokensWithdrawn] liquidity pool {} not found",
      [poolToken.id]
    );
    return;
  }
  liquidityPool.cumulativeTotalRevenueUSD =
    liquidityPool.cumulativeTotalRevenueUSD.plus(withdrawalFeeAmountUSD);
  liquidityPool.cumulativeProtocolSideRevenueUSD =
    liquidityPool.cumulativeProtocolSideRevenueUSD.plus(withdrawalFeeAmountUSD);
  liquidityPool._cumulativeWithdrawalFeeAmountUSD =
    liquidityPool._cumulativeWithdrawalFeeAmountUSD.plus(
      withdrawalFeeAmountUSD
    );
  liquidityPool.save();
  updateProtocolRevenue();
  snapshotUsage(
    event.block.number,
    event.block.timestamp,
    withdrawer.toHexString(),
    EventType.Withdraw
  );
  snapshotLiquidityPool(
    poolToken.id,
    event.block.number,
    event.block.timestamp
  );
  snapshotFinancials(event.block.timestamp, event.block.number);
}
function _handleTotalLiquidityUpdated(
  liquidityPool,
  reserveTokenID,
  stakedBalance,
  poolTokenSupply,
  poolTokenDecimals
) {
  const prevTotalValueLockedUSD = liquidityPool.totalValueLockedUSD;
  const currTotalValueLockedUSD = getDaiAmount(reserveTokenID, stakedBalance);
  liquidityPool.inputTokenBalances = [stakedBalance];
  liquidityPool.totalValueLockedUSD = currTotalValueLockedUSD;
  liquidityPool.outputTokenSupply = poolTokenSupply;
  liquidityPool.outputTokenPriceUSD = getDaiAmount(
    reserveTokenID,
    getReserveTokenAmount(
      reserveTokenID,
      graph_ts_1.BigInt.fromI32(constants_1.INT_TEN).pow(poolTokenDecimals) // 1 share of pool token
    )
  );
  liquidityPool.save();
  const protocol = schema_1.DexAmmProtocol.load(constants_1.BancorNetworkAddr);
  if (!protocol) {
    graph_ts_1.log.warning(
      "[_handleTotalLiquidityUpdated] protocol not found",
      []
    );
    return;
  }
  protocol.totalValueLockedUSD = protocol.totalValueLockedUSD
    .plus(currTotalValueLockedUSD)
    .minus(prevTotalValueLockedUSD);
  protocol.save();
}
function getDaiAmount(sourceTokenID, sourceAmountMantissa) {
  if (sourceTokenID == constants_1.DaiAddr) {
    return sourceAmountMantissa
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(constants_1.INT_EIGHTEEN));
  }
  const sourceToken = schema_1.Token.load(sourceTokenID);
  if (!sourceToken) {
    graph_ts_1.log.warning("[getDaiAmount] token {} not found", [
      sourceTokenID,
    ]);
    return constants_1.zeroBD;
  }
  const sourceAmount = sourceAmountMantissa
    .toBigDecimal()
    .div((0, constants_1.exponentToBigDecimal)(sourceToken.decimals));
  const priceUSD = getTokenPriceUSD(sourceTokenID, sourceToken.decimals);
  return sourceAmount.times(priceUSD);
}
// get usd price of a certain token
// by calling tradeOutputBySourceAmount method in BancorNetworkInfo
// potential optimization: store price at Token.lastPriceUSD
function getTokenPriceUSD(token, decimals) {
  const info = BancorNetworkInfo_1.BancorNetworkInfo.bind(
    graph_ts_1.Address.fromString(constants_1.BancorNetworkInfoAddr)
  );
  const stables = [
    [constants_1.DaiAddr, constants_1.DaiDecimals],
    [constants_1.UsdcAddr, constants_1.UsdcDecimals],
    [constants_1.UsdtAddr, constants_1.UsdtDecimals],
  ];
  for (let i = 0; i < stables.length; i++) {
    const stableAmountMantissaResult = info.try_tradeOutputBySourceAmount(
      graph_ts_1.Address.fromString(token),
      graph_ts_1.Address.fromString(stables[i][0]),
      (0, constants_1.exponentToBigInt)(decimals)
    );
    if (!stableAmountMantissaResult.reverted) {
      return stableAmountMantissaResult.value
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(parseInt(stables[i][1])));
    } else {
      graph_ts_1.log.warning(
        "[getTokenPriceUSD] try_tradeOutputBySourceAmount({}, {}, {}) reverted",
        [
          token,
          stables[i][0],
          (0, constants_1.exponentToBigInt)(decimals).toString(),
        ]
      );
    }
  }
  return constants_1.zeroBD;
}
function getReserveTokenAmount(reserveTokenID, poolTokenAmount) {
  const info = BancorNetworkInfo_1.BancorNetworkInfo.bind(
    graph_ts_1.Address.fromString(constants_1.BancorNetworkInfoAddr)
  );
  const reserveTokenAmountResult = info.try_poolTokenToUnderlying(
    graph_ts_1.Address.fromString(reserveTokenID),
    poolTokenAmount
  );
  if (reserveTokenAmountResult.reverted) {
    graph_ts_1.log.warning(
      "[getReserveTokenAmount] try_poolTokenToUnderlying({}, {}) reverted",
      [reserveTokenID, poolTokenAmount.toString()]
    );
    return constants_1.zeroBI;
  }
  return reserveTokenAmountResult.value;
}
function snapshotUsage(blockNumber, blockTimestamp, accountID, eventType) {
  const protocol = schema_1.DexAmmProtocol.load(constants_1.BancorNetworkAddr);
  if (!protocol) {
    graph_ts_1.log.error(
      "[snapshotUsage] Protocol not found, this SHOULD NOT happen",
      []
    );
    return;
  }
  let account = schema_1.Account.load(accountID);
  if (!account) {
    account = new schema_1.Account(accountID);
    account.save();
    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
  }
  //
  // daily snapshot
  //
  const dailySnapshotID = (
    blockTimestamp.toI32() / constants_1.secondsPerDay
  ).toString();
  let dailySnapshot = schema_1.UsageMetricsDailySnapshot.load(dailySnapshotID);
  if (!dailySnapshot) {
    dailySnapshot = new schema_1.UsageMetricsDailySnapshot(dailySnapshotID);
    dailySnapshot.protocol = protocol.id;
    dailySnapshot.dailyActiveUsers = 0;
    dailySnapshot.cumulativeUniqueUsers = 0;
    dailySnapshot.totalPoolCount = 0;
    dailySnapshot.dailyTransactionCount = 0;
    dailySnapshot.dailyDepositCount = 0;
    dailySnapshot.dailyWithdrawCount = 0;
    dailySnapshot.dailySwapCount = 0;
    dailySnapshot.blockNumber = blockNumber;
    dailySnapshot.timestamp = blockTimestamp;
  }
  const dailyAccountID = accountID.concat("-").concat(dailySnapshotID);
  let dailyActiveAccount = schema_1.ActiveAccount.load(dailyAccountID);
  if (!dailyActiveAccount) {
    dailyActiveAccount = new schema_1.ActiveAccount(dailyAccountID);
    dailyActiveAccount.save();
    dailySnapshot.dailyActiveUsers += 1;
  }
  dailySnapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
  dailySnapshot.totalPoolCount = protocol.totalPoolCount;
  dailySnapshot.dailyTransactionCount += 1;
  switch (eventType) {
    case EventType.Deposit:
      dailySnapshot.dailyDepositCount += 1;
      break;
    case EventType.Withdraw:
      dailySnapshot.dailyWithdrawCount += 1;
      break;
    case EventType.Swap:
      dailySnapshot.dailySwapCount += 1;
      break;
    default:
  }
  dailySnapshot.blockNumber = blockNumber;
  dailySnapshot.timestamp = blockTimestamp;
  dailySnapshot.save();
  //
  // hourly snapshot
  //
  const hourlySnapshotID = (
    blockTimestamp.toI32() / constants_1.secondsPerHour
  ).toString();
  let hourlySnapshot =
    schema_1.UsageMetricsHourlySnapshot.load(hourlySnapshotID);
  if (!hourlySnapshot) {
    hourlySnapshot = new schema_1.UsageMetricsHourlySnapshot(hourlySnapshotID);
    hourlySnapshot.protocol = protocol.id;
    hourlySnapshot.hourlyActiveUsers = 0;
    hourlySnapshot.cumulativeUniqueUsers = 0;
    hourlySnapshot.hourlyTransactionCount = 0;
    hourlySnapshot.hourlyDepositCount = 0;
    hourlySnapshot.hourlyWithdrawCount = 0;
    hourlySnapshot.hourlySwapCount = 0;
    hourlySnapshot.blockNumber = blockNumber;
    hourlySnapshot.timestamp = blockTimestamp;
  }
  const hourlyAccountID = accountID.concat("-").concat(hourlySnapshotID);
  let hourlyActiveAccount = schema_1.ActiveAccount.load(hourlyAccountID);
  if (!hourlyActiveAccount) {
    hourlyActiveAccount = new schema_1.ActiveAccount(hourlyAccountID);
    hourlyActiveAccount.save();
    hourlySnapshot.hourlyActiveUsers += 1;
  }
  hourlySnapshot.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
  hourlySnapshot.hourlyTransactionCount += 1;
  switch (eventType) {
    case EventType.Deposit:
      hourlySnapshot.hourlyDepositCount += 1;
      break;
    case EventType.Withdraw:
      hourlySnapshot.hourlyWithdrawCount += 1;
      break;
    case EventType.Swap:
      hourlySnapshot.hourlySwapCount += 1;
      break;
    default:
  }
  hourlySnapshot.blockNumber = blockNumber;
  hourlySnapshot.timestamp = blockTimestamp;
  hourlySnapshot.save();
}
function snapshotLiquidityPool(liquidityPoolID, blockNumber, blockTimestamp) {
  const liquidityPool = schema_1.LiquidityPool.load(liquidityPoolID);
  if (!liquidityPool) {
    graph_ts_1.log.warning(
      "[snapshotLiquidityPool] liquidity pool {} not found",
      [liquidityPoolID]
    );
    return;
  }
  //
  // daily snapshot
  //
  const dailySnapshot = getOrCreateLiquidityPoolDailySnapshot(
    liquidityPoolID,
    blockTimestamp,
    blockNumber
  );
  dailySnapshot.totalValueLockedUSD = liquidityPool.totalValueLockedUSD;
  dailySnapshot.cumulativeTotalRevenueUSD =
    liquidityPool.cumulativeTotalRevenueUSD;
  dailySnapshot.cumulativeProtocolSideRevenueUSD =
    liquidityPool.cumulativeProtocolSideRevenueUSD;
  dailySnapshot.cumulativeSupplySideRevenueUSD =
    liquidityPool.cumulativeSupplySideRevenueUSD;
  dailySnapshot.cumulativeVolumeUSD = liquidityPool.cumulativeVolumeUSD;
  dailySnapshot.inputTokenBalances = [liquidityPool.inputTokenBalances[0]];
  dailySnapshot.inputTokenWeights = [liquidityPool.inputTokenWeights[0]];
  dailySnapshot.outputTokenSupply = liquidityPool.outputTokenSupply;
  dailySnapshot.outputTokenPriceUSD = liquidityPool.outputTokenPriceUSD;
  dailySnapshot.stakedOutputTokenAmount = liquidityPool.stakedOutputTokenAmount;
  dailySnapshot.rewardTokenEmissionsAmount = [
    liquidityPool.rewardTokenEmissionsAmount[0],
  ];
  dailySnapshot.rewardTokenEmissionsUSD = liquidityPool.rewardTokenEmissionsUSD;
  dailySnapshot.save();
  //
  // hourly snapshot
  //
  const hourlySnapshot = getOrCreateLiquidityPoolHourlySnapshot(
    liquidityPoolID,
    blockTimestamp,
    blockNumber
  );
  hourlySnapshot.totalValueLockedUSD = liquidityPool.totalValueLockedUSD;
  hourlySnapshot.cumulativeTotalRevenueUSD =
    liquidityPool.cumulativeTotalRevenueUSD;
  hourlySnapshot.cumulativeProtocolSideRevenueUSD =
    liquidityPool.cumulativeProtocolSideRevenueUSD;
  hourlySnapshot.cumulativeSupplySideRevenueUSD =
    liquidityPool.cumulativeSupplySideRevenueUSD;
  hourlySnapshot.cumulativeVolumeUSD = liquidityPool.cumulativeVolumeUSD;
  hourlySnapshot.inputTokenBalances = [liquidityPool.inputTokenBalances[0]];
  hourlySnapshot.inputTokenWeights = [liquidityPool.inputTokenWeights[0]];
  hourlySnapshot.outputTokenSupply = liquidityPool.outputTokenSupply;
  hourlySnapshot.outputTokenPriceUSD = liquidityPool.outputTokenPriceUSD;
  hourlySnapshot.stakedOutputTokenAmount =
    liquidityPool.stakedOutputTokenAmount;
  hourlySnapshot.rewardTokenEmissionsAmount = [
    liquidityPool.rewardTokenEmissionsAmount[0],
  ];
  hourlySnapshot.rewardTokenEmissionsUSD =
    liquidityPool.rewardTokenEmissionsUSD;
  hourlySnapshot.save();
}
function updateLiquidityPoolSnapshotVolume(
  liquidityPoolID,
  amount,
  amountUSD,
  blockNumber,
  blockTimestamp
) {
  //
  // daily snapshot
  //
  const dailySnapshot = getOrCreateLiquidityPoolDailySnapshot(
    liquidityPoolID,
    blockTimestamp,
    blockNumber
  );
  dailySnapshot.dailyVolumeByTokenAmount = [
    dailySnapshot.dailyVolumeByTokenAmount[0].plus(amount),
  ];
  dailySnapshot.dailyVolumeByTokenUSD = [
    dailySnapshot.dailyVolumeByTokenUSD[0].plus(amountUSD),
  ];
  dailySnapshot.dailyVolumeUSD = dailySnapshot.dailyVolumeByTokenUSD[0];
  dailySnapshot.save();
  //
  // hourly snapshot
  //
  const hourlySnapshot = getOrCreateLiquidityPoolHourlySnapshot(
    liquidityPoolID,
    blockTimestamp,
    blockNumber
  );
  hourlySnapshot.hourlyVolumeByTokenAmount = [
    hourlySnapshot.hourlyVolumeByTokenAmount[0].plus(amount),
  ];
  hourlySnapshot.hourlyVolumeByTokenUSD = [
    hourlySnapshot.hourlyVolumeByTokenUSD[0].plus(amountUSD),
  ];
  hourlySnapshot.hourlyVolumeUSD = hourlySnapshot.hourlyVolumeByTokenUSD[0];
  hourlySnapshot.save();
}
function updateLiquidityPoolSnapshotRevenue(
  liquidityPoolID,
  revenue,
  networkFeeRate,
  blockNumber,
  blockTimestamp
) {
  const protocolSideRevenue = revenue.times(networkFeeRate);
  const supplySideRevenue = revenue.minus(protocolSideRevenue);
  //
  // daily snapshot
  //
  const dailySnapshot = getOrCreateLiquidityPoolDailySnapshot(
    liquidityPoolID,
    blockTimestamp,
    blockNumber
  );
  dailySnapshot.dailyTotalRevenueUSD =
    dailySnapshot.dailyTotalRevenueUSD.plus(revenue);
  dailySnapshot.dailyProtocolSideRevenueUSD =
    dailySnapshot.dailyProtocolSideRevenueUSD.plus(protocolSideRevenue);
  dailySnapshot.dailySupplySideRevenueUSD =
    dailySnapshot.dailySupplySideRevenueUSD.plus(supplySideRevenue);
  dailySnapshot.save();
  //
  // hourly snapshot
  //
  const hourlySnapshot = getOrCreateLiquidityPoolHourlySnapshot(
    liquidityPoolID,
    blockTimestamp,
    blockNumber
  );
  hourlySnapshot.hourlyTotalRevenueUSD =
    hourlySnapshot.hourlyTotalRevenueUSD.plus(revenue);
  hourlySnapshot.hourlyProtocolSideRevenueUSD =
    hourlySnapshot.hourlyProtocolSideRevenueUSD.plus(protocolSideRevenue);
  hourlySnapshot.hourlySupplySideRevenueUSD =
    hourlySnapshot.hourlySupplySideRevenueUSD.plus(supplySideRevenue);
  hourlySnapshot.save();
}
function updateProtocolRevenue() {
  const protocol = schema_1.DexAmmProtocol.load(constants_1.BancorNetworkAddr);
  if (!protocol) {
    graph_ts_1.log.warning("[updateProtocolRevenue] protocol not found", []);
    return;
  }
  let cumulativeTotalRevenueUSD = constants_1.zeroBD;
  let cumulativeProtocolSideRevenueUSD = constants_1.zeroBD;
  let cumulativeSupplySideRevenueUSD = constants_1.zeroBD;
  for (let i = 0; i < protocol._poolIDs.length; i++) {
    const liquidityPool = schema_1.LiquidityPool.load(protocol._poolIDs[i]);
    if (!liquidityPool) {
      graph_ts_1.log.warning(
        "[updateProtocolRevenue] liqudity pool {} not found",
        [protocol._poolIDs[i]]
      );
      return;
    }
    cumulativeTotalRevenueUSD = cumulativeTotalRevenueUSD.plus(
      liquidityPool.cumulativeTotalRevenueUSD
    );
    cumulativeProtocolSideRevenueUSD = cumulativeProtocolSideRevenueUSD.plus(
      liquidityPool.cumulativeProtocolSideRevenueUSD
    );
    cumulativeSupplySideRevenueUSD = cumulativeSupplySideRevenueUSD.plus(
      liquidityPool.cumulativeSupplySideRevenueUSD
    );
  }
  protocol.cumulativeTotalRevenueUSD = cumulativeTotalRevenueUSD;
  protocol.cumulativeProtocolSideRevenueUSD = cumulativeProtocolSideRevenueUSD;
  protocol.cumulativeSupplySideRevenueUSD = cumulativeSupplySideRevenueUSD;
  protocol.save();
}
function updateProtocolVolume() {
  const protocol = schema_1.DexAmmProtocol.load(constants_1.BancorNetworkAddr);
  if (!protocol) {
    graph_ts_1.log.warning("[updateProtocolVolume] protocol not found", []);
    return;
  }
  let cumulativeVolumeUSD = constants_1.zeroBD;
  for (let i = 0; i < protocol._poolIDs.length; i++) {
    const liquidityPool = schema_1.LiquidityPool.load(protocol._poolIDs[i]);
    if (!liquidityPool) {
      graph_ts_1.log.warning(
        "[updateProtocolVolume] liqudity pool {} not found",
        [protocol._poolIDs[i]]
      );
      return;
    }
    cumulativeVolumeUSD = cumulativeVolumeUSD.plus(
      liquidityPool.cumulativeVolumeUSD
    );
  }
  protocol.cumulativeVolumeUSD = cumulativeVolumeUSD;
  protocol.save();
}
function snapshotFinancials(blockTimestamp, blockNumber) {
  const protocol = schema_1.DexAmmProtocol.load(constants_1.BancorNetworkAddr);
  if (!protocol) {
    graph_ts_1.log.warning("[snapshotFinancials] protocol not found", []);
    return;
  }
  const snapshot = getOrCreateFinancialsDailySnapshot(blockTimestamp);
  snapshot.timestamp = blockTimestamp;
  snapshot.blockNumber = blockNumber;
  snapshot.totalValueLockedUSD = protocol.totalValueLockedUSD;
  snapshot.cumulativeVolumeUSD = protocol.cumulativeVolumeUSD;
  snapshot.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD;
  snapshot.cumulativeProtocolSideRevenueUSD =
    protocol.cumulativeProtocolSideRevenueUSD;
  snapshot.cumulativeSupplySideRevenueUSD =
    protocol.cumulativeSupplySideRevenueUSD;
  let dailyVolumeUSD = constants_1.zeroBD;
  let dailyTotalRevenueUSD = constants_1.zeroBD;
  let dailyProtocolSideRevenueUSD = constants_1.zeroBD;
  let dailySupplySideRevenueUSD = constants_1.zeroBD;
  for (let i = 0; i < protocol._poolIDs.length; i++) {
    const liquidityPool = schema_1.LiquidityPool.load(protocol._poolIDs[i]);
    if (!liquidityPool) {
      graph_ts_1.log.warning(
        "[snapshotFinancials] liqudity pool {} not found",
        [protocol._poolIDs[i]]
      );
      return;
    }
    const liquidityPoolDailySnapshotID = getLiquidityPoolDailySnapshotID(
      liquidityPool.id,
      blockTimestamp.toI32()
    );
    const liquidityPoolDailySnapshot = schema_1.LiquidityPoolDailySnapshot.load(
      liquidityPoolDailySnapshotID
    );
    if (!liquidityPoolDailySnapshot) {
      graph_ts_1.log.warning(
        "[snapshotFinancials] liquidity pool daily snapshot {} not found",
        [liquidityPoolDailySnapshotID]
      );
      continue;
    }
    dailyVolumeUSD = dailyVolumeUSD.plus(
      liquidityPoolDailySnapshot.dailyVolumeUSD
    );
    dailyTotalRevenueUSD = dailyTotalRevenueUSD.plus(
      liquidityPoolDailySnapshot.dailyTotalRevenueUSD
    );
    dailyProtocolSideRevenueUSD = dailyProtocolSideRevenueUSD.plus(
      liquidityPoolDailySnapshot.dailyProtocolSideRevenueUSD
    );
    dailySupplySideRevenueUSD = dailySupplySideRevenueUSD.plus(
      liquidityPoolDailySnapshot.dailySupplySideRevenueUSD
    );
  }
  snapshot.dailyVolumeUSD = dailyVolumeUSD;
  snapshot.dailyTotalRevenueUSD = dailyTotalRevenueUSD;
  snapshot.dailyProtocolSideRevenueUSD = dailyProtocolSideRevenueUSD;
  snapshot.dailySupplySideRevenueUSD = dailySupplySideRevenueUSD;
  snapshot.save();
  // protocol controlled value usd = bnt_amount * bnt_price
  const bntLiquidityPool = schema_1.LiquidityPool.load(constants_1.BnBntAddr);
  if (!bntLiquidityPool) {
    graph_ts_1.log.warning(
      "[snapshotFinancials] bnBNT liquidity pool not found",
      []
    );
    return;
  }
  if (!bntLiquidityPool.outputTokenSupply) {
    graph_ts_1.log.warning(
      "[snapshotFinancials] bnBNT liquidity pool has no outputTokenSupply",
      []
    );
    return;
  }
  const bntAmount = getReserveTokenAmount(
    constants_1.BntAddr,
    bntLiquidityPool.outputTokenSupply
  );
  snapshot.protocolControlledValueUSD = getDaiAmount(
    constants_1.BntAddr,
    bntAmount
  );
  snapshot.save();
}
function getOrCreateFinancialsDailySnapshot(blockTimestamp) {
  const snapshotID = (
    blockTimestamp.toI32() / constants_1.secondsPerDay
  ).toString();
  let snapshot = schema_1.FinancialsDailySnapshot.load(snapshotID);
  if (!snapshot) {
    snapshot = new schema_1.FinancialsDailySnapshot(snapshotID);
    snapshot.protocol = constants_1.BancorNetworkAddr;
    snapshot.blockNumber = constants_1.zeroBI;
    snapshot.timestamp = constants_1.zeroBI;
    snapshot.totalValueLockedUSD = constants_1.zeroBD;
    snapshot.protocolControlledValueUSD = constants_1.zeroBD;
    snapshot.dailyVolumeUSD = constants_1.zeroBD;
    snapshot.dailyTotalRevenueUSD = constants_1.zeroBD;
    snapshot.dailySupplySideRevenueUSD = constants_1.zeroBD;
    snapshot.dailyProtocolSideRevenueUSD = constants_1.zeroBD;
    snapshot.cumulativeVolumeUSD = constants_1.zeroBD;
    snapshot.cumulativeTotalRevenueUSD = constants_1.zeroBD;
    snapshot.cumulativeSupplySideRevenueUSD = constants_1.zeroBD;
    snapshot.cumulativeProtocolSideRevenueUSD = constants_1.zeroBD;
    snapshot.save();
  }
  return snapshot;
}
function getOrCreateLiquidityPoolDailySnapshot(
  liquidityPoolID,
  blockTimestamp,
  blockNumber
) {
  const snapshotID = getLiquidityPoolDailySnapshotID(
    liquidityPoolID,
    blockTimestamp.toI32()
  );
  let snapshot = schema_1.LiquidityPoolDailySnapshot.load(snapshotID);
  if (!snapshot) {
    snapshot = new schema_1.LiquidityPoolDailySnapshot(snapshotID);
    snapshot.blockNumber = blockNumber;
    snapshot.timestamp = blockTimestamp;
    snapshot.protocol = constants_1.BancorNetworkAddr;
    snapshot.pool = liquidityPoolID;
    snapshot.totalValueLockedUSD = constants_1.zeroBD;
    snapshot.cumulativeTotalRevenueUSD = constants_1.zeroBD;
    snapshot.cumulativeProtocolSideRevenueUSD = constants_1.zeroBD;
    snapshot.cumulativeSupplySideRevenueUSD = constants_1.zeroBD;
    snapshot.dailyTotalRevenueUSD = constants_1.zeroBD;
    snapshot.dailyProtocolSideRevenueUSD = constants_1.zeroBD;
    snapshot.dailySupplySideRevenueUSD = constants_1.zeroBD;
    snapshot.cumulativeVolumeUSD = constants_1.zeroBD;
    snapshot.inputTokenBalances = [constants_1.zeroBI];
    snapshot.inputTokenWeights = [constants_1.zeroBD];
    snapshot.outputTokenSupply = constants_1.zeroBI;
    snapshot.outputTokenPriceUSD = constants_1.zeroBD;
    snapshot.stakedOutputTokenAmount = constants_1.zeroBI;
    snapshot.rewardTokenEmissionsAmount = [constants_1.zeroBI];
    snapshot.rewardTokenEmissionsUSD = [constants_1.zeroBD];
    snapshot.dailyVolumeUSD = constants_1.zeroBD;
    snapshot.dailyVolumeByTokenAmount = [constants_1.zeroBI];
    snapshot.dailyVolumeByTokenUSD = [constants_1.zeroBD];
  }
  return snapshot;
}
function getOrCreateLiquidityPoolHourlySnapshot(
  liquidityPoolID,
  blockTimestamp,
  blockNumber
) {
  const snapshotID = getLiquidityPoolHourlySnapshotID(
    liquidityPoolID,
    blockTimestamp.toI32()
  );
  let snapshot = schema_1.LiquidityPoolHourlySnapshot.load(snapshotID);
  if (!snapshot) {
    snapshot = new schema_1.LiquidityPoolHourlySnapshot(snapshotID);
    snapshot.blockNumber = blockNumber;
    snapshot.timestamp = blockTimestamp;
    snapshot.protocol = constants_1.BancorNetworkAddr;
    snapshot.pool = liquidityPoolID;
    snapshot.totalValueLockedUSD = constants_1.zeroBD;
    snapshot.cumulativeTotalRevenueUSD = constants_1.zeroBD;
    snapshot.cumulativeProtocolSideRevenueUSD = constants_1.zeroBD;
    snapshot.cumulativeSupplySideRevenueUSD = constants_1.zeroBD;
    snapshot.hourlyTotalRevenueUSD = constants_1.zeroBD;
    snapshot.hourlyProtocolSideRevenueUSD = constants_1.zeroBD;
    snapshot.hourlySupplySideRevenueUSD = constants_1.zeroBD;
    snapshot.cumulativeVolumeUSD = constants_1.zeroBD;
    snapshot.inputTokenBalances = [constants_1.zeroBI];
    snapshot.inputTokenWeights = [constants_1.zeroBD];
    snapshot.outputTokenSupply = constants_1.zeroBI;
    snapshot.outputTokenPriceUSD = constants_1.zeroBD;
    snapshot.stakedOutputTokenAmount = constants_1.zeroBI;
    snapshot.rewardTokenEmissionsAmount = [constants_1.zeroBI];
    snapshot.rewardTokenEmissionsUSD = [constants_1.zeroBD];
    snapshot.hourlyVolumeUSD = constants_1.zeroBD;
    snapshot.hourlyVolumeByTokenAmount = [constants_1.zeroBI];
    snapshot.hourlyVolumeByTokenUSD = [constants_1.zeroBD];
  }
  return snapshot;
}
function getLiquidityPoolDailySnapshotID(liquidityPoolID, timestamp) {
  return liquidityPoolID
    .concat("-")
    .concat((timestamp / constants_1.secondsPerDay).toString());
}
function getLiquidityPoolHourlySnapshotID(liquidityPoolID, timestamp) {
  return liquidityPoolID
    .concat("-")
    .concat((timestamp / constants_1.secondsPerHour).toString());
}
function updateLiquidityPoolFees(liquidityPoolID) {
  const protocol = schema_1.DexAmmProtocol.load(constants_1.BancorNetworkAddr);
  if (!protocol) {
    graph_ts_1.log.warning("[updateLiquidityPoolFees] protocol not found", []);
    return;
  }
  const liquidityPool = schema_1.LiquidityPool.load(liquidityPoolID);
  if (!liquidityPool) {
    graph_ts_1.log.warning(
      "[updateLiquidityPoolFees] liquidity pool {} not found",
      [liquidityPoolID]
    );
    return;
  }
  const withdrawFee = schema_1.LiquidityPoolFee.load(
    liquidityPool.fees[withdrawFeeIdx]
  );
  if (!withdrawFee) {
    graph_ts_1.log.warning("[updateLiquidityPoolFees] fee {} not found", [
      liquidityPool.fees[withdrawFeeIdx],
    ]);
  } else {
    withdrawFee.feePercentage = protocol._withdrawalFeeRate.times(
      constants_1.hundredBD
    );
    withdrawFee.save();
  }
  const tradingFee = schema_1.LiquidityPoolFee.load(
    liquidityPool.fees[tradingFeeIdx]
  );
  if (!tradingFee) {
    graph_ts_1.log.warning("[updateLiquidityPoolFees] fee {} not found", [
      liquidityPool.fees[tradingFeeIdx],
    ]);
  } else {
    tradingFee.feePercentage = liquidityPool._tradingFeeRate.times(
      constants_1.hundredBD
    );
    tradingFee.save();
  }
  const protocolFee = schema_1.LiquidityPoolFee.load(
    liquidityPool.fees[protocolFeeIdx]
  );
  if (!protocolFee) {
    graph_ts_1.log.warning("[updateLiquidityPoolFees] fee {} not found", [
      liquidityPool.fees[protocolFeeIdx],
    ]);
  } else {
    protocolFee.feePercentage = liquidityPool._tradingFeeRate
      .times(protocol._networkFeeRate)
      .times(constants_1.hundredBD);
    protocolFee.save();
  }
  const lpFee = schema_1.LiquidityPoolFee.load(liquidityPool.fees[lpFeeIdx]);
  if (!lpFee) {
    graph_ts_1.log.warning("[updateLiquidityPoolFees] fee {} not found", [
      liquidityPool.fees[lpFeeIdx],
    ]);
  } else {
    lpFee.feePercentage = liquidityPool._tradingFeeRate
      .times(constants_1.oneBD.minus(protocol._networkFeeRate))
      .times(constants_1.hundredBD);
    lpFee.save();
  }
}
