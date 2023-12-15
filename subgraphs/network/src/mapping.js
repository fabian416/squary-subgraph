"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNearBlock = exports.handleEvmBlock = exports.handleCosmosBlock = exports.handleArweaveBlock = exports.UpdateNetworkData = exports.BlockData = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../generated/schema");
const constants_1 = require("./constants");
const helper_1 = require("./helper");
const utils_1 = require("./utils");
/////////////////
//// Classes ////
/////////////////
class BlockData {
    constructor(height, hash, timestamp, author, difficulty, gasLimit, gasUsed, size, gasPrice, baseFeePerGas, burntFees, chunkCount, transactionCount, rewards, newSupply) {
        this.height = height;
        this.hash = hash;
        this.timestamp = timestamp;
        this.author = author;
        this.difficulty = difficulty;
        this.gasLimit = gasLimit;
        this.gasUsed = gasUsed;
        this.size = size;
        this.gasPrice = gasPrice;
        this.baseFeePerGas = baseFeePerGas;
        this.burntFees = burntFees;
        this.chunkCount = chunkCount;
        this.transactionCount = transactionCount;
        this.rewards = rewards;
        this.newSupply = newSupply;
    }
}
exports.BlockData = BlockData;
class UpdateNetworkData {
    constructor(height, timestamp, newDifficulty, newGasUsed, gasLimit, newBurntFees, newRewards, newTransactions, newSize, totalSupply) {
        this.height = height;
        this.timestamp = timestamp;
        this.newDifficulty = newDifficulty;
        this.newGasUsed = newGasUsed;
        this.gasLimit = gasLimit;
        this.newBurntFees = newBurntFees;
        this.newRewards = newRewards;
        this.newTransactions = newTransactions;
        this.newSize = newSize;
        this.totalSupply = totalSupply;
    }
}
exports.UpdateNetworkData = UpdateNetworkData;
////////////////////////
//// Block Handlers ////
////////////////////////
function handleArweaveBlock(block) {
    const blockDifficulty = graph_ts_1.BigInt.fromString(graph_ts_1.BigDecimal.fromString(parseInt(block.diff.toHexString(), 16).toString())
        .truncate(0)
        .toString());
    const blockSize = graph_ts_1.BigInt.fromString(graph_ts_1.BigDecimal.fromString(parseInt(block.blockSize.toHexString(), 16).toString())
        .truncate(0)
        .toString());
    const blockData = new BlockData(graph_ts_1.BigInt.fromI64(block.height), block.indepHash, graph_ts_1.BigInt.fromI64(block.timestamp), block.rewardAddr, blockDifficulty, null, null, blockSize, null, null, null, null, graph_ts_1.BigInt.fromI32(block.txs.length), null, // the "rewards" in the blockhandler is a pool of rewards ready to distribute
    null);
    (0, helper_1.createBlock)(blockData);
    // update network entity
    const updateNetworkData = new UpdateNetworkData(graph_ts_1.BigInt.fromI64(block.height), graph_ts_1.BigInt.fromI64(block.timestamp), blockDifficulty, null, null, null, null, graph_ts_1.BigInt.fromI32(block.txs.length), blockSize, null);
    const network = (0, helper_1.updateNetwork)(updateNetworkData);
    // update author entity
    (0, helper_1.updateAuthors)(block.rewardAddr, network, blockDifficulty);
    // create/update daily/hourly metrics
    (0, helper_1.updateMetrics)(blockData, network);
}
exports.handleArweaveBlock = handleArweaveBlock;
function handleCosmosBlock(block) {
    const header = block.header;
    const blockData = new BlockData(graph_ts_1.BigInt.fromI64(header.height), header.hash, graph_ts_1.BigInt.fromI64(header.time.seconds), header.proposerAddress, null, null, null, null, null, null, null, null, graph_ts_1.BigInt.fromI32(block.transactions.length), null, null);
    (0, helper_1.createBlock)(blockData);
    // update network entity
    const updateNetworkData = new UpdateNetworkData(graph_ts_1.BigInt.fromI64(header.height), graph_ts_1.BigInt.fromI64(header.time.seconds), null, null, null, null, null, graph_ts_1.BigInt.fromI32(block.transactions.length), null, null);
    const network = (0, helper_1.updateNetwork)(updateNetworkData);
    // update author entity
    (0, helper_1.updateAuthors)(header.validatorsHash, network, null);
    // create/update daily/hourly metrics
    (0, helper_1.updateMetrics)(blockData, network);
}
exports.handleCosmosBlock = handleCosmosBlock;
function handleEvmBlock(block) {
    const burntFees = block.baseFeePerGas
        ? block.baseFeePerGas.times(block.gasUsed)
        : null;
    const blockData = new BlockData(block.number, block.hash, block.timestamp, block.author, block.difficulty, block.gasLimit, block.gasUsed, block.size, null, block.baseFeePerGas, burntFees, null, constants_1.NETWORK_NAME == constants_1.SubgraphNetwork.OPTIMISM ? constants_1.BIGINT_ONE : null, // optimism "blocks" are actually transactions
    null, null);
    (0, helper_1.createBlock)(blockData);
    // update network entity
    const updateNetworkData = new UpdateNetworkData(block.number, block.timestamp, block.difficulty, block.gasUsed, block.gasLimit, burntFees, null, null, block.size, null);
    const network = (0, helper_1.updateNetwork)(updateNetworkData);
    // update author entity
    (0, helper_1.updateAuthors)(block.author, network, block.difficulty);
    // create/update daily/hourly metrics
    (0, helper_1.updateMetrics)(blockData, network);
}
exports.handleEvmBlock = handleEvmBlock;
function handleNearBlock(block) {
    const chunks = block.chunks;
    const header = block.header;
    // get timestamp in seconds (from nano seconds)
    const timestampBD = graph_ts_1.BigDecimal.fromString(header.timestampNanosec.toString()).div((0, utils_1.exponentToBigDecimal)(constants_1.INT_NINE));
    const timestamp = graph_ts_1.BigInt.fromString(timestampBD.truncate(0).toString());
    // add up gasLimit / gasUsed / burntFees
    let gasLimit = constants_1.BIGINT_ZERO;
    let gasUsed = constants_1.BIGINT_ZERO;
    let burntFees = constants_1.BIGINT_ZERO;
    for (let i = 0; i < chunks.length; i++) {
        const chunk = new schema_1.Chunk(chunks[i].chunkHash);
        chunk.block = graph_ts_1.Bytes.fromI32(header.height);
        chunk.gasUsed = graph_ts_1.BigInt.fromI64(chunks[i].gasUsed);
        chunk.gasLimit = graph_ts_1.BigInt.fromI64(chunks[i].gasLimit);
        chunk.burntFees = chunks[i].balanceBurnt;
        chunk.chunkUtilization = chunk
            .gasUsed.toBigDecimal()
            .div(chunk.gasLimit.toBigDecimal());
        chunk.save();
        gasLimit = gasLimit.plus(chunk.gasLimit);
        gasUsed = gasUsed.plus(chunk.gasUsed);
        burntFees = burntFees.plus(chunk.burntFees);
    }
    const blockData = new BlockData(graph_ts_1.BigInt.fromI64(header.height), header.hash, timestamp, graph_ts_1.Bytes.fromHexString(block.author), null, gasLimit, gasUsed, null, header.gasPrice, null, burntFees, graph_ts_1.BigInt.fromI32(chunks.length), null, null, null);
    (0, helper_1.createBlock)(blockData);
    // update network entity
    const updateNetworkData = new UpdateNetworkData(graph_ts_1.BigInt.fromI64(header.height), timestamp, null, gasUsed, gasLimit, burntFees, null, null, null, header.totalSupply);
    const network = (0, helper_1.updateNetwork)(updateNetworkData);
    // update author entity
    (0, helper_1.updateAuthors)(graph_ts_1.Bytes.fromHexString(block.author), network, null);
    // create/update daily/hourly metrics
    (0, helper_1.updateMetrics)(blockData, network);
}
exports.handleNearBlock = handleNearBlock;
