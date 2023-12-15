"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swap = void 0;
const initializers_1 = require("../common/initializers");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function swap(event, accountAddress, tokenInAddress, amountIn, tokenOutAddress, amountOut) {
    const sdk = (0, initializers_1.initializeSDK)(event);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    const account = (0, initializers_1.getOrCreateAccount)(accountAddress, pool, sdk);
    account.swap(pool, tokenInAddress, amountIn, tokenOutAddress, amountOut, graph_ts_1.Address.fromBytes(pool.getBytesID()), true);
}
exports.swap = swap;
