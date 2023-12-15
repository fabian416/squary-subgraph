"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollateralPrice = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const erc20QiStablecoin_1 = require("../../generated/templates/Vault/erc20QiStablecoin");
const QiStablecoinDecimals_1 = require("../../generated/templates/Vault/QiStablecoinDecimals");
const constants_1 = require("../utils/constants");
const numbers_1 = require("../utils/numbers");
const strings_1 = require("../utils/strings");
function getCollateralPrice(event, marketAddress, token) {
    if (token.lastPriceBlockNumber &&
        token.lastPriceBlockNumber.equals(event.block.number)) {
        return token.lastPriceUSD;
    }
    // Catch price error in ethereum deployment
    // On block 15542061 in the StakeDao Curve stETh vault the price is $1591.3254437
    if (marketAddress == constants_1.STAKEDAO_STETH_VAULT &&
        event.block.number.toI32() == 15542061) {
        return graph_ts_1.BigDecimal.fromString("1591.3254437");
    }
    // Catch another price error in the ethereum deployment
    // On block 15542065 in the Yearn Curve stETH vault the price is $1700.24630687
    if (marketAddress == constants_1.YEARN_STETH_VAULT &&
        event.block.number.toI32() == 15542065) {
        return graph_ts_1.BigDecimal.fromString("1700.24630687");
    }
    const contract = erc20QiStablecoin_1.erc20QiStablecoin.bind(marketAddress);
    const priceCall = contract.try_getEthPriceSource();
    if (priceCall.reverted) {
        graph_ts_1.log.error("Failed to get collateral price for market: {}", [
            marketAddress.toHexString(),
        ]);
        return constants_1.BIGDECIMAL_ZERO;
    }
    const decimals = getCollateralPriceDecimals(contract);
    if (decimals == -1) {
        graph_ts_1.log.error("Failed to get collateral price decimals for market: {}", [
            marketAddress.toHexString(),
        ]);
        return constants_1.BIGDECIMAL_ZERO;
    }
    const price = (0, numbers_1.bigIntToBigDecimal)(priceCall.value, decimals);
    token.lastPriceBlockNumber = event.block.number;
    token.lastPriceUSD = price;
    token.save();
    return price;
}
exports.getCollateralPrice = getCollateralPrice;
function getCollateralPriceDecimals(contract) {
    const id = (0, strings_1.prefixID)(graph_ts_1.dataSource.network(), contract._address.toHexString());
    if (constants_1.COLLATERAL_PRICE_DECIMALS.has(id)) {
        return constants_1.COLLATERAL_PRICE_DECIMALS.get(id);
    }
    const priceSourceDecimals = contract.try_priceSourceDecimals();
    if (!priceSourceDecimals.reverted) {
        return priceSourceDecimals.value;
    }
    const decimalsFunctions = QiStablecoinDecimals_1.QiStablecoinDecimals.bind(contract._address);
    const priceSourceDecimalsU256 = decimalsFunctions.try_priceSourceDecimals();
    if (!priceSourceDecimalsU256.reverted) {
        return priceSourceDecimalsU256.value.toI32();
    }
    const collateralDecimals = decimalsFunctions.try_collateralDecimals();
    if (!collateralDecimals.reverted) {
        return collateralDecimals.value.toI32();
    }
    return -1;
}
