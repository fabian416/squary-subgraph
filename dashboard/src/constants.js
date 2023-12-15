"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateValueKeys =
  exports.nonStrictlyIncrementalFieldList =
  exports.negativeFieldList =
  exports.blockExplorers =
  exports.percentageFieldList =
  exports.ProtocolTypeEntityNames =
  exports.ProtocolTypeEntityName =
  exports.PoolNames =
  exports.PoolName =
  exports.SubgraphBaseUrl =
  exports.listSchemaVersionsByType =
  exports.latestSchemaVersions =
  exports.Versions =
  exports.ProtocolType =
    void 0;
const utils_1 = require("./utils");
const schema_1 = require("./queries/dex/schema");
const schema_2 = require("./queries/lending/schema");
const schema_3 = require("./queries/yield/schema");
const schema_4 = require("./queries/generic/schema");
const schema_5 = require("./queries/bridge/schema");
const schema_6 = require("./queries/perpetual/schema");
const schema_7 = require("./queries/options/schema");
var ProtocolType;
(function (ProtocolType) {
  ProtocolType.EXCHANGE = "EXCHANGE";
  ProtocolType.LENDING = "LENDING";
  ProtocolType.YIELD = "YIELD";
  ProtocolType.BRIDGE = "BRIDGE";
  ProtocolType.PERPETUAL = "PERPETUAL";
  ProtocolType.OPTION = "OPTION";
  ProtocolType.GENERIC = "GENERIC";
})((ProtocolType = exports.ProtocolType || (exports.ProtocolType = {})));
var Versions;
(function (Versions) {
  Versions.Schema100 = "1.0.0";
  Versions.Schema110 = "1.1.0";
  Versions.Schema120 = "1.2.0";
  Versions.Schema130 = "1.3.0";
  Versions.Schema200 = "2.0.0";
  Versions.Schema201 = "2.0.1";
  Versions.Schema300 = "3.0.0";
  Versions.Schema301 = "3.0.1";
  Versions.Schema302 = "3.0.2";
  Versions.Schema310 = "3.1.0";
  Versions.Schema400 = "4.0.0";
})((Versions = exports.Versions || (exports.Versions = {})));
const latestSchemaVersions = (schemaType, versionStr) => {
  const schema = utils_1.schemaMapping[schemaType];
  if (schema === "exchanges") {
    if (["4.0.0"].includes(versionStr)) {
      return true;
    }
  } else if (schema === "lending") {
    if (["3.1.0"].includes(versionStr)) {
      return true;
    }
  } else if (schema === "vaults") {
    if (["1.3.1"].includes(versionStr)) {
      return true;
    }
  } else if (schema === "generic") {
    if (["2.1.1"].includes(versionStr)) {
      return true;
    }
  } else if (schema === "bridge") {
    if (["1.2.0"].includes(versionStr)) {
      return true;
    }
  } else if (schema === "option") {
    if (["1.3.1"].includes(versionStr)) {
      return true;
    }
  } else if (schema === "perpetual") {
    if (["1.3.1"].includes(versionStr)) {
      return true;
    }
  }
  return false;
};
exports.latestSchemaVersions = latestSchemaVersions;
exports.listSchemaVersionsByType = {
  EXCHANGE: schema_1.versionsList,
  LENDING: schema_2.versionsList,
  YIELD: schema_3.versionsList,
  GENERIC: schema_4.versionsList,
  BRIDGE: schema_5.versionsList,
  PERPETUAL: schema_6.versionsList,
  OPTION: schema_7.versionsList,
  exchanges: schema_1.versionsList,
  vaults: schema_3.versionsList,
  "dex-amm": schema_1.versionsList,
  "yield-aggregator": schema_3.versionsList,
  lending: schema_2.versionsList,
  generic: schema_4.versionsList,
  bridge: schema_5.versionsList,
  perpetual: schema_6.versionsList,
  option: schema_7.versionsList,
};
exports.SubgraphBaseUrl = process.env.REACT_APP_GRAPH_BASE_URL + "/subgraphs/name/";
exports.PoolName = {
  EXCHANGE: "liquidityPool",
  LENDING: "market",
  YIELD: "vault",
  GENERIC: "pool",
  BRIDGE: "pool",
  PERPETUAL: "liquidityPool",
  OPTION: "liquidityPool",
  exchanges: "liquidityPool",
  vaults: "vault",
  "dex-amm": "liquidityPool",
  "yield-aggregator": "vault",
  lending: "market",
  generic: "pool",
  bridge: "pool",
  perpetual: "liquidityPool",
  option: "liquidityPool",
};
exports.PoolNames = {
  EXCHANGE: "liquidityPools",
  LENDING: "markets",
  YIELD: "vaults",
  GENERIC: "pools",
  BRIDGE: "pools",
  PERPETUAL: "liquidityPools",
  OPTION: "liquidityPools",
  exchanges: "liquidityPools",
  vaults: "vaults",
  "dex-amm": "liquidityPools",
  "yield-aggregator": "vaults",
  lending: "markets",
  generic: "pools",
  bridge: "pools",
  perpetual: "liquidityPools",
  option: "liquidityPools",
};
exports.ProtocolTypeEntityName = {
  EXCHANGE: "dexAmmProtocol",
  LENDING: "lendingProtocol",
  YIELD: "yieldAggregator",
  GENERIC: "protocol",
  BRIDGE: "bridgeProtocol",
  PERPETUAL: "derivPerpProtocol",
  OPTION: "derivOptProtocol",
};
exports.ProtocolTypeEntityNames = {
  EXCHANGE: "dexAmmProtocols",
  LENDING: "lendingProtocols",
  YIELD: "yieldAggregators",
  GENERIC: "protocols",
  BRIDGE: "bridgeProtocols",
  PERPETUAL: "derivPerpProtocols",
  OPTION: "derivOptProtocols",
};
exports.percentageFieldList = [
  "rates",
  "rewardAPR",
  "maximumLTV",
  "liquidationThreshold",
  "liquidationPenalty",
  "inputTokenWeights",
  "baseYield",
  "fee",
  "percentage",
];
exports.blockExplorers = {
  ARBITRUM_ONE: "https://arbiscan.io/",
  AURORA: "https://aurorascan.dev/",
  AVALANCHE: "https://snowtrace.io/",
  BSC: "https://bscscan.com/",
  FANTOM: "https://ftmscan.com/",
  MAINNET: "https://etherscan.io/",
  MATIC: "https://polygonscan.com/",
  MOONRIVER: "https://moonriver.moonscan.io/",
  OPTIMISM: "https://optimistic.etherscan.io/",
  XDAI: "https://blockscout.com/xdai/mainnet/",
  CELO: "https://explorer.celo.org/",
  FUSE: "https://explorer.fuse.io/",
  HARMONY: "https://explorer.harmony.one/",
  CRONOS: "https://cronoscan.com/",
};
// negativeFieldList contains field names that can be negative
exports.negativeFieldList = [
  "dailyNetVolumeUSD",
  "cumulativeNetVolumeUSD",
  "netVolume",
  "netVolumeUSD",
  "netDailyVolume",
  "netDailyVolumeUSD",
  "netHourlyVolume",
  "netHourlyVolumeUSD",
  "netCumulativeVolume",
  "netCumulativeVolumeUSD",
];
exports.nonStrictlyIncrementalFieldList = ["cumulativeNetVolumeUSD", "netCumulativeVolume", "netCumulativeVolumeUSD"];
exports.dateValueKeys = ["day", "days", "hour", "hours"];
