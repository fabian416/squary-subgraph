"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRoyaltyFeeUpdate = exports.handleRoyaltyPayment = exports.handleTakerAsk = exports.handleTakerBid = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ExecutionStrategy_1 = require("../generated/LooksRareExchange/ExecutionStrategy");
const ERC165_1 = require("../generated/LooksRareExchange/ERC165");
const NftMetadata_1 = require("../generated/LooksRareExchange/NftMetadata");
const schema_1 = require("../generated/schema");
const helper_1 = require("./helper");
const configure_1 = require("../configurations/configure");
const versions_1 = require("./versions");
function handleTakerBid(event) {
    if (event.params.currency != helper_1.WETH_ADDRESS) {
        return;
    }
    handleMatch(event, event.params.maker.toHexString(), event.params.taker.toHexString(), event.params.strategy.toHexString(), event.params.collection.toHexString(), event.params.tokenId, event.params.price, event.params.amount);
}
exports.handleTakerBid = handleTakerBid;
function handleTakerAsk(event) {
    if (event.params.currency != helper_1.WETH_ADDRESS) {
        return;
    }
    handleMatch(event, event.params.taker.toHexString(), event.params.maker.toHexString(), event.params.strategy.toHexString(), event.params.collection.toHexString(), event.params.tokenId, event.params.price, event.params.amount);
}
exports.handleTakerAsk = handleTakerAsk;
function handleRoyaltyPayment(event) {
    if (event.params.currency != helper_1.WETH_ADDRESS) {
        return;
    }
    const collection = getOrCreateCollection(event.params.collection.toHexString());
    const deltaCreatorRevenueETH = event.params.amount
        .toBigDecimal()
        .div(helper_1.MANTISSA_FACTOR);
    collection.creatorRevenueETH = collection.creatorRevenueETH.plus(deltaCreatorRevenueETH);
    collection.totalRevenueETH = collection.totalRevenueETH.plus(deltaCreatorRevenueETH);
    collection.save();
    const marketplace = getOrCreateMarketplace(configure_1.NetworkConfigs.getMarketplaceAddress());
    marketplace.creatorRevenueETH = marketplace.creatorRevenueETH.plus(deltaCreatorRevenueETH);
    marketplace.totalRevenueETH = marketplace.totalRevenueETH.plus(deltaCreatorRevenueETH);
    marketplace.save();
}
exports.handleRoyaltyPayment = handleRoyaltyPayment;
function handleRoyaltyFeeUpdate(event) {
    const collection = getOrCreateCollection(event.params.collection.toHexString());
    collection.royaltyFee = event.params.fee
        .toBigDecimal()
        .div(helper_1.BIGDECIMAL_HUNDRED);
    collection.save();
}
exports.handleRoyaltyFeeUpdate = handleRoyaltyFeeUpdate;
function handleMatch(event, seller, buyer, strategyAddr, collectionAddr, tokenId, price, amount) {
    const priceETH = price.toBigDecimal().div(helper_1.MANTISSA_FACTOR);
    const volumeETH = amount.toBigDecimal().times(priceETH);
    const strategy = getOrCreateExecutionStrategy(graph_ts_1.Address.fromString(strategyAddr));
    //
    // new trade
    //
    const trade = new schema_1.Trade(event.transaction.hash
        .toHexString()
        .concat("-")
        .concat(event.logIndex.toString()));
    trade.transactionHash = event.transaction.hash.toHexString();
    trade.logIndex = event.logIndex.toI32();
    trade.timestamp = event.block.timestamp;
    trade.blockNumber = event.block.number;
    trade.isBundle = false;
    trade.collection = collectionAddr;
    trade.tokenId = tokenId;
    trade.priceETH = priceETH;
    trade.amount = amount;
    trade.strategy = strategy.saleStrategy;
    trade.buyer = buyer;
    trade.seller = seller;
    trade.save();
    //
    // update collection
    //
    const collection = getOrCreateCollection(collectionAddr);
    collection.tradeCount += 1;
    const buyerCollectionAccountID = "COLLECTION_ACCOUNT-BUYER-"
        .concat(collection.id)
        .concat("-")
        .concat(buyer);
    let buyerCollectionAccount = schema_1._Item.load(buyerCollectionAccountID);
    if (!buyerCollectionAccount) {
        buyerCollectionAccount = new schema_1._Item(buyerCollectionAccountID);
        buyerCollectionAccount.save();
        collection.buyerCount += 1;
    }
    const sellerCollectionAccountID = "COLLECTION_ACCOUNT-SELLER-"
        .concat(collection.id)
        .concat("-")
        .concat(seller);
    let sellerCollectionAccount = schema_1._Item.load(sellerCollectionAccountID);
    if (!sellerCollectionAccount) {
        sellerCollectionAccount = new schema_1._Item(sellerCollectionAccountID);
        sellerCollectionAccount.save();
        collection.sellerCount += 1;
    }
    collection.cumulativeTradeVolumeETH =
        collection.cumulativeTradeVolumeETH.plus(volumeETH);
    const deltaMarketplaceRevenueETH = volumeETH.times(strategy.protocolFee.div(helper_1.BIGDECIMAL_HUNDRED));
    collection.marketplaceRevenueETH = collection.marketplaceRevenueETH.plus(deltaMarketplaceRevenueETH);
    collection.totalRevenueETH = collection.totalRevenueETH.plus(deltaMarketplaceRevenueETH);
    collection.save();
    //
    // update marketplace
    //
    const marketplace = getOrCreateMarketplace(configure_1.NetworkConfigs.getMarketplaceAddress());
    marketplace.tradeCount += 1;
    marketplace.cumulativeTradeVolumeETH =
        marketplace.cumulativeTradeVolumeETH.plus(volumeETH);
    marketplace.marketplaceRevenueETH = marketplace.marketplaceRevenueETH.plus(deltaMarketplaceRevenueETH);
    marketplace.totalRevenueETH = marketplace.totalRevenueETH.plus(deltaMarketplaceRevenueETH);
    const buyerAccountID = "MARKETPLACE_ACCOUNT-".concat(buyer);
    let buyerAccount = schema_1._Item.load(buyerAccountID);
    if (!buyerAccount) {
        buyerAccount = new schema_1._Item(buyerAccountID);
        buyerAccount.save();
        marketplace.cumulativeUniqueTraders += 1;
    }
    const sellerAccountID = "MARKETPLACE_ACCOUNT-".concat(seller);
    let sellerAccount = schema_1._Item.load(sellerAccountID);
    if (!sellerAccount) {
        sellerAccount = new schema_1._Item(sellerAccountID);
        sellerAccount.save();
        marketplace.cumulativeUniqueTraders += 1;
    }
    marketplace.save();
    // prepare for updating dailyTradedItemCount
    let newDailyTradedItem = false;
    const dailyTradedItemID = "DAILY_TRADED_ITEM-"
        .concat(collectionAddr)
        .concat("-")
        .concat(tokenId.toString())
        .concat("-")
        .concat((event.block.timestamp.toI32() / helper_1.SECONDS_PER_DAY).toString());
    let dailyTradedItem = schema_1._Item.load(dailyTradedItemID);
    if (!dailyTradedItem) {
        dailyTradedItem = new schema_1._Item(dailyTradedItemID);
        dailyTradedItem.save();
        newDailyTradedItem = true;
    }
    //
    // take collection snapshot
    //
    const collectionSnapshot = getOrCreateCollectionDailySnapshot(collectionAddr, event.block.timestamp);
    collectionSnapshot.blockNumber = event.block.number;
    collectionSnapshot.timestamp = event.block.timestamp;
    collectionSnapshot.royaltyFee = collection.royaltyFee;
    collectionSnapshot.dailyMinSalePrice = (0, helper_1.min)(collectionSnapshot.dailyMinSalePrice, priceETH);
    collectionSnapshot.dailyMaxSalePrice = (0, helper_1.max)(collectionSnapshot.dailyMaxSalePrice, priceETH);
    collectionSnapshot.cumulativeTradeVolumeETH =
        collection.cumulativeTradeVolumeETH;
    collectionSnapshot.marketplaceRevenueETH = collection.marketplaceRevenueETH;
    collectionSnapshot.creatorRevenueETH = collection.creatorRevenueETH;
    collectionSnapshot.totalRevenueETH = collection.totalRevenueETH;
    collectionSnapshot.tradeCount = collection.tradeCount;
    collectionSnapshot.dailyTradeVolumeETH =
        collectionSnapshot.dailyTradeVolumeETH.plus(volumeETH);
    if (newDailyTradedItem) {
        collectionSnapshot.dailyTradedItemCount += 1;
    }
    collectionSnapshot.save();
    //
    // take marketplace snapshot
    //
    const marketplaceSnapshot = getOrCreateMarketplaceDailySnapshot(event.block.timestamp);
    marketplaceSnapshot.blockNumber = event.block.number;
    marketplaceSnapshot.timestamp = event.block.timestamp;
    marketplaceSnapshot.collectionCount = marketplace.collectionCount;
    marketplaceSnapshot.cumulativeTradeVolumeETH =
        marketplace.cumulativeTradeVolumeETH;
    marketplaceSnapshot.marketplaceRevenueETH = marketplace.marketplaceRevenueETH;
    marketplaceSnapshot.creatorRevenueETH = marketplace.creatorRevenueETH;
    marketplaceSnapshot.totalRevenueETH = marketplace.totalRevenueETH;
    marketplaceSnapshot.tradeCount = marketplace.tradeCount;
    marketplaceSnapshot.cumulativeUniqueTraders =
        marketplace.cumulativeUniqueTraders;
    const dailyBuyerID = "DAILY_MARKERPLACE_ACCOUNT-".concat(buyer);
    let dailyBuyer = schema_1._Item.load(dailyBuyerID);
    if (!dailyBuyer) {
        dailyBuyer = new schema_1._Item(dailyBuyerID);
        dailyBuyer.save();
        marketplaceSnapshot.dailyActiveTraders += 1;
    }
    const dailySellerID = "DAILY_MARKETPLACE_ACCOUNT-".concat(seller);
    let dailySeller = schema_1._Item.load(dailySellerID);
    if (!dailySeller) {
        dailySeller = new schema_1._Item(dailySellerID);
        dailySeller.save();
        marketplaceSnapshot.dailyActiveTraders += 1;
    }
    const dailyTradedCollectionID = "DAILY_TRADED_COLLECTION-"
        .concat(collectionAddr)
        .concat("-")
        .concat((event.block.timestamp.toI32() / helper_1.SECONDS_PER_DAY).toString());
    let dailyTradedCollection = schema_1._Item.load(dailyTradedCollectionID);
    if (!dailyTradedCollection) {
        dailyTradedCollection = new schema_1._Item(dailyTradedCollectionID);
        dailyTradedCollection.save();
        marketplaceSnapshot.dailyTradedCollectionCount += 1;
    }
    if (newDailyTradedItem) {
        marketplaceSnapshot.dailyTradedItemCount += 1;
    }
    marketplaceSnapshot.save();
}
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
        collection.royaltyFee = helper_1.BIGDECIMAL_ZERO;
        collection.cumulativeTradeVolumeETH = helper_1.BIGDECIMAL_ZERO;
        collection.marketplaceRevenueETH = helper_1.BIGDECIMAL_ZERO;
        collection.creatorRevenueETH = helper_1.BIGDECIMAL_ZERO;
        collection.totalRevenueETH = helper_1.BIGDECIMAL_ZERO;
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
function getOrCreateMarketplace(marketplaceID) {
    let marketplace = schema_1.Marketplace.load(marketplaceID);
    if (!marketplace) {
        marketplace = new schema_1.Marketplace(marketplaceID);
        marketplace.name = configure_1.NetworkConfigs.getProtocolName();
        marketplace.slug = configure_1.NetworkConfigs.getProtocolSlug();
        marketplace.network = configure_1.NetworkConfigs.getNetwork();
        marketplace.collectionCount = 0;
        marketplace.tradeCount = 0;
        marketplace.cumulativeTradeVolumeETH = helper_1.BIGDECIMAL_ZERO;
        marketplace.marketplaceRevenueETH = helper_1.BIGDECIMAL_ZERO;
        marketplace.creatorRevenueETH = helper_1.BIGDECIMAL_ZERO;
        marketplace.totalRevenueETH = helper_1.BIGDECIMAL_ZERO;
        marketplace.cumulativeUniqueTraders = 0;
    }
    marketplace.schemaVersion = versions_1.Versions.getSchemaVersion();
    marketplace.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    marketplace.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    marketplace.save();
    return marketplace;
}
function getOrCreateExecutionStrategy(address) {
    let strategy = schema_1._ExecutionStrategy.load(address.toHexString());
    if (!strategy) {
        strategy = new schema_1._ExecutionStrategy(address.toHexString());
        if (helper_1.STRATEGY_STANDARD_SALE_ADDRESSES.includes(address)) {
            strategy.saleStrategy = helper_1.SaleStrategy.STANDARD_SALE;
        }
        else if (helper_1.STRATEGY_ANY_ITEM_FROM_COLLECTION_ADDRESSES.includes(address)) {
            strategy.saleStrategy = helper_1.SaleStrategy.ANY_ITEM_FROM_COLLECTION;
        }
        else if (helper_1.STRATEGY_PRIVATE_SALE_ADDRESSES.includes(address)) {
            strategy.saleStrategy = helper_1.SaleStrategy.PRIVATE_SALE;
        }
        const contract = ExecutionStrategy_1.ExecutionStrategy.bind(address);
        strategy.protocolFee = contract
            .viewProtocolFee()
            .toBigDecimal()
            .div(helper_1.BIGDECIMAL_HUNDRED);
        strategy.save();
    }
    return strategy;
}
function getOrCreateCollectionDailySnapshot(collection, timestamp) {
    const snapshotID = collection
        .concat("-")
        .concat((timestamp.toI32() / helper_1.SECONDS_PER_DAY).toString());
    let snapshot = schema_1.CollectionDailySnapshot.load(snapshotID);
    if (!snapshot) {
        snapshot = new schema_1.CollectionDailySnapshot(snapshotID);
        snapshot.collection = collection;
        snapshot.blockNumber = helper_1.BIGINT_ZERO;
        snapshot.timestamp = helper_1.BIGINT_ZERO;
        snapshot.royaltyFee = helper_1.BIGDECIMAL_ZERO;
        snapshot.dailyMinSalePrice = helper_1.BIGDECIMAL_MAX;
        snapshot.dailyMaxSalePrice = helper_1.BIGDECIMAL_ZERO;
        snapshot.cumulativeTradeVolumeETH = helper_1.BIGDECIMAL_ZERO;
        snapshot.dailyTradeVolumeETH = helper_1.BIGDECIMAL_ZERO;
        snapshot.marketplaceRevenueETH = helper_1.BIGDECIMAL_ZERO;
        snapshot.creatorRevenueETH = helper_1.BIGDECIMAL_ZERO;
        snapshot.totalRevenueETH = helper_1.BIGDECIMAL_ZERO;
        snapshot.tradeCount = 0;
        snapshot.dailyTradedItemCount = 0;
        snapshot.save();
    }
    return snapshot;
}
function getOrCreateMarketplaceDailySnapshot(timestamp) {
    const snapshotID = (timestamp.toI32() / helper_1.SECONDS_PER_DAY).toString();
    let snapshot = schema_1.MarketplaceDailySnapshot.load(snapshotID);
    if (!snapshot) {
        snapshot = new schema_1.MarketplaceDailySnapshot(snapshotID);
        snapshot.marketplace = configure_1.NetworkConfigs.getMarketplaceAddress();
        snapshot.blockNumber = helper_1.BIGINT_ZERO;
        snapshot.timestamp = helper_1.BIGINT_ZERO;
        snapshot.collectionCount = 0;
        snapshot.cumulativeTradeVolumeETH = helper_1.BIGDECIMAL_ZERO;
        snapshot.marketplaceRevenueETH = helper_1.BIGDECIMAL_ZERO;
        snapshot.creatorRevenueETH = helper_1.BIGDECIMAL_ZERO;
        snapshot.totalRevenueETH = helper_1.BIGDECIMAL_ZERO;
        snapshot.tradeCount = 0;
        snapshot.cumulativeUniqueTraders = 0;
        snapshot.dailyTradedItemCount = 0;
        snapshot.dailyActiveTraders = 0;
        snapshot.dailyTradedCollectionCount = 0;
        snapshot.save();
    }
    return snapshot;
}
function getNftStandard(collectionID) {
    const erc165 = ERC165_1.ERC165.bind(graph_ts_1.Address.fromString(collectionID));
    const isERC721Result = erc165.try_supportsInterface(graph_ts_1.Bytes.fromHexString(helper_1.ERC721_INTERFACE_IDENTIFIER));
    if (isERC721Result.reverted) {
        graph_ts_1.log.warning("[getNftStandard] isERC721 reverted", []);
    }
    else {
        if (isERC721Result.value) {
            return helper_1.NftStandard.ERC721;
        }
    }
    const isERC1155Result = erc165.try_supportsInterface(graph_ts_1.Bytes.fromHexString(helper_1.ERC1155_INTERFACE_IDENTIFIER));
    if (isERC1155Result.reverted) {
        graph_ts_1.log.warning("[getNftStandard] isERC1155 reverted", []);
    }
    else {
        if (isERC1155Result.value) {
            return helper_1.NftStandard.ERC1155;
        }
    }
    return helper_1.NftStandard.UNKNOWN;
}
