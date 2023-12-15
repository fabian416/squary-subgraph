"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePairCreated = exports.handleOwnerFeeShareUpdated = void 0;
const schema_1 = require("../../../../generated/schema");
const constants_1 = require("../../../../src/common/constants");
const logger_1 = require("../../../../src/common/utils/logger");
const utils_1 = require("../../../../src/common/utils/utils");
const constants_2 = require("../common/constants");
const creators_1 = require("../common/creators");
// Percentage of fees that go to owner address, applies to all pools
function handleOwnerFeeShareUpdated(event) {
    const protocolFee = new schema_1.LiquidityPoolFee(constants_2.PROTOCOL_FEE_SHARE_ID);
    protocolFee.feePercentage = (0, utils_1.convertTokenToDecimal)(event.params.ownerFeeShare, constants_2.INT_THREE);
    protocolFee.feeType = constants_1.LiquidityPoolFeeType.FIXED_PROTOCOL_FEE;
    protocolFee.save();
}
exports.handleOwnerFeeShareUpdated = handleOwnerFeeShareUpdated;
function handlePairCreated(event) {
    const log = new logger_1.Logger(event, "handlePairCreated");
    log.info("create farm {}    {}     {}", [
        event.params.pair.toHexString(),
        event.params.token0.toHexString(),
        event.params.token1.toHexString(),
    ]);
    (0, creators_1.createLiquidityPool)(event, event.params.pair.toHexString(), event.params.token0.toHexString(), event.params.token1.toHexString());
}
exports.handlePairCreated = handlePairCreated;
