"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const deploy_1 = require("./deploy");
const configurations_1 = require("../../protocols/eigenlayer/config/deployments/eigenlayer-ethereum/configurations");
function getNetworkConfigurations(deploy) {
  switch (deploy) {
    case deploy_1.Deploy.EIGEN_LAYER_ETHEREUM: {
      return new configurations_1.EigenLayerEthereumConfigurations();
    }
    default: {
      graph_ts_1.log.critical(
        "No configurations found for deployment protocol/network",
        []
      );
      return new configurations_1.EigenLayerEthereumConfigurations();
    }
  }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
