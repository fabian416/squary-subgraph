"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer =
  exports.handleNewReserveFactor =
  exports.handleNewAdminFee =
  exports.handleNewFuseFee =
  exports.handleAccrueInterest =
  exports.handleLiquidateBorrow =
  exports.handleRepayBorrow =
  exports.handleBorrow =
  exports.handleRedeem =
  exports.handleMint =
  exports.handleActionPaused =
  exports.handleNewPriceOracle =
  exports.handleNewLiquidationIncentive =
  exports.handleNewCollateralFactor =
  exports.handleMarketListed =
  exports.handleMarketExited =
  exports.handleMarketEntered =
  exports.handlePoolRegistered =
  exports.RariFee =
    void 0;
// fuse handlers
const graph_ts_1 = require("@graphprotocol/graph-ts");
const mapping_1 = require("../../../src/mapping");
const constants_1 = require("./constants");
const Comptroller_1 = require("../../../generated/templates/Comptroller/Comptroller");
const CToken_1 = require("../../../generated/templates/CToken/CToken");
const templates_1 = require("../../../generated/templates");
const schema_1 = require("../../../generated/schema");
const ERC20_1 = require("../../../generated/templates/Comptroller/ERC20");
const constants_2 = require("../../../src/constants");
const schema_2 = require("../../../generated/schema");
const PriceOracle_1 = require("../../../generated/templates/CToken/PriceOracle");
const prices_1 = require("./prices");
const rewards_1 = require("./rewards");
const FuseComptroller_1 = require("../../../generated/templates/CToken/FuseComptroller");
const RewardsDistributorDelegator_1 = require("../../../generated/templates/CToken/RewardsDistributorDelegator");
//////////////////////////////////
//// Chain-specific Constants ////
//////////////////////////////////
const constants = (0, constants_1.getNetworkSpecificConstant)();
const FACTORY_CONTRACT = constants.fusePoolDirectoryAddress;
const PROTOCOL_NETWORK = constants.network;
//////////////////////
//// Fuse Enum(s) ////
//////////////////////
var RariFee;
(function (RariFee) {
  RariFee.FUSE_FEE = "FUSE_FEE";
  RariFee.ADMIN_FEE = "ADMIN_FEE";
})((RariFee = exports.RariFee || (exports.RariFee = {})));
/////////////////////////////////
//// Pool Directory Handlers ////
/////////////////////////////////
// creates a new LendingProtocol for a new fuse "pool"
function handlePoolRegistered(event) {
  // create Comptroller template
  templates_1.Comptroller.create(event.params.pool.comptroller);
  const troller = Comptroller_1.Comptroller.bind(event.params.pool.comptroller);
  // populate pool data
  const poolData = new mapping_1.ProtocolData(
    graph_ts_1.Address.fromString(FACTORY_CONTRACT),
    constants_1.PROTOCOL_NAME,
    constants_1.PROTOCOL_SLUG,
    PROTOCOL_NETWORK,
    troller.try_liquidationIncentiveMantissa(),
    troller.try_oracle()
  );
  // only needed to create the new pool (ie, pool's Comptroller implementation)
  (0, mapping_1._getOrCreateProtocol)(poolData);
  // create helper fuse pool entity
  const pool = new schema_2._FusePool(
    event.params.pool.comptroller.toHexString()
  );
  pool.name = event.params.pool.name;
  pool.poolNumber = event.params.index.toString();
  pool.marketIDs = [];
  // set price oracle for pool entity
  const tryOracle = troller.try_oracle();
  if (tryOracle.reverted) {
    pool.priceOracle = "";
  } else {
    pool.priceOracle = tryOracle.value.toHexString();
  }
  // set liquidation incentive for pool entity
  const tryLiquidationIncentive = troller.try_liquidationIncentiveMantissa();
  if (tryLiquidationIncentive.reverted) {
    graph_ts_1.log.warning(
      "[getOrCreateProtocol] liquidationIncentiveMantissaResult reverted",
      []
    );
  } else {
    pool.liquidationIncentive = tryLiquidationIncentive.value
      .toBigDecimal()
      .div(constants_2.mantissaFactorBD)
      .times(constants_2.BIGDECIMAL_HUNDRED);
  }
  pool.save();
}
exports.handlePoolRegistered = handlePoolRegistered;
//////////////////////////////
//// Comptroller Handlers ////
//////////////////////////////
// Note: these are pool level functions in fuse, but each pool is a Comptroller impl
// Source: https://docs.rari.capital/fuse
function handleMarketEntered(event) {
  (0, mapping_1._handleMarketEntered)(
    graph_ts_1.Address.fromString(FACTORY_CONTRACT),
    event.params.cToken.toHexString(),
    event.params.account.toHexString(),
    true
  );
}
exports.handleMarketEntered = handleMarketEntered;
function handleMarketExited(event) {
  (0, mapping_1._handleMarketEntered)(
    graph_ts_1.Address.fromString(FACTORY_CONTRACT),
    event.params.cToken.toHexString(),
    event.params.account.toHexString(),
    false
  );
}
exports.handleMarketExited = handleMarketExited;
// add a new market
function handleMarketListed(event) {
  // skip the blocklisted markets
  if (
    constants_1.BLOCKLIST_MARKETS.includes(
      event.params.cToken.toHexString().toLowerCase()
    )
  ) {
    return;
  }
  const protocol = schema_1.LendingProtocol.load(FACTORY_CONTRACT);
  if (!protocol) {
    // best effort
    graph_ts_1.log.warning("[handleMarketListed] Protocol not found: {}", [
      FACTORY_CONTRACT,
    ]);
    return;
  }
  // get/create ctoken
  templates_1.CToken.create(event.params.cToken);
  const cTokenContract = CToken_1.CToken.bind(event.params.cToken);
  const cToken = new mapping_1.TokenData(
    event.params.cToken,
    (0, mapping_1.getOrElse)(cTokenContract.try_name(), "UNKNOWN"),
    (0, mapping_1.getOrElse)(cTokenContract.try_symbol(), "UNKNOWN"),
    (0, mapping_1.getOrElse)(cTokenContract.try_decimals(), -1)
  );
  // get/create underlying token
  const underlyingAddress = (0, mapping_1.getOrElse)(
    cTokenContract.try_underlying(),
    graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)
  );
  let underlyingToken;
  if (
    underlyingAddress == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)
  ) {
    // this is ETH
    underlyingToken = new mapping_1.TokenData(
      graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS),
      constants_1.ETH_NAME,
      constants_1.ETH_SYMBOL,
      constants_2.mantissaFactor
    );
  } else {
    const underlyingContract = ERC20_1.ERC20.bind(underlyingAddress);
    underlyingToken = new mapping_1.TokenData(
      underlyingAddress,
      (0, mapping_1.getOrElse)(underlyingContract.try_name(), "UNKNOWN"),
      (0, mapping_1.getOrElse)(underlyingContract.try_symbol(), "UNKOWN"),
      (0, mapping_1.getOrElse)(underlyingContract.try_decimals(), -1)
    );
  }
  // populate market data
  const marketData = new mapping_1.MarketListedData(
    protocol,
    underlyingToken,
    cToken,
    (0, mapping_1.getOrElse)(
      cTokenContract.try_reserveFactorMantissa(),
      constants_2.BIGINT_ZERO
    )
  );
  (0, mapping_1._handleMarketListed)(marketData, event);
  // fuse-specific: add fuseFees and adminFees
  // get fuse fee - rari collects this (ie, protocol revenue)
  const tryFuseFeeMantissa = cTokenContract.try_fuseFeeMantissa();
  updateOrCreateRariFee(
    tryFuseFeeMantissa.reverted
      ? constants_2.BIGINT_ZERO
      : tryFuseFeeMantissa.value,
    RariFee.FUSE_FEE,
    event.params.cToken.toHexString()
  );
  // get admin fee - pool owners (admin) collect this (ie, protocol revenue)
  const tryAdminFeeMantissa = cTokenContract.try_adminFeeMantissa();
  updateOrCreateRariFee(
    tryAdminFeeMantissa.reverted
      ? constants_2.BIGINT_ZERO
      : tryAdminFeeMantissa.value,
    RariFee.ADMIN_FEE,
    event.params.cToken.toHexString()
  );
  // add market ID to the fuse pool
  const pool = schema_2._FusePool.load(event.address.toHexString());
  if (!pool) {
    // best effort
    graph_ts_1.log.warning("[handleMarketListed] FusePool not found: {}", [
      event.address.toHexString(),
    ]);
    return;
  }
  const markets = pool.marketIDs;
  markets.push(event.params.cToken.toHexString());
  pool.marketIDs = markets;
  pool.save();
  // set liquidation incentive (fuse-specific)
  const market = schema_2.Market.load(event.params.cToken.toHexString());
  market.liquidationPenalty = pool.liquidationIncentive;
  market.save();
}
exports.handleMarketListed = handleMarketListed;
// update a given markets collateral factor
function handleNewCollateralFactor(event) {
  const marketID = event.params.cToken.toHexString();
  const newCollateralFactorMantissa = event.params.newCollateralFactorMantissa;
  (0, mapping_1._handleNewCollateralFactor)(
    marketID,
    newCollateralFactorMantissa
  );
}
exports.handleNewCollateralFactor = handleNewCollateralFactor;
function handleNewLiquidationIncentive(event) {
  const liquidationIncentive = event.params.newLiquidationIncentiveMantissa
    .toBigDecimal()
    .div(constants_2.mantissaFactorBD)
    .minus(constants_2.BIGDECIMAL_ONE)
    .times(constants_2.BIGDECIMAL_HUNDRED);
  const pool = schema_2._FusePool.load(event.address.toHexString());
  if (!pool) {
    // best effort
    graph_ts_1.log.warning(
      "[handleNewLiquidationIncentive] FusePool not found: {}",
      [event.address.toHexString()]
    );
    return;
  }
  pool.liquidationIncentive = liquidationIncentive;
  pool.save();
  for (let i = 0; i < pool.marketIDs.length; i++) {
    const market = schema_2.Market.load(pool.marketIDs[i]);
    if (!market) {
      graph_ts_1.log.warning(
        "[handleNewLiquidationIncentive] Market not found: {}",
        [pool.marketIDs[i]]
      );
      // best effort
      continue;
    }
    market.liquidationPenalty = liquidationIncentive;
    market.save();
  }
}
exports.handleNewLiquidationIncentive = handleNewLiquidationIncentive;
function handleNewPriceOracle(event) {
  const pool = schema_2._FusePool.load(event.address.toHexString());
  if (!pool) {
    // best effort
    graph_ts_1.log.warning("[handleNewPriceOracle] FusePool not found: {}", [
      event.address.toHexString(),
    ]);
    return;
  }
  pool.priceOracle = event.params.newPriceOracle.toHexString();
  pool.save();
}
exports.handleNewPriceOracle = handleNewPriceOracle;
function handleActionPaused(event) {
  const marketID = event.params.cToken.toHexString();
  const action = event.params.action;
  const pauseState = event.params.pauseState;
  (0, mapping_1._handleActionPaused)(marketID, action, pauseState);
}
exports.handleActionPaused = handleActionPaused;
/////////////////////////
//// CToken Handlers ////
/////////////////////////
function handleMint(event) {
  const minter = event.params.minter;
  const mintAmount = event.params.mintAmount;
  const factoryContract = graph_ts_1.Address.fromString(FACTORY_CONTRACT);
  const contract = CToken_1.CToken.bind(event.address);
  const outputTokenSupplyResult = contract.try_totalSupply();
  const balanceOfUnderlyingResult = contract.try_balanceOfUnderlying(
    event.params.minter
  );
  (0, mapping_1._handleMint)(
    factoryContract,
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
  const factoryContract = graph_ts_1.Address.fromString(FACTORY_CONTRACT);
  const contract = CToken_1.CToken.bind(event.address);
  const outputTokenSupplyResult = contract.try_totalSupply();
  const balanceOfUnderlyingResult = contract.try_balanceOfUnderlying(
    event.params.redeemer
  );
  (0, mapping_1._handleRedeem)(
    factoryContract,
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
  const factoryContract = graph_ts_1.Address.fromString(FACTORY_CONTRACT);
  const contract = CToken_1.CToken.bind(event.address);
  const borrowBalanceStoredResult = contract.try_borrowBalanceStored(
    event.params.borrower
  );
  (0, mapping_1._handleBorrow)(
    factoryContract,
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
  const factoryContract = graph_ts_1.Address.fromString(FACTORY_CONTRACT);
  const contract = CToken_1.CToken.bind(event.address);
  const borrowBalanceStoredResult = contract.try_borrowBalanceStored(
    event.params.borrower
  );
  (0, mapping_1._handleRepayBorrow)(
    factoryContract,
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
  const factoryContract = graph_ts_1.Address.fromString(FACTORY_CONTRACT);
  (0, mapping_1._handleLiquidateBorrow)(
    factoryContract,
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
  // get comptroller address
  let trollerAddr;
  if (
    (trollerAddr = getComptrollerAddress(event)) ==
    graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)
  ) {
    graph_ts_1.log.warning(
      "[handleAccrueInterest] Comptroller address not found.",
      []
    );
    return;
  }
  const cTokenContract = CToken_1.CToken.bind(marketAddress);
  const pool = schema_2._FusePool.load(trollerAddr.toHexString());
  if (!pool) {
    // best effort
    graph_ts_1.log.warning("[handleAccrueInterest] FusePool not found: {}", [
      trollerAddr.toHexString(),
    ]);
    return;
  }
  const oracleContract = PriceOracle_1.PriceOracle.bind(
    graph_ts_1.Address.fromString(pool.priceOracle)
  );
  let blocksPerYear;
  let blocksPerDay;
  if (
    (0, constants_1.compareNormalizedString)(
      graph_ts_1.dataSource.network(),
      constants_2.Network.MAINNET
    )
  ) {
    // calculate blocks/yr on ethereum
    // get rolling blocks/day count
    (0, rewards_1.getRewardsPerDay)(
      event.block.timestamp,
      event.block.number,
      constants_2.BIGDECIMAL_ZERO,
      rewards_1.RewardIntervalType.BLOCK
    );
    blocksPerDay = (0, rewards_1.getOrCreateCircularBuffer)().blocksPerDay;
    const blocksPerDayBI = graph_ts_1.BigInt.fromString(
      blocksPerDay.truncate(0).toString()
    );
    blocksPerYear = blocksPerDayBI.toI32() * constants_2.DAYS_PER_YEAR;
  } else {
    // Arbitrum One block speed is the same as ethereum
    // we do this b/c we cannot calculate the arbitrum block speed accurately
    // see discussion: https://github.com/messari/subgraphs/issues/939
    blocksPerYear = constants_2.ETHEREUM_BLOCKS_PER_YEAR;
    blocksPerDay = graph_ts_1.BigDecimal.fromString(
      (constants_2.ETHEREUM_BLOCKS_PER_YEAR / 365).toString()
    );
  }
  //
  // replacing _handleAccrueInterest() to properly derive assetPrice
  //
  const marketID = event.address.toHexString();
  const market = schema_2.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[handleAccrueInterest] Market not found: {}", [
      marketID,
    ]);
    return;
  }
  // Around block 13818884 sOHM pools were updated to gOHM
  // we need to update these pools to account for this otherwise the underlying currency is wrong
  if (
    market.inputToken.toLowerCase() == constants_1.SOHM_ADDRESS.toLowerCase()
  ) {
    const underlying = cTokenContract.underlying();
    if (
      underlying.toHexString().toLowerCase() ==
      constants_1.GOHM_ADDRESS.toLowerCase()
    ) {
      graph_ts_1.log.warning(
        "[handleAccrueInterest] sOHM migrated to gOHM in market: {} at block: {}",
        [marketID, event.block.number.toString()]
      );
      const newInputToken = new schema_1.Token(constants_1.GOHM_ADDRESS);
      const tokenContract = ERC20_1.ERC20.bind(
        graph_ts_1.Address.fromString(constants_1.GOHM_ADDRESS)
      );
      newInputToken.name = (0, mapping_1.getOrElse)(
        tokenContract.try_name(),
        "UNKNOWN"
      );
      newInputToken.symbol = (0, mapping_1.getOrElse)(
        tokenContract.try_symbol(),
        "UNKOWN"
      );
      newInputToken.decimals = (0, mapping_1.getOrElse)(
        tokenContract.try_decimals(),
        -1
      );
      newInputToken.save();
      market.inputToken = newInputToken.id;
      market.save();
    }
  }
  const updateMarketData = new mapping_1.UpdateMarketData(
    cTokenContract.try_totalSupply(),
    cTokenContract.try_exchangeRateStored(),
    cTokenContract.try_supplyRatePerBlock(),
    cTokenContract.try_borrowRatePerBlock(),
    oracleContract.try_getUnderlyingPrice(marketAddress),
    blocksPerYear
  );
  // creates and initializes market snapshots
  //
  // daily snapshot
  //
  (0, mapping_1.getOrCreateMarketDailySnapshot)(
    market,
    event.block.timestamp,
    event.block.number
  );
  //
  // hourly snapshot
  //
  (0, mapping_1.getOrCreateMarketHourlySnapshot)(
    market,
    event.block.timestamp,
    event.block.number
  );
  // handles fuse and admin fees (ie, protocol-side)
  updateMarket(
    updateMarketData,
    marketID,
    event.params.interestAccumulated,
    event.params.totalBorrows,
    event.block.number,
    event.block.timestamp,
    trollerAddr,
    blocksPerDay,
    true // update all prices on each transaction for arbitrum / ethereum
  );
  (0, mapping_1.updateProtocol)(
    graph_ts_1.Address.fromString(FACTORY_CONTRACT)
  );
  (0, mapping_1.snapshotFinancials)(
    graph_ts_1.Address.fromString(FACTORY_CONTRACT),
    event.block.number,
    event.block.timestamp
  );
}
exports.handleAccrueInterest = handleAccrueInterest;
function handleNewFuseFee(event) {
  updateOrCreateRariFee(
    event.params.newFuseFeeMantissa,
    RariFee.FUSE_FEE,
    event.address.toHexString()
  );
}
exports.handleNewFuseFee = handleNewFuseFee;
function handleNewAdminFee(event) {
  updateOrCreateRariFee(
    event.params.newAdminFeeMantissa,
    RariFee.ADMIN_FEE,
    event.address.toHexString()
  );
}
exports.handleNewAdminFee = handleNewAdminFee;
function handleNewReserveFactor(event) {
  const marketID = event.address.toHexString();
  const newReserveFactorMantissa = event.params.newReserveFactorMantissa;
  (0, mapping_1._handleNewReserveFactor)(marketID, newReserveFactorMantissa);
}
exports.handleNewReserveFactor = handleNewReserveFactor;
function handleTransfer(event) {
  const factoryContract = graph_ts_1.Address.fromString(FACTORY_CONTRACT);
  (0, mapping_1._handleTransfer)(
    event,
    event.address.toHexString(),
    event.params.to,
    event.params.from,
    factoryContract
  );
}
exports.handleTransfer = handleTransfer;
/////////////////
//// Helpers ////
/////////////////
function getComptrollerAddress(event) {
  const cTokenContract = CToken_1.CToken.bind(event.address);
  const tryComptroller = cTokenContract.try_comptroller();
  if (tryComptroller.reverted) {
    // comptroller does not exist
    graph_ts_1.log.warning(
      "[handleTransaction] Comptroller not found for transaction: {}",
      [event.transaction.hash.toHexString()]
    );
    return graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS);
  }
  return tryComptroller.value;
}
// updates the rate or creates the rari fee (either fuse or admin fee)
function updateOrCreateRariFee(rateMantissa, rariFeeType, marketID) {
  const rariFeeId =
    constants_2.InterestRateSide.BORROWER + "-" + rariFeeType + "-" + marketID;
  let rariFee = schema_2.InterestRate.load(rariFeeId);
  // calculate fee rate
  const rate = rateMantissa
    .toBigDecimal()
    .div(constants_2.mantissaFactorBD)
    .times(constants_2.BIGDECIMAL_HUNDRED);
  if (!rariFee) {
    rariFee = new schema_2.InterestRate(rariFeeId);
    rariFee.side = constants_2.InterestRateSide.BORROWER;
    rariFee.type = constants_2.InterestRateType.STABLE;
    // add to market rates array
    const market = schema_2.Market.load(marketID);
    if (!market) {
      // best effort
      return;
    }
    const rates = market.rates;
    rates.push(rariFee.id);
    market.rates = rates;
    market.save();
  }
  rariFee.rate = rate;
  rariFee.save();
}
// this function will "override" the updateMarket() function in ../../src/mapping.ts
// this function accounts for price oracles returning price in ETH in fuse
// this function calculates revenues with admin and fuse fees as well (fuse-specific)
function updateMarket(
  updateMarketData,
  marketID,
  interestAccumulatedMantissa,
  newTotalBorrow,
  blockNumber,
  blockTimestamp,
  comptroller,
  blocksPerDay,
  updateMarketPrices
) {
  const market = schema_2.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[updateMarket] Market not found: {}", [marketID]);
    return;
  }
  const underlyingToken = schema_1.Token.load(market.inputToken);
  if (!underlyingToken) {
    graph_ts_1.log.warning("[updateMarket] Underlying token not found: {}", [
      market.inputToken,
    ]);
    return;
  }
  if (updateMarketPrices) {
    updateAllMarketPrices(comptroller, blockNumber);
  }
  // update this market's price no matter what
  // grab price of ETH then multiply by underlying price
  const customETHPrice = (0, prices_1.getUsdPricePerToken)(
    graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS)
  );
  const ethPriceUSD = customETHPrice.usdPrice.div(
    customETHPrice.decimalsBaseTen
  );
  let underlyingTokenPriceUSD;
  if (updateMarketData.getUnderlyingPriceResult.reverted) {
    graph_ts_1.log.warning(
      "[updateMarket] Underlying price not found for market: {}",
      [marketID]
    );
    const backupPrice = (0, prices_1.getUsdPricePerToken)(
      graph_ts_1.Address.fromString(market.inputToken)
    );
    underlyingTokenPriceUSD = backupPrice.usdPrice.div(
      backupPrice.decimalsBaseTen
    );
  } else {
    const mantissaDecimalFactor = 18 - underlyingToken.decimals + 18;
    const bdFactor = (0, constants_2.exponentToBigDecimal)(
      mantissaDecimalFactor
    );
    const priceInEth = updateMarketData.getUnderlyingPriceResult.value
      .toBigDecimal()
      .div(bdFactor);
    underlyingTokenPriceUSD = priceInEth.times(ethPriceUSD); // get price in USD
  }
  // Protect fMIM from price oracle manipulation on 2/1/22-2/4/22
  // The average price on those days is $0.99632525
  if (
    marketID.toLowerCase() == constants_1.FMIM_ADDRESS.toLowerCase() &&
    blockTimestamp.toI32() >= 1643695208 && // beginning of day 2/1
    blockTimestamp.toI32() <= 1643954408 // EOD 2/4
  ) {
    underlyingTokenPriceUSD = graph_ts_1.BigDecimal.fromString("0.99632525");
  }
  // create a threshold for Vesper Pool V-Dollar price to use another oracle if:
  // the price is outside of the threshold ($0.50-$2.00)
  if (
    marketID.toLowerCase() ==
      constants_1.VESPER_V_DOLLAR_ADDRESS.toLowerCase() &&
    (underlyingTokenPriceUSD.le(graph_ts_1.BigDecimal.fromString(".5")) ||
      underlyingTokenPriceUSD.ge(graph_ts_1.BigDecimal.fromString("2")))
  ) {
    const customPrice = (0, prices_1.getUsdPricePerToken)(
      graph_ts_1.Address.fromString(market.inputToken)
    );
    underlyingTokenPriceUSD = customPrice.usdPrice.div(
      customPrice.decimalsBaseTen
    );
  }
  // fix FLOAT price exploit and high dailyDeposit at block number 14006054
  if (
    marketID.toLowerCase() == constants_1.FLOAT_MARKET_ADDRESS.toLowerCase() &&
    blockNumber.toI32() == 14006054
  ) {
    const customPrice = (0, prices_1.getUsdPricePerToken)(
      graph_ts_1.Address.fromString(constants_1.FLOAT_ADDRESS)
    );
    underlyingTokenPriceUSD = customPrice.usdPrice.div(
      customPrice.decimalsBaseTen
    );
  }
  underlyingToken.lastPriceUSD = underlyingTokenPriceUSD;
  underlyingToken.lastPriceBlockNumber = blockNumber;
  underlyingToken.save();
  market.inputTokenPriceUSD = underlyingTokenPriceUSD;
  if (updateMarketData.totalSupplyResult.reverted) {
    graph_ts_1.log.warning(
      "[updateMarket] Failed to get totalSupply of Market {}",
      [marketID]
    );
  } else {
    market.outputTokenSupply = updateMarketData.totalSupplyResult.value;
  }
  // get correct outputTokenDecimals for generic exchangeRate calculation
  let outputTokenDecimals = constants_2.cTokenDecimals;
  if (market.outputToken) {
    const outputToken = schema_1.Token.load(market.outputToken);
    if (!outputToken) {
      graph_ts_1.log.warning("[updateMarket] Output token not found: {}", [
        market.outputToken,
      ]);
    } else {
      outputTokenDecimals = outputToken.decimals;
    }
  }
  if (updateMarketData.exchangeRateStoredResult.reverted) {
    graph_ts_1.log.warning(
      "[updateMarket] Failed to get exchangeRateStored of Market {}",
      [marketID]
    );
  } else {
    // Formula: check out "Interpreting Exchange Rates" in https://compound.finance/docs#protocol-math
    const oneCTokenInUnderlying =
      updateMarketData.exchangeRateStoredResult.value
        .toBigDecimal()
        .div(
          (0, constants_2.exponentToBigDecimal)(
            constants_2.mantissaFactor +
              underlyingToken.decimals -
              outputTokenDecimals
          )
        );
    market.exchangeRate = oneCTokenInUnderlying;
    market.outputTokenPriceUSD = oneCTokenInUnderlying.times(
      underlyingTokenPriceUSD
    );
    // calculate inputTokenBalance only if exchangeRate is updated properly
    // mantissaFactor = (inputTokenDecimals - outputTokenDecimals)  (Note: can be negative)
    // inputTokenBalance = (outputSupply * exchangeRate) * (10 ^ mantissaFactor)
    if (underlyingToken.decimals > outputTokenDecimals) {
      // we want to multiply out the difference to expand BD
      const mantissaFactorBD = (0, constants_2.exponentToBigDecimal)(
        underlyingToken.decimals - outputTokenDecimals
      );
      const inputTokenBalanceBD = market.outputTokenSupply
        .toBigDecimal()
        .times(market.exchangeRate)
        .times(mantissaFactorBD)
        .truncate(0);
      market.inputTokenBalance = graph_ts_1.BigInt.fromString(
        inputTokenBalanceBD.toString()
      );
    } else {
      // we want to divide back the difference to decrease the BD
      const mantissaFactorBD = (0, constants_2.exponentToBigDecimal)(
        outputTokenDecimals - underlyingToken.decimals
      );
      const inputTokenBalanceBD = market.outputTokenSupply
        .toBigDecimal()
        .times(market.exchangeRate)
        .div(mantissaFactorBD)
        .truncate(0);
      market.inputTokenBalance = graph_ts_1.BigInt.fromString(
        inputTokenBalanceBD.toString()
      );
    }
  }
  const underlyingSupplyUSD = market.inputTokenBalance
    .toBigDecimal()
    .div((0, constants_2.exponentToBigDecimal)(underlyingToken.decimals))
    .times(underlyingTokenPriceUSD);
  market.totalValueLockedUSD = underlyingSupplyUSD;
  market.totalDepositBalanceUSD = underlyingSupplyUSD;
  market._borrowBalance = newTotalBorrow;
  market.totalBorrowBalanceUSD = newTotalBorrow
    .toBigDecimal()
    .div((0, constants_2.exponentToBigDecimal)(underlyingToken.decimals))
    .times(underlyingTokenPriceUSD);
  if (updateMarketData.supplyRateResult.reverted) {
    graph_ts_1.log.warning(
      "[updateMarket] Failed to get supplyRate of Market {}",
      [marketID]
    );
  } else {
    (0, mapping_1.setSupplyInterestRate)(
      marketID,
      (0, mapping_1.convertRatePerUnitToAPY)(
        updateMarketData.supplyRateResult.value,
        updateMarketData.unitPerYear
      )
    );
  }
  if (updateMarketData.borrowRateResult.reverted) {
    graph_ts_1.log.warning(
      "[updateMarket] Failed to get borrowRate of Market {}",
      [marketID]
    );
  } else {
    (0, mapping_1.setBorrowInterestRate)(
      marketID,
      (0, mapping_1.convertRatePerUnitToAPY)(
        updateMarketData.borrowRateResult.value,
        updateMarketData.unitPerYear
      )
    );
  }
  // update rewards
  const troller = FuseComptroller_1.FuseComptroller.bind(comptroller);
  const tryRewardDistributors = troller.try_getRewardsDistributors();
  if (!tryRewardDistributors.reverted) {
    const rewardDistributors = tryRewardDistributors.value;
    updateRewards(rewardDistributors, marketID, blocksPerDay, blockNumber);
  }
  // calculate new interests accumulated
  // With fuse protocol revenue includes (reserve factor + fuse fee + admin fee)
  const fuseFeeId =
    constants_2.InterestRateSide.BORROWER +
    "-" +
    RariFee.FUSE_FEE +
    "-" +
    marketID;
  const fuseFee = schema_2.InterestRate.load(fuseFeeId).rate.div(
    (0, constants_2.exponentToBigDecimal)(constants_2.INT_TWO)
  );
  const adminFeeId =
    constants_2.InterestRateSide.BORROWER +
    "-" +
    RariFee.ADMIN_FEE +
    "-" +
    marketID;
  const adminFee = schema_2.InterestRate.load(adminFeeId).rate.div(
    (0, constants_2.exponentToBigDecimal)(constants_2.INT_TWO)
  );
  const interestAccumulatedUSD = interestAccumulatedMantissa
    .toBigDecimal()
    .div((0, constants_2.exponentToBigDecimal)(underlyingToken.decimals))
    .times(underlyingTokenPriceUSD);
  const protocolSideRevenueUSDDelta = interestAccumulatedUSD.times(
    market._reserveFactor.plus(fuseFee).plus(adminFee)
  );
  const supplySideRevenueUSDDelta = interestAccumulatedUSD.minus(
    protocolSideRevenueUSDDelta
  );
  market.cumulativeTotalRevenueUSD = market.cumulativeTotalRevenueUSD.plus(
    interestAccumulatedUSD
  );
  market.cumulativeProtocolSideRevenueUSD =
    market.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenueUSDDelta);
  market.cumulativeSupplySideRevenueUSD =
    market.cumulativeSupplySideRevenueUSD.plus(supplySideRevenueUSDDelta);
  market.save();
  // update daily fields in marketDailySnapshot
  const dailySnapshot = (0, mapping_1.getOrCreateMarketDailySnapshot)(
    market,
    blockTimestamp,
    blockNumber
  );
  dailySnapshot.dailyTotalRevenueUSD = dailySnapshot.dailyTotalRevenueUSD.plus(
    interestAccumulatedUSD
  );
  dailySnapshot.dailyProtocolSideRevenueUSD =
    dailySnapshot.dailyProtocolSideRevenueUSD.plus(protocolSideRevenueUSDDelta);
  dailySnapshot.dailySupplySideRevenueUSD =
    dailySnapshot.dailySupplySideRevenueUSD.plus(supplySideRevenueUSDDelta);
  dailySnapshot.save();
  // update hourly fields in marketHourlySnapshot
  const hourlySnapshot = (0, mapping_1.getOrCreateMarketHourlySnapshot)(
    market,
    blockTimestamp,
    blockNumber
  );
  hourlySnapshot.hourlyTotalRevenueUSD =
    hourlySnapshot.hourlyTotalRevenueUSD.plus(interestAccumulatedUSD);
  hourlySnapshot.hourlyProtocolSideRevenueUSD =
    hourlySnapshot.hourlyProtocolSideRevenueUSD.plus(
      protocolSideRevenueUSDDelta
    );
  hourlySnapshot.hourlySupplySideRevenueUSD =
    hourlySnapshot.hourlySupplySideRevenueUSD.plus(supplySideRevenueUSDDelta);
  hourlySnapshot.save();
}
function updateRewards(rewardDistributor, marketID, blocksPerDay, blockNumber) {
  const market = schema_2.Market.load(marketID);
  if (!market) {
    graph_ts_1.log.warning("[getRewardDistributorData] Market {} not found", [
      marketID,
    ]);
    return;
  }
  // grab reward amounts
  let rewardEmissions = [];
  let rewardEmissionsUSD = [];
  let rewardTokens = [];
  for (let i = 0; i < rewardDistributor.length; i++) {
    // setup reward arrays for distributor i
    // always borrow side first
    const distributorRewards = [
      constants_2.BIGINT_ZERO,
      constants_2.BIGINT_ZERO,
    ];
    const distributorRewardsUSD = [
      constants_2.BIGDECIMAL_ZERO,
      constants_2.BIGDECIMAL_ZERO,
    ];
    const distributorTokens = [
      constants_1.ZERO_ADDRESS,
      constants_1.ZERO_ADDRESS,
    ];
    // get distributor contract and grab borrow/supply distribution
    const distributor =
      RewardsDistributorDelegator_1.RewardsDistributorDelegator.bind(
        rewardDistributor[i]
      );
    const tryBorrowSpeeds = distributor.try_compBorrowSpeeds(
      graph_ts_1.Address.fromString(marketID)
    );
    const trySupplySpeeds = distributor.try_compSupplySpeeds(
      graph_ts_1.Address.fromString(marketID)
    );
    const tryRewardToken = distributor.try_rewardToken();
    // create reward token if available
    if (!tryRewardToken.reverted) {
      let token = schema_1.Token.load(tryRewardToken.value.toHexString());
      if (!token) {
        const tokenContract = ERC20_1.ERC20.bind(tryRewardToken.value);
        token = new schema_1.Token(tryRewardToken.value.toHexString());
        token.name = (0, mapping_1.getOrElse)(
          tokenContract.try_name(),
          "UNKNOWN"
        );
        token.symbol = (0, mapping_1.getOrElse)(
          tokenContract.try_symbol(),
          "UNKOWN"
        );
        token.decimals = (0, mapping_1.getOrElse)(
          tokenContract.try_decimals(),
          -1
        );
        token.save();
      }
      // get reward token price
      const customPrice = (0, prices_1.getUsdPricePerToken)(
        graph_ts_1.Address.fromString(token.id)
      );
      const rewardTokenPriceUSD = customPrice.usdPrice.div(
        customPrice.decimalsBaseTen
      );
      token.lastPriceUSD = rewardTokenPriceUSD;
      token.lastPriceBlockNumber = blockNumber;
      token.save();
      // borrow speeds
      if (!tryBorrowSpeeds.reverted) {
        const borrowRewardsBD = tryBorrowSpeeds.value
          .toBigDecimal()
          .div((0, constants_2.exponentToBigDecimal)(token.decimals));
        const rewardsPerDay = borrowRewardsBD.times(blocksPerDay);
        distributorRewards[0] = graph_ts_1.BigInt.fromString(
          rewardsPerDay.truncate(0).toString()
        );
        distributorRewardsUSD[0] = rewardsPerDay.times(rewardTokenPriceUSD);
        // create borrow reward token
        const rewardTokenId =
          constants_2.RewardTokenType.BORROW + "-" + token.id;
        let rewardToken = schema_2.RewardToken.load(rewardTokenId);
        if (!rewardToken) {
          rewardToken = new schema_2.RewardToken(rewardTokenId);
          rewardToken.token = token.id;
          rewardToken.type = constants_2.RewardTokenType.BORROW;
          rewardToken.save();
        }
        distributorTokens[0] = rewardToken.id;
      }
      // supply speeds
      if (!trySupplySpeeds.reverted) {
        const supplyRewardsBD = trySupplySpeeds.value
          .toBigDecimal()
          .div((0, constants_2.exponentToBigDecimal)(token.decimals));
        const rewardsPerDay = supplyRewardsBD.times(blocksPerDay);
        distributorRewards[1] = graph_ts_1.BigInt.fromString(
          rewardsPerDay.truncate(0).toString()
        );
        distributorRewardsUSD[1] = rewardsPerDay.times(rewardTokenPriceUSD);
        // create supply reward token
        const rewardTokenId =
          constants_2.RewardTokenType.DEPOSIT + "-" + token.id;
        let rewardToken = schema_2.RewardToken.load(rewardTokenId);
        if (!rewardToken) {
          rewardToken = new schema_2.RewardToken(rewardTokenId);
          rewardToken.token = token.id;
          rewardToken.type = constants_2.RewardTokenType.DEPOSIT;
          rewardToken.save();
        }
        distributorTokens[1] = rewardToken.id;
      }
    }
    // concat this rewardDistributor results to cumulative results
    rewardEmissions = rewardEmissions.concat(distributorRewards);
    rewardEmissionsUSD = rewardEmissionsUSD.concat(distributorRewardsUSD);
    rewardTokens = rewardTokens.concat(distributorTokens);
  }
  // update market
  market.rewardTokens = rewardTokens;
  market.rewardTokenEmissionsAmount = rewardEmissions;
  market.rewardTokenEmissionsUSD = rewardEmissionsUSD;
  market.save();
}
function updateAllMarketPrices(comptrollerAddr, blockNumber) {
  const protocol = schema_1.LendingProtocol.load(comptrollerAddr.toHexString());
  if (!protocol) {
    graph_ts_1.log.warning("[updateAllMarketPrices] protocol not found: {}", [
      comptrollerAddr.toHexString(),
    ]);
    return;
  }
  const priceOracle = PriceOracle_1.PriceOracle.bind(
    graph_ts_1.Address.fromString(protocol._priceOracle)
  );
  for (let i = 0; i < protocol._marketIDs.length; i++) {
    const market = schema_2.Market.load(protocol._marketIDs[i]);
    if (!market) {
      break;
    }
    const underlyingToken = schema_1.Token.load(market.inputToken);
    if (!underlyingToken) {
      break;
    }
    // update market price
    const customETHPrice = (0, prices_1.getUsdPricePerToken)(
      graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS)
    );
    const ethPriceUSD = customETHPrice.usdPrice.div(
      customETHPrice.decimalsBaseTen
    );
    const tryUnderlyingPrice = priceOracle.try_getUnderlyingPrice(
      graph_ts_1.Address.fromString(market.id)
    );
    let underlyingTokenPriceUSD;
    if (tryUnderlyingPrice.reverted) {
      break;
    } else {
      const mantissaDecimalFactor = 18 - underlyingToken.decimals + 18;
      const bdFactor = (0, constants_2.exponentToBigDecimal)(
        mantissaDecimalFactor
      );
      const priceInEth = tryUnderlyingPrice.value.toBigDecimal().div(bdFactor);
      underlyingTokenPriceUSD = priceInEth.times(ethPriceUSD); // get price in USD
    }
    underlyingToken.lastPriceUSD = underlyingTokenPriceUSD;
    underlyingToken.lastPriceBlockNumber = blockNumber;
    underlyingToken.save();
    market.inputTokenPriceUSD = underlyingTokenPriceUSD;
    // update TVL, supplyUSD, borrowUSD
    market.totalDepositBalanceUSD = market.inputTokenBalance
      .toBigDecimal()
      .div((0, constants_2.exponentToBigDecimal)(underlyingToken.decimals))
      .times(underlyingTokenPriceUSD);
    market.totalBorrowBalanceUSD = market._borrowBalance
      .toBigDecimal()
      .div((0, constants_2.exponentToBigDecimal)(underlyingToken.decimals))
      .times(underlyingTokenPriceUSD);
    market.totalValueLockedUSD = market.inputTokenBalance
      .toBigDecimal()
      .div((0, constants_2.exponentToBigDecimal)(underlyingToken.decimals))
      .times(underlyingTokenPriceUSD);
    market.save();
  }
}
