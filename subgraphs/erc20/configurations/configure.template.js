"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPFS_HASH = void 0;
const configurations_1 = require("./configurations");
let deploymentYear = {}, { deploymentYear };
;
exports.IPFS_HASH = (0, configurations_1.getRegistryIpfsHash)(deploymentYear);
