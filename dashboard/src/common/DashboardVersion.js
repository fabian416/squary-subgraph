"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardVersion = exports.dashboardVersion = void 0;
const material_1 = require("@mui/material");
const DashboardTag = (0, material_1.styled)("div")`
  position: fixed;
  left: 0;
  bottom: 0;
  background: #333;
  padding: ${({ theme }) => theme.spacing(0.5, 1)};
  font-size: 14px;
  border-top-right-radius: 8px;
  z-index: 2;
`;
exports.dashboardVersion = "v2.3.0";
const DashboardVersion = () => {
  return <DashboardTag>{exports.dashboardVersion}</DashboardTag>;
};
exports.DashboardVersion = DashboardVersion;
