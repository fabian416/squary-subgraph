"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWithdrawn = exports.handleStaked = exports.handleRewardsPaid = void 0;
const bridge_1 = require("../../../../src/sdk/protocols/bridge");
const configure_1 = require("../../../../configurations/configure");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const index_1 = require("../../../../src/prices/index");
const numbers_1 = require("../../../../src/sdk/util/numbers");
const rewards_1 = require("../../../../src/sdk/util/rewards");
const bridge_2 = require("../../../../src/sdk/util/bridge");
const constants_1 = require("../../../../src/sdk/util/constants");
class Pricer {
    getTokenPrice(token) {
        const price = (0, index_1.getUsdPricePerToken)(graph_ts_1.Address.fromBytes(token.id));
        return price.usdPrice;
    }
    getAmountValueUSD(token, amount) {
        const _amount = (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals);
        return (0, index_1.getUsdPrice)(graph_ts_1.Address.fromBytes(token.id), _amount);
    }
}
class TokenInit {
    getTokenParams(address) {
        const tokenConfig = configure_1.NetworkConfigs.getTokenDetails(address.toHex());
        if (tokenConfig.length != constants_1.FOUR) {
            graph_ts_1.log.error("Invalid tokenConfig length", []);
        }
        const name = tokenConfig[1];
        const symbol = tokenConfig[0];
        const decimals = graph_ts_1.BigInt.fromString(tokenConfig[2]).toI32();
        return { name, symbol, decimals };
    }
}
function handleRewardsPaid(event) {
    if (!configure_1.NetworkConfigs.getRewardTokenList().includes(event.address.toHexString())) {
        graph_ts_1.log.error("Missing Config", []);
        return;
    }
    const poolAddress = configure_1.NetworkConfigs.getPoolAddressFromRewardTokenAddress(event.address.toHexString());
    const poolConfig = configure_1.NetworkConfigs.getPoolDetails(poolAddress);
    graph_ts_1.log.info("GNO RewardsPaid 1 --> poolAddress: {},", [poolAddress]);
    if (poolConfig.length != constants_1.THREE) {
        graph_ts_1.log.error("Invalid PoolConfig length", []);
        return;
    }
    const poolSymbol = poolConfig[0];
    const poolName = poolConfig[1];
    const hPoolName = poolConfig[2];
    const sdk = bridge_1.SDK.initializeFromEvent(bridge_2.conf, new Pricer(), new TokenInit(), event);
    (0, rewards_1.updateRewardsPaid)(sdk.Pools, sdk.Pools, sdk.Tokens, poolName, poolSymbol, hPoolName, poolAddress, event);
}
exports.handleRewardsPaid = handleRewardsPaid;
function handleStaked(event) {
    if (!configure_1.NetworkConfigs.getRewardTokenList().includes(event.address.toHexString())) {
        graph_ts_1.log.error("Missing Config", []);
        return;
    }
    const amount = event.params.amount;
    const poolAddress = configure_1.NetworkConfigs.getPoolAddressFromRewardTokenAddress(event.address.toHexString());
    graph_ts_1.log.info("Staked --> emitter: {}, poolAddress: {}, amount: {}", [
        event.address.toHexString(),
        poolAddress,
        amount.toString(),
    ]);
    const poolConfig = configure_1.NetworkConfigs.getPoolDetails(poolAddress);
    if (poolConfig.length != constants_1.THREE) {
        graph_ts_1.log.error("Invalid PoolConfig length", []);
        return;
    }
    graph_ts_1.log.info("Staked 1 --> poolAddress: {},", [poolAddress]);
    const poolSymbol = poolConfig[0];
    const poolName = poolConfig[1];
    const hPoolName = poolConfig[2];
    const sdk = bridge_1.SDK.initializeFromEvent(bridge_2.conf, new Pricer(), new TokenInit(), event);
    (0, rewards_1.updateStaked)(sdk.Pools, sdk.Pools, sdk.Tokens, poolName, poolSymbol, hPoolName, poolAddress, event.address.toHexString(), amount);
    sdk.Accounts.loadAccount(event.params.user);
}
exports.handleStaked = handleStaked;
function handleWithdrawn(event) {
    if (!configure_1.NetworkConfigs.getRewardTokenList().includes(event.address.toHexString())) {
        graph_ts_1.log.error("Missing Config", []);
        return;
    }
    const amount = event.params.amount;
    const poolAddress = configure_1.NetworkConfigs.getPoolAddressFromRewardTokenAddress(event.address.toHexString());
    graph_ts_1.log.info("UnStaked --> emitter: {}, poolAddress: {}, amount: {}", [
        event.address.toHexString(),
        poolAddress,
        amount.toString(),
    ]);
    const poolConfig = configure_1.NetworkConfigs.getPoolDetails(poolAddress);
    graph_ts_1.log.info("UnStaked 1 --> poolAddress: {},", [poolAddress]);
    if (poolConfig.length != constants_1.THREE) {
        graph_ts_1.log.error("Invalid PoolConfig length", []);
        return;
    }
    const poolSymbol = poolConfig[0];
    const poolName = poolConfig[1];
    const hPoolName = poolConfig[2];
    const sdk = bridge_1.SDK.initializeFromEvent(bridge_2.conf, new Pricer(), new TokenInit(), event);
    (0, rewards_1.updateWithdrawn)(sdk.Pools, sdk.Pools, sdk.Tokens, poolName, poolSymbol, hPoolName, poolAddress, event.address.toHexString(), amount);
    sdk.Accounts.loadAccount(event.params.user);
}
exports.handleWithdrawn = handleWithdrawn;
