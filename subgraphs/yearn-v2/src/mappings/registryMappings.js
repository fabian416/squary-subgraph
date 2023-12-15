"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNewExperimentalVault = exports.handleNewVault = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
function handleNewVault(event) {
    const vaultAddress = event.params.vault;
    const tokenAddress = event.params.token;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    graph_ts_1.log.warning("[NewVault] - VaultId: {}, TokenId: {}, TxHash: {}", [
        vault.id,
        tokenAddress.toHexString(),
        event.transaction.hash.toHexString(),
    ]);
}
exports.handleNewVault = handleNewVault;
function handleNewExperimentalVault(event) {
    const vaultAddress = event.params.vault;
    const tokenAddress = event.params.token;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    graph_ts_1.log.warning("[NewExperimentalVault] - VaultId: {}, TokenId: {}, TxHash: {}", [
        vault.id,
        tokenAddress.toHexString(),
        event.transaction.hash.toHexString(),
    ]);
}
exports.handleNewExperimentalVault = handleNewExperimentalVault;
