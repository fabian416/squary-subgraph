"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const IssuesDisplay_1 = __importDefault(require("./IssuesDisplay"));
// The error display function takes the error object passed in and creates the elements/messages to be rendered
function ErrorDisplay({ errorObject, setSubgraphToQuery, protocolData, subgraphToQuery: { url, version } }) {
  const [searchParams] = (0, react_router_dom_1.useSearchParams)();
  if (!errorObject) {
    return null;
  }
  try {
    let protocolSchemaData = {};
    const protocolEntityName = constants_1.ProtocolTypeEntityName[protocolData?.protocols[0]?.type];
    const protocolEntityNames = constants_1.ProtocolTypeEntityNames[protocolData?.protocols[0]?.type];
    if (protocolData) {
      protocolSchemaData = protocolData[protocolEntityName];
      if (!protocolSchemaData) {
        protocolSchemaData = protocolData[protocolEntityNames]?.[0];
      }
    }
    const schemaType = protocolSchemaData?.type || "";
    const subgraphParam = searchParams.get("subgraph");
    const errorMsgs = [];
    let errorTotalCount = 0;
    let errorDisplayCount = 0;
    if (errorObject.networkError) {
      errorTotalCount += 1;
      errorDisplayCount += 1;
      errorMsgs.push(<li>NetworkError - Queried URL {url} - Try reloading</li>);
    }
    if (errorObject.graphQLErrors.length > 0) {
      errorTotalCount += errorObject.graphQLErrors.length;
      for (let x = 0; x < 7; x++) {
        if (!errorObject.graphQLErrors[x]) {
          break;
        }
        errorDisplayCount += 1;
        errorMsgs.push(<li> {errorObject.graphQLErrors[x].message}</li>);
      }
      if (errorObject.graphQLErrors.length <= 5) {
        errorMsgs.push(
          <h3>
            Required schema fields are missing from this subgraph. Verify that your schema has all of the fields that
            are in the common {schemaType} {protocolSchemaData?.version} schema.
          </h3>,
        );
      } else {
        // If there are more than 5 query errors, it is possible the schemaVersion on the protocol entity was not updated. Allow the user to select querying on a different schema version
        const versionsOnType = constants_1.listSchemaVersionsByType[schemaType];
        errorMsgs.push(
          <>
            <h2>
              Queried {schemaType} schema version {protocolSchemaData?.schemaVersion} - Select a different schema to
              query below:
            </h2>
            {versionsOnType.map((version) => {
              if (version === protocolSchemaData?.schemaVersion) {
                return null;
              }
              return (
                <material_1.Button onClick={() => setSubgraphToQuery({ url: url, version: version })}>
                  Schema {version}
                </material_1.Button>
              );
            })}
          </>,
        );
      }
    } else if (errorObject.message) {
      if (errorObject.message === "indexing_error") {
        let subgraphName = subgraphParam || "";
        const parseCheck = (0, utils_1.isValidHttpUrl)(subgraphName);
        if (parseCheck) {
          subgraphName = subgraphName?.split("name/")[1];
        }
      }
      const errorMessagesSplit = errorObject.message.split("---");
      errorMessagesSplit.forEach((msg) => {
        errorTotalCount += 1;
        errorDisplayCount += 1;
        errorMsgs.push(<li>{msg}</li>);
      });
      const errorsToRender = errorMessagesSplit.map((msg) => {
        return { message: msg, type: "DEPLOY", level: "critical", fieldName: "" };
      });
      return <IssuesDisplay_1.default issuesArrayProps={errorsToRender} allLoaded={true} oneLoaded={true} />;
    }
    if (errorMsgs.length >= 1) {
      return (
        <div style={{ margin: "4px 24px", border: "red 3px solid", paddingTop: "6px" }}>
          <h3>
            DISPLAYING {errorDisplayCount} OUT OF {errorTotalCount} ERRORS.
          </h3>
          <ol>{errorMsgs}</ol>
        </div>
      );
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
}
exports.default = ErrorDisplay;
