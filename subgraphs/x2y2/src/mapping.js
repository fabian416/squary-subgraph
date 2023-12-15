"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEvInventory = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../generated/schema");
const NftMetadata_1 = require("../generated/X2Y2Exchange/NftMetadata");
const helper_1 = require("./helper");
const configure_1 = require("../configurations/configure");
const versions_1 = require("./versions");
class Token {
    constructor(address, tokenId) {
        this.address = address;
        this.tokenId = tokenId;
    }
}
function handleEvInventory(event) {
    const tokens = decodeTokens(event.params.item.data);
    const collectionAddr = tokens[0].address.toHexString();
    const collection = getOrCreateCollection(collectionAddr);
    const isBundle = tokens.length > 1;
    const volumeETH = event.params.item.price.toBigDecimal().div(helper_1.MANTISSA_FACTOR);
    const priceETH = volumeETH.div(graph_ts_1.BigInt.fromI32(tokens.length).toBigDecimal());
    // TODO: private sale is also possible but yet to figured out how to tell if an event is from a private sale
    const strategy = helper_1.SaleStrategy.STANDARD_SALE;
    const buyer = event.params.detail.op == helper_1.X2Y2Op.COMPLETE_BUY_OFFER
        ? event.params.maker.toHexString()
        : event.params.taker.toHexString();
    const seller = event.params.detail.op == helper_1.X2Y2Op.COMPLETE_BUY_OFFER
        ? event.params.taker.toHexString()
        : event.params.maker.toHexString();
    //
    // new trade
    //
    for (let i = 0; i < tokens.length; i++) {
        const tradeID = isBundle
            ? event.transaction.hash
                .toHexString()
                .concat("-")
                .concat(event.logIndex.toString())
                .concat("-")
                .concat(i.toString())
            : event.transaction.hash
                .toHexString()
                .concat("-")
                .concat(event.logIndex.toString());
        const trade = new schema_1.Trade(tradeID);
        trade.transactionHash = event.transaction.hash.toHexString();
        trade.logIndex = event.logIndex.toI32();
        trade.timestamp = event.block.timestamp;
        trade.blockNumber = event.block.number;
        trade.isBundle = isBundle;
        trade.collection = collectionAddr;
        trade.tokenId = tokens[i].tokenId;
        // average price within the bundle
        trade.priceETH = priceETH;
        // amount is set 1 because x2y2 only supports erc721 as of now
        trade.amount = graph_ts_1.BigInt.fromI32(1);
        trade.strategy = strategy;
        trade.buyer = buyer;
        trade.seller = seller;
        trade.save();
    }
    //
    // calculate marketplace vs creator revenue allocation
    //
    let marketplaceRevenuePercentage = helper_1.BIGINT_ZERO;
    let creatorRevenuePercentage = helper_1.BIGINT_ZERO;
    const fees = event.params.detail.fees;
    for (let i = 0; i < fees.length; i++) {
        const fee = fees[i];
        if (fee.to == helper_1.PROTOCOL_FEE_MANAGER) {
            marketplaceRevenuePercentage = marketplaceRevenuePercentage.plus(fee.percentage);
        }
        else {
            creatorRevenuePercentage = creatorRevenuePercentage.plus(fee.percentage);
        }
    }
    //
    // update collection
    //
    collection.tradeCount += tokens.length;
    collection.royaltyFee = creatorRevenuePercentage
        .toBigDecimal()
        .div(helper_1.FEE_PERCENTAGE_FACTOR)
        .times(helper_1.BIGDECIMAL_HUNDRED);
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
    const deltaMarketplaceRevenueETH = volumeETH.times(marketplaceRevenuePercentage.toBigDecimal().div(helper_1.FEE_PERCENTAGE_FACTOR));
    const deltaCreatorRevenueETH = volumeETH.times(creatorRevenuePercentage.toBigDecimal().div(helper_1.FEE_PERCENTAGE_FACTOR));
    collection.marketplaceRevenueETH = collection.marketplaceRevenueETH.plus(deltaMarketplaceRevenueETH);
    collection.creatorRevenueETH = collection.creatorRevenueETH.plus(deltaCreatorRevenueETH);
    collection.totalRevenueETH = collection.marketplaceRevenueETH.plus(collection.creatorRevenueETH);
    collection.save();
    //
    // update marketplace
    //
    const marketplace = getOrCreateMarketplace(configure_1.NetworkConfigs.getMarketplaceAddress());
    marketplace.tradeCount += 1;
    marketplace.cumulativeTradeVolumeETH =
        marketplace.cumulativeTradeVolumeETH.plus(volumeETH);
    marketplace.marketplaceRevenueETH = marketplace.marketplaceRevenueETH.plus(deltaMarketplaceRevenueETH);
    marketplace.creatorRevenueETH = marketplace.creatorRevenueETH.plus(deltaCreatorRevenueETH);
    marketplace.totalRevenueETH = marketplace.marketplaceRevenueETH.plus(marketplace.creatorRevenueETH);
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
    let newDailyTradedItem = 0;
    for (let i = 0; i < tokens.length; i++) {
        const dailyTradedItemID = "DAILY_TRADED_ITEM-"
            .concat(collectionAddr)
            .concat("-")
            .concat(tokens[i].tokenId.toString())
            .concat("-")
            .concat((event.block.timestamp.toI32() / helper_1.SECONDS_PER_DAY).toString());
        let dailyTradedItem = schema_1._Item.load(dailyTradedItemID);
        if (!dailyTradedItem) {
            dailyTradedItem = new schema_1._Item(dailyTradedItemID);
            dailyTradedItem.save();
            newDailyTradedItem++;
        }
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
    collectionSnapshot.dailyTradedItemCount += newDailyTradedItem;
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
    marketplaceSnapshot.dailyTradedItemCount += newDailyTradedItem;
    marketplaceSnapshot.save();
}
exports.handleEvInventory = handleEvInventory;
function getOrCreateCollection(collectionID) {
    let collection = schema_1.Collection.load(collectionID);
    if (!collection) {
        collection = new schema_1.Collection(collectionID);
        // only ERC721 is supported atm, but more (such as ERC1155) will come
        collection.nftStandard = helper_1.NftStandard.ERC721;
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
/**
 * Same effect as `abi.decode(data, (Pair[]))` but in assemblyscript
 * @param data encoding `struct Pair { IERC721 token; uint256 tokenId; }`
 */
function decodeTokens(data) {
    const decoded = graph_ts_1.ethereum.decode("(address,uint256)[]", data);
    const result = [];
    if (!decoded) {
        graph_ts_1.log.warning("failed to decode {}", [data.toHexString()]);
    }
    else {
        const pairs = decoded.toArray();
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].toTuple();
            result.push(new Token(pair[0].toAddress(), pair[1].toBigInt()));
        }
    }
    return result;
}
