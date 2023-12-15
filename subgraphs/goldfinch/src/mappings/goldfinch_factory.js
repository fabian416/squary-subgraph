"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCallableLoanCreated = exports.handlePoolCreated = exports.handleRoleGranted = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const GoldfinchFactory_1 = require("../../generated/GoldfinchFactory/GoldfinchFactory");
const MigratedTranchedPool_1 = require("../../generated/GoldfinchFactory/MigratedTranchedPool");
const GoldfinchConfig_1 = require("../../generated/GoldfinchConfig/GoldfinchConfig");
const tranched_pool_1 = require("../entities/tranched_pool");
const templates_1 = require("../../generated/templates");
const TranchedPool_1 = require("../../generated/templates/TranchedPool/TranchedPool");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const getters_1 = require("../common/getters");
const helpers_1 = require("./callable_loan/helpers");
function handleRoleGranted(event) {
    // Init GoldfinchConfig and SeniorPool template when GoldfinchFactory grants OWNER_ROLE (initialize())
    const contract = GoldfinchFactory_1.GoldfinchFactory.bind(event.address);
    const OWNER_ROLE = contract.OWNER_ROLE();
    // OWNER_ROLE is granted in _setRoleAdmin() inside initialize()
    // which sets config to the GoldfinchConfig argument
    if (event.params.role == OWNER_ROLE) {
        (0, getters_1.getOrCreateProtocol)();
        // senior pool is a market lender can deposit
        const market = (0, getters_1.getOrCreateMarket)(constants_1.SENIOR_POOL_ADDRESS, event);
        const FiduToken = (0, getters_1.getOrCreateToken)(graph_ts_1.Address.fromString(constants_1.FIDU_ADDRESS));
        market.outputToken = FiduToken.id;
        market.save();
    }
}
exports.handleRoleGranted = handleRoleGranted;
function handlePoolCreated(event) {
    // init TranchedPool tempate
    const poolAddress = event.params.pool;
    if (constants_1.INVALID_POOLS.has(poolAddress.toHexString())) {
        graph_ts_1.log.warning("[handlePoolCreated]pool {} is included in INVALID_POOLS; skipping", [poolAddress.toHexString()]);
        return;
    }
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const borrowerAddr = event.params.borrower.toHexString();
    const tranchedPoolContract = TranchedPool_1.TranchedPool.bind(poolAddress);
    const configContract = GoldfinchConfig_1.GoldfinchConfig.bind(tranchedPoolContract.config());
    const poolTokenAddr = configContract
        .getAddress(graph_ts_1.BigInt.fromI32(constants_1.CONFIG_KEYS_ADDRESSES.PoolTokens))
        .toHexString();
    const market = (0, getters_1.getOrCreateMarket)(poolAddress.toHexString(), event);
    market._borrower = borrowerAddr;
    market._creditLine = tranchedPoolContract.creditLine().toHexString();
    market._poolToken = poolTokenAddr;
    market._isMigratedTranchedPool = isMigratedTranchedPool(event);
    market.save();
    let account = schema_1.Account.load(borrowerAddr);
    if (!account) {
        account = (0, getters_1.getOrCreateAccount)(borrowerAddr);
        protocol.cumulativeUniqueUsers += constants_1.INT_ONE;
        protocol.cumulativeUniqueBorrowers += constants_1.INT_ONE;
    }
    protocol.totalPoolCount += constants_1.INT_ONE;
    protocol.save();
    templates_1.TranchedPool.create(event.params.pool);
    (0, tranched_pool_1.getOrInitTranchedPool)(event.params.pool, event.block.timestamp);
}
exports.handlePoolCreated = handlePoolCreated;
function handleCallableLoanCreated(event) {
    templates_1.CallableLoan.create(event.params.loan);
    const callableLoan = (0, helpers_1.initCallableLoan)(event.params.loan, event.block);
    callableLoan.save();
    const protocol = (0, getters_1.getOrCreateProtocol)();
    const marketIDs = protocol._marketIDs ? protocol._marketIDs : [];
    marketIDs.push(event.params.loan.toHexString());
    protocol._marketIDs = marketIDs;
    protocol.save();
}
exports.handleCallableLoanCreated = handleCallableLoanCreated;
function isMigratedTranchedPool(event) {
    const contract = MigratedTranchedPool_1.MigratedTranchedPool.bind(event.params.pool);
    const migratedResult = contract.try_migrated();
    if (!migratedResult.reverted && migratedResult.value) {
        graph_ts_1.log.info("[isMigratedTranchedPool]pool {} is a migrated tranched pool", [
            event.params.pool.toHexString(),
        ]);
        return true;
    }
    return false;
}
