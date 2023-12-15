"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema300 = exports.schema200 = exports.schema130 = exports.schema = void 0;
const constants_1 = require("../../constants");
const schema = (version) => {
  // The version group uses the first two digits  of the schema version and defaults to that schema.
  const versionGroupArr = version.split(".");
  const spec = versionGroupArr.pop();
  const versionGroup = versionGroupArr.join(".") + ".0";
  switch (versionGroup) {
    case constants_1.Versions.Schema130:
      return (0, exports.schema130)();
    case constants_1.Versions.Schema200:
      return (0, exports.schema200)();
    case constants_1.Versions.Schema300:
      return (0, exports.schema300)();
    case constants_1.Versions.Schema400:
      return (0, exports.schema300)();
    default:
      return (0, exports.schema130)();
  }
};
exports.schema = schema;
const schema130 = () => {
  return `
    query Data($skipAmt: Int!) {
      liquidityPools(first: 10, skip: $skipAmt, orderBy: totalValueLockedUSD, orderDirection: desc) {
        id
        name
        fees {
          feePercentage
          feeType
        }
        totalValueLockedUSD
        cumulativeVolumeUSD
        outputTokenSupply
        stakedOutputTokenAmount
        rewardTokenEmissionsUSD
      }
    }`;
};
exports.schema130 = schema130;
const schema200 = () => {
  return `
    query Data($skipAmt: Int!) {
      liquidityPools(first: 10, skip: $skipAmt, orderBy: totalValueLockedUSD, orderDirection: desc) {
        id
        name
        fees {
          feePercentage
          feeType
        }
        totalValueLockedUSD
        cumulativeVolumeUSD
        outputTokenSupply
        stakedOutputTokenAmount
        rewardTokenEmissionsUSD
      }
    }`;
};
exports.schema200 = schema200;
const schema300 = () => {
  return `
    query Data($skipAmt: Int!) {
      liquidityPools(first: 10, skip: $skipAmt, orderBy: totalValueLockedUSD, orderDirection: desc) {
        id
        name
        fees {
          feePercentage
          feeType
        }
        totalValueLockedUSD
        cumulativeVolumeUSD
        rewardTokenEmissionsUSD
      }
    }`;
};
exports.schema300 = schema300;
