"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSentMessage = void 0;
const constants_1 = require("../constants");
const sdk_1 = require("../sdk");
const chainIds_1 = require("../sdk/protocols/bridge/chainIds");
const constants_2 = require("../sdk/util/constants");
function handleSentMessage(event) {
    // Exclude transfer messages
    if (constants_1.EXCLUDED_MESSAGE_SENDERS.has(event.params.sender)) {
        return;
    }
    const sdk = (0, sdk_1.getSDK)(event);
    const account = sdk.Accounts.loadAccount(event.transaction.from);
    account.messageOut((0, chainIds_1.networkToChainID)(constants_2.Network.MAINNET), event.params.target, event.params.message);
}
exports.handleSentMessage = handleSentMessage;
