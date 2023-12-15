"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolQuery = void 0;
const client_1 = require("@apollo/client");
exports.ProtocolQuery = (0, client_1.gql)`
  {
    protocols(subgraphError: allow) {
      type
      slug
      network
      schemaVersion
      subgraphVersion
      methodologyVersion
      name
      id
    }
    _meta {
      deployment
      block {
        number
      }
    }
  }
`;
