"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = exports.initTokenList = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const templates_1 = require("../../generated/templates");
const constants_1 = require("../common/constants");
function initTokenList(event) {
    graph_ts_1.log.debug("Initializing token registry, block={}", [
        event.block.number.toString(),
    ]);
    graph_ts_1.ipfs.mapJSON(constants_1.REGISTRY_HASH, "createToken", graph_ts_1.Value.fromString(""));
}
exports.initTokenList = initTokenList;
function createToken(value, userData) {
    let rawData = value.toArray();
    let address = rawData[0].isNull() ? "" : rawData[0].toString();
    let symbol = rawData[1].isNull() ? "" : rawData[1].toString();
    if (address != null) {
        let contractAddress = graph_ts_1.Address.fromString(address);
        // Persist token data if it didn't exist
        let token = schema_1.Token.load(contractAddress.toHex());
        if (token == null) {
            token = new schema_1.Token(contractAddress.toHex());
            token.name = "";
            token.symbol = symbol;
            token.decimals = constants_1.DEFAULT_DECIMALS;
            token.currentHolderCount = constants_1.BIGINT_ZERO;
            token.cumulativeHolderCount = constants_1.BIGINT_ZERO;
            token.transferCount = constants_1.BIGINT_ZERO;
            token.mintCount = constants_1.BIGINT_ZERO;
            token.burnCount = constants_1.BIGINT_ZERO;
            token.totalSupply = constants_1.BIGINT_ZERO;
            token.totalBurned = constants_1.BIGINT_ZERO;
            token.totalMinted = constants_1.BIGINT_ZERO;
            graph_ts_1.log.debug("Adding token to registry, symbol: {}, address: {}", [
                token.symbol,
                token.id,
            ]);
            token.save();
            // Start indexing token events
            templates_1.StandardToken.create(contractAddress);
            templates_1.BurnableToken.create(contractAddress);
            templates_1.MintableToken.create(contractAddress);
        }
        else {
            graph_ts_1.log.warning("Token {} already in registry", [contractAddress.toHex()]);
        }
    }
}
exports.createToken = createToken;
