"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigIntToBigDecimal =
  exports.exponentToBigDecimal =
  exports.cTokenDecimalsBD =
  exports.mantissaFactorBD =
  exports.cTokenDecimals =
  exports.mantissaFactor =
  exports.ARBITRUM_BLOCKS_PER_YEAR =
  exports.MATIC_BLOCKS_PER_YEAR =
  exports.BSC_BLOCKS_PER_YEAR =
  exports.FANTOM_BLOCKS_PER_YEAR =
  exports.AVALANCHE_BLOCKS_PER_YEAR =
  exports.ETHEREUM_BLOCKS_PER_YEAR =
  exports.SECONDS_PER_HOUR =
  exports.SECONDS_PER_DAY =
  exports.SECONDS_PER_YEAR =
  exports.DAYS_PER_YEAR =
  exports.BIGDECIMAL_HUNDRED =
  exports.BIGDECIMAL_ONE =
  exports.BIGDECIMAL_ZERO =
  exports.BIGINT_TEN_TO_EIGHTEENTH =
  exports.BIGINT_THREE_HUNDRED =
  exports.BIGINT_HUNDRED =
  exports.BIGINT_ONE =
  exports.BIGINT_ZERO =
  exports.BIGINT_NEGATIVE_ONE =
  exports.INT_EIGHTTEEN =
  exports.INT_SIXTEEN =
  exports.INT_NINE =
  exports.INT_SIX =
  exports.INT_FOUR =
  exports.INT_TWO =
  exports.INT_ONE =
  exports.INT_ZERO =
  exports.INT_NEGATIVE_ONE =
  exports.Transaction =
  exports.RewardTokenType =
  exports.AccountActivity =
  exports.TransactionType =
  exports.OracleSource =
  exports.PositionSide =
  exports.FeeType =
  exports.InterestRateSide =
  exports.InterestRateType =
  exports.TokenType =
  exports.CollateralizationType =
  exports.RiskType =
  exports.PermissionType =
  exports.LendingType =
  exports.ProtocolType =
  exports.Network =
    void 0;
exports.ZERO_ADDRESS =
  exports.activityCounter =
  exports.insert =
  exports.BDChangeDecimals =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../../generated/schema");
////////////////////////
///// Schema Enums /////
////////////////////////
// The network names corresponding to the Network enum in the schema.
// They also correspond to the ones in `dataSource.network()` after converting to lower case.
// See below for a complete list:
// https://thegraph.com/docs/en/hosted-service/what-is-hosted-service/#supported-networks-on-the-hosted-service
var Network;
(function (Network) {
  Network.ARBITRUM_ONE = "ARBITRUM_ONE";
  Network.ARWEAVE_MAINNET = "ARWEAVE_MAINNET";
  Network.AURORA = "AURORA";
  Network.AVALANCHE = "AVALANCHE";
  Network.BOBA = "BOBA";
  Network.BSC = "BSC"; // aka BNB Chain
  Network.CELO = "CELO";
  Network.COSMOS = "COSMOS";
  Network.CRONOS = "CRONOS";
  Network.MAINNET = "MAINNET"; // Ethereum mainnet
  Network.FANTOM = "FANTOM";
  Network.FUSE = "FUSE";
  Network.HARMONY = "HARMONY";
  Network.JUNO = "JUNO";
  Network.MOONBEAM = "MOONBEAM";
  Network.MOONRIVER = "MOONRIVER";
  Network.NEAR_MAINNET = "NEAR_MAINNET";
  Network.OPTIMISM = "OPTIMISM";
  Network.OSMOSIS = "OSMOSIS";
  Network.MATIC = "MATIC"; // aka Polygon
  Network.XDAI = "XDAI"; // aka Gnosis Chain
})((Network = exports.Network || (exports.Network = {})));
var ProtocolType;
(function (ProtocolType) {
  ProtocolType.EXCHANGE = "EXCHANGE";
  ProtocolType.LENDING = "LENDING";
  ProtocolType.YIELD = "YIELD";
  ProtocolType.BRIDGE = "BRIDGE";
  ProtocolType.GENERIC = "GENERIC";
})((ProtocolType = exports.ProtocolType || (exports.ProtocolType = {})));
var LendingType;
(function (LendingType) {
  LendingType.CDP = "CDP";
  LendingType.POOLED = "POOLED";
})((LendingType = exports.LendingType || (exports.LendingType = {})));
var PermissionType;
(function (PermissionType) {
  PermissionType.WHITELIST_ONLY = "WHITELIST_ONLY";
  PermissionType.PERMISSIONED = "PERMISSIONED";
  PermissionType.PERMISSIONLESS = "PERMISSIONLESS";
  PermissionType.ADMIN = "ADMIN";
})((PermissionType = exports.PermissionType || (exports.PermissionType = {})));
var RiskType;
(function (RiskType) {
  RiskType.GLOBAL = "GLOBAL";
  RiskType.ISOLATED = "ISOLATED";
})((RiskType = exports.RiskType || (exports.RiskType = {})));
var CollateralizationType;
(function (CollateralizationType) {
  CollateralizationType.OVER_COLLATERALIZED = "OVER_COLLATERALIZED";
  CollateralizationType.UNDER_COLLATERALIZED = "UNDER_COLLATERALIZED";
  CollateralizationType.UNCOLLATERALIZED = "UNCOLLATERALIZED";
})(
  (CollateralizationType =
    exports.CollateralizationType || (exports.CollateralizationType = {}))
);
var TokenType;
(function (TokenType) {
  TokenType.REBASING = "REBASING";
  TokenType.NON_REBASING = "NON_REBASING";
})((TokenType = exports.TokenType || (exports.TokenType = {})));
var InterestRateType;
(function (InterestRateType) {
  InterestRateType.STABLE = "STABLE";
  InterestRateType.VARIABLE = "VARIABLE";
  InterestRateType.FIXED = "FIXED";
})(
  (InterestRateType =
    exports.InterestRateType || (exports.InterestRateType = {}))
);
var InterestRateSide;
(function (InterestRateSide) {
  InterestRateSide.LENDER = "LENDER";
  InterestRateSide.BORROWER = "BORROWER";
})(
  (InterestRateSide =
    exports.InterestRateSide || (exports.InterestRateSide = {}))
);
var FeeType;
(function (FeeType) {
  FeeType.LIQUIDATION_FEE = "LIQUIDATION_FEE";
  FeeType.ADMIN_FEE = "ADMIN_FEE";
  FeeType.PROTOCOL_FEE = "PROTOCOL_FEE";
  FeeType.MINT_FEE = "MINT_FEE";
  FeeType.WITHDRAW_FEE = "WITHDRAW_FEE";
  FeeType.FLASHLOAN_PROTOCOL_FEE = "FLASHLOAN_PROTOCOL_FEE";
  FeeType.FLASHLOAN_LP_FEE = "FLASHLOAN_LP_FEE";
  FeeType.OTHER = "OTHER";
})((FeeType = exports.FeeType || (exports.FeeType = {})));
var PositionSide;
(function (PositionSide) {
  PositionSide.COLLATERAL = "COLLATERAL";
  PositionSide.BORROWER = "BORROWER";
})((PositionSide = exports.PositionSide || (exports.PositionSide = {})));
var OracleSource;
(function (OracleSource) {
  OracleSource.UNISWAP = "UNISWAP";
  OracleSource.BALANCER = "BALANCER";
  OracleSource.CHAINLINK = "CHAINLINK";
  OracleSource.YEARN = "YEARN";
  OracleSource.SUSHISWAP = "SUSHISWAP";
  OracleSource.CURVE = "CURVE";
})((OracleSource = exports.OracleSource || (exports.OracleSource = {})));
var TransactionType;
(function (TransactionType) {
  TransactionType.DEPOSIT = "DEPOSIT";
  TransactionType.WITHDRAW = "WITHDRAW";
  TransactionType.BORROW = "BORROW";
  TransactionType.REPAY = "REPAY";
  TransactionType.LIQUIDATE = "LIQUIDATE";
  TransactionType.TRANSFER = "TRANSFER";
  TransactionType.FLASHLOAN = "FLASHLOAN";
  TransactionType.LIQUIDATOR = "LIQUIDATOR";
  TransactionType.LIQUIDATEE = "LIQUIDATEE";
})(
  (TransactionType = exports.TransactionType || (exports.TransactionType = {}))
);
var AccountActivity;
(function (AccountActivity) {
  AccountActivity.DAILY = "DAILY";
  AccountActivity.HOURLY = "HOURLY";
})(
  (AccountActivity = exports.AccountActivity || (exports.AccountActivity = {}))
);
var RewardTokenType;
(function (RewardTokenType) {
  RewardTokenType.DEPOSIT = "DEPOSIT";
  RewardTokenType.VARIABLE_BORROW = "VARIABLE_BORROW";
  RewardTokenType.STABLE_BORROW = "STABLE_BORROW";
  RewardTokenType.STAKE = "STAKE";
})(
  (RewardTokenType = exports.RewardTokenType || (exports.RewardTokenType = {}))
);
var Transaction;
(function (Transaction) {
  Transaction[(Transaction["DEPOSIT"] = 0)] = "DEPOSIT";
  Transaction[(Transaction["WITHDRAW"] = 1)] = "WITHDRAW";
  Transaction[(Transaction["BORROW"] = 2)] = "BORROW";
  Transaction[(Transaction["REPAY"] = 3)] = "REPAY";
  Transaction[(Transaction["LIQUIDATE"] = 4)] = "LIQUIDATE";
  Transaction[(Transaction["TRANSFER"] = 5)] = "TRANSFER";
  Transaction[(Transaction["FLASHLOAN"] = 6)] = "FLASHLOAN";
})((Transaction = exports.Transaction || (exports.Transaction = {})));
////////////////////////
///// Type Helpers /////
////////////////////////
exports.INT_NEGATIVE_ONE = -1;
exports.INT_ZERO = 0;
exports.INT_ONE = 1;
exports.INT_TWO = 2;
exports.INT_FOUR = 4;
exports.INT_SIX = 6;
exports.INT_NINE = 9;
exports.INT_SIXTEEN = 16;
exports.INT_EIGHTTEEN = 18;
exports.BIGINT_NEGATIVE_ONE = graph_ts_1.BigInt.fromI32(-1);
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_HUNDRED = graph_ts_1.BigInt.fromI32(100);
exports.BIGINT_THREE_HUNDRED = graph_ts_1.BigInt.fromI32(300);
exports.BIGINT_TEN_TO_EIGHTEENTH = graph_ts_1.BigInt.fromString("10").pow(18);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
exports.BIGDECIMAL_HUNDRED = new graph_ts_1.BigDecimal(
  graph_ts_1.BigInt.fromI32(100)
);
/////////////////////
///// Date/Time /////
/////////////////////
exports.DAYS_PER_YEAR = 365;
exports.SECONDS_PER_YEAR = 60 * 60 * 24 * exports.DAYS_PER_YEAR;
exports.SECONDS_PER_DAY = 60 * 60 * 24; // 86400
exports.SECONDS_PER_HOUR = 60 * 60; // 3600
exports.ETHEREUM_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 13; // 13 = seconds per block
exports.AVALANCHE_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 2; // 2 = seconds per block. This is NOT ideal since avalanche has variable block time.
exports.FANTOM_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 1; // 1 = seconds per block. This is NOT ideal since fantom has variable block time.
exports.BSC_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 3; // 3 = seconds per block
exports.MATIC_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 2; // 2 = seconds per block
exports.ARBITRUM_BLOCKS_PER_YEAR = exports.SECONDS_PER_YEAR / 1; // 1 = seconds per block.
/////////////////////////////
/////        Math       /////
/////////////////////////////
exports.mantissaFactor = 18;
exports.cTokenDecimals = 8;
exports.mantissaFactorBD = exponentToBigDecimal(exports.mantissaFactor);
exports.cTokenDecimalsBD = exponentToBigDecimal(exports.cTokenDecimals);
// n => 10^n
function exponentToBigDecimal(decimals) {
  let result = exports.BIGINT_ONE;
  const ten = graph_ts_1.BigInt.fromI32(10);
  for (let i = 0; i < decimals; i++) {
    result = result.times(ten);
  }
  return result.toBigDecimal();
}
exports.exponentToBigDecimal = exponentToBigDecimal;
// BigInt to BigDecimal
function bigIntToBigDecimal(x, decimals) {
  return x.toBigDecimal().div(exponentToBigDecimal(decimals));
}
exports.bigIntToBigDecimal = bigIntToBigDecimal;
//change number of decimals for BigDecimal
function BDChangeDecimals(x, from, to) {
  if (to > from) {
    // increase number of decimals
    const diffMagnitude = exponentToBigDecimal(to - from);
    return x.times(diffMagnitude);
  } else if (to < from) {
    // decrease number of decimals
    const diffMagnitude = exponentToBigDecimal(from - to);
    return x.div(diffMagnitude);
  } else {
    return x;
  }
}
exports.BDChangeDecimals = BDChangeDecimals;
// insert value into arr at index
function insert(arr, value, index = -1) {
  if (arr.length == 0) {
    return [value];
  }
  if (index == -1 || index > arr.length) {
    index = arr.length;
  }
  const result = [];
  for (let i = 0; i < index; i++) {
    result.push(arr[i]);
  }
  result.push(value);
  for (let i = index; i < arr.length; i++) {
    result.push(arr[i]);
  }
  return result;
}
exports.insert = insert;
// returns the increment to update the usage activity by
// 1 for a new account in the specified period, otherwise 0
function activityCounter(
  account,
  transactionType,
  useTransactionType,
  intervalID, // 0 = no intervalID
  marketID = null
) {
  let activityID = account
    .toHexString()
    .concat("-")
    .concat(intervalID.toString());
  if (marketID) {
    activityID = activityID.concat("-").concat(marketID.toHexString());
  }
  if (useTransactionType) {
    activityID = activityID.concat("-").concat(transactionType);
  }
  let activeAccount = schema_1._ActiveAccount.load(activityID);
  if (!activeAccount) {
    // if account / market only + transactionType is LIQUIDATEE
    // then do not count that account as it did not spend gas to use the protocol
    if (!useTransactionType && transactionType == TransactionType.LIQUIDATEE) {
      return exports.INT_ZERO;
    }
    activeAccount = new schema_1._ActiveAccount(activityID);
    activeAccount.save();
    return exports.INT_ONE;
  }
  return exports.INT_ZERO;
}
exports.activityCounter = activityCounter;
/////////////////////////////
/////     Addresses     /////
/////////////////////////////
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
