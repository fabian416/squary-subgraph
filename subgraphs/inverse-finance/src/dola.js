"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const DOLA_1 = require("../generated/DOLA/DOLA");
const getters_1 = require("./common/getters");
const constants_1 = require("./common/constants");
// update DOLA supply for
//    - protocol.mintedTokens
//    - protocl.mintedTokensSupplies
//    - FinancialsDailySnapshot.mintedTokensSupplies
function handleTransfer(event) {
    if (event.params.from.toHexString() != constants_1.ZERO_ADDRESS && event.params.to.toHexString() != constants_1.ZERO_ADDRESS) {
        graph_ts_1.log.info("Not a minting or burning event, skipping", []);
        return;
    }
    let protocol = (0, getters_1.getOrCreateProtocol)();
    let dolaContract = DOLA_1.DOLA.bind(event.address);
    let supply = dolaContract.totalSupply();
    if (protocol.mintedTokens == null || protocol.mintedTokens.length == 0) {
        protocol.mintedTokens = [event.address.toHexString()];
    }
    protocol.mintedTokenSupplies = [supply];
    protocol.save();
    let financialMetrics = (0, getters_1.getOrCreateFinancialsDailySnapshot)(event);
    // There is no financialMetrics.mintedTokens in the schema
    // financialMetrics.mintedTokens = mintedTokens;
    financialMetrics.mintedTokenSupplies = [supply];
    financialMetrics.save();
}
exports.handleTransfer = handleTransfer;
