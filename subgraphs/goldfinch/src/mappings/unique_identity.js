"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransferSingle = void 0;
/* eslint-disable @typescript-eslint/no-magic-numbers */
const graph_ts_1 = require("@graphprotocol/graph-ts");
const helpers_1 = require("../entities/helpers");
const user_1 = require("../entities/user");
function handleTransferSingle(event) {
    const receivingUser = (0, user_1.getOrInitUser)(event.params.to);
    const uidType = event.params.id;
    if (uidType.equals(graph_ts_1.BigInt.fromI32(0))) {
        receivingUser.isNonUsIndividual = true;
    }
    else if (uidType.equals(graph_ts_1.BigInt.fromI32(1))) {
        receivingUser.isUsAccreditedIndividual = true;
    }
    else if (uidType.equals(graph_ts_1.BigInt.fromI32(2))) {
        receivingUser.isUsNonAccreditedIndividual = true;
    }
    else if (uidType.equals(graph_ts_1.BigInt.fromI32(3))) {
        receivingUser.isUsEntity = true;
    }
    else if (uidType.equals(graph_ts_1.BigInt.fromI32(4))) {
        receivingUser.isNonUsEntity = true;
    }
    receivingUser.save();
    if (event.params.from.notEqual(graph_ts_1.Bytes.fromHexString("0x0000000000000000000000000000000000000000"))) {
        const sendingUser = (0, user_1.getOrInitUser)(event.params.from);
        const uidType = event.params.id;
        if (uidType.equals(graph_ts_1.BigInt.fromI32(0))) {
            sendingUser.isNonUsIndividual = false;
        }
        else if (uidType.equals(graph_ts_1.BigInt.fromI32(1))) {
            sendingUser.isUsAccreditedIndividual = false;
        }
        else if (uidType.equals(graph_ts_1.BigInt.fromI32(2))) {
            sendingUser.isUsNonAccreditedIndividual = false;
        }
        else if (uidType.equals(graph_ts_1.BigInt.fromI32(3))) {
            sendingUser.isUsEntity = false;
        }
        else if (uidType.equals(graph_ts_1.BigInt.fromI32(4))) {
            sendingUser.isNonUsEntity = false;
        }
        sendingUser.save();
    }
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "UID_MINTED", event.params.to);
    transaction.user = transaction.category = "UID_MINTED";
    // UID NFTs actually don't have a unique ID; they're semi-fungible.
    transaction.receivedNftId = event.params.id.toString();
    transaction.sentNftId = event.params.id.toString();
    transaction.receivedNftType = "UID";
    transaction.save();
}
exports.handleTransferSingle = handleTransferSingle;
