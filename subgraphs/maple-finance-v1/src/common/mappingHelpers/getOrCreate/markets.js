"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateAccountMarket = exports.getOrCreateMplReward = exports.getOrCreateLoan = exports.getOrCreateInterestRate = exports.getOrCreateStakeLocker = exports.getOrCreateMarket = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../../../generated/schema");
const LoanV1_1 = require("../../../../generated/templates/LoanV1/LoanV1");
const LoanV2_1 = require("../../../../generated/templates/LoanV2/LoanV2");
const Pool_1 = require("../../../../generated/templates/Pool/Pool");
const StakeLocker_1 = require("../../../../generated/templates/StakeLocker/StakeLocker");
const MplReward_1 = require("../../../../generated/templates/MplReward/MplReward");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
const supporting_1 = require("./supporting");
const protocol_1 = require("./protocol");
/**
 * Get the market at marketAddress, or create it if it doesn't exist
 */
function getOrCreateMarket(event, marketAddress) {
    let market = schema_1.Market.load(marketAddress.toHexString());
    if (!market) {
        market = new schema_1.Market(marketAddress.toHexString());
        const poolContract = Pool_1.Pool.bind(marketAddress);
        const marketName = (0, utils_1.readCallResult)(poolContract.try_name(), "UNDEFINED", poolContract.try_name.name);
        const poolFactoryAddress = (0, utils_1.readCallResult)(poolContract.try_superFactory(), constants_1.ZERO_ADDRESS, poolContract.try_superFactory.name);
        const delegateAddress = (0, utils_1.readCallResult)(poolContract.try_poolDelegate(), constants_1.ZERO_ADDRESS, poolContract.try_poolDelegate.name);
        const stakeLockerAddress = (0, utils_1.readCallResult)(poolContract.try_stakeLocker(), constants_1.ZERO_ADDRESS, poolContract.try_stakeLocker.name);
        const inputTokenAddress = (0, utils_1.readCallResult)(poolContract.try_liquidityAsset(), constants_1.ZERO_ADDRESS, poolContract.try_liquidityAsset.name);
        const liquidityLockerAddress = (0, utils_1.readCallResult)(poolContract.try_liquidityLocker(), constants_1.ZERO_ADDRESS, poolContract.try_liquidityLocker.name);
        const inputToken = (0, supporting_1.getOrCreateToken)(inputTokenAddress);
        // Following _toWad function
        market._initialExchangeRate = (0, utils_1.powBigDecimal)(constants_1.TEN_BD, inputToken.decimals).div((0, utils_1.powBigDecimal)(constants_1.TEN_BD, constants_1.POOL_WAD_DECIMALS));
        market.protocol = constants_1.PROTOCOL_ID;
        market.name = marketName;
        market.isActive = false;
        market.canUseAsCollateral = false;
        market.canBorrowFrom = false;
        market.maximumLTV = constants_1.ZERO_BD;
        market.liquidationThreshold = constants_1.ZERO_BD;
        market.liquidationPenalty = constants_1.ZERO_BD;
        market.inputToken = inputTokenAddress.toHexString();
        market.outputToken = market.id;
        market.rewardTokens = new Array();
        market.rates = new Array();
        market.totalValueLockedUSD = constants_1.ZERO_BD;
        market.cumulativeSupplySideRevenueUSD = constants_1.ZERO_BD;
        market.cumulativeProtocolSideRevenueUSD = constants_1.ZERO_BD;
        market.cumulativeTotalRevenueUSD = constants_1.ZERO_BD;
        market.totalDepositBalanceUSD = constants_1.ZERO_BD;
        market.cumulativeDepositUSD = constants_1.ZERO_BD;
        market.totalBorrowBalanceUSD = constants_1.ZERO_BD;
        market.cumulativeBorrowUSD = constants_1.ZERO_BD;
        market.cumulativeLiquidateUSD = constants_1.ZERO_BD;
        market.inputTokenBalance = constants_1.ZERO_BI;
        market.inputTokenPriceUSD = constants_1.ZERO_BD;
        market.outputTokenSupply = constants_1.ZERO_BI;
        market.outputTokenPriceUSD = constants_1.ZERO_BD;
        market.exchangeRate = market._initialExchangeRate;
        market.rewardTokenEmissionsAmount = new Array();
        market.rewardTokenEmissionsUSD = new Array();
        market.createdTimestamp = event.block.timestamp;
        market.createdBlockNumber = event.block.number;
        market._poolFactory = poolFactoryAddress.toHexString();
        market._delegateAddress = delegateAddress.toHexString();
        market._stakeLocker = stakeLockerAddress.toHexString();
        market._liquidityLockerAddress = liquidityLockerAddress.toHexString();
        // No maple rewards pools to begin with, they get added on MplRewards.sol->MplRewardsCreated
        market._mplRewardMplLp = null;
        market._mplRewardMplStake = null;
        market._cumulativeDeposit = constants_1.ZERO_BI;
        market._cumulativeWithdraw = constants_1.ZERO_BI;
        market._cumulativeBorrow = constants_1.ZERO_BI;
        market._cumulativePrincipalRepay = constants_1.ZERO_BI;
        market._cumulativeInterest = constants_1.ZERO_BI;
        market._cumulativeInterestClaimed = constants_1.ZERO_BI;
        market._cumulativePoolLosses = constants_1.ZERO_BI;
        market._recognizedPoolLosses = constants_1.ZERO_BI;
        market._cumulativePoolDelegateRevenue = constants_1.ZERO_BI;
        market._cumulativeTreasuryRevenue = constants_1.ZERO_BI;
        market._totalDepositBalance = constants_1.ZERO_BI;
        market._totalInterestBalance = constants_1.ZERO_BI;
        market._totalBorrowBalance = constants_1.ZERO_BI;
        market._cumulativeLiquidate = constants_1.ZERO_BI;
        market._lastUpdatedBlockNumber = event.block.number;
        market.save();
        // add market to lending protocol
        const protocol = (0, protocol_1.getOrCreateProtocol)();
        const marketIDs = protocol._marketIDs;
        marketIDs.push(market.id);
        protocol._marketIDs = marketIDs;
        protocol.save();
    }
    return market;
}
exports.getOrCreateMarket = getOrCreateMarket;
/**
 * Get the stake locker with stakeLockerAddress, or create it if it doesn't exist
 */
function getOrCreateStakeLocker(event, stakeLockerAddress) {
    let stakeLocker = schema_1._StakeLocker.load(stakeLockerAddress.toHexString());
    if (!stakeLocker) {
        stakeLocker = new schema_1._StakeLocker(stakeLockerAddress.toHexString());
        const stakeLockerContract = StakeLocker_1.StakeLocker.bind(stakeLockerAddress);
        const marketAddress = (0, utils_1.readCallResult)(stakeLockerContract.try_pool(), constants_1.ZERO_ADDRESS, stakeLockerContract.try_pool.name);
        const stakeTokenAddress = (0, utils_1.readCallResult)(stakeLockerContract.try_stakeAsset(), constants_1.ZERO_ADDRESS, stakeLockerContract.try_stakeAsset.name);
        stakeLocker.market = marketAddress.toHexString();
        stakeLocker.stakeToken = stakeTokenAddress.toHexString();
        stakeLocker.creationBlockNumber = event.block.number;
        stakeLocker.cumulativeStake = constants_1.ZERO_BI;
        stakeLocker.cumulativeUnstake = constants_1.ZERO_BI;
        stakeLocker.cumulativeLosses = constants_1.ZERO_BI;
        stakeLocker.recognizedLosses = constants_1.ZERO_BI;
        stakeLocker.cumulativeLossesInPoolInputToken = constants_1.ZERO_BI;
        stakeLocker.cumulativeInterestInPoolInputTokens = constants_1.ZERO_BI;
        stakeLocker.stakeTokenBalance = constants_1.ZERO_BI;
        stakeLocker.stakeTokenBalanceUSD = constants_1.ZERO_BD;
        stakeLocker.stakeTokenSwapOutBalanceInPoolInputTokens = constants_1.ZERO_BI;
        stakeLocker.lastUpdatedBlockNumber = event.block.number;
        stakeLocker.save();
    }
    return stakeLocker;
}
exports.getOrCreateStakeLocker = getOrCreateStakeLocker;
/**
 * Create an interest rate, this also adds it to the market that the loan belongs to.
 * @param loan loan this interest rate if for
 * @param rate rate in percentage APY (i.e 5.31% should be stored as 5.31)
 * @param durationDays number of days for the loan
 */
function getOrCreateInterestRate(event, loan, rate = constants_1.ZERO_BD, durationDays = constants_1.ZERO_BI) {
    const id = constants_1.PROTOCOL_INTEREST_RATE_SIDE + "-" + constants_1.PROTOCOL_INTEREST_RATE_TYPE + "-" + loan.id;
    let interestRate = schema_1.InterestRate.load(id);
    if (!interestRate) {
        interestRate = new schema_1.InterestRate(id);
        const market = getOrCreateMarket(event, graph_ts_1.Address.fromString(loan.market));
        interestRate.rate = rate;
        interestRate.duration = durationDays.toI32();
        interestRate.maturityBlock = null; // Doesn't apply here
        interestRate.side = constants_1.PROTOCOL_INTEREST_RATE_SIDE;
        interestRate.type = constants_1.PROTOCOL_INTEREST_RATE_TYPE;
        interestRate._loan = loan.id;
        interestRate._market = market.id;
        interestRate.save();
        if (constants_1.ZERO_BD == rate || constants_1.ZERO_BI == durationDays) {
            graph_ts_1.log.error("Created interest rate with invalid params: rate={}, durationDays={}", [
                rate.toString(),
                durationDays.toString(),
            ]);
        }
    }
    return interestRate;
}
exports.getOrCreateInterestRate = getOrCreateInterestRate;
/**
 * Get the loan at loanAddress, or create it if is doesn't already exist.
 * Only loanAddress is required for get, everything should be set for create
 * On creation, interest rate is also added to the market
 */
function getOrCreateLoan(event, loanAddress, marketAddress = constants_1.ZERO_ADDRESS) {
    let loan = schema_1._Loan.load(loanAddress.toHexString());
    if (!loan) {
        loan = new schema_1._Loan(loanAddress.toHexString());
        const loanV1Contract = LoanV1_1.LoanV1.bind(loanAddress);
        // Loan versions have different function names and values
        //          V1                          V2/V3
        // --------------------------|----------------------------
        // apr                       |  interestRate
        // termDays                  |       -
        // paymentIntervalSeconds    |  paymentInterval
        loan.market = marketAddress.toHexString();
        loan.creationBlockNumber = event.block.number;
        loan.amountFunded = constants_1.ZERO_BI;
        loan.refinanceCount = constants_1.ZERO_BI;
        loan.drawnDown = constants_1.ZERO_BI;
        loan.principalPaid = constants_1.ZERO_BI;
        loan.interestPaid = constants_1.ZERO_BI;
        loan.defaultSuffered = constants_1.ZERO_BI;
        loan.treasuryFeePaid = constants_1.ZERO_BI;
        const tryTermDays = loanV1Contract.try_termDays();
        if (!tryTermDays.reverted) {
            // V1
            loan.version = constants_1.LoanVersion.V1;
            const rateFromContract = (0, utils_1.readCallResult)(loanV1Contract.try_apr(), constants_1.ZERO_BI, loanV1Contract.try_apr.name);
            const rate = rateFromContract.toBigDecimal().div(graph_ts_1.BigDecimal.fromString("100"));
            const interestRate = getOrCreateInterestRate(event, loan, rate, tryTermDays.value);
            loan.interestRate = interestRate.id;
            loan.borrower = (0, utils_1.readCallResult)(loanV1Contract.try_borrower(), constants_1.ZERO_ADDRESS, loanV1Contract.try_borrower.name).toHexString();
        }
        else {
            // V2 or V3, functions used below are common between
            const loanV2V3Contract = LoanV2_1.LoanV2.bind(loanAddress);
            const implementationAddress = (0, utils_1.readCallResult)(loanV2V3Contract.try_implementation(), constants_1.ZERO_ADDRESS, loanV2V3Contract.try_implementation.name);
            if (constants_1.LOAN_V2_IMPLEMENTATION_ADDRESS.equals(implementationAddress)) {
                loan.version = constants_1.LoanVersion.V2;
            }
            else {
                loan.version = constants_1.LoanVersion.V3;
            }
            const paymentIntervalSec = (0, utils_1.readCallResult)(loanV2V3Contract.try_paymentInterval(), constants_1.ZERO_BI, loanV2V3Contract.try_paymentInterval.name);
            const paymentsRemaining = (0, utils_1.readCallResult)(loanV2V3Contract.try_paymentsRemaining(), constants_1.ZERO_BI, loanV2V3Contract.try_paymentsRemaining.name);
            const termDays = (0, utils_1.bigDecimalToBigInt)(paymentIntervalSec.times(paymentsRemaining).toBigDecimal().div(constants_1.SEC_PER_DAY.toBigDecimal()));
            // Interst rate for V2/V3 stored as apr in units of 1e18, (i.e. 1% is 0.01e18).
            const rateFromContract = (0, utils_1.readCallResult)(loanV2V3Contract.try_interestRate(), constants_1.ZERO_BI, loanV2V3Contract.try_interestRate.name);
            const rate = (0, utils_1.parseUnits)(rateFromContract, 18).times(graph_ts_1.BigDecimal.fromString("100"));
            const interestRate = getOrCreateInterestRate(event, loan, rate, termDays);
            loan.interestRate = interestRate.id;
            loan.borrower = (0, utils_1.readCallResult)(loanV2V3Contract.try_borrower(), constants_1.ZERO_ADDRESS, loanV2V3Contract.try_borrower.name).toHexString();
        }
        loan.save();
        // Add the interest rate to market to satisfy the std schema
        const market = getOrCreateMarket(event, marketAddress);
        const rates = market.rates;
        rates.push(loan.interestRate);
        market.rates = rates;
        market.save();
        if (constants_1.ZERO_ADDRESS == marketAddress) {
            graph_ts_1.log.error("Created loan with invalid params: marketAddress={}", [marketAddress.toHexString()]);
        }
    }
    return loan;
}
exports.getOrCreateLoan = getOrCreateLoan;
/**
 * Get the mpl rewards at mplRewardAddress, or create it if it doesn't exist
 * On creation this will also connect it to the market and add a new rewards token (if applicable)
 */
function getOrCreateMplReward(event, mplRewardAddress) {
    let mplReward = schema_1._MplReward.load(mplRewardAddress.toHexString());
    if (!mplReward) {
        mplReward = new schema_1._MplReward(mplRewardAddress.toHexString());
        const mplRewardContract = MplReward_1.MplReward.bind(mplRewardAddress);
        const stakeTokenAddress = (0, utils_1.readCallResult)(mplRewardContract.try_stakingToken(), constants_1.ZERO_ADDRESS, mplRewardContract.try_stakingToken.name);
        const rewardTokenAddress = (0, utils_1.readCallResult)(mplRewardContract.try_rewardsToken(), constants_1.ZERO_ADDRESS, mplRewardContract.try_rewardsToken.name);
        const rewardToken = (0, supporting_1.getOrCreateRewardToken)(rewardTokenAddress);
        const stakeToken = (0, supporting_1.getOrCreateToken)(stakeTokenAddress);
        // Explicity load market, we need to see if it exists, if so MPL-LP
        let market = schema_1.Market.load(stakeTokenAddress.toHexString());
        if (!market) {
            // MPL-STAKE
            const stakeLocker = getOrCreateStakeLocker(event, stakeTokenAddress);
            market = getOrCreateMarket(event, graph_ts_1.Address.fromString(stakeLocker.market));
        }
        mplReward.market = market.id;
        mplReward.stakeToken = stakeToken.id;
        mplReward.rewardToken = rewardToken.id;
        mplReward.creationBlockNumber = event.block.number;
        mplReward.rewardRatePerSecond = constants_1.ZERO_BI;
        mplReward.rewardDurationSec = constants_1.MPL_REWARDS_DEFAULT_DURATION_TIME_S;
        mplReward.periodFinishedTimestamp = constants_1.ZERO_BI;
        mplReward.rewardTokenEmissionAmountPerDay = constants_1.ZERO_BI;
        mplReward.lastUpdatedBlockNumber = event.block.number;
        mplReward.save();
    }
    return mplReward;
}
exports.getOrCreateMplReward = getOrCreateMplReward;
/**
 * Get the account at this address in this market, or create it if it doesn't exist.
 */
function getOrCreateAccountMarket(event, accountAddress, market) {
    const id = accountAddress.toHexString() + "-" + market.id;
    let accountMarket = schema_1._AccountMarket.load(id);
    if (!accountMarket) {
        accountMarket = new schema_1._AccountMarket(id);
        accountMarket.market = market.id;
        accountMarket.recognizedLosses = constants_1.ZERO_BI;
        accountMarket.creationBlockNumber = event.block.number;
        accountMarket.save();
    }
    return accountMarket;
}
exports.getOrCreateAccountMarket = getOrCreateAccountMarket;
