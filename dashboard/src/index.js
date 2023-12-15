"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
require("./index.css");
const App_1 = __importDefault(require("./App"));
const reportWebVitals_1 = __importDefault(require("./reportWebVitals"));
const react_router_dom_1 = require("react-router-dom");
const material_1 = require("@mui/material");
const theme_1 = require("./theme");
const client_1 = require("react-dom/client");
const container = document.getElementById("root");
const root = (0, client_1.createRoot)(container);
root.render(
  <react_1.default.StrictMode>
    <react_router_dom_1.BrowserRouter>
      <material_1.ThemeProvider theme={theme_1.theme}>
        <App_1.default />
      </material_1.ThemeProvider>
    </react_router_dom_1.BrowserRouter>
  </react_1.default.StrictMode>,
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
(0, reportWebVitals_1.default)();
