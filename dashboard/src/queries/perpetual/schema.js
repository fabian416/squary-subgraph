"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema131 =
  exports.schema130 =
  exports.schema120 =
  exports.schema110 =
  exports.schema100 =
  exports.schema =
  exports.versionsList =
    void 0;
const constants_1 = require("../../constants");
exports.versionsList = ["1.0.0", "1.1.0", "1.2.0", "1.3.0", "1.3.1"];
const schema = (version) => {
  // The version group uses the first two digits  of the schema version and defaults to that schema.
  const versionGroupArr = version.split(".");
  const spec = versionGroupArr.pop();
  const versionGroup = versionGroupArr.join(".") + ".0";
  switch (versionGroup) {
    case constants_1.Versions.Schema100:
      return (0, exports.schema100)();
    case constants_1.Versions.Schema110:
      return (0, exports.schema110)();
    case constants_1.Versions.Schema120:
      return (0, exports.schema120)();
    case constants_1.Versions.Schema130:
      if (spec && parseInt(spec) < 1) {
        return (0, exports.schema130)();
      }
      return (0, exports.schema131)();
    default:
      return (0, exports.schema131)();
  }
};
exports.schema = schema;
const schema100 = () => {
  const entities = [
    "financialsDailySnapshots",
    "usageMetricsDailySnapshots",
    "liquidityPoolDailySnapshots",
    "usageMetricsHourlySnapshots",
    "liquidityPoolHourlySnapshots",
  ];
  const entitiesData = {
    financialsDailySnapshots: {
      id: "Bytes!",
      days: "Int!",
      totalValueLockedUSD: "BigDecimal!",
      protocolControlledValueUSD: "BigDecimal",
      dailyVolumeUSD: "BigDecimal!",
      cumulativeVolumeUSD: "BigDecimal!",
      dailyInflowVolumeUSD: "BigDecimal!",
      cumulativeInflowVolumeUSD: "BigDecimal!",
      dailyClosedInflowVolumeUSD: "BigDecimal!",
      cumulativeClosedInflowVolumeUSD: "BigDecimal!",
      dailyOutflowVolumeUSD: "BigDecimal!",
      cumulativeOutflowVolumeUSD: "BigDecimal!",
      dailyOpenInterestUSD: "BigDecimal!",
      dailySupplySideRevenueUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      dailyProtocolSideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      dailyStakeSideRevenueUSD: "BigDecimal!",
      cumulativeStakeSideRevenueUSD: "BigDecimal!",
      dailyTotalRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      dailyEntryPremiumUSD: "BigDecimal!",
      cumulativeEntryPremiumUSD: "BigDecimal!",
      dailyExitPremiumUSD: "BigDecimal!",
      cumulativeExitPremiumUSD: "BigDecimal!",
      dailyTotalPremiumUSD: "BigDecimal!",
      cumulativeTotalPremiumUSD: "BigDecimal!",
      dailyDepositPremiumUSD: "BigDecimal!",
      cumulativeDepositPremiumUSD: "BigDecimal!",
      dailyWithdrawPremiumUSD: "BigDecimal!",
      cumulativeWithdrawPremiumUSD: "BigDecimal!",
      dailyTotalLiquidityPremiumUSD: "BigDecimal!",
      cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
    },
    usageMetricsDailySnapshots: {
      id: "Bytes!",
      days: "Int!",
      dailyActiveUsers: "Int!",
      cumulativeUniqueUsers: "Int!",
      dailylongPositionCount: "Int!",
      longPositionCount: "Int!",
      dailyshortPositionCount: "Int!",
      shortPositionCount: "Int!",
      dailyopenPositionCount: "Int!",
      openPositionCount: "Int!",
      dailyclosedPositionCount: "Int!",
      closedPositionCount: "Int!",
      dailycumulativePositionCount: "Int!",
      cumulativePositionCount: "Int!",
      dailyTransactionCount: "Int!",
      dailyDepositCount: "Int!",
      dailyWithdrawCount: "Int!",
      dailyBorrowCount: "Int!",
      dailySwapCount: "Int!",
      dailyActiveDepositors: "Int!",
      cumulativeUniqueDepositors: "Int!",
      dailyActiveBorrowers: "Int!",
      cumulativeUniqueBorrowers: "Int!",
      dailyActiveLiquidators: "Int!",
      cumulativeUniqueLiquidators: "Int!",
      dailyActiveLiquidatees: "Int!",
      cumulativeUniqueLiquidatees: "Int!",
      dailyCollateralIn: "Int!",
      cumulativeCollateralIn: "Int!",
      dailyCollateralOut: "Int!",
      cumulativeCollateralOut: "Int!",
      totalPoolCount: "Int!",
    },
    liquidityPoolDailySnapshots: {
      id: "Bytes!",
      days: "Int!",
      totalValueLockedUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      dailySupplySideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      dailyProtocolSideRevenueUSD: "BigDecimal!",
      dailyTotalRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      dailyFundingrate: "[BigDecimal!]!",
      dailyOpenInterestUSD: "BigDecimal!",
      dailyEntryPremiumUSD: "BigDecimal!",
      cumulativeEntryPremiumUSD: "BigDecimal!",
      dailyExitPremiumUSD: "BigDecimal!",
      cumulativeExitPremiumUSD: "BigDecimal!",
      dailyTotalPremiumUSD: "BigDecimal!",
      cumulativeTotalPremiumUSD: "BigDecimal!",
      dailyDepositPremiumUSD: "BigDecimal!",
      cumulativeDepositPremiumUSD: "BigDecimal!",
      dailyWithdrawPremiumUSD: "BigDecimal!",
      cumulativeWithdrawPremiumUSD: "BigDecimal!",
      dailyTotalLiquidityPremiumUSD: "BigDecimal!",
      cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
      dailyActiveBorrowers: "Int!",
      cumulativeUniqueBorrowers: "Int!",
      dailyActiveLiquidators: "Int!",
      cumulativeUniqueLiquidators: "Int!",
      dailyActiveLiquidatees: "Int!",
      cumulativeUniqueLiquidatees: "Int!",
      dailylongPositionCount: "Int!",
      longPositionCount: "Int!",
      dailyshortPositionCount: "Int!",
      shortPositionCount: "Int!",
      dailyopenPositionCount: "Int!",
      openPositionCount: "Int!",
      dailyclosedPositionCount: "Int!",
      closedPositionCount: "Int!",
      dailycumulativePositionCount: "Int!",
      cumulativePositionCount: "Int!",
      dailyVolumeUSD: "BigDecimal!",
      dailyVolumeByTokenAmount: "[BigInt!]!",
      dailyVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeVolumeUSD: "BigDecimal!",
      dailyInflowVolumeUSD: "BigDecimal!",
      dailyInflowVolumeByTokenAmount: "[BigInt!]!",
      dailyInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeInflowVolumeUSD: "BigDecimal!",
      dailyClosedInflowVolumeUSD: "BigDecimal!",
      dailyClosedInflowVolumeByTokenAmount: "[BigInt!]!",
      dailyClosedInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeClosedInflowVolumeUSD: "BigDecimal!",
      dailyOutflowVolumeUSD: "BigDecimal!",
      dailyOutflowVolumeByTokenAmount: "[BigInt!]!",
      dailyOutflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeOutflowVolumeUSD: "BigDecimal!",
      inputTokenBalances: "[BigInt!]!",
      inputTokenWeights: "[BigDecimal!]!",
      outputTokenSupply: "BigInt",
      outputTokenPriceUSD: "BigDecimal",
      stakedOutputTokenAmount: "BigInt",
      rewardTokenEmissionsAmount: "[BigInt!]",
      rewardTokenEmissionsUSD: "[BigDecimal!]",
    },
    usageMetricsHourlySnapshots: {
      id: "Bytes!",
      hours: "Int!",
      hourlyActiveUsers: "Int!",
      cumulativeUniqueUsers: "Int!",
      hourlyTransactionCount: "Int!",
      hourlyDepositCount: "Int!",
      hourlyWithdrawCount: "Int!",
      hourlySwapCount: "Int!",
    },
    liquidityPoolHourlySnapshots: {
      id: "Bytes!",
      hours: "Int!",
      totalValueLockedUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      hourlySupplySideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      hourlyProtocolSideRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      hourlyTotalRevenueUSD: "BigDecimal!",
      hourlyFundingrate: "[BigDecimal!]!",
      hourlyOpenInterestUSD: "BigDecimal!",
      hourlyEntryPremiumUSD: "BigDecimal!",
      cumulativeEntryPremiumUSD: "BigDecimal!",
      hourlyExitPremiumUSD: "BigDecimal!",
      cumulativeExitPremiumUSD: "BigDecimal!",
      hourlyTotalPremiumUSD: "BigDecimal!",
      cumulativeTotalPremiumUSD: "BigDecimal!",
      hourlyDepositPremiumUSD: "BigDecimal!",
      cumulativeDepositPremiumUSD: "BigDecimal!",
      hourlyWithdrawPremiumUSD: "BigDecimal!",
      cumulativeWithdrawPremiumUSD: "BigDecimal!",
      hourlyTotalLiquidityPremiumUSD: "BigDecimal!",
      cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
      hourlyVolumeUSD: "BigDecimal!",
      hourlyVolumeByTokenAmount: "[BigInt!]!",
      hourlyVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeVolumeUSD: "BigDecimal!",
      hourlyInflowVolumeUSD: "BigDecimal!",
      hourlyInflowVolumeByTokenAmount: "[BigInt!]!",
      hourlyInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeInflowVolumeUSD: "BigDecimal!",
      hourlyClosedInflowVolumeUSD: "BigDecimal!",
      hourlyClosedInflowVolumeByTokenAmount: "[BigInt!]!",
      hourlyClosedInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeClosedInflowVolumeUSD: "BigDecimal!",
      hourlyOutflowVolumeUSD: "BigDecimal!",
      hourlyOutflowVolumeByTokenAmount: "[BigInt!]!",
      hourlyOutflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeOutflowVolumeUSD: "BigDecimal!",
      inputTokenBalances: "[BigInt!]!",
      inputTokenWeights: "[BigDecimal!]!",
      outputTokenSupply: "BigInt",
      outputTokenPriceUSD: "BigDecimal",
      stakedOutputTokenAmount: "BigInt",
      rewardTokenEmissionsAmount: "[BigInt!]",
      rewardTokenEmissionsUSD: "[BigDecimal!]",
    },
  };
  const finanQuery =
    "financialsDailySnapshots(first: 1000, orderBy: days, orderDirection: desc) {" +
    Object.keys(entitiesData.financialsDailySnapshots).join(",") +
    "}";
  const usageDailyQuery =
    "usageMetricsDailySnapshots(first: 1000, orderBy: days, orderDirection: desc) {" +
    Object.keys(entitiesData.usageMetricsDailySnapshots).join(",") +
    "}";
  const usageHourlyQuery =
    "usageMetricsHourlySnapshots(first: 1000, orderBy: hours, orderDirection: desc) {" +
    Object.keys(entitiesData.usageMetricsHourlySnapshots).join(",") +
    "}";
  const liquidityPoolDailyQuery =
    "liquidityPoolDailySnapshots(first: 1000, orderBy: days, orderDirection: desc, where: {pool: $poolId}) {" +
    Object.keys(entitiesData.liquidityPoolDailySnapshots).join(",") +
    "}";
  const liquidityPoolHourlyQuery =
    "liquidityPoolHourlySnapshots(first: 1000, orderBy: hours, orderDirection: desc, where: {pool: $poolId}) {" +
    Object.keys(entitiesData.liquidityPoolHourlySnapshots).join(",") +
    "}";
  const protocolFields = {
    id: "Bytes!",
    name: "String!",
    slug: "String!",
    schemaVersion: "String!",
    subgraphVersion: "String!",
    methodologyVersion: "String!",
    network: "Network!",
    type: "ProtocolType!",
    totalValueLockedUSD: "BigDecimal!",
    protocolControlledValueUSD: "BigDecimal",
    cumulativeVolumeUSD: "BigDecimal!",
    cumulativeSupplySideRevenueUSD: "BigDecimal!",
    cumulativeProtocolSideRevenueUSD: "BigDecimal!",
    cumulativeStakeSideRevenueUSD: "BigDecimal!",
    cumulativeTotalRevenueUSD: "BigDecimal!",
    cumulativeEntryPremiumUSD: "BigDecimal!",
    cumulativeExitPremiumUSD: "BigDecimal!",
    cumulativeTotalPremiumUSD: "BigDecimal!",
    cumulativeDepositPremiumUSD: "BigDecimal!",
    cumulativeWithdrawPremiumUSD: "BigDecimal!",
    cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
    cumulativeUniqueUsers: "Int!",
    cumulativeUniqueBorrowers: "Int!",
    cumulativeUniqueLiquidators: "Int!",
    cumulativeUniqueLiquidatees: "Int!",
    openInterestUSD: "BigDecimal!",
    longPositionCount: "Int!",
    shortPositionCount: "Int!",
    openPositionCount: "Int!",
    closedPositionCount: "Int!",
    cumulativePositionCount: "Int!",
    transactionCount: "Int!",
    depositCount: "Int!",
    withdrawCount: "Int!",
    borrowCount: "Int!",
    collateralInCount: "Int!",
    collateralOutCount: "Int!",
    totalPoolCount: "Int!",
  };
  const protocolQueryFields = Object.keys(protocolFields).map((x) => x + "\n");
  // Query pool(pool) entity and events entities
  const events = ["deposits", "withdraws", "collateralIns", "collateralOuts", "swaps", "liquidates"];
  const eventsFields = ["hash", "to", "from", "blockNumber"];
  const eventsQuery = events.map((event) => {
    let fields = eventsFields.join(", ");
    if (event === "deposits" || event === "withdraws" || event === "collateralIns" || event === "collateralOuts") {
      fields += ", amountUSD";
    } else if (event === "swaps") {
      fields += ", amountIn, amountInUSD, amountOut, amountOutUSD";
    } else if (event === "liquidates") {
      fields += ", liquidator{id}, liquidatee{id}, amount, amountUSD, profitUSD";
    }
    const baseStr = event + "(first: 1000, orderBy: timestamp, orderDirection: desc, where: {pool: $poolId}) { ";
    return baseStr + fields + " }";
  });
  const financialsQuery = `
    query Data {
      ${finanQuery}
    }`;
  const hourlyUsageQuery = `
    query Data {
      ${usageHourlyQuery}
    }`;
  const dailyUsageQuery = `
    query Data {
      ${usageDailyQuery}
    }`;
  const protocolTableQuery = `
    query Data($protocolId: String) {
      derivPerpProtocol(id: $protocolId) {
        ${protocolQueryFields}
      }
    }`;
  const poolsQuery = `
      query Data {
        liquidityPools(first: 100, orderBy: totalValueLockedUSD, orderDirection: desc) {
          id
          name
        }
      }
    `;
  const poolTimeseriesQuery = `
      query Data($poolId: String) {
        ${liquidityPoolDailyQuery}
        ${liquidityPoolHourlyQuery}
      }
      `;
  const poolData = {
    id: "Bytes!",
    name: "String",
    symbol: "String",
    inputTokens: "[Token!]!",
    outputToken: "Token",
    rewardTokens: "[RewardToken!]",
    fees: "[LiquidityPoolFee!]!",
    oracle: "String",
    totalValueLockedUSD: "BigDecimal!",
    cumulativeSupplySideRevenueUSD: "BigDecimal!",
    cumulativeProtocolSideRevenueUSD: "BigDecimal!",
    cumulativeTotalRevenueUSD: "BigDecimal!",
    cumulativeEntryPremiumUSD: "BigDecimal!",
    cumulativeExitPremiumUSD: "BigDecimal!",
    cumulativeTotalPremiumUSD: "BigDecimal!",
    cumulativeDepositPremiumUSD: "BigDecimal!",
    cumulativeWithdrawPremiumUSD: "BigDecimal!",
    cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
    cumulativeUniqueBorrowers: "Int!",
    cumulativeUniqueLiquidators: "Int!",
    cumulativeUniqueLiquidatees: "Int!",
    openInterestUSD: "BigDecimal!",
    longPositionCount: "Int!",
    shortPositionCount: "Int!",
    openPositionCount: "Int!",
    closedPositionCount: "Int!",
    cumulativePositionCount: "Int!",
    cumulativeVolumeUSD: "BigDecimal!",
    inputTokenBalances: "[BigInt!]!",
    inputTokenWeights: "[BigDecimal!]!",
    outputTokenSupply: "BigInt",
    outputTokenPriceUSD: "BigDecimal",
    stakedOutputTokenAmount: "BigInt",
    rewardTokenEmissionsAmount: "[BigInt!]",
    rewardTokenEmissionsUSD: "[BigDecimal!]",
  };
  let query = `
  query Data($poolId: String, $protocolId: String){
    _meta {
      block {
        number
      }
      deployment
    }
    protocols {
      id
      methodologyVersion
      network
      name
      type
      slug
      schemaVersion
      subgraphVersion
    }
    derivPerpProtocols {
      ${protocolQueryFields}
    }
    ${eventsQuery}
    liquidityPool(id: $poolId){
      id
      name
      symbol

      inputTokens{
        id
        decimals
        name
        symbol
      }
      outputToken {
        id
        decimals
        name
        symbol
      }
      rewardTokens {
        id
        type
        token {
          id
          decimals
          name
          symbol
        }
      }
      fees {
        id
        feePercentage
        feeType
      }
      oracle
      totalValueLockedUSD
      cumulativeSupplySideRevenueUSD
      cumulativeProtocolSideRevenueUSD
      cumulativeTotalRevenueUSD
      cumulativeEntryPremiumUSD
      cumulativeExitPremiumUSD
      cumulativeTotalPremiumUSD
      cumulativeDepositPremiumUSD
      cumulativeWithdrawPremiumUSD
      cumulativeTotalLiquidityPremiumUSD
      cumulativeUniqueBorrowers
      cumulativeUniqueLiquidators
      cumulativeUniqueLiquidatees
      openInterestUSD
      longPositionCount
      shortPositionCount
      openPositionCount
      closedPositionCount
      cumulativePositionCount
      cumulativeVolumeUSD
      inputTokenBalances
      inputTokenWeights
      outputTokenSupply
      outputTokenPriceUSD
      stakedOutputTokenAmount
      rewardTokenEmissionsAmount
      rewardTokenEmissionsUSD
    }
  }`;
  return {
    entities,
    entitiesData,
    query,
    protocolTableQuery,
    poolData,
    events,
    protocolFields,
    poolsQuery,
    financialsQuery,
    hourlyUsageQuery,
    dailyUsageQuery,
    poolTimeseriesQuery,
  };
};
exports.schema100 = schema100;
const schema110 = () => {
  const entities = [
    "financialsDailySnapshots",
    "usageMetricsDailySnapshots",
    "liquidityPoolDailySnapshots",
    "usageMetricsHourlySnapshots",
    "liquidityPoolHourlySnapshots",
  ];
  const entitiesData = {
    financialsDailySnapshots: {
      id: "Bytes!",
      days: "Int!",
      totalValueLockedUSD: "BigDecimal!",
      protocolControlledValueUSD: "BigDecimal",
      dailyVolumeUSD: "BigDecimal!",
      cumulativeVolumeUSD: "BigDecimal!",
      dailyInflowVolumeUSD: "BigDecimal!",
      cumulativeInflowVolumeUSD: "BigDecimal!",
      dailyClosedInflowVolumeUSD: "BigDecimal!",
      cumulativeClosedInflowVolumeUSD: "BigDecimal!",
      dailyOutflowVolumeUSD: "BigDecimal!",
      cumulativeOutflowVolumeUSD: "BigDecimal!",
      dailyOpenInterestUSD: "BigDecimal!",
      dailySupplySideRevenueUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      dailyProtocolSideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      dailyStakeSideRevenueUSD: "BigDecimal!",
      cumulativeStakeSideRevenueUSD: "BigDecimal!",
      dailyTotalRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      dailyEntryPremiumUSD: "BigDecimal!",
      cumulativeEntryPremiumUSD: "BigDecimal!",
      dailyExitPremiumUSD: "BigDecimal!",
      cumulativeExitPremiumUSD: "BigDecimal!",
      dailyTotalPremiumUSD: "BigDecimal!",
      cumulativeTotalPremiumUSD: "BigDecimal!",
      dailyDepositPremiumUSD: "BigDecimal!",
      cumulativeDepositPremiumUSD: "BigDecimal!",
      dailyWithdrawPremiumUSD: "BigDecimal!",
      cumulativeWithdrawPremiumUSD: "BigDecimal!",
      dailyTotalLiquidityPremiumUSD: "BigDecimal!",
      cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
    },
    usageMetricsDailySnapshots: {
      id: "Bytes!",
      days: "Int!",
      dailyActiveUsers: "Int!",
      cumulativeUniqueUsers: "Int!",
      dailyLongPositionCount: "Int!",
      longPositionCount: "Int!",
      dailyShortPositionCount: "Int!",
      shortPositionCount: "Int!",
      dailyOpenPositionCount: "Int!",
      openPositionCount: "Int!",
      dailyClosedPositionCount: "Int!",
      closedPositionCount: "Int!",
      dailyCumulativePositionCount: "Int!",
      cumulativePositionCount: "Int!",
      dailyTransactionCount: "Int!",
      dailyDepositCount: "Int!",
      dailyWithdrawCount: "Int!",
      dailyBorrowCount: "Int!",
      dailySwapCount: "Int!",
      dailyActiveDepositors: "Int!",
      cumulativeUniqueDepositors: "Int!",
      dailyActiveBorrowers: "Int!",
      cumulativeUniqueBorrowers: "Int!",
      dailyActiveLiquidators: "Int!",
      cumulativeUniqueLiquidators: "Int!",
      dailyActiveLiquidatees: "Int!",
      cumulativeUniqueLiquidatees: "Int!",
      dailyCollateralIn: "Int!",
      cumulativeCollateralIn: "Int!",
      dailyCollateralOut: "Int!",
      cumulativeCollateralOut: "Int!",
      totalPoolCount: "Int!",
    },
    liquidityPoolDailySnapshots: {
      id: "Bytes!",
      days: "Int!",
      totalValueLockedUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      dailySupplySideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      dailyProtocolSideRevenueUSD: "BigDecimal!",
      dailyTotalRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      dailyFundingrate: "[BigDecimal!]!",
      dailyOpenInterestUSD: "BigDecimal!",
      dailyEntryPremiumUSD: "BigDecimal!",
      cumulativeEntryPremiumUSD: "BigDecimal!",
      dailyExitPremiumUSD: "BigDecimal!",
      cumulativeExitPremiumUSD: "BigDecimal!",
      dailyTotalPremiumUSD: "BigDecimal!",
      cumulativeTotalPremiumUSD: "BigDecimal!",
      dailyDepositPremiumUSD: "BigDecimal!",
      cumulativeDepositPremiumUSD: "BigDecimal!",
      dailyWithdrawPremiumUSD: "BigDecimal!",
      cumulativeWithdrawPremiumUSD: "BigDecimal!",
      dailyTotalLiquidityPremiumUSD: "BigDecimal!",
      cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
      dailyActiveBorrowers: "Int!",
      cumulativeUniqueBorrowers: "Int!",
      dailyActiveLiquidators: "Int!",
      cumulativeUniqueLiquidators: "Int!",
      dailyActiveLiquidatees: "Int!",
      cumulativeUniqueLiquidatees: "Int!",
      dailyLongPositionCount: "Int!",
      longPositionCount: "Int!",
      dailyShortPositionCount: "Int!",
      shortPositionCount: "Int!",
      dailyOpenPositionCount: "Int!",
      openPositionCount: "Int!",
      dailyClosedPositionCount: "Int!",
      closedPositionCount: "Int!",
      dailyCumulativePositionCount: "Int!",
      cumulativePositionCount: "Int!",
      dailyVolumeUSD: "BigDecimal!",
      dailyVolumeByTokenAmount: "[BigInt!]!",
      dailyVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeVolumeUSD: "BigDecimal!",
      dailyInflowVolumeUSD: "BigDecimal!",
      dailyInflowVolumeByTokenAmount: "[BigInt!]!",
      dailyInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeInflowVolumeUSD: "BigDecimal!",
      dailyClosedInflowVolumeUSD: "BigDecimal!",
      dailyClosedInflowVolumeByTokenAmount: "[BigInt!]!",
      dailyClosedInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeClosedInflowVolumeUSD: "BigDecimal!",
      dailyOutflowVolumeUSD: "BigDecimal!",
      dailyOutflowVolumeByTokenAmount: "[BigInt!]!",
      dailyOutflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeOutflowVolumeUSD: "BigDecimal!",
      inputTokenBalances: "[BigInt!]!",
      inputTokenWeights: "[BigDecimal!]!",
      outputTokenSupply: "BigInt",
      outputTokenPriceUSD: "BigDecimal",
      stakedOutputTokenAmount: "BigInt",
      rewardTokenEmissionsAmount: "[BigInt!]",
      rewardTokenEmissionsUSD: "[BigDecimal!]",
    },
    usageMetricsHourlySnapshots: {
      id: "Bytes!",
      hours: "Int!",
      hourlyActiveUsers: "Int!",
      cumulativeUniqueUsers: "Int!",
      hourlyTransactionCount: "Int!",
      hourlyDepositCount: "Int!",
      hourlyWithdrawCount: "Int!",
      hourlySwapCount: "Int!",
    },
    liquidityPoolHourlySnapshots: {
      id: "Bytes!",
      hours: "Int!",
      totalValueLockedUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      hourlySupplySideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      hourlyProtocolSideRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      hourlyTotalRevenueUSD: "BigDecimal!",
      hourlyFundingrate: "[BigDecimal!]!",
      hourlyOpenInterestUSD: "BigDecimal!",
      hourlyEntryPremiumUSD: "BigDecimal!",
      cumulativeEntryPremiumUSD: "BigDecimal!",
      hourlyExitPremiumUSD: "BigDecimal!",
      cumulativeExitPremiumUSD: "BigDecimal!",
      hourlyTotalPremiumUSD: "BigDecimal!",
      cumulativeTotalPremiumUSD: "BigDecimal!",
      hourlyDepositPremiumUSD: "BigDecimal!",
      cumulativeDepositPremiumUSD: "BigDecimal!",
      hourlyWithdrawPremiumUSD: "BigDecimal!",
      cumulativeWithdrawPremiumUSD: "BigDecimal!",
      hourlyTotalLiquidityPremiumUSD: "BigDecimal!",
      cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
      hourlyVolumeUSD: "BigDecimal!",
      hourlyVolumeByTokenAmount: "[BigInt!]!",
      hourlyVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeVolumeUSD: "BigDecimal!",
      hourlyInflowVolumeUSD: "BigDecimal!",
      hourlyInflowVolumeByTokenAmount: "[BigInt!]!",
      hourlyInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeInflowVolumeUSD: "BigDecimal!",
      hourlyClosedInflowVolumeUSD: "BigDecimal!",
      hourlyClosedInflowVolumeByTokenAmount: "[BigInt!]!",
      hourlyClosedInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeClosedInflowVolumeUSD: "BigDecimal!",
      hourlyOutflowVolumeUSD: "BigDecimal!",
      hourlyOutflowVolumeByTokenAmount: "[BigInt!]!",
      hourlyOutflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeOutflowVolumeUSD: "BigDecimal!",
      inputTokenBalances: "[BigInt!]!",
      inputTokenWeights: "[BigDecimal!]!",
      outputTokenSupply: "BigInt",
      outputTokenPriceUSD: "BigDecimal",
      stakedOutputTokenAmount: "BigInt",
      rewardTokenEmissionsAmount: "[BigInt!]",
      rewardTokenEmissionsUSD: "[BigDecimal!]",
    },
  };
  const finanQuery =
    "financialsDailySnapshots(first: 1000, orderBy: days, orderDirection: desc) {" +
    Object.keys(entitiesData.financialsDailySnapshots).join(",") +
    "}";
  const usageDailyQuery =
    "usageMetricsDailySnapshots(first: 1000, orderBy: days, orderDirection: desc) {" +
    Object.keys(entitiesData.usageMetricsDailySnapshots).join(",") +
    "}";
  const usageHourlyQuery =
    "usageMetricsHourlySnapshots(first: 1000, orderBy: hours, orderDirection: desc) {" +
    Object.keys(entitiesData.usageMetricsHourlySnapshots).join(",") +
    "}";
  const liquidityPoolDailyQuery =
    "liquidityPoolDailySnapshots(first: 1000, orderBy: days, orderDirection: desc, where: {pool: $poolId}) {" +
    Object.keys(entitiesData.liquidityPoolDailySnapshots).join(",") +
    "}";
  const liquidityPoolHourlyQuery =
    "liquidityPoolHourlySnapshots(first: 1000, orderBy: hours, orderDirection: desc, where: {pool: $poolId}) {" +
    Object.keys(entitiesData.liquidityPoolHourlySnapshots).join(",") +
    "}";
  const protocolFields = {
    id: "Bytes!",
    name: "String!",
    slug: "String!",
    schemaVersion: "String!",
    subgraphVersion: "String!",
    methodologyVersion: "String!",
    network: "Network!",
    type: "ProtocolType!",
    totalValueLockedUSD: "BigDecimal!",
    protocolControlledValueUSD: "BigDecimal",
    cumulativeVolumeUSD: "BigDecimal!",
    cumulativeSupplySideRevenueUSD: "BigDecimal!",
    cumulativeProtocolSideRevenueUSD: "BigDecimal!",
    cumulativeStakeSideRevenueUSD: "BigDecimal!",
    cumulativeTotalRevenueUSD: "BigDecimal!",
    cumulativeEntryPremiumUSD: "BigDecimal!",
    cumulativeExitPremiumUSD: "BigDecimal!",
    cumulativeTotalPremiumUSD: "BigDecimal!",
    cumulativeDepositPremiumUSD: "BigDecimal!",
    cumulativeWithdrawPremiumUSD: "BigDecimal!",
    cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
    cumulativeUniqueUsers: "Int!",
    cumulativeUniqueBorrowers: "Int!",
    cumulativeUniqueLiquidators: "Int!",
    cumulativeUniqueLiquidatees: "Int!",
    openInterestUSD: "BigDecimal!",
    longPositionCount: "Int!",
    shortPositionCount: "Int!",
    openPositionCount: "Int!",
    closedPositionCount: "Int!",
    cumulativePositionCount: "Int!",
    transactionCount: "Int!",
    depositCount: "Int!",
    withdrawCount: "Int!",
    borrowCount: "Int!",
    collateralInCount: "Int!",
    collateralOutCount: "Int!",
    totalPoolCount: "Int!",
  };
  const protocolQueryFields = Object.keys(protocolFields).map((x) => x + "\n");
  // Query pool(pool) entity and events entities
  const events = ["deposits", "withdraws", "collateralIns", "collateralOuts", "swaps", "liquidates"];
  const eventsFields = ["hash", "to", "from", "blockNumber"];
  const eventsQuery = events.map((event) => {
    let fields = eventsFields.join(", ");
    if (event === "deposits" || event === "withdraws" || event === "collateralIns" || event === "collateralOuts") {
      fields += ", amountUSD";
    } else if (event === "swaps") {
      fields += ", amountIn, amountInUSD, amountOut, amountOutUSD";
    } else if (event === "liquidates") {
      fields += ", liquidator{id}, liquidatee{id}, amount, amountUSD, profitUSD";
    }
    const baseStr = event + "(first: 1000, orderBy: timestamp, orderDirection: desc, where: {pool: $poolId}) { ";
    return baseStr + fields + " }";
  });
  const financialsQuery = `
    query Data {
      ${finanQuery}
    }`;
  const hourlyUsageQuery = `
    query Data {
      ${usageHourlyQuery}
    }`;
  const dailyUsageQuery = `
    query Data {
      ${usageDailyQuery}
    }`;
  const protocolTableQuery = `
    query Data($protocolId: String) {
      derivPerpProtocol(id: $protocolId) {
        ${protocolQueryFields}
      }
    }`;
  const poolsQuery = `
      query Data {
        liquidityPools(first: 100, orderBy: totalValueLockedUSD, orderDirection: desc) {
          id
          name
        }
      }
    `;
  const poolTimeseriesQuery = `
      query Data($poolId: String) {
        ${liquidityPoolDailyQuery}
        ${liquidityPoolHourlyQuery}
      }
      `;
  const poolData = {
    id: "Bytes!",
    name: "String",
    symbol: "String",
    inputTokens: "[Token!]!",
    outputToken: "Token",
    rewardTokens: "[RewardToken!]",
    fees: "[LiquidityPoolFee!]!",
    oracle: "String",
    totalValueLockedUSD: "BigDecimal!",
    cumulativeSupplySideRevenueUSD: "BigDecimal!",
    cumulativeProtocolSideRevenueUSD: "BigDecimal!",
    cumulativeTotalRevenueUSD: "BigDecimal!",
    cumulativeEntryPremiumUSD: "BigDecimal!",
    cumulativeExitPremiumUSD: "BigDecimal!",
    cumulativeTotalPremiumUSD: "BigDecimal!",
    cumulativeDepositPremiumUSD: "BigDecimal!",
    cumulativeWithdrawPremiumUSD: "BigDecimal!",
    cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
    cumulativeUniqueBorrowers: "Int!",
    cumulativeUniqueLiquidators: "Int!",
    cumulativeUniqueLiquidatees: "Int!",
    openInterestUSD: "BigDecimal!",
    longPositionCount: "Int!",
    shortPositionCount: "Int!",
    openPositionCount: "Int!",
    closedPositionCount: "Int!",
    cumulativePositionCount: "Int!",
    cumulativeVolumeUSD: "BigDecimal!",
    inputTokenBalances: "[BigInt!]!",
    inputTokenWeights: "[BigDecimal!]!",
    outputTokenSupply: "BigInt",
    outputTokenPriceUSD: "BigDecimal",
    stakedOutputTokenAmount: "BigInt",
    rewardTokenEmissionsAmount: "[BigInt!]",
    rewardTokenEmissionsUSD: "[BigDecimal!]",
  };
  let query = `
  query Data($poolId: String, $protocolId: String){
    _meta {
      block {
        number
      }
      deployment
    }
    protocols {
      id
      methodologyVersion
      network
      name
      type
      slug
      schemaVersion
      subgraphVersion
    }
    derivPerpProtocols {
      ${protocolQueryFields}
    }
    ${eventsQuery}
    liquidityPool(id: $poolId){
      id
      name
      symbol

      inputTokens{
        id
        decimals
        name
        symbol
      }
      outputToken {
        id
        decimals
        name
        symbol
      }
      rewardTokens {
        id
        type
        token {
          id
          decimals
          name
          symbol
        }
      }
      fees {
        id
        feePercentage
        feeType
      }
      oracle
      totalValueLockedUSD
      cumulativeSupplySideRevenueUSD
      cumulativeProtocolSideRevenueUSD
      cumulativeTotalRevenueUSD
      cumulativeEntryPremiumUSD
      cumulativeExitPremiumUSD
      cumulativeTotalPremiumUSD
      cumulativeDepositPremiumUSD
      cumulativeWithdrawPremiumUSD
      cumulativeTotalLiquidityPremiumUSD
      cumulativeUniqueBorrowers
      cumulativeUniqueLiquidators
      cumulativeUniqueLiquidatees
      openInterestUSD
      longPositionCount
      shortPositionCount
      openPositionCount
      closedPositionCount
      cumulativePositionCount
      cumulativeVolumeUSD
      inputTokenBalances
      inputTokenWeights
      outputTokenSupply
      outputTokenPriceUSD
      stakedOutputTokenAmount
      rewardTokenEmissionsAmount
      rewardTokenEmissionsUSD
    }
  }`;
  return {
    entities,
    entitiesData,
    query,
    protocolTableQuery,
    poolData,
    events,
    protocolFields,
    poolsQuery,
    financialsQuery,
    hourlyUsageQuery,
    dailyUsageQuery,
    poolTimeseriesQuery,
  };
};
exports.schema110 = schema110;
const schema120 = () => {
  const entities = [
    "financialsDailySnapshots",
    "usageMetricsDailySnapshots",
    "liquidityPoolDailySnapshots",
    "usageMetricsHourlySnapshots",
    "liquidityPoolHourlySnapshots",
  ];
  const entitiesData = {
    financialsDailySnapshots: {
      id: "Bytes!",
      days: "Int!",
      totalValueLockedUSD: "BigDecimal!",
      dailyVolumeUSD: "BigDecimal!",
      cumulativeVolumeUSD: "BigDecimal!",
      dailyInflowVolumeUSD: "BigDecimal!",
      cumulativeInflowVolumeUSD: "BigDecimal!",
      dailyClosedInflowVolumeUSD: "BigDecimal!",
      cumulativeClosedInflowVolumeUSD: "BigDecimal!",
      dailyOutflowVolumeUSD: "BigDecimal!",
      cumulativeOutflowVolumeUSD: "BigDecimal!",
      dailyLongOpenInterestUSD: "BigDecimal!",
      dailyShortOpenInterestUSD: "BigDecimal!",
      dailyTotalOpenInterestUSD: "BigDecimal!",
      dailySupplySideRevenueUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      dailyProtocolSideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      dailyStakeSideRevenueUSD: "BigDecimal!",
      cumulativeStakeSideRevenueUSD: "BigDecimal!",
      dailyTotalRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      dailyEntryPremiumUSD: "BigDecimal!",
      cumulativeEntryPremiumUSD: "BigDecimal!",
      dailyExitPremiumUSD: "BigDecimal!",
      cumulativeExitPremiumUSD: "BigDecimal!",
      dailyTotalPremiumUSD: "BigDecimal!",
      cumulativeTotalPremiumUSD: "BigDecimal!",
      dailyDepositPremiumUSD: "BigDecimal!",
      cumulativeDepositPremiumUSD: "BigDecimal!",
      dailyWithdrawPremiumUSD: "BigDecimal!",
      cumulativeWithdrawPremiumUSD: "BigDecimal!",
      dailyTotalLiquidityPremiumUSD: "BigDecimal!",
      cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
    },
    usageMetricsDailySnapshots: {
      id: "Bytes!",
      days: "Int!",
      dailyActiveUsers: "Int!",
      cumulativeUniqueUsers: "Int!",
      dailyLongPositionCount: "Int!",
      longPositionCount: "Int!",
      dailyShortPositionCount: "Int!",
      shortPositionCount: "Int!",
      dailyOpenPositionCount: "Int!",
      openPositionCount: "Int!",
      dailyClosedPositionCount: "Int!",
      closedPositionCount: "Int!",
      dailyCumulativePositionCount: "Int!",
      cumulativePositionCount: "Int!",
      dailyTransactionCount: "Int!",
      dailyDepositCount: "Int!",
      dailyWithdrawCount: "Int!",
      dailyBorrowCount: "Int!",
      dailySwapCount: "Int!",
      dailyActiveDepositors: "Int!",
      cumulativeUniqueDepositors: "Int!",
      dailyActiveBorrowers: "Int!",
      cumulativeUniqueBorrowers: "Int!",
      dailyActiveLiquidators: "Int!",
      cumulativeUniqueLiquidators: "Int!",
      dailyActiveLiquidatees: "Int!",
      cumulativeUniqueLiquidatees: "Int!",
      dailyCollateralIn: "Int!",
      cumulativeCollateralIn: "Int!",
      dailyCollateralOut: "Int!",
      cumulativeCollateralOut: "Int!",
      totalPoolCount: "Int!",
    },
    liquidityPoolDailySnapshots: {
      id: "Bytes!",
      days: "Int!",
      totalValueLockedUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      dailySupplySideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      dailyProtocolSideRevenueUSD: "BigDecimal!",
      dailyTotalRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      dailyFundingrate: "[BigDecimal!]!",
      dailyLongOpenInterestUSD: "BigDecimal!",
      dailyShortOpenInterestUSD: "BigDecimal!",
      dailyTotalOpenInterestUSD: "BigDecimal!",
      dailyEntryPremiumUSD: "BigDecimal!",
      cumulativeEntryPremiumUSD: "BigDecimal!",
      dailyExitPremiumUSD: "BigDecimal!",
      cumulativeExitPremiumUSD: "BigDecimal!",
      dailyTotalPremiumUSD: "BigDecimal!",
      cumulativeTotalPremiumUSD: "BigDecimal!",
      dailyDepositPremiumUSD: "BigDecimal!",
      cumulativeDepositPremiumUSD: "BigDecimal!",
      dailyWithdrawPremiumUSD: "BigDecimal!",
      cumulativeWithdrawPremiumUSD: "BigDecimal!",
      dailyTotalLiquidityPremiumUSD: "BigDecimal!",
      cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
      dailyActiveUsers: "Int!",
      dailyActiveDepositors: "Int!",
      dailyActiveBorrowers: "Int!",
      cumulativeUniqueBorrowers: "Int!",
      dailyActiveLiquidators: "Int!",
      cumulativeUniqueLiquidators: "Int!",
      dailyActiveLiquidatees: "Int!",
      cumulativeUniqueLiquidatees: "Int!",
      dailyLongPositionCount: "Int!",
      longPositionCount: "Int!",
      dailyShortPositionCount: "Int!",
      shortPositionCount: "Int!",
      dailyOpenPositionCount: "Int!",
      openPositionCount: "Int!",
      dailyClosedPositionCount: "Int!",
      closedPositionCount: "Int!",
      dailyCumulativePositionCount: "Int!",
      cumulativePositionCount: "Int!",
      dailyVolumeUSD: "BigDecimal!",
      dailyVolumeByTokenAmount: "[BigInt!]!",
      dailyVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeVolumeUSD: "BigDecimal!",
      dailyInflowVolumeUSD: "BigDecimal!",
      dailyInflowVolumeByTokenAmount: "[BigInt!]!",
      dailyInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeInflowVolumeUSD: "BigDecimal!",
      dailyClosedInflowVolumeUSD: "BigDecimal!",
      dailyClosedInflowVolumeByTokenAmount: "[BigInt!]!",
      dailyClosedInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeClosedInflowVolumeUSD: "BigDecimal!",
      dailyOutflowVolumeUSD: "BigDecimal!",
      dailyOutflowVolumeByTokenAmount: "[BigInt!]!",
      dailyOutflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeOutflowVolumeUSD: "BigDecimal!",
      inputTokenBalances: "[BigInt!]!",
      inputTokenWeights: "[BigDecimal!]!",
      outputTokenSupply: "BigInt",
      outputTokenPriceUSD: "BigDecimal",
      stakedOutputTokenAmount: "BigInt",
      rewardTokenEmissionsAmount: "[BigInt!]",
      rewardTokenEmissionsUSD: "[BigDecimal!]",
    },
    usageMetricsHourlySnapshots: {
      id: "Bytes!",
      hours: "Int!",
      protocol: "DerivPerpProtocol!",
      hourlyActiveUsers: "Int!",
      cumulativeUniqueUsers: "Int!",
      hourlyTransactionCount: "Int!",
      hourlyDepositCount: "Int!",
      hourlyWithdrawCount: "Int!",
      hourlyBorrowCount: "Int!",
      hourlySwapCount: "Int!",
    },
    liquidityPoolHourlySnapshots: {
      id: "Bytes!",
      hours: "Int!",
      totalValueLockedUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      hourlySupplySideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      hourlyProtocolSideRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      hourlyTotalRevenueUSD: "BigDecimal!",
      hourlyFundingrate: "[BigDecimal!]!",
      hourlyLongOpenInterestUSD: "BigDecimal!",
      hourlyShortOpenInterestUSD: "BigDecimal!",
      hourlyTotalOpenInterestUSD: "BigDecimal!",
      hourlyEntryPremiumUSD: "BigDecimal!",
      cumulativeEntryPremiumUSD: "BigDecimal!",
      hourlyExitPremiumUSD: "BigDecimal!",
      cumulativeExitPremiumUSD: "BigDecimal!",
      hourlyTotalPremiumUSD: "BigDecimal!",
      cumulativeTotalPremiumUSD: "BigDecimal!",
      hourlyDepositPremiumUSD: "BigDecimal!",
      cumulativeDepositPremiumUSD: "BigDecimal!",
      hourlyWithdrawPremiumUSD: "BigDecimal!",
      cumulativeWithdrawPremiumUSD: "BigDecimal!",
      hourlyTotalLiquidityPremiumUSD: "BigDecimal!",
      cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
      hourlyVolumeUSD: "BigDecimal!",
      hourlyVolumeByTokenAmount: "[BigInt!]!",
      hourlyVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeVolumeUSD: "BigDecimal!",
      hourlyInflowVolumeUSD: "BigDecimal!",
      hourlyInflowVolumeByTokenAmount: "[BigInt!]!",
      hourlyInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeInflowVolumeUSD: "BigDecimal!",
      hourlyClosedInflowVolumeUSD: "BigDecimal!",
      hourlyClosedInflowVolumeByTokenAmount: "[BigInt!]!",
      hourlyClosedInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeClosedInflowVolumeUSD: "BigDecimal!",
      hourlyOutflowVolumeUSD: "BigDecimal!",
      hourlyOutflowVolumeByTokenAmount: "[BigInt!]!",
      hourlyOutflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeOutflowVolumeUSD: "BigDecimal!",
      inputTokenBalances: "[BigInt!]!",
      inputTokenWeights: "[BigDecimal!]!",
      outputTokenSupply: "BigInt",
      outputTokenPriceUSD: "BigDecimal",
      stakedOutputTokenAmount: "BigInt",
      rewardTokenEmissionsAmount: "[BigInt!]",
      rewardTokenEmissionsUSD: "[BigDecimal!]",
    },
  };
  const finanQuery =
    "financialsDailySnapshots(first: 1000, orderBy: days, orderDirection: desc) {" +
    Object.keys(entitiesData.financialsDailySnapshots).join(",") +
    "}";
  const usageDailyQuery =
    "usageMetricsDailySnapshots(first: 1000, orderBy: days, orderDirection: desc) {" +
    Object.keys(entitiesData.usageMetricsDailySnapshots).join(",") +
    "}";
  const usageHourlyQuery =
    "usageMetricsHourlySnapshots(first: 1000, orderBy: hours, orderDirection: desc) {" +
    Object.keys(entitiesData.usageMetricsHourlySnapshots).join(",") +
    "}";
  const liquidityPoolDailyQuery =
    "liquidityPoolDailySnapshots(first: 1000, orderBy: days, orderDirection: desc, where: {pool: $poolId}) {" +
    Object.keys(entitiesData.liquidityPoolDailySnapshots).join(",") +
    "}";
  const liquidityPoolHourlyQuery =
    "liquidityPoolHourlySnapshots(first: 1000, orderBy: hours, orderDirection: desc, where: {pool: $poolId}) {" +
    Object.keys(entitiesData.liquidityPoolHourlySnapshots).join(",") +
    "}";
  const protocolFields = {
    id: "Bytes!",
    name: "String!",
    slug: "String!",
    schemaVersion: "String!",
    subgraphVersion: "String!",
    methodologyVersion: "String!",
    network: "Network!",
    type: "ProtocolType!",
    totalValueLockedUSD: "BigDecimal!",
    cumulativeVolumeUSD: "BigDecimal!",
    cumulativeInflowVolumeUSD: "BigDecimal!",
    cumulativeClosedInflowVolumeUSD: "BigDecimal!",
    cumulativeOutflowVolumeUSD: "BigDecimal!",
    cumulativeSupplySideRevenueUSD: "BigDecimal!",
    cumulativeProtocolSideRevenueUSD: "BigDecimal!",
    cumulativeStakeSideRevenueUSD: "BigDecimal!",
    cumulativeTotalRevenueUSD: "BigDecimal!",
    cumulativeEntryPremiumUSD: "BigDecimal!",
    cumulativeExitPremiumUSD: "BigDecimal!",
    cumulativeTotalPremiumUSD: "BigDecimal!",
    cumulativeDepositPremiumUSD: "BigDecimal!",
    cumulativeWithdrawPremiumUSD: "BigDecimal!",
    cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
    cumulativeUniqueUsers: "Int!",
    cumulativeUniqueDepositors: "Int!",
    cumulativeUniqueBorrowers: "Int!",
    cumulativeUniqueLiquidators: "Int!",
    cumulativeUniqueLiquidatees: "Int!",
    longOpenInterestUSD: "BigDecimal!",
    shortOpenInterestUSD: "BigDecimal!",
    totalOpenInterestUSD: "BigDecimal!",
    longPositionCount: "Int!",
    shortPositionCount: "Int!",
    openPositionCount: "Int!",
    closedPositionCount: "Int!",
    cumulativePositionCount: "Int!",
    transactionCount: "Int!",
    depositCount: "Int!",
    withdrawCount: "Int!",
    borrowCount: "Int!",
    swapCount: "Int!",
    collateralInCount: "Int!",
    collateralOutCount: "Int!",
    totalPoolCount: "Int!",
  };
  const protocolQueryFields = Object.keys(protocolFields).map((x) => x + "\n");
  // Query pool(pool) entity and events entities
  const events = ["deposits", "withdraws", "collateralIns", "collateralOuts", "swaps", "liquidates"];
  const eventsFields = ["hash", "to", "from", "blockNumber"];
  const eventsQuery = events.map((event) => {
    let fields = eventsFields.join(", ");
    if (event === "deposits" || event === "withdraws" || event === "collateralIns" || event === "collateralOuts") {
      fields += ", amountUSD";
    } else if (event === "swaps") {
      fields += ", amountIn, amountInUSD, amountOut, amountOutUSD";
    } else if (event === "liquidates") {
      fields += ", liquidator{id}, liquidatee{id}, amount, amountUSD, profitUSD";
    }
    const baseStr = event + "(first: 1000, orderBy: timestamp, orderDirection: desc, where: {pool: $poolId}) { ";
    return baseStr + fields + " }";
  });
  const financialsQuery = `
    query Data {
      ${finanQuery}
    }`;
  const hourlyUsageQuery = `
    query Data {
      ${usageHourlyQuery}
    }`;
  const dailyUsageQuery = `
    query Data {
      ${usageDailyQuery}
    }`;
  const protocolTableQuery = `
    query Data($protocolId: String) {
      derivPerpProtocol(id: $protocolId) {
        ${protocolQueryFields}
      }
    }`;
  const poolsQuery = `
      query Data {
        liquidityPools(first: 100, orderBy: totalValueLockedUSD, orderDirection: desc) {
          id
          name
        }
      }
    `;
  const poolTimeseriesQuery = `
      query Data($poolId: String) {
        ${liquidityPoolDailyQuery}
        ${liquidityPoolHourlyQuery}
      }
      `;
  const poolData = {
    id: "Bytes!",
    name: "String",
    symbol: "String",
    inputTokens: "[Token!]!",
    outputToken: "Token",
    rewardTokens: "[RewardToken!]",
    fees: "[LiquidityPoolFee!]!",
    oracle: "String",
    totalValueLockedUSD: "BigDecimal!",
    cumulativeSupplySideRevenueUSD: "BigDecimal!",
    cumulativeProtocolSideRevenueUSD: "BigDecimal!",
    cumulativeTotalRevenueUSD: "BigDecimal!",
    cumulativeEntryPremiumUSD: "BigDecimal!",
    cumulativeExitPremiumUSD: "BigDecimal!",
    cumulativeTotalPremiumUSD: "BigDecimal!",
    cumulativeDepositPremiumUSD: "BigDecimal!",
    cumulativeWithdrawPremiumUSD: "BigDecimal!",
    cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
    cumulativeUniqueBorrowers: "Int!",
    cumulativeUniqueLiquidators: "Int!",
    cumulativeUniqueLiquidatees: "Int!",
    openInterestUSD: "BigDecimal!",
    longPositionCount: "Int!",
    shortPositionCount: "Int!",
    openPositionCount: "Int!",
    closedPositionCount: "Int!",
    cumulativePositionCount: "Int!",
    cumulativeVolumeUSD: "BigDecimal!",
    inputTokenBalances: "[BigInt!]!",
    inputTokenWeights: "[BigDecimal!]!",
    outputTokenSupply: "BigInt",
    outputTokenPriceUSD: "BigDecimal",
    stakedOutputTokenAmount: "BigInt",
    rewardTokenEmissionsAmount: "[BigInt!]",
    rewardTokenEmissionsUSD: "[BigDecimal!]",
  };
  let query = `
  query Data($poolId: String, $protocolId: String){
    _meta {
      block {
        number
      }
      deployment
    }
    protocols {
      id
      methodologyVersion
      network
      name
      type
      slug
      schemaVersion
      subgraphVersion
    }
    derivPerpProtocols {
      ${protocolQueryFields}
    }
    ${eventsQuery}
    liquidityPool(id: $poolId){
      id
      name
      symbol

      inputTokens{
        id
        decimals
        name
        symbol
      }
      outputToken {
        id
        decimals
        name
        symbol
      }
      rewardTokens {
        id
        type
        token {
          id
          decimals
          name
          symbol
        }
      }
      fees {
        id
        feePercentage
        feeType
      }
      oracle
      totalValueLockedUSD
      fundingrate
      cumulativeSupplySideRevenueUSD
      cumulativeProtocolSideRevenueUSD
      cumulativeTotalRevenueUSD
      cumulativeEntryPremiumUSD
      cumulativeExitPremiumUSD
      cumulativeTotalPremiumUSD
      cumulativeDepositPremiumUSD
      cumulativeWithdrawPremiumUSD
      cumulativeTotalLiquidityPremiumUSD
      cumulativeUniqueUsers
      cumulativeUniqueDepositors
      cumulativeUniqueBorrowers
      cumulativeUniqueLiquidators
      cumulativeUniqueLiquidatees
      longOpenInterestUSD
      shortOpenInterestUSD
      totalOpenInterestUSD
      longPositionCount
      shortPositionCount
      openPositionCount
      closedPositionCount
      cumulativePositionCount
      cumulativeVolumeUSD
      cumulativeInflowVolumeUSD
      cumulativeClosedInflowVolumeUSD
      cumulativeOutflowVolumeUSD
      inputTokenBalances
      inputTokenWeights
      outputTokenSupply
      outputTokenPriceUSD
      stakedOutputTokenAmount
      rewardTokenEmissionsAmount
      rewardTokenEmissionsUSD
    }
  }`;
  return {
    entities,
    entitiesData,
    query,
    protocolTableQuery,
    poolData,
    events,
    protocolFields,
    poolsQuery,
    financialsQuery,
    hourlyUsageQuery,
    dailyUsageQuery,
    poolTimeseriesQuery,
  };
};
exports.schema120 = schema120;
const schema130 = () => {
  const entities = [
    "financialsDailySnapshots",
    "usageMetricsDailySnapshots",
    "liquidityPoolDailySnapshots",
    "usageMetricsHourlySnapshots",
    "liquidityPoolHourlySnapshots",
  ];
  const entitiesData = {
    financialsDailySnapshots: {
      id: "Bytes!",
      days: "Int!",
      totalValueLockedUSD: "BigDecimal!",
      dailyVolumeUSD: "BigDecimal!",
      cumulativeVolumeUSD: "BigDecimal!",
      dailyInflowVolumeUSD: "BigDecimal!",
      cumulativeInflowVolumeUSD: "BigDecimal!",
      dailyClosedInflowVolumeUSD: "BigDecimal!",
      cumulativeClosedInflowVolumeUSD: "BigDecimal!",
      dailyOutflowVolumeUSD: "BigDecimal!",
      cumulativeOutflowVolumeUSD: "BigDecimal!",
      dailyLongOpenInterestUSD: "BigDecimal!",
      dailyShortOpenInterestUSD: "BigDecimal!",
      dailyTotalOpenInterestUSD: "BigDecimal!",
      dailySupplySideRevenueUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      dailyProtocolSideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      dailyStakeSideRevenueUSD: "BigDecimal!",
      cumulativeStakeSideRevenueUSD: "BigDecimal!",
      dailyTotalRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      dailyEntryPremiumUSD: "BigDecimal!",
      cumulativeEntryPremiumUSD: "BigDecimal!",
      dailyExitPremiumUSD: "BigDecimal!",
      cumulativeExitPremiumUSD: "BigDecimal!",
      dailyTotalPremiumUSD: "BigDecimal!",
      cumulativeTotalPremiumUSD: "BigDecimal!",
      dailyDepositPremiumUSD: "BigDecimal!",
      cumulativeDepositPremiumUSD: "BigDecimal!",
      dailyWithdrawPremiumUSD: "BigDecimal!",
      cumulativeWithdrawPremiumUSD: "BigDecimal!",
      dailyTotalLiquidityPremiumUSD: "BigDecimal!",
      cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
    },
    usageMetricsDailySnapshots: {
      id: "Bytes!",
      days: "Int!",
      dailyActiveUsers: "Int!",
      cumulativeUniqueUsers: "Int!",
      dailyLongPositionCount: "Int!",
      longPositionCount: "Int!",
      dailyShortPositionCount: "Int!",
      shortPositionCount: "Int!",
      dailyOpenPositionCount: "Int!",
      openPositionCount: "Int!",
      dailyClosedPositionCount: "Int!",
      closedPositionCount: "Int!",
      dailyCumulativePositionCount: "Int!",
      cumulativePositionCount: "Int!",
      dailyTransactionCount: "Int!",
      dailyDepositCount: "Int!",
      dailyWithdrawCount: "Int!",
      dailyBorrowCount: "Int!",
      dailySwapCount: "Int!",
      dailyActiveDepositors: "Int!",
      cumulativeUniqueDepositors: "Int!",
      dailyActiveBorrowers: "Int!",
      cumulativeUniqueBorrowers: "Int!",
      dailyActiveLiquidators: "Int!",
      cumulativeUniqueLiquidators: "Int!",
      dailyActiveLiquidatees: "Int!",
      cumulativeUniqueLiquidatees: "Int!",
      dailyCollateralIn: "Int!",
      cumulativeCollateralIn: "Int!",
      dailyCollateralOut: "Int!",
      cumulativeCollateralOut: "Int!",
      totalPoolCount: "Int!",
    },
    liquidityPoolDailySnapshots: {
      id: "Bytes!",
      days: "Int!",
      totalValueLockedUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      dailySupplySideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      dailyProtocolSideRevenueUSD: "BigDecimal!",
      dailyTotalRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      dailyFundingrate: "[BigDecimal!]!",
      dailyLongOpenInterestUSD: "BigDecimal!",
      dailyShortOpenInterestUSD: "BigDecimal!",
      dailyTotalOpenInterestUSD: "BigDecimal!",
      dailyEntryPremiumUSD: "BigDecimal!",
      cumulativeEntryPremiumUSD: "BigDecimal!",
      dailyExitPremiumUSD: "BigDecimal!",
      cumulativeExitPremiumUSD: "BigDecimal!",
      dailyTotalPremiumUSD: "BigDecimal!",
      cumulativeTotalPremiumUSD: "BigDecimal!",
      dailyDepositPremiumUSD: "BigDecimal!",
      cumulativeDepositPremiumUSD: "BigDecimal!",
      dailyWithdrawPremiumUSD: "BigDecimal!",
      cumulativeWithdrawPremiumUSD: "BigDecimal!",
      dailyTotalLiquidityPremiumUSD: "BigDecimal!",
      cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
      dailyActiveUsers: "Int!",
      cumulativeUniqueUsers: "Int!",
      dailyActiveDepositors: "Int!",
      dailyActiveBorrowers: "Int!",
      cumulativeUniqueBorrowers: "Int!",
      dailyActiveLiquidators: "Int!",
      cumulativeUniqueLiquidators: "Int!",
      dailyActiveLiquidatees: "Int!",
      cumulativeUniqueLiquidatees: "Int!",
      dailyLongPositionCount: "Int!",
      longPositionCount: "Int!",
      dailyShortPositionCount: "Int!",
      shortPositionCount: "Int!",
      dailyOpenPositionCount: "Int!",
      openPositionCount: "Int!",
      dailyClosedPositionCount: "Int!",
      closedPositionCount: "Int!",
      dailyCumulativePositionCount: "Int!",
      cumulativePositionCount: "Int!",
      dailyVolumeUSD: "BigDecimal!",
      dailyVolumeByTokenAmount: "[BigInt!]!",
      dailyVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeVolumeUSD: "BigDecimal!",
      dailyInflowVolumeUSD: "BigDecimal!",
      dailyInflowVolumeByTokenAmount: "[BigInt!]!",
      dailyInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeInflowVolumeUSD: "BigDecimal!",
      dailyClosedInflowVolumeUSD: "BigDecimal!",
      dailyClosedInflowVolumeByTokenAmount: "[BigInt!]!",
      dailyClosedInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeClosedInflowVolumeUSD: "BigDecimal!",
      dailyOutflowVolumeUSD: "BigDecimal!",
      dailyOutflowVolumeByTokenAmount: "[BigInt!]!",
      dailyOutflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeOutflowVolumeUSD: "BigDecimal!",
      inputTokenBalances: "[BigInt!]!",
      inputTokenWeights: "[BigDecimal!]!",
      outputTokenSupply: "BigInt",
      outputTokenPriceUSD: "BigDecimal",
      stakedOutputTokenAmount: "BigInt",
      rewardTokenEmissionsAmount: "[BigInt!]",
      rewardTokenEmissionsUSD: "[BigDecimal!]",
    },
    usageMetricsHourlySnapshots: {
      id: "Bytes!",
      hours: "Int!",
      protocol: "DerivPerpProtocol!",
      hourlyActiveUsers: "Int!",
      cumulativeUniqueUsers: "Int!",
      hourlyTransactionCount: "Int!",
      hourlyDepositCount: "Int!",
      hourlyWithdrawCount: "Int!",
      hourlyBorrowCount: "Int!",
      hourlySwapCount: "Int!",
    },
    liquidityPoolHourlySnapshots: {
      id: "Bytes!",
      hours: "Int!",
      totalValueLockedUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      hourlySupplySideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      hourlyProtocolSideRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      hourlyTotalRevenueUSD: "BigDecimal!",
      hourlyFundingrate: "[BigDecimal!]!",
      hourlyLongOpenInterestUSD: "BigDecimal!",
      hourlyShortOpenInterestUSD: "BigDecimal!",
      hourlyTotalOpenInterestUSD: "BigDecimal!",
      hourlyEntryPremiumUSD: "BigDecimal!",
      cumulativeEntryPremiumUSD: "BigDecimal!",
      hourlyExitPremiumUSD: "BigDecimal!",
      cumulativeExitPremiumUSD: "BigDecimal!",
      hourlyTotalPremiumUSD: "BigDecimal!",
      cumulativeTotalPremiumUSD: "BigDecimal!",
      hourlyDepositPremiumUSD: "BigDecimal!",
      cumulativeDepositPremiumUSD: "BigDecimal!",
      hourlyWithdrawPremiumUSD: "BigDecimal!",
      cumulativeWithdrawPremiumUSD: "BigDecimal!",
      hourlyTotalLiquidityPremiumUSD: "BigDecimal!",
      cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
      hourlyVolumeUSD: "BigDecimal!",
      hourlyVolumeByTokenAmount: "[BigInt!]!",
      hourlyVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeVolumeUSD: "BigDecimal!",
      hourlyInflowVolumeUSD: "BigDecimal!",
      hourlyInflowVolumeByTokenAmount: "[BigInt!]!",
      hourlyInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeInflowVolumeUSD: "BigDecimal!",
      hourlyClosedInflowVolumeUSD: "BigDecimal!",
      hourlyClosedInflowVolumeByTokenAmount: "[BigInt!]!",
      hourlyClosedInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeClosedInflowVolumeUSD: "BigDecimal!",
      hourlyOutflowVolumeUSD: "BigDecimal!",
      hourlyOutflowVolumeByTokenAmount: "[BigInt!]!",
      hourlyOutflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeOutflowVolumeUSD: "BigDecimal!",
      inputTokenBalances: "[BigInt!]!",
      inputTokenWeights: "[BigDecimal!]!",
      outputTokenSupply: "BigInt",
      outputTokenPriceUSD: "BigDecimal",
      stakedOutputTokenAmount: "BigInt",
      rewardTokenEmissionsAmount: "[BigInt!]",
      rewardTokenEmissionsUSD: "[BigDecimal!]",
    },
  };
  const finanQuery =
    "financialsDailySnapshots(first: 1000, orderBy: days, orderDirection: desc) {" +
    Object.keys(entitiesData.financialsDailySnapshots).join(",") +
    "}";
  const usageDailyQuery =
    "usageMetricsDailySnapshots(first: 1000, orderBy: days, orderDirection: desc) {" +
    Object.keys(entitiesData.usageMetricsDailySnapshots).join(",") +
    "}";
  const usageHourlyQuery =
    "usageMetricsHourlySnapshots(first: 1000, orderBy: hours, orderDirection: desc) {" +
    Object.keys(entitiesData.usageMetricsHourlySnapshots).join(",") +
    "}";
  const liquidityPoolDailyQuery =
    "liquidityPoolDailySnapshots(first: 1000, orderBy: days, orderDirection: desc, where: {pool: $poolId}) {" +
    Object.keys(entitiesData.liquidityPoolDailySnapshots).join(",") +
    "}";
  const liquidityPoolHourlyQuery =
    "liquidityPoolHourlySnapshots(first: 1000, orderBy: hours, orderDirection: desc, where: {pool: $poolId}) {" +
    Object.keys(entitiesData.liquidityPoolHourlySnapshots).join(",") +
    "}";
  const protocolFields = {
    id: "Bytes!",
    name: "String!",
    slug: "String!",
    schemaVersion: "String!",
    subgraphVersion: "String!",
    methodologyVersion: "String!",
    network: "Network!",
    type: "ProtocolType!",
    totalValueLockedUSD: "BigDecimal!",
    cumulativeVolumeUSD: "BigDecimal!",
    cumulativeInflowVolumeUSD: "BigDecimal!",
    cumulativeClosedInflowVolumeUSD: "BigDecimal!",
    cumulativeOutflowVolumeUSD: "BigDecimal!",
    cumulativeSupplySideRevenueUSD: "BigDecimal!",
    cumulativeProtocolSideRevenueUSD: "BigDecimal!",
    cumulativeStakeSideRevenueUSD: "BigDecimal!",
    cumulativeTotalRevenueUSD: "BigDecimal!",
    cumulativeEntryPremiumUSD: "BigDecimal!",
    cumulativeExitPremiumUSD: "BigDecimal!",
    cumulativeTotalPremiumUSD: "BigDecimal!",
    cumulativeDepositPremiumUSD: "BigDecimal!",
    cumulativeWithdrawPremiumUSD: "BigDecimal!",
    cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
    cumulativeUniqueUsers: "Int!",
    cumulativeUniqueDepositors: "Int!",
    cumulativeUniqueBorrowers: "Int!",
    cumulativeUniqueLiquidators: "Int!",
    cumulativeUniqueLiquidatees: "Int!",
    longOpenInterestUSD: "BigDecimal!",
    shortOpenInterestUSD: "BigDecimal!",
    totalOpenInterestUSD: "BigDecimal!",
    longPositionCount: "Int!",
    shortPositionCount: "Int!",
    openPositionCount: "Int!",
    closedPositionCount: "Int!",
    cumulativePositionCount: "Int!",
    transactionCount: "Int!",
    depositCount: "Int!",
    withdrawCount: "Int!",
    borrowCount: "Int!",
    swapCount: "Int!",
    collateralInCount: "Int!",
    collateralOutCount: "Int!",
    totalPoolCount: "Int!",
  };
  const protocolQueryFields = Object.keys(protocolFields).map((x) => x + "\n");
  // Query pool(pool) entity and events entities
  const events = ["deposits", "withdraws", "collateralIns", "collateralOuts", "swaps", "liquidates"];
  const eventsFields = ["hash", "to", "from", "blockNumber"];
  const eventsQuery = events.map((event) => {
    let fields = eventsFields.join(", ");
    if (event === "deposits" || event === "withdraws" || event === "collateralIns" || event === "collateralOuts") {
      fields += ", amountUSD";
    } else if (event === "swaps") {
      fields += ", amountIn, amountInUSD, amountOut, amountOutUSD";
    } else if (event === "liquidates") {
      fields += ", account{id}, liquidatee{id}, amount, amountUSD, profitUSD";
    }
    const baseStr = event + "(first: 1000, orderBy: timestamp, orderDirection: desc, where: {pool: $poolId}) { ";
    return baseStr + fields + " }";
  });
  const financialsQuery = `
    query Data {
      ${finanQuery}
    }`;
  const hourlyUsageQuery = `
    query Data {
      ${usageHourlyQuery}
    }`;
  const dailyUsageQuery = `
    query Data {
      ${usageDailyQuery}
    }`;
  const protocolTableQuery = `
    query Data($protocolId: String) {
      derivPerpProtocol(id: $protocolId) {
        ${protocolQueryFields}
      }
    }`;
  const poolsQuery = `
      query Data {
        liquidityPools(first: 100, orderBy: totalValueLockedUSD, orderDirection: desc) {
          id
          name
        }
      }
    `;
  const poolTimeseriesQuery = `
      query Data($poolId: String) {
        ${liquidityPoolDailyQuery}
        ${liquidityPoolHourlyQuery}
      }
      `;
  const poolData = {
    id: "Bytes!",
    name: "String",
    symbol: "String",
    inputTokens: "[Token!]!",
    outputToken: "Token",
    rewardTokens: "[RewardToken!]",
    fees: "[LiquidityPoolFee!]!",
    oracle: "String",
    totalValueLockedUSD: "BigDecimal!",
    cumulativeSupplySideRevenueUSD: "BigDecimal!",
    cumulativeProtocolSideRevenueUSD: "BigDecimal!",
    cumulativeTotalRevenueUSD: "BigDecimal!",
    cumulativeEntryPremiumUSD: "BigDecimal!",
    cumulativeExitPremiumUSD: "BigDecimal!",
    cumulativeTotalPremiumUSD: "BigDecimal!",
    cumulativeDepositPremiumUSD: "BigDecimal!",
    cumulativeWithdrawPremiumUSD: "BigDecimal!",
    cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
    cumulativeUniqueBorrowers: "Int!",
    cumulativeUniqueLiquidators: "Int!",
    cumulativeUniqueLiquidatees: "Int!",
    openInterestUSD: "BigDecimal!",
    longPositionCount: "Int!",
    shortPositionCount: "Int!",
    openPositionCount: "Int!",
    closedPositionCount: "Int!",
    cumulativePositionCount: "Int!",
    cumulativeVolumeUSD: "BigDecimal!",
    inputTokenBalances: "[BigInt!]!",
    inputTokenWeights: "[BigDecimal!]!",
    outputTokenSupply: "BigInt",
    outputTokenPriceUSD: "BigDecimal",
    stakedOutputTokenAmount: "BigInt",
    rewardTokenEmissionsAmount: "[BigInt!]",
    rewardTokenEmissionsUSD: "[BigDecimal!]",
  };
  let query = `
  query Data($poolId: String, $protocolId: String){
    _meta {
      block {
        number
      }
      deployment
    }
    protocols {
      id
      methodologyVersion
      network
      name
      type
      slug
      schemaVersion
      subgraphVersion
    }
    derivPerpProtocols {
      ${protocolQueryFields}
    }
    ${eventsQuery}
    liquidityPool(id: $poolId){
      id
      name
      symbol

      inputTokens{
        id
        decimals
        name
        symbol
      }
      outputToken {
        id
        decimals
        name
        symbol
      }
      rewardTokens {
        id
        type
        token {
          id
          decimals
          name
          symbol
        }
      }
      fees {
        id
        feePercentage
        feeType
      }
      oracle
      totalValueLockedUSD
      fundingrate
      cumulativeSupplySideRevenueUSD
      cumulativeProtocolSideRevenueUSD
      cumulativeTotalRevenueUSD
      cumulativeEntryPremiumUSD
      cumulativeExitPremiumUSD
      cumulativeTotalPremiumUSD
      cumulativeDepositPremiumUSD
      cumulativeWithdrawPremiumUSD
      cumulativeTotalLiquidityPremiumUSD
      cumulativeUniqueUsers
      cumulativeUniqueDepositors
      cumulativeUniqueBorrowers
      cumulativeUniqueLiquidators
      cumulativeUniqueLiquidatees
      longOpenInterestUSD
      shortOpenInterestUSD
      totalOpenInterestUSD
      longPositionCount
      shortPositionCount
      openPositionCount
      closedPositionCount
      cumulativePositionCount
      cumulativeVolumeUSD
      cumulativeInflowVolumeUSD
      cumulativeClosedInflowVolumeUSD
      cumulativeOutflowVolumeUSD
      inputTokenBalances
      inputTokenWeights
      outputTokenSupply
      outputTokenPriceUSD
      stakedOutputTokenAmount
      rewardTokenEmissionsAmount
      rewardTokenEmissionsUSD
    }
  }`;
  return {
    entities,
    entitiesData,
    query,
    protocolTableQuery,
    poolData,
    events,
    protocolFields,
    poolsQuery,
    financialsQuery,
    hourlyUsageQuery,
    dailyUsageQuery,
    poolTimeseriesQuery,
  };
};
exports.schema130 = schema130;
const schema131 = () => {
  const entities = [
    "financialsDailySnapshots",
    "usageMetricsDailySnapshots",
    "liquidityPoolDailySnapshots",
    "usageMetricsHourlySnapshots",
    "liquidityPoolHourlySnapshots",
  ];
  const entitiesData = {
    financialsDailySnapshots: {
      id: "Bytes!",
      days: "Int!",
      totalValueLockedUSD: "BigDecimal!",
      dailyVolumeUSD: "BigDecimal!",
      cumulativeVolumeUSD: "BigDecimal!",
      dailyInflowVolumeUSD: "BigDecimal!",
      cumulativeInflowVolumeUSD: "BigDecimal!",
      dailyClosedInflowVolumeUSD: "BigDecimal!",
      cumulativeClosedInflowVolumeUSD: "BigDecimal!",
      dailyOutflowVolumeUSD: "BigDecimal!",
      cumulativeOutflowVolumeUSD: "BigDecimal!",
      dailyLongOpenInterestUSD: "BigDecimal!",
      dailyShortOpenInterestUSD: "BigDecimal!",
      dailyTotalOpenInterestUSD: "BigDecimal!",
      dailySupplySideRevenueUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      dailyProtocolSideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      dailyStakeSideRevenueUSD: "BigDecimal!",
      cumulativeStakeSideRevenueUSD: "BigDecimal!",
      dailyTotalRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      dailyEntryPremiumUSD: "BigDecimal!",
      cumulativeEntryPremiumUSD: "BigDecimal!",
      dailyExitPremiumUSD: "BigDecimal!",
      cumulativeExitPremiumUSD: "BigDecimal!",
      dailyTotalPremiumUSD: "BigDecimal!",
      cumulativeTotalPremiumUSD: "BigDecimal!",
      dailyDepositPremiumUSD: "BigDecimal!",
      cumulativeDepositPremiumUSD: "BigDecimal!",
      dailyWithdrawPremiumUSD: "BigDecimal!",
      cumulativeWithdrawPremiumUSD: "BigDecimal!",
      dailyTotalLiquidityPremiumUSD: "BigDecimal!",
      cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
    },
    usageMetricsDailySnapshots: {
      id: "Bytes!",
      days: "Int!",
      dailyActiveUsers: "Int!",
      cumulativeUniqueUsers: "Int!",
      dailyLongPositionCount: "Int!",
      longPositionCount: "Int!",
      dailyShortPositionCount: "Int!",
      shortPositionCount: "Int!",
      dailyOpenPositionCount: "Int!",
      openPositionCount: "Int!",
      dailyClosedPositionCount: "Int!",
      closedPositionCount: "Int!",
      dailyCumulativePositionCount: "Int!",
      cumulativePositionCount: "Int!",
      dailyTransactionCount: "Int!",
      dailyDepositCount: "Int!",
      dailyWithdrawCount: "Int!",
      dailyBorrowCount: "Int!",
      dailySwapCount: "Int!",
      dailyActiveDepositors: "Int!",
      cumulativeUniqueDepositors: "Int!",
      dailyActiveBorrowers: "Int!",
      cumulativeUniqueBorrowers: "Int!",
      dailyActiveLiquidators: "Int!",
      cumulativeUniqueLiquidators: "Int!",
      dailyActiveLiquidatees: "Int!",
      cumulativeUniqueLiquidatees: "Int!",
      dailyCollateralIn: "Int!",
      cumulativeCollateralIn: "Int!",
      dailyCollateralOut: "Int!",
      cumulativeCollateralOut: "Int!",
      totalPoolCount: "Int!",
    },
    liquidityPoolDailySnapshots: {
      id: "Bytes!",
      days: "Int!",
      totalValueLockedUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      dailySupplySideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      dailyProtocolSideRevenueUSD: "BigDecimal!",
      cumulativeStakeSideRevenueUSD: "BigDecimal!",
      dailyStakeSideRevenueUSD: "BigDecimal!",
      dailyTotalRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      dailyFundingrate: "[BigDecimal!]!",
      dailyLongOpenInterestUSD: "BigDecimal!",
      dailyShortOpenInterestUSD: "BigDecimal!",
      dailyTotalOpenInterestUSD: "BigDecimal!",
      dailyEntryPremiumUSD: "BigDecimal!",
      cumulativeEntryPremiumUSD: "BigDecimal!",
      dailyExitPremiumUSD: "BigDecimal!",
      cumulativeExitPremiumUSD: "BigDecimal!",
      dailyTotalPremiumUSD: "BigDecimal!",
      cumulativeTotalPremiumUSD: "BigDecimal!",
      dailyDepositPremiumUSD: "BigDecimal!",
      cumulativeDepositPremiumUSD: "BigDecimal!",
      dailyWithdrawPremiumUSD: "BigDecimal!",
      cumulativeWithdrawPremiumUSD: "BigDecimal!",
      dailyTotalLiquidityPremiumUSD: "BigDecimal!",
      cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
      dailyActiveUsers: "Int!",
      cumulativeUniqueUsers: "Int!",
      dailyActiveDepositors: "Int!",
      dailyActiveBorrowers: "Int!",
      cumulativeUniqueBorrowers: "Int!",
      dailyActiveLiquidators: "Int!",
      cumulativeUniqueLiquidators: "Int!",
      dailyActiveLiquidatees: "Int!",
      cumulativeUniqueLiquidatees: "Int!",
      dailyLongPositionCount: "Int!",
      longPositionCount: "Int!",
      dailyShortPositionCount: "Int!",
      shortPositionCount: "Int!",
      dailyOpenPositionCount: "Int!",
      openPositionCount: "Int!",
      dailyClosedPositionCount: "Int!",
      closedPositionCount: "Int!",
      dailyCumulativePositionCount: "Int!",
      cumulativePositionCount: "Int!",
      dailyVolumeUSD: "BigDecimal!",
      dailyVolumeByTokenAmount: "[BigInt!]!",
      dailyVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeVolumeUSD: "BigDecimal!",
      dailyInflowVolumeUSD: "BigDecimal!",
      dailyInflowVolumeByTokenAmount: "[BigInt!]!",
      dailyInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeInflowVolumeUSD: "BigDecimal!",
      dailyClosedInflowVolumeUSD: "BigDecimal!",
      dailyClosedInflowVolumeByTokenAmount: "[BigInt!]!",
      dailyClosedInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeClosedInflowVolumeUSD: "BigDecimal!",
      dailyOutflowVolumeUSD: "BigDecimal!",
      dailyOutflowVolumeByTokenAmount: "[BigInt!]!",
      dailyOutflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeOutflowVolumeUSD: "BigDecimal!",
      inputTokenBalances: "[BigInt!]!",
      inputTokenWeights: "[BigDecimal!]!",
      outputTokenSupply: "BigInt",
      outputTokenPriceUSD: "BigDecimal",
      stakedOutputTokenAmount: "BigInt",
      rewardTokenEmissionsAmount: "[BigInt!]",
      rewardTokenEmissionsUSD: "[BigDecimal!]",
    },
    usageMetricsHourlySnapshots: {
      id: "Bytes!",
      hours: "Int!",
      protocol: "DerivPerpProtocol!",
      hourlyActiveUsers: "Int!",
      cumulativeUniqueUsers: "Int!",
      hourlyTransactionCount: "Int!",
      hourlyDepositCount: "Int!",
      hourlyWithdrawCount: "Int!",
      hourlyBorrowCount: "Int!",
      hourlySwapCount: "Int!",
    },
    liquidityPoolHourlySnapshots: {
      id: "Bytes!",
      hours: "Int!",
      totalValueLockedUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      hourlySupplySideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      hourlyProtocolSideRevenueUSD: "BigDecimal!",
      cumulativeStakeSideRevenueUSD: "BigDecimal!",
      hourlyStakeSideRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      hourlyTotalRevenueUSD: "BigDecimal!",
      hourlyFundingrate: "[BigDecimal!]!",
      hourlyLongOpenInterestUSD: "BigDecimal!",
      hourlyShortOpenInterestUSD: "BigDecimal!",
      hourlyTotalOpenInterestUSD: "BigDecimal!",
      hourlyEntryPremiumUSD: "BigDecimal!",
      cumulativeEntryPremiumUSD: "BigDecimal!",
      hourlyExitPremiumUSD: "BigDecimal!",
      cumulativeExitPremiumUSD: "BigDecimal!",
      hourlyTotalPremiumUSD: "BigDecimal!",
      cumulativeTotalPremiumUSD: "BigDecimal!",
      hourlyDepositPremiumUSD: "BigDecimal!",
      cumulativeDepositPremiumUSD: "BigDecimal!",
      hourlyWithdrawPremiumUSD: "BigDecimal!",
      cumulativeWithdrawPremiumUSD: "BigDecimal!",
      hourlyTotalLiquidityPremiumUSD: "BigDecimal!",
      cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
      hourlyVolumeUSD: "BigDecimal!",
      hourlyVolumeByTokenAmount: "[BigInt!]!",
      hourlyVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeVolumeUSD: "BigDecimal!",
      hourlyInflowVolumeUSD: "BigDecimal!",
      hourlyInflowVolumeByTokenAmount: "[BigInt!]!",
      hourlyInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeInflowVolumeUSD: "BigDecimal!",
      hourlyClosedInflowVolumeUSD: "BigDecimal!",
      hourlyClosedInflowVolumeByTokenAmount: "[BigInt!]!",
      hourlyClosedInflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeClosedInflowVolumeUSD: "BigDecimal!",
      hourlyOutflowVolumeUSD: "BigDecimal!",
      hourlyOutflowVolumeByTokenAmount: "[BigInt!]!",
      hourlyOutflowVolumeByTokenUSD: "[BigDecimal!]!",
      cumulativeOutflowVolumeUSD: "BigDecimal!",
      inputTokenBalances: "[BigInt!]!",
      inputTokenWeights: "[BigDecimal!]!",
      outputTokenSupply: "BigInt",
      outputTokenPriceUSD: "BigDecimal",
      stakedOutputTokenAmount: "BigInt",
      rewardTokenEmissionsAmount: "[BigInt!]",
      rewardTokenEmissionsUSD: "[BigDecimal!]",
    },
  };
  const finanQuery =
    "financialsDailySnapshots(first: 1000, orderBy: days, orderDirection: desc) {" +
    Object.keys(entitiesData.financialsDailySnapshots).join(",") +
    "}";
  const usageDailyQuery =
    "usageMetricsDailySnapshots(first: 1000, orderBy: days, orderDirection: desc) {" +
    Object.keys(entitiesData.usageMetricsDailySnapshots).join(",") +
    "}";
  const usageHourlyQuery =
    "usageMetricsHourlySnapshots(first: 1000, orderBy: hours, orderDirection: desc) {" +
    Object.keys(entitiesData.usageMetricsHourlySnapshots).join(",") +
    "}";
  const liquidityPoolDailyQuery =
    "liquidityPoolDailySnapshots(first: 1000, orderBy: days, orderDirection: desc, where: {pool: $poolId}) {" +
    Object.keys(entitiesData.liquidityPoolDailySnapshots).join(",") +
    "}";
  const liquidityPoolHourlyQuery =
    "liquidityPoolHourlySnapshots(first: 1000, orderBy: hours, orderDirection: desc, where: {pool: $poolId}) {" +
    Object.keys(entitiesData.liquidityPoolHourlySnapshots).join(",") +
    "}";
  const protocolFields = {
    id: "Bytes!",
    name: "String!",
    slug: "String!",
    schemaVersion: "String!",
    subgraphVersion: "String!",
    methodologyVersion: "String!",
    network: "Network!",
    type: "ProtocolType!",
    totalValueLockedUSD: "BigDecimal!",
    cumulativeVolumeUSD: "BigDecimal!",
    cumulativeInflowVolumeUSD: "BigDecimal!",
    cumulativeClosedInflowVolumeUSD: "BigDecimal!",
    cumulativeOutflowVolumeUSD: "BigDecimal!",
    cumulativeSupplySideRevenueUSD: "BigDecimal!",
    cumulativeProtocolSideRevenueUSD: "BigDecimal!",
    cumulativeStakeSideRevenueUSD: "BigDecimal!",
    cumulativeTotalRevenueUSD: "BigDecimal!",
    cumulativeEntryPremiumUSD: "BigDecimal!",
    cumulativeExitPremiumUSD: "BigDecimal!",
    cumulativeTotalPremiumUSD: "BigDecimal!",
    cumulativeDepositPremiumUSD: "BigDecimal!",
    cumulativeWithdrawPremiumUSD: "BigDecimal!",
    cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
    cumulativeUniqueUsers: "Int!",
    cumulativeUniqueDepositors: "Int!",
    cumulativeUniqueBorrowers: "Int!",
    cumulativeUniqueLiquidators: "Int!",
    cumulativeUniqueLiquidatees: "Int!",
    longOpenInterestUSD: "BigDecimal!",
    shortOpenInterestUSD: "BigDecimal!",
    totalOpenInterestUSD: "BigDecimal!",
    longPositionCount: "Int!",
    shortPositionCount: "Int!",
    openPositionCount: "Int!",
    closedPositionCount: "Int!",
    cumulativePositionCount: "Int!",
    transactionCount: "Int!",
    depositCount: "Int!",
    withdrawCount: "Int!",
    borrowCount: "Int!",
    swapCount: "Int!",
    collateralInCount: "Int!",
    collateralOutCount: "Int!",
    totalPoolCount: "Int!",
  };
  const protocolQueryFields = Object.keys(protocolFields).map((x) => x + "\n");
  // Query pool(pool) entity and events entities
  const events = ["deposits", "withdraws", "collateralIns", "collateralOuts", "swaps", "liquidates"];
  const eventsFields = ["hash", "to", "from", "blockNumber"];
  const eventsQuery = events.map((event) => {
    let fields = eventsFields.join(", ");
    if (event === "deposits" || event === "withdraws" || event === "collateralIns" || event === "collateralOuts") {
      fields += ", amountUSD";
    } else if (event === "swaps") {
      fields += ", amountIn, amountInUSD, amountOut, amountOutUSD";
    } else if (event === "liquidates") {
      fields += ", account{id}, liquidatee{id}, amount, amountUSD, profitUSD";
    }
    const baseStr = event + "(first: 1000, orderBy: timestamp, orderDirection: desc, where: {pool: $poolId}) { ";
    return baseStr + fields + " }";
  });
  const financialsQuery = `
    query Data {
      ${finanQuery}
    }`;
  const hourlyUsageQuery = `
    query Data {
      ${usageHourlyQuery}
    }`;
  const dailyUsageQuery = `
    query Data {
      ${usageDailyQuery}
    }`;
  const protocolTableQuery = `
    query Data($protocolId: String) {
      derivPerpProtocol(id: $protocolId) {
        ${protocolQueryFields}
      }
    }`;
  const poolsQuery = `
      query Data {
        liquidityPools(first: 100, orderBy: totalValueLockedUSD, orderDirection: desc) {
          id
          name
        }
      }
    `;
  const poolTimeseriesQuery = `
      query Data($poolId: String) {
        ${liquidityPoolDailyQuery}
        ${liquidityPoolHourlyQuery}
      }
      `;
  const poolData = {
    id: "Bytes!",
    name: "String",
    symbol: "String",
    inputTokens: "[Token!]!",
    outputToken: "Token",
    rewardTokens: "[RewardToken!]",
    fees: "[LiquidityPoolFee!]!",
    oracle: "String",
    totalValueLockedUSD: "BigDecimal!",
    cumulativeSupplySideRevenueUSD: "BigDecimal!",
    cumulativeProtocolSideRevenueUSD: "BigDecimal!",
    cumulativeStakeSideRevenueUSD: "BigDecimal!",
    cumulativeTotalRevenueUSD: "BigDecimal!",
    cumulativeEntryPremiumUSD: "BigDecimal!",
    cumulativeExitPremiumUSD: "BigDecimal!",
    cumulativeTotalPremiumUSD: "BigDecimal!",
    cumulativeDepositPremiumUSD: "BigDecimal!",
    cumulativeWithdrawPremiumUSD: "BigDecimal!",
    cumulativeTotalLiquidityPremiumUSD: "BigDecimal!",
    cumulativeUniqueBorrowers: "Int!",
    cumulativeUniqueLiquidators: "Int!",
    cumulativeUniqueLiquidatees: "Int!",
    openInterestUSD: "BigDecimal!",
    longPositionCount: "Int!",
    shortPositionCount: "Int!",
    openPositionCount: "Int!",
    closedPositionCount: "Int!",
    cumulativePositionCount: "Int!",
    cumulativeVolumeUSD: "BigDecimal!",
    inputTokenBalances: "[BigInt!]!",
    inputTokenWeights: "[BigDecimal!]!",
    outputTokenSupply: "BigInt",
    outputTokenPriceUSD: "BigDecimal",
    stakedOutputTokenAmount: "BigInt",
    rewardTokenEmissionsAmount: "[BigInt!]",
    rewardTokenEmissionsUSD: "[BigDecimal!]",
  };
  let query = `
  query Data($poolId: String, $protocolId: String){
    _meta {
      block {
        number
      }
      deployment
    }
    protocols {
      id
      methodologyVersion
      network
      name
      type
      slug
      schemaVersion
      subgraphVersion
    }
    derivPerpProtocols {
      ${protocolQueryFields}
    }
    ${eventsQuery}
    liquidityPool(id: $poolId){
      id
      name
      symbol

      inputTokens{
        id
        decimals
        name
        symbol
      }
      outputToken {
        id
        decimals
        name
        symbol
      }
      rewardTokens {
        id
        type
        token {
          id
          decimals
          name
          symbol
        }
      }
      fees {
        id
        feePercentage
        feeType
      }
      oracle
      totalValueLockedUSD
      fundingrate
      cumulativeSupplySideRevenueUSD
      cumulativeProtocolSideRevenueUSD
      cumulativeStakeSideRevenueUSD
      cumulativeTotalRevenueUSD
      cumulativeEntryPremiumUSD
      cumulativeExitPremiumUSD
      cumulativeTotalPremiumUSD
      cumulativeDepositPremiumUSD
      cumulativeWithdrawPremiumUSD
      cumulativeTotalLiquidityPremiumUSD
      cumulativeUniqueUsers
      cumulativeUniqueDepositors
      cumulativeUniqueBorrowers
      cumulativeUniqueLiquidators
      cumulativeUniqueLiquidatees
      longOpenInterestUSD
      shortOpenInterestUSD
      totalOpenInterestUSD
      longPositionCount
      shortPositionCount
      openPositionCount
      closedPositionCount
      cumulativePositionCount
      cumulativeVolumeUSD
      cumulativeInflowVolumeUSD
      cumulativeClosedInflowVolumeUSD
      cumulativeOutflowVolumeUSD
      inputTokenBalances
      inputTokenWeights
      outputTokenSupply
      outputTokenPriceUSD
      stakedOutputTokenAmount
      rewardTokenEmissionsAmount
      rewardTokenEmissionsUSD
    }
  }`;
  return {
    entities,
    entitiesData,
    query,
    protocolTableQuery,
    poolData,
    events,
    protocolFields,
    poolsQuery,
    financialsQuery,
    hourlyUsageQuery,
    dailyUsageQuery,
    poolTimeseriesQuery,
  };
};
exports.schema131 = schema131;
