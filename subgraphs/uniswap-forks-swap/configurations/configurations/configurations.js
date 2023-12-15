"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const deploy_1 = require("./deploy");
const configurations_1 = require("../../protocols/uniswap-v2-swap/config/deployments/uniswap-v2-swap-ethereum/configurations");
const configurations_2 = require("../../protocols/quickswap-swap/config/deployments/quickswap-swap-polygon/configurations");
const configurations_3 = require("../../protocols/pancakeswap-v2-swap/config/deployments/pancakeswap-v2-swap-bsc/configurations");
const configurations_4 = require("../../protocols/baseswap-swap/config/deployments/baseswap-swap-base/configurations");
// This function is called to load in the proper configurations for a protocol/network deployment.
// To add a new deployment, add a value to the `Deploy` namespace and add a new configuration class to the network specific typescript file in the `protocols` folder.
// Finally, add a new entry for this deployment to the getNetworkConfigurations() function
function getNetworkConfigurations(deploy) {
    switch (deploy) {
        case deploy_1.Deploy.UNISWAP_V2_ETHEREUM: {
            return new configurations_1.UniswapV2MainnetConfigurations();
        }
        case deploy_1.Deploy.QUICKSWAP_POLYGON: {
            return new configurations_2.QuickswapMaticConfigurations();
        }
        case deploy_1.Deploy.PANCAKESWAP_V2_BSC: {
            return new configurations_3.PancakeswapV2BscConfigurations();
        }
        case deploy_1.Deploy.BASESWAP_BASE: {
            return new configurations_4.BaseswapBaseConfigurations();
        }
        default: {
            graph_ts_1.log.critical("No configurations found for deployment protocol/network", []);
            return new configurations_1.UniswapV2MainnetConfigurations();
        }
    }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
