"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TornadoCashMainnetConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
const rewards_1 = require("../../../../../src/common/rewards");
const TornadoCashERC20_1 = require("../../../../../generated/TornadoCash01/TornadoCashERC20");
const TornadoCashETH_1 = require("../../../../../generated/TornadoCash01/TornadoCashETH");
class TornadoCashMainnetConfigurations {
    getNetwork() {
        return constants_1.Network.MAINNET;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return "0x8589427373D6D84E98730D7795D8f6f8731FDA16";
    }
    getRewardIntervalType() {
        return rewards_1.RewardIntervalType.BLOCK;
    }
    getNativeToken() {
        const token = new graph_ts_1.TypedMap();
        token.set("address", "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE");
        token.set("name", "Ether");
        token.set("symbol", "ETH");
        token.set("decimals", "18");
        return token;
    }
    getRewardToken() {
        const token = new graph_ts_1.TypedMap();
        token.set("address", "0x77777FeDdddFfC19Ff86DB637967013e6C6A116C");
        token.set("name", "TornadoCash");
        token.set("symbol", "TORN");
        token.set("decimals", "18");
        return token;
    }
    getPoolDenomination(isNativeTokenPool, poolAddress) {
        if (isNativeTokenPool) {
            let contract = TornadoCashETH_1.TornadoCashETH.bind(graph_ts_1.Address.fromString(poolAddress));
            let denomination_call = contract.try_denomination();
            if (!denomination_call.reverted) {
                return denomination_call.value;
            }
        }
        else {
            let contract = TornadoCashERC20_1.TornadoCashERC20.bind(graph_ts_1.Address.fromString(poolAddress));
            let denomination_call = contract.try_denomination();
            if (!denomination_call.reverted) {
                return denomination_call.value;
            }
        }
        return graph_ts_1.BigInt.fromI32(0);
    }
}
exports.TornadoCashMainnetConfigurations = TornadoCashMainnetConfigurations;
