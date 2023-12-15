"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProtocol = void 0;
const schema_1 = require("../../generated/schema");
const const_1 = require("../utils/const");
const protocol_1 = require("../helpers/protocol");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const token_1 = require("../helpers/token");
function updateProtocol() {
  const protocol = (0, protocol_1.getOrCreateProtocol)();
  protocol.totalValueLockedUSD = const_1.BD_ZERO;
  protocol.cumulativeSupplySideRevenueUSD = const_1.BD_ZERO;
  protocol.cumulativeProtocolSideRevenueUSD = const_1.BD_ZERO;
  protocol.cumulativeTotalRevenueUSD = const_1.BD_ZERO;
  protocol.totalDepositBalanceUSD = const_1.BD_ZERO;
  protocol.cumulativeDepositUSD = const_1.BD_ZERO;
  protocol.totalBorrowBalanceUSD = const_1.BD_ZERO;
  protocol.cumulativeBorrowUSD = const_1.BD_ZERO;
  protocol.cumulativeLiquidateUSD = const_1.BD_ZERO;
  protocol.openPositionCount = 0;
  protocol.cumulativePositionCount = 0;
  for (let i = 0; i < protocol._marketIds.length; i++) {
    const market = schema_1.Market.load(protocol._marketIds[i]);
    if (market) {
      const token = (0, token_1.getOrCreateToken)(market.inputToken);
      // totalValueLockedUSD
      protocol.totalValueLockedUSD = protocol.totalValueLockedUSD
        .plus(market.totalValueLockedUSD)
        .plus(
          market._totalReserved.times(market.inputTokenPriceUSD).div(
            graph_ts_1.BigInt.fromI32(10)
              .pow(token.decimals + token.extraDecimals)
              .toBigDecimal()
          )
        );
      // cumulativeSupplySideRevenueUSD
      protocol.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.plus(
          market.cumulativeSupplySideRevenueUSD
        );
      // cumulativeProtocolSideRevenueUSD
      protocol.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD.plus(
          market.cumulativeProtocolSideRevenueUSD
        );
      // cumulativeTotalRevenueUSD
      protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(
          market.cumulativeTotalRevenueUSD
        );
      // totalDepositBalanceUSD
      protocol.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD.plus(
        market.totalDepositBalanceUSD
      );
      // cumulativeDepositUSD
      protocol.cumulativeDepositUSD = protocol.cumulativeDepositUSD.plus(
        market.cumulativeDepositUSD
      );
      // totalBorrowBalanceUSD
      protocol.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD.plus(
        market.totalBorrowBalanceUSD
      );
      // cumulativeBorrowUSD
      protocol.cumulativeBorrowUSD = protocol.cumulativeBorrowUSD.plus(
        market.cumulativeBorrowUSD
      );
      // cumulativeLiquidateUSD
      protocol.cumulativeLiquidateUSD = protocol.cumulativeLiquidateUSD.plus(
        market.cumulativeLiquidateUSD
      );
      // openPositionCount
      protocol.openPositionCount =
        protocol.openPositionCount + market.openPositionCount;
      // cumulativePositionCount
      protocol.cumulativePositionCount =
        protocol.cumulativePositionCount +
        market.openPositionCount +
        market.closedPositionCount;
    }
  }
  protocol.save();
}
exports.updateProtocol = updateProtocol;
