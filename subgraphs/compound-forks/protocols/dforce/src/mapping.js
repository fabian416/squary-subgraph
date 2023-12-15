"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDistributionSupplySpeedUpdated =
  exports.handleDistributionBorrowSpeedUpdated =
  exports.handleNewRewardDistributor =
  exports.getOrCreateMarketStatus =
  exports.handleTransfer =
  exports.handleStablecoinTransfer =
  exports.handleUpdateInterest =
  exports.handleLiquidateBorrow =
  exports.handleRepayBorrow =
  exports.handleBorrow =
  exports.handleRedeem =
  exports.handleMint =
  exports.handleNewReserveFactor =
  exports.handleBorrowPaused =
  exports.handleTransferPaused =
  exports.handleRedeemPaused =
  exports.handleMintPaused =
  exports.handleNewLiquidationIncentive =
  exports.handleNewCollateralFactor =
  exports.handleMarketAdded =
  exports.handleMarketExited =
  exports.handleMarketEntered =
  exports.handleNewPriceOracle =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
// import from the generated at root in order to reuse methods from root
const mapping_1 = require("../../../src/mapping");
const constants_1 = require("../../../src/constants");
const schema_1 = require("../../../generated/schema");
const ERC20_1 = require("../../../generated/Comptroller/ERC20");
// otherwise import from the specific subgraph root
const CToken_1 = require("../../../generated/Comptroller/CToken");
const PriceOracle_1 = require("../../../generated/Comptroller/PriceOracle");
const templates_1 = require("../../../generated/templates");
const constants_2 = require("./constants");
const RewardDistributor_1 = require("../../../generated/templates/RewardDistributor/RewardDistributor");
const stablecoin_1 = require("../../../generated/USX/stablecoin");
const Comptroller_1 = require("../../../generated/Comptroller/Comptroller");
// Constant values
const constant = (0, constants_2.getNetworkSpecificConstant)();
const comptrollerAddr = constant.comptrollerAddr;
const network = constant.network;
const blocksPerDay = new graph_ts_1.BigDecimal(
  graph_ts_1.BigInt.fromI32(constant.blocksPerDay)
);
const blocksPerYear = constant.blocksPerYear;
const rewardTokenAddr = constant.rewardTokenAddress;
function handleNewPriceOracle(event) {
  const protocol = getOrCreateProtocol();
  const newPriceOracle = event.params.newPriceOracle;
  (0, mapping_1._handleNewPriceOracle)(protocol, newPriceOracle);
}
exports.handleNewPriceOracle = handleNewPriceOracle;
function handleMarketEntered(event) {
  (0, mapping_1._handleMarketEntered)(
    comptrollerAddr,
    event.params.iToken.toHexString(),
    event.params.account.toHexString(),
    true
  );
}
exports.handleMarketEntered = handleMarketEntered;
function handleMarketExited(event) {
  (0, mapping_1._handleMarketEntered)(
    comptrollerAddr,
    event.params.iToken.toHexString(),
    event.params.account.toHexString(),
    false
  );
}
exports.handleMarketExited = handleMarketExited;
function handleMarketAdded(event) {
  templates_1.CToken.create(event.params.iToken);
  const cTokenAddr = event.params.iToken;
  const cToken = schema_1.Token.load(cTokenAddr.toHexString());
  if (cToken != null) {
    return;
  }
  // this is a new cToken, a new underlying token, and a new market
  const protocol = getOrCreateProtocol();
  const cTokenContract = CToken_1.CToken.bind(event.params.iToken);
  const cTokenReserveFactorMantissa = (0, mapping_1.getOrElse)(
    cTokenContract.try_reserveRatio(),
    constants_1.BIGINT_ZERO
  );
  // set defaults
  let underlyingTokenAddr = graph_ts_1.Address.fromString(
    constants_2.ZERO_ADDRESS
  );
  let underlyingName = "unknown";
  let underlyingSymbol = "unknown";
  let underlyingDecimals = 18;
  const underlyingTokenAddrResult = cTokenContract.try_underlying();
  if (!underlyingTokenAddrResult.reverted) {
    underlyingTokenAddr = underlyingTokenAddrResult.value;
    if (underlyingTokenAddr.toHexString() == constants_2.MKR_ADDRESS) {
      underlyingName = "Maker";
      underlyingSymbol = "MKR";
      underlyingDecimals = 18;
    } else if (underlyingTokenAddr.toHexString() == constants_2.DF_ADDRESS) {
      underlyingName = "dForce";
      underlyingSymbol = "DF";
      underlyingDecimals = 18;
    } else if (underlyingTokenAddr.toHexString() == constants_2.ZERO_ADDRESS) {
      // this is eth on ethereum
      if (constant.network == constants_1.Network.MAINNET) {
        underlyingName = "Ether";
        underlyingSymbol = "ETH";
        underlyingDecimals = 18;
      } else if (constant.network == constants_1.Network.BSC) {
        underlyingName = "BNB";
        underlyingSymbol = "BNB";
        underlyingDecimals = 18;
      }
    } else {
      const underlyingTokenContract = ERC20_1.ERC20.bind(underlyingTokenAddr);
      underlyingName = (0, mapping_1.getOrElse)(
        underlyingTokenContract.try_name(),
        "unknown"
      );
      underlyingSymbol = (0, mapping_1.getOrElse)(
        underlyingTokenContract.try_symbol(),
        "unknown"
      );
      underlyingDecimals = (0, mapping_1.getOrElse)(
        underlyingTokenContract.try_decimals(),
        18
      );
    }
  } else {
    graph_ts_1.log.error(
      "[handleMarketAdded] could not fetch underlying token of cToken: {}",
      [cTokenAddr.toHexString()]
    );
    return;
  }
  (0, mapping_1._handleMarketListed)(
    new mapping_1.MarketListedData(
      protocol,
      new mapping_1.TokenData(
        underlyingTokenAddr,
        underlyingName,
        underlyingSymbol,
        underlyingDecimals
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
  initRewards(cTokenAddr);
}
exports.handleMarketAdded = handleMarketAdded;
function handleNewCollateralFactor(event) {
  const marketID = event.params.iToken.toHexString();
  const collateralFactorMantissa = event.params.newCollateralFactorMantissa;
  (0, mapping_1._handleNewCollateralFactor)(marketID, collateralFactorMantissa);
}
exports.handleNewCollateralFactor = handleNewCollateralFactor;
function handleNewLiquidationIncentive(event) {
  const protocol = getOrCreateProtocol();
  const newLiquidationIncentiveMantissa =
    event.params.newLiquidationIncentiveMantissa;
  (0, mapping_1._handleNewLiquidationIncentive)(
    protocol,
    newLiquidationIncentiveMantissa
  );
}
exports.handleNewLiquidationIncentive = handleNewLiquidationIncentive;
// toggle market.isActive based on pause status of mint/redeem/transfer
function handleMintPaused(event) {
  const marketID = event.params.iToken.toHexString();
  const market = schema_1.Market.load(marketID);
  if (market == null) {
    graph_ts_1.log.warning("[handleMintPaused] Market not found: {}", [
      marketID,
    ]);
    return;
  }
  const _marketStatus = getOrCreateMarketStatus(marketID);
  _marketStatus.mintPaused = event.params.paused;
  // isActive = false if any one of mint/redeem/transfer is paused
  market.isActive = !(0, constants_2.anyTrue)([
    _marketStatus.mintPaused,
    _marketStatus.redeemPaused,
    _marketStatus.transferPaused,
  ]);
  market.save();
  _marketStatus.save();
}
exports.handleMintPaused = handleMintPaused;
// toggle market.isActive based on pause status of mint/redeem/transfer
function handleRedeemPaused(event) {
  const marketID = event.params.iToken.toHexString();
  const market = schema_1.Market.load(marketID);
  if (market == null) {
    graph_ts_1.log.warning("[handleRedeemPaused] Market not found: {}", [
      marketID,
    ]);
    return;
  }
  const _marketStatus = getOrCreateMarketStatus(marketID);
  _marketStatus.redeemPaused = event.params.paused;
  // isActive = false if any one of mint/redeem/transfer is paused
  market.isActive = !(0, constants_2.anyTrue)([
    _marketStatus.mintPaused,
    _marketStatus.redeemPaused,
    _marketStatus.transferPaused,
  ]);
  market.save();
  _marketStatus.save();
}
exports.handleRedeemPaused = handleRedeemPaused;
// toggle market.isActive based on pause status of mint/redeem/transfer
// transfer pause stops transfer of all iTokens
function handleTransferPaused(event) {
  const protocol = getOrCreateProtocol();
  const markets = protocol._marketIDs;
  for (let i = 0; i < markets.length; i++) {
    const marketID = markets[i];
    const market = schema_1.Market.load(marketID);
    if (market == null) {
      graph_ts_1.log.warning("[handleTransferPaused] Market not found: {}", [
        marketID,
      ]);
      return;
    }
    const _marketStatus = getOrCreateMarketStatus(marketID);
    _marketStatus.transferPaused = event.params.paused;
    // isActive = false if any one of mint/redeem/transfer is paused
    market.isActive = !(0, constants_2.anyTrue)([
      _marketStatus.mintPaused,
      _marketStatus.redeemPaused,
      _marketStatus.transferPaused,
    ]);
    market.save();
    _marketStatus.save();
  }
}
exports.handleTransferPaused = handleTransferPaused;
function handleBorrowPaused(event) {
  // toggle market.canBorrowFrom based on BorrowPaused event
  const marketId = event.params.iToken.toHexString();
  const market = schema_1.Market.load(marketId);
  if (market != null) {
    market.canBorrowFrom = !event.params.paused;
    market.save();
  } else {
    graph_ts_1.log.warning("[handleBorrowPaused] Market {} does not exist.", [
      marketId,
    ]);
  }
}
exports.handleBorrowPaused = handleBorrowPaused;
function handleNewReserveFactor(event) {
  const marketID = event.address.toHexString();
  const reserveFactorMantissa = event.params.newReserveRatio;
  (0, mapping_1._handleNewReserveFactor)(marketID, reserveFactorMantissa);
}
exports.handleNewReserveFactor = handleNewReserveFactor;
function handleMint(event) {
  const minter = event.params.sender;
  const mintAmount = event.params.mintAmount;
  const contract = CToken_1.CToken.bind(event.address);
  const outputTokenSupplyResult = contract.try_totalSupply();
  const balanceOfUnderlyingResult = contract.try_balanceOfUnderlying(
    event.params.sender
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
  const redeemer = event.params.recipient;
  const redeemAmount = event.params.redeemUnderlyingAmount;
  const contract = CToken_1.CToken.bind(event.address);
  const outputTokenSupplyResult = contract.try_totalSupply();
  const balanceOfUnderlyingResult = contract.try_balanceOfUnderlying(
    event.params.recipient
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
  const cTokenCollateral = event.params.iTokenCollateral;
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
function handleUpdateInterest(event) {
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
    blocksPerYear
  );
  (0, mapping_1._handleAccrueInterest)(
    updateMarketData,
    comptrollerAddr,
    event.params.interestAccumulated,
    event.params.totalBorrows,
    network.toLowerCase() == constants_1.Network.MAINNET.toLowerCase(),
    event
  );
  updateRewardPrices(marketAddress);
}
exports.handleUpdateInterest = handleUpdateInterest;
// update USX/EUX supply for
//    - protocol.mintedTokens
//    - protocl.mintedTokensSupplies
//    - FinancialsDailySnapshot.mintedTokensSupplies
function handleStablecoinTransfer(event) {
  if (
    event.params.from.toHexString() != constants_2.ZERO_ADDRESS &&
    event.params.to.toHexString() != constants_2.ZERO_ADDRESS
  ) {
    // supply won't change for non-minting/burning transfers
    graph_ts_1.log.info(
      "[handleStablecoinTransfer] Not a minting or burning event, skipping",
      []
    );
    return;
  }
  const tokenId = event.address.toHexString();
  const protocol = getOrCreateProtocol();
  const contract = stablecoin_1.stablecoin.bind(event.address);
  const supply = contract.totalSupply();
  let token = schema_1.Token.load(tokenId);
  if (token == null) {
    token = new schema_1.Token(tokenId);
    token.name = contract.name();
    token.symbol = contract.symbol();
    token.decimals = contract.decimals();
    token.save();
  }
  // since mintedTokens will be sorted by address, we need to make sure
  // mintedTokenSupplies is sorted in the same order
  let mintedTokens = protocol.mintedTokens;
  let mintedTokenSupplies = protocol.mintedTokenSupplies;
  if (mintedTokens == null || mintedTokens.length == 0) {
    protocol.mintedTokens = [tokenId];
    protocol.mintedTokenSupplies = [supply];
  } else {
    const tokenIndex = mintedTokens.indexOf(tokenId);
    if (tokenIndex >= 0) {
      // token already in protocol.mintedTokens
      mintedTokenSupplies[tokenIndex] = supply;
      protocol.mintedTokenSupplies = mintedTokenSupplies;
    } else {
      if (tokenId < mintedTokens[0]) {
        // insert as the first token into mintedTokens
        protocol.mintedTokens = [tokenId].concat(mintedTokens);
        protocol.mintedTokenSupplies = [supply].concat(mintedTokenSupplies);
      } else {
        // insert as the last token into mintedTokens
        mintedTokens = mintedTokens.concat([tokenId]);
        mintedTokenSupplies = mintedTokenSupplies.concat([supply]);
        protocol.mintedTokens = mintedTokens;
        protocol.mintedTokenSupplies = mintedTokenSupplies;
      }
    }
  }
  protocol.save();
  const blockTimeStamp = event.block.timestamp;
  const snapshotID = (
    blockTimeStamp.toI32() / constants_1.SECONDS_PER_DAY
  ).toString();
  let snapshot = schema_1.FinancialsDailySnapshot.load(snapshotID);
  if (snapshot == null) {
    (0, mapping_1.snapshotFinancials)(
      comptrollerAddr,
      event.block.number,
      blockTimeStamp
    );
    snapshot = schema_1.FinancialsDailySnapshot.load(snapshotID);
  }
  // There is no financialDailySnapshot.mintedTokens in the schema
  // financialDailySnapshot.mintedTokens = mintedTokens;
  snapshot.mintedTokenSupplies = protocol.mintedTokenSupplies;
  snapshot.save();
}
exports.handleStablecoinTransfer = handleStablecoinTransfer;
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
function getOrCreateProtocol() {
  const comptroller = Comptroller_1.Comptroller.bind(comptrollerAddr);
  const protocolData = new mapping_1.ProtocolData(
    comptrollerAddr,
    "dForce v2",
    "dforce-v2",
    network,
    comptroller.try_liquidationIncentiveMantissa(),
    comptroller.try_priceOracle()
  );
  return (0, mapping_1._getOrCreateProtocol)(protocolData);
}
// helper entity to determine market status
function getOrCreateMarketStatus(marketId) {
  let marketStatus = schema_1._DforceMarketStatus.load(marketId);
  if (marketStatus == null) {
    marketStatus = new schema_1._DforceMarketStatus(marketId);
    marketStatus.mintPaused = false;
    marketStatus.redeemPaused = false;
    marketStatus.transferPaused = false;
    marketStatus.save();
  }
  return marketStatus;
}
exports.getOrCreateMarketStatus = getOrCreateMarketStatus;
////////////////////////////
///// Reward Functions /////
////////////////////////////
function handleNewRewardDistributor(event) {
  // trigger RewardDistributor template
  templates_1.RewardDistributor.create(event.params.newRewardDistributor);
}
exports.handleNewRewardDistributor = handleNewRewardDistributor;
function handleDistributionBorrowSpeedUpdated(event) {
  const market = schema_1.Market.load(event.params.iToken.toHexString());
  if (!market) {
    graph_ts_1.log.error("Market not found for address {}", [
      event.params.iToken.toHexString(),
    ]);
    return;
  }
  const emissionsAmount = market.rewardTokenEmissionsAmount;
  emissionsAmount[0] = (0, constants_2.BigDecimalTruncateToBigInt)(
    event.params.borrowSpeed.toBigDecimal().times(blocksPerDay)
  );
  market.rewardTokenEmissionsAmount = emissionsAmount;
  market.save();
  updateRewardPrices(event.params.iToken);
}
exports.handleDistributionBorrowSpeedUpdated =
  handleDistributionBorrowSpeedUpdated;
function handleDistributionSupplySpeedUpdated(event) {
  const market = schema_1.Market.load(event.params.iToken.toHexString());
  if (!market) {
    graph_ts_1.log.error("Market not found for address {}", [
      event.params.iToken.toHexString(),
    ]);
    return;
  }
  const emissionsAmount = market.rewardTokenEmissionsAmount;
  emissionsAmount[1] = (0, constants_2.BigDecimalTruncateToBigInt)(
    event.params.supplySpeed.toBigDecimal().times(blocksPerDay)
  );
  market.rewardTokenEmissionsAmount = emissionsAmount;
  market.save();
  updateRewardPrices(event.params.iToken);
}
exports.handleDistributionSupplySpeedUpdated =
  handleDistributionSupplySpeedUpdated;
function initRewards(marketAddr) {
  const market = schema_1.Market.load(marketAddr.toHexString());
  if (!market) {
    graph_ts_1.log.error("Market not found for address {}", [
      marketAddr.toHexString(),
    ]);
    return;
  }
  market.rewardTokens = getOrCreateRewardTokens();
  market.rewardTokenEmissionsAmount = [
    constants_1.BIGINT_ZERO,
    constants_1.BIGINT_ZERO,
  ];
  market.rewardTokenEmissionsUSD = [
    constants_1.BIGDECIMAL_ZERO,
    constants_1.BIGDECIMAL_ZERO,
  ];
  market.save();
}
// initially create reward tokens
// reward is always DForce token
function getOrCreateRewardTokens() {
  let token = schema_1.Token.load(rewardTokenAddr.toHexString());
  if (!token) {
    token = new schema_1.Token(rewardTokenAddr.toHexString());
    token.name = "dForce";
    token.symbol = "DF";
    token.decimals = 18;
    token.save();
  }
  const borrowRewardTokenId = constants_1.RewardTokenType.BORROW.concat(
    "-"
  ).concat(token.id);
  let borrowRewardToken = schema_1.RewardToken.load(borrowRewardTokenId);
  if (borrowRewardToken == null) {
    borrowRewardToken = new schema_1.RewardToken(borrowRewardTokenId);
    borrowRewardToken.token = token.id;
    borrowRewardToken.type = constants_1.RewardTokenType.BORROW;
    borrowRewardToken.save();
  }
  const depositRewardTokenId = constants_1.RewardTokenType.DEPOSIT.concat(
    "-"
  ).concat(token.id);
  let depositRewardToken = schema_1.RewardToken.load(depositRewardTokenId);
  if (depositRewardToken == null) {
    depositRewardToken = new schema_1.RewardToken(depositRewardTokenId);
    depositRewardToken.token = token.id;
    depositRewardToken.type = constants_1.RewardTokenType.DEPOSIT;
    depositRewardToken.save();
  }
  return [borrowRewardTokenId, depositRewardTokenId];
}
function updateRewardPrices(marketAddress) {
  const market = schema_1.Market.load(marketAddress.toHexString());
  if (!market) {
    graph_ts_1.log.error("Market not found for address {}", [
      marketAddress.toHexString(),
    ]);
    return;
  }
  const rewardToken = schema_1.RewardToken.load(market.rewardTokens[0]);
  if (!rewardToken) {
    graph_ts_1.log.error("Reward token not found for market", [market.id]);
    return;
  }
  const comptroller = Comptroller_1.Comptroller.bind(comptrollerAddr);
  const tryRewardDistributor = comptroller.try_rewardDistributor();
  if (tryRewardDistributor.reverted) {
    graph_ts_1.log.info("Reward distributor not found", []);
    return;
  }
  const distributorContract = RewardDistributor_1.RewardDistributor.bind(
    tryRewardDistributor.value
  );
  const tryDistributionFactor =
    distributorContract.try_distributionFactorMantissa(marketAddress);
  const distributionFactor = tryDistributionFactor.reverted
    ? constants_1.BIGDECIMAL_ZERO
    : tryDistributionFactor.value
        .toBigDecimal()
        .div(
          (0, constants_1.exponentToBigDecimal)(constants_2.DEFAULT_DECIMALS)
        );
  const token = schema_1.Token.load(rewardToken.token);
  if (!token) {
    graph_ts_1.log.error("Token not found for reward token {}", [
      rewardToken.id,
    ]);
    return;
  }
  let priceUSD = token.lastPriceUSD;
  if (!priceUSD) {
    const protocol = getOrCreateProtocol();
    const oracleContract = PriceOracle_1.PriceOracle.bind(
      graph_ts_1.Address.fromString(protocol._priceOracle)
    );
    const priceRaw = (0, mapping_1.getOrElse)(
      oracleContract.try_getAssetPrice(
        graph_ts_1.Address.fromString(rewardToken.token)
      ),
      constants_1.BIGINT_ZERO
    );
    priceUSD = priceRaw
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(constants_2.DEFAULT_DECIMALS));
  }
  market.rewardTokenEmissionsUSD = [
    market.rewardTokenEmissionsAmount[0]
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(constants_2.DEFAULT_DECIMALS))
      .times(distributionFactor)
      .times(priceUSD),
    market.rewardTokenEmissionsAmount[1]
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(constants_2.DEFAULT_DECIMALS))
      .times(distributionFactor)
      .times(priceUSD),
  ];
  market.save();
}
