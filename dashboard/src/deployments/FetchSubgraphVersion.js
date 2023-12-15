"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const react_1 = require("react");
const client_1 = require("@apollo/client");
const protocolQuery_1 = require("../queries/protocolQuery");
function FetchSubgraphVersion({ subgraphEndpoint, slug, setDeployments }) {
  const client = (0, react_1.useMemo)(() => (0, utils_1.NewClient)(subgraphEndpoint), []);
  // Generate query from subgraphEndpoints
  const [fetchProtocolMeta, { data: protocolMetaData, error: protocolMetaError }] = (0, client_1.useLazyQuery)(
    (0, client_1.gql)`
      ${protocolQuery_1.ProtocolQuery}
    `,
    {
      client: client,
    },
  );
  (0, react_1.useEffect)(() => {
    fetchProtocolMeta();
  }, []);
  (0, react_1.useEffect)(() => {
    if (protocolMetaData?.protocols) {
      if (protocolMetaData?.protocols?.length > 0) {
        setDeployments((prevState) => ({ ...prevState, [slug]: protocolMetaData.protocols[0].subgraphVersion }));
      }
    }
  }, [protocolMetaData]);
  (0, react_1.useEffect)(() => {
    if (!!protocolMetaError) {
      setDeployments((prevState) => ({ ...prevState, [slug]: protocolMetaError?.message || null }));
    }
  }, [protocolMetaError]);
  return null;
}
exports.default = FetchSubgraphVersion;
