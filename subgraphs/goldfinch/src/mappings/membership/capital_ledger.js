"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCapitalErc721Withdrawal = exports.handleCapitalErc721Deposit = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../generated/schema");
const constants_1 = require("../../common/constants");
const getters_1 = require("../../common/getters");
const log_1 = require("../../common/log");
const helpers_1 = require("../../entities/helpers");
function handleCapitalErc721Deposit(event) {
    const assetAddress = event.params.assetAddress.toHexString();
    if (assetAddress == constants_1.STAKING_REWARDS_ADDRESS) {
        const vaultedStakedPosition = new schema_1.VaultedStakedPosition(event.params.positionId.toString());
        vaultedStakedPosition.user = event.params.owner.toHexString();
        vaultedStakedPosition.usdcEquivalent = event.params.usdcEquivalent;
        vaultedStakedPosition.vaultedAt = event.block.timestamp.toI32();
        vaultedStakedPosition.seniorPoolStakedPosition =
            event.params.assetTokenId.toString();
        vaultedStakedPosition.save();
        const transaction = (0, helpers_1.createTransactionFromEvent)(event, "MEMBERSHIP_CAPITAL_DEPOSIT", event.params.owner);
        transaction.sentNftId = event.params.assetTokenId.toString();
        transaction.sentNftType = "STAKING_TOKEN";
        transaction.save();
    }
    else if (assetAddress == constants_1.POOL_TOKENS_ADDRESS) {
        const vaultedPoolToken = new schema_1.VaultedPoolToken(event.params.positionId.toString());
        vaultedPoolToken.user = event.params.owner.toHexString();
        vaultedPoolToken.usdcEquivalent = event.params.usdcEquivalent;
        vaultedPoolToken.vaultedAt = event.block.timestamp.toI32();
        vaultedPoolToken.poolToken = event.params.assetTokenId.toString();
        const poolToken = assert(schema_1.PoolToken.load(event.params.assetTokenId.toString()));
        vaultedPoolToken.tranchedPool = poolToken.loan;
        vaultedPoolToken.save();
        const transaction = (0, helpers_1.createTransactionFromEvent)(event, "MEMBERSHIP_CAPITAL_DEPOSIT", event.params.owner);
        transaction.sentNftId = event.params.assetTokenId.toString();
        transaction.sentNftType = "POOL_TOKEN";
        transaction.save();
    }
    //Original official goldfinch subgraph code above
    const logs = event.receipt.logs;
    if (!logs) {
        graph_ts_1.log.warning("[handleCapitalErc721Deposit]no logs for tx {}, skip reward emissions calculation", [event.transaction.hash.toHexString()]);
        return;
    }
    _handleERC721DepositWithdrawal(event.params.owner, logs, event);
}
exports.handleCapitalErc721Deposit = handleCapitalErc721Deposit;
function handleCapitalErc721Withdrawal(event) {
    const id = event.params.positionId.toString();
    const vaultedStakedPosition = schema_1.VaultedStakedPosition.load(id);
    const vaultedPoolToken = schema_1.VaultedPoolToken.load(id);
    if (vaultedStakedPosition != null) {
        const transaction = (0, helpers_1.createTransactionFromEvent)(event, "MEMBERSHIP_CAPITAL_WITHDRAWAL", event.params.owner);
        transaction.receivedNftId = vaultedStakedPosition.seniorPoolStakedPosition;
        transaction.receivedNftType = "STAKING_TOKEN";
        transaction.save();
        graph_ts_1.store.remove("VaultedStakedPosition", id);
    }
    else if (vaultedPoolToken != null) {
        const transaction = (0, helpers_1.createTransactionFromEvent)(event, "MEMBERSHIP_CAPITAL_WITHDRAWAL", event.params.owner);
        transaction.receivedNftId = vaultedPoolToken.poolToken;
        transaction.receivedNftType = "POOL_TOKEN";
        transaction.save();
        graph_ts_1.store.remove("VaultedPoolToken", id);
    }
    //Original official goldfinch subgraph code above
    const logs = event.receipt.logs;
    if (!logs) {
        graph_ts_1.log.warning("[handleCapitalErc721Withdrawal]no logs for tx {}, skip reward emissions calculation", [event.transaction.hash.toHexString()]);
        return;
    }
    _handleERC721DepositWithdrawal(event.params.owner, logs, event);
}
exports.handleCapitalErc721Withdrawal = handleCapitalErc721Withdrawal;
function _handleERC721DepositWithdrawal(owner, logs, event) {
    const ownerAddress = owner.toHexString();
    let membership = schema_1._MembershipDirector.load(ownerAddress);
    if (!membership) {
        membership = new schema_1._MembershipDirector(ownerAddress);
        membership.eligibleAmount = constants_1.BIGINT_ZERO;
        membership.nextEpochAmount = constants_1.BIGINT_ZERO;
        membership.totalCapitalStaked = constants_1.BIGINT_ZERO;
        membership.save();
    }
    const touchedMarketIDs = [];
    let eligibleAmount = constants_1.BIGINT_ZERO;
    let nextEpochAmount = constants_1.BIGINT_ZERO;
    let deltaTotalCapitalStaked = constants_1.BIGINT_ZERO;
    for (let i = 0; i < logs.length; i++) {
        const currLog = logs.at(i);
        const deposit = log_1.CapitalERC721DepositLog.parse(currLog);
        if (deposit && deposit.owner.equals(owner)) {
            deposit.handleDeposit(currLog);
            // marketId is set if handleDeposit() is successful
            if (deposit.marketId) {
                deltaTotalCapitalStaked = deltaTotalCapitalStaked.plus(deposit.usdcEquivalent);
                if (touchedMarketIDs.indexOf(deposit.marketId) < 0) {
                    touchedMarketIDs.push(deposit.marketId);
                }
            }
        }
        const withdraw = log_1.CapitalERC721WithdrawalLog.parse(currLog);
        if (withdraw && withdraw.owner.equals(owner)) {
            withdraw.handleWithdraw(currLog);
            // marketId is set if handleWithdraw() is successful
            if (withdraw.marketId) {
                deltaTotalCapitalStaked = deltaTotalCapitalStaked.minus(withdraw.usdcEquivalent);
                if (touchedMarketIDs.indexOf(withdraw.marketId) < 0) {
                    touchedMarketIDs.push(withdraw.marketId);
                }
            }
        }
        const holdings = log_1.AdjustedHoldingsLog.parse(currLog);
        if (holdings && holdings.owner.equals(owner)) {
            eligibleAmount = eligibleAmount.plus(holdings.eligibleAmount);
            nextEpochAmount = nextEpochAmount.plus(holdings.nextEpochAmount);
        }
    }
    const deltaEligibleAmount = eligibleAmount.minus(membership.eligibleAmount);
    const deltaNextEpochAmount = nextEpochAmount.minus(membership.nextEpochAmount);
    if (deltaTotalCapitalStaked.le(constants_1.BIGINT_ZERO)) {
        graph_ts_1.log.error("deltaTotalCapitalStaked={} <=0", [
            deltaTotalCapitalStaked.toString(),
        ]);
        return;
    }
    membership.eligibleAmount = eligibleAmount;
    membership.nextEpochAmount = nextEpochAmount;
    membership.save();
    allocateAmountToMarket(touchedMarketIDs, deltaEligibleAmount, deltaNextEpochAmount, deltaTotalCapitalStaked, event);
}
function allocateAmountToMarket(marketIDs, deltaEligibleAmount, deltaNextEpochAmount, deltaTotalCapitalStaked, event) {
    const txHash = event.transaction.hash.toHexString();
    for (let i = 0; i < marketIDs.length; i++) {
        const mktID = marketIDs[i];
        const stkID = `${txHash}-${mktID}`;
        const stkEntity = schema_1._MembershipCapitalStaked.load(stkID);
        if (!stkEntity) {
            graph_ts_1.log.error("_MembershipCapitalStaked {} does not exist tx {}", [
                stkID,
                txHash,
            ]);
            continue;
        }
        const mktDeltaEligibleAmount = deltaEligibleAmount
            .times(stkEntity.CapitalStakedAmount)
            .div(deltaTotalCapitalStaked);
        const mktDeltaNextEpochAmount = deltaNextEpochAmount
            .times(stkEntity.CapitalStakedAmount)
            .div(deltaTotalCapitalStaked);
        const mkt = (0, getters_1.getOrCreateMarket)(mktID, event);
        if (!mkt._membershipRewardEligibleAmount) {
            mkt._membershipRewardEligibleAmount = constants_1.BIGINT_ZERO;
        }
        mkt._membershipRewardEligibleAmount =
            mkt._membershipRewardEligibleAmount.plus(mktDeltaEligibleAmount);
        if (!mkt._membershipRewardNextEpochAmount) {
            mkt._membershipRewardNextEpochAmount = constants_1.BIGINT_ZERO;
        }
        mkt._membershipRewardNextEpochAmount =
            mkt._membershipRewardNextEpochAmount.plus(mktDeltaNextEpochAmount);
        mkt.save();
    }
}
