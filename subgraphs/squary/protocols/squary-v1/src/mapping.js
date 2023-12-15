"use strict";
// protocol handlers and protocol specific mappings
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSettleCompleted = exports.handleWithdrawalMade = exports.handleDepositMade = exports.handleGroupCreated = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
function handleGroupCreated(event) {
    const group = new schema_1.Group(event.params.gnosisSafe.toHexString());
    group.gnosisSafe = event.params.gnosisSafe;
    group.memberAddresses = event.params.members.map((member) => member.toHexString());
    group.save();
}
exports.handleGroupCreated = handleGroupCreated;
function handleDepositMade(event) {
    const groupId = event.params.gnosisSafe.toHexString();
    const memberId = event.params.member.toHexString();
    const userBalanceId = groupId.concat("-").concat(memberId);
    // Buscar el UserBalance actual o crear uno nuevo si no existe
    let userBalance = schema_1.UserBalance.load(userBalanceId);
    if (!userBalance) {
        userBalance = new schema_1.UserBalance(userBalanceId);
        userBalance.user = event.params.member;
        userBalance.group = groupId;
        userBalance.balance = graph_ts_1.BigInt.fromI32(0);
    }
    // Actualizar el balance del usuario
    const depositAmount = graph_ts_1.BigInt.fromString(event.params.amount.toString());
    userBalance.balance = userBalance.balance.plus(depositAmount);
    userBalance.save();
}
exports.handleDepositMade = handleDepositMade;
function handleWithdrawalMade(event) {
    const groupId = event.params.gnosisSafe.toHexString();
    const memberId = event.params.member.toHexString();
    const userBalanceId = groupId.concat("-").concat(memberId);
    // Buscar el UserBalance actual
    const userBalance = schema_1.UserBalance.load(userBalanceId);
    if (userBalance) {
        // Disminuir el balance del usuario
        const withdrawalAmount = graph_ts_1.BigInt.fromString(event.params.amount.toString());
        userBalance.balance = userBalance.balance.minus(withdrawalAmount);
        userBalance.save();
    }
}
exports.handleWithdrawalMade = handleWithdrawalMade;
function handleSettleCompleted(event) {
    const settlement = new schema_1.Settlement(event.transaction.hash.toHex());
    const groupEntity = schema_1.Group.load(event.params.gnosisSafe.toHex());
    if (groupEntity) {
        settlement.group = groupEntity.id;
    }
    else {
        graph_ts_1.log.error('No se encontró el grupo con ID: {}', [event.params.gnosisSafe.toHex()]);
        return; // Salir de la función si no se encuentra el grupo
    }
    settlement.debtor = graph_ts_1.Bytes.fromHexString(event.params.debtor.toHex());
    settlement.creditor = graph_ts_1.Bytes.fromHexString(event.params.creditor.toHex());
    settlement.amount = event.params.amount;
    settlement.timestamp = event.block.timestamp;
    settlement.save();
}
exports.handleSettleCompleted = handleSettleCompleted;
