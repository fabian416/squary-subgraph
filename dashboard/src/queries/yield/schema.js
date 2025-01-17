"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema130 = exports.schema120 = exports.schema = exports.versionsList = void 0;
const constants_1 = require("../../constants");
exports.versionsList = ["1.2.0", "1.3.0"];
const schema = (version) => {
  // The version group uses the first two digits  of the schema version and defaults to that schema.
  const versionGroupArr = version.split(".");
  versionGroupArr.pop();
  const versionGroup = versionGroupArr.join(".") + ".0";
  switch (versionGroup) {
    case constants_1.Versions.Schema120:
      return (0, exports.schema120)();
    case constants_1.Versions.Schema130:
      return (0, exports.schema130)();
    default:
      return (0, exports.schema130)();
  }
};
exports.schema = schema;
const schema120 = () => {
  const entities = [
    "financialsDailySnapshots",
    "usageMetricsDailySnapshots",
    "vaultDailySnapshots",
    "usageMetricsHourlySnapshots",
    "vaultHourlySnapshots",
  ];
  const entitiesData = {
    // Each Array within this array contains strings of the fields to pull for the entity type of the same index above
    financialsDailySnapshots: {
      id: "ID!",
      totalValueLockedUSD: "BigDecimal!",
      dailySupplySideRevenueUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      dailyProtocolSideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      dailyTotalRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      timestamp: "BigInt!",
      blockNumber: "BigInt!",
    },
    usageMetricsDailySnapshots: {
      id: "ID!",
      dailyActiveUsers: "Int!",
      cumulativeUniqueUsers: "Int!",
      dailyTransactionCount: "Int!",
      dailyDepositCount: "Int!",
      dailyWithdrawCount: "Int!",
      timestamp: "BigInt!",
      blockNumber: "BigInt!",
    },
    vaultDailySnapshots: {
      id: "ID!",
      totalValueLockedUSD: "BigDecimal!",
      inputTokenBalance: "BigInt!",
      outputTokenSupply: "BigInt!",
      outputTokenPriceUSD: "BigDecimal",
      stakedOutputTokenAmount: "BigInt",
      pricePerShare: "BigDecimal",
      rewardTokenEmissionsAmount: "[BigInt!]",
      rewardTokenEmissionsUSD: "[BigDecimal!]",
      timestamp: "BigInt!",
      blockNumber: "BigInt!",
    },
    usageMetricsHourlySnapshots: {
      id: "ID!",
      hourlyActiveUsers: "Int!",
      cumulativeUniqueUsers: "Int!",
      hourlyTransactionCount: "Int!",
      hourlyDepositCount: "Int!",
      hourlyWithdrawCount: "Int!",
      timestamp: "BigInt!",
      blockNumber: "BigInt!",
    },
    vaultHourlySnapshots: {
      id: "ID!",
      totalValueLockedUSD: "BigDecimal!",
      inputTokenBalance: "BigInt!",
      outputTokenSupply: "BigInt!",
      outputTokenPriceUSD: "BigDecimal",
      stakedOutputTokenAmount: "BigInt",
      pricePerShare: "BigDecimal",
      rewardTokenEmissionsAmount: "[BigInt!]",
      rewardTokenEmissionsUSD: "[BigDecimal!]",
      timestamp: "BigInt!",
      blockNumber: "BigInt!",
    },
  };
  const finanQuery =
    "financialsDailySnapshots(first: 1000, orderBy: timestamp, orderDirection: desc) {" +
    Object.keys(entitiesData.financialsDailySnapshots).join(",") +
    "}";
  const usageDailyQuery =
    "usageMetricsDailySnapshots(first: 1000, orderBy: timestamp, orderDirection: desc) {" +
    Object.keys(entitiesData.usageMetricsDailySnapshots).join(",") +
    "}";
  const usageHourlyQuery =
    "usageMetricsHourlySnapshots(first: 1000, orderBy: timestamp, orderDirection: desc) {" +
    Object.keys(entitiesData.usageMetricsHourlySnapshots).join(",") +
    "}";
  const vaultDailyQuery =
    "vaultDailySnapshots(first: 1000, orderBy: timestamp, orderDirection: desc, where: {vault: $poolId}) {" +
    Object.keys(entitiesData.vaultDailySnapshots).join(",") +
    "}";
  const vaultHourlyQuery =
    "vaultHourlySnapshots(first: 1000, orderBy: timestamp, orderDirection: desc, where: {vault: $poolId}) {" +
    Object.keys(entitiesData.vaultHourlySnapshots).join(",") +
    "}";
  const events = ["deposits", "withdraws"];
  const eventsFields = ["hash", "to", "from", "timestamp", "amount", "amountUSD"];
  const eventsQuery = events.map((event) => {
    let options = "";
    const baseStr =
      event + "(first: 1000, orderBy: timestamp, orderDirection: desc, where: {vault: $poolId}" + options + ") { ";
    const fields = eventsFields.join(", ");
    return baseStr + fields + " }";
  });
  const protocolFields = {
    id: "ID!",
    name: "String!",
    slug: "String!",
    schemaVersion: "String!",
    subgraphVersion: "String!",
    methodologyVersion: "String!",
    network: "Network!",
    type: "ProtocolType!",
    totalValueLockedUSD: "BigDecimal!",
    cumulativeSupplySideRevenueUSD: "BigDecimal!",
    cumulativeProtocolSideRevenueUSD: "BigDecimal!",
    cumulativeTotalRevenueUSD: "BigDecimal!",
    cumulativeUniqueUsers: "Int!",
    protocolControlledValueUSD: "BigDecimal",
  };
  const protocolQueryFields = Object.keys(protocolFields).map((x) => x + "\n");
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
    yieldAggregator(id: $protocolId) {
      ${protocolQueryFields}
    }
  }`;
  const poolsQuery = `
    query Data {
      vaults(first: 100, orderBy: totalValueLockedUSD, orderDirection: desc) {
        id
        name
      }
    }
    `;
  const poolTimeseriesQuery = `
    query Data($poolId: String) {
      ${vaultDailyQuery}
      ${vaultHourlyQuery}
    }
    `;
  const poolData = {
    id: "ID!",
    name: "String",
    symbol: "String",
    fees: "[VaultFee!]!",
    depositLimit: "BigInt!",
    inputToken: "Token!",
    outputToken: "Token",
    rewardTokens: "[RewardToken!]",
    totalValueLockedUSD: "BigDecimal!",
    inputTokenBalance: "BigInt!",
    outputTokenSupply: "BigInt",
    outputTokenPriceUSD: "BigDecimal",
    rewardTokenEmissionsAmount: "[BigInt!]",
    rewardTokenEmissionsUSD: "[BigDecimal!]",
    stakedOutputTokenAmount: "BigInt",
    pricePerShare: "BigDecimal",
  };
  const query = `
    query Data($poolId: String, $protocolId: String){
      _meta {
        block {
          number
        }
        deployment
      }
      protocols {
        id
        name
        type
        slug
        methodologyVersion
        schemaVersion
        subgraphVersion
      }

      yieldAggregators {
        ${protocolQueryFields}
      }

      ${vaultHourlyQuery}
      ${vaultDailyQuery}
      ${eventsQuery}
      vault(id:$poolId){
        id
        name        
        symbol
        fees {
          feeType
          feePercentage
        }
        inputToken {
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
        depositLimit
        totalValueLockedUSD
        stakedOutputTokenAmount
        pricePerShare
        inputTokenBalance
        outputTokenSupply
        outputTokenPriceUSD
        rewardTokenEmissionsAmount
        rewardTokenEmissionsUSD
      }
    }`;
  return {
    entities,
    entitiesData,
    query,
    poolData,
    events,
    protocolFields,
    poolTimeseriesQuery,
    financialsQuery,
    hourlyUsageQuery,
    dailyUsageQuery,
    protocolTableQuery,
    poolsQuery,
  };
};
exports.schema120 = schema120;
const schema130 = () => {
  const entities = [
    "financialsDailySnapshots",
    "usageMetricsDailySnapshots",
    "vaultDailySnapshots",
    "usageMetricsHourlySnapshots",
    "vaultHourlySnapshots",
  ];
  const entitiesData = {
    // Each Array within this array contains strings of the fields to pull for the entity type of the same index above
    financialsDailySnapshots: {
      id: "ID!",
      totalValueLockedUSD: "BigDecimal!",
      dailySupplySideRevenueUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      dailyProtocolSideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      dailyTotalRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      timestamp: "BigInt!",
      blockNumber: "BigInt!",
    },
    usageMetricsDailySnapshots: {
      id: "ID!",
      dailyActiveUsers: "Int!",
      cumulativeUniqueUsers: "Int!",
      dailyTransactionCount: "Int!",
      dailyDepositCount: "Int!",
      dailyWithdrawCount: "Int!",
      timestamp: "BigInt!",
      totalPoolCount: "Int!",
      blockNumber: "BigInt!",
    },
    vaultDailySnapshots: {
      id: "ID!",
      totalValueLockedUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      dailySupplySideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      dailyProtocolSideRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      dailyTotalRevenueUSD: "BigDecimal!",
      inputTokenBalance: "BigInt!",
      outputTokenSupply: "BigInt!",
      outputTokenPriceUSD: "BigDecimal",
      stakedOutputTokenAmount: "BigInt",
      pricePerShare: "BigDecimal",
      rewardTokenEmissionsAmount: "[BigInt!]",
      rewardTokenEmissionsUSD: "[BigDecimal!]",
      timestamp: "BigInt!",
      blockNumber: "BigInt!",
    },
    usageMetricsHourlySnapshots: {
      id: "ID!",
      hourlyActiveUsers: "Int!",
      cumulativeUniqueUsers: "Int!",
      hourlyTransactionCount: "Int!",
      hourlyDepositCount: "Int!",
      hourlyWithdrawCount: "Int!",
      timestamp: "BigInt!",
      blockNumber: "BigInt!",
    },
    vaultHourlySnapshots: {
      id: "ID!",
      totalValueLockedUSD: "BigDecimal!",
      cumulativeSupplySideRevenueUSD: "BigDecimal!",
      hourlySupplySideRevenueUSD: "BigDecimal!",
      cumulativeProtocolSideRevenueUSD: "BigDecimal!",
      hourlyProtocolSideRevenueUSD: "BigDecimal!",
      cumulativeTotalRevenueUSD: "BigDecimal!",
      hourlyTotalRevenueUSD: "BigDecimal!",
      inputTokenBalance: "BigInt!",
      outputTokenSupply: "BigInt!",
      outputTokenPriceUSD: "BigDecimal",
      stakedOutputTokenAmount: "BigInt",
      pricePerShare: "BigDecimal",
      rewardTokenEmissionsAmount: "[BigInt!]",
      rewardTokenEmissionsUSD: "[BigDecimal!]",
      timestamp: "BigInt!",
      blockNumber: "BigInt!",
    },
  };
  const finanQuery =
    "financialsDailySnapshots(first: 1000, orderBy: timestamp, orderDirection: desc) {" +
    Object.keys(entitiesData.financialsDailySnapshots).join(",") +
    "}";
  const usageDailyQuery =
    "usageMetricsDailySnapshots(first: 1000, orderBy: timestamp, orderDirection: desc) {" +
    Object.keys(entitiesData.usageMetricsDailySnapshots).join(",") +
    "}";
  const usageHourlyQuery =
    "usageMetricsHourlySnapshots(first: 1000, orderBy: timestamp, orderDirection: desc) {" +
    Object.keys(entitiesData.usageMetricsHourlySnapshots).join(",") +
    "}";
  const vaultDailyQuery =
    "vaultDailySnapshots(first: 1000, orderBy: timestamp, orderDirection: desc, where: {vault: $poolId}) {" +
    Object.keys(entitiesData.vaultDailySnapshots).join(",") +
    "}";
  const vaultHourlyQuery =
    "vaultHourlySnapshots(first: 1000, orderBy: timestamp, orderDirection: desc, where: {vault: $poolId}) {" +
    Object.keys(entitiesData.vaultHourlySnapshots).join(",") +
    "}";
  const events = ["deposits", "withdraws"];
  const eventsFields = ["hash", "to", "from", "timestamp", "amount", "amountUSD"];
  const eventsQuery = events.map((event) => {
    let options = "";
    const baseStr =
      event + "(first: 1000, orderBy: timestamp, orderDirection: desc, where: {vault: $poolId}" + options + ") { ";
    const fields = eventsFields.join(", ");
    return baseStr + fields + " }";
  });
  const protocolFields = {
    id: "ID!",
    name: "String!",
    slug: "String!",
    schemaVersion: "String!",
    subgraphVersion: "String!",
    methodologyVersion: "String!",
    network: "Network!",
    type: "ProtocolType!",
    totalValueLockedUSD: "BigDecimal!",
    cumulativeSupplySideRevenueUSD: "BigDecimal!",
    cumulativeProtocolSideRevenueUSD: "BigDecimal!",
    cumulativeTotalRevenueUSD: "BigDecimal!",
    cumulativeUniqueUsers: "Int!",
    protocolControlledValueUSD: "BigDecimal",
    totalPoolCount: "Int!",
  };
  const protocolQueryFields = Object.keys(protocolFields).map((x) => x + "\n");
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
      yieldAggregator(id: $protocolId) {
        ${protocolQueryFields}
      }
    }`;
  const poolsQuery = `
      query Data {
        vaults(first: 100, orderBy: totalValueLockedUSD, orderDirection: desc) {
          id
          name
        }
      }
    `;
  const poolTimeseriesQuery = `
  query Data($poolId: String) {
    ${vaultDailyQuery}
    ${vaultHourlyQuery}
  }
  `;
  const poolData = {
    id: "ID!",
    name: "String",
    symbol: "String",
    fees: "[VaultFee!]!",
    depositLimit: "BigInt!",
    inputToken: "Token!",
    outputToken: "Token",
    rewardTokens: "[RewardToken!]",
    totalValueLockedUSD: "BigDecimal!",
    cumulativeSupplySideRevenueUSD: "BigDecimal!",
    cumulativeProtocolSideRevenueUSD: "BigDecimal!",
    cumulativeTotalRevenueUSD: "BigDecimal!",
    inputTokenBalance: "BigInt!",
    outputTokenSupply: "BigInt",
    outputTokenPriceUSD: "BigDecimal",
    rewardTokenEmissionsAmount: "[BigInt!]",
    rewardTokenEmissionsUSD: "[BigDecimal!]",
    stakedOutputTokenAmount: "BigInt",
    pricePerShare: "BigDecimal",
  };
  const query = `
    query Data($poolId: String, $protocolId: String){
      _meta {
        block {
          number
        }
        deployment
      }
      protocols {
        id
        name
        type
        slug
        methodologyVersion
        schemaVersion
        subgraphVersion
      }

      yieldAggregators {
        ${protocolQueryFields}
      }

      ${vaultHourlyQuery}
      ${vaultDailyQuery}
      ${eventsQuery}
      vault(id:$poolId){
        id
        name        
        symbol
        fees {
          feeType
          feePercentage
        }
        inputToken {
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
        depositLimit
        totalValueLockedUSD
        cumulativeSupplySideRevenueUSD
        cumulativeProtocolSideRevenueUSD
        cumulativeTotalRevenueUSD
        stakedOutputTokenAmount
        pricePerShare
        inputTokenBalance
        outputTokenSupply
        outputTokenPriceUSD
        rewardTokenEmissionsAmount
        rewardTokenEmissionsUSD
      }
    }`;
  return {
    entities,
    entitiesData,
    query,
    poolData,
    events,
    protocolFields,
    poolTimeseriesQuery,
    financialsQuery,
    hourlyUsageQuery,
    dailyUsageQuery,
    protocolTableQuery,
    poolsQuery,
  };
};
exports.schema130 = schema130;
