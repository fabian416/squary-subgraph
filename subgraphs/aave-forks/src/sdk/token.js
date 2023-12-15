"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticTokenDefinition = exports.TokenManager = void 0;
const ERC20_1 = require("../../generated/LendingPool/ERC20");
const ERC20SymbolBytes_1 = require("../../generated/LendingPool/ERC20SymbolBytes");
const ERC20NameBytes_1 = require("../../generated/LendingPool/ERC20NameBytes");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const constants_1 = require("./constants");
/**
 * This file contains the TokenClass, which acts as
 * a wrapper for the Token entity making it easier to
 * use in mappings and get info about the token.
 *
 * Schema Version:  3.1.1
 * SDK Version:     1.0.8
 * Author(s):
 *  - @melotik
 *  - @dhruv-chauhan
 */
class TokenManager {
  constructor(tokenAddress, event, tokenType = null) {
    this.INVALID_TOKEN_DECIMALS = 0;
    this.UNKNOWN_TOKEN_VALUE = "unknown";
    let _token = schema_1.Token.load(tokenAddress);
    if (!_token) {
      _token = new schema_1.Token(tokenAddress);
      _token.name = this.fetchTokenName(
        graph_ts_1.Address.fromBytes(tokenAddress)
      );
      _token.symbol = this.fetchTokenSymbol(
        graph_ts_1.Address.fromBytes(tokenAddress)
      );
      _token.decimals = this.fetchTokenDecimals(
        graph_ts_1.Address.fromBytes(tokenAddress)
      );
      if (tokenType) {
        _token.type = tokenType;
      }
      _token.save();
    }
    this.token = _token;
    this.event = event;
  }
  getToken() {
    return this.token;
  }
  getDecimals() {
    return this.token.decimals;
  }
  _getName() {
    return this.token.name;
  }
  updatePrice(newPriceUSD) {
    this.token.lastPriceBlockNumber = this.event.block.number;
    this.token.lastPriceUSD = newPriceUSD;
    this.token.save();
  }
  getPriceUSD() {
    if (this.token.lastPriceUSD) {
      return this.token.lastPriceUSD;
    }
    return constants_1.BIGDECIMAL_ZERO;
  }
  // convert token amount to USD value
  getAmountUSD(amount) {
    return amount
      .toBigDecimal()
      .div((0, constants_1.exponentToBigDecimal)(this.getDecimals()))
      .times(this.getPriceUSD());
  }
  ////////////////////
  ///// Creators /////
  ////////////////////
  getOrCreateRewardToken(rewardTokenType) {
    const rewardTokenID = rewardTokenType
      .concat("-")
      .concat(this.token.id.toHexString());
    let rewardToken = schema_1.RewardToken.load(rewardTokenID);
    if (!rewardToken) {
      rewardToken = new schema_1.RewardToken(rewardTokenID);
      rewardToken.token = this.token.id;
      rewardToken.type = rewardTokenType;
      rewardToken.save();
    }
    return rewardToken;
  }
  fetchTokenSymbol(tokenAddress) {
    const contract = ERC20_1.ERC20.bind(tokenAddress);
    const contractSymbolBytes =
      ERC20SymbolBytes_1.ERC20SymbolBytes.bind(tokenAddress);
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
      } else {
        // try with the static definition
        const staticTokenDefinition =
          StaticTokenDefinition.fromAddress(tokenAddress);
        if (staticTokenDefinition != null) {
          symbolValue = staticTokenDefinition.symbol;
        }
      }
    }
    return symbolValue;
  }
  fetchTokenName(tokenAddress) {
    const contract = ERC20_1.ERC20.bind(tokenAddress);
    const contractNameBytes =
      ERC20NameBytes_1.ERC20NameBytes.bind(tokenAddress);
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
      } else {
        // try with the static definition
        const staticTokenDefinition =
          StaticTokenDefinition.fromAddress(tokenAddress);
        if (staticTokenDefinition != null) {
          nameValue = staticTokenDefinition.name;
        }
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
    // try with the static definition
    const staticTokenDefinition =
      StaticTokenDefinition.fromAddress(tokenAddress);
    if (staticTokenDefinition != null) {
      return staticTokenDefinition.decimals;
    } else {
      return this.INVALID_TOKEN_DECIMALS;
    }
  }
  isNullEthValue(value) {
    return (
      value ==
      "0x0000000000000000000000000000000000000000000000000000000000000001"
    );
  }
}
exports.TokenManager = TokenManager;
// Initialize a Token Definition with the attributes
class StaticTokenDefinition {
  // Initialize a Token Definition with its attributes
  constructor(address, symbol, name, decimals) {
    this.address = address;
    this.symbol = symbol;
    this.name = name;
    this.decimals = decimals;
  }
  // Get all tokens with a static defintion
  static getStaticDefinitions() {
    // https://thegraph.com/docs/en/release-notes/assemblyscript-migration-guide/#array-initialization
    const staticDefinitions = new Array(constants_1.INT_ZERO);
    // Add DGD
    const tokenDGD = new StaticTokenDefinition(
      graph_ts_1.Address.fromString(
        "0xe0b7927c4af23765cb51314a0e0521a9645f0e2a"
      ),
      "DGD",
      "DGD",
      constants_1.INT_NINE
    );
    staticDefinitions.push(tokenDGD);
    // Add AAVE
    const tokenAAVE = new StaticTokenDefinition(
      graph_ts_1.Address.fromString(
        "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9"
      ),
      "AAVE",
      "Aave Token",
      constants_1.INT_EIGHTTEEN
    );
    staticDefinitions.push(tokenAAVE);
    // Add LIF
    const tokenLIF = new StaticTokenDefinition(
      graph_ts_1.Address.fromString(
        "0xeb9951021698b42e4399f9cbb6267aa35f82d59d"
      ),
      "LIF",
      "Lif",
      constants_1.INT_EIGHTTEEN
    );
    staticDefinitions.push(tokenLIF);
    // Add SVD
    const tokenSVD = new StaticTokenDefinition(
      graph_ts_1.Address.fromString(
        "0xbdeb4b83251fb146687fa19d1c660f99411eefe3"
      ),
      "SVD",
      "savedroid",
      constants_1.INT_EIGHTTEEN
    );
    staticDefinitions.push(tokenSVD);
    // Add TheDAO
    const tokenTheDAO = new StaticTokenDefinition(
      graph_ts_1.Address.fromString(
        "0xbb9bc244d798123fde783fcc1c72d3bb8c189413"
      ),
      "TheDAO",
      "TheDAO",
      constants_1.INT_SIXTEEN
    );
    staticDefinitions.push(tokenTheDAO);
    // Add HPB
    const tokenHPB = new StaticTokenDefinition(
      graph_ts_1.Address.fromString(
        "0x38c6a68304cdefb9bec48bbfaaba5c5b47818bb2"
      ),
      "HPB",
      "HPBCoin",
      constants_1.INT_EIGHTTEEN
    );
    staticDefinitions.push(tokenHPB);
    return staticDefinitions;
  }
  // Helper for hardcoded tokens
  static fromAddress(tokenAddress) {
    const staticDefinitions = this.getStaticDefinitions();
    // Search the definition using the address
    for (let i = 0; i < staticDefinitions.length; i++) {
      const staticDefinition = staticDefinitions[i];
      if (staticDefinition.address == tokenAddress) {
        return staticDefinition;
      }
    }
    // If not found, return null
    return null;
  }
}
exports.StaticTokenDefinition = StaticTokenDefinition;
