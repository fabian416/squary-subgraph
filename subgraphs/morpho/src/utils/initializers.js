"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarket = exports.getOrInitMarketList = exports.getOrInitLendingProtocol = exports.MorphoProtocol = exports.getOrCreateRewardToken = exports.getOrInitToken = void 0;
const schema_1 = require("../../generated/schema");
const versions_1 = require("../versions");
const ERC20_1 = require("../../generated/Morpho/ERC20");
const constants_1 = require("../constants");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const getOrInitToken = (tokenAddress) => {
    let token = schema_1.Token.load(tokenAddress);
    if (!token) {
        token = new schema_1.Token(tokenAddress);
        const erc20 = ERC20_1.ERC20.bind(graph_ts_1.Address.fromBytes(tokenAddress));
        token.name = erc20.name();
        token.symbol = erc20.symbol();
        token.decimals = erc20.decimals();
        token.lastPriceUSD = graph_ts_1.BigDecimal.zero();
        token.save();
    }
    return token;
};
exports.getOrInitToken = getOrInitToken;
function getOrCreateRewardToken(tokenAddress, side) {
    const token = (0, exports.getOrInitToken)(tokenAddress);
    const rewardTokenID = token.id.toHexString().concat("-").concat(side);
    let rewardToken = schema_1.RewardToken.load(rewardTokenID);
    if (!rewardToken) {
        rewardToken = new schema_1.RewardToken(rewardTokenID);
        rewardToken.token = token.id;
        rewardToken.type = side;
        rewardToken.save();
    }
    return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
class MorphoProtocol {
    constructor(protocol, isNew) {
        this.protocol = protocol;
        this.isNew = isNew;
    }
}
exports.MorphoProtocol = MorphoProtocol;
const getOrInitLendingProtocol = (protocolAddress) => {
    let protocol = schema_1.LendingProtocol.load(protocolAddress);
    let isNew = false;
    if (!protocol) {
        isNew = true;
        protocol = new schema_1.LendingProtocol(protocolAddress);
        const data = (0, constants_1.getProtocolData)(protocolAddress);
        protocol.name = data.name;
        protocol.slug = data.slug;
        protocol.protocol = data.protocol;
        protocol.network = data.network;
        protocol.type = constants_1.ProtocolType.LENDING;
        protocol.lendingType = data.lendingType;
        protocol.lenderPermissionType = data.lenderPermissionType;
        protocol.borrowerPermissionType = data.borrowerPermissionType;
        protocol.poolCreatorPermissionType = data.poolCreatorPermissionType;
        protocol.collateralizationType = data.collateralizationType;
        protocol.riskType = data.riskType;
        protocol.cumulativeUniqueUsers = 0;
        protocol.cumulativeUniqueDepositors = 0;
        protocol.cumulativeUniqueBorrowers = 0;
        protocol.cumulativeUniqueLiquidators = 0;
        protocol.cumulativeUniqueLiquidatees = 0;
        protocol.totalValueLockedUSD = graph_ts_1.BigDecimal.zero();
        protocol.cumulativeSupplySideRevenueUSD = graph_ts_1.BigDecimal.zero();
        protocol.cumulativeProtocolSideRevenueUSD = graph_ts_1.BigDecimal.zero();
        protocol.cumulativeTotalRevenueUSD = graph_ts_1.BigDecimal.zero();
        protocol.totalDepositBalanceUSD = graph_ts_1.BigDecimal.zero();
        protocol.cumulativeDepositUSD = graph_ts_1.BigDecimal.zero();
        protocol.totalBorrowBalanceUSD = graph_ts_1.BigDecimal.zero();
        protocol.cumulativeBorrowUSD = graph_ts_1.BigDecimal.zero();
        protocol.cumulativeLiquidateUSD = graph_ts_1.BigDecimal.zero();
        protocol.totalPoolCount = 0;
        protocol.openPositionCount = 0;
        protocol.cumulativePositionCount = 0;
        protocol.transactionCount = 0;
        protocol.depositCount = 0;
        protocol.withdrawCount = 0;
        protocol.borrowCount = 0;
        protocol.repayCount = 0;
        protocol.liquidationCount = 0;
        // There is no transfer or flashloan event in Morpho.
        protocol.transferCount = 0;
        protocol.flashloanCount = 0;
        protocol._marketIds = [];
    }
    protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
    protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    protocol.save();
    return new MorphoProtocol(protocol, isNew);
};
exports.getOrInitLendingProtocol = getOrInitLendingProtocol;
const getOrInitMarketList = (protocolAddress) => {
    let protocol = schema_1._MarketList.load(protocolAddress);
    if (!protocol) {
        protocol = new schema_1._MarketList(protocolAddress);
        protocol.markets = [];
        protocol.save();
    }
    return protocol;
};
exports.getOrInitMarketList = getOrInitMarketList;
// ###############################
// ##### Market-Level Metadata ###
// ###############################
const getMarket = (marketAddress) => {
    const market = schema_1.Market.load(marketAddress);
    if (!market) {
        // The event "MarketCreated" creates directly the market entity
        graph_ts_1.log.critical("Market not found: {}", [marketAddress.toHexString()]);
        return new schema_1.Market(marketAddress);
    }
    return market;
};
exports.getMarket = getMarket;
