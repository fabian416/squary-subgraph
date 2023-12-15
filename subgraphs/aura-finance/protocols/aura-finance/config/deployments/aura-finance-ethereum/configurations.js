"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuraFinanceMainnetConfigurations = void 0;
const constants_1 = require("../../../../../src/common/constants");
class AuraFinanceMainnetConfigurations {
  getNetwork() {
    return constants_1.Network.MAINNET;
  }
  getProtocolName() {
    return constants_1.PROTOCOL_NAME;
  }
  getProtocolSlug() {
    return constants_1.PROTOCOL_SLUG;
  }
  getFactoryAddress() {
    return "0xA57b8d98dAE62B26Ec3bcC4a365338157060B234";
  }
  getRewardToken() {
    return "0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF";
  }
}
exports.AuraFinanceMainnetConfigurations = AuraFinanceMainnetConfigurations;
