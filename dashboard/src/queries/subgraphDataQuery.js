"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subgraphDataQuery = void 0;
const client_1 = require("@apollo/client");
exports.subgraphDataQuery = (0, client_1.gql)`
  query Data($subgraphName: String) {
    subgraph(subgraphName: $subgraphName, accountName: "messari") {
      deployedAt
    }
  }
`;
