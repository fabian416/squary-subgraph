"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HopProtocolArbitrumConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/sdk/util/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class HopProtocolArbitrumConfigurations {
    getNetwork() {
        return constants_2.Network.ARBITRUM_ONE;
    }
    getArbitrumNovaPoolAddressFromBridgeAddress(bridgeAddress) {
        return bridgeAddress;
    }
    getPoolAddressFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.ArbitrumToken.USDC)
            return constants_1.ArbitrumAmm.USDC;
        else if (tokenAddress == constants_1.ArbitrumToken.DAI)
            return constants_1.ArbitrumAmm.DAI;
        else if (tokenAddress == constants_1.ArbitrumToken.USDT)
            return constants_1.ArbitrumAmm.USDT;
        else if (tokenAddress == constants_1.ArbitrumToken.ETH)
            return constants_1.ArbitrumAmm.ETH;
        else if (tokenAddress == constants_1.ArbitrumToken.rETH)
            return constants_1.ArbitrumAmm.rETH;
        else {
            graph_ts_1.log.critical("Token not found", []);
            return "";
        }
    }
    getTokenDetails(tokenAddress) {
        if (this.getUsdcTokens().includes(tokenAddress)) {
            return ["USDC", "USDC", "6", constants_1.ArbitrumBridge.USDC];
        }
        else if (this.getDaiTokens().includes(tokenAddress)) {
            return ["DAI", "DAI", "18", constants_1.ArbitrumBridge.DAI];
        }
        else if (this.getUsdtTokens().includes(tokenAddress)) {
            return ["USDT", "USDT", "6", constants_1.ArbitrumBridge.USDT];
        }
        else if (this.getRethTokens().includes(tokenAddress)) {
            return ["rETH", "Rocket Pool Ethereum", "18", constants_1.ArbitrumBridge.rETH];
        }
        else if (this.getMagicTokens().includes(tokenAddress)) {
            return ["MAGIC", "MAGIC", "18", constants_1.ArbitrumBridge.MAGIC];
        }
        else if (this.getEthTokens().includes(tokenAddress)) {
            return ["ETH", "ETH", "18", constants_1.ArbitrumBridge.ETH];
        }
        else if (tokenAddress == constants_1.RewardTokens.GNO) {
            return ["GNO", "Gnosis Token", "18", constants_1.ZERO_ADDRESS];
        }
        else if (tokenAddress == constants_1.RewardTokens.rETH_ARB) {
            return ["rETH", "Rocket Pool Ethereum", "18", constants_1.ZERO_ADDRESS];
        }
        else if (tokenAddress == constants_1.RewardTokens.HOP) {
            return ["HOP", "HOP Token", "18", constants_1.ZERO_ADDRESS];
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
        else if (chainId == "42170")
            return this.getArbitrumNovaConfigFromTokenAddress(tokenAddress)[0];
        else if (chainId == "1")
            return this.getMainnetCrossTokenFromTokenAddress(tokenAddress);
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
        return tokenAddress;
    }
    getArbitrumNovaConfigFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.ArbitrumToken.ETH)
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
        else if (tokenAddress == constants_1.ArbitrumToken.MAGIC)
            return [
                constants_1.ArbitrumNovaToken.MAGIC,
                constants_1.ArbitrumNovaHtoken.MAGIC,
                "HOP-MAGIC",
                "hMAGIC/MAGIC Nova Pool - MAGIC",
                "hMAGIC/MAGIC Nova Pool - hMAGIC",
                constants_1.ArbitrumNovaAmm.MAGIC,
                this.getTokenDetails(tokenAddress)[0],
                this.getTokenDetails(tokenAddress)[1],
                this.getTokenDetails(tokenAddress)[2],
            ];
        else {
            graph_ts_1.log.critical("Config not found", []);
        }
        return [""];
    }
    getPolygonCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.ArbitrumToken.USDC)
            return constants_1.PolygonToken.USDC;
        else if (tokenAddress == constants_1.ArbitrumToken.DAI)
            return constants_1.PolygonToken.DAI;
        else if (tokenAddress == constants_1.ArbitrumToken.USDT)
            return constants_1.PolygonToken.USDT;
        else if (tokenAddress == constants_1.ArbitrumToken.ETH)
            return constants_1.PolygonToken.ETH;
        else {
            graph_ts_1.log.critical("Token not found", []);
        }
        return "";
    }
    getXdaiCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.ArbitrumToken.USDC)
            return constants_1.XdaiToken.USDC;
        else if (tokenAddress == constants_1.ArbitrumToken.DAI)
            return constants_1.XdaiToken.DAI;
        else if (tokenAddress == constants_1.ArbitrumToken.USDT)
            return constants_1.XdaiToken.USDT;
        else if (tokenAddress == constants_1.ArbitrumToken.ETH)
            return constants_1.XdaiToken.ETH;
        else {
            graph_ts_1.log.critical("Token not found", []);
        }
        return "";
    }
    getOptimismCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.ArbitrumToken.USDC) {
            return constants_1.OptimismToken.USDC;
        }
        else if (tokenAddress == constants_1.ArbitrumToken.DAI) {
            return constants_1.OptimismToken.DAI;
        }
        else if (tokenAddress == constants_1.ArbitrumToken.USDT) {
            return constants_1.OptimismToken.USDT;
        }
        else if (tokenAddress == constants_1.ArbitrumToken.ETH) {
            return constants_1.OptimismToken.ETH;
        }
        else if (tokenAddress == constants_1.ArbitrumToken.rETH) {
            return constants_1.OptimismToken.rETH;
        }
        else {
            graph_ts_1.log.critical("Token not found", []);
        }
        return "";
    }
    getMainnetCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.ArbitrumToken.USDC)
            return constants_1.MainnetToken.USDC;
        else if (tokenAddress == constants_1.ArbitrumToken.DAI)
            return constants_1.MainnetToken.DAI;
        else if (tokenAddress == constants_1.ArbitrumToken.USDT)
            return constants_1.MainnetToken.USDT;
        else if (tokenAddress == constants_1.ArbitrumToken.ETH)
            return constants_1.MainnetToken.ETH;
        else if (tokenAddress == constants_1.ArbitrumToken.rETH)
            return constants_1.MainnetToken.rETH;
        else if (tokenAddress == constants_1.ArbitrumToken.MAGIC)
            return constants_1.MainnetToken.MAGIC;
        else {
            graph_ts_1.log.critical("Token not found", []);
        }
        return "";
    }
    getBaseCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.ArbitrumToken.USDC)
            return constants_1.BaseToken.USDC;
        if (tokenAddress == constants_1.ArbitrumToken.ETH)
            return constants_1.BaseToken.ETH;
        else {
            graph_ts_1.log.critical("Base CrossToken not found for token: {}", [tokenAddress]);
        }
        return "";
    }
    getLineaCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.ArbitrumToken.ETH)
            return constants_1.LineaToken.ETH;
        else {
            graph_ts_1.log.critical("Linea CrossToken not found for token: {}", [tokenAddress]);
        }
        return "";
    }
    getTokenAddressFromBridgeAddress(bridgeAddress) {
        if (bridgeAddress == constants_1.ArbitrumBridge.USDC) {
            return [constants_1.ArbitrumToken.USDC, constants_1.ArbitrumHtoken.USDC];
        }
        else if (bridgeAddress == constants_1.ArbitrumBridge.DAI) {
            return [constants_1.ArbitrumToken.DAI, constants_1.ArbitrumHtoken.DAI];
        }
        else if (bridgeAddress == constants_1.ArbitrumBridge.USDT) {
            return [constants_1.ArbitrumToken.USDT, constants_1.ArbitrumHtoken.USDT];
        }
        else if (bridgeAddress == constants_1.ArbitrumBridge.ETH) {
            return [constants_1.ArbitrumToken.ETH, constants_1.ArbitrumHtoken.ETH];
        }
        else if (bridgeAddress == constants_1.ArbitrumBridge.rETH) {
            return [constants_1.ArbitrumToken.rETH, constants_1.ArbitrumHtoken.rETH];
        }
        else if (bridgeAddress == constants_1.ArbitrumBridge.MAGIC) {
            return [constants_1.ArbitrumToken.MAGIC, constants_1.ArbitrumHtoken.MAGIC];
        }
        else {
            graph_ts_1.log.critical("Token not found", []);
            return [""];
        }
    }
    getTokenAddressFromPoolAddress(poolAddress) {
        if (poolAddress == constants_1.ArbitrumAmm.USDC)
            return [constants_1.ArbitrumToken.USDC, constants_1.ArbitrumHtoken.USDC];
        else if (poolAddress == constants_1.ArbitrumAmm.DAI)
            return [constants_1.ArbitrumToken.DAI, constants_1.ArbitrumHtoken.DAI];
        else if (poolAddress == constants_1.ArbitrumAmm.USDT)
            return [constants_1.ArbitrumToken.USDT, constants_1.ArbitrumHtoken.USDT];
        else if (poolAddress == constants_1.ArbitrumAmm.ETH)
            return [constants_1.ArbitrumToken.ETH, constants_1.ArbitrumHtoken.ETH];
        else if (poolAddress == constants_1.ArbitrumAmm.rETH)
            return [constants_1.ArbitrumToken.rETH, constants_1.ArbitrumHtoken.rETH];
        else if (poolAddress == constants_1.ArbitrumAmm.MAGIC)
            return [constants_1.ArbitrumToken.MAGIC, constants_1.ArbitrumHtoken.MAGIC];
        else {
            graph_ts_1.log.critical("Token not found", []);
            return [""];
        }
    }
    getPoolAddressFromBridgeAddress(bridgeAddress) {
        if (bridgeAddress == constants_1.ArbitrumBridge.USDC)
            return constants_1.ArbitrumAmm.USDC;
        else if (bridgeAddress == constants_1.ArbitrumBridge.DAI)
            return constants_1.ArbitrumAmm.DAI;
        else if (bridgeAddress == constants_1.ArbitrumBridge.USDT)
            return constants_1.ArbitrumAmm.USDT;
        else if (bridgeAddress == constants_1.ArbitrumBridge.ETH)
            return constants_1.ArbitrumAmm.ETH;
        else if (bridgeAddress == constants_1.ArbitrumBridge.rETH)
            return constants_1.ArbitrumAmm.rETH;
        else if (bridgeAddress == constants_1.ArbitrumBridge.MAGIC)
            return constants_1.ArbitrumAmm.MAGIC;
        else {
            graph_ts_1.log.critical("Address not found", []);
            return "";
        }
    }
    getPoolDetails(poolAddress) {
        if (poolAddress == constants_1.ArbitrumAmm.USDC) {
            return ["HOP-USDC", "hUSDC/USDC Pool - USDC", "hUSDC/USDC Pool - hUSDC"];
        }
        else if (poolAddress == constants_1.ArbitrumAmm.DAI) {
            return ["HOP-DAI", "hDAI/DAI Pool - DAI", "hDAI/DAI Pool - hDAI"];
        }
        else if (poolAddress == constants_1.ArbitrumAmm.USDT) {
            return ["HOP-USDT", "hUSDT/USDT Pool - USDT", "hUSDT/USDT Pool - hUSDT"];
        }
        else if (poolAddress == constants_1.ArbitrumAmm.ETH) {
            return ["HOP-ETH", "hETH/ETH Pool - ETH", "hETH/ETH Pool - hETH"];
        }
        else if (poolAddress == constants_1.ArbitrumAmm.rETH) {
            return ["HOP-rETH", "hrETH/rETH Pool - ETH", "hrETH/rETH Pool - hrETH"];
        }
        else if (poolAddress == constants_1.ArbitrumAmm.MAGIC) {
            return [
                "HOP-MAGIC",
                "hMAGIC/MAGIC Pool - MAGIC",
                "hMAGIC/MAGIC Pool - hMAGIC",
            ];
        }
        else {
            graph_ts_1.log.critical("Token not found", []);
            return [];
        }
    }
    getTokenList() {
        return [
            constants_1.ArbitrumToken.USDC,
            constants_1.ArbitrumToken.DAI,
            constants_1.ArbitrumToken.USDT,
            constants_1.ArbitrumToken.ETH,
            constants_1.ArbitrumToken.rETH,
            constants_1.ArbitrumHtoken.MAGIC,
        ];
    }
    getPoolsList() {
        return [
            constants_1.ArbitrumAmm.USDC,
            constants_1.ArbitrumAmm.DAI,
            constants_1.ArbitrumAmm.USDT,
            constants_1.ArbitrumAmm.ETH,
            constants_1.ArbitrumAmm.rETH,
            constants_1.ArbitrumAmm.MAGIC,
        ];
    }
    getBridgeList() {
        return [
            constants_1.ArbitrumBridge.USDC,
            constants_1.ArbitrumBridge.DAI,
            constants_1.ArbitrumBridge.USDT,
            constants_1.ArbitrumBridge.ETH,
            constants_1.ArbitrumBridge.rETH,
            constants_1.ArbitrumBridge.MAGIC,
        ];
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
        return bridgeAddress;
    }
    getUsdcPools() {
        return [];
    }
    getUsdcTokens() {
        return [constants_1.ArbitrumToken.USDC, constants_1.ArbitrumHtoken.USDC];
    }
    getDaiTokens() {
        return [constants_1.ArbitrumToken.DAI, constants_1.ArbitrumHtoken.DAI];
    }
    getUsdtTokens() {
        return [constants_1.ArbitrumToken.USDT, constants_1.ArbitrumHtoken.USDT];
    }
    getEthTokens() {
        return [
            constants_1.ArbitrumToken.ETH,
            constants_1.ArbitrumHtoken.ETH,
            constants_1.ArbitrumNovaToken.ETH,
            constants_1.ArbitrumNovaHtoken.ETH,
        ];
    }
    getRethTokens() {
        return [constants_1.ArbitrumToken.rETH, constants_1.ArbitrumHtoken.rETH];
    }
    getMagicTokens() {
        return [
            constants_1.ArbitrumToken.MAGIC,
            constants_1.ArbitrumHtoken.MAGIC,
            constants_1.ArbitrumNovaToken.MAGIC,
            constants_1.ArbitrumHtoken.MAGIC,
        ];
    }
    getRethPools() {
        return [];
    }
    getsUSDPools() {
        return [];
    }
    getsUSDTokens() {
        return [];
    }
    getMagicPools() {
        return [];
    }
    getDaiPools() {
        return [];
    }
    getUsdtPools() {
        return [];
    }
    getEthPools() {
        return [];
    }
    getSnxPools() {
        return [];
    }
    getSnxTokens() {
        return [];
    }
    getMaticPools() {
        return [];
    }
    getMaticTokens() {
        return [];
    }
    getRewardTokenList() {
        return [
            constants_1.ArbitrumRewardToken.DAI,
            constants_1.ArbitrumRewardToken.ETH,
            constants_1.ArbitrumRewardToken.USDC,
            constants_1.ArbitrumRewardToken.rETH,
            constants_1.ArbitrumRewardToken.USDT,
        ];
    }
    getPoolAddressFromRewardTokenAddress(rewardToken) {
        if (rewardToken == constants_1.ArbitrumRewardToken.DAI)
            return constants_1.ArbitrumAmm.DAI;
        else if (rewardToken == constants_1.ArbitrumRewardToken.ETH)
            return constants_1.ArbitrumAmm.ETH;
        else if (rewardToken == constants_1.ArbitrumRewardToken.USDC)
            return constants_1.ArbitrumAmm.USDC;
        else if (rewardToken == constants_1.ArbitrumRewardToken.USDT)
            return constants_1.ArbitrumAmm.USDT;
        else if (rewardToken == constants_1.ArbitrumRewardToken.rETH)
            return constants_1.ArbitrumAmm.rETH;
        else {
            graph_ts_1.log.critical("Pool not found for reward token: {}", [rewardToken]);
            return "";
        }
    }
}
exports.HopProtocolArbitrumConfigurations = HopProtocolArbitrumConfigurations;
