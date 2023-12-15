"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteChoice =
  exports.ProposalState =
  exports.STKAAVE_CONSTANT =
  exports.AAVE_CONSTANT =
  exports.PROPOSITION_CONSTANT =
  exports.VOTING_CONSTANT =
  exports.NA =
  exports.ABSTAIN_WINS =
  exports.NO_WINS =
  exports.YES_WINS =
  exports.DelegationType =
  exports.GOVERNANCE_TYPE =
  exports.BIGDECIMAL_ZERO =
  exports.BIGINT_FIVE =
  exports.BIGINT_ONE =
  exports.BIGINT_ZERO =
  exports.ZERO_ADDRESS =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_FIVE = graph_ts_1.BigInt.fromI32(5);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.GOVERNANCE_TYPE = "AaveGovernanceV2";
var DelegationType;
(function (DelegationType) {
  DelegationType.VOTING_POWER = 0;
  DelegationType.PROPOSITION_POWER = 1;
})((DelegationType = exports.DelegationType || (exports.DelegationType = {})));
exports.YES_WINS = "Yes";
exports.NO_WINS = "No";
exports.ABSTAIN_WINS = "Abstain";
exports.NA = "N/A";
exports.VOTING_CONSTANT = "Voting";
exports.PROPOSITION_CONSTANT = "Proposition";
exports.AAVE_CONSTANT = "Aave";
exports.STKAAVE_CONSTANT = "StkAave";
var ProposalState;
(function (ProposalState) {
  ProposalState.PENDING = "PENDING";
  ProposalState.ACTIVE = "ACTIVE";
  ProposalState.CANCELED = "CANCELED";
  ProposalState.DEFEATED = "DEFEATED";
  ProposalState.SUCCEEDED = "SUCCEEDED";
  ProposalState.QUEUED = "QUEUED";
  ProposalState.EXPIRED = "EXPIRED";
  ProposalState.EXECUTED = "EXECUTED";
})((ProposalState = exports.ProposalState || (exports.ProposalState = {})));
var VoteChoice;
(function (VoteChoice) {
  VoteChoice.AGAINST_VALUE = 0;
  VoteChoice.FOR_VALUE = 1;
  VoteChoice.AGAINST = "AGAINST";
  VoteChoice.FOR = "FOR";
})((VoteChoice = exports.VoteChoice || (exports.VoteChoice = {})));
