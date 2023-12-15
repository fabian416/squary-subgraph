"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equalsIgnoreCase =
  exports.Protocol =
  exports.FLASHLOAN_PREMIUM_TOTAL =
  exports.CRV_FTM_LP_ADDRESS =
  exports.CRV_ADDRESS =
  exports.GFTM_ADDRESS =
  exports.GEIST_FTM_LP_ADDRESS =
  exports.REWARD_TOKEN_ADDRESS =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/constants");
/////////////////////
///// Addresses /////
/////////////////////
exports.REWARD_TOKEN_ADDRESS = "0xd8321aa83fb0a4ecd6348d4577431310a6e0814d"; // GEIST token
exports.GEIST_FTM_LP_ADDRESS = "0x668ae94d0870230ac007a01b471d02b2c94ddcb9";
exports.GFTM_ADDRESS = "0x39b3bd37208cbade74d0fcbdbb12d606295b430a";
exports.CRV_ADDRESS = "0x1e4f97b9f9f913c46f1632781732927b9019c68b"; // also gCRV market id
exports.CRV_FTM_LP_ADDRESS = "0xb471ac6ef617e952b84c6a9ff5de65a9da96c93b";
// This is hardcoded and can not be changed, so it is set as a constant here
// https://ftmscan.com/address/0x3104ad2aadb6fe9df166948a5e3a547004862f90#code#L3666
exports.FLASHLOAN_PREMIUM_TOTAL = graph_ts_1.BigDecimal.fromString("0.0009"); // = 9/10000
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
var Protocol;
(function (Protocol) {
  Protocol.PROTOCOL = "Geist Finance";
  Protocol.NAME = "Geist Finance";
  Protocol.SLUG = "geist-finance";
  Protocol.PROTOCOL_ADDRESS = "0x6c793c628fe2b480c5e6fb7957dda4b9291f9c9b";
  Protocol.NETWORK = constants_1.Network.FANTOM;
})((Protocol = exports.Protocol || (exports.Protocol = {})));
////////////////////////////
///// Network Specific /////
////////////////////////////
function equalsIgnoreCase(a, b) {
  return a.replace("-", "_").toLowerCase() == b.replace("-", "_").toLowerCase();
}
exports.equalsIgnoreCase = equalsIgnoreCase;
