"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkConfigurations = void 0;
const configurations_1 = require("../../protocols/uniswap-v2/config/deployments/uniswap-v2-ethereum/configurations");
const configurations_2 = require("../../protocols/apeswap/config/deployments/apeswap-bsc/configurations");
const configurations_3 = require("../../protocols/apeswap/config/deployments/apeswap-polygon/configurations");
const configurations_4 = require("../../protocols/sushiswap/config/deployments/sushiswap-arbitrum/configurations");
const configurations_5 = require("../../protocols/sushiswap/config/deployments/sushiswap-avalanche/configurations");
const configurations_6 = require("../../protocols/sushiswap/config/deployments/sushiswap-bsc/configurations");
const configurations_7 = require("../../protocols/sushiswap/config/deployments/sushiswap-celo/configurations");
const configurations_8 = require("../../protocols/sushiswap/config/deployments/sushiswap-fantom/configurations");
const configurations_9 = require("../../protocols/sushiswap/config/deployments/sushiswap-fuse/configurations");
const configurations_10 = require("../../protocols/sushiswap/config/deployments/sushiswap-ethereum/configurations");
const configurations_11 = require("../../protocols/sushiswap/config/deployments/sushiswap-polygon/configurations");
const configurations_12 = require("../../protocols/sushiswap/config/deployments/sushiswap-moonbeam/configurations");
const configurations_13 = require("../../protocols/sushiswap/config/deployments/sushiswap-moonriver/configurations");
const configurations_14 = require("../../protocols/sushiswap/config/deployments/sushiswap-gnosis/configurations");
const configurations_15 = require("../../protocols/sushiswap/config/deployments/sushiswap-harmony/configurations");
const configurations_16 = require("../../protocols/spookyswap/config/deployments/spookyswap-fantom/configurations");
const configurations_17 = require("../../protocols/ubeswap/config/deployments/ubeswap-celo/configurations");
const configurations_18 = require("../../protocols/spiritswap/config/deployments/spiritswap-fantom/configurations");
const configurations_19 = require("../../protocols/quickswap/config/deployments/quickswap-polygon/configurations");
const configurations_20 = require("../../protocols/solarbeam/config/deployments/solarbeam-moonriver/configurations");
const configurations_21 = require("../../protocols/trader-joe/config/deployments/trader-joe-avalanche/configurations");
const configurations_22 = require("../../protocols/trisolaris/config/deployments/trisolaris-aurora/configurations");
const configurations_23 = require("../../protocols/vvs-finance/config/deployments/vvs-finance-cronos/configurations");
const configurations_24 = require("../../protocols/mm-finance/config/deployments/mm-finance-cronos/configurations");
const configurations_25 = require("../../protocols/mm-finance/config/deployments/mm-finance-polygon/configurations");
const configurations_26 = require("../../protocols/honeyswap/config/deployments/honeyswap-gnosis/configurations");
const configurations_27 = require("../../protocols/honeyswap/config/deployments/honeyswap-polygon/configurations");
const configurations_28 = require("../../protocols/pangolin/config/deployments/pangolin-avalanche/configurations");
const configurations_29 = require("../../protocols/biswap/config/deployments/biswap-bsc/configurations");
const configurations_30 = require("../../protocols/camelot-v2/config/deployments/camelot-v2-arbitrum/configurations");
const configurations_31 = require("../../protocols/baseswap/config/deployments/baseswap-base/configurations");
const deploy_1 = require("./deploy");
const graph_ts_1 = require("@graphprotocol/graph-ts");
// This function is called to load in the proper configurations for a protocol/network deployment.
// To add a new deployment, add a value to the `Deploy` namespace and add a new configuration class to the network specific typescript file in the `protocols` folder.
// Finally, add a new entry for this deployment to the getNetworkConfigurations() function
function getNetworkConfigurations(deploy) {
    switch (deploy) {
        case deploy_1.Deploy.APESWAP_BSC: {
            return new configurations_2.ApeswapBscConfigurations();
        }
        case deploy_1.Deploy.APESWAP_POLYGON: {
            return new configurations_3.ApeswapMaticConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_ARBITRUM: {
            return new configurations_4.SushiswapArbitrumConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_AVALANCHE: {
            return new configurations_5.SushiswapAvalancheConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_BSC: {
            return new configurations_6.SushiswapBscConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_CELO: {
            return new configurations_7.SushiswapCeloConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_FANTOM: {
            return new configurations_8.SushiswapFantomConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_FUSE: {
            return new configurations_9.SushiswapFuseConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_ETHEREUM: {
            return new configurations_10.SushiswapMainnetConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_POLYGON: {
            return new configurations_11.SushiswapMaticConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_MOONBEAM: {
            return new configurations_12.SushiswapMoonbeamConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_MOONRIVER: {
            return new configurations_13.SushiswapMoonriverConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_GNOSIS: {
            return new configurations_14.SushiswapGnosisConfigurations();
        }
        case deploy_1.Deploy.SUSHISWAP_HARMONY: {
            return new configurations_15.SushiswapHarmonyConfigurations();
        }
        case deploy_1.Deploy.UNISWAP_V2_ETHEREUM: {
            return new configurations_1.UniswapV2MainnetConfigurations();
        }
        case deploy_1.Deploy.SPOOKYSWAP_FANTOM: {
            return new configurations_16.SpookyswapFantomConfigurations();
        }
        case deploy_1.Deploy.SPIRITSWAP_FANTOM: {
            return new configurations_18.SpiritSwapFantomConfigurations();
        }
        case deploy_1.Deploy.QUICKSWAP_POLYGON: {
            return new configurations_19.QuickswapMaticConfigurations();
        }
        case deploy_1.Deploy.SOLARBEAM_MOONRIVER: {
            return new configurations_20.SolarbeamMoonriverConfigurations();
        }
        case deploy_1.Deploy.TRADER_JOE_AVALANCHE: {
            return new configurations_21.TraderJoeAvalancheConfigurations();
        }
        case deploy_1.Deploy.TRISOLARIS_AURORA: {
            return new configurations_22.TrisolarisAuroraConfigurations();
        }
        case deploy_1.Deploy.VVS_FINANCE_CRONOS: {
            return new configurations_23.VSSFinanceCronosConfigurations();
        }
        case deploy_1.Deploy.UBESWAP_CELO: {
            return new configurations_17.UbeswapCeloConfigurations();
        }
        case deploy_1.Deploy.HONEYSWAP_GNOSIS: {
            return new configurations_26.HoneyswapGnosisConfigurations();
        }
        case deploy_1.Deploy.HONEYSWAP_POLYGON: {
            return new configurations_27.HoneyswapMaticConfigurations();
        }
        case deploy_1.Deploy.MM_FINANCE_CRONOS: {
            return new configurations_24.MMFinanceCronosConfigurations();
        }
        case deploy_1.Deploy.MM_FINANCE_POLYGON: {
            return new configurations_25.MMFinanceMaticConfigurations();
        }
        case deploy_1.Deploy.PANGOLIN_AVALANCHE: {
            return new configurations_28.PangolinAvalancheConfigurations();
        }
        case deploy_1.Deploy.BISWAP_BSC: {
            return new configurations_29.BiswapBscConfigurations();
        }
        case deploy_1.Deploy.CAMELOT_V2_ARBITRUM: {
            return new configurations_30.CamelotV2Configurations();
        }
        case deploy_1.Deploy.BASESWAP_BASE: {
            return new configurations_31.BaseswapBaseConfigurations();
        }
        default: {
            graph_ts_1.log.critical("No configurations found for deployment protocol/network", []);
            return new configurations_4.SushiswapArbitrumConfigurations();
        }
    }
}
exports.getNetworkConfigurations = getNetworkConfigurations;
