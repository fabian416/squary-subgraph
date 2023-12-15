"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteChoice = exports.ProposalState = exports.NA = exports.GovernanceFrameworkType = exports.GOVERNANCE_NAME = exports.BIGDECIMAL_ZERO = exports.BIGINT_FIVE = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.ZERO_ADDRESS = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_ONE = graph_ts_1.BigInt.fromI32(1);
exports.BIGINT_FIVE = graph_ts_1.BigInt.fromI32(5);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.GOVERNANCE_NAME = "GovernorAlphaBravo";
var GovernanceFrameworkType;
(function (GovernanceFrameworkType) {
    GovernanceFrameworkType.GOVERNOR_ALPHA = "GovernorAlpha";
    GovernanceFrameworkType.GOVERNOR_BRAVO = "GovernorBravo";
})(GovernanceFrameworkType = exports.GovernanceFrameworkType || (exports.GovernanceFrameworkType = {}));
exports.NA = "N/A";
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
})(ProposalState = exports.ProposalState || (exports.ProposalState = {}));
var VoteChoice;
(function (VoteChoice) {
    VoteChoice.AGAINST_VALUE = 0;
    VoteChoice.FOR_VALUE = 1;
    VoteChoice.ABSTAIN_VALUE = 2;
    VoteChoice.AGAINST = "AGAINST";
    VoteChoice.FOR = "FOR";
    VoteChoice.ABSTAIN = "ABSTAIN";
})(VoteChoice = exports.VoteChoice || (exports.VoteChoice = {}));
