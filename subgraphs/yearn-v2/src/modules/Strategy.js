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
exports.strategyReported = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const utils = __importStar(require("../common/utils"));
const Prices_1 = require("../Prices");
const constants = __importStar(require("../common/constants"));
const Price_1 = require("./Price");
const Revenue_1 = require("./Revenue");
const initializers_1 = require("../common/initializers");
const Vault_1 = require("../../generated/Registry_v1/Vault");
const Strategy_1 = require("../../generated/Registry_v1/Strategy");
function getSharesMinted(eventAdress, from, to, event) {
    const receipt = event.receipt;
    if (!receipt)
        return constants.BIGINT_ZERO;
    const logs = event.receipt.logs;
    if (!logs)
        return constants.BIGINT_ZERO;
    for (let i = 0; i < logs.length; ++i) {
        const currentLog = logs.at(i);
        const topic_signature = currentLog.topics.at(0);
        if (graph_ts_1.crypto
            .keccak256(graph_ts_1.ByteArray.fromUTF8("Transfer(address,address,uint256)"))
            .equals(topic_signature)) {
            const _from = graph_ts_1.ethereum
                .decode("address", currentLog.topics.at(1))
                .toAddress();
            const _to = graph_ts_1.ethereum
                .decode("address", currentLog.topics.at(2))
                .toAddress();
            if (_from.equals(from) &&
                _to.equals(to) &&
                currentLog.address.equals(eventAdress)) {
                const data_value = graph_ts_1.ethereum.decode("uint256", currentLog.data);
                if (!data_value) {
                    return constants.BIGINT_ZERO;
                }
                return data_value.toBigInt();
            }
        }
    }
    return constants.BIGINT_ZERO;
}
function strategyReported(gain, vaultAddress, strategyAddress, event) {
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    const vaultContract = Vault_1.Vault.bind(vaultAddress);
    const strategyContract = Strategy_1.Strategy.bind(strategyAddress);
    const strategistAddress = utils.readValue(strategyContract.try_strategist(), constants.NULL.TYPE_ADDRESS);
    const vaultVersion = utils.readValue(vaultContract.try_apiVersion(), constants.VaultVersions.v0_4_3);
    // skipping yearn vaults with version less than 0.3.0
    if (vaultVersion.split(".")[1] == "2") {
        return;
    }
    const sharesMintedToTreasury = getSharesMinted(vaultAddress, vaultAddress, constants.YEARN_TREASURY_VAULT, event);
    let sharesMintedToStrategist = constants.BIGINT_ZERO;
    if (strategistAddress.equals(constants.NULL.TYPE_ADDRESS)) {
        sharesMintedToStrategist = getSharesMinted(vaultAddress, vaultAddress, strategistAddress, event);
    }
    if (sharesMintedToStrategist.equals(constants.BIGINT_ZERO)) {
        sharesMintedToStrategist = getSharesMinted(vaultAddress, vaultAddress, strategyAddress, event);
    }
    const inputToken = graph_ts_1.Address.fromString(vault.inputToken);
    const inputTokenPrice = (0, Prices_1.getUsdPricePerToken)(inputToken);
    const inputTokenDecimals = utils.getTokenDecimals(inputToken);
    const totalGainUSD = gain
        .divDecimal(inputTokenDecimals)
        .times(inputTokenPrice.usdPrice)
        .div(inputTokenPrice.decimalsBaseTen);
    const outputTokenPriceUSD = (0, Price_1.getPriceOfOutputTokens)(vaultAddress, inputToken, inputTokenDecimals);
    const outputTokenDecimals = utils.getTokenDecimals(vaultAddress);
    const strategistRewardUSD = sharesMintedToStrategist
        .divDecimal(outputTokenDecimals)
        .times(outputTokenPriceUSD);
    const protocolFees = sharesMintedToTreasury
        .divDecimal(outputTokenDecimals)
        .times(outputTokenPriceUSD);
    let supplySideRevenueUSD = totalGainUSD
        .minus(strategistRewardUSD)
        .minus(protocolFees);
    if (supplySideRevenueUSD.lt(constants.BIGDECIMAL_ZERO))
        supplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    let protocolSideRevenueUSD = protocolFees.plus(strategistRewardUSD);
    // Incident: 2021-05-20
    // Reference: https://github.com/yearn/yearn-security/blob/master/disclosures/2021-05-20.md#References
    if (constants.BLACKLISTED_TRANSACTION.includes(event.transaction.hash)) {
        supplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
        protocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    }
    vault.outputTokenSupply = utils.readValue(vaultContract.try_totalSupply(), constants.BIGINT_ZERO);
    vault.save();
    (0, Revenue_1.updateRevenueSnapshots)(vault, supplySideRevenueUSD, protocolSideRevenueUSD, event.block);
    graph_ts_1.log.warning("[Report] vault: {}, strategy: {}, gain: {}, strategistReward: {}, treasuryFees: {}, Txn: {}", [
        vaultAddress.toHexString(),
        strategyAddress.toHexString(),
        gain.toString(),
        sharesMintedToStrategist.toString(),
        sharesMintedToTreasury.toString(),
        event.transaction.hash.toHexString(),
    ]);
}
exports.strategyReported = strategyReported;
