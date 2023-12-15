"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
function DevCountTable({ subgraphCounts }) {
  return (
    <div style={{ width: "98%", margin: "1%" }}>
      <material_1.TableContainer sx={{ marginBottom: "20px", fontSize: "12px" }}>
        <material_1.Typography
          variant="h4"
          align="center"
          fontWeight={500}
          fontSize={28}
          sx={{ padding: "6px", my: 2 }}
        >
          Subgraph Counts By Type
        </material_1.Typography>
        <material_1.Table stickyHeader>
          <material_1.TableHead sx={{ height: "5px" }}>
            <material_1.TableRow sx={{ height: "5px" }}>
              <material_1.TableCell style={{ textAlign: "right", padding: "3px" }}> </material_1.TableCell>
              {Object.keys(subgraphCounts).map((schemaType) => {
                return (
                  <material_1.TableCell style={{ textAlign: "right", padding: "3px" }} key={schemaType + "CountCell"}>
                    <span style={{ fontSize: "14px", textAlign: "right", width: "100%" }}>{schemaType}</span>
                  </material_1.TableCell>
                );
              })}
            </material_1.TableRow>
          </material_1.TableHead>
          <material_1.TableBody>
            <material_1.TableRow>
              <material_1.TableCell style={{ textAlign: "left", padding: "3px" }}>
                <span style={{ fontSize: "14px", textAlign: "right", width: "100%" }}>Production Ready</span>
              </material_1.TableCell>
              {Object.keys(subgraphCounts).map((schemaType) => {
                const deployStats = subgraphCounts[schemaType];
                return (
                  <material_1.TableCell
                    style={{ textAlign: "right", padding: "3px" }}
                    key={schemaType + "ProdCountCell"}
                  >
                    <span style={{ fontSize: "14px", textAlign: "right", width: "100%" }}>{deployStats.prodCount}</span>
                  </material_1.TableCell>
                );
              })}
            </material_1.TableRow>
            <material_1.TableRow>
              <material_1.TableCell style={{ textAlign: "left", padding: "3px" }}>
                <span style={{ fontSize: "14px", textAlign: "right", width: "100%" }}>In Development</span>
              </material_1.TableCell>
              {Object.keys(subgraphCounts).map((schemaType) => {
                const deployStats = subgraphCounts[schemaType];
                return (
                  <material_1.TableCell
                    style={{ textAlign: "right", padding: "3px" }}
                    key={schemaType + "DevCountCell"}
                  >
                    <span style={{ fontSize: "14px", textAlign: "right", width: "100%" }}>{deployStats.devCount}</span>
                  </material_1.TableCell>
                );
              })}
            </material_1.TableRow>
            <material_1.TableRow>
              <material_1.TableCell style={{ textAlign: "left", padding: "3px" }}>
                <span style={{ fontSize: "14px", textAlign: "right", width: "100%" }}>Total Deployments</span>
              </material_1.TableCell>
              {Object.keys(subgraphCounts).map((schemaType) => {
                const deployStats = subgraphCounts[schemaType];
                return (
                  <material_1.TableCell
                    style={{ textAlign: "right", padding: "3px" }}
                    key={schemaType + "TotalCountCell"}
                  >
                    <span style={{ fontSize: "14px", textAlign: "right", width: "100%" }}>
                      {deployStats.totalCount}
                    </span>
                  </material_1.TableCell>
                );
              })}
            </material_1.TableRow>
          </material_1.TableBody>
        </material_1.Table>
      </material_1.TableContainer>
    </div>
  );
}
exports.default = DevCountTable;
