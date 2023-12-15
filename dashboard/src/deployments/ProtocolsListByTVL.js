"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const material_1 = require("@mui/material");
const utils_1 = require("../utils");
const chart_js_1 = require("chart.js");
const react_router_1 = require("react-router");
const NetworkLogo_1 = require("../common/NetworkLogo");
const ProtocolTypeDropDown_1 = require("../common/utilComponents/ProtocolTypeDropDown");
function ProtocolsListByTVL({ protocolsToQuery, getData }) {
  const navigate = (0, react_router_1.useNavigate)();
  chart_js_1.Chart.register(...chart_js_1.registerables);
  chart_js_1.Chart.register(chart_js_1.PointElement);
  const [defiLlamaProtocols, setDefiLlamaProtocols] = (0, react_1.useState)([]);
  const [defiLlamaProtocolsLoading, setDefiLlamaProtocolsLoading] = (0, react_1.useState)(false);
  const [currentProtocolType, setProtocolType] = (0, react_1.useState)("All Protocol Types");
  const fetchDefiLlamaProtocols = () => {
    try {
      setDefiLlamaProtocolsLoading(true);
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
          setDefiLlamaProtocols(json);
          setDefiLlamaProtocolsLoading(false);
        })
        .catch((err) => {
          setDefiLlamaProtocolsLoading(false);
          console.log(err);
        });
    } catch (error) {
      console.error(error);
    }
  };
  (0, react_1.useEffect)(() => {
    fetchDefiLlamaProtocols();
  }, []);
  (0, react_1.useEffect)(() => {
    if (!protocolsToQuery || Object.keys(protocolsToQuery).length === 0) {
      getData();
    }
  }, []);
  const categoryTypesSupported = {
    "All Protocol Types": "All Protocol Types",
    yield: "Vaults",
    "yield aggregator": "Vaults",
    "reserve currency": "CDP",
    cdp: "CDP",
    lending: "Lending",
    dexes: "Exchanges",
    bridge: "Bridges",
    "nft lending": "NFT Lending",
    "nft marketplace": "NFT Marketplace",
  };
  const protocolSlugs = Object.keys(protocolsToQuery);
  Object.keys(protocolsToQuery).forEach((slug) => {
    if (slug.includes("-finance")) {
      protocolSlugs.push(slug.split("-finance")[0]);
    } else {
      protocolSlugs.push(slug + "-finance");
    }
    if (slug.includes("-v2")) {
      protocolSlugs.push(slug.split("-v2")[0]);
    }
    if (slug.includes("-v3")) {
      protocolSlugs.push(slug.split("-v3")[0]);
    }
  });
  const protocolTypeList = [];
  // Filter defi llama protocols for supported chains, supported schema types, and protocols already accounted for
  const protocolsToDevelop = defiLlamaProtocols
    .filter((x, idx) => {
      try {
        let onSupportedChain = false;
        x.chains.forEach((chain) => {
          if (!!Object.keys(NetworkLogo_1.NetworkLogos).includes(chain.toLowerCase())) {
            onSupportedChain = true;
          }
        });
        const supportedCategory = Object.keys(categoryTypesSupported).includes(x?.category?.toLowerCase());
        let slugNotUsed = false;
        if (
          !protocolSlugs.includes(x.slug) &&
          !protocolSlugs.includes(x.slug.split("-")[0]) &&
          !protocolSlugs.includes(x.slug + "-finance") &&
          !protocolSlugs.includes(x.slug + "-protocol")
        ) {
          slugNotUsed = true;
        }
        let isCurrentProtocolType = categoryTypesSupported[x?.category?.toLowerCase()] === currentProtocolType;
        if (currentProtocolType === "" || currentProtocolType === "All Protocol Types") {
          isCurrentProtocolType = true;
        }
        if (!protocolTypeList.includes(x?.category?.toLowerCase()) && supportedCategory) {
          protocolTypeList.push(x?.category?.toLowerCase());
        }
        return slugNotUsed && onSupportedChain && supportedCategory && isCurrentProtocolType;
      } catch (err) {
        console.error(err.message);
        return false;
      }
    })
    .sort((a, b) => {
      let aAddedTVL = 0;
      Object.keys(a.chainTvls).forEach((x) => {
        aAddedTVL += a.chainTvls[x];
      });
      let bAddedTVL = 0;
      Object.keys(b.chainTvls).forEach((x) => {
        bAddedTVL += b.chainTvls[x];
      });
      return bAddedTVL - aAddedTVL;
    });
  const defiLlamaTableRows = protocolsToDevelop.map((protocol) => {
    let tvl = 0;
    Object.keys(protocol.chainTvls).forEach((x) => {
      tvl += protocol.chainTvls[x];
    });
    return (
      <material_1.TableRow
        onClick={() => (window.location.href = process.env.REACT_APP_DEFILLAMA_WEB_URL + "/protocol/" + protocol.slug)}
        key={protocol.slug + "PROTOCOLLISTROW"}
        sx={{ height: "10px", width: "100%", backgroundColor: "rgba(22,24,29,0.9)", cursor: "pointer" }}
      >
        <material_1.TableCell sx={{ padding: "0 0 0 6px", verticalAlign: "middle", height: "30px" }}>
          {protocol.name}
        </material_1.TableCell>
        <material_1.TableCell sx={{ padding: "0", paddingRight: "6px", textAlign: "right", display: "flex" }}>
          {protocol.chains.map((x) => {
            if (
              !Object.keys(NetworkLogo_1.NetworkLogos).includes(x.toLowerCase()) &&
              !Object.keys(NetworkLogo_1.networkMapping).includes(x.toLowerCase())
            ) {
              return null;
            }
            return (
              <NetworkLogo_1.NetworkLogo
                tooltip={x.toLowerCase()}
                key={"PROTOCOLLISTROWNETWORK" + x}
                size={30}
                network={x.toLowerCase()}
              />
            );
          })}
        </material_1.TableCell>
        <material_1.TableCell sx={{ padding: "0", paddingRight: "6px", textAlign: "right" }}>
          ${(0, utils_1.formatIntToFixed2)(tvl)}
        </material_1.TableCell>
        <material_1.TableCell sx={{ padding: "0", paddingRight: "6px", textAlign: "right" }}>
          {categoryTypesSupported[protocol.category.toLowerCase()]}
        </material_1.TableCell>
      </material_1.TableRow>
    );
  });
  const columnLabels = ["Name", "Chains", "TVL (Sum Across Networks)", "Schema Type"];
  const tableHead = (
    <material_1.TableHead sx={{ height: "20px" }}>
      <material_1.TableRow sx={{ height: "20px" }}>
        {columnLabels.map((x, idx) => {
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
            <material_1.TableCell sx={{ paddingLeft, minWidth, maxWidth, paddingRight: 0 }} key={"column" + x}>
              <material_1.Typography variant="h5" fontSize={14} fontWeight={500} sx={{ margin: "0", textAlign }}>
                {x}
              </material_1.Typography>
            </material_1.TableCell>
          );
        })}
      </material_1.TableRow>
    </material_1.TableHead>
  );
  let tableBody = <material_1.TableBody>{defiLlamaTableRows}</material_1.TableBody>;
  if (defiLlamaTableRows.length === 0) {
    tableBody = (
      <material_1.Typography variant="h5" align="left" fontSize={22} sx={{ padding: "0 6px" }}>
        No Protocols Found With Selected Type
      </material_1.Typography>
    );
  }
  if (defiLlamaProtocolsLoading) {
    tableBody = (
      <div style={{ margin: "30px" }}>
        <material_1.CircularProgress size={60} />
      </div>
    );
  }
  return (
    <div style={{ overflowX: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", margin: "40px 24px 10px 16px" }}>
        <material_1.Button variant="contained" color="primary" onClick={() => navigate("/")}>
          Back To Deployments List
        </material_1.Button>
        <ProtocolTypeDropDown_1.ProtocolTypeDropDown
          protocolTypeList={Object.values(categoryTypesSupported).filter((x, i, a) => a.indexOf(x) === i)}
          setProtocolType={(x) => setProtocolType(x)}
          currentProtocolType={currentProtocolType}
        />
      </div>

      <material_1.TableContainer sx={{ my: 4, mx: 2 }} key={"TableContainer-DefiLlama"}>
        <div style={{ width: "97.5%" }}>
          <material_1.Typography
            key={"typography-DefiLlama"}
            variant="h3"
            align="left"
            fontWeight={500}
            fontSize={38}
            sx={{ my: 1 }}
          >
            Protocols To Develop
          </material_1.Typography>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <material_1.Typography variant="h4" align="left" fontSize={26}>
              {currentProtocolType}
            </material_1.Typography>
            <material_1.Button
              variant="contained"
              color="primary"
              onClick={() => {
                (0, utils_1.downloadCSV)(
                  protocolsToDevelop.map((protocol) => {
                    let tvl = 0;
                    Object.keys(protocol.chainTvls).forEach((x) => {
                      tvl += protocol.chainTvls[x];
                    });
                    return {
                      name: protocol.name,
                      chains: protocol.chains.join(","),
                      schemaType: categoryTypesSupported[protocol.category.toLowerCase()],
                      tvl: (0, utils_1.formatIntToFixed2)(tvl),
                    };
                  }),
                  currentProtocolType + "-csv",
                  currentProtocolType,
                );
              }}
            >
              Save CSV
            </material_1.Button>
          </div>
        </div>
        <material_1.Table sx={{ width: "97.5%" }} stickyHeader>
          {tableHead}
          {tableBody}
        </material_1.Table>
      </material_1.TableContainer>
    </div>
  );
}
exports.default = ProtocolsListByTVL;
