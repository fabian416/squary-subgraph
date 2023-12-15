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
exports.handleSetStrategy = exports.handleSetVault = void 0;
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const initializers_1 = require("../common/initializers");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const templates_1 = require("../../generated/templates");
function handleSetVault(call) {
  const controllerAddress = call.to;
  const vaultAddress = call.inputs._vault;
  const lpTokenAddress = call.inputs._token;
  const strategyAddress = utils.getVaultStrategy(vaultAddress, lpTokenAddress);
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, call.block);
  graph_ts_1.log.warning(
    "[SetVault] Controller: {}, Vault: {}, Strategy: {}, TxnHash: {}",
    [
      controllerAddress.toHexString(),
      vault.id,
      strategyAddress.toHexString(),
      call.transaction.hash.toHexString(),
    ]
  );
}
exports.handleSetVault = handleSetVault;
function handleSetStrategy(call) {
  const controllerAddress = call.to;
  const lpTokenAddress = call.inputs._token;
  const strategyAddress = call.inputs._strategy;
  const vaultAddress = utils.getVaultAddressFromController(
    controllerAddress,
    lpTokenAddress
  );
  if (vaultAddress.equals(constants.NULL.TYPE_ADDRESS)) return;
  const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, call.block);
  const bribesAddress = utils.getBribesProcessor(vaultAddress, strategyAddress);
  vault._bribesProcessor = bribesAddress.toHexString();
  vault._controller = controllerAddress.toHexString();
  vault._strategy = strategyAddress.toHexString();
  vault.save();
  const context = new graph_ts_1.DataSourceContext();
  context.setString("vaultAddress", vaultAddress.toHexString());
  templates_1.Strategy.createWithContext(strategyAddress, context);
  graph_ts_1.log.warning(
    "[SetStrategy] Controller: {}, Vault: {}, Strategy: {}, TxnHash: {}",
    [
      controllerAddress.toHexString(),
      vault.id,
      strategyAddress.toHexString(),
      call.transaction.hash.toHexString(),
    ]
  );
}
exports.handleSetStrategy = handleSetStrategy;
