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
exports.updateCollectionSnapshot = exports.updateCollection = void 0;
const constants = __importStar(require("../constants/constants"));
const schema_1 = require("../../generated/schema");
const initializers_1 = require("../constants/initializers");
const utils_1 = require("../constants/utils");
function updateCollection(
  tokenAmount,
  punkIndex,
  buyerAddress,
  sellerAddress,
  transaction,
  block
) {
  const collection = (0, initializers_1.getOrCreateCollection)();
  collection.cumulativeTradeVolumeETH =
    collection.cumulativeTradeVolumeETH.plus(
      tokenAmount.divDecimal(constants.ETH_DECIMALS)
    );
  collection.tradeCount += 1;
  collection.save();
  (0, initializers_1.createUserCollectionAccount)(
    constants.TradeType.BUYER,
    buyerAddress
  );
  (0, initializers_1.createUserCollectionAccount)(
    constants.TradeType.SELLER,
    sellerAddress
  );
  updateCollectionSnapshot(block, tokenAmount, punkIndex);
}
exports.updateCollection = updateCollection;
function updateCollectionSnapshot(block, tokenAmount, tokenId) {
  const collectionDailySnapshot = (0,
  initializers_1.getOrCreateCollectionDailySnapshot)(block);
  collectionDailySnapshot.dailyMinSalePrice = (0, utils_1.min)(
    tokenAmount.divDecimal(constants.ETH_DECIMALS),
    collectionDailySnapshot.dailyMinSalePrice
  );
  collectionDailySnapshot.dailyMaxSalePrice = (0, utils_1.max)(
    tokenAmount.divDecimal(constants.ETH_DECIMALS),
    collectionDailySnapshot.dailyMaxSalePrice
  );
  collectionDailySnapshot.dailyTradeVolumeETH =
    collectionDailySnapshot.dailyTradeVolumeETH.plus(
      tokenAmount.divDecimal(constants.ETH_DECIMALS)
    );
  collectionDailySnapshot.tradeCount += 1;
  const dailyTradedItemId = "DAILY_TRADED_ITEM-"
    .concat((block.timestamp.toI32() / constants.SECONDS_PER_DAY).toString())
    .concat(tokenId.toString());
  let dailyTradedItem = schema_1._Item.load(dailyTradedItemId);
  if (!dailyTradedItem) {
    dailyTradedItem = new schema_1._Item(dailyTradedItemId);
    dailyTradedItem.save();
    collectionDailySnapshot.dailyTradedItemCount += 1;
  }
  collectionDailySnapshot.save();
}
exports.updateCollectionSnapshot = updateCollectionSnapshot;
