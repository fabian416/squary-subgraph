"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const material_1 = require("@mui/material");
const utils_1 = require("../utils");
const chart_js_1 = require("chart.js");
const FetchSubgraphVersion_1 = __importDefault(require("./FetchSubgraphVersion"));
const react_router_1 = require("react-router");
const FetchIndexingStatusForType_1 = __importDefault(require("./FetchIndexingStatusForType"));
function isVersionMismatch(versionPending, versionDecen, versionHostedService, versionJSON) {
  if (versionPending && versionJSON !== versionPending) {
    return true;
  }
  if (versionDecen && versionJSON !== versionDecen) {
    return true;
  }
  if (versionHostedService && versionJSON !== versionHostedService) {
    return true;
  }
  return false;
}
function getPriorityColor(version, versionJSON) {
  const versionChangesEntity = version.split(".");
  const versionChangesJSON = versionJSON.split(".");
  let priorityColor = "none";
  if (versionChangesEntity[2] !== versionChangesJSON[2]) {
    priorityColor = "yellow";
  }
  if (versionChangesEntity[1] !== versionChangesJSON[1]) {
    priorityColor = "orange";
  }
  if (versionChangesEntity[0] !== versionChangesJSON[0]) {
    priorityColor = "#B8301C";
  }
  return priorityColor;
}
function VersionComparison({ protocolsToQuery, getData }) {
  chart_js_1.Chart.register(...chart_js_1.registerables);
  chart_js_1.Chart.register(chart_js_1.PointElement);
  const navigate = (0, react_router_1.useNavigate)();
  const [subgraphVersionMapping, setSubgraphVersionMapping] = (0, react_1.useState)({});
  const prodDeploymentsToQuery = [];
  const slugToVersionJSON = {};
  const slugsListByType = {};
  const slugToQueryString = {};
  (0, react_1.useEffect)(() => {
    if (!protocolsToQuery || Object.keys(protocolsToQuery).length === 0) {
      getData();
    }
  }, []);
  Object.keys(protocolsToQuery).forEach((protocol) => {
    Object.keys(protocolsToQuery[protocol].deployments).forEach((depo) => {
      if (protocolsToQuery[protocol].deployments[depo].status === "prod") {
        const schemaName = utils_1.schemaMapping[protocolsToQuery[protocol].schema];
        if (schemaName) {
          prodDeploymentsToQuery.push(protocolsToQuery[protocol].deployments[depo]);
          const depoData = protocolsToQuery[protocol].deployments[depo];
          let slug = depoData?.["services"]?.["hosted-service"]?.["slug"];
          if (depoData.network === "cronos") {
            slug = depoData?.["services"]?.["cronos-portal"]?.["slug"];
          }
          if (!slugsListByType[schemaName]) {
            slugsListByType[schemaName] = [];
          }
          slugToVersionJSON[slug] = protocolsToQuery[protocol].deployments[depo].versions.subgraph;
          slugsListByType[schemaName].push(slug);
          if (depoData?.["services"]?.["decentralized-network"]) {
            slugsListByType[schemaName].push(slug + " (Decentralized)");
          }
        }
      }
    });
  });
  let fetchVersionComponent = null;
  if (prodDeploymentsToQuery.length > 0) {
    fetchVersionComponent = (
      <>
        {prodDeploymentsToQuery.map((depo) => {
          let slug = depo?.["services"]?.["hosted-service"]?.["slug"];
          let endpoint = process.env.REACT_APP_GRAPH_BASE_URL + "/subgraphs/name/messari/" + slug;
          if (depo.network === "cronos") {
            slug = depo?.["services"]?.["cronos-portal"]?.["slug"];
            endpoint = process.env.REACT_APP_GRAPH_CRONOS_URL + "/subgraphs/name/messari/" + slug;
          }
          slugToQueryString[slug] = "messari/" + slug;
          let decentralizedFetch = null;
          if (depo?.["services"]?.["decentralized-network"]) {
            let decenEndpoint =
              process.env.REACT_APP_GRAPH_DECEN_URL +
              "/api/" +
              process.env.REACT_APP_GRAPH_API_KEY +
              "/subgraphs/id/" +
              depo?.["services"]?.["decentralized-network"]?.["query-id"];
            slugToQueryString[slug + " (Decentralized)"] = decenEndpoint;
            decentralizedFetch = (
              <FetchSubgraphVersion_1.default
                subgraphEndpoint={decenEndpoint}
                slug={slug + " (Decentralized)"}
                setDeployments={setSubgraphVersionMapping}
              />
            );
          }
          return (
            <>
              <FetchSubgraphVersion_1.default
                subgraphEndpoint={endpoint}
                slug={slug}
                setDeployments={setSubgraphVersionMapping}
              />
              {decentralizedFetch}
            </>
          );
        })}
      </>
    );
  }
  const columnLabels = ["Deployment", "Schema Type", "Pending", "Decentralized", "Hosted Service", "JSON"];
  const tableHead = (
    <material_1.TableHead sx={{ height: "20px" }}>
      <material_1.TableRow sx={{ height: "20px" }}>
        {columnLabels.map((col, idx) => {
          let textAlign = "left";
          let paddingLeft = "0px";
          let minWidth = "auto";
          let maxWidth = "auto";
          if (idx > 1) {
            textAlign = "right";
            paddingLeft = "16px";
          }
          if (idx === 0) {
            minWidth = "300px";
            maxWidth = "300px";
          }
          return (
            <material_1.TableCell sx={{ paddingLeft, minWidth, maxWidth, paddingRight: 0 }} key={"column" + col}>
              <material_1.Typography variant="h5" fontSize={14} fontWeight={500} sx={{ margin: "0", textAlign }}>
                {col}
              </material_1.Typography>
            </material_1.TableCell>
          );
        })}
      </material_1.TableRow>
    </material_1.TableHead>
  );
  const tablesBySchemaType = Object.keys(slugsListByType).map((type) => {
    const failedQueryRows = [];
    const decenDepos = {};
    slugsListByType[type].forEach((depo) => {
      if (depo.includes(" (Decentralized)")) {
        const hostedServiceSlug = depo.split(" (Decentralized)").join("");
        decenDepos[hostedServiceSlug] = subgraphVersionMapping[depo];
      }
    });
    const rowsOnTypeTable = slugsListByType[type].map((depo) => {
      const versionPending = subgraphVersionMapping[depo + " (Pending)"] || "";
      const versionDecen = decenDepos[depo] || "";
      const versionHostedService = subgraphVersionMapping[depo] || "";
      const versionJSON = slugToVersionJSON[depo] || "";
      if (
        depo.includes(" (Decentralized)") ||
        !isVersionMismatch(versionPending, versionDecen, versionHostedService, versionJSON)
      ) {
        return null;
      }
      if (subgraphVersionMapping[depo]?.includes(".") && slugToVersionJSON[depo]?.includes(".")) {
        return (
          <material_1.TableRow
            key={depo + "RowComp"}
            sx={{ height: "10px", width: "100%", backgroundColor: "rgba(22,24,29,0.9)", cursor: "pointer" }}
          >
            <material_1.TableCell
              sx={{ padding: "0 0 0 6px", verticalAlign: "middle", height: "30px", pointerEvents: "none" }}
            >
              {depo}
            </material_1.TableCell>
            <material_1.TableCell sx={{ padding: "0", paddingRight: "6px", textAlign: "left", pointerEvents: "none" }}>
              {type}
            </material_1.TableCell>
            <material_1.TableCell
              onClick={() =>
                (window.location.href = versionPending
                  ? "/subgraph?endpoint=" + slugToQueryString[depo] + "&tab=protocol&version=pending"
                  : "#")
              }
              sx={{
                padding: "0",
                paddingRight: "6px",
                textAlign: "right",
                color: getPriorityColor(versionPending, versionJSON),
              }}
            >
              {versionPending}
            </material_1.TableCell>
            <material_1.TableCell
              onClick={() =>
                (window.location.href = versionDecen
                  ? "/subgraph?endpoint=" + slugToQueryString[depo + " (Decentralized)"] + "&tab=protocol"
                  : "#")
              }
              sx={{
                padding: "0",
                paddingRight: "6px",
                textAlign: "right",
                color: getPriorityColor(versionDecen, versionJSON),
              }}
            >
              {versionDecen}
            </material_1.TableCell>
            <material_1.TableCell
              onClick={() =>
                (window.location.href = versionHostedService
                  ? "/subgraph?endpoint=" + slugToQueryString[depo] + "&tab=protocol"
                  : "#")
              }
              sx={{
                padding: "0",
                paddingRight: "6px",
                textAlign: "right",
                color: getPriorityColor(versionHostedService, versionJSON),
              }}
            >
              {versionHostedService}
            </material_1.TableCell>
            <material_1.TableCell sx={{ padding: "0", paddingRight: "6px", textAlign: "right", pointerEvents: "none" }}>
              {versionJSON}
            </material_1.TableCell>
          </material_1.TableRow>
        );
      } else if (subgraphVersionMapping[depo]) {
        failedQueryRows.push(
          <material_1.TableRow
            onClick={() =>
              (window.location.href = process.env.REACT_APP_OKGRAPH_BASE_URL + "/?q=" + slugToQueryString[depo])
            }
            key={depo + "RowComp"}
            sx={{ height: "10px", width: "100%", backgroundColor: "rgba(22,24,29,0.9)", cursor: "pointer" }}
          >
            <material_1.TableCell sx={{ padding: "0 0 0 6px", verticalAlign: "middle", height: "30px" }}>
              {depo}
            </material_1.TableCell>
            <material_1.TableCell sx={{ padding: "0", paddingRight: "6px", textAlign: "left", pointerEvents: "none" }}>
              {type}
            </material_1.TableCell>
            <material_1.TableCell sx={{ padding: "0", paddingRight: "6px", textAlign: "right", color: "#B8301C" }}>
              {versionPending}
            </material_1.TableCell>
            <material_1.TableCell sx={{ padding: "0", paddingRight: "6px", textAlign: "right", color: "#B8301C" }}>
              {versionDecen}
            </material_1.TableCell>
            <material_1.TableCell sx={{ padding: "0", paddingRight: "6px", textAlign: "right", color: "#B8301C" }}>
              {subgraphVersionMapping[depo]}
            </material_1.TableCell>
            <material_1.TableCell sx={{ padding: "0", paddingRight: "6px", textAlign: "right", pointerEvents: "none" }}>
              {versionJSON}
            </material_1.TableCell>
          </material_1.TableRow>,
        );
        return null;
      }
    });
    if (rowsOnTypeTable.filter((x) => !!x)?.length === 0) {
      return null;
    }
    return (
      <material_1.TableContainer sx={{ my: 4, mx: 2 }} key={"TableContainer-VersionComparison-" + type}>
        <div style={{ width: "97.5%" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <material_1.Typography variant="h2" align="left" fontSize={32}>
              {type}
            </material_1.Typography>
          </div>
        </div>
        <FetchIndexingStatusForType_1.default
          slugs={slugsListByType[type].filter((x) => !x.includes(" (Decentralized)"))}
          setDeployments={setSubgraphVersionMapping}
        />
        <material_1.Table sx={{ width: "97.5%" }} stickyHeader>
          {tableHead}
          {rowsOnTypeTable}
          {failedQueryRows}
        </material_1.Table>
      </material_1.TableContainer>
    );
  });
  return (
    <div style={{ overflowX: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", margin: "40px 24px 10px 16px" }}>
        <material_1.Button variant="contained" color="primary" onClick={() => navigate("/")}>
          Back To Deployments List
        </material_1.Button>
      </div>
      {fetchVersionComponent}
      {tablesBySchemaType}
    </div>
  );
}
exports.default = VersionComparison;
