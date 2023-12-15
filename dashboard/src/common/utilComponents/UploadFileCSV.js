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
exports.UploadFileCSV = void 0;
const material_1 = require("@mui/material");
const react_1 = __importStar(require("react"));
const utils_1 = require("../../utils");
const UploadFileCSV = ({ csvJSON, csvMetaData, setCsvJSON, setCsvMetaData, field, style, isEntityLevel }) => {
  let classStr =
    "MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButtonBase-root  css-1huqmjz-MuiButtonBase-root-MuiButton-root";
  let labelStyle = {
    margin: "1.5px 0 0 0",
    padding: "6px 8px 5px 8px",
    borderRadius: 0,
    border: "1px rgb(102,86,248) solid",
  };
  if (isEntityLevel) {
    labelStyle = {
      display: "block",
      textAlign: "left",
      color: "white",
      margin: "1.5px 0 0 0",
      padding: "6px 8px 5px 0",
      borderRadius: 0,
    };
  }
  const [file, setFile] = (0, react_1.useState)();
  const fileReader = new FileReader();
  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
  };
  (0, react_1.useEffect)(() => {
    try {
      if (file) {
        fileReader.onload = function (event) {
          const text = event?.target?.result || "";
          if (typeof text === "string") {
            const json = (0, utils_1.csvToJSONConvertor)(text, isEntityLevel);
            if (json instanceof Error) {
              setCsvMetaData({ ...csvMetaData, columnName: "", csvError: json });
              return;
            }
            setCsvJSON(json);
            setCsvMetaData({ fileName: file.name, columnName: "", csvError: null });
          }
        };
        fileReader.readAsText(file);
      }
    } catch (err) {
      console.error(err.message);
      setCsvMetaData({ fileName: "", columnName: "", csvError: err?.message });
    }
  }, [file]);
  if (csvMetaData?.csvError) {
    return (
      <material_1.Tooltip
        title={csvMetaData.csvError + " Click this button to remove the CSV data and this error."}
        placement="top"
      >
        <div className={classStr} style={{ ...style, textAlign: "center" }}>
          <material_1.Button
            style={{
              margin: "1.5px 0 0 0",
              padding: "6px 8px 5px 8px",
              borderRadius: "0",
              border: "1px red solid",
              backgroundColor: "red",
              color: "white",
            }}
            onClick={() => {
              setCsvJSON(null);
              setCsvMetaData({ fileName: "", columnName: "", csvError: null });
              return;
            }}
          >
            Remove CSV
          </material_1.Button>
        </div>
      </material_1.Tooltip>
    );
  }
  if (csvJSON) {
    return (
      <div className={classStr} style={{ ...style, textAlign: "center" }}>
        <material_1.Button
          style={{
            margin: "1.5px 0 0 0",
            padding: "6px 8px 5px 8px",
            borderRadius: "0",
            border: "1px rgb(102,86,248) solid",
            backgroundColor: "rgb(102,86,248)",
            color: "white",
          }}
          onClick={() => {
            setCsvJSON(null);
            setCsvMetaData({ fileName: "", columnName: "", csvError: null });
            return;
          }}
        >
          Remove CSV
        </material_1.Button>
      </div>
    );
  }
  return (
    <div className={classStr} style={{ ...style, textAlign: "center" }}>
      <form>
        <label style={labelStyle} htmlFor={"csvFileInput-" + field} className={classStr}>
          {isEntityLevel ? "Upload Entity Level CSV" : "Upload CSV"}
        </label>
        <input type={"file"} id={"csvFileInput-" + field} accept={".csv"} onChange={handleOnChange} />
      </form>
    </div>
  );
};
exports.UploadFileCSV = UploadFileCSV;
