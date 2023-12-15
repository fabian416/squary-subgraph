"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const configurations_1 = require("../../protocols/gains-trade/config/deployments/gains-trade-arbitrum/configurations");
const configurations_2 = require("../../protocols/gains-trade/config/deployments/gains-trade-polygon/configurations");
const deploy_1 = require("./deploy");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function getNetworkConfigurations(deploy) {
    switch (deploy) {
        case deploy_1.Deploy.GAINS_TRADE_ARBITRUM: {
            return new configurations_1.GainsTradeArbitrumConfigurations();
        }
        case deploy_1.Deploy.GAINS_TRADE_POLYGON: {
            return new configurations_2.GainsTradePolygonConfigurations();
        }
        default: {
            graph_ts_1.log.critical("No configurations found for deployment protocol/network", []);
            return new configurations_1.GainsTradeArbitrumConfigurations();
        }
    }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
