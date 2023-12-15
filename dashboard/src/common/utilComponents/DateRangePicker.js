"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateRangePicker = void 0;
const material_1 = require("@mui/material");
const lab_1 = require("@mui/lab");
const moment_1 = __importDefault(require("@material-ui/pickers/adapter/moment"));
const moment_2 = require("moment");
const DateRangePicker = ({ dates, setDates }) => {
  return (
    <material_1.Box
      position="absolute"
      zIndex={1000}
      top={30}
      left={5}
      border="1px solid white"
      style={{ width: "320px" }}
    >
      <lab_1.LocalizationProvider dateAdapter={moment_1.default}>
        <lab_1.StaticDatePicker
          displayStaticWrapperAs="desktop"
          onChange={(newVal) => {
            if (newVal) {
              if (newVal.isBefore((0, moment_2.utc)(new Date()))) {
                if (dates.length <= 1) {
                  const arrToSet = [...dates, newVal].sort((a, b) => (a.isBefore(b) ? -1 : 1));
                  setDates(arrToSet);
                } else {
                  setDates([newVal]);
                }
              }
            }
          }}
          value={dates}
          renderDay={(day, _selectedDates, pickersDayProps) => {
            return (
              <div key={day.format("l")}>
                <lab_1.PickersDay
                  {...pickersDayProps}
                  selected={dates.map((date) => date.format("l")).includes(day.format("l"))}
                />
              </div>
            );
          }}
          renderInput={(params) => <material_1.TextField {...params} />}
        />
      </lab_1.LocalizationProvider>
      <material_1.Box display="flex" flexWrap="wrap" gap={1} sx={{ padding: 1, backgroundColor: "Window" }}>
        {dates.map((date) => (
          <material_1.Button key={date.format()} sx={{ border: "1px solid black" }}>
            {date.format("M/D/YY")} 𝘅
          </material_1.Button>
        ))}
      </material_1.Box>
    </material_1.Box>
  );
};
exports.DateRangePicker = DateRangePicker;
