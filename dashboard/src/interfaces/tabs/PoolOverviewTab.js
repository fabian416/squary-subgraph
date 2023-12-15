"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const IssuesDisplay_1 = __importDefault(require("../IssuesDisplay"));
const TablePoolOverview_1 = require("../../common/chartComponents/TablePoolOverview");
const styled_1 = require("../../styled");
const material_1 = require("@mui/material");
const ChevronLeft_1 = __importDefault(require("@mui/icons-material/ChevronLeft"));
const ChevronRight_1 = __importDefault(require("@mui/icons-material/ChevronRight"));
const react_router_1 = require("react-router");
const CopyLinkToClipboard_1 = require("../../common/utilComponents/CopyLinkToClipboard");
const ChangePageEle = (0, styled_1.styled)("div")`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
  margin: 10px 0;
  cursor: pointer;
`;
// This component is for each individual subgraph
function PoolOverviewTab({
  totalPoolCount,
  pools,
  setPoolId,
  protocolType,
  protocolNetwork,
  poolOverviewRequest,
  handleTabChange,
  paginate,
  skipAmt,
}) {
  const [tableIssues, setTableIssues] = (0, react_1.useState)([]);
  const navigate = (0, react_router_1.useNavigate)();
  const href = new URL(window.location.href);
  const p = new URLSearchParams(href.search);
  const skipAmtParam = p.get("skipAmt") || "0";
  const [currentPage, setCurrentPage] = (0, react_1.useState)(skipAmtParam ? (parseInt(skipAmtParam) + 50) / 50 : 1);
  const issues = tableIssues;
  let morePages = false;
  if (totalPoolCount) {
    if (currentPage !== Math.ceil(totalPoolCount / 50)) {
      morePages = true;
    }
  }
  let loadingEle = null;
  let nextButton = null;
  if (pools.length === 50 || morePages) {
    nextButton = (
      <ChangePageEle
        onClick={() => {
          window.scrollTo(0, 0);
          paginate(skipAmt + 50);
          p.set("skipAmt", (skipAmt + 50).toString());
          navigate("?" + p.toString());
          setCurrentPage((prev) => prev + 1);
          setTableIssues([]);
        }}
      >
        <span>NEXT</span>
        <ChevronRight_1.default />
      </ChangePageEle>
    );
  }
  let prevButton = <ChangePageEle></ChangePageEle>;
  if (skipAmt > 0 && skipAmt <= 50) {
    prevButton = (
      <ChangePageEle
        onClick={() => {
          window.scrollTo(0, document.body.scrollHeight);
          paginate(0);
          p.delete("skipAmt");
          navigate("?" + p.toString());
          setCurrentPage((prev) => prev - 1);
          setTableIssues([]);
        }}
      >
        <ChevronLeft_1.default />
        <span>BACK</span>
      </ChangePageEle>
    );
  } else if (skipAmt > 0) {
    prevButton = (
      <ChangePageEle
        onClick={() => {
          window.scrollTo(0, document.body.scrollHeight);
          paginate(skipAmt - 50);
          p.set("skipAmt", (skipAmt - 50).toString());
          navigate("?" + p.toString());
          setCurrentPage((prev) => prev - 1);
          setTableIssues([]);
        }}
      >
        <ChevronLeft_1.default />
        <span>BACK</span>
      </ChangePageEle>
    );
  }
  let table = null;
  if (poolOverviewRequest.poolOverviewError) {
    if (issues.filter((x) => x.fieldName === "Pool Overview Tab").length === 0) {
      issues.push({
        message: poolOverviewRequest?.poolOverviewError?.message + ". Refresh and try again.",
        type: "",
        fieldName: "Pool Overview Tab",
        level: "critical",
      });
    }
    table = (
      <material_1.Grid key={"tableID"}>
        <material_1.Box my={3}>
          <CopyLinkToClipboard_1.CopyLinkToClipboard link={window.location.href} scrollId={"tableID"}>
            <material_1.Typography variant="h4" id={"tableID"}>
              {poolOverviewRequest?.poolOverviewError?.message}
            </material_1.Typography>
          </CopyLinkToClipboard_1.CopyLinkToClipboard>
        </material_1.Box>
      </material_1.Grid>
    );
  } else if (poolOverviewRequest.poolOverviewLoading) {
    table = (
      <div>
        <material_1.CircularProgress sx={{ margin: 6 }} size={50} />
      </div>
    );
    if (!!pools && pools?.length > 0) {
      table = (
        <div style={{ marginLeft: "16px", marginBottom: "15px" }}>
          <div>
            <material_1.CircularProgress sx={{ margin: 6 }} size={50} />
          </div>
          <span>Loading results...</span>
        </div>
      );
    }
  } else {
    table = (
      <TablePoolOverview_1.TablePoolOverview
        datasetLabel=""
        dataTable={pools}
        protocolType={protocolType}
        protocolNetwork={protocolNetwork}
        skipAmt={skipAmt}
        tablePoolOverviewLoading={poolOverviewRequest.poolOverviewLoading}
        issueProps={tableIssues}
        setPoolId={(x) => setPoolId(x)}
        handleTabChange={(x, y) => handleTabChange(x, y)}
        setIssues={(x) => {
          setTableIssues(x);
        }}
      />
    );
  }
  return (
    <>
      <IssuesDisplay_1.default issuesArrayProps={tableIssues} allLoaded={true} oneLoaded={true} />
      {table}
      {loadingEle}
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
        {prevButton}
        <span>
          {totalPoolCount && !loadingEle ? `Page ${currentPage} out of ${Math.ceil(totalPoolCount / 50)}` : null}
        </span>
        {nextButton}
      </div>
    </>
  );
}
exports.default = PoolOverviewTab;
