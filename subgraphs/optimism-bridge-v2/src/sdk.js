"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSDK = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ERC20_1 = require("../generated/templates/Bridge/ERC20");
const ERC20NameBytes_1 = require("../generated/templates/Bridge/ERC20NameBytes");
const ERC20SymbolBytes_1 = require("../generated/templates/Bridge/ERC20SymbolBytes");
const constants_1 = require("./constants");
const prices_1 = require("./prices");
const bridge_1 = require("./sdk/protocols/bridge");
const config_1 = require("./sdk/protocols/bridge/config");
const enums_1 = require("./sdk/protocols/bridge/enums");
const constants_2 = require("./sdk/util/constants");
const numbers_1 = require("./sdk/util/numbers");
const versions_1 = require("./versions");
const conf = new config_1.BridgeConfig(constants_1.BRIDGE_ADDRESS.get(graph_ts_1.dataSource.network().toUpperCase()), "Optimism Bridge V2", "optimism-bridge-v2", enums_1.BridgePermissionType.WHITELIST, versions_1.Versions);
class Pricer {
    getTokenPrice(token) {
        let address = graph_ts_1.Address.fromBytes(token.id);
        // Use WETH address to get ETH price
        if (address == graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS_OPTIMISM)) {
            address = graph_ts_1.Address.fromString(constants_1.WETH_ADDRESS_OPTIMISM);
        }
        return (0, prices_1.getUsdPrice)(address, constants_2.BIGDECIMAL_ONE);
    }
    getAmountValueUSD(token, amount) {
        let address = graph_ts_1.Address.fromBytes(token.id);
        // Use WETH address to get ETH price
        if (address == graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS_OPTIMISM)) {
            address = graph_ts_1.Address.fromString(constants_1.WETH_ADDRESS_OPTIMISM);
        }
        const _amount = (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals);
        return (0, prices_1.getUsdPrice)(address, _amount);
    }
}
class TokenInit {
    constructor() {
        this.INVALID_TOKEN_DECIMALS = 0;
        this.UNKNOWN_TOKEN_VALUE = "unknown";
    }
    getTokenParams(address) {
        if (address == graph_ts_1.Address.fromString(constants_2.ETH_ADDRESS)) {
            const name = constants_2.ETH_NAME;
            const symbol = constants_2.ETH_SYMBOL;
            const decimals = 18;
            return {
                name,
                symbol,
                decimals,
            };
        }
        const name = this.fetchTokenName(address);
        const symbol = this.fetchTokenSymbol(address);
        const decimals = this.fetchTokenDecimals(address);
        return {
            name,
            symbol,
            decimals,
        };
    }
    fetchTokenSymbol(tokenAddress) {
        const contract = ERC20_1.ERC20.bind(tokenAddress);
        const contractSymbolBytes = ERC20SymbolBytes_1.ERC20SymbolBytes.bind(tokenAddress);
        // try types string and bytes32 for symbol
        let symbolValue = this.UNKNOWN_TOKEN_VALUE;
        const symbolResult = contract.try_symbol();
        if (!symbolResult.reverted) {
            return symbolResult.value;
        }
        // non-standard ERC20 implementation
        const symbolResultBytes = contractSymbolBytes.try_symbol();
        if (!symbolResultBytes.reverted) {
            // for broken pairs that have no symbol function exposed
            if (!this.isNullEthValue(symbolResultBytes.value.toHexString())) {
                symbolValue = symbolResultBytes.value.toString();
            }
        }
        return symbolValue;
    }
    fetchTokenName(tokenAddress) {
        const contract = ERC20_1.ERC20.bind(tokenAddress);
        const contractNameBytes = ERC20NameBytes_1.ERC20NameBytes.bind(tokenAddress);
        // try types string and bytes32 for name
        let nameValue = this.UNKNOWN_TOKEN_VALUE;
        const nameResult = contract.try_name();
        if (!nameResult.reverted) {
            return nameResult.value;
        }
        // non-standard ERC20 implementation
        const nameResultBytes = contractNameBytes.try_name();
        if (!nameResultBytes.reverted) {
            // for broken exchanges that have no name function exposed
            if (!this.isNullEthValue(nameResultBytes.value.toHexString())) {
                nameValue = nameResultBytes.value.toString();
            }
        }
        return nameValue;
    }
    fetchTokenDecimals(tokenAddress) {
        const contract = ERC20_1.ERC20.bind(tokenAddress);
        // try types uint8 for decimals
        const decimalResult = contract.try_decimals();
        if (!decimalResult.reverted) {
            const decimalValue = decimalResult.value;
            return decimalValue;
        }
        return this.INVALID_TOKEN_DECIMALS;
    }
    isNullEthValue(value) {
        return (value ==
            "0x0000000000000000000000000000000000000000000000000000000000000001");
    }
}
function getSDK(event) {
    return bridge_1.SDK.initialize(conf, new Pricer(), new TokenInit(), event);
}
exports.getSDK = getSDK;
