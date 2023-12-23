"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basePoolIDsToToken = exports.metisPoolIDsToToken = exports.fantomPoolIDsToToken = exports.optimismPoolIDsToToken = exports.arbitrumPoolIDsToToken = exports.maticPoolIDsToToken = exports.avaxPoolIDsToToken = exports.bscPoolIDsToToken = exports.mainnetPoolIDsToToken = exports.crossPoolTokens = exports.PROTOCOL_SLUG = exports.PROTOCOL_NAME = void 0;
/* eslint-disable @typescript-eslint/no-magic-numbers, rulesdir/no-checksum-addresses */
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../sdk/util/constants");
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
exports.PROTOCOL_NAME = "Stargate Finance";
exports.PROTOCOL_SLUG = "stargate";
exports.crossPoolTokens = new graph_ts_1.TypedMap();
exports.mainnetPoolIDsToToken = new graph_ts_1.TypedMap();
exports.mainnetPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(1), graph_ts_1.Address.fromString("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"));
exports.mainnetPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(2), graph_ts_1.Address.fromString("0xdAC17F958D2ee523a2206206994597C13D831ec7"));
exports.mainnetPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(3), graph_ts_1.Address.fromString("0x6B175474E89094C44Da98b954EedeAC495271d0F"));
exports.mainnetPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(7), graph_ts_1.Address.fromString("0x853d955aCEf822Db058eb8505911ED77F175b99e"));
exports.mainnetPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(11), graph_ts_1.Address.fromString("0x0C10bF8FcB7Bf5412187A595ab97a3609160b5c6"));
exports.mainnetPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(13), graph_ts_1.Address.fromString("0x72E2F4830b9E45d52F80aC08CB2bEC0FeF72eD9c"));
exports.mainnetPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(14), graph_ts_1.Address.fromString("0x57Ab1ec28D129707052df4dF418D58a2D46d5f51"));
exports.mainnetPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(15), graph_ts_1.Address.fromString("0x5f98805A4E8be255a32880FDeC7F6728C6568bA0"));
exports.mainnetPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(16), graph_ts_1.Address.fromString("0x9cef9a0b1bE0D289ac9f4a98ff317c33EAA84eb8"));
exports.mainnetPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(17), graph_ts_1.Address.fromString("0xd8772edBF88bBa2667ed011542343b0eDDaCDa47"));
exports.mainnetPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(19), graph_ts_1.Address.fromString("0x430Ebff5E3E80A6C58E7e6ADA1d90F5c28AA116d"));
exports.crossPoolTokens.set(constants_1.Network.MAINNET, exports.mainnetPoolIDsToToken);
exports.bscPoolIDsToToken = new graph_ts_1.TypedMap();
exports.bscPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(2), graph_ts_1.Address.fromString("0x55d398326f99059fF775485246999027B3197955"));
exports.bscPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(5), graph_ts_1.Address.fromString("0xe9e7cea3dedca5984780bafc599bd69add087d56"));
exports.bscPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(11), graph_ts_1.Address.fromString("0xd17479997F34dd9156Deef8F95A52D81D265be9c"));
exports.bscPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(16), graph_ts_1.Address.fromString("0x7BfD7f2498C4796f10b6C611D9db393D3052510C"));
exports.bscPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(17), graph_ts_1.Address.fromString("0xD4CEc732b3B135eC52a3c0bc8Ce4b8cFb9dacE46"));
exports.bscPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(19), graph_ts_1.Address.fromString("0x68C6c27fB0e02285829e69240BE16f32C5f8bEFe"));
exports.crossPoolTokens.set(constants_1.Network.BSC, exports.bscPoolIDsToToken);
exports.avaxPoolIDsToToken = new graph_ts_1.TypedMap();
exports.avaxPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(1), graph_ts_1.Address.fromString("0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"));
exports.avaxPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(2), graph_ts_1.Address.fromString("0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"));
exports.avaxPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(7), graph_ts_1.Address.fromString("0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64"));
exports.avaxPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(16), graph_ts_1.Address.fromString("0x8736f92646B2542B3e5F3c63590cA7Fe313e283B"));
exports.avaxPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(19), graph_ts_1.Address.fromString("0xEAe5c2F6B25933deB62f754f239111413A0A25ef"));
exports.crossPoolTokens.set(constants_1.Network.AVALANCHE, exports.avaxPoolIDsToToken);
exports.maticPoolIDsToToken = new graph_ts_1.TypedMap();
exports.maticPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(1), graph_ts_1.Address.fromString("0x2791bca1f2de4661ed88a30c99a7a9449aa84174"));
exports.maticPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(2), graph_ts_1.Address.fromString("0xc2132d05d31c914a87c6611c10748aeb04b58e8f"));
exports.maticPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(3), graph_ts_1.Address.fromString("0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"));
exports.maticPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(16), graph_ts_1.Address.fromString("0x8736f92646B2542B3e5F3c63590cA7Fe313e283B"));
exports.crossPoolTokens.set(constants_1.Network.MATIC, exports.maticPoolIDsToToken);
exports.arbitrumPoolIDsToToken = new graph_ts_1.TypedMap();
exports.arbitrumPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(1), graph_ts_1.Address.fromString("0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"));
exports.arbitrumPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(2), graph_ts_1.Address.fromString("0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"));
exports.arbitrumPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(7), graph_ts_1.Address.fromString("0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F"));
exports.arbitrumPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(13), graph_ts_1.Address.fromString("0x82CbeCF39bEe528B5476FE6d1550af59a9dB6Fc0"));
exports.arbitrumPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(16), graph_ts_1.Address.fromString("0xF39B7Be294cB36dE8c510e267B82bb588705d977"));
exports.crossPoolTokens.set(constants_1.Network.ARBITRUM_ONE, exports.arbitrumPoolIDsToToken);
exports.optimismPoolIDsToToken = new graph_ts_1.TypedMap();
exports.optimismPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(1), graph_ts_1.Address.fromString("0x7f5c764cbc14f9669b88837ca1490cca17c31607"));
exports.optimismPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(3), graph_ts_1.Address.fromString("0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"));
exports.optimismPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(7), graph_ts_1.Address.fromString("0x2E3D870790dC77A83DD1d18184Acc7439A53f475"));
exports.optimismPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(13), graph_ts_1.Address.fromString("0xb69c8CBCD90A39D8D3d3ccf0a3E968511C3856A0"));
exports.optimismPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(14), graph_ts_1.Address.fromString("0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9"));
exports.optimismPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(15), graph_ts_1.Address.fromString("0xc40F949F8a4e094D1b49a23ea9241D289B7b2819"));
exports.optimismPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(16), graph_ts_1.Address.fromString("0x5421FA1A48f9FF81e4580557E86C7C0D24C18036"));
exports.crossPoolTokens.set(constants_1.Network.OPTIMISM, exports.optimismPoolIDsToToken);
exports.fantomPoolIDsToToken = new graph_ts_1.TypedMap();
exports.fantomPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(1), graph_ts_1.Address.fromString("0x04068da6c83afcfa0e13ba15a6696662335d5b75"));
exports.crossPoolTokens.set(constants_1.Network.FANTOM, exports.fantomPoolIDsToToken);
exports.metisPoolIDsToToken = new graph_ts_1.TypedMap();
exports.metisPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(17), graph_ts_1.Address.fromString("0xAad094F6A75A14417d39f04E690fC216f080A41a"));
exports.metisPoolIDsToToken.set(graph_ts_1.BigInt.fromI32(19), graph_ts_1.Address.fromString("0x2b60473a7C41Deb80EDdaafD5560e963440eb632"));
exports.crossPoolTokens.set(constants_1.Network.METIS, exports.metisPoolIDsToToken);
exports.basePoolIDsToToken = new graph_ts_1.TypedMap();
exports.basePoolIDsToToken.set(graph_ts_1.BigInt.fromI32(1), graph_ts_1.Address.fromString("0x4c80E24119CFB836cdF0a6b53dc23F04F7e652CA"));
exports.basePoolIDsToToken.set(graph_ts_1.BigInt.fromI32(13), graph_ts_1.Address.fromString("0x28fc411f9e1c480AD312b3d9C60c22b965015c6B"));
exports.crossPoolTokens.set(constants_1.Network.BASE, exports.basePoolIDsToToken);