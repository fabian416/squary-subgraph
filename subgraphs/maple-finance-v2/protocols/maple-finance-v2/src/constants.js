"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProtocolData = exports.RISK_TYPE = exports.COLATERALIZATION_TYPE = exports.POOL_CREATOR_PERMISSION_TYPE = exports.BORROWER_PERMISSION_TYPE = exports.LENDER_PERMISSION_TYPE = exports.LENDING_TYPE = exports.PROTOCOL_NETWORK = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = exports.PROTOCOL = exports.MIGRATION_HELPER = exports.USDC_ADDRESS = exports.CHAINLINK_USDC_ORACLE = exports.MAPLE_GLOBALS = exports.WITHDRAWAL_MANAGER_FACTORY = exports.LIQUIDATOR_FACTORY = exports.LOAN_MANAGER_FACTORY = exports.POOL_MANAGER_FACTORY = exports.CHAINLINK_DECIMALS = exports.DEFAULT_DECIMALS = exports.ETH_DECIMALS = exports.ETH_SYMBOL = exports.ETH_NAME = exports.ETH_ADDRESS = exports.ZERO_ADDRESS = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/sdk/constants");
const manager_1 = require("../../../src/sdk/manager");
//////////////////////////////
///// Ethereum Addresses /////
//////////////////////////////
exports.ZERO_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000");
exports.ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
exports.ETH_NAME = "Ether";
exports.ETH_SYMBOL = "ETH";
exports.ETH_DECIMALS = 18;
exports.DEFAULT_DECIMALS = 18;
exports.CHAINLINK_DECIMALS = 8;
// factory contract
exports.POOL_MANAGER_FACTORY = "0xe463cd473ecc1d1a4ecf20b62624d84dd20a8339";
exports.LOAN_MANAGER_FACTORY = "0x1551717ae4fdcb65ed028f7fb7aba39908f6a7a6";
exports.LIQUIDATOR_FACTORY = "0xa2091116649b070d2a27fc5c85c9820302114c63";
exports.WITHDRAWAL_MANAGER_FACTORY = "0xb9e25b584dc4a7c9d47aef577f111fbe5705773b";
exports.MAPLE_GLOBALS = "0x804a6f5f667170f545bf14e5ddb48c70b788390c"; // price from getLatestPrice()
exports.CHAINLINK_USDC_ORACLE = "0x8fffffd4afb6115b954bd326cbe7b4ba576818f6";
exports.USDC_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
exports.MIGRATION_HELPER = "0x580b1a894b9fbdbf7d29ba9b492807bf539dd508";
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
exports.PROTOCOL = "Maple Finance";
exports.PROTOCOL_NAME = "Maple Finance 2.0";
exports.PROTOCOL_SLUG = "maple-finance-v2";
exports.PROTOCOL_NETWORK = constants_1.Network.MAINNET;
exports.LENDING_TYPE = constants_1.LendingType.POOLED;
exports.LENDER_PERMISSION_TYPE = constants_1.PermissionType.PERMISSIONLESS;
exports.BORROWER_PERMISSION_TYPE = constants_1.PermissionType.PERMISSIONED;
exports.POOL_CREATOR_PERMISSION_TYPE = constants_1.PermissionType.WHITELIST_ONLY; // Pool Delegates
exports.COLATERALIZATION_TYPE = constants_1.CollateralizationType.UNDER_COLLATERALIZED; // Up to the Pool Delegates discretion
exports.RISK_TYPE = constants_1.RiskType.ISOLATED;
function getProtocolData() {
    return new manager_1.ProtocolData(graph_ts_1.Bytes.fromHexString(exports.POOL_MANAGER_FACTORY), exports.PROTOCOL, exports.PROTOCOL_NAME, exports.PROTOCOL_SLUG, exports.PROTOCOL_NETWORK, exports.LENDING_TYPE, exports.LENDER_PERMISSION_TYPE, exports.BORROWER_PERMISSION_TYPE, exports.POOL_CREATOR_PERMISSION_TYPE, exports.COLATERALIZATION_TYPE, exports.RISK_TYPE);
}
exports.getProtocolData = getProtocolData;
