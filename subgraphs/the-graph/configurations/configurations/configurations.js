"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const configurations_1 = require("../../protocols/the-graph/config/deployments/the-graph-arbitrum/configurations");
const configurations_2 = require("../../protocols/the-graph/config/deployments/the-graph-ethereum/configurations");
const deploy_1 = require("./deploy");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function getNetworkConfigurations(deploy) {
    switch (deploy) {
        case deploy_1.Deploy.THE_GRAPH_ARBITRUM: {
            return new configurations_1.TheGraphArbitrumConfigurations();
        }
        case deploy_1.Deploy.THE_GRAPH_ETHEREUM: {
            return new configurations_2.TheGraphEthereumConfigurations();
        }
        default: {
            graph_ts_1.log.critical("No configurations found for deployment protocol/network", []);
            return new configurations_1.TheGraphArbitrumConfigurations();
        }
    }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
