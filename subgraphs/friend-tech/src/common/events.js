"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrade = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const configure_1 = require("../../configurations/configure");
const schema_1 = require("../../generated/schema");
function createTrade(token, traderAddress, subjectAddress, shares, sharePriceAmount, subjectFeeAmount, protocolFeeAmount, tradeAmount, isBuy, event) {
    const sharePriceUSD = (0, utils_1.bigIntToBigDecimal)(sharePriceAmount, token.decimals).times(token.lastPriceUSD);
    const protocolFeeUSD = (0, utils_1.bigIntToBigDecimal)(protocolFeeAmount, token.decimals).times(token.lastPriceUSD);
    const subjectFeeUSD = (0, utils_1.bigIntToBigDecimal)(subjectFeeAmount, token.decimals).times(token.lastPriceUSD);
    const tradeAmountUSD = (0, utils_1.bigIntToBigDecimal)(tradeAmount, token.decimals).times(token.lastPriceUSD);
    const id = graph_ts_1.Bytes.empty()
        .concat(event.transaction.hash)
        .concatI32(event.logIndex.toI32());
    const tradeEvent = new schema_1.Trade(id);
    tradeEvent.hash = event.transaction.hash;
    tradeEvent.logIndex = event.logIndex.toI32();
    tradeEvent.protocol = configure_1.NetworkConfigs.getFactoryAddress();
    tradeEvent.to = event.transaction.to
        ? event.transaction.to
        : graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS);
    tradeEvent.from = event.transaction.from;
    tradeEvent.trader = traderAddress;
    tradeEvent.subject = subjectAddress;
    tradeEvent.type = isBuy ? constants_1.TradeType.BUY : constants_1.TradeType.SELL;
    tradeEvent.shares = shares;
    tradeEvent.sharePriceAmount = sharePriceAmount;
    tradeEvent.sharePriceUSD = sharePriceUSD;
    tradeEvent.protocolFeeAmount = protocolFeeAmount;
    tradeEvent.protocolFeeUSD = protocolFeeUSD;
    tradeEvent.subjectFeeAmount = subjectFeeAmount;
    tradeEvent.subjectFeeUSD = subjectFeeUSD;
    tradeEvent.amount = tradeAmount;
    tradeEvent.amountUSD = tradeAmountUSD;
    tradeEvent.blockNumber = event.block.number;
    tradeEvent.timestamp = event.block.timestamp;
    tradeEvent.save();
    return tradeEvent.id;
}
exports.createTrade = createTrade;
