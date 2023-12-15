"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeBundleNftData = exports.decodeSingleNftData = exports.calcTradePriceETH = exports.getOrCreateCollectionDailySnapshot = exports.getOrCreateMarketplaceDailySnapshot = exports.getOrCreateCollection = exports.getOrCreateMarketplace = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ERC165_1 = require("../generated/OpenSea/ERC165");
const NftMetadata_1 = require("../generated/OpenSea/NftMetadata");
const schema_1 = require("../generated/schema");
const configure_1 = require("../configurations/configure");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const versions_1 = require("./versions");
function getOrCreateMarketplace(marketplaceID) {
    let marketplace = schema_1.Marketplace.load(marketplaceID);
    if (!marketplace) {
        marketplace = new schema_1.Marketplace(marketplaceID);
        marketplace.name = configure_1.NetworkConfigs.getProtocolName();
        marketplace.slug = configure_1.NetworkConfigs.getProtocolSlug();
        marketplace.network = configure_1.NetworkConfigs.getNetwork();
        marketplace.collectionCount = 0;
        marketplace.tradeCount = 0;
        marketplace.cumulativeTradeVolumeETH = constants_1.BIGDECIMAL_ZERO;
        marketplace.marketplaceRevenueETH = constants_1.BIGDECIMAL_ZERO;
        marketplace.creatorRevenueETH = constants_1.BIGDECIMAL_ZERO;
        marketplace.totalRevenueETH = constants_1.BIGDECIMAL_ZERO;
        marketplace.cumulativeUniqueTraders = 0;
    }
    marketplace.schemaVersion = versions_1.Versions.getSchemaVersion();
    marketplace.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    marketplace.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    marketplace.save();
    return marketplace;
}
exports.getOrCreateMarketplace = getOrCreateMarketplace;
function getOrCreateCollection(collectionID) {
    let collection = schema_1.Collection.load(collectionID);
    if (!collection) {
        collection = new schema_1.Collection(collectionID);
        collection.nftStandard = getNftStandard(collectionID);
        const contract = NftMetadata_1.NftMetadata.bind(graph_ts_1.Address.fromString(collectionID));
        const nameResult = contract.try_name();
        if (!nameResult.reverted) {
            collection.name = nameResult.value;
        }
        const symbolResult = contract.try_symbol();
        if (!symbolResult.reverted) {
            collection.symbol = symbolResult.value;
        }
        const totalSupplyResult = contract.try_totalSupply();
        if (!totalSupplyResult.reverted) {
            collection.totalSupply = totalSupplyResult.value;
        }
        collection.royaltyFee = constants_1.BIGDECIMAL_ZERO;
        collection.cumulativeTradeVolumeETH = constants_1.BIGDECIMAL_ZERO;
        collection.marketplaceRevenueETH = constants_1.BIGDECIMAL_ZERO;
        collection.creatorRevenueETH = constants_1.BIGDECIMAL_ZERO;
        collection.totalRevenueETH = constants_1.BIGDECIMAL_ZERO;
        collection.tradeCount = 0;
        collection.buyerCount = 0;
        collection.sellerCount = 0;
        collection.save();
        const marketplace = getOrCreateMarketplace(configure_1.NetworkConfigs.getMarketplaceAddress());
        marketplace.collectionCount += 1;
        marketplace.save();
    }
    return collection;
}
exports.getOrCreateCollection = getOrCreateCollection;
function getOrCreateMarketplaceDailySnapshot(timestamp) {
    const snapshotID = (timestamp.toI32() / constants_1.SECONDS_PER_DAY).toString();
    let snapshot = schema_1.MarketplaceDailySnapshot.load(snapshotID);
    if (!snapshot) {
        snapshot = new schema_1.MarketplaceDailySnapshot(snapshotID);
        snapshot.marketplace = configure_1.NetworkConfigs.getMarketplaceAddress();
        snapshot.blockNumber = constants_1.BIGINT_ZERO;
        snapshot.timestamp = constants_1.BIGINT_ZERO;
        snapshot.collectionCount = 0;
        snapshot.cumulativeTradeVolumeETH = constants_1.BIGDECIMAL_ZERO;
        snapshot.marketplaceRevenueETH = constants_1.BIGDECIMAL_ZERO;
        snapshot.creatorRevenueETH = constants_1.BIGDECIMAL_ZERO;
        snapshot.totalRevenueETH = constants_1.BIGDECIMAL_ZERO;
        snapshot.tradeCount = 0;
        snapshot.cumulativeUniqueTraders = 0;
        snapshot.dailyTradedItemCount = 0;
        snapshot.dailyActiveTraders = 0;
        snapshot.dailyTradedCollectionCount = 0;
        snapshot.save();
    }
    return snapshot;
}
exports.getOrCreateMarketplaceDailySnapshot = getOrCreateMarketplaceDailySnapshot;
function getOrCreateCollectionDailySnapshot(collection, timestamp) {
    const snapshotID = collection
        .concat("-")
        .concat((timestamp.toI32() / constants_1.SECONDS_PER_DAY).toString());
    let snapshot = schema_1.CollectionDailySnapshot.load(snapshotID);
    if (!snapshot) {
        snapshot = new schema_1.CollectionDailySnapshot(snapshotID);
        snapshot.collection = collection;
        snapshot.blockNumber = constants_1.BIGINT_ZERO;
        snapshot.timestamp = constants_1.BIGINT_ZERO;
        snapshot.royaltyFee = constants_1.BIGDECIMAL_ZERO;
        snapshot.dailyMinSalePrice = constants_1.BIGDECIMAL_MAX;
        snapshot.dailyMaxSalePrice = constants_1.BIGDECIMAL_ZERO;
        snapshot.cumulativeTradeVolumeETH = constants_1.BIGDECIMAL_ZERO;
        snapshot.dailyTradeVolumeETH = constants_1.BIGDECIMAL_ZERO;
        snapshot.marketplaceRevenueETH = constants_1.BIGDECIMAL_ZERO;
        snapshot.creatorRevenueETH = constants_1.BIGDECIMAL_ZERO;
        snapshot.totalRevenueETH = constants_1.BIGDECIMAL_ZERO;
        snapshot.tradeCount = 0;
        snapshot.dailyTradedItemCount = 0;
        snapshot.save();
    }
    return snapshot;
}
exports.getOrCreateCollectionDailySnapshot = getOrCreateCollectionDailySnapshot;
function getNftStandard(collectionID) {
    const erc165 = ERC165_1.ERC165.bind(graph_ts_1.Address.fromString(collectionID));
    const isERC721Result = erc165.try_supportsInterface(graph_ts_1.Bytes.fromHexString(constants_1.ERC721_INTERFACE_IDENTIFIER));
    if (isERC721Result.reverted) {
        graph_ts_1.log.warning("[getNftStandard] isERC721 reverted, collection ID: {}", [
            collectionID,
        ]);
    }
    else {
        if (isERC721Result.value) {
            return constants_1.NftStandard.ERC721;
        }
    }
    const isERC1155Result = erc165.try_supportsInterface(graph_ts_1.Bytes.fromHexString(constants_1.ERC1155_INTERFACE_IDENTIFIER));
    if (isERC1155Result.reverted) {
        graph_ts_1.log.warning("[getNftStandard] isERC1155 reverted, collection ID: {}", [
            collectionID,
        ]);
    }
    else {
        if (isERC1155Result.value) {
            return constants_1.NftStandard.ERC1155;
        }
    }
    return constants_1.NftStandard.UNKNOWN;
}
/**
 * Calculates trade/order price in BigDecimal
 * NOTE: currently ignores non-ETH/WETH trades
 */
function calcTradePriceETH(call, paymentToken) {
    if (paymentToken == constants_1.NULL_ADDRESS || paymentToken == constants_1.WETH_ADDRESS) {
        const price = (0, utils_1.calculateMatchPrice)(call);
        return price.toBigDecimal().div(constants_1.MANTISSA_FACTOR);
    }
    else {
        return constants_1.BIGDECIMAL_ZERO;
    }
}
exports.calcTradePriceETH = calcTradePriceETH;
function decodeSingleNftData(call, callData) {
    const sellTarget = call.inputs.addrs[11];
    if (!(0, utils_1.validateCallDataFunctionSelector)(callData)) {
        graph_ts_1.log.warning("[checkCallDataFunctionSelector] returned false, Method ID: {}, transaction hash: {}, target: {}", [
            (0, utils_1.getFunctionSelector)(callData),
            call.transaction.hash.toHexString(),
            sellTarget.toHexString(),
        ]);
        return null;
    }
    else {
        return (0, utils_1.decode_nftTransfer_Method)(sellTarget, callData);
    }
}
exports.decodeSingleNftData = decodeSingleNftData;
function decodeBundleNftData(call, callDatas) {
    const decodedTransferResults = [];
    const decodedAtomicizeResult = (0, utils_1.decode_atomicize_Method)(callDatas);
    for (let i = 0; i < decodedAtomicizeResult.targets.length; i++) {
        const target = decodedAtomicizeResult.targets[i];
        const calldata = decodedAtomicizeResult.callDatas[i];
        // Skip unrecognized method calls
        if (!(0, utils_1.validateCallDataFunctionSelector)(calldata)) {
            graph_ts_1.log.warning("[checkCallDataFunctionSelector] returned false in atomicize, Method ID: {}, transaction hash: {}, target: {}", [
                (0, utils_1.getFunctionSelector)(calldata),
                call.transaction.hash.toHexString(),
                target.toHexString(),
            ]);
        }
        else {
            const singleNftTransferResult = (0, utils_1.decode_nftTransfer_Method)(target, calldata);
            decodedTransferResults.push(singleNftTransferResult);
        }
    }
    return decodedTransferResults;
}
exports.decodeBundleNftData = decodeBundleNftData;
