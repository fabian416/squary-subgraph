"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deploy = void 0;
// Add a numerical value associated with a deployment for each deployment.
// The text associated with the integer should be included in the .json configuration file
// for the protocol/network deployment in the `protocols` folder.
var Deploy;
(function (Deploy) {
    Deploy.UNISWAP_V2_ETHEREUM = 0;
    Deploy.QUICKSWAP_POLYGON = 1;
    Deploy.PANCAKESWAP_V2_BSC = 2;
    Deploy.BASESWAP_BASE = 3;
})(Deploy = exports.Deploy || (exports.Deploy = {}));
