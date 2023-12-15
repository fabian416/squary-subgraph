"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcuateFlashLoanPremiumToLPUSD =
  exports.getFlashloanPremiumAmount =
  exports.getInterestRateType =
  exports.equalsIgnoreCase =
  exports.exponentToBigDecimal =
  exports.wadToRay =
  exports.rayToWad =
  exports.readValue =
  exports.restorePrePauseState =
  exports.storePrePauseState =
  exports.getOrCreateFlashloanPremium =
  exports.getTreasuryAddress =
  exports.getPrincipal =
  exports.getCollateralBalance =
  exports.getBorrowBalances =
  exports.getMarketFromToken =
  exports.getMarketByAuxillaryToken =
    void 0;
// Helpers for the general mapping.ts file
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../generated/schema");
const constants_1 = require("./constants");
const AToken_1 = require("../generated/LendingPool/AToken");
const StableDebtToken_1 = require("../generated/LendingPool/StableDebtToken");
const VariableDebtToken_1 = require("../generated/LendingPool/VariableDebtToken");
const constants_2 = require("./sdk/constants");
// returns the market based on any auxillary token
// ie, outputToken, vToken, or sToken
function getMarketByAuxillaryToken(auxillaryToken, protocolData) {
  const marketList = schema_1._MarketList.load(protocolData.protocolID);
  if (!marketList) {
    graph_ts_1.log.warning(
      "[getMarketByAuxillaryToken]marketList not found for id {}",
      [protocolData.protocolID.toHexString()]
    );
    return null;
  }
  for (let i = 0; i < marketList.markets.length; i++) {
    const market = schema_1.Market.load(marketList.markets[i]);
    if (!market) {
      continue;
    }
    if (market.outputToken && market.outputToken.equals(auxillaryToken)) {
      // we found a matching market!
      return market;
    }
    if (market._vToken && market._vToken.equals(auxillaryToken)) {
      return market;
    }
    if (market._sToken && market._sToken.equals(auxillaryToken)) {
      return market;
    }
  }
  return null; // no market found
}
exports.getMarketByAuxillaryToken = getMarketByAuxillaryToken;
// this is more efficient than getMarketByAuxillaryToken()
// but requires a token._market field
function getMarketFromToken(tokenAddress, protocolData) {
  const token = schema_1.Token.load(tokenAddress);
  if (!token) {
    graph_ts_1.log.error("[getMarketFromToken] token {} not exist", [
      tokenAddress.toHexString(),
    ]);
    return null;
  }
  if (!token._market) {
    graph_ts_1.log.warning("[getMarketFromToken] token {} _market = null", [
      tokenAddress.toHexString(),
    ]);
    return getMarketByAuxillaryToken(tokenAddress, protocolData);
  }
  const marketId = graph_ts_1.Address.fromBytes(token._market);
  const market = schema_1.Market.load(marketId);
  return market;
}
exports.getMarketFromToken = getMarketFromToken;
function getBorrowBalances(market, account) {
  let sDebtTokenBalance = constants_1.BIGINT_ZERO;
  let vDebtTokenBalance = constants_1.BIGINT_ZERO;
  // get account's balance of variable debt
  if (market._vToken) {
    const vTokenContract = AToken_1.AToken.bind(
      graph_ts_1.Address.fromBytes(market._vToken)
    );
    const tryVDebtTokenBalance = vTokenContract.try_balanceOf(account);
    vDebtTokenBalance = tryVDebtTokenBalance.reverted
      ? constants_1.BIGINT_ZERO
      : tryVDebtTokenBalance.value;
  }
  // get account's balance of stable debt
  if (market._sToken) {
    const sTokenContract = AToken_1.AToken.bind(
      graph_ts_1.Address.fromBytes(market._sToken)
    );
    const trySDebtTokenBalance = sTokenContract.try_balanceOf(account);
    sDebtTokenBalance = trySDebtTokenBalance.reverted
      ? constants_1.BIGINT_ZERO
      : trySDebtTokenBalance.value;
  }
  return [sDebtTokenBalance, vDebtTokenBalance];
}
exports.getBorrowBalances = getBorrowBalances;
function getCollateralBalance(market, account) {
  const collateralBalance = constants_1.BIGINT_ZERO;
  const aTokenContract = AToken_1.AToken.bind(
    graph_ts_1.Address.fromBytes(market.outputToken)
  );
  const balanceResult = aTokenContract.try_balanceOf(account);
  if (balanceResult.reverted) {
    graph_ts_1.log.warning(
      "[getCollateralBalance]failed to get aToken {} balance for {}",
      [market.outputToken.toHexString(), account.toHexString()]
    );
    return collateralBalance;
  }
  return balanceResult.value;
}
exports.getCollateralBalance = getCollateralBalance;
function getPrincipal(market, account, side, interestRateType = null) {
  if (side == constants_2.PositionSide.COLLATERAL) {
    const aTokenContract = AToken_1.AToken.bind(
      graph_ts_1.Address.fromBytes(market.outputToken)
    );
    const scaledBalanceResult = aTokenContract.try_scaledBalanceOf(account);
    if (scaledBalanceResult.reverted) {
      graph_ts_1.log.warning(
        "[getPrincipal]failed to get aToken {} scaledBalance for {}",
        [market.outputToken.toHexString(), account.toHexString()]
      );
      return null;
    }
    return scaledBalanceResult.value;
  } else if (side == constants_2.PositionSide.BORROWER && interestRateType) {
    if (interestRateType == constants_2.InterestRateType.STABLE) {
      const stableDebtTokenContract = StableDebtToken_1.StableDebtToken.bind(
        graph_ts_1.Address.fromBytes(market._sToken)
      );
      const principalBalanceResult =
        stableDebtTokenContract.try_principalBalanceOf(account);
      if (principalBalanceResult.reverted) {
        graph_ts_1.log.warning(
          "[getPrincipal]failed to get stableDebtToken {} principalBalance for {}",
          [market._sToken.toHexString(), account.toHexString()]
        );
        return null;
      }
      return principalBalanceResult.value;
    } else if (interestRateType == constants_2.InterestRateType.VARIABLE) {
      const variableDebtTokenContract =
        VariableDebtToken_1.VariableDebtToken.bind(
          graph_ts_1.Address.fromBytes(market._vToken)
        );
      const scaledBalanceResult =
        variableDebtTokenContract.try_scaledBalanceOf(account);
      if (scaledBalanceResult.reverted) {
        graph_ts_1.log.warning(
          "[getPrincipal]failed to get variableDebtToken {} scaledBalance for {}",
          [market._vToken.toHexString(), account.toHexString()]
        );
        return null;
      }
      return scaledBalanceResult.value;
    }
  }
  return null;
}
exports.getPrincipal = getPrincipal;
function getTreasuryAddress(market) {
  const aTokenContract = AToken_1.AToken.bind(
    graph_ts_1.Address.fromBytes(market.outputToken)
  );
  const tryTreasuryAddress = aTokenContract.try_RESERVE_TREASURY_ADDRESS();
  if (tryTreasuryAddress.reverted) {
    graph_ts_1.log.warning(
      "[getTreasuryAddress] Error getting treasury address on aToken: {}",
      [market.outputToken.toHexString()]
    );
    return graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS);
  }
  return tryTreasuryAddress.value;
}
exports.getTreasuryAddress = getTreasuryAddress;
function getOrCreateFlashloanPremium(procotolData) {
  let flashloanPremium = schema_1._FlashLoanPremium.load(
    procotolData.protocolID
  );
  if (!flashloanPremium) {
    flashloanPremium = new schema_1._FlashLoanPremium(procotolData.protocolID);
    flashloanPremium.premiumRateTotal = constants_1.BIGDECIMAL_ZERO;
    flashloanPremium.premiumRateToProtocol = constants_1.BIGDECIMAL_ZERO;
    flashloanPremium.save();
  }
  return flashloanPremium;
}
exports.getOrCreateFlashloanPremium = getOrCreateFlashloanPremium;
function storePrePauseState(market) {
  market._prePauseState = [
    market.isActive,
    market.canUseAsCollateral,
    market.canBorrowFrom,
  ];
  market.save();
}
exports.storePrePauseState = storePrePauseState;
function restorePrePauseState(market) {
  if (
    !market._prePauseState ||
    market._prePauseState.length !== constants_2.INT_THREE
  ) {
    graph_ts_1.log.error(
      "[restorePrePauseState] _prePauseState for market {} is not set correctly",
      [market.id.toHexString()]
    );
    return;
  }
  market.isActive = market._prePauseState[0];
  market.canUseAsCollateral = market._prePauseState[1];
  market.canBorrowFrom = market._prePauseState[2];
  market.save();
}
exports.restorePrePauseState = restorePrePauseState;
function readValue(callResult, defaultValue) {
  return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
function rayToWad(a) {
  const halfRatio = graph_ts_1.BigInt.fromI32(constants_2.INT_TEN)
    .pow(constants_2.INT_NINE)
    .div(graph_ts_1.BigInt.fromI32(constants_1.INT_TWO));
  return halfRatio
    .plus(a)
    .div(
      graph_ts_1.BigInt.fromI32(constants_2.INT_TEN).pow(constants_2.INT_NINE)
    );
}
exports.rayToWad = rayToWad;
function wadToRay(a) {
  const result = a.times(
    graph_ts_1.BigInt.fromI32(constants_2.INT_TEN).pow(constants_2.INT_NINE)
  );
  return result;
}
exports.wadToRay = wadToRay;
// n => 10^n
function exponentToBigDecimal(decimals) {
  let result = constants_1.BIGINT_ONE;
  const ten = graph_ts_1.BigInt.fromI32(constants_2.INT_TEN);
  for (let i = 0; i < decimals; i++) {
    result = result.times(ten);
  }
  return result.toBigDecimal();
}
exports.exponentToBigDecimal = exponentToBigDecimal;
function equalsIgnoreCase(a, b) {
  const DASH = "-";
  const UNDERSCORE = "_";
  return (
    a.replace(DASH, UNDERSCORE).toLowerCase() ==
    b.replace(DASH, UNDERSCORE).toLowerCase()
  );
}
exports.equalsIgnoreCase = equalsIgnoreCase;
// Use the Transfer event before Repay event to detect interestRateType
// We cannot use Burn event because a Repay event may actually mint
// new debt token if the repay amount is less than interest accrued
// e.g. https://polygonscan.com/tx/0x29d7eb7599c35cd6435f29cad40189a4385044c3e56e4bc4fb6b7d34cab451db#eventlog (v2)
// Transfer(): 158; Repay(): 163
// https://optimistic.etherscan.io/tx/0x80d53af69fcaf1852a2bd43b81285e9b6113e5a52fdc74d68cac8828797c9bec#eventlog (v3)
// Transfer(): 0; Repay: 5
function getInterestRateType(event) {
  const TRANSFER = "Transfer(address,address,uint256)";
  const eventSignature = graph_ts_1.crypto.keccak256(
    graph_ts_1.ByteArray.fromUTF8(TRANSFER)
  );
  const logs = event.receipt.logs;
  // Transfer emitted at 4 or 5 index ahead of Repay's event.logIndex
  const logIndexMinus5 = event.logIndex.minus(
    graph_ts_1.BigInt.fromI32(constants_2.INT_FIVE)
  );
  const logIndexMinus3 = event.logIndex.minus(
    graph_ts_1.BigInt.fromI32(constants_2.INT_THREE)
  );
  for (let i = 0; i < logs.length; i++) {
    const thisLog = logs[i];
    if (thisLog.topics.length >= constants_2.INT_THREE) {
      if (thisLog.logIndex.lt(logIndexMinus5)) {
        // skip event with logIndex < LogIndexMinus5
        continue;
      }
      if (thisLog.logIndex.equals(logIndexMinus3)) {
        // break if the logIndex = event.logIndex - 3
        break;
      }
      // topics[0] - signature
      const ADDRESS = "address";
      const logSignature = thisLog.topics[0];
      if (logSignature.equals(eventSignature)) {
        const from = graph_ts_1.ethereum
          .decode(ADDRESS, thisLog.topics.at(1))
          .toAddress();
        const to = graph_ts_1.ethereum
          .decode(ADDRESS, thisLog.topics.at(2))
          .toAddress();
        if (
          from.equals(graph_ts_1.Address.zero()) ||
          to.equals(graph_ts_1.Address.zero())
        ) {
          // this is a burn or mint event
          const tokenAddress = thisLog.address;
          const token = schema_1.Token.load(tokenAddress);
          if (!token) {
            graph_ts_1.log.error(
              "[getInterestRateType]token {} not found tx {}-{}",
              [
                tokenAddress.toHexString(),
                event.transaction.hash.toHexString(),
                event.transactionLogIndex.toString(),
              ]
            );
            return null;
          }
          if (token._iavsTokenType == constants_1.IavsTokenType.STOKEN) {
            return constants_2.InterestRateType.STABLE;
          }
          if (token._iavsTokenType == constants_1.IavsTokenType.VTOKEN) {
            return constants_2.InterestRateType.VARIABLE;
          }
        }
      }
      graph_ts_1.log.info(
        "[getInterestRateType]event at logIndex {} signature {} not match the exepected Transfer signature {}. tx {}-{} ",
        [
          thisLog.logIndex.toString(),
          logSignature.toHexString(),
          eventSignature.toHexString(),
          event.transaction.hash.toHexString(),
          event.transactionLogIndex.toString(),
        ]
      );
    }
  }
  return null;
}
exports.getInterestRateType = getInterestRateType;
function getFlashloanPremiumAmount(event, assetAddress) {
  let flashloanPremiumAmount = constants_1.BIGINT_ZERO;
  const FLASHLOAN =
    "FlashLoan(address,address,address,uint256,uint8,uint256,uint16)";
  const eventSignature = graph_ts_1.crypto.keccak256(
    graph_ts_1.ByteArray.fromUTF8(FLASHLOAN)
  );
  const logs = event.receipt.logs;
  //ReserveDataUpdated emitted before Flashloan's event.logIndex
  // e.g. https://etherscan.io/tx/0xeb87ebc0a18aca7d2a9ffcabf61aa69c9e8d3c6efade9e2303f8857717fb9eb7#eventlog
  const ReserveDateUpdatedEventLogIndex = event.logIndex;
  for (let i = 0; i < logs.length; i++) {
    const thisLog = logs[i];
    if (thisLog.topics.length >= constants_2.INT_THREE) {
      if (thisLog.logIndex.le(ReserveDateUpdatedEventLogIndex)) {
        // skip log before ReserveDataUpdated
        continue;
      }
      //FlashLoan Event equals ReserveDateUpdatedEventLogIndex + 2 or 3 (there may be an Approval event)
      if (
        thisLog.logIndex.gt(
          ReserveDateUpdatedEventLogIndex.plus(constants_1.BIGINT_THREE)
        )
      ) {
        // skip if no matched FlashLoan event at ReserveDateUpdatedEventLogIndex+3
        break;
      }
      // topics[0] - signature
      const ADDRESS = "address";
      const DATA_TYPE_TUPLE = "(address,uint256,uint8,uint256)";
      const logSignature = thisLog.topics[0];
      if (thisLog.address == event.address && logSignature == eventSignature) {
        graph_ts_1.log.info(
          "[getFlashloanPremiumAmount]tx={}-{} thisLog.logIndex={} thisLog.topics=(1:{},2:{}),thisLog.data={}",
          [
            event.transaction.hash.toHexString(),
            event.logIndex.toString(),
            thisLog.logIndex.toString(),
            thisLog.topics.at(1).toHexString(),
            thisLog.topics.at(2).toHexString(),
            thisLog.data.toHexString(),
          ]
        );
        const flashLoanAssetAddress = graph_ts_1.ethereum
          .decode(ADDRESS, thisLog.topics.at(2))
          .toAddress();
        if (flashLoanAssetAddress.notEqual(assetAddress)) {
          //
          continue;
        }
        const decoded = graph_ts_1.ethereum.decode(
          DATA_TYPE_TUPLE,
          thisLog.data
        );
        if (!decoded) continue;
        const logData = decoded.toTuple();
        flashloanPremiumAmount = logData[3].toBigInt();
        break;
      }
    }
  }
  return flashloanPremiumAmount;
}
exports.getFlashloanPremiumAmount = getFlashloanPremiumAmount;
// flashLoanPremiumRateToProtocol is rate of flashLoan premium directly accrue to
// protocol treasury
function calcuateFlashLoanPremiumToLPUSD(
  flashLoanPremiumUSD,
  flashLoanPremiumRateToProtocol
) {
  let premiumToLPUSD = constants_1.BIGDECIMAL_ZERO;
  if (flashLoanPremiumRateToProtocol.gt(constants_1.BIGDECIMAL_ZERO)) {
    // according to https://github.com/aave/aave-v3-core/blob/29ff9b9f89af7cd8255231bc5faf26c3ce0fb7ce/contracts/interfaces/IPool.sol#L634
    // premiumRateToProtocol is the percentage (bps) of premium to protocol
    premiumToLPUSD = flashLoanPremiumUSD.minus(
      flashLoanPremiumUSD.times(flashLoanPremiumRateToProtocol)
    );
  }
  return premiumToLPUSD;
}
exports.calcuateFlashLoanPremiumToLPUSD = calcuateFlashLoanPremiumToLPUSD;
