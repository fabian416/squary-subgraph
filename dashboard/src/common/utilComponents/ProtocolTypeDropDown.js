"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolTypeDropDown = void 0;
const material_1 = require("@mui/material");
const react_1 = __importDefault(require("react"));
const ComboBoxInput_1 = require("./ComboBoxInput");
const ProtocolTypeDropDown = ({ protocolTypeList, setProtocolType, currentProtocolType }) => {
  const options = protocolTypeList;
  return (
    <>
      <material_1.Autocomplete
        options={options}
        value={currentProtocolType}
        sx={{ width: 400, height: "100%" }}
        onChange={(event) => {
          const targEle = event?.target;
          setProtocolType(targEle.innerText);
        }}
        renderInput={(params) => (
          <ComboBoxInput_1.ComboBoxInput
            label="Protocol Type Selection"
            params={params}
            setTextInput={(x) => console.log(x)}
          />
        )}
      />
    </>
  );
};
exports.ProtocolTypeDropDown = ProtocolTypeDropDown;
