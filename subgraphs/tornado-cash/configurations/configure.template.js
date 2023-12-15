"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkConfigs = void 0;
const configurations_1 = require("./configurations/configurations");
const deploy_1 = require("./configurations/deploy");
let deployment = deploy_1.Deploy., {}, { deployment };
;
exports.NetworkConfigs = (0, configurations_1.getNetworkConfigurations)(deployment);
