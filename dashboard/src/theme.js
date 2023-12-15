"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = void 0;
const material_1 = require("@mui/material");
exports.theme = (0, material_1.createTheme)({
  palette: {
    mode: "dark",
    primary: {
      main: "rgb(102,86,248)",
    },
    secondary: {
      main: "rgb(90,74,245)",
    },
    success: {
      main: "#58BC82",
    },
    error: {
      main: "#B8301C",
    },
    warning: {
      main: "#EFCB68",
    },
  },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#fff",
          textDecoration: "none",
          ":hover": {
            textDecoration: "underline",
          },
        },
      },
    },
  },
});
