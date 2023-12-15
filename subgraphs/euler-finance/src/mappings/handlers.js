"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStake = exports.handleGovSetPricingConfig = exports.handleGovSetReserveFee = exports.handleGovConvertReserves = exports.handleMarketActivated = exports.handleGovSetAssetConfig = exports.handleLiquidation = exports.handleWithdraw = exports.handleRepay = exports.handleDeposit = exports.handleBorrow = exports.handleAssetStatus = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Euler_1 = require("../../generated/euler/Euler");
const getters_1 = require("../common/getters");
const constants_1 = require("../common/constants");
const helpers_1 = require("./helpers");
const helpers_2 = require("./helpers");
const schema_1 = require("../../generated/schema");
const ERC20_1 = require("../../generated/euler/ERC20");
const conversions_1 = require("../common/conversions");
const schema_2 = require("../../generated/schema");
const Markets_1 = require("../../generated/euler/Markets");
function handleAssetStatus(event) {
    // https://etherscan.io/tx/0xc310a0affe2169d1f6feec1c63dbc7f7c62a887fa48795d327d4d2da2d6b111d
    const EULER_HACK_BLOCK_NUMBER = graph_ts_1.BigInt.fromI32(16817996);
    if (event.block.number.ge(EULER_HACK_BLOCK_NUMBER)) {
        _handleAssetStatusPostHack(event);
        return;
    }
    const underlying = event.params.underlying.toHexString();
    const totalBorrows = event.params.totalBorrows; //== dToken totalSupply
    const totalBalances = event.params.totalBalances; //== eToken totalSupply
    const reserveBalance = event.params.reserveBalance;
    const poolSize = event.params.poolSize;
    const interestRate = event.params.interestRate;
    const assetStatus = (0, getters_1.getOrCreateAssetStatus)(underlying);
    const marketId = assetStatus.eToken;
    const protocol = (0, getters_1.getOrCreateLendingProtocol)();
    const market = (0, getters_1.getOrCreateMarket)(marketId);
    const token = schema_1.Token.load(underlying);
    // totalBorrows is divided by INTERNAL_DEBT_PRECISION in logAssetStatus()
    // https://github.com/euler-xyz/euler-contracts/blob/dfaa7788b17ac7c2a826a3ed242d7181998a778f/contracts/BaseLogic.sol#L346
    const totalBorrowBalance = (0, conversions_1.bigIntChangeDecimals)(totalBorrows, constants_1.DEFAULT_DECIMALS, token.decimals);
    const totalDepositBalance = (0, conversions_1.bigIntChangeDecimals)(poolSize.plus(totalBorrows), constants_1.DEFAULT_DECIMALS, token.decimals);
    if (totalBalances.gt(constants_1.BIGINT_ZERO)) {
        market.exchangeRate = (0, conversions_1.bigIntToBDUseDecimals)(totalDepositBalance, token.decimals).div((0, conversions_1.bigIntToBDUseDecimals)(totalBalances, constants_1.DEFAULT_DECIMALS));
    }
    // tvl, totalDepositBalanceUSD and totalBorrowBalanceUSD may be updated again with new price
    updateBalances(token, protocol, market, totalBalances, totalBorrows, totalDepositBalance, totalBorrowBalance);
    if (interestRate.notEqual(assetStatus.interestRate)) {
        // update interest rates if `interestRate` or `reserveFee` changed
        (0, helpers_2.updateInterestRates)(market, interestRate, assetStatus.reserveFee, totalBorrows, totalBalances, event);
    }
    (0, helpers_2.updateRevenue)(reserveBalance, totalBalances, totalBorrows, protocol, market, assetStatus, event);
    (0, helpers_1.snapshotMarket)(event.block, marketId, constants_1.BIGDECIMAL_ZERO, null);
    // update prices, tvl, totalDepositBalanceUSD, totalBorrowBalanceUSD every 75 blocks (~15 min)
    updateProtocolTVL(event, protocol);
    (0, helpers_1.snapshotFinancials)(event.block, constants_1.BIGDECIMAL_ZERO, null, protocol);
    assetStatus.totalBorrows = totalBorrows;
    assetStatus.totalBalances = totalBalances;
    assetStatus.reserveBalance = reserveBalance;
    assetStatus.interestRate = interestRate;
    assetStatus.timestamp = event.params.timestamp;
    assetStatus.save();
}
exports.handleAssetStatus = handleAssetStatus;
function _handleAssetStatusPostHack(event) {
    const underlying = event.params.underlying.toHexString();
    const assetStatus = (0, getters_1.getOrCreateAssetStatus)(underlying);
    const marketId = assetStatus.eToken;
    const protocol = (0, getters_1.getOrCreateLendingProtocol)();
    const market = (0, getters_1.getOrCreateMarket)(marketId);
    const token = schema_1.Token.load(underlying);
    const erc20Contract = ERC20_1.ERC20.bind(event.params.underlying);
    const erc20TokenBal = erc20Contract.balanceOf(graph_ts_1.Address.fromString(constants_1.EULER_ADDRESS));
    const eTokenAddress = graph_ts_1.Address.fromString(assetStatus.eToken);
    const eToken = ERC20_1.ERC20.bind(eTokenAddress);
    const eTokenTotalSupplyResult = eToken.try_totalSupply();
    const dTokenAddress = graph_ts_1.Address.fromString(market._dToken);
    const dToken = ERC20_1.ERC20.bind(dTokenAddress);
    const dTokenTotalSupplyResult = dToken.try_totalSupply();
    if (eTokenTotalSupplyResult.reverted || dTokenTotalSupplyResult.reverted) {
        graph_ts_1.log.error("eToken or dToken try_totalSupply() call reverted at tx {}-{}", [
            event.transaction.hash.toHexString(),
            event.transactionLogIndex.toString(),
        ]);
        return;
    }
    // These don't work as the dToken.totalSupply() doesn't account for the hack
    //const borrowBalance = bigIntChangeDecimals(dTokenTotalSupplyResult.value, DEFAULT_DECIMALS, token.decimals);
    //const borrowBalanceUSD = bigIntToBDUseDecimals(borrowBalance, token.decimals).times(token.lastPriceUSD!);
    // Keep _totalBorrowBalance unchanged (ignore the hack)
    const borrowBalance = market._totalBorrowBalance;
    const borrowBalanceUSD = market.totalBorrowBalanceUSD;
    const totalDepositBalance = erc20TokenBal.plus(borrowBalance);
    const totalDepositBalanceUSD = (0, conversions_1.bigIntToBDUseDecimals)(totalDepositBalance, token.decimals).times(token.lastPriceUSD);
    protocol.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD
        .plus(totalDepositBalanceUSD)
        .minus(market.totalDepositBalanceUSD);
    protocol.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD
        .plus(borrowBalanceUSD)
        .minus(market.totalBorrowBalanceUSD);
    protocol.totalValueLockedUSD = protocol.totalDepositBalanceUSD;
    protocol.save();
    graph_ts_1.log.info("[_handleAssetStatusPostHack]protocol.totalValueLockedUSD={},protocol.totalBorrowBalanceUSD={}", [
        protocol.totalValueLockedUSD.toString(),
        protocol.totalBorrowBalanceUSD.toString(),
    ]);
    market.totalDepositBalanceUSD = totalDepositBalanceUSD;
    market.totalBorrowBalanceUSD = borrowBalanceUSD;
    market.totalValueLockedUSD = market.totalDepositBalanceUSD;
    market.inputTokenBalance = totalDepositBalance;
    market.outputTokenSupply = eTokenTotalSupplyResult.value;
    market.save();
    graph_ts_1.log.info("[_handleAssetStatusPostHack]market {}/{} totalValueLockedUSD={}, totalBorrowBalanceUSD={} tx {}-{}", [
        market.id,
        market.name ? market.name : "",
        market.totalValueLockedUSD.toString(),
        market.totalBorrowBalanceUSD.toString(),
        event.transaction.hash.toHexString(),
        event.transactionLogIndex.toString(),
    ]);
    (0, helpers_1.snapshotMarket)(event.block, marketId, constants_1.BIGDECIMAL_ZERO, null);
    (0, helpers_1.snapshotFinancials)(event.block, constants_1.BIGDECIMAL_ZERO, null, protocol);
}
function updateProtocolTVL(event, protocol) {
    if (event.block.number.ge(protocol._lastUpdateBlockNumber.plus(constants_1.BIGINT_SEVENTY_FIVE))) {
        const eulerContract = Euler_1.Euler.bind(graph_ts_1.Address.fromString(constants_1.EULER_ADDRESS));
        const execProxyAddress = eulerContract.moduleIdToProxy(constants_1.MODULEID__EXEC);
        let totalDepositBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        let totalBorrowBalanceUSD = constants_1.BIGDECIMAL_ZERO;
        for (let i = 0; i < protocol._marketIDs.length; i++) {
            const mrktID = protocol._marketIDs[i];
            const mrkt = (0, getters_1.getOrCreateMarket)(mrktID);
            const tkn = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(mrkt.inputToken));
            const currPriceUSD = (0, helpers_2.updatePrices)(execProxyAddress, mrkt, event);
            const underlyingPriceUSD = currPriceUSD ? currPriceUSD : mrkt.inputTokenPriceUSD;
            // mark-to-market
            mrkt.totalDepositBalanceUSD = (0, conversions_1.bigIntToBDUseDecimals)(mrkt.inputTokenBalance, tkn.decimals).times(underlyingPriceUSD);
            mrkt.totalBorrowBalanceUSD = (0, conversions_1.bigIntToBDUseDecimals)(mrkt._totalBorrowBalance, tkn.decimals).times(underlyingPriceUSD);
            mrkt.totalValueLockedUSD = mrkt.totalDepositBalanceUSD;
            mrkt.save();
            totalDepositBalanceUSD = totalDepositBalanceUSD.plus(mrkt.totalDepositBalanceUSD);
            totalBorrowBalanceUSD = totalBorrowBalanceUSD.plus(mrkt.totalBorrowBalanceUSD);
        }
        protocol.totalDepositBalanceUSD = totalDepositBalanceUSD;
        protocol.totalBorrowBalanceUSD = totalBorrowBalanceUSD;
        protocol.totalValueLockedUSD = totalDepositBalanceUSD;
        protocol._lastUpdateBlockNumber = event.block.number;
        protocol.save();
    }
}
function updateBalances(token, protocol, market, totalBalances, totalBorrows, totalDepositBalance, totalBorrowBalance) {
    const newTotalDepositBalanceUSD = (0, conversions_1.bigIntToBDUseDecimals)(totalDepositBalance, token.decimals).times(token.lastPriceUSD);
    const newTotalBorrowBalanceUSD = (0, conversions_1.bigIntToBDUseDecimals)(totalBorrowBalance, token.decimals).times(token.lastPriceUSD);
    protocol.totalDepositBalanceUSD = protocol.totalDepositBalanceUSD
        .plus(newTotalDepositBalanceUSD)
        .minus(market.totalDepositBalanceUSD);
    protocol.totalBorrowBalanceUSD = protocol.totalBorrowBalanceUSD
        .plus(newTotalBorrowBalanceUSD)
        .minus(market.totalBorrowBalanceUSD);
    protocol.totalValueLockedUSD = protocol.totalDepositBalanceUSD;
    protocol.save();
    market.totalDepositBalanceUSD = newTotalDepositBalanceUSD;
    market.totalBorrowBalanceUSD = newTotalBorrowBalanceUSD;
    market.totalValueLockedUSD = market.totalDepositBalanceUSD;
    market.inputTokenBalance = totalDepositBalance;
    market.outputTokenSupply = totalBalances;
    market._totalBorrowBalance = totalBorrowBalance;
    const dTokenAddress = graph_ts_1.Address.fromString(market._dToken);
    const dToken = ERC20_1.ERC20.bind(dTokenAddress);
    // these should always equal
    // totalBorrows == dTokenTotalSupply
    if (totalBorrows.gt(constants_1.BIGINT_ZERO)) {
        const dTokenTotalSupply = dToken.totalSupply();
        if (dTokenTotalSupply.gt(constants_1.BIGINT_ZERO)) {
            market._dTokenExchangeRate = (0, conversions_1.bigIntToBDUseDecimals)(totalBorrowBalance, token.decimals).div((0, conversions_1.bigIntToBDUseDecimals)(dTokenTotalSupply, constants_1.DEFAULT_DECIMALS));
        }
    }
    market.save();
}
function handleBorrow(event) {
    const borrowUSD = (0, helpers_2.createBorrow)(event);
    const underlying = event.params.underlying.toHexString();
    const assetStatus = (0, getters_1.getOrCreateAssetStatus)(underlying);
    const marketId = assetStatus.eToken;
    (0, helpers_1.updateUsageMetrics)(event, event.params.account, constants_1.TransactionType.BORROW);
    (0, helpers_1.snapshotMarket)(event.block, marketId, borrowUSD, constants_1.TransactionType.BORROW);
    (0, helpers_1.snapshotFinancials)(event.block, borrowUSD, constants_1.TransactionType.BORROW);
}
exports.handleBorrow = handleBorrow;
function handleDeposit(event) {
    const depositUSD = (0, helpers_2.createDeposit)(event);
    const underlying = event.params.underlying.toHexString();
    const assetStatus = (0, getters_1.getOrCreateAssetStatus)(underlying);
    const marketId = assetStatus.eToken;
    (0, helpers_1.updateUsageMetrics)(event, event.params.account, constants_1.TransactionType.DEPOSIT);
    (0, helpers_1.snapshotMarket)(event.block, marketId, depositUSD, constants_1.TransactionType.DEPOSIT);
    (0, helpers_1.snapshotFinancials)(event.block, depositUSD, constants_1.TransactionType.DEPOSIT);
}
exports.handleDeposit = handleDeposit;
function handleRepay(event) {
    const repayUSD = (0, helpers_2.createRepay)(event);
    const underlying = event.params.underlying.toHexString();
    const assetStatus = (0, getters_1.getOrCreateAssetStatus)(underlying);
    const marketId = assetStatus.eToken;
    (0, helpers_1.updateUsageMetrics)(event, event.params.account, constants_1.TransactionType.REPAY);
    (0, helpers_1.snapshotMarket)(event.block, marketId, repayUSD, constants_1.TransactionType.REPAY);
    (0, helpers_1.snapshotFinancials)(event.block, repayUSD, constants_1.TransactionType.REPAY);
}
exports.handleRepay = handleRepay;
function handleWithdraw(event) {
    const withdrawUSD = (0, helpers_2.createWithdraw)(event);
    const underlying = event.params.underlying.toHexString();
    const assetStatus = (0, getters_1.getOrCreateAssetStatus)(underlying);
    const marketId = assetStatus.eToken;
    (0, helpers_1.updateUsageMetrics)(event, event.params.account, constants_1.TransactionType.WITHDRAW);
    (0, helpers_1.snapshotMarket)(event.block, marketId, withdrawUSD, constants_1.TransactionType.WITHDRAW);
    (0, helpers_1.snapshotFinancials)(event.block, withdrawUSD, constants_1.TransactionType.WITHDRAW);
}
exports.handleWithdraw = handleWithdraw;
function handleLiquidation(event) {
    const liquidateUSD = (0, helpers_2.createLiquidation)(event);
    const underlying = event.params.underlying.toHexString();
    const assetStatus = (0, getters_1.getOrCreateAssetStatus)(underlying);
    const marketId = assetStatus.eToken;
    (0, helpers_1.updateUsageMetrics)(event, event.params.liquidator, constants_1.TransactionType.LIQUIDATE);
    (0, helpers_1.snapshotMarket)(event.block, marketId, liquidateUSD, constants_1.TransactionType.LIQUIDATE);
    (0, helpers_1.snapshotFinancials)(event.block, liquidateUSD, constants_1.TransactionType.LIQUIDATE);
}
exports.handleLiquidation = handleLiquidation;
function handleGovSetAssetConfig(event) {
    /**
     * Euler has different collateral and borrow factors for all assets. This means that, in theory, there
     * would be maximumLTV and collateralThreshold for every possible asset pair.
     *
     * For the sake of simplicity:
     *  The maximumLTV is the collateral factor. This is the risk-adjusted liquidity of assets in a market
     *  The liquidationThreshold is the borrow factor. If the borrow goes over the borrow factor
     *                times the collateral factor of the collateral's market the borrow is at
     *                risk of liquidation.
     *
     * maximumLTV = collateralFactor
     * liquidationThreshold = borrowFactor
     */
    const underlying = event.params.underlying.toHexString();
    const assetStatus = (0, getters_1.getOrCreateAssetStatus)(underlying);
    const market = (0, getters_1.getOrCreateMarket)(assetStatus.eToken);
    market.maximumLTV = event.params.newConfig.collateralFactor.toBigDecimal().div(constants_1.CONFIG_FACTOR_SCALE);
    market.liquidationThreshold = event.params.newConfig.borrowFactor.toBigDecimal().div(constants_1.CONFIG_FACTOR_SCALE);
    if (market.maximumLTV.gt(constants_1.BIGDECIMAL_ZERO)) {
        market.canUseAsCollateral = true;
    }
    market.save();
}
exports.handleGovSetAssetConfig = handleGovSetAssetConfig;
function handleMarketActivated(event) {
    const underlyingToken = (0, getters_1.getOrCreateToken)(event.params.underlying);
    const eToken = (0, getters_1.getOrCreateToken)(event.params.eToken);
    const dToken = (0, getters_1.getOrCreateToken)(event.params.dToken);
    const market = (0, getters_1.getOrCreateMarket)(eToken.id);
    market.createdTimestamp = event.block.timestamp;
    market.createdBlockNumber = event.block.number;
    // Market are initialized in isolated tier, which means currency can't be used as collateral.
    // https://docs.euler.finance/risk-framework/tiers
    // for borrowIsolated tier assetConfig({borrowIsolated: true})
    // for cross tier assetConfig({borrowIsolated: false, collateralFactor: 0})
    // for collateral tier assetConfig({borrowIsolated: false, collateralFactor: > 0})
    market.canUseAsCollateral = false; //initial collateralFactor=0, reset in handleGovSetAssetConfig
    market.canBorrowFrom = true;
    market.name = eToken.name;
    market.inputToken = underlyingToken.id;
    market.outputToken = eToken.id;
    market._dToken = dToken.id;
    // used to determine eligibility of EUL distribution from Epoch 18+
    const marketContract = Markets_1.Markets.bind(event.address);
    const assetStorageResult = marketContract.try_getPricingConfig(event.params.underlying);
    if (!assetStorageResult.reverted) {
        market._pricingType = assetStorageResult.value.getPricingType();
    }
    market.save();
    const assetStatus = (0, getters_1.getOrCreateAssetStatus)(underlyingToken.id);
    assetStatus.eToken = eToken.id;
    assetStatus.dToken = dToken.id;
    assetStatus.save();
}
exports.handleMarketActivated = handleMarketActivated;
function handleGovConvertReserves(event) {
    const assetStatus = (0, getters_1.getOrCreateAssetStatus)(event.params.underlying.toHexString());
    assetStatus.reserveBalance = assetStatus.reserveBalance.minus(event.params.amount);
    assetStatus.save();
}
exports.handleGovConvertReserves = handleGovConvertReserves;
function handleGovSetReserveFee(event) {
    const underlying = event.params.underlying.toHexString();
    const assetStatus = (0, getters_1.getOrCreateAssetStatus)(underlying);
    assetStatus.reserveFee = event.params.newReserveFee;
    assetStatus.save();
    //need to update supplier interest rate when reserve fee changes
    const market = (0, getters_1.getOrCreateMarket)(assetStatus.eToken);
    (0, helpers_2.updateInterestRates)(market, assetStatus.interestRate, assetStatus.reserveFee, assetStatus.totalBorrows, assetStatus.totalBalances, event);
}
exports.handleGovSetReserveFee = handleGovSetReserveFee;
function handleGovSetPricingConfig(event) {
    const assetStatus = (0, getters_1.getOrCreateAssetStatus)(event.params.underlying.toHexString());
    const market = (0, getters_1.getOrCreateMarket)(assetStatus.eToken);
    market._pricingType = event.params.newPricingType;
    market.save();
}
exports.handleGovSetPricingConfig = handleGovSetPricingConfig;
function handleStake(event) {
    const underlying = event.params.underlying.toHexString();
    // find market id for underlying
    const assetStatus = (0, getters_1.getOrCreateAssetStatus)(underlying);
    const marketId = assetStatus.eToken;
    const market = (0, getters_1.getOrCreateMarket)(marketId);
    const deltaStakedAmount = (0, getters_1.getDeltaStakeAmount)(event);
    // keep track of staked amount from epoch 1
    const epochID = (0, getters_1.getCurrentEpoch)(event);
    if (epochID < 0) {
        market._stakedAmount = market._stakedAmount.plus(deltaStakedAmount);
        market.save();
        return;
    }
    const epochStartBlock = (0, getters_1.getStartBlockForEpoch)(epochID);
    let epoch = schema_2._Epoch.load(epochID.toString());
    if (!epoch) {
        //Start of a new epoch
        epoch = new schema_2._Epoch(epochID.toString());
        epoch.epoch = epochID;
        epoch.save();
        if (epoch.epoch <= 17) {
            (0, helpers_1.processRewardEpoch6_17)(epoch, epochStartBlock, event);
        }
        else if (epoch.epoch <= 23) {
            (0, helpers_1.processRewardEpoch18_23)(epoch, epochStartBlock, event);
        }
        else {
            (0, helpers_1.processRewardEpoch24Onward)(epoch, epochStartBlock, event);
        }
    }
    // In a valid epoch (6 <= epoch <=96) with uninitialized market._stakeLastUpdateBlock
    if (!market._stakeLastUpdateBlock) {
        market._stakeLastUpdateBlock = epochStartBlock;
        market._weightedStakedAmount = constants_1.BIGINT_ZERO;
    }
    // update _weightedStakeAmount before updating _stakedAmount
    (0, helpers_1.updateWeightedStakedAmount)(market, event.block.number);
    market._stakedAmount = market._stakedAmount.plus(deltaStakedAmount);
    market.save();
}
exports.handleStake = handleStake;
