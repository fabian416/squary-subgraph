"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMasterChefTotalAllocation =
  exports.getOrCreateMasterChefStakingPool =
  exports.getOrCreateMasterChef =
  exports.createMasterChefStakingPool =
    void 0;
const schema_1 = require("../../../generated/schema");
const constants = __importStar(require("../constants"));
const initializers_1 = require("../initializers");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function createMasterChefStakingPool(event, masterChefType, pid, poolAddress) {
  const masterChefPool = new schema_1._MasterChefStakingPool(
    masterChefType + "-" + pid.toString()
  );
  masterChefPool.poolAddress = poolAddress.toHexString();
  masterChefPool.multiplier = constants.BIGINT_ONE;
  masterChefPool.poolAllocPoint = constants.BIGINT_ZERO;
  masterChefPool.lastRewardBlock = event.block.number;
  graph_ts_1.log.warning("MASTERCHEF POOL CREATED: " + pid.toString(), []);
  const pool = schema_1.LiquidityPool.load(masterChefPool.poolAddress);
  if (pool) {
    pool.rewardTokens = [
      (0, initializers_1.getOrCreateToken)(
        constants.PROTOCOL_TOKEN_ADDRESS,
        event.block.number
      ).id,
    ];
    pool.save();
  }
  masterChefPool.save();
  return masterChefPool;
}
exports.createMasterChefStakingPool = createMasterChefStakingPool;
// Create the masterchef contract that contains data used to calculate rewards for all pools.
function getOrCreateMasterChef(event, masterChefType) {
  let masterChef = schema_1._MasterChef.load(masterChefType);
  if (!masterChef) {
    masterChef = new schema_1._MasterChef(masterChefType);
    masterChef.totalAllocPoint = constants.BIGINT_ZERO;
    masterChef.rewardTokenInterval = constants.INFLATION_INTERVAL;
    masterChef.rewardTokenRate = graph_ts_1.BigInt.fromString(
      constants.STARTING_INFLATION_RATE.toString()
    );
    graph_ts_1.log.warning("MasterChef Type: " + masterChefType, []);
    masterChef.adjustedRewardTokenRate = graph_ts_1.BigInt.fromString(
      constants.STARTING_INFLATION_RATE.toString()
    );
    masterChef.lastUpdatedRewardRate = constants.BIGINT_ZERO;
    masterChef.save();
  }
  return masterChef;
}
exports.getOrCreateMasterChef = getOrCreateMasterChef;
// Create a MasterChefStaking pool using the MasterChef pid for id.
function getOrCreateMasterChefStakingPool(event, masterChefType, pid) {
  let masterChefPool = schema_1._MasterChefStakingPool.load(
    masterChefType + "-" + pid.toString()
  );
  // Create entity to track masterchef pool mappings
  if (!masterChefPool) {
    masterChefPool = new schema_1._MasterChefStakingPool(
      masterChefType + "-" + pid.toString()
    );
    masterChefPool.multiplier = constants.BIGINT_ONE;
    masterChefPool.poolAllocPoint = constants.BIGINT_ZERO;
    masterChefPool.lastRewardBlock = event.block.number;
    graph_ts_1.log.warning("MASTERCHEF POOL CREATED: " + pid.toString(), []);
    masterChefPool.save();
  }
  return masterChefPool;
}
exports.getOrCreateMasterChefStakingPool = getOrCreateMasterChefStakingPool;
// Update the total allocation for all pools whenever the allocation points are updated for a pool.
function updateMasterChefTotalAllocation(
  event,
  oldPoolAlloc,
  newPoolAlloc,
  masterChefType
) {
  const masterChef = getOrCreateMasterChef(event, masterChefType);
  masterChef.totalAllocPoint = masterChef.totalAllocPoint.plus(
    newPoolAlloc.minus(oldPoolAlloc)
  );
  masterChef.save();
}
exports.updateMasterChefTotalAllocation = updateMasterChefTotalAllocation;
