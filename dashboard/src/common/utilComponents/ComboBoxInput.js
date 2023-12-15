"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComboBoxInput = void 0;
const material_1 = require("@mui/material");
const ComboBoxInput = ({ setTextInput, params, label, style = {} }) => {
  return (
    <material_1.TextField
      sx={style}
      onFocus={() => setTextInput("")}
      onChange={(inp) => setTextInput(inp.target.value)}
      {...params}
      label={label}
      variant="outlined"
    />
  );
};
exports.ComboBoxInput = ComboBoxInput;
