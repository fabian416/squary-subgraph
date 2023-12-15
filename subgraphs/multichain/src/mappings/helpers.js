"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLiquidityWithdrawEvent = exports.createLiquidityDepositEvent = exports.createBridgeTransferEvent = exports.updateProtocolTVL = exports.updateUsageMetrics = exports.updateRevenue = exports.updateVolume = exports.updatePoolMetrics = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../common/constants");
const getters_1 = require("../common/getters");
const numbers_1 = require("../common/utils/numbers");
const arrays_1 = require("../common/utils/arrays");
const schema_1 = require("../../generated/schema");
const configure_1 = require("../../configurations/configure");
const datetime_1 = require("../common/utils/datetime");
function updatePoolMetrics(token, crosschainToken, pool, poolDailySnapshot, poolHourlySnapshot, poolRoute, poolRouteDailySnapshotID, poolRouteHourlySnapshotID, block) {
    pool.inputTokenBalance = token._totalSupply;
    pool.totalValueLockedUSD = (0, numbers_1.bigIntToBigDecimal)(pool.inputTokenBalance, token.decimals).times(token.lastPriceUSD);
    pool.routes = (0, arrays_1.arrayUnique)((0, arrays_1.addToArrayAtIndex)(pool.routes, poolRoute.id));
    pool.destinationTokens = (0, arrays_1.arrayUnique)((0, arrays_1.addToArrayAtIndex)(pool.destinationTokens, crosschainToken.address));
    poolDailySnapshot.inputTokenBalance = pool.inputTokenBalance;
    poolDailySnapshot.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolDailySnapshot.routes = (0, arrays_1.arrayUnique)((0, arrays_1.addToArrayAtIndex)(poolDailySnapshot.routes, poolRouteDailySnapshotID));
    poolDailySnapshot.blockNumber = block.number;
    poolDailySnapshot.timestamp = block.timestamp;
    poolHourlySnapshot.inputTokenBalance = pool.inputTokenBalance;
    poolHourlySnapshot.totalValueLockedUSD = pool.totalValueLockedUSD;
    poolHourlySnapshot.routes = (0, arrays_1.arrayUnique)((0, arrays_1.addToArrayAtIndex)(poolHourlySnapshot.routes, poolRouteHourlySnapshotID));
    poolHourlySnapshot.blockNumber = block.number;
    poolHourlySnapshot.timestamp = block.timestamp;
    if (pool.type == constants_1.BridgePoolType.BURN_MINT) {
        pool.mintSupply = token._totalSupply;
        poolDailySnapshot.mintSupply = pool.mintSupply;
        poolHourlySnapshot.mintSupply = pool.mintSupply;
    }
}
exports.updatePoolMetrics = updatePoolMetrics;
function updateVolume(protocol, financialMetrics, token, pool, poolDailySnapshot, poolHourlySnapshot, poolRoute, poolRouteDailySnapshot, poolRouteHourlySnapshot, isOutgoing, amount) {
    let volumeIn = constants_1.BIGINT_ZERO;
    let volumeInUSD = constants_1.BIGDECIMAL_ZERO;
    let volumeOut = constants_1.BIGINT_ZERO;
    let volumeOutUSD = constants_1.BIGDECIMAL_ZERO;
    if (isOutgoing) {
        volumeOut = amount;
        volumeOutUSD = (0, numbers_1.bigIntToBigDecimal)(volumeOut, token.decimals).times(token.lastPriceUSD);
    }
    else {
        volumeIn = amount;
        volumeInUSD = (0, numbers_1.bigIntToBigDecimal)(volumeIn, token.decimals).times(token.lastPriceUSD);
    }
    protocol.cumulativeVolumeInUSD =
        protocol.cumulativeVolumeInUSD.plus(volumeInUSD);
    protocol.cumulativeVolumeOutUSD =
        protocol.cumulativeVolumeOutUSD.plus(volumeOutUSD);
    protocol.cumulativeTotalVolumeUSD = protocol.cumulativeVolumeOutUSD.plus(protocol.cumulativeVolumeInUSD);
    protocol.netVolumeUSD = protocol.cumulativeVolumeInUSD.minus(protocol.cumulativeVolumeOutUSD);
    pool.cumulativeVolumeIn = pool.cumulativeVolumeIn.plus(volumeIn);
    pool.cumulativeVolumeInUSD = pool.cumulativeVolumeInUSD.plus(volumeInUSD);
    pool.cumulativeVolumeOut = pool.cumulativeVolumeOut.plus(volumeOut);
    pool.cumulativeVolumeOutUSD = pool.cumulativeVolumeOutUSD.plus(volumeOutUSD);
    pool.netVolume = pool.cumulativeVolumeIn.minus(pool.cumulativeVolumeOut);
    pool.netVolumeUSD = pool.cumulativeVolumeInUSD.minus(pool.cumulativeVolumeOutUSD);
    poolRoute.cumulativeVolumeIn = poolRoute.cumulativeVolumeIn.plus(volumeIn);
    poolRoute.cumulativeVolumeInUSD =
        poolRoute.cumulativeVolumeInUSD.plus(volumeInUSD);
    poolRoute.cumulativeVolumeOut = poolRoute.cumulativeVolumeOut.plus(volumeOut);
    poolRoute.cumulativeVolumeOutUSD =
        poolRoute.cumulativeVolumeOutUSD.plus(volumeOutUSD);
    poolDailySnapshot.dailyVolumeIn =
        poolDailySnapshot.dailyVolumeIn.plus(volumeIn);
    poolDailySnapshot.dailyVolumeInUSD =
        poolDailySnapshot.dailyVolumeInUSD.plus(volumeInUSD);
    poolDailySnapshot.cumulativeVolumeIn = pool.cumulativeVolumeIn;
    poolDailySnapshot.cumulativeVolumeInUSD = pool.cumulativeVolumeInUSD;
    poolDailySnapshot.dailyVolumeOut =
        poolDailySnapshot.dailyVolumeOut.plus(volumeOut);
    poolDailySnapshot.dailyVolumeOutUSD =
        poolDailySnapshot.dailyVolumeOutUSD.plus(volumeOutUSD);
    poolDailySnapshot.cumulativeVolumeOut = pool.cumulativeVolumeOut;
    poolDailySnapshot.cumulativeVolumeOutUSD = pool.cumulativeVolumeOutUSD;
    poolDailySnapshot.netDailyVolume = poolDailySnapshot.dailyVolumeIn.minus(poolDailySnapshot.dailyVolumeOut);
    poolDailySnapshot.netDailyVolumeUSD =
        poolDailySnapshot.dailyVolumeInUSD.minus(poolDailySnapshot.dailyVolumeOutUSD);
    poolDailySnapshot.netCumulativeVolume = pool.netVolume;
    poolDailySnapshot.netCumulativeVolumeUSD = pool.netVolumeUSD;
    poolRouteDailySnapshot.snapshotVolumeIn =
        poolRouteDailySnapshot.snapshotVolumeIn.plus(volumeIn);
    poolRouteDailySnapshot.snapshotVolumeInUSD =
        poolRouteDailySnapshot.snapshotVolumeInUSD.plus(volumeInUSD);
    poolRouteDailySnapshot.cumulativeVolumeIn = pool.cumulativeVolumeIn;
    poolRouteDailySnapshot.cumulativeVolumeInUSD = pool.cumulativeVolumeInUSD;
    poolRouteDailySnapshot.snapshotVolumeOut =
        poolRouteDailySnapshot.snapshotVolumeOut.plus(volumeOut);
    poolRouteDailySnapshot.snapshotVolumeOutUSD =
        poolRouteDailySnapshot.snapshotVolumeOutUSD.plus(volumeOutUSD);
    poolRouteDailySnapshot.cumulativeVolumeOut = pool.cumulativeVolumeOut;
    poolRouteDailySnapshot.cumulativeVolumeOutUSD = pool.cumulativeVolumeOutUSD;
    poolHourlySnapshot.hourlyVolumeIn =
        poolHourlySnapshot.hourlyVolumeIn.plus(volumeIn);
    poolHourlySnapshot.hourlyVolumeInUSD =
        poolHourlySnapshot.hourlyVolumeInUSD.plus(volumeInUSD);
    poolHourlySnapshot.cumulativeVolumeIn = pool.cumulativeVolumeIn;
    poolHourlySnapshot.cumulativeVolumeInUSD = pool.cumulativeVolumeInUSD;
    poolHourlySnapshot.hourlyVolumeOut =
        poolHourlySnapshot.hourlyVolumeOut.plus(volumeOut);
    poolHourlySnapshot.hourlyVolumeOutUSD =
        poolHourlySnapshot.hourlyVolumeOutUSD.plus(volumeOutUSD);
    poolHourlySnapshot.cumulativeVolumeOut = pool.cumulativeVolumeOut;
    poolHourlySnapshot.cumulativeVolumeOutUSD = pool.cumulativeVolumeOutUSD;
    poolHourlySnapshot.netHourlyVolume = poolHourlySnapshot.hourlyVolumeIn.minus(poolHourlySnapshot.hourlyVolumeOut);
    poolHourlySnapshot.netHourlyVolumeUSD =
        poolHourlySnapshot.hourlyVolumeInUSD.minus(poolHourlySnapshot.hourlyVolumeOutUSD);
    poolHourlySnapshot.netCumulativeVolume = pool.netVolume;
    poolHourlySnapshot.netCumulativeVolumeUSD = pool.netVolumeUSD;
    poolRouteHourlySnapshot.snapshotVolumeIn =
        poolRouteHourlySnapshot.snapshotVolumeIn.plus(volumeIn);
    poolRouteHourlySnapshot.snapshotVolumeInUSD =
        poolRouteHourlySnapshot.snapshotVolumeInUSD.plus(volumeInUSD);
    poolRouteHourlySnapshot.cumulativeVolumeIn = pool.cumulativeVolumeIn;
    poolRouteHourlySnapshot.cumulativeVolumeInUSD = pool.cumulativeVolumeInUSD;
    poolRouteHourlySnapshot.snapshotVolumeOut =
        poolRouteHourlySnapshot.snapshotVolumeOut.plus(volumeOut);
    poolRouteHourlySnapshot.snapshotVolumeOutUSD =
        poolRouteHourlySnapshot.snapshotVolumeOutUSD.plus(volumeOutUSD);
    poolRouteHourlySnapshot.cumulativeVolumeOut = pool.cumulativeVolumeOut;
    poolRouteHourlySnapshot.cumulativeVolumeOutUSD = pool.cumulativeVolumeOutUSD;
    financialMetrics.dailyVolumeInUSD =
        financialMetrics.dailyVolumeInUSD.plus(volumeInUSD);
    financialMetrics.cumulativeVolumeInUSD = protocol.cumulativeVolumeInUSD;
    financialMetrics.dailyVolumeOutUSD =
        financialMetrics.dailyVolumeOutUSD.plus(volumeOutUSD);
    financialMetrics.cumulativeVolumeOutUSD = protocol.cumulativeVolumeOutUSD;
    financialMetrics.dailyNetVolumeUSD = financialMetrics.dailyVolumeInUSD.minus(financialMetrics.dailyVolumeOutUSD);
    financialMetrics.cumulativeNetVolumeUSD = protocol.netVolumeUSD;
}
exports.updateVolume = updateVolume;
function updateRevenue(protocol, financialMetrics, pool, poolDailySnapshot, poolHourlySnapshot, feeUSD) {
    const protocolSideRevenueUSD = feeUSD.times(constants_1.BIGDECIMAL_FIFTY_FIVE.div(constants_1.BIGDECIMAL_HUNDRED));
    const supplySideRevenueUSD = feeUSD.times(constants_1.BIGDECIMAL_FOURTY_FIVE.div(constants_1.BIGDECIMAL_HUNDRED));
    protocol.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD.plus(supplySideRevenueUSD);
    protocol.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
    protocol.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD.plus(feeUSD);
    pool.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD.plus(supplySideRevenueUSD);
    pool.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
    pool.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD.plus(feeUSD);
    poolDailySnapshot.dailySupplySideRevenueUSD =
        poolDailySnapshot.dailySupplySideRevenueUSD.plus(supplySideRevenueUSD);
    poolDailySnapshot.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolDailySnapshot.dailyProtocolSideRevenueUSD =
        poolDailySnapshot.dailyProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
    poolDailySnapshot.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolDailySnapshot.dailyTotalRevenueUSD =
        poolDailySnapshot.dailyTotalRevenueUSD.plus(feeUSD);
    poolDailySnapshot.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    poolHourlySnapshot.hourlySupplySideRevenueUSD =
        poolHourlySnapshot.hourlySupplySideRevenueUSD.plus(supplySideRevenueUSD);
    poolHourlySnapshot.cumulativeSupplySideRevenueUSD =
        pool.cumulativeSupplySideRevenueUSD;
    poolHourlySnapshot.hourlyProtocolSideRevenueUSD =
        poolHourlySnapshot.hourlyProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
    poolHourlySnapshot.cumulativeProtocolSideRevenueUSD =
        pool.cumulativeProtocolSideRevenueUSD;
    poolHourlySnapshot.hourlyTotalRevenueUSD =
        poolHourlySnapshot.hourlyTotalRevenueUSD.plus(feeUSD);
    poolHourlySnapshot.cumulativeTotalRevenueUSD = pool.cumulativeTotalRevenueUSD;
    financialMetrics.dailySupplySideRevenueUSD =
        financialMetrics.dailySupplySideRevenueUSD.plus(supplySideRevenueUSD);
    financialMetrics.cumulativeSupplySideRevenueUSD =
        protocol.cumulativeSupplySideRevenueUSD;
    financialMetrics.dailyProtocolSideRevenueUSD =
        financialMetrics.dailyProtocolSideRevenueUSD.plus(protocolSideRevenueUSD);
    financialMetrics.cumulativeProtocolSideRevenueUSD =
        protocol.cumulativeProtocolSideRevenueUSD;
    financialMetrics.dailyTotalRevenueUSD =
        financialMetrics.dailyTotalRevenueUSD.plus(feeUSD);
    financialMetrics.cumulativeTotalRevenueUSD =
        protocol.cumulativeTotalRevenueUSD;
}
exports.updateRevenue = updateRevenue;
function updateUsageMetrics(protocol, usageMetricsDaily, usageMetricsHourly, eventType, crosschainID, block, accountAddr) {
    const transactionCount = constants_1.INT_ONE;
    const depositCount = eventType == constants_1.EventType.DEPOSIT ? constants_1.INT_ONE : constants_1.INT_ZERO;
    const withdrawCount = eventType == constants_1.EventType.WITHDRAW ? constants_1.INT_ONE : constants_1.INT_ZERO;
    const transferInCount = eventType == constants_1.EventType.TRANSFER_IN ? constants_1.INT_ONE : constants_1.INT_ZERO;
    const transferOutCount = eventType == constants_1.EventType.TRANSFER_OUT ? constants_1.INT_ONE : constants_1.INT_ZERO;
    const messageInCount = eventType == constants_1.EventType.MESSAGE_IN ? constants_1.INT_ONE : constants_1.INT_ZERO;
    const messageOutCount = eventType == constants_1.EventType.MESSAGE_OUT ? constants_1.INT_ONE : constants_1.INT_ZERO;
    protocol.cumulativeTransactionCount += transactionCount;
    protocol.cumulativeLiquidityDepositCount += depositCount;
    protocol.cumulativeLiquidityWithdrawCount += withdrawCount;
    protocol.cumulativeTransferInCount += transferInCount;
    protocol.cumulativeTransferOutCount += transferOutCount;
    protocol.cumulativeMessageReceivedCount += messageInCount;
    protocol.cumulativeMessageSentCount += messageOutCount;
    usageMetricsDaily.cumulativeTransactionCount =
        protocol.cumulativeTransactionCount;
    usageMetricsDaily.cumulativeLiquidityDepositCount =
        protocol.cumulativeLiquidityDepositCount;
    usageMetricsDaily.cumulativeLiquidityWithdrawCount =
        protocol.cumulativeLiquidityWithdrawCount;
    usageMetricsDaily.cumulativeTransferInCount =
        protocol.cumulativeTransferInCount;
    usageMetricsDaily.cumulativeTransferOutCount =
        protocol.cumulativeTransferOutCount;
    usageMetricsDaily.cumulativeMessageReceivedCount =
        protocol.cumulativeMessageReceivedCount;
    usageMetricsDaily.cumulativeMessageSentCount =
        protocol.cumulativeMessageSentCount;
    usageMetricsDaily.dailyTransactionCount += transactionCount;
    usageMetricsDaily.dailyLiquidityDepositCount += depositCount;
    usageMetricsDaily.dailyLiquidityWithdrawCount += withdrawCount;
    usageMetricsDaily.dailyTransferInCount += transferInCount;
    usageMetricsDaily.dailyTransferOutCount += transferOutCount;
    usageMetricsDaily.dailyMessageReceivedCount += messageInCount;
    usageMetricsDaily.dailyMessageSentCount += messageOutCount;
    usageMetricsDaily.blockNumber = block.number;
    usageMetricsDaily.timestamp = block.timestamp;
    usageMetricsHourly.cumulativeTransactionCount =
        protocol.cumulativeTransactionCount;
    usageMetricsHourly.cumulativeLiquidityDepositCount =
        protocol.cumulativeLiquidityDepositCount;
    usageMetricsHourly.cumulativeLiquidityWithdrawCount =
        protocol.cumulativeLiquidityWithdrawCount;
    usageMetricsHourly.cumulativeTransferInCount =
        protocol.cumulativeTransferInCount;
    usageMetricsHourly.cumulativeTransferOutCount =
        protocol.cumulativeTransferOutCount;
    usageMetricsHourly.cumulativeMessageReceivedCount =
        protocol.cumulativeMessageReceivedCount;
    usageMetricsHourly.cumulativeMessageSentCount =
        protocol.cumulativeMessageSentCount;
    usageMetricsHourly.hourlyTransactionCount += transactionCount;
    usageMetricsHourly.hourlyLiquidityDepositCount += depositCount;
    usageMetricsHourly.hourlyLiquidityWithdrawCount += withdrawCount;
    usageMetricsHourly.hourlyTransferInCount += transferInCount;
    usageMetricsHourly.hourlyTransferOutCount += transferOutCount;
    usageMetricsHourly.hourlyMessageReceivedCount += messageInCount;
    usageMetricsHourly.hourlyMessageSentCount += messageOutCount;
    usageMetricsHourly.blockNumber = block.number;
    usageMetricsHourly.timestamp = block.timestamp;
    const account = (0, getters_1.getOrCreateAccount)(protocol, accountAddr.toHexString());
    if (account.transferInCount == constants_1.INT_ZERO) {
        protocol.cumulativeUniqueTransferReceivers += transferInCount;
    }
    if (account.transferOutCount == constants_1.INT_ZERO) {
        protocol.cumulativeUniqueTransferSenders += transferOutCount;
    }
    if (account.depositCount == constants_1.INT_ZERO) {
        protocol.cumulativeUniqueLiquidityProviders += depositCount;
    }
    if (account.messageSentCount == constants_1.INT_ZERO) {
        protocol.cumulativeUniqueMessageSenders += messageOutCount;
    }
    account.depositCount += depositCount;
    account.withdrawCount += withdrawCount;
    account.transferInCount += transferInCount;
    account.transferOutCount += transferOutCount;
    account.messageReceivedCount += messageInCount;
    account.messageSentCount += messageOutCount;
    account.chains = (0, arrays_1.arrayUnique)((0, arrays_1.addToArrayAtIndex)(account.chains, crosschainID));
    account.save();
    usageMetricsDaily.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageMetricsDaily.cumulativeUniqueTransferSenders =
        protocol.cumulativeUniqueTransferSenders;
    usageMetricsDaily.cumulativeUniqueTransferReceivers =
        protocol.cumulativeUniqueTransferReceivers;
    usageMetricsDaily.cumulativeUniqueLiquidityProviders =
        protocol.cumulativeUniqueLiquidityProviders;
    usageMetricsDaily.cumulativeUniqueMessageSenders =
        protocol.cumulativeUniqueMessageSenders;
    usageMetricsHourly.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageMetricsHourly.cumulativeUniqueTransferSenders =
        protocol.cumulativeUniqueTransferSenders;
    usageMetricsHourly.cumulativeUniqueTransferReceivers =
        protocol.cumulativeUniqueTransferReceivers;
    usageMetricsHourly.cumulativeUniqueLiquidityProviders =
        protocol.cumulativeUniqueLiquidityProviders;
    usageMetricsHourly.cumulativeUniqueMessageSenders =
        protocol.cumulativeUniqueMessageSenders;
    const dayId = (0, datetime_1.getDaysSinceEpoch)(block.timestamp.toI32());
    const dailyActiveAccountID = accountAddr
        .toHexString()
        .concat("-")
        .concat(constants_1.SnapshotFrequency.DAILY)
        .concat("-")
        .concat(dayId)
        .concat("-")
        .concat(eventType);
    let dailyActiveAccount = schema_1.ActiveAccount.load(graph_ts_1.Bytes.fromUTF8(dailyActiveAccountID));
    if (!dailyActiveAccount) {
        dailyActiveAccount = new schema_1.ActiveAccount(graph_ts_1.Bytes.fromUTF8(dailyActiveAccountID));
        const inverseEventType = constants_1.INVERSE_EVENT_TYPE.get(eventType);
        const inverseDailyActiveAccountID = accountAddr
            .toHexString()
            .concat("-")
            .concat(constants_1.SnapshotFrequency.DAILY)
            .concat("-")
            .concat(dayId)
            .concat("-")
            .concat(inverseEventType);
        const inverseDailyActiveAccount = schema_1.ActiveAccount.load(graph_ts_1.Bytes.fromUTF8(inverseDailyActiveAccountID));
        if (!inverseDailyActiveAccount) {
            usageMetricsDaily.dailyActiveUsers += transactionCount;
        }
        usageMetricsDaily.dailyActiveTransferSenders += transferOutCount;
        usageMetricsDaily.dailyActiveTransferReceivers += transferInCount;
        usageMetricsDaily.dailyActiveLiquidityProviders += depositCount;
        usageMetricsDaily.dailyActiveMessageSenders += messageOutCount;
        dailyActiveAccount.save();
    }
    const hourId = (0, datetime_1.getHoursSinceEpoch)(block.timestamp.toI32());
    const hourlyActiveAccountID = accountAddr
        .toHexString()
        .concat("-")
        .concat(constants_1.SnapshotFrequency.HOURLY)
        .concat("-")
        .concat(hourId)
        .concat("-")
        .concat(eventType);
    let hourlyActiveAccount = schema_1.ActiveAccount.load(graph_ts_1.Bytes.fromUTF8(hourlyActiveAccountID));
    if (!hourlyActiveAccount) {
        hourlyActiveAccount = new schema_1.ActiveAccount(graph_ts_1.Bytes.fromUTF8(hourlyActiveAccountID));
        const inverseEventType = constants_1.INVERSE_EVENT_TYPE.get(eventType);
        const inverseHourlyActiveAccountID = accountAddr
            .toHexString()
            .concat("-")
            .concat(constants_1.SnapshotFrequency.HOURLY)
            .concat("-")
            .concat(hourId)
            .concat("-")
            .concat(inverseEventType);
        const inverseHourlyActiveAccount = schema_1.ActiveAccount.load(graph_ts_1.Bytes.fromUTF8(inverseHourlyActiveAccountID));
        if (!inverseHourlyActiveAccount) {
            usageMetricsHourly.hourlyActiveUsers += transactionCount;
        }
        usageMetricsHourly.hourlyActiveTransferSenders += transferOutCount;
        usageMetricsHourly.hourlyActiveTransferReceivers += transferInCount;
        usageMetricsHourly.hourlyActiveLiquidityProviders += depositCount;
        usageMetricsHourly.hourlyActiveMessageSenders += messageOutCount;
        hourlyActiveAccount.save();
    }
    usageMetricsDaily.totalPoolCount = protocol.totalPoolCount;
    usageMetricsDaily.totalPoolRouteCount = protocol.totalPoolRouteCount;
    usageMetricsDaily.totalCanonicalRouteCount =
        protocol.totalCanonicalRouteCount;
    usageMetricsDaily.totalWrappedRouteCount = protocol.totalWrappedRouteCount;
    usageMetricsDaily.totalSupportedTokenCount =
        protocol.totalSupportedTokenCount;
    const network = constants_1.NETWORK_BY_ID.get(crosschainID.toString())
        ? constants_1.NETWORK_BY_ID.get(crosschainID.toString())
        : constants_1.Network.UNKNOWN_NETWORK;
    protocol.supportedNetworks = (0, arrays_1.arrayUnique)((0, arrays_1.addToArrayAtIndex)(protocol.supportedNetworks, network));
}
exports.updateUsageMetrics = updateUsageMetrics;
function updateProtocolTVL(protocol, financialMetrics, deltaPoolTVL, block) {
    protocol.totalValueLockedUSD =
        protocol.totalValueLockedUSD.plus(deltaPoolTVL);
    financialMetrics.totalValueLockedUSD = protocol.totalValueLockedUSD;
    financialMetrics.blockNumber = block.number;
    financialMetrics.timestamp = block.timestamp;
}
exports.updateProtocolTVL = updateProtocolTVL;
function createBridgeTransferEvent(protocol, token, crosschainToken, pool, poolRoute, chainID, crosschainID, isOutgoing, fromAddress, toAddress, amount, crossTransactionID, event) {
    const transferEventID = event.transaction.hash
        .toHexString()
        .concat("-")
        .concat(event.logIndex.toString());
    const transferEvent = new schema_1.BridgeTransfer(graph_ts_1.Bytes.fromUTF8(transferEventID));
    transferEvent.hash = event.transaction.hash;
    transferEvent.logIndex = event.logIndex.toI32();
    transferEvent.protocol = graph_ts_1.Bytes.fromHexString(configure_1.NetworkConfigs.getFactoryAddress());
    transferEvent.to = event.transaction.to ? event.transaction.to : toAddress;
    transferEvent.from = event.transaction.from;
    transferEvent.isOutgoing = isOutgoing;
    transferEvent.pool = pool.id;
    transferEvent.route = poolRoute.id;
    if (isOutgoing) {
        const account = (0, getters_1.getOrCreateAccount)(protocol, transferEvent.from.toHexString());
        transferEvent.account = account.id;
        transferEvent.fromChainID = chainID;
        transferEvent.toChainID = crosschainID;
        transferEvent.type = constants_1.TransferType.BURN;
    }
    else {
        const account = (0, getters_1.getOrCreateAccount)(protocol, transferEvent.to.toHexString());
        transferEvent.account = account.id;
        transferEvent.fromChainID = crosschainID;
        transferEvent.toChainID = chainID;
        transferEvent.type = constants_1.TransferType.MINT;
    }
    transferEvent.transferTo = toAddress;
    if (fromAddress != graph_ts_1.Address.fromString(constants_1.ZERO_ADDRESS)) {
        transferEvent.transferFrom = fromAddress;
    }
    if (crossTransactionID != graph_ts_1.Bytes.fromHexString(constants_1.ZERO_ADDRESS)) {
        transferEvent.crossTransactionID = crossTransactionID;
    }
    transferEvent.token = token.id;
    transferEvent.amount = amount;
    transferEvent.amountUSD = (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals).times(token.lastPriceUSD);
    transferEvent.crosschainToken = crosschainToken.id;
    transferEvent.isSwap = false;
    if (crosschainToken.token != token.id) {
        transferEvent.isSwap = true;
    }
    transferEvent.blockNumber = event.block.number;
    transferEvent.timestamp = event.block.timestamp;
    transferEvent.save();
}
exports.createBridgeTransferEvent = createBridgeTransferEvent;
function createLiquidityDepositEvent(protocol, token, poolID, chainID, fromAddress, toAddress, amount, event) {
    const depositEventID = event.transaction.hash
        .toHexString()
        .concat("-")
        .concat(event.logIndex.toString());
    const depositEvent = new schema_1.LiquidityDeposit(graph_ts_1.Bytes.fromUTF8(depositEventID));
    depositEvent.hash = event.transaction.hash;
    depositEvent.logIndex = event.logIndex.toI32();
    depositEvent.protocol = graph_ts_1.Bytes.fromHexString(configure_1.NetworkConfigs.getFactoryAddress());
    depositEvent.to = toAddress;
    depositEvent.from = fromAddress;
    depositEvent.pool = poolID;
    depositEvent.chainID = chainID;
    const account = (0, getters_1.getOrCreateAccount)(protocol, fromAddress.toHexString());
    depositEvent.account = account.id;
    depositEvent.token = token.id;
    depositEvent.amount = amount;
    depositEvent.amountUSD = (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals).times(token.lastPriceUSD);
    depositEvent.blockNumber = event.block.number;
    depositEvent.timestamp = event.block.timestamp;
    depositEvent.save();
}
exports.createLiquidityDepositEvent = createLiquidityDepositEvent;
function createLiquidityWithdrawEvent(protocol, token, poolID, chainID, fromAddress, toAddress, amount, event) {
    const withdrawEventID = event.transaction.hash
        .toHexString()
        .concat("-")
        .concat(event.logIndex.toString());
    const withdrawEvent = new schema_1.LiquidityWithdraw(graph_ts_1.Bytes.fromUTF8(withdrawEventID));
    withdrawEvent.hash = event.transaction.hash;
    withdrawEvent.logIndex = event.logIndex.toI32();
    withdrawEvent.protocol = graph_ts_1.Bytes.fromHexString(configure_1.NetworkConfigs.getFactoryAddress());
    withdrawEvent.to = toAddress;
    withdrawEvent.from = fromAddress;
    withdrawEvent.pool = poolID;
    withdrawEvent.chainID = chainID;
    const account = (0, getters_1.getOrCreateAccount)(protocol, toAddress.toHexString());
    withdrawEvent.account = account.id;
    withdrawEvent.token = token.id;
    withdrawEvent.amount = amount;
    withdrawEvent.amountUSD = (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals).times(token.lastPriceUSD);
    withdrawEvent.blockNumber = event.block.number;
    withdrawEvent.timestamp = event.block.timestamp;
    withdrawEvent.save();
}
exports.createLiquidityWithdrawEvent = createLiquidityWithdrawEvent;
