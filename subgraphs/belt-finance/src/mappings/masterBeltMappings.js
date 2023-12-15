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
exports.handleWithdraw = exports.handleDeposit = void 0;
const Rewards_1 = require("../modules/Rewards");
const utils = __importStar(require("../common/utils"));
const MasterBelt_1 = require("../../generated/MasterBelt/MasterBelt");
function handleDeposit(event) {
  const pid = event.params.pid;
  const masterBeltAddress = event.address;
  const masterBeltContract = MasterBelt_1.MasterBelt.bind(event.address);
  const poolInfo = masterBeltContract.try_poolInfo(pid);
  if (poolInfo.reverted) return;
  const vaultAddress = poolInfo.value.getWant();
  const allocPoint = poolInfo.value.getAllocPoint();
  const strategyAddress = poolInfo.value.getStrat();
  if (!utils.isVaultRegistered(vaultAddress)) return;
  (0, Rewards_1.updateStakedOutputTokenAmount)(
    vaultAddress,
    strategyAddress,
    event.block
  );
  (0, Rewards_1.updateBeltRewards)(
    vaultAddress,
    allocPoint,
    masterBeltAddress,
    event.block
  );
}
exports.handleDeposit = handleDeposit;
function handleWithdraw(event) {
  const pid = event.params.pid;
  const masterBeltAddress = event.address;
  const masterBeltContract = MasterBelt_1.MasterBelt.bind(event.address);
  const poolInfo = masterBeltContract.try_poolInfo(pid);
  if (poolInfo.reverted) return;
  const vaultAddress = poolInfo.value.getWant();
  const allocPoint = poolInfo.value.getAllocPoint();
  const strategyAddress = poolInfo.value.getStrat();
  if (!utils.isVaultRegistered(vaultAddress)) return;
  (0, Rewards_1.updateStakedOutputTokenAmount)(
    vaultAddress,
    strategyAddress,
    event.block
  );
  (0, Rewards_1.updateBeltRewards)(
    vaultAddress,
    allocPoint,
    masterBeltAddress,
    event.block
  );
}
exports.handleWithdraw = handleWithdraw;
