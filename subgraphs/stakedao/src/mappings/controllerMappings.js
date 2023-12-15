"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRevokeStrategy = exports.handleSetStrategy = exports.handleSetVault = void 0;
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const constants = __importStar(require("../common/constants"));
const initializers_2 = require("../common/initializers");
const schema_1 = require("../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const templates_1 = require("../../generated/templates");
const Vault_1 = require("../../generated/templates/Vault/Vault");
const EthereumController_1 = require("../../generated/Controller/EthereumController");
function handleSetVault(call) {
    const controllerAddress = call.to;
    const vaultAddress = call.inputs._vault;
    const inputTokenAddress = call.inputs._token;
    const vault = new schema_1.Vault(vaultAddress.toHexString());
    const vaultContract = Vault_1.Vault.bind(vaultAddress);
    vault.name = vaultContract.name();
    vault.symbol = vaultContract.symbol();
    vault.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    vault.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    vault.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    vault.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    vault.protocol = constants.ETHEREUM_PROTOCOL_ID;
    const inputToken = (0, initializers_1.getOrCreateToken)(inputTokenAddress);
    vault.inputToken = inputToken.id;
    vault.inputTokenBalance = constants.BIGINT_ZERO;
    const outputToken = (0, initializers_1.getOrCreateToken)(vaultAddress);
    vault.outputToken = outputToken.id;
    vault.outputTokenSupply = constants.BIGINT_ZERO;
    vault.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    vault.createdBlockNumber = call.block.number;
    vault.createdTimestamp = call.block.timestamp;
    vault.depositLimit = constants.BIGINT_ZERO;
    vault.fees = [];
    vault._rewardTokensIds = [];
    vault._strategy = constants.ZERO_ADDRESS_STRING;
    templates_1.Vault.create(vaultAddress);
    vault.save();
    const strategyAddress = (0, initializers_2.getOrCreateStrategy)(controllerAddress, vault, inputTokenAddress);
    const protocol = (0, initializers_1.getOrCreateYieldAggregator)();
    const vaultIds = protocol._vaultIds;
    vaultIds.push(vaultAddress.toHexString());
    protocol._vaultIds = vaultIds;
    protocol.totalPoolCount += 1;
    protocol.save();
    graph_ts_1.log.warning("[SetVault] - TxHash: {}, VaultId: {}, StrategyId: {}", [
        call.transaction.hash.toHexString(),
        call.inputs._vault.toHexString(),
        strategyAddress,
    ]);
}
exports.handleSetVault = handleSetVault;
function handleSetStrategy(call) {
    const controllerAddress = call.to;
    const inputTokenAddress = call.inputs._token;
    const newStrategyAddress = call.inputs._strategy;
    const controller = EthereumController_1.EthereumController.bind(controllerAddress);
    const vaultAddress = utils.readValue(controller.try_vaults(inputTokenAddress), constants.ZERO_ADDRESS);
    const vault = schema_1.Vault.load(vaultAddress.toHexString());
    if (vault) {
        (0, initializers_2.getOrCreateStrategy)(controllerAddress, vault, inputTokenAddress, newStrategyAddress);
        graph_ts_1.log.warning("[SetStrategy] TxHash: {}, VaultId: {}, Strategy: {}", [
            call.transaction.hash.toHexString(),
            vaultAddress.toHexString(),
            newStrategyAddress.toHexString(),
        ]);
    }
}
exports.handleSetStrategy = handleSetStrategy;
function handleRevokeStrategy(call) {
    graph_ts_1.store.remove("_Strategy", call.inputs._strategy.toHexString());
    graph_ts_1.log.warning("[RevokeStrategy] TxHash: {}, StrategyId: {}", [
        call.transaction.hash.toHexString(),
        call.inputs._strategy.toHexString(),
    ]);
}
exports.handleRevokeStrategy = handleRevokeStrategy;
