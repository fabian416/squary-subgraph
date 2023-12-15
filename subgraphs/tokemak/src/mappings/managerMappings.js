"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCurrentVaults = exports.handlePoolRegistered = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const templates_1 = require("../../generated/templates");
const tokens_1 = require("../common/tokens");
const constants_1 = require("../common/constants");
const protocol_1 = require("../common/protocol");
const vaults_1 = require("../common/vaults");
const schema_1 = require("../../generated/schema");
function handlePoolRegistered(event) {
    (0, protocol_1.getOrCreateProtocol)();
    (0, tokens_1.createRewardTokens)();
    const vault = (0, vaults_1.getOrCreateVault)(event.params.pool, event.block.number, event.block.timestamp);
    vault.createdBlockNumber = event.block.number;
    vault.createdTimestamp = event.block.timestamp;
    vault.save();
    // Register Current Vault if not already registered
    registerCurrentVaults(event);
}
exports.handlePoolRegistered = handlePoolRegistered;
/*
    Automatically Registering All the Current vaults because
    the vaults are registered later in the Manager Contract
    after they are deployed, hence it causes error in the
    subgraph
*/
function registerCurrentVaults(event) {
    for (let i = 0; i < constants_1.CURRENT_VAULTS.length; i++) {
        const vaultAddress = graph_ts_1.Address.fromString(constants_1.CURRENT_VAULTS[i]);
        let vault = schema_1.Vault.load(vaultAddress.toHexString());
        if (!vault) {
            templates_1.Vault.create(vaultAddress);
        }
    }
}
exports.registerCurrentVaults = registerCurrentVaults;
