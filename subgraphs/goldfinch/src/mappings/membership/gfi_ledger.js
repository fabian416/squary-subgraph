"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGfiWithdrawal = exports.handleGfiDeposit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const helpers_1 = require("../../entities/helpers");
function handleGfiDeposit(event) {
    const vaultedGfi = new schema_1.VaultedGfi(event.params.positionId.toString());
    vaultedGfi.amount = event.params.amount;
    vaultedGfi.user = event.params.owner.toHexString();
    vaultedGfi.vaultedAt = event.block.timestamp.toI32();
    vaultedGfi.save();
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "MEMBERSHIP_GFI_DEPOSIT", event.params.owner);
    transaction.sentAmount = event.params.amount;
    transaction.sentToken = "GFI";
    transaction.save();
}
exports.handleGfiDeposit = handleGfiDeposit;
function handleGfiWithdrawal(event) {
    if (event.params.remainingAmount.isZero()) {
        graph_ts_1.store.remove("VaultedGfi", event.params.positionId.toString());
    }
    else {
        const vaultedGfi = assert(schema_1.VaultedGfi.load(event.params.positionId.toString()));
        vaultedGfi.amount = event.params.remainingAmount;
        vaultedGfi.save();
    }
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "MEMBERSHIP_GFI_WITHDRAWAL", event.params.owner);
    transaction.receivedAmount = event.params.withdrawnAmount;
    transaction.receivedToken = "GFI";
    transaction.save();
}
exports.handleGfiWithdrawal = handleGfiWithdrawal;
