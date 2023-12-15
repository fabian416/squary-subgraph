"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateToken = exports.normalize = void 0;
const schema_1 = require("../../generated/schema");
function normalize(strValue) {
    if (strValue.length == 1 && strValue.charCodeAt(0) == 0) {
        return "";
    }
    for (let i = 0; i < strValue.length; i++) {
        if (strValue.charCodeAt(i) == 0) {
            // graph-node db does not support string with '\u0000'
            strValue = strValue.substr(0, i) + "\ufffd" + strValue.substr(i + 1);
        }
    }
    return strValue;
}
exports.normalize = normalize;
function getOrCreateToken(contract, tokenCollection, tokenId, timestamp) {
    let contractTokenId = tokenCollection.id + "-" + tokenId.toString();
    let existingToken = schema_1.Token.load(contractTokenId);
    if (existingToken != null) {
        return existingToken;
    }
    let newToken = new schema_1.Token(contractTokenId);
    newToken.collection = tokenCollection.id;
    newToken.tokenID = tokenId;
    newToken.mintTime = timestamp;
    if (tokenCollection.supportsERC721Metadata) {
        let metadataURI = contract.try_tokenURI(tokenId);
        if (!metadataURI.reverted) {
            newToken.tokenURI = normalize(metadataURI.value);
        }
    }
    return newToken;
}
exports.getOrCreateToken = getOrCreateToken;
