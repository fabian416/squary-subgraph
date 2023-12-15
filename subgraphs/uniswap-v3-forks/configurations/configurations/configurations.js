"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const configurations_1 = require("../../protocols/uniswap-v3/config/deployments/uniswap-v3-arbitrum/configurations");
const configurations_2 = require("../../protocols/uniswap-v3/config/deployments/uniswap-v3-base/configurations");
const configurations_3 = require("../../protocols/uniswap-v3/config/deployments/uniswap-v3-ethereum/configurations");
const configurations_4 = require("../../protocols/uniswap-v3/config/deployments/uniswap-v3-polygon/configurations");
const configurations_5 = require("../../protocols/uniswap-v3/config/deployments/uniswap-v3-optimism/configurations");
const configurations_6 = require("../../protocols/uniswap-v3/config/deployments/uniswap-v3-celo/configurations");
const configurations_7 = require("../../protocols/uniswap-v3/config/deployments/uniswap-v3-bsc/configurations");
const configurations_8 = require("../../protocols/pancakeswap-v3/config/deployments/pancakeswap-v3-bsc/configurations");
const configurations_9 = require("../../protocols/pancakeswap-v3/config/deployments/pancakeswap-v3-ethereum/configurations");
const configurations_10 = require("../../protocols/sushiswap-v3/config/deployments/sushiswap-v3-ethereum/configurations");
const configurations_11 = require("../../protocols/sushiswap-v3/config/deployments/sushiswap-v3-arbitrum/configurations");
const configurations_12 = require("../../protocols/sushiswap-v3/config/deployments/sushiswap-v3-avalanche/configurations");
const configurations_13 = require("../../protocols/sushiswap-v3/config/deployments/sushiswap-v3-bsc/configurations");
const configurations_14 = require("../../protocols/sushiswap-v3/config/deployments/sushiswap-v3-fantom/configurations");
const configurations_15 = require("../../protocols/sushiswap-v3/config/deployments/sushiswap-v3-fuse/configurations");
const configurations_16 = require("../../protocols/sushiswap-v3/config/deployments/sushiswap-v3-gnosis/configurations");
const configurations_17 = require("../../protocols/sushiswap-v3/config/deployments/sushiswap-v3-moonriver/configurations");
const configurations_18 = require("../../protocols/sushiswap-v3/config/deployments/sushiswap-v3-optimism/configurations");
const configurations_19 = require("../../protocols/sushiswap-v3/config/deployments/sushiswap-v3-polygon/configurations");
const deploy_1 = require("./deploy");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function getNetworkConfigurations(deploy) {
    switch (deploy) {
        case deploy_1.Deploy.UNISWAP_V3_ARBITRUM: {
            return new configurations_1.UniswapV3ArbitrumConfigurations();
        }
        case deploy_1.Deploy.UNISWAP_V3_ETHEREUM: {
            return new configurations_3.UniswapV3MainnetConfigurations();
        }
        case deploy_1.Deploy.UNISWAP_V3_POLYGON: {
            return new configurations_4.UniswapV3MaticConfigurations();
        }
        case deploy_1.Deploy.UNISWAP_V3_OPTIMISM: {
            return new configurations_5.UniswapV3OptimismConfigurations();
        }
        case deploy_1.Deploy.UNISWAP_V3_CELO: {
            return new configurations_6.UniswapV3CeloConfigurations();
        }
        case deploy_1.Deploy.UNISWAP_V3_BSC: {
            return new configurations_7.UniswapV3BSCConfigurations();
        }
        case deploy_1.Deploy.UNISWAP_V3_BASE: {
            return new configurations_2.UniswapV3BaseConfigurations();
        }
        case deploy_1.Deploy.PANCAKE_V3_BSC: {
            return new configurations_8.PancakeV3BSCConfigurations();
        }
        case deploy_1.Deploy.PANCAKE_V3_ETHEREUM: {
            return new configurations_9.PancakeV3EthereumConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_V3_ETHEREUM: {
            return new configurations_10.SushiswapV3EthereumConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_V3_ARBITRUM: {
            return new configurations_11.SushiswapV3ArbitrumConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_V3_AVALANCHE: {
            return new configurations_12.SushiswapV3AvalancheConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_V3_BSC: {
            return new configurations_13.SushiswapV3BscConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_V3_FANTOM: {
            return new configurations_14.SushiswapV3FantomConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_V3_FUSE: {
            return new configurations_15.SushiswapV3FuseConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_V3_GNOSIS: {
            return new configurations_16.SushiswapV3GnosisConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_V3_MOONRIVER: {
            return new configurations_17.SushiswapV3MoonriverConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_V3_OPTIMISM: {
            return new configurations_18.SushiswapV3OptimismConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_V3_POLYGON: {
            return new configurations_19.SushiswapV3PolygonConfigurations();
        }
        default: {
            graph_ts_1.log.critical("No configurations found for deployment protocol/network", []);
            return new configurations_5.UniswapV3OptimismConfigurations();
        }
    }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
