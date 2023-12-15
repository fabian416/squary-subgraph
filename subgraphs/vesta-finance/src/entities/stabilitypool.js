"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStabilityPoolTVL = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const market_1 = require("./market");
const token_1 = require("./token");
function updateStabilityPoolTVL(event, VSTAmount, assetAmount, asset) {
    const VSTPrice = (0, token_1.getVSTTokenPrice)(event);
    const vstToken = (0, token_1.getOrCreateAssetToken)(graph_ts_1.Address.fromString(constants_1.VST_ADDRESS));
    vstToken.lastPriceUSD = VSTPrice;
    vstToken.lastPriceBlockNumber = event.block.number;
    vstToken.save();
    const VSTValue = (0, numbers_1.bigIntToBigDecimal)(VSTAmount).times(VSTPrice);
    const assetToken = (0, token_1.getOrCreateAssetToken)(asset);
    const totalAssetValue = (0, numbers_1.bigIntToBigDecimal)(assetAmount).times(assetToken.lastPriceUSD);
    const stabilityPoolTVL = VSTValue.plus(totalAssetValue);
    const stabilityPool = (0, market_1.getOrCreateStabilityPool)(event.address, asset, event);
    stabilityPool.inputTokenBalance = VSTAmount;
    stabilityPool.totalValueLockedUSD = stabilityPoolTVL;
    stabilityPool.totalDepositBalanceUSD = stabilityPoolTVL;
    stabilityPool.inputTokenPriceUSD = VSTPrice;
    stabilityPool.save();
}
exports.updateStabilityPoolTVL = updateStabilityPoolTVL;
