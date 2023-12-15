"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateAccount = void 0;
const schema_1 = require("../../generated/schema");
const protocol_1 = require("./protocol");
function getOrCreateAccount(id) {
    let account = schema_1.Account.load(id);
    if (!account) {
        account = new schema_1.Account(id);
        account.save();
        const protocol = (0, protocol_1.getOrCreateProtocol)();
        protocol.cumulativeUniqueUsers += 1;
        protocol.save();
    }
    return account;
}
exports.getOrCreateAccount = getOrCreateAccount;
