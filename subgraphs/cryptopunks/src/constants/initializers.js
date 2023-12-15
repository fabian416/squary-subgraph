"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserMarketplaceAccount =
  exports.createUserCollectionAccount =
  exports.createBid =
  exports.getOrCreateCollectionDailySnapshot =
  exports.getOrCreateMarketplaceDailySnapshot =
  exports.getOrCreateTrade =
  exports.getOrCreateCollection =
  exports.getOrCreateMarketplace =
    void 0;
const schema_1 = require("../../generated/schema");
const versions_1 = require("../versions");
const constants = __importStar(require("./constants"));
function getOrCreateMarketplace() {
  let marketplace = schema_1.Marketplace.load(
    constants.CRYPTOPUNK_CONTRACT_ADDRESS
  );
  if (!marketplace) {
    marketplace = new schema_1.Marketplace(
      constants.CRYPTOPUNK_CONTRACT_ADDRESS
    );
    marketplace.name = constants.MARKETPLACE_NAME;
    marketplace.slug = constants.MARKETPLACE_SLUG;
    marketplace.network = constants.Network.MAINNET;
    marketplace.collectionCount = 1;
    marketplace.tradeCount = 0;
    marketplace.cumulativeTradeVolumeETH = constants.BIGDECIMAL_ZERO;
    marketplace.marketplaceRevenueETH = constants.BIGDECIMAL_ZERO;
    marketplace.creatorRevenueETH = constants.BIGDECIMAL_ZERO;
    marketplace.totalRevenueETH = constants.BIGDECIMAL_ZERO;
    marketplace.cumulativeUniqueTraders = 0;
  }
  marketplace.schemaVersion = versions_1.Versions.getSchemaVersion();
  marketplace.subgraphVersion = versions_1.Versions.getSubgraphVersion();
  marketplace.methodologyVersion = versions_1.Versions.getMethodologyVersion();
  marketplace.save();
  return marketplace;
}
exports.getOrCreateMarketplace = getOrCreateMarketplace;
function getOrCreateCollection() {
  let collection = schema_1.Collection.load(
    constants.CRYPTOPUNK_CONTRACT_ADDRESS
  );
  if (!collection) {
    collection = new schema_1.Collection(constants.CRYPTOPUNK_CONTRACT_ADDRESS);
    collection.name = constants.CRYPTOPUNK_NAME;
    collection.symbol = constants.CRYPTOPUNK_SYMBOL;
    collection.totalSupply = constants.CRYPTOPUNK_TOTAL_SUPPLY;
    collection.nftStandard = constants.NftStandard.UNKNOWN;
    collection.royaltyFee = constants.BIGDECIMAL_ZERO;
    collection.cumulativeTradeVolumeETH = constants.BIGDECIMAL_ZERO;
    collection.marketplaceRevenueETH = constants.BIGDECIMAL_ZERO;
    collection.creatorRevenueETH = constants.BIGDECIMAL_ZERO;
    collection.totalRevenueETH = constants.BIGDECIMAL_ZERO;
    collection.tradeCount = 0;
    collection.buyerCount = 0;
    collection.sellerCount = 0;
    collection.save();
  }
  return collection;
}
exports.getOrCreateCollection = getOrCreateCollection;
function getOrCreateTrade(transactionHash, logIndex) {
  const id = transactionHash.concat("-").concat(logIndex.toString());
  let trade = schema_1.Trade.load(id);
  if (!trade) {
    trade = new schema_1.Trade(id);
    trade.transactionHash = transactionHash;
    trade.logIndex = logIndex.toI32();
    trade.timestamp = constants.BIGINT_ZERO;
    trade.blockNumber = constants.BIGINT_ZERO;
    trade.isBundle = false;
    trade.collection = constants.CRYPTOPUNK_CONTRACT_ADDRESS;
    trade.tokenId = constants.BIGINT_ZERO;
    trade.amount = constants.BIGINT_ZERO;
    trade.priceETH = constants.BIGDECIMAL_ZERO;
    trade.strategy = "";
    trade.buyer = "";
    trade.seller = "";
    trade.save();
  }
  return trade;
}
exports.getOrCreateTrade = getOrCreateTrade;
function getOrCreateMarketplaceDailySnapshot(timestamp, blockNumber) {
  const noOfDaysSinceUnix = (
    timestamp.toI32() / constants.SECONDS_PER_DAY
  ).toString();
  const snapshotID =
    constants.CRYPTOPUNK_CONTRACT_ADDRESS.concat("-").concat(noOfDaysSinceUnix);
  let marketplaceDailySnapshot =
    schema_1.MarketplaceDailySnapshot.load(snapshotID);
  if (!marketplaceDailySnapshot) {
    marketplaceDailySnapshot = new schema_1.MarketplaceDailySnapshot(
      snapshotID
    );
    const marketplace = getOrCreateMarketplace();
    marketplaceDailySnapshot.marketplace =
      constants.CRYPTOPUNK_CONTRACT_ADDRESS;
    marketplaceDailySnapshot.totalRevenueETH = constants.BIGDECIMAL_ZERO;
    marketplaceDailySnapshot.creatorRevenueETH = constants.BIGDECIMAL_ZERO;
    marketplaceDailySnapshot.marketplaceRevenueETH = constants.BIGDECIMAL_ZERO;
    marketplaceDailySnapshot.cumulativeTradeVolumeETH =
      marketplace.cumulativeTradeVolumeETH;
    marketplaceDailySnapshot.collectionCount = 1;
    marketplaceDailySnapshot.dailyTradedCollectionCount = 0;
    marketplaceDailySnapshot.tradeCount = marketplace.tradeCount;
    marketplaceDailySnapshot.dailyTradedItemCount = 0;
    marketplaceDailySnapshot.cumulativeUniqueTraders =
      marketplace.cumulativeUniqueTraders;
    marketplaceDailySnapshot.dailyActiveTraders = 0;
    marketplaceDailySnapshot.blockNumber = blockNumber;
    marketplaceDailySnapshot.timestamp = timestamp;
    marketplaceDailySnapshot.save();
  }
  return marketplaceDailySnapshot;
}
exports.getOrCreateMarketplaceDailySnapshot =
  getOrCreateMarketplaceDailySnapshot;
function getOrCreateCollectionDailySnapshot(block) {
  const noOfDaysSinceUnix = (
    block.timestamp.toI32() / constants.SECONDS_PER_DAY
  ).toString();
  const snapshotID =
    constants.CRYPTOPUNK_CONTRACT_ADDRESS.concat("-").concat(noOfDaysSinceUnix);
  let collectionDailySnapshot =
    schema_1.CollectionDailySnapshot.load(snapshotID);
  if (!collectionDailySnapshot) {
    collectionDailySnapshot = new schema_1.CollectionDailySnapshot(snapshotID);
    const collection = getOrCreateCollection();
    collectionDailySnapshot.collection = constants.CRYPTOPUNK_CONTRACT_ADDRESS;
    collectionDailySnapshot.totalRevenueETH = constants.BIGDECIMAL_ZERO;
    collectionDailySnapshot.dailyTradeVolumeETH = constants.BIGDECIMAL_ZERO;
    collectionDailySnapshot.creatorRevenueETH = constants.BIGDECIMAL_ZERO;
    collectionDailySnapshot.marketplaceRevenueETH = constants.BIGDECIMAL_ZERO;
    collectionDailySnapshot.cumulativeTradeVolumeETH =
      collection.cumulativeTradeVolumeETH;
    collectionDailySnapshot.royaltyFee = constants.BIGDECIMAL_ZERO;
    collectionDailySnapshot.dailyMinSalePrice = constants.BIGDECIMAL_MAX;
    collectionDailySnapshot.dailyMaxSalePrice = constants.BIGDECIMAL_ZERO;
    collectionDailySnapshot.tradeCount = collection.tradeCount;
    collectionDailySnapshot.dailyTradedItemCount = 0;
    collectionDailySnapshot.timestamp = block.timestamp;
    collectionDailySnapshot.blockNumber = block.timestamp;
    collectionDailySnapshot.save();
  }
  return collectionDailySnapshot;
}
exports.getOrCreateCollectionDailySnapshot = getOrCreateCollectionDailySnapshot;
function createBid(tokenId, bidAmount, bidderAddress, block) {
  const bidId = tokenId
    .toString()
    .concat("-")
    .concat(bidderAddress.toHexString());
  let bid = schema_1._Bid.load(bidId);
  if (!bid) {
    bid = new schema_1._Bid(bidId);
    bid.tokensBid = bidAmount;
    bid.tokenId = tokenId;
    bid.blockNumber = block.number;
    bid.timestamp = block.timestamp;
    bid.bidder = bidderAddress.toHexString();
    bid.save();
  }
  return bid;
}
exports.createBid = createBid;
function createUserCollectionAccount(type, address) {
  const collection = getOrCreateCollection();
  if (type === constants.TradeType.BUYER) {
    let buyerCollection = schema_1._User.load(
      constants.AccountType.COLLECTION_ACCOUNT.concat("-")
        .concat(constants.TradeType.BUYER)
        .concat("-")
        .concat(address.toHexString())
    );
    if (!buyerCollection) {
      buyerCollection = new schema_1._User(
        constants.AccountType.COLLECTION_ACCOUNT.concat("-")
          .concat(constants.TradeType.BUYER)
          .concat("-")
          .concat(address.toHexString())
      );
      collection.buyerCount += 1;
    }
    collection.save();
  }
  if (type === constants.TradeType.SELLER) {
    const collection = getOrCreateCollection();
    let sellerCollection = schema_1._User.load(
      constants.AccountType.COLLECTION_ACCOUNT.concat("-")
        .concat(constants.TradeType.SELLER)
        .concat("-")
        .concat(address.toHexString())
    );
    if (!sellerCollection) {
      sellerCollection = new schema_1._User(
        constants.AccountType.COLLECTION_ACCOUNT.concat("-")
          .concat(constants.TradeType.SELLER)
          .concat("-")
          .concat(address.toHexString())
      );
      collection.sellerCount += 1;
    }
    collection.save();
  }
}
exports.createUserCollectionAccount = createUserCollectionAccount;
function createUserMarketplaceAccount(address, block) {
  let marketplaceUser = schema_1._User.load(
    constants.AccountType.MARKETPLACE_ACCOUNT.concat("-").concat(
      address.toHexString()
    )
  );
  if (!marketplaceUser) {
    const marketplace = getOrCreateMarketplace();
    const marketplaceDailySnapshot = getOrCreateMarketplaceDailySnapshot(
      block.timestamp,
      block.number
    );
    marketplaceUser = new schema_1._User(
      constants.AccountType.MARKETPLACE_ACCOUNT.concat("-").concat(
        address.toHexString()
      )
    );
    marketplace.cumulativeUniqueTraders += 1;
    marketplaceDailySnapshot.cumulativeUniqueTraders += 1;
    marketplaceDailySnapshot.save();
    marketplace.save();
  }
}
exports.createUserMarketplaceAccount = createUserMarketplaceAccount;
