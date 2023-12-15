"use strict";
/* eslint-disable @typescript-eslint/no-magic-numbers */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLift = exports.handleEtch = exports.handleVote = exports.handleFree = exports.handleLock = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const VoteDelegate_1 = require("../../../generated/DSChief/VoteDelegate");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../../../src/constants");
const helpers_1 = require("../../../src/helpers");
const templates_1 = require("../../../generated/templates");
function handleLock(event) {
    const sender = event.params.guy; // guy is the sender
    const amountStr = (0, helpers_1.hexToNumberString)(event.params.foo.toHexString());
    const amount = graph_ts_1.BigInt.fromString(amountStr); //.foo is the amount being locked
    let newDelegateCount = 0;
    let delegate = schema_1.Delegate.load(sender.toHexString());
    if (!delegate) {
        delegate = new schema_1.Delegate(sender.toHexString());
        delegate.isVoteDelegate = false;
        delegate.votingPowerRaw = constants_1.BIGINT_ZERO;
        delegate.votingPower = constants_1.BIGDECIMAL_ZERO;
        delegate.delegations = [];
        delegate.tokenHoldersRepresented = 0;
        delegate.currentSpells = [];
        delegate.numberVotes = 0;
        delegate.numberPoleVotes = 0;
        // Check if vote delegate contract by calling chief()
        const voteDelegate = VoteDelegate_1.VoteDelegate.bind(sender);
        const res = voteDelegate.try_delegate();
        // will revert if not a contract
        if (!res.reverted) {
            // Save delegate admin to identify proxy votes later
            const delegateAdmin = new schema_1.DelegateAdmin(res.value.toHexString());
            delegateAdmin.voteDelegate = delegate.id;
            delegateAdmin.save();
            // Track this new vote delegate contract
            templates_1.VoteDelegate.create(sender);
            delegate.isVoteDelegate = true;
            newDelegateCount = 1;
        }
    }
    const delegateVPChange = (0, helpers_1.createDelegateVotingPowerChange)(event, delegate.votingPowerRaw, delegate.votingPowerRaw.plus(amount), delegate.id);
    delegateVPChange.save();
    delegate.votingPowerRaw = delegate.votingPowerRaw.plus(amount);
    delegate.votingPower = delegate.votingPower.plus((0, helpers_1.toDecimal)(amount));
    (0, helpers_1.addWeightToSpells)(delegate.currentSpells, amount);
    delegate.save();
    const framework = (0, helpers_1.getGovernanceFramework)(event.address.toHexString());
    framework.currentTokenLockedInChief =
        framework.currentTokenLockedInChief.plus(amount);
    framework.totalDelegates = framework.totalDelegates + newDelegateCount;
    framework.save();
}
exports.handleLock = handleLock;
function handleFree(event) {
    const sender = event.params.guy; // guy is the sender
    const amountStr = (0, helpers_1.hexToNumberString)(event.params.foo.toHexString());
    const amount = graph_ts_1.BigInt.fromString(amountStr); //.foo is the amount being locked
    const delegate = (0, helpers_1.getDelegate)(sender.toHexString());
    const delegateVPChange = (0, helpers_1.createDelegateVotingPowerChange)(event, delegate.votingPowerRaw, delegate.votingPowerRaw.minus(amount), delegate.id);
    delegateVPChange.save();
    delegate.votingPowerRaw = delegate.votingPowerRaw.minus(amount);
    delegate.votingPower = delegate.votingPower.minus((0, helpers_1.toDecimal)(amount));
    (0, helpers_1.removeWeightFromSpells)(delegate.currentSpells, amount);
    delegate.save();
    const framework = (0, helpers_1.getGovernanceFramework)(event.address.toHexString());
    framework.currentTokenLockedInChief =
        framework.currentTokenLockedInChief.minus(amount);
    framework.save();
}
exports.handleFree = handleFree;
function handleVote(event) {
    const sender = event.params.guy.toHexString(); // guy is the sender
    const slateID = event.params.foo; // foo is slate id
    _handleSlateVote(sender, slateID, event);
}
exports.handleVote = handleVote;
function handleEtch(event) {
    let sender = event.transaction.from.toHexString();
    const to = event.transaction.to;
    // Check if txn is not directly to Chief, it's either to vote delegate or multi-sig + delegate
    if (to && to != event.address) {
        const fromAdmin = schema_1.DelegateAdmin.load(sender);
        if (!fromAdmin) {
            const toAdmin = schema_1.DelegateAdmin.load(to.toHexString());
            if (!toAdmin) {
                graph_ts_1.log.error("Etch not trigger by a delegate admin. TxnHash: {}", [
                    event.transaction.hash.toHexString(),
                ]);
            }
            else {
                // Txn sent via a proxy/multi-sig to vote delegate
                sender = toAdmin.voteDelegate;
            }
        }
        else {
            // Txn sent to vote delegate
            sender = fromAdmin.voteDelegate;
        }
    }
    const slateID = event.params.slate;
    _handleSlateVote(sender, slateID, event);
}
exports.handleEtch = handleEtch;
function _handleSlateVote(sender, slateID, event) {
    const delegate = (0, helpers_1.getDelegate)(sender);
    let slate = schema_1.Slate.load(slateID.toHexString());
    if (!slate) {
        slate = (0, helpers_1.createSlate)(slateID, event);
    }
    // Remove votes from previous spells
    (0, helpers_1.removeWeightFromSpells)(delegate.currentSpells, delegate.votingPowerRaw);
    for (let i = 0; i < slate.yays.length; i++) {
        const spellID = slate.yays[i];
        const spell = schema_1.Spell.load(spellID);
        if (spell) {
            const voteId = sender.concat("-").concat(spellID);
            const vote = new schema_1.Vote(voteId);
            vote.weight = delegate.votingPowerRaw;
            vote.reason = "";
            vote.voter = sender;
            vote.spell = spellID;
            vote.block = event.block.number;
            vote.blockTime = event.block.timestamp;
            vote.txnHash = event.transaction.hash.toHexString();
            vote.logIndex = event.logIndex;
            vote.save();
            spell.totalVotes = spell.totalVotes.plus(constants_1.BIGINT_ONE);
            spell.totalWeightedVotes = spell.totalWeightedVotes.plus(delegate.votingPowerRaw);
            spell.save();
        }
    }
    delegate.currentSpells = slate.yays;
    delegate.numberVotes = delegate.numberVotes + 1;
    delegate.save();
}
function handleLift(event) {
    // foo is the spellID in bytes, we trim and convert to address
    const spellID = graph_ts_1.Address.fromString(event.params.foo.toHexString().slice(26));
    const spell = schema_1.Spell.load(spellID.toHexString());
    if (!spell || spell.state != constants_1.SpellState.ACTIVE)
        return;
    spell.state = constants_1.SpellState.LIFTED;
    spell.liftedTxnHash = event.transaction.hash.toHexString();
    spell.liftedBlock = event.block.number;
    spell.liftedTime = event.block.timestamp;
    spell.liftedWith = spell.totalWeightedVotes;
    spell.save();
    // Update governance framework everytime a spell is lifted
    const framework = (0, helpers_1.getGovernanceFramework)(event.address.toHexString());
    framework.currentHat = spell.id;
    framework.save();
}
exports.handleLift = handleLift;
