"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const ProtocolSection_1 = __importDefault(require("./ProtocolSection"));
const react_1 = require("react");
const utils_1 = require("../utils");
const FetchEntityCSV_1 = __importDefault(require("./FetchEntityCSV"));
const MultiSelectDropDown_1 = require("../common/utilComponents/MultiSelectDropDown");
const DateRangePicker_1 = require("../common/utilComponents/DateRangePicker");
const moment_1 = __importDefault(require("moment"));
function DeploymentsTable({ protocolsToQuery, issuesMapping, getData, decenDeposToSubgraphIds }) {
  const [tableExpanded, setTableExpanded] = (0, react_1.useState)({
    lending: false,
    exchanges: false,
    vaults: false,
    generic: false,
    erc20: false,
    erc721: false,
    governance: false,
    // network: false,
    ["nft-marketplace"]: false,
    ["derivatives-options"]: false,
    ["derivatives-perpfutures"]: false,
  });
  const [generateEntityCSV, triggerGenerateEntityCSV] = (0, react_1.useState)("");
  const [resultsObject, setResultsObject] = (0, react_1.useState)({});
  const schemaDatesObject = {};
  const schemaBooleansObject = {};
  const schemaDeposSelected = {};
  const supportedSchemaTypes = Array.from(new Set(Object.values(utils_1.schemaMapping)));
  supportedSchemaTypes.forEach((schema) => {
    schemaDatesObject[schema] = [];
    schemaDeposSelected[schema] = [];
    schemaBooleansObject[schema] = false;
  });
  const [deposSelected, setDeposSelected] = (0, react_1.useState)({ ...schemaDeposSelected });
  const [dates, setDates] = (0, react_1.useState)({ ...schemaDatesObject });
  const [showDatePicker, setShowDatePicker] = (0, react_1.useState)({ ...schemaBooleansObject });
  (0, react_1.useEffect)(() => {
    setShowDatePicker({ ...schemaBooleansObject });
  }, [generateEntityCSV]);
  (0, react_1.useEffect)(() => {
    if (generateEntityCSV.length > 0) {
      if (resultsObject) {
        if (deposSelected[utils_1.schemaMapping[generateEntityCSV]].includes("All")) {
          let depoCount = 0;
          Object.entries(protocolsToQuery).forEach(([protocolName, protocol]) => {
            if (utils_1.schemaMapping[protocol.schema] !== utils_1.schemaMapping[generateEntityCSV]) {
              return;
            }
            Object.keys(protocol.deployments).forEach((depoKey) => {
              const deploymentData = protocol.deployments[depoKey];
              if (deploymentData?.services) {
                if (
                  !!deploymentData["services"]["hosted-service"] ||
                  !!deploymentData["services"]["decentralized-network"] ||
                  !!deploymentData["services"]["cronos-portal"]
                ) {
                  depoCount += 1;
                }
              }
            });
          });
          if (
            Object.keys(resultsObject).length >= depoCount &&
            deposSelected[utils_1.schemaMapping[generateEntityCSV]].length > 0
          ) {
            let fullJSON = [];
            Object.values(resultsObject).forEach((depo) => {
              if (Array.isArray(depo)) {
                fullJSON = [...fullJSON, ...depo];
              }
            });
            (0, utils_1.downloadCSV)(fullJSON, `depoCount${Object.keys(resultsObject).length}`, generateEntityCSV);
            setDates({ ...dates, [utils_1.schemaMapping[generateEntityCSV]]: [] });
            triggerGenerateEntityCSV("");
            setResultsObject({});
          }
        } else if (
          Object.keys(resultsObject).length >= deposSelected[utils_1.schemaMapping[generateEntityCSV]].length &&
          deposSelected[utils_1.schemaMapping[generateEntityCSV]].length > 0
        ) {
          let fullJSON = [];
          Object.values(resultsObject).forEach((depo) => {
            if (Array.isArray(depo)) {
              fullJSON = [...fullJSON, ...depo];
            }
          });
          (0, utils_1.downloadCSV)(fullJSON, `depoCount${Object.keys(resultsObject).length}`, generateEntityCSV);
          setDates({ ...dates, [utils_1.schemaMapping[generateEntityCSV]]: [] });
          triggerGenerateEntityCSV("");
          setResultsObject({});
        }
      }
    }
  }, [resultsObject]);
  if (Object.keys(protocolsToQuery).length === 0) {
    getData();
    return null;
  }
  const columnLabels = {
    Name: "300px",
    "": "45px",
    Network: "420px",
    Status: "40px",
    "Indexed %": "auto",
    "Start Block": "auto",
    "Current Block": "auto",
    "Chain Head": "auto",
    Schema: "auto",
    Subgraph: "auto",
    "Entity Count": "auto",
  };
  const tableHead = (
    <material_1.TableHead sx={{ height: "20px" }}>
      <material_1.TableRow sx={{ height: "20px" }}>
        {Object.keys(columnLabels).map((x, idx) => {
          let textAlign = "left";
          let paddingLeft = "0px";
          let minWidth = columnLabels[x];
          let maxWidth = columnLabels[x];
          if (idx > 2) {
            textAlign = "right";
            paddingLeft = "16px";
          }
          return (
            <material_1.TableCell sx={{ paddingLeft, minWidth, maxWidth }} key={"column" + x}>
              <material_1.Typography
                variant="h5"
                fontSize={14}
                fontWeight={500}
                sx={{ margin: "0", width: "100%", textAlign }}
              >
                {x}
              </material_1.Typography>
            </material_1.TableCell>
          );
        })}
      </material_1.TableRow>
    </material_1.TableHead>
  );
  const deposToPass = {};
  Object.entries(protocolsToQuery).forEach(([protocolName, protocol]) => {
    Object.keys(protocol.deployments).forEach((depoKey) => {
      const deploymentData = protocol.deployments[depoKey];
      if (!deploymentData?.services) {
        return;
      }
      if (
        !!deploymentData["services"]["hosted-service"] ||
        !!deploymentData["services"]["decentralized-network"] ||
        !!deploymentData["services"]["cronos-portal"]
      ) {
        if (!Object.keys(deposToPass).includes(protocol.schema)) {
          deposToPass[protocol.schema] = {};
        }
        if (!Object.keys(deposToPass[protocol.schema]).includes(protocolName)) {
          deposToPass[protocol.schema][protocolName] = {
            status: true,
            schemaVersions: [],
            subgraphVersions: [],
            methodologyVersions: [],
            networks: [],
          };
        }
        let decentralizedNetworkId = null;
        let decentralizedIndexStatus = null;
        if (!!deploymentData["services"]["decentralized-network"]) {
          decentralizedNetworkId = deploymentData["services"]["decentralized-network"]["slug"];
          decentralizedIndexStatus = deploymentData["services"]["decentralized-network"]["health"][0];
        }
        let hostedServiceId = null;
        let indexStatus = null;
        let pendingIndexStatus = null;
        if (!!deploymentData["services"]["hosted-service"]) {
          hostedServiceId = deploymentData["services"]["hosted-service"]["slug"];
          indexStatus = deploymentData["services"]["hosted-service"]["health"][0];
          pendingIndexStatus = deploymentData["services"]["hosted-service"]["health"][1];
        }
        if (!!deploymentData["services"]["cronos-portal"]) {
          hostedServiceId = deploymentData["services"]["cronos-portal"]["slug"];
        }
        deposToPass[protocol.schema][protocolName].networks.push({
          deploymentName: depoKey,
          chain: deploymentData.network,
          decentralizedIndexStatus: decentralizedIndexStatus,
          indexStatus: indexStatus,
          pendingIndexStatus: pendingIndexStatus,
          status: deploymentData?.status,
          versions: deploymentData?.versions,
          hostedServiceId,
          decentralizedNetworkId,
        });
        if (
          !deposToPass[protocol.schema][protocolName]?.methodologyVersions?.includes(
            deploymentData?.versions?.methodology,
          )
        ) {
          deposToPass[protocol.schema][protocolName]?.methodologyVersions?.push(deploymentData?.versions?.methodology);
        }
        if (
          !deposToPass[protocol.schema][protocolName]?.subgraphVersions?.includes(deploymentData?.versions?.subgraph)
        ) {
          deposToPass[protocol.schema][protocolName]?.subgraphVersions?.push(deploymentData?.versions?.subgraph);
        }
        if (!deposToPass[protocol.schema][protocolName]?.schemaVersions?.includes(deploymentData?.versions?.schema)) {
          deposToPass[protocol.schema][protocolName]?.schemaVersions?.push(deploymentData?.versions?.schema);
        }
        if (deploymentData?.status === "dev") {
          deposToPass[protocol.schema][protocolName].status = false;
        }
      }
    });
  });
  return (
    <>
      {Object.entries(deposToPass)
        .sort()
        .map(([schemaType, subgraph]) => {
          const validDeployments = [];
          let validationSupported = true;
          if (!Object.keys(utils_1.schemaMapping).includes(schemaType)) {
            validationSupported = false;
          } else {
            schemaType = utils_1.schemaMapping[schemaType];
          }
          const tableRows = Object.keys(subgraph)
            .sort()
            .map((subgraphName) => {
              const protocol = subgraph[subgraphName];
              let csvGenerationComponents = null;
              if (utils_1.schemaMapping[schemaType]) {
                csvGenerationComponents = protocol.networks.map((depo) => {
                  if (
                    utils_1.schemaMapping[generateEntityCSV] === utils_1.schemaMapping[schemaType] &&
                    generateEntityCSV?.length > 0 &&
                    (deposSelected[utils_1.schemaMapping[schemaType]].includes(depo.deploymentName) ||
                      deposSelected[utils_1.schemaMapping[schemaType]].includes("All"))
                  ) {
                    let timestampLt = 10000000000000;
                    if (dates[utils_1.schemaMapping[schemaType]].length > 1) {
                      timestampLt = moment_1.default.utc(dates[utils_1.schemaMapping[schemaType]][1]).unix();
                    }
                    let timestampGt = 0;
                    if (dates[utils_1.schemaMapping[schemaType]].length > 0) {
                      timestampGt = moment_1.default.utc(dates[utils_1.schemaMapping[schemaType]][0]).unix();
                    }
                    return (
                      <FetchEntityCSV_1.default
                        entityName="financialsDailySnapshots"
                        deployment={depo.deploymentName}
                        protocolType={schemaType.toUpperCase()}
                        schemaVersion={depo.versions.schema}
                        timestampLt={timestampLt}
                        timestampGt={timestampGt}
                        queryURL={`${process.env.REACT_APP_GRAPH_BASE_URL}/subgraphs/name/messari/${depo.hostedServiceId}`}
                        resultsObject={resultsObject}
                        setResultsObject={setResultsObject}
                      />
                    );
                  } else if (depo.status === "prod") {
                    validDeployments.push(depo.deploymentName);
                    return null;
                  } else {
                    return null;
                  }
                });
              }
              return (
                <>
                  {csvGenerationComponents}
                  <ProtocolSection_1.default
                    key={"ProtocolSection-" + subgraphName.toUpperCase() + "-" + schemaType}
                    issuesMapping={issuesMapping}
                    subgraphName={subgraphName}
                    protocol={protocol}
                    schemaType={schemaType}
                    decenDeposToSubgraphIds={decenDeposToSubgraphIds}
                    tableExpanded={tableExpanded[schemaType]}
                    validationSupported={validationSupported}
                  />
                </>
              );
            });
          let executeDownloadCSV = null;
          if (deposSelected[utils_1.schemaMapping[schemaType]]?.length > 0) {
            executeDownloadCSV = (
              <>
                <div
                  style={{
                    display: "block",
                    paddingLeft: "5px",
                    textAlign: "left",
                    color: "white",
                    marginBottom: "10px",
                    cursor: "pointer",
                  }}
                  className="Hover-Underline MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButtonBase-root  css-1huqmjz-MuiButtonBase-root-MuiButton-root"
                  onClick={() => {
                    if (generateEntityCSV?.length > 0) {
                      return;
                    }
                    triggerGenerateEntityCSV(schemaType.toUpperCase());
                  }}
                >
                  {generateEntityCSV?.length > 0 &&
                  utils_1.schemaMapping[generateEntityCSV] === utils_1.schemaMapping[schemaType] &&
                  !!utils_1.schemaMapping[schemaType] ? (
                    <>
                      <material_1.CircularProgress size={15} />
                      <span style={{ margin: "0 10px" }}>Loading CSVs...</span>
                    </>
                  ) : (
                    "Get Bulk FinancialsDailySnapshots CSV"
                  )}
                </div>

                <div style={{ position: "relative", zIndex: 1001 }}>
                  <material_1.Button
                    className="Hover-Underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDatePicker({
                        ...showDatePicker,
                        [utils_1.schemaMapping[schemaType]]: !showDatePicker[utils_1.schemaMapping[schemaType]],
                      });
                    }}
                  >
                    {dates[utils_1.schemaMapping[schemaType]]?.length === 2 && !!utils_1.schemaMapping[schemaType]
                      ? `${dates[utils_1.schemaMapping[schemaType]][0].format("M/D/YY")} - ${dates[
                          utils_1.schemaMapping[schemaType]
                        ][1].format("M/D/YY")}`
                      : "Select Dates"}
                  </material_1.Button>
                  {showDatePicker[utils_1.schemaMapping[schemaType]] && (
                    <DateRangePicker_1.DateRangePicker
                      dates={dates[utils_1.schemaMapping[schemaType]]}
                      setDates={(x) => {
                        setDates({ ...dates, [utils_1.schemaMapping[schemaType]]: x });
                        if (x?.length === 2) {
                          setShowDatePicker({ ...showDatePicker, [utils_1.schemaMapping[schemaType]]: false });
                        }
                      }}
                    />
                  )}
                </div>
              </>
            );
          }
          let additionalStyles = {};
          if (showDatePicker[utils_1.schemaMapping[schemaType]]) {
            additionalStyles = { minHeight: "510px", overflow: "hidden" };
          }
          return (
            <material_1.TableContainer
              sx={{ my: 8, ...additionalStyles }}
              key={"TableContainer-" + schemaType.toUpperCase()}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <material_1.Typography
                  key={"typography-Title-" + schemaType}
                  variant="h4"
                  align="left"
                  fontWeight={500}
                  fontSize={28}
                  sx={{ padding: "6px", my: 2 }}
                >
                  {schemaType.toUpperCase()}
                </material_1.Typography>
                <material_1.Typography
                  key={"typography-toggle-" + schemaType}
                  variant="h4"
                  align="left"
                  fontWeight={500}
                  fontSize={18}
                  sx={{ padding: "6px", my: 2 }}
                >
                  <span
                    style={{ color: "white", cursor: "pointer", margin: "4px" }}
                    onClick={() => setTableExpanded({ ...tableExpanded, [schemaType]: !tableExpanded[schemaType] })}
                  >
                    <u>{tableExpanded[schemaType] ? "Collapse" : "Expand"} Table</u>
                  </span>
                </material_1.Typography>
              </div>
              {utils_1.schemaMapping[schemaType] ? (
                <>
                  {executeDownloadCSV}
                  <MultiSelectDropDown_1.MultiSelectDropDown
                    optionsList={validDeployments}
                    optionsSelected={deposSelected[utils_1.schemaMapping[schemaType]]}
                    setOptionsSelected={(x) =>
                      setDeposSelected({ ...deposSelected, [utils_1.schemaMapping[schemaType]]: x })
                    }
                    label="Deployment Selection"
                  />
                </>
              ) : null}
              <material_1.Table stickyHeader>
                {tableHead}
                <material_1.TableBody>{tableRows}</material_1.TableBody>
              </material_1.Table>
            </material_1.TableContainer>
          );
        })}
    </>
  );
}
exports.default = DeploymentsTable;
