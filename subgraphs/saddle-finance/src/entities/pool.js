"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortValuesByTokenOrder = exports.handlePoolRewardsUpdated = exports.handlePoolSwap = exports.handlePoolWithdraw = exports.handlePoolDeposit = exports.getOrCreatePoolHourlySnapshot = exports.getOrCreatePoolDailySnapshot = exports.createPoolFromRegistryEvent = exports.createPoolFromFactoryEvent = exports.getOrCreatePool = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const Swap_1 = require("../../generated/templates/Swap/Swap");
const SwapV1_1 = require("../../generated/templates/Swap/SwapV1");
const templates_1 = require("../../generated/templates");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const fee_1 = require("./fee");
const protocol_1 = require("./protocol");
const token_1 = require("./token");
const price_1 = require("../utils/price");
const strings_1 = require("../utils/strings");
const SimpleRewarder_1 = require("../../generated/templates/Swap/SimpleRewarder");
function getOrCreatePool(address) {
    let pool = schema_1.LiquidityPool.load(address.toHexString());
    if (!pool) {
        // Pool was not created through a SwapDeployer nor Registry
        pool = createPoolFromAddress(address);
    }
    return pool;
}
exports.getOrCreatePool = getOrCreatePool;
// createPoolFromAddress will create a pool in the DB but won't subscribe to it via template
// because it should already be in the yaml.
function createPoolFromAddress(address) {
    const poolData = constants_1.POOL_DATA.get((0, strings_1.prefixID)(graph_ts_1.dataSource.network(), address.toHexString()));
    const pool = createPool(address, poolData.createdBlockNumber, poolData.createdTimestamp, null);
    if (!pool) {
        graph_ts_1.log.critical("unable to create pool from address", []);
    }
    return pool;
}
// createPoolFromEvent will create a pool from a PairCreated event, and subscribe to events from it.
function createPoolFromFactoryEvent(event) {
    const poolAddr = event.params.swapAddress;
    if (constants_1.BROKEN_POOLS.has(poolAddr.toHexString())) {
        return;
    }
    const pool = schema_1.LiquidityPool.load(poolAddr.toHexString());
    if (pool) {
        return;
    }
    if (createPool(poolAddr, event.block.number, event.block.timestamp, event.params.pooledTokens)) {
        templates_1.Swap.create(poolAddr);
    }
}
exports.createPoolFromFactoryEvent = createPoolFromFactoryEvent;
// createPoolFromRegistryEvent will create a pool if doesn't exist already when added to the pool registry.
// This should catch pools deployed manually and not via a deployer.
function createPoolFromRegistryEvent(address, block) {
    if (constants_1.BROKEN_POOLS.has(address.toHexString())) {
        return;
    }
    const pool = schema_1.LiquidityPool.load(address.toHexString());
    if (pool) {
        return;
    }
    if (createPool(address, block.number, block.timestamp, null)) {
        templates_1.Swap.create(address);
    }
}
exports.createPoolFromRegistryEvent = createPoolFromRegistryEvent;
function createPool(swapAddress, blockNum, timestamp, pooledTokens) {
    const address = swapAddress;
    const addressString = address.toHexString();
    const contract = Swap_1.Swap.bind(address);
    let lpTokenAddress = contract.swapStorage().value6;
    // Check if LP token exists
    if (!(0, token_1.checkValidToken)(lpTokenAddress)) {
        const v1contract = SwapV1_1.SwapV1.bind(address);
        lpTokenAddress = v1contract.swapStorage().value7;
        if (!(0, token_1.checkValidToken)(lpTokenAddress)) {
            graph_ts_1.log.critical("Invalid LP token address {} in pool {}", [
                lpTokenAddress.toHexString(),
                address.toHexString(),
            ]);
            return null;
        }
    }
    if (!pooledTokens) {
        pooledTokens = fetchInputTokensFromContract(contract);
    }
    const pool = new schema_1.LiquidityPool(addressString);
    pool.protocol = (0, protocol_1.getOrCreateProtocol)().id;
    pool._inputTokensOrdered = getOrCreateInputTokens(pooledTokens);
    pool.inputTokens = pool._inputTokensOrdered.sort();
    const token = (0, token_1.getOrCreateToken)(lpTokenAddress, addressString);
    pool.outputToken = token.id;
    pool.outputTokenSupply = constants_1.BIGINT_ZERO;
    pool.createdTimestamp = timestamp;
    pool.createdBlockNumber = blockNum;
    pool.name = token.name;
    pool.symbol = token.symbol;
    const tradingFee = contract.swapStorage().value4; // swapFee
    const adminFee = contract.swapStorage().value5; // adminFee
    pool.fees = (0, fee_1.createOrUpdateAllFees)(address, tradingFee, adminFee);
    pool._basePool = getBasePool(contract);
    setInputTokenBalancesAndWeights(pool, contract);
    pool.isSingleSided = false;
    pool.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    pool.cumulativeVolumeUSD = constants_1.BIGDECIMAL_ZERO;
    pool.save();
    (0, protocol_1.incrementProtocolTotalPoolCount)();
    registerPoolForTokens(pool);
    return pool;
}
function getOrCreatePoolDailySnapshot(event, pool) {
    const day = event.block.timestamp.toI64() / constants_1.SECONDS_PER_DAY;
    const id = `${pool.id}-${day}`;
    let poolDailySnapshot = schema_1.LiquidityPoolDailySnapshot.load(id);
    if (!poolDailySnapshot) {
        poolDailySnapshot = new schema_1.LiquidityPoolDailySnapshot(id);
        poolDailySnapshot.protocol = pool.protocol;
        poolDailySnapshot.pool = pool.id;
        poolDailySnapshot.dailyVolumeByTokenAmount = new Array(pool.inputTokens.length).map(() => constants_1.BIGINT_ZERO);
        poolDailySnapshot.dailyVolumeByTokenUSD = new Array(pool.inputTokens.length).map(() => constants_1.BIGDECIMAL_ZERO);
        poolDailySnapshot.dailyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        poolDailySnapshot.dailySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolDailySnapshot.dailyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolDailySnapshot.dailyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    }
    poolDailySnapshot.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolDailySnapshot.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
    poolDailySnapshot.inputTokenBalances = pool.inputTokenBalances;
    poolDailySnapshot.inputTokenWeights = pool.inputTokenWeights;
    poolDailySnapshot.outputTokenSupply = pool.outputTokenSupply;
    poolDailySnapshot.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    poolDailySnapshot.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
    poolDailySnapshot.rewardTokenEmissionsAmount =
        pool.rewardTokenEmissionsAmount;
    poolDailySnapshot.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
    poolDailySnapshot.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolDailySnapshot.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolDailySnapshot.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    poolDailySnapshot.blockNumber = event.block.number;
    poolDailySnapshot.timestamp = event.block.timestamp;
    poolDailySnapshot.save();
    return poolDailySnapshot;
}
exports.getOrCreatePoolDailySnapshot = getOrCreatePoolDailySnapshot;
function getOrCreatePoolHourlySnapshot(event, pool) {
    const timestamp = event.block.timestamp.toI64();
    const hours = timestamp / constants_1.SECONDS_PER_HOUR;
    const id = `${pool.id}-${hours}`;
    let poolHourlySnapshot = schema_1.LiquidityPoolHourlySnapshot.load(id);
    if (!poolHourlySnapshot) {
        poolHourlySnapshot = new schema_1.LiquidityPoolHourlySnapshot(id);
        poolHourlySnapshot.protocol = pool.protocol;
        poolHourlySnapshot.pool = pool.id;
        poolHourlySnapshot.hourlyVolumeByTokenAmount = new Array(pool.inputTokens.length).map(() => constants_1.BIGINT_ZERO);
        poolHourlySnapshot.hourlyVolumeByTokenUSD = new Array(pool.inputTokens.length).map(() => constants_1.BIGDECIMAL_ZERO);
        poolHourlySnapshot.hourlyVolumeUSD = constants_1.BIGDECIMAL_ZERO;
        poolHourlySnapshot.hourlySupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolHourlySnapshot.hourlyProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        poolHourlySnapshot.hourlyTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    }
    poolHourlySnapshot.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolHourlySnapshot.cumulativeVolumeUSD = pool.cumulativeVolumeUSD;
    poolHourlySnapshot.inputTokenBalances = pool.inputTokenBalances;
    poolHourlySnapshot.inputTokenWeights = pool.inputTokenWeights;
    poolHourlySnapshot.outputTokenSupply = pool.outputTokenSupply;
    poolHourlySnapshot.outputTokenPriceUSD = pool.outputTokenPriceUSD;
    poolHourlySnapshot.stakedOutputTokenAmount = pool.stakedOutputTokenAmount;
    poolHourlySnapshot.rewardTokenEmissionsAmount =
        pool.rewardTokenEmissionsAmount;
    poolHourlySnapshot.rewardTokenEmissionsUSD = pool.rewardTokenEmissionsUSD;
    poolHourlySnapshot.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolHourlySnapshot.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolHourlySnapshot.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    poolHourlySnapshot.blockNumber = event.block.number;
    poolHourlySnapshot.timestamp = event.block.timestamp;
    poolHourlySnapshot.save();
    return poolHourlySnapshot;
}
exports.getOrCreatePoolHourlySnapshot = getOrCreatePoolHourlySnapshot;
function handlePoolDeposit(event, pool, deposit) {
    setInputTokenBalancesAndWeights(pool);
    pool.outputTokenSupply = pool.outputTokenSupply.plus(deposit.outputTokenAmount);
    updateOutputTokenPriceAndTVL(event, pool);
    updateRewardTokenEmissionsUSD(event, pool);
    pool.save();
    getOrCreatePoolDailySnapshot(event, pool);
    getOrCreatePoolHourlySnapshot(event, pool);
    (0, protocol_1.incrementProtocolDepositCount)(event);
}
exports.handlePoolDeposit = handlePoolDeposit;
function handlePoolWithdraw(event, pool, withdraw) {
    setInputTokenBalancesAndWeights(pool);
    pool.outputTokenSupply = pool.outputTokenSupply.minus(withdraw.outputTokenAmount);
    updateOutputTokenPriceAndTVL(event, pool);
    updateRewardTokenEmissionsUSD(event, pool);
    pool.save();
    getOrCreatePoolDailySnapshot(event, pool);
    getOrCreatePoolHourlySnapshot(event, pool);
    (0, protocol_1.incrementProtocolWithdrawCount)(event);
}
exports.handlePoolWithdraw = handlePoolWithdraw;
function handlePoolSwap(event, pool, swap) {
    const volumeUSD = (0, numbers_1.calculateAverage)([swap.amountInUSD, swap.amountOutUSD]);
    pool.cumulativeVolumeUSD = pool.cumulativeVolumeUSD.plus(volumeUSD);
    setInputTokenBalancesAndWeights(pool);
    updateOutputTokenPriceAndTVL(event, pool);
    updateRewardTokenEmissionsUSD(event, pool);
    pool.save();
    const dailySnapshot = getOrCreatePoolDailySnapshot(event, pool);
    dailySnapshot.dailyVolumeUSD = dailySnapshot.dailyVolumeUSD.plus(volumeUSD);
    dailySnapshot.dailyVolumeByTokenAmount = addTokenVolume(dailySnapshot.dailyVolumeByTokenAmount, swap, pool);
    dailySnapshot.dailyVolumeByTokenUSD = addTokenVolumeUSD(dailySnapshot.dailyVolumeByTokenUSD, swap, pool);
    dailySnapshot.save();
    const hourlySnapshot = getOrCreatePoolHourlySnapshot(event, pool);
    hourlySnapshot.hourlyVolumeUSD =
        hourlySnapshot.hourlyVolumeUSD.plus(volumeUSD);
    hourlySnapshot.hourlyVolumeByTokenAmount = addTokenVolume(hourlySnapshot.hourlyVolumeByTokenAmount, swap, pool);
    hourlySnapshot.hourlyVolumeByTokenUSD = addTokenVolumeUSD(hourlySnapshot.hourlyVolumeByTokenUSD, swap, pool);
    hourlySnapshot.save();
    (0, protocol_1.incrementProtocolSwapCount)(event);
    (0, protocol_1.addProtocolUSDVolume)(event, volumeUSD);
    const supplySideRevenueUSD = swap.amountInUSD.times((0, fee_1.getSupplySideFee)(pool.id));
    const protocolRevenueUSD = swap.amountInUSD.times((0, fee_1.getProtocolFee)(pool.id));
    (0, protocol_1.addProtocolUSDRevenue)(event, pool, supplySideRevenueUSD, protocolRevenueUSD);
}
exports.handlePoolSwap = handlePoolSwap;
function handlePoolRewardsUpdated(event, miniChef, pid, stakedAmountChange = constants_1.BIGINT_ZERO) {
    const lpTokenAddress = miniChef.lpToken(pid);
    if (lpTokenAddress.toHexString() == constants_1.ZERO_ADDRESS) {
        return;
    }
    if (isBrokenMinichefPool(lpTokenAddress)) {
        return;
    }
    const poolInfo = miniChef.poolInfo(pid);
    const poolAllocPoint = poolInfo.value2;
    const saddlePerSecond = miniChef.saddlePerSecond();
    const totalAllocPoint = miniChef.totalAllocPoint();
    const token = (0, token_1.getOrCreateToken)(lpTokenAddress);
    if (!token._pool) {
        graph_ts_1.log.error("Could not find source pool for LP token: {}", [
            lpTokenAddress.toHexString(),
        ]);
        return;
    }
    const pool = getOrCreatePool(graph_ts_1.Address.fromString(token._pool));
    const sdlRewardsPerDay = saddlePerSecond
        .times(graph_ts_1.BigInt.fromI64(constants_1.SECONDS_PER_DAY))
        .times(poolAllocPoint)
        .div(totalAllocPoint);
    const rewardTokenEmissions = [sdlRewardsPerDay];
    const rewardTokens = [(0, token_1.getOrCreateRewardToken)(miniChef.SADDLE()).id];
    const rewarderAddress = miniChef.rewarder(pid);
    if (rewarderAddress.toHexString() != constants_1.ZERO_ADDRESS) {
        const rewarder = SimpleRewarder_1.SimpleRewarder.bind(rewarderAddress);
        const rewardTokenAddress = rewarder.rewardToken();
        if (!(0, token_1.checkValidToken)(rewardTokenAddress)) {
            graph_ts_1.log.error("Invalid reward token: {}", [rewardTokenAddress.toHexString()]);
        }
        else {
            const rewardPerSecond = rewarder.rewardPerSecond();
            const rewardPerDay = rewardPerSecond.times(graph_ts_1.BigInt.fromI64(constants_1.SECONDS_PER_DAY));
            rewardTokens.push((0, token_1.getOrCreateRewardToken)(rewardTokenAddress).id);
            rewardTokenEmissions.push(rewardPerDay);
        }
    }
    pool.rewardTokens = rewardTokens;
    pool.rewardTokenEmissionsAmount = rewardTokenEmissions;
    updateRewardTokenEmissionsUSD(event, pool);
    if (!pool.stakedOutputTokenAmount) {
        pool.stakedOutputTokenAmount = constants_1.BIGINT_ZERO;
    }
    pool.stakedOutputTokenAmount =
        pool.stakedOutputTokenAmount.plus(stakedAmountChange);
    pool.save();
    getOrCreatePoolDailySnapshot(event, pool);
    getOrCreatePoolHourlySnapshot(event, pool);
}
exports.handlePoolRewardsUpdated = handlePoolRewardsUpdated;
function updateRewardTokenEmissionsUSD(event, pool) {
    if (!pool.rewardTokens) {
        return;
    }
    const rewardTokenEmissionsUSD = new Array(pool.rewardTokens.length);
    for (let i = 0; i < pool.rewardTokens.length; i++) {
        const rewardToken = (0, token_1.getOrCreateTokenFromString)(pool.rewardTokens[i]);
        const emissionAmount = pool.rewardTokenEmissionsAmount[i];
        rewardTokenEmissionsUSD[i] = (0, numbers_1.bigIntToBigDecimal)(emissionAmount, rewardToken.decimals).times((0, price_1.getPriceUSD)(rewardToken, event));
    }
    pool.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
}
// isLPSwap will return true if any of the tokens on a given swap is an
// LP token from a metapool.
function isLPSwap(swap, pool) {
    if (!pool._basePool) {
        return false;
    }
    const basePool = schema_1.LiquidityPool.load(pool._basePool);
    return (basePool.outputToken == swap.tokenIn ||
        basePool.outputToken == swap.tokenOut);
}
function addTokenVolume(tokenVolume, swap, pool) {
    if (isLPSwap(swap, pool)) {
        return addLPSwapVolume(pool, swap, tokenVolume);
    }
    const tokenInIndex = pool.inputTokens.indexOf(swap.tokenIn);
    const tokenOutIndex = pool.inputTokens.indexOf(swap.tokenOut);
    tokenVolume[tokenInIndex] = tokenVolume[tokenInIndex].plus(swap.amountIn);
    tokenVolume[tokenOutIndex] = tokenVolume[tokenOutIndex].plus(swap.amountOut);
    return tokenVolume;
}
function addTokenVolumeUSD(tokenVolume, swap, pool) {
    if (isLPSwap(swap, pool)) {
        return addLPSwapVolumeUSD(pool, swap, tokenVolume);
    }
    const tokenInIndex = pool.inputTokens.indexOf(swap.tokenIn);
    const tokenOutIndex = pool.inputTokens.indexOf(swap.tokenOut);
    tokenVolume[tokenInIndex] = tokenVolume[tokenInIndex].plus(swap.amountInUSD);
    tokenVolume[tokenOutIndex] = tokenVolume[tokenOutIndex].plus(swap.amountOutUSD);
    return tokenVolume;
}
// addLPSwapVolume will add to a given volumes array the volume of each token
// involved in a swap. It will assume that one of the two tokens swapped is an LP token.
// Since we keep the underlying tokens that compose the LP instead of the LP token
// itself, we'll add the proportional part of each underlying from the LP volume.
function addLPSwapVolume(pool, swap, poolVolumes) {
    const basePool = schema_1.LiquidityPool.load(pool._basePool);
    const lpToken = basePool.outputToken;
    let lpAmount = swap.amountIn;
    let nonLPAmount = swap.amountOut;
    let nonLPToken = swap.tokenOut;
    if (swap.tokenOut == lpToken) {
        lpAmount = swap.amountOut;
        nonLPAmount = swap.amountIn;
        nonLPToken = swap.tokenIn;
    }
    const multiplier = lpAmount.divDecimal(basePool.outputTokenSupply.toBigDecimal());
    const underlyingTokens = basePool.inputTokens;
    for (let i = 0; i < underlyingTokens.length; i++) {
        const token = underlyingTokens[i];
        const balance = basePool.inputTokenBalances[i].toBigDecimal();
        const tokenIndex = pool.inputTokens.indexOf(token);
        const vol = (0, numbers_1.bigDecimalToBigInt)(balance.times(multiplier));
        poolVolumes[tokenIndex] = poolVolumes[tokenIndex].plus(vol);
    }
    const index = pool.inputTokens.indexOf(nonLPToken);
    poolVolumes[index] = poolVolumes[index].plus(nonLPAmount);
    return poolVolumes;
}
// addLPSwapVolumeUSD will add to a given volumes array the volumeUSD of each token
// involved in a swap. It will assume that one of the two tokens swapped is an LP token.
// Since we keep the underlying tokens that compose the LP instead of the LP token 
// itself, we'll add the proportional part of each underlying from the LP volume.
function addLPSwapVolumeUSD(pool, swap, poolVolumes) {
    const basePool = schema_1.LiquidityPool.load(pool._basePool);
    const lpToken = basePool.outputToken;
    let lpAmountUSD = swap.amountInUSD;
    let nonLPAmountUSD = swap.amountOutUSD;
    let nonLPToken = swap.tokenOut;
    if (swap.tokenOut == lpToken) {
        lpAmountUSD = swap.amountOutUSD;
        nonLPAmountUSD = swap.amountInUSD;
        nonLPToken = swap.tokenIn;
    }
    const underlyingTokens = basePool.inputTokens;
    for (let i = 0; i < underlyingTokens.length; i++) {
        const token = underlyingTokens[i];
        const index = pool.inputTokens.indexOf(token);
        const weight = basePool.inputTokenWeights[i].div(constants_1.BIGDECIMAL_HUNDRED);
        const vol = lpAmountUSD.times(weight);
        poolVolumes[index] = poolVolumes[index].plus(vol);
    }
    const index = pool.inputTokens.indexOf(nonLPToken);
    poolVolumes[index] = poolVolumes[index].plus(nonLPAmountUSD);
    return poolVolumes;
}
function getBasePool(contract) {
    const metaSwapStorageCall = contract.try_metaSwapStorage();
    if (metaSwapStorageCall.reverted) {
        return null;
    }
    return metaSwapStorageCall.value.value0 /* baseSwap */
        .toHexString();
}
function getOrCreateInputTokens(pooledTokens) {
    const tokens = pooledTokens.map((t) => (0, token_1.getOrCreateToken)(t));
    let tokenIds = tokens.map((t) => t.id);
    const basePoolId = tokens[tokens.length - 1]._pool;
    if (basePoolId) {
        tokenIds.pop();
        const basePool = getOrCreatePool(graph_ts_1.Address.fromString(basePoolId));
        tokenIds = tokenIds.concat(basePool._inputTokensOrdered);
    }
    return tokenIds;
}
function updateOutputTokenPriceAndTVL(event, pool) {
    const totalValueLocked = (0, price_1.getTokenAmountsSumUSD)(event, pool.inputTokenBalances, pool.inputTokens);
    const outputTokenAmount = (0, numbers_1.bigIntToBigDecimal)(pool.outputTokenSupply, (0, token_1.getTokenDecimals)(pool.outputToken));
    pool.outputTokenPriceUSD = totalValueLocked.equals(constants_1.BIGDECIMAL_ZERO) ?
        constants_1.BIGDECIMAL_ZERO :
        totalValueLocked.div(outputTokenAmount); // avoid div by 0 when pool is empty
    (0, protocol_1.updateProtocolTVL)(event, totalValueLocked.minus(pool.totalValueLockedUSD));
    pool.totalValueLockedUSD = totalValueLocked;
}
function setInputTokenBalancesAndWeights(pool, contract = null) {
    if (contract == null) {
        contract = Swap_1.Swap.bind(graph_ts_1.Address.fromString(pool.id));
    }
    let bpBalances = [];
    if (pool._basePool) {
        const basePool = getOrCreatePool(graph_ts_1.Address.fromString(pool._basePool));
        setInputTokenBalancesAndWeights(basePool);
        const lpTokenIndex = pool.inputTokens.length - basePool.inputTokens.length;
        const lpTokenBalance = contract.getTokenBalance(lpTokenIndex);
        const totalLPTokenSupply = basePool.outputTokenSupply;
        // Calculate pool input token amounts based on LP token ratio
        for (let i = 0; i < basePool.inputTokenBalances.length; i++) {
            const balance = basePool.inputTokenBalances[i];
            if (totalLPTokenSupply.equals(constants_1.BIGINT_ZERO)) {
                bpBalances.push(constants_1.BIGINT_ZERO);
                continue;
            }
            bpBalances.push(balance.times(lpTokenBalance).div(totalLPTokenSupply));
        }
        // since we want balances to be properly sorted we need them to all have the same
        // base reference. Balances fetched from the contract will follow the order of `_inputTokensSorted`.
        // BasePool balances are already sorted, but they need to match `_inputTokensOrdered` in order to sort
        // them together with the rest.
        bpBalances = sortValuesByTokenOrder(basePool.inputTokens, basePool._inputTokensOrdered, bpBalances);
    }
    const balances = getBalances(contract, pool.inputTokens.length - bpBalances.length).concat(bpBalances);
    pool.inputTokenBalances = sortValuesByTokenOrder(pool._inputTokensOrdered, pool.inputTokens, balances);
    pool.inputTokenWeights = getBalanceWeights(pool.inputTokenBalances, pool.inputTokens);
}
function getBalances(contract, n) {
    const balances = new Array(n);
    for (let i = 0; i < n; i++) {
        balances[i] = contract.getTokenBalance(i);
    }
    return balances;
}
function getBalanceWeights(balances, tokens) {
    const decimalBalances = new Array(balances.length);
    for (let i = 0; i < balances.length; i++) {
        decimalBalances[i] = (0, numbers_1.bigIntToBigDecimal)(balances[i], (0, token_1.getTokenDecimals)(tokens[i]));
    }
    let sum = decimalBalances.reduce((a, b) => a.plus(b), constants_1.BIGDECIMAL_ZERO);
    if (sum == constants_1.BIGDECIMAL_ZERO) {
        sum = constants_1.BIGDECIMAL_ONE.times(new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(balances.length)));
    }
    const weights = new Array(balances.length);
    for (let i = 0; i < balances.length; i++) {
        weights[i] = decimalBalances[i].div(sum).times(constants_1.BIGDECIMAL_HUNDRED);
    }
    return weights;
}
function fetchInputTokensFromContract(contract) {
    const tokens = [];
    let i = 0;
    let call;
    do {
        call = contract.try_getToken(i);
        if (!call.reverted) {
            tokens.push(call.value);
        }
        i += 1;
    } while (!call.reverted);
    return tokens;
}
// sortValuesByTokenOrder will sort an array of values by performing the same
// order changes that need to be done to referenceOrder to get targetOrder.
function sortValuesByTokenOrder(referenceOrder, targetOrder, valuesToSort) {
    const len = referenceOrder.length;
    const intersection = arrayIntersection(referenceOrder, targetOrder);
    if (intersection.length != len || valuesToSort.length != len) {
        // reference and target should contain the same elements, just ordered differently.
        graph_ts_1.log.error("Failed to sort array via reference. Both arrays should have the same values. Ref: {}, target: {}", [referenceOrder.toString(), targetOrder.toString()]);
        graph_ts_1.log.critical("", []);
        return valuesToSort;
    }
    const ordered = new Array(len);
    for (let i = 0; i < len; i++) {
        const val = valuesToSort[i];
        const ref = referenceOrder[i];
        const targetIndex = targetOrder.indexOf(ref);
        ordered[targetIndex] = val;
    }
    return ordered;
}
exports.sortValuesByTokenOrder = sortValuesByTokenOrder;
// arrayIntersection will return an array with the common items 
// between two arrays.
function arrayIntersection(arr1, arr2) {
    let len = arr1.length;
    let shorter = arr1;
    let longer = arr2;
    if (arr2.length < arr1.length) {
        len = arr2.length;
        longer = arr1;
        shorter = arr2;
    }
    const intersection = new Array();
    for (let i = 0; i < len; i++) {
        const val = shorter[i];
        if (longer.indexOf(val) != -1) {
            intersection.push(val);
        }
    }
    return intersection;
}
function getOrCreateTokenPools(token) {
    let pools = schema_1._TokenPools.load(token.toHexString());
    if (pools) {
        return pools;
    }
    pools = new schema_1._TokenPools(token.toHexString());
    pools.pools = [];
    pools.save();
    return pools;
}
// registerPoolForTokens will keep track of the pool entity on an auxiliary entity
// that is indexed by token address (so we can easily tell in which pools a token is traded).
function registerPoolForTokens(pool) {
    for (let i = 0; i < pool.inputTokens.length; i++) {
        const token = pool.inputTokens[i];
        const pools = getOrCreateTokenPools(graph_ts_1.Address.fromString(token));
        if (pools.pools.includes(pool.id)) {
            continue;
        }
        pools.pools = pools.pools.concat([pool.id]);
        pools.save();
    }
}
// Saddle finance might have wrongly added LP tokens to their minichef
// rewards contract. The contract works by adding the address of the LP
// token to reward a given pool. But they added the address of the pool
// by mistake instead of the LP on Optimism. This function will tell if a given
// supposedly LP address is really a Pool.
function isBrokenMinichefPool(lpToken) {
    const broken = ["0xc55e8c79e5a6c3216d4023769559d06fa9a7732e"];
    return broken.includes(lpToken.toHexString());
}
