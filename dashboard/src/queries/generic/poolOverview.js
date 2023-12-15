"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema130 = exports.schema120 = exports.schema = void 0;
const constants_1 = require("../../constants");
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
  return `
    query Data($skipAmt: Int!) {
    pools(first: 10, skip: $skipAmt, orderBy:totalValueLockedUSD, orderDirection: desc) {
      id
      name
      symbol
      totalValueLockedUSD
      outputTokenSupply
      stakedOutputTokenAmount
      rewardTokenEmissionsUSD
        }
    }`;
};
exports.schema120 = schema120;
const schema130 = () => {
  return `
    query Data($skipAmt: Int!) {
      pools(first: 10, skip: $skipAmt, orderBy:totalValueLockedUSD, orderDirection: desc) {
        id
        name
        
        totalValueLockedUSD
        outputTokenSupply
        stakedOutputTokenAmount
        rewardTokenEmissionsUSD
      }
    }`;
};
exports.schema130 = schema130;
