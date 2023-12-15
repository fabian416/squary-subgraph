"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseChainIDs = exports.chainIDs = exports.networkToChainID = exports.chainIDToNetwork = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../util/constants");
/**
 * This file contains the network to chainId mapping
 *
 * Schema Version:  1.2.0
 * SDK Version:     1.0.1
 * Author(s):
 *  - @jaimehgb
 *  - @dhruv-chauhan
 */
function chainIDToNetwork(chainID) {
    const network = exports.chainIDs.get(chainID.toU64());
    if (network) {
        return network;
    }
    return constants_1.Network.UNKNOWN_NETWORK;
}
exports.chainIDToNetwork = chainIDToNetwork;
function networkToChainID(network) {
    const chainID = exports.reverseChainIDs.get(network);
    if (chainID) {
        return chainID;
    }
    return graph_ts_1.BigInt.fromI32(-1);
}
exports.networkToChainID = networkToChainID;
function setChainID(chainID, network) {
    exports.chainIDs.set(chainID, network);
    exports.reverseChainIDs.set(network, graph_ts_1.BigInt.fromU64(chainID));
}
exports.chainIDs = new graph_ts_1.TypedMap();
exports.reverseChainIDs = new graph_ts_1.TypedMap();
setChainID(1, constants_1.Network.MAINNET);
setChainID(8, constants_1.Network.UBIQ);
setChainID(10, constants_1.Network.OPTIMISM);
setChainID(19, constants_1.Network.SONGBIRD);
setChainID(20, constants_1.Network.ELASTOS);
setChainID(24, constants_1.Network.KARDIACHAIN);
setChainID(25, constants_1.Network.CRONOS);
setChainID(30, constants_1.Network.RSK);
setChainID(40, constants_1.Network.TELOS);
setChainID(50, constants_1.Network.XDC);
setChainID(52, constants_1.Network.CSC);
setChainID(55, constants_1.Network.ZYX);
setChainID(56, constants_1.Network.BSC);
setChainID(57, constants_1.Network.SYSCOIN);
setChainID(60, constants_1.Network.GOCHAIN);
setChainID(61, constants_1.Network.ETHEREUMCLASSIC);
setChainID(66, constants_1.Network.OKEXCHAIN);
setChainID(70, constants_1.Network.HOO);
setChainID(82, constants_1.Network.METER);
setChainID(87, constants_1.Network.NOVA_NETWORK);
setChainID(88, constants_1.Network.TOMOCHAIN);
setChainID(100, constants_1.Network.XDAI);
setChainID(106, constants_1.Network.VELAS);
setChainID(108, constants_1.Network.THUNDERCORE);
setChainID(122, constants_1.Network.FUSE);
setChainID(128, constants_1.Network.HECO);
setChainID(137, constants_1.Network.MATIC);
setChainID(200, constants_1.Network.XDAIARB);
setChainID(246, constants_1.Network.ENERGYWEB);
setChainID(250, constants_1.Network.FANTOM);
setChainID(269, constants_1.Network.HPB);
setChainID(288, constants_1.Network.BOBA);
setChainID(321, constants_1.Network.KUCOIN);
setChainID(336, constants_1.Network.SHIDEN);
setChainID(361, constants_1.Network.THETA);
setChainID(416, constants_1.Network.SX);
setChainID(534, constants_1.Network.CANDLE);
setChainID(592, constants_1.Network.ASTAR);
setChainID(820, constants_1.Network.CALLISTO);
setChainID(888, constants_1.Network.WANCHAIN);
setChainID(1088, constants_1.Network.METIS);
setChainID(1231, constants_1.Network.ULTRON);
setChainID(1234, constants_1.Network.STEP);
setChainID(1284, constants_1.Network.MOONBEAM);
setChainID(1285, constants_1.Network.MOONRIVER);
setChainID(2000, constants_1.Network.DOGECHAIN);
setChainID(2020, constants_1.Network.RONIN);
setChainID(2222, constants_1.Network.KAVA);
setChainID(4689, constants_1.Network.IOTEX);
setChainID(5050, constants_1.Network.XLC);
setChainID(5551, constants_1.Network.NAHMII);
setChainID(6969, constants_1.Network.TOMBCHAIN);
setChainID(7700, constants_1.Network.CANTO);
setChainID(8217, constants_1.Network.KLAYTN);
setChainID(9001, constants_1.Network.EVMOS);
setChainID(10000, constants_1.Network.SMARTBCH);
setChainID(32520, constants_1.Network.BITGERT);
setChainID(32659, constants_1.Network.FUSION);
setChainID(39815, constants_1.Network.OHO);
setChainID(42161, constants_1.Network.ARBITRUM_ONE);
setChainID(42170, constants_1.Network.ARB_NOVA);
setChainID(42220, constants_1.Network.CELO);
setChainID(42262, constants_1.Network.OASIS);
setChainID(43114, constants_1.Network.AVALANCHE);
setChainID(47805, constants_1.Network.REI);
setChainID(55555, constants_1.Network.REICHAIN);
setChainID(71402, constants_1.Network.GODWOKEN);
setChainID(333999, constants_1.Network.POLIS);
setChainID(420420, constants_1.Network.KEKCHAIN);
setChainID(888888, constants_1.Network.VISION);
setChainID(1313161554, constants_1.Network.AURORA);
setChainID(1666600000, constants_1.Network.HARMONY);
setChainID(11297108109, constants_1.Network.PALM);
setChainID(836542336838601, constants_1.Network.CURIO);
setChainID(8453, constants_1.Network.BASE);
