"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateCircularBuffer =
  exports.getRewardsPerDay =
  exports.WINDOW_SIZE_SECONDS_BD =
  exports.STARTING_BLOCKS_PER_DAY =
  exports.RATE_IN_SECONDS_BD =
  exports.RATE_IN_SECONDS =
  exports.RewardIntervalType =
  exports.CIRCULAR_BUFFER =
  exports.BUFFER_SIZE =
  exports.WINDOW_SIZE_SECONDS =
  exports.TIMESTAMP_STORAGE_INTERVAL =
  exports.WCROUSDC_ADDRESS =
  exports.ORACLE_ADDRESS =
  exports.tTONICAddress =
  exports.TONICAddress =
  exports.nativeCToken =
  exports.nativeToken =
  exports.comptrollerAddr =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
const mapping_1 = require("../../../src/mapping");
const schema_1 = require("../../../generated/schema");
const constants_2 = require("../../../src/constants");
//////////////////////////////
/////     Addresses      /////
//////////////////////////////
exports.comptrollerAddr = graph_ts_1.Address.fromString(
  "0xb3831584acb95ED9cCb0C11f677B5AD01DeaeEc0"
);
exports.nativeToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"),
  "Cronos",
  "CRO",
  18
);
exports.nativeCToken = new mapping_1.TokenData(
  graph_ts_1.Address.fromString("0xeAdf7c01DA7E93FdB5f16B0aa9ee85f978e89E95"),
  "Tectonic CRO",
  "tCRO",
  constants_1.cTokenDecimals
);
exports.TONICAddress = "0xDD73dEa10ABC2Bff99c60882EC5b2B81Bb1Dc5B2";
exports.tTONICAddress = "0xfe6934FDf050854749945921fAA83191Bccf20Ad";
exports.ORACLE_ADDRESS = "0x4B377121d968Bf7a62D51B96523d59506e7c2BF0";
exports.WCROUSDC_ADDRESS = "0xa68466208F1A3Eb21650320D2520ee8eBA5ba623";
/////////////////////
// VERSION 1.0.3 ////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// The purpose of this program is to dynamically estimate the blocks generated for the 24 HR period following the most recent update. //
// It does so by calculating the moving average block rate for an arbitrary length of time preceding the current block.               //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WINDOW_SIZE_SECONDS, TIMESTAMP_STORAGE_INTERVALS, and BUFFER_SIZE can be modified. These are just recommended values - 'somewhat' arbitrary. //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// The storage interval tells you to only store blocks where the timestamps are separated by at least this amount.
// Increasing this value will mean less blocks stored and less frequently computes blocksSpeed.
exports.TIMESTAMP_STORAGE_INTERVAL = 600;
// The window size determines the range of blocks that you track from the current block minus the window size.
// Window of block time used to calculate the moving average.
// Increasing means less deviation but also less sensitivity to changing block speeds.
exports.WINDOW_SIZE_SECONDS = 86400;
// BUFFER_SIZE determined the size of the array
// Makes the buffer the maximum amount of blocks that can be stored given the block rate and storage interval
// Recommended value is (RATE_IN_SECODNDS / TIMESTAMP_STORAGE_INTERVAL) * 2 - > Round up to nearest even integer
exports.BUFFER_SIZE = 288;
// Add this entity to the schema.
// type _CircularBuffer @entity {
//   " 'CIRCULAR_BUFFER' "
//   id: ID!
//   " Array of sorted block numbers sorted continuously "
//   blocks: [Int!]!
//   " The index in the blocks array which will be used with the newest block to calculate block speed (Usally set to about a day before newest block) "
//   windowStartIndex: Int!
//   " The next index in the blocks array that will be replaced with the newest block "
//   nextIndex: Int!
//   " This determines the size of the blocks array. Should be set to contain at least a days worth of blocks according to a 1 day window for measuring speed"
//   bufferSize: Int!
//   " The current calculated number of blocks per day based on calculated block speed "
//   blocksPerDay: BigDecimal!
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.CIRCULAR_BUFFER = "CIRCULAR_BUFFER";
// Describes whether the interval for which rewards are emitted is done by block or timestamp
var RewardIntervalType;
(function (RewardIntervalType) {
  RewardIntervalType.BLOCK = "BLOCK";
  RewardIntervalType.TIMESTAMP = "TIMESTAMP";
})(
  (RewardIntervalType =
    exports.RewardIntervalType || (exports.RewardIntervalType = {}))
);
// Forecast period. This gives you the time period that you want to estimate count of blocks per interval, based on moving average block speed.
// 86400 = 1 Day
exports.RATE_IN_SECONDS = 86400;
exports.RATE_IN_SECONDS_BD = graph_ts_1.BigDecimal.fromString(
  exports.RATE_IN_SECONDS.toString()
);
// Estimated seconds per block of the protocol
exports.STARTING_BLOCKS_PER_DAY = exports.RATE_IN_SECONDS_BD.div(
  getStartingBlockRate()
);
exports.WINDOW_SIZE_SECONDS_BD = graph_ts_1.BigDecimal.fromString(
  exports.WINDOW_SIZE_SECONDS.toString()
);
// Call this function in event handlers frequently enough so that it calls on blocks frequently enough
/**
 * @param {BigInt} currentTimestamp    - Timestamp for current event
 * @param {BigInt} currentBlockNumber  - Block nunmber of current event
 * @param {BigInt} rewardRate          - Rate of reward emissions per reward interval
 * @param {BigInt} rewardType          - Describes whether rewards are given per block or timestamp
 * @returns {BigDecimal}               - Returns estimated blocks for specified rate
 */
function getRewardsPerDay(
  currentTimestamp,
  currentBlockNumber,
  rewardRate,
  rewardType
) {
  const circularBuffer = getOrCreateCircularBuffer();
  // Create entity for the current block
  const currentTimestampI32 = currentTimestamp.toI32();
  const currentBlockNumberI32 = currentBlockNumber.toI32();
  const blocks = circularBuffer.blocks;
  // Interval between index and the index of the start of the window block
  const windowWidth = abs(
    circularBuffer.windowStartIndex - circularBuffer.nextIndex
  );
  if (windowWidth == constants_1.INT_ZERO) {
    if (circularBuffer.nextIndex >= circularBuffer.bufferSize) {
      blocks[constants_1.INT_ZERO] = currentTimestampI32;
      blocks[constants_1.INT_ONE] = currentBlockNumberI32;
      circularBuffer.nextIndex = constants_1.INT_TWO;
    } else {
      blocks[circularBuffer.nextIndex] = currentTimestampI32;
      blocks[circularBuffer.nextIndex + constants_1.INT_ONE] =
        currentBlockNumberI32;
      circularBuffer.nextIndex += constants_1.INT_TWO;
    }
    circularBuffer.save();
    // return because there is only 1 reference point.
    if (rewardType == RewardIntervalType.TIMESTAMP) {
      return rewardRate.times(exports.RATE_IN_SECONDS_BD);
    } else {
      return circularBuffer.blocksPerDay.times(rewardRate);
    }
  }
  // Add current timestamp and block numnber to array if new block is at least X blocks later than previously stored.
  // Used to save memory and efficiency on array resizing.
  let recentSavedTimestamp;
  if (circularBuffer.nextIndex == constants_1.INT_ZERO) {
    recentSavedTimestamp =
      blocks[circularBuffer.bufferSize - constants_1.INT_TWO];
  } else {
    recentSavedTimestamp =
      blocks[circularBuffer.nextIndex - constants_1.INT_TWO];
  }
  if (
    currentTimestampI32 - recentSavedTimestamp <=
    exports.TIMESTAMP_STORAGE_INTERVAL
  ) {
    if (rewardType == RewardIntervalType.TIMESTAMP) {
      return rewardRate.times(exports.RATE_IN_SECONDS_BD);
    } else {
      return circularBuffer.blocksPerDay.times(rewardRate);
    }
  }
  blocks[circularBuffer.nextIndex] = currentTimestampI32;
  blocks[circularBuffer.nextIndex + constants_1.INT_ONE] =
    currentBlockNumberI32;
  if (circularBuffer.nextIndex >= exports.BUFFER_SIZE - constants_1.INT_TWO) {
    circularBuffer.nextIndex = constants_1.INT_ZERO;
  } else {
    circularBuffer.nextIndex += constants_1.INT_TWO;
  }
  // The timestamp at the start of the window (default 24 hours in seconds).
  const startTimestamp = currentTimestampI32 - exports.WINDOW_SIZE_SECONDS;
  // Make sure to still have 2 blocks to calculate rate (This shouldn't happen past the beginning).
  while (true) {
    if (circularBuffer.nextIndex > circularBuffer.windowStartIndex) {
      if (
        circularBuffer.nextIndex - circularBuffer.windowStartIndex <=
        constants_1.INT_FOUR
      ) {
        break;
      }
    } else {
      if (
        exports.BUFFER_SIZE -
          circularBuffer.windowStartIndex +
          circularBuffer.nextIndex <=
        constants_1.INT_FOUR
      ) {
        break;
      }
    }
    const windowIndexBlockTimestamp = blocks[circularBuffer.windowStartIndex];
    // Shift the start of the window if the current timestamp moves out of desired rate window
    if (windowIndexBlockTimestamp < startTimestamp) {
      circularBuffer.windowStartIndex =
        circularBuffer.windowStartIndex + constants_1.INT_TWO;
      if (circularBuffer.windowStartIndex >= circularBuffer.bufferSize) {
        circularBuffer.windowStartIndex = constants_1.INT_ZERO;
      }
    } else {
      break;
    }
  }
  // Wideness of the window in seconds.
  const windowSecondsCount = graph_ts_1.BigDecimal.fromString(
    (currentTimestampI32 - blocks[circularBuffer.windowStartIndex]).toString()
  );
  // Wideness of the window in blocks.
  const windowBlocksCount = graph_ts_1.BigDecimal.fromString(
    (
      currentBlockNumberI32 -
      blocks[circularBuffer.windowStartIndex + constants_1.INT_ONE]
    ).toString()
  );
  // Estimate block speed for the window in seconds.
  const unnormalizedBlockSpeed =
    exports.WINDOW_SIZE_SECONDS_BD.div(windowSecondsCount).times(
      windowBlocksCount
    );
  // block speed converted to specified rate.
  const normalizedBlockSpeed = exports.RATE_IN_SECONDS_BD.div(
    exports.WINDOW_SIZE_SECONDS_BD
  ).times(unnormalizedBlockSpeed);
  // Update BlockTracker with new values.
  circularBuffer.blocksPerDay = normalizedBlockSpeed;
  circularBuffer.blocks = blocks;
  circularBuffer.save();
  if (rewardType == RewardIntervalType.TIMESTAMP) {
    return rewardRate.times(exports.RATE_IN_SECONDS_BD);
  } else {
    return rewardRate.times(circularBuffer.blocksPerDay);
  }
}
exports.getRewardsPerDay = getRewardsPerDay;
function getOrCreateCircularBuffer() {
  let circularBuffer = schema_1._CircularBuffer.load(exports.CIRCULAR_BUFFER);
  if (!circularBuffer) {
    circularBuffer = new schema_1._CircularBuffer(exports.CIRCULAR_BUFFER);
    const blocks = new Array(exports.BUFFER_SIZE);
    for (
      let i = constants_1.INT_ZERO;
      i < exports.BUFFER_SIZE;
      i += constants_1.INT_TWO
    ) {
      blocks[i] = constants_1.INT_NEGATIVE_ONE;
      blocks[i + constants_1.INT_ONE] = constants_1.INT_NEGATIVE_ONE;
    }
    circularBuffer.blocks = blocks;
    circularBuffer.windowStartIndex = constants_1.INT_ZERO;
    circularBuffer.nextIndex = constants_1.INT_ZERO;
    circularBuffer.bufferSize = exports.BUFFER_SIZE;
    circularBuffer.blocksPerDay = exports.STARTING_BLOCKS_PER_DAY;
    circularBuffer.save();
  }
  return circularBuffer;
}
exports.getOrCreateCircularBuffer = getOrCreateCircularBuffer;
function getStartingBlockRate() {
  // Block rates pulled from google searches - rough estimates
  if (
    graph_ts_1.dataSource.network().toUpperCase() == constants_2.Network.MAINNET
  ) {
    return graph_ts_1.BigDecimal.fromString("13.39");
  } else if (
    graph_ts_1.dataSource.network().toUpperCase() ==
    constants_2.Network.ARBITRUM_ONE
  ) {
    return graph_ts_1.BigDecimal.fromString("15");
  } else if (
    graph_ts_1.dataSource.network().toUpperCase() == constants_2.Network.AURORA
  ) {
    return graph_ts_1.BigDecimal.fromString("1.03");
  } else if (
    graph_ts_1.dataSource.network().toUpperCase() == constants_2.Network.BSC
  ) {
    return graph_ts_1.BigDecimal.fromString("5");
  } else if (
    graph_ts_1.dataSource.network().toUpperCase() == constants_2.Network.CELO
  ) {
    return graph_ts_1.BigDecimal.fromString("5");
  } else if (
    graph_ts_1.dataSource.network().toUpperCase() == constants_2.Network.FANTOM
  ) {
    return graph_ts_1.BigDecimal.fromString("1");
  } else if (
    graph_ts_1.dataSource.network().toUpperCase() == constants_2.Network.FUSE
  ) {
    return graph_ts_1.BigDecimal.fromString("1");
  } else if (
    graph_ts_1.dataSource.network().toUpperCase() ==
    constants_2.Network.OPTIMISM
  ) {
    return graph_ts_1.BigDecimal.fromString("12.5");
  } else if (
    graph_ts_1.dataSource.network().toUpperCase() == constants_2.Network.MATIC
  ) {
    return graph_ts_1.BigDecimal.fromString("2");
  } else if (
    graph_ts_1.dataSource.network().toUpperCase() == constants_2.Network.XDAI
  ) {
    return graph_ts_1.BigDecimal.fromString("5");
  } else if (
    graph_ts_1.dataSource.network().toUpperCase() ==
    constants_2.Network.MOONBEAM
  ) {
    return graph_ts_1.BigDecimal.fromString("13.39");
  } else if (
    graph_ts_1.dataSource.network().toUpperCase() ==
    constants_2.Network.MOONRIVER
  ) {
    return graph_ts_1.BigDecimal.fromString("13.39");
  } else if (
    graph_ts_1.dataSource.network().toUpperCase() ==
    constants_2.Network.AVALANCHE
  ) {
    return graph_ts_1.BigDecimal.fromString("13.39");
  } else if (
    graph_ts_1.dataSource.network().toUpperCase() == constants_2.Network.CRONOS
  ) {
    return graph_ts_1.BigDecimal.fromString("5.5");
  }
  // else if (network == SubgraphNetwork.AVALANCHE) return BigDecimal.fromString("2.5")
  // else if (dataSource.network().toUpperCase() == "harmony") return BigDecimal.fromString("13.39")
  else {
    graph_ts_1.log.warning("getStartingBlockRate(): Network not found", []);
    return constants_1.BIGDECIMAL_ZERO;
  }
}
