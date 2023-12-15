"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpellState = exports.CHIEF = exports.MKR_TOKEN = exports.GOVERNANCE_TYPE = exports.BIGDECIMAL_ZERO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.ZERO_ADDRESS = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.GOVERNANCE_TYPE = "MakerGovernance";
exports.MKR_TOKEN = "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2";
exports.CHIEF = "0x0a3f6849f78076aefadf113f5bed87720274ddc0";
var SpellState;
(function (SpellState) {
    SpellState.ACTIVE = "ACTIVE";
    SpellState.LIFTED = "LIFTED";
    SpellState.SCHEDULED = "SCHEDULED";
    SpellState.CAST = "CAST";
})(SpellState = exports.SpellState || (exports.SpellState = {}));
