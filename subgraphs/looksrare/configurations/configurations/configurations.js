"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const configurations_1 = require("../../protocols/looksrare/config/deployments/looksrare-ethereum/configurations");
const deploy_1 = require("./deploy");
// This function is called to load in the proper configurations for a protocol/network deployment.
// To add a new deployment, add a value to the `Deploy` namespace and add a new configuration class to the network specific typescript file in the `protocols` folder.
// Finally, add a new entry for this deployment to the getNetworkConfigurations() function
function getNetworkConfigurations(deploy) {
    switch (deploy) {
        case deploy_1.Deploy.LOOKSRARE_ETHEREUM: {
            return new configurations_1.LooksrareEthereumConfigurations();
        }
        default: {
            graph_ts_1.log.critical("No configurations found for deployment protocol/network", []);
            return new configurations_1.LooksrareEthereumConfigurations();
        }
    }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
