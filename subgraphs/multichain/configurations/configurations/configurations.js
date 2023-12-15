"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const deploy_1 = require("./deploy");
const configurations_1 = require("../../protocols/multichain/config/deployments/multichain-ethereum/configurations");
const configurations_2 = require("../../protocols/multichain/config/deployments/multichain-arbitrum/configurations");
const configurations_3 = require("../../protocols/multichain/config/deployments/multichain-avalanche/configurations");
const configurations_4 = require("../../protocols/multichain/config/deployments/multichain-bsc/configurations");
const configurations_5 = require("../../protocols/multichain/config/deployments/multichain-celo/configurations");
const configurations_6 = require("../../protocols/multichain/config/deployments/multichain-fantom/configurations");
const configurations_7 = require("../../protocols/multichain/config/deployments/multichain-gnosis/configurations");
const configurations_8 = require("../../protocols/multichain/config/deployments/multichain-optimism/configurations");
const configurations_9 = require("../../protocols/multichain/config/deployments/multichain-polygon/configurations");
function getNetworkConfigurations(deploy) {
    switch (deploy) {
        case deploy_1.Deploy.MULTICHAIN_MAINNET: {
            return new configurations_1.MultichainMainnetConfigurations();
        }
        case deploy_1.Deploy.MULTICHAIN_ARBITRUM: {
            return new configurations_2.MultichainArbitrumConfigurations();
        }
        case deploy_1.Deploy.MULTICHAIN_AVALANCHE: {
            return new configurations_3.MultichainAvalancheConfigurations();
        }
        case deploy_1.Deploy.MULTICHAIN_BSC: {
            return new configurations_4.MultichainBscConfigurations();
        }
        case deploy_1.Deploy.MULTICHAIN_CELO: {
            return new configurations_5.MultichainCeloConfigurations();
        }
        case deploy_1.Deploy.MULTICHAIN_FANTOM: {
            return new configurations_6.MultichainFantomConfigurations();
        }
        case deploy_1.Deploy.MULTICHAIN_GNOSIS: {
            return new configurations_7.MultichainGnosisConfigurations();
        }
        case deploy_1.Deploy.MULTICHAIN_OPTIMISM: {
            return new configurations_8.MultichainOptimismConfigurations();
        }
        case deploy_1.Deploy.MULTICHAIN_POLYGON: {
            return new configurations_9.MultichainPolygonConfigurations();
        }
        default: {
            graph_ts_1.log.critical("No configurations found for deployment protocol/network", []);
            return new configurations_1.MultichainMainnetConfigurations();
        }
    }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
