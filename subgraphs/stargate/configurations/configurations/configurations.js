"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const configurations_1 = require("../../protocols/stargate/config/deployments/stargate-ethereum/configurations");
const configurations_2 = require("../../protocols/stargate/config/deployments/stargate-avalanche/configurations");
const configurations_3 = require("../../protocols/stargate/config/deployments/stargate-bsc/configurations");
const configurations_4 = require("../../protocols/stargate/config/deployments/stargate-polygon/configurations");
const configurations_5 = require("../../protocols/stargate/config/deployments/stargate-arbitrum/configurations");
const configurations_6 = require("../../protocols/stargate/config/deployments/stargate-optimism/configurations");
const configurations_7 = require("../../protocols/stargate/config/deployments/stargate-fantom/configurations");
const configurations_8 = require("../../protocols/stargate/config/deployments/stargate-metis/configurations");
const configurations_9 = require("../../protocols/stargate/config/deployments/stargate-base/configurations");
const deploy_1 = require("./deploy");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function getNetworkConfigurations(deploy) {
    switch (deploy) {
        case deploy_1.Deploy.STARGATE_MAINNET: {
            return new configurations_1.StargateMainnetConfigurations();
        }
        case deploy_1.Deploy.STARGATE_AVALANCHE: {
            return new configurations_2.StargateAvalancheConfigurations();
        }
        case deploy_1.Deploy.STARGATE_BSC: {
            return new configurations_3.StargateBscConfigurations();
        }
        case deploy_1.Deploy.STARGATE_POLYGON: {
            return new configurations_4.StargatePolygonConfigurations();
        }
        case deploy_1.Deploy.STARGATE_ARBITRUM: {
            return new configurations_5.StargateArbitrumConfigurations();
        }
        case deploy_1.Deploy.STARGATE_OPTIMISM: {
            return new configurations_6.StargateOptimismConfigurations();
        }
        case deploy_1.Deploy.STARGATE_FANTOM: {
            return new configurations_7.StargateFantomConfigurations();
        }
        case deploy_1.Deploy.STARGATE_METIS: {
            return new configurations_8.StargateMetisConfigurations();
        }
        case deploy_1.Deploy.STARGATE_BASE: {
            return new configurations_9.StargateBaseConfigurations();
        }
        default: {
            graph_ts_1.log.critical("No configurations found for deployment protocol/network", []);
            return new configurations_1.StargateMainnetConfigurations();
        }
    }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
