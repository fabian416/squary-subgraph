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
exports.getConfig = exports.getTokenSupply = exports.getTokenDecimals = exports.getTokenName = exports.readValue = exports.isNullAddress = void 0;
const BSC = __importStar(require("../config/bsc"));
const XDAI = __importStar(require("../config/gnosis"));
const AURORA = __importStar(require("../config/aurora"));
const FANTOM = __importStar(require("../config/fantom"));
const POLYGON = __importStar(require("../config/polygon"));
const MAINNET = __importStar(require("../config/mainnet"));
const HARMONY = __importStar(require("../config/harmony"));
const MOONBEAM = __importStar(require("../config/moonbeam"));
const OPTIMISM = __importStar(require("../config/optimism"));
const AVALANCHE = __importStar(require("../config/avalanche"));
const ARBITRUM_ONE = __importStar(require("../config/arbitrum"));
const constants = __importStar(require("./constants"));
const TEMPLATE = __importStar(require("../config/template"));
const _ERC20_1 = require("../../../generated/templates/LiquidityGauge/_ERC20");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function isNullAddress(tokenAddr) {
    return tokenAddr.equals(constants.NULL.TYPE_ADDRESS);
}
exports.isNullAddress = isNullAddress;
function readValue(callResult, defaultValue) {
    return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
function getTokenName(tokenAddr) {
    const tokenContract = _ERC20_1._ERC20.bind(tokenAddr);
    const name = readValue(tokenContract.try_name(), "");
    return name;
}
exports.getTokenName = getTokenName;
function getTokenDecimals(tokenAddr) {
    const tokenContract = _ERC20_1._ERC20.bind(tokenAddr);
    const decimals = readValue(tokenContract.try_decimals(), constants.DEFAULT_DECIMALS);
    return decimals;
}
exports.getTokenDecimals = getTokenDecimals;
function getTokenSupply(tokenAddr) {
    const tokenContract = _ERC20_1._ERC20.bind(tokenAddr);
    const totalSupply = readValue(tokenContract.try_totalSupply(), constants.BIGINT_ONE);
    return totalSupply;
}
exports.getTokenSupply = getTokenSupply;
function getConfig() {
    const network = graph_ts_1.dataSource.network();
    if (network == XDAI.NETWORK_STRING) {
        return new XDAI.config();
    }
    else if (network == AURORA.NETWORK_STRING) {
        return new AURORA.config();
    }
    else if (network == BSC.NETWORK_STRING) {
        return new BSC.config();
    }
    else if (network == FANTOM.NETWORK_STRING) {
        return new FANTOM.config();
    }
    else if (network == POLYGON.NETWORK_STRING) {
        return new POLYGON.config();
    }
    else if (network == MAINNET.NETWORK_STRING) {
        return new MAINNET.config();
    }
    else if (network == HARMONY.NETWORK_STRING) {
        return new HARMONY.config();
    }
    else if (network == MOONBEAM.NETWORK_STRING) {
        return new MOONBEAM.config();
    }
    else if (network == OPTIMISM.NETWORK_STRING) {
        return new OPTIMISM.config();
    }
    else if (network == AVALANCHE.NETWORK_STRING) {
        return new AVALANCHE.config();
    }
    else if (network == ARBITRUM_ONE.NETWORK_STRING) {
        return new ARBITRUM_ONE.config();
    }
    return new TEMPLATE.config();
}
exports.getConfig = getConfig;
