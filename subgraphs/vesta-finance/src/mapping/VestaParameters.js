"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBonusToSPChanged = exports.handleMCRChanged = exports.handlePriceFeedChanged = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const VestaParameters_1 = require("../../generated/VestaParameters/VestaParameters");
const schema_1 = require("../../generated/schema");
const protocol_1 = require("../entities/protocol");
const numbers_1 = require("../utils/numbers");
const constants_1 = require("../utils/constants");
function handlePriceFeedChanged(event) {
    const newPriceOracle = event.params.addr;
    (0, protocol_1.updateProtocolPriceOracle)(newPriceOracle.toHexString());
}
exports.handlePriceFeedChanged = handlePriceFeedChanged;
function handleMCRChanged(event) {
    const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
    const assets = protocol._marketAssets;
    const contract = VestaParameters_1.VestaParameters.bind(event.address);
    // As the asset address is not included in the event's paramters, we have to iterate over all markets to update their MCR.
    for (let i = 0; i < assets.length; i++) {
        const market = schema_1.Market.load(assets[i]);
        if (market != null) {
            const tryMCR = contract.try_MCR(graph_ts_1.Address.fromString(assets[i]));
            if (!tryMCR.reverted && tryMCR.value != constants_1.BIGINT_ZERO) {
                const adjustedMCR = (0, numbers_1.bigIntToBigDecimal)(tryMCR.value);
                const MaxLTV = constants_1.BIGDECIMAL_HUNDRED.div(adjustedMCR);
                market.maximumLTV = MaxLTV;
                market.liquidationThreshold = MaxLTV;
                market.save();
            }
        }
    }
    // As of Sep 2022, the bonusToSP function call was not enabled in Vesta Parameters contract when the latest BonusToSPChanged event was triggered.
    // So we call try to retrieve the latest bonusToSP values here in order to get the updated values ASAP.
    if (!protocol._bonusToSPCallEnabled) {
        retrieveBonusToSP(protocol, assets, contract);
    }
}
exports.handleMCRChanged = handleMCRChanged;
function handleBonusToSPChanged(event) {
    const protocol = (0, protocol_1.getOrCreateLendingProtocol)();
    const assets = protocol._marketAssets;
    const contract = VestaParameters_1.VestaParameters.bind(event.address);
    retrieveBonusToSP(protocol, assets, contract);
}
exports.handleBonusToSPChanged = handleBonusToSPChanged;
function retrieveBonusToSP(protocol, assets, contract) {
    // As the asset address is not included in the event's paramters, we have to iterate over all markets to update their MCR.
    for (let i = 0; i < assets.length; i++) {
        const market = schema_1.Market.load(assets[i]);
        if (market != null) {
            const tryBonusToSP = contract.try_BonusToSP(graph_ts_1.Address.fromString(assets[i]));
            if (tryBonusToSP.reverted) {
                return;
            }
            else {
                market.liquidationPenalty = (0, numbers_1.bigIntToBigDecimal)(tryBonusToSP.value).times(constants_1.BIGDECIMAL_HUNDRED);
                market.save();
                if (!protocol._bonusToSPCallEnabled) {
                    protocol._bonusToSPCallEnabled = true;
                    protocol.save();
                }
            }
        }
    }
}
