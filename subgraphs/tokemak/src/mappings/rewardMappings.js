"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleClaim = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../common/constants");
const financial_1 = require("../common/financial");
const protocol_1 = require("../common/protocol");
const tokens_1 = require("../common/tokens");
const usage_1 = require("../common/usage");
const prices_1 = require("../prices");
function handleClaim(event) {
    let financialMetrics = (0, financial_1.getOrCreateFinancialMetrics)(event.block.timestamp, event.block.number);
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    const token = (0, tokens_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.TOKE_ADDRESS));
    const decimals = constants_1.BIGINT_TEN.pow(u8(token.decimals));
    const amountUSD = (0, prices_1.getUsdPrice)(graph_ts_1.Address.fromString(token.id), new graph_ts_1.BigDecimal(event.params.amount.div(decimals)));
    financialMetrics.dailySupplySideRevenueUSD = financialMetrics.dailySupplySideRevenueUSD.plus(amountUSD);
    protocol.cumulativeSupplySideRevenueUSD = protocol.cumulativeSupplySideRevenueUSD.plus(amountUSD);
    financialMetrics.save();
    protocol.save();
    (0, usage_1.updateUsageMetrics)(event.block, event.params.recipient);
}
exports.handleClaim = handleClaim;
