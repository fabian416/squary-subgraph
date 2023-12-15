"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const deploy_1 = require("./deploy");
const configurations_1 = require("../../protocols/friend-tech/config/deployments/friend-tech-base/configurations");
function getNetworkConfigurations(deploy) {
    switch (deploy) {
        case deploy_1.Deploy.FRIEND_TECH_BASE: {
            return new configurations_1.FriendTechBaseConfigurations();
        }
        default: {
            graph_ts_1.log.critical("No configurations found for deployment protocol/network", []);
            return new configurations_1.FriendTechBaseConfigurations();
        }
    }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
