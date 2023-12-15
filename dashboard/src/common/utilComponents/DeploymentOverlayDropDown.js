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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentOverlayDropDown = void 0;
const material_1 = require("@mui/material");
const react_1 = __importStar(require("react"));
const utils_1 = require("../../utils");
const ComboBoxInput_1 = require("./ComboBoxInput");
const DeploymentOverlayDropDown = ({
  data,
  subgraphEndpoints,
  setDeploymentURL,
  currentDeploymentURL,
  pendingSubgraphData,
  decentralizedDeployments,
  showDropDown,
  failedToLoad,
}) => {
  let currentDeploymentLabel = currentDeploymentURL;
  let deploymentsList = [];
  let componentRenderOverwrite = undefined;
  try {
    let protocolObj = null;
    let protocolObjKey = Object.keys(subgraphEndpoints[utils_1.schemaMapping[data.protocols[0].type]]).find((x) =>
      x.includes(data.protocols[0].slug),
    );
    if (protocolObjKey) {
      protocolObj = subgraphEndpoints[utils_1.schemaMapping[data.protocols[0].type]][protocolObjKey];
    } else {
      protocolObjKey = Object.keys(subgraphEndpoints[utils_1.schemaMapping[data.protocols[0].type]]).find((x) =>
        x.includes(data.protocols[0].slug.split("-")[0]),
      );
      if (protocolObjKey) {
        protocolObj = subgraphEndpoints[utils_1.schemaMapping[data.protocols[0].type]][protocolObjKey];
      }
    }
    if (protocolObj) {
      if (decentralizedDeployments[data.protocols[0].slug]) {
        decentralizedDeployments[data.protocols[0].slug].forEach((item) => {
          if (item.signalledTokens > 0) {
            protocolObj[item.network + " (DECENTRALIZED)"] =
              process.env.REACT_APP_GRAPH_DECEN_URL +
              "/api/" +
              process.env.REACT_APP_GRAPH_API_KEY +
              "/subgraphs/id/" +
              item.subgraphId;
          }
        });
      }
      if (pendingSubgraphData) {
        if (Object.keys(pendingSubgraphData).length > 0) {
          Object.keys(pendingSubgraphData).forEach((depoKey) => {
            protocolObj[depoKey + " (PENDING)"] =
              process.env.REACT_APP_GRAPH_BASE_URL + "/subgraphs/id/" + pendingSubgraphData[depoKey].subgraph;
          });
        }
      }
      deploymentsList = Object.keys(protocolObj).map((chain) => {
        return data.protocols[0].name + " " + chain + " " + protocolObj[chain];
      });
      deploymentsList.unshift("NONE (CLEAR)");
      currentDeploymentLabel = deploymentsList.find((x) => x.includes(currentDeploymentURL)) || currentDeploymentURL;
    }
  } catch (err) {
    componentRenderOverwrite = null;
    console.log(err);
  }
  const [textInput, setTextInput] = (0, react_1.useState)(currentDeploymentLabel);
  if (componentRenderOverwrite === null) {
    return null;
  }
  if (failedToLoad) {
    return null;
  }
  if (!showDropDown) {
    return <material_1.CircularProgress size={20} sx={{ mx: 2 }} />;
  }
  return (
    <>
      <material_1.Autocomplete
        options={(0, utils_1.isValidHttpUrl)(textInput) ? [textInput] : deploymentsList}
        value={currentDeploymentLabel}
        sx={{ width: 400, height: "40px", padding: "0" }}
        size="small"
        onChange={(event) => {
          const targEle = event?.target;
          const deploymentSelected = deploymentsList.find((x) => {
            return x.trim() === targEle.innerText.trim();
          });
          if (deploymentSelected === "NONE (CLEAR)") {
            setDeploymentURL("");
          } else if (deploymentSelected) {
            setDeploymentURL("http" + deploymentSelected.split("http")[1]);
          } else if ((0, utils_1.isValidHttpUrl)(textInput)) {
            setDeploymentURL(textInput);
          }
        }}
        renderInput={(params) => (
          <ComboBoxInput_1.ComboBoxInput
            style={{ width: 400, height: "40px", padding: "0" }}
            label="Select Deployment To Overlay"
            params={params}
            setTextInput={setTextInput}
          />
        )}
      />
    </>
  );
};
exports.DeploymentOverlayDropDown = DeploymentOverlayDropDown;
