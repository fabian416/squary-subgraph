"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIndexerCut = exports.getDelegatorCut = void 0;
const constants_1 = require("./constants");
const getters_1 = require("./getters");
function getDelegatorCut(event, indexerAddress, amount) {
    return amount.minus(getIndexerCut(event, indexerAddress, amount));
}
exports.getDelegatorCut = getDelegatorCut;
function getIndexerCut(event, indexerAddress, amount) {
    const indexer = (0, getters_1.getOrCreateIndexer)(event, indexerAddress);
    if (indexer.delegatedTokens != constants_1.BIGINT_ZERO) {
        return indexer.indexingRewardCut.times(amount).div(constants_1.MAX_PPM);
    }
    else {
        return amount;
    }
}
exports.getIndexerCut = getIndexerCut;
