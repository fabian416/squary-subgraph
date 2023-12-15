"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@apollo/client");
const material_1 = require("@mui/material");
const moment_1 = __importDefault(require("moment"));
const react_1 = require("react");
const BridgeOutboundChart_1 = require("../chartComponents/BridgeOutboundChart");
const DynamicColumnTableChart_1 = require("../chartComponents/DynamicColumnTableChart");
const CopyLinkToClipboard_1 = require("./CopyLinkToClipboard");
const utils_1 = require("../../utils");
function BridgeOutboundVolumeLogic({ poolId, routes, subgraphToQueryURL }) {
  const chartRef = (0, react_1.useRef)(null);
  const datasetLabel = "Daily Volume Inbound by Chain";
  function jpegDownloadHandler() {
    try {
      const link = document.createElement("a");
      link.download = datasetLabel + "-" + moment_1.default.utc(Date.now()).format("MMDDYY") + ".jpeg";
      link.href = chartRef.current?.toBase64Image("image/jpeg", 1);
      link.click();
    } catch (err) {
      return;
    }
  }
  const routeIdToChainMapping = {};
  routes?.forEach((obj) => {
    routeIdToChainMapping[obj?.id] = obj?.crossToken?.network;
  });
  const routeIds = routes?.map((x) => x?.id);
  const routeSnapshotsQueryContent =
    routeIds?.map((id) => {
      if (!id) {
        return "";
      }
      return `            
        ${routeIdToChainMapping[id]}: poolRouteSnapshots(where: {poolRoute: "${id}"}, first: 1000) {
            poolRoute {
                id
            }
            snapshotVolumeOutUSD
            timestamp
        }
        `;
    }) || "";
  const routeSnapshotsQuery = "query { " + routeSnapshotsQueryContent + " }";
  const client = (0, react_1.useMemo)(() => {
    return new client_1.ApolloClient({
      link: new client_1.HttpLink({
        uri: subgraphToQueryURL,
      }),
      cache: new client_1.InMemoryCache(),
    });
  }, [subgraphToQueryURL]);
  const [getSnapshotData, { data: snapshotData, loading, error }] = (0, client_1.useLazyQuery)(
    (0, client_1.gql)`
      ${routeSnapshotsQuery}
    `,
    { client },
  );
  (0, react_1.useEffect)(() => {
    if (routeSnapshotsQueryContent.length > 0) {
      getSnapshotData();
    }
  }, [routes]);
  if (loading) {
    return (
      <div key={"BridgeOutboundChart"} id={"BridgeOutboundChart"}>
        <material_1.Box sx={{ width: "62.5%", marginBottom: "8px" }} mt={3}>
          <material_1.CircularProgress size={40} />
        </material_1.Box>
      </div>
    );
  }
  if (error) {
    return <material_1.Typography variant="h6">{"Error Loading Chart: " + error.message}</material_1.Typography>;
  }
  // create object with all chains as keys, obj as child
  const chartingObject = {};
  const tableVals = [];
  const dates = [];
  if (snapshotData) {
    if (Object.keys(snapshotData).length > 0) {
      let earliestTS = Date.now();
      const chainMappingSnapshotDates = {};
      const snapshotDataOnDate = {};
      Object.keys(snapshotData).forEach((key) => {
        chainMappingSnapshotDates[key] = {};
        snapshotData[key].forEach((snapshot) => {
          let ts = Number(snapshot.timestamp) * 1000;
          if (ts < earliestTS) {
            earliestTS = ts;
          }
          const dateString = (0, utils_1.timestampToDaysSinceEpoch)(ts).toString();
          if (!chainMappingSnapshotDates[key][dateString]) {
            chainMappingSnapshotDates[key][dateString] = 0;
          }
          chainMappingSnapshotDates[key][dateString] += Number(snapshot.snapshotVolumeOutUSD);
          if (!snapshotDataOnDate[dateString]) {
            snapshotDataOnDate[dateString] = {};
          }
        });
      });
      let daysSinceEpoch = (0, utils_1.timestampToDaysSinceEpoch)(earliestTS);
      const todaySinceEpoch = (0, utils_1.timestampToDaysSinceEpoch)(Date.now());
      // NEED TO LOG AND TEST ALL OF THESE TIMESTAMP VALUES
      for (daysSinceEpoch; daysSinceEpoch <= todaySinceEpoch; daysSinceEpoch++) {
        dates.push(daysSinceEpoch * 86400);
        const tableValsElement = { date: daysSinceEpoch * 86400 };
        Object.keys(chainMappingSnapshotDates).forEach((chain) => {
          if (!Object.keys(chartingObject)?.includes(chain)) {
            chartingObject[chain] = [];
          }
          const currentVal = chainMappingSnapshotDates[chain][daysSinceEpoch] || 0;
          chartingObject[chain].push(currentVal);
          tableValsElement[chain] = currentVal;
        });
        tableVals.push(tableValsElement);
      }
    }
  }
  if (chartingObject) {
    if (Object.keys(chartingObject)?.length > 0) {
      return (
        <>
          <div key={"BridgeOutboundChart"} id={"BridgeOutboundChart"}>
            <material_1.Box sx={{ width: "62.5%", marginBottom: "8px" }} mt={3}>
              <material_1.Grid container justifyContent="space-between">
                <CopyLinkToClipboard_1.CopyLinkToClipboard link={window.location.href} scrollId={"BridgeOutboundChart"}>
                  <material_1.Typography variant="h6">{datasetLabel}</material_1.Typography>
                </CopyLinkToClipboard_1.CopyLinkToClipboard>
              </material_1.Grid>
            </material_1.Box>
          </div>
          <material_1.Grid container justifyContent="space-between">
            <material_1.Grid key={datasetLabel + "chart1"} item xs={7.5}>
              <BridgeOutboundChart_1.BridgeOutboundChart
                dayVolByChain={chartingObject}
                dates={dates}
                title={"Daily Volume Inbound by Chain for Pool " + poolId}
                chartRef={chartRef}
              />
            </material_1.Grid>
            <material_1.Grid key={datasetLabel + "table2"} item xs={4}>
              <DynamicColumnTableChart_1.DynamicColumnTableChart
                datasetLabel={datasetLabel}
                dataTable={tableVals}
                jpegDownloadHandler={() => jpegDownloadHandler()}
              />
            </material_1.Grid>
          </material_1.Grid>
        </>
      );
    }
  }
  return null;
}
exports.default = BridgeOutboundVolumeLogic;
