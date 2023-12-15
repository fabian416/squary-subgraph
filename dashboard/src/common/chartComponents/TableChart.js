"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableChart = void 0;
const material_1 = require("@mui/material");
const x_data_grid_1 = require("@mui/x-data-grid");
const react_1 = require("react");
const index_1 = require("../../../src/utils/index");
const constants_1 = require("../../constants");
const moment_1 = __importDefault(require("moment"));
const DatePicker_1 = require("../utilComponents/DatePicker");
const TableChart = ({ datasetLabel, dataTable, jpegDownloadHandler, isStringField = false }) => {
  const field = datasetLabel.split("-")[1] || datasetLabel;
  const [sortColumn, setSortColumn] = (0, react_1.useState)("date");
  const [sortOrderAsc, setSortOrderAsc] = (0, react_1.useState)(true);
  const [showDatePicker, setShowDatePicker] = (0, react_1.useState)(false);
  const [dates, setDates] = (0, react_1.useState)([]);
  const [showDateString, toggleDateString] = (0, react_1.useState)(true);
  function sortFunction(a, b) {
    let aVal = a[sortColumn];
    if (!isNaN(Number(a[sortColumn]))) {
      aVal = Number(a[sortColumn]);
    } else if (a[sortColumn].includes("%")) {
      aVal = Number(a[sortColumn].split("%").join(""));
    }
    let bVal = b[sortColumn];
    if (!isNaN(Number(b[sortColumn]))) {
      bVal = Number(b[sortColumn]);
    } else if (b[sortColumn].includes("%")) {
      bVal = Number(b[sortColumn].split("%").join(""));
    }
    if (sortOrderAsc) {
      return aVal - bVal;
    } else {
      return bVal - aVal;
    }
  }
  const isPercentageField = constants_1.percentageFieldList.find((x) => {
    return datasetLabel.toUpperCase().includes(x.toUpperCase());
  });
  const hourly = datasetLabel.toUpperCase().includes("HOURLY");
  if (dataTable) {
    let xHeaderName = "Date";
    if (!showDateString) {
      if (hourly) {
        xHeaderName = "Hours";
      } else {
        xHeaderName = "Days";
      }
    }
    let columns = [
      { field: "date", headerName: xHeaderName, width: 120 },
      {
        field: "value",
        headerName: "Value",
        flex: 1,
        type: isPercentageField || isStringField ? "string" : "number",
        headerAlign: "left",
        align: "left",
      },
    ];
    if (dataTable[0]["blockNumber"]) {
      columns.push({
        field: "blockNumber",
        headerName: "Block",
        flex: 0,
        type: "number",
        headerAlign: "left",
        align: "left",
      });
    }
    let suffix = "";
    if (isPercentageField) {
      suffix = "%";
    }
    const filteredData = dataTable.filter((val) =>
      dates.length
        ? dates.map((date) => date.format("l")).includes(moment_1.default.unix(val.date).utc().format("l"))
        : true,
    );
    const tableData = filteredData.map((dataPoint, idx) => {
      let displayVal = Number(Number(dataPoint.value).toFixed(2)).toLocaleString() + suffix;
      if (isPercentageField && Array.isArray(dataPoint.value)) {
        displayVal = dataPoint.value.map((ele) => ele.toLocaleString() + "%").join(", ");
      }
      let dateColumn = (0, index_1.toDate)(dataPoint.date, hourly);
      if (!showDateString) {
        dateColumn = (0, index_1.toUnitsSinceEpoch)(dateColumn, hourly);
      }
      let returnVal = isNaN(Number(dataPoint.value)) || displayVal.includes("%") ? displayVal : Number(dataPoint.value);
      if (isStringField) {
        returnVal = dataPoint.value;
      }
      if (dataPoint.blockNumber) {
        return {
          id: idx,
          date: dateColumn,
          value: returnVal,
          blockNumber: dataPoint.blockNumber,
        };
      }
      return {
        id: idx,
        date: dateColumn,
        value: returnVal,
      };
    });
    return (
      <material_1.Box sx={{ height: "100%" }}>
        <material_1.Box position="relative" sx={{ marginTop: "-38px" }}>
          {showDatePicker && <DatePicker_1.DatePicker dates={dates} setDates={setDates} />}

          <material_1.Button className="Hover-Underline" onClick={() => setShowDatePicker((prev) => !prev)}>
            Date Filter
          </material_1.Button>
          <material_1.Button className="Hover-Underline" onClick={() => toggleDateString(!showDateString)}>
            {showDateString ? `${hourly ? "hours" : "days"} since epoch` : "Date MM/DD/YYYY"}
          </material_1.Button>
          <material_1.Button
            className="Hover-Underline"
            onClick={() => {
              const datesSelectedTimestamps = dates.map((date) => date.format("YYYY-MM-DD"));
              let formatStr = "YYYY-MM-DD";
              if (hourly) {
                formatStr = "YYYY-MM-DD hh:mm:ss";
              }
              if (!Array.isArray(dataTable)) {
                let length = dataTable[Object.keys(dataTable)[0]].length;
                const arrayToSend = [];
                for (let i = 0; i < length; i++) {
                  let objectIteration = {};
                  let hasUndefined = false;
                  objectIteration.date = dataTable[Object.keys(dataTable)[0]][i].date;
                  Object.keys(dataTable).forEach((key) => {
                    if (dataTable[key][i]?.value) {
                      objectIteration[key] = dataTable[key][i]?.value;
                    } else {
                      hasUndefined = true;
                    }
                  });
                  if (!hasUndefined) {
                    arrayToSend.push(objectIteration);
                  }
                }
                return (0, index_1.downloadCSV)(
                  arrayToSend
                    .sort(sortFunction)
                    .filter((json) => {
                      if (datesSelectedTimestamps.length > 0) {
                        return datesSelectedTimestamps.includes(
                          moment_1.default.utc(json.date * 1000).format(formatStr),
                        );
                      }
                      return true;
                    })
                    .map((json) => ({
                      date: moment_1.default.utc(json.date * 1000).format(formatStr),
                      ...json,
                    })),
                  datasetLabel + "-csv",
                  datasetLabel,
                );
              } else {
                (0, index_1.downloadCSV)(
                  dataTable
                    .sort(sortFunction)
                    .filter((json) => {
                      if (datesSelectedTimestamps.length > 0) {
                        return datesSelectedTimestamps.includes(
                          moment_1.default.utc(json.date * 1000).format(formatStr),
                        );
                      }
                      return true;
                    })
                    .map((json) => ({
                      date: moment_1.default.utc(json.date * 1000).format(formatStr),
                      [field]: json.value,
                    })),
                  datasetLabel + "-csv",
                  datasetLabel,
                );
              }
            }}
          >
            Save CSV
          </material_1.Button>
          {jpegDownloadHandler ? (
            <material_1.Button className="Hover-Underline" onClick={() => jpegDownloadHandler()}>
              Save Chart
            </material_1.Button>
          ) : null}
        </material_1.Box>
        <x_data_grid_1.DataGrid
          sx={{ textOverflow: "clip" }}
          initialState={{
            sorting: {
              sortModel: [{ field: "date", sort: "desc" }],
            },
          }}
          onSortModelChange={(x) => {
            setSortColumn(x[0].field);
            setSortOrderAsc(x[0].sort === "asc");
          }}
          rows={tableData}
          columns={columns}
        />
      </material_1.Box>
    );
  }
  return null;
};
exports.TableChart = TableChart;
