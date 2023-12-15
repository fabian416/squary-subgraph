"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const react_1 = require("react");
const constants_1 = require("../../constants");
const SchemaTable_1 = __importDefault(require("../SchemaTable"));
const IssuesDisplay_1 = __importDefault(require("../IssuesDisplay"));
const ProtocolTabEntity_1 = __importDefault(require("./ProtocolTabEntity"));
const CopyLinkToClipboard_1 = require("../../common/utilComponents/CopyLinkToClipboard");
// This component is for each individual subgraph
function ProtocolTab({
  entitiesData,
  protocolType,
  protocolFields,
  subgraphEndpoints,
  protocolTableData,
  overlaySchemaData,
  protocolSchemaData,
  protocolTimeseriesData,
  protocolTimeseriesLoading,
  protocolTimeseriesError,
  overlayProtocolTimeseriesData,
}) {
  const [issuesToDisplay, setIssuesToDisplay] = (0, react_1.useState)({});
  const protocolEntityNameSingular = constants_1.ProtocolTypeEntityName[protocolType];
  let protocolDataRender = [];
  const specificCharts = [];
  const specificChartsOnEntity = {};
  if (protocolTimeseriesData) {
    protocolDataRender = Object.keys(protocolTimeseriesData).map((entityName, index) => {
      const currentEntityData = protocolTimeseriesData[entityName];
      if (!specificChartsOnEntity[entityName]) {
        specificChartsOnEntity[entityName] = {};
      }
      // Specific chart routing
      // This logic renders components that are specific to a given schema type or version
      const currentOverlayEntityData = overlayProtocolTimeseriesData[entityName];
      let entitySpecificElements = {};
      if (specificChartsOnEntity[entityName]) {
        entitySpecificElements = specificChartsOnEntity[entityName];
      }
      const prevEntityName = Object.keys(protocolTimeseriesData)[index - 1];
      if (protocolTimeseriesLoading[entityName] || protocolTimeseriesLoading[prevEntityName]) {
        return (
          <material_1.Grid key={entityName}>
            <material_1.Box my={3}>
              <CopyLinkToClipboard_1.CopyLinkToClipboard link={window.location.href} scrollId={entityName}>
                <material_1.Typography variant="h4" id={entityName}>
                  {entityName}
                </material_1.Typography>
              </CopyLinkToClipboard_1.CopyLinkToClipboard>
            </material_1.Box>
            <material_1.CircularProgress sx={{ margin: 6 }} size={50} />
          </material_1.Grid>
        );
      }
      if (!currentEntityData && !protocolTimeseriesError[entityName] && protocolTimeseriesError[prevEntityName]) {
        return (
          <material_1.Grid key={entityName}>
            <material_1.Box my={3}>
              <CopyLinkToClipboard_1.CopyLinkToClipboard link={window.location.href} scrollId={entityName}>
                <material_1.Typography variant="h4" id={entityName}>
                  {entityName}
                </material_1.Typography>
              </CopyLinkToClipboard_1.CopyLinkToClipboard>
            </material_1.Box>
            <h3>{entityName} timeseries query could not trigger</h3>
          </material_1.Grid>
        );
      }
      return (
        <ProtocolTabEntity_1.default
          key={entityName + "-ProtocolTabEntity"}
          entityName={entityName}
          entitiesData={entitiesData}
          subgraphEndpoints={subgraphEndpoints}
          currentEntityData={currentEntityData}
          overlaySchemaData={overlaySchemaData}
          entitySpecificElements={entitySpecificElements}
          protocolSchemaData={protocolSchemaData}
          currentOverlayEntityData={currentOverlayEntityData}
          currentTimeseriesLoading={protocolTimeseriesLoading[entityName]}
          currentTimeseriesError={protocolTimeseriesError[entityName]}
          protocolType={protocolType}
          protocolTableData={protocolTableData[protocolEntityNameSingular]}
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
  }
  let allLoaded = true;
  Object.keys(protocolTimeseriesLoading).forEach((entity) => {
    if (protocolTimeseriesLoading[entity]) {
      allLoaded = false;
    }
  });
  let oneLoaded = false;
  Object.keys(protocolTimeseriesLoading).forEach((entity) => {
    if (!protocolTimeseriesLoading[entity] && protocolTimeseriesData[entity]) {
      oneLoaded = true;
    }
  });
  if (!protocolTableData) {
    return <material_1.CircularProgress sx={{ margin: 6 }} size={50} />;
  }
  const issuesArrayProps = Object.values(issuesToDisplay);
  return (
    <>
      <IssuesDisplay_1.default issuesArrayProps={issuesArrayProps} oneLoaded={oneLoaded} allLoaded={allLoaded} />
      <SchemaTable_1.default
        entityData={protocolTableData[protocolEntityNameSingular]}
        protocolType={protocolType}
        dataFields={protocolFields}
        schemaName={protocolEntityNameSingular}
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
      {protocolDataRender}
      {specificCharts}
    </>
  );
}
exports.default = ProtocolTab;
