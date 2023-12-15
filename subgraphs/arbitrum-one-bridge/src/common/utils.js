"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bridgePoolType =
  exports.isArbToken =
  exports.ARB_L2_ADDRESS =
  exports.ARB_L1_ADDRESS =
  exports.ethAddress =
  exports.arbSideConf =
  exports.ethSideConf =
  exports.undoAlias =
  exports.TokenInit =
  exports.Pricer =
    void 0;
const numbers_1 = require("../sdk/util/numbers");
const prices_1 = require("../prices");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const _ERC20_1 = require("../../generated/ERC20Gateway/_ERC20");
const enums_1 = require("../sdk/protocols/bridge/enums");
const config_1 = require("../sdk/protocols/bridge/config");
const versions_1 = require("../versions");
const constants_1 = require("../sdk/util/constants");
const constants_2 = require("../prices/common/constants");
class Pricer {
  constructor(block) {
    this.block = block;
  }
  getTokenPrice(token) {
    if (
      tokenHasPriceIssue(graph_ts_1.Address.fromBytes(token.id).toHexString())
    ) {
      return constants_2.BIGDECIMAL_ZERO;
    }
    return (0, prices_1.getUsdPrice)(
      graph_ts_1.Address.fromBytes(token.id),
      constants_1.BIGDECIMAL_ONE,
      this.block
    );
  }
  getAmountValueUSD(token, amount) {
    if (
      tokenHasPriceIssue(graph_ts_1.Address.fromBytes(token.id).toHexString())
    ) {
      return constants_2.BIGDECIMAL_ZERO;
    }
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
function tokenHasPriceIssue(tokenAddress) {
  const TOKENS_WITH_PRICE_ISSUE = [
    "0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3",
    "0xd9a8bb44968f35282f1b91c353f77a61baf31a4b",
    "0x050cbff7bff0432b6096dd15cd9499913ddf8e23",
    "0xcfaf8edcea94ebaa080dc4983c3f9be5701d6613", // EXPO
  ];
  for (let i = 0; i < TOKENS_WITH_PRICE_ISSUE.length; i++) {
    if (TOKENS_WITH_PRICE_ISSUE[i] == tokenAddress) {
      return true;
    }
  }
  return false;
}
// See https://developer.arbitrum.io/arbos/l1-to-l2-messaging
function undoAlias(aliasAddress) {
  const ADDRESS_BIT_LENGTH = 160;
  // aliasAddress stuff; input is in little-endian, reverse addressBytes
  const aliasAddressBytes = graph_ts_1.Bytes.fromUint8Array(
    graph_ts_1.Bytes.fromHexString(
      aliasAddress.toHexString().slice(2)
    ).reverse()
  );
  const aliasAddressBigInt =
    graph_ts_1.BigInt.fromUnsignedBytes(aliasAddressBytes);
  // offsetAddress stuff
  const offsetBytes = graph_ts_1.Bytes.fromHexString(
    "0x1111000000000000000000000000000000001111"
  );
  const offsetBigInt = graph_ts_1.BigInt.fromUnsignedBytes(offsetBytes);
  // actualAddress stuff; aliasBigInt should never overflow
  const actualAddressBigInt = aliasAddressBigInt.minus(offsetBigInt);
  const actualAddress = asUintN(ADDRESS_BIT_LENGTH, actualAddressBigInt);
  return actualAddress;
}
exports.undoAlias = undoAlias;
function asUintN(bitLength, value) {
  const maxUintN = graph_ts_1.BigInt.fromI32(1)
    .leftShift(bitLength)
    .minus(graph_ts_1.BigInt.fromI32(1));
  // handle under/overflow behavior
  if (value < graph_ts_1.BigInt.fromI32(0)) {
    value = value.plus(maxUintN).plus(graph_ts_1.BigInt.fromI32(1));
  } else if (value > maxUintN) {
    value = value.minus(maxUintN).minus(graph_ts_1.BigInt.fromI32(1));
  }
  return (
    "0x" +
    value
      .toHexString()
      .slice(2)
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      .padStart(bitLength / 4, "0")
  );
}
// Note: Using one of the proxy admin contracts as bridge id
// ProxyAdmin 1 - 0x554723262467F125Ac9e1cDFa9Ce15cc53822dbD
// ProxyAdmin 2 - 0x9aD46fac0Cf7f790E5be05A0F15223935A0c0aDa
exports.ethSideConf = new config_1.BridgeConfig(
  "0x554723262467f125ac9e1cdfa9ce15cc53822dbd",
  "arbitrum-one",
  "arbitrum-one",
  enums_1.BridgePermissionType.WHITELIST,
  versions_1.Versions
);
exports.arbSideConf = new config_1.BridgeConfig(
  "0x0000000000000000000000000000000000000064",
  "arbitrum-one",
  "arbitrum-one",
  enums_1.BridgePermissionType.WHITELIST,
  versions_1.Versions
);
exports.ethAddress = graph_ts_1.Address.fromString(constants_1.ETH_ADDRESS);
// ARB Token Addresses
exports.ARB_L1_ADDRESS = graph_ts_1.Address.fromString(
  "0xb50721bcf8d664c30412cfbc6cf7a15145234ad1"
);
exports.ARB_L2_ADDRESS = graph_ts_1.Address.fromString(
  "0x912ce59144191c1204e64559fe8253a0e49e6548"
);
function isArbToken(inputTokenAddress) {
  if (
    inputTokenAddress == exports.ARB_L2_ADDRESS ||
    inputTokenAddress == exports.ARB_L1_ADDRESS
  ) {
    return true;
  }
  return false;
}
exports.isArbToken = isArbToken;
function bridgePoolType(isArbToken, network) {
  // separate conditionals for readability
  if (network === constants_1.Network.ARBITRUM_ONE && isArbToken) {
    return enums_1.BridgePoolType.LOCK_RELEASE;
  } else if (network === constants_1.Network.MAINNET && !isArbToken) {
    return enums_1.BridgePoolType.LOCK_RELEASE;
  }
  return enums_1.BridgePoolType.BURN_MINT;
}
exports.bridgePoolType = bridgePoolType;
