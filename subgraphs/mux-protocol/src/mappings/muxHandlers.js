"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSetMuxRewardRate = exports.handleFeeDistribute = exports.handleNotifyFeeReward = exports.handleRemoveLiquidity = exports.handleAddLiquidity = exports.handleMuxUpdatePositionEvent = exports.handleLiquidatePosition = exports.handleLiquidatePositionOld = exports.handleClosePosition = exports.handleClosePositionOld = exports.handleOpenPosition = exports.handleOpenPositionOld = exports.handleUpdateFundingRate = exports.handleSetAssetSymbol = exports.handleAddAsset = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const LiquidityPool_1 = require("../../generated/LiquidityPool/LiquidityPool");
const FeeDistributor_1 = require("../../generated/LiquidityPool/FeeDistributor");
const MuxDistributor_1 = require("../../generated/LiquidityPool/MuxDistributor");
const configure_1 = require("../../configurations/configure");
const handlers_1 = require("./handlers");
const event_1 = require("../entities/event");
const token_1 = require("../entities/token");
const account_1 = require("../entities/account");
const position_1 = require("../entities/position");
const protocol_1 = require("../entities/protocol");
const pool_1 = require("../entities/pool");
const snapshots_1 = require("../entities/snapshots");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
function handleAddAsset(event) {
    const pool = (0, pool_1.getOrCreateLiquidityPool)(event, event.address, constants_1.MUX_POOL_NAME, constants_1.MUX_POOL_SYMBOL);
    (0, snapshots_1.takeSnapshots)(event, pool);
    const asset = (0, token_1.getOrCreateMuxAsset)(event.params.id);
    asset.isStable = event.params.isStable;
    asset.tokenAddress = event.params.tokenAddress;
    asset.muxTokenAddress = event.params.muxTokenAddress;
    asset.timestamp = event.block.timestamp;
    asset.save();
    const token = (0, token_1.getOrCreateToken)(event, event.params.tokenAddress);
    token.symbol = event.params.symbol.toString();
    token.decimals = event.params.decimals;
    token.save();
}
exports.handleAddAsset = handleAddAsset;
function handleSetAssetSymbol(event) {
    const pool = (0, pool_1.getOrCreateLiquidityPool)(event, event.address, constants_1.MUX_POOL_NAME, constants_1.MUX_POOL_SYMBOL);
    (0, snapshots_1.takeSnapshots)(event, pool);
    const asset = (0, token_1.getOrCreateMuxAsset)(event.params.assetId);
    const token = (0, token_1.getOrCreateToken)(event, graph_ts_1.Address.fromBytes(asset.tokenAddress));
    token.symbol = event.params.symbol.toString();
    token.save();
}
exports.handleSetAssetSymbol = handleSetAssetSymbol;
function handleUpdateFundingRate(event) {
    const pool = (0, pool_1.getOrCreateLiquidityPool)(event, event.address, constants_1.MUX_POOL_NAME, constants_1.MUX_POOL_SYMBOL);
    (0, snapshots_1.takeSnapshots)(event, pool);
    const asset = (0, token_1.getOrCreateMuxAsset)(event.params.tokenId);
    const token = (0, token_1.getOrCreateToken)(event, graph_ts_1.Address.fromBytes(asset.tokenAddress));
    (0, pool_1.updatePoolFundingRate)(event, pool, token, (0, numbers_1.convertToDecimal)(event.params.longFundingRate, constants_1.MUX_FUNDING_DECIMALS));
}
exports.handleUpdateFundingRate = handleUpdateFundingRate;
function handleOpenPositionOld(event) {
    handleMuxUpdatePositionEvent(event, event.params.args.subAccountId, event.params.trader, event.params.args.collateralId, event.params.args.collateralPrice, constants_1.BIGINT_ZERO, event.params.assetId, event.params.args.amount, event.params.args.assetPrice, event.params.args.feeUsd, event.params.args.isLong, event_1.EventType.CollateralIn, constants_1.BIGINT_ZERO);
}
exports.handleOpenPositionOld = handleOpenPositionOld;
function handleOpenPosition(event) {
    handleMuxUpdatePositionEvent(event, event.params.args.subAccountId, event.params.trader, event.params.args.collateralId, event.params.args.collateralPrice, event.params.args.remainCollateral, event.params.assetId, event.params.args.amount, event.params.args.assetPrice, event.params.args.feeUsd, event.params.args.isLong, event_1.EventType.CollateralIn, constants_1.BIGINT_ZERO);
}
exports.handleOpenPosition = handleOpenPosition;
function handleClosePositionOld(event) {
    handleMuxUpdatePositionEvent(event, event.params.args.subAccountId, event.params.trader, event.params.args.collateralId, event.params.args.collateralPrice, constants_1.BIGINT_ZERO, event.params.assetId, event.params.args.amount, event.params.args.assetPrice, event.params.args.feeUsd, event.params.args.isLong, event_1.EventType.CollateralOut, event.params.args.pnlUsd);
}
exports.handleClosePositionOld = handleClosePositionOld;
function handleClosePosition(event) {
    handleMuxUpdatePositionEvent(event, event.params.args.subAccountId, event.params.trader, event.params.args.collateralId, event.params.args.collateralPrice, event.params.args.remainCollateral, event.params.assetId, event.params.args.amount, event.params.args.assetPrice, event.params.args.feeUsd, event.params.args.isLong, event_1.EventType.CollateralOut, event.params.args.pnlUsd);
}
exports.handleClosePosition = handleClosePosition;
function handleLiquidatePositionOld(event) {
    handleMuxUpdatePositionEvent(event, event.params.args.subAccountId, event.params.trader, event.params.args.collateralId, event.params.args.collateralPrice, constants_1.BIGINT_ZERO, event.params.assetId, event.params.args.amount, event.params.args.assetPrice, event.params.args.feeUsd, event.params.args.isLong, event_1.EventType.Liquidated, event.params.args.pnlUsd);
}
exports.handleLiquidatePositionOld = handleLiquidatePositionOld;
function handleLiquidatePosition(event) {
    handleMuxUpdatePositionEvent(event, event.params.args.subAccountId, event.params.trader, event.params.args.collateralId, event.params.args.collateralPrice, event.params.args.remainCollateral, event.params.assetId, event.params.args.amount, event.params.args.assetPrice, event.params.args.feeUsd, event.params.args.isLong, event_1.EventType.Liquidated, event.params.args.pnlUsd);
}
exports.handleLiquidatePosition = handleLiquidatePosition;
function handleMuxUpdatePositionEvent(event, positionKey, accountAddress, collateralTokenId, collateralTokenPrice, collateralAmountRemain, indexTokenId, indexTokenAmoutDelta, indexTokenPrice, fee, isLong, eventType, pnl) {
    const pool = (0, pool_1.getOrCreateLiquidityPool)(event, event.address, constants_1.MUX_POOL_NAME, constants_1.MUX_POOL_SYMBOL);
    (0, snapshots_1.takeSnapshots)(event, pool);
    const account = (0, account_1.getOrCreateAccount)(event, pool, accountAddress);
    (0, account_1.incrementAccountEventCount)(event, pool, account, eventType, indexTokenAmoutDelta);
    (0, protocol_1.incrementProtocolEventCount)(event, eventType, indexTokenAmoutDelta);
    const indexTokenAddress = graph_ts_1.Address.fromBytes((0, token_1.getOrCreateMuxAsset)(indexTokenId).tokenAddress);
    const indexToken = (0, token_1.getOrCreateToken)(event, indexTokenAddress);
    const indexTokenPriceUSD = (0, numbers_1.convertToDecimal)(indexTokenPrice);
    (0, token_1.updateTokenPrice)(event, indexToken, indexTokenPriceUSD);
    const sizeUSDDelta = (0, numbers_1.convertToDecimal)(indexTokenAmoutDelta).times(indexTokenPriceUSD);
    const collateralTokenAddress = graph_ts_1.Address.fromBytes((0, token_1.getOrCreateMuxAsset)(collateralTokenId).tokenAddress);
    let positionSide = constants_1.PositionSide.SHORT;
    if (isLong) {
        positionSide = constants_1.PositionSide.LONG;
    }
    let prevCollateralTokenAmount = constants_1.BIGINT_ZERO;
    if (eventType == event_1.EventType.CollateralIn) {
        const existingPosition = (0, position_1.getUserPosition)(account, pool, collateralTokenAddress, indexTokenAddress, positionSide);
        if (existingPosition) {
            prevCollateralTokenAmount = existingPosition.collateralBalance;
        }
        else {
            (0, position_1.createPositionMap)(positionKey, account, pool, collateralTokenAddress, indexTokenAddress, positionSide);
        }
    }
    const collateralToken = (0, token_1.getOrCreateToken)(event, collateralTokenAddress);
    let collateralAmountDelta = collateralAmountRemain.minus(prevCollateralTokenAmount);
    if (collateralAmountDelta < constants_1.BIGINT_ZERO) {
        collateralAmountDelta = collateralAmountDelta.times(constants_1.BIGINT_NEGONE);
    }
    const collateralTokenPriceUSD = (0, numbers_1.convertToDecimal)(collateralTokenPrice);
    (0, token_1.updateTokenPrice)(event, collateralToken, collateralTokenPriceUSD);
    const collateralUSDDelta = (0, numbers_1.convertToDecimal)(collateralAmountDelta).times(collateralTokenPriceUSD);
    const pnlUSD = (0, numbers_1.convertToDecimal)(pnl);
    let positionBalance = constants_1.BIGINT_ZERO;
    let positionBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    let positionCollateralBalance = constants_1.BIGINT_ZERO;
    let positionCollateralBalanceUSD = constants_1.BIGDECIMAL_ZERO;
    const poolContract = LiquidityPool_1.LiquidityPool.bind(event.address);
    const tryGetSubAccount = poolContract.try_getSubAccount(positionKey);
    if (!tryGetSubAccount.reverted) {
        positionBalance = (0, numbers_1.bigDecimalToBigInt)(tryGetSubAccount.value
            .getSize()
            .divDecimal((0, numbers_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS - indexToken.decimals)));
        positionBalanceUSD = (0, numbers_1.convertToDecimal)(tryGetSubAccount.value.getSize()).times(indexTokenPriceUSD);
        positionCollateralBalance = (0, numbers_1.bigDecimalToBigInt)(tryGetSubAccount.value
            .getCollateral()
            .divDecimal((0, numbers_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS - collateralToken.decimals)));
        positionCollateralBalanceUSD = (0, numbers_1.convertToDecimal)(tryGetSubAccount.value.getCollateral()).times(collateralTokenPriceUSD);
    }
    (0, pool_1.increasePoolPremium)(event, pool, (0, numbers_1.convertToDecimal)(fee), eventType);
    (0, handlers_1.handleUpdatePositionEvent)(event, pool, account, collateralToken, collateralAmountDelta, collateralUSDDelta, positionCollateralBalance, positionCollateralBalanceUSD, indexToken, sizeUSDDelta, positionBalance, positionBalanceUSD, pnlUSD, isLong, eventType, pnlUSD);
}
exports.handleMuxUpdatePositionEvent = handleMuxUpdatePositionEvent;
function handleAddLiquidity(event) {
    handleUpdateLiquidityEvent(event, event.params.trader, event.params.tokenId, event.params.tokenPrice, event.params.mlpAmount, event.params.mlpPrice, event.params.fee, event_1.EventType.Deposit);
}
exports.handleAddLiquidity = handleAddLiquidity;
function handleRemoveLiquidity(event) {
    handleUpdateLiquidityEvent(event, event.params.trader, event.params.tokenId, event.params.tokenPrice, event.params.mlpAmount, event.params.mlpPrice, event.params.fee, event_1.EventType.Withdraw);
}
exports.handleRemoveLiquidity = handleRemoveLiquidity;
function handleUpdateLiquidityEvent(event, accountAddress, inputTokenId, inputTokenPrice, outputTokenAmount, outputTokenPrice, fee, eventType) {
    const pool = (0, pool_1.getOrCreateLiquidityPool)(event, event.address, constants_1.MUX_POOL_NAME, constants_1.MUX_POOL_SYMBOL);
    (0, snapshots_1.takeSnapshots)(event, pool);
    const account = (0, account_1.getOrCreateAccount)(event, pool, accountAddress);
    (0, account_1.incrementAccountEventCount)(event, pool, account, eventType, constants_1.BIGINT_ZERO);
    (0, protocol_1.incrementProtocolEventCount)(event, eventType, constants_1.BIGINT_ZERO);
    const inputAsset = (0, token_1.getOrCreateMuxAsset)(inputTokenId);
    const inputTokenAddress = graph_ts_1.Address.fromBytes(inputAsset.tokenAddress);
    const inputToken = (0, token_1.getOrCreateToken)(event, inputTokenAddress);
    const inputTokenPriceUSD = (0, numbers_1.convertToDecimal)(inputTokenPrice);
    (0, token_1.updateTokenPrice)(event, inputToken, inputTokenPriceUSD);
    const usdAmount = (0, numbers_1.convertToDecimal)(outputTokenAmount, constants_1.DEFAULT_DECIMALS).times((0, numbers_1.convertToDecimal)(outputTokenPrice, constants_1.DEFAULT_DECIMALS));
    const inputTokenAmount = (0, numbers_1.bigDecimalToBigInt)(usdAmount
        .times((0, numbers_1.exponentToBigDecimal)(inputToken.decimals))
        .div(inputTokenPriceUSD));
    (0, pool_1.updatePoolInputTokenBalance)(event, pool, inputToken, inputTokenAmount, eventType);
    if (eventType == event_1.EventType.Deposit) {
        if (!pool.outputToken) {
            (0, pool_1.updatePoolOutputToken)(event, pool, graph_ts_1.Address.fromBytes(configure_1.NetworkConfigs.getMUXLPAddress()));
        }
        (0, event_1.createDeposit)(event, pool, accountAddress, inputTokenAddress, inputTokenAmount, usdAmount, outputTokenAmount);
    }
    else if (eventType == event_1.EventType.Withdraw) {
        (0, event_1.createWithdraw)(event, pool, accountAddress, inputTokenAddress, inputTokenAmount, usdAmount, outputTokenAmount);
    }
    (0, pool_1.updatePoolTvl)(event, pool, outputTokenAmount, outputTokenPrice, eventType);
    (0, snapshots_1.updateTempUsageMetrics)(event, accountAddress, eventType, constants_1.INT_ZERO, null);
}
function handleNotifyFeeReward(event) {
    const pool = (0, pool_1.getOrCreateLiquidityPool)(event, graph_ts_1.Address.fromBytes(configure_1.NetworkConfigs.getPoolAddress()), constants_1.MUX_POOL_NAME, constants_1.MUX_POOL_SYMBOL);
    (0, snapshots_1.takeSnapshots)(event, pool);
    const feeDistributorContract = FeeDistributor_1.FeeDistributor.bind(event.address);
    const tryRewardToken = feeDistributorContract.try_rewardToken();
    if (tryRewardToken.reverted) {
        return;
    }
    const rewardTokenAddress = tryRewardToken.value;
    // Based on the emissions rate for the pool, calculate the rewards per day for the pool.
    const tokensPerDay = event.params.rewardRate.times(graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_DAY));
    const rewardToken = (0, token_1.getOrCreateRewardToken)(event, rewardTokenAddress, constants_1.RewardTokenType.DEPOSIT.toString());
    const token = (0, token_1.getOrCreateToken)(event, rewardTokenAddress);
    const tokensPerDayUSD = (0, numbers_1.convertToDecimal)(tokensPerDay, token.decimals).times(token.lastPriceUSD);
    (0, pool_1.updatePoolRewardToken)(event, pool, rewardToken, tokensPerDay, tokensPerDayUSD);
}
exports.handleNotifyFeeReward = handleNotifyFeeReward;
function handleFeeDistribute(event) {
    const pool = (0, pool_1.getOrCreateLiquidityPool)(event, graph_ts_1.Address.fromBytes(configure_1.NetworkConfigs.getPoolAddress()), constants_1.MUX_POOL_NAME, constants_1.MUX_POOL_SYMBOL);
    (0, snapshots_1.takeSnapshots)(event, pool);
    const feeDistributorContract = FeeDistributor_1.FeeDistributor.bind(event.address);
    const tryRewardToken = feeDistributorContract.try_rewardToken();
    if (tryRewardToken.reverted) {
        return;
    }
    const token = (0, token_1.getOrCreateToken)(event, tryRewardToken.value);
    (0, pool_1.increasePoolTotalRevenue)(event, pool, (0, numbers_1.convertToDecimal)(event.params.amount, token.decimals).times(token.lastPriceUSD));
    (0, pool_1.increasePoolSupplySideRevenue)(event, pool, (0, numbers_1.convertToDecimal)(event.params.toMlpAmount, token.decimals).times(token.lastPriceUSD));
    (0, pool_1.increasePoolProtocolSideRevenue)(event, pool, (0, numbers_1.convertToDecimal)(event.params.toPorAmount, token.decimals).times(token.lastPriceUSD));
    (0, pool_1.increasePoolStakeSideRevenue)(event, pool, (0, numbers_1.convertToDecimal)(event.params.toMuxAmount, token.decimals).times(token.lastPriceUSD));
}
exports.handleFeeDistribute = handleFeeDistribute;
function handleSetMuxRewardRate(event) {
    const pool = (0, pool_1.getOrCreateLiquidityPool)(event, graph_ts_1.Address.fromBytes(configure_1.NetworkConfigs.getPoolAddress()), constants_1.MUX_POOL_NAME, constants_1.MUX_POOL_SYMBOL);
    (0, snapshots_1.takeSnapshots)(event, pool);
    const muxDistributorContract = MuxDistributor_1.MuxDistributor.bind(event.address);
    const tryRewardToken = muxDistributorContract.try_rewardToken();
    if (tryRewardToken.reverted) {
        return;
    }
    const rewardTokenAddress = tryRewardToken.value;
    // Based on the emissions rate for the pool, calculate the rewards per day for the pool.
    const tokensPerDay = event.params.newRewardRate.times(graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_DAY));
    const rewardToken = (0, token_1.getOrCreateRewardToken)(event, rewardTokenAddress, constants_1.RewardTokenType.STAKE.toString());
    const token = (0, token_1.getOrCreateToken)(event, rewardTokenAddress);
    const tokensPerDayUSD = (0, numbers_1.convertToDecimal)(tokensPerDay, token.decimals).times(token.lastPriceUSD);
    (0, pool_1.updatePoolRewardToken)(event, pool, rewardToken, tokensPerDay, tokensPerDayUSD);
}
exports.handleSetMuxRewardRate = handleSetMuxRewardRate;
