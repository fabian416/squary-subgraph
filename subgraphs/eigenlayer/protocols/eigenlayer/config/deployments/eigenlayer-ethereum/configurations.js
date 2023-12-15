"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EigenLayerEthereumConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../../../src/common/constants");
class EigenLayerEthereumConfigurations {
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
    return graph_ts_1.Address.fromString(
      "0x369e6f597e22eab55ffb173c6d9cd234bd699111"
    );
  }
}
exports.EigenLayerEthereumConfigurations = EigenLayerEthereumConfigurations;
