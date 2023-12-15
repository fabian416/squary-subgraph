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
exports.createTradeTransaction = exports.updateTrades = void 0;
const constants = __importStar(require("../constants/constants"));
const initializers_1 = require("../constants/initializers");
const utils_1 = require("../constants/utils");
const Collections_1 = require("./Collections");
const schema_1 = require("../../generated/schema");
const Marketplaces_1 = require("./Marketplaces");
function updateTrades(
  tokenAmount,
  punkIndex,
  buyerAddress,
  sellerAddress,
  transaction,
  block
) {
  const strategy = (0, utils_1.getStrategy)(punkIndex, buyerAddress);
  let bAddress = buyerAddress;
  let tempAmount = tokenAmount;
  if (strategy === constants.SaleStrategy.PRIVATE_SALE) {
    bAddress = (0, utils_1.getSellerAddressFromPunksOfferedForSale)(punkIndex);
    const highestBidderAddress = (0, utils_1.getHighestBiddersAddress)(
      punkIndex
    );
    const bidId = punkIndex
      .toString()
      .concat("-")
      .concat(highestBidderAddress.toHexString());
    const winningBid = schema_1._Bid.load(bidId);
    tempAmount = winningBid.tokensBid;
  }
  createTradeTransaction(
    tempAmount,
    punkIndex,
    bAddress,
    sellerAddress,
    strategy,
    transaction,
    block
  );
  (0, Marketplaces_1.updateMarketplace)(
    tempAmount,
    punkIndex,
    bAddress,
    sellerAddress,
    transaction,
    block
  );
  (0, Collections_1.updateCollection)(
    tempAmount,
    punkIndex,
    bAddress,
    sellerAddress,
    transaction,
    block
  );
}
exports.updateTrades = updateTrades;
function createTradeTransaction(
  tokenAmount,
  punkIndex,
  buyerAddress,
  sellerAddress,
  strategy,
  transaction,
  block
) {
  const trade = (0, initializers_1.getOrCreateTrade)(
    transaction.hash.toHexString(),
    transaction.index
  );
  trade.timestamp = block.timestamp;
  trade.blockNumber = block.number;
  trade.amount = constants.BIGINT_ONE;
  trade.priceETH = tokenAmount.divDecimal(constants.ETH_DECIMALS);
  trade.strategy = strategy;
  trade.tokenId = punkIndex;
  trade.buyer = buyerAddress.toHexString();
  trade.seller = sellerAddress.toHexString();
  trade.save();
}
exports.createTradeTransaction = createTradeTransaction;
