"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPositionMap = exports.updatePositionRealisedPnlUSD = exports.updateUserPosition = exports.updatePosition = void 0;
const initializers_1 = require("../common/initializers");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const utils = __importStar(require("../common/utils"));
const volume_1 = require("./volume");
const constants = __importStar(require("../common/constants"));
const Vault_1 = require("../../generated/Vault/Vault");
const interest_1 = require("./interest");
const schema_1 = require("../../generated/schema");
const enums_1 = require("../sdk/protocols/perpfutures/enums");
const numbers_1 = require("../sdk/util/numbers");
function updatePosition(event, positionKey, accountAddress, collateralTokenAddress, collateralDelta, indexTokenAddress, sizeDelta, indexTokenPrice, fee, isLong, transactionType, liqudateProfit) {
    const sdk = (0, initializers_1.initializeSDK)(event);
    const pool = (0, initializers_1.getOrCreatePool)(sdk);
    const account = (0, initializers_1.getOrCreateAccount)(accountAddress, pool, sdk);
    const indexToken = sdk.Tokens.getOrCreateToken(indexTokenAddress);
    sdk.Tokens.updateTokenPrice(indexToken, utils.bigIntToBigDecimal(indexTokenPrice, constants.PRICE_PRECISION_DECIMALS), event.block);
    const sizeUSDDelta = utils.bigIntToBigDecimal(sizeDelta, constants.PRICE_PRECISION_DECIMALS);
    const collateralToken = sdk.Tokens.getOrCreateToken(collateralTokenAddress);
    const collateralUSDDelta = utils.bigIntToBigDecimal(collateralDelta, constants.PRICE_PRECISION_DECIMALS);
    let collateralTokenAmountDelta = constants.BIGINT_ZERO;
    if (collateralToken.lastPriceUSD &&
        collateralToken.lastPriceUSD > constants.BIGDECIMAL_ZERO) {
        collateralTokenAmountDelta = (0, numbers_1.bigDecimalToBigInt)(collateralUSDDelta
            .times((0, numbers_1.exponentToBigDecimal)(collateralToken.decimals))
            .div(collateralToken.lastPriceUSD));
    }
    const inputTokenAmounts = new Array(pool.getInputTokens().length).fill(constants.BIGINT_ZERO);
    const inputTokenIndex = pool.getInputTokens().indexOf(collateralToken.id);
    if (inputTokenIndex >= 0) {
        inputTokenAmounts[inputTokenIndex] = collateralTokenAmountDelta;
    }
    let positionSide = constants.PositionSide.SHORT;
    if (isLong) {
        positionSide = constants.PositionSide.LONG;
    }
    const position = updateUserPosition(positionKey, account, pool, collateralTokenAddress, indexTokenAddress, positionSide, transactionType, sdk);
    pool.addUsdPremium(utils.bigIntToBigDecimal(fee, constants.PRICE_PRECISION_DECIMALS), transactionType);
    (0, volume_1.increasePoolVolume)(pool, sizeUSDDelta, collateralTokenAddress, collateralTokenAmountDelta, transactionType, constants.BIGDECIMAL_ZERO, false, sdk);
    if (transactionType == enums_1.TransactionType.COLLATERAL_IN) {
        (0, interest_1.updatePoolOpenInterestUSD)(pool, sizeUSDDelta, true, isLong);
        account.collateralIn(pool, position.getBytesID(), inputTokenAmounts, constants.BIGINT_ZERO, true);
        if (sizeUSDDelta > constants.BIGDECIMAL_ZERO) {
            let indexTokenAmountDelta = constants.BIGINT_ZERO;
            if (indexToken.lastPriceUSD &&
                indexToken.lastPriceUSD > constants.BIGDECIMAL_ZERO) {
                indexTokenAmountDelta = (0, numbers_1.bigDecimalToBigInt)(sizeUSDDelta
                    .times((0, numbers_1.exponentToBigDecimal)(indexToken.decimals))
                    .div(indexToken.lastPriceUSD));
            }
            account.borrow(pool, position.getBytesID(), indexTokenAddress, indexTokenAmountDelta, true);
        }
    }
    if (transactionType == enums_1.TransactionType.COLLATERAL_OUT) {
        (0, interest_1.updatePoolOpenInterestUSD)(pool, sizeUSDDelta, false, isLong);
        account.collateralOut(pool, position.getBytesID(), inputTokenAmounts, constants.BIGINT_ZERO, true);
    }
    if (transactionType == enums_1.TransactionType.LIQUIDATE) {
        (0, interest_1.updatePoolOpenInterestUSD)(pool, sizeUSDDelta, false, isLong);
        account.liquidate(pool, indexTokenAddress, collateralTokenAddress, collateralTokenAmountDelta, event.transaction.from, accountAddress, position.getBytesID(), utils.bigIntToBigDecimal(liqudateProfit, constants.PRICE_PRECISION_DECIMALS), true);
        (0, initializers_1.getOrCreateAccount)(event.transaction.from, pool, sdk);
    }
}
exports.updatePosition = updatePosition;
function updateUserPosition(positionKey, account, pool, collateralTokenAddress, indexTokenAddress, positionSide, transactionType, sdk) {
    const indexToken = sdk.Tokens.getOrCreateToken(indexTokenAddress);
    const collateralToken = sdk.Tokens.getOrCreateToken(collateralTokenAddress);
    const position = sdk.Positions.loadPosition(positionKey, pool, account, indexToken, collateralToken, positionSide);
    createPositionMap(positionKey, graph_ts_1.Address.fromBytes(account.getBytesId()), pool, collateralToken, indexToken, positionSide);
    if (transactionType == enums_1.TransactionType.COLLATERAL_IN) {
        position.addCollateralInCount();
    }
    if (transactionType == enums_1.TransactionType.COLLATERAL_OUT) {
        position.addCollateralOutCount();
    }
    if (transactionType == enums_1.TransactionType.LIQUIDATE) {
        position.addLiquidationCount();
    }
    let isLong = true;
    if (position.position.side == constants.PositionSide.SHORT) {
        isLong = false;
    }
    const prevBalance = position.position.balance;
    const prevCollateralBalance = position.position.collateralBalance;
    const vaultContract = Vault_1.Vault.bind(graph_ts_1.Address.fromBytes(constants.VAULT_ADDRESS));
    const tryGetPosition = vaultContract.try_getPosition(graph_ts_1.Address.fromBytes(account.account.id), collateralTokenAddress, indexTokenAddress, isLong);
    if (!tryGetPosition.reverted) {
        const balanceUSD = utils.bigIntToBigDecimal(tryGetPosition.value.getValue0(), constants.PRICE_PRECISION_DECIMALS);
        const collateralBalanceUSD = utils.bigIntToBigDecimal(tryGetPosition.value.getValue1(), constants.PRICE_PRECISION_DECIMALS);
        if (indexToken.lastPriceUSD &&
            indexToken.lastPriceUSD > constants.BIGDECIMAL_ZERO) {
            const balance = (0, numbers_1.bigDecimalToBigInt)(balanceUSD
                .times((0, numbers_1.exponentToBigDecimal)(indexToken.decimals))
                .div(indexToken.lastPriceUSD));
            position.setBalance(indexToken, balance);
        }
        if (collateralToken.lastPriceUSD &&
            collateralToken.lastPriceUSD > constants.BIGDECIMAL_ZERO) {
            const collateralBalance = (0, numbers_1.bigDecimalToBigInt)(collateralBalanceUSD
                .times((0, numbers_1.exponentToBigDecimal)(collateralToken.decimals))
                .div(collateralToken.lastPriceUSD));
            position.setCollateralBalance(collateralToken, collateralBalance);
        }
        if (collateralBalanceUSD != constants.BIGDECIMAL_ZERO) {
            const leverage = balanceUSD.div(collateralBalanceUSD);
            position.setLeverage(leverage);
        }
    }
    if (position.position.balanceUSD == constants.BIGDECIMAL_ZERO) {
        const fundingTokenIndex = pool
            .getInputTokens()
            .indexOf(position.position.collateral);
        if (fundingTokenIndex >= 0) {
            position.setFundingrateClosed(pool.pool.fundingrate[fundingTokenIndex]);
        }
        position.setBalanceClosed(indexToken, prevBalance);
        position.setCollateralBalanceClosed(collateralToken, prevCollateralBalance);
        position.closePosition();
    }
    return position;
}
exports.updateUserPosition = updateUserPosition;
function updatePositionRealisedPnlUSD(positionKey, realisedPnlUSD, pool, sdk) {
    const positionMap = schema_1._PositionMap.load(positionKey);
    if (!positionMap) {
        return;
    }
    const account = (0, initializers_1.getOrCreateAccount)(graph_ts_1.Address.fromString(positionMap.account), pool, sdk);
    const asset = sdk.Tokens.getOrCreateTokenFromBytes(positionMap.asset);
    const collateral = sdk.Tokens.getOrCreateTokenFromBytes(positionMap.collateral);
    const position = sdk.Positions.loadPosition(positionKey, pool, account, asset, collateral, positionMap.positionSide);
    position.setRealisedPnlUsd(realisedPnlUSD);
}
exports.updatePositionRealisedPnlUSD = updatePositionRealisedPnlUSD;
function createPositionMap(positionKey, account, pool, collateralToken, indexToken, positionSide) {
    const positionMap = new schema_1._PositionMap(positionKey);
    positionMap.account = account.toHexString();
    positionMap.pool = pool.getBytesID();
    positionMap.asset = indexToken.id;
    positionMap.collateral = collateralToken.id;
    positionMap.positionSide = positionSide;
    positionMap.save();
    return positionMap;
}
exports.createPositionMap = createPositionMap;
