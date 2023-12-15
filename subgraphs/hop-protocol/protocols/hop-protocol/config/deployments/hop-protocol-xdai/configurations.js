"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HopProtocolxDaiConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/sdk/util/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class HopProtocolxDaiConfigurations {
    getNetwork() {
        return constants_2.Network.XDAI;
    }
    getPoolAddressFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.XdaiToken.USDC)
            return constants_1.XdaiAmm.USDC;
        else if (tokenAddress == constants_1.XdaiToken.DAI)
            return constants_1.XdaiAmm.DAI;
        else if (tokenAddress == constants_1.XdaiToken.USDT)
            return constants_1.XdaiAmm.USDT;
        else if (tokenAddress == constants_1.XdaiToken.ETH)
            return constants_1.XdaiAmm.ETH;
        else if (tokenAddress == constants_1.XdaiToken.MATIC)
            return constants_1.XdaiAmm.MATIC;
        else {
            graph_ts_1.log.critical("[getPoolAddressFromTokenAddress] Pool not found for token: {}", [tokenAddress]);
            return "";
        }
    }
    getTokenDetails(tokenAddress) {
        if (this.getUsdcTokens().includes(tokenAddress)) {
            return ["USDC", "USD Coin", "6", constants_1.XdaiBridge.USDC];
        }
        else if (this.getDaiTokens().includes(tokenAddress)) {
            return ["DAI", "DAI Stablecoin", "18", constants_1.XdaiBridge.DAI];
        }
        else if (this.getUsdtTokens().includes(tokenAddress)) {
            return ["USDT", "Tether USD", "6", constants_1.XdaiBridge.USDT];
        }
        else if (this.getEthTokens().includes(tokenAddress)) {
            return ["ETH", "ETH", "18", constants_1.XdaiBridge.ETH];
        }
        else if (this.getMaticTokens().includes(tokenAddress)) {
            return ["MATIC", "MATIC", "18", constants_1.XdaiBridge.MATIC];
        }
        else if (tokenAddress == constants_1.RewardTokens.GNO) {
            return ["GNO", "Gnosis Token", "18", constants_1.ZERO_ADDRESS];
        }
        else if (tokenAddress == constants_1.RewardTokens.HOP) {
            return ["HOP", "HOP Token", "18", constants_1.ZERO_ADDRESS];
        }
        else {
            graph_ts_1.log.critical("[getTokenDetails] Token details not found for token: {}", [
                tokenAddress,
            ]);
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
            graph_ts_1.log.critical("Chain not found", []);
            return "";
        }
    }
    getArbitrumNovaConfigFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.XdaiToken.ETH)
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
    getArbitrumNovaPoolAddressFromBridgeAddress(bridgeAddress) {
        return bridgeAddress;
    }
    getArbitrumCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.XdaiToken.USDC) {
            return constants_1.ArbitrumToken.USDC;
        }
        else if (tokenAddress == constants_1.XdaiToken.DAI) {
            return constants_1.ArbitrumToken.DAI;
        }
        else if (tokenAddress == constants_1.XdaiToken.USDT) {
            return constants_1.ArbitrumToken.USDT;
        }
        else if (tokenAddress == constants_1.XdaiToken.ETH) {
            return constants_1.ArbitrumToken.ETH;
        }
        else {
            graph_ts_1.log.critical("[getArbitrumCrossTokenFromTokenAddress] ArbitrumCrossToken not found for token: {}", [tokenAddress]);
        }
        return "";
    }
    getPolygonCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.XdaiToken.USDC) {
            return constants_1.PolygonToken.USDC;
        }
        else if (tokenAddress == constants_1.XdaiToken.DAI) {
            return constants_1.PolygonToken.DAI;
        }
        else if (tokenAddress == constants_1.XdaiToken.USDT) {
            return constants_1.PolygonToken.USDT;
        }
        else if (tokenAddress == constants_1.XdaiToken.MATIC) {
            return constants_1.PolygonToken.MATIC;
        }
        else if (tokenAddress == constants_1.XdaiToken.ETH) {
            return constants_1.PolygonToken.ETH;
        }
        else {
            graph_ts_1.log.critical("[getPolygonCrossTokenFromTokenAddress] PolygonCrossToken not found for token: {}", [tokenAddress]);
        }
        return "";
    }
    getOptimismCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.XdaiToken.USDC) {
            return constants_1.OptimismToken.USDC;
        }
        else if (tokenAddress == constants_1.XdaiToken.DAI) {
            return constants_1.OptimismToken.DAI;
        }
        else if (tokenAddress == constants_1.XdaiToken.USDT) {
            return constants_1.OptimismToken.USDT;
        }
        else if (tokenAddress == constants_1.XdaiToken.ETH) {
            return constants_1.OptimismToken.ETH;
        }
        else {
            graph_ts_1.log.critical("[getOptimismCrossTokenFromTokenAddress] OptimismCrossToken not found for token: {}", [tokenAddress]);
        }
        return "";
    }
    getMainnetCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.XdaiToken.USDC)
            return constants_1.MainnetToken.USDC;
        else if (tokenAddress == constants_1.XdaiToken.DAI)
            return constants_1.MainnetToken.DAI;
        else if (tokenAddress == constants_1.XdaiToken.USDT)
            return constants_1.MainnetToken.USDT;
        else if (tokenAddress == constants_1.XdaiToken.MATIC)
            return constants_1.MainnetToken.MATIC;
        else if (tokenAddress == constants_1.XdaiToken.ETH)
            return constants_1.MainnetToken.ETH;
        else {
            graph_ts_1.log.critical("[getMainnetCrossTokenFromTokenAddress] MainnetCrossToken not found for token: {}", [tokenAddress]);
        }
        return "";
    }
    getBaseCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.XdaiToken.USDC)
            return constants_1.BaseToken.USDC;
        if (tokenAddress == constants_1.XdaiToken.ETH)
            return constants_1.BaseToken.ETH;
        else {
            graph_ts_1.log.critical("[getBaseCrossTokenFromTokenAddress] BaseCrossToken not found for token: {}", [tokenAddress]);
        }
        return "";
    }
    getLineaCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.XdaiToken.ETH)
            return constants_1.LineaToken.ETH;
        else {
            graph_ts_1.log.critical("[getLineaCrossTokenFromTokenAddress] LineaCrossToken not found for token: {}", [tokenAddress]);
        }
        return "";
    }
    getTokenAddressFromBridgeAddress(bridgeAddress) {
        if (bridgeAddress == constants_1.XdaiBridge.USDC) {
            return [constants_1.XdaiToken.USDC, constants_1.XdaiHtoken.USDC];
        }
        else if (bridgeAddress == constants_1.XdaiBridge.DAI) {
            return [constants_1.XdaiToken.DAI, constants_1.XdaiHtoken.DAI];
        }
        else if (bridgeAddress == constants_1.XdaiBridge.USDT) {
            return [constants_1.XdaiToken.USDT, constants_1.XdaiHtoken.USDT];
        }
        else if (bridgeAddress == constants_1.XdaiBridge.ETH) {
            return [constants_1.XdaiToken.ETH, constants_1.XdaiHtoken.ETH];
        }
        else if (bridgeAddress == constants_1.XdaiBridge.MATIC) {
            return [constants_1.XdaiToken.MATIC, constants_1.XdaiHtoken.MATIC];
        }
        else {
            graph_ts_1.log.critical("[getTokenAddressFromBridgeAddress] Token not found for bridge: {}", [bridgeAddress]);
            return [""];
        }
    }
    getTokenAddressFromPoolAddress(poolAddress) {
        if (poolAddress == constants_1.XdaiAmm.USDC)
            return [constants_1.XdaiToken.USDC, constants_1.XdaiHtoken.USDC];
        else if (poolAddress == constants_1.XdaiAmm.DAI)
            return [constants_1.XdaiToken.DAI, constants_1.XdaiHtoken.DAI];
        else if (poolAddress == constants_1.XdaiAmm.USDT)
            return [constants_1.XdaiToken.USDT, constants_1.XdaiHtoken.USDT];
        else if (poolAddress == constants_1.XdaiAmm.ETH)
            return [constants_1.XdaiToken.ETH, constants_1.XdaiHtoken.ETH];
        else if (poolAddress == constants_1.XdaiAmm.MATIC)
            return [constants_1.XdaiToken.MATIC, constants_1.XdaiHtoken.MATIC];
        else {
            graph_ts_1.log.critical("[getTokenAddressFromPoolAddress] Token not found for pool: {}", [poolAddress]);
            return [""];
        }
    }
    getPoolAddressFromBridgeAddress(bridgeAddress) {
        if (bridgeAddress == constants_1.XdaiBridge.USDC)
            return constants_1.XdaiAmm.USDC;
        else if (bridgeAddress == constants_1.XdaiBridge.DAI)
            return constants_1.XdaiAmm.DAI;
        else if (bridgeAddress == constants_1.XdaiBridge.USDT)
            return constants_1.XdaiAmm.USDT;
        else if (bridgeAddress == constants_1.XdaiBridge.ETH)
            return constants_1.XdaiAmm.ETH;
        else if (bridgeAddress == constants_1.XdaiBridge.MATIC)
            return constants_1.XdaiAmm.MATIC;
        else {
            graph_ts_1.log.critical("Bridge Address not found", []);
            return "";
        }
    }
    getPoolDetails(poolAddress) {
        if (poolAddress == constants_1.XdaiAmm.USDC)
            return ["HOP-USDC", "hUSDC/USDC Pool - USDC", "hUSDC/USDC Pool - hUSDC"];
        else if (poolAddress == constants_1.XdaiAmm.DAI)
            return ["HOP-DAI", "hDAI/DAI Pool - DAI", "hDAI/DAI Pool - hDAI"];
        else if (poolAddress == constants_1.XdaiAmm.USDT)
            return ["HOP-USDT", "hUSDT/USDT Pool - USDT", "hUSDT/USDT Pool - hUSDT"];
        else if (poolAddress == constants_1.XdaiAmm.ETH)
            return ["HOP-ETH", "hETH/ETH Pool - ETH", "hETH/ETH Pool - hETH"];
        else if (poolAddress == constants_1.XdaiAmm.MATIC)
            return [
                "HOP-MATIC",
                "hMATIC/MATIC Pool - MATIC",
                "hMATIC/MATIC Pool - hMATIC",
            ];
        else {
            graph_ts_1.log.critical("Pool not found", []);
            return [];
        }
    }
    getPoolAddressFromRewardTokenAddress(rewardToken) {
        if (rewardToken == constants_1.XdaiRewardToken.USDC_A)
            return constants_1.XdaiAmm.USDC;
        else if (rewardToken == constants_1.XdaiRewardToken.USDC_B)
            return constants_1.XdaiAmm.USDC;
        else if (rewardToken == constants_1.XdaiRewardToken.USDT_A)
            return constants_1.XdaiAmm.USDT;
        else if (rewardToken == constants_1.XdaiRewardToken.USDT_B)
            return constants_1.XdaiAmm.USDT;
        else if (rewardToken == constants_1.XdaiRewardToken.ETH_A)
            return constants_1.XdaiAmm.ETH;
        else if (rewardToken == constants_1.XdaiRewardToken.ETH_B)
            return constants_1.XdaiAmm.ETH;
        else if (rewardToken == constants_1.XdaiRewardToken.DAI_A)
            return constants_1.XdaiAmm.DAI;
        else if (rewardToken == constants_1.XdaiRewardToken.DAI_B)
            return constants_1.XdaiAmm.DAI;
        else {
            graph_ts_1.log.critical("Pool not found for reward token: {}", [rewardToken]);
            return "";
        }
    }
    getTokenList() {
        return [
            constants_1.XdaiToken.USDC,
            constants_1.XdaiToken.DAI,
            constants_1.XdaiToken.USDT,
            constants_1.XdaiToken.ETH,
            constants_1.XdaiToken.MATIC,
        ];
    }
    getPoolsList() {
        return [
            constants_1.XdaiAmm.USDC,
            constants_1.XdaiAmm.DAI,
            constants_1.XdaiAmm.USDT,
            constants_1.XdaiAmm.MATIC,
            constants_1.XdaiAmm.ETH,
        ];
    }
    getBridgeList() {
        return [
            constants_1.XdaiBridge.USDC,
            constants_1.XdaiBridge.DAI,
            constants_1.XdaiBridge.MATIC,
            constants_1.XdaiBridge.USDT,
            constants_1.XdaiBridge.ETH,
        ];
    }
    getRewardTokenList() {
        return [
            constants_1.XdaiRewardToken.DAI_A,
            constants_1.XdaiRewardToken.DAI_B,
            constants_1.XdaiRewardToken.ETH_A,
            constants_1.XdaiRewardToken.ETH_B,
            constants_1.XdaiRewardToken.USDC_A,
            constants_1.XdaiRewardToken.USDC_B,
            constants_1.XdaiRewardToken.USDT_A,
            constants_1.XdaiRewardToken.USDT_B,
        ];
    }
    getXdaiCrossTokenFromTokenAddress(tokenAddress) {
        return tokenAddress;
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
        return chainId || bridgeAddress;
    }
    getUsdcPools() {
        return [];
    }
    getUsdcTokens() {
        return [constants_1.XdaiToken.USDC, constants_1.XdaiHtoken.USDC];
    }
    getDaiPools() {
        return [];
    }
    getDaiTokens() {
        return [constants_1.XdaiToken.DAI, constants_1.XdaiHtoken.DAI];
    }
    getUsdtPools() {
        return [];
    }
    getUsdtTokens() {
        return [constants_1.XdaiToken.USDT, constants_1.XdaiHtoken.USDT];
    }
    getEthPools() {
        return [];
    }
    getEthTokens() {
        return [
            constants_1.XdaiToken.ETH,
            constants_1.XdaiHtoken.ETH,
            constants_1.ArbitrumNovaToken.ETH,
            constants_1.ArbitrumNovaHtoken.ETH,
        ];
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
        return [constants_1.XdaiToken.MATIC, constants_1.XdaiHtoken.MATIC];
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
exports.HopProtocolxDaiConfigurations = HopProtocolxDaiConfigurations;
