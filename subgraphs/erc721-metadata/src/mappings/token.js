"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTokenMetadata = exports.createToken = exports.normalize = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
function normalize(strValue) {
    if (strValue.length == 1 && strValue.charCodeAt(0) == 0) {
        return "";
    }
    for (let i = 0; i < strValue.length; i++) {
        if (strValue.charCodeAt(i) == 0) {
            // graph-node database does not support string with '\u0000'
            strValue = strValue.substr(0, i) + "\ufffd" + strValue.substr(i + 1);
        }
    }
    return strValue.trim();
}
exports.normalize = normalize;
function createToken(event, contract, tokenCollection, tokenId) {
    let contractTokenId = tokenCollection.id + "-" + tokenId.toString();
    let newToken = new schema_1.Token(contractTokenId);
    newToken.collection = tokenCollection.id;
    newToken.tokenId = tokenId;
    newToken.blockNumber = event.block.number;
    newToken.timestamp = event.block.timestamp;
    let metadataURI = contract.try_tokenURI(tokenId);
    if (!metadataURI.reverted) {
        newToken.tokenURI = normalize(metadataURI.value);
        return updateTokenMetadata(event, newToken);
    }
    return newToken;
}
exports.createToken = createToken;
function updateTokenMetadata(event, token) {
    if (token.tokenURI == null) {
        return token;
    }
    let tokenURI = token.tokenURI;
    // Retrieve and parse the metadata if tokenURI indicates the token metadata stores in IPFS.
    let index1 = tokenURI.lastIndexOf(constants_1.IPFS_SLASH);
    let index2 = tokenURI.lastIndexOf(constants_1.IPFS_PREFIX);
    if (index1 < 0 && index2 < 0) {
        return token;
    }
    let hash = "";
    if (index1 >= 0) {
        hash = tokenURI.substr(index1 + constants_1.IPFS_SLASH_LEN);
    }
    else if (index2 >= 0) {
        hash = tokenURI.substr(index2 + constants_1.IPFS_PREFIX_LEN);
    }
    if (hash.length == 0) {
        return token;
    }
    let data = graph_ts_1.ipfs.cat(hash);
    if (!data) {
        return token;
    }
    let dataJson = graph_ts_1.json.try_fromBytes(data);
    if (dataJson.isError || !dataJson.isOk) {
        return token;
    }
    let dataObject = valueToObject(dataJson.value);
    if (dataObject == null) {
        graph_ts_1.log.warning("invalid metadata json, token id: {}, hash: {}, tx: {}", [
            token.id,
            hash,
            event.transaction.hash.toHexString(),
        ]);
        return token;
    }
    // Parse the token metadata according to OpenSea metadata standards.
    token.imageURI = valueToString(dataObject.get("image"));
    token.externalURI = valueToString(dataObject.get("external_url"));
    token.description = valueToString(dataObject.get("description"));
    token.name = valueToString(dataObject.get("name"));
    token.backgroundColor = valueToString(dataObject.get("background_color"));
    token.animationURI = valueToString(dataObject.get("animation_url"));
    token.youtubeURI = valueToString(dataObject.get("youtube_url"));
    let attributes = valueToArray(dataObject.get("attributes"));
    for (let i = 0; i < attributes.length; i++) {
        let item = valueToObject(attributes[i]);
        if (item == null) {
            graph_ts_1.log.warning("invalid attributes field, token id: {}, hash: {}, tx: {}", [
                token.id,
                hash,
                event.transaction.hash.toHexString(),
            ]);
            continue;
        }
        let trait = valueToString(item.get("trait_type"));
        if (trait == null) {
            continue;
        }
        let valueJson = item.get("value");
        let valueString = null;
        if (valueJson == null) {
            valueString = null;
        }
        else if (valueJson.kind == graph_ts_1.JSONValueKind.STRING) {
            valueString = valueJson.toString();
        }
        else if (valueJson.kind == graph_ts_1.JSONValueKind.NUMBER) {
            valueString = valueJson.toF64().toString();
        }
        else if (valueJson.kind == graph_ts_1.JSONValueKind.BOOL) {
            valueString = valueJson.toBool().toString();
        }
        let maxValueJson = item.get("max_value");
        let maxValueString = null;
        if (maxValueJson == null) {
            maxValueString = null;
        }
        else if (maxValueJson.kind == graph_ts_1.JSONValueKind.STRING) {
            maxValueString = maxValueJson.toString();
        }
        else if (maxValueJson.kind == graph_ts_1.JSONValueKind.NUMBER) {
            maxValueString = maxValueJson.toF64().toString();
        }
        let attribute = new schema_1.Attribute(token.id + "-" + trait);
        attribute.collection = token.collection;
        attribute.tokenId = token.tokenId;
        attribute.token = token.id;
        attribute.traitType = trait;
        attribute.value = valueString;
        attribute.maxValue = maxValueString;
        attribute.displayType = valueToString(item.get("display_type"));
        attribute.save();
    }
    return token;
}
exports.updateTokenMetadata = updateTokenMetadata;
function valueToString(value) {
    if (value != null && value.kind == graph_ts_1.JSONValueKind.STRING) {
        return value.toString();
    }
    else {
        return null;
    }
}
function valueToArray(value) {
    if (value != null && value.kind == graph_ts_1.JSONValueKind.ARRAY) {
        return value.toArray();
    }
    else {
        return [];
    }
}
function valueToObject(value) {
    // Decode JSON object
    if (value.kind == graph_ts_1.JSONValueKind.OBJECT) {
        return value.toObject();
        // Decode JSON object (as an array)
    }
    else if (value.kind == graph_ts_1.JSONValueKind.ARRAY) {
        let arrayValue = valueToArray(value);
        if (arrayValue.length == 1 && arrayValue[0].kind == graph_ts_1.JSONValueKind.OBJECT) {
            return arrayValue[0].toObject();
        }
    }
    return null;
}
