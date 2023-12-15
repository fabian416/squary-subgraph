"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const configurations_1 = require("../../protocols/portal/config/deployments/portal-ethereum/configurations");
const configurations_2 = require("../../protocols/portal/config/deployments/portal-fantom/configurations");
const configurations_3 = require("../../protocols/portal/config/deployments/portal-bsc/configurations");
const configurations_4 = require("../../protocols/portal/config/deployments/portal-polygon/configurations");
const configurations_5 = require("../../protocols/portal/config/deployments/portal-avalanche/configurations");
const deploy_1 = require("./deploy");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function getNetworkConfigurations(deploy) {
    switch (deploy) {
        case deploy_1.Deploy.PORTAL_MAINNET: {
            return new configurations_1.PortalMainnetConfigurations();
        }
        case deploy_1.Deploy.PORTAL_FANTOM: {
            return new configurations_2.PortalFantomConfigurations();
        }
        case deploy_1.Deploy.PORTAL_BSC: {
            return new configurations_3.PortalBscConfigurations();
        }
        case deploy_1.Deploy.PORTAL_POLYGON: {
            return new configurations_4.PortalPolygonConfigurations();
        }
        case deploy_1.Deploy.PORTAL_AVALANCHE: {
            return new configurations_5.PortalAvalancheConfigurations();
        }
        default: {
            graph_ts_1.log.critical("No configurations found for deployment protocol/network", []);
            return new configurations_1.PortalMainnetConfigurations();
        }
    }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
