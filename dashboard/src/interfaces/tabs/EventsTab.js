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
const react_1 = __importStar(require("react"));
const TableEvents_1 = require("../../common/chartComponents/TableEvents");
const PoolDropDown_1 = require("../../common/utilComponents/PoolDropDown");
const IssuesDisplay_1 = __importDefault(require("../IssuesDisplay"));
const material_1 = require("@mui/material");
// This component is for each individual subgraph
function EventsTab({ data, events, protocolNetwork, poolId, setPoolId, poolsList, poolNames, poolListLoading }) {
  const [issuesState, setIssues] = (0, react_1.useState)([]);
  const issues = issuesState;
  (0, react_1.useEffect)(() => {
    console.log("EVENTS ISSUES TO SET", issues, issuesState);
    setIssues(issues);
  }, [issuesState]);
  let poolDropDown = null;
  if (poolsList) {
    poolDropDown = (
      <PoolDropDown_1.PoolDropDown
        poolId={poolId}
        pools={poolsList[poolNames]}
        setPoolId={(x) => {
          setIssues([]);
          setPoolId(x);
        }}
      />
    );
  } else if (poolListLoading) {
    return <material_1.CircularProgress sx={{ margin: 6 }} size={50} />;
  }
  return (
    <>
      <IssuesDisplay_1.default issuesArrayProps={issues} allLoaded={true} oneLoaded={true} />
      {poolDropDown}
      {events.map((eventName) => {
        if (!poolId && data[eventName].length > 0) {
          const message = `${eventName} events found with a pool id of "". All events need to be linked to a pool/market/vault by a valid id.`;
          if (issues.filter((x) => x.message === message).length === 0) {
            issues.push({ message, type: "NOEV", level: "critical", fieldName: eventName });
          }
        }
        if (poolId && data[eventName].length === 0) {
          const message = "No " + eventName + " on pool " + poolId;
          if (issues.filter((x) => x.message === message).length === 0) {
            let level = "warning";
            if (eventName.toUpperCase() === "DEPOSITS") {
              level = "critical";
            }
            issues.push({ message, type: "EVENT", level, fieldName: eventName });
          }
          return (
            <material_1.Box key={eventName}>
              <material_1.Typography fontSize={20}>
                <b>{eventName.toUpperCase()}</b>
              </material_1.Typography>
              <material_1.Typography variant="body1">{message}</material_1.Typography>
            </material_1.Box>
          );
        }
        return (
          <TableEvents_1.TableEvents
            key={eventName + "Table"}
            protocolNetwork={protocolNetwork}
            datasetLabel={eventName}
            data={data}
            eventName={eventName}
          />
        );
      })}
    </>
  );
}
exports.default = EventsTab;
