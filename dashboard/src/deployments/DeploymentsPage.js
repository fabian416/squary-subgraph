"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const styled_1 = require("../styled");
const react_router_1 = require("react-router");
const SearchInput_1 = require("../common/utilComponents/SearchInput");
const DeploymentsContextProvider_1 = require("./DeploymentsContextProvider");
const material_1 = require("@mui/material");
const react_1 = require("react");
const DeploymentsTable_1 = __importDefault(require("./DeploymentsTable"));
const DevCountTable_1 = __importDefault(require("./DevCountTable"));
const DeploymentsLayout = (0, styled_1.styled)("div")`
  padding: 0;
`;
function DeploymentsPage({
  protocolsToQuery,
  loading,
  getData,
  subgraphCounts,
  decentralizedDeployments,
  issuesMapping,
}) {
  const [showSubgraphCountTable, setShowSubgraphCountTable] = (0, react_1.useState)(false);
  const [substreamsBasedSubgraphs, setSubstreamsBasedSubgraphs] = (0, react_1.useState)({});
  const [nonSubstreamsBasedSubgraphs, setNonSubstreamsBasedSubgraphs] = (0, react_1.useState)({});
  const [showSubstreamsBasedSubgraphs, setShowSubstreamsBasedSubgraphs] = (0, react_1.useState)(false);
  (0, react_1.useEffect)(() => {
    if (!protocolsToQuery || Object.keys(protocolsToQuery).length === 0) {
      getData();
    }
  }, []);
  (0, react_1.useEffect)(() => {
    let substreamsBasedSubgraphs = {};
    let nonSubstreamsBasedSubgraphs = {};
    Object.keys(protocolsToQuery).forEach((protocolName) => {
      const protocol = protocolsToQuery[protocolName];
      if (protocol.base === "substreams") {
        substreamsBasedSubgraphs[protocolName] = protocolsToQuery[protocolName];
      } else {
        nonSubstreamsBasedSubgraphs[protocolName] = protocolsToQuery[protocolName];
      }
    });
    setSubstreamsBasedSubgraphs(substreamsBasedSubgraphs);
    setNonSubstreamsBasedSubgraphs(nonSubstreamsBasedSubgraphs);
  }, [protocolsToQuery]);
  const navigate = (0, react_router_1.useNavigate)();
  window.scrollTo(0, 0);
  const decenDeposToSubgraphIds = {};
  if (Object.keys(decentralizedDeployments)?.length) {
    Object.keys(decentralizedDeployments).forEach((key) => {
      const protocolObj = Object.keys(protocolsToQuery).find((pro) => pro.includes(key));
      if (protocolObj) {
        decentralizedDeployments[key].forEach((item) => {
          if (item.signalledTokens > 0) {
            let networkStr = item.network;
            if (networkStr === "mainnet") {
              networkStr = "ethereum";
            }
            if (networkStr === "matic") {
              networkStr = "polygon";
            }
            if (networkStr === "arbitrum-one") {
              networkStr = "arbitrum";
            }
            let subgraphIdToMap = { id: "", signal: 0 };
            subgraphIdToMap = {
              id: item.subgraphId,
              signal: item.signalledTokens,
            };
            decenDeposToSubgraphIds[key + "-" + networkStr] = subgraphIdToMap;
          }
        });
      }
    });
  }
  // counts section
  let devCountTable = null;
  if (!!showSubgraphCountTable) {
    devCountTable = <DevCountTable_1.default subgraphCounts={subgraphCounts} />;
  }
  return (
    <DeploymentsContextProvider_1.DeploymentsContextProvider>
      <DeploymentsLayout>
        <SearchInput_1.SearchInput
          onSearch={(val) => {
            if (val) {
              navigate(`subgraph?endpoint=${val}&tab=protocol`);
            }
          }}
          placeholder="Subgraph query name ie. messari/balancer-v2-ethereum"
        >
          Load Subgraph
        </SearchInput_1.SearchInput>
        <material_1.Typography variant="h3" align="center" sx={{ my: 5 }}>
          Deployed Subgraphs
        </material_1.Typography>
        <div style={{ width: "100%", textAlign: "center" }}>
          <span
            style={{
              width: "0",
              flex: "1 1 0",
              textAlign: "center",
              marginTop: "0",
              borderRight: "#6656F8 2px solid",
              padding: "0 30px",
            }}
            className="Menu-Options"
            onClick={() => setShowSubgraphCountTable(!showSubgraphCountTable)}
          >
            {showSubgraphCountTable ? "Hide" : "Show"} Subgraph Count Table
          </span>
          <span
            style={{
              width: "0",
              flex: "1 1 0",
              textAlign: "center",
              marginTop: "0",
              borderRight: "#6656F8 2px solid",
              padding: "0 30px",
            }}
            className="Menu-Options"
            onClick={() => navigate("protocols-list")}
          >
            Protocols To Develop
          </span>
          <span
            style={{ padding: "0 30px", borderRight: "#6656F8 2px solid" }}
            className="Menu-Options"
            onClick={() => navigate("version-comparison")}
          >
            Version Comparison
          </span>
          <span
            style={{ padding: "0 30px" }}
            className="Menu-Options"
            onClick={() => {
              setShowSubstreamsBasedSubgraphs(!showSubstreamsBasedSubgraphs);
            }}
          >
            Show {showSubstreamsBasedSubgraphs ? "Non" : ""} Substreams Based Subgraphs
          </span>
        </div>
        {devCountTable}
        {loading ? (
          <div
            className="loader-container"
            style={{
              width: "100%",
              height: "100vh",
              position: "fixed",
              zIndex: 1001,
              background:
                "transparent url('https://media.giphy.com/media/8agqybiK5LW8qrG3vJ/giphy.gif') center no-repeat",
            }}
          ></div>
        ) : (
          <DeploymentsTable_1.default
            getData={() => getData()}
            issuesMapping={issuesMapping}
            protocolsToQuery={showSubstreamsBasedSubgraphs ? substreamsBasedSubgraphs : nonSubstreamsBasedSubgraphs}
            decenDeposToSubgraphIds={decenDeposToSubgraphIds}
          />
        )}
      </DeploymentsLayout>
    </DeploymentsContextProvider_1.DeploymentsContextProvider>
  );
}
exports.default = DeploymentsPage;
