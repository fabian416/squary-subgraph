"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePoolTokensRedeemable = exports.updatePoolRewardsClaimable = exports.calculateApyFromGfiForAllPools = exports.getLeverageRatioFromConfig = exports.initOrUpdateTranchedPool = exports.getOrInitTranchedPool = exports.handleDeposit = exports.updatePoolCreditLine = void 0;
/* eslint-disable @typescript-eslint/no-magic-numbers */
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const TranchedPool_1 = require("../../generated/templates/TranchedPool/TranchedPool");
const GoldfinchConfig_1 = require("../../generated/templates/TranchedPool/GoldfinchConfig");
const constants_1 = require("../common/constants");
const user_1 = require("./user");
const credit_line_1 = require("./credit_line");
const helpers_1 = require("./helpers");
const utils_1 = require("../common/utils");
const backer_rewards_1 = require("./backer_rewards");
const BackerRewards_1 = require("../../generated/BackerRewards/BackerRewards");
const senior_pool_1 = require("./senior_pool");
function updatePoolCreditLine(address, timestamp) {
    const contract = TranchedPool_1.TranchedPool.bind(address);
    const tranchedPool = getOrInitTranchedPool(address, timestamp);
    const creditLineAddress = contract.creditLine().toHexString();
    const creditLine = (0, credit_line_1.initOrUpdateCreditLine)(graph_ts_1.Address.fromString(creditLineAddress), timestamp);
    tranchedPool.creditLine = creditLine.id;
    tranchedPool.save();
}
exports.updatePoolCreditLine = updatePoolCreditLine;
function handleDeposit(event) {
    const backer = (0, user_1.getOrInitUser)(event.params.owner);
    const tranchedPool = getOrInitTranchedPool(event.address, event.block.timestamp);
    const juniorTrancheInfo = schema_1.JuniorTrancheInfo.load(`${event.address.toHexString()}-${event.params.tranche.toString()}`);
    if (juniorTrancheInfo) {
        juniorTrancheInfo.principalDeposited =
            juniorTrancheInfo.principalDeposited.plus(event.params.amount);
        juniorTrancheInfo.save();
    }
    if (!tranchedPool.backers.includes(backer.id)) {
        const addresses = tranchedPool.backers;
        addresses.push(backer.id);
        tranchedPool.backers = addresses;
        tranchedPool.numBackers = addresses.length;
    }
    tranchedPool.estimatedTotalAssets = tranchedPool.estimatedTotalAssets.plus(event.params.amount);
    tranchedPool.juniorDeposited = tranchedPool.juniorDeposited.plus(event.params.amount);
    const creditLine = schema_1.CreditLine.load(tranchedPool.creditLine);
    if (!creditLine) {
        throw new Error(`Missing credit line for tranched pool ${tranchedPool.id} while handling deposit`);
    }
    const limit = !creditLine.limit.isZero()
        ? creditLine.limit
        : creditLine.maxLimit;
    tranchedPool.remainingCapacity = limit.minus(tranchedPool.estimatedTotalAssets);
    tranchedPool.save();
    updatePoolCreditLine(event.address, event.block.timestamp);
}
exports.handleDeposit = handleDeposit;
function getOrInitTranchedPool(poolAddress, timestamp) {
    let tranchedPool = schema_1.TranchedPool.load(poolAddress.toHexString());
    if (!tranchedPool) {
        tranchedPool = initOrUpdateTranchedPool(poolAddress, timestamp);
    }
    return tranchedPool;
}
exports.getOrInitTranchedPool = getOrInitTranchedPool;
function initOrUpdateTranchedPool(address, timestamp) {
    let tranchedPool = schema_1.TranchedPool.load(address.toHexString());
    const isCreating = !tranchedPool;
    if (!tranchedPool) {
        tranchedPool = new schema_1.TranchedPool(address.toHexString());
    }
    const poolContract = TranchedPool_1.TranchedPool.bind(address);
    const goldfinchConfigContract = GoldfinchConfig_1.GoldfinchConfig.bind(poolContract.config());
    const seniorPoolAddress = goldfinchConfigContract.getAddress(graph_ts_1.BigInt.fromI32(constants_1.CONFIG_KEYS_ADDRESSES.SeniorPool));
    let version = utils_1.VERSION_BEFORE_V2_2;
    let numSlices = graph_ts_1.BigInt.fromI32(1);
    let totalDeployed = graph_ts_1.BigInt.fromI32(0);
    let fundableAt = graph_ts_1.BigInt.fromI32(0);
    if (timestamp && (0, utils_1.isAfterV2_2)(timestamp)) {
        const callResult = poolContract.try_numSlices();
        if (callResult.reverted) {
            graph_ts_1.log.warning("numSlices reverted for pool {}", [address.toHexString()]);
        }
        else {
            // Assuming that a pool is a v2_2 pool if requests work
            numSlices = callResult.value;
            version = utils_1.VERSION_V2_2;
        }
        const callTotalDeployed = poolContract.try_totalDeployed();
        if (callTotalDeployed.reverted) {
            graph_ts_1.log.warning("totalDeployed reverted for pool {}", [
                address.toHexString(),
            ]);
        }
        else {
            totalDeployed = callTotalDeployed.value;
            // Assuming that a pool is a v2_2 pool if requests work
            version = utils_1.VERSION_V2_2;
        }
        const callFundableAt = poolContract.try_fundableAt();
        if (callFundableAt.reverted) {
            graph_ts_1.log.warning("fundableAt reverted for pool {}", [address.toHexString()]);
        }
        else {
            fundableAt = callFundableAt.value;
            // Assuming that a pool is a v2_2 pool if requests work
            version = utils_1.VERSION_V2_2;
        }
    }
    let counter = 1;
    const juniorTranches = [];
    const seniorTranches = [];
    for (let i = 0; i < numSlices.toI32(); i++) {
        const seniorTrancheInfo = poolContract.getTranche(graph_ts_1.BigInt.fromI32(counter));
        const seniorId = `${address.toHexString()}-${seniorTrancheInfo.id.toString()}`;
        let seniorTranche = schema_1.SeniorTrancheInfo.load(seniorId);
        if (!seniorTranche) {
            seniorTranche = new schema_1.SeniorTrancheInfo(seniorId);
        }
        seniorTranche.trancheId = graph_ts_1.BigInt.fromI32(counter);
        seniorTranche.lockedUntil = seniorTrancheInfo.lockedUntil;
        seniorTranche.tranchedPool = address.toHexString();
        seniorTranche.principalDeposited = seniorTrancheInfo.principalDeposited;
        seniorTranche.principalSharePrice = seniorTrancheInfo.principalSharePrice;
        seniorTranche.interestSharePrice = seniorTrancheInfo.interestSharePrice;
        seniorTranche.save();
        seniorTranches.push(seniorTranche);
        counter++;
        const juniorTrancheInfo = poolContract.getTranche(graph_ts_1.BigInt.fromI32(counter));
        const juniorId = `${address.toHexString()}-${juniorTrancheInfo.id.toString()}`;
        let juniorTranche = schema_1.JuniorTrancheInfo.load(juniorId);
        if (!juniorTranche) {
            juniorTranche = new schema_1.JuniorTrancheInfo(juniorId);
        }
        juniorTranche.trancheId = graph_ts_1.BigInt.fromI32(counter);
        juniorTranche.lockedUntil = juniorTrancheInfo.lockedUntil;
        juniorTranche.tranchedPool = address.toHexString();
        juniorTranche.principalSharePrice = juniorTrancheInfo.principalSharePrice;
        juniorTranche.interestSharePrice = juniorTrancheInfo.interestSharePrice;
        juniorTranche.principalDeposited = juniorTrancheInfo.principalDeposited;
        juniorTranche.save();
        juniorTranches.push(juniorTranche);
        counter++;
    }
    tranchedPool.juniorFeePercent = poolContract.juniorFeePercent();
    tranchedPool.reserveFeePercent = graph_ts_1.BigInt.fromI32(100).div(goldfinchConfigContract.getNumber(graph_ts_1.BigInt.fromI32(constants_1.CONFIG_KEYS_NUMBERS.ReserveDenominator)));
    tranchedPool.estimatedSeniorPoolContribution =
        (0, helpers_1.getEstimatedSeniorPoolInvestment)(address, version, seniorPoolAddress);
    tranchedPool.totalDeposited = (0, helpers_1.getTotalDeposited)(address, juniorTranches, seniorTranches);
    tranchedPool.estimatedTotalAssets = tranchedPool.totalDeposited.plus(tranchedPool.estimatedSeniorPoolContribution);
    tranchedPool.juniorDeposited = (0, helpers_1.getJuniorDeposited)(juniorTranches);
    tranchedPool.isPaused = poolContract.paused();
    tranchedPool.isV1StyleDeal = (0, helpers_1.isV1StyleDeal)(address);
    tranchedPool.version = version;
    tranchedPool.totalDeployed = totalDeployed;
    const createdAtOverride = (0, helpers_1.getCreatedAtOverride)(address);
    tranchedPool.createdAt = createdAtOverride
        ? createdAtOverride
        : poolContract.createdAt();
    tranchedPool.fundableAt = fundableAt.isZero()
        ? tranchedPool.createdAt
        : fundableAt;
    const creditLineAddress = poolContract.creditLine().toHexString();
    const creditLine = (0, credit_line_1.getOrInitCreditLine)(graph_ts_1.Address.fromString(creditLineAddress), timestamp);
    tranchedPool.creditLine = creditLine.id;
    const limit = !creditLine.limit.isZero()
        ? creditLine.limit
        : creditLine.maxLimit;
    tranchedPool.remainingCapacity = limit.minus(tranchedPool.estimatedTotalAssets);
    // This can happen in weird cases where the senior pool investment causes a pool to overfill
    if (tranchedPool.remainingCapacity.lt(graph_ts_1.BigInt.zero())) {
        tranchedPool.remainingCapacity = graph_ts_1.BigInt.zero();
    }
    if (isCreating) {
        tranchedPool.backers = [];
        tranchedPool.tokens = [];
        tranchedPool.numBackers = 0;
        tranchedPool.estimatedJuniorApyFromGfiRaw = graph_ts_1.BigDecimal.zero();
        tranchedPool.principalAmountRepaid = graph_ts_1.BigInt.zero();
        tranchedPool.interestAmountRepaid = graph_ts_1.BigInt.zero();
        // V1 style deals do not have a leverage ratio because all capital came from the senior pool
        if (tranchedPool.isV1StyleDeal) {
            tranchedPool.estimatedLeverageRatio = null;
        }
        else {
            tranchedPool.estimatedLeverageRatio = getLeverageRatioFromConfig(goldfinchConfigContract);
        }
    }
    const getAllowedUIDTypes_callResult = poolContract.try_getAllowedUIDTypes();
    if (!getAllowedUIDTypes_callResult.reverted) {
        const allowedUidInts = getAllowedUIDTypes_callResult.value;
        const allowedUidStrings = [];
        for (let i = 0; i < allowedUidInts.length; i++) {
            const uidType = allowedUidInts[i];
            if (uidType.equals(graph_ts_1.BigInt.fromI32(0))) {
                allowedUidStrings.push("NON_US_INDIVIDUAL");
            }
            else if (uidType.equals(graph_ts_1.BigInt.fromI32(1))) {
                allowedUidStrings.push("US_ACCREDITED_INDIVIDUAL");
            }
            else if (uidType.equals(graph_ts_1.BigInt.fromI32(2))) {
                allowedUidStrings.push("US_NON_ACCREDITED_INDIVIDUAL");
            }
            else if (uidType.equals(graph_ts_1.BigInt.fromI32(3))) {
                allowedUidStrings.push("US_ENTITY");
            }
            else if (uidType.equals(graph_ts_1.BigInt.fromI32(4))) {
                allowedUidStrings.push("NON_US_ENTITY");
            }
        }
        tranchedPool.allowedUidTypes = allowedUidStrings;
    }
    else {
        // by default, assume everything except US non-accredited individual is allowed
        tranchedPool.allowedUidTypes = [
            "NON_US_INDIVIDUAL",
            "US_ACCREDITED_INDIVIDUAL",
            "US_ENTITY",
            "NON_US_ENTITY",
        ];
    }
    tranchedPool.estimatedJuniorApy = (0, helpers_1.estimateJuniorAPY)(tranchedPool);
    tranchedPool.initialInterestOwed = calculateInitialInterestOwed(creditLine);
    tranchedPool.save();
    if (isCreating) {
        const seniorPoolStatus = (0, senior_pool_1.getOrInitSeniorPoolStatus)();
        const tpl = seniorPoolStatus.tranchedPools;
        tpl.push(tranchedPool.id);
        seniorPoolStatus.tranchedPools = tpl;
        seniorPoolStatus.save();
    }
    calculateApyFromGfiForAllPools();
    return tranchedPool;
}
exports.initOrUpdateTranchedPool = initOrUpdateTranchedPool;
// TODO leverage ratio should really be expressed as a BigDecimal https://linear.app/goldfinch/issue/GFI-951/leverage-ratio-should-be-expressed-as-bigdecimal-in-subgraph
function getLeverageRatioFromConfig(goldfinchConfigContract) {
    return (0, utils_1.bigDecimalToBigInt)(goldfinchConfigContract
        .getNumber(graph_ts_1.BigInt.fromI32(constants_1.CONFIG_KEYS_NUMBERS.LeverageRatio))
        .divDecimal(constants_1.FIDU_DECIMALS));
}
exports.getLeverageRatioFromConfig = getLeverageRatioFromConfig;
class Repayment {
    constructor(tranchedPoolAddress, timestamp, interestAmount) {
        this.tranchedPoolAddress = tranchedPoolAddress;
        this.timestamp = timestamp;
        this.interestAmount = interestAmount;
    }
    toString() {
        return `{ tranchedPoolAddress: ${this.tranchedPoolAddress}, timestamp: ${this.timestamp.toString()}, interestAmount: $${this.interestAmount.toString()} }`;
    }
}
class GfiRewardOnInterest {
    constructor(tranchedPoolAddress, timestamp, gfiAmount) {
        this.tranchedPoolAddress = tranchedPoolAddress;
        this.timestamp = timestamp;
        this.gfiAmount = gfiAmount;
    }
    toString() {
        return `{ tranchedPoolAddress: ${this.tranchedPoolAddress}, timestamp: ${this.timestamp.toString()}, gfiAmount: ${this.gfiAmount.toString()}}`;
    }
}
function calculateApyFromGfiForAllPools() {
    const backerRewards = (0, backer_rewards_1.getBackerRewards)();
    // Bail out early if the backer rewards parameters aren't populated yet
    if (backerRewards.totalRewards == graph_ts_1.BigInt.zero() ||
        backerRewards.maxInterestDollarsEligible == graph_ts_1.BigInt.zero()) {
        return;
    }
    const seniorPoolStatus = (0, senior_pool_1.getOrInitSeniorPoolStatus)();
    const tranchedPoolList = seniorPoolStatus.tranchedPools;
    let repaymentSchedules = [];
    for (let i = 0; i < tranchedPoolList.length; i++) {
        const tranchedPool = schema_1.TranchedPool.load(tranchedPoolList[i]);
        if (!tranchedPool) {
            continue;
        }
        const creditLine = schema_1.CreditLine.load(tranchedPool.creditLine);
        if (!creditLine || !creditLine.isEligibleForRewards) {
            continue;
        }
        const schedule = getApproximateRepaymentSchedule(tranchedPool);
        repaymentSchedules = repaymentSchedules.concat(schedule);
    }
    repaymentSchedules.sort(repaymentComparator);
    const rewardsSchedules = estimateRewards(repaymentSchedules, backerRewards.totalRewards, backerRewards.maxInterestDollarsEligible);
    const summedRewardsByTranchedPool = new Map();
    for (let i = 0; i < rewardsSchedules.length; i++) {
        const reward = rewardsSchedules[i];
        const tranchedPoolAddress = reward.tranchedPoolAddress;
        if (summedRewardsByTranchedPool.has(tranchedPoolAddress)) {
            const currentSum = summedRewardsByTranchedPool.get(tranchedPoolAddress);
            summedRewardsByTranchedPool.set(tranchedPoolAddress, currentSum.plus(reward.gfiAmount));
        }
        else {
            summedRewardsByTranchedPool.set(tranchedPoolAddress, reward.gfiAmount);
        }
    }
    const gfiPerPrincipalDollar = calculateAnnualizedGfiRewardsPerPrincipalDollar(summedRewardsByTranchedPool);
    for (let i = 0; i < gfiPerPrincipalDollar.keys().length; i++) {
        const tranchedPoolAddress = gfiPerPrincipalDollar.keys()[i];
        const tranchedPool = schema_1.TranchedPool.load(tranchedPoolAddress);
        if (!tranchedPool) {
            continue;
        }
        tranchedPool.estimatedJuniorApyFromGfiRaw = gfiPerPrincipalDollar
            .get(tranchedPoolAddress)
            .div(constants_1.GFI_DECIMALS);
        tranchedPool.save();
    }
}
exports.calculateApyFromGfiForAllPools = calculateApyFromGfiForAllPools;
// TODO tiebreaking logic
function repaymentComparator(a, b) {
    const timeDiff = a.timestamp.minus(b.timestamp);
    return timeDiff.toI32();
}
function getApproximateRepaymentSchedule(tranchedPool) {
    const creditLine = schema_1.CreditLine.load(tranchedPool.creditLine);
    if (!creditLine) {
        return [];
    }
    // When should we say that interest will start being earned on this additional balance?
    // We can't be sure exactly. There's currently no notion of a deadline for funding
    // the pool, nor hard start time of the borrowing. We'll make a reasonable supposition:
    // if the creditLine has a start time defined, use that. If it doesn't, assume the interest starts
    // 7 days after the pool became fundable (and if that value isn't populated, use the pool's creation date)
    let startTime;
    let endTime;
    if (creditLine.termStartTime != graph_ts_1.BigInt.zero() &&
        creditLine.termEndTime != graph_ts_1.BigInt.zero()) {
        startTime = creditLine.termStartTime;
        endTime = creditLine.termEndTime;
    }
    else {
        startTime = tranchedPool.fundableAt.plus(graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_DAY).times(graph_ts_1.BigInt.fromString("7")));
        endTime = startTime.plus(graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_DAY).times(creditLine.termInDays));
    }
    const secondsPerPaymentPeriod = creditLine.paymentPeriodInDays.times(graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_DAY));
    const expectedAnnualInterest = creditLine.maxLimit
        .toBigDecimal()
        .times(creditLine.interestAprDecimal);
    const repayments = [];
    let periodStartTime = startTime;
    while (periodStartTime < endTime) {
        const periodEndTime = (0, utils_1.bigIntMin)(periodStartTime.plus(secondsPerPaymentPeriod), endTime);
        const periodDuration = periodEndTime.minus(periodStartTime);
        const interestAmount = expectedAnnualInterest
            .times(periodDuration.toBigDecimal())
            .div(graph_ts_1.BigDecimal.fromString(constants_1.SECONDS_PER_YEAR.toString()));
        repayments.push(new Repayment(tranchedPool.id, periodEndTime, (0, utils_1.bigDecimalToBigInt)(interestAmount)));
        periodStartTime = periodEndTime;
    }
    return repayments;
}
function estimateRewards(repaymentSchedules, totalGfiAvailableForBackerRewards, // TODO instead of relying on BackerRewards.totalRewards(), manually calculate that amount using GFI total suppy and totalRewardPercentOfTotalGFI
maxInterestDollarsEligible) {
    const rewards = [];
    let oldTotalInterest = graph_ts_1.BigInt.zero();
    for (let i = 0; i < repaymentSchedules.length; i++) {
        const repayment = repaymentSchedules[i];
        // Need to use big numbers to get decent accuracy during integer sqrt
        let newTotalInterest = oldTotalInterest.plus((0, utils_1.bigDecimalToBigInt)(repayment.interestAmount.divDecimal(constants_1.USDC_DECIMALS).times(constants_1.GFI_DECIMALS)));
        if (newTotalInterest.gt(maxInterestDollarsEligible)) {
            newTotalInterest = maxInterestDollarsEligible;
        }
        const sqrtDiff = newTotalInterest.sqrt().minus(oldTotalInterest.sqrt());
        const gfiAmount = sqrtDiff
            .times(totalGfiAvailableForBackerRewards)
            .divDecimal(maxInterestDollarsEligible.sqrt().toBigDecimal());
        rewards.push(new GfiRewardOnInterest(repayment.tranchedPoolAddress, repayment.timestamp, gfiAmount));
        oldTotalInterest = newTotalInterest;
    }
    return rewards;
}
// ! The estimate done here is very crude. It's not as accurate as the code that lives at `ethereum/backerRewards` in the old Goldfinch client
function calculateAnnualizedGfiRewardsPerPrincipalDollar(summedRewardsByTranchedPool) {
    const rewardsPerPrincipalDollar = new Map();
    for (let i = 0; i < summedRewardsByTranchedPool.keys().length; i++) {
        const tranchedPoolAddress = summedRewardsByTranchedPool.keys()[i];
        const tranchedPool = schema_1.TranchedPool.load(tranchedPoolAddress);
        if (!tranchedPool) {
            throw new Error("Unable to load tranchedPool from summedRewardsByTranchedPool");
        }
        const creditLine = schema_1.CreditLine.load(tranchedPool.creditLine);
        if (!creditLine) {
            throw new Error("Unable to load creditLine from summedRewardsByTranchedPool");
        }
        let divisor = graph_ts_1.BigDecimal.fromString("1");
        if (tranchedPool.estimatedLeverageRatio !== null) {
            divisor = tranchedPool
                .estimatedLeverageRatio.plus(graph_ts_1.BigInt.fromI32(1))
                .toBigDecimal();
        }
        const juniorPrincipalDollars = creditLine.maxLimit
            .divDecimal(divisor)
            .div(constants_1.USDC_DECIMALS);
        const reward = summedRewardsByTranchedPool.get(tranchedPoolAddress);
        const perPrincipalDollar = reward.div(juniorPrincipalDollars);
        const numYears = creditLine.termInDays.divDecimal(graph_ts_1.BigDecimal.fromString("365"));
        const annualizedPerPrincipalDollar = perPrincipalDollar.div(numYears);
        rewardsPerPrincipalDollar.set(tranchedPoolAddress, annualizedPerPrincipalDollar);
    }
    return rewardsPerPrincipalDollar;
}
// Performs a simple (not compound) interest calculation on the creditLine, using the limit as the principal amount
function calculateInitialInterestOwed(creditLine) {
    const principal = creditLine.limit.toBigDecimal();
    const interestRatePerDay = creditLine.interestAprDecimal.div(graph_ts_1.BigDecimal.fromString("365"));
    const termInDays = creditLine.termInDays.toBigDecimal();
    const interestOwed = principal.times(interestRatePerDay.times(termInDays));
    return (0, utils_1.ceil)(interestOwed);
}
// Goes through all of the tokens for this pool and updates their rewards claimable
function updatePoolRewardsClaimable(tranchedPool, tranchedPoolContract) {
    const backerRewardsContractAddress = (0, utils_1.getAddressFromConfig)(tranchedPoolContract, constants_1.CONFIG_KEYS_ADDRESSES.BackerRewards);
    if (backerRewardsContractAddress.equals(graph_ts_1.Address.zero())) {
        return;
    }
    const backerRewardsContract = BackerRewards_1.BackerRewards.bind(backerRewardsContractAddress);
    const poolTokenIds = tranchedPool.tokens;
    for (let i = 0; i < poolTokenIds.length; i++) {
        const poolToken = assert(schema_1.PoolToken.load(poolTokenIds[i]));
        poolToken.rewardsClaimable =
            backerRewardsContract.poolTokenClaimableRewards(graph_ts_1.BigInt.fromString(poolToken.id));
        const stakingRewardsEarnedResult = backerRewardsContract.try_stakingRewardsEarnedSinceLastWithdraw(graph_ts_1.BigInt.fromString(poolToken.id));
        if (!stakingRewardsEarnedResult.reverted) {
            poolToken.stakingRewardsClaimable = stakingRewardsEarnedResult.value;
        }
        poolToken.save();
    }
}
exports.updatePoolRewardsClaimable = updatePoolRewardsClaimable;
function updatePoolTokensRedeemable(tranchedPool) {
    const tranchedPoolContract = TranchedPool_1.TranchedPool.bind(graph_ts_1.Address.fromString(tranchedPool.id));
    const poolTokenIds = tranchedPool.tokens;
    for (let i = 0; i < poolTokenIds.length; i++) {
        const poolToken = assert(schema_1.PoolToken.load(poolTokenIds[i]));
        const availableToWithdrawResult = tranchedPoolContract.try_availableToWithdraw(graph_ts_1.BigInt.fromString(poolToken.id));
        if (!availableToWithdrawResult.reverted) {
            poolToken.interestRedeemable = availableToWithdrawResult.value.value0;
            poolToken.principalRedeemable = availableToWithdrawResult.value.value1;
        }
        else {
            graph_ts_1.log.warning("availableToWithdraw reverted for pool token {} on TranchedPool {}", [poolToken.id, tranchedPool.id]);
        }
        poolToken.save();
    }
}
exports.updatePoolTokensRedeemable = updatePoolTokensRedeemable;
