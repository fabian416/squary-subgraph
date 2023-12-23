// protocol handlers and protocol specific mappings

import { BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { Group, UserBalance, Settlement } from "../../../generated/schema";
import {
  DepositMade,
  GroupCreated,
  SettleCompleted,
  WithdrawalMade,
} from "../../../generated/BalancesTracker/squaryContractAbi";

export function handleGroupCreated(event: GroupCreated): void {
  const group = new Group(event.params.gnosisSafe.toHexString());
  group.gnosisSafe = event.params.gnosisSafe;
  group.memberAddresses = event.params.members.map<string>((member) =>
    member.toHexString()
  );
  group.settlements = [];
  group.save();
}

export function handleDepositMade(event: DepositMade): void {
  const groupId = event.params.gnosisSafe.toHexString();
  const memberId = event.params.member.toHexString();
  const userBalanceId = groupId.concat("-").concat(memberId);

  //  search the actual UserBalance or creates a new one if doesn't exist
  let userBalance = UserBalance.load(userBalanceId);
  if (!userBalance) {
    userBalance = new UserBalance(userBalanceId);
    userBalance.user = event.params.member;
    userBalance.group = groupId;
    userBalance.balance = BigInt.fromI32(0);
  }

  // Update the user's balance
  const depositAmount = BigInt.fromString(event.params.amount.toString());
  userBalance.balance = userBalance.balance.plus(depositAmount);
  userBalance.save();
}

export function handleWithdrawalMade(event: WithdrawalMade): void {
  const groupId = event.params.gnosisSafe.toHexString();
  const memberId = event.params.member.toHexString();
  const userBalanceId = groupId.concat("-").concat(memberId);

  //  Search the actual UserBalance
  const userBalance = UserBalance.load(userBalanceId);
  if (userBalance) {
    // Disminuir el balance del usuario
    const withdrawalAmount = BigInt.fromString(event.params.amount.toString());
    userBalance.balance = userBalance.balance.minus(withdrawalAmount);
    userBalance.save();
  }
}

export function handleSettleCompleted(event: SettleCompleted): void {
  const settlement = new Settlement(event.transaction.hash.toHex());
  const groupEntity = Group.load(event.params.gnosisSafe.toHex());
  if (groupEntity) {
    settlement.group = groupEntity.id;
  } else {
    log.error("No se encontró el grupo con ID: {}", [
      event.params.gnosisSafe.toHex(),
    ]);
    return;
  }
  settlement.debtor = Bytes.fromHexString(event.params.debtor.toHex());
  settlement.creditor = Bytes.fromHexString(event.params.creditor.toHex());
  settlement.amount = event.params.amount;
  settlement.timestamp = event.block.timestamp;
  settlement.save();
  const debtorBalanceId =
    event.params.gnosisSafe.toHexString() +
    "-" +
    event.params.debtor.toHexString();
  let debtorBalance = UserBalance.load(debtorBalanceId);
  if (!debtorBalance) {
    debtorBalance = new UserBalance(debtorBalanceId);
    debtorBalance.user = event.params.debtor;
    debtorBalance.group = groupEntity.id;
    debtorBalance.balance = BigInt.fromI32(0);
  }
  debtorBalance.balance = debtorBalance.balance.minus(event.params.amount);
  debtorBalance.save();

  // Actualizar el balance del acreedor
  const creditorBalanceId =
    event.params.gnosisSafe.toHexString() +
    "-" +
    event.params.creditor.toHexString();
  let creditorBalance = UserBalance.load(creditorBalanceId);
  if (!creditorBalance) {
    creditorBalance = new UserBalance(creditorBalanceId);
    creditorBalance.user = event.params.creditor;
    creditorBalance.group = groupEntity.id;
    creditorBalance.balance = BigInt.fromI32(0);
  }
  creditorBalance.balance = creditorBalance.balance.plus(event.params.amount);
  creditorBalance.save();

  if (groupEntity) {
    let settlements = groupEntity.settlements;
    if (!settlements) {
      settlements = new Array<string>();
    }
    settlements.push(settlement.id);
    groupEntity.settlements = settlements;
    groupEntity.save();
  }
}
