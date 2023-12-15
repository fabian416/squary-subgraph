"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentsContextProvider = void 0;
const react_1 = require("react");
const DeploymentsContext_1 = __importDefault(require("./DeploymentsContext"));
const DeploymentErrorModal_1 = require("./DeploymentErrorModal");
const DeploymentsContextProvider = ({ children }) => {
  const [showErrorDialog, setShowErrorDialog] = (0, react_1.useState)(false);
  const [dialogData, setDialogData] = (0, react_1.useState)();
  const value = (0, react_1.useMemo)(
    () => ({
      showErrorDialog: setShowErrorDialog,
      errorDialogData: dialogData,
      setErrorDialogData: setDialogData,
    }),
    [dialogData],
  );
  const resetDialog = () => {
    setShowErrorDialog(false);
    setDialogData(undefined);
  };
  return (
    <DeploymentsContext_1.default.Provider value={value}>
      {children}
      {dialogData && (
        <DeploymentErrorModal_1.DeploymentErrorModal open={showErrorDialog} onClose={resetDialog} data={dialogData} />
      )}
    </DeploymentsContext_1.default.Provider>
  );
};
exports.DeploymentsContextProvider = DeploymentsContextProvider;
