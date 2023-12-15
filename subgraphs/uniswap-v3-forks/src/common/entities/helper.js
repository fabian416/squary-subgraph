"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateTokenPricesHelper = exports.getOrCreateUsersHelper = exports.getFeeTier = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../constants");
function getFeeTier(event) {
    return schema_1._HelperStore.load(event.address.concat(graph_ts_1.Bytes.fromHexString("-FeeTier")));
}
exports.getFeeTier = getFeeTier;
function getOrCreateUsersHelper() {
    let uniqueUsersTotal = schema_1._HelperStore.load(constants_1.HelperStoreType.USERS);
    if (uniqueUsersTotal === null) {
        uniqueUsersTotal = new schema_1._HelperStore(constants_1.HelperStoreType.USERS);
        uniqueUsersTotal.valueDecimal = constants_1.BIGDECIMAL_ZERO;
        uniqueUsersTotal.save();
    }
    return uniqueUsersTotal;
}
exports.getOrCreateUsersHelper = getOrCreateUsersHelper;
function getOrCreateTokenPricesHelper(poolAddress) {
    const id = poolAddress.concat(graph_ts_1.Bytes.fromHexString("-TokenPrices"));
    let tokenPrices = schema_1._HelperStore.load(id);
    if (tokenPrices === null) {
        tokenPrices = new schema_1._HelperStore(id);
        tokenPrices.valueDecimalList = [];
        tokenPrices.save();
    }
    return tokenPrices;
}
exports.getOrCreateTokenPricesHelper = getOrCreateTokenPricesHelper;
