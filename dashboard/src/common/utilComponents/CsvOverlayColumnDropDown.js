"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvOverlayColumnDropDown = void 0;
const material_1 = require("@mui/material");
const react_1 = __importDefault(require("react"));
const ComboBoxInput_1 = require("./ComboBoxInput");
const CsvOverlayColumnDropDown = ({ columnsList, setSelectedColumn, selectedColumn }) => {
  const options = columnsList;
  return (
    <>
      <material_1.Autocomplete
        options={options}
        value={selectedColumn}
        sx={{ width: 300, height: "40px", padding: "0" }}
        size="small"
        onChange={(event) => {
          const targEle = event?.target;
          setSelectedColumn(targEle.innerText);
        }}
        renderInput={(params) => (
          <ComboBoxInput_1.ComboBoxInput
            style={{ width: 300, height: "40px", padding: "0" }}
            label="Select Metric"
            params={params}
            setTextInput={(x) => console.log(x)}
          />
        )}
      />
    </>
  );
};
exports.CsvOverlayColumnDropDown = CsvOverlayColumnDropDown;
