"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const configurations_1 = require("../../protocols/tornado-cash/config/deployments/tornado-cash-classic-ethereum/configurations");
const configurations_2 = require("../../protocols/tornado-cash/config/deployments/tornado-cash-classic-bsc/configurations");
const deploy_1 = require("./deploy");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function getNetworkConfigurations(deploy) {
    switch (deploy) {
        case deploy_1.Deploy.TORNADOCASH_MAINNET: {
            return new configurations_1.TornadoCashMainnetConfigurations();
        }
        case deploy_1.Deploy.TORNADOCASH_BSC: {
            return new configurations_2.TornadoCashBscConfigurations();
        }
        default: {
            graph_ts_1.log.critical("No configurations found for deployment protocol/network", []);
            return new configurations_1.TornadoCashMainnetConfigurations();
        }
    }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
