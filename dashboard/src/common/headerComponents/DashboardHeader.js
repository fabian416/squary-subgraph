"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardHeader = void 0;
const ProtocolInfo_1 = __importDefault(require("./ProtocolInfo"));
const react_router_dom_1 = require("react-router-dom");
const styled_1 = require("../../styled");
const ChevronLeft_1 = __importDefault(require("@mui/icons-material/ChevronLeft"));
const material_1 = require("@mui/material");
const BackBanner = (0, styled_1.styled)("div")`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
  background: #38404a;
`;
const DashboardHeader = ({ protocolData, protocolId, subgraphToQueryURL, schemaVersion, versionsJSON }) => {
  return (
    <div>
      <BackBanner>
        <material_1.Box display="flex" alignItems="center">
          <ChevronLeft_1.default />
          <material_1.Link component={react_router_dom_1.Link} to="/">
            Back to Deployments
          </material_1.Link>
        </material_1.Box>
        <a href={process.env.REACT_APP_MESSARI_REPO_URL} target="_blank" style={{ color: "white" }} rel="noreferrer">
          powered by Messari Subgraphs
        </a>
      </BackBanner>
      {protocolData && (
        <ProtocolInfo_1.default
          protocolData={protocolData}
          protocolId={protocolId}
          subgraphToQueryURL={subgraphToQueryURL}
          schemaVersion={schemaVersion}
          versionsJSON={versionsJSON}
        />
      )}
    </div>
  );
};
exports.DashboardHeader = DashboardHeader;
