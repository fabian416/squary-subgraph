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
const material_1 = require("@mui/material");
const client_1 = require("@apollo/client");
const chart_js_1 = require("chart.js");
const react_1 = __importStar(require("react"));
const schema_1 = require("../queries/schema");
const constants_1 = require("../constants");
const ErrorDisplay_1 = __importDefault(require("./ErrorDisplay"));
const react_router_dom_1 = require("react-router-dom");
const react_router_1 = require("react-router");
const utils_1 = require("../utils");
const AllDataTabs_1 = __importDefault(require("./AllDataTabs"));
const DashboardHeader_1 = require("../common/headerComponents/DashboardHeader");
const subgraphStatusQuery_1 = require("../queries/subgraphStatusQuery");
const snapshotDailyVolumeQuery_1 = require("../queries/snapshotDailyVolumeQuery");
const styled_1 = require("../styled");
const poolOverviewTokensQuery_1 = require("../queries/poolOverviewTokensQuery");
const BackBanner = (0, styled_1.styled)("div")`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  background: #20252c;
  cursor: pointer;
`;
function ProtocolDashboard({ protocolJSON, getData, subgraphEndpoints, decentralizedDeployments }) {
  const [searchParams] = (0, react_router_dom_1.useSearchParams)();
  const subgraphParam = searchParams.get("endpoint") || "";
  const tabString = searchParams.get("tab") || "";
  const poolIdString = searchParams.get("poolId") || "";
  const scrollToView = searchParams.get("view") || "";
  const skipAmtParam = Number(searchParams.get("skipAmt")) || 0;
  const version = searchParams.get("version") || "current";
  const overlayParam = searchParams.get("overlay") || "";
  const navigate = (0, react_router_1.useNavigate)();
  let queryURL = `${constants_1.SubgraphBaseUrl}${subgraphParam}`;
  let subgraphName = subgraphParam;
  if (subgraphParam) {
    const parseCheck = (0, utils_1.isValidHttpUrl)(subgraphParam);
    if (parseCheck) {
      queryURL = subgraphParam;
      if (queryURL.includes("name/") && !searchParams.get("name")) {
        subgraphName = queryURL.split("name/")[1];
      } else if (searchParams.get("name")) {
        subgraphName = searchParams.get("name") || "";
      } else {
        subgraphName = "";
      }
    } else if (!subgraphParam.includes("/")) {
      if (subgraphParam?.toUpperCase()?.split("QM")?.length === 1) {
        queryURL =
          process.env.REACT_APP_GRAPH_DECEN_URL +
          "/api/" +
          process.env.REACT_APP_GRAPH_API_KEY +
          "/subgraphs/id/" +
          subgraphParam;
      } else {
        queryURL = process.env.REACT_APP_GRAPH_BASE_URL + "/subgraphs/id/" + subgraphParam;
      }
    }
  }
  const [subgraphToQuery, setSubgraphToQuery] = (0, react_1.useState)({ url: queryURL, version: "" });
  const endpointObject = { current: "", pending: "" };
  endpointObject[version] = queryURL;
  if (subgraphName && !endpointObject.current) {
    endpointObject.current = process.env.REACT_APP_GRAPH_BASE_URL + "/subgraphs/name/" + subgraphName;
  }
  const [endpoints, setEndpoints] = (0, react_1.useState)(endpointObject);
  const [isCurrentVersion, setIsCurrentVersion] = (0, react_1.useState)(version == "current" ? true : false);
  const [poolId, setPoolId] = (0, react_1.useState)(poolIdString);
  const [skipAmt, paginate] = (0, react_1.useState)(skipAmtParam);
  const [overlayDeploymentClient, setOverlayDeploymentClient] = (0, react_1.useState)(
    (0, utils_1.NewClient)(process.env.REACT_APP_GRAPH_BASE_URL + "/index-node/graphql"),
  );
  const [overlayDeploymentURL, setOverlayDeploymentURL] = (0, react_1.useState)("");
  const [overlayError, setOverlayError] = (0, react_1.useState)(null);
  const clientIndexing = (0, react_1.useMemo)(
    () => (0, utils_1.NewClient)(process.env.REACT_APP_GRAPH_BASE_URL + "/index-node/graphql"),
    [subgraphParam],
  );
  const [getPendingSubgraph, { data: pendingVersion, error: errorSubId, loading: subIdLoading }] = (0,
  client_1.useLazyQuery)(subgraphStatusQuery_1.getPendingSubgraphId, {
    variables: { subgraphName },
    client: clientIndexing,
  });
  (0, react_1.useEffect)(() => {
    if ((0, utils_1.isValidHttpUrl)(overlayParam)) {
      setOverlayDeploymentURL(overlayParam);
      setOverlayDeploymentClient((0, utils_1.NewClient)(overlayParam));
    }
  }, []);
  const [positionSnapshots, setPositionSnapshots] = (0, react_1.useState)();
  const [positionsLoading, setPositionsLoading] = (0, react_1.useState)(false);
  chart_js_1.Chart.register(...chart_js_1.registerables);
  const client = (0, react_1.useMemo)(() => {
    return new client_1.ApolloClient({
      link: new client_1.HttpLink({
        uri: subgraphToQuery.url,
      }),
      cache: new client_1.InMemoryCache(),
    });
  }, [subgraphToQuery.url]);
  // This query is to fetch data about the protocol. This helps select the proper schema to make the full query
  const {
    data: protocolSchemaData,
    loading: protocolSchemaQueryLoading,
    error: protocolSchemaQueryError,
  } = (0, client_1.useQuery)(schema_1.metaDataQuery, { client });
  const [
    getOverlaySchemaData,
    { data: overlaySchemaData, loading: overlaySchemaQueryLoading, error: overlaySchemaQueryError },
  ] = (0, client_1.useLazyQuery)(schema_1.metaDataQuery, { client: overlayDeploymentClient });
  (0, react_1.useEffect)(() => {
    if (overlayError) {
      setOverlayError(null);
    }
    const href = new URL(window.location.href);
    const p = new URLSearchParams(href.search);
    if (overlayDeploymentURL === "") {
      p.delete("overlay");
    } else {
      p.set("overlay", overlayDeploymentURL);
    }
    navigate("?" + p.toString().split("%2F").join("/").split("%3A").join(":"));
  }, [overlayDeploymentURL]);
  (0, react_1.useEffect)(() => {
    if (overlayDeploymentURL && protocolSchemaData) {
      getOverlaySchemaData();
    }
    if (overlayDeploymentURL === "" && overlayError) {
      setOverlayError(null);
    }
  }, [protocolSchemaData, overlayDeploymentURL]);
  // By default, set the schema version to the user selected. If user has not selected, go to the version on the protocol entity
  let protocolIdString = searchParams.get("protocolId");
  let protocolIdToUse = "";
  if (typeof protocolIdString === "string") {
    protocolIdToUse = protocolIdString;
  }
  let protocolType = "N/A";
  let schemaVersion = subgraphToQuery.version;
  let slug = "";
  let networkStr = "";
  let entityError = null;
  if (protocolSchemaData?.protocols?.length > 0) {
    if (protocolSchemaData.protocols[0].id && !protocolIdToUse) {
      protocolIdToUse = protocolSchemaData.protocols[0]?.id;
    }
    protocolType = protocolSchemaData.protocols[0].type;
    schemaVersion = protocolSchemaData.protocols[0].schemaVersion;
    slug = protocolSchemaData.protocols[0].slug;
    networkStr = protocolSchemaData.protocols[0].network
      .toLowerCase()
      .replace("_", "-")
      .replace("mainnet", "ethereum")
      .replace("matic", "polygon");
    if (!subgraphName) {
      subgraphName = slug.concat("-").concat(networkStr);
    }
  } else if (!protocolSchemaQueryLoading) {
    entityError = new client_1.ApolloError({
      errorMessage: `DEPLOYMENT ERROR - ${subgraphToQuery.url} does not have any "protocol" entities. Essential data that determines validation can not be pulled without this entity.`,
    });
  }
  (0, react_1.useEffect)(() => {
    // perform validations that the comparison is for same versions, same subgraph etc
    if (overlaySchemaData?.protocols[0]) {
      overlayProtocolType = overlaySchemaData.protocols[0].type;
      overlaySchemaVersion = overlaySchemaData?.protocols[0]?.schemaVersion;
      getOverlayMainQueryData();
    }
    if (overlayProtocolType !== protocolType && !overlaySchemaQueryLoading && overlayDeploymentURL) {
      setOverlayError(
        new client_1.ApolloError({
          errorMessage: `OVERLAY ERROR - Current subgraph ${subgraphToQuery.url} has a schema type of ${protocolType} while the overlay subgraph ${overlayDeploymentURL} has a schema type of ${overlayProtocolType}. In order to do an overlay comparison, these types have to match.`,
        }),
      );
    }
  }, [overlaySchemaData, overlaySchemaQueryError]);
  const [protocolId, setprotocolId] = (0, react_1.useState)(protocolIdToUse);
  const {
    entitiesData,
    poolData,
    query: graphQuery,
    events,
    protocolFields,
    financialsQuery,
    dailyUsageQuery,
    hourlyUsageQuery,
    protocolTableQuery,
    poolsQuery,
    poolTimeseriesQuery,
    positionsQuery = "",
  } = (0, schema_1.schema)(protocolType, schemaVersion);
  const queryMain = (0, client_1.gql)`
    ${graphQuery}
  `;
  let overlayProtocolType = "N/A";
  let overlaySchemaVersion = schemaVersion;
  if (!!overlaySchemaData?.protocols[0]) {
    overlayProtocolType = overlaySchemaData.protocols[0].type;
    overlaySchemaVersion = overlaySchemaData?.protocols[0]?.schemaVersion;
  }
  if (!overlaySchemaVersion) {
    overlaySchemaVersion = schemaVersion;
  }
  if (!overlayProtocolType) {
    overlayProtocolType = "N/A";
  }
  const {
    query: overlayQuery,
    poolTimeseriesQuery: overlayPoolTimeseriesQuery,
    financialsQuery: overlayFinancialsQuery,
    dailyUsageQuery: overlayDailyUsageQuery,
    hourlyUsageQuery: overlayHourlyUsageQuery,
    protocolTableQuery: overlayProtocolTableQuery,
    poolsQuery: overlayPoolsQuery,
  } = (0, schema_1.schema)(overlayProtocolType, overlaySchemaVersion);
  const overlayQueryMain = (0, client_1.gql)`
    ${overlayQuery}
  `;
  const [getMainQueryData, { data, loading, error }] = (0, client_1.useLazyQuery)(queryMain, {
    variables: { poolId, protocolId },
    client,
  });
  const [
    getFinancialsData,
    { data: financialsData, loading: financialsLoading, error: financialsError, refetch: financialsRefetch },
  ] = (0, client_1.useLazyQuery)(
    (0, client_1.gql)`
      ${financialsQuery}
    `,
    { client },
  );
  const [
    getDailyUsageData,
    { data: dailyUsageData, loading: dailyUsageLoading, error: dailyUsageError, refetch: dailyUsageRefetch },
  ] = (0, client_1.useLazyQuery)(
    (0, client_1.gql)`
      ${dailyUsageQuery}
    `,
    { client },
  );
  const [
    getHourlyUsageData,
    { data: hourlyUsageData, loading: hourlyUsageLoading, error: hourlyUsageError, refetch: hourlyUsageRefetch },
  ] = (0, client_1.useLazyQuery)(
    (0, client_1.gql)`
      ${hourlyUsageQuery}
    `,
    { client },
  );
  const [getProtocolTableData, { data: protocolTableData, error: protocolTableError }] = (0, client_1.useLazyQuery)(
    (0, client_1.gql)`
      ${protocolTableQuery}
    `,
    { client, variables: { protocolId: protocolIdToUse } },
  );
  const [getOverlayMainQueryData, { data: overlayData }] = (0, client_1.useLazyQuery)(overlayQueryMain, {
    variables: { poolId, protocolId },
    client: overlayDeploymentClient,
  });
  const [getOverlayFinancialsData, { data: overlayFinancialsData }] = (0, client_1.useLazyQuery)(
    (0, client_1.gql)`
      ${overlayFinancialsQuery}
    `,
    { client: overlayDeploymentClient },
  );
  const [getOverlayDailyUsageData, { data: overlayDailyUsageData, loading: overlayDailyUsageLoading }] = (0,
  client_1.useLazyQuery)(
    (0, client_1.gql)`
      ${overlayDailyUsageQuery}
    `,
    { client: overlayDeploymentClient },
  );
  const [getOverlayHourlyUsageData, { data: overlayHourlyUsageData }] = (0, client_1.useLazyQuery)(
    (0, client_1.gql)`
      ${overlayHourlyUsageQuery}
    `,
    { client: overlayDeploymentClient },
  );
  const [
    getPoolsListData,
    { data: poolsListData, loading: poolListLoading, error: poolsListError, refetch: poolsListRefetch },
  ] = (0, client_1.useLazyQuery)(
    (0, client_1.gql)`
      ${poolsQuery}
    `,
    { client },
  );
  const [
    getPoolTimeseriesData,
    {
      data: poolTimeseriesData,
      loading: poolTimeseriesLoading,
      error: poolTimeseriesError,
      refetch: poolTimeseriesRefetch,
    },
  ] = (0, client_1.useLazyQuery)(
    (0, client_1.gql)`
      ${poolTimeseriesQuery}
    `,
    { variables: { poolId }, client },
  );
  const queryPoolOverview = (0, client_1.gql)`
    ${(0, schema_1.poolOverview)(protocolType, schemaVersion)}
  `;
  const [
    getOverlayPoolTimeseriesData,
    { data: overlayPoolTimeseriesData, loading: overlayPoolTimeseriesLoading, error: overlayPoolTimeseriesError },
  ] = (0, client_1.useLazyQuery)(
    (0, client_1.gql)`
      ${overlayPoolTimeseriesQuery}
    `,
    { variables: { poolId }, client: overlayDeploymentClient },
  );
  const [
    getPoolsOverviewData,
    { data: dataPools, error: poolOverviewError, loading: poolOverviewLoading, refetch: poolOverviewRefetch },
  ] = (0, client_1.useLazyQuery)(queryPoolOverview, { client: client, variables: { skipAmt } });
  const [getPoolsOverviewData2, { data: dataPools2, error: poolOverviewError2, loading: poolOverviewLoading2 }] = (0,
  client_1.useLazyQuery)(queryPoolOverview, { client: client, variables: { skipAmt: skipAmt + 10 } });
  const [getPoolsOverviewData3, { data: dataPools3, error: poolOverviewError3, loading: poolOverviewLoading3 }] = (0,
  client_1.useLazyQuery)(queryPoolOverview, { client: client, variables: { skipAmt: skipAmt + 20 } });
  const [getPoolsOverviewData4, { data: dataPools4, error: poolOverviewError4, loading: poolOverviewLoading4 }] = (0,
  client_1.useLazyQuery)(queryPoolOverview, { client: client, variables: { skipAmt: skipAmt + 30 } });
  const [getPoolsOverviewData5, { data: dataPools5, error: poolOverviewError5, loading: poolOverviewLoading5 }] = (0,
  client_1.useLazyQuery)(queryPoolOverview, { client: client, variables: { skipAmt: skipAmt + 40 } });
  const tokenQuery = (0, client_1.gql)`
    ${(0, poolOverviewTokensQuery_1.poolOverviewTokensQuery)(protocolSchemaData?.protocols[0]?.type?.toUpperCase())}
  `;
  const snapshotDailyVolumeQuery = (0, client_1.gql)`
    ${(0, snapshotDailyVolumeQuery_1.getSnapshotDailyVolume)(
      schemaVersion,
      protocolSchemaData?.protocols[0]?.type?.toUpperCase(),
    )}
  `;
  const [getPoolsSnapshotVolume, { data: snapshotVolume }] = (0, client_1.useLazyQuery)(snapshotDailyVolumeQuery, {
    client: client,
  });
  const [getPoolsSnapshotVolume2, { data: snapshotVolume2 }] = (0, client_1.useLazyQuery)(snapshotDailyVolumeQuery, {
    client: client,
  });
  const [getPoolsSnapshotVolume3, { data: snapshotVolume3 }] = (0, client_1.useLazyQuery)(snapshotDailyVolumeQuery, {
    client: client,
  });
  const [getPoolsSnapshotVolume4, { data: snapshotVolume4 }] = (0, client_1.useLazyQuery)(snapshotDailyVolumeQuery, {
    client: client,
  });
  const [getPoolsSnapshotVolume5, { data: snapshotVolume5 }] = (0, client_1.useLazyQuery)(snapshotDailyVolumeQuery, {
    client: client,
  });
  const [getPoolOverviewTokens, { data: poolOverviewTokens }] = (0, client_1.useLazyQuery)(tokenQuery, {
    client: client,
  });
  const [getPoolOverviewTokens2, { data: poolOverviewTokens2 }] = (0, client_1.useLazyQuery)(tokenQuery, {
    client: client,
  });
  const [getPoolOverviewTokens3, { data: poolOverviewTokens3 }] = (0, client_1.useLazyQuery)(tokenQuery, {
    client: client,
  });
  const [getPoolOverviewTokens4, { data: poolOverviewTokens4 }] = (0, client_1.useLazyQuery)(tokenQuery, {
    client: client,
  });
  const [getPoolOverviewTokens5, { data: poolOverviewTokens5 }] = (0, client_1.useLazyQuery)(tokenQuery, {
    client: client,
  });
  const [getFailedIndexingStatus, { data: indexingFailureData, error: indexingFailureError }] = (0,
  client_1.useLazyQuery)(subgraphStatusQuery_1.nameQuery, { variables: { subgraphName }, client: clientIndexing });
  let tabNum = "1";
  if (tabString.toUpperCase() === "POOLOVERVIEW") {
    tabNum = "2";
  } else if (tabString.toUpperCase() === "POOL") {
    tabNum = "3";
  } else if (tabString.toUpperCase() === "EVENTS") {
    tabNum = "4";
  } else if (tabString.toUpperCase() === "POSITIONS") {
    tabNum = "5";
  }
  const [tabValue, setTabValue] = (0, react_1.useState)(tabNum);
  const handleTabChange = (event, newValue) => {
    let tabName = "protocol";
    const href = new URL(window.location.href);
    const p = new URLSearchParams(href.search);
    const poolIdFromParam = p.get("poolId");
    let overlayParam = "";
    if (overlayDeploymentURL) {
      overlayParam = "&overlay=" + overlayDeploymentURL;
    }
    let deploymentVersionParam = "";
    if (!isCurrentVersion) {
      deploymentVersionParam = "&version=pending";
    }
    let protocolParam = "";
    if (protocolId) {
      protocolParam = `&protocolId=${protocolId}`;
    }
    let skipAmtParam = "";
    let poolParam = "";
    if (newValue === "2") {
      tabName = "poolOverview";
      if (skipAmt > 0) {
        skipAmtParam = `&skipAmt=${skipAmt}`;
      }
    } else if (newValue === "3") {
      poolParam = `&poolId=${poolIdFromParam || poolId}`;
      tabName = "pool";
    } else if (newValue === "4") {
      poolParam = `&poolId=${poolIdFromParam || poolId}`;
      tabName = "events";
    } else if (newValue === "5") {
      poolParam = `&poolId=${poolIdFromParam || poolId}`;
      tabName = "positions";
    }
    navigate(
      `?endpoint=${subgraphParam}&tab=${tabName}${protocolParam}${poolParam}${skipAmtParam}${deploymentVersionParam}${overlayParam}`,
    );
    setTabValue(newValue);
  };
  (0, react_1.useEffect)(() => {
    const poolType = constants_1.PoolName[utils_1.schemaMapping[protocolType]];
    if (
      overlayPoolTimeseriesData &&
      !overlayDailyUsageLoading &&
      !overlayPoolTimeseriesData?.[poolType + "DailySnapshots"]?.length &&
      !overlayPoolTimeseriesData?.[poolType + "HourlySnapshots"]?.length
    ) {
      setOverlayError(
        new client_1.ApolloError({
          errorMessage: `OVERLAY ERROR - Current subgraph ${subgraphToQuery.url} has a pool with id ${poolId} while the overlay subgraph ${overlayDeploymentURL} does not. In order to do an overlay comparison, both of these subgraphs need the same pools.`,
        }),
      );
    }
  }, [overlayPoolTimeseriesData]);
  (0, react_1.useEffect)(() => {
    if (Object.keys(protocolJSON).length === 0) {
      getData();
    }
  });
  (0, react_1.useEffect)(() => {
    if (
      pendingVersion?.indexingStatusForPendingVersion?.subgraph &&
      pendingVersion?.indexingStatusForPendingVersion?.health === "healthy"
    ) {
      const pendingURL =
        process.env.REACT_APP_GRAPH_BASE_URL +
        "/subgraphs/id/" +
        pendingVersion?.indexingStatusForPendingVersion?.subgraph;
      if (isCurrentVersion === false) {
        setSubgraphToQuery({ url: pendingURL, version: "pending" });
      }
      setEndpoints({
        current: endpoints.current,
        pending: pendingURL,
      });
    }
  }, [pendingVersion, errorSubId]);
  (0, react_1.useEffect)(() => {
    // If the schema query request was successful, make the full data query
    if (protocolSchemaData?.protocols?.length > 0) {
      if (protocolIdToUse || protocolSchemaData?.protocols[0]?.id) {
        getMainQueryData();
        getProtocolTableData();
      }
    }
    getPendingSubgraph();
    getFailedIndexingStatus();
  }, [protocolSchemaData, getMainQueryData, getProtocolTableData, getPendingSubgraph]);
  (0, react_1.useEffect)(() => {
    if (protocolTableData && tabValue === "1") {
      getFinancialsData();
    }
  }, [protocolTableData, protocolTableError, getFinancialsData, tabValue]);
  (0, react_1.useEffect)(() => {
    if (protocolTableData && tabValue === "1" && overlayDeploymentURL) {
      getOverlayFinancialsData();
    }
  }, [protocolTableData, overlayDeploymentURL, getOverlayFinancialsData, tabValue]);
  (0, react_1.useEffect)(() => {
    if (financialsData && tabValue === "1") {
      getDailyUsageData();
    }
  }, [financialsData, financialsError, getDailyUsageData]);
  (0, react_1.useEffect)(() => {
    if (overlayFinancialsData && tabValue === "1" && overlayDeploymentURL) {
      getOverlayDailyUsageData();
    }
  }, [overlayFinancialsData, overlayDeploymentURL, getOverlayDailyUsageData]);
  (0, react_1.useEffect)(() => {
    if (dailyUsageData && tabValue === "1") {
      getHourlyUsageData();
    }
  }, [dailyUsageData, getHourlyUsageData]);
  (0, react_1.useEffect)(() => {
    if (overlayDailyUsageData && tabValue === "1" && overlayDeploymentURL) {
      getOverlayHourlyUsageData();
    }
  }, [overlayDailyUsageData, overlayDeploymentURL, getOverlayHourlyUsageData]);
  (0, react_1.useEffect)(() => {
    if (poolId) {
      getPoolTimeseriesData();
    }
  }, [poolId]);
  (0, react_1.useEffect)(() => {
    if (poolId && overlayDeploymentURL) {
      getOverlayPoolTimeseriesData();
    }
  }, [poolId, overlayDeploymentURL]);
  (0, react_1.useEffect)(() => {
    if (financialsError && tabValue === "1") {
      financialsRefetch();
      getDailyUsageData();
    }
  }, [financialsError]);
  (0, react_1.useEffect)(() => {
    if (dailyUsageError && tabValue === "1") {
      dailyUsageRefetch();
      getHourlyUsageData();
    }
  }, [dailyUsageError]);
  (0, react_1.useEffect)(() => {
    if (hourlyUsageError && tabValue === "1") {
      hourlyUsageRefetch();
    }
  }, [hourlyUsageError]);
  (0, react_1.useEffect)(() => {
    if (poolsListError) {
      poolsListRefetch();
    }
  }, [poolsListError]);
  (0, react_1.useEffect)(() => {
    if (poolTimeseriesError) {
      poolTimeseriesRefetch();
    }
  }, [poolTimeseriesError]);
  (0, react_1.useEffect)(() => {
    if (poolOverviewError) {
      poolOverviewRefetch();
    }
  }, [poolOverviewError]);
  (0, react_1.useEffect)(() => {
    if (tabValue === "2" && !dataPools) {
      getPoolsOverviewData();
    }
  }, [tabValue, getPoolsOverviewData]);
  (0, react_1.useEffect)(() => {
    if (data?.protocols && dataPools) {
      const variables = {};
      for (let idx = 0; idx < 10; idx++) {
        variables["pool" + (idx + 1) + "Id"] =
          dataPools[constants_1.PoolNames[data?.protocols[0]?.type]][idx]?.id || "";
      }
      getPoolOverviewTokens({ variables });
      if (
        data?.protocols[0]?.type === "EXCHANGE" ||
        data?.protocols[0]?.type === "GENERIC" ||
        data?.protocols[0]?.type === "YIELD"
      ) {
        getPoolsSnapshotVolume({ variables });
      }
      if (
        dataPools[constants_1.PoolNames[data?.protocols[0]?.type]]?.length === 10 &&
        tabValue === "2" &&
        !dataPools2
      ) {
        getPoolsOverviewData2();
      }
    }
  }, [tabValue, data, dataPools, poolOverviewLoading]);
  (0, react_1.useEffect)(() => {
    if (data?.protocols && dataPools2) {
      const variables = {};
      for (let idx = 0; idx < 10; idx++) {
        variables["pool" + (idx + 1) + "Id"] =
          dataPools2[constants_1.PoolNames[data?.protocols[0]?.type]][idx]?.id || "";
      }
      getPoolOverviewTokens2({ variables });
      if (
        data?.protocols[0]?.type === "EXCHANGE" ||
        data?.protocols[0]?.type === "GENERIC" ||
        data?.protocols[0]?.type === "YIELD"
      ) {
        getPoolsSnapshotVolume2({ variables });
      }
      if (
        dataPools2[constants_1.PoolNames[data?.protocols[0]?.type]]?.length === 10 &&
        tabValue === "2" &&
        !dataPools3
      ) {
        getPoolsOverviewData3();
      }
    }
  }, [dataPools2, poolOverviewLoading2]);
  (0, react_1.useEffect)(() => {
    if (data?.protocols && dataPools3) {
      const variables = {};
      for (let idx = 0; idx < 10; idx++) {
        variables["pool" + (idx + 1) + "Id"] =
          dataPools3[constants_1.PoolNames[data?.protocols[0]?.type]][idx]?.id || "";
      }
      getPoolOverviewTokens3({ variables });
      if (
        data?.protocols[0]?.type === "EXCHANGE" ||
        data?.protocols[0]?.type === "GENERIC" ||
        data?.protocols[0]?.type === "YIELD"
      ) {
        getPoolsSnapshotVolume3({ variables });
      }
      if (
        dataPools3[constants_1.PoolNames[data?.protocols[0]?.type]]?.length === 10 &&
        tabValue === "2" &&
        !dataPools4
      ) {
        getPoolsOverviewData4();
      }
    }
  }, [dataPools3]);
  (0, react_1.useEffect)(() => {
    if (data?.protocols && dataPools4) {
      const variables = {};
      for (let idx = 0; idx < 10; idx++) {
        variables["pool" + (idx + 1) + "Id"] =
          dataPools4[constants_1.PoolNames[data?.protocols[0]?.type]][idx]?.id || "";
      }
      getPoolOverviewTokens4({ variables });
      if (
        data?.protocols[0]?.type === "EXCHANGE" ||
        data?.protocols[0]?.type === "GENERIC" ||
        data?.protocols[0]?.type === "YIELD"
      ) {
        getPoolsSnapshotVolume4({ variables });
      }
      if (
        dataPools4[constants_1.PoolNames[data?.protocols[0]?.type]]?.length === 10 &&
        tabValue === "2" &&
        !dataPools5
      ) {
        getPoolsOverviewData5();
      }
    }
  }, [dataPools4]);
  (0, react_1.useEffect)(() => {
    if (data?.protocols && dataPools5) {
      const variables = {};
      for (let idx = 0; idx < 10; idx++) {
        variables["pool" + (idx + 1) + "Id"] =
          dataPools5[constants_1.PoolNames[data?.protocols[0]?.type]][idx]?.id || "";
      }
      getPoolOverviewTokens5({ variables });
      if (
        data?.protocols[0]?.type === "EXCHANGE" ||
        data?.protocols[0]?.type === "GENERIC" ||
        data?.protocols[0]?.type === "YIELD"
      ) {
        getPoolsSnapshotVolume5({ variables });
      }
    }
  }, [dataPools5]);
  (0, react_1.useEffect)(() => {
    if (tabValue === "3" || tabValue === "4" || tabValue === "5") {
      getPoolsListData();
    }
  }, [tabValue, getPoolsListData]);
  (0, react_1.useEffect)(() => {
    document.getElementById(scrollToView)?.scrollIntoView();
  });
  // Error logging in case the full data request throws an error
  (0, react_1.useEffect)(() => {
    if (error || protocolSchemaQueryError) {
      console.log("--------------------Error Start-------------------------");
      console.log(error, protocolSchemaQueryError);
      console.log("--------------------Error End---------------------------");
    }
  }, [error, protocolSchemaQueryError]);
  let protocolKey = Object.keys(protocolJSON).find((x) => subgraphName.includes(x));
  let depoKey = "";
  if (!!protocolKey) {
    depoKey = Object.keys(protocolJSON[protocolKey].deployments).find((x) => subgraphName.includes(x));
  } else {
    protocolKey = "";
  }
  // errorRender is the element to be rendered to display the error
  let errorDisplayProps = null;
  // Conditionals for calling the errorDisplay() function for the various types of errors
  if (protocolSchemaQueryError && !protocolSchemaQueryLoading) {
    // ...includes('has no field') checks if the error is describing a discrepancy between the protocol query and the fields in the protocol entity on the schema
    if (!protocolSchemaData && !protocolSchemaQueryError.message.includes("has no field")) {
      errorDisplayProps = new client_1.ApolloError({
        errorMessage: `DEPLOYMENT UNREACHABLE - ${subgraphToQuery.url} is not a valid subgraph endpoint URL. If a subgraph namestring was used, make sure that the namestring points to a hosted service deployment named using the standard naming convention (for example 'messari/uniswap-v3-ethereum').`,
      });
    } else {
      errorDisplayProps = protocolSchemaQueryError;
    }
  }
  if (error && !loading) {
    errorDisplayProps = error;
  }
  let tokenKey = "inputTokens";
  if (
    protocolSchemaData?.protocols[0]?.type === constants_1.ProtocolType.LENDING ||
    protocolSchemaData?.protocols[0]?.type === constants_1.ProtocolType.YIELD
  ) {
    tokenKey = "inputToken";
  }
  let pools = [];
  if (dataPools && data) {
    let poolArray = dataPools[constants_1.PoolNames[data?.protocols[0]?.type]];
    if (snapshotVolume) {
      if (Object.keys(snapshotVolume)?.length > 0) {
        const copyPool = [...poolArray];
        poolArray = [];
        Object.keys(snapshotVolume).forEach((x, idx) => {
          const copyElement = { ...copyPool[idx] };
          copyElement.dailySupplySideRevenueUSD =
            snapshotVolume[x][snapshotVolume[x].length - 1]?.dailySupplySideRevenueUSD;
          copyElement.dailyVolumeUSD = snapshotVolume[x][snapshotVolume[x].length - 1]?.dailyVolumeUSD;
          poolArray.push(copyElement);
        });
      }
    }
    if (poolOverviewTokens) {
      if (Object.keys(poolOverviewTokens)?.length > 0) {
        const copyPool = [...poolArray];
        poolArray = [];
        Object.keys(poolOverviewTokens).forEach((x, idx) => {
          if (poolOverviewTokens[x]) {
            const copyElement = { ...copyPool[idx] };
            copyElement[tokenKey] = poolOverviewTokens[x][tokenKey];
            copyElement["rewardTokens"] = poolOverviewTokens[x]["rewardTokens"];
            poolArray.push(copyElement);
          }
        });
      }
    }
    pools = poolArray;
  }
  if (dataPools2 && data) {
    let poolArray = dataPools2[constants_1.PoolNames[data?.protocols[0]?.type]];
    if (snapshotVolume2) {
      if (Object.keys(snapshotVolume2)?.length > 0) {
        const copyPool = [...poolArray];
        poolArray = [];
        Object.keys(snapshotVolume2).forEach((x, idx) => {
          const copyElement = { ...copyPool[idx] };
          copyElement.dailySupplySideRevenueUSD =
            snapshotVolume2[x][snapshotVolume2[x].length - 1]?.dailySupplySideRevenueUSD;
          copyElement.dailyVolumeUSD = snapshotVolume2[x][snapshotVolume2[x].length - 1]?.dailyVolumeUSD;
          poolArray.push(copyElement);
        });
      }
    }
    if (poolOverviewTokens2) {
      if (Object.keys(poolOverviewTokens2).length > 0) {
        const copyPool = [...poolArray];
        poolArray = [];
        Object.keys(poolOverviewTokens2).forEach((x, idx) => {
          if (poolOverviewTokens2[x]) {
            const copyElement = { ...copyPool[idx] };
            copyElement[tokenKey] = poolOverviewTokens2[x][tokenKey];
            copyElement["rewardTokens"] = poolOverviewTokens2[x]["rewardTokens"];
            poolArray.push(copyElement);
          }
        });
      }
    }
    pools = pools.concat(poolArray);
  }
  if (dataPools3 && data) {
    let poolArray = dataPools3[constants_1.PoolNames[data?.protocols[0]?.type]];
    if (snapshotVolume3) {
      if (Object.keys(snapshotVolume3)?.length > 0) {
        const copyPool = [...poolArray];
        poolArray = [];
        Object.keys(snapshotVolume3).forEach((x, idx) => {
          const copyElement = { ...copyPool[idx] };
          copyElement.dailySupplySideRevenueUSD =
            snapshotVolume3[x][snapshotVolume3[x].length - 1]?.dailySupplySideRevenueUSD;
          copyElement.dailyVolumeUSD = snapshotVolume3[x][snapshotVolume3[x].length - 1]?.dailyVolumeUSD;
          poolArray.push(copyElement);
        });
      }
    }
    if (poolOverviewTokens3) {
      if (Object.keys(poolOverviewTokens3).length > 0) {
        const copyPool = [...poolArray];
        poolArray = [];
        Object.keys(poolOverviewTokens3).forEach((x, idx) => {
          if (poolOverviewTokens3[x]) {
            const copyElement = { ...copyPool[idx] };
            copyElement[tokenKey] = poolOverviewTokens3[x][tokenKey];
            copyElement["rewardTokens"] = poolOverviewTokens3[x]["rewardTokens"];
            poolArray.push(copyElement);
          }
        });
      }
    }
    pools = pools.concat(poolArray);
  }
  if (dataPools4 && data) {
    let poolArray = dataPools4[constants_1.PoolNames[data?.protocols[0]?.type]];
    if (snapshotVolume4) {
      if (Object.keys(snapshotVolume4)?.length > 0) {
        const copyPool = [...poolArray];
        poolArray = [];
        Object.keys(snapshotVolume4).forEach((x, idx) => {
          const copyElement = { ...copyPool[idx] };
          copyElement.dailySupplySideRevenueUSD =
            snapshotVolume4[x][snapshotVolume4[x].length - 1]?.dailySupplySideRevenueUSD;
          copyElement.dailyVolumeUSD = snapshotVolume4[x][snapshotVolume4[x].length - 1]?.dailyVolumeUSD;
          poolArray.push(copyElement);
        });
      }
    }
    if (poolOverviewTokens4) {
      if (Object.keys(poolOverviewTokens4).length > 0) {
        const copyPool = [...poolArray];
        poolArray = [];
        Object.keys(poolOverviewTokens4).forEach((x, idx) => {
          if (poolOverviewTokens4[x]) {
            const copyElement = { ...copyPool[idx] };
            copyElement[tokenKey] = poolOverviewTokens4[x][tokenKey];
            copyElement["rewardTokens"] = poolOverviewTokens4[x]["rewardTokens"];
            poolArray.push(copyElement);
          }
        });
      }
    }
    pools = pools.concat(poolArray);
  }
  if (dataPools5 && data) {
    let poolArray = dataPools5[constants_1.PoolNames[data?.protocols[0]?.type]];
    if (snapshotVolume5) {
      if (Object.keys(snapshotVolume5)?.length > 0) {
        const copyPool = [...poolArray];
        poolArray = [];
        Object.keys(snapshotVolume5).forEach((x, idx) => {
          const copyElement = { ...copyPool[idx] };
          copyElement.dailySupplySideRevenueUSD =
            snapshotVolume5[x][snapshotVolume5[x].length - 1]?.dailySupplySideRevenueUSD;
          copyElement.dailyVolumeUSD = snapshotVolume5[x][snapshotVolume5[x].length - 1]?.dailyVolumeUSD;
          poolArray.push(copyElement);
        });
      }
    }
    if (poolOverviewTokens5) {
      if (Object.keys(poolOverviewTokens5).length > 0) {
        const copyPool = [...poolArray];
        poolArray = [];
        Object.keys(poolOverviewTokens5).forEach((x, idx) => {
          if (poolOverviewTokens5[x]) {
            const copyElement = { ...copyPool[idx] };
            copyElement[tokenKey] = poolOverviewTokens5[x][tokenKey];
            copyElement["rewardTokens"] = poolOverviewTokens5[x]["rewardTokens"];
            poolArray.push(copyElement);
          }
        });
      }
    }
    pools = pools.concat(poolArray);
  }
  if (pools?.length > 0) {
    let poolTemp = [...pools];
    pools = poolTemp.sort((a, b) => {
      return b.totalValueLockedUSD - a.totalValueLockedUSD;
    });
  }
  let anyPoolOverviewLoading = false;
  if (
    poolOverviewLoading ||
    poolOverviewLoading2 ||
    poolOverviewLoading3 ||
    poolOverviewLoading4 ||
    poolOverviewLoading5
  ) {
    anyPoolOverviewLoading = true;
  }
  let anyPoolOverviewError = null;
  if (poolOverviewError5) {
    anyPoolOverviewError = poolOverviewError5;
  }
  if (poolOverviewError4) {
    anyPoolOverviewError = poolOverviewError4;
  }
  if (poolOverviewError3) {
    anyPoolOverviewError = poolOverviewError3;
  }
  if (poolOverviewError2) {
    anyPoolOverviewError = poolOverviewError2;
  }
  if (poolOverviewError) {
    anyPoolOverviewError = poolOverviewError;
  }
  let toggleVersion = null;
  if (endpoints?.pending) {
    let pendingStyle = {
      color: "#20252c",
      backgroundColor: "white",
      padding: "8px 10px",
      borderRadius: "25px",
      margin: "4px 6px",
    };
    let currentStyle = {};
    if (isCurrentVersion) {
      pendingStyle = {};
      currentStyle = {
        color: "#20252c",
        backgroundColor: "white",
        padding: "8px 10px",
        borderRadius: "25px",
        margin: "4px 6px",
      };
    }
    let currentToggle = null;
    if (endpoints?.current) {
      currentToggle = (
        <span
          style={currentStyle}
          onClick={() => {
            const href = new URL(window.location.href);
            const p = new URLSearchParams(href.search);
            p.set("version", "current");
            p.set("endpoint", endpoints?.current);
            p.set("name", subgraphName);
            p.delete("view");
            p.delete("poolId");
            p.delete("protocolId");
            navigate("?" + p.toString().split("%2F").join("/"));
            setSubgraphToQuery({ url: endpoints?.current, version: "" });
            setIsCurrentVersion(true);
          }}
        >
          CURRENT VERSION
        </span>
      );
    }
    let pendingToggle = null;
    if (endpoints?.pending) {
      pendingToggle = (
        <span
          style={pendingStyle}
          onClick={() => {
            const href = new URL(window.location.href);
            const p = new URLSearchParams(href.search);
            p.set("version", "pending");
            p.set("endpoint", endpoints?.pending);
            p.set("name", subgraphName);
            p.delete("view");
            p.delete("poolId");
            p.delete("protocolId");
            navigate("?" + p.toString().split("%2F").join("/"));
            setSubgraphToQuery({ url: endpoints?.pending, version: "" });
            setIsCurrentVersion(false);
          }}
        >
          PENDING VERSION
        </span>
      );
    }
    toggleVersion = (
      <BackBanner>
        {currentToggle}
        {pendingToggle}
      </BackBanner>
    );
  }
  let overlayProtocolData = {
    financialsDailySnapshots: [],
    usageMetricsDailySnapshots: [],
    usageMetricsHourlySnapshots: [],
  };
  if (overlayFinancialsData && overlayDeploymentURL) {
    overlayProtocolData.financialsDailySnapshots = overlayFinancialsData.financialsDailySnapshots;
  }
  if (overlayDailyUsageData && overlayDeploymentURL) {
    overlayProtocolData.usageMetricsDailySnapshots = overlayDailyUsageData.usageMetricsDailySnapshots;
  }
  if (overlayHourlyUsageData && overlayDeploymentURL) {
    overlayProtocolData.usageMetricsHourlySnapshots = overlayHourlyUsageData.usageMetricsHourlySnapshots;
  }
  let overlayPoolDataToPass = {};
  if (overlayDeploymentURL && poolId) {
    if (typeof overlayPoolTimeseriesData === "object") {
      Object.keys(overlayPoolTimeseriesData).forEach((x) => (overlayPoolDataToPass[x] = overlayPoolTimeseriesData[x]));
    }
  }
  if (poolTimeseriesData) {
    Object.keys(poolTimeseriesData).forEach((x) => {
      if (!overlayPoolDataToPass[x]) {
        overlayPoolDataToPass[x] = [];
      }
    });
  }
  let protocolSchemaDataProp = protocolSchemaData;
  const brokenDownName = subgraphName.split("/")[1]?.split("-");
  const network = brokenDownName?.pop() || "";
  if (!protocolSchemaDataProp?.protocols[0]) {
    protocolSchemaDataProp = {
      protocols: [
        {
          type: "N/A",
          name: brokenDownName ? brokenDownName?.join(" ") : "",
          network: network.toUpperCase(),
          schemaVersion: "N/A",
          subgraphVersion: "N/A",
        },
      ],
    };
  }
  let overlaySchemaDataProp = overlaySchemaData;
  const overlayBrokenDownName = subgraphName.split("/")[1]?.split("-");
  const overlayNetwork = overlayBrokenDownName?.pop() || "";
  if (!overlaySchemaDataProp?.protocols[0]) {
    overlaySchemaDataProp = {
      protocols: [
        {
          type: "N/A",
          name: overlayBrokenDownName ? overlayBrokenDownName?.join(" ") : "",
          network: overlayNetwork.toUpperCase(),
          schemaVersion: "N/A",
          subgraphVersion: "N/A",
        },
      ],
    };
  }
  const indexingStatusKey = "indexingStatusFor" + (isCurrentVersion ? "CurrentVersion" : "PendingVersion");
  if (!errorDisplayProps && indexingFailureData) {
    const errMsg = indexingFailureData[indexingStatusKey]?.fatalError?.message;
    if (typeof errMsg === "string") {
      errorDisplayProps = new client_1.ApolloError({
        errorMessage: `SUBGRAPH DATA UNREACHABLE - ${subgraphToQuery.url}. INDEXING ERROR - "${errMsg}".`,
      });
    }
  }
  if (!!entityError) {
    errorDisplayProps = entityError;
  }
  if (data) {
    errorDisplayProps = null;
  }
  if (protocolTableError) {
    errorDisplayProps = protocolTableError;
  }
  if (overlayError) {
    errorDisplayProps = overlayError;
  }
  return (
    <div className="ProtocolDashboard">
      <DashboardHeader_1.DashboardHeader
        protocolData={protocolSchemaDataProp}
        protocolId={protocolId}
        subgraphToQueryURL={subgraphToQuery.url}
        schemaVersion={schemaVersion}
        versionsJSON={protocolJSON?.[protocolKey]?.deployments[depoKey]?.versions || {}}
      />
      {toggleVersion}
      {(protocolSchemaQueryLoading || loading) && !!subgraphToQuery.url ? (
        <material_1.CircularProgress sx={{ margin: 6 }} size={50} />
      ) : null}
      <ErrorDisplay_1.default
        errorObject={errorDisplayProps}
        protocolData={data}
        subgraphToQuery={subgraphToQuery}
        setSubgraphToQuery={(x) => setSubgraphToQuery(x)}
      />
      {!!data && (
        <AllDataTabs_1.default
          data={data}
          overlayData={overlayData}
          subgraphEndpoints={subgraphEndpoints}
          entitiesData={entitiesData}
          tabValue={tabValue}
          events={events}
          pools={pools}
          poolsListData={poolsListData}
          poolListLoading={poolListLoading}
          poolsListError={poolsListError}
          poolNames={constants_1.PoolNames[data.protocols[0].type]}
          poolId={poolId}
          poolData={poolData}
          decentralizedDeployments={decentralizedDeployments}
          protocolFields={protocolFields}
          protocolTableData={protocolTableData}
          overlaySchemaData={overlaySchemaDataProp}
          overlayError={overlayError}
          protocolSchemaData={protocolSchemaDataProp}
          subgraphToQueryURL={subgraphToQuery.url}
          skipAmt={skipAmt}
          poolOverviewRequest={{ poolOverviewError: anyPoolOverviewError, poolOverviewLoading: anyPoolOverviewLoading }}
          poolTimeseriesRequest={{ poolTimeseriesData, poolTimeseriesError, poolTimeseriesLoading }}
          overlayPoolTimeseriesData={overlayPoolDataToPass}
          overlayPoolTimeseriesLoading={overlayPoolTimeseriesLoading}
          positionsQuery={positionsQuery}
          protocolTimeseriesData={{
            financialsDailySnapshots: financialsData?.financialsDailySnapshots,
            usageMetricsDailySnapshots: dailyUsageData?.usageMetricsDailySnapshots,
            usageMetricsHourlySnapshots: hourlyUsageData?.usageMetricsHourlySnapshots,
          }}
          protocolTimeseriesLoading={{
            financialsDailySnapshots: financialsLoading,
            usageMetricsDailySnapshots: dailyUsageLoading,
            usageMetricsHourlySnapshots: hourlyUsageLoading,
          }}
          protocolTimeseriesError={{
            financialsDailySnapshots: financialsError,
            usageMetricsDailySnapshots: dailyUsageError,
            usageMetricsHourlySnapshots: hourlyUsageError,
          }}
          overlayProtocolTimeseriesData={overlayProtocolData}
          overlayDeploymentURL={overlayDeploymentURL}
          setPoolId={(x) => setPoolId(x)}
          handleTabChange={(x, y) => handleTabChange(x, y)}
          setProtocolId={(x) => setprotocolId(x)}
          paginate={(x) => paginate(x)}
          setOverlayDeploymentClient={(x) => setOverlayDeploymentClient(x)}
          setOverlayDeploymentURL={(x) => setOverlayDeploymentURL(x)}
        />
      )}
    </div>
  );
}
exports.default = ProtocolDashboard;
