"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDelegateFree = exports.handleDelegateLock = void 0;
const schema_1 = require("../../../generated/schema");
const helpers_1 = require("../../../src/helpers");
const constants_1 = require("../../../src/constants");
function handleDelegateLock(event) {
    const sender = event.params.usr.toHexString();
    const delegateAddress = event.address;
    const delegate = (0, helpers_1.getDelegate)(delegateAddress.toHexString());
    const delegationID = delegate.id + "-" + sender;
    let delegation = schema_1.Delegation.load(delegationID);
    if (!delegation) {
        delegation = new schema_1.Delegation(delegationID);
        delegation.delegator = sender;
        delegation.amount = constants_1.BIGINT_ZERO;
        delegate.delegations = delegate.delegations.concat([delegationID]);
    }
    if (delegation.amount.equals(constants_1.BIGINT_ZERO)) {
        delegate.tokenHoldersRepresented = delegate.tokenHoldersRepresented + 1;
    }
    const delegateVPChange = (0, helpers_1.createDelegateVotingPowerChange)(event, delegation.amount, delegation.amount.plus(event.params.wad), delegate.id);
    delegateVPChange.save();
    delegation.amount = delegation.amount.plus(event.params.wad);
    delegation.save();
    delegate.save();
    const framework = (0, helpers_1.getGovernanceFramework)(constants_1.CHIEF);
    framework.currentTokenDelegated = framework.currentTokenDelegated.plus(event.params.wad);
    framework.save();
}
exports.handleDelegateLock = handleDelegateLock;
function handleDelegateFree(event) {
    const sender = event.params.usr.toHexString();
    const delegateAddress = event.address;
    const delegate = (0, helpers_1.getDelegate)(delegateAddress.toHexString());
    const delegationID = delegate.id + "-" + sender;
    const delegation = schema_1.Delegation.load(delegationID);
    if (!delegation)
        return;
    const delegateVPChange = (0, helpers_1.createDelegateVotingPowerChange)(event, delegation.amount, delegation.amount.minus(event.params.wad), delegate.id);
    delegateVPChange.save();
    delegation.amount = delegation.amount.minus(event.params.wad);
    if (delegation.amount.equals(constants_1.BIGINT_ZERO)) {
        delegate.tokenHoldersRepresented = delegate.tokenHoldersRepresented - 1;
    }
    delegation.save();
    delegate.save();
    const framework = (0, helpers_1.getGovernanceFramework)(constants_1.CHIEF);
    framework.currentTokenDelegated = framework.currentTokenDelegated.minus(event.params.wad);
    framework.save();
}
exports.handleDelegateFree = handleDelegateFree;
