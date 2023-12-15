"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentErrorModal = void 0;
const material_1 = require("@mui/material");
const styled_1 = require("../styled");
const Close_1 = __importDefault(require("@mui/icons-material/Close"));
const ErrorRow = (0, styled_1.styled)("div")`
  padding: ${({ theme }) => theme.spacing(2, 0)};
`;
const ErrorType = (0, styled_1.styled)(material_1.Typography)`
  display: flex;
  align-items: center;
  ${({ type, theme }) => type === "fatal" && `color: ${theme.palette.error.main};`};
`;
const ErrorMessage = (0, styled_1.styled)("pre")`
  font-size: 14px;
  white-space: normal;
  background: ${({ theme }) => theme.palette.background.paper};
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: 4px;
`;
const DeploymentErrorModal = ({ open, onClose, data: { subgraphName, network, fatalError, nonFatalErrors } }) => {
  return (
    <material_1.Dialog open={open} onClose={onClose} maxWidth="lg">
      <material_1.DialogTitle>
        <material_1.Box display="flex" alignItems="center" justifyContent="space-between">
          <span>
            {subgraphName} - {network}
          </span>
          <material_1.IconButton onClick={onClose}>
            <Close_1.default />
          </material_1.IconButton>
        </material_1.Box>
      </material_1.DialogTitle>
      <material_1.DialogContent>
        {fatalError && (
          <ErrorRow>
            <ErrorType variant="h6" type="fatal">
              Fatal Error - block: {fatalError.block.number}
            </ErrorType>
            <ErrorMessage>{fatalError.message}</ErrorMessage>
          </ErrorRow>
        )}
        {nonFatalErrors.map((err) => (
          <ErrorRow>
            <ErrorType variant="h6">Non-fatal - block: {err.block.number}</ErrorType>
            <ErrorMessage>{err.message}</ErrorMessage>
          </ErrorRow>
        ))}
      </material_1.DialogContent>
    </material_1.Dialog>
  );
};
exports.DeploymentErrorModal = DeploymentErrorModal;
