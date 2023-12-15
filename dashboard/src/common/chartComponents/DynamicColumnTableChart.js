"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicColumnTableChart = void 0;
const material_1 = require("@mui/material");
const x_data_grid_1 = require("@mui/x-data-grid");
const react_1 = require("react");
const index_1 = require("../../../src/utils/index");
const moment_1 = __importDefault(require("moment"));
const DatePicker_1 = require("../utilComponents/DatePicker");
const DynamicColumnTableChart = ({ datasetLabel, dataTable, jpegDownloadHandler }) => {
  const [sortColumn, setSortColumn] = (0, react_1.useState)("date");
  const [sortOrderAsc, setSortOrderAsc] = (0, react_1.useState)(true);
  const [showDatePicker, setShowDatePicker] = (0, react_1.useState)(false);
  const [dates, setDates] = (0, react_1.useState)([]);
  const [showDateString, toggleDateString] = (0, react_1.useState)(true);
  function sortFunction(aArg, bArg) {
    let aVal = aArg[sortColumn];
    if (!isNaN(Number(aArg[sortColumn]))) {
      aVal = Number(aArg[sortColumn]);
    } else if (aArg[sortColumn].includes("%")) {
      aVal = Number(aArg[sortColumn].split("%").join(""));
    }
    let bVal = bArg[sortColumn];
    if (!isNaN(Number(bArg[sortColumn]))) {
      bVal = Number(bArg[sortColumn]);
    } else if (bArg[sortColumn].includes("%")) {
      bVal = Number(bArg[sortColumn].split("%").join(""));
    }
    if (sortOrderAsc) {
      return aVal - bVal;
    } else {
      return bVal - aVal;
    }
  }
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
    const columns = Object.keys(dataTable[0])?.map((chain) => {
      if (chain === "date") {
        return { field: "date", headerName: xHeaderName, width: 120 };
      }
      return {
        field: chain,
        headerName: chain,
        width: 180,
        type: "number",
        headerAlign: "left",
        align: "left",
      };
    });
    const filteredData = dataTable.filter((val) =>
      dates.length
        ? dates.map((date) => date.format("l")).includes(moment_1.default.unix(val.date).utc().format("l"))
        : true,
    );
    const tableData = filteredData.map((json, idx) => {
      let dateColumn = (0, index_1.toDate)(json.date, hourly);
      if (!showDateString) {
        dateColumn = (0, index_1.toUnitsSinceEpoch)(dateColumn, hourly);
      }
      return {
        id: idx,
        ...json,
        date: dateColumn,
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
              if (!Array.isArray(dataTable)) {
                let length = dataTable[Object.keys(dataTable)[0]].length;
                const arrayToSend = [];
                for (let idx = 0; idx < length; idx++) {
                  let objectIteration = {};
                  let hasUndefined = false;
                  objectIteration.date = dataTable[Object.keys(dataTable)[0]][idx].date;
                  Object.keys(dataTable).forEach((key) => {
                    if (dataTable[key][idx]?.value) {
                      objectIteration[key] = dataTable[key][idx]?.value;
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
                          moment_1.default.utc(json.date * 1000).format("YYYY-MM-DD"),
                        );
                      }
                      return true;
                    })
                    .map((json) => ({
                      date: moment_1.default.utc(json.date * 1000).format("YYYY-MM-DD"),
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
                          moment_1.default.utc(json.date * 1000).format("YYYY-MM-DD"),
                        );
                      }
                      return true;
                    })
                    .map((json) => ({
                      ...json,
                      date: moment_1.default.utc(json.date * 1000).format("YYYY-MM-DD"),
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
exports.DynamicColumnTableChart = DynamicColumnTableChart;
