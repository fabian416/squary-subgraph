"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCast = exports.handleSchedule = void 0;
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../../../src/constants");
function handleSchedule(call) {
    const spellID = call.to.toHexString(); // spell address is the spellID
    const spell = schema_1.Spell.load(spellID);
    if (!spell)
        return;
    spell.state = constants_1.SpellState.SCHEDULED;
    spell.scheduledTxnHash = call.transaction.hash.toHexString();
    spell.scheduledBlock = call.block.number;
    spell.scheduledTime = call.block.timestamp;
    spell.save();
}
exports.handleSchedule = handleSchedule;
function handleCast(call) {
    const spellID = call.to.toHexString(); // spell address is the spellID
    const spell = schema_1.Spell.load(spellID);
    if (!spell)
        return;
    spell.state = constants_1.SpellState.CAST;
    spell.castTxnHash = call.transaction.hash.toHexString();
    spell.castBlock = call.block.number;
    spell.castTime = call.block.timestamp;
    spell.castWith = spell.totalWeightedVotes;
    spell.save();
}
exports.handleCast = handleCast;
