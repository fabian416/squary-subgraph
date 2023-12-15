"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deploy = void 0;
// Add a numerical value associated with a deployment for each deployment.
// The text associated with the integer should be included in the .json configuration file
// for the protocol/network deployment in the `protocols` folder.
var Deploy;
(function (Deploy) {
    Deploy.APESWAP_BSC = 0;
    Deploy.APESWAP_POLYGON = 1;
    Deploy.SUSHISWAP_ARBITRUM = 2;
    Deploy.SUSHISWAP_AVALANCHE = 3;
    Deploy.SUSHISWAP_BSC = 4;
    Deploy.SUSHISWAP_CELO = 5;
    Deploy.SUSHISWAP_FANTOM = 6;
    Deploy.SUSHISWAP_FUSE = 7;
    Deploy.SUSHISWAP_ETHEREUM = 8;
    Deploy.SUSHISWAP_POLYGON = 9;
    Deploy.SUSHISWAP_MOONBEAM = 10;
    Deploy.SUSHISWAP_MOONRIVER = 11;
    Deploy.SUSHISWAP_GNOSIS = 12;
    Deploy.SUSHISWAP_HARMONY = 13;
    Deploy.UNISWAP_V2_ETHEREUM = 14;
    Deploy.SPOOKYSWAP_FANTOM = 15;
    Deploy.SPIRITSWAP_FANTOM = 16;
    Deploy.TRADER_JOE_AVALANCHE = 17;
    Deploy.QUICKSWAP_POLYGON = 18;
    Deploy.TRISOLARIS_AURORA = 19;
    Deploy.SOLARBEAM_MOONRIVER = 20;
    Deploy.VVS_FINANCE_CRONOS = 21;
    Deploy.UBESWAP_CELO = 22;
    Deploy.HONEYSWAP_GNOSIS = 23;
    Deploy.HONEYSWAP_POLYGON = 24;
    Deploy.MM_FINANCE_CRONOS = 25;
    Deploy.MM_FINANCE_POLYGON = 26;
    Deploy.PANGOLIN_AVALANCHE = 27;
    Deploy.BISWAP_BSC = 28;
    Deploy.CAMELOT_V2_ARBITRUM = 29;
    Deploy.BASESWAP_BASE = 30;
})(Deploy = exports.Deploy || (exports.Deploy = {}));
