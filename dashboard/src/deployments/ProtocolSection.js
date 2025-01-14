"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const react_1 = require("react");
const react_router_1 = require("react-router");
const NetworkLogo_1 = require("../common/NetworkLogo");
const SubgraphLogo_1 = require("../common/SubgraphLogo");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
function ProtocolSection({
  protocol,
  issuesMapping,
  schemaType,
  subgraphName,
  decenDeposToSubgraphIds,
  tableExpanded,
  validationSupported,
}) {
  const navigate = (0, react_router_1.useNavigate)();
  const [showDeposDropDown, toggleShowDeposDropDown] = (0, react_1.useState)(false);
  (0, react_1.useEffect)(() => {
    toggleShowDeposDropDown(tableExpanded);
  }, [tableExpanded]);
  const issuesTitles = Object.keys(issuesMapping);
  const subNameUpper = subgraphName.toUpperCase();
  let hasDecentralizedDepo = false;
  let prodStatusIcon = "https://images.emojiterra.com/twitter/v13.1/512px/2705.png";
  let prodStatusHover = "Subgraph is frozen";
  protocol.networks.forEach((depo) => {
    if (
      !!Object.keys(decenDeposToSubgraphIds)?.includes(depo?.decentralizedNetworkId) ||
      !!Object.keys(decenDeposToSubgraphIds)?.includes(depo?.hostedServiceId)
    ) {
      hasDecentralizedDepo = true;
    }
    if (Array.isArray(issuesTitles)) {
      const openRepoIssue = issuesTitles.find((x) => {
        if (issuesMapping[x].includes("/pull/")) {
          return false;
        }
        const title = x.toUpperCase();
        const depoSpecificIssue = title.includes(subNameUpper) && title.includes(depo.chain.toUpperCase());
        const protocolWideIssue = title.includes(subNameUpper + " ALL");
        return depoSpecificIssue || protocolWideIssue;
      });
      if (!!openRepoIssue) {
        prodStatusIcon =
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoseJ8t1vi2kPFznJJSyeIHGYxgvCvbCMgs6a9TMI&s";
        prodStatusHover = "Deployed but with Changes in Progress";
      }
    }
  });
  if (showDeposDropDown) {
    const depoRowsOnProtocol = protocol.networks.map((depo) => {
      let chainLabel = depo.chain;
      if (protocol.networks.filter((x) => x.chain === depo.chain).length > 1) {
        chainLabel = depo.deploymentName;
      }
      let depoLevelStatusIcon = "https://images.emojiterra.com/twitter/v13.1/512px/2705.png";
      let depoLevelStatusHover = "Subgraph is frozen";
      let depoLevelStatusLink = "";
      let decenRow = null;
      try {
        if (
          !!Object.keys(decenDeposToSubgraphIds)?.includes(depo.decentralizedNetworkId) ||
          !!Object.keys(decenDeposToSubgraphIds)?.includes(depo.hostedServiceId)
        ) {
          const depoObject = depo.decentralizedIndexStatus;
          let synced = depoObject["synced"];
          let highlightColor = "#B8301C";
          let indexedPercentage = (0, utils_1.formatIntToFixed2)(0);
          indexedPercentage = (0, utils_1.formatIntToFixed2)(
            (0, utils_1.toPercent)(
              depoObject["latest-block"] - depoObject["start-block"],
              depoObject["chain-head-block"] - depoObject["start-block"],
            ),
          );
          if (depoObject["is-healthy"]) {
            highlightColor = "#EFCB68";
            if (synced && Number(indexedPercentage) > 99) {
              highlightColor = "#58BC82";
              indexedPercentage = (0, utils_1.formatIntToFixed2)(100);
            }
          }
          const decenSubgraphKey = Object.keys(decenDeposToSubgraphIds)?.find(
            (x) => x.includes(subgraphName + "-" + depo?.chain) || x.includes(depo?.decentralizedNetworkId),
          );
          let decenSubgraphId = depoObject["deployment-id"];
          if (decenSubgraphKey) {
            decenSubgraphId = decenDeposToSubgraphIds[decenSubgraphKey]?.id;
          }
          let endpointURL =
            process.env.REACT_APP_GRAPH_DECEN_URL +
            "/api/" +
            process.env.REACT_APP_GRAPH_API_KEY +
            "/subgraphs/id/" +
            decenSubgraphId;
          let schemaCell = <span>{depo?.versions?.schema}</span>;
          if (
            (!depo?.versions?.schema || !(0, constants_1.latestSchemaVersions)(schemaType, depo?.versions?.schema)) &&
            schemaType !== "governance"
          ) {
            schemaCell = (
              <material_1.Tooltip title="This deployment does not have the latest schema version" placement="top">
                <span style={{ color: "#FFA500" }}>{depo?.versions?.schema || "N/A"}</span>
              </material_1.Tooltip>
            );
          }
          let decenDeposBySubgraphId = decenDeposToSubgraphIds[depo?.decentralizedNetworkId];
          if (!decenDeposBySubgraphId) {
            decenDeposBySubgraphId = decenDeposToSubgraphIds[depo?.hostedServiceId];
          }
          let curationElement = null;
          if (!decenDeposBySubgraphId?.id) {
            curationElement = (
              <span style={{ display: "inline-flex", alignItems: "center", padding: "0px 10px", fontSize: "10px" }}>
                <material_1.Tooltip title="No curation on this Subgraph" placement="top">
                  <span
                    style={{
                      padding: "0 5px",
                      borderRadius: "50%",
                      color: "#B8301C",
                      border: "#B8301C 1.5px solid",
                      cursor: "default",
                      fontWeight: "800",
                    }}
                  >
                    !
                  </span>
                </material_1.Tooltip>
              </span>
            );
          } else if (decenDeposBySubgraphId?.signal > 0) {
            let convertedSignalAmount = (0, utils_1.convertTokenDecimals)(decenDeposBySubgraphId?.signal, 21).toFixed(
              1,
            );
            curationElement = (
              <span style={{ display: "inline-flex", alignItems: "center", padding: "0px 10px", fontSize: "14px" }}>
                <material_1.Tooltip title="Current Curation Signal" placement="top">
                  <span style={{ padding: "0", cursor: "default", fontWeight: "800" }}>
                    {convertedSignalAmount}K GRT
                  </span>
                </material_1.Tooltip>
              </span>
            );
          }
          let decenDepoStatusIcon = "https://images.emojiterra.com/twitter/v13.1/512px/2705.png";
          let decenStatusLink = depoLevelStatusLink;
          const openDecenIssue = issuesTitles.find((x) => {
            if (issuesMapping[x].includes("/pull/")) {
              return false;
            }
            const title = x.toUpperCase();
            const titleIsDecen = title.includes("DECEN");
            let depoSpecificIssue = false;
            const protocolWideIssue = title.includes(subNameUpper + " ALL");
            depoSpecificIssue =
              title.includes(subNameUpper) && title.includes(depo.chain.toUpperCase()) && titleIsDecen;
            return protocolWideIssue || depoSpecificIssue;
          });
          if (!!openDecenIssue) {
            decenDepoStatusIcon =
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoseJ8t1vi2kPFznJJSyeIHGYxgvCvbCMgs6a9TMI&s";
            decenStatusLink = issuesMapping[openDecenIssue] || "";
          }
          decenRow = (
            <material_1.TableRow
              onClick={(event) => {
                if (event.ctrlKey) {
                  if (!validationSupported) {
                    window.open(
                      `${process.env.REACT_APP_GRAPH_EXPLORER_URL}/subgraph?id=${decenSubgraphId}&view=Overview&chain=arbitrum-one`,
                      "_blank",
                    );
                    return;
                  }
                  if (depoObject["is-healthy"]) {
                    window.open(`${window.location.href}subgraph?endpoint=${endpointURL}&tab=protocol`, "_blank");
                  } else {
                    window.open(
                      process.env.REACT_APP_OKGRAPH_BASE_URL + "/?q=" + depo.decentralizedNetworkId,
                      "_blank",
                    );
                  }
                } else {
                  if (!validationSupported) {
                    window.location.href = `${process.env.REACT_APP_GRAPH_EXPLORER_URL}/subgraph?id=${decenSubgraphId}&view=Overview&chain=arbitrum-one`;
                    return;
                  }
                  if (depoObject["is-healthy"]) {
                    navigate(`/subgraph?endpoint=${endpointURL}&tab=protocol`);
                  } else {
                    window.location.href =
                      process.env.REACT_APP_OKGRAPH_BASE_URL + "/?q=" + depo.decentralizedNetworkId;
                  }
                }
                return;
              }}
              key={subgraphName + depo.hostedServiceId + "DepInDevRow-DECEN"}
              sx={{ height: "10px", width: "100%", backgroundColor: "rgba(22,24,29,0.9)", cursor: "pointer" }}
            >
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingLeft: "6px",
                  borderLeft: `${highlightColor} solid 34px`,
                  verticalAlign: "middle",
                  display: "flex",
                }}
              >
                <SubgraphLogo_1.SubgraphLogo name={subgraphName} size={30} />
                <span style={{ display: "inline-flex", alignItems: "center", padding: "0px 10px", fontSize: "14px" }}>
                  {chainLabel}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", padding: "0px 10px", fontSize: "10px" }}>
                  <material_1.Tooltip title="This deployment is hosted on the decentralized network" placement="top">
                    <span
                      style={{
                        padding: "4px 6px 2px 7px",
                        borderRadius: "50%",
                        backgroundColor: "rgb(102,86,248)",
                        cursor: "default",
                        fontWeight: "800",
                      }}
                    >
                      D
                    </span>
                  </material_1.Tooltip>
                </span>
                {curationElement}
              </material_1.TableCell>
              <material_1.TableCell
                sx={{ backgroundColor: "rgb(55, 55, 55)", padding: "0", paddingRight: "16px", textAlign: "right" }}
              ></material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0 16px 0 30px",
                  textAlign: "right",
                  display: "flex",
                }}
              >
                <NetworkLogo_1.NetworkLogo
                  tooltip={depo.chain}
                  key={subgraphName + depo.chain + "Logo-DECEN"}
                  size={30}
                  network={depo.chain}
                />
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {depo?.status === "prod" ? (
                  <material_1.Tooltip title={depoLevelStatusHover}>
                    <img
                      className="round-image"
                      onClick={(e) => {
                        if (decenStatusLink?.length > 0) {
                          e.stopPropagation();
                          window.location.href = decenStatusLink;
                        }
                      }}
                      src={decenDepoStatusIcon}
                      height="24px"
                      width="24px"
                    />
                  </material_1.Tooltip>
                ) : (
                  <material_1.Tooltip title="In Development">
                    <img
                      src="https://github.githubassets.com/images/icons/emoji/unicode/1f6e0.png"
                      height="24px"
                      width="24px"
                    />
                  </material_1.Tooltip>
                )}
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {indexedPercentage}%
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {depoObject["start-block"].toLocaleString()}
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {depoObject["latest-block"].toLocaleString()}
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {depoObject["chain-head-block"].toLocaleString()}
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                <material_1.Typography variant="h5" sx={{ width: "100%" }} fontSize={14}>
                  {schemaCell}
                </material_1.Typography>
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                <material_1.Typography variant="h5" sx={{ width: "100%" }} fontSize={14}>
                  {depo?.versions?.subgraph || "N/A"}
                </material_1.Typography>
              </material_1.TableCell>

              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                <material_1.Typography variant="h5" sx={{ width: "100%" }} fontSize={14}>
                  {parseInt(depoObject["entity-count"]).toLocaleString()}
                </material_1.Typography>
              </material_1.TableCell>
            </material_1.TableRow>
          );
        }
      } catch (err) {
        decenRow = null;
      }
      let pendingRow = null;
      try {
        if (Array.isArray(issuesTitles)) {
          const openRepoIssue = issuesTitles.find((x) => {
            if (issuesMapping[x].includes("/pull/")) {
              return false;
            }
            const title = x.toUpperCase();
            const titleIsDecen = title.includes("DECEN");
            const protocolWideIssue = title.includes(subNameUpper + " ALL");
            const depoSpecificIssue =
              title.includes(subNameUpper) && title.includes(depo.chain.toUpperCase()) && !titleIsDecen;
            return depoSpecificIssue || protocolWideIssue;
          });
          if (!!openRepoIssue) {
            depoLevelStatusIcon =
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoseJ8t1vi2kPFznJJSyeIHGYxgvCvbCMgs6a9TMI&s";
            depoLevelStatusHover = "Deployed but with Changes in Progress";
            depoLevelStatusLink = issuesMapping[openRepoIssue] || "";
          }
        }
        if (depo.pendingIndexStatus) {
          const depoObject = depo.pendingIndexStatus;
          let synced = depoObject["synced"];
          let highlightColor = "#B8301C";
          let indexedPercentage = (0, utils_1.formatIntToFixed2)(0);
          indexedPercentage = (0, utils_1.formatIntToFixed2)(
            (0, utils_1.toPercent)(
              depoObject["latest-block"] - depoObject["start-block"],
              depoObject["chain-head-block"] - depoObject["start-block"],
            ),
          );
          if (depoObject["is-healthy"]) {
            highlightColor = "#EFCB68";
            if (synced && Number(indexedPercentage) > 99) {
              highlightColor = "#58BC82";
              indexedPercentage = (0, utils_1.formatIntToFixed2)(100);
            }
          }
          let schemaCell = <span>{depo?.versions?.schema}</span>;
          if (
            (!depo?.versions?.schema || !(0, constants_1.latestSchemaVersions)(schemaType, depo?.versions?.schema)) &&
            schemaType !== "governance"
          ) {
            schemaCell = (
              <material_1.Tooltip title="This deployment does not have the latest schema version" placement="top">
                <span style={{ color: "#FFA500" }}>{depo?.versions?.schema || "N/A"}</span>
              </material_1.Tooltip>
            );
          }
          pendingRow = (
            <material_1.TableRow
              onClick={(event) => {
                if (event.ctrlKey) {
                  if (!validationSupported) {
                    window.open(
                      process.env.REACT_APP_GRAPH_HOSTEDSERVICE_URL +
                        "/subgraph/messari/" +
                        depo.hostedServiceId +
                        "?version=pending",
                      "_blank",
                    );
                    return;
                  }
                  if (depoObject["is-healthy"]) {
                    window.open(
                      `${window.location.href}subgraph?endpoint=messari/${depo.hostedServiceId}&tab=protocol&version=pending`,
                      "_blank",
                    );
                  } else {
                    window.open(
                      process.env.REACT_APP_OKGRAPH_BASE_URL + "/?q=" + depoObject["deployment-id"],
                      "_blank",
                    );
                  }
                } else {
                  if (!validationSupported) {
                    window.location.href =
                      process.env.REACT_APP_GRAPH_HOSTEDSERVICE_URL +
                      "/subgraph/messari/" +
                      depo.hostedServiceId +
                      "?version=pending";
                    return;
                  }
                  if (depoObject["is-healthy"]) {
                    navigate(`/subgraph?endpoint=messari/${depo.hostedServiceId}&tab=protocol&version=pending`);
                  } else {
                    window.location.href =
                      process.env.REACT_APP_OKGRAPH_BASE_URL + "/?q=" + depoObject["deployment-id"];
                  }
                }
              }}
              key={subgraphName + depo.hostedServiceId + "DepInDevRow-PENDING"}
              sx={{ height: "10px", width: "100%", backgroundColor: "rgba(22,24,29,0.9)", cursor: "pointer" }}
            >
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingLeft: "6px",
                  borderLeft: `${highlightColor} solid 34px`,
                  verticalAlign: "middle",
                  display: "flex",
                }}
              >
                <SubgraphLogo_1.SubgraphLogo name={subgraphName} size={30} />
                <span style={{ display: "inline-flex", alignItems: "center", padding: "0px 10px", fontSize: "14px" }}>
                  {chainLabel} (PENDING)
                </span>
              </material_1.TableCell>
              <material_1.TableCell
                sx={{ backgroundColor: "rgb(55, 55, 55)", padding: "0", paddingRight: "16px", textAlign: "right" }}
              ></material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0 16px 0 30px",
                  textAlign: "right",
                  display: "flex",
                }}
              >
                <NetworkLogo_1.NetworkLogo
                  tooltip={depo.chain}
                  key={subgraphName + depo.chain + "Logo-PENDING"}
                  size={30}
                  network={depo.chain}
                />
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {depo?.status === "prod" ? (
                  <material_1.Tooltip title={depoLevelStatusHover}>
                    <img
                      className="round-image"
                      onClick={(e) => {
                        if (depoLevelStatusLink?.length > 0) {
                          e.stopPropagation();
                          window.location.href = depoLevelStatusLink;
                        }
                      }}
                      src={depoLevelStatusIcon}
                      height="24px"
                      width="24px"
                    />
                  </material_1.Tooltip>
                ) : (
                  <material_1.Tooltip title="In Development">
                    <img
                      src="https://github.githubassets.com/images/icons/emoji/unicode/1f6e0.png"
                      height="24px"
                      width="24px"
                    />
                  </material_1.Tooltip>
                )}
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {indexedPercentage}%
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {depoObject["start-block"].toLocaleString()}
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {depoObject["latest-block"].toLocaleString()}
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {depoObject["chain-head-block"].toLocaleString()}
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                <material_1.Typography variant="h5" sx={{ width: "100%" }} fontSize={14}>
                  {schemaCell}
                </material_1.Typography>
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                <material_1.Typography variant="h5" sx={{ width: "100%" }} fontSize={14}>
                  {depo?.versions?.subgraph || "N/A"}
                </material_1.Typography>
              </material_1.TableCell>

              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                <material_1.Typography variant="h5" sx={{ width: "100%" }} fontSize={14}>
                  {parseInt(depoObject["entity-count"]).toLocaleString()}
                </material_1.Typography>
              </material_1.TableCell>
            </material_1.TableRow>
          );
        }
      } catch (err) {
        pendingRow = null;
      }
      let indexedRow = null;
      try {
        if (depo.indexStatus) {
          const depoObject = depo.indexStatus;
          let synced = depoObject["synced"];
          let highlightColor = "#B8301C";
          let indexedPercentage = (0, utils_1.formatIntToFixed2)(0);
          indexedPercentage = (0, utils_1.formatIntToFixed2)(
            (0, utils_1.toPercent)(
              depoObject["latest-block"] - depoObject["start-block"],
              depoObject["chain-head-block"] - depoObject["start-block"],
            ),
          );
          if (depoObject["is-healthy"]) {
            highlightColor = "#EFCB68";
            if (synced && Number(indexedPercentage) > 99) {
              highlightColor = "#58BC82";
              indexedPercentage = (0, utils_1.formatIntToFixed2)(100);
            }
          }
          let schemaCell = <span>{depo?.versions?.schema}</span>;
          if (
            (!depo?.versions?.schema || !(0, constants_1.latestSchemaVersions)(schemaType, depo?.versions?.schema)) &&
            schemaType !== "governance"
          ) {
            schemaCell = (
              <material_1.Tooltip title="This deployment does not have the latest schema verison" placement="top">
                <span style={{ color: "#FFA500" }}>{depo?.versions?.schema || "N/A"}</span>
              </material_1.Tooltip>
            );
          }
          let subgraphUrlBase = "";
          if (depo.chain === "cronos") {
            subgraphUrlBase = process.env.REACT_APP_GRAPH_CRONOS_URL + "/subgraphs/name/";
          }
          indexedRow = (
            <material_1.TableRow
              onClick={(event) => {
                if (event.ctrlKey) {
                  if (!validationSupported) {
                    window.open(
                      process.env.REACT_APP_GRAPH_HOSTEDSERVICE_URL +
                        "/subgraph/messari/" +
                        depo.hostedServiceId +
                        "?version=pending",
                      "_blank",
                    );
                    return;
                  }
                  if (depoObject["is-healthy"]) {
                    window.open(
                      `${window.location.href}subgraph?endpoint=${subgraphUrlBase}messari/${depo.hostedServiceId}&tab=protocol`,
                      "_blank",
                    );
                  } else {
                    window.open(
                      process.env.REACT_APP_OKGRAPH_BASE_URL + "/?q=messari/" + depo.hostedServiceId,
                      "_blank",
                    );
                  }
                } else {
                  if (!validationSupported) {
                    window.location.href =
                      process.env.REACT_APP_GRAPH_HOSTEDSERVICE_URL +
                      "/subgraph/messari/" +
                      depo.hostedServiceId +
                      "?version=pending";
                    return;
                  }
                  if (depoObject["is-healthy"]) {
                    navigate(`/subgraph?endpoint=${subgraphUrlBase}messari/${depo.hostedServiceId}&tab=protocol`);
                  } else {
                    window.location.href =
                      process.env.REACT_APP_OKGRAPH_BASE_URL + "/?q=messari/" + depo.hostedServiceId;
                  }
                }
                return;
              }}
              key={subgraphName + depo.hostedServiceId + "DepInDevRow"}
              sx={{ height: "10px", width: "100%", backgroundColor: "rgba(22,24,29,0.9)", cursor: "pointer" }}
            >
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingLeft: "6px",
                  borderLeft: `${highlightColor} solid 34px`,
                  verticalAlign: "middle",
                  display: "flex",
                }}
              >
                <SubgraphLogo_1.SubgraphLogo name={subgraphName} size={30} />
                <span style={{ display: "inline-flex", alignItems: "center", padding: "0px 10px", fontSize: "14px" }}>
                  {chainLabel}
                </span>
              </material_1.TableCell>
              <material_1.TableCell
                sx={{ backgroundColor: "rgb(55, 55, 55)", padding: "0", paddingRight: "16px", textAlign: "right" }}
              ></material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0 16px 0 30px",
                  textAlign: "right",
                  display: "flex",
                }}
              >
                <NetworkLogo_1.NetworkLogo
                  tooltip={depo.chain}
                  key={subgraphName + depo.hostedServiceId + "Logo"}
                  size={30}
                  network={depo.chain}
                />
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {depo?.status === "prod" ? (
                  <material_1.Tooltip title={depoLevelStatusHover}>
                    <img
                      className="round-image"
                      onClick={(e) => {
                        if (depoLevelStatusLink?.length > 0) {
                          e.stopPropagation();
                          window.location.href = depoLevelStatusLink;
                        }
                      }}
                      src={depoLevelStatusIcon}
                      height="24px"
                      width="24px"
                    />
                  </material_1.Tooltip>
                ) : (
                  <material_1.Tooltip title="In Development">
                    <img
                      src="https://github.githubassets.com/images/icons/emoji/unicode/1f6e0.png"
                      height="24px"
                      width="24px"
                    />
                  </material_1.Tooltip>
                )}
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {indexedPercentage}%
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {depoObject["start-block"].toLocaleString()}
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {depoObject["latest-block"].toLocaleString()}
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {depoObject["chain-head-block"].toLocaleString()}
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                <material_1.Typography variant="h5" sx={{ width: "100%" }} fontSize={14}>
                  {schemaCell}
                </material_1.Typography>
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                <material_1.Typography variant="h5" sx={{ width: "100%" }} fontSize={14}>
                  {depo?.versions?.subgraph || "N/A"}
                </material_1.Typography>
              </material_1.TableCell>

              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                <material_1.Typography variant="h5" sx={{ width: "100%" }} fontSize={14}>
                  {parseInt(depoObject["entity-count"]).toLocaleString()}
                </material_1.Typography>
              </material_1.TableCell>
            </material_1.TableRow>
          );
        }
      } catch (err) {
        indexedRow = null;
      }
      let devRow = null;
      try {
        if (!depo.indexStatus && !depo.pendingIndexStatus) {
          let highlightColor = "#EFCB68";
          let schemaCell = <span>{depo?.versions?.schema}</span>;
          if (
            (!depo?.versions?.schema || !(0, constants_1.latestSchemaVersions)(schemaType, depo?.versions?.schema)) &&
            schemaType !== "governance"
          ) {
            schemaCell = (
              <material_1.Tooltip title="This deployment does not have the latest schema verison" placement="top">
                <span style={{ color: "#FFA500" }}>{depo?.versions?.schema || "N/A"}</span>
              </material_1.Tooltip>
            );
          }
          devRow = (
            <material_1.TableRow
              key={subgraphName + depo.hostedServiceId + "DepInDevRow"}
              sx={{ height: "10px", width: "100%", backgroundColor: "rgba(22,24,29,0.9)" }}
            >
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingLeft: "6px",
                  borderLeft: `${highlightColor} solid 34px`,
                  verticalAlign: "middle",
                  display: "flex",
                }}
              >
                <SubgraphLogo_1.SubgraphLogo name={subgraphName} size={30} />
                <span style={{ display: "inline-flex", alignItems: "center", padding: "0px 10px", fontSize: "14px" }}>
                  {chainLabel}
                </span>
              </material_1.TableCell>
              <material_1.TableCell
                sx={{ backgroundColor: "rgb(55, 55, 55)", padding: "0", paddingRight: "16px", textAlign: "right" }}
              ></material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0 16px 0 30px",
                  textAlign: "right",
                  display: "flex",
                }}
              >
                <NetworkLogo_1.NetworkLogo
                  tooltip={depo.chain}
                  key={subgraphName + depo.hostedServiceId + "Logo"}
                  size={30}
                  network={depo.chain}
                />
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                <material_1.Tooltip title="In Development">
                  <img
                    src="https://github.githubassets.com/images/icons/emoji/unicode/1f6e0.png"
                    height="24px"
                    width="24px"
                  />
                </material_1.Tooltip>
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {"N/A"}
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {"N/A"}
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {"N/A"}
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                {"N/A"}
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                <material_1.Typography variant="h5" sx={{ width: "100%" }} fontSize={14}>
                  {schemaCell}
                </material_1.Typography>
              </material_1.TableCell>
              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                <material_1.Typography variant="h5" sx={{ width: "100%" }} fontSize={14}>
                  {depo?.versions?.subgraph || "N/A"}
                </material_1.Typography>
              </material_1.TableCell>

              <material_1.TableCell
                sx={{
                  backgroundColor: "rgb(55, 55, 55)",
                  color: "white",
                  padding: "0",
                  paddingRight: "16px",
                  textAlign: "right",
                }}
              >
                <material_1.Typography variant="h5" sx={{ width: "100%" }} fontSize={14}>
                  {"N/A"}
                </material_1.Typography>
              </material_1.TableCell>
            </material_1.TableRow>
          );
        }
      } catch (err) {
        devRow = null;
      }
      return (
        <>
          {decenRow}
          {indexedRow}
          {pendingRow}
          {devRow}
        </>
      );
    });
    return (
      <>
        <material_1.TableRow
          onClick={() => {
            toggleShowDeposDropDown(!showDeposDropDown);
          }}
          key={subgraphName + "DepInDevRow"}
          sx={{ cursor: "pointer", height: "10px", width: "100%", backgroundColor: "rgba(22,24,29,0.9)" }}
        >
          <material_1.TableCell sx={{ padding: "0", paddingLeft: "6px", verticalAlign: "middle", display: "flex" }}>
            <SubgraphLogo_1.SubgraphLogo name={subgraphName} size={30} />
            <span style={{ display: "inline-flex", alignItems: "center", padding: "0px 10px", fontSize: "14px" }}>
              {subgraphName}
            </span>
          </material_1.TableCell>
          <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}>
            <img
              className="rotated"
              height="24px"
              width="24px"
              src="https://cdn2.iconfinder.com/data/icons/50-material-design-round-corner-style/44/Dropdown_2-512.png"
            />
          </material_1.TableCell>
          <material_1.TableCell sx={{ padding: "0", paddingRight: "6px", textAlign: "right", display: "flex" }}>
            {protocol.networks.map((x) => {
              let indexedPercentage = (0, utils_1.formatIntToFixed2)(0);
              const depoObject = x.indexStatus;
              if (depoObject) {
                let synced = depoObject["synced"];
                indexedPercentage = (0, utils_1.formatIntToFixed2)(
                  (0, utils_1.toPercent)(
                    depoObject["latest-block"] - depoObject["start-block"],
                    depoObject["chain-head-block"] - depoObject["start-block"],
                  ),
                );
                if (depoObject["is-healthy"] && synced && Number(indexedPercentage) > 99) {
                  indexedPercentage = (0, utils_1.formatIntToFixed2)(100);
                }
              }
              return (
                <a
                  key={"CellNetwork-" + x.chain + x.hostedServiceId}
                  href={process.env.REACT_APP_GRAPH_HOSTEDSERVICE_URL + "/subgraph/messari/" + x.hostedServiceId}
                >
                  <NetworkLogo_1.NetworkLogo
                    tooltip={`${x.chain} (${indexedPercentage}%)`}
                    size={30}
                    network={x.chain}
                  />
                </a>
              );
            })}
          </material_1.TableCell>
          <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}>
            {protocol?.status ? (
              <material_1.Tooltip title={prodStatusHover}>
                <img className="round-image" src={prodStatusIcon} height="24px" width="24px" />
              </material_1.Tooltip>
            ) : (
              <material_1.Tooltip title="In Development">
                <img
                  src="https://github.githubassets.com/images/icons/emoji/unicode/1f6e0.png"
                  height="24px"
                  width="24px"
                />
              </material_1.Tooltip>
            )}
          </material_1.TableCell>
          <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}>-</material_1.TableCell>
          <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}>-</material_1.TableCell>
          <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}>-</material_1.TableCell>
          <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}>-</material_1.TableCell>
          <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}>-</material_1.TableCell>
          <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}>-</material_1.TableCell>
          <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}>-</material_1.TableCell>
        </material_1.TableRow>
        {depoRowsOnProtocol}
      </>
    );
  }
  let schemaCell = <span>N/A</span>;
  let decenDepoElement = null;
  try {
    if (protocol?.schemaVersions?.length > 0) {
      let schemaColored = {};
      const schemaVersOnProtocol = protocol?.schemaVersions?.map((x) => {
        if (!((0, constants_1.latestSchemaVersions)(schemaType, x) || schemaType === "governance")) {
          schemaColored = { color: "#FFA500" };
        }
        return x;
      });
      schemaCell = <span style={schemaColored}>{schemaVersOnProtocol.join(", ")}</span>;
    }
    if (hasDecentralizedDepo) {
      decenDepoElement = (
        <span style={{ display: "inline-flex", alignItems: "center", padding: "0px 10px", fontSize: "10px" }}>
          <material_1.Tooltip title="This protocol has deployments hosted on the decentralized network" placement="top">
            <span
              style={{
                padding: "4px 6px 2px 7px",
                borderRadius: "50%",
                backgroundColor: "rgb(102,86,248)",
                cursor: "default",
                fontWeight: "800",
              }}
            >
              D
            </span>
          </material_1.Tooltip>
        </span>
      );
    }
  } catch (err) {
    console.error(err.message);
  }
  return (
    <material_1.TableRow
      onClick={() => {
        toggleShowDeposDropDown(!showDeposDropDown);
      }}
      key={subgraphName + "DepInDevRow"}
      sx={{ height: "10px", width: "100%", backgroundColor: "rgba(22,24,29,0.9)", cursor: "pointer" }}
    >
      <material_1.TableCell sx={{ padding: "0 0 0 6px", verticalAlign: "middle", display: "flex", height: "35px" }}>
        <material_1.Tooltip title="Click To View All Deployments On This Protocol" placement="top">
          <SubgraphLogo_1.SubgraphLogo name={subgraphName} size={30} />
        </material_1.Tooltip>
        <material_1.Tooltip title="Click To View All Deployments On This Protocol" placement="top">
          <span style={{ display: "inline-flex", alignItems: "center", padding: "0px 10px", fontSize: "14px" }}>
            {subgraphName}
          </span>
        </material_1.Tooltip>
        {decenDepoElement}
      </material_1.TableCell>
      <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}>
        <material_1.Tooltip title="Click To View All Deployments On This Protocol" placement="top">
          <img
            height="24px"
            width="24px"
            src="https://cdn2.iconfinder.com/data/icons/50-material-design-round-corner-style/44/Dropdown_2-512.png"
          />
        </material_1.Tooltip>
      </material_1.TableCell>
      <material_1.TableCell sx={{ padding: "0 6px 1px 0", textAlign: "right", display: "flex" }}>
        <material_1.Tooltip title="Click To View All Deployments On This Protocol" placement="top">
          <>
            {protocol.networks.map((x) => {
              let borderColor = "#EFCB68";
              let indexedPercentage = (0, utils_1.formatIntToFixed2)(0);
              const depoObject = x.indexStatus;
              if (depoObject) {
                let synced = depoObject["synced"];
                indexedPercentage = (0, utils_1.formatIntToFixed2)(
                  (0, utils_1.toPercent)(
                    depoObject["latest-block"] - depoObject["start-block"],
                    depoObject["chain-head-block"] - depoObject["start-block"],
                  ),
                );
                if (!depoObject["is-healthy"]) {
                  borderColor = "#B8301C";
                } else {
                  if (synced && Number(indexedPercentage) > 99) {
                    borderColor = "#58BC82";
                    indexedPercentage = (0, utils_1.formatIntToFixed2)(100);
                  }
                }
              }
              return (
                <a
                  key={subgraphName + x.hostedServiceId + "Logo"}
                  style={{ height: "100%", border: borderColor + " 4px solid", borderRadius: "50%" }}
                  href={process.env.REACT_APP_GRAPH_HOSTEDSERVICE_URL + "/subgraph/messari/" + x.hostedServiceId}
                >
                  <NetworkLogo_1.NetworkLogo
                    tooltip={`${x.chain} (${indexedPercentage}%)`}
                    size={28}
                    network={x.chain}
                  />
                </a>
              );
            })}
          </>
        </material_1.Tooltip>
      </material_1.TableCell>
      <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}>
        {protocol?.status ? (
          <material_1.Tooltip title={prodStatusHover}>
            <img className="round-image" src={prodStatusIcon} height="24px" width="24px" />
          </material_1.Tooltip>
        ) : (
          <material_1.Tooltip title="In Development">
            <img
              src="https://github.githubassets.com/images/icons/emoji/unicode/1f6e0.png"
              height="24px"
              width="24px"
            />
          </material_1.Tooltip>
        )}
      </material_1.TableCell>
      <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}></material_1.TableCell>
      <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}></material_1.TableCell>
      <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}></material_1.TableCell>
      <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}></material_1.TableCell>
      <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}>
        <material_1.Tooltip title="Click To View All Deployments On This Protocol" placement="top">
          <material_1.Typography variant="h5" sx={{ width: "100%" }} fontSize={14}>
            {schemaCell}
          </material_1.Typography>
        </material_1.Tooltip>
      </material_1.TableCell>
      <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}>
        <material_1.Tooltip title="Click To View All Deployments On This Protocol" placement="top">
          <material_1.Typography variant="h5" sx={{ width: "100%" }} fontSize={14}>
            {protocol?.subgraphVersions?.length > 0 ? protocol?.subgraphVersions.join(", ") : "N/A"}
          </material_1.Typography>
        </material_1.Tooltip>
      </material_1.TableCell>

      <material_1.TableCell sx={{ padding: "0", paddingRight: "16px", textAlign: "right" }}></material_1.TableCell>
    </material_1.TableRow>
  );
}
exports.default = ProtocolSection;
