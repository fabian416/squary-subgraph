"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseChainIDs = exports.chainIDs = exports.networkToChainID = exports.chainIDToNetwork = void 0;
/* eslint-disable @typescript-eslint/no-magic-numbers */
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../util/constants");
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
setChainID(101, constants_1.Network.MAINNET);
setChainID(2, constants_1.Network.BSC);
setChainID(102, constants_1.Network.BSC);
setChainID(6, constants_1.Network.AVALANCHE);
setChainID(106, constants_1.Network.AVALANCHE);
setChainID(9, constants_1.Network.MATIC);
setChainID(109, constants_1.Network.MATIC);
setChainID(10, constants_1.Network.ARBITRUM_ONE);
setChainID(110, constants_1.Network.ARBITRUM_ONE);
setChainID(11, constants_1.Network.OPTIMISM);
setChainID(111, constants_1.Network.OPTIMISM);
setChainID(12, constants_1.Network.FANTOM);
setChainID(112, constants_1.Network.FANTOM);
setChainID(51, constants_1.Network.METIS);
setChainID(151, constants_1.Network.METIS);
setChainID(84, constants_1.Network.BASE);
setChainID(184, constants_1.Network.BASE);
