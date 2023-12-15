"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chart = void 0;
const material_1 = require("@mui/material");
const react_chartjs_2_1 = require("react-chartjs-2");
const utils_1 = require("../../utils");
const Chart = ({ datasetLabel, dataChart, chartRef }) => {
  if (dataChart) {
    let labels = [];
    let datasets = [];
    if (Array.isArray(dataChart)) {
      labels = dataChart.map((e) => (0, utils_1.toDate)(e.date));
      datasets = [
        {
          data: dataChart.map((e) => e.value),
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          borderColor: "rgb(53, 162, 235)",
          label: datasetLabel,
        },
      ];
    } else if (typeof dataChart === "object") {
      const colorList = ["red", "blue", "yellow", "lime", "pink", "black", "orange", "green"];
      datasets = Object.keys(dataChart).map((label, idx) => {
        if (labels.length === 0) {
          labels = dataChart[label].map((e) => (0, utils_1.toDate)(e.date));
        }
        return {
          data: dataChart[label].map((e) => e.value),
          backgroundColor: colorList[idx],
          borderColor: colorList[idx],
          label: label,
        };
      });
    } else {
      return null;
    }
    const chartData = {
      labels,
      datasets: datasets,
    };
    return (
      <>
        <material_1.Box padding={2} sx={{ border: 1 }}>
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
        </material_1.Box>
      </>
    );
  }
  return <material_1.CircularProgress sx={{ my: 5 }} size={40} />;
};
exports.Chart = Chart;
