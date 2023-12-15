"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exercisePosition = exports.updatePosition = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const numbers_1 = require("../common/utils/numbers");
const price_1 = require("../price");
const account_1 = require("./account");
function updatePosition(event, account, option, netChange) {
    let balance = netChange;
    // Check for existing open position and close it if it exists
    const position = closePosition(event, account, option);
    if (position) {
        balance = balance.plus(position.amount);
    }
    if (balance.gt(constants_1.BIGINT_ZERO)) {
        openNewPosition(event, account, option, balance);
    }
}
exports.updatePosition = updatePosition;
function exercisePosition(event, account, option) {
    const position = closePosition(event, account, option);
    if (position) {
        position.exercisedBlockNumber = event.block.number;
        position.exercisedTimestamp = event.block.timestamp;
        position.closedPriceUSD = option.expirationPriceUSD;
        position.save();
    }
    (0, account_1.incrementAccountExercisedCount)(event, account, option);
}
exports.exercisePosition = exercisePosition;
function openNewPosition(event, account, option, amount) {
    const id = getPositionId(account, option);
    const position = new schema_1.Position(id);
    position.option = option.id;
    position.pool = option.pool;
    position.account = account.id;
    position.asset = option.underlyingAsset;
    position.takenHash = event.transaction.hash;
    position.takenBlockNumber = event.block.number;
    position.takenTimestamp = event.block.timestamp;
    position.takenPrice = (0, price_1.getUnderlyingPrice)(event, option);
    position.premium = constants_1.BIGINT_ZERO;
    position.premiumUSD = constants_1.BIGDECIMAL_ZERO;
    position.amount = amount;
    position.amountUSD = (0, numbers_1.bigIntToBigDecimal)(amount, constants_1.INT_EIGHT).times(position.takenPrice);
    position.save();
    (0, account_1.incrementAccountPositionCount)(event, account, option);
}
function closePosition(event, account, option) {
    const position = schema_1.Position.load(getPositionId(account, option));
    if (!position) {
        return null;
    }
    position.closedTimestamp = event.block.timestamp;
    position.closedBlockNumber = event.block.number;
    position.closedPriceUSD = (0, price_1.getUnderlyingPrice)(event, option);
    position.save();
    (0, account_1.decrementAccountPositionCount)(event, account, option);
    incrementPositionCounter(account, option);
    return position;
}
function loadPositionCounter(account, option) {
    const id = account.id.concat(option.id);
    let positionCounter = schema_1._PositionCounter.load(id);
    if (!positionCounter) {
        positionCounter = new schema_1._PositionCounter(id);
        positionCounter.nextCount = constants_1.INT_ZERO;
        positionCounter.save();
    }
    return positionCounter;
}
function incrementPositionCounter(account, option) {
    const counter = loadPositionCounter(account, option);
    counter.nextCount += constants_1.INT_ONE;
    counter.save();
}
function getPositionId(account, option) {
    return account.id
        .concat(option.id)
        .concatI32(loadPositionCounter(account, option).nextCount);
}
