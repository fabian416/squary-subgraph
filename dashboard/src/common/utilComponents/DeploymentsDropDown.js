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
exports.DeploymentsDropDown = void 0;
const material_1 = require("@mui/material");
const react_1 = __importStar(require("react"));
const react_router_1 = require("react-router");
const ComboBoxInput_1 = require("./ComboBoxInput");
const DeploymentsDropDown = ({
  setDeploymentURL,
  setDefiLlamaSlug,
  setIssues,
  issuesProps,
  deploymentURL,
  deploymentJSON,
}) => {
  const navigate = (0, react_router_1.useNavigate)();
  //   array of objects containing label and subgraph url
  const href = new URL(window.location.href);
  const p = new URLSearchParams(href.search);
  const protocolStr = p.get("defillamaprotocol");
  const networkStr = p.get("defillamanetwork");
  const selectionsSet = [];
  Object.entries(deploymentJSON).forEach(([protocolName, protocolValue]) => {
    if (protocolValue.slug.length > 0) {
      protocolValue.defiLlamaNetworks.forEach((networkName) => {
        if (protocolValue.subgraphNetworks[networkName]) {
          selectionsSet.push({
            label: protocolName.split("-").join(" ") + " (" + networkName + ")",
            value: protocolValue.slug + " (" + networkName + ")",
            url: protocolValue.subgraphNetworks[networkName],
          });
        }
      });
    }
  });
  let inputTextValue = "Select a protocol";
  if (deploymentURL) {
    const selectionsSetVal = selectionsSet.find((x) => x.url === deploymentURL);
    if (selectionsSetVal?.label) {
      inputTextValue = selectionsSetVal.label;
    }
  }
  const [textInput, setTextInput] = (0, react_1.useState)(inputTextValue);
  if (protocolStr && !deploymentURL) {
    const selection = selectionsSet.find(
      (protocol) => protocol.label.includes(protocolStr.split("-").join(" ")) && protocol.label.includes(networkStr),
    );
    if (selection) {
      if (textInput === "Select a protocol") {
        setTextInput(selection.label);
      }
      setDefiLlamaSlug(selection.value);
      setDeploymentURL(selection.url);
    } else if (!(issuesProps.filter((x) => x.type === "QRY").length > 0) && selectionsSet.length > 0) {
      setIssues([
        {
          message: `"defillamaprotocol=${protocolStr}"//"defillamanetwork=${networkStr}"`,
          type: "QRY",
          level: "critical",
          fieldName: deploymentURL,
        },
      ]);
    }
  }
  return (
    <>
      <material_1.Typography variant="h6">
        Select a protocol to compare data between Defi Llama and Messari subgraphs
      </material_1.Typography>
      <material_1.Autocomplete
        options={selectionsSet.map((x) => x.label)}
        value={textInput}
        inputValue={textInput}
        sx={{ maxWidth: 1000, my: 2 }}
        onChange={(event) => {
          // Upon selecting a protocol from the list, get the protocol id and navigate to the routing for that protocol
          const targEle = event?.target;
          const subgraphObj = selectionsSet.find((x) => x.label === targEle.innerText);
          if (targEle.innerText && subgraphObj) {
            p.set("defillamaprotocol", targEle.innerText?.split(" (")[0].split(" ").join("-"));
            p.set("defillamanetwork", targEle.innerText?.split(" (")[1].split(")")[0]);
            navigate("?" + p.toString().split("%2F").join("/"));
            setTextInput(targEle.innerText);
            setDefiLlamaSlug(subgraphObj.value);
            setDeploymentURL(subgraphObj.url);
          }
          // find the obj in selectionSet with the label = to selected input label, set the url value of that depo as the depo url
        }}
        renderInput={(params) => (
          <ComboBoxInput_1.ComboBoxInput label="Protocols List" params={params} setTextInput={(x) => setTextInput(x)} />
        )}
      />
    </>
  );
};
exports.DeploymentsDropDown = DeploymentsDropDown;
