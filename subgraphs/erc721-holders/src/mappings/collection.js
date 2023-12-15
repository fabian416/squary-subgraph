"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ERC721_1 = require("../../generated/ERC721/ERC721");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const account_1 = require("./account");
const token_1 = require("./token");
function handleTransfer(event) {
    let from = event.params.from.toHex();
    let to = event.params.to.toHex();
    if (from == constants_1.GENESIS_ADDRESS && to == constants_1.GENESIS_ADDRESS) {
        // skip if the transfer is from zero address to zero address
        return;
    }
    // determine whether this transfer is related with ERC721 collection
    let tokenId = event.params.id;
    let id = event.address.toHex() + "-" + tokenId.toString();
    let collectionId = event.address.toHex();
    let contract = ERC721_1.ERC721.bind(event.address);
    let tokenCollection = schema_1.Collection.load(collectionId);
    if (tokenCollection == null) {
        // check whether this collection has already been verified to be non-ERC721 contract to avoid to make contract calls again.
        let previousNonERC721Collection = schema_1.NonERC721Collection.load(collectionId);
        if (previousNonERC721Collection != null) {
            return;
        }
        if (!isERC721Supported(contract)) {
            let newNonERC721Collection = new schema_1.NonERC721Collection(collectionId);
            newNonERC721Collection.save();
            return;
        }
        let supportsERC721Metadata = supportsInterface(contract, "5b5e139f");
        tokenCollection = getOrCreateCollection(contract, collectionId, supportsERC721Metadata);
    }
    // update metrics on the sender side
    let currentOwner = (0, account_1.getOrCreateAccount)(from);
    if (from == constants_1.GENESIS_ADDRESS) {
        // mint a new token
        tokenCollection.tokenCount = tokenCollection.tokenCount.plus(constants_1.BIGINT_ONE);
    }
    else {
        // transfer an existing token from non-zero address
        let currentAccountBalanceId = from + "-" + collectionId;
        let currentAccountBalance = schema_1.AccountBalance.load(currentAccountBalanceId);
        if (currentAccountBalance != null) {
            currentAccountBalance.tokenCount = currentAccountBalance.tokenCount.minus(constants_1.BIGINT_ONE);
            currentAccountBalance.blockNumber = event.block.number;
            currentAccountBalance.timestamp = event.block.timestamp;
            currentAccountBalance.save();
            if (currentAccountBalance.tokenCount.equals(constants_1.BIGINT_ZERO)) {
                tokenCollection.ownerCount = tokenCollection.ownerCount.minus(constants_1.BIGINT_ONE);
            }
            // provide information about evolution of account balances
            (0, account_1.updateAccountBalanceDailySnapshot)(currentAccountBalance, event);
        }
        if (currentOwner != null) {
            currentOwner.tokenCount = currentOwner.tokenCount.minus(constants_1.BIGINT_ONE);
        }
    }
    currentOwner.save();
    // update metrics on the receiver side
    if (to == constants_1.GENESIS_ADDRESS) {
        // burn an existing token
        graph_ts_1.store.remove("Token", id);
        tokenCollection.tokenCount = tokenCollection.tokenCount.minus(constants_1.BIGINT_ONE);
    }
    else {
        // transfer a new or existing token to non-zero address
        let newOwner = (0, account_1.getOrCreateAccount)(to);
        newOwner.tokenCount = newOwner.tokenCount.plus(constants_1.BIGINT_ONE);
        newOwner.save();
        let token = (0, token_1.getOrCreateToken)(contract, tokenCollection, tokenId, event.block.timestamp);
        token.owner = newOwner.id;
        token.save();
        let newAccountBalance = (0, account_1.getOrCreateAccountBalance)(to, collectionId);
        newAccountBalance.tokenCount = newAccountBalance.tokenCount.plus(constants_1.BIGINT_ONE);
        newAccountBalance.blockNumber = event.block.number;
        newAccountBalance.timestamp = event.block.timestamp;
        newAccountBalance.save();
        if (newAccountBalance.tokenCount.equals(constants_1.BIGINT_ONE)) {
            tokenCollection.ownerCount = tokenCollection.ownerCount.plus(constants_1.BIGINT_ONE);
        }
        // provide information about evolution of account balances
        (0, account_1.updateAccountBalanceDailySnapshot)(newAccountBalance, event);
    }
    // update aggregate data for sender and receiver
    tokenCollection.transferCount = tokenCollection.transferCount.plus(constants_1.BIGINT_ONE);
    tokenCollection.save();
    let dailySnapshot = getOrCreateCollectionDailySnapshot(tokenCollection, event.block);
    dailySnapshot.dailyTransferCount += 1;
    dailySnapshot.save();
    createTransfer(event).save();
}
exports.handleTransfer = handleTransfer;
function supportsInterface(contract, interfaceId, expected = true) {
    let supports = contract.try_supportsInterface(graph_ts_1.Bytes.fromHexString(interfaceId));
    return !supports.reverted && supports.value == expected;
}
function isERC721Supported(contract) {
    let supportsERC165Identifier = supportsInterface(contract, "01ffc9a7");
    if (!supportsERC165Identifier) {
        return false;
    }
    let supportsERC721Identifier = supportsInterface(contract, "80ac58cd");
    if (!supportsERC721Identifier) {
        return false;
    }
    let supportsNullIdentifierFalse = supportsInterface(contract, "00000000", false);
    if (!supportsNullIdentifierFalse) {
        return false;
    }
    return true;
}
function getOrCreateCollection(contract, CollectionAddress, supportsERC721Metadata) {
    let previousTokenCollection = schema_1.Collection.load(CollectionAddress);
    if (previousTokenCollection != null) {
        return previousTokenCollection;
    }
    let tokenCollection = new schema_1.Collection(CollectionAddress);
    tokenCollection.supportsERC721Metadata = supportsERC721Metadata;
    tokenCollection.tokenCount = constants_1.BIGINT_ZERO;
    tokenCollection.ownerCount = constants_1.BIGINT_ZERO;
    tokenCollection.transferCount = constants_1.BIGINT_ZERO;
    let name = contract.try_name();
    if (!name.reverted) {
        tokenCollection.name = (0, token_1.normalize)(name.value);
    }
    let symbol = contract.try_symbol();
    if (!symbol.reverted) {
        tokenCollection.symbol = (0, token_1.normalize)(symbol.value);
    }
    return tokenCollection;
}
function getOrCreateCollectionDailySnapshot(collection, block) {
    let snapshotId = collection.id +
        "-" +
        (block.timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString();
    let previousSnapshot = schema_1.CollectionDailySnapshot.load(snapshotId);
    if (previousSnapshot != null) {
        return previousSnapshot;
    }
    let newSnapshot = new schema_1.CollectionDailySnapshot(snapshotId);
    newSnapshot.collection = collection.id;
    newSnapshot.tokenCount = collection.tokenCount;
    newSnapshot.ownerCount = collection.ownerCount;
    newSnapshot.dailyTransferCount = 0;
    newSnapshot.blockNumber = block.number;
    newSnapshot.timestamp = block.timestamp;
    return newSnapshot;
}
function createTransfer(event) {
    let transfer = new schema_1.Transfer(event.address.toHex() +
        "-" +
        event.transaction.hash.toHex() +
        "-" +
        event.logIndex.toString());
    transfer.hash = event.transaction.hash.toHex();
    transfer.logIndex = event.logIndex.toI32();
    transfer.collection = event.address.toHex();
    transfer.nonce = event.transaction.nonce.toI32();
    transfer.tokenId = event.params.id;
    transfer.from = event.params.from.toHex();
    transfer.to = event.params.to.toHex();
    transfer.blockNumber = event.block.number;
    transfer.timestamp = event.block.timestamp;
    return transfer;
}
