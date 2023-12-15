"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer = exports.handleTokenPrincipalWithdrawn = exports.handleTokenRedeemed = exports.handleTokenMinted = exports.handleTokenBurned = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const user_1 = require("../entities/user");
const zapper_1 = require("../entities/zapper");
const utils_1 = require("../common/utils");
const getters_1 = require("../common/getters");
function handleTokenBurned(event) {
    const token = schema_1.PoolToken.load(event.params.tokenId.toString());
    if (!token) {
        return;
    }
    graph_ts_1.store.remove("PoolToken", event.params.tokenId.toString());
}
exports.handleTokenBurned = handleTokenBurned;
function handleTokenMinted(event) {
    const marketID = event.params.pool.toHexString();
    const tokenId = event.params.tokenId.toString();
    const _poolToken = (0, getters_1.getOrCreatePoolToken)(tokenId, marketID);
    graph_ts_1.log.info("[handleTokenMinted]poolToken({}, {})", [
        _poolToken.id,
        _poolToken.market,
    ]);
    //
    const tranchedPool = schema_1.TranchedPool.load(event.params.pool.toHexString());
    const callableLoan = schema_1.CallableLoan.load(event.params.pool.toHexString());
    const user = (0, user_1.getOrInitUser)(event.params.owner);
    if (tranchedPool || callableLoan) {
        const token = new schema_1.PoolToken(event.params.tokenId.toString());
        token.mintedAt = event.block.timestamp;
        token.user = user.id;
        token.tranche = event.params.tranche;
        token.principalAmount = event.params.amount;
        token.principalRedeemed = graph_ts_1.BigInt.zero();
        token.principalRedeemable = token.principalAmount;
        token.interestRedeemed = graph_ts_1.BigInt.zero();
        token.interestRedeemable = graph_ts_1.BigInt.zero();
        token.rewardsClaimable = graph_ts_1.BigInt.zero();
        token.rewardsClaimed = graph_ts_1.BigInt.zero();
        token.stakingRewardsClaimable = graph_ts_1.BigInt.zero();
        token.stakingRewardsClaimed = graph_ts_1.BigInt.zero();
        token.isCapitalCalled = false;
        if (tranchedPool) {
            token.loan = tranchedPool.id;
            tranchedPool.tokens = tranchedPool.tokens.concat([token.id]);
            tranchedPool.save();
        }
        else if (callableLoan) {
            token.loan = callableLoan.id;
            callableLoan.tokens = callableLoan.tokens.concat([token.id]);
            callableLoan.save();
        }
        token.save();
        user.poolTokens = user.poolTokens.concat([token.id]);
        user.save();
    }
}
exports.handleTokenMinted = handleTokenMinted;
function handleTokenRedeemed(event) {
    const token = schema_1.PoolToken.load(event.params.tokenId.toString());
    if (!token) {
        return;
    }
    token.interestRedeemable = token.interestRedeemable.minus(event.params.interestRedeemed);
    token.interestRedeemed = token.interestRedeemed.plus(event.params.interestRedeemed);
    token.principalRedeemable = token.principalRedeemable.minus(event.params.principalRedeemed);
    token.principalRedeemed = token.principalRedeemed.plus(event.params.principalRedeemed);
    token.save();
}
exports.handleTokenRedeemed = handleTokenRedeemed;
function isUserFullyWithdrawnFromPool(user, loanId) {
    for (let i = 0; i < user.poolTokens.length; i++) {
        const token = assert(schema_1.PoolToken.load(user.poolTokens[i]));
        if (token.loan == loanId && !token.principalAmount.isZero()) {
            return false;
        }
    }
    return true;
}
function handleTokenPrincipalWithdrawn(event) {
    const token = schema_1.PoolToken.load(event.params.tokenId.toString());
    if (!token) {
        return;
    }
    token.principalAmount = token.principalAmount.minus(event.params.principalWithdrawn);
    token.principalRedeemable = token.principalRedeemable.minus(event.params.principalWithdrawn);
    token.save();
    if (token.principalAmount.isZero()) {
        const tranchedPool = schema_1.TranchedPool.load(event.params.pool.toHexString());
        const callableLoan = schema_1.CallableLoan.load(event.params.pool.toHexString());
        const user = assert(schema_1.User.load(event.params.owner.toHexString()));
        if (tranchedPool && isUserFullyWithdrawnFromPool(user, tranchedPool.id)) {
            tranchedPool.backers = (0, utils_1.removeFromList)(tranchedPool.backers, user.id);
            tranchedPool.numBackers = tranchedPool.backers.length;
            tranchedPool.save();
        }
        else if (callableLoan &&
            isUserFullyWithdrawnFromPool(user, callableLoan.id)) {
            callableLoan.backers = (0, utils_1.removeFromList)(callableLoan.backers, user.id);
            callableLoan.numBackers = callableLoan.backers.length;
            callableLoan.save();
        }
    }
}
exports.handleTokenPrincipalWithdrawn = handleTokenPrincipalWithdrawn;
function handleTransfer(event) {
    const tokenId = event.params.tokenId.toString();
    const token = schema_1.PoolToken.load(tokenId);
    if (!token) {
        return;
    }
    const oldOwner = (0, user_1.getOrInitUser)(event.params.from);
    const newOwner = (0, user_1.getOrInitUser)(event.params.to);
    oldOwner.poolTokens = (0, utils_1.removeFromList)(oldOwner.poolTokens, tokenId);
    oldOwner.save();
    newOwner.poolTokens = newOwner.poolTokens.concat([tokenId]);
    newOwner.save();
    token.user = newOwner.id;
    token.save();
    (0, zapper_1.deleteZapAfterClaimMaybe)(event);
}
exports.handleTransfer = handleTransfer;
