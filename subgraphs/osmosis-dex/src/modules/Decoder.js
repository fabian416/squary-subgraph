"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsgExitSwapShareAmountIn = exports.MsgExitSwapExternAmountOut = exports.MsgExitPool = exports.MsgJoinSwapShareAmountOut = exports.MsgJoinSwapExternAmountIn = exports.MsgJoinPool = exports.MsgCreateBalancerPool = exports.MsgToken = exports.MsgPoolAssets = exports.MsgPoolParams = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants = __importStar(require("../common/constants"));
class MsgPoolParams {
    constructor(swapFee = constants.BIGDECIMAL_ZERO, exitFee = constants.BIGDECIMAL_ZERO, smoothWeightChangeParams = null) {
        this.swapFee = swapFee;
        this.exitFee = exitFee;
        this.smoothWeightChangeParams = smoothWeightChangeParams;
    }
    static decode(reader, length) {
        const end = length < 0 ? reader.end : reader.ptr + length;
        const message = new MsgPoolParams();
        while (reader.ptr < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.swapFee = graph_ts_1.BigDecimal.fromString(reader.string());
                    break;
                case 2:
                    message.exitFee = graph_ts_1.BigDecimal.fromString(reader.string());
                    break;
                case 3:
                    message.smoothWeightChangeParams = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
}
exports.MsgPoolParams = MsgPoolParams;
class MsgPoolAssets {
    constructor(token = null, weight = constants.BIGINT_ZERO) {
        this.token = token;
        this.weight = weight;
    }
    static decode(reader, length) {
        const end = length < 0 ? reader.end : reader.ptr + length;
        const message = new MsgPoolAssets();
        while (reader.ptr < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.token = MsgToken.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.weight = graph_ts_1.BigInt.fromString(reader.string());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
}
exports.MsgPoolAssets = MsgPoolAssets;
class MsgToken {
    constructor(denom = "", amount = constants.BIGINT_ZERO) {
        this.denom = denom;
        this.amount = amount;
    }
    static decode(reader, length) {
        const end = length < 0 ? reader.end : reader.ptr + length;
        const message = new MsgToken();
        while (reader.ptr < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.denom = reader.string();
                    break;
                case 2:
                    message.amount = graph_ts_1.BigInt.fromString(reader.string());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
}
exports.MsgToken = MsgToken;
class MsgCreateBalancerPool {
    constructor(sender = "", poolParams = null, poolAssets = [], future_pool_governor = "") {
        this.sender = sender;
        this.poolParams = poolParams;
        this.poolAssets = poolAssets;
        this.future_pool_governor = future_pool_governor;
    }
    static decode(reader, length) {
        const end = length < 0 ? reader.end : reader.ptr + length;
        const message = new MsgCreateBalancerPool();
        while (reader.ptr < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sender = reader.string();
                    break;
                case 2:
                    message.poolParams = MsgPoolParams.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.poolAssets.push(MsgPoolAssets.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.future_pool_governor = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
}
exports.MsgCreateBalancerPool = MsgCreateBalancerPool;
class MsgJoinPool {
    constructor(sender = "", poolId = constants.BIGINT_ZERO, shareOutAmount = constants.BIGINT_ZERO, tokenInMaxs = []) {
        this.sender = sender;
        this.poolId = poolId;
        this.shareOutAmount = shareOutAmount;
        this.tokenInMaxs = tokenInMaxs;
    }
    static decode(reader, length) {
        const end = length < 0 ? reader.end : reader.ptr + length;
        const message = new MsgJoinPool();
        while (reader.ptr < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sender = reader.string();
                    break;
                case 2:
                    message.poolId = graph_ts_1.BigInt.fromI32(reader.uint32());
                    break;
                case 3:
                    message.shareOutAmount = graph_ts_1.BigInt.fromString(reader.string());
                    break;
                case 4:
                    message.tokenInMaxs.push(MsgToken.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
}
exports.MsgJoinPool = MsgJoinPool;
class MsgJoinSwapExternAmountIn {
    constructor(sender = "", poolId = constants.BIGINT_ZERO, tokenIn = null, shareOutMinAmount = constants.BIGINT_ZERO) {
        this.sender = sender;
        this.poolId = poolId;
        this.tokenIn = tokenIn;
        this.shareOutMinAmount = shareOutMinAmount;
    }
    static decode(reader, length) {
        const end = length < 0 ? reader.end : reader.ptr + length;
        const message = new MsgJoinSwapExternAmountIn();
        while (reader.ptr < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sender = reader.string();
                    break;
                case 2:
                    message.poolId = graph_ts_1.BigInt.fromI32(reader.uint32());
                    break;
                case 3:
                    message.tokenIn = MsgToken.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.shareOutMinAmount = graph_ts_1.BigInt.fromString(reader.string());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
}
exports.MsgJoinSwapExternAmountIn = MsgJoinSwapExternAmountIn;
class MsgJoinSwapShareAmountOut {
    constructor(sender = "", poolId = constants.BIGINT_ZERO, tokenInDenom = "", shareOutAmount = constants.BIGINT_ZERO, tokenInMaxAmount = constants.BIGINT_ZERO) {
        this.sender = sender;
        this.poolId = poolId;
        this.tokenInDenom = tokenInDenom;
        this.shareOutAmount = shareOutAmount;
        this.tokenInMaxAmount = tokenInMaxAmount;
    }
    static decode(reader, length) {
        const end = length < 0 ? reader.end : reader.ptr + length;
        const message = new MsgJoinSwapShareAmountOut();
        while (reader.ptr < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sender = reader.string();
                    break;
                case 2:
                    message.poolId = graph_ts_1.BigInt.fromI32(reader.uint32());
                    break;
                case 3:
                    message.tokenInDenom = reader.string();
                    break;
                case 4:
                    message.shareOutAmount = graph_ts_1.BigInt.fromString(reader.string());
                    break;
                case 5:
                    message.tokenInMaxAmount = graph_ts_1.BigInt.fromString(reader.string());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
}
exports.MsgJoinSwapShareAmountOut = MsgJoinSwapShareAmountOut;
class MsgExitPool {
    constructor(sender = "", poolId = constants.BIGINT_ZERO, shareInAmount = constants.BIGINT_ZERO, tokenOutMins = []) {
        this.sender = sender;
        this.poolId = poolId;
        this.shareInAmount = shareInAmount;
        this.tokenOutMins = tokenOutMins;
    }
    static decode(reader, length) {
        const end = length < 0 ? reader.end : reader.ptr + length;
        const message = new MsgExitPool();
        while (reader.ptr < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sender = reader.string();
                    break;
                case 2:
                    message.poolId = graph_ts_1.BigInt.fromI32(reader.uint32());
                    break;
                case 3:
                    message.shareInAmount = graph_ts_1.BigInt.fromString(reader.string());
                    break;
                case 4:
                    message.tokenOutMins.push(MsgToken.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
}
exports.MsgExitPool = MsgExitPool;
class MsgExitSwapExternAmountOut {
    constructor(sender = "", poolId = constants.BIGINT_ZERO, tokenOut = null, shareInMaxAmount = constants.BIGINT_ZERO) {
        this.sender = sender;
        this.poolId = poolId;
        this.tokenOut = tokenOut;
        this.shareInMaxAmount = shareInMaxAmount;
    }
    static decode(reader, length) {
        const end = length < 0 ? reader.end : reader.ptr + length;
        const message = new MsgExitSwapExternAmountOut();
        while (reader.ptr < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sender = reader.string();
                    break;
                case 2:
                    message.poolId = graph_ts_1.BigInt.fromI32(reader.uint32());
                    break;
                case 3:
                    message.tokenOut = MsgToken.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.shareInMaxAmount = graph_ts_1.BigInt.fromString(reader.string());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
}
exports.MsgExitSwapExternAmountOut = MsgExitSwapExternAmountOut;
class MsgExitSwapShareAmountIn {
    constructor(sender = "", poolId = constants.BIGINT_ZERO, tokenOutDenom = "", shareInAmount = constants.BIGINT_ZERO, tokenOutMinAmount = constants.BIGINT_ZERO) {
        this.sender = sender;
        this.poolId = poolId;
        this.tokenOutDenom = tokenOutDenom;
        this.shareInAmount = shareInAmount;
        this.tokenOutMinAmount = tokenOutMinAmount;
    }
    static decode(reader, length) {
        const end = length < 0 ? reader.end : reader.ptr + length;
        const message = new MsgExitSwapShareAmountIn();
        while (reader.ptr < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sender = reader.string();
                    break;
                case 2:
                    message.poolId = graph_ts_1.BigInt.fromI32(reader.uint32());
                    break;
                case 3:
                    message.tokenOutDenom = reader.string();
                    break;
                case 4:
                    message.shareInAmount = graph_ts_1.BigInt.fromString(reader.string());
                    break;
                case 5:
                    message.tokenOutMinAmount = graph_ts_1.BigInt.fromString(reader.string());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
}
exports.MsgExitSwapShareAmountIn = MsgExitSwapShareAmountIn;
