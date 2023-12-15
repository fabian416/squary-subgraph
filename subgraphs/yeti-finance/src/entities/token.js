"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYUSDToken = exports.getOrCreateToken = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const ERC20Contract_1 = require("../../generated/ActivePool/ERC20Contract");
function getOrCreateToken(address) {
    let token = schema_1.Token.load(address.toHexString());
    if (!token) {
        token = new schema_1.Token(address.toHexString());
        const contract = ERC20Contract_1.ERC20Contract.bind(address);
        token.name = (0, numbers_1.readValue)(contract.try_name(), "");
        token.symbol = (0, numbers_1.readValue)(contract.try_symbol(), "");
        token.decimals = (0, numbers_1.readValue)(contract.try_decimals(), constants_1.BIGINT_ZERO).toI32();
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getYUSDToken() {
    const token = new schema_1.Token(constants_1.YUSD_ADDRESS);
    token.name = "Yeti USD";
    token.symbol = "YUSD";
    token.decimals = 18;
    token.save();
    return token;
}
exports.getYUSDToken = getYUSDToken;
