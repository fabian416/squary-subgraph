"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
const react_1 = require("react");
const CopyLinkToClipboard_1 = require("../../common/utilComponents/CopyLinkToClipboard");
const bignumber_js_1 = require("bignumber.js");
const ChartContainer_1 = require("../../common/chartComponents/ChartContainer");
const moment_1 = __importDefault(require("moment"));
const jszip_1 = __importDefault(require("jszip"));
const DefiLlamaComparison_1 = __importDefault(require("../../common/chartComponents/DefiLlamaComparison"));
const UploadFileCSV_1 = require("../../common/utilComponents/UploadFileCSV");
const react_router_dom_1 = require("react-router-dom");
// This component is for each individual subgraph
function ProtocolTabEntity({
  entitiesData,
  entityName,
  protocolType,
  subgraphEndpoints,
  entitySpecificElements,
  protocolTableData,
  overlaySchemaData,
  protocolSchemaData,
  currentEntityData,
  currentOverlayEntityData,
  currentTimeseriesLoading,
  currentTimeseriesError,
  setIssues,
}) {
  const issues = [];
  const [issuesSet, setIssuesSet] = (0, react_1.useState)(false);
  const list = {};
  const [searchParams] = (0, react_router_dom_1.useSearchParams)();
  const defiLlamaNetworkParam = searchParams.get("defillamanetwork") || null;
  const defiLlamaProtocolParam = searchParams.get("defillamaprotocol") || null;
  let defiLlamaCompareTVLDefault = false;
  if (defiLlamaProtocolParam || defiLlamaNetworkParam) {
    defiLlamaCompareTVLDefault = true;
  }
  const [downloadAllCharts, triggerDownloadAllCharts] = (0, react_1.useState)(false);
  const [chartsImageFiles, setChartsImageFiles] = (0, react_1.useState)({});
  const [defiLlamaCompareTVL, setDefiLlamaCompareTVL] = (0, react_1.useState)(defiLlamaCompareTVLDefault);
  const [csvJSON, setCsvJSON] = (0, react_1.useState)(null);
  const [csvMetaData, setCsvMetaData] = (0, react_1.useState)({ fileName: "", columnName: "", csvError: null });
  // dataFields object has corresponding key:value pairs. Key is the field name and value is an array with an object holding the coordinates to be plotted on the chart for that entity field.
  const [dataFieldsState, setDataFieldsState] = (0, react_1.useState)({});
  // dataFieldMetrics is used to store sums, expressions, etc calculated upon certain certain datafields to check for irregularities in the data
  const [dataFieldMetricsState, setDataFieldMetricsState] = (0, react_1.useState)({});
  // For the current entity, loop through all instances of that entity
  const [overlayDataFieldsState, setOverlayDataFieldsState] = (0, react_1.useState)({});
  (0, react_1.useEffect)(() => {
    if (downloadAllCharts) {
      if (chartsImageFiles) {
        if (Object.keys(chartsImageFiles).length > 0) {
          let zip = new jszip_1.default();
          Object.keys(chartsImageFiles).forEach((fileName) => {
            const blob = (0, utils_1.base64toBlobJPEG)(chartsImageFiles[fileName]);
            if (blob) {
              zip.file(fileName + ".jpeg", blob);
            }
          });
          zip.generateAsync({ type: "base64" }).then(function (content) {
            const link = document.createElement("a");
            link.download = "charts.zip";
            link.href = "data:application/zip;base64," + content;
            link.click();
            triggerDownloadAllCharts(false);
          });
        }
      }
    }
  }, [chartsImageFiles]);
  (0, react_1.useEffect)(() => {
    if (!issuesSet && issues.length > 0) {
      setIssues(issues);
      setIssuesSet(true);
    }
  });
  if (!currentTimeseriesLoading && currentEntityData) {
    try {
      // If the current entity has no instances, return the following
      if (currentEntityData?.length === 0) {
        return (
          <material_1.Box key={entityName}>
            <material_1.Typography variant="h4">ENTITY: {entityName}</material_1.Typography>
            <material_1.Typography variant="body1">{entityName} HAS NO TIMESERIES DATA.</material_1.Typography>
          </material_1.Box>
        );
      }
      // dataFields object has corresponding key:value pairs. Key is the field name and value is an array with an object holding the coordinates to be plotted on the chart for that entity field.
      let dataFields = {};
      // dataFieldMetrics is used to store sums, expressions, etc calculated upon certain certain datafields to check for irregularities in the data
      let dataFieldMetrics = {};
      // For the current entity, loop through all instances of that entity
      let overlayDataFields = {};
      const overlayDifference = currentEntityData.length - currentOverlayEntityData.length;
      if (
        !dataFieldsState?.data ||
        (currentOverlayEntityData.length > 0 && Object.keys(overlayDataFieldsState).length === 0)
      ) {
        for (let x = currentEntityData.length - 1; x >= 0; x--) {
          const timeseriesInstance = currentEntityData[x];
          const blockNumber = "blockNumber" in timeseriesInstance ? timeseriesInstance["blockNumber"] : null;
          let dateVal = Number(timeseriesInstance["timestamp"]);
          constants_1.dateValueKeys.forEach((key) => {
            let factor = 86400;
            if (key.includes("hour")) {
              factor = factor / 24;
            }
            if (!!(Number(timeseriesInstance[key]) * factor)) {
              dateVal = Number(timeseriesInstance[key]) * factor;
            }
          });
          let overlayIndex = x;
          if (overlayDifference > 0) {
            overlayIndex = x - overlayDifference;
          }
          const overlayTimeseriesInstance = currentOverlayEntityData[overlayIndex];
          const overlayBlockNumber =
            overlayTimeseriesInstance && "blockNumber" in overlayTimeseriesInstance
              ? overlayTimeseriesInstance["blockNumber"]
              : null;
          let overlayDateVal = Number(overlayTimeseriesInstance?.["timestamp"]) || 0;
          if (!!overlayTimeseriesInstance) {
            constants_1.dateValueKeys.forEach((key) => {
              let factor = 86400;
              if (key.includes("hour")) {
                factor = factor / 24;
              }
              if (!!(Number(overlayTimeseriesInstance[key]) * factor)) {
                overlayDateVal = Number(overlayTimeseriesInstance[key]) * factor;
              }
            });
          }
          // On the entity instance, loop through all of the entity fields within it
          // create the base yield field for DEXs
          Object.keys(timeseriesInstance).forEach((fieldName) => {
            // skip the timestamp field on each entity instance
            if (
              fieldName === "timestamp" ||
              fieldName === "id" ||
              fieldName === "__typename" ||
              constants_1.dateValueKeys.includes(fieldName)
            ) {
              return;
            }
            // The following section determines whether or not the current field on the entity is a numeric value or an array that contains numeric values
            const currentInstanceField = timeseriesInstance[fieldName];
            let currentOverlayInstanceField = {};
            if (overlayTimeseriesInstance) {
              if (Object.keys(overlayTimeseriesInstance).includes(fieldName)) {
                currentOverlayInstanceField = overlayTimeseriesInstance[fieldName];
              }
            }
            try {
              if (!isNaN(currentInstanceField) && !Array.isArray(currentInstanceField)) {
                // If the entity field is a numeric value, push it to the array corresponding to the field name in the dataFields array
                // Add the value to the sum field on the entity field name in the dataFieldMetrics obj
                if (!dataFields[fieldName]) {
                  dataFields[fieldName] = [
                    { value: Number(currentInstanceField), date: dateVal, blockNumber: blockNumber },
                  ];
                  dataFieldMetrics[fieldName] = { sum: Number(currentInstanceField) };
                } else {
                  dataFields[fieldName].push({
                    value: Number(currentInstanceField),
                    date: dateVal,
                    blockNumber: blockNumber,
                  });
                  dataFieldMetrics[fieldName].sum += Number(currentInstanceField);
                }
                if (Number(currentInstanceField) < 0) {
                  if (!dataFieldMetrics[fieldName].negative) {
                    // Capture the first snapshot (if there are multiple) where a value was negative. Count is cumulative
                    dataFieldMetrics[fieldName].negative = {
                      firstSnapshot: timeseriesInstance.id,
                      value: Number(currentInstanceField),
                      count: 0,
                    };
                  }
                  dataFieldMetrics[fieldName].negative.count += 1;
                }
                if (fieldName.endsWith("TotalRevenueUSD") && !dataFieldMetrics[fieldName].revSumMismatch) {
                  // store ID of first instance where total rev != supply + protocol rev
                  const fieldSplit = fieldName.split("TotalRevenueUSD");
                  const totalRevenue = new bignumber_js_1.BigNumber(
                    dataFieldMetrics[`${fieldSplit[0]}TotalRevenueUSD`].sum,
                  );
                  const sumRevenue = new bignumber_js_1.BigNumber(
                    dataFieldMetrics[`${fieldSplit[0]}ProtocolSideRevenueUSD`].sum,
                  ).plus(new bignumber_js_1.BigNumber(dataFieldMetrics[`${fieldSplit[0]}SupplySideRevenueUSD`].sum));
                  if (!sumRevenue.isEqualTo(totalRevenue)) {
                    const divergence = totalRevenue
                      .minus(sumRevenue)
                      .div(totalRevenue)
                      .times(100)
                      .toNumber()
                      .toFixed(1);
                    dataFieldMetrics[fieldName].revSumMismatch = {
                      timeSeriesInstanceId: timeseriesInstance.id,
                      totalRevenue,
                      sumRevenue,
                      divergence,
                    };
                  }
                }
                if (fieldName.endsWith("TransactionCount") && !dataFieldMetrics[fieldName].txSumMismatch) {
                  // store ID of first instance where total tx != sum of all individual tx
                  const individualTxCountKeys = Object.keys(timeseriesInstance).filter(
                    (field) =>
                      (field.startsWith("daily") || field.startsWith("hourly")) &&
                      field.endsWith("Count") &&
                      !field.endsWith("TransactionCount"),
                  );
                  const individualTxSum = individualTxCountKeys.reduce(
                    (prev, currentKey) => prev.plus(new bignumber_js_1.BigNumber(timeseriesInstance[currentKey])),
                    new bignumber_js_1.BigNumber(0),
                  );
                  const totalTxKey = Object.keys(timeseriesInstance).find((field) =>
                    field.endsWith("TransactionCount"),
                  );
                  const totalTx = new bignumber_js_1.BigNumber(totalTxKey || 0);
                  if (!individualTxSum.isEqualTo(totalTx)) {
                    const divergence = totalTx.minus(individualTxSum).div(totalTx).times(100).toNumber().toFixed(1);
                    dataFieldMetrics[fieldName].txSumMismatch = {
                      timeSeriesInstanceId: timeseriesInstance.id,
                      individualTxSum,
                      totalTx,
                      divergence,
                    };
                  }
                }
                if (fieldName?.toUpperCase()?.includes("CUMULATIVE")) {
                  if (!Object.keys(dataFieldMetrics[fieldName]).includes("cumulative")) {
                    dataFieldMetrics[fieldName].cumulative = { prevVal: 0, hasLowered: "" };
                  }
                  if (Number(currentInstanceField) < dataFieldMetrics[fieldName]?.cumulative?.prevVal) {
                    dataFieldMetrics[fieldName].cumulative.hasLowered = timeseriesInstance.id;
                  }
                  dataFieldMetrics[fieldName].cumulative.prevVal = Number(currentInstanceField);
                }
              } else if (Array.isArray(currentInstanceField)) {
                // if the current entity field is an array, loop through it and create separate dataField keys for each index of the array
                // This way, each index on the field will have its own chart (ie rewardTokenEmissions[0] and rewardTokenEmissions[1] have their own charts)
                for (let arrayIndex = 0; arrayIndex < currentInstanceField.length; arrayIndex++) {
                  const val = currentInstanceField[arrayIndex];
                  const dataFieldKey = fieldName + " [" + arrayIndex + "]";
                  let value = Number(val);
                  try {
                    if (fieldName === "mintedTokenSupplies" && protocolTableData?.lendingType === "CDP") {
                      if (protocolTableData?.mintedTokens.length > 0) {
                        value = (0, utils_1.convertTokenDecimals)(
                          val,
                          protocolTableData.mintedTokens[arrayIndex]?.decimals,
                        );
                      }
                    } else if (fieldName === "mintedTokenSupplies" && protocolTableData?.lendingType !== "CDP") {
                      continue;
                    }
                  } catch (err) {
                    console.error("ERR - COULD NOT GET MINTED TOKEN DECIMALS", err);
                  }
                  if (!dataFields[dataFieldKey]) {
                    dataFields[dataFieldKey] = [{ value: value, date: dateVal, blockNumber: blockNumber }];
                    dataFieldMetrics[dataFieldKey] = { sum: value };
                  } else {
                    dataFields[dataFieldKey].push({ value: value, date: dateVal, blockNumber: blockNumber });
                    dataFieldMetrics[dataFieldKey].sum += value;
                  }
                  if (Number(value) < 0) {
                    if (!dataFieldMetrics[fieldName].negative) {
                      // Capture the first snapshot (if there are multiple) where a value was negative. Count is cumulative
                      dataFieldMetrics[fieldName].negative = {
                        firstSnapshot: timeseriesInstance.id,
                        value: Number(value),
                        count: 0,
                      };
                    }
                    dataFieldMetrics[fieldName].negative.count += 1;
                  }
                  if (dataFieldKey?.toUpperCase()?.includes("CUMULATIVE")) {
                    if (!Object.keys(dataFieldMetrics[dataFieldKey]).includes("cumulative")) {
                      dataFieldMetrics[dataFieldKey].cumulative = { prevVal: 0, hasLowered: "" };
                    }
                    if (value < dataFieldMetrics[dataFieldKey].cumulative.prevVal) {
                      dataFieldMetrics[dataFieldKey].cumulative.hasLowered = timeseriesInstance.id;
                    }
                    dataFieldMetrics[dataFieldKey].cumulative.prevVal = value;
                  }
                }
              }
              if (x < overlayDifference && currentOverlayEntityData.length > 0) {
                overlayDataFields[fieldName] = [
                  ...overlayDataFields[fieldName],
                  { value: 0, date: Number(timeseriesInstance.timestamp), blockNumber: blockNumber },
                ];
              } else if (overlayTimeseriesInstance) {
                if (!isNaN(currentOverlayInstanceField) && !Array.isArray(currentOverlayInstanceField)) {
                  // If the entity field is a numeric value, push it to the array corresponding to the field name in the dataFields array
                  // Add the value to the sum field on the entity field name in the dataFieldMetrics obj
                  if (!overlayDataFields[fieldName]) {
                    overlayDataFields[fieldName] = [
                      {
                        value: Number(currentOverlayInstanceField),
                        date: overlayDateVal,
                        blockNumber: overlayBlockNumber,
                      },
                    ];
                  } else {
                    overlayDataFields[fieldName].push({
                      value: Number(currentOverlayInstanceField),
                      date: overlayDateVal,
                      blockNumber: overlayBlockNumber,
                    });
                  }
                } else if (Array.isArray(currentOverlayInstanceField)) {
                  // if the current entity field is an array, loop through it and create separate dataField keys for each index of the array
                  // This way, each index on the field will have its own chart (ie rewardTokenEmissions[0] and rewardTokenEmissions[1] have their own charts)
                  // currentOverlayInstanceField.forEach((val: string, arrayIndex: number) => {
                  for (let arrayIndex = 0; arrayIndex < currentOverlayInstanceField.length; arrayIndex++) {
                    const val = currentOverlayInstanceField[arrayIndex];
                    const dataFieldKey = fieldName + " [" + arrayIndex + "]";
                    let value = Number(val);
                    try {
                      if (fieldName === "mintedTokenSupplies" && protocolTableData?.lendingType === "CDP") {
                        if (protocolTableData?.mintedTokens.length > 0) {
                          value = (0, utils_1.convertTokenDecimals)(
                            val,
                            protocolTableData.mintedTokens[arrayIndex]?.decimals,
                          );
                        }
                      } else if (fieldName === "mintedTokenSupplies" && protocolTableData?.lendingType !== "CDP") {
                        continue;
                      }
                    } catch (err) {
                      console.error("ERR - COULD NOT GET MINTED TOKEN DECIMALS", err);
                    }
                    if (!overlayDataFields[dataFieldKey]) {
                      overlayDataFields[dataFieldKey] = [
                        { value: value, date: overlayDateVal, blockNumber: overlayBlockNumber },
                      ];
                    } else {
                      overlayDataFields[dataFieldKey].push({
                        value: value,
                        date: overlayDateVal,
                        blockNumber: overlayBlockNumber,
                      });
                    }
                  }
                }
              }
            } catch (err) {
              let message = "JAVASCRIPT ERROR";
              if (err instanceof Error) {
                message = err.message;
              }
              issues.push({
                type: "JS",
                message: message,
                level: "critical",
                fieldName: entityName + "-" + fieldName,
              });
            }
          });
        }
        setDataFieldsState({ data: dataFields });
        setDataFieldMetricsState(dataFieldMetrics);
        setOverlayDataFieldsState(overlayDataFields);
        return <material_1.CircularProgress size={50} />;
      }
      dataFields = dataFieldsState.data;
      dataFieldMetrics = dataFieldMetricsState;
      overlayDataFields = overlayDataFieldsState;
      list[entityName] = {};
      for (let x = 0; x < Object.keys(entitiesData[entityName]).length; x++) {
        const entityField = Object.keys(entitiesData[entityName])[x];
        if (entityField === "timestamp") {
          continue;
        }
        const renderedField = dataFields[entityField];
        if (renderedField) {
          list[entityName][entityField] = "Included";
        } else {
          const extrapolatedFields = Object.keys(dataFields).filter((df) => {
            return df.includes(entityField);
          });
          if (extrapolatedFields?.length > 0) {
            list[entityName][entityField] = "Array Included";
          } else {
            const req =
              "!" ===
              entitiesData[entityName][entityField].split("")[
                entitiesData[entityName][entityField].split("").length - 1
              ];
            if (req) {
              list[entityName][entityField] = "MISSING AND REQUIRED";
            } else {
              list[entityName][entityField] = "NOT REQUIRED";
            }
          }
        }
      }
      const mappedCurrentEntityData = currentEntityData
        .map((instance, idx) => {
          let instanceToSave = {};
          let dateVal = Number(instance["timestamp"]);
          constants_1.dateValueKeys.forEach((key) => {
            let factor = 86400;
            if (key.includes("hour")) {
              factor = factor / 24;
            }
            if (!!(Number(instance[key]) * factor)) {
              dateVal = Number(instance[key]) * factor;
            }
          });
          instanceToSave.date = moment_1.default.utc(dateVal).format("YYYY-MM-DD");
          instanceToSave = { ...instanceToSave, ...instance };
          delete instanceToSave.__typename;
          return instanceToSave;
        })
        .sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
      // For each entity field/key in the dataFields object, create a chart and tableChart component
      // If the sum of all values for a chart is 0, display a warning that the entity is not properly collecting data
      return (
        <material_1.Grid key={entityName}>
          <material_1.Box sx={{ marginTop: "24px" }}>
            <CopyLinkToClipboard_1.CopyLinkToClipboard link={window.location.href} scrollId={entityName}>
              <material_1.Typography variant="h4" id={entityName}>
                {entityName}
              </material_1.Typography>
            </CopyLinkToClipboard_1.CopyLinkToClipboard>
          </material_1.Box>
          <material_1.Tooltip placement="top" title={"Overlay chart with data points populated from a .csv file"}>
            <UploadFileCSV_1.UploadFileCSV
              style={{ paddingLeft: "5px", color: "lime" }}
              isEntityLevel={true}
              csvMetaData={csvMetaData}
              field={entityName}
              csvJSON={csvJSON}
              setCsvJSON={setCsvJSON}
              setCsvMetaData={setCsvMetaData}
            />
          </material_1.Tooltip>
          <div>
            <div
              style={{ display: "block", paddingLeft: "5px", textAlign: "left", color: "white" }}
              className="Hover-Underline MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButtonBase-root  css-1huqmjz-MuiButtonBase-root-MuiButton-root"
              onClick={() => (0, utils_1.downloadCSV)(mappedCurrentEntityData, entityName, entityName)}
            >
              Download Snapshots as csv
            </div>
            <div
              style={{ display: "block", paddingLeft: "5px", textAlign: "left", color: "white" }}
              className="Hover-Underline MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButtonBase-root  css-1huqmjz-MuiButtonBase-root-MuiButton-root"
              onClick={() => triggerDownloadAllCharts(true)}
            >
              Download All Chart Images
            </div>
          </div>
          {Object.keys(dataFields).map((field) => {
            // The following checks if the field is required or can be null
            const fieldName = field.split(" [")[0];
            if (
              fieldName === "totalValueLockedUSD" &&
              defiLlamaCompareTVL &&
              entityName === "financialsDailySnapshots"
            ) {
              return (
                <>
                  <div
                    style={{ display: "block", paddingLeft: "5px", textAlign: "left", color: "white" }}
                    className="Hover-Underline MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButtonBase-root  css-1huqmjz-MuiButtonBase-root-MuiButton-root"
                    onClick={() => setDefiLlamaCompareTVL(false)}
                  >
                    Remove DefiLlama Comparison
                  </div>
                  <DefiLlamaComparison_1.default
                    subgraphEndpoints={subgraphEndpoints}
                    financialsData={{ financialsDailySnapshots: currentEntityData }}
                  />
                </>
              );
            }
            const label = entityName + "-" + field;
            const elementId = label.split(" ").join("%20");
            try {
              if (dataFieldMetrics[field]?.sum === 0) {
                // Create a warning for the 0 sum of all snapshots for this field
                const schemaField = Object.keys(entitiesData[entityName]).find((fieldSchema) => {
                  return fieldName.toUpperCase().includes(fieldSchema.toUpperCase());
                });
                let level = "warning";
                if (schemaField) {
                  const fieldChars = entitiesData[entityName][schemaField].split("");
                  if (fieldChars[fieldChars.length - 1] === "!") {
                    level = "error";
                  }
                }
                issues.push({ type: "SUM", message: "", fieldName: label, level });
              }
              if (dataFieldMetrics[field].revSumMismatch && dataFieldMetrics[field].revSumMismatch.divergence > 5) {
                // if total revenue != protocol + supply revenue, add a warning
                const fieldSplit = field.split("TotalRevenueUSD");
                issues.push({
                  type: "TOTAL_REV",
                  message: JSON.stringify(dataFieldMetrics[`${fieldSplit[0]}TotalRevenueUSD`].revSumMismatch),
                  level: "warning",
                  fieldName: label,
                });
              }
              if (dataFieldMetrics[field].txSumMismatch && dataFieldMetrics[field].txSumMismatch.divergence > 5) {
                // if total transactions != sum of all individual transactions, add a warning
                issues.push({
                  type: "TOTAL_TX",
                  message: JSON.stringify(dataFieldMetrics[field].txSumMismatch),
                  level: "warning",
                  fieldName: label,
                });
              }
              const isnonStrictlyIncrementalFieldList = constants_1.nonStrictlyIncrementalFieldList.find((x) => {
                return field.toUpperCase().includes(x.toUpperCase());
              });
              if (!isnonStrictlyIncrementalFieldList && dataFieldMetrics[field]?.cumulative?.hasLowered?.length > 0) {
                issues.push({
                  type: "CUMULATIVE",
                  message: dataFieldMetrics[field]?.cumulative?.hasLowered,
                  level: "error",
                  fieldName: label,
                });
              }
              const isNegativeField = constants_1.negativeFieldList.find((x) => {
                return field.toUpperCase().includes(x.toUpperCase());
              });
              if (dataFieldMetrics[field]?.negative && !isNegativeField) {
                issues.push({
                  message: JSON.stringify(dataFieldMetrics[field]?.negative),
                  type: "NEG",
                  level: "critical",
                  fieldName: `${entityName}-${field}`,
                });
              }
            } catch (err) {
              console.log("ERROR RENDER", err);
              let message = "JAVASCRIPT ERROR";
              if (err instanceof Error) {
                message = err.message;
              }
              issues.push({
                type: "JS",
                message: 6 + message,
                level: "critical",
                fieldName: entityName + "-" + field,
              });
              return (
                <div key={elementId}>
                  <material_1.Box
                    mt={3}
                    mb={1}
                    style={{ borderTop: "2px solid #B8301C", borderBottom: "2px solid #B8301C" }}
                  >
                    <CopyLinkToClipboard_1.CopyLinkToClipboard link={window.location.href} scrollId={elementId}>
                      <material_1.Typography variant="h6">
                        {field} - {message}
                      </material_1.Typography>
                    </CopyLinkToClipboard_1.CopyLinkToClipboard>
                  </material_1.Box>
                </div>
              );
            }
            let dataChartToPass = dataFields[field];
            const baseKey = `${protocolSchemaData?.protocols[0]?.name}-${protocolSchemaData?.protocols[0]?.network}-${protocolSchemaData?.protocols[0]?.subgraphVersion}`;
            if (overlayDataFields[field]) {
              const overlayKey = `${overlaySchemaData?.protocols[0]?.name}-${overlaySchemaData?.protocols[0]?.network}-${overlaySchemaData?.protocols[0]?.subgraphVersion}`;
              let keyDiff = "";
              if (baseKey === overlayKey) {
                keyDiff = " (Overlay)";
              }
              dataChartToPass = { [baseKey]: dataFields[field], [overlayKey + keyDiff]: overlayDataFields[field] };
            }
            let tvlButton = null;
            if (fieldName === "totalValueLockedUSD" && entityName === "financialsDailySnapshots") {
              tvlButton = (
                <div
                  style={{ display: "block", paddingLeft: "5px", textAlign: "left", color: "white" }}
                  className="Hover-Underline MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButtonBase-root  css-1huqmjz-MuiButtonBase-root-MuiButton-root"
                  onClick={() => setDefiLlamaCompareTVL(true)}
                >
                  Compare TVL To DefiLlama
                </div>
              );
            }
            return (
              <>
                {tvlButton}
                <ChartContainer_1.ChartContainer
                  csvMetaDataProp={csvMetaData}
                  csvJSONProp={csvJSON}
                  baseKey={baseKey}
                  elementId={elementId}
                  downloadAllCharts={downloadAllCharts}
                  identifier={protocolTableData?.slug}
                  datasetLabel={label}
                  dataTable={dataFields[field]}
                  dataChart={dataChartToPass}
                  chartsImageFiles={chartsImageFiles}
                  setChartsImageFiles={(x) => setChartsImageFiles(x)}
                  isStringField={false}
                />
              </>
            );
          })}
        </material_1.Grid>
      );
    } catch (err) {
      if (err instanceof Error) {
        console.log("CATCH", Object.keys(err), Object.values(err), err);
        return <h3>JAVASCRIPT ERROR - PROTOCOL TAB - {err.message}</h3>;
      } else {
        return <h3>JAVASCRIPT ERROR - PROTOCOL TAB</h3>;
      }
    }
  } else if (currentTimeseriesError) {
    issues.push({
      type: "VAL",
      message: currentTimeseriesError?.message,
      level: "critical",
      fieldName: entityName + "-" + currentTimeseriesError?.message,
    });
    return (
      <material_1.Grid key={entityName}>
        <material_1.Box my={3}>
          <CopyLinkToClipboard_1.CopyLinkToClipboard link={window.location.href} scrollId={entityName}>
            <material_1.Typography variant="h4" id={entityName}>
              {entityName}
            </material_1.Typography>
          </CopyLinkToClipboard_1.CopyLinkToClipboard>
        </material_1.Box>
        <h3>{currentTimeseriesError?.message}</h3>
      </material_1.Grid>
    );
  } else {
    return (
      <material_1.Grid key={entityName}>
        <material_1.Box my={3}>
          <CopyLinkToClipboard_1.CopyLinkToClipboard link={window.location.href} scrollId={entityName}>
            <material_1.Typography variant="h4" id={entityName}>
              {entityName}
            </material_1.Typography>
          </CopyLinkToClipboard_1.CopyLinkToClipboard>
        </material_1.Box>
      </material_1.Grid>
    );
  }
}
exports.default = ProtocolTabEntity;
