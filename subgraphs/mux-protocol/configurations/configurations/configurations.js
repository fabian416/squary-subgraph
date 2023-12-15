"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const configurations_1 = require("../../protocols/mux-protocol/config/deployments/mux-protocol-arbitrum/configurations");
const configurations_2 = require("../../protocols/mux-protocol/config/deployments/mux-protocol-avalanche/configurations");
const configurations_3 = require("../../protocols/mux-protocol/config/deployments/mux-protocol-bsc/configurations");
const configurations_4 = require("../../protocols/mux-protocol/config/deployments/mux-protocol-fantom/configurations");
const configurations_5 = require("../../protocols/mux-protocol/config/deployments/mux-protocol-optimism/configurations");
const deploy_1 = require("./deploy");
const graph_ts_1 = require("@graphprotocol/graph-ts");
// This function is called to load in the proper configurations for a protocol/network deployment.
// To add a new deployment, add a value to the `Deploy` namespace and add a new configuration class to the network specific typescript file in the `protocols` folder.
// Finally, add a new entry for this deployment to the getNetworkConfigurations() function
function getNetworkConfigurations(deploy) {
    switch (deploy) {
        case deploy_1.Deploy.MUX_ARBITRUM: {
            return new configurations_1.MUXProtocolArbitrumConfigurations();
        }
        case deploy_1.Deploy.MUX_AVALANCHE: {
            return new configurations_2.MUXProtocolAvalancheConfigurations();
        }
        case deploy_1.Deploy.MUX_BSC: {
            return new configurations_3.MUXProtocolBscConfigurations();
        }
        case deploy_1.Deploy.MUX_FANTOM: {
            return new configurations_4.MUXProtocolFantomConfigurations();
        }
        case deploy_1.Deploy.MUX_OPTIMISM: {
            return new configurations_5.MUXProtocolOptimismConfigurations();
        }
        default: {
            graph_ts_1.log.error("No configurations found for deployment protocol/network", []);
            return new configurations_1.MUXProtocolArbitrumConfigurations();
        }
    }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
