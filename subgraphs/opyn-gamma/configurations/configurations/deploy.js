"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deploy = void 0;
// Add a numerical value associated with a deployment for each deployment.
// The text associated with the integer should be included in the .json configuration file
// for the protocol/network deployment in the `protocols` folder.
var Deploy;
(function (Deploy) {
    Deploy.OPYN_ETHEREUM = 0;
    Deploy.OPYN_ARBITRUM = 1;
    Deploy.OPYN_AVALANCHE = 2;
    Deploy.OPYN_POLYGON = 3;
})(Deploy = exports.Deploy || (exports.Deploy = {}));
