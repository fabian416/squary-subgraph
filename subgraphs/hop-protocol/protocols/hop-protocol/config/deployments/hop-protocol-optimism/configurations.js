"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HopProtocolOptimismConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/sdk/util/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class HopProtocolOptimismConfigurations {
    getNetwork() {
        return constants_2.Network.OPTIMISM;
    }
    getArbitrumPoolAddressFromBridgeAddress(bridgeAddress) {
        return bridgeAddress;
    }
    getPolygonPoolAddressFromBridgeAddress(bridgeAddress) {
        return bridgeAddress;
    }
    getXdaiPoolAddressFromBridgeAddress(bridgeAddress) {
        return bridgeAddress;
    }
    getOptimismPoolAddressFromBridgeAddress(bridgeAddress) {
        return bridgeAddress;
    }
    getPoolAddressFromChainId(chainId, bridgeAddress) {
        return bridgeAddress || chainId;
    }
    getPoolAddressFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.OptimismToken.USDC)
            return constants_1.OptimismAmm.USDC;
        else if (tokenAddress == constants_1.OptimismToken.DAI)
            return constants_1.OptimismAmm.DAI;
        else if (tokenAddress == constants_1.OptimismToken.USDT)
            return constants_1.OptimismAmm.USDT;
        else if (tokenAddress == constants_1.OptimismToken.ETH)
            return constants_1.OptimismAmm.ETH;
        else if (tokenAddress == constants_1.OptimismToken.SNX)
            return constants_1.OptimismAmm.SNX;
        else if (tokenAddress == constants_1.OptimismToken.rETH)
            return constants_1.OptimismAmm.rETH;
        else if (tokenAddress == constants_1.OptimismToken.sUSD)
            return constants_1.OptimismAmm.sUSD;
        else {
            graph_ts_1.log.critical("Token not found", []);
            return "";
        }
    }
    getPoolAddressFromRewardTokenAddress(rewardToken) {
        if (rewardToken == constants_1.OptimismRewardToken.SNX_A)
            return constants_1.OptimismAmm.SNX;
        else if (rewardToken == constants_1.OptimismRewardToken.SNX_B)
            return constants_1.OptimismAmm.SNX;
        else if (rewardToken == constants_1.OptimismRewardToken.DAI)
            return constants_1.OptimismAmm.DAI;
        else if (rewardToken == constants_1.OptimismRewardToken.ETH)
            return constants_1.OptimismAmm.ETH;
        else if (rewardToken == constants_1.OptimismRewardToken.rETH)
            return constants_1.OptimismAmm.rETH;
        else if (rewardToken == constants_1.OptimismRewardToken.sUSD_A)
            return constants_1.OptimismAmm.sUSD;
        else if (rewardToken == constants_1.OptimismRewardToken.sUSD_B)
            return constants_1.OptimismAmm.sUSD;
        else if (rewardToken == constants_1.OptimismRewardToken.USDC)
            return constants_1.OptimismAmm.USDC;
        else if (rewardToken == constants_1.OptimismRewardToken.USDT)
            return constants_1.OptimismAmm.USDT;
        else {
            graph_ts_1.log.critical("Pool not found for reward token: {}", [rewardToken]);
            return "";
        }
    }
    getTokenDetails(tokenAddress) {
        if (this.getUsdcTokens().includes(tokenAddress)) {
            return ["USDC", "USD Coin", "6", constants_1.OptimismBridge.USDC];
        }
        else if (this.getDaiTokens().includes(tokenAddress)) {
            return ["DAI", "DAI Stablecoin", "18", constants_1.OptimismBridge.DAI];
        }
        else if (this.getUsdtTokens().includes(tokenAddress)) {
            return ["USDT", "Tether USD", "6", constants_1.OptimismBridge.USDT];
        }
        else if (this.getsUSDTokens().includes(tokenAddress)) {
            return ["sUSD", "sUSD", "18", constants_1.OptimismBridge.sUSD];
        }
        else if (this.getRethTokens().includes(tokenAddress)) {
            return ["rETH", "Rocket Pool Ethereum", "18", constants_1.OptimismBridge.rETH];
        }
        else if (this.getEthTokens().includes(tokenAddress)) {
            return ["ETH", "Ethereum", "18", constants_1.OptimismBridge.ETH];
        }
        else if (this.getSnxTokens().includes(tokenAddress)) {
            return ["SNX", "SNX", "18", constants_1.OptimismBridge.SNX];
        }
        else if (tokenAddress == constants_1.RewardTokens.GNO) {
            return ["GNO", "Gnosis Token", "18", constants_1.ZERO_ADDRESS];
        }
        else if (tokenAddress == constants_1.RewardTokens.HOP) {
            return ["HOP", "HOP Token", "18", constants_1.ZERO_ADDRESS];
        }
        else if (tokenAddress == constants_1.RewardTokens.OP) {
            return ["OP", "Optimism Token", "18", constants_1.ZERO_ADDRESS];
        }
        else if (tokenAddress == constants_1.RewardTokens.rETH_OP) {
            return ["rETH", "Rocket Pool Ethereum", "18", constants_1.ZERO_ADDRESS];
        }
        else {
            graph_ts_1.log.critical("Token not found", []);
            return [];
        }
    }
    getCrossTokenAddress(chainId, tokenAddress) {
        if (chainId == "42161")
            return this.getArbitrumCrossTokenFromTokenAddress(tokenAddress);
        else if (chainId == "10")
            return this.getOptimismCrossTokenFromTokenAddress(tokenAddress);
        else if (chainId == "100")
            return this.getXdaiCrossTokenFromTokenAddress(tokenAddress);
        else if (chainId == "137")
            return this.getPolygonCrossTokenFromTokenAddress(tokenAddress);
        else if (chainId == "1")
            return this.getMainnetCrossTokenFromTokenAddress(tokenAddress);
        else if (chainId == "42170")
            return this.getArbitrumNovaConfigFromTokenAddress(tokenAddress)[0];
        else if (chainId == "8453")
            return this.getBaseCrossTokenFromTokenAddress(tokenAddress);
        else if (chainId == "59144")
            return this.getLineaCrossTokenFromTokenAddress(tokenAddress);
        else {
            graph_ts_1.log.critical("Chain not found: {}", [chainId]);
            return "";
        }
    }
    getArbitrumCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.OptimismToken.USDC)
            return constants_1.ArbitrumToken.USDC;
        else if (tokenAddress == constants_1.OptimismToken.DAI)
            return constants_1.ArbitrumToken.DAI;
        else if (tokenAddress == constants_1.OptimismToken.USDT)
            return constants_1.ArbitrumToken.USDT;
        else if (tokenAddress == constants_1.OptimismToken.ETH)
            return constants_1.ArbitrumToken.ETH;
        else if (tokenAddress == constants_1.OptimismToken.rETH)
            return constants_1.ArbitrumToken.rETH;
        else {
            graph_ts_1.log.critical("Token not found", []);
        }
        return "";
    }
    getPolygonCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.OptimismToken.USDC)
            return constants_1.PolygonToken.USDC;
        else if (tokenAddress == constants_1.OptimismToken.DAI)
            return constants_1.PolygonToken.DAI;
        else if (tokenAddress == constants_1.OptimismToken.USDT)
            return constants_1.PolygonToken.USDT;
        else if (tokenAddress == constants_1.OptimismToken.ETH)
            return constants_1.PolygonToken.ETH;
        else {
            graph_ts_1.log.critical("Token not found", []);
        }
        return "";
    }
    getXdaiCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.OptimismToken.USDC)
            return constants_1.XdaiToken.USDC;
        else if (tokenAddress == constants_1.OptimismToken.DAI)
            return constants_1.XdaiToken.DAI;
        else if (tokenAddress == constants_1.OptimismToken.USDT)
            return constants_1.XdaiToken.USDT;
        else if (tokenAddress == constants_1.OptimismToken.ETH)
            return constants_1.XdaiToken.ETH;
        else {
            graph_ts_1.log.critical("Token not found", []);
        }
        return "";
    }
    getArbitrumNovaConfigFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.OptimismToken.ETH)
            return [
                constants_1.ArbitrumNovaToken.ETH,
                constants_1.ArbitrumNovaHtoken.ETH,
                "HOP-ETH",
                "hETH/ETH Nova Pool - ETH",
                "hETH/ETH Nova Pool - hETH",
                constants_1.ArbitrumNovaAmm.ETH,
                this.getTokenDetails(tokenAddress)[0],
                this.getTokenDetails(tokenAddress)[1],
                this.getTokenDetails(tokenAddress)[2],
            ];
        else {
            graph_ts_1.log.critical("Config not found", []);
        }
        return [""];
    }
    getOptimismCrossTokenFromTokenAddress(tokenAddress) {
        graph_ts_1.log.critical("CrossToken not found", []);
        return tokenAddress;
    }
    getMainnetCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.OptimismToken.USDC)
            return constants_1.MainnetToken.USDC;
        else if (tokenAddress == constants_1.OptimismToken.DAI)
            return constants_1.MainnetToken.DAI;
        else if (tokenAddress == constants_1.OptimismToken.USDT)
            return constants_1.MainnetToken.USDT;
        else if (tokenAddress == constants_1.OptimismToken.SNX)
            return constants_1.MainnetToken.SNX;
        else if (tokenAddress == constants_1.OptimismToken.ETH)
            return constants_1.MainnetToken.ETH;
        else if (tokenAddress == constants_1.OptimismToken.sUSD)
            return constants_1.MainnetToken.sUSD;
        else if (tokenAddress == constants_1.OptimismToken.rETH)
            return constants_1.MainnetToken.rETH;
        else {
            graph_ts_1.log.critical("Token not found", []);
        }
        return "";
    }
    getBaseCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.OptimismToken.USDC)
            return constants_1.BaseToken.USDC;
        if (tokenAddress == constants_1.OptimismToken.ETH)
            return constants_1.BaseToken.ETH;
        else {
            graph_ts_1.log.critical("Base CrossToken not found for token: {}", [tokenAddress]);
        }
        return "";
    }
    getLineaCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.OptimismToken.ETH)
            return constants_1.LineaToken.ETH;
        else {
            graph_ts_1.log.critical("Linea CrossToken not found for token: {}", [tokenAddress]);
        }
        return "";
    }
    getArbitrumNovaPoolAddressFromBridgeAddress(bridgeAddress) {
        return bridgeAddress;
    }
    getTokenAddressFromBridgeAddress(bridgeAddress) {
        if (bridgeAddress == constants_1.OptimismBridge.USDC) {
            return [constants_1.OptimismToken.USDC, constants_1.OptimismHtoken.USDC];
        }
        else if (bridgeAddress == constants_1.OptimismBridge.DAI) {
            return [constants_1.OptimismToken.DAI, constants_1.OptimismHtoken.DAI];
        }
        else if (bridgeAddress == constants_1.OptimismBridge.USDT) {
            return [constants_1.OptimismToken.USDT, constants_1.OptimismHtoken.USDT];
        }
        else if (bridgeAddress == constants_1.OptimismBridge.ETH) {
            return [constants_1.OptimismToken.ETH, constants_1.OptimismHtoken.ETH];
        }
        else if (bridgeAddress == constants_1.OptimismBridge.SNX) {
            return [constants_1.OptimismToken.SNX, constants_1.OptimismHtoken.SNX];
        }
        else if (bridgeAddress == constants_1.OptimismBridge.sUSD) {
            return [constants_1.OptimismToken.sUSD, constants_1.OptimismHtoken.sUSD];
        }
        else if (bridgeAddress == constants_1.OptimismBridge.rETH) {
            return [constants_1.OptimismToken.rETH, constants_1.OptimismHtoken.rETH];
        }
        else {
            graph_ts_1.log.critical("Token not found", []);
            return [""];
        }
    }
    getTokenAddressFromPoolAddress(poolAddress) {
        if (poolAddress == constants_1.OptimismAmm.USDC)
            return [constants_1.OptimismToken.USDC, constants_1.OptimismHtoken.USDC];
        else if (poolAddress == constants_1.OptimismAmm.DAI)
            return [constants_1.OptimismToken.DAI, constants_1.OptimismHtoken.DAI];
        else if (poolAddress == constants_1.OptimismAmm.USDT)
            return [constants_1.OptimismToken.USDT, constants_1.OptimismHtoken.USDT];
        else if (poolAddress == constants_1.OptimismAmm.ETH)
            return [constants_1.OptimismToken.ETH, constants_1.OptimismHtoken.ETH];
        else if (poolAddress == constants_1.OptimismAmm.SNX)
            return [constants_1.OptimismToken.SNX, constants_1.OptimismHtoken.SNX];
        else if (poolAddress == constants_1.OptimismAmm.sUSD)
            return [constants_1.OptimismToken.sUSD, constants_1.OptimismHtoken.sUSD];
        else if (poolAddress == constants_1.OptimismAmm.rETH)
            return [constants_1.OptimismToken.rETH, constants_1.OptimismHtoken.rETH];
        else {
            graph_ts_1.log.critical("Token not found", []);
            return [""];
        }
    }
    getPoolAddressFromBridgeAddress(bridgeAddress) {
        if (bridgeAddress == constants_1.OptimismBridge.USDC)
            return constants_1.OptimismAmm.USDC;
        else if (bridgeAddress == constants_1.OptimismBridge.DAI)
            return constants_1.OptimismAmm.DAI;
        else if (bridgeAddress == constants_1.OptimismBridge.USDT)
            return constants_1.OptimismAmm.USDT;
        else if (bridgeAddress == constants_1.OptimismBridge.ETH)
            return constants_1.OptimismAmm.ETH;
        else if (bridgeAddress == constants_1.OptimismBridge.SNX)
            return constants_1.OptimismAmm.SNX;
        else if (bridgeAddress == constants_1.OptimismBridge.sUSD)
            return constants_1.OptimismAmm.sUSD;
        else if (bridgeAddress == constants_1.OptimismBridge.rETH)
            return constants_1.OptimismAmm.rETH;
        else {
            graph_ts_1.log.critical("Address not found", []);
            return "";
        }
    }
    getPoolDetails(poolAddress) {
        if (poolAddress == constants_1.OptimismAmm.USDC) {
            return ["HOP-USDC", "hUSDC/USDC Pool - USDC", "hUSDC/USDC Pool - hUSDC"];
        }
        else if (poolAddress == constants_1.OptimismAmm.DAI) {
            return ["HOP-DAI", "hDAI/DAI Pool - DAI", "hDAI/DAI Pool - hDAI"];
        }
        else if (poolAddress == constants_1.OptimismAmm.USDT) {
            return ["HOP-USDT", "hUSDT/USDT Pool - USDT", "hUSDT/USDT Pool - hUSDT"];
        }
        else if (poolAddress == constants_1.OptimismAmm.ETH) {
            return ["HOP-ETH", "hETH/ETH Pool - ETH", "hETH/ETH Pool - hETH"];
        }
        else if (poolAddress == constants_1.OptimismAmm.SNX) {
            return ["HOP-SNX", "hSNX/SNX Pool - SNX", "hSNX/SNX Pool - hSNX"];
        }
        else if (poolAddress == constants_1.OptimismAmm.rETH) {
            return ["HOP-rETH", "hrETH/rETH Pool - rETH", "hrETH/rETH Pool - hrETH"];
        }
        else if (poolAddress == constants_1.OptimismAmm.sUSD) {
            return ["HOP-sUSD", "hsUSD/sUSD Pool - SNX", "hsUSD /sUSD Pool - hsUSD"];
        }
        else if (poolAddress == constants_1.ZERO_ADDRESS) {
            return ["HOP-POOL", "HOP/HOP Pool - HOP", "hHOP/HOP Pool - hHOP"];
        }
        else {
            graph_ts_1.log.critical("Token not found", []);
            return [];
        }
    }
    getTokenList() {
        return [
            constants_1.OptimismToken.USDC,
            constants_1.OptimismToken.DAI,
            constants_1.OptimismToken.USDT,
            constants_1.OptimismToken.ETH,
            constants_1.OptimismToken.SNX,
            constants_1.OptimismToken.sUSD,
            constants_1.OptimismToken.rETH,
        ];
    }
    getPoolsList() {
        return [
            constants_1.OptimismAmm.USDC,
            constants_1.OptimismAmm.DAI,
            constants_1.OptimismAmm.USDT,
            constants_1.OptimismAmm.SNX,
            constants_1.OptimismAmm.ETH,
            constants_1.OptimismAmm.rETH,
            constants_1.OptimismAmm.sUSD,
        ];
    }
    getBridgeList() {
        return [
            constants_1.OptimismBridge.USDC,
            constants_1.OptimismBridge.DAI,
            constants_1.OptimismBridge.USDT,
            constants_1.OptimismBridge.SNX,
            constants_1.OptimismBridge.ETH,
            constants_1.OptimismBridge.rETH,
            constants_1.OptimismBridge.sUSD,
        ];
    }
    getRewardTokenList() {
        return [
            constants_1.OptimismRewardToken.SNX_A,
            constants_1.OptimismRewardToken.SNX_B,
            constants_1.OptimismRewardToken.DAI,
            constants_1.OptimismRewardToken.sUSD_A,
            constants_1.OptimismRewardToken.sUSD_B,
            constants_1.OptimismRewardToken.rETH,
            constants_1.OptimismRewardToken.ETH,
            constants_1.OptimismRewardToken.USDC,
            constants_1.OptimismRewardToken.USDT,
        ];
    }
    getUsdcPools() {
        return [];
    }
    getUsdcTokens() {
        return [constants_1.OptimismToken.USDC, constants_1.OptimismHtoken.USDC];
    }
    getRethPools() {
        return [];
    }
    getRethTokens() {
        return [constants_1.OptimismToken.rETH, constants_1.OptimismHtoken.rETH];
    }
    getsUSDPools() {
        return [];
    }
    getsUSDTokens() {
        return [constants_1.OptimismToken.sUSD, constants_1.OptimismHtoken.sUSD];
    }
    getDaiPools() {
        return [];
    }
    getDaiTokens() {
        return [constants_1.OptimismToken.DAI, constants_1.OptimismHtoken.DAI];
    }
    getUsdtPools() {
        return [];
    }
    getUsdtTokens() {
        return [constants_1.OptimismToken.USDT, constants_1.OptimismHtoken.USDT];
    }
    getEthPools() {
        return [];
    }
    getEthTokens() {
        return [
            constants_1.OptimismToken.ETH,
            constants_1.OptimismHtoken.ETH,
            constants_1.ArbitrumNovaToken.ETH,
            constants_1.ArbitrumNovaToken.ETH,
        ];
    }
    getSnxPools() {
        return [];
    }
    getSnxTokens() {
        return [constants_1.OptimismToken.SNX, constants_1.OptimismHtoken.SNX];
    }
    getMaticPools() {
        return [];
    }
    getMaticTokens() {
        return [];
    }
    getMagicPools() {
        return [];
    }
    getMagicTokens() {
        return [];
    }
}
exports.HopProtocolOptimismConfigurations = HopProtocolOptimismConfigurations;
