"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableEvents = void 0;
const core_1 = require("@material-ui/core");
const material_1 = require("@mui/material");
const x_data_grid_1 = require("@mui/x-data-grid");
const index_1 = require("../../../src/utils/index");
const constants_1 = require("../../constants");
const CopyLinkToClipboard_1 = require("../utilComponents/CopyLinkToClipboard");
const constants_2 = require("../../constants");
const TableEvents = ({ datasetLabel, protocolNetwork, data, eventName }) => {
  const dataTable = data[eventName];
  const protocolType = data.protocols[0].type;
  const poolName = constants_1.PoolName[protocolType];
  if (!data[poolName]) {
    return null;
  }
  if (dataTable && dataTable[0]) {
    const tableData = [];
    for (let i = 0; i < dataTable.length; i++) {
      const currentData = { ...dataTable[i] };
      if (currentData?.liquidatee?.id) {
        currentData.liquidatee = currentData.liquidatee.id;
      }
      if (currentData?.liquidator) {
        currentData.liquidator = currentData.liquidator.id;
      }
      if (currentData?.position) {
        currentData.position = currentData.position.id;
      }
      if (currentData?.account) {
        currentData.account = currentData.account.id;
      }
      if (currentData?.pool) {
        currentData.pool = currentData.pool.id;
      }
      if (currentData?.token) {
        currentData.token = currentData.token.name;
      }
      if (currentData?.amountInUSD) {
        currentData.amountInUSD = Number(currentData.amountInUSD);
      }
      if (currentData?.amountOutUSD) {
        currentData.amountOutUSD = Number(currentData.amountOutUSD);
      }
      if (currentData?.amountUSD) {
        currentData.amountUSD = Number(currentData.amountUSD);
      }
      if (data[poolName]?.inputToken) {
        const convertedAmt = (0, index_1.convertTokenDecimals)(currentData.amount, data[poolName].inputToken.decimals);
        currentData.amount = convertedAmt;
        tableData.push({ id: `${eventName}-${i}`, date: (0, index_1.toDate)(dataTable[i].timestamp), ...currentData });
      }
      if (data[poolName]?.inputTokens) {
        if (currentData.inputTokenAmounts) {
          const inputTokensDecimal = currentData.inputTokenAmounts.map((amt, idx) => {
            return (0, index_1.convertTokenDecimals)(amt, currentData.inputTokens[idx].decimals).toFixed(2);
          });
          const outputTokenDecimal = (0, index_1.convertTokenDecimals)(
            currentData?.outputTokenAmount,
            currentData?.outputToken?.decimals,
          )?.toFixed(2);
          currentData.inputTokenAmounts = inputTokensDecimal.join(", ");
          currentData.outputTokenAmount = outputTokenDecimal;
          currentData.inputTokens = currentData.inputTokens
            .map((tok) => {
              return tok.id;
            })
            .join(", ");
          currentData.outputToken = JSON.stringify(currentData?.outputToken?.id);
        } else if (currentData.amount) {
          currentData.amount = (0, index_1.convertTokenDecimals)(
            currentData.amount,
            data[poolName].inputTokens[0].decimals,
          );
        }
        if (currentData?.tokenIn) {
          const amountIn = (0, index_1.convertTokenDecimals)(currentData.amountIn, currentData?.tokenIn?.decimals);
          currentData.tokenIn = currentData?.tokenIn?.id;
          currentData.amountIn = amountIn.toFixed(2);
        } else {
          currentData.tokenIn = "N/A";
          currentData.amountIn = "0";
        }
        if (currentData?.tokenOut) {
          const amountOut = (0, index_1.convertTokenDecimals)(currentData.amountOut, currentData?.tokenOut?.decimals);
          currentData.tokenOut = currentData?.tokenOut?.id;
          currentData.amountOut = amountOut.toFixed(2);
        } else {
          currentData.tokenOut = "N/A";
          currentData.amountOut = "0";
        }
        if (currentData?.reserveAmounts) {
          const reserveAmountsDecimal = currentData.reserveAmounts.map((amt, idx) => {
            return (0, index_1.convertTokenDecimals)(amt, data[poolName].inputTokens[idx].decimals).toFixed(2);
          });
          currentData.reserveAmounts = reserveAmountsDecimal.join(", ");
        }
        tableData.push({ id: `${eventName}-${i}`, date: (0, index_1.toDate)(currentData.timestamp), ...currentData });
      }
    }
    const columns = Object.keys(dataTable[0])
      .filter(function (field) {
        if (field.includes("typename")) {
          return false;
        }
        return true;
      })
      .map((field) => {
        if (field === "timestamp") {
          field = "date";
        }
        return {
          field: field,
          headerName: field,
          width: 250,
          renderCell: (params) => {
            let valueStr = params.value;
            if (field === "date") {
              valueStr = params.value;
            }
            let onClick = undefined;
            if (valueStr?.length > 20) {
              valueStr = `${params.value.slice(0, 10)}...${params.value.slice(
                params.value.length - 15,
                params.value.length,
              )}`;
            }
            if (!valueStr) {
              valueStr = "N/A";
            }
            const blockExplorerUrlBase = constants_2.blockExplorers[protocolNetwork.toUpperCase()];
            if (blockExplorerUrlBase) {
              if (field.toUpperCase() === "HASH") {
                onClick = () => (window.location.href = blockExplorerUrlBase + "tx/" + params.value);
              }
              if (field.toUpperCase() === "FROM" || field.toUpperCase() === "TO") {
                onClick = () => (window.location.href = blockExplorerUrlBase + "address/" + params.value);
              }
            }
            if (field.toUpperCase().includes("USD")) {
              valueStr = "$" + Number(Number(params.value).toFixed(2)).toLocaleString();
            }
            return (
              <core_1.Tooltip title={params.value}>
                <span onClick={onClick} style={index_1.tableCellTruncate}>
                  {valueStr}
                </span>
              </core_1.Tooltip>
            );
          },
        };
      });
    return (
      <material_1.Box height={750} py={6} id={eventName}>
        <CopyLinkToClipboard_1.CopyLinkToClipboard link={window.location.href} scrollId={eventName}>
          <material_1.Typography fontSize={20}>
            <b>{datasetLabel.toUpperCase()}</b>
          </material_1.Typography>
        </CopyLinkToClipboard_1.CopyLinkToClipboard>
        <x_data_grid_1.DataGrid
          pageSize={10}
          initialState={{
            sorting: {
              sortModel: [{ field: "timestamp", sort: "desc" }],
            },
          }}
          rows={tableData}
          columns={columns}
        />
      </material_1.Box>
    );
  }
  return null;
};
exports.TableEvents = TableEvents;
