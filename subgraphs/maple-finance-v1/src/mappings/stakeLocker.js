"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLossesRecognized = exports.handleUnstake = exports.handleStake = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../common/constants");
const markets_1 = require("../common/mappingHelpers/getOrCreate/markets");
const supporting_1 = require("../common/mappingHelpers/getOrCreate/supporting");
const transactions_1 = require("../common/mappingHelpers/getOrCreate/transactions");
const intervalUpdate_1 = require("../common/mappingHelpers/update/intervalUpdate");
function handleStake(event) {
    const stakeLocker = (0, markets_1.getOrCreateStakeLocker)(event, event.address);
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(stakeLocker.market));
    const stakeToken = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(stakeLocker.stakeToken));
    ////
    // Create unstake
    ////
    const stake = (0, transactions_1.createStake)(event, market, stakeToken, event.params.amount, constants_1.StakeType.STAKE_LOCKER);
    ////
    // Update stakeLocker
    ////
    stakeLocker.cumulativeStake = stakeLocker.cumulativeStake.plus(stake.amount);
    stakeLocker.save();
    ////
    // Trigger interval update
    ////
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handleStake = handleStake;
function handleUnstake(event) {
    const stakeLocker = (0, markets_1.getOrCreateStakeLocker)(event, event.address);
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(stakeLocker.market));
    const stakeToken = (0, supporting_1.getOrCreateToken)(graph_ts_1.Address.fromString(stakeLocker.stakeToken));
    ////
    // Create stake
    ////
    const unstake = (0, transactions_1.createUnstake)(event, market, stakeToken, event.params.amount, constants_1.StakeType.STAKE_LOCKER);
    ////
    // Update stakeLocker
    ////
    stakeLocker.cumulativeUnstake = stakeLocker.cumulativeUnstake.plus(unstake.amount);
    stakeLocker.save();
    ////
    // Trigger interval update
    ////
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handleUnstake = handleUnstake;
function handleLossesRecognized(event) {
    const stakeLocker = (0, markets_1.getOrCreateStakeLocker)(event, event.address);
    const market = (0, markets_1.getOrCreateMarket)(event, graph_ts_1.Address.fromString(stakeLocker.market));
    ////
    // Update stakeLocker
    ////
    stakeLocker.recognizedLosses = stakeLocker.recognizedLosses.plus(event.params.lossesRecognized);
    stakeLocker.save();
    ////
    // Trigger interval update
    ////
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handleLossesRecognized = handleLossesRecognized;
