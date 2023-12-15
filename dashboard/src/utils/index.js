"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.upperCaseFirstOfString =
  exports.lineupChartDatapoints =
  exports.base64toBlobJPEG =
  exports.downloadCSV =
  exports.JSONToCSVConvertor =
  exports.csvToJSONConvertor =
  exports.csvToJSONConvertorTwoCol =
  exports.csvToJSONConvertorMultiCol =
  exports.formatIntToFixed2 =
  exports.timestampToDaysSinceEpoch =
  exports.toPercent =
  exports.parseSubgraphName =
  exports.convertTokenDecimals =
  exports.useInterval =
  exports.NewClient =
  exports.isValidHttpUrl =
  exports.toUnitsSinceEpoch =
  exports.toDate =
  exports.schemaMapping =
  exports.tableCellTruncate =
    void 0;
const moment_1 = __importDefault(require("moment"));
const client_1 = require("@apollo/client");
const react_1 = require("react");
exports.tableCellTruncate = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
exports.schemaMapping = {
  exchanges: "exchanges",
  vaults: "vaults",
  "dex-amm": "exchanges",
  "yield-aggregator": "vaults",
  lending: "lending",
  generic: "generic",
  bridge: "bridge",
  bridges: "bridge",
  EXCHANGES: "exchanges",
  VAULTS: "vaults",
  "DEX-AMM": "exchanges",
  "YIELD-AGGREGATOR": "vaults",
  LENDING: "lending",
  GENERIC: "generic",
  EXCHANGE: "exchanges",
  YIELD: "vaults",
  BRIDGE: "bridge",
  BRIDGES: "bridge",
  erc20: "erc20",
  erc721: "erc721",
  governance: "governance",
  network: "network",
  "nft-marketplace": "nft-marketplace",
  "derivatives-options": "derivatives-options",
  OPTION: "derivatives-options",
  "derivatives-perpfutures": "derivatives-perpfutures",
  PERPETUAL: "derivatives-perpfutures",
};
function toDate(timestamp, hour = false) {
  let formatString = "YYYY-MM-DD";
  if (hour) {
    formatString += " HH:mm";
  }
  return moment_1.default.utc(timestamp * 1000).format(formatString);
}
exports.toDate = toDate;
function toUnitsSinceEpoch(dateStr, hour) {
  const timestamp = moment_1.default.utc(dateStr).unix();
  if (hour) {
    return Math.round(timestamp / 3600).toString();
  }
  return Math.round(timestamp / 86400).toString();
}
exports.toUnitsSinceEpoch = toUnitsSinceEpoch;
function isValidHttpUrl(s) {
  let url;
  try {
    url = new URL(s);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}
exports.isValidHttpUrl = isValidHttpUrl;
function NewClient(url) {
  const link = new client_1.HttpLink({
    uri: url,
  });
  return new client_1.ApolloClient({
    link,
    cache: new client_1.InMemoryCache(),
  });
}
exports.NewClient = NewClient;
function useInterval(callback, delay) {
  const savedCallback = (0, react_1.useRef)();
  // Remember the latest callback.
  (0, react_1.useEffect)(() => {
    savedCallback.current = callback;
  }, [callback]);
  // Set up the interval.
  (0, react_1.useEffect)(() => {
    function tick() {
      if (savedCallback) {
        savedCallback?.current();
      }
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
exports.useInterval = useInterval;
function convertTokenDecimals(value, decimals) {
  if (isNaN(Number(value)) || !decimals || Number(value) === 0) {
    return 0;
  }
  const divisor = 10 ** decimals;
  if (!(Number(value) / divisor)) {
    return 0;
  }
  return Number(value) / divisor;
}
exports.convertTokenDecimals = convertTokenDecimals;
function parseSubgraphName(url) {
  const result = new RegExp(/\/name\/(.*)/g).exec(url);
  return result ? result[1] : "";
}
exports.parseSubgraphName = parseSubgraphName;
function toPercent(cur, total) {
  return parseFloat(((cur / total) * 100).toFixed(2));
}
exports.toPercent = toPercent;
function timestampToDaysSinceEpoch(ts) {
  if (ts > 20000000000) {
    ts = ts / 1000;
  }
  let days = (ts / 86400).toString();
  if (days.includes(".")) {
    const tsSplit = days.split("");
    const tenthElement = tsSplit[tsSplit.indexOf(".") + 1];
    if (Number(tenthElement) >= 5) {
      days = (Number(days.split(".")[0]) + 1).toFixed(0);
    } else {
      days = Number(days).toFixed(0);
    }
  }
  return Number(days);
}
exports.timestampToDaysSinceEpoch = timestampToDaysSinceEpoch;
function formatIntToFixed2(val) {
  let returnStr = parseFloat(val.toFixed(2)).toLocaleString();
  if (returnStr.split(".")[1]?.length === 1) {
    returnStr += "0";
  } else if (!returnStr.split(".")[1]?.length) {
    returnStr += ".00";
  }
  if (returnStr.includes("NaN")) {
    returnStr = "0.00";
  }
  return returnStr;
}
exports.formatIntToFixed2 = formatIntToFixed2;
function csvToJSONConvertorMultiCol(lines, headers, mmddyyyy = true) {
  const invalidColumns = [".", "..", "...", ",", "-", "_", " ", '"', "'"];
  try {
    if (
      !(headers.length >= 2) ||
      (!headers.map((x) => x?.toLowerCase()).includes("date") && !headers.map((x) => x?.toLowerCase()).includes("time"))
    ) {
      throw new Error('Wrong CSV data format. The CSV must have multiple columns, one must be a "date" column.');
    }
    const obj = {};
    let returnRecursion = false;
    for (let i = 1; i < lines.length; i++) {
      const currentline = lines[i].split(",");
      for (let j = 0; j < headers.length; j++) {
        let entry = currentline[j];
        let header = headers[j].toLowerCase();
        if (!invalidColumns.includes(header)) {
          if (header === "time") {
            header = "date";
          }
          header = header.split("  ").join(" ");
          if (entry) {
            if (!obj[header]) {
              obj[header] = [];
            }
            if (entry.includes("'")) {
              entry = entry.split("'").join("");
            }
            if (entry.includes('"')) {
              entry = entry.split('"').join("");
            }
            if (header === "date" && isNaN(entry)) {
              if (isNaN((0, moment_1.default)(entry).unix()) && mmddyyyy) {
                returnRecursion = true;
              } else {
                if (mmddyyyy) {
                  entry = (0, moment_1.default)(entry).unix();
                } else {
                  entry = (0, moment_1.default)(entry, "DD/MM/YYYY").unix();
                }
              }
            }
            if (!isNaN(Number(entry))) {
              entry = Number(entry);
            }
            obj[header].push(entry);
          }
        }
      }
    }
    if (returnRecursion) {
      return csvToJSONConvertorMultiCol(lines, headers, false);
    }
    return obj;
  } catch (err) {
    console.error(err.message);
    return err;
  }
}
exports.csvToJSONConvertorMultiCol = csvToJSONConvertorMultiCol;
function csvToJSONConvertorTwoCol(lines, headers, mmddyyyy = true) {
  const result = [];
  try {
    if (headers.length !== 2 || !headers.map((x) => x?.toLowerCase()).includes("date")) {
      throw new Error('Wrong CSV data format. The CSV must have two columns, one must be a "date" column.');
    }
    let returnRecursion = false;
    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentline = lines[i].split(",");
      for (let j = 0; j < headers.length; j++) {
        let entry = currentline[j];
        let header = headers[j].toLowerCase();
        if (header !== "date") {
          header = "value";
        }
        if (entry) {
          if (entry.includes("'")) {
            entry = entry.split("'").join("");
          }
          if (entry.includes('"')) {
            entry = entry.split('"').join("");
          }
          if (header === "date" && isNaN(entry)) {
            if (isNaN((0, moment_1.default)(entry).unix()) && mmddyyyy) {
              returnRecursion = true;
            } else {
              if (mmddyyyy) {
                entry = (0, moment_1.default)(entry).unix();
              } else {
                entry = (0, moment_1.default)(entry, "DD/MM/YYYY").unix();
              }
            }
          }
          if (!isNaN(Number(entry))) {
            entry = Number(entry);
          }
          obj[header] = entry;
        }
      }
      if (Object.keys(obj)?.length === 2) {
        result.push(obj);
      }
    }
    if (returnRecursion) {
      return csvToJSONConvertorTwoCol(lines, headers, false);
    }
    return result;
  } catch (err) {
    console.error(err.message);
    return err;
  }
}
exports.csvToJSONConvertorTwoCol = csvToJSONConvertorTwoCol;
function csvToJSONConvertor(csv, isEntityLevel) {
  try {
    const lines = csv.split("\n");
    const headers = lines[0].split(",").map((x) => (x?.includes("\r") ? x.split("\r").join("") : x));
    let result = null;
    if (headers.length === 2 && !isEntityLevel) {
      result = csvToJSONConvertorTwoCol(lines, headers);
    }
    if (headers.length > 2 || (headers.length === 2 && isEntityLevel)) {
      result = csvToJSONConvertorMultiCol(lines, headers);
    }
    if (result instanceof Error) {
      throw result;
    }
    return result;
  } catch (err) {
    console.error(err.message);
    return new Error("csvToJSONConvertor encountered an JS error while processing: " + err?.message + ".");
  }
}
exports.csvToJSONConvertor = csvToJSONConvertor;
function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
  try {
    const arrData = typeof JSONData != "object" ? JSON.parse(JSONData) : JSONData;
    let CSV = "";
    if (ShowLabel) {
      let row = "";
      for (let index in arrData[0]) {
        row += index + ",";
      }
      row = row.slice(0, -1);
      CSV += row + "\r\n";
    }
    for (let i = 0; i < arrData.length; i++) {
      let row = "";
      for (let index in arrData[i]) {
        row += '"' + arrData[i][index] + '",';
      }
      row.slice(0, row.length - 1);
      CSV += row + "\r\n";
    }
    if (CSV === "") {
      return;
    }
    const csv = CSV;
    const filename = (ReportTitle || "UserExport") + ".csv";
    const blob = new Blob([csv], { type: "text/csv" });
    const csvUrl = window.webkitURL.createObjectURL(blob);
    return { csvUrl, filename };
  } catch (err) {
    console.error(err.message);
    return { csvURL: "", filename: "" };
  }
}
exports.JSONToCSVConvertor = JSONToCSVConvertor;
function downloadCSV(data, label, identifier) {
  try {
    const link = document.createElement("a");
    const field = label.split("-")[1] || label;
    let freq = label.split("-")[0]?.toUpperCase()?.includes("HOURLY") ? "hourly-" : "";
    if (label.split("-")[0]?.toUpperCase()?.includes("DAILY")) {
      freq = "daily-";
    }
    if (field?.toUpperCase()?.includes("DAILY") || field?.toUpperCase()?.includes("HOURLY")) {
      freq = "";
    }
    link.download = identifier + "-" + freq + field + "-" + moment_1.default.utc(Date.now()).format("MMDDYY") + ".csv";
    const csvEle = JSONToCSVConvertor(data, label + "-csv", label);
    if (!csvEle?.csvUrl) {
      throw new Error("csv File not constructed");
    } else {
      link.href = csvEle?.csvUrl;
      link.click();
    }
  } catch (err) {
    console.error(err.message);
    return;
  }
}
exports.downloadCSV = downloadCSV;
function base64toBlobJPEG(dataURI) {
  try {
    const byteString = atob(dataURI.split(",")[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const integerArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      integerArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: "image/jpeg" });
  } catch (err) {
    console.error(err.message);
    return;
  }
}
exports.base64toBlobJPEG = base64toBlobJPEG;
function lineupChartDatapoints(compChart) {
  try {
    const key1 = Object.keys(compChart)[0];
    const key2 = Object.keys(compChart)[1];
    let arr1 = compChart[key1].sort((a, b) => a.date - b.date);
    let arr2 = compChart[key2].sort((a, b) => a.date - b.date);
    const arr1StartDate = arr1[0]?.date;
    const arr2StartDate = arr2[0]?.date;
    if (!arr1StartDate) {
      throw new Error(
        `lineupChartDatapoints() error: compChart input key ${key1} was not an array holding objects with valid date properties holding timestamp values.`,
      );
    }
    if (!arr2StartDate) {
      throw new Error(
        `lineupChartDatapoints() error: compChart input key ${key2} was not an array holding objects with valid date properties holding timestamp values.`,
      );
    }
    if (arr1StartDate > arr2StartDate) {
      const arr2Index = arr2.findIndex((x) => x.date >= arr1StartDate - 86400);
      arr2 = arr2.slice(arr2Index);
    } else if (arr1StartDate < arr2StartDate) {
      const arr1Index = arr1.findIndex((x) => x.date >= arr2StartDate - 86400);
      arr1 = arr1.slice(arr1Index);
    }
    const matchedStartDatesCompChart = { [key1]: arr1, [key2]: arr2 };
    return matchedStartDatesCompChart;
  } catch (err) {
    console.error(err.message);
    return err;
  }
}
exports.lineupChartDatapoints = lineupChartDatapoints;
function upperCaseFirstOfString(str) {
  const arr = str.split("");
  arr[0] = arr[0].toUpperCase();
  return arr.join("");
}
exports.upperCaseFirstOfString = upperCaseFirstOfString;
