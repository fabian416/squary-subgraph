"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreatePool = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const protocol_1 = require("./protocol");
const token_1 = require("./token");
const constants_1 = require("../utils/constants");
function getOrCreatePool(blockNumber, blockTimestamp) {
    const protocol = (0, protocol_1.getOrCreateProtocol)();
    let pool = schema_1.Pool.load(protocol.id);
    if (!pool) {
        pool = new schema_1.Pool(protocol.id);
        // Metadata
        pool.name = protocol.id;
        pool.symbol = constants_1.RETH_NAME;
        pool.protocol = protocol.id;
        pool.createdTimestamp = blockTimestamp;
        pool.createdBlockNumber = blockNumber;
        // Tokens
        pool.inputTokens = [
            (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.RPL_ADDRESS), blockNumber).id,
            (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS), blockNumber).id,
        ];
        pool.outputToken = (0, token_1.getOrCreateToken)(graph_ts_1.Address.fromString(protocol.id), blockNumber).id;
        pool.rewardTokens = [
            (0, token_1.getOrCreateRewardToken)(graph_ts_1.Address.fromString(constants_1.RPL_ADDRESS), constants_1.RewardTokenType.DEPOSIT, blockNumber).id,
        ];
        // Quantitative Revenue Data
        pool.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        pool.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
        // Quantitative Token Data
        pool.inputTokenBalances = [constants_1.BIGINT_ZERO, constants_1.BIGINT_ZERO];
        pool.inputTokenBalancesUSD = [constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO];
        pool.outputTokenSupply = constants_1.BIGINT_ZERO;
        pool.outputTokenPriceUSD = constants_1.BIGDECIMAL_ZERO;
        pool.stakedOutputTokenAmount = constants_1.BIGINT_ZERO;
        pool.rewardTokenEmissionsAmount = [constants_1.BIGINT_ZERO];
        pool.rewardTokenEmissionsUSD = [constants_1.BIGDECIMAL_ZERO];
        pool.save();
        // Update Protocol
        protocol.totalPoolCount += 1;
        protocol.save();
    }
    return pool;
}
exports.getOrCreatePool = getOrCreatePool;
