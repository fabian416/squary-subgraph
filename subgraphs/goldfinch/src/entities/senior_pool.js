"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalculateSeniorPoolAPY = exports.updatePoolInvestments = exports.updatePoolStatus = exports.updateEstimatedApyFromGfiRaw = exports.getOrInitSeniorPoolStatus = exports.SENIOR_POOL_STATUS_ID = exports.getOrInitSeniorPool = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const SeniorPool_1 = require("../../generated/SeniorPool/SeniorPool");
const Fidu_1 = require("../../generated/SeniorPool/Fidu");
const USDC_1 = require("../../generated/SeniorPool/USDC");
const constants_1 = require("../common/constants");
const helpers_1 = require("./helpers");
const staking_rewards_1 = require("./staking_rewards");
const utils_1 = require("../common/utils");
const constants_2 = require("../common/constants");
function getOrInitSeniorPool(address) {
    let seniorPool = schema_1.SeniorPool.load(address.toHexString());
    if (!seniorPool) {
        seniorPool = new schema_1.SeniorPool(address.toHexString());
        seniorPool.investmentsMade = [];
        const poolStatus = getOrInitSeniorPoolStatus();
        seniorPool.latestPoolStatus = poolStatus.id;
        seniorPool.save();
    }
    return seniorPool;
}
exports.getOrInitSeniorPool = getOrInitSeniorPool;
exports.SENIOR_POOL_STATUS_ID = "1";
function getOrInitSeniorPoolStatus() {
    let poolStatus = schema_1.SeniorPoolStatus.load(exports.SENIOR_POOL_STATUS_ID);
    if (!poolStatus) {
        poolStatus = new schema_1.SeniorPoolStatus(exports.SENIOR_POOL_STATUS_ID);
        poolStatus.rawBalance = new graph_ts_1.BigInt(0);
        poolStatus.balance = new graph_ts_1.BigInt(0);
        poolStatus.totalShares = new graph_ts_1.BigInt(0);
        poolStatus.sharePrice = new graph_ts_1.BigInt(0);
        poolStatus.totalPoolAssets = new graph_ts_1.BigInt(0);
        poolStatus.totalPoolAssetsUsdc = new graph_ts_1.BigInt(0);
        poolStatus.totalLoansOutstanding = new graph_ts_1.BigInt(0);
        poolStatus.cumulativeWritedowns = new graph_ts_1.BigInt(0);
        poolStatus.cumulativeDrawdowns = new graph_ts_1.BigInt(0);
        poolStatus.estimatedTotalInterest = graph_ts_1.BigDecimal.zero();
        poolStatus.estimatedApy = graph_ts_1.BigDecimal.zero();
        poolStatus.estimatedApyFromGfiRaw = graph_ts_1.BigDecimal.zero();
        poolStatus.defaultRate = new graph_ts_1.BigInt(0);
        poolStatus.tranchedPools = [];
        poolStatus.usdcBalance = graph_ts_1.BigInt.zero();
        poolStatus.save();
    }
    return poolStatus;
}
exports.getOrInitSeniorPoolStatus = getOrInitSeniorPoolStatus;
function updateEstimatedApyFromGfiRaw() {
    const stakingRewards = (0, staking_rewards_1.getStakingRewards)();
    const seniorPoolStatus = getOrInitSeniorPoolStatus();
    if (seniorPoolStatus.sharePrice != graph_ts_1.BigInt.zero()) {
        seniorPoolStatus.estimatedApyFromGfiRaw =
            stakingRewards.currentEarnRatePerToken
                .times(graph_ts_1.BigInt.fromI32(constants_1.SECONDS_PER_YEAR))
                .toBigDecimal()
                .times(constants_2.FIDU_DECIMALS) // This might be better thought of as the share-price mantissa, which happens to be the same as `FIDU_DECIMALS`.
                .div(seniorPoolStatus.sharePrice.toBigDecimal())
                .div(constants_2.GFI_DECIMALS);
        seniorPoolStatus.save();
    }
}
exports.updateEstimatedApyFromGfiRaw = updateEstimatedApyFromGfiRaw;
function updatePoolStatus(event) {
    const seniorPoolAddress = event.address;
    const seniorPool = getOrInitSeniorPool(seniorPoolAddress);
    const seniorPoolContract = SeniorPool_1.SeniorPool.bind(seniorPoolAddress);
    const fidu_contract = Fidu_1.Fidu.bind((0, utils_1.getAddressFromConfig)(seniorPoolContract, constants_1.CONFIG_KEYS_ADDRESSES.Fidu));
    const usdc_contract = USDC_1.USDC.bind((0, utils_1.getAddressFromConfig)(seniorPoolContract, constants_1.CONFIG_KEYS_ADDRESSES.USDC));
    const sharePrice = seniorPoolContract.sharePrice();
    const totalLoansOutstanding = seniorPoolContract.totalLoansOutstanding();
    const totalSupply = fidu_contract.totalSupply();
    const totalPoolAssets = totalSupply.times(sharePrice);
    const totalPoolAssetsUsdc = (0, utils_1.bigDecimalToBigInt)(totalPoolAssets
        .toBigDecimal()
        .times(constants_2.USDC_DECIMALS)
        .div(constants_2.FIDU_DECIMALS)
        .div(constants_2.FIDU_DECIMALS));
    const balance = seniorPoolContract
        .assets()
        .minus(seniorPoolContract.totalLoansOutstanding())
        .plus(seniorPoolContract.totalWritedowns());
    const rawBalance = balance;
    const poolStatus = schema_1.SeniorPoolStatus.load(seniorPool.latestPoolStatus);
    poolStatus.totalLoansOutstanding = totalLoansOutstanding;
    poolStatus.totalShares = totalSupply;
    poolStatus.balance = balance;
    poolStatus.sharePrice = sharePrice;
    poolStatus.rawBalance = rawBalance;
    poolStatus.usdcBalance = usdc_contract.balanceOf(seniorPoolAddress);
    poolStatus.totalPoolAssets = totalPoolAssets;
    poolStatus.totalPoolAssetsUsdc = totalPoolAssetsUsdc;
    poolStatus.save();
    recalculateSeniorPoolAPY(poolStatus);
    updateEstimatedApyFromGfiRaw();
    seniorPool.latestPoolStatus = poolStatus.id;
    seniorPool.save();
}
exports.updatePoolStatus = updatePoolStatus;
function updatePoolInvestments(seniorPoolAddress, tranchedPoolAddress) {
    const seniorPool = getOrInitSeniorPool(seniorPoolAddress);
    const investments = seniorPool.investmentsMade;
    investments.push(tranchedPoolAddress.toHexString());
    seniorPool.investmentsMade = investments;
    seniorPool.save();
}
exports.updatePoolInvestments = updatePoolInvestments;
function recalculateSeniorPoolAPY(poolStatus) {
    let estimatedTotalInterest = graph_ts_1.BigDecimal.zero();
    for (let i = 0; i < poolStatus.tranchedPools.length; i++) {
        const tranchedPoolId = poolStatus.tranchedPools[i];
        if (!tranchedPoolId) {
            continue;
        }
        estimatedTotalInterest = estimatedTotalInterest.plus((0, helpers_1.calculateEstimatedInterestForTranchedPool)(tranchedPoolId));
    }
    poolStatus.estimatedTotalInterest = estimatedTotalInterest;
    if (poolStatus.totalPoolAssets.notEqual(graph_ts_1.BigInt.zero())) {
        // The goofy-looking math here is required to get things in the right units for arithmetic
        const totalPoolAssetsInDollars = poolStatus.totalPoolAssets
            .toBigDecimal()
            .div(constants_2.FIDU_DECIMALS)
            .div(constants_2.FIDU_DECIMALS)
            .times(constants_2.USDC_DECIMALS);
        const estimatedApy = estimatedTotalInterest.div(totalPoolAssetsInDollars);
        poolStatus.estimatedApy = estimatedApy;
    }
    poolStatus.save();
}
exports.recalculateSeniorPoolAPY = recalculateSeniorPoolAPY;
