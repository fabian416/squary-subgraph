"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swap = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const initializers_1 = require("../common/initializers");
function swap(accountAddress, tokenInAddress, amountIn, tokenOutAddress, amountOut, sdk, pool) {
    const account = (0, initializers_1.getOrCreateAccount)(accountAddress, pool, sdk);
    account.swap(pool, tokenInAddress, amountIn, tokenOutAddress, amountOut, graph_ts_1.Address.fromBytes(pool.getBytesID()), true);
}
exports.swap = swap;
