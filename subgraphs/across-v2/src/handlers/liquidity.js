"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLiquidityRemoved = exports.handleLiquidityAdded = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const HubPool_1 = require("../../generated/HubPool/HubPool");
const bridge_1 = require("../sdk/protocols/bridge");
const enums_1 = require("../sdk/protocols/bridge/enums");
const util_1 = require("../util");
const schema_1 = require("../../generated/schema");
const _ERC20_1 = require("../../generated/SpokePool1/_ERC20");
const numbers_1 = require("../sdk/util/numbers");
const constants_1 = require("../prices/common/constants");
function handleLiquidityAdded(event) {
  const tokenPricer = new util_1.Pricer(event.block);
  const sdk = bridge_1.SDK.initializeFromEvent(
    util_1.MAINNET_BRIDGE_CONFIG,
    tokenPricer,
    new util_1.TokenInit(),
    event
  );
  // input token
  const token = sdk.Tokens.getOrCreateToken(event.params.l1Token);
  // output token
  const hubPoolContract = HubPool_1.HubPool.bind(
    graph_ts_1.Address.fromString(util_1.ACROSS_HUB_POOL_CONTRACT)
  );
  const hubPoolContractCall = hubPoolContract.try_pooledTokens(
    event.params.l1Token
  );
  let outputTokenAddress;
  if (hubPoolContractCall.reverted) {
    graph_ts_1.log.info(
      "[HubPool:pooledTokens()] get LP Token call reverted",
      []
    );
    outputTokenAddress = event.params.l1Token;
  } else {
    outputTokenAddress = hubPoolContractCall.value.getLpToken();
  }
  const outputToken = sdk.Tokens.getOrCreateToken(outputTokenAddress);
  // pool
  const poolId = event.params.l1Token.concat(
    graph_ts_1.Bytes.fromUTF8("liquidity")
  );
  const pool = sdk.Pools.loadPool(poolId);
  if (!pool.isInitialized) {
    pool.initialize(
      token.name,
      token.symbol,
      enums_1.BridgePoolType.LIQUIDITY,
      token
    );
    pool.pool.outputToken = outputToken.id;
    pool.save();
  }
  // output token supply
  let outputTokenSupply;
  const erc20 = _ERC20_1._ERC20.bind(outputTokenAddress);
  const outputTokenSupplyResult = erc20.try_totalSupply();
  if (outputTokenSupplyResult.reverted) {
    graph_ts_1.log.info(
      "[_ERC20:tokenSupply()] retrieve outputTokenSupply for LP pool call reverted",
      []
    );
  } else {
    outputTokenSupply = outputTokenSupplyResult.value;
    pool.setOutputTokenSupply(outputTokenSupply);
  }
  // output token price
  if (event.params.lpTokensMinted > constants_1.BIGINT_ZERO) {
    const exchangeRate = (0, numbers_1.bigIntToBigDecimal)(
      event.params.amount
    ).div((0, numbers_1.bigIntToBigDecimal)(event.params.lpTokensMinted));
    pool.pool.outputTokenPriceUSD = tokenPricer
      .getTokenPrice(token)
      .times(exchangeRate);
    pool.save();
  }
  // account
  const amount = event.params.amount;
  const account = sdk.Accounts.loadAccount(event.params.liquidityProvider);
  account.liquidityDeposit(pool, amount);
  // tvl
  pool.setInputTokenBalance(
    (0, util_1.getTokenBalance)(event.params.l1Token, event.address)
  );
  // output token to pool mapping (required for staking handler)
  let outputTokenToPool = schema_1._OutputTokenToPool.load(outputToken.id);
  if (!outputTokenToPool) {
    outputTokenToPool = new schema_1._OutputTokenToPool(outputToken.id);
    outputTokenToPool.token = outputToken.id;
    outputTokenToPool.pool = pool.pool.id;
    outputTokenToPool.save();
  }
}
exports.handleLiquidityAdded = handleLiquidityAdded;
function handleLiquidityRemoved(event) {
  const tokenPricer = new util_1.Pricer(event.block);
  const sdk = bridge_1.SDK.initializeFromEvent(
    util_1.MAINNET_BRIDGE_CONFIG,
    tokenPricer,
    new util_1.TokenInit(),
    event
  );
  // input token
  const token = sdk.Tokens.getOrCreateToken(event.params.l1Token);
  // output token
  const hubPoolContract = HubPool_1.HubPool.bind(
    graph_ts_1.Address.fromString(util_1.ACROSS_HUB_POOL_CONTRACT)
  );
  const hubPoolContractCall = hubPoolContract.try_pooledTokens(
    event.params.l1Token
  );
  let outputTokenAddress;
  if (hubPoolContractCall.reverted) {
    graph_ts_1.log.info(
      "[HubPool:pooledTokens()] get LP Token call reverted",
      []
    );
    outputTokenAddress = event.params.l1Token;
  } else {
    outputTokenAddress = hubPoolContractCall.value.getLpToken();
  }
  const outputToken = sdk.Tokens.getOrCreateToken(outputTokenAddress);
  // pool
  const poolId = event.params.l1Token.concat(
    graph_ts_1.Bytes.fromUTF8("liquidity")
  );
  const pool = sdk.Pools.loadPool(poolId);
  if (!pool.isInitialized) {
    pool.initialize(
      token.name,
      token.symbol,
      enums_1.BridgePoolType.LIQUIDITY,
      token
    );
    pool.pool.outputToken = outputToken.id;
    pool.save();
  }
  // output token supply
  let outputTokenSupply;
  const erc20 = _ERC20_1._ERC20.bind(outputTokenAddress);
  const outputTokenSupplyResult = erc20.try_totalSupply();
  if (outputTokenSupplyResult.reverted) {
    graph_ts_1.log.info(
      "[_ERC20:tokenSupply()] retrieve outputTokenSupply for LP pool call reverted",
      []
    );
  } else {
    outputTokenSupply = outputTokenSupplyResult.value;
    pool.setOutputTokenSupply(outputTokenSupply);
  }
  // output token price
  if (event.params.lpTokensBurnt > constants_1.BIGINT_ZERO) {
    const exchangeRate = (0, numbers_1.bigIntToBigDecimal)(
      event.params.amount
    ).div((0, numbers_1.bigIntToBigDecimal)(event.params.lpTokensBurnt));
    pool.pool.outputTokenPriceUSD = tokenPricer
      .getTokenPrice(token)
      .times(exchangeRate);
    pool.save();
  }
  // account
  const amount = event.params.amount;
  const account = sdk.Accounts.loadAccount(event.params.liquidityProvider);
  account.liquidityWithdraw(pool, amount);
  // tvl
  pool.setInputTokenBalance(
    (0, util_1.getTokenBalance)(event.params.l1Token, event.address)
  );
  // output token to pool mapping
  let outputTokenToPool = schema_1._OutputTokenToPool.load(outputToken.id);
  if (!outputTokenToPool) {
    outputTokenToPool = new schema_1._OutputTokenToPool(outputToken.id);
    outputTokenToPool.token = outputToken.id;
    outputTokenToPool.pool = pool.pool.id;
    outputTokenToPool.save();
  }
}
exports.handleLiquidityRemoved = handleLiquidityRemoved;
