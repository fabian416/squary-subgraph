"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultichainPolygonConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
const numbers_1 = require("../../../../../src/common/utils/numbers");
const api_1 = require("./api");
class MultichainPolygonConfigurations {
    getNetwork() {
        return constants_1.Network.MATIC;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return "0xfa9da51631268a30ec3ddd1ccbf46c65fad99251";
    }
    getChainID() {
        const chainID = constants_1.ID_BY_NETWORK.get(this.getNetwork());
        if (!chainID) {
            graph_ts_1.log.error("[getChainID] ID_BY_NETWORK not set for network", []);
            return constants_1.BIGINT_ZERO;
        }
        return chainID;
    }
    getCrosschainID(tokenID) {
        let crosschainID = constants_1.BIGINT_ZERO;
        const key = tokenID.toLowerCase();
        const obj = graph_ts_1.json.fromString(api_1.BRIDGE_API_RESPONSE).toObject().get(key);
        if (obj) {
            crosschainID = graph_ts_1.BigInt.fromString(obj.toArray()[constants_1.INT_ZERO].toString());
        }
        else {
            graph_ts_1.log.warning("[getCrosschainID] No crosschainID for key: {}", [key]);
        }
        return crosschainID;
    }
    isWhitelistToken(tokenAddress, crosschainID) {
        const key = tokenAddress
            .toHexString()
            .toLowerCase()
            .concat(":")
            .concat(crosschainID);
        if (!graph_ts_1.json.fromString(api_1.ROUTER_API_RESPONSE).toObject().get(key)) {
            graph_ts_1.log.warning("[isWhitelistToken] Not whitelisted key: {}", [key]);
            return false;
        }
        return true;
    }
    getCrosschainTokenAddress(bridgeType, tokenID, crosschainID) {
        let crosschainToken = constants_1.ZERO_ADDRESS;
        let key;
        let obj;
        let idx;
        if (bridgeType == constants_1.BridgeType.BRIDGE) {
            key = tokenID.toLowerCase();
            obj = graph_ts_1.json.fromString(api_1.BRIDGE_API_RESPONSE).toObject().get(key);
            idx = constants_1.INT_ONE;
        }
        else {
            key = tokenID.toLowerCase().concat(":").concat(crosschainID);
            obj = graph_ts_1.json.fromString(api_1.ROUTER_API_RESPONSE).toObject().get(key);
            idx = constants_1.INT_ZERO;
        }
        if (obj) {
            crosschainToken = obj.toArray()[idx].toString();
        }
        else {
            graph_ts_1.log.warning("[getCrosschainTokenAddress] No crosschainTokenAddress for key: {}", [key]);
        }
        return graph_ts_1.Address.fromString(crosschainToken);
    }
    getBridgeFeeUSD(bridgeType, token, crosschainID, amount) {
        let feeUSD = constants_1.BIGDECIMAL_ZERO;
        let key;
        let obj;
        let idx;
        if (bridgeType == constants_1.BridgeType.BRIDGE) {
            key = token.id.toHexString().toLowerCase();
            obj = graph_ts_1.json.fromString(api_1.BRIDGE_API_RESPONSE).toObject().get(key);
            idx = constants_1.INT_TWO;
        }
        else {
            key = token.id
                .toHexString()
                .toLowerCase()
                .concat(":")
                .concat(crosschainID);
            obj = graph_ts_1.json.fromString(api_1.ROUTER_API_RESPONSE).toObject().get(key);
            idx = constants_1.INT_ONE;
        }
        if (obj) {
            const feeValues = obj.toArray()[idx].toString().split(",");
            const swapFeeRate = graph_ts_1.BigDecimal.fromString(feeValues[constants_1.INT_ZERO]);
            const minFee = graph_ts_1.BigDecimal.fromString(feeValues[constants_1.INT_ONE]);
            const maxFee = graph_ts_1.BigDecimal.fromString(feeValues[constants_1.INT_TWO]);
            let fee = (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals).times(swapFeeRate.div(constants_1.BIGDECIMAL_HUNDRED));
            if (fee.lt(minFee)) {
                fee = minFee;
            }
            else if (fee.gt(maxFee)) {
                fee = maxFee;
            }
            feeUSD = fee.times(token.lastPriceUSD);
        }
        else {
            graph_ts_1.log.warning("[getBridgeFeeUSD] No fee details for key: {}", [key]);
        }
        return feeUSD;
    }
}
exports.MultichainPolygonConfigurations = MultichainPolygonConfigurations;
