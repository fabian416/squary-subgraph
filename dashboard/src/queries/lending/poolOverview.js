"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema300 = exports.schema201 = exports.schema130 = exports.schema = void 0;
const constants_1 = require("../../constants");
const schema = (version) => {
  // The version group uses the first two digits  of the schema version and defaults to that schema.
  const versionGroupArr = version.split(".");
  versionGroupArr.pop();
  const versionGroup = versionGroupArr.join(".") + ".0";
  switch (versionGroup) {
    case constants_1.Versions.Schema130:
      return (0, exports.schema130)();
    case constants_1.Versions.Schema201:
      return (0, exports.schema201)();
    case constants_1.Versions.Schema300:
      return (0, exports.schema300)();
    default:
      return (0, exports.schema201)();
  }
};
exports.schema = schema;
const schema130 = () => {
  return `
    query Data($skipAmt: Int!) {
        markets(first: 10, skip: $skipAmt, orderBy:totalValueLockedUSD, orderDirection: desc) {
            id
            name

            rates {
              id
              side
              rate
              type
            }
            totalValueLockedUSD
            totalBorrowBalanceUSD
            totalDepositBalanceUSD
            rewardTokenEmissionsUSD
        }
    }`;
};
exports.schema130 = schema130;
const schema201 = () => {
  return `
    query Data($skipAmt: Int!) {
        markets(first: 10, skip: $skipAmt, orderBy:totalValueLockedUSD, orderDirection: desc) {
            id
            name
            rates {
              id
              side
              rate
              type
            }
            totalValueLockedUSD
            rewardTokenEmissionsUSD
            totalBorrowBalanceUSD
            totalDepositBalanceUSD
            positionCount
            openPositionCount
            closedPositionCount
            lendingPositionCount
            borrowingPositionCount
        }
    }`;
};
exports.schema201 = schema201;
const schema300 = () => {
  return `
    query Data($skipAmt: Int!) {
        markets(first: 10, skip: $skipAmt, orderBy:totalValueLockedUSD, orderDirection: desc) {
            id
            name
            rates {
              id
              side
              rate
              type
            }
            totalValueLockedUSD
            rewardTokenEmissionsUSD
            totalBorrowBalanceUSD
            totalDepositBalanceUSD
            positionCount
            openPositionCount
            closedPositionCount
            lendingPositionCount
            borrowingPositionCount
        }
    }`;
};
exports.schema300 = schema300;
