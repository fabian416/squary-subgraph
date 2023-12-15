"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBurn = exports.handleMint = exports.handleSwapIn = exports.handleSwapOut = exports.handleUnstakeForTimeRewards = exports.handleUnstakeForBlockRewards = exports.handleStakeForTimeRewards = exports.handleStakeForBlockRewards = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const helpers_1 = require("./helpers");
const versions_1 = require("../versions");
const prices_1 = require("../prices");
const constants_1 = require("../common/constants");
const configure_1 = require("../../configurations/configure");
const numbers_1 = require("../sdk/util/numbers");
const config_1 = require("../sdk/protocols/bridge/config");
const bridge_1 = require("../sdk/protocols/bridge");
const enums_1 = require("../sdk/protocols/bridge/enums");
const constants_2 = require("../sdk/util/constants");
const chainIds_1 = require("../sdk/protocols/bridge/chainIds");
const rewards_1 = require("../sdk/util/rewards");
const Pool_1 = require("../../generated/LPStaking_0/Pool");
const templates_1 = require("../../generated/templates");
const LPStaking_1 = require("../../generated/LPStaking_0/LPStaking");
const LPStakingTime_1 = require("../../generated/LPStaking_0/LPStakingTime");
const _ERC20_1 = require("../../generated/LPStaking_0/_ERC20");
const conf = new config_1.BridgeConfig(configure_1.NetworkConfigs.getFactoryAddress(), configure_1.NetworkConfigs.getProtocolName(), configure_1.NetworkConfigs.getProtocolSlug(), enums_1.BridgePermissionType.PRIVATE, versions_1.Versions);
class Pricer {
    getTokenPrice(token) {
        const pricedToken = token._underlying
            ? graph_ts_1.Address.fromBytes(token._underlying)
            : graph_ts_1.Address.fromBytes(token.id);
        return (0, prices_1.getUsdPricePerToken)(pricedToken).usdPrice;
    }
    getAmountValueUSD(token, amount) {
        const pricedToken = token._underlying
            ? graph_ts_1.Address.fromBytes(token._underlying)
            : graph_ts_1.Address.fromBytes(token.id);
        const _amount = (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals);
        return (0, prices_1.getUsdPrice)(pricedToken, _amount);
    }
}
class TokenInit {
    getTokenParams(address) {
        let underlying = null;
        const wrappedERC20 = Pool_1.Pool.bind(address);
        const poolIDCall = wrappedERC20.try_poolId();
        if (poolIDCall.reverted) {
            const erc20 = _ERC20_1._ERC20.bind(address);
            const name = erc20.name();
            const symbol = erc20.symbol();
            const decimals = erc20.decimals().toI32();
            return {
                name,
                symbol,
                decimals,
                underlying,
            };
        }
        const name = wrappedERC20.name();
        const symbol = wrappedERC20.symbol();
        const decimals = wrappedERC20.decimals().toI32();
        underlying = wrappedERC20.token();
        return {
            name,
            symbol,
            decimals,
            underlying,
        };
    }
}
function handleStakeForBlockRewards(event) {
    const lpStakingContractAddr = graph_ts_1.dataSource.address();
    const poolID = event.params.pid;
    const sdk = bridge_1.SDK.initialize(conf, new Pricer(), new TokenInit(), event);
    const lpStakingContract = LPStaking_1.LPStaking.bind(lpStakingContractAddr);
    const poolInfo = lpStakingContract.poolInfo(poolID);
    const poolAddr = poolInfo.value0;
    const allocPoint = poolInfo.value1;
    const rewardToken = sdk.Tokens.getOrCreateToken(lpStakingContract.stargate());
    const stargatePerBlock = lpStakingContract.stargatePerBlock();
    const totalAllocPoint = lpStakingContract.totalAllocPoint();
    const stargatePerBlockForPool = stargatePerBlock
        .times(allocPoint)
        .div(totalAllocPoint);
    const rewardsPerDay = (0, rewards_1.getRewardsPerDay)(event.block.timestamp, event.block.number, stargatePerBlockForPool.toBigDecimal(), rewards_1.RewardIntervalType.BLOCK);
    const pool = sdk.Pools.loadPool(poolAddr);
    if (!pool.isInitialized) {
        const poolContract = Pool_1.Pool.bind(poolAddr);
        const poolName = poolContract.name();
        const poolSymbol = poolContract.symbol();
        const token = sdk.Tokens.getOrCreateToken(poolAddr);
        pool.initialize(poolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, token);
        templates_1.PoolTemplate.create(poolAddr);
    }
    pool.setRewardEmissions(constants_2.RewardTokenType.DEPOSIT, rewardToken, (0, numbers_1.bigDecimalToBigInt)(rewardsPerDay));
    (0, helpers_1.checkPoolCount)(sdk);
}
exports.handleStakeForBlockRewards = handleStakeForBlockRewards;
function handleStakeForTimeRewards(event) {
    const lpStakingContractAddr = graph_ts_1.dataSource.address();
    const poolID = event.params.pid;
    const sdk = bridge_1.SDK.initialize(conf, new Pricer(), new TokenInit(), event);
    const lpStakingContract = LPStakingTime_1.LPStakingTime.bind(lpStakingContractAddr);
    const poolInfo = lpStakingContract.poolInfo(poolID);
    const poolAddr = poolInfo.value0;
    const allocPoint = poolInfo.value1;
    const rewardToken = sdk.Tokens.getOrCreateToken(lpStakingContract.eToken());
    const stargatePerSecond = lpStakingContract.eTokenPerSecond();
    const totalAllocPoint = lpStakingContract.totalAllocPoint();
    const stargatePerSecondForPool = stargatePerSecond
        .times(allocPoint)
        .div(totalAllocPoint);
    const rewardsPerDay = (0, rewards_1.getRewardsPerDay)(event.block.timestamp, event.block.number, stargatePerSecondForPool.toBigDecimal(), rewards_1.RewardIntervalType.TIMESTAMP);
    const pool = sdk.Pools.loadPool(poolAddr);
    if (!pool.isInitialized) {
        const poolContract = Pool_1.Pool.bind(poolAddr);
        const poolName = poolContract.name();
        const poolSymbol = poolContract.symbol();
        const token = sdk.Tokens.getOrCreateToken(poolAddr);
        pool.initialize(poolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, token);
        templates_1.PoolTemplate.create(poolAddr);
    }
    pool.setRewardEmissions(constants_2.RewardTokenType.DEPOSIT, rewardToken, (0, numbers_1.bigDecimalToBigInt)(rewardsPerDay));
    (0, helpers_1.checkPoolCount)(sdk);
}
exports.handleStakeForTimeRewards = handleStakeForTimeRewards;
function handleUnstakeForBlockRewards(event) {
    const lpStakingContractAddr = graph_ts_1.dataSource.address();
    const poolID = event.params.pid;
    const sdk = bridge_1.SDK.initialize(conf, new Pricer(), new TokenInit(), event);
    const lpStakingContract = LPStaking_1.LPStaking.bind(lpStakingContractAddr);
    const poolInfo = lpStakingContract.poolInfo(poolID);
    const poolAddr = poolInfo.value0;
    const allocPoint = poolInfo.value1;
    const rewardToken = sdk.Tokens.getOrCreateToken(lpStakingContract.stargate());
    const stargatePerBlock = lpStakingContract.stargatePerBlock();
    const totalAllocPoint = lpStakingContract.totalAllocPoint();
    const stargatePerBlockForPool = stargatePerBlock
        .times(allocPoint)
        .div(totalAllocPoint);
    const rewardsPerDay = (0, rewards_1.getRewardsPerDay)(event.block.timestamp, event.block.number, stargatePerBlockForPool.toBigDecimal(), rewards_1.RewardIntervalType.BLOCK);
    const pool = sdk.Pools.loadPool(poolAddr);
    if (!pool.isInitialized) {
        const poolContract = Pool_1.Pool.bind(poolAddr);
        const poolName = poolContract.name();
        const poolSymbol = poolContract.symbol();
        const token = sdk.Tokens.getOrCreateToken(poolAddr);
        pool.initialize(poolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, token);
        templates_1.PoolTemplate.create(poolAddr);
    }
    pool.setRewardEmissions(constants_2.RewardTokenType.DEPOSIT, rewardToken, (0, numbers_1.bigDecimalToBigInt)(rewardsPerDay));
    (0, helpers_1.checkPoolCount)(sdk);
}
exports.handleUnstakeForBlockRewards = handleUnstakeForBlockRewards;
function handleUnstakeForTimeRewards(event) {
    const lpStakingContractAddr = graph_ts_1.dataSource.address();
    const poolID = event.params.pid;
    const sdk = bridge_1.SDK.initialize(conf, new Pricer(), new TokenInit(), event);
    const lpStakingContract = LPStakingTime_1.LPStakingTime.bind(lpStakingContractAddr);
    const poolInfo = lpStakingContract.poolInfo(poolID);
    const poolAddr = poolInfo.value0;
    const allocPoint = poolInfo.value1;
    const rewardToken = sdk.Tokens.getOrCreateToken(lpStakingContract.eToken());
    const stargatePerSecond = lpStakingContract.eTokenPerSecond();
    const totalAllocPoint = lpStakingContract.totalAllocPoint();
    const stargatePerSecondForPool = stargatePerSecond
        .times(allocPoint)
        .div(totalAllocPoint);
    const rewardsPerDay = (0, rewards_1.getRewardsPerDay)(event.block.timestamp, event.block.number, stargatePerSecondForPool.toBigDecimal(), rewards_1.RewardIntervalType.TIMESTAMP);
    const pool = sdk.Pools.loadPool(poolAddr);
    if (!pool.isInitialized) {
        const poolContract = Pool_1.Pool.bind(poolAddr);
        const poolName = poolContract.name();
        const poolSymbol = poolContract.symbol();
        const token = sdk.Tokens.getOrCreateToken(poolAddr);
        pool.initialize(poolName, poolSymbol, enums_1.BridgePoolType.LIQUIDITY, token);
        templates_1.PoolTemplate.create(poolAddr);
    }
    pool.setRewardEmissions(constants_2.RewardTokenType.DEPOSIT, rewardToken, (0, numbers_1.bigDecimalToBigInt)(rewardsPerDay));
    (0, helpers_1.checkPoolCount)(sdk);
}
exports.handleUnstakeForTimeRewards = handleUnstakeForTimeRewards;
function handleSwapOut(event) {
    const poolAddr = graph_ts_1.dataSource.address();
    const amount = event.params.amountSD;
    const crosschainID = graph_ts_1.BigInt.fromI32(event.params.chainId);
    const crossPoolID = event.params.dstPoolId;
    const sdk = bridge_1.SDK.initialize(conf, new Pricer(), new TokenInit(), event);
    const pool = sdk.Pools.loadPool(poolAddr);
    const token = sdk.Tokens.getOrCreateToken(graph_ts_1.Address.fromBytes(pool.getInputToken().id));
    const crosschainNetwork = (0, chainIds_1.chainIDToNetwork)(crosschainID);
    if (crosschainNetwork == constants_2.Network.UNKNOWN_NETWORK) {
        graph_ts_1.log.warning("[handleSwapOut] Network unknown for chainID: {} tx_hash: {}", [
            crosschainID.toString(),
            event.transaction.hash.toHexString(),
        ]);
        return;
    }
    const poolTokens = constants_1.crossPoolTokens.get(crosschainNetwork);
    if (!poolTokens) {
        graph_ts_1.log.warning("[handleSwapOut] No pools for network: {}", [
            crosschainNetwork,
        ]);
        return;
    }
    const crosschainTokenAddr = poolTokens.get(crossPoolID);
    if (!crosschainTokenAddr) {
        graph_ts_1.log.warning("[handleSwapOut] No crosschainToken for network: {} poolID: {}", [crosschainNetwork, crossPoolID.toString()]);
        return;
    }
    const crosschainToken = sdk.Tokens.getOrCreateCrosschainToken(crosschainID, crosschainTokenAddr, enums_1.CrosschainTokenType.WRAPPED, graph_ts_1.Address.fromBytes(token.id));
    pool.addDestinationToken(crosschainToken);
    const route = pool.getDestinationTokenRoute(crosschainToken);
    const protocolFee = event.params.protocolFee;
    const supplyFee = event.params.lpFee;
    pool.addRevenueNative(protocolFee, supplyFee);
    const account = sdk.Accounts.loadAccount(event.transaction.from);
    account.transferOut(pool, route, event.transaction.from, amount);
    (0, helpers_1.checkPoolCount)(sdk);
}
exports.handleSwapOut = handleSwapOut;
function handleSwapIn(event) {
    const poolAddr = graph_ts_1.dataSource.address();
    const amount = event.params.amountSD;
    const sdk = bridge_1.SDK.initialize(conf, new Pricer(), new TokenInit(), event);
    const pool = sdk.Pools.loadPool(poolAddr);
    const token = sdk.Tokens.getOrCreateToken(graph_ts_1.Address.fromBytes(pool.getInputToken().id));
    let crosschainID = constants_2.BIGINT_MINUS_ONE;
    let crossPoolID = constants_2.BIGINT_MINUS_ONE;
    const creditCPEventSig = graph_ts_1.crypto.keccak256(graph_ts_1.ByteArray.fromUTF8("CreditChainPath(uint16,uint256,uint256,uint256)"));
    const logs = event.receipt.logs;
    for (let i = 0; i < logs.length; i++) {
        const currLog = logs.at(i);
        const topic0Sig = currLog.topics.at(0);
        if (topic0Sig.equals(creditCPEventSig)) {
            const decodedLogData = graph_ts_1.ethereum
                .decode("(uint16,uint256,uint256,uint256)", currLog.data)
                .toTuple();
            crosschainID = decodedLogData.at(0).toBigInt();
            crossPoolID = decodedLogData.at(1).toBigInt();
        }
    }
    if (crossPoolID == constants_2.BIGINT_MINUS_ONE || crosschainID == constants_2.BIGINT_MINUS_ONE) {
        graph_ts_1.log.warning("[handleSwapIn] Could not find crosschainID/crossPoolID tx_hash: {}", [event.transaction.hash.toHexString()]);
        return;
    }
    const crosschainNetwork = (0, chainIds_1.chainIDToNetwork)(crosschainID);
    if (crosschainNetwork == constants_2.Network.UNKNOWN_NETWORK) {
        graph_ts_1.log.warning("[handleSwapIn] Network unknown for chainID: {} tx_hash: {}", [
            crosschainID.toString(),
            event.transaction.hash.toHexString(),
        ]);
        return;
    }
    const poolTokens = constants_1.crossPoolTokens.get(crosschainNetwork);
    if (!poolTokens) {
        graph_ts_1.log.warning("[handleSwapIn] No pools for network: {}", [crosschainNetwork]);
        return;
    }
    const crosschainTokenAddr = poolTokens.get(crossPoolID);
    if (!crosschainTokenAddr) {
        graph_ts_1.log.warning("[handleSwapIn] No crosschainToken for network: {} poolID: {}", [crosschainNetwork, crossPoolID.toString()]);
        return;
    }
    const crosschainToken = sdk.Tokens.getOrCreateCrosschainToken(crosschainID, crosschainTokenAddr, enums_1.CrosschainTokenType.WRAPPED, graph_ts_1.Address.fromBytes(token.id));
    pool.addDestinationToken(crosschainToken);
    const route = pool.getDestinationTokenRoute(crosschainToken);
    const account = sdk.Accounts.loadAccount(event.params.to);
    account.transferIn(pool, route, event.params.to, amount);
    (0, helpers_1.checkPoolCount)(sdk);
}
exports.handleSwapIn = handleSwapIn;
function handleMint(event) {
    const poolAddr = graph_ts_1.dataSource.address();
    const amount = event.params.amountSD;
    const sdk = bridge_1.SDK.initialize(conf, new Pricer(), new TokenInit(), event);
    const pool = sdk.Pools.loadPool(poolAddr);
    const account = sdk.Accounts.loadAccount(event.params.to);
    account.liquidityDeposit(pool, amount);
    (0, helpers_1.checkPoolCount)(sdk);
}
exports.handleMint = handleMint;
function handleBurn(event) {
    const poolAddr = graph_ts_1.dataSource.address();
    const amount = event.params.amountSD;
    const sdk = bridge_1.SDK.initialize(conf, new Pricer(), new TokenInit(), event);
    const pool = sdk.Pools.loadPool(poolAddr);
    const account = sdk.Accounts.loadAccount(event.params.from);
    account.liquidityWithdraw(pool, amount);
    (0, helpers_1.checkPoolCount)(sdk);
}
exports.handleBurn = handleBurn;
