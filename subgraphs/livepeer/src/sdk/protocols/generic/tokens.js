"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenManager = exports.TokenParams = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../../generated/schema");
const constants_1 = require("../../util/constants");
class TokenParams {
    constructor(name, symbol, decimals) {
        this.name = name;
        this.symbol = symbol;
        this.decimals = decimals;
    }
}
exports.TokenParams = TokenParams;
class TokenManager {
    constructor(protocol, init) {
        this.protocol = protocol;
        this.initializer = init;
    }
    getOrCreateToken(address) {
        let token = schema_1.Token.load(address);
        if (token) {
            return token;
        }
        const params = this.initializer.getTokenParams(address);
        token = new schema_1.Token(address);
        token.name = params.name;
        token.symbol = params.symbol;
        token.decimals = params.decimals;
        token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
        token.save();
        return token;
    }
    getOrCreateRewardToken(type, token) {
        let id = graph_ts_1.Bytes.empty();
        if (type == constants_1.RewardTokenType.BORROW) {
            id = id.concatI32(0);
        }
        else if (type == constants_1.RewardTokenType.DEPOSIT) {
            id = id.concatI32(1);
        }
        else {
            graph_ts_1.log.error("Unsupported reward token type", []);
            graph_ts_1.log.critical("", []);
        }
        id = id.concat(token.id);
        let rToken = schema_1.RewardToken.load(id);
        if (rToken) {
            return rToken;
        }
        rToken = new schema_1.RewardToken(id);
        rToken.type = type;
        rToken.token = token.id;
        rToken.save();
        return rToken;
    }
}
exports.TokenManager = TokenManager;
