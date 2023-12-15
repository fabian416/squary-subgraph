"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rTOKEN_DECIMALS =
  exports.Protocol =
  exports.FLASHLOAN_PREMIUM_TOTAL =
  exports.RWETH_ADDRESS =
  exports.RDNT_WETH_Uniswap_Pair =
  exports.REWARD_TOKEN_ADDRESS =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
/////////////////////
///// Addresses /////
/////////////////////
exports.REWARD_TOKEN_ADDRESS = "0x0c4681e6c0235179ec3d4f4fc4df3d14fdd96017"; // RDNT token
exports.RDNT_WETH_Uniswap_Pair = "0x24704aff49645d32655a76df6d407e02d146dafc"; // RDNT/WETH
exports.RWETH_ADDRESS = "0x15b53d277af860f51c3e6843f8075007026bbb3a";
// This is hardcoded and can not be changed, so it is set as a constant here
// https://arbiscan.io/address/0xab843bec136e848fc47f0eb24902b61f158534d6#code#F1#L99
exports.FLASHLOAN_PREMIUM_TOTAL = graph_ts_1.BigDecimal.fromString("0.0009"); // = 9/10000
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
var Protocol;
(function (Protocol) {
  Protocol.PROTOCOL = "Radiant Capital";
  Protocol.NAME = "Radiant Capital";
  Protocol.SLUG = "radiant-capital";
  Protocol.PROTOCOL_ADDRESS = "0xe21b295ed46528efd5f3ef66e18bc6ad1c87f003"; // addresses provider
  Protocol.NETWORK = constants_1.Network.ARBITRUM_ONE;
})((Protocol = exports.Protocol || (exports.Protocol = {})));
// Number of decimals in which rToken oracle prices are returned.
exports.rTOKEN_DECIMALS = 8;
