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
exports.getOrCreateLendingProtocol = void 0;
const schema_1 = require("../../generated/schema");
const constants = __importStar(require("../common/constants"));
const versions_1 = require("../versions");
function getOrCreateLendingProtocol() {
    let protocol = schema_1.LendingProtocol.load(constants.PROTOCOL_ID);
    if (!protocol) {
        protocol = new schema_1.LendingProtocol(constants.PROTOCOL_ID);
        protocol.name = constants.PROTOCOL_NAME;
        protocol.slug = constants.PROTOCOL_SLUG;
        protocol.network = constants.PROTOCOL_NETWORK;
        protocol.type = constants.PROTOCOL_TYPE;
        protocol.lendingType = constants.PROTOCOL_LENDING_TYPE;
        protocol.riskType = constants.PROTOCOL_RISK_TYPE;
        protocol.mintedTokens = new Array();
        protocol.cumulativeUniqueUsers = constants.INT_ZERO;
        protocol.cumulativeUniqueBorrowers = constants.INT_ZERO;
        protocol.cumulativeUniqueDepositors = constants.INT_ZERO;
        protocol.cumulativeUniqueLiquidators = constants.INT_ZERO;
        protocol.cumulativeUniqueLiquidatees = constants.INT_ZERO;
        protocol.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
        protocol.protocolControlledValueUSD = constants.BIGDECIMAL_ZERO;
        protocol.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
        protocol.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
        protocol.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
        protocol.totalDepositBalanceUSD = constants.BIGDECIMAL_ZERO;
        protocol.cumulativeDepositUSD = constants.BIGDECIMAL_ZERO;
        protocol.totalBorrowBalanceUSD = constants.BIGDECIMAL_ZERO;
        protocol.cumulativeBorrowUSD = constants.BIGDECIMAL_ZERO;
        protocol.cumulativeLiquidateUSD = constants.BIGDECIMAL_ZERO;
        protocol.mintedTokenSupplies = new Array();
        protocol.totalPoolCount = constants.INT_ZERO;
        protocol.openPositionCount = constants.INT_ZERO;
        protocol.cumulativePositionCount = constants.INT_ZERO;
        protocol._depositors = [];
        protocol._borrowers = [];
        protocol._liquidatees = [];
        protocol._liquidators = [];
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return protocol;
}
exports.getOrCreateLendingProtocol = getOrCreateLendingProtocol;
