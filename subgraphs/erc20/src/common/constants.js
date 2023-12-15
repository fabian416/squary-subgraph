"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BIGDECIMAL_ONE = exports.BIGDECIMAL_ZERO = exports.BIGINT_TWO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.SECONDS_PER_HOUR = exports.SECONDS_PER_DAY = exports.GENESIS_ADDRESS = exports.DEFAULT_DECIMALS = exports.REGISTRY_HASH = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configure_1 = require("../../configurations/configure");
// Constants
exports.REGISTRY_HASH = configure_1.IPFS_HASH;
exports.DEFAULT_DECIMALS = 18;
exports.GENESIS_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.SECONDS_PER_DAY = 60 * 60 * 24;
exports.SECONDS_PER_HOUR = 60 * 60;
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_TWO = graph_ts_1.BigInt.fromI32(2);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.BIGDECIMAL_ONE = new graph_ts_1.BigDecimal(exports.BIGINT_ONE);
