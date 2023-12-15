"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
const react_1 = require("react");
const client_1 = require("@apollo/client");
function PendingCalls({ query, setPendingSubgraphData }) {
  const clientPending = (0, react_1.useMemo)(
    () => (0, utils_1.NewClient)(process.env.REACT_APP_GRAPH_BASE_URL + "/index-node/graphql"),
    [],
  );
  // Generate query from subgraphEndpoints
  const [fetchPending, { data: pendingRequest }] = (0, client_1.useLazyQuery)(query, {
    client: clientPending,
  });
  (0, react_1.useEffect)(() => {
    fetchPending();
  }, []);
  (0, react_1.useEffect)(() => {
    if (pendingRequest) {
      const objectToSet = {};
      Object.keys(pendingRequest).forEach((key) => {
        if (!pendingRequest[key]) {
          return;
        } else {
          const keyArr = key.split("_");
          const chainKey = keyArr[keyArr.length - 1];
          objectToSet[chainKey] = pendingRequest[key];
        }
      });
      setPendingSubgraphData(objectToSet);
    }
  }, [pendingRequest]);
  // No need to return a JSX element to render, function needed for state management
  return null;
}
exports.default = PendingCalls;
