"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardChart = void 0;
const react_chartjs_2_1 = require("react-chartjs-2");
const StandardChart = ({ chartData, chartRef }) => {
  return (
    <react_chartjs_2_1.Line
      data={chartData}
      ref={chartRef}
      options={{
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
        scales: {
          y: {
            grid: {
              display: true,
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "#fff",
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#fff",
            },
          },
        },
        elements: {
          point: {
            radius: 0,
            hoverRadius: 5,
            hoverBorderWidth: 4,
            hoverBorderColor: "white",
          },
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "#fff",
            },
          },
          tooltip: {
            enabled: true,
            position: "nearest",
          },
        },
      }}
    />
  );
};
exports.StandardChart = StandardChart;
