"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const PoolDropDown_1 = require("../../common/utilComponents/PoolDropDown");
const constants_1 = require("../../constants");
const SchemaTable_1 = __importDefault(require("../SchemaTable"));
const IssuesDisplay_1 = __importDefault(require("../IssuesDisplay"));
const react_1 = require("react");
const CopyLinkToClipboard_1 = require("../../common/utilComponents/CopyLinkToClipboard");
const PoolTabEntity_1 = __importDefault(require("./PoolTabEntity"));
const BridgeOutboundVolumeLogic_1 = __importDefault(require("../../common/utilComponents/BridgeOutboundVolumeLogic"));
function PoolTab({
  data,
  overlayData,
  entitiesData,
  subgraphToQueryURL,
  protocolData,
  poolTimeseriesData,
  poolTimeseriesError,
  poolTimeseriesLoading,
  overlayPoolTimeseriesData,
  overlayPoolTimeseriesLoading,
  poolId,
  poolData,
  poolsList,
  poolNames,
  poolListLoading,
  poolsListError,
  setPoolId,
}) {
  const [issuesToDisplay, setIssuesToDisplay] = (0, react_1.useState)({});
  console.log("DATA", data);
  // Get the key name of the pool specific to the protocol type (singular and plural)
  const poolKeySingular = constants_1.PoolName[data.protocols[0].type];
  const poolKeyPlural = constants_1.PoolNames[data.protocols[0].type];
  let allLoaded = false;
  if (!poolTimeseriesLoading && (poolTimeseriesData || poolTimeseriesError)) {
    allLoaded = true;
  }
  let oneLoaded = false;
  Object.keys(poolTimeseriesLoading).forEach((entity) => {
    if (poolTimeseriesData[entity]) {
      oneLoaded = true;
    }
  });
  let issuesDisplayElement = null;
  const entityData = data[poolKeySingular];
  let poolDropDown = null;
  if (poolsList) {
    poolDropDown = (
      <PoolDropDown_1.PoolDropDown
        poolId={poolId}
        setPoolId={(x) => {
          setIssuesToDisplay({});
          setPoolId(x);
        }}
        pools={poolsList[poolNames]}
      />
    );
  } else if (poolListLoading || !poolId) {
    poolDropDown = <material_1.CircularProgress sx={{ margin: 6 }} size={50} />;
  }
  // Specific chart routing
  // This logic renders components that are specific to a given schema type or version
  const specificCharts = [];
  const specificChartsOnEntity = {};
  // structure entityName > { chartName: chartElement}
  const schemaType = data?.protocols[0]?.type;
  const schemaVersion = data?.protocols[0]?.version;
  if (schemaType?.toUpperCase() === "BRIDGE") {
    const headerComponent = (
      <material_1.Grid key={"Bridge Specific Charts"}>
        <material_1.Box sx={{ marginTop: "24px" }}>
          <CopyLinkToClipboard_1.CopyLinkToClipboard link={window.location.href} scrollId={"Bridge Specific Charts"}>
            <material_1.Typography variant="h4">{"Bridge Specific Charts"}</material_1.Typography>
          </CopyLinkToClipboard_1.CopyLinkToClipboard>
        </material_1.Box>
      </material_1.Grid>
    );
    if (data[poolKeySingular]?.routes?.length > 0) {
      specificCharts.push(
        headerComponent,
        <BridgeOutboundVolumeLogic_1.default
          poolId={poolId}
          routes={data[poolKeySingular]?.routes}
          subgraphToQueryURL={subgraphToQueryURL}
        />,
      );
    }
  } else if (schemaType?.toUpperCase() === "EXCHANGE") {
    if (poolTimeseriesData) {
      Object.keys(poolTimeseriesData).forEach((entityName) => {
        if (!specificChartsOnEntity[entityName]) {
          specificChartsOnEntity[entityName] = {};
        }
        const currentEntityData = poolTimeseriesData[entityName];
        const tokenWeightData = [];
        for (let x = currentEntityData.length - 1; x >= 0; x--) {
          const timeseriesInstance = currentEntityData[x];
          let dateVal = Number(timeseriesInstance["timestamp"]);
          constants_1.dateValueKeys.forEach((key) => {
            let factor = 86400;
            if (key.includes("hour")) {
              factor = factor / 24;
            }
            if (!!(Number(timeseriesInstance[key]) * factor)) {
              dateVal = Number(timeseriesInstance[key]) * factor;
            }
          });
          if (timeseriesInstance.inputTokenWeights) {
            timeseriesInstance.inputTokenWeights.forEach((weight, idx) => {
              if (idx > tokenWeightData.length - 1) {
                tokenWeightData.push([]);
              }
              tokenWeightData[idx].push({ value: Number(weight), date: dateVal });
            });
          }
          // For exchange protocols, calculate the baseYield
          let value = 0;
          if (Object.keys(data[poolKeySingular]?.fees)?.length > 0 && timeseriesInstance.totalValueLockedUSD) {
            const revenueUSD =
              Number(timeseriesInstance.dailySupplySideRevenueUSD) * 365 ||
              Number(timeseriesInstance.hourlySupplySideRevenueUSD) * 24 * 365;
            value = (revenueUSD / Number(timeseriesInstance.totalValueLockedUSD)) * 100;
            if (!value) {
              value = 0;
            }
          }
          if (!specificChartsOnEntity[entityName]["baseYield"]) {
            specificChartsOnEntity[entityName]["baseYield"] = [];
          } else {
            specificChartsOnEntity[entityName]["baseYield"].push({ value, date: dateVal });
          }
        }
        specificChartsOnEntity[entityName]["inputTokenWeights"] = tokenWeightData;
      });
    }
  } else if (schemaType?.toUpperCase() === "YIELD") {
    if (poolTimeseriesData) {
      Object.keys(poolTimeseriesData).forEach((entityName) => {
        if (!specificChartsOnEntity[entityName]) {
          specificChartsOnEntity[entityName] = {};
        }
        const currentEntityData = poolTimeseriesData[entityName];
        for (let x = currentEntityData.length - 1; x >= 0; x--) {
          const timeseriesInstance = currentEntityData[x];
          let dateVal = Number(timeseriesInstance["timestamp"]);
          constants_1.dateValueKeys.forEach((key) => {
            let factor = 86400;
            if (key.includes("hour")) {
              factor = factor / 24;
            }
            if (!!(Number(timeseriesInstance[key]) * factor)) {
              dateVal = Number(timeseriesInstance[key]) * factor;
            }
          });
          let value = 0;
          // For Yield Agg protocols, calculate the baseYield
          if (timeseriesInstance.totalValueLockedUSD && timeseriesInstance.dailySupplySideRevenueUSD) {
            value =
              Number(timeseriesInstance.dailySupplySideRevenueUSD / Number(timeseriesInstance.totalValueLockedUSD)) *
              365 *
              100;
          } else if (timeseriesInstance.totalValueLockedUSD && timeseriesInstance.hourlySupplySideRevenueUSD) {
            value =
              Number(timeseriesInstance.hourlySupplySideRevenueUSD / Number(timeseriesInstance.totalValueLockedUSD)) *
              365 *
              100;
          }
          if (!specificChartsOnEntity[entityName]["baseYield"]) {
            specificChartsOnEntity[entityName]["baseYield"] = [];
          } else {
            specificChartsOnEntity[entityName]["baseYield"].push({ value, date: dateVal });
          }
        }
      });
    }
  } else if (schemaType?.toUpperCase() === "LENDING") {
    if (poolTimeseriesData) {
      Object.keys(poolTimeseriesData).forEach((entityName) => {
        if (!specificChartsOnEntity[entityName]) {
          specificChartsOnEntity[entityName] = {};
        }
        const currentEntityData = poolTimeseriesData[entityName];
        const tableVals = [];
        const ratesChart = {};
        const ratesSums = {};
        data?.market?.rates?.forEach((rate) => {
          const rateKey = `${rate?.type || ""}-${rate?.side || ""}`;
          ratesChart[rateKey] = [];
          ratesSums[rateKey] = 0;
        });
        for (let x = currentEntityData.length - 1; x >= 0; x--) {
          const timeseriesInstance = currentEntityData[x];
          let dateVal = Number(timeseriesInstance["timestamp"]);
          constants_1.dateValueKeys.forEach((key) => {
            let factor = 86400;
            if (key.includes("hour")) {
              factor = factor / 24;
            }
            if (!!(Number(timeseriesInstance[key]) * factor)) {
              dateVal = Number(timeseriesInstance[key]) * factor;
            }
          });
          const initTableValue = { value: [], date: dateVal };
          timeseriesInstance["rates"].forEach((rateElement, idx) => {
            const rateKey = `${rateElement.type || ""}-${rateElement.side || ""}`;
            initTableValue.value.push(`[${idx}]: ${Number(rateElement.rate).toFixed(3)}%`);
            ratesSums[rateKey] += Number(rateElement.rate);
            ratesChart[rateKey].push({ value: Number(rateElement.rate), date: dateVal });
          });
          tableVals.push({ value: initTableValue.value.join(", "), date: initTableValue.date });
        }
        const issues = Object.keys(ratesSums)?.filter((rateLabel) => ratesSums[rateLabel] === 0);
        specificChartsOnEntity[entityName]["rates"] = {
          dataChart: ratesChart,
          tableData: tableVals,
          issues: issues.map((iss) => entityName + "-" + iss),
        };
      });
    }
  }
  let poolDataSection = null;
  let poolTable = null;
  if (poolId) {
    const issuesArrayProps = Object.values(issuesToDisplay);
    issuesDisplayElement = (
      <IssuesDisplay_1.default issuesArrayProps={issuesArrayProps} allLoaded={allLoaded} oneLoaded={oneLoaded} />
    );
    if (poolData) {
      poolTable = (
        <SchemaTable_1.default
          key="SchemaTable"
          entityData={entityData}
          schemaName={poolKeySingular}
          protocolType={data.protocols[0].type}
          dataFields={poolData}
          setIssues={(issArr) => {
            const issuesToAdd = {};
            issArr.forEach((issObj) => {
              issuesToAdd[issObj.fieldName + issObj.type] = issObj;
            });
            if (Object.keys(issuesToAdd).length > 0) {
              setIssuesToDisplay((prevState) => {
                return { ...prevState, ...issuesToAdd };
              });
            }
          }}
        />
      );
    }
    let activeMessage = null;
    if (data.protocols[0].type === "LENDING") {
      activeMessage = (
        <material_1.Typography sx={{ color: "lime", my: 3 }} variant="h5">
          This Market is active.
        </material_1.Typography>
      );
      if (!entityData?.isActive) {
        activeMessage = (
          <material_1.Typography sx={{ color: "red", my: 3 }} variant="h5">
            This Market is <b>NOT</b> active.
          </material_1.Typography>
        );
      }
    }
    if (poolTimeseriesData) {
      const poolEntityElements = Object.keys(poolTimeseriesData).map((entityName) => {
        let entitySpecificElements = {};
        if (specificChartsOnEntity[entityName]) {
          entitySpecificElements = specificChartsOnEntity[entityName];
        }
        return (
          <PoolTabEntity_1.default
            key={"poolTabEntity-" + entityName}
            data={data}
            overlayData={overlayData}
            currentEntityData={poolTimeseriesData[entityName]}
            entitySpecificElements={entitySpecificElements}
            overlayPoolTimeseriesData={overlayPoolTimeseriesData[entityName]}
            overlayPoolTimeseriesLoading={overlayPoolTimeseriesLoading}
            entityName={entityName}
            entitiesData={entitiesData}
            poolId={poolId}
            protocolData={protocolData}
            setIssues={(issArr) => {
              const issuesToAdd = {};
              issArr.forEach((issObj) => {
                issuesToAdd[issObj.fieldName + issObj.type] = issObj;
              });
              if (Object.keys(issuesToAdd).length > 0) {
                setIssuesToDisplay((prevState) => {
                  return { ...prevState, ...issuesToAdd };
                });
              }
            }}
          />
        );
      });
      poolDataSection = (
        <div>
          {poolTable}
          {activeMessage}
          {poolEntityElements}
        </div>
      );
    } else if (!poolTimeseriesData && !poolTimeseriesError) {
      poolDataSection = (
        <div>
          {poolTable}
          <material_1.CircularProgress sx={{ margin: 6 }} size={50} />
        </div>
      );
    } else if (poolTimeseriesError) {
      poolDataSection = (
        <material_1.Grid key={"poolTabEntityError"}>
          <h3>Query Could not Return Successfully - {poolTimeseriesError?.message}</h3>
        </material_1.Grid>
      );
    } else {
      poolDataSection = (
        <div>
          {poolTable}
          <material_1.Grid>
            <material_1.Box my={3}>
              <CopyLinkToClipboard_1.CopyLinkToClipboard link={window.location.href}>
                <material_1.Typography variant="h4">
                  Hold on! This subgraph has alot of entities, it may take a minute for the query to return. Try
                  reloading.
                </material_1.Typography>
              </CopyLinkToClipboard_1.CopyLinkToClipboard>
            </material_1.Box>
            <material_1.CircularProgress sx={{ margin: 6 }} size={50} />
          </material_1.Grid>
        </div>
      );
    }
  }
  return (
    <>
      {issuesDisplayElement}
      {poolDropDown}
      {poolDataSection}
      {specificCharts}
    </>
  );
}
exports.default = PoolTab;
