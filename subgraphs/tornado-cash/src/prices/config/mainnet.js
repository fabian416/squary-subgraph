"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WHITELIST_TOKENS = exports.USDC_DECIMALS = exports.UNISWAP_cDAI_CONTRACT_ADDRESS = exports.UNISWAP_USDC_CONTRACT_ADDRESS = exports.UNISWAP_DAI_CONTRACT_ADDRESS = exports.CHAIN_LINK_CONTRACT_ADDRESS = exports.YEARN_LENS_CONTRACT_ADDRESS = exports.UNISWAP_PATH_OVERRIDE = exports.UNISWAP_ROUTER_ADDRESS = exports.SUSHISWAP_ROUTER_ADDRESS = exports.SUSHISWAP_WETH_ADDRESS = exports.SUSHISWAP_CALCULATIONS_ADDRESS = exports.CURVE_POOL_REGISTRY_ADDRESS = exports.CURVE_REGISTRY_ADDRESS = exports.CURVE_CALCULATIONS_ADDRESS = exports.NETWORK_STRING = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
exports.NETWORK_STRING = "mainnet";
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0x25BF7b72815476Dd515044F9650Bf79bAd0Df655");
exports.CURVE_REGISTRY_ADDRESS = graph_ts_1.Address.fromString("0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c");
exports.CURVE_POOL_REGISTRY_ADDRESS = graph_ts_1.Address.fromString("0x8F942C20D02bEfc377D41445793068908E2250D0");
///////////////////////////////////////////////////////////////////////////
///////////////////////////// SUSHISWAP CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.SUSHISWAP_CALCULATIONS_ADDRESS = graph_ts_1.Address.fromString("0x8263e161A855B644f582d9C164C66aABEe53f927");
exports.SUSHISWAP_WETH_ADDRESS = graph_ts_1.Address.fromString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
exports.SUSHISWAP_ROUTER_ADDRESS = new graph_ts_1.TypedMap();
exports.SUSHISWAP_ROUTER_ADDRESS.set("routerV1", graph_ts_1.Address.fromString("0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"));
exports.SUSHISWAP_ROUTER_ADDRESS.set("routerV2", graph_ts_1.Address.fromString("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"));
///////////////////////////////////////////////////////////////////////////
///////////////////////////// UNISWAP CONTRACT ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_ROUTER_ADDRESS = new graph_ts_1.TypedMap();
exports.UNISWAP_ROUTER_ADDRESS.set("routerV1", graph_ts_1.Address.fromString("0x7a250d5630b4cf539739df2c5dacb4c659f2488d"));
exports.UNISWAP_ROUTER_ADDRESS.set("routerV2", graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000"));
exports.UNISWAP_PATH_OVERRIDE = new graph_ts_1.TypedMap();
///////////////////////////////////////////////////////////////////////////
///////////////////////////// YEARNLENS CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_CONTRACT_ADDRESS = "0x83d95e0d5f402511db06817aff3f9ea88224b030";
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CHAINLINK CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CHAIN_LINK_CONTRACT_ADDRESS = graph_ts_1.Address.fromString("0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf");
///////////////////////////////////////////////////////////////////////////
/////////////////////////// UNISWAP V1 CONTRACT ///////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_DAI_CONTRACT_ADDRESS = graph_ts_1.Address.fromString("0x2a1530C4C41db0B0b2bB646CB5Eb1A67b7158667");
exports.UNISWAP_USDC_CONTRACT_ADDRESS = graph_ts_1.Address.fromString("0x97deC872013f6B5fB443861090ad931542878126");
exports.UNISWAP_cDAI_CONTRACT_ADDRESS = graph_ts_1.Address.fromString("0x34E89740adF97C3A9D3f63Cc2cE4a914382c230b");
///////////////////////////////////////////////////////////////////////////
///////////////////////////////// HELPERS /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.USDC_DECIMALS = graph_ts_1.BigInt.fromI32(6);
exports.WHITELIST_TOKENS = new graph_ts_1.TypedMap();
exports.WHITELIST_TOKENS.set("WETH", graph_ts_1.Address.fromString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"));
exports.WHITELIST_TOKENS.set("USDT", graph_ts_1.Address.fromString("0xdac17f958d2ee523a2206206994597c13d831ec7"));
exports.WHITELIST_TOKENS.set("DAI", graph_ts_1.Address.fromString("0x6b175474e89094c44da98b954eedeac495271d0f"));
exports.WHITELIST_TOKENS.set("USDC", graph_ts_1.Address.fromString("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"));
exports.WHITELIST_TOKENS.set("ETH", graph_ts_1.Address.fromString("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"));
exports.WHITELIST_TOKENS.set("WBTC", graph_ts_1.Address.fromString("0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"));
exports.WHITELIST_TOKENS.set("EURS", graph_ts_1.Address.fromString("0xdB25f211AB05b1c97D595516F45794528a807ad8"));
exports.WHITELIST_TOKENS.set("LINK", graph_ts_1.Address.fromString("0x514910771AF9Ca656af840dff83E8264EcF986CA"));
exports.WHITELIST_TOKENS.set("cDAI", graph_ts_1.Address.fromString("0x5d3a536e4d6dbd6114cc1ead35777bab948e3643"));
