"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOwnerChanged = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../generated/schema");
const constants_1 = require("./common/constants");
const utils_1 = require("./common/utils");
const getters_1 = require("./common/getters");
function handleOwnerChanged(event) {
    // this only happens when the constructor() of the INV contract is called
    if (event.params.owner == graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)) {
        //let tokenAddr = event.address.toHexString();
        let tokenAddr = constants_1.INV_ADDRESS;
        let invToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(tokenAddr));
        let depositTokenId = (0, utils_1.prefixID)(tokenAddr, constants_1.RewardTokenType.DEPOSIT);
        let depositRewardToken = schema_1.RewardToken.load(depositTokenId);
        if (depositRewardToken == null) {
            depositRewardToken = new schema_1.RewardToken(depositTokenId);
            depositRewardToken.token = invToken.id;
            depositRewardToken.type = constants_1.RewardTokenType.DEPOSIT;
        }
        depositRewardToken.save();
        let borrowTokenId = (0, utils_1.prefixID)(tokenAddr, constants_1.RewardTokenType.BORROW);
        let borrowRewardToken = schema_1.RewardToken.load(borrowTokenId);
        if (borrowRewardToken == null) {
            borrowRewardToken = new schema_1.RewardToken(borrowTokenId);
            borrowRewardToken.token = invToken.id;
            borrowRewardToken.type = constants_1.RewardTokenType.BORROW;
        }
        borrowRewardToken.save();
    }
}
exports.handleOwnerChanged = handleOwnerChanged;
