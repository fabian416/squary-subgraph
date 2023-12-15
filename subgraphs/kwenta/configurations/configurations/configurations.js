"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const configurations_1 = require("../../protocols/kwenta/config/deployments/kwenta-optimism/configurations");
const deploy_1 = require("./deploy");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function getNetworkConfigurations(deploy) {
    switch (deploy) {
        case deploy_1.Deploy.KWENTA_OPTIMISM: {
            return new configurations_1.KwentaOptimismConfigurations();
        }
        default: {
            graph_ts_1.log.critical("No configurations found for deployment protocol/network", []);
            return new configurations_1.KwentaOptimismConfigurations();
        }
    }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
