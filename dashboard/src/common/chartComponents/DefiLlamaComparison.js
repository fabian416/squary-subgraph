"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const IssuesDisplay_1 = __importDefault(require("../../interfaces/IssuesDisplay"));
const material_1 = require("@mui/material");
const CopyLinkToClipboard_1 = require("../utilComponents/CopyLinkToClipboard");
const Chart_1 = require("./Chart");
const ComparisonTable_1 = require("./ComparisonTable");
const utils_1 = require("../../utils");
const DeploymentsDropDown_1 = require("../utilComponents/DeploymentsDropDown");
const chart_js_1 = require("chart.js");
const moment_1 = __importDefault(require("moment"));
// This component is for each individual subgraph
function DefiLlamaComparsionTab({ subgraphEndpoints, financialsData }) {
  function jpegDownloadHandler() {
    try {
      const fileName =
        defiLlamaSlug?.split(" (").join("-")?.split(")")?.join("-")?.split(" ")?.join("-") +
        moment_1.default.utc(Date.now()).format("MMDDYY") +
        ".jpeg";
      const link = document.createElement("a");
      link.download = fileName;
      link.href = chartRef.current?.toBase64Image("image/jpeg", 1);
      link.click();
    } catch (err) {
      return;
    }
  }
  chart_js_1.Chart.register(...chart_js_1.registerables);
  chart_js_1.Chart.register(chart_js_1.PointElement);
  const [issuesState, setIssues] = (0, react_1.useState)([]);
  const issues = issuesState;
  const [defiLlamaRequestLoading, setDefiLlamaRequestLoading] = (0, react_1.useState)(false);
  const [deploymentURL, setDeploymentURL] = (0, react_1.useState)("");
  const [defiLlamaSlug, setDefiLlamaSlug] = (0, react_1.useState)("");
  const [defiLlamaData, setDefiLlamaData] = (0, react_1.useState)({});
  const [defiLlamaProtocols, setDefiLlamaProtocols] = (0, react_1.useState)([]);
  const [defiLlamaProtocolFetchError, setDefiLlamaProtocolFetchError] = (0, react_1.useState)(false);
  const [includeStakedTVL, setIncludeStakedTVL] = (0, react_1.useState)(true);
  const [includeBorrowedTVL, setIncludeBorrowedTVL] = (0, react_1.useState)(true);
  const chartRef = (0, react_1.useRef)(null);
  const deploymentNameToUrlMapping = {};
  try {
    Object.values(subgraphEndpoints).forEach((protocolsOnType) => {
      Object.entries(protocolsOnType).forEach(([protocolName, deploymentOnNetwork]) => {
        protocolName = protocolName.toLowerCase();
        deploymentNameToUrlMapping[protocolName] = {
          slug: "",
          defiLlamaNetworks: [],
          subgraphNetworks: deploymentOnNetwork,
        };
        if (protocolName.includes("-v")) {
          const protocolNameVersionRemoved = protocolName.split("-v")[0];
          deploymentNameToUrlMapping[protocolNameVersionRemoved] = {
            slug: "",
            defiLlamaNetworks: [],
            subgraphNetworks: deploymentOnNetwork,
          };
        }
        if (protocolName.includes("-finance")) {
          deploymentNameToUrlMapping[protocolName.split("-finance")[0]] = {
            slug: "",
            defiLlamaNetworks: [],
            subgraphNetworks: deploymentOnNetwork,
          };
        } else {
          deploymentNameToUrlMapping[protocolName + "-finance"] = {
            slug: "",
            defiLlamaNetworks: [],
            subgraphNetworks: deploymentOnNetwork,
          };
        }
      });
    });
    if (defiLlamaProtocols.length > 0) {
      defiLlamaProtocols.forEach((protocol) => {
        const currentName = protocol.name.toLowerCase().split(" ").join("-");
        if (
          Object.keys(deploymentNameToUrlMapping).includes(currentName) ||
          Object.keys(deploymentNameToUrlMapping).includes(currentName.split("-")[0])
        ) {
          const key = Object.keys(deploymentNameToUrlMapping).includes(currentName)
            ? currentName
            : currentName.split("-")[0];
          deploymentNameToUrlMapping[key].slug = protocol.slug;
          deploymentNameToUrlMapping[key].defiLlamaNetworks = Object.keys(protocol.chainTvls).map((x) =>
            x.toLowerCase(),
          );
        }
      });
    }
  } catch (err) {
    console.error(err.message);
  }
  const fetchDefiLlamaProtocols = () => {
    try {
      setDefiLlamaRequestLoading(true);
      fetch(process.env.REACT_APP_DEFILLAMA_BASE_URL + "/protocols", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (json) {
          setDefiLlamaRequestLoading(false);
          setDefiLlamaProtocols(json);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.error(error);
    }
  };
  (0, react_1.useEffect)(() => {
    fetchDefiLlamaProtocols();
  }, []);
  const defiLlama = () => {
    try {
      fetch(
        process.env.REACT_APP_DEFILLAMA_BASE_URL + "/protocol/" + defiLlamaSlug?.split(" (")[0].split(" ").join("-"),
        {
          method: "GET",
        },
      )
        .then(function (res) {
          return res.json();
        })
        .then(function (json) {
          setDefiLlamaData(json);
        })
        .catch((err) => {
          setDefiLlamaProtocolFetchError(true);
          console.log(err);
        });
    } catch (error) {
      console.error(error);
    }
  };
  (0, react_1.useEffect)(() => {
    setDefiLlamaProtocolFetchError(false);
    if (defiLlamaSlug.length > 0) {
      setDefiLlamaData({});
      defiLlama();
    }
  }, [defiLlamaSlug, deploymentURL]);
  (0, react_1.useEffect)(() => {
    setIssues(issues);
  }, [issuesState]);
  let chart = null;
  let chartRenderCondition =
    Object.keys(defiLlamaData).length > 0 &&
    financialsData?.financialsDailySnapshots &&
    defiLlamaData?.name?.split(" ")[0].toLowerCase() === defiLlamaSlug?.split("-")[0].split(" (")[0]?.toLowerCase();
  let stakedDataset = "";
  let borrowedDataset = "";
  try {
    if (chartRenderCondition) {
      let dataset = "";
      Object.keys(defiLlamaData.chainTvls).forEach((chain) => {
        let networkName = defiLlamaSlug?.split(" (")[1]?.split(")")[0]?.toUpperCase();
        if (networkName === "MAINNET") {
          networkName = "ETHEREUM";
        }
        if (networkName === "MATIC") {
          networkName = "POLYGON";
        }
        if (chain.toUpperCase() === networkName) {
          dataset = chain;
        }
        if (chain.toUpperCase() === networkName + "-STAKING") {
          stakedDataset = chain;
        }
        if (chain.toUpperCase() === networkName + "-BORROWED") {
          borrowedDataset = chain;
        }
      });
      let compChart = {
        defiLlama: defiLlamaData.chainTvls[dataset].tvl.map((x, idx) => {
          let value = x.totalLiquidityUSD;
          const date = (0, utils_1.toDate)(x.date);
          if (defiLlamaData.chainTvls[stakedDataset]) {
            const stakedDatapoint = defiLlamaData.chainTvls[stakedDataset]?.tvl?.find(
              (x) => (0, utils_1.toDate)(x.date) === date,
            );
            if (stakedDatapoint && includeStakedTVL) {
              value += stakedDatapoint.totalLiquidityUSD;
            }
          }
          if (defiLlamaData.chainTvls[borrowedDataset]) {
            const borrowedDatapoint = defiLlamaData.chainTvls[borrowedDataset]?.tvl?.find(
              (x) => (0, utils_1.toDate)(x.date) === date,
            );
            if (borrowedDatapoint && includeBorrowedTVL) {
              value += borrowedDatapoint.totalLiquidityUSD;
            }
          }
          return { value: value, date: x.date };
        }),
        subgraph: financialsData.financialsDailySnapshots
          .map((x) => ({
            value: parseFloat(x.totalValueLockedUSD),
            date: parseInt(x.timestamp),
          }))
          .reverse(),
      };
      compChart = (0, utils_1.lineupChartDatapoints)({ ...compChart });
      if (compChart instanceof Error) {
        throw new Error(compChart?.message);
      }
      const elementId = `Daily Chart - ${defiLlamaSlug}`;
      chart = (
        <div key={elementId} id={elementId}>
          <material_1.Box mt={3} mb={1}>
            <CopyLinkToClipboard_1.CopyLinkToClipboard link={window.location.href} scrollId={elementId}>
              <material_1.Typography variant="h6">TVL Comparison</material_1.Typography>
            </CopyLinkToClipboard_1.CopyLinkToClipboard>
          </material_1.Box>
          <material_1.Grid container justifyContent="space-between">
            <material_1.Grid key={elementId} item xs={7.5}>
              <Chart_1.Chart datasetLabel={`Chart-${defiLlamaSlug}`} dataChart={compChart} chartRef={chartRef} />
            </material_1.Grid>
            <material_1.Grid key={elementId + "2"} item xs={4}>
              <ComparisonTable_1.ComparisonTable
                datasetLabel="Data Comparison"
                dataTable={compChart}
                isHourly={false}
                jpegDownloadHandler={() => jpegDownloadHandler()}
                baseKey="subgraph"
                overlayKey="defiLlama"
              />
            </material_1.Grid>
          </material_1.Grid>
        </div>
      );
    } else if (deploymentURL || defiLlamaSlug) {
      chart = <material_1.CircularProgress sx={{ my: 5 }} size={40} />;
    }
  } catch (err) {
    chart = null;
    console.error(err.message);
  }
  (0, react_1.useEffect)(() => {
    setIssues([]);
  }, [deploymentURL]);
  if (defiLlamaRequestLoading) {
    chart = <material_1.CircularProgress sx={{ my: 5 }} size={40} />;
  }
  let valueToggles = null;
  if (chartRenderCondition) {
    let stakedTVL = (
      <material_1.Button disabled={true} variant="contained" color="primary" sx={{ my: 4, marginRight: "16px" }}>
        {"Include Staked TVL"}
      </material_1.Button>
    );
    if (stakedDataset) {
      stakedTVL = (
        <material_1.Button
          variant="contained"
          color="primary"
          sx={{ my: 4, marginRight: "16px" }}
          onClick={() => setIncludeStakedTVL(!includeStakedTVL)}
        >
          {includeStakedTVL ? "Disclude Staked TVL" : "Include Staked TVL"}
        </material_1.Button>
      );
    }
    let borrowedTVL = (
      <material_1.Button disabled={true} variant="contained" color="primary" sx={{ my: 4 }}>
        {"Include Borrowed TVL"}
      </material_1.Button>
    );
    if (borrowedDataset) {
      borrowedTVL = (
        <material_1.Button
          variant="contained"
          color="primary"
          sx={{ my: 4 }}
          onClick={() => setIncludeBorrowedTVL(!includeBorrowedTVL)}
        >
          {includeBorrowedTVL ? "Disclude Borrowed TVL" : "Include Borrowed TVL"}
        </material_1.Button>
      );
    }
    valueToggles = (
      <div style={{ display: "flex" }}>
        {stakedTVL}
        {borrowedTVL}
      </div>
    );
  }
  if (defiLlamaProtocolFetchError) {
    chart = null;
  }
  return (
    <>
      <div>
        <DeploymentsDropDown_1.DeploymentsDropDown
          setDeploymentURL={(x) => setDeploymentURL(x)}
          setDefiLlamaSlug={(x) => setDefiLlamaSlug(x)}
          setIssues={(x) => setIssues(x)}
          issuesProps={issues}
          deploymentURL={deploymentURL}
          deploymentJSON={deploymentNameToUrlMapping}
        />
        {valueToggles}
        <IssuesDisplay_1.default issuesArrayProps={issues} allLoaded={true} oneLoaded={true} />
        {chart}
      </div>
    </>
  );
}
exports.default = DefiLlamaComparsionTab;
