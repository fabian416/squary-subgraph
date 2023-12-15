"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAccrueInterestV2 = exports.handleAccrueInterestV1 = void 0;
const constants_1 = require("../../constants");
const CToken_1 = require("../../../generated/templates/CToken/CToken");
const fetchers_1 = require("./fetchers");
const common_1 = require("../common");
const initializers_1 = require("../../utils/initializers");
const compoundMath_1 = require("../../utils/maths/compoundMath");
function handleAccrueInterestV1(event) {
    handleAccrueInterest(event);
}
exports.handleAccrueInterestV1 = handleAccrueInterestV1;
function handleAccrueInterestV2(event) {
    handleAccrueInterest(event);
}
exports.handleAccrueInterestV2 = handleAccrueInterestV2;
function handleAccrueInterest(event) {
    const protocol = (0, fetchers_1.getCompoundProtocol)(constants_1.MORPHO_COMPOUND_ADDRESS);
    const cTokenInstance = CToken_1.CToken.bind(event.address);
    const supplyPoolRatePerBlock = cTokenInstance.supplyRatePerBlock();
    const borrowPoolRatePerBlock = cTokenInstance.borrowRatePerBlock();
    const supplyPoolIndex = cTokenInstance.exchangeRateStored();
    const borrowPoolIndex = cTokenInstance.borrowIndex();
    const supplyPoolRate = supplyPoolRatePerBlock.times(constants_1.BLOCKS_PER_YEAR);
    const borrowPoolRate = borrowPoolRatePerBlock.times(constants_1.BLOCKS_PER_YEAR);
    const market = (0, initializers_1.getMarket)(event.address);
    (0, common_1._handleReserveUpdate)(new constants_1.ReserveUpdateParams(event, event.address, protocol, supplyPoolIndex, borrowPoolIndex, supplyPoolRate, borrowPoolRate), market, new compoundMath_1.CompoundMath());
}
