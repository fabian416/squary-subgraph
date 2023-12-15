"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenManager = exports.TokenParams = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../../generated/schema");
const chainIds_1 = require("./chainIds");
const constants_1 = require("../../util/constants");
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
        if (token) {
            return token;
        }
        const params = this.initializer.getTokenParams(address);
        token = new schema_1.Token(address);
        token.name = params.name;
        token.symbol = params.symbol;
        token.decimals = params.decimals;
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
    getOrCreateCrosschainToken(chainID, address, type, token) {
        const id = changetype(graph_ts_1.Bytes.fromBigInt(chainID)).concat(address);
        let ct = schema_1.CrosschainToken.load(id);
        if (ct) {
            return ct;
        }
        const base = this.getOrCreateToken(token);
        ct = new schema_1.CrosschainToken(id);
        ct.chainID = chainID;
        ct.network = (0, chainIds_1.chainIDToNetwork)(chainID);
        ct.address = address;
        ct.type = type;
        ct.token = base.id;
        ct.save();
        return ct;
    }
    registerSupportedToken(address) {
        let token = schema_1.SupportedToken.load(address);
        if (token) {
            return;
        }
        token = new schema_1.SupportedToken(address);
        token.save();
        this.protocol.addSupportedToken();
    }
}
exports.TokenManager = TokenManager;
