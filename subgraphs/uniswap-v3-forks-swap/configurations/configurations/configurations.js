"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const deploy_1 = require("./deploy");
const configurations_1 = require("../../protocols/pancakeswap-v3-swap/config/deployments/pancakeswap-v3-swap-bsc/configurations");
const configurations_2 = require("../../protocols/pancakeswap-v3-swap/config/deployments/pancakeswap-v3-swap-ethereum/configurations");
const configurations_3 = require("../../protocols/uniswap-v3-swap/config/deployments/uniswap-v3-swap-base/configurations");
const configurations_4 = require("../../protocols/uniswap-v3-swap/config/deployments/uniswap-v3-swap-optimism/configurations");
const configurations_5 = require("../../protocols/sushiswap-v3-swap/config/deployments/sushiswap-v3-swap-base/configurations");
function getNetworkConfigurations(deploy) {
    switch (deploy) {
        case deploy_1.Deploy.PANCAKE_V3_BSC: {
            return new configurations_1.PancakeV3BSCConfigurations();
        }
        case deploy_1.Deploy.PANCAKE_V3_ETHEREUM: {
            return new configurations_2.PancakeV3EthereumConfigurations();
        }
        case deploy_1.Deploy.UNISWAP_V3_BASE: {
            return new configurations_3.UniswapV3BaseConfigurations();
        }
        case deploy_1.Deploy.UNISWAP_V3_OPTIMISM: {
            return new configurations_4.UniswapV3OptimismConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_V3_BASE: {
            return new configurations_5.SushiswapV3BaseConfigurations();
        }
        default: {
            graph_ts_1.log.critical("No configurations found for deployment protocol/network", []);
            return new configurations_1.PancakeV3BSCConfigurations();
        }
    }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
