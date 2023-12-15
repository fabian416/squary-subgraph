"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMint = exports.handleBurn = exports.handleTransfer = void 0;
const ERC20_1 = require("../../generated/templates/StandardToken/ERC20");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const account_1 = require("./account");
function handleTransfer(event) {
    let token = schema_1.Token.load(event.address.toHex());
    if (token != null) {
        if (token.name == "") {
            let erc20 = ERC20_1.ERC20.bind(event.address);
            let tokenName = erc20.try_name();
            let tokenSymbol = erc20.try_symbol();
            let tokenDecimals = erc20.try_decimals();
            token.name = tokenName.reverted ? "" : tokenName.value;
            token.symbol = tokenSymbol.reverted ? "" : tokenSymbol.value;
            token.decimals = tokenDecimals.reverted
                ? constants_1.DEFAULT_DECIMALS
                : tokenDecimals.value;
            token.totalSupply = constants_1.BIGINT_ZERO;
        }
        if (event.params.value == constants_1.BIGINT_ZERO) {
            return;
        }
        let amount = event.params.value;
        let isBurn = event.params.to.toHex() == constants_1.GENESIS_ADDRESS;
        let isMint = event.params.from.toHex() == constants_1.GENESIS_ADDRESS;
        let isTransfer = !isBurn && !isMint;
        let isEventProcessed = false;
        if (isBurn) {
            isEventProcessed = handleBurnEvent(token, amount, event.params.from, event);
        }
        else if (isMint) {
            isEventProcessed = handleMintEvent(token, amount, event.params.to, event);
        }
        else {
            // In this case, it will be a normal transfer event.
            handleTransferEvent(token, amount, event.params.from, event.params.to, event);
        }
        // Updates balances of accounts
        if (isEventProcessed) {
            return;
        }
        if (isTransfer || isBurn) {
            let sourceAccount = (0, account_1.getOrCreateAccount)(event.params.from);
            let accountBalance = (0, account_1.decreaseAccountBalance)(sourceAccount, token, amount);
            accountBalance.blockNumber = event.block.number;
            accountBalance.timestamp = event.block.timestamp;
            sourceAccount.save();
            accountBalance.save();
            // To provide information about evolution of account balances
            (0, account_1.updateAccountBalanceDailySnapshot)(accountBalance, event);
        }
        if (isTransfer || isMint) {
            let destinationAccount = (0, account_1.getOrCreateAccount)(event.params.to);
            let accountBalance = (0, account_1.increaseAccountBalance)(destinationAccount, token, amount);
            accountBalance.blockNumber = event.block.number;
            accountBalance.timestamp = event.block.timestamp;
            destinationAccount.save();
            accountBalance.save();
            // To provide information about evolution of account balances
            (0, account_1.updateAccountBalanceDailySnapshot)(accountBalance, event);
        }
    }
}
exports.handleTransfer = handleTransfer;
function handleBurn(event) {
    let token = schema_1.Token.load(event.address.toHex());
    if (token != null) {
        let amount = event.params.value;
        let isEventProcessed = handleBurnEvent(token, amount, event.params.burner, event);
        if (isEventProcessed) {
            return;
        }
        // Update source account balance
        let account = (0, account_1.getOrCreateAccount)(event.params.burner);
        let accountBalance = (0, account_1.decreaseAccountBalance)(account, token, amount);
        accountBalance.blockNumber = event.block.number;
        accountBalance.timestamp = event.block.timestamp;
        account.save();
        accountBalance.save();
        // To provide information about evolution of account balances
        (0, account_1.updateAccountBalanceDailySnapshot)(accountBalance, event);
    }
}
exports.handleBurn = handleBurn;
function handleMint(event) {
    let token = schema_1.Token.load(event.address.toHex());
    if (token != null) {
        let amount = event.params.amount;
        let isEventProcessed = handleMintEvent(token, amount, event.params.to, event);
        if (isEventProcessed) {
            return;
        }
        // Update destination account balance
        let account = (0, account_1.getOrCreateAccount)(event.params.to);
        let accountBalance = (0, account_1.increaseAccountBalance)(account, token, amount);
        accountBalance.blockNumber = event.block.number;
        accountBalance.timestamp = event.block.timestamp;
        account.save();
        accountBalance.save();
        // To provide information about evolution of account balances
        (0, account_1.updateAccountBalanceDailySnapshot)(accountBalance, event);
    }
}
exports.handleMint = handleMint;
function handleBurnEvent(token, amount, burner, event) {
    // Track total supply/burned
    if (token != null) {
        let totalSupply = ERC20_1.ERC20.bind(event.address).try_totalSupply();
        let currentTotalSupply = totalSupply.reverted
            ? token.totalSupply
            : totalSupply.value;
        //If the totalSupply from contract call equals with the totalSupply stored in token entity, it means the burn event was process before.
        //It happens when the transfer function which transfers to GENESIS_ADDRESS emits both transfer event and burn event.
        if (currentTotalSupply == token.totalSupply) {
            return true;
        }
        token.totalSupply = token.totalSupply.minus(amount);
        token.burnCount = token.burnCount.plus(constants_1.BIGINT_ONE);
        token.totalBurned = token.totalBurned.plus(amount);
        let dailySnapshot = getOrCreateTokenDailySnapshot(token, event.block);
        dailySnapshot.dailyTotalSupply = token.totalSupply;
        dailySnapshot.dailyEventCount += 1;
        dailySnapshot.dailyBurnCount += 1;
        dailySnapshot.dailyBurnAmount = dailySnapshot.dailyBurnAmount.plus(amount);
        dailySnapshot.blockNumber = event.block.number;
        dailySnapshot.timestamp = event.block.timestamp;
        let hourlySnapshot = getOrCreateTokenHourlySnapshot(token, event.block);
        hourlySnapshot.hourlyTotalSupply = token.totalSupply;
        hourlySnapshot.hourlyEventCount += 1;
        hourlySnapshot.hourlyBurnCount += 1;
        hourlySnapshot.hourlyBurnAmount =
            hourlySnapshot.hourlyBurnAmount.plus(amount);
        hourlySnapshot.blockNumber = event.block.number;
        hourlySnapshot.timestamp = event.block.timestamp;
        token.save();
        dailySnapshot.save();
        hourlySnapshot.save();
    }
    return false;
}
function handleMintEvent(token, amount, destination, event) {
    // Track total token supply/minted
    if (token != null) {
        let totalSupply = ERC20_1.ERC20.bind(event.address).try_totalSupply();
        let currentTotalSupply = totalSupply.reverted
            ? token.totalSupply
            : totalSupply.value;
        //If the totalSupply from contract call equals with the totalSupply stored in token entity, it means the mint event was process before.
        //It happens when the transfer function which transfers from GENESIS_ADDRESS emits both transfer event and mint event.
        if (currentTotalSupply == token.totalSupply) {
            return true;
        }
        token.totalSupply = token.totalSupply.plus(amount);
        token.mintCount = token.mintCount.plus(constants_1.BIGINT_ONE);
        token.totalMinted = token.totalMinted.plus(amount);
        let dailySnapshot = getOrCreateTokenDailySnapshot(token, event.block);
        dailySnapshot.dailyTotalSupply = token.totalSupply;
        dailySnapshot.dailyEventCount += 1;
        dailySnapshot.dailyMintCount += 1;
        dailySnapshot.dailyMintAmount = dailySnapshot.dailyMintAmount.plus(amount);
        dailySnapshot.blockNumber = event.block.number;
        dailySnapshot.timestamp = event.block.timestamp;
        let hourlySnapshot = getOrCreateTokenHourlySnapshot(token, event.block);
        hourlySnapshot.hourlyTotalSupply = token.totalSupply;
        hourlySnapshot.hourlyEventCount += 1;
        hourlySnapshot.hourlyMintCount += 1;
        hourlySnapshot.hourlyMintAmount =
            hourlySnapshot.hourlyMintAmount.plus(amount);
        hourlySnapshot.blockNumber = event.block.number;
        hourlySnapshot.timestamp = event.block.timestamp;
        token.save();
        dailySnapshot.save();
        hourlySnapshot.save();
    }
    return false;
}
function handleTransferEvent(token, amount, source, destination, event) {
    let transferEvent = new schema_1.TransferEvent(event.address.toHex() +
        "-" +
        event.transaction.hash.toHex() +
        "-" +
        event.logIndex.toString());
    transferEvent.hash = event.transaction.hash.toHex();
    transferEvent.logIndex = event.logIndex.toI32();
    transferEvent.token = event.address.toHex();
    transferEvent.nonce = event.transaction.nonce.toI32();
    transferEvent.amount = amount;
    transferEvent.to = destination.toHex();
    transferEvent.from = source.toHex();
    transferEvent.blockNumber = event.block.number;
    transferEvent.timestamp = event.block.timestamp;
    transferEvent.save();
    // Track total token transferred
    if (token != null) {
        let FromBalanceToZeroNum = constants_1.BIGINT_ZERO;
        let balance = (0, account_1.getOrCreateAccountBalance)((0, account_1.getOrCreateAccount)(source), token);
        if (balance.amount == amount) {
            // It means the sender's token balance will be 0 after transferal.
            FromBalanceToZeroNum = constants_1.BIGINT_ONE;
        }
        let toAddressIsNewHolderNum = constants_1.BIGINT_ZERO;
        let toBalanceIsZeroNum = constants_1.BIGINT_ZERO;
        if ((0, account_1.isNewAccount)(destination)) {
            // It means the receiver is a new holder
            toAddressIsNewHolderNum = constants_1.BIGINT_ONE;
        }
        else {
            balance = (0, account_1.getOrCreateAccountBalance)((0, account_1.getOrCreateAccount)(destination), token);
            if (balance.amount == constants_1.BIGINT_ONE) {
                // It means the receiver's token balance is 0 before transferal.
                toBalanceIsZeroNum = constants_1.BIGINT_ONE;
            }
        }
        token.currentHolderCount = token.currentHolderCount
            .minus(FromBalanceToZeroNum)
            .plus(toAddressIsNewHolderNum)
            .plus(toBalanceIsZeroNum);
        token.cumulativeHolderCount = token.cumulativeHolderCount.plus(toAddressIsNewHolderNum);
        token.transferCount = token.transferCount.plus(constants_1.BIGINT_ONE);
        let dailySnapshot = getOrCreateTokenDailySnapshot(token, event.block);
        dailySnapshot.currentHolderCount = dailySnapshot.currentHolderCount
            .minus(FromBalanceToZeroNum)
            .plus(toAddressIsNewHolderNum)
            .plus(toBalanceIsZeroNum);
        dailySnapshot.cumulativeHolderCount =
            dailySnapshot.cumulativeHolderCount.plus(toAddressIsNewHolderNum);
        dailySnapshot.dailyEventCount += 1;
        dailySnapshot.dailyTransferCount += 1;
        dailySnapshot.dailyTransferAmount =
            dailySnapshot.dailyTransferAmount.plus(amount);
        dailySnapshot.blockNumber = event.block.number;
        dailySnapshot.timestamp = event.block.timestamp;
        let hourlySnapshot = getOrCreateTokenHourlySnapshot(token, event.block);
        hourlySnapshot.currentHolderCount = hourlySnapshot.currentHolderCount
            .minus(FromBalanceToZeroNum)
            .plus(toAddressIsNewHolderNum)
            .plus(toBalanceIsZeroNum);
        hourlySnapshot.cumulativeHolderCount =
            hourlySnapshot.cumulativeHolderCount.plus(toAddressIsNewHolderNum);
        hourlySnapshot.hourlyEventCount += 1;
        hourlySnapshot.hourlyTransferCount += 1;
        hourlySnapshot.hourlyTransferAmount =
            hourlySnapshot.hourlyTransferAmount.plus(amount);
        hourlySnapshot.blockNumber = event.block.number;
        hourlySnapshot.timestamp = event.block.timestamp;
        token.save();
        dailySnapshot.save();
        hourlySnapshot.save();
    }
    return transferEvent;
}
function getOrCreateTokenDailySnapshot(token, block) {
    let snapshotId = token.id + "-" + (block.timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString();
    let previousSnapshot = schema_1.TokenDailySnapshot.load(snapshotId);
    if (previousSnapshot != null) {
        return previousSnapshot;
    }
    let newSnapshot = new schema_1.TokenDailySnapshot(snapshotId);
    newSnapshot.token = token.id;
    newSnapshot.dailyTotalSupply = token.totalSupply;
    newSnapshot.currentHolderCount = token.currentHolderCount;
    newSnapshot.cumulativeHolderCount = token.cumulativeHolderCount;
    newSnapshot.dailyEventCount = 0;
    newSnapshot.dailyTransferCount = 0;
    newSnapshot.dailyTransferAmount = constants_1.BIGINT_ZERO;
    newSnapshot.dailyMintCount = 0;
    newSnapshot.dailyMintAmount = constants_1.BIGINT_ZERO;
    newSnapshot.dailyBurnCount = 0;
    newSnapshot.dailyBurnAmount = constants_1.BIGINT_ZERO;
    return newSnapshot;
}
function getOrCreateTokenHourlySnapshot(token, block) {
    let snapshotId = token.id + "-" + (block.timestamp.toI64() / constants_1.SECONDS_PER_HOUR).toString();
    let previousSnapshot = schema_1.TokenHourlySnapshot.load(snapshotId);
    if (previousSnapshot != null) {
        return previousSnapshot;
    }
    let newSnapshot = new schema_1.TokenHourlySnapshot(snapshotId);
    newSnapshot.token = token.id;
    newSnapshot.hourlyTotalSupply = token.totalSupply;
    newSnapshot.currentHolderCount = token.currentHolderCount;
    newSnapshot.cumulativeHolderCount = token.cumulativeHolderCount;
    newSnapshot.hourlyEventCount = 0;
    newSnapshot.hourlyTransferCount = 0;
    newSnapshot.hourlyTransferAmount = constants_1.BIGINT_ZERO;
    newSnapshot.hourlyMintCount = 0;
    newSnapshot.hourlyMintAmount = constants_1.BIGINT_ZERO;
    newSnapshot.hourlyBurnCount = 0;
    newSnapshot.hourlyBurnAmount = constants_1.BIGINT_ZERO;
    return newSnapshot;
}
