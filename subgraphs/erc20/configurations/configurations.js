"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegistryIpfsHash = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const registry_1 = require("./registry/registry");
function getRegistryIpfsHash(year) {
  switch (year) {
    case 2017: {
      return registry_1.TokenRegistry.TOKENS_2017;
    }
    case 2018: {
      return registry_1.TokenRegistry.TOKENS_2018;
    }
    case 2019: {
      return registry_1.TokenRegistry.TOKENS_2019;
    }
    case 2020: {
      return registry_1.TokenRegistry.TOKENS_2020;
    }
    case 2021: {
      return registry_1.TokenRegistry.TOKENS_2021;
    }
    case 2022: {
      return registry_1.TokenRegistry.TOKENS_2022;
    }
    default: {
      graph_ts_1.log.critical(
        "No token registry found for deployment year",
        []
      );
      return registry_1.TokenRegistry.TOKENS_DEFAULT;
    }
  }
}
exports.getRegistryIpfsHash = getRegistryIpfsHash;
