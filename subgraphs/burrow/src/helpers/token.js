"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateRewardToken = exports.getOrCreateToken = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const const_1 = require("../utils/const");
function getOrCreateToken(id) {
  let token = schema_1.Token.load(id);
  if (!token) {
    token = new schema_1.Token(id);
    token.name = "";
    token.decimals = 0;
    token.symbol = "";
    token.extraDecimals = 0;
    token.lastPriceUSD = const_1.BD_ZERO;
    token.lastPriceBlockNumber = const_1.BI_ZERO;
    const metadata = const_1.assets.get(id);
    if (metadata) {
      token.name = metadata.name;
      token.decimals = metadata.decimals;
      token.symbol = metadata.symbol;
    } else {
      graph_ts_1.log.error("Token metadata need to be added for {}", [id]);
    }
    token.save();
  }
  return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateRewardToken(tokenAddress, type) {
  const id = type.concat("-").concat(tokenAddress);
  let rewardToken = schema_1.RewardToken.load(id);
  if (!rewardToken) {
    rewardToken = new schema_1.RewardToken(id);
    const token = getOrCreateToken(tokenAddress);
    rewardToken.token = token.id;
    rewardToken.type = type;
    rewardToken.save();
  }
  return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
