"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HopProtocolEthereumConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/sdk/util/constants");
const constants_2 = require("../../../../../src/sdk/util/constants");
class HopProtocolEthereumConfigurations {
    getNetwork() {
        return constants_2.Network.MAINNET;
    }
    getTokenDetails(tokenAddress) {
        if (this.getUsdcTokens().includes(tokenAddress)) {
            return ["USDC", "USD Coin", "6", constants_1.MainnetBridge.USDC];
        }
        else if (this.getMaticTokens().includes(tokenAddress)) {
            return ["MATIC", "Matic", "18", constants_1.MainnetBridge.MATIC];
        }
        else if (this.getDaiTokens().includes(tokenAddress)) {
            return ["DAI", "DAI Stablecoin", "18", constants_1.MainnetBridge.DAI];
        }
        else if (this.getUsdtTokens().includes(tokenAddress)) {
            return ["USDT", "Tether USD", "6", constants_1.MainnetBridge.USDT];
        }
        else if (this.getMagicTokens().includes(tokenAddress)) {
            return ["MAGIC", "MAGIC", "18", constants_1.MainnetBridge.MAGIC];
        }
        else if (this.getSnxTokens().includes(tokenAddress)) {
            return ["SNX", "SNX", "18", constants_1.MainnetBridge.SNX];
        }
        else if (this.getEthTokens().includes(tokenAddress)) {
            return ["ETH", "Ethereum", "18", constants_1.MainnetBridge.ETH];
        }
        else if (this.getsUSDTokens().includes(tokenAddress)) {
            return ["sUSD", "Synthetix Usd", "18", constants_1.MainnetBridge.sUSD];
        }
        else if (this.getRethTokens().includes(tokenAddress)) {
            return ["rETH", "Rocket Pool Ethereum", "18", constants_1.MainnetBridge.rETH];
        }
        else {
            graph_ts_1.log.critical("Token details not found", []);
            return [];
        }
    }
    getPoolDetails(poolAddress) {
        if (this.getUsdcPools().includes(poolAddress)) {
            return ["HOP-USDC", "hUSDC/USDC"];
        }
        else if (this.getMaticPools().includes(poolAddress)) {
            return ["HOP-MATIC", "hMATIC/MATIC"];
        }
        else if (this.getDaiPools().includes(poolAddress)) {
            return ["HOP-DAI", "hDAI/DAI"];
        }
        else if (this.getUsdtPools().includes(poolAddress)) {
            return ["HOP-USDT", "hUSDT/USDT"];
        }
        else if (this.getSnxPools().includes(poolAddress)) {
            return ["HOP-SNX", "hSNX/SNX"];
        }
        else if (this.getEthPools().includes(poolAddress)) {
            return ["HOP-ETH", "hETH/ETH"];
        }
        else if (this.getMagicPools().includes(poolAddress)) {
            return ["HOP-MAGIC", "hMAGIC/MAGIC"];
        }
        else if (this.getRethPools().includes(poolAddress)) {
            return ["HOP-rETH", "hrETH/ETH"];
        }
        else if (this.getsUSDPools().includes(poolAddress)) {
            return ["HOP-sUSD", "hsUSD/sUSD"];
        }
        else {
            graph_ts_1.log.critical("Pool not found", []);
            return [];
        }
    }
    getRewardTokenList() {
        return [];
    }
    getPoolAddressFromRewardTokenAddress(rewardToken) {
        return rewardToken;
    }
    getArbitrumNovaConfigFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.MainnetToken.ETH)
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
        else if (tokenAddress == constants_1.MainnetToken.MAGIC)
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
    getTokenAddressFromBridgeAddress(bridgeAddress) {
        if (bridgeAddress == constants_1.MainnetBridge.USDC)
            return [constants_1.MainnetToken.USDC];
        else if (bridgeAddress == constants_1.MainnetBridge.DAI)
            return [constants_1.MainnetToken.DAI];
        else if (bridgeAddress == constants_1.MainnetBridge.USDT)
            return [constants_1.MainnetToken.USDT];
        else if (bridgeAddress == constants_1.MainnetBridge.ETH)
            return [constants_1.MainnetToken.ETH];
        else if (bridgeAddress == constants_1.MainnetBridge.SNX)
            return [constants_1.MainnetToken.SNX];
        else if (bridgeAddress == constants_1.MainnetBridge.rETH)
            return [constants_1.MainnetToken.rETH];
        else if (bridgeAddress == constants_1.MainnetBridge.sUSD)
            return [constants_1.MainnetToken.sUSD];
        else if (bridgeAddress == constants_1.MainnetBridge.MATIC)
            return [constants_1.MainnetToken.MATIC];
        else if (bridgeAddress == constants_1.MainnetBridge.MAGIC)
            return [constants_1.MainnetToken.MAGIC];
        else {
            graph_ts_1.log.critical("Bridge not found", []);
            return [""];
        }
    }
    getArbitrumPoolAddressFromBridgeAddress(bridgeAddress) {
        if (bridgeAddress == constants_1.MainnetBridge.USDC)
            return constants_1.ArbitrumAmm.USDC;
        else if (bridgeAddress == constants_1.MainnetBridge.DAI)
            return constants_1.ArbitrumAmm.DAI;
        else if (bridgeAddress == constants_1.MainnetBridge.USDT)
            return constants_1.ArbitrumAmm.USDT;
        else if (bridgeAddress == constants_1.MainnetBridge.ETH)
            return constants_1.ArbitrumAmm.ETH;
        else if (bridgeAddress == constants_1.MainnetBridge.rETH)
            return constants_1.ArbitrumAmm.rETH;
        else if (bridgeAddress == constants_1.MainnetBridge.MAGIC)
            return constants_1.ArbitrumAmm.MAGIC;
        else {
            graph_ts_1.log.critical("Bridge not found", []);
            return "";
        }
    }
    getArbitrumNovaPoolAddressFromBridgeAddress(bridgeAddress) {
        if (bridgeAddress == constants_1.MainnetBridge.ETH)
            return constants_1.ArbitrumNovaAmm.ETH;
        else if (bridgeAddress == constants_1.MainnetBridge.MAGIC)
            return constants_1.ArbitrumNovaAmm.MAGIC;
        else {
            graph_ts_1.log.critical("Bridge not found", []);
            return "";
        }
    }
    getPolygonPoolAddressFromBridgeAddress(bridgeAddress) {
        if (bridgeAddress == constants_1.MainnetBridge.USDC)
            return constants_1.PolygonAmm.USDC;
        else if (bridgeAddress == constants_1.MainnetBridge.DAI)
            return constants_1.PolygonAmm.DAI;
        else if (bridgeAddress == constants_1.MainnetBridge.USDT)
            return constants_1.PolygonAmm.USDT;
        else if (bridgeAddress == constants_1.MainnetBridge.MATIC)
            return constants_1.PolygonAmm.MATIC;
        else if (bridgeAddress == constants_1.MainnetBridge.ETH)
            return constants_1.PolygonAmm.ETH;
        else {
            graph_ts_1.log.critical("Polygon Pool not found", []);
            return "";
        }
    }
    getXdaiPoolAddressFromBridgeAddress(bridgeAddress) {
        if (bridgeAddress == constants_1.MainnetBridge.USDC)
            return constants_1.XdaiAmm.USDC;
        else if (bridgeAddress == constants_1.MainnetBridge.DAI)
            return constants_1.XdaiAmm.DAI;
        else if (bridgeAddress == constants_1.MainnetBridge.USDT)
            return constants_1.XdaiAmm.USDT;
        else if (bridgeAddress == constants_1.MainnetBridge.ETH)
            return constants_1.XdaiAmm.ETH;
        else if (bridgeAddress == constants_1.MainnetBridge.MATIC)
            return constants_1.XdaiAmm.MATIC;
        else {
            graph_ts_1.log.critical("Xdai Pool not found", []);
            return "";
        }
    }
    getOptimismPoolAddressFromBridgeAddress(bridgeAddress) {
        if (bridgeAddress == constants_1.MainnetBridge.USDC)
            return constants_1.OptimismAmm.USDC;
        else if (bridgeAddress == constants_1.MainnetBridge.DAI)
            return constants_1.OptimismAmm.DAI;
        else if (bridgeAddress == constants_1.MainnetBridge.USDT)
            return constants_1.OptimismAmm.USDT;
        else if (bridgeAddress == constants_1.MainnetBridge.ETH)
            return constants_1.OptimismAmm.ETH;
        else if (bridgeAddress == constants_1.MainnetBridge.SNX)
            return constants_1.OptimismAmm.SNX;
        else if (bridgeAddress == constants_1.MainnetBridge.sUSD)
            return constants_1.OptimismAmm.sUSD;
        else if (bridgeAddress == constants_1.MainnetBridge.rETH)
            return constants_1.OptimismAmm.rETH;
        else {
            graph_ts_1.log.critical("Optimism Pool not found", []);
            return "";
        }
    }
    getBasePoolAddressFromBridgeAddress(bridgeAddress) {
        if (bridgeAddress == constants_1.MainnetBridge.USDC)
            return constants_1.BaseAmm.USDC;
        if (bridgeAddress == constants_1.MainnetBridge.ETH)
            return constants_1.BaseAmm.ETH;
        else {
            graph_ts_1.log.critical("Base Pool not found for bridge: {}", [bridgeAddress]);
            return "";
        }
    }
    getLineaPoolAddressFromBridgeAddress(bridgeAddress) {
        if (bridgeAddress == constants_1.MainnetBridge.ETH)
            return constants_1.LineaAmm.ETH;
        else {
            graph_ts_1.log.critical("Linea Pool not found for bridge: {}", [bridgeAddress]);
            return "";
        }
    }
    getPoolAddressFromChainId(chainId, bridgeAddress) {
        if (chainId == "42161") {
            return this.getArbitrumPoolAddressFromBridgeAddress(bridgeAddress); //Arbitrum
        }
        else if (chainId == "10") {
            return this.getOptimismPoolAddressFromBridgeAddress(bridgeAddress); //Optimism
        }
        else if (chainId == "100") {
            return this.getXdaiPoolAddressFromBridgeAddress(bridgeAddress); //Xdai
        }
        else if (chainId == "137") {
            return this.getPolygonPoolAddressFromBridgeAddress(bridgeAddress); //Polygon
        }
        else if (chainId == "42170") {
            return this.getArbitrumNovaPoolAddressFromBridgeAddress(bridgeAddress); //Arbitrum Nova
        }
        else if (chainId == "8453") {
            return this.getBasePoolAddressFromBridgeAddress(bridgeAddress); //Base
        }
        else if (chainId == "59144") {
            return this.getLineaPoolAddressFromBridgeAddress(bridgeAddress); //Linea
        }
        else {
            graph_ts_1.log.critical("Chain not found: {}", [chainId]);
            return "";
        }
    }
    getTokenList() {
        return [
            constants_1.MainnetToken.USDC,
            constants_1.MainnetToken.DAI,
            constants_1.MainnetToken.USDT,
            constants_1.MainnetToken.ETH,
            constants_1.MainnetToken.MATIC,
            constants_1.MainnetToken.SNX,
        ];
    }
    getUsdcPools() {
        return [
            constants_1.PolygonAmm.USDC,
            constants_1.XdaiAmm.USDC,
            constants_1.ArbitrumAmm.USDC,
            constants_1.OptimismAmm.USDC,
            constants_1.BaseAmm.USDC,
        ];
    }
    getUsdcTokens() {
        return [
            constants_1.PolygonToken.USDC,
            constants_1.XdaiToken.USDC,
            constants_1.ArbitrumToken.USDC,
            constants_1.OptimismToken.USDC,
            constants_1.MainnetToken.USDC,
            constants_1.BaseToken.USDC,
        ];
    }
    getDaiPools() {
        return [constants_1.PolygonAmm.DAI, constants_1.XdaiAmm.DAI, constants_1.ArbitrumAmm.DAI, constants_1.OptimismAmm.DAI];
    }
    getDaiTokens() {
        return [
            constants_1.PolygonToken.DAI,
            constants_1.XdaiToken.DAI,
            constants_1.ArbitrumToken.DAI,
            constants_1.MainnetToken.DAI,
            constants_1.OptimismToken.DAI,
        ];
    }
    getUsdtPools() {
        return [constants_1.PolygonAmm.USDT, constants_1.XdaiAmm.USDT, constants_1.ArbitrumAmm.USDT, constants_1.OptimismAmm.USDT];
    }
    getUsdtTokens() {
        return [
            constants_1.MainnetToken.USDT,
            constants_1.ArbitrumToken.USDT,
            constants_1.PolygonToken.USDT,
            constants_1.OptimismToken.USDT,
            constants_1.XdaiToken.USDT,
        ];
    }
    getEthPools() {
        return [
            constants_1.ArbitrumNovaAmm.ETH,
            constants_1.XdaiAmm.ETH,
            constants_1.ArbitrumAmm.ETH,
            constants_1.PolygonAmm.ETH,
            constants_1.OptimismAmm.ETH,
            constants_1.BaseAmm.ETH,
            constants_1.LineaAmm.ETH,
        ];
    }
    getEthTokens() {
        return [
            constants_1.MainnetToken.ETH,
            constants_1.XdaiToken.ETH,
            constants_1.ArbitrumToken.ETH,
            constants_1.PolygonToken.ETH,
            constants_1.OptimismToken.ETH,
            constants_1.ArbitrumNovaToken.ETH,
            constants_1.BaseToken.ETH,
            constants_1.LineaToken.ETH,
        ];
    }
    getSnxPools() {
        return [constants_1.OptimismAmm.SNX];
    }
    getSnxTokens() {
        return [constants_1.MainnetToken.SNX, constants_1.OptimismToken.SNX];
    }
    getRethPools() {
        return [constants_1.ArbitrumAmm.rETH, constants_1.OptimismAmm.rETH];
    }
    getRethTokens() {
        return [constants_1.MainnetToken.rETH, constants_1.OptimismToken.rETH, constants_1.ArbitrumToken.rETH];
    }
    getsUSDPools() {
        return [constants_1.OptimismAmm.sUSD];
    }
    getsUSDTokens() {
        return [constants_1.MainnetToken.sUSD, constants_1.OptimismToken.sUSD];
    }
    getMaticPools() {
        return [constants_1.PolygonAmm.MATIC, constants_1.XdaiAmm.MATIC];
    }
    getMaticTokens() {
        return [constants_1.PolygonToken.MATIC, constants_1.XdaiToken.MATIC, constants_1.MainnetToken.MATIC];
    }
    getMagicTokens() {
        return [constants_1.MainnetToken.MAGIC, constants_1.ArbitrumToken.MAGIC, constants_1.ArbitrumNovaToken.MAGIC];
    }
    getMagicPools() {
        return [constants_1.ArbitrumAmm.MAGIC, constants_1.ArbitrumNovaAmm.MAGIC];
    }
    getBridgeList() {
        return [
            constants_1.MainnetBridge.USDC,
            constants_1.MainnetBridge.DAI,
            constants_1.MainnetBridge.USDT,
            constants_1.MainnetBridge.ETH,
            constants_1.MainnetBridge.MATIC,
            constants_1.MainnetBridge.SNX,
            constants_1.MainnetBridge.rETH,
            constants_1.MainnetBridge.sUSD,
            constants_1.MainnetBridge.MAGIC,
        ];
    }
    getPoolsList() {
        return [];
    }
    getTokenAddressFromPoolAddress(poolAddress) {
        return [poolAddress];
    }
    getPoolAddressFromTokenAddress(tokenAddress) {
        return tokenAddress;
    }
    getPoolAddressFromBridgeAddress(bridgeAddress) {
        return bridgeAddress;
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
        if (tokenAddress == constants_1.MainnetToken.USDC)
            return constants_1.ArbitrumToken.USDC;
        else if (tokenAddress == constants_1.MainnetToken.DAI)
            return constants_1.ArbitrumToken.DAI;
        else if (tokenAddress == constants_1.MainnetToken.USDT)
            return constants_1.ArbitrumToken.USDT;
        else if (tokenAddress == constants_1.MainnetToken.ETH)
            return constants_1.ArbitrumToken.ETH;
        else if (tokenAddress == constants_1.MainnetToken.rETH)
            return constants_1.ArbitrumToken.rETH;
        else if (tokenAddress == constants_1.MainnetToken.MAGIC)
            return constants_1.ArbitrumToken.MAGIC;
        else {
            graph_ts_1.log.critical("Arb Crosstoken not found", []);
            return "";
        }
    }
    getPolygonCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.MainnetToken.USDC)
            return constants_1.PolygonToken.USDC;
        else if (tokenAddress == constants_1.MainnetToken.DAI)
            return constants_1.PolygonToken.DAI;
        else if (tokenAddress == constants_1.MainnetToken.USDT)
            return constants_1.PolygonToken.USDT;
        else if (tokenAddress == constants_1.MainnetToken.ETH)
            return constants_1.PolygonToken.ETH;
        else if (tokenAddress == constants_1.MainnetToken.MATIC)
            return constants_1.PolygonToken.MATIC;
        else {
            graph_ts_1.log.critical("Polygon Crosstoken not found", []);
            return "";
        }
    }
    getOptimismCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.MainnetToken.USDC)
            return constants_1.OptimismToken.USDC;
        else if (tokenAddress == constants_1.MainnetToken.DAI)
            return constants_1.OptimismToken.DAI;
        else if (tokenAddress == constants_1.MainnetToken.USDT)
            return constants_1.OptimismToken.USDT;
        else if (tokenAddress == constants_1.MainnetToken.ETH)
            return constants_1.OptimismToken.ETH;
        else if (tokenAddress == constants_1.MainnetToken.SNX)
            return constants_1.OptimismToken.SNX;
        else if (tokenAddress == constants_1.MainnetToken.rETH)
            return constants_1.OptimismToken.rETH;
        else if (tokenAddress == constants_1.MainnetToken.sUSD)
            return constants_1.OptimismToken.sUSD;
        else {
            graph_ts_1.log.critical("Optimism Crosstoken not found", []);
            return "";
        }
    }
    getXdaiCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.MainnetToken.USDC)
            return constants_1.XdaiToken.USDC;
        else if (tokenAddress == constants_1.MainnetToken.DAI)
            return constants_1.XdaiToken.DAI;
        else if (tokenAddress == constants_1.MainnetToken.USDT)
            return constants_1.XdaiToken.USDT;
        else if (tokenAddress == constants_1.MainnetToken.ETH)
            return constants_1.XdaiToken.ETH;
        else if (tokenAddress == constants_1.MainnetToken.MATIC)
            return constants_1.XdaiToken.MATIC;
        else {
            graph_ts_1.log.critical("Xdai Crosstoken not found", []);
            return "";
        }
    }
    getBaseCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.MainnetToken.USDC)
            return constants_1.BaseToken.USDC;
        if (tokenAddress == constants_1.MainnetToken.ETH)
            return constants_1.BaseToken.ETH;
        else {
            graph_ts_1.log.critical("Base CrossToken not found for token: {}", [tokenAddress]);
            return "";
        }
    }
    getLineaCrossTokenFromTokenAddress(tokenAddress) {
        if (tokenAddress == constants_1.MainnetToken.ETH)
            return constants_1.LineaToken.ETH;
        else {
            graph_ts_1.log.critical("Linea CrossToken not found for token: {}", [tokenAddress]);
            return "";
        }
    }
    getMainnetCrossTokenFromTokenAddress(tokenAddress) {
        graph_ts_1.log.critical("Mainnet cross token not found", []);
        return tokenAddress;
    }
}
exports.HopProtocolEthereumConfigurations = HopProtocolEthereumConfigurations;
