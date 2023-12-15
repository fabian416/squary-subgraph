"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRewardPaid =
  exports.handleWithdrawn =
  exports.handleStaked =
  exports.handleStakingRewardsCreated =
  exports.handleTransfer =
  exports.handleAccrueInterest =
  exports.handleLiquidateBorrow =
  exports.handleRepayBorrow =
  exports.handleBorrow =
  exports.handleRedeem =
  exports.handleMint =
  exports.handleNewReserveFactor =
  exports.handleActionPaused =
  exports.handleNewLiquidationIncentive =
  exports.handleNewCollateralFactor =
  exports.handleMarketListed =
  exports.handleMarketExited =
  exports.handleMarketEntered =
  exports.handleNewPriceOracle =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../../../src/constants");
const mapping_1 = require("../../../src/mapping");
// otherwise import from the specific subgraph root
const CToken_1 = require("../../../generated/Comptroller/CToken");
const Comptroller_1 = require("../../../generated/Comptroller/Comptroller");
const templates_1 = require("../../../generated/templates");
const ERC20_1 = require("../../../generated/Comptroller/ERC20");
const PriceOracle_1 = require("../../../generated/templates/CToken/PriceOracle");
const constants_2 = require("./constants");
const templates_2 = require("../../../generated/templates");
const StakingRewards_1 = require("../../../generated/templates/StakingRewards/StakingRewards");
const BeethovenXPool_1 = require("../../../generated/templates/StakingRewards/BeethovenXPool");
const BeethovenXVault_1 = require("../../../generated/templates/StakingRewards/BeethovenXVault");
// Constant values
const constant = (0, constants_2.getNetworkSpecificConstant)();
const comptrollerAddr = constant.comptrollerAddr;
const network = constant.network;
const unitPerYear = constant.unitPerYear;
function handleNewPriceOracle(event) {
  const protocol = getOrCreateProtocol();
  const newPriceOracle = event.params.newPriceOracle;
  (0, mapping_1._handleNewPriceOracle)(protocol, newPriceOracle);
}
exports.handleNewPriceOracle = handleNewPriceOracle;
function handleMarketEntered(event) {
  (0, mapping_1._handleMarketEntered)(
    comptrollerAddr,
    event.params.cToken.toHexString(),
    event.params.account.toHexString(),
    true
  );
}
exports.handleMarketEntered = handleMarketEntered;
function handleMarketExited(event) {
  (0, mapping_1._handleMarketEntered)(
    comptrollerAddr,
    event.params.cToken.toHexString(),
    event.params.account.toHexString(),
    false
  );
}
exports.handleMarketExited = handleMarketExited;
function handleMarketListed(event) {
  templates_1.CToken.create(event.params.cToken);
  const cTokenAddr = event.params.cToken;
  const cToken = schema_1.Token.load(cTokenAddr.toHexString());
  if (cToken != null) {
    return;
  }
  // handle edge case
  // iron bank (ethereum) has 2 cySUSD tokens: 0x4e3a36a633f63aee0ab57b5054ec78867cb3c0b8 (deployed earlier) and 0xa7c4054AFD3DbBbF5bFe80f41862b89ea05c9806 (in use)
  // the former totalBorrows is unreasonably huge for some reason
  // according to iron bank dashboard https://app.ib.xyz/markets/Ethereum we should use the newer one instead, which has reasonable totalBorrows number
  // since the bad version only exists for 20+ blocks, it is fine to skip it
  if (
    graph_ts_1.dataSource.network() == "mainnet" &&
    cTokenAddr ==
      graph_ts_1.Address.fromString(
        "0x4e3a36a633f63aee0ab57b5054ec78867cb3c0b8"
      )
  ) {
    return;
  }
  // this is a new cToken, a new underlying token, and a new market
  const protocol = getOrCreateProtocol();
  const cTokenContract = CToken_1.CToken.bind(event.params.cToken);
  const cTokenReserveFactorMantissa = (0, mapping_1.getOrElse)(
    cTokenContract.try_reserveFactorMantissa(),
    constants_1.BIGINT_ZERO
  );
  const underlyingTokenAddrResult = cTokenContract.try_underlying();
  if (underlyingTokenAddrResult.reverted) {
    graph_ts_1.log.warning(
      "[handleMarketListed] could not fetch underlying token of cToken: {}",
      [cTokenAddr.toHexString()]
    );
    return;
  }
  const underlyingTokenAddr = underlyingTokenAddrResult.value;
  const underlyingTokenContract = ERC20_1.ERC20.bind(underlyingTokenAddr);
  (0, mapping_1._handleMarketListed)(
    new mapping_1.MarketListedData(
      protocol,
      new mapping_1.TokenData(
        underlyingTokenAddr,
        (0, mapping_1.getOrElse)(underlyingTokenContract.try_name(), "unknown"),
        (0, mapping_1.getOrElse)(
          underlyingTokenContract.try_symbol(),
          "unknown"
        ),
        (0, mapping_1.getOrElse)(underlyingTokenContract.try_decimals(), 0)
      ),
      new mapping_1.TokenData(
        cTokenAddr,
        (0, mapping_1.getOrElse)(cTokenContract.try_name(), "unknown"),
        (0, mapping_1.getOrElse)(cTokenContract.try_symbol(), "unknown"),
        constants_1.cTokenDecimals
      ),
      cTokenReserveFactorMantissa
    ),
    event
  );
}
exports.handleMarketListed = handleMarketListed;
function handleNewCollateralFactor(event) {
  const marketID = event.params.cToken.toHexString();
  const collateralFactorMantissa = event.params.newCollateralFactorMantissa;
  (0, mapping_1._handleNewCollateralFactor)(marketID, collateralFactorMantissa);
}
exports.handleNewCollateralFactor = handleNewCollateralFactor;
function handleNewLiquidationIncentive(event) {
  const protocol = getOrCreateProtocol();
  const newLiquidationIncentive = event.params.newLiquidationIncentiveMantissa;
  (0, mapping_1._handleNewLiquidationIncentive)(
    protocol,
    newLiquidationIncentive
  );
}
exports.handleNewLiquidationIncentive = handleNewLiquidationIncentive;
function handleActionPaused(event) {
  const marketID = event.params.cToken.toHexString();
  const action = event.params.action;
  const pauseState = event.params.pauseState;
  (0, mapping_1._handleActionPaused)(marketID, action, pauseState);
}
exports.handleActionPaused = handleActionPaused;
function handleNewReserveFactor(event) {
  const marketID = event.address.toHexString();
  const newReserveFactorMantissa = event.params.newReserveFactorMantissa;
  (0, mapping_1._handleNewReserveFactor)(marketID, newReserveFactorMantissa);
}
exports.handleNewReserveFactor = handleNewReserveFactor;
function handleMint(event) {
  const minter = event.params.minter;
  const mintAmount = event.params.mintAmount;
  const contract = CToken_1.CToken.bind(event.address);
  const outputTokenSupplyResult = contract.try_totalSupply();
  const balanceOfUnderlyingResult = contract.try_balanceOfUnderlying(
    event.params.minter
  );
  (0, mapping_1._handleMint)(
    comptrollerAddr,
    minter,
    mintAmount,
    outputTokenSupplyResult,
    balanceOfUnderlyingResult,
    event
  );
}
exports.handleMint = handleMint;
function handleRedeem(event) {
  const redeemer = event.params.redeemer;
  const redeemAmount = event.params.redeemAmount;
  const contract = CToken_1.CToken.bind(event.address);
  const outputTokenSupplyResult = contract.try_totalSupply();
  const balanceOfUnderlyingResult = contract.try_balanceOfUnderlying(
    event.params.redeemer
  );
  (0, mapping_1._handleRedeem)(
    comptrollerAddr,
    redeemer,
    redeemAmount,
    outputTokenSupplyResult,
    balanceOfUnderlyingResult,
    event
  );
}
exports.handleRedeem = handleRedeem;
function handleBorrow(event) {
  const borrower = event.params.borrower;
  const borrowAmount = event.params.borrowAmount;
  const totalBorrows = event.params.totalBorrows;
  const contract = CToken_1.CToken.bind(event.address);
  const borrowBalanceStoredResult = contract.try_borrowBalanceStored(
    event.params.borrower
  );
  (0, mapping_1._handleBorrow)(
    comptrollerAddr,
    borrower,
    borrowAmount,
    borrowBalanceStoredResult,
    totalBorrows,
    event
  );
}
exports.handleBorrow = handleBorrow;
function handleRepayBorrow(event) {
  const borrower = event.params.borrower;
  const payer = event.params.payer;
  const repayAmount = event.params.repayAmount;
  const totalBorrows = event.params.totalBorrows;
  const contract = CToken_1.CToken.bind(event.address);
  const borrowBalanceStoredResult = contract.try_borrowBalanceStored(
    event.params.borrower
  );
  (0, mapping_1._handleRepayBorrow)(
    comptrollerAddr,
    borrower,
    payer,
    repayAmount,
    borrowBalanceStoredResult,
    totalBorrows,
    event
  );
}
exports.handleRepayBorrow = handleRepayBorrow;
function handleLiquidateBorrow(event) {
  const cTokenCollateral = event.params.cTokenCollateral;
  const liquidator = event.params.liquidator;
  const borrower = event.params.borrower;
  const seizeTokens = event.params.seizeTokens;
  const repayAmount = event.params.repayAmount;
  (0, mapping_1._handleLiquidateBorrow)(
    comptrollerAddr,
    cTokenCollateral,
    liquidator,
    borrower,
    seizeTokens,
    repayAmount,
    event
  );
}
exports.handleLiquidateBorrow = handleLiquidateBorrow;
function handleAccrueInterest(event) {
  const marketAddress = event.address;
  const cTokenContract = CToken_1.CToken.bind(marketAddress);
  const protocol = getOrCreateProtocol();
  const oracleContract = PriceOracle_1.PriceOracle.bind(
    graph_ts_1.Address.fromString(protocol._priceOracle)
  );
  const updateMarketData = new mapping_1.UpdateMarketData(
    cTokenContract.try_totalSupply(),
    cTokenContract.try_exchangeRateStored(),
    cTokenContract.try_supplyRatePerBlock(),
    cTokenContract.try_borrowRatePerBlock(),
    oracleContract.try_getUnderlyingPrice(marketAddress),
    unitPerYear
  );
  const interestAccumulated = event.params.interestAccumulated;
  const totalBorrows = event.params.totalBorrows;
  (0, mapping_1._handleAccrueInterest)(
    updateMarketData,
    comptrollerAddr,
    interestAccumulated,
    totalBorrows,
    false, // do not update all prices
    event
  );
}
exports.handleAccrueInterest = handleAccrueInterest;
function handleTransfer(event) {
  (0, mapping_1._handleTransfer)(
    event,
    event.address.toHexString(),
    event.params.to,
    event.params.from,
    comptrollerAddr
  );
}
exports.handleTransfer = handleTransfer;
function handleStakingRewardsCreated(event) {
  graph_ts_1.log.info(
    "[handleStakingRewardsCreated]StakingReward contract {} created for token {} at tx {}",
    [
      event.params.stakingRewards.toHexString(),
      event.params.stakingToken.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
  templates_2.StakingRewards.create(event.params.stakingRewards);
}
exports.handleStakingRewardsCreated = handleStakingRewardsCreated;
function handleStaked(event) {
  const rewardContract = StakingRewards_1.StakingRewards.bind(event.address);
  const marketID = (0, mapping_1.getOrElse)(
    rewardContract.try_getStakingToken(),
    graph_ts_1.Address.zero()
  ).toHexString();
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.error(
      "[handleStaked]market does not exist for staking token {} at tx {}",
      [marketID, event.transaction.hash.toHexString()]
    );
    return;
  }
  market._stakedOutputTokenAmount = rewardContract.totalSupply();
  market.save();
}
exports.handleStaked = handleStaked;
function handleWithdrawn(event) {
  const rewardContract = StakingRewards_1.StakingRewards.bind(event.address);
  const marketID = (0, mapping_1.getOrElse)(
    rewardContract.try_getStakingToken(),
    graph_ts_1.Address.zero()
  ).toHexString();
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.error(
      "[handleStaked]market does not exist for staking token {} at tx {}",
      [marketID, event.transaction.hash.toHexString()]
    );
    return;
  }
  market._stakedOutputTokenAmount = rewardContract.totalSupply();
  market.save();
}
exports.handleWithdrawn = handleWithdrawn;
function handleRewardPaid(event) {
  const rewardContract = StakingRewards_1.StakingRewards.bind(event.address);
  const marketID = (0, mapping_1.getOrElse)(
    rewardContract.try_getStakingToken(),
    graph_ts_1.Address.zero()
  ).toHexString();
  const market = schema_1.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.error(
      "[handleRewardPaid]market does not exist for staking token {} at tx {}",
      [marketID, event.transaction.hash.toHexString()]
    );
    return;
  }
  // to get token decimals & prices
  const tokenAddr = event.params.rewardsToken.toHexString();
  graph_ts_1.log.info("[handleRewardPaid]rewardsToken={} at tx={}", [
    tokenAddr,
    event.transaction.hash.toHexString(),
  ]);
  let token = schema_1.Token.load(tokenAddr);
  if (!token) {
    const erc20Contract = ERC20_1.ERC20.bind(event.params.rewardsToken);
    token = new schema_1.Token(tokenAddr);
    token.decimals = (0, mapping_1.getOrElse)(erc20Contract.try_decimals(), 18);
    token.symbol = (0, mapping_1.getOrElse)(
      erc20Contract.try_symbol(),
      "Unknown"
    );
    token.name = (0, mapping_1.getOrElse)(erc20Contract.try_name(), "Unknown");
    token.save();
  }
  const marketRewardTokens = market.rewardTokens;
  if (!marketRewardTokens || marketRewardTokens.length == 0) {
    const rewardTokenID = `${constants_1.RewardTokenType.DEPOSIT}-${token.id}`;
    let rewardToken = schema_1.RewardToken.load(rewardTokenID);
    if (!rewardToken) {
      rewardToken = new schema_1.RewardToken(rewardTokenID);
      rewardToken.token = token.id;
      rewardToken.type = constants_1.RewardTokenType.DEPOSIT;
      rewardToken.save();
    }
    market.rewardTokens = [rewardToken.id];
  }
  const _cumulativeRewardAmount = market._cumulativeRewardAmount;
  if (_cumulativeRewardAmount) {
    market._cumulativeRewardAmount = market._cumulativeRewardAmount.plus(
      event.params.reward
    );
  } else {
    market._cumulativeRewardAmount = event.params.reward;
  }
  market.save();
  const currTimestamp = event.block.timestamp;
  if (!market._rewardLastUpdatedTimestamp) {
    graph_ts_1.log.info(
      "[handleRewardPaid]_rewardLastUpdatedTimestamp for market {} not set, skip updating reward emission, current timestamp={}",
      [market.id, currTimestamp.toString()]
    );
    market._rewardLastUpdatedTimestamp = currTimestamp;
    market.save();
    return;
  }
  // update reward emission every day or longer
  if (
    currTimestamp.lt(
      market._rewardLastUpdatedTimestamp.plus(
        graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_DAY)
      )
    )
  ) {
    graph_ts_1.log.info(
      "[handleRewardPaid]Reward emission updated less than 1 day ago (_rewardLastUpdatedTimestamp={}, current timestamp={}), skip updating reward emission",
      [market._rewardLastUpdatedTimestamp.toString(), currTimestamp.toString()]
    );
    return;
  }
  const secondsSince = currTimestamp
    .minus(market._rewardLastUpdatedTimestamp)
    .toBigDecimal();
  const dailyScaler = graph_ts_1.BigInt.fromI32(
    constants_1.SECONDS_PER_DAY
  ).divDecimal(secondsSince);
  const rewardTokenEmissionsAmount = (0, constants_1.bigDecimalToBigInt)(
    market._cumulativeRewardAmount.toBigDecimal().times(dailyScaler)
  );
  const IBTokenPriceUSD = getIBTokenPrice(event);
  let rewardTokenEmissionsUSD = constants_1.BIGDECIMAL_ZERO;
  if (IBTokenPriceUSD) {
    token.lastPriceUSD = IBTokenPriceUSD;
    token.lastPriceBlockNumber = event.block.number;
    token.save();
    rewardTokenEmissionsUSD = rewardTokenEmissionsAmount
      .divDecimal((0, constants_1.exponentToBigDecimal)(token.decimals))
      .times(IBTokenPriceUSD);
  }
  market.rewardTokenEmissionsAmount = [rewardTokenEmissionsAmount];
  market.rewardTokenEmissionsUSD = [rewardTokenEmissionsUSD];
  //reset _cumulativeRewardAmount and _rewardTimestamp for next update
  market._rewardLastUpdatedTimestamp = currTimestamp;
  market._cumulativeRewardAmount = constants_1.BIGINT_ZERO;
  market.save();
}
exports.handleRewardPaid = handleRewardPaid;
function getOrCreateProtocol() {
  const comptroller = Comptroller_1.Comptroller.bind(comptrollerAddr);
  const protocolData = new mapping_1.ProtocolData(
    comptrollerAddr,
    "Iron Bank",
    "iron-bank",
    network,
    comptroller.try_liquidationIncentiveMantissa(),
    comptroller.try_oracle()
  );
  return (0, mapping_1._getOrCreateProtocol)(protocolData);
}
function getIBTokenPrice(event) {
  if (event.block.number.lt(constants_2.BEETHOVEN_POOL_DEPLOYED_BLOCK)) {
    return null;
  }
  const IBPriceInrETH = getToken0PriceInToken1(
    constants_2.rETH_IB_POOL_ADDRESS,
    constants_2.IB_TOKEN_ADDRESS,
    constants_2.rETH_ADDRESS
  );
  const rETHPriceInUSD = getToken0PriceInToken1(
    constants_2.rETH_OP_USD_POOL_ADDRESS,
    constants_2.rETH_ADDRESS,
    constants_2.BB_aUSD_ADDRESS
  );
  if (!IBPriceInrETH || !rETHPriceInUSD) {
    return null;
  }
  const IBPriceInUSD = IBPriceInrETH.times(rETHPriceInUSD);
  graph_ts_1.log.info("[getIBTokenPrice]IB Price USD={} at timestamp {}", [
    IBPriceInUSD.toString(),
    event.block.timestamp.toString(),
  ]);
  return IBPriceInUSD;
}
function getToken0PriceInToken1(poolAddress, token0, token1) {
  const poolContract = BeethovenXPool_1.BeethovenXPool.bind(
    graph_ts_1.Address.fromString(poolAddress)
  );
  const vaultAddressResult = poolContract.try_getVault();
  if (vaultAddressResult.reverted) {
    return null;
  }
  const vaultContract = BeethovenXVault_1.BeethovenXVault.bind(
    vaultAddressResult.value
  );
  const weightsResult = poolContract.try_getNormalizedWeights();
  if (weightsResult.reverted) {
    return null;
  }
  const poolIDResult = poolContract.try_getPoolId();
  if (poolIDResult.reverted) {
    return null;
  }
  const poolTokensResult = vaultContract.try_getPoolTokens(poolIDResult.value);
  if (poolTokensResult.reverted) {
    return null;
  }
  const poolTokenAddrs = poolTokensResult.value.getTokens();
  const poolTokenBalances = poolTokensResult.value.getBalances();
  const token0Idx = poolTokenAddrs.indexOf(
    graph_ts_1.Address.fromString(token0)
  );
  const token1Idx = poolTokenAddrs.indexOf(
    graph_ts_1.Address.fromString(token1)
  );
  const token0PriceInToken1 = poolTokenBalances[token1Idx]
    .times(weightsResult.value[token0Idx])
    .divDecimal(
      poolTokenBalances[token0Idx]
        .times(weightsResult.value[token1Idx])
        .toBigDecimal()
    );
  return token0PriceInToken1;
}
