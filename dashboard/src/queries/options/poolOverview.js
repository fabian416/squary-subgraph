"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema110 = exports.schema = void 0;
const constants_1 = require("../../constants");
const schema = (version) => {
  // The version group uses the first two digits  of the schema version and defaults to that schema.
  const versionGroupArr = version.split(".");
  versionGroupArr.pop();
  const versionGroup = versionGroupArr.join(".") + ".0";
  switch (versionGroup) {
    case constants_1.Versions.Schema110:
      return (0, exports.schema110)();
    default:
      return (0, exports.schema110)();
  }
};
exports.schema = schema;
const schema110 = () => {
  return `
    query Data($skipAmt: Int!) {
      liquidityPools(first: 10, skip: $skipAmt, orderBy: totalValueLockedUSD, orderDirection: desc) {
        id
        name
        inputTokens {
          id
          symbol
        }
        rewardTokens {
          token {
            symbol
          }
        }
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
exports.schema110 = schema110;
