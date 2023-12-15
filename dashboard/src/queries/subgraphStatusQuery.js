"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingSubgraphsOnProtocolQuery =
  exports.idQuery =
  exports.nameQuery =
  exports.getPendingSubgraphId =
  exports.SubgraphStatusQuery =
    void 0;
const client_1 = require("@apollo/client");
const SubgraphStatusQuery = (url) => {
  if (url.includes("/name/")) {
    return exports.nameQuery;
  } else {
    return exports.idQuery;
  }
};
exports.SubgraphStatusQuery = SubgraphStatusQuery;
exports.getPendingSubgraphId = (0, client_1.gql)`
  query Status($subgraphName: String) {
    indexingStatusForPendingVersion(subgraphName: $subgraphName) {
      subgraph
      health
      entityCount
    }
  }
`;
exports.nameQuery = (0, client_1.gql)`
  query Status($subgraphName: String) {
    indexingStatusForCurrentVersion(subgraphName: $subgraphName) {
      subgraph
      node
      synced
      health
      fatalError {
        message
        block {
          number
          hash
        }
        handler
      }
      nonFatalErrors {
        message
        block {
          number
          hash
        }
        handler
      }
      chains {
        network
        chainHeadBlock {
          number
        }
        earliestBlock {
          number
        }
        latestBlock {
          number
        }
        lastHealthyBlock {
          number
        }
      }
      entityCount
    }
    indexingStatusForPendingVersion(subgraphName: $subgraphName) {
      subgraph
      node
      synced
      health
      fatalError {
        message
        block {
          number
          hash
        }
        handler
      }
      nonFatalErrors {
        message
        block {
          number
          hash
        }
        handler
      }
      chains {
        network
        chainHeadBlock {
          number
        }
        earliestBlock {
          number
        }
        latestBlock {
          number
        }
        lastHealthyBlock {
          number
        }
      }
      entityCount
    }
  }
`;
exports.idQuery = (0, client_1.gql)`
  query Status($deploymentIds: [String]) {
    indexingStatuses(subgraphs: $deploymentIds) {
      subgraph
      node
      synced
      health
      fatalError {
        message
        block {
          number
          hash
        }
        handler
      }
      nonFatalErrors {
        message
        block {
          number
          hash
        }
        handler
      }
      chains {
        network
        chainHeadBlock {
          number
        }
        earliestBlock {
          number
        }
        latestBlock {
          number
        }
        lastHealthyBlock {
          number
        }
      }
      entityCount
    }
  }
`;
function getPendingSubgraphsOnProtocolQuery(protocol) {
  if (!protocol) {
    return null;
  }
  try {
    const depoKeys = Object.keys(protocol).filter((x) => !x.toUpperCase().includes("DECENTRALIZED"));
    if (depoKeys.length > 0) {
      let query = `{`;
      depoKeys.forEach((depo) => {
        const slug = protocol[depo].split("name/")[1];
        query += `${slug
          .split("-")
          .join("_")
          .split("/")
          .join("_")}: indexingStatusForPendingVersion(subgraphName: "${slug}") {
          subgraph
          health
          entityCount
        }`;
      });
      query += ` }`;
      return (0, client_1.gql)`
        ${query}
      `;
    }
    return null;
  } catch (err) {
    console.error(err.message);
    return null;
  }
}
exports.getPendingSubgraphsOnProtocolQuery = getPendingSubgraphsOnProtocolQuery;
