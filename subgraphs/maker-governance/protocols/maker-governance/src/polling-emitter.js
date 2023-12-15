"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePollVote = void 0;
const schema_1 = require("../../../generated/schema");
const helpers_1 = require("../../../src/helpers");
function handlePollVote(event) {
    const voter = event.params.voter.toHexString();
    const pollId = event.params.pollId.toString();
    const optionId = event.params.optionId;
    const delegate = (0, helpers_1.getDelegate)(voter);
    delegate.numberPoleVotes = delegate.numberPoleVotes + 1;
    delegate.save();
    let poll = schema_1.Poll.load(pollId);
    if (!poll) {
        poll = new schema_1.Poll(pollId);
        poll.save();
    }
    const voteId = voter.concat("-").concat(pollId);
    const pollVote = new schema_1.PollVote(voteId);
    pollVote.choice = optionId;
    pollVote.voter = voter;
    pollVote.poll = pollId;
    pollVote.block = event.block.number;
    pollVote.blockTime = event.block.timestamp;
    pollVote.txnHash = event.transaction.hash.toHexString();
    pollVote.save();
}
exports.handlePollVote = handlePollVote;
