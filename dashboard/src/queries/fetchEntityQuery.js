"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryOnEntity = void 0;
const client_1 = require("@apollo/client");
const constants_1 = require("../constants");
const queryOnEntity = (protocolType, schemaVersion, timestampLt, timestampGt, entityName) => {
  switch (entityName) {
    case "financialsDailySnapshots":
      return financialsDailySnapshotsQuery(protocolType, schemaVersion, timestampLt, timestampGt);
    default:
      return financialsDailySnapshotsQuery(protocolType, schemaVersion, timestampLt, timestampGt);
  }
};
exports.queryOnEntity = queryOnEntity;
const financialsDailySnapshotsQuery = (protocolType, schemaVersion, timestampLt, timestampGt) => {
  let queryString = `{
        financialsDailySnapshots(first: 1000, where: {timestamp_gt: ${timestampGt}, timestamp_lt: ${timestampLt}}, orderBy: timestamp, orderDirection: desc) {
            id
            totalValueLockedUSD
            timestamp
        `;
  if (protocolType === constants_1.ProtocolType.EXCHANGE) {
    const versionGroupArr = schemaVersion.split(".");
    versionGroupArr.pop();
    const versionGroup = versionGroupArr.join(".") + ".0";
    if (versionGroup === constants_1.Versions.Schema130) {
      queryString += `
            dailyVolumeUSD
            cumulativeVolumeUSD
            dailySupplySideRevenueUSD
            cumulativeSupplySideRevenueUSD
            dailyProtocolSideRevenueUSD
            cumulativeProtocolSideRevenueUSD
            dailyTotalRevenueUSD
            cumulativeTotalRevenueUSD
            `;
    } else if (versionGroup === constants_1.Versions.Schema200) {
      queryString += `
            dailyVolumeUSD
            cumulativeVolumeUSD
            dailySupplySideRevenueUSD
            cumulativeSupplySideRevenueUSD
            dailyProtocolSideRevenueUSD
            cumulativeProtocolSideRevenueUSD
            dailyTotalRevenueUSD
            cumulativeTotalRevenueUSD
            `;
    } else {
      queryString += `
            dailyVolumeUSD
            cumulativeVolumeUSD
            dailySupplySideRevenueUSD
            cumulativeSupplySideRevenueUSD
            dailyProtocolSideRevenueUSD
            cumulativeProtocolSideRevenueUSD
            dailyTotalRevenueUSD
            cumulativeTotalRevenueUSD
            `;
    }
  } else if (protocolType === constants_1.ProtocolType.LENDING) {
    const versionGroupArr = schemaVersion.split(".");
    versionGroupArr.pop();
    const versionGroup = versionGroupArr.join(".") + ".0";
    if (versionGroup === constants_1.Versions.Schema130) {
      queryString += `
            dailySupplySideRevenueUSD
            cumulativeSupplySideRevenueUSD
            dailyProtocolSideRevenueUSD
            cumulativeProtocolSideRevenueUSD
            dailyTotalRevenueUSD
            cumulativeTotalRevenueUSD
            totalBorrowBalanceUSD
            dailyBorrowUSD
            cumulativeBorrowUSD
            totalDepositBalanceUSD
            dailyDepositUSD
            cumulativeDepositUSD
            dailyLiquidateUSD
            cumulativeLiquidateUSD
            mintedTokenSupplies
            `;
    } else if (versionGroup === constants_1.Versions.Schema200) {
      queryString += `
            dailySupplySideRevenueUSD
            cumulativeSupplySideRevenueUSD
            dailyProtocolSideRevenueUSD
            cumulativeProtocolSideRevenueUSD
            dailyTotalRevenueUSD
            cumulativeTotalRevenueUSD
            totalBorrowBalanceUSD
            dailyBorrowUSD
            cumulativeBorrowUSD
            totalDepositBalanceUSD
            dailyDepositUSD
            cumulativeDepositUSD
            dailyLiquidateUSD
            cumulativeLiquidateUSD
            mintedTokenSupplies
            `;
    } else {
      queryString += `
            dailySupplySideRevenueUSD
            cumulativeSupplySideRevenueUSD
            dailyProtocolSideRevenueUSD
            cumulativeProtocolSideRevenueUSD
            dailyTotalRevenueUSD
            cumulativeTotalRevenueUSD
            totalBorrowBalanceUSD
            dailyBorrowUSD
            cumulativeBorrowUSD
            totalDepositBalanceUSD
            dailyDepositUSD
            cumulativeDepositUSD
            dailyLiquidateUSD
            cumulativeLiquidateUSD
            mintedTokenSupplies
            `;
    }
  } else if (protocolType === constants_1.ProtocolType.YIELD) {
    const versionGroupArr = schemaVersion.split(".");
    versionGroupArr.pop();
    const versionGroup = versionGroupArr.join(".") + ".0";
    if (versionGroup === constants_1.Versions.Schema130) {
      queryString += `
            dailySupplySideRevenueUSD
            cumulativeSupplySideRevenueUSD
            dailyProtocolSideRevenueUSD
            cumulativeProtocolSideRevenueUSD
            dailyTotalRevenueUSD
            cumulativeTotalRevenueUSD
            `;
    } else {
      queryString += `
            dailySupplySideRevenueUSD
            cumulativeSupplySideRevenueUSD
            dailyProtocolSideRevenueUSD
            cumulativeProtocolSideRevenueUSD
            dailyTotalRevenueUSD
            cumulativeTotalRevenueUSD
            `;
    }
  } else {
    queryString += `
        totalValueLockedUSD
        dailySupplySideRevenueUSD
        cumulativeSupplySideRevenueUSD
        dailyProtocolSideRevenueUSD
        cumulativeProtocolSideRevenueUSD
        dailyTotalRevenueUSD
        cumulativeTotalRevenueUSD
        `;
  }
  queryString += `}
    }
    `;
  return (0, client_1.gql)`
    ${queryString}
  `;
};
