"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBlock = void 0;
const schema_1 = require("../generated/schema");
const constants_1 = require("./constants");
function handleBlock(block) {
  let network = getOrCreateNetwork();
  network.currentBlock = block.number;
  network.save();
}
exports.handleBlock = handleBlock;
function getOrCreateNetwork() {
  let network = schema_1.Network.load(constants_1.NETWORK);
  if (!network) {
    network = new schema_1.Network(constants_1.NETWORK);
    network.subgraphVersion = constants_1.SUBGRAPH_VERSION;
    network.schemaVersion = constants_1.SCHEMA_VERSION;
    network.save();
  }
  return network;
}
