"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const react_1 = require("react");
const client_1 = require("@apollo/client");
const fetchEntityQuery_1 = require("../queries/fetchEntityQuery");
function FetchEntityCSV({
  entityName,
  deployment,
  protocolType,
  schemaVersion,
  timestampLt,
  timestampGt,
  queryURL,
  resultsObject,
  setResultsObject,
}) {
  const query = (0, fetchEntityQuery_1.queryOnEntity)(
    protocolType,
    schemaVersion,
    timestampLt,
    timestampGt,
    entityName,
  );
  const clientIndexing = (0, react_1.useMemo)(() => (0, utils_1.NewClient)(queryURL), []);
  // Generate query from subgraphEndpoints
  const [fetchEntity, { data: entity, loading: entityLoading, error: entityError }] = (0, client_1.useLazyQuery)(
    (0, client_1.gql)`
      ${query}
    `,
    {
      client: clientIndexing,
    },
  );
  (0, react_1.useEffect)(() => {
    fetchEntity();
  }, []);
  (0, react_1.useEffect)(() => {
    if (entity) {
      // Convert all instances to csv
      const entityJSON = entity[entityName].map((x) => ({ "protocol-chain": deployment, ...x }));
      setResultsObject((prevState) => ({ ...prevState, [deployment]: entityJSON }));
    }
  }, [entity]);
  (0, react_1.useEffect)(() => {
    if (entityError) {
      setResultsObject((prevState) => ({ ...prevState, [deployment]: entityError.message }));
    }
  }, [entityError]);
  // No need to return a JSX element to render, function needed for state management
  return null;
}
exports.default = FetchEntityCSV;
