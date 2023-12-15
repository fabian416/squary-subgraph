"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAINNET_BRIDGE_CONFIG =
  exports.DEPLOYER_BRIDGE_CONFIG =
  exports.ACROSS_PROTOCOL_DEPLOYER_CONTRACT =
  exports.ACROSS_ACCELERATING_DISTRIBUTOR_CONTRACT =
  exports.ACROSS_REWARD_TOKEN =
  exports.ACROSS_HUB_POOL_CONTRACT =
  exports.ACROSS_PROTOCOL_NAME =
  exports.getTokenBalance =
  exports.TokenInit =
  exports.Pricer =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const _ERC20_1 = require("../generated/SpokePool1/_ERC20");
const prices_1 = require("./prices");
const numbers_1 = require("./sdk/util/numbers");
const constants_1 = require("./sdk/util/constants");
const constants_2 = require("./prices/common/constants");
const enums_1 = require("./sdk/protocols/bridge/enums");
const config_1 = require("./sdk/protocols/bridge/config");
const versions_1 = require("./versions");
class Pricer {
  constructor(block) {
    this.block = block;
  }
  getTokenPrice(token) {
    const price = (0, prices_1.getUsdPricePerToken)(
      graph_ts_1.Address.fromBytes(token.id),
      this.block
    );
    return price.usdPrice;
  }
  getAmountValueUSD(token, amount) {
    const _amount = (0, numbers_1.bigIntToBigDecimal)(amount, token.decimals);
    return (0, prices_1.getUsdPrice)(
      graph_ts_1.Address.fromBytes(token.id),
      _amount,
      this.block
    );
  }
}
exports.Pricer = Pricer;
class TokenInit {
  getTokenParams(address) {
    let name;
    let symbol;
    let decimals;
    if (address == graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS)) {
      name = constants_1.ETH_NAME;
      symbol = constants_1.ETH_SYMBOL;
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      decimals = 18;
    } else {
      name = this.fetchTokenName(address);
      symbol = this.fetchTokenSymbol(address);
      decimals = this.fetchTokenDecimals(address);
    }
    return {
      name,
      symbol,
      decimals,
    };
  }
  fetchTokenName(tokenAddress) {
    const tokenContract = _ERC20_1._ERC20.bind(tokenAddress);
    const call = tokenContract.try_name();
    if (call.reverted) {
      return tokenAddress.toHexString();
    } else {
      return call.value;
    }
  }
  fetchTokenSymbol(tokenAddress) {
    const tokenContract = _ERC20_1._ERC20.bind(tokenAddress);
    const call = tokenContract.try_symbol();
    if (call.reverted) {
      return " ";
    } else {
      return call.value;
    }
  }
  fetchTokenDecimals(tokenAddress) {
    const tokenContract = _ERC20_1._ERC20.bind(tokenAddress);
    const call = tokenContract.try_decimals();
    if (call.reverted) {
      return 0;
    } else {
      return call.value.toI32();
    }
  }
}
exports.TokenInit = TokenInit;
// TVL
function getTokenBalance(tokenAddress, gatewayAddress) {
  let inputTokenBalance = constants_2.BIGINT_ZERO;
  const erc20 = _ERC20_1._ERC20.bind(tokenAddress);
  const inputTokenBalanceResult = erc20.try_balanceOf(gatewayAddress);
  if (inputTokenBalanceResult.reverted) {
    graph_ts_1.log.critical(
      "[ERC20:balanceOf()] calculate token balance owned by bridge contract reverted",
      []
    );
  } else {
    inputTokenBalance = inputTokenBalanceResult.value;
  }
  return inputTokenBalance;
}
exports.getTokenBalance = getTokenBalance;
// Constants
exports.ACROSS_PROTOCOL_NAME = "across-v2";
exports.ACROSS_HUB_POOL_CONTRACT = "0xc186fa914353c44b2e33ebe05f21846f1048beda";
exports.ACROSS_REWARD_TOKEN = "0x44108f0223a3c3028f5fe7aec7f9bb2e66bef82f";
exports.ACROSS_ACCELERATING_DISTRIBUTOR_CONTRACT =
  "0x9040e41ef5e8b281535a96d9a48acb8cfabd9a48";
exports.ACROSS_PROTOCOL_DEPLOYER_CONTRACT =
  "0x9a8f92a830a5cb89a3816e3d267cb7791c16b04d";
// Use ACROSS_PROTOCOL_DEPLOYER_CONTRACT to unify
// all activity from different SpokePools on a chain
exports.DEPLOYER_BRIDGE_CONFIG = new config_1.BridgeConfig(
  exports.ACROSS_PROTOCOL_DEPLOYER_CONTRACT,
  exports.ACROSS_PROTOCOL_NAME,
  exports.ACROSS_PROTOCOL_NAME,
  enums_1.BridgePermissionType.WHITELIST,
  versions_1.Versions
);
// Use ACROSS_HUB_POOL_CONTRACT to manage all
// liquidity and staking related activity
exports.MAINNET_BRIDGE_CONFIG = new config_1.BridgeConfig(
  exports.ACROSS_HUB_POOL_CONTRACT,
  exports.ACROSS_PROTOCOL_NAME,
  exports.ACROSS_PROTOCOL_NAME,
  enums_1.BridgePermissionType.WHITELIST,
  versions_1.Versions
);
