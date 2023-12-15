"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBlock = exports.updateAuthors = exports.updateMetrics = exports.updateNetwork = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../generated/schema");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const versions_1 = require("./versions");
//////////////////
//// Updaters ////
//////////////////
function updateNetwork(networkData) {
    const network = getOrCreateNetwork(constants_1.NETWORK_NAME);
    network.blockHeight = networkData.height.toI32();
    if (networkData.newDifficulty) {
        if (!network.cumulativeDifficulty) {
            network.cumulativeDifficulty = constants_1.BIGINT_ZERO;
        }
        network.cumulativeDifficulty = network.cumulativeDifficulty.plus(networkData.newDifficulty);
    }
    if (networkData.newGasUsed) {
        if (!network.cumulativeGasUsed) {
            network.cumulativeGasUsed = constants_1.BIGINT_ZERO;
        }
        network.cumulativeGasUsed = network.cumulativeGasUsed.plus(networkData.newGasUsed);
    }
    network.gasLimit = networkData.gasLimit;
    if (networkData.newBurntFees) {
        if (!network.cumulativeBurntFees) {
            network.cumulativeBurntFees = constants_1.BIGINT_ZERO;
        }
        network.cumulativeBurntFees = network.cumulativeBurntFees.plus(networkData.newBurntFees);
    }
    if (networkData.newRewards) {
        if (!network.cumulativeRewards) {
            network.cumulativeRewards = constants_1.BIGINT_ZERO;
        }
        network.cumulativeRewards = network.cumulativeRewards.plus(networkData.newRewards);
    }
    if (networkData.newTransactions) {
        if (!network.cumulativeTransactions) {
            network.cumulativeTransactions = constants_1.BIGINT_ZERO;
        }
        network.cumulativeTransactions = network.cumulativeTransactions.plus(networkData.newTransactions);
    }
    if (networkData.newSize) {
        if (!network.cumulativeSize) {
            network.cumulativeSize = constants_1.BIGINT_ZERO;
        }
        network.cumulativeSize = network.cumulativeSize.plus(networkData.newSize);
    }
    network.totalSupply = networkData.totalSupply;
    network.save();
    return network;
}
exports.updateNetwork = updateNetwork;
// update snapshots
function updateMetrics(blockData, network) {
    updateDailySnapshot(blockData, network);
    updateHourlySnapshot(blockData, network);
}
exports.updateMetrics = updateMetrics;
function updateDailySnapshot(blockData, network) {
    const snapshotId = (blockData.timestamp.toI64() / constants_1.SECONDS_PER_DAY).toString();
    const snapshot = getOrCreateDailySnapshot(blockData.timestamp);
    // grab block interval before updating timestamp
    // newTimestamp - oldTimestamp = interval
    const blockInterval = blockData.timestamp.minus(snapshot.timestamp);
    // update overlapping fields for snapshot
    snapshot.blockHeight = network.blockHeight;
    snapshot.dailyBlocks++;
    snapshot.timestamp = blockData.timestamp;
    // update statistical analysis fields
    snapshot.cumulativeUniqueAuthors = network.cumulativeUniqueAuthors;
    if (blockData.author) {
        // check for new hourly authors
        const id = graph_ts_1.Bytes.fromUTF8(constants_1.IntervalType.DAILY +
            "-" +
            blockData.author.toHexString() +
            "-" +
            snapshot.id.toString());
        let activeAuthor = schema_1.ActiveAuthor.load(id);
        if (!activeAuthor) {
            activeAuthor = new schema_1.ActiveAuthor(id);
            activeAuthor.save();
            snapshot.dailyUniqueAuthors = updateStats(snapshotId, constants_1.DataType.AUTHORS, constants_1.BIGINT_ONE); // TODO: check for new daily author
        }
    }
    snapshot.cumulativeDifficulty = network.cumulativeDifficulty;
    if (blockData.difficulty) {
        snapshot.dailyDifficulty = updateStats(snapshotId, constants_1.DataType.DIFFICULTY, blockData.difficulty);
    }
    snapshot.cumulativeGasUsed = network.cumulativeGasUsed;
    if (blockData.gasUsed) {
        snapshot.dailyGasUsed = updateStats(snapshotId, constants_1.DataType.GAS_USED, blockData.gasUsed);
    }
    snapshot.cumulativeBurntFees = network.cumulativeBurntFees;
    if (blockData.burntFees) {
        snapshot.dailyBurntFees = updateStats(snapshotId, constants_1.DataType.BURNT_FEES, blockData.burntFees);
    }
    snapshot.cumulativeRewards = network.cumulativeRewards;
    if (blockData.rewards) {
        snapshot.dailyRewards = updateStats(snapshotId, constants_1.DataType.REWARDS, blockData.rewards);
    }
    snapshot.cumulativeSize = network.cumulativeSize;
    if (blockData.size) {
        snapshot.dailySize = updateStats(snapshotId, constants_1.DataType.SIZE, blockData.size);
    }
    if (blockData.chunkCount) {
        snapshot.dailyChunks = updateStats(snapshotId, constants_1.DataType.CHUNKS, blockData.chunkCount);
    }
    snapshot.totalSupply = network.totalSupply;
    if (blockData.newSupply) {
        snapshot.dailySupply = updateStats(snapshotId, constants_1.DataType.SUPPLY, blockData.newSupply);
    }
    snapshot.cumulativeTransactions = network.cumulativeTransactions;
    if (blockData.transactionCount) {
        snapshot.dailyTransactions = updateStats(snapshotId, constants_1.DataType.TRANSACTIONS, blockData.transactionCount);
    }
    snapshot.dailyBlockInterval = updateStats(snapshotId, constants_1.DataType.BLOCK_INTERVAL, blockInterval);
    snapshot.gasPrice = blockData.gasPrice;
    if (blockData.gasPrice) {
        snapshot.dailyGasPrice = updateStats(snapshotId, constants_1.DataType.GAS_PRICE, blockData.gasPrice);
    }
    snapshot.save();
}
function updateHourlySnapshot(blockData, network) {
    const snapshotId = (blockData.timestamp.toI64() / constants_1.SECONDS_PER_HOUR).toString();
    const snapshot = getOrCreateHourlySnapshot(blockData.timestamp);
    // grab block interval before updating timestamp
    const blockInterval = blockData.timestamp.minus(snapshot.timestamp);
    // update overlapping fields for snapshot
    snapshot.blockHeight = network.blockHeight;
    snapshot.hourlyBlocks++;
    snapshot.timestamp = blockData.timestamp;
    // update statistical analysis fields
    snapshot.cumulativeUniqueAuthors = network.cumulativeUniqueAuthors;
    if (blockData.author) {
        // check for new hourly authors
        const id = graph_ts_1.Bytes.fromUTF8(constants_1.IntervalType.HOURLY +
            "-" +
            blockData.author.toHexString() +
            "-" +
            snapshot.id.toString());
        let activeAuthor = schema_1.ActiveAuthor.load(id);
        if (!activeAuthor) {
            activeAuthor = new schema_1.ActiveAuthor(id);
            activeAuthor.save();
            snapshot.hourlyUniqueAuthors = updateStats(snapshotId, constants_1.DataType.AUTHORS, constants_1.BIGINT_ONE); // TODO: check for new hourly author
        }
    }
    snapshot.cumulativeDifficulty = network.cumulativeDifficulty;
    if (blockData.difficulty) {
        snapshot.hourlyDifficulty = updateStats(snapshotId, constants_1.DataType.DIFFICULTY, blockData.difficulty);
    }
    snapshot.cumulativeGasUsed = network.cumulativeGasUsed;
    if (blockData.gasUsed) {
        snapshot.hourlyGasUsed = updateStats(snapshotId, constants_1.DataType.GAS_USED, blockData.gasUsed);
    }
    snapshot.cumulativeBurntFees = network.cumulativeBurntFees;
    if (blockData.burntFees) {
        snapshot.hourlyBurntFees = updateStats(snapshotId, constants_1.DataType.BURNT_FEES, blockData.burntFees);
    }
    snapshot.cumulativeRewards = network.cumulativeRewards;
    if (blockData.rewards) {
        snapshot.hourlyRewards = updateStats(snapshotId, constants_1.DataType.REWARDS, blockData.rewards);
    }
    snapshot.cumulativeSize = network.cumulativeSize;
    if (blockData.size) {
        snapshot.hourlySize = updateStats(snapshotId, constants_1.DataType.SIZE, blockData.size);
    }
    if (blockData.chunkCount) {
        snapshot.hourlyChunks = updateStats(snapshotId, constants_1.DataType.CHUNKS, blockData.chunkCount);
    }
    snapshot.totalSupply = network.totalSupply;
    if (blockData.newSupply) {
        snapshot.hourlySupply = updateStats(snapshotId, constants_1.DataType.SUPPLY, blockData.newSupply);
    }
    snapshot.cumulativeTransactions = network.cumulativeTransactions;
    if (blockData.transactionCount) {
        snapshot.hourlyTransactions = updateStats(snapshotId, constants_1.DataType.TRANSACTIONS, blockData.transactionCount);
    }
    snapshot.hourlyBlockInterval = updateStats(snapshotId, constants_1.DataType.BLOCK_INTERVAL, blockInterval);
    snapshot.gasPrice = blockData.gasPrice;
    if (blockData.gasPrice) {
        snapshot.hourlyGasPrice = updateStats(snapshotId, constants_1.DataType.GAS_PRICE, blockData.gasPrice);
    }
    snapshot.save();
}
function updateAuthors(authorId, network, difficulty) {
    let author = schema_1.Author.load(authorId);
    if (!author) {
        author = new schema_1.Author(authorId);
        author.cumulativeBlocksCreated = constants_1.INT_ZERO;
        author.cumulativeDifficulty = constants_1.BIGINT_ZERO;
        author.save();
        // update unique authors
        network.cumulativeUniqueAuthors++;
        network.save();
    }
    author.cumulativeBlocksCreated++;
    if (difficulty) {
        if (!author.cumulativeDifficulty) {
            author.cumulativeDifficulty = constants_1.BIGINT_ZERO;
        }
        author.cumulativeDifficulty = author.cumulativeDifficulty.plus(difficulty);
    }
    author.save();
}
exports.updateAuthors = updateAuthors;
//
// Update Stat entity and return the id
// calculate the variance, q1, q3 once the daily/hourly snapshot is done
function updateStats(id, dataType, value) {
    const stats = getOrCreateStats(id, dataType);
    // basic fields
    stats.count++;
    stats.sum = stats.sum.plus(value);
    // max/min
    stats.max = value.gt(stats.max) ? value : stats.max;
    stats.min = value.lt(stats.min) ? value : stats.min;
    // update mean
    const delta = value.toBigDecimal().minus(stats.mean);
    stats.mean = stats.mean.plus(delta.div(graph_ts_1.BigDecimal.fromString(stats.count.toString())));
    // update rolling variance
    // Using the Welford's online algorithm
    const delta2 = value.toBigDecimal().minus(stats.mean);
    stats._meanSquared = stats._meanSquared.plus(delta.times(delta2));
    stats.variance = updateVariance(stats._meanSquared, stats.count);
    stats.save();
    return stats.id;
}
//
//
// Gets new variance using Welford's online algorithm
// This algorithm properly calcs variance for a stream of data
function updateVariance(meanSquared, count) {
    if (count < 2) {
        return constants_1.BIGDECIMAL_ZERO;
    }
    return meanSquared.div(graph_ts_1.BigDecimal.fromString((count - 1).toString()));
}
/////////////////
//// Getters ////
/////////////////
function getOrCreateDailySnapshot(timestamp) {
    const id = graph_ts_1.Bytes.fromI32(timestamp.toI32() / constants_1.SECONDS_PER_DAY);
    let dailySnapshot = schema_1.DailySnapshot.load(id);
    if (!dailySnapshot) {
        dailySnapshot = new schema_1.DailySnapshot(id);
        dailySnapshot.network = constants_1.NETWORK_NAME;
        dailySnapshot.blockHeight = constants_1.INT_ZERO;
        dailySnapshot.dailyBlocks = constants_1.INT_ZERO;
        dailySnapshot.timestamp = timestamp;
        dailySnapshot.cumulativeUniqueAuthors = constants_1.INT_ZERO;
        dailySnapshot.save();
    }
    return dailySnapshot;
}
function getOrCreateHourlySnapshot(timestamp) {
    const id = graph_ts_1.Bytes.fromI32(timestamp.toI32() / constants_1.SECONDS_PER_HOUR);
    let hourlySnapshot = schema_1.HourlySnapshot.load(id);
    if (!hourlySnapshot) {
        hourlySnapshot = new schema_1.HourlySnapshot(id);
        hourlySnapshot.network = constants_1.NETWORK_NAME;
        hourlySnapshot.blockHeight = constants_1.INT_ZERO;
        hourlySnapshot.hourlyBlocks = constants_1.INT_ZERO;
        hourlySnapshot.timestamp = timestamp;
        hourlySnapshot.cumulativeUniqueAuthors = constants_1.INT_ZERO;
        hourlySnapshot.save();
    }
    return hourlySnapshot;
}
function createBlock(blockData) {
    const block = new schema_1.Block(graph_ts_1.Bytes.fromI32(blockData.height.toI32()));
    block.hash = blockData.hash;
    block.timestamp = blockData.timestamp;
    block.author = blockData.author;
    block.size = blockData.size;
    block.baseFeePerGas = blockData.baseFeePerGas;
    block.difficulty = blockData.difficulty;
    block.gasLimit = blockData.gasLimit;
    block.gasUsed = blockData.gasUsed;
    block.gasPrice = blockData.gasPrice;
    block.burntFees = blockData.burntFees;
    block.chunkCount = blockData.chunkCount;
    block.transactionCount = blockData.transactionCount;
    block.rewards = blockData.rewards;
    if (block.gasLimit && block.gasLimit > constants_1.BIGINT_ZERO && block.gasUsed) {
        block.blockUtilization = block
            .gasUsed.toBigDecimal()
            .div(block.gasLimit.toBigDecimal())
            .times((0, utils_1.exponentToBigDecimal)(constants_1.INT_TWO));
    }
    else {
        block.blockUtilization = constants_1.BIGDECIMAL_ZERO;
    }
    block.save();
}
exports.createBlock = createBlock;
function getOrCreateNetwork(id) {
    let network = schema_1.Network.load(id);
    if (!network) {
        network = new schema_1.Network(id);
        network.cumulativeUniqueAuthors = constants_1.INT_ZERO;
        network.blockHeight = constants_1.INT_ZERO;
        network.dailyBlocks = getOrCreateStats(id, constants_1.DataType.BLOCKS).id;
    }
    network.schemaVersion = versions_1.Versions.getSchemaVersion();
    network.subgraphVersion = versions_1.Versions.getSubgraphVersion();
    network.methodologyVersion = versions_1.Versions.getMethodologyVersion();
    network.save();
    return network;
}
function getOrCreateStats(snapshot, dataType) {
    const id = graph_ts_1.Bytes.fromUTF8(snapshot.concat("-").concat(dataType));
    let stats = schema_1.Stat.load(id);
    if (!stats) {
        stats = new schema_1.Stat(id);
        stats.count = constants_1.INT_ZERO;
        stats.mean = constants_1.BIGDECIMAL_ZERO;
        stats.max = constants_1.BIGINT_ZERO;
        stats.min = constants_1.BIGINT_MAX;
        stats.variance = constants_1.BIGDECIMAL_ZERO;
        stats.q3 = constants_1.BIGDECIMAL_ZERO;
        stats.q1 = constants_1.BIGDECIMAL_ZERO;
        stats.sum = constants_1.BIGINT_ZERO;
        stats._meanSquared = constants_1.BIGDECIMAL_ZERO;
        stats.save();
    }
    return stats;
}
