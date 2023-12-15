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
exports.ProtocolDropDown = void 0;
const material_1 = require("@mui/material");
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const ComboBoxInput_1 = require("./ComboBoxInput");
const ProtocolDropDown = ({ setProtocolId, protocols }) => {
  const href = new URL(window.location.href);
  const p = new URLSearchParams(href.search);
  const protocolId = p.get("protocolId");
  const navigate = (0, react_router_dom_1.useNavigate)();
  // Create the array of protocol selections in the drop down
  const options = protocols.map((pro) => {
    return pro.id + " / " + pro.name;
  });
  // Get the array entry for the current selected protocol
  const protocol = protocols.find((m) => m.id === protocolId) || { name: "Selected Protocol" };
  let inputTextValue = "Select a protocol";
  if (protocolId) {
    inputTextValue = protocolId + " / " + protocol.name;
  }
  const [textInput, setTextInput] = (0, react_1.useState)(inputTextValue);
  return (
    <>
      <material_1.Typography variant="h6">Select a protocol</material_1.Typography>
      <material_1.Autocomplete
        options={options}
        inputValue={textInput}
        sx={{ maxWidth: 1000, my: 2 }}
        onChange={(event) => {
          // Upon selecting a protocol from the list, get the protocol id and navigate to the routing for that protocol
          const targEle = event?.target;
          setTextInput(targEle.innerText);
          p.delete("view");
          p.delete("poolId");
          if (targEle.innerText) {
            p.set("protocolId", targEle.innerText?.split(" / ")[0]);
            setProtocolId(targEle.innerText?.split(" / ")[0]);
            navigate("?" + p.toString().split("%2F").join("/"));
          }
        }}
        renderInput={(params) => (
          <ComboBoxInput_1.ComboBoxInput label="Protocol List" params={params} setTextInput={setTextInput} />
        )}
      />
    </>
  );
};
exports.ProtocolDropDown = ProtocolDropDown;
