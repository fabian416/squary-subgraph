"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSetAddress = void 0;
const contractConstants_1 = require("../constants/contractConstants");
const rocketContracts_1 = require("../entities/rocketContracts");
const templates_1 = require("../../generated/templates");
function handleSetAddress(call) {
    const contractName = contractConstants_1.KeyToContractName.get(call.inputs._key);
    if (contractName) {
        (0, rocketContracts_1.createOrUpdateRocketContract)(contractName, call.inputs._key, call.inputs._value);
        if (contractName == contractConstants_1.RocketContractNames.ROCKET_DAO_NODE_TRUSTED_ACTIONS) {
            templates_1.rocketDAONodeTrustedActions.create(call.inputs._value);
        }
        if (contractName == contractConstants_1.RocketContractNames.ROCKET_MINIPOOL_MANAGER) {
            templates_1.rocketMinipoolManager.create(call.inputs._value);
        }
        if (contractName == contractConstants_1.RocketContractNames.ROCKET_MINIPOOL_QUEUE) {
            templates_1.rocketMinipoolqueue.create(call.inputs._value);
        }
        if (contractName == contractConstants_1.RocketContractNames.ROCKET_NETWORK_BALANCES) {
            templates_1.rocketNetworkBalances.create(call.inputs._value);
        }
        if (contractName == contractConstants_1.RocketContractNames.ROCKET_NETWORK_PRICES) {
            templates_1.rocketNetworkPrices.create(call.inputs._value);
        }
        if (contractName == contractConstants_1.RocketContractNames.ROCKET_NODE_MANAGER) {
            templates_1.rocketNodeManager.create(call.inputs._value);
        }
        if (contractName == contractConstants_1.RocketContractNames.ROCKET_NODE_STAKING) {
            templates_1.rocketNodeStaking.create(call.inputs._value);
        }
        if (contractName == contractConstants_1.RocketContractNames.ROCKET_REWARDS_POOL) {
            templates_1.rocketRewardsPool.create(call.inputs._value);
        }
        if (contractName == contractConstants_1.RocketContractNames.ROCKET_TOKEN_RETH) {
            templates_1.rocketTokenRETH.create(call.inputs._value);
        }
    }
}
exports.handleSetAddress = handleSetAddress;
