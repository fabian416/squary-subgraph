"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiSelectDropDown = void 0;
const material_1 = require("@mui/material");
const react_1 = __importDefault(require("react"));
const ComboBoxInput_1 = require("./ComboBoxInput");
const MultiSelectDropDown = ({ optionsList, setOptionsSelected, optionsSelected, label }) => {
  const options = ["All", ...optionsList];
  return (
    <>
      <material_1.Autocomplete
        options={options}
        value={optionsSelected}
        multiple
        size="medium"
        disableCloseOnSelect={true}
        disableListWrap={true}
        sx={{ width: 600, height: "100%" }}
        onChange={(event) => {
          const targEle = event?.target;
          let selected = null;
          if (targEle?.innerText) {
            if (optionsSelected.includes(targEle.innerText)) {
              selected = targEle.innerText;
            } else {
              if (targEle.innerText.toUpperCase() === "ALL" || optionsSelected[0]?.toUpperCase() === "ALL") {
                setOptionsSelected([targEle.innerText]);
              } else if (!optionsSelected.includes(targEle.innerText)) {
                setOptionsSelected([...optionsSelected, targEle.innerText]);
              }
            }
          } else {
            if (targEle?.parentElement?.childNodes) {
              Array.from(targEle.parentElement.childNodes)?.forEach((x) => {
                if (optionsSelected.includes(x.innerText)) {
                  selected = x.innerText;
                }
              });
            }
            if (!selected && targEle?.parentElement?.parentElement?.childNodes) {
              Array.from(targEle.parentElement.parentElement.childNodes)?.forEach((x) => {
                if (optionsSelected.includes(x.innerText)) {
                  selected = x.innerText;
                }
              });
            }
          }
          if (selected) {
            const idx = optionsSelected.indexOf(selected);
            const selectionsCopy = [...optionsSelected];
            selectionsCopy.splice(idx, 1);
            setOptionsSelected(selectionsCopy);
          }
        }}
        renderInput={(params) => (
          <ComboBoxInput_1.ComboBoxInput label={label} params={params} setTextInput={(x) => console.log(x)} />
        )}
      />
    </>
  );
};
exports.MultiSelectDropDown = MultiSelectDropDown;
