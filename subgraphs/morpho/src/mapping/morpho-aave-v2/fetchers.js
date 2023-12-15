"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAssetPrice = exports.fetchMorphoPositionsAaveV2 = exports.getAaveProtocol = void 0;
const constants_1 = require("../../constants");
const schema_1 = require("../../../generated/schema");
const initializers_1 = require("../../utils/initializers");
const common_1 = require("../common");
const AToken_1 = require("../../../generated/Morpho/AToken");
const DebtToken_1 = require("../../../generated/Morpho/DebtToken");
const LendingPool_1 = require("../../../generated/Morpho/LendingPool");
const PriceOracle_1 = require("../../../generated/Morpho/PriceOracle");
const MorphoAaveV2_1 = require("../../../generated/Morpho/MorphoAaveV2");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ChainlinkPriceFeed_1 = require("../../../generated/Morpho/ChainlinkPriceFeed");
const templates_1 = require("../../../generated/templates");
const LendingPoolAddressesProvider_1 = require("../../../generated/Morpho/LendingPoolAddressesProvider");
const templates_2 = require("../../../generated/templates");
function getAaveProtocol(protocolAddress) {
    const morpho = (0, initializers_1.getOrInitLendingProtocol)(protocolAddress);
    if (morpho.isNew) {
        const morphoContract = MorphoAaveV2_1.MorphoAaveV2.bind(protocolAddress);
        const lendingPool = LendingPool_1.LendingPool.bind(morphoContract.pool());
        templates_1.LendingPool.create(lendingPool._address);
        const addressesProvider = LendingPoolAddressesProvider_1.LendingPoolAddressesProvider.bind(morphoContract.addressesProvider());
        templates_2.LendingPoolConfigurator.create(addressesProvider.getLendingPoolConfigurator());
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
exports.getAaveProtocol = getAaveProtocol;
const fetchMorphoPositionsAaveV2 = (market) => {
    const aTokenAddress = graph_ts_1.Address.fromString(market.id.toHexString());
    const inputToken = (0, initializers_1.getOrInitToken)(market.inputToken);
    const tokenMapping = schema_1.UnderlyingTokenMapping.load(market.inputToken);
    if (!tokenMapping) {
        graph_ts_1.log.critical("No token mapping found for reserve: {}", [
            market.id.toHexString(),
        ]);
        return new common_1.MorphoPositions(graph_ts_1.BigDecimal.zero(), graph_ts_1.BigDecimal.zero(), graph_ts_1.BigDecimal.zero(), graph_ts_1.BigDecimal.zero(), graph_ts_1.BigInt.zero(), graph_ts_1.BigInt.zero(), graph_ts_1.BigInt.zero(), graph_ts_1.BigInt.zero());
    }
    const aToken = AToken_1.AToken.bind(aTokenAddress);
    const debtToken = DebtToken_1.DebtToken.bind(graph_ts_1.Address.fromBytes(tokenMapping.debtToken));
    const morpho = MorphoAaveV2_1.MorphoAaveV2.bind(constants_1.MORPHO_AAVE_V2_ADDRESS);
    const morphoSupplyOnPool_BI = aToken.balanceOf(constants_1.MORPHO_AAVE_V2_ADDRESS);
    const morphoSupplyOnPool = morphoSupplyOnPool_BI
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    const morphoDeltas = morpho.deltas(aTokenAddress);
    const morphoSupplyP2P_BI = morphoDeltas
        .getP2pSupplyAmount()
        .times(morpho.p2pSupplyIndex(aTokenAddress))
        .div((0, constants_1.exponentToBigInt)(market._indexesOffset));
    const morphoSupplyP2P = morphoSupplyP2P_BI
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    const morphoBorrowOnPool_BI = debtToken.balanceOf(constants_1.MORPHO_AAVE_V2_ADDRESS);
    const morphoBorrowOnPool = morphoBorrowOnPool_BI
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    const morphoBorrowP2P_BI = morphoDeltas
        .getP2pBorrowAmount()
        .times(morpho.p2pBorrowIndex(aTokenAddress))
        .div((0, constants_1.exponentToBigInt)(market._indexesOffset));
    const morphoBorrowP2P = morphoBorrowP2P_BI
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(inputToken.decimals));
    return new common_1.MorphoPositions(morphoSupplyOnPool, morphoBorrowOnPool, morphoSupplyP2P, morphoBorrowP2P, morphoSupplyOnPool_BI, morphoBorrowOnPool_BI, morphoSupplyP2P_BI, morphoBorrowP2P_BI);
};
exports.fetchMorphoPositionsAaveV2 = fetchMorphoPositionsAaveV2;
function fetchAssetPrice(market) {
    const inputTokenAddress = graph_ts_1.Address.fromString(market.inputToken.toHexString());
    const morphoProtocol = schema_1.LendingProtocol.load(constants_1.MORPHO_AAVE_V2_ADDRESS);
    if (!morphoProtocol)
        return graph_ts_1.BigDecimal.zero(); // Morpho not initialized yet
    const morpho = MorphoAaveV2_1.MorphoAaveV2.bind(constants_1.MORPHO_AAVE_V2_ADDRESS);
    const addressesProvider = LendingPoolAddressesProvider_1.LendingPoolAddressesProvider.bind(morpho.addressesProvider());
    const oracle = PriceOracle_1.PriceOracle.bind(addressesProvider.getPriceOracle());
    let oracleResult = (0, constants_1.readValue)(oracle.try_getAssetPrice(inputTokenAddress), graph_ts_1.BigInt.zero());
    // if the result is zero or less, try the fallback oracle
    if (!oracleResult.gt(graph_ts_1.BigInt.zero())) {
        const tryFallback = oracle.try_getFallbackOracle();
        if (tryFallback) {
            const fallbackOracle = PriceOracle_1.PriceOracle.bind(tryFallback.value);
            oracleResult = (0, constants_1.readValue)(fallbackOracle.try_getAssetPrice(inputTokenAddress), graph_ts_1.BigInt.zero());
        }
    }
    // Mainnet Oracles return the price in eth, must convert to USD through the following method
    const ethPriceFeed = ChainlinkPriceFeed_1.ChainlinkPriceFeed.bind(constants_1.ETH_USD_PRICE_FEED_ADDRESS);
    const priceEthInUsd = ethPriceFeed
        .latestAnswer()
        .toBigDecimal()
        .div((0, constants_1.exponentToBigDecimal)(constants_1.INT_EIGHT)); // price is in 8 decimals (10^8)
    if (priceEthInUsd.equals(graph_ts_1.BigDecimal.zero())) {
        return graph_ts_1.BigDecimal.zero();
    }
    else {
        return oracleResult
            .toBigDecimal()
            .times(priceEthInUsd)
            .div((0, constants_1.exponentToBigDecimal)(constants_1.DEFAULT_DECIMALS));
    }
}
exports.fetchAssetPrice = fetchAssetPrice;
