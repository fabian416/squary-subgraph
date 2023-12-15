"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTokenPrice =
  exports.createLiquidateEvent =
  exports.createMarket =
  exports.updateProtocolMarketList =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const Cauldron_1 = require("../../generated/templates/Cauldron/Cauldron");
const getters_1 = require("./getters");
const constants_1 = require("./constants");
const numbers_1 = require("./utils/numbers");
function updateProtocolMarketList(marketAddress) {
  const protocol = (0, getters_1.getOrCreateLendingProtocol)();
  const marketIDList = protocol.marketIDList;
  marketIDList.push(marketAddress);
  protocol.marketIDList = marketIDList;
  protocol.save();
}
exports.updateProtocolMarketList = updateProtocolMarketList;
function createMarket(marketAddress, blockNumber, blockTimestamp) {
  const MarketEntity = new schema_1.Market(marketAddress);
  const MarketContract = Cauldron_1.Cauldron.bind(
    graph_ts_1.Address.fromString(marketAddress)
  );
  const collateralCall = MarketContract.try_collateral();
  const protocol = (0, getters_1.getOrCreateLendingProtocol)();
  if (!collateralCall.reverted) {
    const inputToken = (0, getters_1.getOrCreateToken)(collateralCall.value);
    MarketEntity.protocol = protocol.id;
    MarketEntity.inputToken = inputToken.id;
    MarketEntity.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    MarketEntity.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    MarketEntity.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    MarketEntity.inputTokenBalance = constants_1.BIGINT_ZERO;
    MarketEntity.outputTokenSupply = constants_1.BIGINT_ZERO;
    MarketEntity.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
    MarketEntity.createdTimestamp = blockTimestamp;
    MarketEntity.createdBlockNumber = blockNumber;
    MarketEntity.maximumLTV = constants_1.BIGDECIMAL_ZERO;
    MarketEntity.inputTokenPriceUSD = inputToken.lastPriceUSD;
    MarketEntity.liquidationThreshold = constants_1.BIGDECIMAL_ZERO;
    MarketEntity.liquidationPenalty = constants_1.BIGDECIMAL_ZERO;
    MarketEntity.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    MarketEntity.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    MarketEntity.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    MarketEntity.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
    MarketEntity.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
    MarketEntity.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
    MarketEntity.rates = [];
    MarketEntity.positionCount = 0;
    MarketEntity.openPositionCount = 0;
    MarketEntity.closedPositionCount = 0;
    MarketEntity.lendingPositionCount = 0;
    MarketEntity.borrowingPositionCount = 0;
    MarketEntity.name = inputToken.name + " Market";
    MarketEntity.isActive = true;
    MarketEntity.canUseAsCollateral = true;
    MarketEntity.canBorrowFrom = true;
    const interestRate = (0, getters_1.getOrCreateInterestRate)(
      MarketEntity.id
    );
    interestRate.side = constants_1.InterestRateSide.BORROW;
    interestRate.type = constants_1.InterestRateType.STABLE;
    if (
      marketAddress.toLowerCase() == constants_1.YV_USDT_MARKET.toLowerCase()
    ) {
      MarketEntity.maximumLTV = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.LOW_RISK_COLLATERAL_RATE),
        constants_1.COLLATERIZATION_RATE_PRECISION
      ).times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      MarketEntity.liquidationPenalty = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.LOW_RISK_LIQUIDATION_PENALTY),
        constants_1.COLLATERIZATION_RATE_PRECISION
      )
        .minus(constants_1.BIGDECIMAL_ONE)
        .times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      MarketEntity.liquidationThreshold = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.LOW_RISK_COLLATERAL_RATE),
        constants_1.COLLATERIZATION_RATE_PRECISION
      ).times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      interestRate.rate = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.LOW_RISK_INTEREST_RATE),
        constants_1.DEFAULT_DECIMALS
      )
        .times(constants_1.SECONDS_PER_YEAR)
        .times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      interestRate.save();
      MarketEntity.rates = [interestRate.id];
    } else if (
      marketAddress.toLowerCase() == constants_1.YV_WETH_MARKET.toLowerCase()
    ) {
      MarketEntity.maximumLTV = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.HIGH_RISK_COLLATERAL_RATE),
        constants_1.COLLATERIZATION_RATE_PRECISION
      ).times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      MarketEntity.liquidationPenalty = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.HIGH_RISK_LIQUIDATION_PENALTY),
        constants_1.COLLATERIZATION_RATE_PRECISION
      )
        .minus(constants_1.BIGDECIMAL_ONE)
        .times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      MarketEntity.liquidationThreshold = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.HIGH_RISK_COLLATERAL_RATE),
        constants_1.COLLATERIZATION_RATE_PRECISION
      ).times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      interestRate.rate = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.HIGH_RISK_INTEREST_RATE),
        constants_1.DEFAULT_DECIMALS
      )
        .times(constants_1.SECONDS_PER_YEAR)
        .times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      interestRate.save();
      MarketEntity.rates = [interestRate.id];
    } else if (
      marketAddress.toLowerCase() == constants_1.YV_YFI_MARKET.toLowerCase()
    ) {
      MarketEntity.maximumLTV = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.HIGH_RISK_COLLATERAL_RATE),
        constants_1.COLLATERIZATION_RATE_PRECISION
      ).times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      MarketEntity.liquidationPenalty = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.HIGH_RISK_LIQUIDATION_PENALTY),
        constants_1.COLLATERIZATION_RATE_PRECISION
      )
        .minus(constants_1.BIGDECIMAL_ONE)
        .times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      MarketEntity.liquidationThreshold = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.HIGH_RISK_COLLATERAL_RATE),
        constants_1.COLLATERIZATION_RATE_PRECISION
      ).times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      interestRate.rate = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.HIGH_RISK_INTEREST_RATE),
        constants_1.DEFAULT_DECIMALS
      )
        .times(constants_1.SECONDS_PER_YEAR)
        .times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      interestRate.save();
      MarketEntity.rates = [interestRate.id];
    } else if (
      marketAddress.toLowerCase() == constants_1.YV_USDC_MARKET.toLowerCase()
    ) {
      MarketEntity.maximumLTV = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.STABLE_RISK_COLLATERAL_RATE),
        constants_1.COLLATERIZATION_RATE_PRECISION
      ).times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      MarketEntity.liquidationPenalty = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.LOW_RISK_LIQUIDATION_PENALTY),
        constants_1.COLLATERIZATION_RATE_PRECISION
      )
        .minus(constants_1.BIGDECIMAL_ONE)
        .times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      MarketEntity.liquidationThreshold = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.STABLE_RISK_COLLATERAL_RATE),
        constants_1.COLLATERIZATION_RATE_PRECISION
      ).times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      interestRate.rate = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.LOW_RISK_INTEREST_RATE),
        constants_1.DEFAULT_DECIMALS
      )
        .times(constants_1.SECONDS_PER_YEAR)
        .times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      interestRate.save();
      MarketEntity.rates = [interestRate.id];
    } else if (
      marketAddress.toLowerCase() == constants_1.XSUSHI_MARKET.toLowerCase()
    ) {
      MarketEntity.maximumLTV = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.HIGH_RISK_COLLATERAL_RATE),
        constants_1.COLLATERIZATION_RATE_PRECISION
      ).times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      MarketEntity.liquidationPenalty = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.HIGH_RISK_LIQUIDATION_PENALTY),
        constants_1.COLLATERIZATION_RATE_PRECISION
      )
        .minus(constants_1.BIGDECIMAL_ONE)
        .times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      MarketEntity.liquidationThreshold = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.HIGH_RISK_COLLATERAL_RATE),
        constants_1.COLLATERIZATION_RATE_PRECISION
      ).times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      interestRate.rate = (0, numbers_1.bigIntToBigDecimal)(
        graph_ts_1.BigInt.fromI32(constants_1.HIGH_RISK_INTEREST_RATE),
        constants_1.DEFAULT_DECIMALS
      )
        .times(constants_1.SECONDS_PER_YEAR)
        .times(constants_1.BIGDECIMAL_ONE_HUNDRED);
      interestRate.save();
      MarketEntity.rates = [interestRate.id];
    } else {
      const maximumLTVCall = MarketContract.try_COLLATERIZATION_RATE();
      const liquidationPenaltyCall =
        MarketContract.try_LIQUIDATION_MULTIPLIER();
      const accrueInfoCall = MarketContract.try_accrueInfo();
      if (
        !maximumLTVCall.reverted &&
        !liquidationPenaltyCall.reverted &&
        !accrueInfoCall.reverted
      ) {
        MarketEntity.maximumLTV = (0, numbers_1.bigIntToBigDecimal)(
          maximumLTVCall.value,
          constants_1.COLLATERIZATION_RATE_PRECISION
        ).times(constants_1.BIGDECIMAL_ONE_HUNDRED);
        MarketEntity.liquidationPenalty = (0, numbers_1.bigIntToBigDecimal)(
          liquidationPenaltyCall.value,
          constants_1.COLLATERIZATION_RATE_PRECISION
        )
          .minus(constants_1.BIGDECIMAL_ONE)
          .times(constants_1.BIGDECIMAL_ONE_HUNDRED);
        MarketEntity.liquidationThreshold = (0, numbers_1.bigIntToBigDecimal)(
          maximumLTVCall.value,
          constants_1.COLLATERIZATION_RATE_PRECISION
        ).times(constants_1.BIGDECIMAL_ONE_HUNDRED);
        interestRate.rate = (0, numbers_1.bigIntToBigDecimal)(
          accrueInfoCall.value.value2,
          constants_1.DEFAULT_DECIMALS
        )
          .times(constants_1.SECONDS_PER_YEAR)
          .times(constants_1.BIGDECIMAL_ONE_HUNDRED);
        interestRate.save();
        MarketEntity.rates = [interestRate.id];
      }
    }
    const oracleCall = MarketContract.try_oracle();
    if (!oracleCall.reverted) {
      MarketEntity.priceOracle = oracleCall.value;
    }
  }
  MarketEntity.save();
  protocol.totalPoolCount = protocol.totalPoolCount + 1;
  protocol.save();
  updateProtocolMarketList(marketAddress);
}
exports.createMarket = createMarket;
function createLiquidateEvent(event) {
  const liquidation = new schema_1.LiquidateProxy(
    "liquidate-" +
      event.transaction.hash.toHexString() +
      "-" +
      event.transactionLogIndex.toString()
  );
  liquidation.amount = event.params.share;
  liquidation.save();
}
exports.createLiquidateEvent = createLiquidateEvent;
// Update token price using the exchange rate
// update on the market and token
function updateTokenPrice(rate, token, market, blockNumber) {
  let priceUSD = constants_1.BIGDECIMAL_ZERO;
  if (rate != constants_1.BIGINT_ZERO) {
    priceUSD = constants_1.BIGDECIMAL_ONE.div(
      (0, numbers_1.bigIntToBigDecimal)(rate, token.decimals)
    );
  }
  // fix avax JoeBar price discrepency
  // the exchange rate is way too low
  // it seems like it should be offset by 6 (instead of 18) until 6431888
  // this only affects one deposit
  if (
    market.id.toLowerCase() ==
      constants_1.AVAX_JOE_BAR_MARKET_ADDRESS.toLowerCase() &&
    blockNumber.lt(graph_ts_1.BigInt.fromI32(6431889))
  ) {
    priceUSD = constants_1.BIGDECIMAL_ONE.div(
      (0, numbers_1.bigIntToBigDecimal)(rate, 6)
    );
  }
  // update market
  market.inputTokenPriceUSD = priceUSD;
  market.save();
  // update token
  token.lastPriceUSD = priceUSD;
  token.lastPriceBlockNumber = blockNumber;
  token.save();
}
exports.updateTokenPrice = updateTokenPrice;
