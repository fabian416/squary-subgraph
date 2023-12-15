"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const ProtocolDashboard_1 = __importDefault(require("./interfaces/ProtocolDashboard"));
const DeploymentsPage_1 = __importDefault(require("./deployments/DeploymentsPage"));
const IssuesDisplay_1 = __importDefault(require("./interfaces/IssuesDisplay"));
const ProtocolsListByTVL_1 = __importDefault(require("./deployments/ProtocolsListByTVL"));
const VersionComparison_1 = __importDefault(require("./deployments/VersionComparison"));
const DashboardHeader_1 = require("./common/headerComponents/DashboardHeader");
const DashboardVersion_1 = require("./common/DashboardVersion");
const react_router_1 = require("react-router");
const react_1 = require("react");
const utils_1 = require("./utils");
const client_1 = require("@apollo/client");
const decentralizedNetworkSubgraphsQuery_1 = require("./queries/decentralizedNetworkSubgraphsQuery");
function App() {
  console.log("RUNNING VERSION " + DashboardVersion_1.dashboardVersion);
  const [loading, setLoading] = (0, react_1.useState)(false);
  const [protocolsToQuery, setProtocolsToQuery] = (0, react_1.useState)({});
  const [issuesMapping, setIssuesMapping] = (0, react_1.useState)({});
  const getGithubRepoIssues = () => {
    try {
      fetch(process.env.REACT_APP_GITHUB_ISSUES_URL + "?per_page=100&state=open&sort=updated", {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (json) {
          if (Array.isArray(json)) {
            let newIssuesMapping = {};
            json.forEach((x) => {
              const key = x.title.toUpperCase().split(" ").join(" ") || "";
              newIssuesMapping[key] = x.html_url;
            });
            setIssuesMapping(newIssuesMapping);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.error(error);
    }
  };
  const getDeployments = () => {
    if (Object.keys(protocolsToQuery).length === 0) {
      setLoading(true);
      try {
        fetch(process.env.REACT_APP_MESSARI_STATUS_URL, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "x-messari-api-key": process.env.REACT_APP_MESSARI_API_KEY,
          },
        })
          .then(function (res) {
            return res.json();
          })
          .then(function (json) {
            setLoading(false);
            setProtocolsToQuery(json);
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        setLoading(false);
        console.error(error);
      }
    }
  };
  const depoCount = {
    all: { totalCount: 0, prodCount: 0, devCount: 0 },
  };
  // Construct subgraph endpoints
  const subgraphEndpoints = {};
  if (Object.keys(protocolsToQuery)?.length > 0) {
    Object.keys(protocolsToQuery).forEach((protocolName) => {
      const protocol = protocolsToQuery[protocolName];
      let isDev = false;
      let schemaType = protocol.schema;
      if (utils_1.schemaMapping[protocol.schema]) {
        schemaType = utils_1.schemaMapping[protocol.schema];
      }
      if (schemaType) {
        if (!Object.keys(subgraphEndpoints).includes(schemaType)) {
          subgraphEndpoints[schemaType] = {};
        }
        if (!Object.keys(subgraphEndpoints[schemaType]).includes(protocolName)) {
          subgraphEndpoints[schemaType][protocolName] = {};
        }
      }
      Object.values(protocol.deployments).forEach((depoData) => {
        if (!depoData?.services) {
          return;
        }
        if (
          schemaType &&
          (!!depoData["services"]["hosted-service"] || !!depoData["services"]["decentralized-network"])
        ) {
          if (!!subgraphEndpoints[schemaType][protocolName][depoData.network]) {
            const protocolKeyArr = depoData["services"]["hosted-service"]["slug"].split("-");
            const networkKey = protocolKeyArr.pop();
            subgraphEndpoints[schemaType][protocolKeyArr.join("-")] = {};
            subgraphEndpoints[schemaType][protocolKeyArr.join("-")][networkKey] =
              process.env.REACT_APP_GRAPH_BASE_URL +
              "/subgraphs/name/messari/" +
              depoData["services"]["hosted-service"]["slug"];
          } else {
            subgraphEndpoints[schemaType][protocolName][depoData.network] =
              process.env.REACT_APP_GRAPH_BASE_URL +
              "/subgraphs/name/messari/" +
              depoData["services"]["hosted-service"]["slug"];
          }
        }
        if (!depoCount[schemaType]) {
          depoCount[schemaType] = { totalCount: 0, prodCount: 0, devCount: 0 };
        }
        depoCount.all.totalCount += 1;
        depoCount[schemaType].totalCount += 1;
        if (depoData?.status === "dev") {
          isDev = true;
        }
      });
      if (isDev) {
        depoCount.all.devCount += 1;
        depoCount[schemaType].devCount += 1;
      } else {
        depoCount.all.prodCount += 1;
        depoCount[schemaType].prodCount += 1;
      }
    });
  }
  (0, react_1.useEffect)(() => {
    getGithubRepoIssues();
  }, []);
  const [decentralizedDeployments, setDecentralizedDeployments] = (0, react_1.useState)({});
  const clientDecentralizedEndpoint = (0, react_1.useMemo)(
    () =>
      (0, utils_1.NewClient)(
        process.env.REACT_APP_GRAPH_BASE_URL + "/subgraphs/name/graphprotocol/graph-network-arbitrum",
      ),
    [],
  );
  const { data: decentralized } = (0, client_1.useQuery)(
    decentralizedNetworkSubgraphsQuery_1.decentralizedNetworkSubgraphsQuery,
    {
      client: clientDecentralizedEndpoint,
    },
  );
  (0, react_1.useEffect)(() => {
    if (decentralized && !Object.keys(decentralizedDeployments)?.length) {
      const decenDepos = {};
      const subgraphsOnDecenAcct = [
        ...decentralized.graphAccounts[0].subgraphs,
        // ...decentralized.graphAccounts[1].subgraphs,
      ];
      subgraphsOnDecenAcct.forEach((sub) => {
        try {
          let name = sub.currentVersion?.subgraphDeployment?.originalName?.toLowerCase()?.split(" ");
          if (!name) {
            name = sub?.displayName?.toLowerCase()?.split(" ");
          }
          name.pop();
          name = name.join("-");
          const network = sub.currentVersion.subgraphDeployment.network.id;
          const deploymentId = sub.currentVersion.subgraphDeployment.ipfsHash;
          const signalledTokens = sub.currentVersion.subgraphDeployment.signalledTokens;
          const subgraphId = sub.id;
          if (!(name in decenDepos)) {
            decenDepos[name] = [];
          }
          decenDepos[name].push({ network, deploymentId, subgraphId, signalledTokens });
        } catch (err) {
          return;
        }
      });
      setDecentralizedDeployments(decenDepos);
    }
  }, [decentralized]);
  return (
    <div>
      <DashboardVersion_1.DashboardVersion />
      <react_router_1.Routes>
        <react_router_1.Route path="/">
          <react_router_1.Route
            index
            element={
              <DeploymentsPage_1.default
                issuesMapping={issuesMapping}
                getData={() => getDeployments()}
                loading={loading}
                protocolsToQuery={protocolsToQuery}
                subgraphCounts={depoCount}
                decentralizedDeployments={decentralizedDeployments}
              />
            }
          />
          <react_router_1.Route
            path="subgraph"
            element={
              <ProtocolDashboard_1.default
                protocolJSON={protocolsToQuery}
                getData={() => getDeployments()}
                subgraphEndpoints={subgraphEndpoints}
                decentralizedDeployments={decentralizedDeployments}
              />
            }
          />
          <react_router_1.Route
            path="protocols-list"
            element={
              <ProtocolsListByTVL_1.default protocolsToQuery={protocolsToQuery} getData={() => getDeployments()} />
            }
          />
          <react_router_1.Route
            path="version-comparison"
            element={
              <VersionComparison_1.default protocolsToQuery={protocolsToQuery} getData={() => getDeployments()} />
            }
          />
          <react_router_1.Route
            path="*"
            element={
              <>
                <DashboardHeader_1.DashboardHeader
                  protocolData={undefined}
                  versionsJSON={{}}
                  protocolId=""
                  subgraphToQueryURL=""
                  schemaVersion=""
                />
                <IssuesDisplay_1.default
                  oneLoaded={true}
                  allLoaded={true}
                  issuesArrayProps={[
                    {
                      message: "404: The route entered does not exist.",
                      type: "404",
                      level: "critical",
                      fieldName: "",
                    },
                  ]}
                />
              </>
            }
          />
        </react_router_1.Route>
      </react_router_1.Routes>
    </div>
  );
}
exports.default = App;
