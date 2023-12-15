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
exports.handleMigrate = exports.handleCapSetWithManager = exports.handleCapSet = exports.handleCollectPerformanceFee = exports.handleCollectManagementFee = exports.handleWithdrawWithFee = exports.handlePurchaseOption = exports.handlePayOptionYield = exports.handleAirswap = exports.handleSwap = exports.handleNewOffer = exports.handleCollectVaultFees = exports.handleInstantWithdraw = exports.handleWithdraw = exports.handleDeposit = exports.handleAuctionCleared = exports.handleInitiateGnosisAuction = void 0;
const Metrics_1 = require("../modules/Metrics");
const initializers_1 = require("../common/initializers");
const utils = __importStar(require("../common/utils"));
const schema_1 = require("../../generated/schema");
const constants = __importStar(require("../common/constants"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Transaction_1 = require("../modules/Transaction");
const Revenue_1 = require("../modules/Revenue");
function handleInitiateGnosisAuction(event) {
    const auctionId = event.params.auctionCounter;
    const optionToken = event.params.auctioningToken;
    const biddingToken = event.params.biddingToken;
    const vaultAddress = event.address;
    (0, initializers_1.getOrCreateToken)(biddingToken, event.block, vaultAddress, false);
    (0, initializers_1.getOrCreateToken)(optionToken, event.block, vaultAddress, true);
    (0, initializers_1.getOrCreateAuction)(auctionId, vaultAddress, optionToken, biddingToken);
    (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
}
exports.handleInitiateGnosisAuction = handleInitiateGnosisAuction;
function handleAuctionCleared(event) {
    //gives supply side revenue
    const auctionId = event.params.auctionId;
    const soldAmount = event.params.soldBiddingTokens;
    const auction = (0, initializers_1.getOrCreateAuction)(auctionId);
    if (auction.vault == constants.NULL.TYPE_STRING)
        return;
    const vault = (0, initializers_1.getOrCreateVault)(graph_ts_1.Address.fromString(auction.vault), event.block);
    const inputToken = (0, initializers_1.getOrCreateToken)(graph_ts_1.Address.fromString(vault.inputToken), event.block, graph_ts_1.Address.fromString(auction.vault), false);
    const soldAmountUSD = utils
        .bigIntToBigDecimal(soldAmount, vault._decimals)
        .times(inputToken.lastPriceUSD);
    (0, Revenue_1.updateRevenueSnapshots)(vault, soldAmountUSD, constants.BIGDECIMAL_ZERO, event.block);
    (0, Metrics_1.updateVaultSnapshots)(graph_ts_1.Address.fromString(auction.vault), event.block);
}
exports.handleAuctionCleared = handleAuctionCleared;
function handleDeposit(event) {
    const vaultAddress = event.address;
    const block = event.block;
    const depositAmount = event.params.amount;
    (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    (0, Metrics_1.updateVaultTVL)(vaultAddress, block);
    (0, Metrics_1.updateUsageMetrics)(event.block, event.params.account);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
    (0, Transaction_1.Transaction)(vaultAddress, depositAmount, event.transaction, event.block, constants.TransactionType.DEPOSIT);
    (0, Metrics_1.updateFinancials)(block);
}
exports.handleDeposit = handleDeposit;
function handleWithdraw(event) {
    const vaultAddress = event.address;
    const block = event.block;
    const withdrawAmount = event.params.amount;
    (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    (0, Metrics_1.updateVaultTVL)(vaultAddress, block);
    (0, Metrics_1.updateUsageMetrics)(event.block, event.params.account);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
    (0, Transaction_1.Transaction)(vaultAddress, withdrawAmount, event.transaction, event.block, constants.TransactionType.WITHDRAW);
    (0, Metrics_1.updateFinancials)(block);
}
exports.handleWithdraw = handleWithdraw;
function handleInstantWithdraw(event) {
    const vaultAddress = event.address;
    const block = event.block;
    const withdrawAmount = event.params.amount;
    (0, Metrics_1.updateVaultTVL)(vaultAddress, block);
    (0, Metrics_1.updateUsageMetrics)(event.block, event.params.account);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
    (0, Transaction_1.Transaction)(vaultAddress, withdrawAmount, event.transaction, event.block, constants.TransactionType.WITHDRAW);
    (0, Metrics_1.updateFinancials)(block);
}
exports.handleInstantWithdraw = handleInstantWithdraw;
function handleCollectVaultFees(event) {
    const totalFee = event.params.vaultFee;
    const vaultAddress = event.address;
    const block = event.block;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, block);
    (0, Metrics_1.updateVaultTVL)(vaultAddress, block);
    const vaultAsset = (0, initializers_1.getOrCreateToken)(graph_ts_1.Address.fromString(vault.inputToken), block, vaultAddress, false);
    const totalFeeUSD = utils
        .bigIntToBigDecimal(totalFee, vault._decimals)
        .times(vaultAsset.lastPriceUSD);
    (0, Revenue_1.updateRevenueSnapshots)(vault, constants.BIGDECIMAL_ZERO, totalFeeUSD, block);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
    (0, Transaction_1.updateVaultFees)(vaultAddress, block);
}
exports.handleCollectVaultFees = handleCollectVaultFees;
function handleNewOffer(event) {
    const swapId = event.params.swapId;
    const optionToken = event.params.oToken;
    const biddingToken = event.params.biddingToken;
    const vaultAddress = event.params.seller;
    const vaultStore = schema_1.Vault.load(vaultAddress.toHexString());
    if (!vaultStore)
        return;
    const swapOfferContractAddress = event.address.toHexString();
    const swapOfferId = swapOfferContractAddress
        .concat("-")
        .concat(swapId.toString());
    (0, initializers_1.getOrCreateToken)(biddingToken, event.block, vaultAddress, false);
    (0, initializers_1.getOrCreateSwap)(swapOfferId, vaultAddress, optionToken, biddingToken);
    (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
}
exports.handleNewOffer = handleNewOffer;
function handleSwap(event) {
    const swapId = event.params.swapId;
    const soldAmount = event.params.signerAmount;
    const swapOfferContractAddress = event.address.toHexString();
    const swapOfferId = swapOfferContractAddress
        .concat("-")
        .concat(swapId.toString());
    const swapOffer = (0, initializers_1.getOrCreateSwap)(swapOfferId);
    if (swapOffer.vault == constants.NULL.TYPE_STRING)
        return;
    const vaultAddress = graph_ts_1.Address.fromString(swapOffer.vault);
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    const inputToken = (0, initializers_1.getOrCreateToken)(vaultAddress, event.block, graph_ts_1.Address.fromString(swapOffer.vault), false);
    const soldAmountUSD = utils
        .bigIntToBigDecimal(soldAmount, inputToken.decimals)
        .times(inputToken.lastPriceUSD);
    (0, Revenue_1.updateRevenueSnapshots)(vault, soldAmountUSD, constants.BIGDECIMAL_ZERO, event.block);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
}
exports.handleSwap = handleSwap;
function handleAirswap(event) {
    const vaultAddress = event.params.senderWallet;
    const soldAmount = event.params.signerAmount;
    if (vaultAddress == constants.NULL.TYPE_ADDRESS)
        return;
    const vaultStore = schema_1.Vault.load(vaultAddress.toHexString());
    if (!vaultStore)
        return;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    const inputToken = (0, initializers_1.getOrCreateToken)(graph_ts_1.Address.fromString(vault.inputToken), event.block, vaultAddress, false);
    const soldAmountUSD = utils
        .bigIntToBigDecimal(soldAmount, inputToken.decimals)
        .times(inputToken.lastPriceUSD);
    (0, Revenue_1.updateRevenueSnapshots)(vault, soldAmountUSD, constants.BIGDECIMAL_ZERO, event.block);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
}
exports.handleAirswap = handleAirswap;
function handlePayOptionYield(event) {
    const netYield = event.params.netYield;
    const vaultAddress = event.address;
    if (vaultAddress == constants.NULL.TYPE_ADDRESS)
        return;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    const inputToken = (0, initializers_1.getOrCreateToken)(graph_ts_1.Address.fromString(vault.inputToken), event.block, vaultAddress, false);
    const netYieldUSD = utils
        .bigIntToBigDecimal(netYield, inputToken.decimals)
        .times(inputToken.lastPriceUSD);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
    (0, Revenue_1.updateRevenueSnapshots)(vault, netYieldUSD, constants.BIGDECIMAL_ZERO, event.block);
}
exports.handlePayOptionYield = handlePayOptionYield;
function handlePurchaseOption(event) {
    const premium = event.params.premium;
    const vaultAddress = event.address;
    if (vaultAddress == constants.NULL.TYPE_ADDRESS)
        return;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    const inputToken = (0, initializers_1.getOrCreateToken)(graph_ts_1.Address.fromString(vault.inputToken), event.block, vaultAddress, false);
    const premiumUSD = utils
        .bigIntToBigDecimal(premium, vault._decimals)
        .times(inputToken.lastPriceUSD);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
    (0, Revenue_1.updateRevenueSnapshots)(vault, premiumUSD, constants.BIGDECIMAL_ZERO, event.block);
}
exports.handlePurchaseOption = handlePurchaseOption;
function handleWithdrawWithFee(event) {
    const vaultAddress = event.address;
    const block = event.block;
    const withdrawAmount = event.params.amount;
    const feeAmount = event.params.fee;
    (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    (0, Metrics_1.updateVaultTVL)(vaultAddress, block);
    (0, Metrics_1.updateUsageMetrics)(event.block, event.params.account);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, block);
    (0, Transaction_1.Transaction)(vaultAddress, withdrawAmount, event.transaction, event.block, constants.TransactionType.WITHDRAW, feeAmount);
    (0, Metrics_1.updateFinancials)(block);
}
exports.handleWithdrawWithFee = handleWithdrawWithFee;
function handleCollectManagementFee(event) {
    const managementFee = event.params.managementFee;
    const vaultAddress = event.address;
    const block = event.block;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, block);
    (0, Metrics_1.updateVaultTVL)(vaultAddress, block);
    const vaultAsset = (0, initializers_1.getOrCreateToken)(graph_ts_1.Address.fromString(vault.inputToken), block, vaultAddress, false);
    const managementFeeUSD = utils
        .bigIntToBigDecimal(managementFee, vault._decimals)
        .times(vaultAsset.lastPriceUSD);
    (0, Revenue_1.updateRevenueSnapshots)(vault, constants.BIGDECIMAL_ZERO, managementFeeUSD, block);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
}
exports.handleCollectManagementFee = handleCollectManagementFee;
function handleCollectPerformanceFee(event) {
    const performanceFee = event.params.performanceFee;
    const vaultAddress = event.address;
    const block = event.block;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, block);
    (0, Metrics_1.updateVaultTVL)(vaultAddress, block);
    const usdcToken = (0, initializers_1.getOrCreateToken)(constants.USDC_ADDRESS, block, vaultAddress, false);
    const performanceFeeUSD = utils
        .bigIntToBigDecimal(performanceFee, constants.INT_SIX)
        .times(usdcToken.lastPriceUSD);
    (0, Revenue_1.updateRevenueSnapshots)(vault, constants.BIGDECIMAL_ZERO, performanceFeeUSD, block);
    (0, Metrics_1.updateVaultSnapshots)(vaultAddress, event.block);
}
exports.handleCollectPerformanceFee = handleCollectPerformanceFee;
function handleCapSet(event) {
    const vaultAddress = event.address;
    if (vaultAddress.equals(constants.NULL.TYPE_ADDRESS))
        return;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    vault.depositLimit = event.params.newCap;
    vault.save();
}
exports.handleCapSet = handleCapSet;
function handleCapSetWithManager(event) {
    const vaultAddress = event.address;
    if (vaultAddress.equals(constants.NULL.TYPE_ADDRESS))
        return;
    const vault = (0, initializers_1.getOrCreateVault)(vaultAddress, event.block);
    vault.depositLimit = event.params.newCap;
    vault.save();
}
exports.handleCapSetWithManager = handleCapSetWithManager;
function handleMigrate(event) {
    const vaultAddress = event.address;
    (0, Transaction_1.Transaction)(vaultAddress, constants.BIGINT_ZERO, event.transaction, event.block, constants.TransactionType.REFRESH);
}
exports.handleMigrate = handleMigrate;
