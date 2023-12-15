"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreatePoolFactory = exports.getOrCreateProtocol = void 0;
const schema_1 = require("../../../../generated/schema");
const versions_1 = require("../../../versions");
const constants_1 = require("../../constants");
function getOrCreateProtocol() {
    let protocol = schema_1.LendingProtocol.load(constants_1.PROTOCOL_ID);
    if (!protocol) {
        protocol = new schema_1.LendingProtocol(constants_1.PROTOCOL_ID);
        protocol.name = constants_1.PROTOCOL_NAME;
        protocol.slug = constants_1.PROTOCOL_SLUG;
        protocol.network = constants_1.PROTOCOL_NETWORK;
        protocol.type = constants_1.PROTOCOL_TYPE;
        protocol.lendingType = constants_1.PROTOCOL_LENDING_TYPE;
        protocol.riskType = constants_1.PROTOCOL_RISK_TYPE;
        protocol.mintedTokens = new Array();
        protocol.cumulativeUniqueUsers = constants_1.ZERO_I32;
        protocol.totalValueLockedUSD = constants_1.ZERO_BD;
        protocol.protocolControlledValueUSD = constants_1.ZERO_BD;
        protocol.cumulativeSupplySideRevenueUSD = constants_1.ZERO_BD;
        protocol.cumulativeProtocolSideRevenueUSD = constants_1.ZERO_BD;
        protocol.cumulativeTotalRevenueUSD = constants_1.ZERO_BD;
        protocol.totalDepositBalanceUSD = constants_1.ZERO_BD;
        protocol.cumulativeDepositUSD = constants_1.ZERO_BD;
        protocol.totalBorrowBalanceUSD = constants_1.ZERO_BD;
        protocol.cumulativeBorrowUSD = constants_1.ZERO_BD;
        protocol.cumulativeLiquidateUSD = constants_1.ZERO_BD;
        protocol.mintedTokenSupplies = new Array();
        protocol.totalPoolCount = constants_1.ZERO_I32;
        protocol._marketIDs = [];
        protocol._treasuryFee = constants_1.PROTOCOL_INITIAL_TREASURY_FEE;
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateProtocol = getOrCreateProtocol;
/**
 * Get the pool factory at poolFactoryAddress, or create it if it doesn't exist
 */
function getOrCreatePoolFactory(event, poolFactoryAddress) {
    let poolFactory = schema_1._PoolFactory.load(poolFactoryAddress.toHexString());
    if (!poolFactory) {
        poolFactory = new schema_1._PoolFactory(poolFactoryAddress.toHexString());
        poolFactory.creationTimestamp = event.block.timestamp;
        poolFactory.creationBlockNumber = event.block.number;
        poolFactory.save();
    }
    return poolFactory;
}
exports.getOrCreatePoolFactory = getOrCreatePoolFactory;
