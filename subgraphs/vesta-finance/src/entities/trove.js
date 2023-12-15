"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateTrove = exports.getTrove = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
function getTrove(owner, asset) {
    const id = owner.toHexString() + "-" + asset.toHexString();
    return schema_1._Trove.load(id);
}
exports.getTrove = getTrove;
function getOrCreateTrove(owner, asset) {
    const id = owner.toHexString() + "-" + asset.toHexString();
    let trove = schema_1._Trove.load(id);
    if (trove == null) {
        trove = new schema_1._Trove(id);
        trove.asset = asset.toHexString();
        trove.owner = owner.toHexString();
        trove.collateral = constants_1.BIGINT_ZERO;
        trove.debt = constants_1.BIGINT_ZERO;
        trove.collateralSurplus = constants_1.BIGINT_ZERO;
        trove.collateralSurplusChange = constants_1.BIGINT_ZERO;
        trove.save();
    }
    return trove;
}
exports.getOrCreateTrove = getOrCreateTrove;
