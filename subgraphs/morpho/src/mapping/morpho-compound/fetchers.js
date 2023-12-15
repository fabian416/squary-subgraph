"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMorphoPositionsCompound = exports.getCompoundProtocol = void 0;
const constants_1 = require("../../constants");
const initializers_1 = require("../../utils/initializers");
const common_1 = require("../common");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const CToken_1 = require("../../../generated/Morpho/CToken");
const templates_1 = require("../../../generated/templates");
const MorphoCompound_1 = require("../../../generated/Morpho/MorphoCompound");
function getCompoundProtocol(protocolAddress) {
    const morpho = (0, initializers_1.getOrInitLendingProtocol)(protocolAddress);
    if (morpho.isNew) {
        const morphoContract = MorphoCompound_1.MorphoCompound.bind(protocolAddress);
        templates_1.Comptroller.create(morphoContract.comptroller());
        const defaultMaxGas = morphoContract.defaultMaxGasForMatching();
        morpho.protocol._defaultMaxGasForMatchingSupply = defaultMaxGas.getSupply();
        morpho.protocol._defaultMaxGasForMatchingBorrow = defaultMaxGas.getBorrow();
        morpho.protocol._defaultMaxGasForMatchingWithdraw =
            defaultMaxGas.getWithdraw();
        morpho.protocol._defaultMaxGasForMatchingRepay = defaultMaxGas.getRepay();
        morpho.protocol._maxSortedUsers = morphoContract.maxSortedUsers();
        morpho.protocol._owner = morphoContract.owner();
        morpho.protocol.save();
    }
    return morpho.protocol;
}
exports.getCompoundProtocol = getCompoundProtocol;
const fetchMorphoPositionsCompound = (market) => {
    const marketAddress = graph_ts_1.Address.fromBytes(market.id);
    const inputToken = (0, initializers_1.getOrInitToken)(market.inputToken);
    const cToken = CToken_1.CToken.bind(marketAddress);
    const morpho = MorphoCompound_1.MorphoCompound.bind(constants_1.MORPHO_COMPOUND_ADDRESS);
    const morphoSupplyOnPool_BI = cToken.balanceOfUnderlying(constants_1.MORPHO_COMPOUND_ADDRESS);
    const morphoSupplyOnPool = morphoSupplyOnPool_BI
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    const morphoBorrowOnPool_BI = cToken.borrowBalanceCurrent(constants_1.MORPHO_COMPOUND_ADDRESS);
    const morphoBorrowOnPool = morphoBorrowOnPool_BI
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    const morphoDeltas = morpho.deltas(marketAddress);
    const morphoSupplyP2P_BI = morphoDeltas
        .getP2pSupplyAmount()
        .times(morpho.p2pSupplyIndex(marketAddress))
        .div((0, constants_1.exponentToBigInt)(market._indexesOffset));
    const morphoSupplyP2P = morphoSupplyP2P_BI
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    const morphoBorrowP2P_BI = morphoDeltas
        .getP2pBorrowAmount()
        .times(morpho.p2pBorrowIndex(marketAddress))
        .div((0, constants_1.exponentToBigInt)(market._indexesOffset));
    const morphoBorrowP2P = morphoBorrowP2P_BI
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    return new common_1.MorphoPositions(morphoSupplyOnPool, morphoBorrowOnPool, morphoSupplyP2P, morphoBorrowP2P, morphoSupplyOnPool_BI, morphoBorrowOnPool_BI, morphoSupplyP2P_BI, morphoBorrowP2P_BI);
};
exports.fetchMorphoPositionsCompound = fetchMorphoPositionsCompound;
