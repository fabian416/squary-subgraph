"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.SECONDS_PER_DAY = exports.GENESIS_ADDRESS = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.GENESIS_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.SECONDS_PER_DAY = 60 * 60 * 24;
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
