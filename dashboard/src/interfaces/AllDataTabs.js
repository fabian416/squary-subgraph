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
const lab_1 = require("@mui/lab");
const material_1 = require("@mui/material");
const react_1 = __importStar(require("react"));
const EventsTab_1 = __importDefault(require("./tabs/EventsTab"));
const PoolTab_1 = __importDefault(require("./tabs/PoolTab"));
const ProtocolTab_1 = __importDefault(require("./tabs/ProtocolTab"));
const styled_1 = require("../styled");
const PoolOverviewTab_1 = __importDefault(require("./tabs/PoolOverviewTab"));
const ProtocolDropDown_1 = require("../common/utilComponents/ProtocolDropDown");
const constants_1 = require("../constants");
const PositionTab_1 = __importDefault(require("./tabs/PositionTab"));
const utils_1 = require("../utils");
const DeploymentOverlayDropDown_1 = require("../common/utilComponents/DeploymentOverlayDropDown");
const subgraphStatusQuery_1 = require("../queries/subgraphStatusQuery");
const PendingCalls_1 = __importDefault(require("../common/utilComponents/PendingCalls"));
const StyledTabs = (0, styled_1.styled)(material_1.Tabs)`
  background: #292f38;
  padding-left: ${({ theme }) => theme.spacing(3)};
`;
// This component is for each individual subgraph
function AllDataTabs({
  data,
  overlayData,
  subgraphEndpoints,
  entitiesData,
  protocolFields,
  tabValue,
  pools,
  poolNames,
  poolId,
  poolData,
  events,
  subgraphToQueryURL,
  skipAmt,
  overlaySchemaData,
  overlayError,
  protocolSchemaData,
  poolOverviewRequest,
  poolTimeseriesRequest,
  protocolTimeseriesData,
  overlayPoolTimeseriesData,
  overlayPoolTimeseriesLoading,
  protocolTableData,
  decentralizedDeployments,
  poolsListData,
  poolListLoading,
  protocolTimeseriesLoading,
  protocolTimeseriesError,
  overlayProtocolTimeseriesData,
  poolsListError,
  positionsQuery,
  overlayDeploymentURL,
  handleTabChange,
  setPoolId,
  setProtocolId,
  paginate,
  setOverlayDeploymentClient,
  setOverlayDeploymentURL,
}) {
  const [pendingSubgraphData, setPendingSubgraphData] = (0, react_1.useState)({});
  const [pendingQuery, setPendingQuery] = (0, react_1.useState)(null);
  (0, react_1.useEffect)(() => {
    try {
      if (subgraphEndpoints) {
        if (subgraphEndpoints[utils_1.schemaMapping[data.protocols[0]?.type]]) {
          setPendingQuery(
            (0, subgraphStatusQuery_1.getPendingSubgraphsOnProtocolQuery)(
              subgraphEndpoints[utils_1.schemaMapping[data.protocols[0].type]][data.protocols[0]?.slug],
            ),
          );
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  }, [subgraphEndpoints]);
  let protocolDropDown = null;
  if (data.protocols.length > 1) {
    protocolDropDown = (
      <div style={{ padding: "24px" }}>
        <ProtocolDropDown_1.ProtocolDropDown setProtocolId={(x) => setProtocolId(x)} protocols={data.protocols} />
      </div>
    );
  }
  if (protocolTableData?.lendingType === "CDP") {
    protocolFields.mintedTokens += "!";
    protocolFields.mintedTokenSupplies += "!";
  }
  if (!protocolTableData) {
    return <material_1.CircularProgress sx={{ margin: 6 }} size={50} />;
  }
  const protocolType = data.protocols[0].type;
  const protocolEntityNamesPlural = constants_1.ProtocolTypeEntityNames[protocolType];
  const protocolEntityNameSingular = constants_1.ProtocolTypeEntityName[protocolType];
  const network = data[protocolEntityNamesPlural][0]?.network;
  let eventsTab = null;
  let eventsTabButton = null;
  if (protocolType !== "GENERIC") {
    eventsTabButton = <material_1.Tab label="Events" value="4" />;
    eventsTab = (
      <lab_1.TabPanel value="4">
        {/* EVENTS TAB */}
        <EventsTab_1.default
          data={data}
          events={events}
          protocolNetwork={network}
          poolId={poolId}
          poolsList={poolsListData}
          poolListLoading={poolListLoading}
          poolNames={poolNames}
          setPoolId={(x) => setPoolId(x)}
        />
      </lab_1.TabPanel>
    );
  }
  let showDropDown = false;
  let failedToLoad = false;
  try {
    if (
      tabValue + "" === "1" &&
      (protocolTimeseriesData.financialsDailySnapshots || protocolTimeseriesError.financialsDailySnapshots) &&
      (protocolTimeseriesData.usageMetricsDailySnapshots || protocolTimeseriesError.usageMetricDailySnapshots) &&
      (protocolTimeseriesData.usageMetricsHourlySnapshots || protocolTimeseriesError.usageMetricsHourlySnapshots)
    ) {
      if (
        (overlayDeploymentURL &&
          overlayProtocolTimeseriesData.financialsDailySnapshots?.length > 0 &&
          overlayProtocolTimeseriesData.usageMetricsDailySnapshots?.length > 0 &&
          overlayProtocolTimeseriesData.usageMetricsHourlySnapshots?.length > 0) ||
        !overlayDeploymentURL
      ) {
        showDropDown = true;
      }
      if (
        (!protocolTimeseriesData.financialsDailySnapshots &&
          !protocolTimeseriesData.usageMetricsDailySnapshots &&
          !protocolTimeseriesData.usageMetricsHourlySnapshots) ||
        (overlayDeploymentURL &&
          !overlayProtocolTimeseriesData?.financialsDailySnapshots &&
          !overlayProtocolTimeseriesData?.usageMetricsDailySnapshots &&
          !overlayProtocolTimeseriesData?.usageMetricsHourlySnapshots)
      ) {
        failedToLoad = true;
      }
    } else if (tabValue + "" === "3" && poolTimeseriesRequest.poolTimeseriesData) {
      if (
        Object.values(poolTimeseriesRequest.poolTimeseriesData).filter((x) => x?.length > 0)?.length ===
        Object.values(poolTimeseriesRequest.poolTimeseriesData).length
      ) {
        showDropDown = true;
      } else if (poolTimeseriesRequest.poolTimeseriesError) {
        failedToLoad = true;
      }
    }
    if ((tabValue + "" === "1" || tabValue + "" === "3") && overlayError) {
      showDropDown = true;
    }
  } catch (err) {
    console.error(err.message);
  }
  if (tabValue + "" !== "1" && tabValue + "" !== "3") {
    failedToLoad = true;
  }
  let pendingCalls = null;
  if (pendingQuery) {
    pendingCalls = <PendingCalls_1.default query={pendingQuery} setPendingSubgraphData={setPendingSubgraphData} />;
  }
  return (
    <>
      <lab_1.TabContext value={tabValue}>
        <div
          style={{ display: "flex", backgroundColor: "#292f38", justifyContent: "space-between", alignItems: "center" }}
        >
          <StyledTabs value={tabValue} onChange={handleTabChange}>
            <material_1.Tab label="Protocol" value="1" />
            <material_1.Tab label="Pool Overview" value="2" />
            <material_1.Tab label="Pool" value="3" />
            {eventsTabButton}
            {positionsQuery && <material_1.Tab label="Positions" value="5" />}
          </StyledTabs>
          <DeploymentOverlayDropDown_1.DeploymentOverlayDropDown
            data={data}
            setDeploymentURL={(x) => {
              setOverlayDeploymentClient((0, utils_1.NewClient)(x));
              setOverlayDeploymentURL(x);
            }}
            subgraphEndpoints={subgraphEndpoints}
            pendingSubgraphData={pendingSubgraphData}
            decentralizedDeployments={decentralizedDeployments}
            currentDeploymentURL={overlayDeploymentURL}
            showDropDown={showDropDown}
            failedToLoad={failedToLoad}
          />
        </div>
        {protocolDropDown}
        <lab_1.TabPanel value="1">
          {/* PROTOCOL TAB */}
          <ProtocolTab_1.default
            entitiesData={entitiesData}
            subgraphEndpoints={subgraphEndpoints}
            protocolFields={protocolFields}
            protocolType={data.protocols[0].type}
            protocolTableData={protocolTableData}
            overlaySchemaData={overlaySchemaData}
            protocolSchemaData={protocolSchemaData}
            protocolTimeseriesData={protocolTimeseriesData}
            protocolTimeseriesLoading={protocolTimeseriesLoading}
            protocolTimeseriesError={protocolTimeseriesError}
            overlayProtocolTimeseriesData={overlayProtocolTimeseriesData}
          />
        </lab_1.TabPanel>
        <lab_1.TabPanel value="2">
          {/* POOLOVERVIEW TAB */}
          <PoolOverviewTab_1.default
            totalPoolCount={protocolTableData[protocolEntityNameSingular].totalPoolCount}
            skipAmt={skipAmt}
            pools={pools}
            protocolType={data.protocols[0].type}
            protocolNetwork={network}
            poolOverviewRequest={poolOverviewRequest}
            subgraphToQueryURL={subgraphToQueryURL}
            setPoolId={(x) => setPoolId(x)}
            paginate={(x) => paginate(x)}
            handleTabChange={(x, y) => handleTabChange(x, y)}
          />
        </lab_1.TabPanel>
        <lab_1.TabPanel value="3">
          {/* POOL TAB */}
          <PoolTab_1.default
            data={data}
            overlayData={overlayData}
            entitiesData={entitiesData}
            subgraphToQueryURL={subgraphToQueryURL}
            poolTimeseriesData={poolTimeseriesRequest.poolTimeseriesData}
            overlayPoolTimeseriesData={overlayPoolTimeseriesData}
            overlayPoolTimeseriesLoading={overlayPoolTimeseriesLoading}
            poolTimeseriesLoading={poolTimeseriesRequest.poolTimeseriesLoading}
            poolTimeseriesError={poolTimeseriesRequest.poolTimeseriesError}
            poolId={poolId}
            poolData={poolData}
            poolsListError={poolsListError}
            poolsList={poolsListData}
            poolListLoading={poolListLoading}
            poolNames={poolNames}
            protocolData={protocolTableData}
            setPoolId={(x) => setPoolId(x)}
          />
        </lab_1.TabPanel>
        {eventsTab}
        {positionsQuery && (
          <lab_1.TabPanel value="5">
            {/* POSITIONS TAB */}
            <PositionTab_1.default
              positions={data[constants_1.PoolName[protocolType]]?.positions}
              poolId={poolId}
              poolsList={poolsListData}
              poolListLoading={poolListLoading}
              poolsListError={poolsListError}
              poolNames={poolNames}
              setPoolId={(x) => setPoolId(x)}
            />
          </lab_1.TabPanel>
        )}
      </lab_1.TabContext>
      {pendingCalls}
    </>
  );
}
exports.default = AllDataTabs;
