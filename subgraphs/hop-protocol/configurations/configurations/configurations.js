"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const configurations_1 = require("../../protocols/hop-protocol/config/deployments/hop-protocol-arbitrum/configurations");
const configurations_2 = require("../../protocols/hop-protocol/config/deployments/hop-protocol-ethereum/configurations");
const configurations_3 = require("../../protocols/hop-protocol/config/deployments/hop-protocol-optimism/configurations");
const configurations_4 = require("../../protocols/hop-protocol/config/deployments/hop-protocol-xdai/configurations");
const configurations_5 = require("../../protocols/hop-protocol/config/deployments/hop-protocol-polygon/configurations");
const deploy_1 = require("./deploy");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function getNetworkConfigurations(deploy) {
    switch (deploy) {
        case deploy_1.Deploy.HOP_PROTOCOL_ARBITRUM: {
            return new configurations_1.HopProtocolArbitrumConfigurations();
        }
        case deploy_1.Deploy.HOP_PROTOCOL_ETHEREUM: {
            return new configurations_2.HopProtocolEthereumConfigurations();
        }
        case deploy_1.Deploy.HOP_PROTOCOL_OPTIMISM: {
            return new configurations_3.HopProtocolOptimismConfigurations();
        }
        case deploy_1.Deploy.HOP_PROTOCOL_XDAI: {
            return new configurations_4.HopProtocolxDaiConfigurations();
        }
        case deploy_1.Deploy.HOP_PROTOCOL_POLYGON: {
            return new configurations_5.HopProtocolPolygonConfigurations();
        }
        default: {
            graph_ts_1.log.critical("No configurations found for deployment protocol/network", []);
            return new configurations_2.HopProtocolEthereumConfigurations();
        }
    }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
