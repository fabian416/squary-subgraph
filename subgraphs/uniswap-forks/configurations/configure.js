"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkConfigs = void 0;
// import { log} from "@graphprotocol/graph-ts";
const configurations_1 = require("./configurations/configurations");
const deploy_1 = require("./configurations/deploy");
// Select the deployment protocol and network
const deployment = deploy_1.Deploy.TRADER_JOE_AVALANCHE;
// export const NetworkConfigs = configurationsMap.get(deployment)!
exports.NetworkConfigs = (0, configurations_1.getNetworkConfigurations)(deployment);
