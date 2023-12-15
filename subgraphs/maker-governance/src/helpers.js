"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeWeightFromSpells = exports.addWeightToSpells = exports.createSlate = exports.getGovernanceFramework = exports.createDelegateVotingPowerChange = exports.getDelegate = exports.toDecimal = exports.hexToNumberString = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../generated/schema");
const DSChief_1 = require("../generated/DSChief/DSChief");
const DSSpell_1 = require("../generated/DSChief/DSSpell");
const constants_1 = require("./constants");
const templates_1 = require("../generated/templates");
function hexToNumberString(hex) {
    let hexNumber = graph_ts_1.BigInt.fromI32(0);
    if (hex.startsWith("0x")) {
        hex = hex.slice(2);
    }
    for (let i = 0; i < hex.length; i += 1) {
        const character = hex.substr(hex.length - 1 - i, 1);
        const digit = parseInt(character, 16);
        if (digit) {
            hexNumber = hexNumber.plus(graph_ts_1.BigInt.fromI32(digit).times(graph_ts_1.BigInt.fromI32(16).pow(i)));
        }
    }
    return hexNumber.toString();
}
exports.hexToNumberString = hexToNumberString;
function toDecimal(value, decimals = 18) {
    return value.divDecimal(graph_ts_1.BigInt.fromI32(10)
        .pow(decimals)
        .toBigDecimal());
}
exports.toDecimal = toDecimal;
function getDelegate(address) {
    let delegate = schema_1.Delegate.load(address);
    if (!delegate) {
        delegate = new schema_1.Delegate(address);
        delegate.isVoteDelegate = false;
        delegate.votingPowerRaw = constants_1.BIGINT_ZERO;
        delegate.votingPower = constants_1.BIGDECIMAL_ZERO;
        delegate.delegations = [];
        delegate.tokenHoldersRepresented = 0;
        delegate.currentSpells = [];
        delegate.numberVotes = 0;
        delegate.numberPoleVotes = 0;
    }
    return delegate;
}
exports.getDelegate = getDelegate;
function createDelegateVotingPowerChange(event, previousBalance, newBalance, delegate) {
    const delegateVotingPwerChangeId = `${event.block.timestamp.toI64()}-${event.logIndex}`;
    const delegateVPChange = new schema_1.DelegateVotingPowerChange(delegateVotingPwerChangeId);
    delegateVPChange.previousBalance = previousBalance;
    delegateVPChange.newBalance = newBalance;
    delegateVPChange.delegate = delegate;
    delegateVPChange.tokenAddress = event.address.toHexString();
    delegateVPChange.txnHash = event.transaction.hash.toHexString();
    delegateVPChange.blockTimestamp = event.block.timestamp;
    delegateVPChange.logIndex = event.logIndex;
    delegateVPChange.blockNumber = event.block.number;
    return delegateVPChange;
}
exports.createDelegateVotingPowerChange = createDelegateVotingPowerChange;
function getGovernanceFramework(contractAddress) {
    let framework = schema_1.GovernanceFramework.load(contractAddress);
    if (!framework) {
        framework = new schema_1.GovernanceFramework(contractAddress);
        framework.name = "MakerGovernance";
        framework.type = constants_1.GOVERNANCE_TYPE;
        framework.tokenAddress = constants_1.MKR_TOKEN;
        framework.totalTokenSupply = constants_1.BIGINT_ZERO; //TODO
        framework.currentTokenHolders = constants_1.BIGINT_ZERO; //TODO
        framework.totalDelegates = 0;
        framework.currentTokenLockedInChief = constants_1.BIGINT_ZERO;
        framework.currentTokenDelegated = constants_1.BIGINT_ZERO; //TODO
        framework.spells = 0;
    }
    return framework;
}
exports.getGovernanceFramework = getGovernanceFramework;
function createSlate(slateID, event) {
    const slate = new schema_1.Slate(slateID.toHexString());
    slate.yays = [];
    slate.txnHash = event.transaction.hash.toHexString();
    slate.creationBlock = event.block.number;
    slate.creationTime = event.block.timestamp;
    let newSpellCount = 0;
    let i = 0;
    const dsChief = DSChief_1.DSChief.bind(event.address);
    let slateResponse = dsChief.try_slates(slateID, graph_ts_1.BigInt.fromI32(i));
    while (!slateResponse.reverted) {
        const spellAddress = slateResponse.value;
        const spellID = spellAddress.toHexString();
        let spell = schema_1.Spell.load(spellID);
        if (!spell && spellID != constants_1.ZERO_ADDRESS) {
            spell = new schema_1.Spell(spellID);
            spell.description = "";
            spell.state = constants_1.SpellState.ACTIVE;
            spell.creationBlock = event.block.number;
            spell.creationTime = event.block.timestamp;
            const dsSpell = DSSpell_1.DSSpell.bind(spellAddress);
            const dsDescription = dsSpell.try_description();
            if (!dsDescription.reverted) {
                spell.description = dsDescription.value;
            }
            const expiration = dsSpell.try_expiration();
            if (!expiration.reverted) {
                spell.expiryTime = expiration.value;
                spell.governanceFramework = event.address.toHexString();
                spell.totalVotes = constants_1.BIGINT_ZERO;
                spell.totalWeightedVotes = constants_1.BIGINT_ZERO;
                spell.save();
                // Track this new spell
                templates_1.DSSpell.create(spellAddress);
                newSpellCount = newSpellCount + 1;
            }
        }
        slate.yays = slate.yays.concat([spellID]);
        // loop through slate indices until a revert breaks it
        slateResponse = dsChief.try_slates(slateID, graph_ts_1.BigInt.fromI32(++i));
    }
    // Update framework spell count
    const framework = getGovernanceFramework(event.address.toHexString());
    framework.spells = framework.spells + newSpellCount;
    framework.save();
    slate.save();
    return slate;
}
exports.createSlate = createSlate;
function addWeightToSpells(spellIDs, weight) {
    for (let i = 0; i < spellIDs.length; i++) {
        const spell = schema_1.Spell.load(spellIDs[i]);
        if (spell) {
            spell.totalWeightedVotes = spell.totalWeightedVotes.plus(weight);
            spell.save();
        }
    }
}
exports.addWeightToSpells = addWeightToSpells;
function removeWeightFromSpells(spellIDs, weight) {
    for (let i = 0; i < spellIDs.length; i++) {
        const spell = schema_1.Spell.load(spellIDs[i]);
        if (spell) {
            spell.totalWeightedVotes = spell.totalWeightedVotes.minus(weight);
            spell.save();
        }
    }
}
exports.removeWeightFromSpells = removeWeightFromSpells;
