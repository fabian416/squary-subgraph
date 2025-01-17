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
exports.WHITELIST_TOKENS_MAP = exports.CHAIN_LINK_CONTRACT_ADDRESS = exports.YEARN_LENS_CONTRACT_ADDRESS = exports.UNISWAP_ROUTER_CONTRACT_ADDRESSES = exports.UNISWAP_DEFAULT_RESERVE_CALL = exports.SUSHISWAP_ROUTER_ADDRESS_MAP = exports.SUSHISWAP_WETH_ADDRESS = exports.SUSHISWAP_CALCULATIONS_ADDRESS_MAP = exports.SUSHISWAP_DEFAULT_RESERVE_CALL = exports.CURVE_POOL_REGISTRY_ADDRESS_MAP = exports.CURVE_REGISTRY_ADDRESS_MAP = exports.CURVE_CALCULATIONS_ADDRESS_MAP = exports.WHITELIST_TOKENS_LIST = exports.CHAIN_LINK_USD_ADDRESS = exports.ZERO_ADDRESS = exports.ZERO_ADDRESS_STRING = exports.DEFAULT_DECIMALS = exports.DEFAULT_USDC_DECIMALS = exports.BIGDECIMAL_ZERO = exports.BIGINT_TEN_THOUSAND = exports.BIGINT_TEN = exports.BIGINT_ZERO = void 0;
const MAINNET = __importStar(require("../config/mainnet"));
const FANTOM = __importStar(require("../config/fantom"));
const ARBITRUM_ONE = __importStar(require("../config/arbitrumOne"));
const graph_ts_1 = require("@graphprotocol/graph-ts");
const UniswapPair_1 = require("../../../generated/templates/PoolRewards/UniswapPair");
const SushiSwapPair_1 = require("../../../generated/templates/PoolRewards/SushiSwapPair");
///////////////////////////////////////////////////////////////////////////
/////////////////////////////////// COMMON ////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.BIGINT_ZERO = graph_ts_1.BigInt.fromI32(0);
exports.BIGINT_TEN = graph_ts_1.BigInt.fromI32(10);
exports.BIGINT_TEN_THOUSAND = graph_ts_1.BigInt.fromI32(10000);
exports.BIGDECIMAL_ZERO = new graph_ts_1.BigDecimal(exports.BIGINT_ZERO);
exports.DEFAULT_USDC_DECIMALS = 6;
exports.DEFAULT_DECIMALS = graph_ts_1.BigInt.fromI32(18);
exports.ZERO_ADDRESS_STRING = "0x0000000000000000000000000000000000000000";
exports.ZERO_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000000");
exports.CHAIN_LINK_USD_ADDRESS = graph_ts_1.Address.fromString("0x0000000000000000000000000000000000000348");
exports.WHITELIST_TOKENS_LIST = [
    "WETH",
    "USDT",
    "DAI",
    "USDC",
    "ETH",
    "WBTC",
    "EURS",
    "LINK",
    "gfUSDT",
    "WFTM",
    "fBTC",
    "FRAX",
    "CRV",
];
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CURVE CONTRACT //////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CURVE_CALCULATIONS_ADDRESS_MAP = new graph_ts_1.TypedMap();
exports.CURVE_CALCULATIONS_ADDRESS_MAP.set(MAINNET.NETWORK_STRING, MAINNET.CURVE_CALCULATIONS_ADDRESS);
exports.CURVE_CALCULATIONS_ADDRESS_MAP.set(FANTOM.NETWORK_STRING, FANTOM.CURVE_CALCULATIONS_ADDRESS);
exports.CURVE_CALCULATIONS_ADDRESS_MAP.set(ARBITRUM_ONE.NETWORK_STRING, ARBITRUM_ONE.CURVE_CALCULATIONS_ADDRESS);
exports.CURVE_REGISTRY_ADDRESS_MAP = new graph_ts_1.TypedMap();
exports.CURVE_REGISTRY_ADDRESS_MAP.set(MAINNET.NETWORK_STRING, MAINNET.CURVE_REGISTRY_ADDRESS);
exports.CURVE_REGISTRY_ADDRESS_MAP.set(FANTOM.NETWORK_STRING, FANTOM.CURVE_REGISTRY_ADDRESS);
exports.CURVE_REGISTRY_ADDRESS_MAP.set(ARBITRUM_ONE.NETWORK_STRING, ARBITRUM_ONE.CURVE_REGISTRY_ADDRESS);
exports.CURVE_POOL_REGISTRY_ADDRESS_MAP = new graph_ts_1.TypedMap();
exports.CURVE_POOL_REGISTRY_ADDRESS_MAP.set(MAINNET.NETWORK_STRING, MAINNET.CURVE_POOL_REGISTRY_ADDRESS);
exports.CURVE_POOL_REGISTRY_ADDRESS_MAP.set(FANTOM.NETWORK_STRING, FANTOM.CURVE_POOL_REGISTRY_ADDRESS);
exports.CURVE_POOL_REGISTRY_ADDRESS_MAP.set(ARBITRUM_ONE.NETWORK_STRING, ARBITRUM_ONE.CURVE_POOL_REGISTRY_ADDRESS);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// SUSHISWAP CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.SUSHISWAP_DEFAULT_RESERVE_CALL = new SushiSwapPair_1.SushiSwapPair__getReservesResult(exports.BIGINT_ZERO, exports.BIGINT_ZERO, exports.BIGINT_ZERO);
exports.SUSHISWAP_CALCULATIONS_ADDRESS_MAP = new graph_ts_1.TypedMap();
exports.SUSHISWAP_CALCULATIONS_ADDRESS_MAP.set(MAINNET.NETWORK_STRING, MAINNET.SUSHISWAP_CALCULATIONS_ADDRESS);
exports.SUSHISWAP_CALCULATIONS_ADDRESS_MAP.set(FANTOM.NETWORK_STRING, FANTOM.SUSHISWAP_CALCULATIONS_ADDRESS);
exports.SUSHISWAP_CALCULATIONS_ADDRESS_MAP.set(ARBITRUM_ONE.NETWORK_STRING, ARBITRUM_ONE.SUSHISWAP_CALCULATIONS_ADDRESS);
exports.SUSHISWAP_WETH_ADDRESS = new graph_ts_1.TypedMap();
exports.SUSHISWAP_WETH_ADDRESS.set(MAINNET.NETWORK_STRING, MAINNET.SUSHISWAP_WETH_ADDRESS);
exports.SUSHISWAP_WETH_ADDRESS.set(FANTOM.NETWORK_STRING, FANTOM.SUSHISWAP_WETH_ADDRESS);
exports.SUSHISWAP_WETH_ADDRESS.set(ARBITRUM_ONE.NETWORK_STRING, ARBITRUM_ONE.SUSHISWAP_WETH_ADDRESS);
exports.SUSHISWAP_ROUTER_ADDRESS_MAP = new graph_ts_1.TypedMap();
exports.SUSHISWAP_ROUTER_ADDRESS_MAP.set(MAINNET.NETWORK_STRING, MAINNET.SUSHISWAP_ROUTER_ADDRESS);
exports.SUSHISWAP_ROUTER_ADDRESS_MAP.set(FANTOM.NETWORK_STRING, FANTOM.SUSHISWAP_ROUTER_ADDRESS);
exports.SUSHISWAP_ROUTER_ADDRESS_MAP.set(ARBITRUM_ONE.NETWORK_STRING, ARBITRUM_ONE.SUSHISWAP_ROUTER_ADDRESS);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// UNISWAP CONTRACT ////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.UNISWAP_DEFAULT_RESERVE_CALL = new UniswapPair_1.UniswapPair__getReservesResult(exports.BIGINT_ZERO, exports.BIGINT_ZERO, exports.BIGINT_ZERO);
exports.UNISWAP_ROUTER_CONTRACT_ADDRESSES = new graph_ts_1.TypedMap();
exports.UNISWAP_ROUTER_CONTRACT_ADDRESSES.set(MAINNET.NETWORK_STRING, MAINNET.UNISWAP_ROUTER_ADDRESS);
exports.UNISWAP_ROUTER_CONTRACT_ADDRESSES.set(FANTOM.NETWORK_STRING, FANTOM.SPOOKY_SWAP_ROUTER_ADDRESS);
exports.UNISWAP_ROUTER_CONTRACT_ADDRESSES.set(ARBITRUM_ONE.NETWORK_STRING, ARBITRUM_ONE.UNISWAP_ROUTER_ADDRESS);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// YEARNLENS CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.YEARN_LENS_CONTRACT_ADDRESS = new Map();
exports.YEARN_LENS_CONTRACT_ADDRESS.set(MAINNET.NETWORK_STRING, MAINNET.YEARN_LENS_CONTRACT_ADDRESS);
exports.YEARN_LENS_CONTRACT_ADDRESS.set(FANTOM.NETWORK_STRING, FANTOM.YEARN_LENS_CONTRACT_ADDRESS);
exports.YEARN_LENS_CONTRACT_ADDRESS.set(ARBITRUM_ONE.NETWORK_STRING, ARBITRUM_ONE.YEARN_LENS_CONTRACT_ADDRESS);
///////////////////////////////////////////////////////////////////////////
///////////////////////////// CHAINLINK CONTRACT //////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.CHAIN_LINK_CONTRACT_ADDRESS = new Map();
exports.CHAIN_LINK_CONTRACT_ADDRESS.set(MAINNET.NETWORK_STRING, MAINNET.CHAIN_LINK_CONTRACT_ADDRESS);
exports.CHAIN_LINK_CONTRACT_ADDRESS.set(FANTOM.NETWORK_STRING, FANTOM.CHAIN_LINK_CONTRACT_ADDRESS);
exports.CHAIN_LINK_CONTRACT_ADDRESS.set(ARBITRUM_ONE.NETWORK_STRING, ARBITRUM_ONE.CHAIN_LINK_CONTRACT_ADDRESS);
///////////////////////////////////////////////////////////////////////////
///////////////////////////////// HELPERS /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
exports.WHITELIST_TOKENS_MAP = new graph_ts_1.TypedMap();
exports.WHITELIST_TOKENS_MAP.set(MAINNET.NETWORK_STRING, MAINNET.WHITELIST_TOKENS);
exports.WHITELIST_TOKENS_MAP.set(FANTOM.NETWORK_STRING, FANTOM.WHITELIST_TOKENS);
exports.WHITELIST_TOKENS_MAP.set(ARBITRUM_ONE.NETWORK_STRING, ARBITRUM_ONE.WHITELIST_TOKENS);
