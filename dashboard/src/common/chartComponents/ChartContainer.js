"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartContainer = void 0;
const material_1 = require("@mui/material");
const moment_1 = __importDefault(require("moment"));
const react_1 = require("react");
const utils_1 = require("../../utils");
const CopyLinkToClipboard_1 = require("../utilComponents/CopyLinkToClipboard");
const CsvOverlayColumnDropDown_1 = require("../utilComponents/CsvOverlayColumnDropDown");
const UploadFileCSV_1 = require("../utilComponents/UploadFileCSV");
const ComparisonTable_1 = require("./ComparisonTable");
const StandardChart_1 = require("./StandardChart");
const TableChart_1 = require("./TableChart");
const colorList = ["rgb(53, 162, 235)", "red", "yellow", "lime", "pink", "black", "orange", "green"];
const ChartContainer = ({
  identifier,
  elementId,
  baseKey,
  datasetLabel,
  dataChart,
  dataTable,
  downloadAllCharts,
  chartsImageFiles,
  setChartsImageFiles,
  csvJSONProp,
  csvMetaDataProp,
  isStringField = false,
}) => {
  const chartRef = (0, react_1.useRef)(null);
  const [chartIsImage, setChartIsImage] = (0, react_1.useState)(false);
  const [csvJSON, setCsvJSON] = (0, react_1.useState)(null);
  const [csvMetaData, setCsvMetaData] = (0, react_1.useState)({
    fileName: "",
    columnName: "",
    csvError: null,
  });
  const [compChart, setCompChart] = (0, react_1.useState)({});
  const [overlayKey, setOverlayKey] = (0, react_1.useState)("");
  const dataChartPropKeys = Object.keys(dataChart);
  let dataChartCopy = JSON.parse(JSON.stringify(dataChart));
  (0, react_1.useEffect)(() => {
    if (!!compChart && !csvJSONProp && !csvJSON && Array.isArray(dataChart)) {
      setCompChart({});
    }
  }, [dataChart, csvJSONProp, csvJSON]);
  function jpegDownloadHandler(downloadInZip) {
    try {
      const link = document.createElement("a");
      const field = datasetLabel.split("-")[1] || datasetLabel;
      let freq = datasetLabel.split("-")[0]?.toUpperCase()?.includes("HOURLY") ? "hourly-" : "";
      if (datasetLabel.split("-")[0]?.toUpperCase()?.includes("DAILY")) {
        freq = "daily-";
      }
      if (field?.toUpperCase()?.includes("DAILY") || field?.toUpperCase()?.includes("HOURLY")) {
        freq = "";
      }
      if (downloadInZip) {
        setChartsImageFiles((prevState) => ({
          ...prevState,
          [datasetLabel]: chartRef.current?.toBase64Image("image/jpeg", 1),
        }));
      } else {
        link.download =
          identifier + "-" + freq + field + "-" + moment_1.default.utc(Date.now()).format("MMDDYY") + ".jpeg";
        link.href = chartRef.current?.toBase64Image("image/jpeg", 1);
        link.click();
      }
    } catch (err) {
      return;
    }
  }
  (0, react_1.useEffect)(() => {
    if (!!downloadAllCharts) {
      jpegDownloadHandler(true);
    }
  }, [downloadAllCharts]);
  (0, react_1.useEffect)(() => {
    setChartIsImage(false);
    if (!csvJSON && csvMetaData) {
      setCsvMetaData({ fileName: "", columnName: "", csvError: null });
    }
  }, [csvJSONProp, csvJSON]);
  (0, react_1.useEffect)(() => {
    try {
      let compChartToSet = compChart;
      let overlayKey = csvMetaData?.fileName?.length || 0 > 0 ? csvMetaData.fileName : csvMetaDataProp.fileName;
      if (csvMetaData.columnName) {
        overlayKey += "-" + csvMetaData.columnName;
      }
      if (
        (csvJSON || csvJSONProp) &&
        !Array.isArray(dataChartCopy) &&
        typeof dataChartCopy === "object" &&
        Object.keys(dataChartCopy).includes(
          csvMetaData.fileName?.length > 0 ? csvMetaData.fileName : csvMetaDataProp.fileName,
        )
      ) {
        compChartToSet = (0, utils_1.lineupChartDatapoints)({
          [baseKey?.length > 0 ? baseKey : "base"]: dataTable,
          [overlayKey]:
            dataChartCopy[csvMetaData.fileName?.length > 0 ? csvMetaData.fileName : csvMetaDataProp.fileName],
        });
        if (compChartToSet instanceof Error) {
          throw new Error(compChartToSet?.message);
        } else {
          setOverlayKey(overlayKey);
          setCompChart(compChartToSet);
        }
      } else if (
        !Array.isArray(dataChartCopy) &&
        typeof dataChartCopy === "object" &&
        Object.keys(dataChartCopy)?.length >= 2 &&
        !!baseKey
      ) {
        if (!overlayKey) {
          overlayKey = Object.keys(dataChartCopy)[1];
        }
        compChartToSet = (0, utils_1.lineupChartDatapoints)({
          [baseKey]: dataChartCopy[baseKey],
          [Object.keys(dataChartCopy)[1]]: dataChartCopy[Object.keys(dataChartCopy)[1]],
        });
        if (compChartToSet instanceof Error) {
          throw new Error(compChartToSet?.message);
        } else {
          setOverlayKey(overlayKey);
          setCompChart(compChartToSet);
        }
      } else if (dataTable?.length > 0) {
        let valueArray = [];
        let dateArray = [];
        if (csvJSON) {
          if (csvJSON[csvMetaData?.columnName]) {
            valueArray = csvJSON[csvMetaData?.columnName];
            dateArray = csvJSON.date;
          }
        } else if (csvJSONProp) {
          if (csvJSONProp[csvMetaData?.columnName]) {
            valueArray = csvJSONProp[csvMetaData?.columnName];
            dateArray = csvJSONProp.date;
          }
        }
        if (valueArray.length > 0) {
          const overlayData = valueArray.map((x, idx) => {
            if (dateArray[idx]) {
              return {
                date: dateArray[idx],
                value: x,
              };
            }
          });
          compChartToSet = (0, utils_1.lineupChartDatapoints)({
            [baseKey?.length > 0 ? baseKey : "base"]: dataTable,
            [overlayKey]: overlayData,
          });
          if (compChartToSet instanceof Error) {
            throw new Error(compChart?.message);
          } else if (compChartToSet) {
            if (Object.keys(compChartToSet)?.length > 0) {
              setCompChart(compChartToSet);
              setOverlayKey(overlayKey);
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  }, [dataTable, dataChart, csvJSONProp, csvJSON, csvMetaDataProp, csvMetaData]);
  const hourly = datasetLabel.split("-")[0]?.toUpperCase()?.includes("HOURLY");
  let chart = null;
  let csvColumnOptions = null;
  let datasets = [];
  try {
    if (dataChartCopy) {
      let labels = [];
      let csvArr = [];
      let jsonToUse = null;
      if (csvJSONProp?.[csvMetaData?.columnName]) {
        jsonToUse = csvJSONProp[csvMetaData?.columnName].map((x, idx) => {
          if (csvJSONProp?.date[idx]) {
            return {
              date: csvJSONProp?.date[idx],
              value: x,
            };
          }
        });
      }
      if (csvJSON) {
        jsonToUse = csvJSON;
      }
      if (jsonToUse) {
        if (Array.isArray(jsonToUse)) {
          const csvDataPointsByDate = {};
          let iterativeBaseData = dataChartCopy;
          if (typeof dataChartCopy === "object" && !Array.isArray(dataChartCopy)) {
            iterativeBaseData = dataChartCopy[Object.keys(dataChartCopy)[0]];
          }
          let formatStr = "YYYY-MM-DD";
          if (hourly) {
            formatStr = "YYYY-MM-DD hh";
          }
          jsonToUse.forEach(
            (x) => (csvDataPointsByDate[moment_1.default.utc(x.date * 1000).format(formatStr)] = x.value),
          );
          csvArr = iterativeBaseData.map((point) => {
            let csvVal = 0;
            let currentDateString = moment_1.default.utc(point.date * 1000).format(formatStr);
            if (csvDataPointsByDate[currentDateString]) {
              csvVal = csvDataPointsByDate[currentDateString];
            }
            return {
              date: point.date,
              value: csvVal,
            };
          });
        } else {
          const columnsList = Object.keys(jsonToUse).filter((key) => key !== "date");
          csvColumnOptions = (
            <CsvOverlayColumnDropDown_1.CsvOverlayColumnDropDown
              setSelectedColumn={(x) => setCsvMetaData({ ...csvMetaData, columnName: x })}
              selectedColumn={csvMetaData.columnName}
              columnsList={columnsList}
            />
          );
          if (csvMetaData.columnName) {
            let formatStr = "YYYY-MM-DD";
            if (hourly) {
              formatStr = "YYYY-MM-DD hh";
            }
            const csvDataPointsByDate = {};
            let iterativeBaseData = dataChartCopy;
            if (typeof dataChartCopy === "object" && !Array.isArray(dataChartCopy)) {
              iterativeBaseData = dataChartCopy[Object.keys(dataChartCopy)[0]];
            }
            if (jsonToUse) {
              jsonToUse?.date?.forEach((date, idx) => {
                if (!!jsonToUse) {
                  csvDataPointsByDate[moment_1.default.utc(date * 1000).format(formatStr)] =
                    jsonToUse[csvMetaData.columnName][idx];
                }
              });
            }
            csvArr = iterativeBaseData.map((point) => {
              let csvVal = 0;
              let currentDateString = moment_1.default.utc(point.date * 1000).format(formatStr);
              if (csvDataPointsByDate[currentDateString]) {
                csvVal = csvDataPointsByDate[currentDateString];
              }
              return {
                date: point.date,
                value: csvVal,
              };
            });
          }
        }
      } else {
        csvArr = [];
      }
      if (Array.isArray(dataChartCopy)) {
        if (csvArr.length === 0) {
          labels = dataChartCopy.map((e) => (0, utils_1.toDate)(e.date));
          datasets = [
            {
              data: dataChartCopy.map((e) => e.value),
              backgroundColor: "rgba(53, 162, 235, 0.5)",
              borderColor: "rgb(53, 162, 235)",
              label: datasetLabel,
            },
          ];
        } else {
          dataChartCopy = {
            [baseKey?.length > 0 ? baseKey : "base"]: dataChartCopy,
            [csvMetaData.fileName?.length > 0 ? csvMetaData.fileName : csvMetaDataProp.fileName]: csvArr,
          };
        }
      }
      if (typeof dataChartCopy === "object" && !Array.isArray(dataChartCopy)) {
        if (csvArr.length > 0) {
          dataChartCopy[csvMetaData.fileName?.length > 0 ? csvMetaData.fileName : csvMetaDataProp.fileName] = csvArr;
        } else if (
          Object.keys(dataChartCopy).includes(
            csvMetaData.fileName?.length > 0 ? csvMetaData.fileName : csvMetaDataProp.fileName,
          ) &&
          !csvMetaData.columnName
        ) {
          delete dataChartCopy[csvMetaData.fileName?.length > 0 ? csvMetaData.fileName : csvMetaDataProp.fileName];
        }
        datasets = Object.keys(dataChartCopy).map((item, idx) => {
          let key = item;
          if (
            csvMetaData.columnName &&
            item === (csvMetaData.fileName?.length > 0 ? csvMetaData.fileName : csvMetaDataProp.fileName)
          ) {
            key += "-" + csvMetaData.columnName;
          }
          if (labels.length === 0) {
            labels = dataChartCopy[item].map((e) => (0, utils_1.toDate)(e.date));
          }
          return {
            data: dataChartCopy[item].map((e) => e.value),
            backgroundColor: colorList[idx],
            borderColor: colorList[idx],
            label: key,
          };
        });
        if (jsonToUse) {
          if (Array.isArray(jsonToUse)) {
            const csvDataPointsByDate = {};
            let iterativeBaseData = dataChartCopy;
            if (typeof dataChartCopy === "object" && !Array.isArray(dataChartCopy)) {
              iterativeBaseData = dataChartCopy[Object.keys(dataChartCopy)[0]];
            }
            jsonToUse.forEach(
              (x) => (csvDataPointsByDate[moment_1.default.utc(x.date * 1000).format("YYYY-MM-DD")] = x.value),
            );
            csvArr = iterativeBaseData.map((point) => {
              let csvVal = 0;
              let currentDateString = moment_1.default.utc(point.date * 1000).format("YYYY-MM-DD");
              if (csvDataPointsByDate[currentDateString]) {
                csvVal = csvDataPointsByDate[currentDateString];
              }
              return {
                date: point.date,
                value: csvVal,
              };
            });
          } else {
            const columnsList = Object.keys(jsonToUse).filter((x) => x !== "date");
            csvColumnOptions = (
              <CsvOverlayColumnDropDown_1.CsvOverlayColumnDropDown
                setSelectedColumn={(x) => setCsvMetaData({ ...csvMetaData, columnName: x })}
                selectedColumn={csvMetaData.columnName}
                columnsList={columnsList}
              />
            );
            if (csvMetaData.columnName) {
              const csvDataPointsByDate = {};
              let iterativeBaseData = dataChartCopy;
              if (typeof dataChartCopy === "object" && !Array.isArray(dataChartCopy)) {
                iterativeBaseData = dataChartCopy[Object.keys(dataChartCopy)[0]];
              }
              if (jsonToUse) {
                jsonToUse.date.forEach(
                  (x, idx) =>
                    (csvDataPointsByDate[moment_1.default.utc(x * 1000).format("YYYY-MM-DD")] =
                      jsonToUse?.[csvMetaData.columnName]?.[idx]),
                );
              }
              csvArr = iterativeBaseData.map((point) => {
                let csvVal = 0;
                let currentDateString = moment_1.default.utc(point.date * 1000).format("YYYY-MM-DD");
                if (csvDataPointsByDate[currentDateString]) {
                  csvVal = csvDataPointsByDate[currentDateString];
                }
                return {
                  date: point.date,
                  value: csvVal,
                };
              });
            }
          }
          if (
            csvArr?.length > 0 &&
            !datasets.find(
              (x) =>
                x.label === (csvMetaData.fileName?.length > 0 ? csvMetaData.fileName : csvMetaDataProp.fileName) ||
                (x.label.includes(csvMetaData.columnName) &&
                  x.label.includes(csvMetaData.fileName?.length > 0 ? csvMetaData.fileName : csvMetaDataProp.fileName)),
            )
          ) {
            datasets.push({
              data: csvArr,
              backgroundColor: colorList[datasets.length],
              borderColor: colorList[datasets.length],
              label: csvMetaData.fileName?.length > 0 ? csvMetaData.fileName : csvMetaDataProp.fileName,
            });
          }
        }
        Object.keys(dataChartCopy).forEach((x) => {
          if (!dataChartPropKeys.includes(x) && !x.includes(csvMetaData.columnName)) {
            delete dataChartCopy[x];
          }
        });
      }
      const datasetsCopy = JSON.parse(JSON.stringify(datasets));
      const chartData = {
        labels,
        datasets: datasetsCopy,
      };
      chart = (
        <>
          <material_1.Box padding={2} sx={{ border: 1, maxWidth: "100%" }}>
            {chartIsImage &&
            !!chartRef.current?.toBase64Image("image/jpeg", 1) &&
            chartRef.current?.toBase64Image("image/jpeg", 1).toString() !==
              "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/bAEMBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAZUDKgMBEQACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAAC//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8An/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k=" ? (
              <img
                style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto" }}
                src={chartRef.current?.toBase64Image("image/jpeg", 1)}
              />
            ) : (
              <StandardChart_1.StandardChart chartData={chartData} chartRef={chartRef} />
            )}
          </material_1.Box>
        </>
      );
    }
  } catch (err) {
    console.error(err.message);
    chart = (
      <h3>
        {datasetLabel} chart container encountered an error upon rendering: {err.message}
      </h3>
    );
  }
  const linkToElementId = elementId.split(" ").join("%20");
  const staticButtonStyle = chartIsImage
    ? { backgroundColor: "rgb(102,86,248)", color: "white", border: "1px rgb(102,86,248) solid" }
    : { backgroundColor: "rgba(0,0,0,0)" };
  const dynamicButtonStyle = !chartIsImage
    ? { backgroundColor: "rgb(102,86,248)", color: "white", border: "1px rgb(102,86,248) solid" }
    : { backgroundColor: "rgba(0,0,0,0)" };
  let tableRender = (
    <TableChart_1.TableChart
      datasetLabel={datasetLabel}
      dataTable={dataTable}
      jpegDownloadHandler={() => jpegDownloadHandler(false)}
      isStringField={isStringField}
    />
  );
  if (Object.keys(compChart)?.length > 0) {
    tableRender = (
      <ComparisonTable_1.ComparisonTable
        datasetLabel="Custom CSV Comparison"
        dataTable={compChart}
        isHourly={hourly}
        jpegDownloadHandler={() => jpegDownloadHandler(false)}
        baseKey={baseKey?.length > 0 ? baseKey : "base"}
        overlayKey={overlayKey}
      />
    );
  }
  if (!csvColumnOptions && csvJSONProp && !csvJSON) {
    const columnsList = Object.keys(csvJSONProp).filter((key) => key !== "date");
    csvColumnOptions = (
      <CsvOverlayColumnDropDown_1.CsvOverlayColumnDropDown
        setSelectedColumn={(columnName) => setCsvMetaData({ ...csvMetaData, columnName })}
        selectedColumn={csvMetaData.columnName}
        columnsList={columnsList}
      />
    );
  }
  let chartTitle = datasetLabel;
  if ((csvJSON || csvJSONProp) && datasetLabel.length > 50) {
    chartTitle = `${chartTitle.slice(0, 20)} ... ${chartTitle.slice(chartTitle.length - 25, chartTitle.length)}`;
  }
  return (
    <div key={elementId} id={linkToElementId}>
      <material_1.Box sx={{ width: "62.5%", marginBottom: "8px" }} mt={3}>
        <material_1.Grid container justifyContent="space-between">
          <CopyLinkToClipboard_1.CopyLinkToClipboard link={window.location.href} scrollId={linkToElementId}>
            <material_1.Typography variant="h6">{chartTitle}</material_1.Typography>
          </CopyLinkToClipboard_1.CopyLinkToClipboard>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {csvColumnOptions}
            <div style={{ marginLeft: "35px" }}>
              <material_1.Tooltip placement="top" title={"Overlay chart with data points populated from a .csv file"}>
                <UploadFileCSV_1.UploadFileCSV
                  style={{}}
                  csvMetaData={csvMetaData}
                  field={datasetLabel}
                  csvJSON={csvJSON}
                  setCsvJSON={(jsonArgument) => {
                    if (!jsonArgument) {
                      setCompChart({});
                      setCsvJSON(null);
                    } else {
                      setCsvJSON(jsonArgument);
                    }
                  }}
                  setCsvMetaData={setCsvMetaData}
                  isEntityLevel={false}
                />
              </material_1.Tooltip>
              <material_1.Tooltip placement="top" title={"Chart can be dragged and dropped to another tab"}>
                <material_1.Button
                  onClick={() => setChartIsImage(true)}
                  style={{
                    margin: "1.5px 0 0 0",
                    padding: "6px 8px 5px 8px",
                    borderRadius: "0",
                    border: "1px rgb(102,86,248) solid",
                    ...staticButtonStyle,
                  }}
                >
                  Static
                </material_1.Button>
              </material_1.Tooltip>
              <material_1.Tooltip placement="top" title={"Show plot points on hover"}>
                <material_1.Button
                  onClick={() => setChartIsImage(false)}
                  style={{
                    margin: "1.5px 0 0 0",
                    padding: "6px 8px 5px 8px",
                    borderRadius: "0",
                    border: "1px rgb(102,86,248) solid",
                    ...dynamicButtonStyle,
                  }}
                >
                  Dynamic
                </material_1.Button>
              </material_1.Tooltip>
            </div>
          </div>
        </material_1.Grid>
      </material_1.Box>
      <material_1.Grid container justifyContent="space-between">
        <material_1.Grid key={datasetLabel + "chart1"} item xs={7.5}>
          {chart}
        </material_1.Grid>
        <material_1.Grid key={datasetLabel + "table2"} item xs={4}>
          {tableRender}
        </material_1.Grid>
      </material_1.Grid>
    </div>
  );
};
exports.ChartContainer = ChartContainer;
