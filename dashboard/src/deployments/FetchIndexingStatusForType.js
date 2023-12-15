"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const react_1 = require("react");
const client_1 = require("@apollo/client");
const FetchPendingSubgraphVersion_1 = __importDefault(require("./FetchPendingSubgraphVersion"));
function FetchIndexingStatusForType({ slugs, setDeployments }) {
  const clientIndexing = (0, react_1.useMemo)(
    () => (0, utils_1.NewClient)(process.env.REACT_APP_GRAPH_BASE_URL + "/index-node/graphql"),
    [],
  );
  const [slugsToCheck, setSlugsToCheck] = (0, react_1.useState)([]);
  let fullPendingQueryArray = ["query {"];
  slugs.forEach((slug) => {
    fullPendingQueryArray[fullPendingQueryArray.length - 1] += `      
              ${slug.split("-").join("_")}: indexingStatusForPendingVersion(subgraphName: "messari/${slug}") {
                    subgraph
                }
          `;
  });
  fullPendingQueryArray.push("}");
  const [fetchPendingIndexData, { data: pendingIndexData }] = (0, client_1.useLazyQuery)(
    (0, client_1.gql)`
      ${fullPendingQueryArray.join("")}
    `,
    {
      client: clientIndexing,
    },
  );
  (0, react_1.useEffect)(() => {
    if (slugs.length > 0) {
      fetchPendingIndexData();
    }
  }, []);
  (0, react_1.useEffect)(() => {
    if (pendingIndexData) {
      const slugsToQuery = Object.keys(pendingIndexData).map((protocolKey) => {
        const realSlug = protocolKey.split("_").join("-");
        if (pendingIndexData[protocolKey]?.subgraph) {
          return { slug: realSlug, id: pendingIndexData[protocolKey]?.subgraph };
        }
        return null;
      });
      setSlugsToCheck(slugsToQuery.filter((x) => !!x));
    }
  }, [pendingIndexData]);
  if (slugsToCheck?.length > 0) {
    return (
      <>
        {slugsToCheck.map((obj) => (
          <FetchPendingSubgraphVersion_1.default
            subgraphEndpoint={process.env.REACT_APP_GRAPH_BASE_URL + "/subgraphs/id/" + obj.id}
            slug={obj.slug + " (Pending)"}
            setDeployments={setDeployments}
          />
        ))}
      </>
    );
  }
  return null;
}
exports.default = FetchIndexingStatusForType;
