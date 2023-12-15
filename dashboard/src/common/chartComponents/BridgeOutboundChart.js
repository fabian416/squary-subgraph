"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeOutboundChart = void 0;
const chart_js_1 = require("chart.js");
const react_chartjs_2_1 = require("react-chartjs-2");
const moment_1 = __importDefault(require("moment"));
chart_js_1.Chart.register(
  chart_js_1.CategoryScale,
  chart_js_1.LinearScale,
  chart_js_1.BarElement,
  chart_js_1.Title,
  chart_js_1.Tooltip,
  chart_js_1.Legend,
);
function BridgeOutboundChart({ dayVolByChain, dates, title, chartRef }) {
  const intMode = "nearest";
  const intAxis = "x";
  const tooltipPos = "posFunc";
  const xAlign = "left";
  const yAlign = "bottom";
  const posFunc = (elements, eventPosition) => {
    let model = elements[0]?.element;
    return {
      x: model.x + 20,
      y: eventPosition.y - 15,
    };
  };
  chart_js_1.Tooltip.positioners.posFunc = posFunc;
  const options = {
    plugins: {
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        xAlign,
        yAlign,
        position: tooltipPos,
        caretSize: 10,
      },
    },
    responsive: true,
    interaction: {
      mode: intMode,
      axis: intAxis,
      intersect: false,
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };
  const colorList = [
    "red",
    "blue",
    "yellow",
    "lime",
    "blueviolet",
    "orange",
    "purple",
    "maroon",
    "aqua",
    "olive",
    "deeppink",
  ];
  const labels = dates.map((date) => (0, moment_1.default)(date * 1000).format("MM-DD-YYYY"));
  const datasets = Object.keys(dayVolByChain).map((chain, idx) => {
    return {
      data: dayVolByChain[chain],
      label: chain,
      backgroundColor: colorList[idx],
      hoverBackgroundColor: "white",
      hoverBorderColor: "white",
      hoverBorderWidth: 10,
    };
  });
  const data = {
    labels,
    datasets,
  };
  const element = <react_chartjs_2_1.Bar ref={chartRef} options={options} data={data} />;
  return element;
}
exports.BridgeOutboundChart = BridgeOutboundChart;
