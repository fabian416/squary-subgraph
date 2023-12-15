"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRewardPaid = exports.handleUnstakedAndWithdrewMultiple = exports.handleUnstakedAndWithdrew = exports.handleDepositedAndStaked1 = exports.handleDepositedAndStaked = exports.handleTransfer = exports.handleUnstaked1 = exports.handleUnstaked = exports.handleStaked1 = exports.handleStaked = exports.handleRewardAdded = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const helpers_1 = require("../entities/helpers");
const staking_rewards_1 = require("../entities/staking_rewards");
const user_1 = require("../entities/user");
function mapStakedPositionTypeToAmountToken(stakedPositionType) {
    // NOTE: The return type of this function should be a SupportedCrypto enum value.
    if (stakedPositionType === 0) {
        return "FIDU";
    }
    else if (stakedPositionType === 1) {
        return "CURVE_LP";
    }
    else {
        throw new Error(`Unexpected staked position type: ${stakedPositionType}`);
    }
}
function handleRewardAdded(event) {
    (0, staking_rewards_1.updateCurrentEarnRate)(event.address);
    // messari schema
    (0, staking_rewards_1.updateSeniorPoolRewardTokenEmissions)(event);
}
exports.handleRewardAdded = handleRewardAdded;
function handleStaked(event) {
    (0, staking_rewards_1.updateCurrentEarnRate)(event.address);
    const stakedPosition = new schema_1.SeniorPoolStakedPosition(event.params.tokenId.toString());
    stakedPosition.amount = event.params.amount;
    stakedPosition.initialAmount = event.params.amount;
    stakedPosition.user = (0, user_1.getOrInitUser)(event.params.user).id;
    stakedPosition.startTime = event.block.timestamp;
    stakedPosition.positionType = "Fidu"; // Curve integration did not exist at this time
    stakedPosition.totalRewardsClaimed = graph_ts_1.BigInt.zero();
    stakedPosition.save();
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "SENIOR_POOL_STAKE", event.params.user);
    transaction.sentAmount = event.params.amount;
    transaction.sentToken = "FIDU";
    transaction.receivedNftId = event.params.tokenId.toString();
    transaction.receivedNftType = "STAKING_TOKEN";
    transaction.save();
    // messari schema
    (0, staking_rewards_1.updateSeniorPoolRewardTokenEmissions)(event);
}
exports.handleStaked = handleStaked;
function handleStaked1(event) {
    (0, staking_rewards_1.updateCurrentEarnRate)(event.address);
    const stakedPosition = new schema_1.SeniorPoolStakedPosition(event.params.tokenId.toString());
    stakedPosition.amount = event.params.amount;
    stakedPosition.initialAmount = event.params.amount;
    stakedPosition.user = (0, user_1.getOrInitUser)(event.params.user).id;
    stakedPosition.startTime = event.block.timestamp;
    if (event.params.positionType == 0) {
        stakedPosition.positionType = "Fidu";
    }
    else if (event.params.positionType == 1) {
        stakedPosition.positionType = "CurveLP";
    }
    else {
        graph_ts_1.log.critical("Encountered unrecognized positionType in a Staked event: {}", [event.params.positionType.toString()]);
    }
    stakedPosition.totalRewardsClaimed = graph_ts_1.BigInt.zero();
    stakedPosition.save();
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "SENIOR_POOL_STAKE", event.params.user);
    transaction.sentAmount = event.params.amount;
    transaction.sentToken = mapStakedPositionTypeToAmountToken(event.params.positionType);
    transaction.receivedNftId = event.params.tokenId.toString();
    transaction.receivedNftType = "STAKING_TOKEN";
    transaction.save();
    // messari schema
    (0, staking_rewards_1.updateSeniorPoolRewardTokenEmissions)(event);
}
exports.handleStaked1 = handleStaked1;
// Note that Unstaked and Unstaked1 refer to two different versions of this event with different signatures.
function handleUnstaked(event) {
    (0, staking_rewards_1.updateCurrentEarnRate)(event.address);
    const stakedPosition = assert(schema_1.SeniorPoolStakedPosition.load(event.params.tokenId.toString()));
    stakedPosition.amount = stakedPosition.amount.minus(event.params.amount);
    stakedPosition.save();
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "SENIOR_POOL_UNSTAKE", event.params.user);
    transaction.sentNftId = event.params.tokenId.toString();
    transaction.sentNftType = "STAKING_TOKEN";
    transaction.receivedAmount = event.params.amount;
    transaction.receivedToken = mapStakedPositionTypeToAmountToken(
    // The historical/legacy Unstaked events that didn't have a `positionType` param were all of FIDU type.
    0);
    transaction.save();
    // messari schema
    (0, staking_rewards_1.updateSeniorPoolRewardTokenEmissions)(event);
}
exports.handleUnstaked = handleUnstaked;
function handleUnstaked1(event) {
    (0, staking_rewards_1.updateCurrentEarnRate)(event.address);
    const stakedPosition = assert(schema_1.SeniorPoolStakedPosition.load(event.params.tokenId.toString()));
    stakedPosition.amount = stakedPosition.amount.minus(event.params.amount);
    stakedPosition.save();
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "SENIOR_POOL_UNSTAKE", event.params.user);
    transaction.sentNftId = event.params.tokenId.toString();
    transaction.sentNftType = "STAKING_TOKEN";
    transaction.receivedAmount = event.params.amount;
    transaction.receivedToken = mapStakedPositionTypeToAmountToken(event.params.positionType);
    transaction.save();
    // messari schema
    (0, staking_rewards_1.updateSeniorPoolRewardTokenEmissions)(event);
}
exports.handleUnstaked1 = handleUnstaked1;
function handleTransfer(event) {
    if (event.params.from.notEqual(graph_ts_1.Bytes.fromHexString("0x0000000000000000000000000000000000000000"))) {
        const stakedPosition = assert(schema_1.SeniorPoolStakedPosition.load(event.params.tokenId.toString()));
        stakedPosition.user = (0, user_1.getOrInitUser)(event.params.to).id;
        stakedPosition.save();
    }
}
exports.handleTransfer = handleTransfer;
function handleDepositedAndStaked(event) {
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "SENIOR_POOL_DEPOSIT_AND_STAKE", event.params.user);
    transaction.sentAmount = event.params.depositedAmount;
    transaction.sentToken = "USDC";
    // Technically depositAndStake doesn't result in the depositer actually gaining FIDU (they gain the NFT), but for the sake of the frontend this helps
    transaction.receivedAmount = event.params.amount;
    transaction.receivedToken = "FIDU";
    transaction.receivedNftId = event.params.tokenId.toString();
    transaction.receivedNftType = "STAKING_TOKEN";
    // usdc / fidu
    transaction.fiduPrice = (0, helpers_1.usdcWithFiduPrecision)(event.params.depositedAmount).div(event.params.amount);
    transaction.save();
}
exports.handleDepositedAndStaked = handleDepositedAndStaked;
function handleDepositedAndStaked1(event) {
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "SENIOR_POOL_DEPOSIT_AND_STAKE", event.params.user);
    transaction.sentAmount = event.params.depositedAmount;
    transaction.sentToken = "USDC";
    // Technically depositAndStake doesn't result in the depositer actually gaining FIDU (they gain the NFT), but for the sake of the frontend this helps
    transaction.receivedAmount = event.params.amount;
    transaction.receivedToken = "FIDU";
    transaction.receivedNftId = event.params.tokenId.toString();
    transaction.receivedNftType = "STAKING_TOKEN";
    // usdc / fidu
    transaction.fiduPrice = (0, helpers_1.usdcWithFiduPrecision)(event.params.depositedAmount).div(event.params.amount);
    transaction.save();
}
exports.handleDepositedAndStaked1 = handleDepositedAndStaked1;
function handleUnstakedAndWithdrew(event) {
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "SENIOR_POOL_UNSTAKE_AND_WITHDRAWAL", event.params.user);
    transaction.sentAmount = event.params.amount;
    transaction.sentToken = "FIDU";
    transaction.sentNftId = event.params.tokenId.toString();
    transaction.sentNftType = "STAKING_TOKEN";
    transaction.receivedAmount = event.params.usdcReceivedAmount;
    transaction.receivedToken = "USDC";
    transaction.save();
}
exports.handleUnstakedAndWithdrew = handleUnstakedAndWithdrew;
function handleUnstakedAndWithdrewMultiple(event) {
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "SENIOR_POOL_UNSTAKE_AND_WITHDRAWAL", event.params.user);
    transaction.sentAmount = event.params.amounts.reduce((prevValue, currValue) => prevValue.plus(currValue), graph_ts_1.BigInt.zero());
    transaction.sentToken = "FIDU";
    transaction.receivedAmount = event.params.usdcReceivedAmount;
    transaction.receivedToken = "USDC";
    transaction.save();
}
exports.handleUnstakedAndWithdrewMultiple = handleUnstakedAndWithdrewMultiple;
function handleRewardPaid(event) {
    const position = assert(schema_1.SeniorPoolStakedPosition.load(event.params.tokenId.toString()));
    position.totalRewardsClaimed = position.totalRewardsClaimed.plus(event.params.reward);
    position.save();
    const transaction = (0, helpers_1.createTransactionFromEvent)(event, "STAKING_REWARDS_CLAIMED", event.params.user);
    transaction.receivedAmount = event.params.reward;
    transaction.receivedToken = "GFI";
    transaction.save();
}
exports.handleRewardPaid = handleRewardPaid;
