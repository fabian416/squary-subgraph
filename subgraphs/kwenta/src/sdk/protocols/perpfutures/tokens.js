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
exports.TokenManager = exports.TokenParams = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants = __importStar(require("../../util/constants"));
const schema_1 = require("../../../../generated/schema");
class TokenParams {
}
exports.TokenParams = TokenParams;
class TokenManager {
    constructor(protocol, init) {
        this.protocol = protocol;
        this.initializer = init;
    }
    getOrCreateToken(address) {
        let token = schema_1.Token.load(address);
        if (!token) {
            token = new schema_1.Token(address);
            const params = this.initializer.getTokenParams(address);
            token.name = params.name;
            token.symbol = params.symbol;
            token.decimals = params.decimals;
            token.save();
        }
        return token;
    }
    updateTokenPrice(token, usdPrice, block) {
        token.lastPriceUSD = usdPrice;
        token.lastPriceBlockNumber = block.number;
        token.save();
    }
    getOrCreateTokenFromBytes(address) {
        return this.getOrCreateToken(graph_ts_1.Address.fromBytes(address));
    }
    getOrCreateRewardToken(token, type) {
        let id = graph_ts_1.Bytes.empty();
        if (type == constants.RewardTokenType.BORROW) {
            id = id.concatI32(0);
        }
        else if (type == constants.RewardTokenType.DEPOSIT) {
            id = id.concatI32(1);
        }
        else if (type == constants.RewardTokenType.STAKE) {
            id = id.concatI32(2);
        }
        else {
            graph_ts_1.log.error("Unsupported reward token type", []);
            graph_ts_1.log.critical("", []);
        }
        id = id.concat(token.id);
        let rewardToken = schema_1.RewardToken.load(id);
        if (!rewardToken) {
            rewardToken = new schema_1.RewardToken(id);
            rewardToken.type = type;
            rewardToken.token = token.id;
            rewardToken.save();
        }
        return rewardToken;
    }
}
exports.TokenManager = TokenManager;
