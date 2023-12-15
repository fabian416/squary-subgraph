"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deploy = void 0;
// Add a numerical value associated with a deployment for each deployment.
// The text associated with the integer should be included in the .json configuration file
// for the protocol/network deployment in the `protocols` folder.
var Deploy;
(function (Deploy) {
    Deploy.MUX_ARBITRUM = 0;
    Deploy.MUX_AVALANCHE = 1;
    Deploy.MUX_BSC = 2;
    Deploy.MUX_FANTOM = 3;
    Deploy.MUX_OPTIMISM = 4;
})(Deploy = exports.Deploy || (exports.Deploy = {}));
