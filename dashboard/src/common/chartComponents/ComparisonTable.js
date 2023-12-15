"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComparisonTable = void 0;
const material_1 = require("@mui/material");
const x_data_grid_1 = require("@mui/x-data-grid");
const moment_1 = __importDefault(require("moment"));
const react_1 = require("react");
const index_1 = require("../../../src/utils/index");
const DatePicker_1 = require("../utilComponents/DatePicker");
const ComparisonTable = ({ datasetLabel, dataTable, isHourly, jpegDownloadHandler, baseKey, overlayKey }) => {
  const [sortColumn, setSortColumn] = (0, react_1.useState)("date");
  const [sortOrderAsc, setSortOrderAsc] = (0, react_1.useState)(true);
  const [showDatePicker, setShowDatePicker] = (0, react_1.useState)(false);
  const [dates, setDates] = (0, react_1.useState)([]);
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
  try {
    if (dataTable) {
      const columns = [
        {
          field: "date",
          headerName: "Date",
          minWidth: isHourly ? 130 : 100,
          headerAlign: "right",
          align: "right",
        },
        {
          field: baseKey,
          headerName: (0, index_1.upperCaseFirstOfString)(baseKey),
          minWidth: 160,
          headerAlign: "right",
          align: "right",
        },
        {
          field: overlayKey,
          headerName: (0, index_1.upperCaseFirstOfString)(overlayKey),
          minWidth: 160,
          headerAlign: "right",
          align: "right",
        },
        {
          field: "differencePercentage",
          headerName: "Diff. (%)",
          minWidth: 120,
          type: "number",
          headerAlign: "right",
          align: "right",
          renderCell: (params) => {
            const value = Number(params?.value);
            const cellStyle = { ...index_1.tableCellTruncate };
            cellStyle.width = "100%";
            cellStyle.textAlign = "right";
            return <span style={cellStyle}>{value + (isNaN(Number(value)) ? "" : "%")}</span>;
          },
        },
      ];
      let formatStr = "YYYY-MM-DD";
      if (isHourly) {
        formatStr = "YYYY-MM-DD hh";
      }
      const datesSelectedTimestamps = dates.map((date) => date.format(formatStr));
      const differencePercentageArr = [];
      const dataTableCopy = JSON.parse(JSON.stringify({ ...dataTable }));
      dataTableCopy[baseKey] = dataTableCopy[baseKey].filter((obj) => {
        if (datesSelectedTimestamps.length > 0) {
          return datesSelectedTimestamps.includes(moment_1.default.utc(obj.date * 1000).format(formatStr));
        }
        return true;
      });
      dataTableCopy[overlayKey] = dataTableCopy[overlayKey].filter((obj) => {
        if (datesSelectedTimestamps.length > 0) {
          return datesSelectedTimestamps.includes(moment_1.default.utc(obj.date * 1000).format(formatStr));
        }
        return true;
      });
      const dateToValMap = {};
      dataTableCopy[overlayKey].forEach((val) => {
        const key = (0, index_1.toUnitsSinceEpoch)((0, index_1.toDate)(val.date, isHourly), isHourly);
        dateToValMap[key] = val.value;
      });
      const tableData = dataTableCopy[baseKey]
        .map((val, idx) => {
          let date = (0, index_1.toDate)(val.date, isHourly);
          const dateKey = (0, index_1.toUnitsSinceEpoch)((0, index_1.toDate)(val.date, isHourly), isHourly);
          let overlayVal = dateToValMap[dateKey];
          if (!overlayVal) {
            overlayVal = 0;
          }
          const diff = Math.abs(val.value - overlayVal);
          differencePercentageArr.push({ value: ((diff / overlayVal) * 100).toFixed(2) + "%", date: val.date });
          return {
            id: idx,
            date: date,
            [baseKey]: "$" + (0, index_1.formatIntToFixed2)(val.value),
            [overlayKey]: "$" + (0, index_1.formatIntToFixed2)(overlayVal),
            differencePercentage: ((diff / overlayVal) * 100).toFixed(2),
          };
        })
        .reverse();
      return (
        <material_1.Box sx={{ height: "100%" }}>
          <material_1.Box position="relative" sx={{ marginTop: "-38px" }}>
            {showDatePicker && <DatePicker_1.DatePicker dates={dates} setDates={setDates} />}
            <material_1.Button className="Hover-Underline" onClick={() => setShowDatePicker((prev) => !prev)}>
              Date Filter
            </material_1.Button>
            <material_1.Button onClick={() => jpegDownloadHandler()}>Save Chart</material_1.Button>
            <material_1.Button
              className="Hover-Underline"
              onClick={() => {
                if (!Array.isArray(dataTableCopy)) {
                  let length = dataTableCopy[Object.keys(dataTableCopy)[0]].length;
                  const arrayToSend = [];
                  for (let iteration = 0; iteration < length; iteration++) {
                    let objectIteration = {};
                    let hasUndefined = false;
                    objectIteration.date = dataTableCopy[Object.keys(dataTableCopy)[0]][iteration].date;
                    Object.keys(dataTableCopy).forEach((key) => {
                      if (dataTableCopy[key][iteration]?.value) {
                        objectIteration[key] = dataTableCopy[key][iteration]?.value;
                      } else {
                        hasUndefined = true;
                      }
                    });
                    if (differencePercentageArr[iteration]) {
                      objectIteration.differencePercentage = differencePercentageArr[iteration].value;
                    }
                    if (!hasUndefined) {
                      arrayToSend.push(objectIteration);
                    }
                  }
                  return (0, index_1.downloadCSV)(
                    arrayToSend
                      .sort(sortFunction)
                      .filter((obj) => {
                        if (datesSelectedTimestamps.length > 0) {
                          return datesSelectedTimestamps.includes(
                            moment_1.default.utc(obj.date * 1000).format("YYYY-MM-DD"),
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
                } else {
                  return (0, index_1.downloadCSV)(
                    dataTableCopy
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
                        [datasetLabel]: json.value,
                      })),
                    datasetLabel + "-csv",
                    datasetLabel,
                  );
                }
              }}
            >
              Save CSV
            </material_1.Button>
          </material_1.Box>
          <x_data_grid_1.DataGrid
            sx={{ textOverflow: "clip" }}
            initialState={{
              sorting: {
                sortModel: [{ field: "date", sort: "desc" }],
              },
            }}
            onSortModelChange={(data) => {
              setSortColumn(data[0].field);
              setSortOrderAsc(data[0].sort === "asc");
            }}
            rows={tableData}
            columns={columns}
          />
        </material_1.Box>
      );
    }
  } catch (err) {
    console.error(err);
    return null;
  }
  return null;
};
exports.ComparisonTable = ComparisonTable;
