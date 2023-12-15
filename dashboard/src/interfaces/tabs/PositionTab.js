"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const PoolDropDown_1 = require("../../common/utilComponents/PoolDropDown");
const x_data_grid_1 = require("@mui/x-data-grid");
const constants_1 = require("../../constants");
function PositionTab({ positions, poolId, poolsList, poolNames, poolListLoading, poolsListError, setPoolId }) {
  let poolDropDown = null;
  if (poolsList) {
    poolDropDown = (
      <PoolDropDown_1.PoolDropDown poolId={poolId} pools={poolsList[poolNames]} setPoolId={(x) => setPoolId(x)} />
    );
  } else if (poolListLoading) {
    return <material_1.CircularProgress sx={{ margin: 6 }} size={50} />;
  }
  let positionsData = null;
  if (!positions?.length) {
    positionsData = <div>{poolId ? "No positions for this pool" : ""}</div>;
  } else {
    const columns = Object.keys(positions[0])
      .filter((key) => {
        if (key.includes("typename")) {
          return false;
        }
        return true;
      })
      .map((key) => {
        return {
          field: key,
          headerName: key,
          width: 250,
          renderCell: (params) => {
            let valueStr =
              params.value === null ? "-" : typeof params.value === "boolean" ? `${params.value}` : params.value;
            if (key === "account") {
              valueStr = valueStr.id;
            }
            const relatedEvents = ["liquidations", "borrows", "withdraws", "repays", "deposits"];
            if (relatedEvents.includes(key)) {
              valueStr = valueStr.map((val) => val.hash).join(",");
            }
            if (key === "date") {
              valueStr = params.value;
            }
            let url = undefined;
            if (typeof valueStr === "string" && valueStr.length > 20) {
              const tempStr = valueStr;
              valueStr = `${valueStr.slice(0, 10)}...${valueStr.slice(valueStr.length - 15, valueStr.length)}`;
              const getBaseUrl = () => {
                if (key === "id") {
                  return;
                }
                if (key.toUpperCase().includes("HASH") || relatedEvents.includes(key)) {
                  return constants_1.blockExplorers.MAINNET + "tx/";
                }
                if (key.toUpperCase().includes("ACCOUNT")) {
                  return constants_1.blockExplorers.MAINNET + "address/";
                }
              };
              const baseUrl = getBaseUrl();
              if (baseUrl) {
                url = baseUrl + tempStr;
              }
            }
            if (key.toUpperCase().includes("USD")) {
              valueStr = "$" + Number(Number(params.value).toFixed(2)).toLocaleString();
            }
            return (
              <span>
                {url ? (
                  <a href={url} target="_blank" rel="noreferrer" style={{ color: "white", textDecoration: "initial" }}>
                    {valueStr}
                  </a>
                ) : (
                  valueStr
                )}
              </span>
            );
          },
        };
      });
    positionsData = (
      <material_1.Box sx={{ height: 750, width: "100%" }}>
        <x_data_grid_1.DataGrid
          pageSize={10}
          initialState={{
            sorting: {
              sortModel: [{ field: "timestamp", sort: "desc" }],
            },
          }}
          rows={positions}
          columns={columns}
        />
      </material_1.Box>
    );
  }
  return (
    <>
      {poolDropDown}
      {positionsData}
    </>
  );
}
exports.default = PositionTab;
