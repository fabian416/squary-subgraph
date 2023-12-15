"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const styled_1 = require("../../styled");
const material_1 = require("@mui/material");
const CopyLinkToClipboard_1 = require("../utilComponents/CopyLinkToClipboard");
const ProtocolContainer = (0, styled_1.styled)("div")`
  background: rgba(32, 37, 44, 1);
  padding: ${({ theme }) => theme.spacing(2, 3, 3, 3)};
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;
const ChipContainer = (0, styled_1.styled)("div")`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;
// This component is for each individual subgraph
function ProtocolInfo({ protocolData, protocolId, subgraphToQueryURL, schemaVersion, versionsJSON }) {
  let protocolSchemaData = protocolData.protocols[0];
  const subgraphNameString = subgraphToQueryURL.split("name/")[1];
  const href = new URL(window.location.href);
  const p = new URLSearchParams(href.search);
  const versionParam = p.get("version");
  const nameParam = p.get("name");
  let link = "";
  if (subgraphNameString || nameParam) {
    link = process.env.REACT_APP_GRAPH_HOSTEDSERVICE_URL + "/subgraph/" + (subgraphNameString || nameParam);
    if (versionParam === "pending") {
      link += "?version=pending";
    }
  } else if (subgraphToQueryURL.includes(process.env.REACT_APP_GRAPH_DECEN_URL)) {
    const subId = subgraphToQueryURL.split("id/")[1];
    link = `${process.env.REACT_APP_GRAPH_EXPLORER_URL}/subgraph?id=${subId}&view=Overview&chain=arbitrum-one`;
  } else {
    link = subgraphToQueryURL;
  }
  if (protocolData.protocols?.length > 1) {
    const findProto = protocolData.protocols?.find((pro) => pro?.id === protocolId);
    if (findProto) {
      protocolSchemaData = findProto;
    }
  }
  let methodologyAlert = null;
  if (
    !!versionsJSON?.methodology &&
    !!protocolData?.protocols?.[0]?.methodologyVersion &&
    versionsJSON?.methodology !== protocolData?.protocols?.[0]?.methodologyVersion
  ) {
    methodologyAlert = (
      <span style={{ display: "inline-flex", alignItems: "center", padding: "0px 0px 0px 10px", fontSize: "10px" }}>
        <material_1.Tooltip
          title={`The methodology version in the deployment JSON (${versionsJSON?.methodology}) is different than the methodology version in the protocol entity (${protocolData?.protocols?.[0]?.methodologyVersion})`}
          placement="top"
        >
          <span
            style={{
              padding: "4px 8px 2px 7px",
              borderRadius: "50%",
              backgroundColor: "#EFCB68",
              cursor: "default",
              fontWeight: "800",
            }}
          >
            !
          </span>
        </material_1.Tooltip>
      </span>
    );
  }
  let schemaAlert = null;
  if (
    !!versionsJSON?.schema &&
    !!protocolData?.protocols?.[0]?.schemaVersion &&
    versionsJSON?.schema !== protocolData?.protocols?.[0]?.schemaVersion
  ) {
    schemaAlert = (
      <span style={{ display: "inline-flex", alignItems: "center", padding: "0px 0px 0px 10px", fontSize: "10px" }}>
        <material_1.Tooltip
          title={`The schema version in the deployment JSON (${versionsJSON?.schema}) is different than the schema version in the protocol entity (${protocolData?.protocols?.[0]?.schemaVersion})`}
          placement="top"
        >
          <span
            style={{
              padding: "4px 8px 2px 7px",
              borderRadius: "50%",
              backgroundColor: "#EFCB68",
              cursor: "default",
              fontWeight: "800",
            }}
          >
            !
          </span>
        </material_1.Tooltip>
      </span>
    );
  }
  let subgraphAlert = null;
  // Possibility of alert not showing when both are not equal?
  if (
    !!versionsJSON?.subgraph &&
    !!protocolData?.protocols?.[0]?.subgraphVersion &&
    versionsJSON?.subgraph !== protocolData?.protocols?.[0]?.subgraphVersion
  ) {
    subgraphAlert = (
      <span style={{ display: "inline-flex", alignItems: "center", padding: "0px 0px 0px 10px", fontSize: "10px" }}>
        <material_1.Tooltip
          title={`The subgraph version in the deployment JSON (${versionsJSON?.subgraph}) is different than the subgraph version in the protocol entity (${protocolData?.protocols?.[0]?.subgraphVersion})`}
          placement="top"
        >
          <span
            style={{
              padding: "4px 8px 2px 7px",
              borderRadius: "50%",
              backgroundColor: "#EFCB68",
              cursor: "default",
              fontWeight: "800",
            }}
          >
            !
          </span>
        </material_1.Tooltip>
      </span>
    );
  }
  return (
    <ProtocolContainer>
      <material_1.Box>
        <material_1.Link href={link} target="_blank">
          <material_1.Typography variant="h6">
            <span>{protocolSchemaData?.name} - </span>
            <material_1.Typography variant="body1" component="span">
              {protocolSchemaData?.network}
              {subgraphToQueryURL.includes(process.env.REACT_APP_GRAPH_DECEN_URL) ? " (DECENTRALIZED NETWORK)" : ""}
            </material_1.Typography>
          </material_1.Typography>
        </material_1.Link>
        <material_1.Typography variant="caption">{protocolSchemaData?.id}</material_1.Typography>
        <ChipContainer>
          {protocolSchemaData?.type && <material_1.Chip label={<span>Type: {protocolSchemaData?.type}</span>} />}
          {schemaVersion && (
            <material_1.Chip
              label={
                <span>
                  Schema: {schemaVersion}
                  {schemaAlert}
                </span>
              }
            />
          )}
          {protocolSchemaData?.subgraphVersion && !protocolSchemaData?.subgraphVersion.includes("N/A") ? (
            <material_1.Chip
              label={
                <span>
                  Subgraph: {protocolSchemaData?.subgraphVersion}
                  {subgraphAlert}
                </span>
              }
            />
          ) : null}
          {protocolSchemaData?.methodologyVersion && (
            <material_1.Chip
              label={
                <span>
                  Methodology: {protocolSchemaData?.methodologyVersion}
                  {methodologyAlert}
                </span>
              }
            />
          )}
        </ChipContainer>
      </material_1.Box>
      <CopyLinkToClipboard_1.CopyLinkToClipboard link={window.location.href} />
    </ProtocolContainer>
  );
}
exports.default = ProtocolInfo;
