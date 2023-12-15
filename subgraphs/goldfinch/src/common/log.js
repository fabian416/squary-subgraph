"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapitalERC721WithdrawalLog = exports.CapitalERC721DepositLog = exports.AdjustedHoldingsLog = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("./constants");
const AdjustedHoldingsSig = graph_ts_1.crypto.keccak256(graph_ts_1.ByteArray.fromUTF8("AdjustedHoldings(address,uint256,uint256)"));
class AdjustedHoldingsLog {
    constructor(txLog) {
        this.owner = txLog.address;
        this.eligibleAmount = AdjustedHoldingsLog.getEligibleAmount(txLog);
        this.nextEpochAmount = AdjustedHoldingsLog.getNextEpochAmount(txLog);
    }
    static parse(txLog) {
        if (!AdjustedHoldingsLog.isAdjustedHoldingsLog(txLog)) {
            return null;
        }
        return new AdjustedHoldingsLog(txLog);
    }
    static isAdjustedHoldingsLog(txLog) {
        return txLog.topics[0].equals(AdjustedHoldingsSig);
    }
    static getOwner(txLog) {
        return graph_ts_1.ethereum.decode("address", txLog.topics[1]).toAddress();
    }
    static getEligibleAmount(txLog) {
        const decoded = graph_ts_1.ethereum.decode("(uint256,uint256)", txLog.data).toTuple();
        return decoded[0].toBigInt();
    }
    static getNextEpochAmount(txLog) {
        const decoded = graph_ts_1.ethereum.decode("(uint256,uint256)", txLog.data).toTuple();
        return decoded[1].toBigInt();
    }
}
exports.AdjustedHoldingsLog = AdjustedHoldingsLog;
const DepositSig = graph_ts_1.crypto.keccak256(graph_ts_1.ByteArray.fromUTF8("CapitalERC721Deposit(address,address,uint256,uint256,uint256)"));
class CapitalERC721DepositLog {
    constructor(txLog) {
        this.owner = CapitalERC721DepositLog.getOwner(txLog);
        this.assetAddress = CapitalERC721DepositLog.getAssetAddress(txLog);
        this.positionId = CapitalERC721DepositLog.getPositionID(txLog);
        this.assetTokenId = CapitalERC721DepositLog.getAssetTokenId(txLog);
        this.usdcEquivalent = CapitalERC721DepositLog.getUsdcEquivalent(txLog);
        this.marketId = "";
    }
    static parse(txLog) {
        if (!CapitalERC721DepositLog.isCapitalERC721DepositLog(txLog)) {
            return null;
        }
        return new CapitalERC721DepositLog(txLog);
    }
    static isCapitalERC721DepositLog(txLog) {
        return txLog.topics[0].equals(DepositSig);
    }
    static getOwner(txLog) {
        return graph_ts_1.ethereum.decode("address", txLog.topics[1]).toAddress();
    }
    static getAssetAddress(txLog) {
        return graph_ts_1.ethereum.decode("address", txLog.topics[2]).toAddress();
    }
    static getPositionID(txLog) {
        const decoded = graph_ts_1.ethereum
            .decode("(uint256,uint256,uint256)", txLog.data)
            .toTuple();
        return decoded[0].toBigInt();
    }
    static getAssetTokenId(txLog) {
        const decoded = graph_ts_1.ethereum
            .decode("(uint256,uint256,uint256)", txLog.data)
            .toTuple();
        return decoded[1].toBigInt();
    }
    static getUsdcEquivalent(txLog) {
        const decoded = graph_ts_1.ethereum
            .decode("(uint256,uint256,uint256)", txLog.data)
            .toTuple();
        return decoded[2].toBigInt();
    }
    setmarketId(marketId) {
        this.marketId = marketId;
    }
    handleDeposit(txLog) {
        const currTxHash = txLog.transactionHash.toHexString();
        const txLogID = `${currTxHash}-${txLog.logIndex.toString()}`;
        const marketID = getMarketID(this.assetAddress, this.assetTokenId);
        if (!marketID) {
            graph_ts_1.log.error("[CapitalERC721DepositLog.handleDeposit]failed to look up market id for asset {} with tokenId {}", [this.assetAddress.toHexString(), this.assetTokenId.toString()]);
            return;
        }
        this.setmarketId(marketID);
        const positionID = this.positionId.toString();
        let position = schema_1._MembershipStakingPosition.load(positionID);
        if (!position) {
            position = new schema_1._MembershipStakingPosition(positionID);
            position.market = marketID;
            position.usdcEquivalent = this.usdcEquivalent;
            position.save();
        }
        let txLogEntity = schema_1._MembershipStakingTx.load(txLogID);
        if (!txLogEntity) {
            // a new tx that's not been processed
            txLogEntity = new schema_1._MembershipStakingTx(txLogID);
            txLogEntity.save();
            const stakedID = `${currTxHash}-${marketID}`;
            let stakedEntity = schema_1._MembershipCapitalStaked.load(stakedID);
            if (!stakedEntity) {
                stakedEntity = new schema_1._MembershipCapitalStaked(stakedID);
                stakedEntity.market = marketID;
                stakedEntity.CapitalStakedAmount = constants_1.BIGINT_ZERO;
            }
            stakedEntity.CapitalStakedAmount = stakedEntity.CapitalStakedAmount.plus(this.usdcEquivalent);
            stakedEntity.save();
        }
    }
}
exports.CapitalERC721DepositLog = CapitalERC721DepositLog;
const WithdrawSig = graph_ts_1.crypto.keccak256(graph_ts_1.ByteArray.fromUTF8("CapitalERC721Withdrawal(address,uint256,address,uint256)"));
class CapitalERC721WithdrawalLog {
    constructor(txLog) {
        this.owner = CapitalERC721WithdrawalLog.getOwner(txLog);
        this.positionId = CapitalERC721WithdrawalLog.getPositionID(txLog);
        this.assetAddress = CapitalERC721WithdrawalLog.getAssetAddress(txLog);
        this.depositTimestamp =
            CapitalERC721WithdrawalLog.getDepositTimestamp(txLog);
        this.marketId = "";
        this.usdcEquivalent = constants_1.BIGINT_ZERO;
    }
    static parse(txLog) {
        if (!CapitalERC721WithdrawalLog.isCapitalERC721WithdrawalLog(txLog)) {
            return null;
        }
        return new CapitalERC721WithdrawalLog(txLog);
    }
    static isCapitalERC721WithdrawalLog(txLog) {
        return txLog.topics[0].equals(WithdrawSig);
    }
    static getOwner(txLog) {
        return graph_ts_1.ethereum.decode("address", txLog.topics[1]).toAddress();
    }
    static getPositionID(txLog) {
        const decoded = graph_ts_1.ethereum
            .decode("(uint256,address,uint256)", txLog.data)
            .toTuple();
        return decoded[0].toBigInt();
    }
    static getAssetAddress(txLog) {
        const decoded = graph_ts_1.ethereum
            .decode("(uint256,address,uint256)", txLog.data)
            .toTuple();
        return decoded[1].toAddress();
    }
    static getDepositTimestamp(txLog) {
        const decoded = graph_ts_1.ethereum
            .decode("(uint256,address,uint256)", txLog.data)
            .toTuple();
        return decoded[2].toBigInt();
    }
    setmarketId(marketId) {
        this.marketId = marketId;
    }
    setUsdcEquivalent(usdcEquivalent) {
        this.usdcEquivalent = usdcEquivalent;
    }
    handleWithdraw(txLog) {
        const positionID = this.positionId.toString();
        const position = schema_1._MembershipStakingPosition.load(positionID);
        if (!position) {
            graph_ts_1.log.error("[processCapitalWithdraw]position {} not existing in _MembershipStakingPosition", [positionID]);
            return;
        }
        this.setmarketId(position.market);
        const currTxHash = txLog.transactionHash.toHexString();
        const txLogID = `${currTxHash}-${txLog.logIndex.toString()}`;
        let txLogEntity = schema_1._MembershipStakingTx.load(txLogID);
        if (!txLogEntity) {
            // a new tx that's not been processed
            txLogEntity = new schema_1._MembershipStakingTx(txLogID);
            txLogEntity.save();
            const stakedID = `${currTxHash}-${position.market}`;
            let stakedEntity = schema_1._MembershipCapitalStaked.load(stakedID);
            if (!stakedEntity) {
                stakedEntity = new schema_1._MembershipCapitalStaked(stakedID);
                stakedEntity.market = position.market;
                stakedEntity.CapitalStakedAmount = constants_1.BIGINT_ZERO;
            }
            stakedEntity.CapitalStakedAmount = stakedEntity.CapitalStakedAmount.minus(position.usdcEquivalent);
            stakedEntity.save();
        }
    }
}
exports.CapitalERC721WithdrawalLog = CapitalERC721WithdrawalLog;
function getMarketID(assetAddress, tokenID) {
    if (assetAddress.equals(graph_ts_1.Address.fromString(constants_1.STAKING_REWARDS_ADDRESS))) {
        // staking of staked FIDU token, return senior pool id
        return constants_1.SENIOR_POOL_ADDRESS;
    }
    if (assetAddress.equals(graph_ts_1.Address.fromString(constants_1.POOL_TOKENS_ADDRESS))) {
        // staking ERC 721 tranched pool token, use tokenID to look up tranched pool address
        const poolToken = schema_1._PoolTokenStore.load(tokenID.toString());
        if (!poolToken) {
            graph_ts_1.log.error("[getMarketID]tokenID {} does not exist in _PoolTokenStore", [
                tokenID.toString(),
            ]);
            return null;
        }
        return poolToken.market;
    }
    return null;
}
