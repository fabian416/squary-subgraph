"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema110 = exports.schema100 = exports.schema = void 0;
const constants_1 = require("../../constants");
const schema = (version) => {
  // The version group uses the first two digits  of the schema version and defaults to that schema.
  const versionGroupArr = version.split(".");
  versionGroupArr.pop();
  const versionGroup = versionGroupArr.join(".") + ".0";
  switch (versionGroup) {
    case constants_1.Versions.Schema100:
      return (0, exports.schema100)();
    case constants_1.Versions.Schema110:
      return (0, exports.schema110)();
    default:
      return (0, exports.schema110)();
  }
};
exports.schema = schema;
const schema100 = () => {
  return `
    query Data($skipAmt: Int!) {
      pools(first: 10, skip: $skipAmt, orderBy:totalValueLockedUSD, orderDirection: desc) {
        id
        name
        inputToken {
          name
          symbol
          id
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
        totalValueLockedUSD
        symbol
        outputTokenSupply
        stakedOutputTokenAmount
        rewardTokenEmissionsUSD
      }
    }`;
};
exports.schema100 = schema100;
const schema110 = () => {
  return `
    query Data($skipAmt: Int!) {
      pools(first: 10, skip: $skipAmt, orderBy:totalValueLockedUSD, orderDirection: desc) {
        id
        name
        inputToken {
          name
          symbol
          id
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
        totalValueLockedUSD
        symbol
        outputTokenSupply
        stakedOutputTokenAmount
        rewardTokenEmissionsUSD
      }
    }`;
};
exports.schema110 = schema110;
