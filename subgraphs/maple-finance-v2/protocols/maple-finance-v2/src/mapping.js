"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLoanAddedToTransitionLoanManager = exports.handlePortionLiquidated = exports.handleLiquidatorInstanceDeployed = exports.handleLoanManagerInstanceDeployed = exports.handlePaymentMade = exports.handleLoanInstanceDeployed = exports.handleLiquidityCapSet = exports.handleSetAsActive = exports.handleWithdraw = exports.handleDeposit = exports.handleTransfer = exports.handleLoanFunded = exports.handleManagerInstanceDeployed = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const MapleLoan_1 = require("../../../generated/templates/MapleLoan/MapleLoan");
const MapleGlobals_1 = require("../../../generated/templates/MapleLoan/MapleGlobals");
const Chainlink_1 = require("../../../generated/templates/MapleLoan/Chainlink");
const LoanManager_1 = require("../../../generated/LoanManagerFactory/LoanManager");
const Liquidator_1 = require("../../../generated/templates/Liquidator/Liquidator");
const templates_1 = require("../../../generated/templates");
const PoolManager_1 = require("../../../generated/templates/PoolManager/PoolManager");
const Pool_1 = require("../../../generated/templates/PoolManager/Pool");
const constants_1 = require("../../../src/sdk/constants");
const manager_1 = require("../../../src/sdk/manager");
const token_1 = require("../../../src/sdk/token");
const constants_2 = require("./constants");
const schema_1 = require("../../../generated/schema");
const ERC20_1 = require("../../../generated/PoolManagerFactory/ERC20");
/////////////////////
//// Pool Events ////
/////////////////////
//
// Pool created event
function handleManagerInstanceDeployed(event) {
    templates_1.PoolManager.create(event.params.instance_);
    const poolManagerContract = PoolManager_1.PoolManager.bind(event.params.instance_);
    const tryPool = poolManagerContract.try_pool();
    if (tryPool.reverted) {
        graph_ts_1.log.error("[handleManagerInstanceDeployed] PoolManager contract {} does not have a pool", [event.params.instance_.toHexString()]);
        return;
    }
    templates_1.Pool.create(tryPool.value);
    const poolContract = Pool_1.Pool.bind(tryPool.value);
    const outputToken = new token_1.TokenManager(tryPool.value, event, constants_1.TokenType.REBASING);
    const tryInputToken = poolContract.try_asset();
    if (tryInputToken.reverted) {
        graph_ts_1.log.error("[handleManagerInstanceDeployed] Pool contract {} does not have an asset", [tryPool.value.toHexString()]);
        return;
    }
    const manager = new manager_1.DataManager(tryPool.value, tryInputToken.value, event, (0, constants_2.getProtocolData)());
    const market = manager.getMarket();
    manager.getOrUpdateRate(constants_1.InterestRateSide.BORROWER, constants_1.InterestRateType.VARIABLE, constants_1.BIGDECIMAL_ZERO);
    manager.getOrUpdateRate(constants_1.InterestRateSide.LENDER, constants_1.InterestRateType.VARIABLE, constants_1.BIGDECIMAL_ZERO);
    // update market with maple specifics
    market.name = outputToken.getToken().name;
    market.outputToken = outputToken.getToken().id;
    market.outputTokenSupply = constants_1.BIGINT_ZERO;
    market.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
    market.exchangeRate = constants_1.BIGDECIMAL_ZERO; // exchange rate = (inputTokenBalance / outputTokenSupply) OR (totalAssets() / totalSupply())
    market.isActive = false; // controlled with setAsActive
    market.canBorrowFrom = false; // controlled with setAsActive
    market.canUseAsCollateral = false; // collateral is posted during loans separate from any deposits
    market.borrowedToken = tryInputToken.value;
    market.stableBorrowedTokenBalance = constants_1.BIGINT_ZERO;
    market._poolManager = event.params.instance_;
    market.save();
}
exports.handleManagerInstanceDeployed = handleManagerInstanceDeployed;
//
// handles borrow creations for loans
function handleLoanFunded(event) {
    const loan = getOrCreateLoan(event.params.loan_, event);
    const loanManagerContract = LoanManager_1.LoanManager.bind(event.params.loanManager_);
    const tryPool = loanManagerContract.try_pool();
    if (tryPool.reverted) {
        graph_ts_1.log.error("[handleLoanFunded] LoanManager contract {} does not have a pool", [event.params.loanManager_.toHexString()]);
        return;
    }
    const mapleLoan = MapleLoan_1.MapleLoan.bind(graph_ts_1.Address.fromBytes(loan.id));
    const tryBorrower = mapleLoan.try_borrower();
    if (tryBorrower.reverted) {
        graph_ts_1.log.error("[handleLoanFunded] MapleLoan contract {} does not have a borrower", [loan.id.toHexString()]);
        return;
    }
    loan.borrower = tryBorrower.value;
    loan.market = graph_ts_1.Bytes.fromHexString(tryPool.value.toHexString());
    loan.loanManager = graph_ts_1.Bytes.fromHexString(event.params.loanManager_.toHexString());
    loan.save();
    const poolContract = Pool_1.Pool.bind(tryPool.value);
    const tryInputToken = poolContract.try_asset();
    if (tryInputToken.reverted) {
        graph_ts_1.log.error("[handleLoanFunded] Pool contract {} does not have an asset", [
            tryPool.value.toHexString(),
        ]);
        return;
    }
    const manager = new manager_1.DataManager(tryPool.value, tryInputToken.value, event, (0, constants_2.getProtocolData)());
    const market = manager.getMarket();
    let loans = market._loans;
    if (!loans) {
        loans = [];
    }
    loans.push(loan.id);
    market._loans = loans;
    market.save();
    const inputTokenPriceUSD = getPriceUSD(tryInputToken.value);
    const inputTokenDecimals = manager.getInputToken().decimals;
    manager.createBorrow(tryInputToken.value, tryBorrower.value, event.params.amount_, getTotalValueUSD(event.params.amount_, inputTokenDecimals, inputTokenPriceUSD), event.params.amount_, inputTokenPriceUSD, constants_1.InterestRateType.FIXED);
}
exports.handleLoanFunded = handleLoanFunded;
//
// handles money being migrated or transferred in the pool
function handleTransfer(event) {
    if (event.params.from == constants_2.ZERO_ADDRESS || event.params.to == constants_2.ZERO_ADDRESS) {
        // burns/mints are not considered
        // Also we only want to handle transfers from the migration helper
        return;
    }
    if (event.params.from == event.address || event.params.to == event.address) {
        // this is a transfer to/from the pool itself
        return;
    }
    const poolContract = Pool_1.Pool.bind(event.address);
    const tryInputToken = poolContract.try_asset();
    if (tryInputToken.reverted) {
        graph_ts_1.log.error("[handleTransfer] Pool contract {} does not have an asset", [
            event.address.toHexString(),
        ]);
        return;
    }
    const manager = new manager_1.DataManager(event.address, tryInputToken.value, event, (0, constants_2.getProtocolData)());
    updateMarketAndProtocol(manager, event);
    const market = manager.getMarket();
    const inputTokenDecimals = manager.getInputToken().decimals;
    // get amount (in inputToken) by using the exchange rate
    const amount = graph_ts_1.BigInt.fromString(event.params.value
        .toBigDecimal()
        .times(market.exchangeRate)
        .truncate(0)
        .toString());
    const amountUSD = getTotalValueUSD(amount, inputTokenDecimals, market.inputTokenPriceUSD);
    if (event.params.from == graph_ts_1.Address.fromHexString(constants_2.MIGRATION_HELPER)) {
        manager.createDeposit(market.inputToken, event.params.to, amount, amountUSD, getBalanceOf(event.address, event.params.to), constants_1.InterestRateType.VARIABLE);
    }
    else {
        manager.createTransfer(market.inputToken, event.params.from, event.params.to, amount, amountUSD, getBalanceOf(event.address, event.params.from), getBalanceOf(event.address, event.params.to), constants_1.InterestRateType.VARIABLE);
    }
}
exports.handleTransfer = handleTransfer;
//
// handle deposits to the pool
function handleDeposit(event) {
    const poolContract = Pool_1.Pool.bind(event.address);
    const tryInputToken = poolContract.try_asset();
    if (tryInputToken.reverted) {
        graph_ts_1.log.error("[handleDeposit] Pool contract {} does not have an asset", [
            event.address.toHexString(),
        ]);
        return;
    }
    const manager = new manager_1.DataManager(event.address, tryInputToken.value, event, (0, constants_2.getProtocolData)());
    updateMarketAndProtocol(manager, event);
    const market = manager.getMarket();
    const amountUSD = getTotalValueUSD(event.params.assets_, manager.getInputToken().decimals, market.inputTokenPriceUSD);
    manager.createDeposit(market.inputToken, event.params.owner_, event.params.assets_, amountUSD, getBalanceOf(event.address, event.params.owner_), constants_1.InterestRateType.VARIABLE);
}
exports.handleDeposit = handleDeposit;
//
// handle withdrawals from the pool
function handleWithdraw(event) {
    const poolContract = Pool_1.Pool.bind(event.address);
    const tryInputToken = poolContract.try_asset();
    if (tryInputToken.reverted) {
        graph_ts_1.log.error("[handleWithdraw] Pool contract {} does not have an asset", [
            event.address.toHexString(),
        ]);
        return;
    }
    const manager = new manager_1.DataManager(event.address, tryInputToken.value, event, (0, constants_2.getProtocolData)());
    updateMarketAndProtocol(manager, event);
    const market = manager.getMarket();
    const amountUSD = getTotalValueUSD(event.params.assets_, manager.getInputToken().decimals, market.inputTokenPriceUSD);
    manager.createWithdraw(market.inputToken, event.params.owner_, event.params.assets_, amountUSD, getBalanceOf(event.address, event.params.owner_), constants_1.InterestRateType.VARIABLE);
}
exports.handleWithdraw = handleWithdraw;
//
// Sets the pool as active or not (isActive / canBorrowFrom)
// canUseAsCollateral is not affected bc it is never available
function handleSetAsActive(event) {
    // get input token
    const poolManagerContract = PoolManager_1.PoolManager.bind(event.address);
    const tryAsset = poolManagerContract.try_asset();
    if (tryAsset.reverted) {
        graph_ts_1.log.error("[handleSetAsActive] PoolManager contract {} does not have an asset", [event.address.toHexString()]);
        return;
    }
    const tryPool = poolManagerContract.try_pool();
    if (tryPool.reverted) {
        graph_ts_1.log.error("[handleSetAsActive] PoolManager contract {} does not have a pool", [event.address.toHexString()]);
        return;
    }
    const manager = new manager_1.DataManager(tryPool.value, tryAsset.value, event, (0, constants_2.getProtocolData)());
    const market = manager.getMarket();
    market.isActive = event.params.active_;
    market.canBorrowFrom = event.params.active_;
    market.save();
}
exports.handleSetAsActive = handleSetAsActive;
//
// Set the supplyCap
function handleLiquidityCapSet(event) {
    // get input token
    const poolManagerContract = PoolManager_1.PoolManager.bind(event.address);
    const tryAsset = poolManagerContract.try_asset();
    if (tryAsset.reverted) {
        graph_ts_1.log.error("[handleSetAsActive] PoolManager contract {} does not have an asset", [event.address.toHexString()]);
        return;
    }
    const tryPool = poolManagerContract.try_pool();
    if (tryPool.reverted) {
        graph_ts_1.log.error("[handleSetAsActive] PoolManager contract {} does not have a pool", [event.address.toHexString()]);
        return;
    }
    const manager = new manager_1.DataManager(tryPool.value, tryAsset.value, event, (0, constants_2.getProtocolData)());
    const market = manager.getMarket();
    market.supplyCap = event.params.liquidityCap_;
    market.save();
}
exports.handleLiquidityCapSet = handleLiquidityCapSet;
/////////////////////
//// Loan Events ////
/////////////////////
//
// Create MapleLoan instance to watch loan contract
function handleLoanInstanceDeployed(event) {
    templates_1.MapleLoan.create(event.params.instance_);
    getOrCreateLoan(event.params.instance_, event);
}
exports.handleLoanInstanceDeployed = handleLoanInstanceDeployed;
//
// Handle loan repayments
function handlePaymentMade(event) {
    const loan = getOrCreateLoan(event.address, event);
    if (!loan.market) {
        graph_ts_1.log.error("[handlePaymentMade] Loan {} does not have a market", [
            event.address.toHexString(),
        ]);
        return;
    }
    const poolManagerContract = PoolManager_1.PoolManager.bind(graph_ts_1.Address.fromBytes(loan.market));
    const tryAsset = poolManagerContract.try_asset();
    if (tryAsset.reverted) {
        graph_ts_1.log.error("[handlePaymentMade] PoolManager contract {} does not have an asset", [loan.market.toHexString()]);
        return;
    }
    const manager = new manager_1.DataManager(loan.market, tryAsset.value, event, (0, constants_2.getProtocolData)());
    updateMarketAndProtocol(manager, event);
    const mapleLoanContract = MapleLoan_1.MapleLoan.bind(event.address);
    const tryPrinciple = mapleLoanContract.try_principal();
    if (tryPrinciple.reverted) {
        graph_ts_1.log.error("[handlePaymentMade] MapleLoan contract {} does not have a principal", [event.address.toHexString()]);
        return;
    }
    const tryBorrower = mapleLoanContract.try_borrower();
    if (tryBorrower.reverted) {
        graph_ts_1.log.error("[handlePaymentMade] MapleLoan contract {} does not have a borrower", [event.address.toHexString()]);
        return;
    }
    const inputTokenPriceUSD = getPriceUSD(tryAsset.value);
    const repayAmount = event.params.principalPaid_.plus(event.params.interestPaid_);
    const inputTokenDecimals = manager.getInputToken().decimals;
    manager.createRepay(tryAsset.value, tryBorrower.value, repayAmount, getTotalValueUSD(repayAmount, inputTokenDecimals, inputTokenPriceUSD), tryPrinciple.value, inputTokenPriceUSD, constants_1.InterestRateType.FIXED);
    // update protocol revenue collected
    // this is either from borrow fees, management fees or loan origination fees
    manager.addProtocolRevenue(getTotalValueUSD(event.params.fees_, inputTokenDecimals, inputTokenPriceUSD));
}
exports.handlePaymentMade = handlePaymentMade;
//////////////////////////////
//// Loan Manager Events /////
//////////////////////////////
function handleLoanManagerInstanceDeployed(event) {
    const loanManagerContract = LoanManager_1.LoanManager.bind(event.params.instance_);
    const tryPool = loanManagerContract.try_pool();
    const tryAsset = loanManagerContract.try_fundsAsset();
    if (tryPool.reverted || tryAsset.reverted) {
        graph_ts_1.log.error("[handleLoanManagerInstanceDeployed] LoanManager contract {} does not have a pool or fundsAsset", [event.params.instance_.toHexString()]);
        return;
    }
    const manager = new manager_1.DataManager(tryPool.value, tryAsset.value, event, (0, constants_2.getProtocolData)());
    const protocol = manager.getProtocol();
    if (!protocol._loanManagers) {
        protocol._loanManagers = [];
    }
    const loanManagers = protocol._loanManagers;
    loanManagers.push(event.params.instance_);
    protocol._loanManagers = loanManagers;
    protocol.save();
    const market = manager.getMarket();
    market._loanManager = graph_ts_1.Bytes.fromHexString(event.params.instance_.toHexString());
    market.save();
}
exports.handleLoanManagerInstanceDeployed = handleLoanManagerInstanceDeployed;
///////////////////////////
//// Liquidator Events ////
///////////////////////////
function handleLiquidatorInstanceDeployed(event) {
    templates_1.Liquidator.create(event.params.instance_);
}
exports.handleLiquidatorInstanceDeployed = handleLiquidatorInstanceDeployed;
//
// This is the liquidation function
// Note: We don't create liquidate events because we don't have the data to do so
function handlePortionLiquidated(event) {
    const liquidatorContract = Liquidator_1.Liquidator.bind(event.address);
    const tryLoanManager = liquidatorContract.try_loanManager();
    if (tryLoanManager.reverted) {
        graph_ts_1.log.error("[handlePortionLiquidated] Liquidator contract {} does not have a loanManager", [event.address.toHexString()]);
        return;
    }
    const loanManagerContract = LoanManager_1.LoanManager.bind(tryLoanManager.value);
    const tryPool = loanManagerContract.try_pool();
    if (tryPool.reverted) {
        graph_ts_1.log.error("[handlePortionLiquidated] LoanManager contract {} does not have a pool", [tryLoanManager.value.toHexString()]);
        return;
    }
    const poolContract = Pool_1.Pool.bind(tryPool.value);
    const tryAsset = poolContract.try_asset();
    if (tryAsset.reverted) {
        graph_ts_1.log.error("[handlePortionLiquidated] Pool contract {} does not have an asset", [tryPool.value.toHexString()]);
        return;
    }
    const manager = new manager_1.DataManager(tryPool.value, tryAsset.value, event, (0, constants_2.getProtocolData)());
    updateMarketAndProtocol(manager, event);
    const market = manager.getMarket();
    const amountUSD = getTotalValueUSD(event.params.returnedAmount_, manager.getInputToken().decimals, market.inputTokenPriceUSD);
    manager.updateTransactionData(constants_1.TransactionType.LIQUIDATE, event.params.returnedAmount_, amountUSD);
}
exports.handlePortionLiquidated = handlePortionLiquidated;
//////////////////////////
//// Migration Events ////
//////////////////////////
//
// Track loans migrated from Maple V1 to Maple V2
function handleLoanAddedToTransitionLoanManager(event) {
    templates_1.MapleLoan.create(event.params.loan_);
    const loan = getOrCreateLoan(event.params.loan_, event);
    const loanManagerContract = LoanManager_1.LoanManager.bind(event.params.loanManager_);
    const tryPool = loanManagerContract.try_pool();
    if (tryPool.reverted) {
        graph_ts_1.log.error("[handleLoanAddedToTransitionLoanManager] LoanManager contract {} does not have a pool", [event.params.loanManager_.toHexString()]);
        return;
    }
    const mapleLoan = MapleLoan_1.MapleLoan.bind(graph_ts_1.Address.fromBytes(loan.id));
    const tryBorrower = mapleLoan.try_borrower();
    if (tryBorrower.reverted) {
        graph_ts_1.log.warning("[handleLoanAddedToTransitionLoanManager] MapleLoan contract {} does not have a borrower", [loan.id.toHexString()]);
    }
    else {
        loan.borrower = tryBorrower.value;
    }
    loan.market = graph_ts_1.Bytes.fromHexString(tryPool.value.toHexString());
    loan.loanManager = graph_ts_1.Bytes.fromHexString(event.params.loanManager_.toHexString());
    loan.save();
    const poolContract = Pool_1.Pool.bind(tryPool.value);
    const tryInputToken = poolContract.try_asset();
    if (tryInputToken.reverted) {
        graph_ts_1.log.error("[handleLoanFunded] Pool contract {} does not have an asset", [
            tryPool.value.toHexString(),
        ]);
        return;
    }
    const manager = new manager_1.DataManager(tryPool.value, tryInputToken.value, event, (0, constants_2.getProtocolData)());
    const market = manager.getMarket();
    let loans = market._loans;
    if (!loans) {
        loans = [];
    }
    loans.push(loan.id);
    market._loans = loans;
    market.save();
    updateMarketAndProtocol(manager, event);
}
exports.handleLoanAddedToTransitionLoanManager = handleLoanAddedToTransitionLoanManager;
/////////////////
//// Helpers ////
/////////////////
//
// Updates the market and protocol with latest data
// Prices, balances, exchange rate, TVL, rates
function updateMarketAndProtocol(manager, event) {
    const market = manager.getMarket();
    if (!market._loanManager) {
        graph_ts_1.log.error("[updateMarketAndProtocol] Market {} does not have a loan manager", [market.id.toHexString()]);
        return;
    }
    const loanManagerContract = LoanManager_1.LoanManager.bind(graph_ts_1.Address.fromBytes(market._loanManager));
    const poolContract = Pool_1.Pool.bind(graph_ts_1.Address.fromBytes(market.id));
    const tryBalance = poolContract.try_totalAssets(); // input tokens
    const tryTotalSupply = poolContract.try_totalSupply(); // output tokens
    if (tryBalance.reverted || tryTotalSupply.reverted) {
        graph_ts_1.log.error("[updateMarketAndProtocol] Pool contract {} does not have a totalAssets or totalSupply", [market.id.toHexString()]);
        return;
    }
    const inputTokenPriceUSD = getPriceUSD(graph_ts_1.Address.fromBytes(manager.getInputToken().id));
    const exchangeRate = safeDiv(tryBalance.value.toBigDecimal(), tryTotalSupply.value.toBigDecimal());
    market.outputTokenSupply = tryTotalSupply.value;
    market.outputTokenPriceUSD = inputTokenPriceUSD.times(exchangeRate);
    market.save();
    const tryAUM = loanManagerContract.try_assetsUnderManagement();
    if (tryAUM.reverted) {
        graph_ts_1.log.error("[updateMarketAndProtocol] LoanManager contract {} does not have a assetsUnderManagement", [market._loanManager.toHexString()]);
        return;
    }
    manager.updateMarketAndProtocolData(inputTokenPriceUSD, tryBalance.value, tryAUM.value, null, null, exchangeRate);
    // calculate accrued interest on the loans
    const tryAccruedInterest = loanManagerContract.try_getAccruedInterest();
    if (tryAccruedInterest.reverted) {
        graph_ts_1.log.error("[updateMarketAndProtocol] LoanManager contract {} does not have a getAccruedInterest", [market._loanManager.toHexString()]);
        return;
    }
    if (!market._prevRevenue) {
        market._prevRevenue = constants_1.BIGINT_ZERO;
    }
    if (market._prevRevenue.lt(tryAccruedInterest.value)) {
        const revenueDelta = tryAccruedInterest.value.minus(market._prevRevenue);
        market._prevRevenue = tryAccruedInterest.value;
        market.save();
        manager.addSupplyRevenue(getTotalValueUSD(revenueDelta, manager.getInputToken().decimals, inputTokenPriceUSD));
    }
    updateBorrowRate(manager);
    updateSupplyRate(manager, event);
}
function updateBorrowRate(manager) {
    const market = manager.getMarket();
    // update borrow rate using the rate from the loans
    let totalPrincipal = constants_1.BIGDECIMAL_ZERO;
    let rateAmount = constants_1.BIGDECIMAL_ZERO;
    if (!market._loans)
        return;
    for (let i = 0; i < market._loans.length; i++) {
        const loanContract = MapleLoan_1.MapleLoan.bind(graph_ts_1.Address.fromBytes(market._loans[i]));
        const tryPrincipal = loanContract.try_principal();
        const tryRate = loanContract.try_interestRate();
        if (tryPrincipal.reverted || tryRate.reverted) {
            graph_ts_1.log.error("[updateMarketAndProtocol] Loan contract {} does not have a principal or interestRate", [loanContract._address.toHexString()]);
            continue;
        }
        const principal = safeDiv(tryPrincipal.value.toBigDecimal(), (0, constants_1.exponentToBigDecimal)(manager.getInputToken().decimals));
        totalPrincipal = totalPrincipal.plus(principal);
        rateAmount = rateAmount.plus(principal.times(tryRate.value.toBigDecimal().div((0, constants_1.exponentToBigDecimal)(constants_2.DEFAULT_DECIMALS))));
    }
    // borrow rate = annual interest on all principal / total principal (in APR)
    // catch divide by zero
    if (totalPrincipal.equals(constants_1.BIGDECIMAL_ZERO))
        return;
    const borrowRate = safeDiv(rateAmount, totalPrincipal).times((0, constants_1.exponentToBigDecimal)(2));
    manager.getOrUpdateRate(constants_1.InterestRateSide.BORROWER, constants_1.InterestRateType.VARIABLE, borrowRate);
}
function updateSupplyRate(manager, event) {
    const market = manager.getMarket();
    // update supply rate using interest from the last 30 days
    let totalInterest = constants_1.BIGDECIMAL_ZERO;
    let days = event.block.timestamp.toI32() / constants_1.SECONDS_PER_DAY;
    for (let i = 0; i < 30; i++) {
        const snapshotID = market.id.concat(graph_ts_1.Bytes.fromI32(days));
        const thisDailyMarketSnapshot = schema_1.MarketDailySnapshot.load(snapshotID);
        if (thisDailyMarketSnapshot) {
            totalInterest = totalInterest.plus(thisDailyMarketSnapshot.dailySupplySideRevenueUSD);
        }
        // decrement days
        days--;
    }
    // catch divide by zero
    if (market.totalDepositBalanceUSD.equals(constants_1.BIGDECIMAL_ZERO))
        return;
    const supplyRate = safeDiv(totalInterest, market.totalDepositBalanceUSD).times((0, constants_1.exponentToBigDecimal)(2));
    manager.getOrUpdateRate(constants_1.InterestRateSide.LENDER, constants_1.InterestRateType.VARIABLE, supplyRate);
}
//
// get the account balance of an account for any erc20 token
function getBalanceOf(erc20Contract, account) {
    const contract = ERC20_1.ERC20.bind(erc20Contract);
    const tryBalance = contract.try_balanceOf(account);
    if (tryBalance.reverted) {
        graph_ts_1.log.error("[getBalanceOf] Could not get balance of contract {} for account {}", [contract._address.toHexString(), account.toHexString()]);
        return constants_1.BIGINT_ZERO;
    }
    return tryBalance.value;
}
function getPriceUSD(asset) {
    const mapleGlobalsContract = MapleGlobals_1.MapleGlobals.bind(graph_ts_1.Address.fromString(constants_2.MAPLE_GLOBALS));
    let tryPrice = mapleGlobalsContract.try_getLatestPrice(asset);
    if (tryPrice.reverted) {
        if (asset == graph_ts_1.Address.fromString(constants_2.USDC_ADDRESS)) {
            const chainlinkContract = Chainlink_1.Chainlink.bind(graph_ts_1.Address.fromString(constants_2.CHAINLINK_USDC_ORACLE));
            tryPrice = chainlinkContract.try_latestAnswer();
        }
        else {
            graph_ts_1.log.warning("[getPriceUSD] Could not get price for asset {}", [
                asset.toHexString(),
            ]);
            return constants_1.BIGDECIMAL_ZERO;
        }
    }
    const token = schema_1.Token.load(asset);
    if (!token) {
        graph_ts_1.log.warning("[getPriceUSD] Could not get token entity for asset {}", [
            asset.toHexString(),
        ]);
        return constants_1.BIGDECIMAL_ZERO;
    }
    return tryPrice.value
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(constants_2.CHAINLINK_DECIMALS));
}
//
// get the price of any amount with error handling
function getTotalValueUSD(amount, decimals, priceUSD) {
    if (decimals <= constants_1.INT_ZERO) {
        return amount.toBigDecimal().times(priceUSD);
    }
    else {
        return amount
            .toBigDecimal()
            .div((0, constants_1.exponentToBigDecimal)(decimals))
            .times(priceUSD);
    }
}
function safeDiv(a, b) {
    if (b == constants_1.BIGDECIMAL_ZERO) {
        return constants_1.BIGDECIMAL_ZERO;
    }
    return a.div(b);
}
function getOrCreateLoan(loanId, event) {
    let loan = schema_1._Loan.load(loanId);
    if (!loan) {
        loan = new schema_1._Loan(loanId);
        loan.rates = [];
        loan.transactionCreated = event.transaction.hash;
        loan.save();
    }
    return loan;
}
