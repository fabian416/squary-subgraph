"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataManager = exports.RewardData = exports.ProtocolData = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const versions_1 = require("../versions");
const account_1 = require("./account");
const constants_1 = require("./constants");
const snapshots_1 = require("./snapshots");
const token_1 = require("./token");
const constants_2 = require("./constants");
const position_1 = require("./position");
/**
 * This file contains the DataManager, which is used to
 * make all of the storage changes that occur in a protocol.
 *
 * You can think of this as an abstraction so the developer doesn't
 * need to think about all of the detailed storage changes that occur.
 *
 * Schema Version:  3.0.1
 * SDK Version:     1.0.1
 * Author(s):
 *  - @melotik
 */
class ProtocolData {
    constructor(protocolID, protocol, name, slug, network, lendingType, lenderPermissionType, borrowerPermissionType, poolCreatorPermissionType, collateralizationType, riskType) {
        this.protocolID = protocolID;
        this.protocol = protocol;
        this.name = name;
        this.slug = slug;
        this.network = network;
        this.lendingType = lendingType;
        this.lenderPermissionType = lenderPermissionType;
        this.borrowerPermissionType = borrowerPermissionType;
        this.poolCreatorPermissionType = poolCreatorPermissionType;
        this.collateralizationType = collateralizationType;
        this.riskType = riskType;
    }
}
exports.ProtocolData = ProtocolData;
class RewardData {
    constructor(rewardToken, rewardTokenEmissionsAmount, rewardTokenEmissionsUSD) {
        this.rewardToken = rewardToken;
        this.rewardTokenEmissionsAmount = rewardTokenEmissionsAmount;
        this.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
    }
}
exports.RewardData = RewardData;
class DataManager {
    constructor(marketID, inputToken, event, protocolData) {
        this.protocol = this.getOrCreateLendingProtocol(protocolData);
        this.inputToken = new token_1.TokenManager(inputToken, event);
        let _market = schema_1.Market.load(marketID);
        // create new market
        if (!_market) {
            _market = new schema_1.Market(marketID);
            _market.protocol = this.protocol.id;
            _market.isActive = true;
            _market.canBorrowFrom = false; // default
            _market.canUseAsCollateral = false; // default
            _market.maximumLTV = constants_1.BIGDECIMAL_ZERO; // default
            _market.liquidationThreshold = constants_1.BIGDECIMAL_ZERO; // default
            _market.liquidationPenalty = constants_1.BIGDECIMAL_ZERO; // default
            _market.canIsolate = false; // default
            _market.inputToken = this.inputToken.getToken().id;
            _market.inputTokenBalance = constants_1.BIGINT_ZERO;
            _market.inputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
            _market.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
            _market.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
            _market.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
            _market.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
            _market.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
            _market.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
            _market.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
            _market.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
            _market.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
            _market.cumulativeTransferUSD = constants_1.BIGDECIMAL_ZERO;
            _market.cumulativeFlashloanUSD = constants_1.BIGDECIMAL_ZERO;
            _market.transactionCount = constants_1.INT_ZERO;
            _market.depositCount = constants_1.INT_ZERO;
            _market.withdrawCount = constants_1.INT_ZERO;
            _market.borrowCount = constants_1.INT_ZERO;
            _market.repayCount = constants_1.INT_ZERO;
            _market.liquidationCount = constants_1.INT_ZERO;
            _market.transferCount = constants_1.INT_ZERO;
            _market.flashloanCount = constants_1.INT_ZERO;
            _market.cumulativeUniqueUsers = constants_1.INT_ZERO;
            _market.cumulativeUniqueDepositors = constants_1.INT_ZERO;
            _market.cumulativeUniqueBorrowers = constants_1.INT_ZERO;
            _market.cumulativeUniqueLiquidators = constants_1.INT_ZERO;
            _market.cumulativeUniqueLiquidatees = constants_1.INT_ZERO;
            _market.cumulativeUniqueTransferrers = constants_1.INT_ZERO;
            _market.cumulativeUniqueFlashloaners = constants_1.INT_ZERO;
            _market.createdTimestamp = event.block.timestamp;
            _market.createdBlockNumber = event.block.number;
            _market.positionCount = constants_1.INT_ZERO;
            _market.openPositionCount = constants_1.INT_ZERO;
            _market.closedPositionCount = constants_1.INT_ZERO;
            _market.lendingPositionCount = constants_1.INT_ZERO;
            _market.borrowingPositionCount = constants_1.INT_ZERO;
            _market.save();
            // add to market list
            this.getOrAddMarketToList(marketID);
            this.protocol.totalPoolCount += constants_1.INT_ONE;
            this.protocol.save();
        }
        this.market = _market;
        this.event = event;
        // load snapshots
        this.snapshots = new snapshots_1.SnapshotManager(event, this.protocol, this.market);
        // load oracle
        if (this.market.oracle) {
            this.oracle = schema_1.Oracle.load(this.market.oracle);
        }
    }
    /////////////////
    //// Getters ////
    /////////////////
    getOrCreateLendingProtocol(data) {
        let protocol = schema_1.LendingProtocol.load(data.protocolID);
        if (!protocol) {
            protocol = new schema_1.LendingProtocol(data.protocolID);
            protocol.protocol = data.protocol;
            protocol.name = data.name;
            protocol.slug = data.slug;
            protocol.network = data.network;
            protocol.type = constants_1.ProtocolType.LENDING;
            protocol.lendingType = data.lendingType;
            protocol.lenderPermissionType = data.lenderPermissionType;
            protocol.borrowerPermissionType = data.borrowerPermissionType;
            protocol.poolCreatorPermissionType = data.poolCreatorPermissionType;
            protocol.riskType = data.riskType;
            protocol.collateralizationType = data.collateralizationType;
            protocol.cumulativeUniqueUsers = constants_1.INT_ZERO;
            protocol.cumulativeUniqueDepositors = constants_1.INT_ZERO;
            protocol.cumulativeUniqueBorrowers = constants_1.INT_ZERO;
            protocol.cumulativeUniqueLiquidators = constants_1.INT_ZERO;
            protocol.cumulativeUniqueLiquidatees = constants_1.INT_ZERO;
            protocol.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
            protocol.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
            protocol.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
            protocol.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
            protocol.totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
            protocol.cumulativeDepositUSD = constants_1.BIGDECIMAL_ZERO;
            protocol.totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
            protocol.cumulativeBorrowUSD = constants_1.BIGDECIMAL_ZERO;
            protocol.cumulativeLiquidateUSD = constants_1.BIGDECIMAL_ZERO;
            protocol.totalPoolCount = constants_1.INT_ZERO;
            protocol.openPositionCount = constants_1.INT_ZERO;
            protocol.cumulativePositionCount = constants_1.INT_ZERO;
            protocol.transactionCount = constants_1.INT_ZERO;
            protocol.depositCount = constants_1.INT_ZERO;
            protocol.withdrawCount = constants_1.INT_ZERO;
            protocol.borrowCount = constants_1.INT_ZERO;
            protocol.repayCount = constants_1.INT_ZERO;
            protocol.liquidationCount = constants_1.INT_ZERO;
            protocol.transferCount = constants_1.INT_ZERO;
            protocol.flashloanCount = constants_1.INT_ZERO;
        }
        protocol.schemaVersion = versions_1.Versions.getSchemaVersion();
        protocol.subgraphVersion = versions_1.Versions.getSubgraphVersion();
        protocol.methodologyVersion = versions_1.Versions.getMethodologyVersion();
        protocol.save();
        return protocol;
    }
    getMarket() {
        return this.market;
    }
    getProtocol() {
        return this.protocol;
    }
    getInputToken() {
        return this.inputToken.getToken();
    }
    getOrCreateOracle(oracleAddress, isUSD, source) {
        const oracleID = this.market.id.concat(this.market.inputToken);
        let oracle = schema_1.Oracle.load(oracleID);
        if (!oracle) {
            oracle = new schema_1.Oracle(oracleID);
            oracle.market = this.market.id;
            oracle.blockCreated = this.event.block.number;
            oracle.timestampCreated = this.event.block.timestamp;
            oracle.isActive = true;
        }
        oracle.oracleAddress = oracleAddress;
        oracle.isUSD = isUSD;
        if (source) {
            oracle.oracleSource = source;
        }
        oracle.save();
        this.oracle = oracle;
        return oracle;
    }
    getOracleAddress() {
        return graph_ts_1.Address.fromBytes(this.oracle.oracleAddress);
    }
    getOrUpdateRate(rateSide, rateType, interestRate) {
        const interestRateID = rateSide
            .concat("-")
            .concat(rateType)
            .concat("-")
            .concat(this.market.id.toHexString());
        let rate = schema_1.InterestRate.load(interestRateID);
        if (!rate) {
            rate = new schema_1.InterestRate(interestRateID);
            rate.side = rateSide;
            rate.type = rateType;
        }
        rate.rate = interestRate;
        rate.save();
        let marketRates = this.market.rates;
        if (!marketRates) {
            marketRates = [];
        }
        if (marketRates.indexOf(interestRateID) == -1) {
            marketRates.push(interestRateID);
        }
        this.market.rates = marketRates;
        this.market.save();
        return rate;
    }
    getOrUpdateFee(feeType, flatFee = null, rate = null) {
        let fee = schema_1.Fee.load(feeType);
        if (!fee) {
            fee = new schema_1.Fee(feeType);
            fee.type = feeType;
        }
        fee.rate = rate;
        fee.flatFee = flatFee;
        fee.save();
        let protocolFees = this.protocol.fees;
        if (!protocolFees) {
            protocolFees = [];
        }
        if (protocolFees.indexOf(feeType) == -1) {
            protocolFees.push(feeType);
        }
        this.protocol.fees = protocolFees;
        this.protocol.save();
        return fee;
    }
    getAddress() {
        return graph_ts_1.Address.fromBytes(this.market.id);
    }
    getOrCreateRevenueDetail(id, isMarket) {
        let details = schema_1.RevenueDetail.load(id);
        if (!details) {
            details = new schema_1.RevenueDetail(id);
            details.sources = [];
            details.amountsUSD = [];
            details.save();
            if (isMarket) {
                this.market.revenueDetail = details.id;
                this.market.save();
            }
            else {
                this.protocol.revenueDetail = details.id;
                this.protocol.save();
            }
        }
        return details;
    }
    //////////////////
    //// Creators ////
    //////////////////
    createDeposit(asset, account, amount, amountUSD, newBalance, interestType = null) {
        const depositor = new account_1.AccountManager(account);
        if (depositor.isNewUser()) {
            this.protocol.cumulativeUniqueUsers += constants_1.INT_ONE;
            this.protocol.save();
        }
        const position = new position_1.PositionManager(depositor.getAccount(), this.market, constants_1.PositionSide.COLLATERAL, interestType);
        position.addPosition(this.event, asset, this.protocol, newBalance, constants_1.TransactionType.DEPOSIT, this.market.inputTokenPriceUSD);
        const deposit = new schema_1.Deposit(this.event.transaction.hash
            .concatI32(this.event.logIndex.toI32())
            .concatI32(constants_1.Transaction.DEPOSIT));
        deposit.hash = this.event.transaction.hash;
        deposit.nonce = this.event.transaction.nonce;
        deposit.logIndex = this.event.logIndex.toI32();
        deposit.gasPrice = this.event.transaction.gasPrice;
        deposit.gasUsed = this.event.receipt ? this.event.receipt.gasUsed : null;
        deposit.gasLimit = this.event.transaction.gasLimit;
        deposit.blockNumber = this.event.block.number;
        deposit.timestamp = this.event.block.timestamp;
        deposit.account = account;
        deposit.market = this.market.id;
        deposit.position = position.getPositionID();
        deposit.asset = asset;
        deposit.amount = amount;
        deposit.amountUSD = amountUSD;
        deposit.save();
        this.updateTransactionData(constants_1.TransactionType.DEPOSIT, amount, amountUSD);
        this.updateUsageData(constants_1.TransactionType.DEPOSIT, account);
        return deposit;
    }
    createWithdraw(asset, account, amount, amountUSD, newBalance, interestType = null) {
        const withdrawer = new account_1.AccountManager(account);
        if (withdrawer.isNewUser()) {
            this.protocol.cumulativeUniqueUsers += constants_1.INT_ONE;
            this.protocol.save();
        }
        const position = new position_1.PositionManager(withdrawer.getAccount(), this.market, constants_1.PositionSide.COLLATERAL, interestType);
        position.subtractPosition(this.event, this.protocol, newBalance, constants_1.TransactionType.WITHDRAW, this.market.inputTokenPriceUSD);
        const positionID = position.getPositionID();
        if (!positionID) {
            graph_ts_1.log.error("[createWithdraw] positionID is null for market: {} account: {}", [this.market.id.toHexString(), account.toHexString()]);
            return null;
        }
        const withdraw = new schema_1.Withdraw(this.event.transaction.hash
            .concatI32(this.event.logIndex.toI32())
            .concatI32(constants_1.Transaction.WITHDRAW));
        withdraw.hash = this.event.transaction.hash;
        withdraw.nonce = this.event.transaction.nonce;
        withdraw.logIndex = this.event.logIndex.toI32();
        withdraw.gasPrice = this.event.transaction.gasPrice;
        withdraw.gasUsed = this.event.receipt ? this.event.receipt.gasUsed : null;
        withdraw.gasLimit = this.event.transaction.gasLimit;
        withdraw.blockNumber = this.event.block.number;
        withdraw.timestamp = this.event.block.timestamp;
        withdraw.account = account;
        withdraw.market = this.market.id;
        withdraw.position = positionID;
        withdraw.asset = asset;
        withdraw.amount = amount;
        withdraw.amountUSD = amountUSD;
        withdraw.save();
        this.updateTransactionData(constants_1.TransactionType.WITHDRAW, amount, amountUSD);
        this.updateUsageData(constants_1.TransactionType.WITHDRAW, account);
        return withdraw;
    }
    createBorrow(asset, account, amount, amountUSD, newBalance, tokenPriceUSD, // used for different borrow token in CDP
    interestType = null) {
        const borrower = new account_1.AccountManager(account);
        if (borrower.isNewUser()) {
            this.protocol.cumulativeUniqueUsers += constants_1.INT_ONE;
            this.protocol.save();
        }
        const position = new position_1.PositionManager(borrower.getAccount(), this.market, constants_1.PositionSide.BORROWER, interestType);
        position.addPosition(this.event, asset, this.protocol, newBalance, constants_1.TransactionType.BORROW, tokenPriceUSD);
        const borrow = new schema_1.Borrow(this.event.transaction.hash
            .concatI32(this.event.logIndex.toI32())
            .concatI32(constants_1.Transaction.BORROW));
        borrow.hash = this.event.transaction.hash;
        borrow.nonce = this.event.transaction.nonce;
        borrow.logIndex = this.event.logIndex.toI32();
        borrow.gasPrice = this.event.transaction.gasPrice;
        borrow.gasUsed = this.event.receipt ? this.event.receipt.gasUsed : null;
        borrow.gasLimit = this.event.transaction.gasLimit;
        borrow.blockNumber = this.event.block.number;
        borrow.timestamp = this.event.block.timestamp;
        borrow.account = account;
        borrow.market = this.market.id;
        borrow.position = position.getPositionID();
        borrow.asset = asset;
        borrow.amount = amount;
        borrow.amountUSD = amountUSD;
        borrow.save();
        this.updateTransactionData(constants_1.TransactionType.BORROW, amount, amountUSD);
        this.updateUsageData(constants_1.TransactionType.BORROW, account);
        return borrow;
    }
    createRepay(asset, account, amount, amountUSD, newBalance, tokenPriceUSD, // used for different borrow token in CDP
    interestType = null) {
        const repayer = new account_1.AccountManager(account);
        if (repayer.isNewUser()) {
            this.protocol.cumulativeUniqueUsers += constants_1.INT_ONE;
            this.protocol.save();
        }
        const position = new position_1.PositionManager(repayer.getAccount(), this.market, constants_1.PositionSide.BORROWER, interestType);
        position.subtractPosition(this.event, this.protocol, newBalance, constants_1.TransactionType.REPAY, tokenPriceUSD);
        const positionID = position.getPositionID();
        if (!positionID) {
            graph_ts_1.log.error("[createRepay] positionID is null for market: {} account: {}", [
                this.market.id.toHexString(),
                account.toHexString(),
            ]);
            return null;
        }
        const repay = new schema_1.Repay(this.event.transaction.hash
            .concatI32(this.event.logIndex.toI32())
            .concatI32(constants_1.Transaction.REPAY));
        repay.hash = this.event.transaction.hash;
        repay.nonce = this.event.transaction.nonce;
        repay.logIndex = this.event.logIndex.toI32();
        repay.gasPrice = this.event.transaction.gasPrice;
        repay.gasUsed = this.event.receipt ? this.event.receipt.gasUsed : null;
        repay.gasLimit = this.event.transaction.gasLimit;
        repay.blockNumber = this.event.block.number;
        repay.timestamp = this.event.block.timestamp;
        repay.account = account;
        repay.market = this.market.id;
        repay.position = positionID;
        repay.asset = asset;
        repay.amount = amount;
        repay.amountUSD = amountUSD;
        repay.save();
        this.updateTransactionData(constants_1.TransactionType.REPAY, amount, amountUSD);
        this.updateUsageData(constants_1.TransactionType.REPAY, account);
        return repay;
    }
    createLiquidate(asset, liquidator, liquidatee, amount, amountUSD, profitUSD, newBalance, // repaid token balance for liquidatee
    interestType = null) {
        const liquidatorAccount = new account_1.AccountManager(liquidator);
        if (liquidatorAccount.isNewUser()) {
            this.protocol.cumulativeUniqueUsers += constants_1.INT_ONE;
            this.protocol.save();
        }
        liquidatorAccount.countLiquidate();
        // Note: Be careful, some protocols might give the liquidated collateral to the liquidator
        //       in collateral in the market. But that is not always the case so we don't do it here.
        const liquidateeAccount = new account_1.AccountManager(liquidatee);
        const liquidateePosition = new position_1.PositionManager(liquidateeAccount.getAccount(), this.market, constants_1.PositionSide.COLLATERAL, interestType);
        liquidateePosition.subtractPosition(this.event, this.protocol, newBalance, constants_1.TransactionType.LIQUIDATE, this.market.inputTokenPriceUSD);
        // Note:
        //  - liquidatees are not considered users since they are not spending gas for the transaction
        //  - It is possible in some protocols for the liquidator to incur a position if they are transferred collateral tokens
        const positionID = liquidateePosition.getPositionID();
        if (!positionID) {
            graph_ts_1.log.error("[createLiquidate] positionID is null for market: {} account: {}", [this.market.id.toHexString(), liquidatee.toHexString()]);
            return null;
        }
        const liquidate = new schema_1.Liquidate(this.event.transaction.hash
            .concatI32(this.event.logIndex.toI32())
            .concatI32(constants_1.Transaction.LIQUIDATE));
        liquidate.hash = this.event.transaction.hash;
        liquidate.nonce = this.event.transaction.nonce;
        liquidate.logIndex = this.event.logIndex.toI32();
        liquidate.gasPrice = this.event.transaction.gasPrice;
        liquidate.gasUsed = this.event.receipt ? this.event.receipt.gasUsed : null;
        liquidate.gasLimit = this.event.transaction.gasLimit;
        liquidate.blockNumber = this.event.block.number;
        liquidate.timestamp = this.event.block.timestamp;
        liquidate.liquidator = liquidator;
        liquidate.liquidatee = liquidatee;
        liquidate.market = this.market.id;
        liquidate.positions = [positionID];
        liquidate.asset = asset;
        liquidate.amount = amount;
        liquidate.amountUSD = amountUSD;
        liquidate.profitUSD = profitUSD;
        liquidate.save();
        this.updateTransactionData(constants_1.TransactionType.LIQUIDATE, amount, amountUSD);
        this.updateUsageData(constants_1.TransactionType.LIQUIDATEE, liquidatee);
        this.updateUsageData(constants_1.TransactionType.LIQUIDATOR, liquidator);
        return liquidate;
    }
    createTransfer(asset, sender, receiver, amount, amountUSD, senderNewBalance, receiverNewBalance, interestType = null) {
        const transferrer = new account_1.AccountManager(sender);
        if (transferrer.isNewUser()) {
            this.protocol.cumulativeUniqueUsers += constants_1.INT_ONE;
            this.protocol.save();
        }
        const transferrerPosition = new position_1.PositionManager(transferrer.getAccount(), this.market, constants_1.PositionSide.COLLATERAL, interestType);
        transferrerPosition.subtractPosition(this.event, this.protocol, senderNewBalance, constants_1.TransactionType.TRANSFER, this.market.inputTokenPriceUSD);
        const positionID = transferrerPosition.getPositionID();
        if (!positionID) {
            graph_ts_1.log.error("[createTransfer] positionID is null for market: {} account: {}", [this.market.id.toHexString(), receiver.toHexString()]);
            return null;
        }
        const recieverAccount = new account_1.AccountManager(receiver);
        // receivers are not considered users since they are not spending gas for the transaction
        const receiverPosition = new position_1.PositionManager(recieverAccount.getAccount(), this.market, constants_1.PositionSide.COLLATERAL, interestType);
        receiverPosition.addPosition(this.event, asset, this.protocol, receiverNewBalance, constants_1.TransactionType.TRANSFER, this.market.inputTokenPriceUSD);
        const transfer = new schema_1.Transfer(this.event.transaction.hash
            .concatI32(this.event.logIndex.toI32())
            .concatI32(constants_1.Transaction.TRANSFER));
        transfer.hash = this.event.transaction.hash;
        transfer.nonce = this.event.transaction.nonce;
        transfer.logIndex = this.event.logIndex.toI32();
        transfer.gasPrice = this.event.transaction.gasPrice;
        transfer.gasUsed = this.event.receipt ? this.event.receipt.gasUsed : null;
        transfer.gasLimit = this.event.transaction.gasLimit;
        transfer.blockNumber = this.event.block.number;
        transfer.timestamp = this.event.block.timestamp;
        transfer.sender = sender;
        transfer.receiver = receiver;
        transfer.market = this.market.id;
        transfer.positions = [receiverPosition.getPositionID(), positionID];
        transfer.asset = asset;
        transfer.amount = amount;
        transfer.amountUSD = amountUSD;
        transfer.save();
        this.updateTransactionData(constants_1.TransactionType.TRANSFER, amount, amountUSD);
        this.updateUsageData(constants_1.TransactionType.TRANSFER, sender);
        return transfer;
    }
    createFlashloan(asset, account, amount, amountUSD) {
        const flashloaner = new account_1.AccountManager(account);
        if (flashloaner.isNewUser()) {
            this.protocol.cumulativeUniqueUsers += constants_1.INT_ONE;
            this.protocol.save();
        }
        flashloaner.countFlashloan();
        const flashloan = new schema_1.Flashloan(this.event.transaction.hash
            .concatI32(this.event.logIndex.toI32())
            .concatI32(constants_1.Transaction.FLASHLOAN));
        flashloan.hash = this.event.transaction.hash;
        flashloan.nonce = this.event.transaction.nonce;
        flashloan.logIndex = this.event.logIndex.toI32();
        flashloan.gasPrice = this.event.transaction.gasPrice;
        flashloan.gasUsed = this.event.receipt ? this.event.receipt.gasUsed : null;
        flashloan.gasLimit = this.event.transaction.gasLimit;
        flashloan.blockNumber = this.event.block.number;
        flashloan.timestamp = this.event.block.timestamp;
        flashloan.account = account;
        flashloan.market = this.market.id;
        flashloan.asset = asset;
        flashloan.amount = amount;
        flashloan.amountUSD = amountUSD;
        flashloan.save();
        this.updateTransactionData(constants_1.TransactionType.FLASHLOAN, amount, amountUSD);
        this.updateUsageData(constants_1.TransactionType.FLASHLOAN, account);
        return flashloan;
    }
    //////////////////
    //// Updaters ////
    //////////////////
    updateRewards(rewardData) {
        if (!this.market.rewardTokens) {
            this.market.rewardTokens = [rewardData.rewardToken.id];
            this.market.rewardTokenEmissionsAmount = [
                rewardData.rewardTokenEmissionsAmount,
            ];
            this.market.rewardTokenEmissionsUSD = [
                rewardData.rewardTokenEmissionsUSD,
            ];
            return; // initial add is manual
        }
        // update market reward tokens with rewardData so that it is in alphabetical order
        let rewardTokens = this.market.rewardTokens;
        let rewardTokenEmissionsAmount = this.market.rewardTokenEmissionsAmount;
        let rewardTokenEmissionsUSD = this.market.rewardTokenEmissionsUSD;
        for (let i = 0; i < rewardTokens.length; i++) {
            const index = rewardData.rewardToken.id.localeCompare(rewardTokens[i]);
            if (index < 0) {
                // insert rewardData at index i
                rewardTokens = (0, constants_2.insert)(rewardTokens, rewardData.rewardToken.id, i);
                rewardTokenEmissionsAmount = (0, constants_2.insert)(rewardTokenEmissionsAmount, rewardData.rewardTokenEmissionsAmount, i);
                rewardTokenEmissionsUSD = (0, constants_2.insert)(rewardTokenEmissionsUSD, rewardData.rewardTokenEmissionsUSD, i);
                break;
            }
            else if (index == 0) {
                // update the rewardData at index i
                rewardTokens[i] = rewardData.rewardToken.id;
                rewardTokenEmissionsAmount[i] = rewardData.rewardTokenEmissionsAmount;
                rewardTokenEmissionsUSD[i] = rewardData.rewardTokenEmissionsUSD;
                break;
            }
            else {
                if (i == rewardTokens.length - 1) {
                    // insert rewardData at end of array
                    rewardTokens.push(rewardData.rewardToken.id);
                    rewardTokenEmissionsAmount.push(rewardData.rewardTokenEmissionsAmount);
                    rewardTokenEmissionsUSD.push(rewardData.rewardTokenEmissionsUSD);
                    break;
                }
            }
        }
        this.market.rewardTokens = rewardTokens;
        this.market.rewardTokenEmissionsAmount = rewardTokenEmissionsAmount;
        this.market.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
        this.market.save();
    }
    // used to update tvl, borrow balance, reserves, etc. in market and protocol
    updateMarketAndProtocolData(inputTokenPriceUSD, newInputTokenBalance, newVariableBorrowBalance = null, newStableBorrowBalance = null, newReserveBalance = null, exchangeRate = null) {
        const mantissaFactorBD = (0, constants_1.exponentToBigDecimal)(this.inputToken.getDecimals());
        this.inputToken.updatePrice(inputTokenPriceUSD);
        this.market.inputTokenPriceUSD = inputTokenPriceUSD;
        this.market.inputTokenBalance = newInputTokenBalance;
        if (newVariableBorrowBalance) {
            this.market.variableBorrowedTokenBalance = newVariableBorrowBalance;
        }
        if (newStableBorrowBalance) {
            this.market.stableBorrowedTokenBalance = newStableBorrowBalance;
        }
        if (newReserveBalance) {
            this.market.reserves = newReserveBalance
                .toBigDecimal()
                .div(mantissaFactorBD)
                .times(inputTokenPriceUSD);
        }
        if (exchangeRate) {
            this.market.exchangeRate = exchangeRate;
        }
        const vBorrowAmount = this.market.variableBorrowedTokenBalance
            ? this.market
                .variableBorrowedTokenBalance.toBigDecimal()
                .div(mantissaFactorBD)
            : constants_1.BIGDECIMAL_ZERO;
        const sBorrowAmount = this.market.stableBorrowedTokenBalance
            ? this.market
                .stableBorrowedTokenBalance.toBigDecimal()
                .div(mantissaFactorBD)
            : constants_1.BIGDECIMAL_ZERO;
        const totalBorrowed = vBorrowAmount.plus(sBorrowAmount);
        this.market.totalValueLockedUSD = newInputTokenBalance
            .toBigDecimal()
            .div(mantissaFactorBD)
            .times(inputTokenPriceUSD);
        this.market.totalDepositBalanceUSD = this.market.totalValueLockedUSD;
        this.market.totalBorrowBalanceUSD = totalBorrowed.times(inputTokenPriceUSD);
        this.market.save();
        let totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        let totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        const marketList = this.getOrAddMarketToList();
        for (let i = 0; i < marketList.length; i++) {
            const _market = schema_1.Market.load(marketList[i]);
            if (!_market) {
                graph_ts_1.log.error("[updateMarketAndProtocolData] Market not found: {}", [
                    marketList[i].toHexString(),
                ]);
                continue;
            }
            totalValueLockedUSD = totalValueLockedUSD.plus(_market.totalValueLockedUSD);
            totalBorrowBalanceUSD = totalBorrowBalanceUSD.plus(_market.totalBorrowBalanceUSD);
        }
        this.protocol.totalValueLockedUSD = totalValueLockedUSD;
        this.protocol.totalDepositBalanceUSD = totalValueLockedUSD;
        this.protocol.totalBorrowBalanceUSD = totalBorrowBalanceUSD;
        this.protocol.save();
    }
    //
    //
    // Update the protocol revenue
    addProtocolRevenue(protocolRevenueDelta, fee = null) {
        this.updateRevenue(protocolRevenueDelta, constants_1.BIGDECIMAL_ZERO);
        if (!fee) {
            fee = this.getOrUpdateFee(constants_1.FeeType.OTHER);
        }
        const marketRevDetails = this.getOrCreateRevenueDetail(this.market.id, true);
        const protocolRevenueDetail = this.getOrCreateRevenueDetail(this.protocol.id, false);
        this.insertInOrder(marketRevDetails, protocolRevenueDelta, fee.id);
        this.insertInOrder(protocolRevenueDetail, protocolRevenueDelta, fee.id);
    }
    //
    //
    // Update the protocol revenue
    addSupplyRevenue(supplyRevenueDelta, fee = null) {
        this.updateRevenue(constants_1.BIGDECIMAL_ZERO, supplyRevenueDelta);
        if (!fee) {
            fee = this.getOrUpdateFee(constants_1.FeeType.OTHER);
        }
        const marketRevDetails = this.getOrCreateRevenueDetail(this.market.id, true);
        const protocolRevenueDetail = this.getOrCreateRevenueDetail(this.protocol.id, false);
        this.insertInOrder(marketRevDetails, supplyRevenueDelta, fee.id);
        this.insertInOrder(protocolRevenueDetail, supplyRevenueDelta, fee.id);
    }
    updateRevenue(protocolRevenueDelta, supplyRevenueDelta) {
        const totalRevenueDelta = protocolRevenueDelta.plus(supplyRevenueDelta);
        // update market
        this.market.cumulativeTotalRevenueUSD =
            this.market.cumulativeTotalRevenueUSD.plus(totalRevenueDelta);
        this.market.cumulativeProtocolSideRevenueUSD =
            this.market.cumulativeProtocolSideRevenueUSD.plus(protocolRevenueDelta);
        this.market.cumulativeSupplySideRevenueUSD =
            this.market.cumulativeSupplySideRevenueUSD.plus(supplyRevenueDelta);
        this.market.save();
        // update protocol
        this.protocol.cumulativeTotalRevenueUSD =
            this.protocol.cumulativeTotalRevenueUSD.plus(totalRevenueDelta);
        this.protocol.cumulativeProtocolSideRevenueUSD =
            this.protocol.cumulativeProtocolSideRevenueUSD.plus(protocolRevenueDelta);
        this.protocol.cumulativeSupplySideRevenueUSD =
            this.protocol.cumulativeSupplySideRevenueUSD.plus(supplyRevenueDelta);
        this.protocol.save();
        // update revenue in snapshots
        this.snapshots.updateRevenue(protocolRevenueDelta, supplyRevenueDelta);
    }
    //
    //
    // this only updates the usage data for the entities changed in this class
    // (ie, market and protocol)
    updateUsageData(transactionType, account) {
        this.market.cumulativeUniqueUsers += (0, constants_1.activityCounter)(account, transactionType, false, 0, this.market.id);
        if (transactionType == constants_1.TransactionType.DEPOSIT) {
            this.market.cumulativeUniqueDepositors += (0, constants_1.activityCounter)(account, transactionType, true, 0, this.market.id);
            this.protocol.cumulativeUniqueDepositors += (0, constants_1.activityCounter)(account, transactionType, true, 0);
        }
        if (transactionType == constants_1.TransactionType.BORROW) {
            this.market.cumulativeUniqueBorrowers += (0, constants_1.activityCounter)(account, transactionType, true, 0, this.market.id);
            this.protocol.cumulativeUniqueBorrowers += (0, constants_1.activityCounter)(account, transactionType, true, 0);
        }
        if (transactionType == constants_1.TransactionType.LIQUIDATOR) {
            this.market.cumulativeUniqueLiquidators += (0, constants_1.activityCounter)(account, transactionType, true, 0, this.market.id);
            this.protocol.cumulativeUniqueLiquidators += (0, constants_1.activityCounter)(account, transactionType, true, 0);
        }
        if (transactionType == constants_1.TransactionType.LIQUIDATEE) {
            this.market.cumulativeUniqueLiquidatees += (0, constants_1.activityCounter)(account, transactionType, true, 0, this.market.id);
            this.protocol.cumulativeUniqueLiquidatees += (0, constants_1.activityCounter)(account, transactionType, true, 0);
        }
        if (transactionType == constants_1.TransactionType.TRANSFER)
            this.market.cumulativeUniqueTransferrers += (0, constants_1.activityCounter)(account, transactionType, true, 0, this.market.id);
        if (transactionType == constants_1.TransactionType.FLASHLOAN)
            this.market.cumulativeUniqueFlashloaners += (0, constants_1.activityCounter)(account, transactionType, true, 0, this.market.id);
        this.protocol.save();
        this.market.save();
        // update the snapshots in their respective class
        this.snapshots.updateUsageData(transactionType, account);
    }
    //
    //
    // this only updates the usage data for the entities changed in this class
    // (ie, market and protocol)
    updateTransactionData(transactionType, amount, amountUSD) {
        if (transactionType == constants_1.TransactionType.DEPOSIT) {
            this.protocol.depositCount += constants_1.INT_ONE;
            this.protocol.cumulativeDepositUSD =
                this.protocol.cumulativeDepositUSD.plus(amountUSD);
            this.market.cumulativeDepositUSD =
                this.market.cumulativeDepositUSD.plus(amountUSD);
            this.market.depositCount += constants_1.INT_ONE;
        }
        else if (transactionType == constants_1.TransactionType.WITHDRAW) {
            this.protocol.withdrawCount += constants_1.INT_ONE;
            this.market.withdrawCount += constants_1.INT_ONE;
        }
        else if (transactionType == constants_1.TransactionType.BORROW) {
            this.protocol.borrowCount += constants_1.INT_ONE;
            this.protocol.cumulativeBorrowUSD =
                this.protocol.cumulativeBorrowUSD.plus(amountUSD);
            this.market.cumulativeBorrowUSD =
                this.market.cumulativeBorrowUSD.plus(amountUSD);
            this.market.borrowCount += constants_1.INT_ONE;
        }
        else if (transactionType == constants_1.TransactionType.REPAY) {
            this.protocol.repayCount += constants_1.INT_ONE;
            this.market.repayCount += constants_1.INT_ONE;
        }
        else if (transactionType == constants_1.TransactionType.LIQUIDATE) {
            this.protocol.liquidationCount += constants_1.INT_ONE;
            this.protocol.cumulativeLiquidateUSD =
                this.protocol.cumulativeLiquidateUSD.plus(amountUSD);
            this.market.cumulativeLiquidateUSD =
                this.market.cumulativeLiquidateUSD.plus(amountUSD);
            this.market.liquidationCount += constants_1.INT_ONE;
        }
        else if (transactionType == constants_1.TransactionType.TRANSFER) {
            this.protocol.transferCount += constants_1.INT_ONE;
            this.market.cumulativeTransferUSD =
                this.market.cumulativeTransferUSD.plus(amountUSD);
            this.market.transferCount += constants_1.INT_ONE;
        }
        else if (transactionType == constants_1.TransactionType.FLASHLOAN) {
            this.protocol.flashloanCount += constants_1.INT_ONE;
            this.market.cumulativeFlashloanUSD =
                this.market.cumulativeFlashloanUSD.plus(amountUSD);
            this.market.flashloanCount += constants_1.INT_ONE;
        }
        else {
            graph_ts_1.log.error("[updateTransactionData] Invalid transaction type: {}", [
                transactionType,
            ]);
            return;
        }
        this.protocol.transactionCount += constants_1.INT_ONE;
        this.market.transactionCount += constants_1.INT_ONE;
        this.protocol.save();
        this.market.save();
        // update the snapshots in their respective class
        this.snapshots.updateTransactionData(transactionType, amount, amountUSD);
    }
    //
    //
    // Insert revenue in RevenueDetail in order (alphabetized)
    insertInOrder(details, amountUSD, associatedSource) {
        if (details.sources.length == 0) {
            details.sources = [associatedSource];
            details.amountsUSD = [amountUSD];
        }
        else {
            let sources = details.sources;
            let amountsUSD = details.amountsUSD;
            // upsert source and amount
            if (sources.includes(associatedSource)) {
                const idx = sources.indexOf(associatedSource);
                amountsUSD[idx] = amountsUSD[idx].plus(amountUSD);
                details.sources = sources;
                details.amountsUSD = amountsUSD;
            }
            else {
                sources = (0, constants_2.insert)(sources, associatedSource);
                amountsUSD = (0, constants_2.insert)(amountsUSD, amountUSD);
                // sort amounts by sources
                const sourcesSorted = sources.sort();
                let amountsUSDSorted = [];
                for (let i = 0; i < sourcesSorted.length; i++) {
                    const idx = sources.indexOf(sourcesSorted[i]);
                    amountsUSDSorted = (0, constants_2.insert)(amountsUSDSorted, amountsUSD[idx]);
                }
                details.sources = sourcesSorted;
                details.amountsUSD = amountsUSDSorted;
            }
        }
        details.save();
    }
    //
    //
    // Get list of markets in the protocol (or add new market if not in there)
    getOrAddMarketToList(marketID = null) {
        let markets = schema_1._MarketList.load(this.protocol.id);
        if (!markets) {
            markets = new schema_1._MarketList(this.protocol.id);
            markets.markets = [];
        }
        if (!marketID) {
            return markets.markets;
        }
        // check if market is already in list
        if (markets.markets.includes(marketID)) {
            return markets.markets;
        }
        // add new market and return
        const marketList = markets.markets;
        marketList.push(marketID);
        markets.markets = marketList;
        markets.save();
        return marketList;
    }
}
exports.DataManager = DataManager;
