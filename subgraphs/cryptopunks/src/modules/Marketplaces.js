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
exports.updateMarketplaceDailySnapshot = exports.updateMarketplace = void 0;
const schema_1 = require("../../generated/schema");
const constants = __importStar(require("../constants/constants"));
const initializers_1 = require("../constants/initializers");
function updateMarketplace(
  tokenAmount,
  punkIndex,
  buyerAddress,
  sellerAddress,
  transaction,
  block
) {
  const marketplace = (0, initializers_1.getOrCreateMarketplace)();
  marketplace.tradeCount += 1;
  marketplace.cumulativeTradeVolumeETH =
    marketplace.cumulativeTradeVolumeETH.plus(
      tokenAmount.divDecimal(constants.ETH_DECIMALS)
    );
  marketplace.save();
  (0, initializers_1.createUserMarketplaceAccount)(buyerAddress, block);
  (0, initializers_1.createUserMarketplaceAccount)(sellerAddress, block);
  updateMarketplaceDailySnapshot(block, punkIndex, buyerAddress, sellerAddress);
}
exports.updateMarketplace = updateMarketplace;
function updateMarketplaceDailySnapshot(
  block,
  tokenId,
  buyerAddress,
  sellerAddress
) {
  const marketplaceDailySnapshot = (0,
  initializers_1.getOrCreateMarketplaceDailySnapshot)(
    block.timestamp,
    block.number
  );
  const noOfDaysSinceUnix = (
    block.timestamp.toI32() / constants.SECONDS_PER_DAY
  ).toString();
  let isUniqueDailyTradedItem = false;
  const itemId = "DAILY_TRADED_ITEM"
    .concat("-")
    .concat(noOfDaysSinceUnix)
    .concat("-")
    .concat(tokenId.toString());
  let dailyTradedItem = schema_1._Item.load(itemId);
  if (!dailyTradedItem) {
    dailyTradedItem = new schema_1._Item(itemId);
    isUniqueDailyTradedItem = true;
  }
  const buyerId = constants.AccountType.DAILY_MARKETPLACE_ACCOUNT.concat(
    "-"
  ).concat(buyerAddress.toHexString());
  const sellerId = constants.AccountType.DAILY_MARKETPLACE_ACCOUNT.concat(
    "-"
  ).concat(sellerAddress.toHexString());
  let dailyBuyer = schema_1._User.load(buyerId);
  if (!dailyBuyer) {
    dailyBuyer = new schema_1._User(buyerId);
    dailyBuyer.save();
    marketplaceDailySnapshot.dailyActiveTraders += 1;
  }
  let dailySeller = schema_1._User.load(sellerId);
  if (!dailySeller) {
    dailySeller = new schema_1._User(sellerId);
    dailySeller.save();
    marketplaceDailySnapshot.dailyActiveTraders += 1;
  }
  marketplaceDailySnapshot.tradeCount += 1;
  marketplaceDailySnapshot.dailyTradedCollectionCount = 1;
  if (isUniqueDailyTradedItem) {
    marketplaceDailySnapshot.dailyTradedItemCount += 1;
  }
  marketplaceDailySnapshot.save();
}
exports.updateMarketplaceDailySnapshot = updateMarketplaceDailySnapshot;
