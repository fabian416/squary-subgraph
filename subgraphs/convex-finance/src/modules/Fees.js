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
exports.getTotalFees = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const types_1 = require("../common/types");
const Booster_1 = require("../../generated/Booster/Booster");
function getTotalFees() {
  const contract = Booster_1.Booster.bind(constants.CONVEX_BOOSTER_ADDRESS);
  const lockIncentive = utils.readValue(
    contract.try_lockIncentive(),
    constants.BIGINT_ZERO
  );
  const callIncentive = utils.readValue(
    contract.try_earmarkIncentive(),
    constants.BIGINT_ZERO
  );
  const stakerIncentive = utils.readValue(
    contract.try_stakerIncentive(),
    constants.BIGINT_ZERO
  );
  const platformFee = utils.readValue(
    contract.try_platformFee(),
    constants.BIGINT_ZERO
  );
  return new types_1.CustomFeesType(
    lockIncentive,
    callIncentive,
    stakerIncentive,
    platformFee
  );
}
exports.getTotalFees = getTotalFees;