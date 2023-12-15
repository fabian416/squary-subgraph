"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const configurations_1 = require("../../protocols/orbit/config/deployments/orbit-ethereum/configurations");
const configurations_2 = require("../../protocols/orbit/config/deployments/orbit-klaytn/configurations");
const configurations_3 = require("../../protocols/orbit/config/deployments/orbit-bsc/configurations");
const configurations_4 = require("../../protocols/orbit/config/deployments/orbit-polygon/configurations");
const configurations_5 = require("../../protocols/orbit/config/deployments/orbit-celo/configurations");
const configurations_6 = require("../../protocols/orbit/config/deployments/orbit-heco/configurations");
const deploy_1 = require("./deploy");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function getNetworkConfigurations(deploy) {
    switch (deploy) {
        case deploy_1.Deploy.ORBIT_MAINNET: {
            return new configurations_1.OrbitMainnetConfigurations();
        }
        case deploy_1.Deploy.ORBIT_BSC: {
            return new configurations_3.OrbitBscConfigurations();
        }
        case deploy_1.Deploy.ORBIT_POLYGON: {
            return new configurations_4.OrbitMaticConfigurations();
        }
        case deploy_1.Deploy.ORBIT_KLAYTN: {
            return new configurations_2.OrbitKlaytnConfigurations();
        }
        case deploy_1.Deploy.ORBIT_HECO: {
            return new configurations_6.OrbitHecoConfigurations();
        }
        case deploy_1.Deploy.ORBIT_CELO: {
            return new configurations_5.OrbitCeloConfigurations();
        }
        default: {
            graph_ts_1.log.critical("No configurations found for deployment protocol/network", []);
            return new configurations_1.OrbitMainnetConfigurations();
        }
    }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
