"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackedChart = void 0;
const chart_js_1 = require("chart.js");
const react_chartjs_2_1 = require("react-chartjs-2");
const utils_1 = require("../../utils");
chart_js_1.Chart.register(
  chart_js_1.CategoryScale,
  chart_js_1.LinearScale,
  chart_js_1.BarElement,
  chart_js_1.Title,
  chart_js_1.Tooltip,
  chart_js_1.Legend,
);
function StackedChart({ tokens, tokenWeightsArray, poolTitle }) {
  const dates = [];
  const tokenWeightsValues = tokenWeightsArray.map((weight) => {
    const hourly = poolTitle.toUpperCase().includes("HOURLY");
    const currentTokenValues = weight.map((weight) => {
      if (dates.length < weight.length) {
        dates.push((0, utils_1.toDate)(weight.date, hourly));
      }
      return Number(weight.value);
    });
    return currentTokenValues;
  });
  const options = {
    plugins: {
      title: {
        display: true,
        text: poolTitle,
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };
  const colorList = ["red", "blue", "yellow", "lime", "pink", "black", "purple"];
  const labels = dates;
  const datasets = tokenWeightsValues.map((valArr, idx) => {
    return { data: valArr, label: tokens[idx].name || "Token [" + idx + "]", backgroundColor: colorList[idx] };
  });
  const data = {
    labels,
    datasets,
  };
  const element = <react_chartjs_2_1.Bar options={options} data={data} />;
  return element;
}
exports.StackedChart = StackedChart;
