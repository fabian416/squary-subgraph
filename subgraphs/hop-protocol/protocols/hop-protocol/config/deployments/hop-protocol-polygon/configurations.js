"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HopProtocolPolygonConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/sdk/util/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class HopProtocolPolygonConfigurations {
    getNetwork() {
        return constants_2.Network.MATIC;
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
    getArbitrumNovaPoolAddressFromBridgeAddress(bridgeAddress) {
        return bridgeAddress;
    }
    getPoolAddressFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.PolygonToken.USDC) {
            return constants_1.PolygonAmm.USDC; //USDC AMM
        }
        else if (tokenAddress == constants_1.PolygonToken.DAI) {
            return constants_1.PolygonAmm.DAI; //DAI AMM
        }
        else if (tokenAddress == constants_1.PolygonToken.MATIC) {
            return constants_1.PolygonAmm.DAI; //MATIC AMM
        }
        else if (tokenAddress == constants_1.PolygonToken.USDT) {
            return constants_1.PolygonAmm.USDT; //USDT AMM
        }
        else if (tokenAddress == constants_1.PolygonToken.ETH) {
            return constants_1.PolygonAmm.ETH; //ETH AMM
        }
        else {
            graph_ts_1.log.critical("Token not found", []);
            return "";
        }
    }
    getTokenDetails(tokenAddress) {
        if (this.getUsdcTokens().includes(tokenAddress)) {
            return ["USDC", "USD Coin", "6", constants_1.PolygonBridge.USDC];
        }
        else if (this.getDaiTokens().includes(tokenAddress)) {
            return ["DAI", "DAI Stablecoin", "18", constants_1.PolygonBridge.DAI];
        }
        else if (this.getUsdtTokens().includes(tokenAddress)) {
            return ["USDT", "Tether USD", "6", constants_1.PolygonBridge.USDT];
        }
        else if (this.getEthTokens().includes(tokenAddress)) {
            return ["ETH", "ETH", "18", constants_1.PolygonBridge.ETH];
        }
        else if (this.getMaticTokens().includes(tokenAddress)) {
            return ["MATIC", "MATIC", "18", constants_1.PolygonBridge.MATIC];
        }
        else if (tokenAddress == constants_1.RewardTokens.GNO) {
            return ["GNO", "Gnosis Token", "18", constants_1.ZERO_ADDRESS];
        }
        else if (tokenAddress == constants_1.RewardTokens.HOP) {
            return ["HOP", "HOP Token", "18", constants_1.ZERO_ADDRESS];
        }
        else {
            graph_ts_1.log.critical("Token not found", []);
            return [];
        }
    }
    getArbitrumNovaConfigFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.PolygonToken.ETH)
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
    getPoolAddressFromRewardTokenAddress(rewardToken) {
        if (rewardToken == constants_1.PolygonRewardToken.USDC_A)
            return constants_1.PolygonAmm.USDC;
        else if (rewardToken == constants_1.PolygonRewardToken.USDC_B)
            return constants_1.PolygonAmm.USDC;
        else if (rewardToken == constants_1.PolygonRewardToken.USDT_A)
            return constants_1.PolygonAmm.USDT;
        else if (rewardToken == constants_1.PolygonRewardToken.USDT_B)
            return constants_1.PolygonAmm.USDT;
        else if (rewardToken == constants_1.PolygonRewardToken.ETH_A)
            return constants_1.PolygonAmm.ETH;
        else if (rewardToken == constants_1.PolygonRewardToken.ETH_B)
            return constants_1.PolygonAmm.ETH;
        else if (rewardToken == constants_1.PolygonRewardToken.DAI_A)
            return constants_1.PolygonAmm.DAI;
        else if (rewardToken == constants_1.PolygonRewardToken.DAI_B)
            return constants_1.PolygonAmm.DAI;
        else if (rewardToken == constants_1.PolygonRewardToken.MATIC)
            return constants_1.PolygonAmm.MATIC;
        else {
            graph_ts_1.log.critical("Pool not found for reward token: {}", [rewardToken]);
            return "";
        }
    }
    getTokenAddressFromBridgeAddress(bridgeAddress) {
        if (bridgeAddress == constants_1.PolygonBridge.USDC) {
            return [constants_1.PolygonToken.USDC, constants_1.PolygonHtoken.USDC];
        }
        else if (bridgeAddress == constants_1.PolygonBridge.DAI) {
            return [constants_1.PolygonToken.DAI, constants_1.PolygonHtoken.DAI];
        }
        else if (bridgeAddress == constants_1.PolygonBridge.USDT) {
            return [constants_1.PolygonToken.USDT, constants_1.PolygonHtoken.USDT];
        }
        else if (bridgeAddress == constants_1.PolygonBridge.ETH) {
            return [constants_1.PolygonToken.ETH, constants_1.PolygonHtoken.ETH];
        }
        else if (bridgeAddress == constants_1.PolygonBridge.MATIC) {
            return [constants_1.PolygonToken.MATIC, constants_1.PolygonHtoken.MATIC];
        }
        else {
            graph_ts_1.log.critical("Token not found", []);
            return [""];
        }
    }
    getCrossTokenAddress(chainId, tokenAddress) {
        if (chainId == "42161") {
            return this.getArbitrumCrossTokenFromTokenAddress(tokenAddress); //Arbitrum
        }
        else if (chainId == "10") {
            return this.getOptimismCrossTokenFromTokenAddress(tokenAddress); //Optimism
        }
        else if (chainId == "100") {
            return this.getXdaiCrossTokenFromTokenAddress(tokenAddress); //Xdai
        }
        else if (chainId == "137") {
            return this.getPolygonCrossTokenFromTokenAddress(tokenAddress); //Polygon
        }
        else if (chainId == "42170") {
            return this.getArbitrumNovaConfigFromTokenAddress(tokenAddress)[0];
        }
        else if (chainId == "1") {
            return this.getMainnetCrossTokenFromTokenAddress(tokenAddress); //Mainnet
        }
        else if (chainId == "8453") {
            return this.getBaseCrossTokenFromTokenAddress(tokenAddress);
        }
        else if (chainId == "59144") {
            return this.getLineaCrossTokenFromTokenAddress(tokenAddress);
        }
        else {
            graph_ts_1.log.critical("Chain not found", []);
            return "";
        }
    }
    getXdaiCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.PolygonToken.USDC) {
            return constants_1.XdaiToken.USDC;
        }
        else if (tokenAddress == constants_1.PolygonToken.DAI) {
            return constants_1.XdaiToken.DAI;
        }
        else if (tokenAddress == constants_1.PolygonToken.USDT) {
            return constants_1.XdaiToken.USDT;
        }
        else if (tokenAddress == constants_1.PolygonToken.ETH) {
            return constants_1.XdaiToken.ETH;
        }
        else if (tokenAddress == constants_1.PolygonToken.MATIC) {
            return constants_1.XdaiToken.MATIC;
        }
        else {
            graph_ts_1.log.critical("Token not found", []);
        }
        return "";
    }
    getArbitrumCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.PolygonToken.USDC) {
            return constants_1.ArbitrumToken.USDC;
        }
        else if (tokenAddress == constants_1.PolygonToken.DAI) {
            return constants_1.ArbitrumToken.DAI;
        }
        else if (tokenAddress == constants_1.PolygonToken.USDT) {
            return constants_1.ArbitrumToken.USDT;
        }
        else if (tokenAddress == constants_1.PolygonToken.ETH) {
            return constants_1.ArbitrumToken.ETH;
        }
        else {
            graph_ts_1.log.critical("Token not found", []);
        }
        return "";
    }
    getOptimismCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.PolygonToken.USDC) {
            return constants_1.OptimismToken.USDC;
        }
        else if (tokenAddress == constants_1.PolygonToken.DAI) {
            return constants_1.OptimismToken.DAI;
        }
        else if (tokenAddress == constants_1.PolygonToken.USDT) {
            return constants_1.OptimismToken.USDT;
        }
        else if (tokenAddress == constants_1.PolygonToken.ETH) {
            return constants_1.OptimismToken.ETH;
        }
        else {
            graph_ts_1.log.critical("Token not found", []);
        }
        return "";
    }
    getMainnetCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.PolygonToken.USDC) {
            return constants_1.MainnetToken.USDC; //MAINNET USDC
        }
        else if (tokenAddress == constants_1.PolygonToken.DAI) {
            return constants_1.MainnetToken.DAI; //MAINNET DAI
        }
        else if (tokenAddress == constants_1.PolygonToken.USDT) {
            return constants_1.MainnetToken.USDT; //MAINNET USDT
        }
        else if (tokenAddress == constants_1.PolygonToken.MATIC) {
            return constants_1.MainnetToken.MATIC; //MAINNET MATIC
        }
        else if (tokenAddress == constants_1.PolygonToken.ETH) {
            return constants_1.MainnetToken.ETH; //MAINNET ETH
        }
        else {
            graph_ts_1.log.critical("Token not found", []);
        }
        return "";
    }
    getBaseCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.PolygonToken.USDC)
            return constants_1.BaseToken.USDC;
        if (tokenAddress == constants_1.PolygonToken.ETH)
            return constants_1.BaseToken.ETH;
        else {
            graph_ts_1.log.critical("Base CrossToken not found for token: {}", [tokenAddress]);
        }
        return "";
    }
    getLineaCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.PolygonToken.ETH)
            return constants_1.LineaToken.ETH;
        else {
            graph_ts_1.log.critical("Linea CrossToken not found for token: {}", [tokenAddress]);
        }
        return "";
    }
    getTokenAddressFromPoolAddress(poolAddress) {
        if (poolAddress == constants_1.PolygonAmm.USDC) {
            return [constants_1.PolygonToken.USDC, constants_1.PolygonHtoken.USDC];
        }
        else if (poolAddress == constants_1.PolygonAmm.DAI) {
            return [constants_1.PolygonToken.DAI, constants_1.PolygonHtoken.DAI];
        }
        else if (poolAddress == constants_1.PolygonAmm.USDT) {
            return [constants_1.PolygonToken.USDT, constants_1.PolygonHtoken.USDT];
        }
        else if (poolAddress == constants_1.PolygonAmm.ETH) {
            return [constants_1.PolygonToken.ETH, constants_1.PolygonHtoken.ETH];
        }
        else if (poolAddress == constants_1.PolygonAmm.MATIC) {
            return [constants_1.PolygonToken.MATIC, constants_1.PolygonHtoken.MATIC];
        }
        else {
            graph_ts_1.log.critical("Token not found", []);
            return [""];
        }
    }
    getPoolAddressFromBridgeAddress(bridgeAddress) {
        if (bridgeAddress == constants_1.PolygonBridge.USDC) {
            return constants_1.PolygonAmm.USDC;
        }
        else if (bridgeAddress == constants_1.PolygonBridge.DAI) {
            return constants_1.PolygonAmm.DAI;
        }
        else if (bridgeAddress == constants_1.PolygonBridge.USDT) {
            return constants_1.PolygonAmm.USDT;
        }
        else if (bridgeAddress == constants_1.PolygonBridge.ETH) {
            return constants_1.PolygonAmm.ETH;
        }
        else if (bridgeAddress == constants_1.PolygonBridge.MATIC) {
            return constants_1.PolygonAmm.MATIC;
        }
        else {
            graph_ts_1.log.critical("Address not found", []);
            return "";
        }
    }
    getPoolDetails(poolAddress) {
        if (poolAddress == constants_1.PolygonAmm.USDC) {
            return ["HOP-USDC", "hUSDC/USDC Pool - USDC", "hUSDC/USDC Pool - hUSDC"];
        }
        else if (poolAddress == constants_1.PolygonAmm.DAI) {
            return ["HOP-DAI", "hDAI/DAI Pool - DAI", "hDAI/DAI Pool - hDAI"];
        }
        else if (poolAddress == constants_1.PolygonAmm.USDT) {
            return ["HOP-USDT", "hUSDT/USDT Pool - USDT", "hUSDT/USDT Pool - hUSDT"];
        }
        else if (poolAddress == constants_1.PolygonAmm.ETH) {
            return ["HOP-ETH", "hETH/ETH Pool - ETH", "hETH/ETH Pool - hETH"];
        }
        else if (poolAddress == constants_1.PolygonAmm.MATIC) {
            return [
                "HOP-MATIC",
                "hMATIC/MATIC Pool - MATIC",
                "hMATIC/MATIC Pool - hMATIC",
            ];
        }
        else {
            graph_ts_1.log.critical("Token not found", []);
            return [];
        }
    }
    getTokenList() {
        return [
            constants_1.PolygonToken.USDC,
            constants_1.PolygonToken.DAI,
            constants_1.PolygonToken.USDT,
            constants_1.PolygonToken.MATIC,
            constants_1.PolygonToken.ETH,
        ];
    }
    getPoolsList() {
        return [
            constants_1.PolygonAmm.USDC,
            constants_1.PolygonAmm.DAI,
            constants_1.PolygonAmm.USDT,
            constants_1.PolygonAmm.MATIC,
            constants_1.PolygonAmm.ETH,
        ];
    }
    getBridgeList() {
        return [
            constants_1.PolygonBridge.USDC,
            constants_1.PolygonBridge.DAI,
            constants_1.PolygonBridge.USDT,
            constants_1.PolygonBridge.MATIC,
            constants_1.PolygonBridge.ETH,
        ];
    }
    getPolygonCrossTokenFromTokenAddress(tokenAddress) {
        return tokenAddress;
    }
    getRewardTokenList() {
        return [
            constants_1.PolygonRewardToken.DAI_A,
            constants_1.PolygonRewardToken.DAI_B,
            constants_1.PolygonRewardToken.ETH_A,
            constants_1.PolygonRewardToken.ETH_B,
            constants_1.PolygonRewardToken.USDC_A,
            constants_1.PolygonRewardToken.USDC_B,
            constants_1.PolygonRewardToken.USDT_A,
            constants_1.PolygonRewardToken.USDT_B,
            constants_1.PolygonRewardToken.MATIC,
        ];
    }
    getUsdcPools() {
        return [];
    }
    getDaiPools() {
        return [];
    }
    getUsdcTokens() {
        return [constants_1.PolygonToken.USDC, constants_1.PolygonHtoken.USDC];
    }
    getDaiTokens() {
        return [constants_1.PolygonToken.DAI, constants_1.PolygonHtoken.DAI];
    }
    getEthTokens() {
        return [constants_1.PolygonToken.ETH, constants_1.PolygonHtoken.ETH];
    }
    getMaticTokens() {
        return [constants_1.PolygonToken.MATIC, constants_1.PolygonHtoken.MATIC];
    }
    getUsdtTokens() {
        return [constants_1.PolygonToken.USDT, constants_1.PolygonHtoken.USDT];
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
    getRethPools() {
        return [];
    }
    getRethTokens() {
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
    getMagicTokens() {
        return [];
    }
}
exports.HopProtocolPolygonConfigurations = HopProtocolPolygonConfigurations;
