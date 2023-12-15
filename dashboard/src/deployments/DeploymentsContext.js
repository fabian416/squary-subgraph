"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const DeploymentsContext = (0, react_1.createContext)({
  errorDialogData: undefined,
  showErrorDialog: () => {},
  setErrorDialogData: () => {},
});
exports.default = DeploymentsContext;
