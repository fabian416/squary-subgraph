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
exports.handleMiningParametersUpdated = void 0;
const constants = __importStar(require("../common/constants"));
const rewards_1 = require("../common/rewards");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
function handleMiningParametersUpdated(event) {
  const protocolToken = (0, initializers_1.getOrCreateRewardToken)(
    constants.PROTOCOL_TOKEN_ADDRESS,
    constants.RewardTokenType.DEPOSIT,
    event.block
  );
  protocolToken._inflationRate = graph_ts_1.BigDecimal.fromString(
    event.params.rate.toString()
  );
  protocolToken._inflationPerDay = (0, rewards_1.getRewardsPerDay)(
    event.block.timestamp,
    event.block.number,
    protocolToken._inflationRate,
    constants.INFLATION_INTERVAL
  );
  protocolToken.save();
}
exports.handleMiningParametersUpdated = handleMiningParametersUpdated;
