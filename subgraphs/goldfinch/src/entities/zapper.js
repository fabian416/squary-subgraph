"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteZapAfterClaimMaybe = exports.deleteZapAfterUnzapMaybe = exports.createZapMaybe = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const SeniorPool_1 = require("../../generated/SeniorPool/SeniorPool");
const Zapper_1 = require("../../generated/templates/TranchedPool/Zapper");
const TranchedPool_1 = require("../../generated/templates/TranchedPool/TranchedPool");
const PoolTokens_1 = require("../../generated/PoolTokens/PoolTokens");
const constants_1 = require("../common/constants");
const utils_1 = require("../common/utils");
function createZapMaybe(event) {
    const tranchedPoolContract = TranchedPool_1.TranchedPool.bind(event.address);
    const seniorPoolAddress = (0, utils_1.getAddressFromConfig)(tranchedPoolContract, constants_1.CONFIG_KEYS_ADDRESSES.SeniorPool);
    const seniorPoolContract = SeniorPool_1.SeniorPool.bind(seniorPoolAddress);
    const zapperRole = seniorPoolContract.try_ZAPPER_ROLE();
    // zapper may not exist yet on mainnet
    if (zapperRole.reverted) {
        return;
    }
    const wasDoneByZapper = seniorPoolContract.hasRole(zapperRole.value, event.params.owner);
    if (wasDoneByZapper) {
        const zap = new schema_1.Zap(event.params.tokenId.toString());
        zap.poolToken = event.params.tokenId.toString();
        zap.tranchedPool = event.address.toHexString();
        zap.amount = event.params.amount;
        const zapperContract = Zapper_1.Zapper.bind(event.params.owner);
        const zapInfo = zapperContract.tranchedPoolZaps(event.params.tokenId);
        zap.user = zapInfo.value0.toHexString();
        zap.seniorPoolStakedPosition = zapInfo.value1.toString();
        zap.save();
    }
}
exports.createZapMaybe = createZapMaybe;
function deleteZapAfterUnzapMaybe(event) {
    const tranchedPoolContract = TranchedPool_1.TranchedPool.bind(event.address);
    const seniorPoolAddress = (0, utils_1.getAddressFromConfig)(tranchedPoolContract, constants_1.CONFIG_KEYS_ADDRESSES.SeniorPool);
    const seniorPoolContract = SeniorPool_1.SeniorPool.bind(seniorPoolAddress);
    const zapperRole = seniorPoolContract.try_ZAPPER_ROLE();
    // zapper may not exist yet on mainnet
    if (zapperRole.reverted) {
        return;
    }
    const wasDoneByZapper = seniorPoolContract.hasRole(zapperRole.value, event.params.owner);
    if (wasDoneByZapper) {
        const zap = assert(schema_1.Zap.load(event.params.tokenId.toString()));
        graph_ts_1.store.remove("Zap", zap.id);
        const seniorPoolStakedPosition = assert(schema_1.SeniorPoolStakedPosition.load(zap.seniorPoolStakedPosition));
        const fiduToAddBack = seniorPoolContract.getNumShares(event.params.principalWithdrawn);
        seniorPoolStakedPosition.amount =
            seniorPoolStakedPosition.amount.plus(fiduToAddBack);
        seniorPoolStakedPosition.save();
    }
}
exports.deleteZapAfterUnzapMaybe = deleteZapAfterUnzapMaybe;
function deleteZapAfterClaimMaybe(event) {
    const tranchedPoolContract = PoolTokens_1.PoolTokens.bind(event.address);
    const seniorPoolAddress = (0, utils_1.getAddressFromConfig)(tranchedPoolContract, constants_1.CONFIG_KEYS_ADDRESSES.SeniorPool);
    const seniorPoolContract = SeniorPool_1.SeniorPool.bind(seniorPoolAddress);
    const zapperRole = seniorPoolContract.try_ZAPPER_ROLE();
    // zapper may not exist yet on mainnet
    if (zapperRole.reverted) {
        return;
    }
    const wasDoneByZapper = seniorPoolContract.hasRole(zapperRole.value, event.params.from);
    if (wasDoneByZapper) {
        const zap = assert(schema_1.Zap.load(event.params.tokenId.toString()));
        graph_ts_1.store.remove("Zap", zap.id);
    }
}
exports.deleteZapAfterClaimMaybe = deleteZapAfterClaimMaybe;
