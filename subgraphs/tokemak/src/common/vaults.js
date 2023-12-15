"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateVaultsHourlySnapshots = exports.getOrCreateVaultsDailySnapshots = exports.updateVaultSnapshots = exports.getOrCreateVault = exports.createVault = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("./constants");
const tokens_1 = require("./tokens");
const Vault_1 = require("../../generated/Manager/Vault");
const schema_1 = require("../../generated/schema");
const templates_1 = require("../../generated/templates");
const utils_1 = require("./utils");
function createVault(vaultAddress, timestamp, blocknumber) {
    const vault = new schema_1.Vault(vaultAddress.toHexString());
    const vaultContract = Vault_1.Vault.bind(graph_ts_1.Address.fromString(vault.id));
    vault.protocol = constants_1.PROTOCOL_ID;
    vault.name = (0, utils_1.readValue)(vaultContract.try_name(), "");
    vault.symbol = (0, utils_1.readValue)(vaultContract.try_symbol(), "");
    const inputToken = (0, tokens_1.getOrCreateToken)(vaultContract.underlyer());
    vault.inputToken = inputToken.id;
    vault.inputTokenBalance = constants_1.BIGINT_ZERO;
    const outputToken = (0, tokens_1.getOrCreateToken)(graph_ts_1.Address.fromString(vault.id));
    vault.outputToken = outputToken.id;
    vault.outputTokenSupply = constants_1.BIGINT_ZERO;
    vault.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
    vault.pricePerShare = constants_1.BIGDECIMAL_ZERO;
    vault.depositLimit = constants_1.BIGINT_ZERO;
    vault.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    vault.createdBlockNumber = blocknumber;
    vault.createdTimestamp = timestamp;
    const rewardToken = (0, tokens_1.createRewardTokens)();
    vault.rewardTokens = [rewardToken.id];
    vault.fees = [];
    vault.save();
    let protocol = schema_1.YieldAggregator.load(constants_1.PROTOCOL_ID);
    if (protocol) {
        let vaultIds = protocol._vaultIds;
        if (vaultIds) {
            vaultIds.push(vault.id);
            protocol._vaultIds = vaultIds;
            protocol.save();
        }
    }
    templates_1.Vault.create(vaultAddress);
    return vault;
}
exports.createVault = createVault;
function getOrCreateVault(vaultAddress, blockNumber, timestamp) {
    // Note that the NewVault event are also emitted when endorseVault and newRelease
    // are called. So we only create it when necessary.
    let vault = schema_1.Vault.load(vaultAddress.toHexString());
    if (!vault) {
        vault = createVault(vaultAddress, blockNumber, timestamp);
    }
    return vault;
}
exports.getOrCreateVault = getOrCreateVault;
function updateVaultSnapshots(vaultAddress, block) {
    let vault = getOrCreateVault(vaultAddress, block.number, block.timestamp);
    const vaultDailySnapshots = getOrCreateVaultsDailySnapshots(vaultAddress, block);
    const vaultHourlySnapshots = getOrCreateVaultsHourlySnapshots(vaultAddress, block);
    vaultDailySnapshots.totalValueLockedUSD = vault.totalValueLockedUSD;
    vaultHourlySnapshots.totalValueLockedUSD = vault.totalValueLockedUSD;
    vaultDailySnapshots.inputTokenBalance = vault.inputTokenBalance;
    vaultHourlySnapshots.inputTokenBalance = vault.inputTokenBalance;
    vaultDailySnapshots.outputTokenSupply = vault.outputTokenSupply;
    vaultHourlySnapshots.outputTokenSupply = vault.outputTokenSupply;
    vaultDailySnapshots.outputTokenPriceUSD = vault.outputTokenPriceUSD;
    vaultHourlySnapshots.outputTokenPriceUSD = vault.outputTokenPriceUSD;
    vaultDailySnapshots.pricePerShare = vault.pricePerShare;
    vaultHourlySnapshots.pricePerShare = vault.pricePerShare;
    vaultDailySnapshots.blockNumber = block.number;
    vaultHourlySnapshots.blockNumber = block.number;
    vaultDailySnapshots.timestamp = block.timestamp;
    vaultHourlySnapshots.timestamp = block.timestamp;
    vaultDailySnapshots.save();
    vaultHourlySnapshots.save();
}
exports.updateVaultSnapshots = updateVaultSnapshots;
function getOrCreateVaultsDailySnapshots(vaultAddress, block) {
    let id = vaultAddress.toHexString().concat((block.timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString());
    let vaultSnapshots = schema_1.VaultDailySnapshot.load(id);
    if (!vaultSnapshots) {
        vaultSnapshots = new schema_1.VaultDailySnapshot(id);
        vaultSnapshots.protocol = constants_1.PROTOCOL_ID;
        vaultSnapshots.vault = vaultAddress.toHexString();
        vaultSnapshots.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        vaultSnapshots.inputTokenBalance = constants_1.BIGINT_ZERO;
        vaultSnapshots.outputTokenSupply = constants_1.BIGINT_ZERO;
        vaultSnapshots.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        vaultSnapshots.pricePerShare = constants_1.BIGDECIMAL_ZERO;
        vaultSnapshots.stakedOutputTokenAmount = constants_1.BIGINT_ZERO;
        vaultSnapshots.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
        vaultSnapshots.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
        vaultSnapshots.blockNumber = block.number;
        vaultSnapshots.timestamp = block.timestamp;
        vaultSnapshots.save();
    }
    return vaultSnapshots;
}
exports.getOrCreateVaultsDailySnapshots = getOrCreateVaultsDailySnapshots;
function getOrCreateVaultsHourlySnapshots(vaultAddress, block) {
    let id = vaultAddress
        .toHexString()
        .concat((block.timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString())
        .concat("-")
        .concat((block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR).toString());
    let vaultSnapshots = schema_1.VaultHourlySnapshot.load(id);
    if (!vaultSnapshots) {
        vaultSnapshots = new schema_1.VaultHourlySnapshot(id);
        vaultSnapshots.protocol = constants_1.PROTOCOL_ID;
        vaultSnapshots.vault = vaultAddress.toHexString();
        vaultSnapshots.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        vaultSnapshots.inputTokenBalance = constants_1.BIGINT_ZERO;
        vaultSnapshots.outputTokenSupply = constants_1.BIGINT_ZERO;
        vaultSnapshots.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        vaultSnapshots.pricePerShare = constants_1.BIGDECIMAL_ZERO;
        vaultSnapshots.stakedOutputTokenAmount = constants_1.BIGINT_ZERO;
        vaultSnapshots.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
        vaultSnapshots.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
        vaultSnapshots.blockNumber = block.number;
        vaultSnapshots.timestamp = block.timestamp;
        vaultSnapshots.save();
    }
    return vaultSnapshots;
}
exports.getOrCreateVaultsHourlySnapshots = getOrCreateVaultsHourlySnapshots;
