"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ERC721_1 = require("../../generated/ERC721/ERC721");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
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
    let contract = ERC721_1.ERC721.bind(event.address);
    let collectionId = event.address.toHex();
    let tokenCollection = schema_1.Collection.load(collectionId);
    if (tokenCollection == null) {
        // check whether the collection has already been verified to be non-ERC721 contract to avoid to make contract calls again.
        let previousNonERC721Collection = schema_1.NonERC721Collection.load(collectionId);
        if (previousNonERC721Collection != null) {
            return;
        }
        if (!isERC721Supported(contract)) {
            let newNonERC721Collection = new schema_1.NonERC721Collection(collectionId);
            newNonERC721Collection.save();
            return;
        }
        // Save info for the ERC721 collection
        let supportsERC721Metadata = supportsInterface(contract, "5b5e139f");
        tokenCollection = new schema_1.Collection(collectionId);
        tokenCollection.supportsERC721Metadata = supportsERC721Metadata;
        tokenCollection.tokenURIUpdated = false;
        tokenCollection.tokenCount = constants_1.BIGINT_ZERO;
        tokenCollection.save();
    }
    // Only if the collection supports ERC721 metadata, the detailed token metadata information will be stored.
    if (!tokenCollection.supportsERC721Metadata) {
        return;
    }
    let existingToken = schema_1.Token.load(tokenCollection.id + "-" + tokenId.toString());
    if (existingToken == null) {
        // Store metadata for the specific tokenId.
        let currentToken = (0, token_1.createToken)(event, contract, tokenCollection, tokenId);
        currentToken.save();
        tokenCollection.tokenCount = tokenCollection.tokenCount.plus(constants_1.BIGINT_ONE);
        tokenCollection.save();
        return;
    }
    // previousToken isn't null which means the metadata for the tokenId was stored before.
    // So check whether the tokenURI has changed to decide whether the metadata need to be updated.
    let metadataURI = contract.try_tokenURI(tokenId);
    if (!metadataURI.reverted) {
        let tokenURI = (0, token_1.normalize)(metadataURI.value);
        if (tokenURI.length > 0 && tokenURI != existingToken.tokenURI) {
            tokenCollection.tokenURIUpdated = true;
            tokenCollection.save();
            existingToken.tokenURI = tokenURI;
            existingToken = (0, token_1.updateTokenMetadata)(event, existingToken);
            existingToken.blockNumber = event.block.number;
            existingToken.timestamp = event.block.timestamp;
            existingToken.save();
        }
    }
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
