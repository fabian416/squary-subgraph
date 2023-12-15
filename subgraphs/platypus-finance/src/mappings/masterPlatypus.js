"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEmergencyWithdraw = exports.handleDepositFor = exports.handleWithdraw = exports.handleDeposit = exports.getAssetForRewards = exports.getBonusRewardTPS = exports.addRewardTokenToAsset = exports.updatePoolRewards = exports.handlePlatypus = exports.handleFactoryPlatypus = exports.handleOldPlatypus = void 0;
const schema_1 = require("../../generated/schema");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const getters_1 = require("../common/getters");
const MasterPlatypus_1 = require("../../generated/MasterPlatypus/MasterPlatypus");
const MasterPlatypusOld_1 = require("../../generated/MasterPlatypusOld/MasterPlatypusOld");
const MasterPlatypusFactory_1 = require("../../generated/MasterPlatypusFactory/MasterPlatypusFactory");
const SimpleRewarder_1 = require("../../generated/MasterPlatypus/SimpleRewarder");
const constants_1 = require("../common/constants");
const numbers_1 = require("../common/utils/numbers");
const rewards_1 = require("../common/rewards");
function handleOldPlatypus(event, pid, harvestRewards) {
    const MasterPlatypusContract = MasterPlatypusOld_1.MasterPlatypusOld.bind(constants_1.MasterPlatypusOld_ADDRESS);
    const poolInfo = MasterPlatypusContract.try_poolInfo(pid);
    if (poolInfo.reverted) {
        graph_ts_1.log.error("[HandleRewards][{}]error fetching poolInfo for pid {} from MP {}", [
            event.transaction.hash.toHexString(),
            pid.toString(),
            event.address.toHexString(),
        ]);
        return null;
    }
    const poolInfoMap = poolInfo.value;
    const poolPoints = poolInfoMap.value1;
    const _asset = schema_1._Asset.load(poolInfoMap.value0.toHexString());
    if (!_asset) {
        graph_ts_1.log.error("[HandleRewards][{}]Asset not found {}", [
            event.transaction.hash.toHexString(),
            poolInfoMap.value0.toHexString(),
        ]);
        return null;
    }
    if (harvestRewards) {
        // _asset!._index = pid;
        addRewardTokenToAsset(event, graph_ts_1.Address.fromString(constants_1.PTPAddress), _asset);
        _asset.save();
        const getTotalPoints_call = MasterPlatypusContract.try_totalAllocPoint();
        if (getTotalPoints_call.reverted) {
            graph_ts_1.log.error("[HandleRewards][{}]error fetching Ptp per second for pid {} old master plat", [
                event.transaction.hash.toHexString(),
                pid.toString(),
            ]);
        }
        const totalPoints = getTotalPoints_call.value;
        const ptpPerSecond_call = MasterPlatypusContract.try_ptpPerSec();
        if (ptpPerSecond_call.reverted) {
            graph_ts_1.log.error("[HandleRewards][{}]error fetching Ptp per second for pid {} old master plat", [
                event.transaction.hash.toHexString(),
                pid.toString(),
            ]);
        }
        const ptpPerSecond = ptpPerSecond_call.value;
        const rewarder = poolInfoMap.value4;
        if (rewarder.notEqual(constants_1.ZERO_ADDRESS)) {
            const bonusRewards = MasterPlatypusContract.try_rewarderBonusTokenInfo(pid);
            if (bonusRewards.reverted) {
                graph_ts_1.log.error("[HandleRewards][{}]error fetching bonusRewards for pid {}", [
                    event.transaction.hash.toHexString(),
                    pid.toString(),
                ]);
            }
            addRewardTokenToAsset(event, bonusRewards.value.value0, _asset);
        }
        const rewardTokenEmissionsAmount = new Array();
        const rewardTokenEmissionsUSD = new Array();
        for (let k = 0; k < _asset.rewardTokens.length; k++) {
            let tps;
            const rewardToken = schema_1.RewardToken.load(_asset.rewardTokens[k]);
            const token = (0, getters_1.getOrCreateToken)(event, graph_ts_1.Address.fromString(rewardToken.token));
            graph_ts_1.log.debug("[HandleRewards][{}] Asset: {}, RT: {}, rewarder: {}", [
                event.transaction.hash.toHexString(),
                _asset.id.toString(),
                rewardToken.id.toString(),
                rewarder.toHexString(),
            ]);
            if (token.id == constants_1.PTPAddress) {
                tps = ptpPerSecond.times(poolPoints).div(totalPoints);
            }
            else {
                tps = getBonusRewardTPS(rewarder);
            }
            graph_ts_1.log.debug("rt {} tps {}", [rewardToken.id.toString(), tps.toString()]);
            rewardTokenEmissionsAmount.push((0, rewards_1.emissionsPerDay)(tps));
            rewardTokenEmissionsUSD.push((0, numbers_1.tokenAmountToUSDAmount)(token, (0, rewards_1.emissionsPerDay)(tps)));
        }
        _asset.rewardTokenEmissionsAmount = rewardTokenEmissionsAmount;
        _asset.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
    }
    _asset.save();
    return _asset;
}
exports.handleOldPlatypus = handleOldPlatypus;
function handleFactoryPlatypus(event, pid, harvestRewards) {
    const MasterPlatypusContract = MasterPlatypusFactory_1.MasterPlatypusFactory.bind(constants_1.MasterPlatypusFactory_ADDRESS);
    const poolInfo = MasterPlatypusContract.try_poolInfo(pid);
    if (poolInfo.reverted) {
        graph_ts_1.log.error("[HandleRewards][{}]error fetching poolInfo for pid {} from MP {}", [
            event.transaction.hash.toHexString(),
            pid.toString(),
            event.address.toHexString(),
        ]);
        return null;
    }
    const poolInfoMap = poolInfo.value;
    const poolPoints = poolInfoMap.value1;
    const _asset = schema_1._Asset.load(poolInfoMap.value0.toHexString());
    if (!_asset) {
        graph_ts_1.log.error("[HandleRewards][{}]Asset not found {}", [
            event.transaction.hash.toHexString(),
            poolInfoMap.value0.toHexString(),
        ]);
        return null;
    }
    if (harvestRewards) {
        // _asset!._index = pid;
        addRewardTokenToAsset(event, graph_ts_1.Address.fromString(constants_1.PTPAddress), _asset);
        _asset.save();
        const getTotalPoints_call = MasterPlatypusContract.try_totalBaseAllocPoint();
        if (getTotalPoints_call.reverted) {
            graph_ts_1.log.error("[HandleRewards][{}]error fetching Ptp per second for pid {} old master plat", [
                event.transaction.hash.toHexString(),
                pid.toString(),
            ]);
        }
        const totalPoints = getTotalPoints_call.value;
        const ptpPerSecond_call = MasterPlatypusContract.try_ptpPerSec();
        if (ptpPerSecond_call.reverted) {
            graph_ts_1.log.error("[HandleRewards][{}]error fetching Ptp per second for pid {} old master plat", [
                event.transaction.hash.toHexString(),
                pid.toString(),
            ]);
        }
        const ptpPerSecond = ptpPerSecond_call.value;
        const rewarder = poolInfoMap.value4;
        if (rewarder.notEqual(constants_1.ZERO_ADDRESS)) {
            const bonusRewards = MasterPlatypusContract.try_rewarderBonusTokenInfo(pid);
            if (bonusRewards.reverted) {
                graph_ts_1.log.error("[HandleRewards][{}]error fetching bonusRewards for pid {}", [
                    event.transaction.hash.toHexString(),
                    pid.toString(),
                ]);
            }
            addRewardTokenToAsset(event, bonusRewards.value.value0, _asset);
        }
        const rewardTokenEmissionsAmount = new Array();
        const rewardTokenEmissionsUSD = new Array();
        for (let k = 0; k < _asset.rewardTokens.length; k++) {
            let tps;
            const rewardToken = schema_1.RewardToken.load(_asset.rewardTokens[k]);
            const token = (0, getters_1.getOrCreateToken)(event, graph_ts_1.Address.fromString(rewardToken.token));
            graph_ts_1.log.debug("[HandleRewards][{}] Asset: {}, RT: {}, rewarder: {}", [
                event.transaction.hash.toHexString(),
                _asset.id.toString(),
                rewardToken.id.toString(),
                rewarder.toHexString(),
            ]);
            if (token.id == constants_1.PTPAddress) {
                tps = ptpPerSecond.times(poolPoints).div(totalPoints);
            }
            else {
                tps = getBonusRewardTPS(rewarder);
            }
            graph_ts_1.log.debug("rt {} tps {}", [rewardToken.id.toString(), tps.toString()]);
            rewardTokenEmissionsAmount.push((0, rewards_1.emissionsPerDay)(tps));
            rewardTokenEmissionsUSD.push((0, numbers_1.tokenAmountToUSDAmount)(token, (0, rewards_1.emissionsPerDay)(tps)));
        }
        _asset.rewardTokenEmissionsAmount = rewardTokenEmissionsAmount;
        _asset.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
    }
    _asset.save();
    return _asset;
}
exports.handleFactoryPlatypus = handleFactoryPlatypus;
function handlePlatypus(event, pid, harvestRewards) {
    const MasterPlatypusContract = MasterPlatypus_1.MasterPlatypus.bind(event.address);
    const poolInfo = MasterPlatypusContract.try_poolInfo(pid);
    if (poolInfo.reverted) {
        graph_ts_1.log.error("[HandleRewards][{}]error fetching poolInfo for pid {} from MP {}", [
            event.transaction.hash.toHexString(),
            pid.toString(),
            event.address.toHexString(),
        ]);
        return null;
    }
    const poolInfoMap = poolInfo.value;
    const poolPoints = poolInfoMap.value7;
    const _asset = schema_1._Asset.load(poolInfoMap.value0.toHexString());
    if (!_asset) {
        graph_ts_1.log.error("[HandleRewards][{}]Asset not found {}", [
            event.transaction.hash.toHexString(),
            poolInfoMap.value0.toHexString(),
        ]);
        return null;
    }
    if (harvestRewards) {
        // _asset!._index = pid;
        addRewardTokenToAsset(event, graph_ts_1.Address.fromString(constants_1.PTPAddress), _asset);
        _asset.save();
        const getTotalPoints_call = MasterPlatypusContract.try_totalAdjustedAllocPoint();
        if (getTotalPoints_call.reverted) {
            graph_ts_1.log.error("[HandleRewards][{}]error fetching Ptp per second for pid {} old master plat", [
                event.transaction.hash.toHexString(),
                pid.toString(),
            ]);
        }
        const totalPoints = getTotalPoints_call.value;
        const ptpPerSecond_call = MasterPlatypusContract.try_ptpPerSec();
        if (ptpPerSecond_call.reverted) {
            graph_ts_1.log.error("[HandleRewards][{}]error fetching Ptp per second for pid {} old master plat", [
                event.transaction.hash.toHexString(),
                pid.toString(),
            ]);
        }
        const ptpPerSecond = ptpPerSecond_call.value;
        const rewarder = poolInfoMap.value4;
        if (rewarder.notEqual(constants_1.ZERO_ADDRESS)) {
            const bonusRewards = MasterPlatypusContract.try_rewarderBonusTokenInfo(pid);
            if (bonusRewards.reverted) {
                graph_ts_1.log.error("[HandleRewards][{}]error fetching bonusRewards for pid {}", [
                    event.transaction.hash.toHexString(),
                    pid.toString(),
                ]);
            }
            addRewardTokenToAsset(event, bonusRewards.value.value0, _asset);
        }
        const rewardTokenEmissionsAmount = new Array();
        const rewardTokenEmissionsUSD = new Array();
        for (let k = 0; k < _asset.rewardTokens.length; k++) {
            let tps;
            const rewardToken = schema_1.RewardToken.load(_asset.rewardTokens[k]);
            const token = (0, getters_1.getOrCreateToken)(event, graph_ts_1.Address.fromString(rewardToken.token));
            graph_ts_1.log.debug("[HandleRewards][{}] Asset: {}, RT: {}, rewarder: {}", [
                event.transaction.hash.toHexString(),
                _asset.id.toString(),
                rewardToken.id.toString(),
                rewarder.toHexString(),
            ]);
            if (token.id == constants_1.PTPAddress) {
                tps = ptpPerSecond.times(poolPoints).div(totalPoints);
            }
            else {
                tps = getBonusRewardTPS(rewarder);
            }
            graph_ts_1.log.debug("rt {} tps {}", [rewardToken.id.toString(), tps.toString()]);
            rewardTokenEmissionsAmount.push((0, rewards_1.emissionsPerDay)(tps));
            rewardTokenEmissionsUSD.push((0, numbers_1.tokenAmountToUSDAmount)(token, (0, rewards_1.emissionsPerDay)(tps)));
        }
        _asset.rewardTokenEmissionsAmount = rewardTokenEmissionsAmount;
        _asset.rewardTokenEmissionsUSD = rewardTokenEmissionsUSD;
    }
    _asset.save();
    return _asset;
}
exports.handlePlatypus = handlePlatypus;
function updatePoolRewards(event, assetAddress) {
    graph_ts_1.log.debug("[UpdateRewards][{}] get pool {}", [event.transaction.hash.toHexString(), assetAddress.toHexString()]);
    const pool = schema_1.LiquidityPool.load(assetAddress.toHexString());
    if (!pool._ignore) {
        const _asset = schema_1._Asset.load(assetAddress.toHexString());
        if (_asset.rewardTokens) {
            pool.rewardTokens = _asset.rewardTokens;
            pool.rewardTokenEmissionsAmount = _asset.rewardTokenEmissionsAmount;
            pool.rewardTokenEmissionsUSD = _asset.rewardTokenEmissionsUSD;
            pool.save();
        }
    }
    graph_ts_1.log.debug("[UpdateRewards][{}] pool {} : final AMT: {} USD: {}", [
        event.transaction.hash.toHexString(),
        pool.id,
        pool.rewardTokenEmissionsAmount.toString(),
        pool.rewardTokenEmissionsUSD.toString(),
    ]);
}
exports.updatePoolRewards = updatePoolRewards;
function addRewardTokenToAsset(event, rtAddress, _asset) {
    const rt = (0, getters_1.getOrCreateRewardToken)(event, rtAddress);
    let rts = _asset.rewardTokens;
    if (!rts) {
        rts = new Array();
    }
    if (rts.indexOf(rt.id) < 0) {
        rts.push(rt.id);
        graph_ts_1.log.debug("Added Reward {} Token {} to Asset {}", [
            rt.id.toString(),
            rtAddress.toHexString(),
            _asset.id.toString(),
        ]);
        _asset.rewardTokens = rts;
        _asset.save();
    }
    return rt;
}
exports.addRewardTokenToAsset = addRewardTokenToAsset;
function getBonusRewardTPS(rewarder) {
    if (rewarder.equals(constants_1.ZERO_ADDRESS)) {
        return constants_1.BIGINT_ZERO;
    }
    const rewarderContract = SimpleRewarder_1.SimpleRewarder.bind(rewarder);
    const tps = rewarderContract.try_tokenPerSec();
    if (tps.reverted) {
        graph_ts_1.log.error("[HandleRewards]error fetching simplerewarder {} getting tps ", [
            rewarderContract._address.toHexString(),
        ]);
    }
    return tps.value;
}
exports.getBonusRewardTPS = getBonusRewardTPS;
function getAssetForRewards(event, harvestRewards) {
    const pid = event.params.pid;
    if (event.address.equals(constants_1.MasterPlatypusOld_ADDRESS)) {
        return handleOldPlatypus(event, pid, harvestRewards);
    }
    else if (event.address == constants_1.MasterPlatypusFactory_ADDRESS) {
        return handleFactoryPlatypus(event, pid, harvestRewards);
    }
    else {
        return handlePlatypus(event, pid, harvestRewards);
    }
}
exports.getAssetForRewards = getAssetForRewards;
function handleDeposit(event) {
    const _asset = getAssetForRewards(event, true);
    if (!_asset) {
        graph_ts_1.log.error("[{}] error handling masterchef event, potentially unexpected asset", [
            event.transaction.hash.toHexString(),
        ]);
        return;
    }
    _asset.amountStaked = _asset.amountStaked.plus(event.params.amount);
    _asset.save();
    updatePoolRewards(event, graph_ts_1.Address.fromString(_asset.id));
}
exports.handleDeposit = handleDeposit;
function handleWithdraw(event) {
    const _asset = getAssetForRewards(event, true);
    if (!_asset) {
        graph_ts_1.log.error("[{}] error handling masterchef event, potentially unexpected asset", [
            event.transaction.hash.toHexString(),
        ]);
        return;
    }
    _asset.amountStaked = _asset.amountStaked.minus(event.params.amount);
    _asset.save();
    updatePoolRewards(event, graph_ts_1.Address.fromString(_asset.id));
}
exports.handleWithdraw = handleWithdraw;
function handleDepositFor(event) {
    const _asset = getAssetForRewards(event, true);
    if (!_asset) {
        graph_ts_1.log.error("[{}] error handling masterchef event, potentially unexpected asset", [
            event.transaction.hash.toHexString(),
        ]);
        return;
    }
    _asset.amountStaked = _asset.amountStaked.plus(event.params.amount);
    _asset.save();
    updatePoolRewards(event, graph_ts_1.Address.fromString(_asset.id));
}
exports.handleDepositFor = handleDepositFor;
function handleEmergencyWithdraw(event) {
    const _asset = getAssetForRewards(event, false);
    if (!_asset) {
        graph_ts_1.log.error("[{}] error handling masterchef event, potentially unexpected asset", [
            event.transaction.hash.toHexString(),
        ]);
        return;
    }
    _asset.amountStaked = _asset.amountStaked.minus(event.params.amount);
    _asset.save();
}
exports.handleEmergencyWithdraw = handleEmergencyWithdraw;
