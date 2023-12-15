"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkConfigs = void 0;
const configurations_1 = require("./configurations/configurations");
const deploy_1 = require("./configurations/deploy");
// Select the deployment protocol and network
const deployment = deploy_1.Deploy.OPENSEA_V1_ETHEREUM;
// export const NetworkConfigs = configurationsMap.get(deployment)!
exports.NetworkConfigs = (0, configurations_1.getNetworkConfigurations)(deployment);
