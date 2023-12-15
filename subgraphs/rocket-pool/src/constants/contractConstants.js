"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyToContractName = exports.RocketContractNames = exports.ZERO_ADDRESS = exports.ZERO_ADDRESS_STRING = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
// Used when encountering the ZERO address.
exports.ZERO_ADDRESS_STRING = "0x0000000000000000000000000000000000000000";
exports.ZERO_ADDRESS = graph_ts_1.Address.fromString(exports.ZERO_ADDRESS_STRING);
var RocketContractNames;
(function (RocketContractNames) {
    RocketContractNames.ROCKET_VAULT = "rocketVault";
    RocketContractNames.ROCKET_TOKEN_RETH = "rocketTokenRETH";
    RocketContractNames.ROCKET_NETWORK_BALANCES = "rocketNetworkBalances";
    RocketContractNames.ROCKET_NETWORK_PRICES = "rocketNetworkPrices";
    RocketContractNames.ROCKET_NODE_MANAGER = "rocketNodeManager";
    RocketContractNames.ROCKET_NODE_STAKING = "rocketNodeStaking";
    RocketContractNames.ROCKET_REWARDS_POOL = "rocketRewardsPool";
    RocketContractNames.ROCKET_MINIPOOL_MANAGER = "rocketMinipoolManager";
    RocketContractNames.ROCKET_MINIPOOL_QUEUE = "rocketMinipoolQueue";
    RocketContractNames.ROCKET_MINIPOOL_DELEGATE = "rocketMinipoolDelegate";
    RocketContractNames.ROCKET_DAO_NODE_TRUSTED_ACTIONS = "rocketDAONodeTrustedActions";
    RocketContractNames.ROCKET_DEPOSIT_POOL = "rocketDepositPool";
    RocketContractNames.ROCKET_NODE_DEPOSIT = "rocketNodeDeposit";
    RocketContractNames.ROCKET_CLAIM_DAO = "rocketClaimDAO";
    RocketContractNames.ROCKET_CLAIM_NODE = "rocketClaimNode";
    RocketContractNames.ROCKET_CLAIM_TRUSTED_NODE = "rocketClaimTrustedNode";
    RocketContractNames.ROCKET_DAO_NODE_TRUSTED = "rocketDAONodeTrusted";
    RocketContractNames.ROCKET_NETWORK_FEES = "rocketNetworkFees";
    RocketContractNames.ROCKET_DAO_SETTINGS_MINIPOOL = "rocketDAOProtocolSettingsMinipool";
    RocketContractNames.ROCKET_DAO_SETTINGS_NODE = "rocketDAOProtocolSettingsNode";
    RocketContractNames.ROCKET_AUCTION_MANAGER = "rocketAuctionManager";
})(RocketContractNames = exports.RocketContractNames || (exports.RocketContractNames = {}));
// https://docs.rocketpool.net/developers/usage/contracts/contracts.html#interacting-with-rocket-pool
exports.KeyToContractName = new graph_ts_1.TypedMap();
function setKeyToContractName() {
    const contractNames = [
        RocketContractNames.ROCKET_VAULT,
        RocketContractNames.ROCKET_TOKEN_RETH,
        RocketContractNames.ROCKET_NETWORK_BALANCES,
        RocketContractNames.ROCKET_NETWORK_PRICES,
        RocketContractNames.ROCKET_NODE_MANAGER,
        RocketContractNames.ROCKET_NODE_STAKING,
        RocketContractNames.ROCKET_REWARDS_POOL,
        RocketContractNames.ROCKET_MINIPOOL_MANAGER,
        RocketContractNames.ROCKET_MINIPOOL_QUEUE,
        RocketContractNames.ROCKET_MINIPOOL_DELEGATE,
        RocketContractNames.ROCKET_DAO_NODE_TRUSTED_ACTIONS,
        RocketContractNames.ROCKET_DEPOSIT_POOL,
        RocketContractNames.ROCKET_NODE_DEPOSIT,
        RocketContractNames.ROCKET_CLAIM_DAO,
        RocketContractNames.ROCKET_CLAIM_NODE,
        RocketContractNames.ROCKET_CLAIM_TRUSTED_NODE,
        RocketContractNames.ROCKET_DAO_NODE_TRUSTED,
        RocketContractNames.ROCKET_NETWORK_FEES,
        RocketContractNames.ROCKET_DAO_SETTINGS_MINIPOOL,
        RocketContractNames.ROCKET_DAO_SETTINGS_NODE,
        RocketContractNames.ROCKET_AUCTION_MANAGER,
    ];
    for (let i = 0; i < contractNames.length; i++) {
        exports.KeyToContractName.set(graph_ts_1.crypto.keccak256(graph_ts_1.ByteArray.fromUTF8("contract.address".concat(contractNames[i]))), contractNames[i]);
    }
}
setKeyToContractName();
