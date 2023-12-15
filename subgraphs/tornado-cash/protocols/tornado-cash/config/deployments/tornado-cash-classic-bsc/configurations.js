"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TornadoCashBscConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
const rewards_1 = require("../../../../../src/common/rewards");
const TornadoCashERC20_1 = require("../../../../../generated/TornadoCash01/TornadoCashERC20");
const TornadoCashBNB_1 = require("../../../../../generated/TornadoCash01/TornadoCashBNB");
class TornadoCashBscConfigurations {
    getNetwork() {
        return constants_1.Network.BSC;
    }
    getProtocolName() {
        return constants_1.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_1.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return "0xce0042B868300000d44A59004Da54A005ffdcf9f";
    }
    getRewardIntervalType() {
        return rewards_1.RewardIntervalType.BLOCK;
    }
    getNativeToken() {
        const token = new graph_ts_1.TypedMap();
        token.set("address", "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c");
        token.set("name", "BNB");
        token.set("symbol", "BNB");
        token.set("decimals", "18");
        return token;
    }
    getRewardToken() {
        const token = new graph_ts_1.TypedMap();
        token.set("address", "0x1ba8d3c4c219b124d351f603060663bd1bcd9bbf");
        token.set("name", "TornadoCash");
        token.set("symbol", "TORN");
        token.set("decimals", "18");
        return token;
    }
    getPoolDenomination(isNativeTokenPool, poolAddress) {
        if (isNativeTokenPool) {
            let contract = TornadoCashBNB_1.TornadoCashBNB.bind(graph_ts_1.Address.fromString(poolAddress));
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
exports.TornadoCashBscConfigurations = TornadoCashBscConfigurations;
