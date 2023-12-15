"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateTroveToken = exports.getOrCreateTrove = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const token_1 = require("./token");
function getOrCreateTrove(owner) {
    const id = owner.toHexString();
    let trove = schema_1._Trove.load(id);
    if (trove == null) {
        trove = new schema_1._Trove(id);
        trove.debt = constants_1.BIGINT_ZERO;
        trove.save();
    }
    return trove;
}
exports.getOrCreateTrove = getOrCreateTrove;
function getOrCreateTroveToken(trove, token) {
    const id = trove.id + "-" + token.toHexString();
    let troveToken = schema_1._TroveToken.load(id);
    if (troveToken == null) {
        troveToken = new schema_1._TroveToken(id);
        troveToken.trove = trove.id;
        troveToken.collateral = constants_1.BIGINT_ZERO;
        troveToken.collateralSurplus = constants_1.BIGINT_ZERO;
        troveToken.collateralSurplusChange = constants_1.BIGINT_ZERO;
        troveToken.token = (0, token_1.getOrCreateToken)(token).id;
        troveToken.save();
    }
    return troveToken;
}
exports.getOrCreateTroveToken = getOrCreateTroveToken;
