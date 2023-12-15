"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configurations_1 = require("../../protocols/opyn-gamma/config/deployments/opyn-gamma-arbitrum/configurations");
const configurations_2 = require("../../protocols/opyn-gamma/config/deployments/opyn-gamma-avalanche/configurations");
const configurations_3 = require("../../protocols/opyn-gamma/config/deployments/opyn-gamma-ethereum/configurations");
const configurations_4 = require("../../protocols/opyn-gamma/config/deployments/opyn-gamma-polygon/configurations");
const deploy_1 = require("./deploy");
// This function is called to load in the proper configurations for a protocol/network deployment.
// To add a new deployment, add a value to the `Deploy` namespace and add a new configuration class to the network specific typescript file in the `protocols` folder.
// Finally, add a new entry for this deployment to the getNetworkConfigurations() function
function getNetworkConfigurations(deploy) {
    switch (deploy) {
        case deploy_1.Deploy.OPYN_ETHEREUM: {
            return new configurations_3.OpynEthereumConfigurations();
        }
        case deploy_1.Deploy.OPYN_AVALANCHE: {
            return new configurations_2.OpynAvalancheConfigurations();
        }
        case deploy_1.Deploy.OPYN_ARBITRUM: {
            return new configurations_1.OpynArbitrumConfigurations();
        }
        case deploy_1.Deploy.OPYN_POLYGON: {
            return new configurations_4.OpynPolygonConfigurations();
        }
        default: {
            graph_ts_1.log.critical("No configurations found for deployment protocol/network", []);
            return new configurations_3.OpynEthereumConfigurations();
        }
    }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
