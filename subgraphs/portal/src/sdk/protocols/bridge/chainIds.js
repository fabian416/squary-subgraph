"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseChainIDs = exports.chainIDs = exports.networkToChainID = exports.chainIDToNetwork = void 0;
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
setChainID(1, constants_1.Network.SOLANA);
setChainID(2, constants_1.Network.MAINNET);
setChainID(3, constants_1.Network.TERRA);
setChainID(4, constants_1.Network.BSC);
setChainID(5, constants_1.Network.MATIC);
setChainID(6, constants_1.Network.AVALANCHE);
setChainID(7, constants_1.Network.OASIS);
setChainID(9, constants_1.Network.AURORA);
setChainID(10, constants_1.Network.FANTOM);
setChainID(11, constants_1.Network.KARURA);
setChainID(12, constants_1.Network.ACALA);
setChainID(13, constants_1.Network.KLAYTN);
setChainID(14, constants_1.Network.CELO);
setChainID(15, constants_1.Network.NEAR);
setChainID(16, constants_1.Network.MOONBEAM);
setChainID(18, constants_1.Network.TERRA);
setChainID(22, constants_1.Network.APTOS);
setChainID(23, constants_1.Network.ARBITRUM_ONE);
