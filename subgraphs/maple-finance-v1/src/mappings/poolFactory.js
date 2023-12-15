"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePoolCreated = void 0;
const templates_1 = require("../../generated/templates");
const protocol_1 = require("../common/mappingHelpers/getOrCreate/protocol");
const supporting_1 = require("../common/mappingHelpers/getOrCreate/supporting");
const markets_1 = require("../common/mappingHelpers/getOrCreate/markets");
const intervalUpdate_1 = require("../common/mappingHelpers/update/intervalUpdate");
const constants_1 = require("../common/constants");
function handlePoolCreated(event) {
    const poolAddress = event.params.pool;
    const stakeLockerAddress = event.params.stakeLocker;
    ////
    // Create pool and stake locker templates
    ////
    templates_1.Pool.create(poolAddress);
    templates_1.StakeLocker.create(stakeLockerAddress);
    const poolFactoryAddress = event.address;
    const inputTokenAddress = event.params.liquidityAsset;
    const outputTokenAddress = poolAddress;
    const stakeTokenAddress = event.params.stakeAsset;
    ////
    // Create the things the market references
    ////
    (0, protocol_1.getOrCreatePoolFactory)(event, poolFactoryAddress);
    (0, supporting_1.getOrCreateToken)(inputTokenAddress);
    (0, supporting_1.getOrCreateToken)(outputTokenAddress);
    (0, supporting_1.getOrCreateToken)(stakeTokenAddress);
    ////
    // Create market
    ////
    const market = (0, markets_1.getOrCreateMarket)(event, poolAddress);
    ////
    // Create the stake locker for this market
    ////
    (0, markets_1.getOrCreateStakeLocker)(event, stakeLockerAddress);
    ////
    // Update protocol
    ////
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    protocol.totalPoolCount += constants_1.ONE_I32;
    protocol.save();
    ////
    // Trigger interval update
    ////
    (0, intervalUpdate_1.intervalUpdate)(event, market);
}
exports.handlePoolCreated = handlePoolCreated;
