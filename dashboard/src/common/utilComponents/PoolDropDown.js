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
exports.PoolDropDown = void 0;
const material_1 = require("@mui/material");
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const ComboBoxInput_1 = require("./ComboBoxInput");
/**
 * simple check if a string might be an address. Does not verify that the address is a valid pool address.
 * In the future, we can try a query to liquidityPools to validate the address exists for the protocol
 *
 * @param input user input in the dropdown
 * @returns
 */
const isAddress = (input) => {
  return (input.startsWith("0x") && input.length === 42) || input.includes(".near");
};
const PoolDropDown = ({ poolId, setPoolId, pools }) => {
  const navigate = (0, react_router_dom_1.useNavigate)();
  // Create the array of pool selections in the drop down
  const options = pools.map((market) => {
    return market.id + " / " + market.name;
  });
  // Get the array entry for the current selected pool
  const pool = pools.find((m) => m.id === poolId) || { name: "Selected Pool" };
  let inputTextValue = "Select a pool";
  if (poolId) {
    inputTextValue = poolId + " / " + pool.name;
  }
  const [textInput, setTextInput] = (0, react_1.useState)(inputTextValue);
  return (
    <>
      <material_1.Typography variant="h6">Select a pool</material_1.Typography>
      <material_1.Typography>Search from the top 100 pools by TVL or filter by any pool address.</material_1.Typography>
      <material_1.Typography>
        NOTE: we do not currently validate that the address is an existing pool
      </material_1.Typography>
      <material_1.Autocomplete
        options={isAddress(textInput) ? [textInput] : options}
        inputValue={textInput}
        sx={{ maxWidth: 1000, my: 2 }}
        onChange={(event) => {
          // Upon selecting a pool from the list, get the pool id and navigate to the routing for that pool
          const href = new URL(window.location.href);
          const p = new URLSearchParams(href.search);
          const targEle = event?.target;
          setTextInput(targEle.innerText);
          p.delete("view");
          if (targEle.innerText) {
            p.set("poolId", targEle.innerText?.split(" / ")[0]);
            setPoolId(targEle.innerText?.split(" / ")[0]);
            navigate("?" + p.toString().split("%2F").join("/"));
          }
        }}
        renderInput={(params) => (
          <ComboBoxInput_1.ComboBoxInput label="PoolList" params={params} setTextInput={setTextInput} />
        )}
      />
    </>
  );
};
exports.PoolDropDown = PoolDropDown;
